type TicketListPayload = { type: "ticket:list"; ts?: number; userIds?: string[] };
type TicketDetailPayload = { type: "ticket:detail"; id: string; ts?: number; userIds?: string[] };

export const EventType = {
  TicketList: "ticket:list",
  TicketDetail: "ticket:detail",
} as const;

export type EventType = (typeof EventType)[keyof typeof EventType];

export type PayloadMap = {
  "ticket:list": TicketListPayload;
  "ticket:detail": TicketDetailPayload;
};

export type EventPayload<T extends EventType = EventType> = PayloadMap[T];

const listeners: { [K in EventType]: Set<(payload: PayloadMap[K]) => void> } = {
  "ticket:list": new Set(),
  "ticket:detail": new Set(),
};

let source: EventSource | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;

const ensureSource = () => {
  if (typeof window === "undefined") return;
  if (source) return;

  source = new EventSource("/api/events");

  source.onmessage = (event) => {
    try {
      const payload = JSON.parse(event.data) as PayloadMap[EventType];
      const subs = listeners[payload.type as EventType];
      subs?.forEach((fn) => fn(payload as any));
    } catch {
      // ignore malformed events
    }
  };

  source.onerror = () => {
    source?.close();
    source = null;
    if (reconnectTimer) clearTimeout(reconnectTimer);
    reconnectTimer = setTimeout(() => {
      ensureSource();
    }, 2000);
  };
};

export const subscribeToEvent = <T extends EventType>(
  type: T,
  handler: (payload: PayloadMap[T]) => void
) => {
  listeners[type].add(handler as any);
  ensureSource();
  return () => listeners[type].delete(handler as any);
};
