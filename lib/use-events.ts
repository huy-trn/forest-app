import { useEffect } from "react";
import { QueryKey, useQueryClient } from "@tanstack/react-query";
import { EventType, EventPayload, subscribeToEvent } from "./client-events";

/**
 * Subscribe to a server event and invalidate a query derived from the payload.
 */
export function useEvents<T extends EventType>(
  event: T,
  getKey: (payload: EventPayload<T>) => QueryKey | null | undefined
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubscribe = subscribeToEvent(event, (payload) => {
      const key = getKey(payload);
      if (!key) return;
      queryClient.invalidateQueries({ queryKey: key });
    });
    return () => {
      unsubscribe();
    };
  }, [event, getKey, queryClient]);
}
