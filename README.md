# Aitana Widget

Widget web embebible para chatear por **texto** con Aitana. El avatar son tres
clips de video muteados que se intercambian según el estado de la conversación
(`escuchando → pensando → hablando → escuchando`). No hay voz, ni STT/TTS, ni
WebRTC.

## Stack

- Next.js (App Router) + TypeScript
- Claude vía `@anthropic-ai/sdk` en streaming (`claude-sonnet-4-6` por defecto;
  cambiar a `claude-haiku-4-5` si se prioriza latencia/coste)
- Sin base de datos: el historial vive en el cliente
- Tres `.mp4` muteados en `public/clips`

## Setup

```bash
npm install
cp .env.local.example .env.local   # y rellena ANTHROPIC_API_KEY
npm run dev
```

Abre http://localhost:3000.

La API key **solo** vive en el servidor (`app/api/chat/route.ts`, `runtime = "nodejs"`).
Nunca se expone al navegador.

## Estructura

```
app/
  api/chat/route.ts   # proxy en streaming a Claude (server-side)
  layout.tsx
  globals.css
  page.tsx            # demo que monta el widget
components/
  AitanaWidget.tsx    # video + chat + máquina de estados
lib/
  aitana-prompt.ts    # arma el system prompt desde content/*.md
content/
  personalidad.md     # personalidad de Aitana (placeholder)
  contexto.md         # conocimiento y contexto (placeholder)
  scope.md            # qué responde / qué no (placeholder)
public/clips/         # escuchando.mp4, pensando.mp4, hablando.mp4
```

## Máquina de estados

- **escuchando** — por defecto y mientras el usuario escribe.
- **pensando** — desde que el usuario envía hasta el primer token del modelo
  (con un mínimo de 400 ms para evitar parpadeo).
- **hablando** — mientras el texto aparece en streaming.
- Al cerrar el stream → vuelve a **escuchando**.

## Clips

Faltan los tres `.mp4` reales en `public/clips/` (ver `public/clips/README.md`
para los nombres y specs). Mientras tanto, el escenario muestra su fondo negro.

## Personalización

- **Persona:** edita `content/personalidad.md`, `content/contexto.md` y
  `content/scope.md`. Se leen una vez al cargar el módulo del servidor.
- **Modelo / `max_tokens`:** en `app/api/chat/route.ts`.
- **Idioma:** el prop `lang` (`"es"` | `"en"`) en `<AitanaWidget />` enruta el
  idioma de salida.

## Embebido

Para un MVP, un `<iframe>` apuntando a la página del widget es lo más simple.
Cuidar tamaño responsive.
