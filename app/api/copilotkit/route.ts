import { NextRequest } from "next/server";
import { GroqAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import Groq from "groq-sdk";
import { getUserFromRequest } from "@/lib/auth-helpers";
import { getCopilotRuntime } from "@/lib/copilot-runtime";

export const POST = async (req: NextRequest) => {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return new Response("GROQ_API_KEY is not configured", { status: 500 });
  }
  const client = new Groq({ apiKey });
  const serviceAdapter = new GroqAdapter({
    model: "openai/gpt-oss-120b",
    groq: client as any,
  });
  const user = await getUserFromRequest(req.clone());
  if (!user) {
    return new Response("Unauthorized", { status: 401 });
  }
  const copilotRuntime = getCopilotRuntime({ user, url: req.url });
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime: copilotRuntime,
    serviceAdapter,
    endpoint: "/api/copilotkit",
  });

  return await handleRequest(req);
};
