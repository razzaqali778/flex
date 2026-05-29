import type { PluginConsumeRequest, PluginProduceRequest } from '../plugins/types';
import {
  FLEX_PLUGIN_CHANNEL,
  type FlexPluginBridgeMessage,
  type FlexPluginBridgeResponse,
} from './pluginBridge';

const FLEX_URL_STORAGE_KEY = 'flex_partner_target_url';
const DEFAULT_FLEX_URL = import.meta.env.VITE_FLEX_URL ?? 'http://localhost:5173/';

let flexWindowRef: Window | null = null;

function normalizeFlexUrl(url: string): string {
  try {
    return new URL(url).toString();
  } catch {
    return DEFAULT_FLEX_URL;
  }
}

export function getStoredFlexUrl(): string {
  try {
    return localStorage.getItem(FLEX_URL_STORAGE_KEY) ?? DEFAULT_FLEX_URL;
  } catch {
    return DEFAULT_FLEX_URL;
  }
}

export function setStoredFlexUrl(url: string): string {
  const normalized = normalizeFlexUrl(url);
  try {
    localStorage.setItem(FLEX_URL_STORAGE_KEY, normalized);
  } catch {
    /* localStorage can be unavailable in restricted browser modes */
  }
  return normalized;
}

export function openFlexWindow(url = getStoredFlexUrl()): Window | null {
  const normalized = setStoredFlexUrl(url);
  flexWindowRef = window.open(normalized, 'flex-plugin-host');
  return flexWindowRef;
}

function postMessageRequest<T>(
  method: FlexPluginBridgeMessage['method'],
  payload: PluginConsumeRequest | PluginProduceRequest | undefined,
  targetWindow: Window,
  targetUrl: string
): Promise<T> {
  const targetOrigin = new URL(normalizeFlexUrl(targetUrl)).origin;

  return new Promise((resolve, reject) => {
    const id = `fp-partner-window-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const timeout = window.setTimeout(() => {
      window.removeEventListener('message', onMsg);
      reject(new Error('Flex did not answer. Keep the Flex tab open, then retry.'));
    }, 10000);

    function onMsg(ev: MessageEvent) {
      const data = ev.data as FlexPluginBridgeResponse | undefined;
      if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || data.id !== id) return;
      window.clearTimeout(timeout);
      window.removeEventListener('message', onMsg);
      if (data.ok) resolve(data.result as T);
      else reject(new Error(data.error ?? 'Flex plugin request failed'));
    }

    window.addEventListener('message', onMsg);
    targetWindow.postMessage(
      { channel: FLEX_PLUGIN_CHANNEL, id, method, payload } satisfies FlexPluginBridgeMessage,
      targetOrigin
    );
  });
}

function broadcastRequest<T>(
  method: FlexPluginBridgeMessage['method'],
  payload?: PluginConsumeRequest | PluginProduceRequest
): Promise<T> {
  if (typeof BroadcastChannel === 'undefined') {
    return Promise.reject(new Error('BroadcastChannel not supported in this browser'));
  }

  return new Promise((resolve, reject) => {
    const bc = new BroadcastChannel(FLEX_PLUGIN_CHANNEL);
    const id = `fp-partner-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const onMsg = (ev: MessageEvent) => {
      const data = ev.data as FlexPluginBridgeResponse | undefined;
      if (!data || data.channel !== FLEX_PLUGIN_CHANNEL || data.id !== id) return;
      bc.removeEventListener('message', onMsg);
      bc.close();
      if (data.ok) resolve(data.result as T);
      else reject(new Error(data.error ?? 'Flex plugin request failed'));
    };

    bc.addEventListener('message', onMsg);
    bc.postMessage({
      channel: FLEX_PLUGIN_CHANNEL,
      id,
      method,
      payload,
    } satisfies FlexPluginBridgeMessage);

    setTimeout(() => {
      bc.removeEventListener('message', onMsg);
      bc.close();
      reject(new Error('Flex is not reachable on this origin.'));
    }, 10000);
  });
}

/**
 * Call Flex from a partner app.
 * Same-origin demos use BroadcastChannel; different ports use postMessage after Connect Flex.
 */
export function partnerFlexRequest<T>(
  method: FlexPluginBridgeMessage['method'],
  payload?: PluginConsumeRequest | PluginProduceRequest
): Promise<T> {
  if (flexWindowRef && !flexWindowRef.closed) {
    return postMessageRequest<T>(method, payload, flexWindowRef, getStoredFlexUrl());
  }

  return broadcastRequest<T>(method, payload).catch(() => {
    throw new Error(
      'Cannot reach Flex. Click Connect Flex, keep that Flex tab open, then try again.'
    );
  });
}

export function partnerCatalog() {
  return partnerFlexRequest<unknown[]>('catalog', undefined);
}

export function partnerConsume(req: PluginConsumeRequest & { params?: Record<string, unknown> }) {
  return partnerFlexRequest<unknown>('consume', req);
}

export function partnerProduce(req: PluginProduceRequest) {
  return partnerFlexRequest<unknown>('produce', req);
}

/** Quick health check — true if Flex tab is listening */
export async function isFlexReachable(): Promise<boolean> {
  try {
    await partnerCatalog();
    return true;
  } catch {
    return false;
  }
}
