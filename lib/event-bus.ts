import { EventEmitter } from "events";

type GlobalWithBus = typeof globalThis & { __appEventBus?: EventEmitter };

const g = globalThis as GlobalWithBus;

if (!g.__appEventBus) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);
  g.__appEventBus = emitter;
}

export const eventBus = g.__appEventBus;

export type TicketEvent = { type: "ticket:update"; id: string; ts: number };

export function publishTicketUpdated(id: string) {
  eventBus.emit("ticket:update", { type: "ticket:update", id, ts: Date.now() } satisfies TicketEvent);
}
