import { io, Socket } from 'socket.io-client';

const SOCKET_URL: string = process.env.EXPO_PUBLIC_SOCKET_URL ?? 'http://localhost:4000';

let mainSocket: Socket | null = null;
let subtitlesSocket: Socket | null = null;

/** Connects the authenticated main socket, used for conversation rooms and notifications. */
export function connectMainSocket(token: string): Socket {
  if (mainSocket?.connected) return mainSocket;
  mainSocket?.disconnect();
  mainSocket = io(SOCKET_URL, {
    auth: { token },
    transports: ['websocket'],
  });
  return mainSocket;
}

export function getMainSocket(): Socket | null {
  return mainSocket;
}

export function disconnectMainSocket(): void {
  mainSocket?.disconnect();
  mainSocket = null;
}

/**
 * Connects to the unauthenticated `/subtitles` namespace for a given share code —
 * the same path a second-display viewer uses to receive live caption pushes.
 * The server joins the socket to a room named by the code only after an
 * explicit `join` event (not a connection query param).
 */
export function connectSubtitlesSocket(code: string): Socket {
  subtitlesSocket?.disconnect();
  subtitlesSocket = io(`${SOCKET_URL}/subtitles`, {
    transports: ['websocket'],
  });
  subtitlesSocket.on('connect', () => {
    subtitlesSocket?.emit('join', code);
  });
  return subtitlesSocket;
}

export function disconnectSubtitlesSocket(): void {
  subtitlesSocket?.disconnect();
  subtitlesSocket = null;
}
