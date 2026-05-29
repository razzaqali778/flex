import { FLEX_PLUGIN_CHANNEL } from 'flex-plugin-sdk';
import type { PluginConsumeRequest, PluginProduceRequest } from '../plugins/types';
import type { FlexPluginHost } from '../plugins/host';

export { FLEX_PLUGIN_CHANNEL };

export interface FlexPluginBridgeMessage {
  channel: typeof FLEX_PLUGIN_CHANNEL;
  id: string;
  method: 'catalog' | 'consume' | 'produce';
  payload?: PluginConsumeRequest | PluginProduceRequest;
}

export interface FlexPluginBridgeResponse {
  channel: typeof FLEX_PLUGIN_CHANNEL;
  id: string;
  ok: boolean;
  result?: unknown;
  error?: string;
}

/** postMessage bridge — callerWindow listens, flexWindow handles (Flex app) */
function remoteCall<T>(
  callerWindow: Window,
  flexWindow: Window,
  method: FlexPluginBridgeMessage['method'],
  payload?: PluginConsumeRequest | PluginProduceRequest
): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = `fp-remote-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const handler = (event: MessageEvent) => {
      const data = event.data as FlexPluginBridgeResponse | undefined;
      if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || data.id !== id) return;
      callerWindow.removeEventListener('message', handler);
      if (data.ok) resolve(data.result as T);
      else reject(new Error(data.error ?? 'Flex remote call failed'));
    };
    callerWindow.addEventListener('message', handler);
    flexWindow.postMessage(
      { channel: FLEX_PLUGIN_CHANNEL, id, method, payload } satisfies FlexPluginBridgeMessage,
      '*'
    );
    setTimeout(() => {
      callerWindow.removeEventListener('message', handler);
      reject(new Error('Flex remote call timeout — is Flex tab still open?'));
    }, 10000);
  });
}

/** Expose plugin host on window for external scripts and extension content */
export function mountPluginBridge(host: FlexPluginHost): () => void {
  const api = {
    version: host.apiVersion,
    catalog: () => host.catalog(),
    consume: (req: PluginConsumeRequest & { params?: Record<string, unknown> }) => host.consume(req),
    produce: (req: PluginProduceRequest) => host.produce(req),
    /**
     * Call Flex APIs from another browser tab/window (EzTrac, dhub-rpt, etc.).
     * In the OTHER window's console, save this window first: `const flexWin = …` then use flexRemote.
     */
    flexRemote: {
      channel: FLEX_PLUGIN_CHANNEL,
      /** fromWindow = console you're in; flexWindow = tab where Flex is open */
      consume: (
        fromWindow: Window,
        flexWindow: Window,
        req: PluginConsumeRequest & { params?: Record<string, unknown> }
      ) => remoteCall(fromWindow, flexWindow, 'consume', req),
      produce: (fromWindow: Window, flexWindow: Window, req: PluginProduceRequest) =>
        remoteCall(fromWindow, flexWindow, 'produce', req),
      catalog: (fromWindow: Window, flexWindow: Window) =>
        remoteCall(fromWindow, flexWindow, 'catalog', undefined),
    },
  };

  (window as Window & { FlexPlugins?: typeof api }).FlexPlugins = api;

  const handleBridgeRequest = (
    data: FlexPluginBridgeMessage,
    reply: (body: FlexPluginBridgeResponse) => void
  ) => {
    void (async () => {
      try {
        if (data.method === 'catalog') {
          reply({ channel: FLEX_PLUGIN_CHANNEL, id: data.id, ok: true, result: host.catalog() });
          return;
        }
        if (data.method === 'consume' && data.payload) {
          const result = host.consume(data.payload as PluginConsumeRequest);
          const ok = !('code' in result);
          reply({
            channel: FLEX_PLUGIN_CHANNEL,
            id: data.id,
            ok,
            result: ok ? result : undefined,
            error: ok ? undefined : result.error,
          });
          return;
        }
        if (data.method === 'produce' && data.payload) {
          const result = await host.produce(data.payload as PluginProduceRequest);
          const ok = !('code' in result);
          reply({
            channel: FLEX_PLUGIN_CHANNEL,
            id: data.id,
            ok,
            result: ok ? result : undefined,
            error: ok ? undefined : result.error,
          });
          return;
        }
        reply({
          channel: FLEX_PLUGIN_CHANNEL,
          id: data.id,
          ok: false,
          error: 'Invalid plugin bridge message',
        });
      } catch (e) {
        reply({
          channel: FLEX_PLUGIN_CHANNEL,
          id: data.id,
          ok: false,
          error: e instanceof Error ? e.message : 'Plugin bridge error',
        });
      }
    })();
  };

  const onMessage = (event: MessageEvent) => {
    const data = event.data as FlexPluginBridgeMessage | undefined;
    if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || !data.id || !data.method) return;
    handleBridgeRequest(data, (body) => {
      const target = event.source as Window | null;
      target?.postMessage(body, '*');
    });
  };

  const broadcast =
    typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(FLEX_PLUGIN_CHANNEL) : null;

  const onBroadcast = (event: MessageEvent) => {
    const data = event.data as FlexPluginBridgeMessage | undefined;
    if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || !data.id || !data.method) return;
    handleBridgeRequest(data, (body) => broadcast?.postMessage(body));
  };

  broadcast?.addEventListener('message', onBroadcast);
  window.addEventListener('message', onMessage);

  return () => {
    delete (window as Window & { FlexPlugins?: typeof api }).FlexPlugins;
    window.removeEventListener('message', onMessage);
    broadcast?.removeEventListener('message', onBroadcast);
    broadcast?.close();
  };
}

/** Call from external page via postMessage */
export function requestViaPluginBridge<T>(
  method: FlexPluginBridgeMessage['method'],
  payload?: PluginConsumeRequest | PluginProduceRequest
): Promise<T> {
  return new Promise((resolve, reject) => {
    const id = `fp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const handler = (event: MessageEvent) => {
      const data = event.data as FlexPluginBridgeResponse | undefined;
      if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || data.id !== id) return;
      window.removeEventListener('message', handler);
      if (data.ok) resolve(data.result as T);
      else reject(new Error(data.error ?? 'Plugin request failed'));
    };
    window.addEventListener('message', handler);
    window.postMessage({ channel: FLEX_PLUGIN_CHANNEL, id, method, payload } satisfies FlexPluginBridgeMessage, '*');
    setTimeout(() => {
      window.removeEventListener('message', handler);
      reject(new Error('Flex plugin bridge timeout'));
    }, 10000);
  });
}
