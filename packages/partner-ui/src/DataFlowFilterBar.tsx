import { ArrowDownToLine, ArrowUpFromLine, Repeat2 } from 'lucide-react';
import { DATA_FLOW_FILTER_LABELS, type DataFlowFilter } from './types';

const FILTER_ICONS: Record<DataFlowFilter, typeof ArrowUpFromLine | null> = {
  all: null,
  send: ArrowUpFromLine,
  read: ArrowDownToLine,
  both: Repeat2,
};

const FILTER_HINTS: Partial<Record<DataFlowFilter, string>> = {
  send: 'Plugins that push data into Flex — use Send after install.',
  read: 'Plugins that pull published Flex datasets — use Read after install.',
  both: 'Plugins that can read from and send data to Flex.',
};

export function DataFlowFilterBar({
  value,
  onChange,
  counts,
}: {
  value: DataFlowFilter;
  onChange: (filter: DataFlowFilter) => void;
  counts?: Partial<Record<DataFlowFilter, number>>;
}) {
  const hint = FILTER_HINTS[value];

  return (
    <div className="data-flow-bar">
      <p className="data-flow-bar-label">Data flow</p>
      <div className="data-flow-filters" role="group" aria-label="Filter by data flow">
        {(Object.keys(DATA_FLOW_FILTER_LABELS) as DataFlowFilter[]).map((id) => {
          const Icon = FILTER_ICONS[id];
          const count = counts?.[id];
          return (
            <button
              key={id}
              type="button"
              className={`data-flow-chip ${value === id ? 'active' : ''}`}
              onClick={() => onChange(id)}
            >
              {Icon && <Icon size={14} aria-hidden />}
              {DATA_FLOW_FILTER_LABELS[id]}
              {count !== undefined && <span className="data-flow-count">{count}</span>}
            </button>
          );
        })}
      </div>
      {hint && <p className="data-flow-hint">{hint}</p>}
    </div>
  );
}
