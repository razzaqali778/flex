import type { ChunkFacts } from './facts';
import type { RetrievedChunk } from './types';

type Intent =
  | 'greeting'
  | 'thanks'
  | 'anomalies'
  | 'exchange'
  | 'datasets'
  | 'cloud'
  | 'resources'
  | 'integrations'
  | 'transfers'
  | 'kpis'
  | 'eztrac'
  | 'dhub'
  | 'flex'
  | 'platform'
  | 'general';

type QuestionTone = 'what' | 'how' | 'why' | 'should' | 'list' | 'status' | 'compare' | 'none';

function detectIntent(query: string): Intent {
  const q = query.toLowerCase().trim();
  if (/^(hi|hello|hey|good\s+(morning|afternoon|evening))\b/.test(q)) return 'greeting';
  if (/\b(thanks|thank you|thx|cheers)\b/.test(q)) return 'thanks';
  if (/\b(what is finops|finops mean|define finops)\b/.test(q)) return 'platform';
  if (/\b(what is flex|how flex|flex solve|flex built|flex develop|flex ai)\b/.test(q)) return 'flex';
  if (/\b(eztrac|initiative|vip|effort spend)\b/.test(q) && !/\bdhub|rtp\b/.test(q)) return 'eztrac';
  if (/\b(dhub|dhub-rpt|\brtp\b|squad|sqaue|squade|platform lead|unit name)\b/.test(q)) return 'dhub';
  if (/\b(anomal|alert|incident|critical|spike)\b/.test(q)) return 'anomalies';
  if (/\b(pending|approv|reject|request|exchange)\b/.test(q)) return 'exchange';
  if (/\b(dataset|publish|schema|consumer|catalog)\b/.test(q)) return 'datasets';
  if (/\b(cloud|usage|compute|storage|service|breakdown)\b/.test(q)) return 'cloud';
  if (/\b(resource|allocat|capacity|utiliz|eks|rds|lambda)\b/.test(q) && !/\bsquad|dhub|rtp\b/.test(q))
    return 'resources';
  if (/\b(integrat|sync|partner|connected|ecosystem)\b/.test(q)) return 'integrations';
  if (/\b(transfer|deliver|outbound|inbound)\b/.test(q)) return 'transfers';
  if (/\b(spend|kpi|cost|budget|forecast|overview|summary)\b/.test(q)) return 'kpis';
  if (/\b(tool|implement|architecture|how does)\b/.test(q)) return 'platform';
  return 'general';
}

function detectTone(query: string): QuestionTone {
  const q = query.toLowerCase();
  if (/^(how many|count|number of)\b/.test(q)) return 'list';
  if (/\bhow\b/.test(q)) return 'how';
  if (/\bwhy\b/.test(q)) return 'why';
  if (/\b(should|recommend|suggest|worth|priority)\b/.test(q)) return 'should';
  if (/\b(compare|versus|vs\.?|difference)\b/.test(q)) return 'compare';
  if (/\b(status|update|going on|situation)\b/.test(q)) return 'status';
  if (/\b(list|show|what are|which)\b/.test(q)) return 'list';
  if (/\bwhat\b/.test(q)) return 'what';
  return 'none';
}

function collectFacts(sources: RetrievedChunk[]): ChunkFacts[] {
  return sources.map((s) => s.facts).filter((f): f is ChunkFacts => f !== undefined);
}

function byKind<T extends ChunkFacts['kind']>(
  facts: ChunkFacts[],
  kind: T
): Extract<ChunkFacts, { kind: T }>[] {
  return facts.filter((f) => f.kind === kind) as Extract<ChunkFacts, { kind: T }>[];
}

function spendK(v: number): string {
  return `$${(v / 1000).toFixed(1)}K`;
}

function relTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const hrs = Math.floor(diff / 3_600_000);
  if (hrs < 1) return 'just now';
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days === 1) return 'yesterday';
  if (days < 7) return `${days} days ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

function opener(intent: Intent, tone: QuestionTone, query: string): string {
  const seed = query.length % 3;
  const pools: Record<Intent, string[]> = {
    greeting: [
      "Hey — I'm Flex AI. Ask me about FinOps, this Flex app, EzTrac tools & budgets, dhub-rpt squads (RTP), cloud spend, anomalies, or who works on which squad.",
      "Hi there. I can explain Flex, EzTrac, and dhub-rpt — plus live metrics, exchange approvals, and capacity planning.",
    ],
    thanks: ["Happy to help.", "Anytime — ping me if something else comes up.", "Glad that helped."],
    kpis: [
      "Here's the pulse of the platform right now.",
      "Quick read on where things stand financially.",
      "Let me walk you through the headline numbers.",
    ],
    anomalies: [
      "I looked at your anomaly queue.",
      "On the alerting side, here's what matters.",
      "There's a few signals worth talking through.",
    ],
    exchange: [
      "On the data-exchange side:",
      "Partner requests look like this:",
      "Here's where exchange stands.",
    ],
    datasets: ["On published data:", "Your dataset catalog in plain terms:", "Sharing posture looks like this:"],
    cloud: [
      "Cloud mix is leaning the way you'd expect for a platform your size.",
      "Usage breakdown tells an interesting story.",
      "Here's how spend stacks across services.",
    ],
    resources: [
      "Capacity-wise, a few teams stand out.",
      "I checked allocations against actual use.",
      "Resource picture across teams:",
    ],
    integrations: [
      "Partner connections are in good shape overall.",
      "EzTrac and dhub-rpt from an integration lens:",
      "Sync health across connected apps:",
    ],
    transfers: ["Recent movement between apps:", "Latest transfer activity:", "Data in flight lately:"],
    eztrac: ["On the EzTrac side:", "From finance forecasting systems:", "EzTrac picture:"],
    dhub: ["From dhub-rpt / resource planning:", "Squad and capacity lens:", "RTP / planning view:"],
    flex: ["About Flex itself:", "How this platform fits:", "Flex in context:"],
    platform: ["Conceptually:", "Here's the bigger picture:", "Let me explain:"],
    general: [
      "Based on what I can see in Flex:",
      "Pulling that together from your workspace:",
      "Here's my read:",
    ],
  };

  if (intent === 'greeting' || intent === 'thanks') return pools[intent][0];

  if (tone === 'should') {
    return ["If I were prioritizing today, I'd start here:", "My take on what to tackle first:"][seed];
  }
  if (tone === 'how') {
    return ["Here's how I'd think about it:", "Short version:"][seed];
  }

  const list = pools[intent] ?? pools.general;
  return list[seed % list.length];
}

function joinSentences(parts: string[]): string {
  return parts.filter(Boolean).join(' ');
}

function synthesizeKpis(facts: ChunkFacts[], tone: QuestionTone): string {
  const kpi = byKind(facts, 'kpi')[0];
  const forecast = byKind(facts, 'forecast')[0];
  if (!kpi) return '';

  const spendDir = kpi.spendChange < 0 ? 'down' : 'up';
  const spendMag = Math.abs(kpi.spendChange).toFixed(1);

  const body: string[] = [];

  if (tone === 'status' || tone === 'what' || tone === 'none') {
    body.push(
      `Spend is around **${spendK(kpi.totalSpend)}**, **${spendDir} ${spendMag}%** versus the prior period — ${
        kpi.spendChange < 0 ? 'a modest improvement.' : 'worth watching if that continues.'
      }`
    );
    body.push(
      `Utilization is **${kpi.utilization}%** across **${kpi.activeResources.toLocaleString()}** active resources.`
    );
  }

  const friction: string[] = [];
  if (kpi.pendingApprovals > 0) {
    friction.push(
      `**${kpi.pendingApprovals}** data-exchange approval${kpi.pendingApprovals > 1 ? 's' : ''} still waiting`
    );
  }
  if (kpi.openAnomalies > 0) {
    friction.push(`**${kpi.openAnomalies}** open anomal${kpi.openAnomalies > 1 ? 'ies' : 'y'}`);
  }
  if (friction.length) {
    body.push(`The friction points: ${friction.join(', and ')}.`);
  }

  if (forecast) {
    const gap = forecast.forecast - forecast.budget;
    body.push(
      `Looking ahead to **${forecast.month}**, you're projecting **${spendK(forecast.forecast)}** against a **${spendK(forecast.budget)}** budget — ${
        gap > 0 ? `about **${spendK(gap)}** over plan if nothing changes.` : 'roughly on track with plan.'
      }`
    );
  }

  if (tone === 'should') {
    body.push(
      kpi.pendingApprovals > 0
        ? "I'd clear pending exchange approvals first so EzTrac and dhub-rpt aren't working off stale feeds."
        : 'No urgent approvals — good time to dig into anomalies or right-size hot resources.'
    );
  }

  return joinSentences(body);
}

function synthesizeAnomalies(facts: ChunkFacts[], tone: QuestionTone): string {
  const items = byKind(facts, 'anomaly');
  if (!items.length) {
    return "I don't see any anomaly records in scope right now — either they've been cleared or nothing matched your question.";
  }

  const open = items.filter((a) => a.status === 'open' || a.status === 'investigating');
  const critical = open.filter((a) => a.severity === 'critical' || a.severity === 'high');

  const parts: string[] = [];

  if (tone === 'list') {
    parts.push(
      `You've got **${open.length}** active item${open.length !== 1 ? 's' : ''} (${items.length} total in context).`
    );
  } else {
    parts.push(
      open.length
        ? `There ${open.length === 1 ? 'is' : 'are'} **${open.length}** active signal${open.length > 1 ? 's' : ''} I'd pay attention to.`
        : 'Nothing open in the slice I retrieved — mostly resolved or historical.'
    );
  }

  if (critical.length) {
    const top = critical[0];
    parts.push(
      `The loudest one is **${top.title}** on **${top.service}** (${top.severity}) — ${top.impact.toLowerCase().replace(/\.$/, '')}, spotted ${relTime(top.detectedAt)}.`
    );
  }

  const others = open.filter((a) => a !== critical[0]).slice(0, 2);
  if (others.length) {
    const brief = others
      .map((a) => `**${a.title}** (${a.service}, ${a.severity})`)
      .join('; ');
    parts.push(`Also on the radar: ${brief}.`);
  }

  if (tone === 'should') {
    parts.push(
      critical.length
        ? 'Triage the critical compute spike first, then chip away at storage waste like unattached volumes — those are usually quick wins.'
        : 'Focus on medium-severity items with recurring cost impact before low-priority coverage gaps.'
    );
  }

  return joinSentences(parts);
}

