import type { FlexExtension, FlexFrontendPlugin, FlexFrontendPluginOptions } from './types';

/**
 * Backstage-style frontend plugin factory.
 * @see https://backstage.io/docs/frontend-system/building-plugins/index/
 */
export function createFlexFrontendPlugin(options: FlexFrontendPluginOptions): FlexFrontendPlugin {
  const extensions = options.extensions.map((ext) => ({
    ...ext,
    pluginId: options.pluginId,
  }));

  const byId = new Map<string, FlexExtension>(extensions.map((ext) => [ext.id, ext]));

  return {
    pluginId: options.pluginId,
    title: options.title,
    extensions,
    routes: options.routes ?? {},
    getExtension(id: string) {
      return byId.get(id);
    },
  };
}
