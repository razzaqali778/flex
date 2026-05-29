import type { DataRequest } from '../types';
import type { CreateAnomalyInput, CreateDatasetInput, FlexSettings, FlexState } from '../store/flexTypes';
import type { UserRole } from '../lib/rbac';
import { getPartnerConsumption } from '../lib/partnerConsumption';
import { getPlugin, listPlugins } from './registry';
import type {
  PluginApiResult,
  PluginCatalogEntry,
  PluginConsumeRequest,
  PluginConsumeResult,
  PluginProduceRequest,
  PluginProduceResult,
} from './types';
import { PLUGIN_API_VERSION } from './types';

export interface PluginHostActions {
  approveRequest: (id: string) => boolean;
  rejectRequest: (id: string) => boolean;
  publishDataset: (id: string) => boolean;
  createDataset: (input: CreateDatasetInput) => string;
  refreshFromExternal: (app: 'eztrac' | 'dhub-rpt') => Promise<DataRequest>;
  pullPartnerData: (partner: 'eztrac' | 'dhub-rpt') => number;
  resolveAnomaly: (id: string) => boolean;
  createAnomaly: (input: CreateAnomalyInput) => string;
  advanceSavingsStage: (id: string) => void;
  updateChargeback: (id: string, patch: Partial<{ budget: number; owner: string }>) => void;
  acknowledgeWorkforceSignal: (id: string) => void;
  resolveAlignmentConflict: (id: string) => void;
  setUserRole: (role: UserRole) => void;
  setSlackApprovals: (enabled: boolean) => void;
  setPresentationMode: (enabled: boolean) => void;
  setMeetingMode: (enabled: boolean) => void;
  setSpendPulse: (enabled: boolean) => void;
  setDesktopNotifications: (enabled: boolean) => void;
  addInboundRequest: (req: Omit<DataRequest, 'id' | 'status' | 'requestedAt'> & { requestedAt?: string }) => DataRequest;
}

export class FlexPluginHost {
  readonly apiVersion = '1.0.0' as typeof PLUGIN_API_VERSION;

  constructor(
    private getState: () => FlexState,
    private actions: PluginHostActions
  ) {}

  catalog(): PluginCatalogEntry[] {
    return listPlugins().map((p) => ({
      ...p.manifest,
      kind: p.manifest.kind ?? 'core',
      datasetCount: p.manifest.datasets.length,
    }));
  }

  consume(req: PluginConsumeRequest & { params?: Record<string, unknown> }): PluginApiResult<PluginConsumeResult> {
    const plugin = getPlugin(req.pluginId);
    if (!plugin) {
      return { ok: false, error: `Unknown plugin: ${req.pluginId}`, code: 'PLUGIN_NOT_FOUND' };
    }

    if (
      (req.pluginId === 'flex.integrations' && req.dataset === 'partner_consumption') ||
      (req.pluginId === 'flex.partner.eztrac' && req.dataset === 'consumption_status') ||
      (req.pluginId === 'flex.partner.dhub-rpt' && req.dataset === 'consumption_status')
    ) {
      const inferredPartner =
        req.pluginId === 'flex.partner.eztrac'
          ? 'eztrac'
          : req.pluginId === 'flex.partner.dhub-rpt'
            ? 'dhub-rpt'
            : undefined;
      const partner = (req.params?.partner as 'eztrac' | 'dhub-rpt' | undefined) ?? inferredPartner;
      if (!partner) {
        return { ok: false, error: 'partner_consumption requires params.partner', code: 'VALIDATION' };
      }
      const records = getPartnerConsumption(this.getState(), partner);
      const targetDataset = req.dataset === 'consumption_status' ? 'consumption_status' : 'partner_consumption';
      const ds = plugin.manifest.datasets.find((d) => d.name === targetDataset)!;
      return {
        ok: true,
        pluginId: req.pluginId,
        dataset: ds.name,
        records,
        meta: {
          exportedAt: new Date().toISOString(),
          recordCount: records.length,
          schema: ds.schema,
        },
      };
    }

    const result = plugin.consume(this.getState(), req.dataset);
    if ('ok' in result && result.ok === false) return result;
    return result as PluginConsumeResult;
  }

