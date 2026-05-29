import type { ChatMessage, ChatSession } from '../../types/chat';

function stripBold(text: string): string {
  return text.replace(/\*\*([^*]+)\*\*/g, '$1');
}

function messageToMd(m: ChatMessage): string {
  const role = m.role === 'user' ? 'You' : 'Flex AI';
  const body = stripBold(m.role === 'assistant' ? m.content : m.content);
  const time = new Date(m.createdAt).toLocaleString();
  let block = `### ${role} — ${time}\n\n${body}\n`;

  if (m.feedback) {
    block += `\n> Feedback: ${m.feedback === 'up' ? '👍 Helpful' : '👎 Not helpful'}`;
    if (m.feedbackNote) block += ` — ${m.feedbackNote}`;
    block += '\n';
  }
  if (m.userComment) {
    block += `\n> Your note: ${m.userComment}\n`;
  }
  if (m.sources?.length) {
    block += `\n_Sources (${m.sources.length}): ${m.sources.map((s) => s.title).join(', ')}_\n`;
  }
  return block;
}

export function sessionToMarkdown(session: ChatSession): string {
  const lines = [
    `# Flex AI — ${session.title}`,
    '',
    `_Exported ${new Date().toLocaleString()}_`,
    `_Session updated ${new Date(session.updatedAt).toLocaleString()}_`,
    '',
    '---',
    '',
  ];

  for (const m of session.messages) {
    lines.push(messageToMd(m), '');
  }

  lines.push('---', '', '_Grounded in Flex FinOps RAG knowledge base._');
  return lines.join('\n');
}

export function downloadMarkdown(session: ChatSession): void {
  const md = sessionToMarkdown(session);
  const safeTitle = session.title.replace(/[^a-z0-9]+/gi, '-').slice(0, 40);
  const filename = `flex-ai-${safeTitle}-${new Date().toISOString().slice(0, 10)}.md`;
  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyMarkdownToClipboard(session: ChatSession): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(sessionToMarkdown(session));
    return true;
  } catch {
    return false;
  }
}
