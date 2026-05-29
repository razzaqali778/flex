import { copyMarkdownToClipboard, sessionToMarkdown } from './exportMarkdown';
import type { ChatSession } from '../../types/chat';

export async function shareChat(session: ChatSession): Promise<'shared' | 'copied' | 'failed'> {
  const text = sessionToMarkdown(session);
  const title = `Flex AI: ${session.title}`;

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share({ title, text });
      return 'shared';
    } catch (err) {
      if ((err as Error).name === 'AbortError') return 'failed';
    }
  }

  const ok = await copyMarkdownToClipboard(session);
  return ok ? 'copied' : 'failed';
}
