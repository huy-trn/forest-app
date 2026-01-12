import { useEffect } from "react";

type MessageHandler = (data: MessageEvent) => void;

/**
 * Generic SSE hook. Provide the endpoint and a message handler.
 * Reconnects with a simple backoff on errors.
 */
export function useSse(path: string, onMessage: MessageHandler, enabled = true) {
  useEffect(() => {
    if (!enabled) return;
    let es: EventSource | null = null;
    let retry: ReturnType<typeof setTimeout> | null = null;

    const connect = () => {
      if (es) {
        es.close();
        es = null;
      }
      es = new EventSource(path);
      es.onmessage = onMessage;
      es.onerror = () => {
        es?.close();
        es = null;
        if (retry) clearTimeout(retry);
        retry = setTimeout(connect, 2000);
      };
    };

    connect();
    return () => {
      if (retry) clearTimeout(retry);
      es?.close();
    };
  }, [path, onMessage, enabled]);
}
