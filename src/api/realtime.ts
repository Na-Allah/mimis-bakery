export type RealtimeConnectionStatus =
  | 'disconnected'
  | 'connecting'
  | 'connected'
  | 'reconnecting'
  | 'error'
  | 'unauthorized';

export interface RealtimeEvent {
  type: string;
  id: string | null;
  data: {
    resource: string;
    operation: string;
  };
}

export interface RealtimeManagerOptions {
  url: string;
  onEvent: (event: RealtimeEvent) => void;
  onStatus: (status: RealtimeConnectionStatus) => void;
  createSocket?: (url: string) => WebSocket;
  baseReconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  heartbeatIntervalMs?: number;
  random?: () => number;
}

export interface RealtimeRefreshHandlers {
  refreshCatalog: () => void;
  refreshSiteConfiguration: () => void;
  refreshOrders: () => void;
  refreshNotifications: () => void;
}

export function applyRealtimeEvent(
  event: RealtimeEvent,
  isAdmin: boolean,
  handlers: RealtimeRefreshHandlers,
): void {
  switch (event.data.resource) {
    case 'section':
    case 'category':
    case 'product':
      handlers.refreshCatalog();
      break;
    case 'site_configuration':
      handlers.refreshSiteConfiguration();
      break;
    case 'order':
      handlers.refreshOrders();
      if (isAdmin) handlers.refreshNotifications();
      break;
    case 'notification':
      if (isAdmin) {
        handlers.refreshNotifications();
        handlers.refreshOrders();
      }
      break;
    default:
      break;
  }
}

function isRealtimeEvent(value: unknown): value is RealtimeEvent {
  if (!value || typeof value !== 'object') return false;
  const event = value as { type?: unknown; id?: unknown; data?: unknown };
  const data = event.data as { resource?: unknown; operation?: unknown } | null | undefined;
  return typeof event.type === 'string'
    && (typeof event.id === 'string' || event.id === null)
    && data !== null
    && typeof data === 'object'
    && typeof data.resource === 'string'
    && typeof data.operation === 'string';
}

export function createRealtimeWebSocketUrl(): string {
  const apiUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');
  const base = apiUrl.replace(/\/api$/, '');

  if (/^https?:\/\//.test(base)) {
    return `${base.replace(/^http/, 'ws')}/ws/events/`;
  }

  const scheme = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  return `${scheme}//${window.location.host}/ws/events/`;
}

export class RealtimeManager {
  private socket: WebSocket | null = null;
  private reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  private heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  private stopped = true;
  private reconnectAttempts = 0;
  private hasConnected = false;

  constructor(private readonly options: RealtimeManagerOptions) {}

  connect(): void {
    if (!this.stopped) return;
    this.stopped = false;
    this.openSocket();
  }

  disconnect(): void {
    this.stopped = true;
    this.clearTimers();
    const socket = this.socket;
    this.socket = null;
    if (socket) {
      socket.onopen = null;
      socket.onmessage = null;
      socket.onerror = null;
      socket.onclose = null;
      socket.close(1000, 'Client disconnected');
    }
    this.options.onStatus('disconnected');
  }

  private openSocket(): void {
    if (this.stopped) return;
    this.options.onStatus(this.hasConnected ? 'reconnecting' : 'connecting');

    let socket: WebSocket;
    try {
      socket = (this.options.createSocket ?? ((url) => new WebSocket(url)))(this.options.url);
    } catch {
      this.options.onStatus('error');
      this.scheduleReconnect();
      return;
    }

    this.socket = socket;
    socket.onopen = () => {
      if (this.stopped || this.socket !== socket) return;
      this.hasConnected = true;
      this.reconnectAttempts = 0;
      this.options.onStatus('connected');
      this.startHeartbeat(socket);
    };
    socket.onmessage = (message) => {
      if (typeof message.data !== 'string') return;
      try {
        const event: unknown = JSON.parse(message.data);
        if (!isRealtimeEvent(event) || event.type === 'PONG') return;
        this.options.onEvent(event);
      } catch {
        // Ignore malformed frames and keep the connection available.
      }
    };
    socket.onerror = () => {
      if (!this.stopped) this.options.onStatus('error');
    };
    socket.onclose = (event) => {
      if (this.socket === socket) this.socket = null;
      this.clearHeartbeat();
      if (this.stopped) return;
      if (event.code === 4401) {
        this.options.onStatus('unauthorized');
        return;
      }
      this.scheduleReconnect();
    };
  }

  private scheduleReconnect(): void {
    if (this.stopped || this.reconnectTimer) return;
    this.reconnectAttempts += 1;
    const baseDelay = this.options.baseReconnectDelayMs ?? 500;
    const maxDelay = this.options.maxReconnectDelayMs ?? 30000;
    const exponentialDelay = Math.min(maxDelay, baseDelay * 2 ** (this.reconnectAttempts - 1));
    const jitter = 0.8 + (this.options.random ?? Math.random)() * 0.4;
    this.options.onStatus('reconnecting');
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = null;
      this.openSocket();
    }, Math.round(exponentialDelay * jitter));
  }

  private startHeartbeat(socket: WebSocket): void {
    this.clearHeartbeat();
    const interval = this.options.heartbeatIntervalMs ?? 25000;
    this.heartbeatTimer = setInterval(() => {
      if (socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify({ type: 'PING' }));
      }
    }, interval);
  }

  private clearHeartbeat(): void {
    if (this.heartbeatTimer) clearInterval(this.heartbeatTimer);
    this.heartbeatTimer = null;
  }

  private clearTimers(): void {
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = null;
    this.clearHeartbeat();
  }
}
