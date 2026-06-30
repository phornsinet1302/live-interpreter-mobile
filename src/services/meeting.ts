import client from './api';
import { Meeting, Participant } from '@/types';

export async function createMeeting(title: string): Promise<Meeting> {
  const { data } = await client.post<Meeting>('/meetings', { title });
  return data;
}

export async function joinMeeting(
  code: string,
  language: string
): Promise<Meeting> {
  const { data } = await client.post<Meeting>(`/meetings/${code}/join`, {
    language,
  });
  return data;
}

export async function leaveMeeting(meetingId: string): Promise<void> {
  await client.post(`/meetings/${meetingId}/leave`);
}

export async function getMeeting(meetingId: string): Promise<Meeting> {
  const { data } = await client.get<Meeting>(`/meetings/${meetingId}`);
  return data;
}

export async function getParticipants(
  meetingId: string
): Promise<Participant[]> {
  const { data } = await client.get<Participant[]>(
    `/meetings/${meetingId}/participants`
  );
  return data;
}

export async function endMeeting(meetingId: string): Promise<void> {
  await client.post(`/meetings/${meetingId}/end`);
}