function synthesizeExchange(facts: ChunkFacts[], tone: QuestionTone): string {
  const requests = byKind(facts, 'request');
  if (!requests.length) return '';

  const pending = requests.filter((r) => r.status === 'pending');
  const approved = requests.filter((r) => r.status === 'approved');

  const parts: string[] = [];

  if (pending.length) {
    parts.push(
      `**${pending.length}** partner request${pending.length > 1 ? 's' : ''} still need a decision. The most recent is **${pending[0].fromApp}** asking for **${pending[0].dataset}** (${pending[0].recordCount.toLocaleString()} rows) — "${pending[0].purpose}".`
    );
    if (pending.length > 1) {
      const rest = pending
        .slice(1, 3)
        .map((r) => `**${r.fromApp}** → **${r.dataset}**`)
        .join(', ');
      parts.push(`Also waiting: ${rest}.`);
    }
  } else {
    parts.push('No pending inbound requests in what I pulled — exchange queue looks clear on that front.');
  }

  if (approved.length && tone !== 'list') {
    parts.push(
      `Recently approved: **${approved[0].dataset}** from **${approved[0].fromApp}** for ${approved[0].purpose.toLowerCase()}.`
    );
  }

  if (tone === 'should' && pending.length) {
    parts.push(
      'Approving soon keeps downstream forecasts honest — especially anything tagged for quarterly planning.'
    );
  }

  return joinSentences(parts);
}

