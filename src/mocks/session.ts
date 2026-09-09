import { Speaker } from '@/types';

const DEMO_NAMES: { name: string; language: string }[] = [
  { name: 'Dara', language: 'km' },
  { name: 'Maria', language: 'es' },
  { name: 'Kenji', language: 'ja' },
];

export function mockParticipants(hostName: string, hostLanguage: string): Speaker[] {
  return [
    { id: 'host', label: hostName, displayName: hostName, language: hostLanguage, isHost: true },
    ...DEMO_NAMES.filter((p) => p.language !== hostLanguage)
      .slice(0, 2)
      .map((p, i) => ({
        id: `demo-${i}`,
        label: p.name,
        displayName: p.name,
        language: p.language,
        isHost: false,
      })),
  ];
}

export function generateSessionCode(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

const DEMO_LINES: { original: string; translated: string }[] = [
  { original: 'Thanks for joining, can everyone hear me okay?', translated: '¿Gracias por unirse, todos pueden oírme bien?' },
  { original: 'Let’s start with a quick round of updates.', translated: 'ចាប់ផ្ដើមជាមួយការធ្វើបច្ចុប្បន្នភាពរហ័ស។' },
  { original: 'I think we should revisit the timeline next week.', translated: '来週タイムラインを見直すべきだと思います。' },
  { original: 'Sounds good, I will send the notes after this.', translated: 'ល្អហើយ ខ្ញុំនឹងផ្ញើកំណត់ត្រាបន្ទាប់ពីនេះ។' },
];

export function randomDemoLine(): { original: string; translated: string } {
  return DEMO_LINES[Math.floor(Math.random() * DEMO_LINES.length)];
}
