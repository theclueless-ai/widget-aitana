import Anthropic from "@anthropic-ai/sdk";
import { buildSystemPrompt } from "@/lib/aitana-prompt";

export const runtime = "nodejs"; // necesita Node (fs + SDK), no Edge

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

type Msg = { role: "user" | "assistant"; content: string };

// Historial máximo que se reenvía al modelo (evita que crezca sin límite).
const MAX_HISTORY = 20;

export async function POST(req: Request) {
  const { messages } = (await req.json()) as {
    messages: Msg[];
  };

  // El modelo no tiene memoria entre llamadas: mandamos el historial,
  // pero truncado a los últimos mensajes para acotar el coste.
  const trimmed = (messages ?? []).slice(-MAX_HISTORY);

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const claude = anthropic.messages.stream({
          model: "claude-sonnet-4-6",
          max_tokens: 1024,
          system: buildSystemPrompt(),
          messages: trimmed,
        });

        for await (const event of claude) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            controller.enqueue(encoder.encode(event.delta.text));
          }
        }
      } catch (err) {
        // Log completo en el servidor (terminal de `npm run dev`) para diagnosticar.
        console.error("[/api/chat] error al llamar a Claude:", err);
        const detail = err instanceof Error ? err.message : String(err);
        controller.enqueue(
          encoder.encode(`\n[error al generar respuesta] ${detail}`),
        );
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  });
}