function synthesizeDatasets(facts: ChunkFacts[]): string {
  const sets = byKind(facts, 'dataset');
  if (!sets.length) return '';

  const active = sets.filter((d) => d.status === 'active');
  const draft = sets.filter((d) => d.status === 'draft');

  const parts: string[] = [
    `You have **${active.length}** live dataset${active.length !== 1 ? 's' : ''} partners can consume.`,
  ];

  if (active.length) {
    const names = active
      .slice(0, 3)
      .map((d) => `**${d.name}** (${d.consumers.length ? d.consumers.join(', ') : 'no consumers yet'})`)
      .join(', ');
    parts.push(`Active feeds include ${names}.`);
  }

  if (draft.length) {
    parts.push(
      `**${draft[0].name}** is still draft — worth publishing when you're ready to expose anomaly events externally.`
    );
  }

  return joinSentences(parts);
}

function synthesizeCloud(facts: ChunkFacts[], tone: QuestionTone): string {
  const mix = byKind(facts, 'cloud-mix')[0];
  const shares = byKind(facts, 'service-share').sort((a, b) => b.percent - a.percent);

  if (!mix && !shares.length) return '';

  const parts: string[] = [];

  if (mix) {
    const top = [
      { label: 'compute', v: mix.compute },
      { label: 'database', v: mix.database },
      { label: 'storage', v: mix.storage },
      { label: 'network', v: mix.network },
    ].sort((a, b) => b.v - a.v);

    parts.push(
      `In **${mix.period}**, **${top[0].label}** and **${top[1].label}** dominate the mix (${top[0].v}% / ${top[1].v}%). Storage and network are smaller slices but still move the needle at scale.`
    );
  }

  if (shares.length && tone === 'compare') {
    parts.push(
      `By cost category, **${shares[0].name}** leads at **${shares[0].percent}%**, then **${shares[1]?.name ?? 'other services'}** at **${shares[1]?.percent ?? 0}%**.`
    );
  } else if (shares.length) {
    parts.push(
      `Overall spend skew: **${shares.map((s) => `${s.name} ${s.percent}%`).join(', ')}**.`
    );
  }

  return joinSentences(parts);
}

function synthesizeResources(facts: ChunkFacts[], tone: QuestionTone): string {
  const res = byKind(facts, 'resource');
  if (!res.length) return '';

  const hot = [...res].sort((a, b) => b.utilizationPct - a.utilizationPct);
  const tight = hot.filter((r) => r.utilizationPct >= 90);
  const loose = hot.filter((r) => r.utilizationPct < 75);

  const parts: string[] = [];

  if (tight.length) {
    const r = tight[0];
    parts.push(
      `**${r.name}** (${r.team}) is running hot — **${r.utilizationPct.toFixed(0)}%** of ${r.allocated} ${r.unit} used, trend **${r.trend}**.`
    );
  }

  if (loose.length && tone !== 'list') {
    const r = loose[0];
    parts.push(
      `On the other hand, **${r.name}** has headroom (~**${r.utilizationPct.toFixed(0)}%** used) if you need to shift load.`
    );
  }

  if (tone === 'should') {
    parts.push(
      tight.length
        ? 'Consider a rightsizing review on the hot cluster before the next planning cycle — especially if trend is up.'
        : "Utilization looks balanced; I'd watch Lambda-style bursty workloads for surprise growth."
    );
  } else if (tone === 'list') {
    const lines = hot
      .slice(0, 4)
      .map((r) => `**${r.name}** (${r.team}): ${r.utilizationPct.toFixed(0)}%`)
      .join('; ');
    parts.push(lines);
  }

  return joinSentences(parts);
}

function synthesizeIntegrations(facts: ChunkFacts[]): string {
  const apps = byKind(facts, 'integration');
  if (!apps.length) return '';

  return joinSentences(
    apps.map((a) => {
      const sync = relTime(a.lastSync);
      return `**${a.name}** is **${a.status}** with **${a.direction}** flows — last sync ${sync}.`;
    })
  );
}

function synthesizeTransfers(facts: ChunkFacts[]): string {
  const moves = byKind(facts, 'transfer').slice(0, 3);
  if (!moves.length) return '';

  const latest = moves[0];
  const parts = [
    `Most recent: **${latest.dataset}** went **${latest.direction}** (${latest.from} → ${latest.to}), **${latest.recordCount.toLocaleString()}** records, status **${latest.status}**.`,
  ];

  if (moves.length > 1) {
    parts.push(
      `Before that: ${moves
        .slice(1)
        .map((t) => `**${t.dataset}** to ${t.to}`)
        .join('; ')}.`
    );
  }

  return joinSentences(parts);
}

