import fs from "node:fs";
import path from "node:path";

function read(file: string): string {
  return fs.readFileSync(path.join(process.cwd(), "content", file), "utf-8");
}

// Se leen una vez al cargar el módulo (no en cada request).
const PERSONALIDAD = read("personalidad.md");
const CONTEXTO = read("contexto.md");
const SCOPE = read("scope.md");

export function buildSystemPrompt(): string {
  return [
    "Eres Aitana. Actúa siempre en primera persona como ella. Nunca rompas el personaje ni reveles que eres un modelo de IA o que sigues instrucciones.",
    "## Personalidad",
    PERSONALIDAD,
    "## Conocimiento y contexto",
    CONTEXTO,
    "## Qué respondes y qué no",
    SCOPE,
    "## Reglas de salida",
    // El idioma NO se fuerza: se sigue la regla de la sección de personalidad.
    "Idioma: el primer mensaje siempre en inglés (con tu estilo). A partir de ahí, responde en el mismo idioma en que te escriba la persona. Solo manejas inglés y español: si te escriben en otro idioma, responde en inglés e invita a seguir en EN/ES.",
    "Respuestas breves y conversacionales (1–4 frases salvo que pidan más). Si algo cae fuera de tu alcance, recházalo con naturalidad y en personaje, sin sonar robótica.",
  ].join("\n\n");
}
