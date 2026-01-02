import { EventEmitter } from "events";

type GlobalWithBus = typeof globalThis & { __appEventBus?: EventEmitter };

const g = globalThis as GlobalWithBus;

if (!g.__appEventBus) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);
  g.__appEventBus = emitter;
}

export const eventBus = g.__appEventBus;

export type TicketEvent =
  | { type: "ticket:list"; ts: number; userIds?: string[] }
  | { type: "ticket:detail"; id: string; ts: number; userIds?: string[] };

export function publishTicketUpdated(id: string, userIds?: string[]) {
  const ts = Date.now();
  eventBus.emit("ticket:list", { type: "ticket:list", ts, userIds } satisfies TicketEvent);
  eventBus.emit("ticket:detail", { type: "ticket:detail", id, ts, userIds } satisfies TicketEvent);
}
