import { useCallback } from "react";
import { useSse } from "./use-sse";
import type { TicketListEvent } from "@/types/ticket-events";

const parseEvent = (event: MessageEvent): TicketListEvent | null => {
  try {
    return JSON.parse(event.data) as TicketListEvent;
  } catch {
    return null;
  }
};

export function useTicketListSse(onMessage: (event?: TicketListEvent) => void) {
  const handle = useCallback(
    (event: MessageEvent) => {
      const payload = parseEvent(event);
      onMessage(payload ?? undefined);
    },
    [onMessage]
  );

  useSse("/api/tickets/sse", handle);
}
