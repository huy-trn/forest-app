import { NextResponse } from "next/server";
import { eventBus, TicketEvent } from "../../../lib/event-bus";
import { getUserFromRequest } from "../../../lib/auth-helpers";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const encoder = new TextEncoder();
  let closed = false;
  let keepAlive: NodeJS.Timeout | null = null;
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;

  const close = () => {
    if (closed) return;
    closed = true;
    if (keepAlive) {
      clearInterval(keepAlive);
      keepAlive = null;
    }
    eventBus.off("ticket:list", onTicketUpdate);
    eventBus.off("ticket:detail", onTicketUpdate);
    try {
      controllerRef?.close();
    } catch {
      // ignore double-close
    }
    controllerRef = null;
  };

  const safeEnqueue = (chunk: string) => {
    if (closed || !controllerRef) return;
    try {
      controllerRef.enqueue(encoder.encode(chunk));
    } catch {
      close();
    }
  };

      const onTicketUpdate = (payload: TicketEvent) => {
        if (user.role !== "admin") {
          const allowedIds: string[] | undefined = payload?.userIds;
          if (allowedIds && !allowedIds.includes(user.sub)) {
            return;
          }
        }
        safeEnqueue(`data: ${JSON.stringify(payload)}\n\n`);
      };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;

      keepAlive = setInterval(() => {
        safeEnqueue(":\n\n");
      }, 15000);

      eventBus.on("ticket:list", onTicketUpdate);
      eventBus.on("ticket:detail", onTicketUpdate);

      const signal = (request as any).signal as AbortSignal | undefined;
      if (signal) {
        if (signal.aborted) {
          close();
        } else {
          signal.addEventListener("abort", close, { once: true });
        }
      }

      safeEnqueue("retry: 5000\n\n");
      safeEnqueue('event: ping\ndata: "ok"\n\n');

      return close;
    },
    cancel() {
      close();
    },
  });

  return new NextResponse(stream, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      Connection: "keep-alive",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
