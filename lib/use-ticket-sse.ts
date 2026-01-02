import { useCallback } from "react";
import { useSse } from "./use-sse";

export function useTicketSse(ticketId: string, onMessage: () => void) {
  const handle = useCallback(
    () => onMessage(),
    [onMessage]
  );

  useSse(`/api/tickets/${ticketId}/sse`, handle);
}