function synthesizeConcepts(facts: ChunkFacts[], tone: QuestionTone): string {
  const concepts = byKind(facts, 'concept');
  if (!concepts.length) return '';

  const primary = concepts[0];
  const parts: string[] = [];

  if (primary.topic.toLowerCase().includes('finops')) {
    parts.push(
      '**FinOps** is cloud financial operations — making variable cloud spend visible, optimizable, and forecastable across engineering, finance, and platform teams.'
    );
  } else if (primary.body.length > 40) {
    parts.push(primary.body.split('. ')[0] + (primary.body.includes('.') ? '.' : ''));
  }

  for (const c of concepts.slice(0, 3)) {
    if (c === primary) continue;
    const sentence = c.body.split('. ').slice(0, 2).join('. ');
    if (sentence && !parts.some((p) => p.includes(sentence.slice(0, 30)))) {
      parts.push(sentence + (sentence.endsWith('.') ? '' : '.'));
    }
  }

  if (tone === 'why' || tone === 'should') {
    const value = concepts.find((c) => c.topic.toLowerCase().includes('problem'));
    if (value) {
      parts.push(
        'Practically, Flex sits in the middle: governed datasets out, approved requests in, so EzTrac and dhub-rpt stay aligned with the same cloud truth.'
      );
    }
  }

  return joinSentences(parts);
}

function synthesizeFlex(facts: ChunkFacts[], tone: QuestionTone, query: string): string {
  const concepts = byKind(facts, 'concept').filter((c) =>
    /flex|problem|stack|route/i.test(c.topic)
  );
  const kpi = byKind(facts, 'kpi')[0];

  const parts: string[] = [];

  if (concepts.length) {
    parts.push(
      concepts
        .slice(0, 2)
        .map((c) => c.body.split('. ')[0] + '.')
        .join(' ')
    );
  } else {
    parts.push(
      '**Flex** is your FinOps command center — extension + web app for spend, anomalies, resource allocation, and governed data exchange with EzTrac and dhub-rpt.'
    );
  }

  if (kpi && tone !== 'why') {
    parts.push(
      `Right now the workspace shows **${spendK(kpi.totalSpend)}** spend, **${kpi.utilization}%** utilization, with **${kpi.openAnomalies}** open anomalies and **${kpi.pendingApprovals}** pending partner approvals.`
    );
  }

  if (tone === 'why' || /\bsolve|problem|value\b/i.test(query)) {
    parts.push(
      'It solves siloed metrics, unapproved exports, and misaligned finance vs capacity planning by keeping one approval gate and a shared dataset catalog.'
    );
  }

  parts.push(
    '**Flex AI** (this chat) runs RAG over live Flex data plus EzTrac/dhub-rpt mocks — so you can ask about squads, initiatives, tools, and architecture without leaving the app.'
  );

  return joinSentences(parts);
}

function synthesizeEztrac(facts: ChunkFacts[], tone: QuestionTone, query: string): string {
  const domain = byKind(facts, 'partner-domain').find((d) => d.app === 'eztrac');
  const concepts = byKind(facts, 'concept');
  const initiatives = byKind(facts, 'eztrac-initiative');
  const budgets = byKind(facts, 'eztrac-budget');
  const spends = byKind(facts, 'eztrac-spend');
  const datasets = byKind(facts, 'partner-dataset').filter((d) => d.app === 'eztrac');

  const parts: string[] = [];

  if (concepts.length || domain) {
    parts.push(
      (concepts.find((c) => c.topic.includes('EzTrac'))?.body.split('. ')[0] ??
        domain?.summary.split('. ')[0] ??
        'EzTrac handles portfolio cost tracking.') + '.'
    );
  }

  if (/\btool|implement|module|service|architecture\b/i.test(query) || tone === 'what') {
    parts.push(
      'Implementation is split into **VIP** (initiatives/budgets), **Core** (teams, efforts, forecasts), **Costing** (rates, calendars), and **Reporting** (spend trees) — typically Java/Spring services with calendar-driven timeframes.'
    );
  }

  if (initiatives.length) {
    const names = initiatives
      .slice(0, 3)
      .map((i) => `**${i.name}** (${i.status})`)
      .join(', ');
    parts.push(`Active initiative examples: ${names}.`);
  }

  if (budgets.length) {
    const total = budgets.reduce((s, b) => s + b.amount, 0);
    parts.push(
      `Sample FY${budgets[0].fiscalYear} budgets in context total about **$${(total / 1_000_000).toFixed(2)}M** across retrieved initiatives.`
    );
  }

  if (spends.length && tone !== 'list') {
    const top = spends.sort((a, b) => b.totalExpenditure - a.totalExpenditure)[0];
    parts.push(
      `Recent effort spend highlight: **$${(top.totalExpenditure / 1000).toFixed(1)}K** total on initiative ${top.initiativeId}.`
    );
  }

  if (datasets.length) {
    parts.push(
      `EzTrac pulls from Flex: ${datasets.map((d) => `**${d.name}**`).join(', ')}.`
    );
  }

  return joinSentences(parts);
}

