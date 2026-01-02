import { useCallback } from "react";
import { useSse } from "./use-sse";

export function useTicketListSse(onMessage: () => void) {
  const handle = useCallback(
    () => onMessage(),
    [onMessage]
  );

  useSse("/api/tickets/sse", handle);
}
