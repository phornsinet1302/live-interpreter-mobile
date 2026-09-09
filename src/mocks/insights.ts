import { SessionInsights, SpeakerSummary, SuggestedNextStep, TranscriptEntry } from '@/types';

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'to', 'of',
  'in', 'on', 'for', 'with', 'that', 'this', 'it', 'we', 'you', 'i', 'be',
  'as', 'at', 'by', 'so', 'if', 'do', 'does', 'not', 'have', 'has', 'will',
]);

function topKeywords(text: string, max = 6): string[] {
  const counts = new Map<string, number>();
  text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 3 && !STOP_WORDS.has(w))
    .forEach((w) => counts.set(w, (counts.get(w) ?? 0) + 1));

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([word]) => word.charAt(0).toUpperCase() + word.slice(1));
}

/**
 * Produces a locally-generated preview of AI summary + suggested next steps
 * from whatever transcript is available. Not a real AI call — a stand-in
 * until a summarization backend is connected.
 */
export function generateInsights(entries: TranscriptEntry[], title?: string): SessionInsights {
  if (entries.length === 0) {
    return emptyInsights(title);
  }

  const bySpeaker = new Map<string, TranscriptEntry[]>();
  entries.forEach((e) => {
    const list = bySpeaker.get(e.speakerName) ?? [];
    list.push(e);
    bySpeaker.set(e.speakerName, list);
  });

  const allText = entries.map((e) => e.translated || e.original).join(' ');
  const keywords = topKeywords(allText);
  const speakerNames = [...bySpeaker.keys()];

  const speakerSummaries: SpeakerSummary[] = speakerNames.map((name) => {
    const lines = bySpeaker.get(name)!;
    const firstLine = lines[0]?.translated || lines[0]?.original || '';
    return {
      speakerName: name,
      lineCount: lines.length,
      summary:
        lines.length > 1
          ? `${name} contributed ${lines.length} lines, opening with "${firstLine.slice(0, 60)}${firstLine.length > 60 ? '…' : ''}".`
          : `${name} contributed one line: "${firstLine.slice(0, 80)}${firstLine.length > 80 ? '…' : ''}".`,
    };
  });

  const keyPoints = entries
    .slice(0, 5)
    .map((e) => (e.translated || e.original).trim())
    .filter(Boolean)
    .map((line) => (line.length > 120 ? `${line.slice(0, 119)}…` : line));

  const actionItems =
    keyPoints.length > 0
      ? keyPoints
          .slice(0, 3)
          .map((line, i) => `Follow up on: "${line.slice(0, 70)}${line.length > 70 ? '…' : ''}"`)
      : ['No clear action items were detected in this session.'];

  const summary = `${title ? `"${title}" — ` : ''}${speakerNames.length > 1 ? `${speakerNames.length} speakers` : '1 speaker'} covered ${entries.length} exchange${entries.length === 1 ? '' : 's'}${keywords.length ? `, mostly around ${keywords.slice(0, 3).join(', ')}` : ''}.`;

  const nextSteps: SuggestedNextStep[] = [
    {
      id: 'q1',
      kind: 'question',
      label: keywords[0]
        ? `Ask for more detail on "${keywords[0]}" before wrapping up.`
        : 'Ask a clarifying follow-up question before wrapping up.',
    },
    {
      id: 'u1',
      kind: 'unfinished',
      label:
        entries.length > 0
          ? `Revisit the last point raised by ${entries[0].speakerName}.`
          : 'No unfinished topics detected yet.',
    },
    {
      id: 'r1',
      kind: 'recommendation',
      label: speakerNames.length > 1
        ? 'Recommend scheduling a short recap with all participants.'
        : 'Recommend saving this session to History for later reference.',
    },
  ];

  return { summary, actionItems, keyPoints, keywords, speakerSummaries, nextSteps };
}

function emptyInsights(title?: string): SessionInsights {
  return {
    summary: `${title ? `"${title}" ` : 'This session '}has no transcript yet — start speaking to generate a summary.`,
    actionItems: [],
    keyPoints: [],
    keywords: [],
    speakerSummaries: [],
    nextSteps: [
      { id: 'r1', kind: 'recommendation', label: 'Start a conversation to see AI-generated next steps here.' },
    ],
  };
}
