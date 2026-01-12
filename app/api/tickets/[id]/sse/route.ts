import { NextResponse } from "next/server";
import { eventBus } from "@/lib/event-bus";
import { requireTicketAccess, isAdminLike } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const { user, response } = await requireTicketAccess(request, params.id);
  if (!user || response) return response!;
  const ticketId = params.id;
  if (!ticketId) return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });

  // Access already checked by requireTicketAccess.

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
    eventBus.off("ticket:detail", onTicketUpdate);
    try {
      controllerRef?.close();
    } catch {
      // ignore double close
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

  const onTicketUpdate = (payload: any) => {
    if (payload?.id !== ticketId) return;
    safeEnqueue(`data: ${JSON.stringify(payload)}\n\n`);
  };

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controllerRef = controller;
      keepAlive = setInterval(() => {
        safeEnqueue(":\n\n");
      }, 15000);
      eventBus.on("ticket:detail", onTicketUpdate);

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
