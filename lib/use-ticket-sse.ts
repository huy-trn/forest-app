import { useCallback } from "react";
import { useSse } from "./use-sse";
import type { TicketDetailEvent } from "@/types/ticket-events";

const parseEvent = (event: MessageEvent): TicketDetailEvent | null => {
  try {
    return JSON.parse(event.data) as TicketDetailEvent;
  } catch {
    return null;
  }
};

export function useTicketSse(ticketId: string, onMessage: (event?: TicketDetailEvent) => void) {
  const handle = useCallback(
    (event: MessageEvent) => {
      const payload = parseEvent(event);
      onMessage(payload ?? undefined);
    },
    [onMessage]
  );

  useSse(`/api/tickets/${ticketId}/sse`, handle, Boolean(ticketId));
}
