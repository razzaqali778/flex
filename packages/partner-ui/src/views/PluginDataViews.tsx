import type { PluginImport } from '../pluginImport';
import type { PartnerLocalContext } from '../partnerLocalContext';
import { resolveViewKind, VIEW_LABELS, type ViewKind } from '../viewRegistry';
import {
  EditableAnomalyView,
  EditableChargebackView,
  EditableGenericView,
  EditableKpiView,
  EditableResourceView,
} from './editableDataViews';
import {
  ReadAnomalyView,
  ReadChargebackView,
  ReadConsumptionView,
  ReadGenericTableView,
  ReadKpiView,
  ReadResourceView,
  ReadUsageView,
} from './readonlyDataViews';

export type DataViewMode = 'view' | 'edit';

function ReadOnlyBody({
  kind,
  records,
  local,
}: {
  kind: ViewKind;
  records: Record<string, unknown>[];
  local: PartnerLocalContext;
}) {
  if (kind === 'kpi') return <ReadKpiView records={records} />;
  if (kind === 'chargeback') return <ReadChargebackView records={records} local={local} />;
  if (kind === 'anomalies') return <ReadAnomalyView records={records} />;
  if (kind === 'usage') return <ReadUsageView records={records} />;
  if (kind === 'resources' || kind === 'workforce') return <ReadResourceView records={records} />;
  if (kind === 'consumption') return <ReadConsumptionView records={records} />;
  if (kind === 'savings') return <ReadGenericTableView records={records} />;
  return <ReadGenericTableView records={records} />;
}

function EditableBody({
  kind,
  records,
  local,
  onChange,
}: {
  kind: ViewKind;
  records: Record<string, unknown>[];
  local: PartnerLocalContext;
  onChange: (records: Record<string, unknown>[]) => void;
}) {
  if (kind === 'kpi') return <EditableKpiView records={records} onChange={onChange} />;
  if (kind === 'chargeback') return <EditableChargebackView records={records} onChange={onChange} local={local} />;
  if (kind === 'anomalies') return <EditableAnomalyView records={records} onChange={onChange} />;
  if (kind === 'resources' || kind === 'workforce') {
    return <EditableResourceView records={records} onChange={onChange} local={local} />;
  }
  return <EditableGenericView records={records} onChange={onChange} />;
}

export function PluginDataView({
  imp,
  local,
  mode,
  onRecordsChange,
}: {
  imp: PluginImport;
  local: PartnerLocalContext;
  mode: DataViewMode;
  onRecordsChange?: (records: Record<string, unknown>[]) => void;
}) {
  const kind = resolveViewKind(imp);
  const { records } = imp;
  const onChange = onRecordsChange ?? (() => undefined);

  return (
    <div className={`plugin-data-view plugin-data-view--${mode}`}>
      <header className="plugin-data-view-header">
        <h3>{VIEW_LABELS[kind]}</h3>
        <p className="plugin-data-view-meta">
          {imp.pluginName} · <code>{imp.dataset}</code> · {records.length} row(s)
        </p>
        {mode === 'view' ? (
          <p className="plugin-data-view-hint plugin-data-view-hint--read">
            Read-only snapshot from Flex. Switch to <strong>Edit & send</strong> to change values and push back.
          </p>
        ) : (
          <p className="plugin-data-view-hint plugin-data-view-hint--edit">
            Changes are kept in this app until you send them to Flex.
          </p>
        )}
      </header>

      {mode === 'view' ? (
        <ReadOnlyBody kind={kind} records={records} local={local} />
      ) : (
        <EditableBody kind={kind} records={records} local={local} onChange={onChange} />
      )}
    </div>
  );
}
