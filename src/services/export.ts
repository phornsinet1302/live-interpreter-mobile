import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import client from './api';
import { HistoryItem, TranscriptEntry } from '@/types';
import { formatDate, formatTime } from '@/utils/format';

export type ExportFormat = 'pdf' | 'docx' | 'txt';

const MIME: Record<ExportFormat, string> = {
  pdf: 'application/pdf',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  txt: 'text/plain',
};

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'transcript';
}

function buildTranscriptHtml(item: HistoryItem, entries: TranscriptEntry[]): string {
  const rows = entries
    .map(
      (entry) => `
        <div class="entry">
          <div class="meta">${escapeHtml(entry.speakerName)} · ${formatTime(entry.timestamp)}</div>
          <div class="original">${escapeHtml(entry.original)}</div>
          <div class="translated">${escapeHtml(entry.translated)}</div>
        </div>`
    )
    .join('');

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <style>
          body { font-family: -apple-system, Roboto, sans-serif; color: #0B1221; padding: 24px; }
          h1 { font-size: 20px; margin-bottom: 4px; }
          .subtitle { color: #6B7690; font-size: 13px; margin-bottom: 24px; }
          .entry { margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #E5E7EB; }
          .meta { color: #6B7690; font-size: 11px; margin-bottom: 4px; }
          .original { color: #6B7690; font-style: italic; font-size: 13px; margin-bottom: 2px; }
          .translated { font-size: 15px; font-weight: 600; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(item.title)}</h1>
        <div class="subtitle">
          ${item.source.toUpperCase()} → ${item.target.toUpperCase()} · ${formatDate(item.createdAt)}
        </div>
        ${rows || '<p>No transcript entries.</p>'}
      </body>
    </html>
  `;
}

function buildTranscriptText(item: HistoryItem, entries: TranscriptEntry[]): string {
  const header = `${item.title}\n${item.source.toUpperCase()} -> ${item.target.toUpperCase()} - ${formatDate(item.createdAt)}\n${'='.repeat(40)}\n\n`;
  const body = entries
    .map(
      (entry) =>
        `${entry.speakerName} - ${formatTime(entry.timestamp)}\n${entry.original}\n${entry.translated}\n`
    )
    .join('\n');
  return header + (body || 'No transcript entries.');
}

async function exportTranscriptToPdf(item: HistoryItem, entries: TranscriptEntry[]): Promise<void> {
  const html = buildTranscriptHtml(item, entries);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: item.title,
    });
  }
}

async function exportTranscriptToTxt(item: HistoryItem, entries: TranscriptEntry[]): Promise<void> {
  const text = buildTranscriptText(item, entries);
  const file = new File(Paths.cache, `${sanitizeFilename(item.title)}.txt`);
  if (file.exists) file.delete();
  file.create();
  file.write(text);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'text/plain',
      dialogTitle: item.title,
    });
  }
}

/**
 * Word can open an HTML document saved with a .doc extension, so this reuses
 * the PDF's HTML build to produce an editable "Word" export without a real
 * DOCX (OOXML) writer — used only as the fallback when the backend export
 * (which produces a real .docx) is unreachable.
 */
async function exportTranscriptToWord(item: HistoryItem, entries: TranscriptEntry[]): Promise<void> {
  const html = buildTranscriptHtml(item, entries);
  const file = new File(Paths.cache, `${sanitizeFilename(item.title)}.doc`);
  if (file.exists) file.delete();
  file.create();
  file.write(html);

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(file.uri, {
      mimeType: 'application/msword',
      dialogTitle: item.title,
    });
  }
}

async function localExportFallback(
  item: HistoryItem,
  entries: TranscriptEntry[],
  format: ExportFormat
): Promise<void> {
  if (format === 'pdf') await exportTranscriptToPdf(item, entries);
  else if (format === 'txt') await exportTranscriptToTxt(item, entries);
  else await exportTranscriptToWord(item, entries);
}

interface BackendExport {
  id?: string;
  _id?: string;
  status?: string;
}

async function requestExport(
  conversationId: string,
  format: ExportFormat
): Promise<string> {
  const { data } = await client.post<BackendExport>(`/conversations/${conversationId}/exports`, {
    type: 'transcript',
    format,
  });
  const id = data.id ?? data._id;
  if (!id) throw new Error('Export request did not return an id');
  return id;
}

async function downloadExport(id: string, filename: string): Promise<string> {
  const response = await client.get<ArrayBuffer>(`/exports/${id}/download`, {
    responseType: 'arraybuffer',
  });
  const file = new File(Paths.cache, filename);
  if (file.exists) file.delete();
  file.create();
  file.write(new Uint8Array(response.data));
  return file.uri;
}

/**
 * Exports a transcript via the backend (real PDF/DOCX/TXT generation), falling
 * back to local generation if the conversation isn't backend-persisted or the
 * request fails.
 */
export async function exportTranscript(
  item: HistoryItem,
  entries: TranscriptEntry[],
  format: ExportFormat
): Promise<void> {
  const conversationId = item.meetingId ?? item.id;
  try {
    const exportId = await requestExport(conversationId, format);
    const uri = await downloadExport(exportId, `${sanitizeFilename(item.title)}.${format}`);
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(uri, { mimeType: MIME[format], dialogTitle: item.title });
    }
  } catch {
    await localExportFallback(item, entries, format);
  }
}
