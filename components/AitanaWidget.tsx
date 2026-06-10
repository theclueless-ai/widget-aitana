"use client";
import { useState } from "react";

type State = "escuchando" | "pensando" | "hablando";
type Msg = { role: "user" | "assistant"; content: string };

const CLIPS: Record<State, string> = {
  escuchando: "/clips/escuchando.mp4",
  pensando: "/clips/pensando.mp4",
  hablando: "/clips/hablando.mp4",
};

export default function AitanaWidget() {
  const [state, setState] = useState<State>("escuchando");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    setBusy(true);
    setInput("");

    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages([...next, { role: "assistant", content: "" }]);
    setState("pensando");
    const pensandoStart = Date.now();

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next }),
      });
      if (!res.body) throw new Error("sin stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let first = true;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });

        if (first && chunk) {
          first = false;
          // garantiza que "pensando" se vea al menos 400 ms (evita parpadeo)
          const elapsed = Date.now() - pensandoStart;
          if (elapsed < 400)
            await new Promise((r) => setTimeout(r, 400 - elapsed));
          setState("hablando");
        }

        setMessages((prev) => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          copy[copy.length - 1] = {
            role: "assistant",
            content: last.content + chunk,
          };
          return copy;
        });
      }
    } catch {
      setMessages((prev) => {
        const copy = [...prev];
        copy[copy.length - 1] = {
          role: "assistant",
          content: "Perdona, tuve un problema. ¿Lo intentamos de nuevo?",
        };
        return copy;
      });
    } finally {
      setState("escuchando");
      setBusy(false);
    }
  }

  return (
    <div className="aitana">
      <div className="aitana__stage">
        {(Object.keys(CLIPS) as State[]).map((s) => (
          <video
            key={s}
            src={CLIPS[s]}
            muted
            loop
            playsInline
            autoPlay
            preload="auto"
            className="aitana__video"
            style={{ opacity: state === s ? 1 : 0 }}
          />
        ))}
      </div>

      <div className="aitana__chat">
        {messages.map((m, i) => (
          <div key={i} className={`aitana__msg aitana__msg--${m.role}`}>
            {m.content ||
              (m.role === "assistant" && state === "pensando" ? "…" : "")}
          </div>
        ))}
      </div>

      <div className="aitana__input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
          placeholder="Escríbele a Aitana…"
          disabled={busy}
        />
        <button onClick={send} disabled={busy || !input.trim()}>
          Enviar
        </button>
      </div>
    </div>
  );
}
