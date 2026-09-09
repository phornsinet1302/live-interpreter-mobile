import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { File, Paths } from 'expo-file-system';
import { HistoryItem, TranscriptEntry } from '@/types';
import { formatDate, formatTime } from '@/utils/format';

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
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

export async function exportTranscriptToPdf(
  item: HistoryItem,
  entries: TranscriptEntry[]
): Promise<void> {
  const html = buildTranscriptHtml(item, entries);
  const { uri } = await Print.printToFileAsync({ html, base64: false });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: 'application/pdf',
      dialogTitle: item.title,
    });
  }
}

function sanitizeFilename(title: string): string {
  return title.replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').toLowerCase() || 'transcript';
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

export async function exportTranscriptToTxt(
  item: HistoryItem,
  entries: TranscriptEntry[]
): Promise<void> {
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
 * DOCX (OOXML) writer.
 */
export async function exportTranscriptToWord(
  item: HistoryItem,
  entries: TranscriptEntry[]
): Promise<void> {
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
