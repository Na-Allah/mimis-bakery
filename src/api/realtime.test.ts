import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  applyRealtimeEvent,
  RealtimeManager,
  type RealtimeEvent,
} from './realtime';

class FakeWebSocket {
  readyState = 0;
  onopen: ((event: Event) => void) | null = null;
  onmessage: ((event: MessageEvent) => void) | null = null;
  onerror: ((event: Event) => void) | null = null;
  onclose: ((event: CloseEvent) => void) | null = null;
  sent: string[] = [];

  open() {
    this.readyState = 1;
    this.onopen?.({} as Event);
  }

  receive(value: unknown) {
    this.onmessage?.({ data: JSON.stringify(value) } as MessageEvent);
  }

  close(code = 1000) {
    this.readyState = 3;
    this.onclose?.({ code } as CloseEvent);
  }

  send(value: string) {
    this.sent.push(value);
  }
}

const event = (resource: string, type = 'RESOURCE_UPDATED'): RealtimeEvent => ({
  type,
  id: 'resource-1',
  data: { resource, operation: 'updated' },
});

const delay = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

test('manager connects once and forwards valid events', (context) => {
  const sockets: FakeWebSocket[] = [];
  const received: RealtimeEvent[] = [];
  const statuses: string[] = [];
  const manager = new RealtimeManager({
    url: 'ws://localhost/ws/events/',
    createSocket: () => {
      const socket = new FakeWebSocket();
      sockets.push(socket);
      return socket as unknown as WebSocket;
    },
    onEvent: (message) => received.push(message),
    onStatus: (status) => statuses.push(status),
  });
  context.after(() => manager.disconnect());

  manager.connect();
  manager.connect();
  assert.equal(sockets.length, 1);
  assert.equal(statuses.at(-1), 'connecting');
  sockets[0].open();
  sockets[0].receive(event('product'));
  sockets[0].receive({ type: 42, data: {} });
  assert.deepEqual(received, [event('product')]);
  assert.equal(statuses.at(-1), 'connected');
});

test('manager reconnects after a dropped socket and sends heartbeat pings', async (context) => {
  const sockets: FakeWebSocket[] = [];
  const manager = new RealtimeManager({
    url: 'ws://localhost/ws/events/',
    baseReconnectDelayMs: 1,
    maxReconnectDelayMs: 2,
    heartbeatIntervalMs: 2,
    random: () => 0,
    createSocket: () => {
      const socket = new FakeWebSocket();
      sockets.push(socket);
      return socket as unknown as WebSocket;
    },
    onEvent: () => undefined,
    onStatus: () => undefined,
  });
  context.after(() => manager.disconnect());

  manager.connect();
  sockets[0].open();
  await delay(8);
  assert.equal(JSON.parse(sockets[0].sent[0]).type, 'PING');
  sockets[0].close(1006);
  await delay(20);
  assert.equal(sockets.length, 2);
});

test('manager stops retrying when the server rejects authentication', async (context) => {
  const sockets: FakeWebSocket[] = [];
  const statuses: string[] = [];
  const manager = new RealtimeManager({
    url: 'ws://localhost/ws/events/',
    baseReconnectDelayMs: 1,
    createSocket: () => {
      const socket = new FakeWebSocket();
      sockets.push(socket);
      return socket as unknown as WebSocket;
    },
    onEvent: () => undefined,
    onStatus: (status) => statuses.push(status),
  });
  context.after(() => manager.disconnect());

  manager.connect();
  sockets[0].close(4401);
  await delay(10);
  assert.equal(sockets.length, 1);
  assert.equal(statuses.at(-1), 'unauthorized');
});

test('resource events refresh only the state permitted for the receiving client', () => {
  const refreshed: string[] = [];
  const handlers = {
    refreshCatalog: () => refreshed.push('catalog'),
    refreshSiteConfiguration: () => refreshed.push('site'),
    refreshOrders: () => refreshed.push('orders'),
    refreshNotifications: () => refreshed.push('notifications'),
  };

  applyRealtimeEvent(event('product'), false, handlers);
  applyRealtimeEvent(event('order', 'ORDER_UPDATED'), false, handlers);
  applyRealtimeEvent(event('notification', 'NOTIFICATION_UPDATED'), false, handlers);
  assert.deepEqual(refreshed, ['catalog', 'orders']);

  applyRealtimeEvent(event('order', 'ORDER_UPDATED'), true, handlers);
  applyRealtimeEvent(event('notification', 'NOTIFICATION_UPDATED'), true, handlers);
  applyRealtimeEvent(event('site_configuration'), true, handlers);
  assert.deepEqual(refreshed, [
    'catalog', 'orders', 'orders', 'notifications', 'notifications', 'orders', 'site',
  ]);
});
