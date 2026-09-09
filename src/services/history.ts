import * as conversationsService from './conversations';
import * as messagesService from './messages';
import { HistoryItem, TranscriptEntry } from '@/types';

function toHistoryItem(conversation: Awaited<ReturnType<typeof conversationsService.getConversation>>): HistoryItem {
  return {
    id: conversation.id,
    meetingId: conversation.id,
    title: conversation.title,
    source: conversation.sourceLanguage,
    target: conversation.targetLanguage,
    entryCount: 0,
    createdAt: conversation.createdAt,
    favorite: conversation.favorite,
  };
}

export async function getHistory(): Promise<HistoryItem[]> {
  const conversations = await conversationsService.listConversations();
  return conversations.map(toHistoryItem);
}

export async function getTranscript(historyId: string): Promise<TranscriptEntry[]> {
  return messagesService.listMessages(historyId);
}

export async function deleteHistoryItem(historyId: string): Promise<void> {
  await conversationsService.deleteConversation(historyId);
}

export async function setFavorite(historyId: string, favorite: boolean): Promise<void> {
  await conversationsService.setFavorite(historyId, favorite);
}