  async produce(req: PluginProduceRequest): Promise<PluginApiResult<PluginProduceResult>> {
    const plugin = getPlugin(req.pluginId);
    if (!plugin) {
      return { ok: false, error: `Unknown plugin: ${req.pluginId}`, code: 'PLUGIN_NOT_FOUND' };
    }
    if (!plugin.produce) {
      return { ok: false, error: `${req.pluginId} does not accept inbound data`, code: 'NOT_ALLOWED' };
    }

    const preview = plugin.produce(this.getState(), req);
    if ('ok' in preview && preview.ok === false) {
      const msg =
        'message' in preview
          ? preview.message
          : 'error' in preview
            ? preview.error
            : 'Validation failed';
      return { ok: false, error: msg, code: 'VALIDATION' };
    }

    const applied = await this.applyProduce(req);
    if (!applied.ok) return applied;

    return typeof preview === 'object' && 'ok' in preview && preview.ok
      ? { ...preview, message: applied.message ?? preview.message }
      : applied;
  }

  private async applyProduce(req: PluginProduceRequest): Promise<PluginProduceResult> {
    const { pluginId, dataset, records } = req;

    try {
      switch (pluginId) {
        case 'flex.governance': {
          if (dataset === 'inbound_request') {
            const row = records[0] as {
              fromApp: 'eztrac' | 'dhub-rpt';
              dataset: string;
              recordCount: number;
              purpose: string;
            };
            const created = this.actions.addInboundRequest(row);
            return {
              ok: true,
              pluginId,
              dataset,
              message: `Delivered ${created.dataset} from ${created.fromApp} (${created.recordCount} rows)`,
              affectedIds: [created.id],
            };
          }
          break;
        }
        case 'flex.settings': {
          if (dataset === 'preferences') {
            const patch = records[0] as Partial<FlexSettings>;
            if (patch.userRole) this.actions.setUserRole(patch.userRole);
            if (typeof patch.slackApprovals === 'boolean') this.actions.setSlackApprovals(patch.slackApprovals);
            if (typeof patch.presentationMode === 'boolean') this.actions.setPresentationMode(patch.presentationMode);
            if (typeof patch.meetingMode === 'boolean') this.actions.setMeetingMode(patch.meetingMode);
            if (typeof patch.spendPulse === 'boolean') this.actions.setSpendPulse(patch.spendPulse);
            if (typeof patch.desktopNotifications === 'boolean') {
              this.actions.setDesktopNotifications(patch.desktopNotifications);
            }
            return { ok: true, pluginId, dataset, message: 'Preferences updated' };
          }
          break;
        }
        case 'flex.optimization': {
          if (dataset === 'advance_stage') {
            const id = (records[0] as { id: string }).id;
            this.actions.advanceSavingsStage(id);
            return { ok: true, pluginId, dataset, message: `Advanced savings ${id}`, affectedIds: [id] };
          }
          break;
        }
        case 'flex.anomalies': {
          if (dataset === 'resolve_anomaly') {
            const id = (records[0] as { id: string }).id;
            const ok = this.actions.resolveAnomaly(id);
            return {
              ok,
              pluginId,
              dataset,
              message: ok ? `Resolved ${id}` : 'RBAC denied or not found',
              affectedIds: ok ? [id] : undefined,
              error: ok ? undefined : 'RBAC_DENIED',
            };
          }
          if (dataset === 'create_anomaly') {
            const input = records[0] as CreateAnomalyInput;
            const id = this.actions.createAnomaly(input);
            return { ok: true, pluginId, dataset, message: `Created anomaly ${id}`, affectedIds: [id] };
          }
          break;
        }
        case 'flex.chargeback': {
          if (dataset === 'update_budget') {
            const { id, budget, owner } = records[0] as { id: string; budget?: number; owner?: string };
            this.actions.updateChargeback(id, { budget, owner });
            return { ok: true, pluginId, dataset, message: `Updated chargeback ${id}`, affectedIds: [id] };
          }
          break;
        }
        case 'flex.workforce': {
          if (dataset === 'acknowledge_signal') {
            const id = (records[0] as { id: string }).id;
            this.actions.acknowledgeWorkforceSignal(id);
            return { ok: true, pluginId, dataset, message: `Acknowledged ${id}`, affectedIds: [id] };
          }
          break;
        }
        case 'flex.alignment': {
          if (dataset === 'resolve_conflict') {
            const id = (records[0] as { id: string }).id;
            this.actions.resolveAlignmentConflict(id);
            return { ok: true, pluginId, dataset, message: `Resolved alignment ${id}`, affectedIds: [id] };
          }
          break;
        }
        case 'flex.integrations': {
          const partner = (records[0] as { partner?: 'eztrac' | 'dhub-rpt' })?.partner ?? req.sourceApp;
          if (!partner || (partner !== 'eztrac' && partner !== 'dhub-rpt')) {
            return {
              ok: false,
              pluginId,
              dataset,
              message: 'partner must be eztrac or dhub-rpt',
              error: 'VALIDATION',
            };
          }
          if (dataset === 'simulate_inbound_sync') {
            const created = await this.actions.refreshFromExternal(partner);
            return {
              ok: true,
              pluginId,
              dataset,
              message: `Inbound sync from ${partner}: ${created.dataset}`,
              affectedIds: [created.id],
            };
          }
          if (dataset === 'pull_outbound') {
            const n = this.actions.pullPartnerData(partner);
            return { ok: true, pluginId, dataset, message: `Pulled ${n} dataset(s) for ${partner}` };
          }
          break;
        }
        case 'flex.partner.eztrac':
        case 'flex.partner.dhub-rpt': {
          const partner = pluginId === 'flex.partner.eztrac' ? 'eztrac' : 'dhub-rpt';
          if (dataset === 'request_sync') {
            const created = await this.actions.refreshFromExternal(partner);
            return {
              ok: true,
              pluginId,
              dataset,
              message: `Inbound sync from ${partner}: ${created.dataset}`,
              affectedIds: [created.id],
            };
          }
          if (dataset === 'inbound_request') {
            const row = records[0] as {
              fromApp?: 'eztrac' | 'dhub-rpt';
              dataset: string;
              recordCount: number;
              purpose: string;
            };
            const created = this.actions.addInboundRequest({
              ...row,
              fromApp: row.fromApp ?? partner,
            });
            return {
              ok: true,
              pluginId,
              dataset,
              message: `Delivered ${created.dataset} from ${partner} (${created.recordCount} rows)`,
              affectedIds: [created.id],
            };
          }
          if (dataset === 'pull_published') {
            const n = this.actions.pullPartnerData(partner);
            return { ok: true, pluginId, dataset, message: `Pulled ${n} dataset(s) for ${partner}` };
          }
          break;
        }
        default:
          break;
      }

      const plugin = getPlugin(pluginId);
      const fallback = plugin?.produce?.(this.getState(), req);
      if (fallback && 'ok' in fallback && fallback.ok) return fallback;

      return {
        ok: true,
        pluginId,
        dataset,
        message: `Recorded ${records.length} record(s) for ${dataset} (no host mutation)`,
      };
    } catch (e) {
      return {
        ok: false,
        pluginId,
        dataset,
        message: e instanceof Error ? e.message : 'Produce failed',
        error: 'VALIDATION',
      };
    }
  }
}

export function createPluginHost(getState: () => FlexState, actions: PluginHostActions): FlexPluginHost {
  return new FlexPluginHost(getState, actions);
}
