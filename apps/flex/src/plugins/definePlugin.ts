import type { FlexState } from '../store/flexTypes';
import type {
  FlexPluginDefinition,
  FlexPluginManifest,
  PluginConsumeResult,
  PluginDataset,
  PluginError,
  PluginProduceRequest,
  PluginProduceResult,
} from './types';

function err(code: PluginError['code'], error: string): PluginError {
  return { ok: false, error, code };
}

function consumeRows(
  manifest: FlexPluginManifest,
  _state: FlexState,
  datasetName: string | undefined,
  resolver: (ds: PluginDataset) => unknown[]
): PluginConsumeResult | PluginError {
  const ds =
    datasetName != null
      ? manifest.datasets.find((d) => d.name === datasetName)
      : manifest.datasets[0];
  if (!ds) {
    return err('DATASET_NOT_FOUND', datasetName ? `Unknown dataset: ${datasetName}` : 'No datasets');
  }
  if (!manifest.capabilities.consume) {
    return err('NOT_ALLOWED', `${manifest.id} does not support consume`);
  }
  const records = resolver(ds);
  return {
    ok: true,
    pluginId: manifest.id,
    dataset: ds.name,
    records,
    meta: {
      exportedAt: new Date().toISOString(),
      recordCount: records.length,
      schema: ds.schema,
    },
  };
}

export interface DefinePluginOptions {
  manifest: FlexPluginManifest;
  consume: (state: FlexState, dataset?: string) => PluginConsumeResult | PluginError;
  produce?: (
    state: FlexState,
    request: PluginProduceRequest
  ) => PluginProduceResult | PluginError;
}

export function definePlugin(options: DefinePluginOptions): FlexPluginDefinition {
  return {
    manifest: options.manifest,
    consume: options.consume,
    produce: options.produce,
  };
}

export { consumeRows, err };
