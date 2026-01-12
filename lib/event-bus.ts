import { EventEmitter } from "events";
import type { TicketDetailEvent, TicketListEvent } from "@/types/ticket-events";

type GlobalWithBus = typeof globalThis & { __appEventBus?: EventEmitter };

const g = globalThis as GlobalWithBus;

if (!g.__appEventBus) {
  const emitter = new EventEmitter();
  emitter.setMaxListeners(0);
  g.__appEventBus = emitter;
}

export const eventBus = g.__appEventBus;

export type TicketEvent = TicketListEvent | TicketDetailEvent;

export function publishTicketUpdated(id: string, userIds?: string[]) {
  const ts = Date.now();
  eventBus.emit("ticket:list", { type: "ticket:list", ts, userIds } satisfies TicketEvent);
  eventBus.emit("ticket:detail", { type: "ticket:detail", id, ts, userIds } satisfies TicketEvent);
}