function synthesizeDhub(facts: ChunkFacts[], tone: QuestionTone, query: string): string {
  const domain = byKind(facts, 'partner-domain').find((d) => d.app === 'dhub-rpt');
  const concepts = byKind(facts, 'concept');
  const squads = byKind(facts, 'dhub-squad');
  const people = byKind(facts, 'dhub-resource');
  const dashboard = byKind(facts, 'dhub-dashboard')[0];
  const transfers = byKind(facts, 'dhub-transfer');
  const datasets = byKind(facts, 'partner-dataset').filter((d) => d.app === 'dhub-rpt');

  const parts: string[] = [];

  if (/\brtp\b|what is dhub/i.test(query) || tone === 'what') {
    parts.push(
      '**dhub-rpt** is the DHUB Resource Planning Tool — often called **RTP** in planning conversations. It is not the same as Flex; it owns squad capacity and people assignments.'
    );
  }

  if (domain || concepts.length) {
    parts.push(
      (concepts.find((c) => /dhub|squad|org/i.test(c.topic))?.body.split('. ')[0] ??
        domain?.summary.split('. ')[0] ??
        'dhub-rpt models Platform → Unit → Squad → Resource.') + '.'
    );
  }

  if (squads.length) {
    if (tone === 'list' || /\bwhich team|who works|squad|sqaue|platform\b/i.test(query)) {
      const lines = squads.slice(0, 5).map((s) => {
        const tools = s.tools?.length ? ` — tools: ${s.tools.slice(0, 3).join(', ')}` : '';
        const org = s.platformName ? ` under **${s.platformName}** / **${s.unitName}**` : '';
        const cap = ` (${s.currentCapacity}/${s.capacity}, ${s.utilizationPct}%)`;
        return `**${s.name}**${org}${cap}${tools}`;
      });
      parts.push(`Squads in context:\n${lines.map((l) => `• ${l}`).join('\n')}`);
    } else {
      const hot = [...squads].sort((a, b) => b.utilizationPct - a.utilizationPct)[0];
      parts.push(
        `**${hot.name}** is at **${hot.utilizationPct}%** capacity${hot.utilizationPct > 100 ? ' (over-allocated)' : ''}${hot.squadLead ? `, led by ${hot.squadLead}` : ''}.`
      );
    }
  }

  if (people.length && (/\bwho|team|works|assign|under\b/i.test(query) || tone === 'list')) {
    const sample = people.slice(0, 3).map((p) => {
      const squadsStr =
        p.assignedSquads?.map((s) => `${s.squadName} ${s.percentage}%`).join(', ') ?? 'unassigned';
      return `**${p.name}** → ${squadsStr}`;
    });
    parts.push(`People ↔ squad mapping:\n${sample.map((s) => `• ${s}`).join('\n')}`);
  }

  if (dashboard) {
    parts.push(
      `Org-wide: **${dashboard.totalResources}** resources tracked, **${dashboard.capacityUtilizationPct}%** capacity utilization, **${dashboard.pendingTransfers}** pending squad transfers.`
    );
  }

  if (transfers.length) {
    const pending = transfers.filter((t) => t.status === 'Pending');
    if (pending.length) {
      parts.push(
        `Pending move: toward **${pending[0].targetSquadName}** (${pending[0].priority} priority).`
      );
    }
  }

  if (datasets.length) {
    parts.push(`dhub-rpt consumes from Flex: ${datasets.map((d) => d.name).join(', ')}.`);
  }

  return joinSentences(parts);
}

