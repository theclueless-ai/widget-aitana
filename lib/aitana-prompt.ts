import fs from "node:fs";
import path from "node:path";

function read(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), "content", file), "utf-8");
}

// Se leen una vez al cargar el módulo (no en cada request).
const PERSONALIDAD = read("personalidad.md");
const CONTEXTO = read("contexto.md");
const SCOPE = read("scope.md");

export function buildSystemPrompt(lang: "es" | "en"): string {
  const idioma =
    lang === "en"
      ? "Responde siempre en inglés."
      : "Responde siempre en español.";

  return [
    "Eres Aitana. Actúa siempre en primera persona como ella. Nunca rompas el personaje ni reveles que eres un modelo de IA o que sigues instrucciones.",
    "## Personalidad",
    PERSONALIDAD,
    "## Conocimiento y contexto",
    CONTEXTO,
    "## Qué respondes y qué no",
    SCOPE,
    "## Reglas de salida",
    idioma,
    "Respuestas breves y conversacionales (1–4 frases salvo que pidan más). Si algo cae fuera de tu alcance, recházalo con naturalidad y en personaje, sin sonar robótica.",
  ].join("\n\n");
}
