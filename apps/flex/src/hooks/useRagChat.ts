import { useCallback, useMemo, useRef, useState } from 'react';
import { buildKnowledgeBase } from '../lib/rag/buildKnowledge';
import { generateAnswer } from '../lib/rag/generateAnswer';
import { retrieveOrFallback } from '../lib/rag/retriever';
import type { RagPhase } from '../lib/rag/types';
import { sortSessions } from '../lib/chat/sessionUtils';
import { detectChatActions } from '../lib/chatActions';
import { useFlex } from '../store/FlexContext';
import type {
  AssistantStatus,
  ChatMessage,
  ChatSession,
  MessageFeedback,
} from '../types/chat';

const CHAT_STORAGE_KEY = 'flex_rag_chat_v1';

const PHASE_DELAYS: Record<RagPhase, [number, number]> = {
  thinking: [700, 1100],
  retrieving: [600, 950],
  analyzing: [500, 850],
  composing: [400, 700],
};

function charDelay(char: string, prev: string): number {
  if (char === ' ') return 6;
  if (char === '\n') return 20;
  if ('.!?'.includes(char)) return 45;
  if (',;:'.includes(char)) return 28;
  if (prev === ' ') return 10;
  return 12 + Math.random() * 8;
}

function randomBetween(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function loadSessions(): ChatSession[] {
  try {
    const raw = localStorage.getItem(CHAT_STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatSession[];
  } catch {
    /* ignore */
  }
  return [];
}

function saveSessions(sessions: ChatSession[]): void {
  try {
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(sessions));
  } catch {
    /* ignore */
  }
}

function titleFromQuery(query: string): string {
  const trimmed = query.trim();
  if (trimmed.length <= 42) return trimmed;
  return `${trimmed.slice(0, 42)}…`;
}

export function useRagChat() {
  const flex = useFlex();
  const [sessions, setSessions] = useState<ChatSession[]>(loadSessions);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(
    () => loadSessions()[0]?.id ?? null
  );
  const [isProcessing, setIsProcessing] = useState(false);
  const abortRef = useRef(false);
  const streamRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const knowledge = useMemo(
    () =>
      buildKnowledgeBase({
        kpis: flex.kpis,
        dataRequests: flex.dataRequests,
        publishedDatasets: flex.publishedDatasets,
        anomalies: flex.anomalies,
        transferLog: flex.transferLog,
      }),
    [flex.kpis, flex.dataRequests, flex.publishedDatasets, flex.anomalies, flex.transferLog]
  );

  const sortedSessions = useMemo(() => sortSessions(sessions), [sessions]);
  const activeSession = sessions.find((s) => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];

  const lastAssistantMessageId = useMemo(() => {
    for (let i = messages.length - 1; i >= 0; i--) {
      if (messages[i].role === 'assistant') return messages[i].id;
    }
    return null;
  }, [messages]);

  const persist = useCallback((next: ChatSession[]) => {
    setSessions(next);
    saveSessions(next);
  }, []);

  const updateSession = useCallback(
    (sessionId: string, updater: (s: ChatSession) => ChatSession) => {
      setSessions((prev) => {
        const next = prev.map((s) => (s.id === sessionId ? updater(s) : s));
        saveSessions(next);
        return next;
      });
    },
    []
  );

  const patchMessage = useCallback(
    (sessionId: string, messageId: string, patch: Partial<ChatMessage>) => {
      updateSession(sessionId, (s) => ({
        ...s,
        updatedAt: new Date().toISOString(),
        messages: s.messages.map((m) => (m.id === messageId ? { ...m, ...patch } : m)),
      }));
    },
    [updateSession]
  );

  const stopStreaming = useCallback(() => {
    abortRef.current = true;
    if (streamRef.current) {
      clearTimeout(streamRef.current);
      streamRef.current = null;
    }
    setIsProcessing(false);
  }, []);

  const runAssistantReply = useCallback(
    async (sessionId: string, assistantId: string, query: string) => {
      abortRef.current = false;
      setIsProcessing(true);

      patchMessage(sessionId, assistantId, {
        content: '',
        displayedContent: '',
        status: 'thinking',
        sources: [],
        feedback: undefined,
        feedbackNote: undefined,
      });

      const phases: RagPhase[] = ['thinking', 'retrieving', 'analyzing', 'composing'];
      let sources = retrieveOrFallback(knowledge, query);

      for (const phase of phases) {
        if (abortRef.current) {
          setIsProcessing(false);
          return;
        }
        patchMessage(sessionId, assistantId, { status: phase });
        const [min, max] = PHASE_DELAYS[phase];
        await delay(randomBetween(min, max));
        if (phase === 'retrieving') {
          sources = retrieveOrFallback(knowledge, query);
          patchMessage(sessionId, assistantId, { sources });
        }
      }

      if (abortRef.current) {
        setIsProcessing(false);
        return;
      }

      const answer = generateAnswer(query, sources);
      const actions = detectChatActions(query, {
        dataRequests: flex.dataRequests,
        publishedDatasets: flex.publishedDatasets,
        anomalies: flex.anomalies,
        kpis: flex.kpis,
      });

      patchMessage(sessionId, assistantId, {
        content: answer,
        status: 'streaming',
        sources,
        actions,
      });

      await new Promise<void>((resolve) => {
        let index = 0;

        const tick = () => {
          if (abortRef.current) {
            resolve();
            return;
          }
          index += 1;
          const slice = answer.slice(0, index);
          const done = index >= answer.length;
          patchMessage(sessionId, assistantId, {
            displayedContent: slice,
            status: done ? 'complete' : 'streaming',
          });
          if (done) {
            patchMessage(sessionId, assistantId, {
              displayedContent: answer,
              status: 'complete',
            });
            resolve();
            return;
          }
          const prev = answer[index - 2] ?? '';
          const ch = answer[index - 1] ?? '';
          streamRef.current = setTimeout(tick, charDelay(ch, prev));
        };

        tick();
      });

      setIsProcessing(false);
    },
    [flex.anomalies, flex.dataRequests, flex.kpis, flex.publishedDatasets, knowledge, patchMessage]
  );

  const startNewChat = useCallback(() => {
    stopStreaming();
    const session: ChatSession = {
      id: uid(),
      title: 'New conversation',
      messages: [],
      updatedAt: new Date().toISOString(),
    };
    persist([session, ...sessions]);
    setActiveSessionId(session.id);
  }, [persist, sessions, stopStreaming]);

  const selectSession = useCallback(
    (id: string) => {
      stopStreaming();
      setActiveSessionId(id);
    },
    [stopStreaming]
  );

  const deleteSession = useCallback(
    (id: string) => {
      stopStreaming();
      const next = sessions.filter((s) => s.id !== id);
      persist(next);
      if (activeSessionId === id) {
        setActiveSessionId(next[0]?.id ?? null);
      }
    },
    [activeSessionId, persist, sessions, stopStreaming]
  );

  const sendMessage = useCallback(
    async (raw: string) => {
      const query = raw.trim();
      if (!query || isProcessing) return;

      let session = activeSessionId
        ? sessions.find((s) => s.id === activeSessionId)
        : undefined;

      if (!session) {
        session = {
          id: uid(),
          title: titleFromQuery(query),
          messages: [],
          updatedAt: new Date().toISOString(),
        };
        persist([session, ...sessions]);
        setActiveSessionId(session.id);
      }

      const sessionId = session.id;

      const userMsg: ChatMessage = {
        id: uid(),
        role: 'user',
        content: query,
        createdAt: new Date().toISOString(),
      };

      const assistantId = uid();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: 'assistant',
        content: '',
        createdAt: new Date().toISOString(),
        status: 'thinking',
        displayedContent: '',
        sources: [],
      };

      updateSession(sessionId, (s) => ({
        ...s,
        title: s.messages.length === 0 ? titleFromQuery(query) : s.title,
        updatedAt: new Date().toISOString(),
        messages: [...s.messages, userMsg, assistantMsg],
      }));

      await runAssistantReply(sessionId, assistantId, query);
    },
    [
      activeSessionId,
      isProcessing,
      persist,
      runAssistantReply,
      sessions,
      updateSession,
    ]
  );

  const regenerateLastResponse = useCallback(async () => {
    if (!activeSessionId || !activeSession || isProcessing) return;
    const msgs = activeSession.messages;
    let assistantIdx = -1;
    for (let i = msgs.length - 1; i >= 0; i--) {
      if (msgs[i].role === 'assistant') {
        assistantIdx = i;
        break;
      }
    }
    if (assistantIdx < 1) return;
    const userMsg = msgs[assistantIdx - 1];
    if (userMsg.role !== 'user') return;

    await runAssistantReply(activeSessionId, msgs[assistantIdx].id, userMsg.content);
  }, [activeSession, activeSessionId, isProcessing, runAssistantReply]);

  const clearConversation = useCallback(() => {
    if (!activeSessionId) return;
    stopStreaming();
    updateSession(activeSessionId, (s) => ({
      ...s,
      title: 'New conversation',
      messages: [],
      updatedAt: new Date().toISOString(),
    }));
  }, [activeSessionId, stopStreaming, updateSession]);

  const renameSession = useCallback(
    (title: string) => {
      if (!activeSessionId || !title.trim()) return;
      updateSession(activeSessionId, (s) => ({
        ...s,
        title: title.trim(),
        updatedAt: new Date().toISOString(),
      }));
    },
    [activeSessionId, updateSession]
  );

  const togglePinSession = useCallback(
    (id: string) => {
      updateSession(id, (s) => ({
        ...s,
        pinned: !s.pinned,
        updatedAt: new Date().toISOString(),
      }));
    },
    [updateSession]
  );

  const duplicateSession = useCallback(
    (id: string) => {
      const source = sessions.find((s) => s.id === id);
      if (!source) return;
      const copy: ChatSession = {
        id: uid(),
        title: `Copy — ${source.title}`,
        messages: source.messages.map((m) => ({ ...m, id: uid() })),
        updatedAt: new Date().toISOString(),
        pinned: false,
      };
      persist([copy, ...sessions]);
      setActiveSessionId(copy.id);
    },
    [persist, sessions]
  );

  const setMessageFeedback = useCallback(
    (messageId: string, feedback: MessageFeedback, feedbackNote?: string) => {
      if (!activeSessionId) return;
      patchMessage(activeSessionId, messageId, { feedback, feedbackNote });
    },
    [activeSessionId, patchMessage]
  );

  const setMessageComment = useCallback(
    (messageId: string, userComment: string) => {
      if (!activeSessionId) return;
      patchMessage(activeSessionId, messageId, {
        userComment: userComment.trim() || undefined,
      });
    },
    [activeSessionId, patchMessage]
  );

  const executeChatAction = useCallback(
    (messageId: string, actionId: string) => {
      if (!activeSessionId) return;
      const session = sessions.find((s) => s.id === activeSessionId);
      const message = session?.messages.find((m) => m.id === messageId);
      const action = message?.actions?.find((a) => a.id === actionId && a.status === 'pending');
      if (!action) return;

      switch (action.type) {
        case 'approve_request':
          flex.approveRequest(action.targetId);
          break;
        case 'reject_request':
          flex.rejectRequest(action.targetId);
          break;
        case 'publish_dataset':
          flex.publishDataset(action.targetId);
          break;
        case 'resolve_anomaly':
          flex.resolveAnomaly(action.targetId);
          break;
      }

      updateSession(activeSessionId, (s) => ({
        ...s,
        updatedAt: new Date().toISOString(),
        messages: s.messages.map((m) =>
          m.id === messageId
            ? {
                ...m,
                actions: m.actions?.map((a) =>
                  a.id === actionId ? { ...a, status: 'executed' as const } : a
                ),
              }
            : m
        ),
      }));
    },
    [activeSessionId, flex, sessions, updateSession]
  );

  return {
    sessions: sortedSessions,
    activeSession,
    activeSessionId,
    messages,
    isProcessing,
    knowledgeChunkCount: knowledge.length,
    lastAssistantMessageId,
    sendMessage,
    startNewChat,
    selectSession,
    deleteSession,
    stopStreaming,
    regenerateLastResponse,
    clearConversation,
    renameSession,
    togglePinSession,
    duplicateSession,
    setMessageFeedback,
    setMessageComment,
    executeChatAction,
  };
}

export const PHASE_LABELS: Record<AssistantStatus, string> = {
  idle: '',
  thinking: 'Thinking',
  retrieving: 'Searching knowledge base',
  analyzing: 'Analyzing sources',
  composing: 'Composing answer',
  streaming: 'Writing',
  complete: '',
  error: 'Something went wrong',
};
