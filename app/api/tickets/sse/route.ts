import { NextResponse } from "next/server";
import { eventBus } from "@/lib/event-bus";
import { requireUser, isAdminLike } from "@/lib/api-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request) {
  const { user, response } = await requireUser(request);
  if (!user) return response!;

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
    eventBus.off("ticket:list", onListUpdate);
    try {
      controllerRef?.close();
    } catch {
      // ignore
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

  const onListUpdate = (payload: any) => {
    if (!isAdminLike(user)) {
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

      eventBus.on("ticket:list", onListUpdate);

      const signal = (request as any).signal as AbortSignal | undefined;
      if (signal) {
        if (signal.aborted) close();
        else signal.addEventListener("abort", close, { once: true });
      }

      safeEnqueue("retry: 5000\n\n");
      safeEnqueue(`event: connected\ndata: "ok"\n\n`);

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