function synthesizeGeneral(facts: ChunkFacts[], sources: RetrievedChunk[]): string {
  const kpi = byKind(facts, 'kpi')[0];
  if (kpi) {
    return joinSentences([
      `Broadly, you're at **${spendK(kpi.totalSpend)}** spend with **${kpi.utilization}%** utilization.`,
      kpi.openAnomalies || kpi.pendingApprovals
        ? `There are **${kpi.openAnomalies}** open anomalies and **${kpi.pendingApprovals}** pending approvals if you want to drill in.`
        : 'Exchange and alerting queues look relatively quiet.',
      'Ask me something specific — anomalies, cloud mix, partner syncs — and I can go deeper.',
    ]);
  }

  const concepts = byKind(facts, 'concept');
  if (concepts.length) return synthesizeConcepts(facts, 'what');

  if (sources.every((s) => s.score <= 1)) {
    return "I couldn't tie that question to anything concrete in Flex. Try asking about **FinOps**, **Flex architecture**, **EzTrac tools**, **dhub-rpt squads/RTP**, spend, anomalies, or data exchange — that's what I know.";
  }

  return "I found some related records but nothing central enough to give a crisp answer. Could you narrow it down — e.g. 'pending EzTrac requests' or 'critical anomalies'?";
}

function closing(intent: Intent, tone: QuestionTone): string | null {
  if (intent === 'greeting' || intent === 'thanks') return null;
  if (tone === 'should') return null;

  const closers = [
    'Want me to dig into any of that in more detail?',
    'Happy to go deeper on one area if you specify.',
    null,
  ];
  return closers[Math.floor(Math.random() * closers.length)];
}

export function synthesizeResponse(query: string, sources: RetrievedChunk[]): string {
  const intent = detectIntent(query);
  const tone = detectTone(query);
  const facts = collectFacts(sources);
  const weak = sources.every((s) => s.score <= 1);

  if (intent === 'greeting') {
    return opener('greeting', tone, query);
  }
  if (intent === 'thanks') {
    return opener('thanks', tone, query);
  }

  if (weak && intent === 'general') {
    return synthesizeGeneral(facts, sources);
  }

  const paragraphs: string[] = [opener(intent, tone, query)];

  let body = '';
  switch (intent) {
    case 'kpis':
      body = synthesizeKpis(facts, tone);
      break;
    case 'anomalies':
      body = synthesizeAnomalies(facts, tone);
      break;
    case 'exchange':
      body = synthesizeExchange(facts, tone);
      break;
    case 'datasets':
      body = synthesizeDatasets(facts);
      break;
    case 'cloud':
      body = synthesizeCloud(facts, tone);
      break;
    case 'resources':
      body = synthesizeResources(facts, tone);
      break;
    case 'integrations':
      body = synthesizeIntegrations(facts);
      break;
    case 'transfers':
      body = synthesizeTransfers(facts);
      break;
    case 'platform':
      body = synthesizeConcepts(facts, tone);
      break;
    case 'flex':
      body = synthesizeFlex(facts, tone, query);
      break;
    case 'eztrac':
      body = synthesizeEztrac(facts, tone, query);
      break;
    case 'dhub':
      body = synthesizeDhub(facts, tone, query);
      break;
    default:
      body = [
        synthesizeKpis(facts, tone),
        synthesizeAnomalies(facts, tone),
        synthesizeExchange(facts, tone),
      ]
        .filter(Boolean)
        .slice(0, 2)
        .join(' ');
      if (!body) body = synthesizeGeneral(facts, sources);
  }

  if (body) paragraphs.push(body);

  const close = closing(intent, tone);
  if (close) paragraphs.push(close);

  return paragraphs.join('\n\n');
}
