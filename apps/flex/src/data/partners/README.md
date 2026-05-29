# Partner mock data (EzTrac & dhub-rpt)

Structured mocks for Flex demos and **AI RAG** knowledge base. Field names and shapes are derived from local repos on Desktop — not live API calls.

For the full **inbound/outbound dataset contract** (Data Exchange), see [docs/HLD.md §6.3](../../../../../docs/HLD.md#63-partner-dataset-contracts-demo--v1).

## Sources

| App | Desktop path | What we sampled |
|-----|----------------|-----------------|
| **EzTrac** | `~/Desktop/EZTrac` | `eztrac-vip` budgets/initiatives, `eztrac-core-services` efforts/forecasts, `eztrac-reporting-services` spend trees, `eztrac-notes/calendar-setup/resources/EZTRAC_2026_SETUP.csv` |
| **dhub-rpt** | `~/Desktop/dhub-rpt` | `backend/src/models/*`, `Documentation/PUBLIC_API_V1_GUIDE.md`, `frontend/src/types/api.ts` |

## Files

- `eztracMocks.ts` — initiatives, budgets, forecasts, effort spend, calendar months, `eztracConsumedDatasets`
- `dhubRptMocks.ts` — platforms, squads, resources, transfers, dashboard stats, `dhubConsumedDatasets`

## What each partner exposes (domain vs datasets)

**Domain mocks** (in this folder) describe what each app “owns” for RAG and UI copy. **Dataset names** are the governed exchange contract with Flex.

### EzTrac

| Kind | Items |
|------|--------|
| **Domain entities** (mock TS) | `eztracCalendar2026`, `eztracInitiatives`, `eztracBudgets`, `eztracForecasts`, `eztracEffortSpend` |
| **Inbound to Flex** (datasets) | `forecast_variance`, `monthly_spend_by_service`, `anomaly_summary_export` |
| **Outbound from Flex** (consumes) | `cloud_cost_daily`, `finops_kpi_bundle`, `anomaly_summary_export`, `forecast_variance` — see `eztracConsumedDatasets` |

### dhub-rpt

| Kind | Items |
|------|--------|
| **Domain entities** (mock TS) | `dhubPlatforms`, `dhubSquads`, `dhubResources`, `dhubTransferRequests`, `dhubDashboardStats`, `dhubCsvExportColumns` |
| **Inbound to Flex** (datasets) | `capacity_forecast`, `resource_utilization_snapshots` |
| **Outbound from Flex** (consumes) | `cloud_cost_daily`, `allocation_matrix`, `resource_utilization_snapshots`, `capacity_forecast` — see `dhubConsumedDatasets` |

### Mental model

- **EzTrac** = finance truth (budgets, forecasts, initiative spend).
- **dhub-rpt** = people/capacity truth (squads, allocation, transfers).
- **Flex** = cloud FinOps truth (spend, `allocation_matrix`, anomalies).

## RAG integration

`buildPartnerKnowledge.ts` turns these into `KnowledgeChunk` entries (categories `eztrac` and `dhub-rpt`), merged in `buildKnowledge.ts`. Ask **Flex AI** about squads, initiatives, budgets, or transfers.

## Refreshing from real repos

When source apps change, update the mock files manually or extend `scripts/sync-partner-mocks.js` to pull CSV/API samples into this folder. Keep **dataset names** in sync with `apps/flex/src/data/mockData.ts` and [HLD §6.3](../../../../../docs/HLD.md#63-partner-dataset-contracts-demo--v1).
