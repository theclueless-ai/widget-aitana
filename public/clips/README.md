# Clips de Aitana

Coloca aquí los tres clips de video del avatar. El widget los referencia por
nombre exacto:

- `escuchando.mp4` — estado por defecto: atenta, sutil (parpadeo, micro-asentimiento, mirando a cámara).
- `pensando.mp4` — mirada hacia arriba/lado, gesto contemplativo (mano al mentón).
- `hablando.mp4` — movimiento de boca natural y gestos; "habla genérica" que loopee mientras dura el streaming.

## Specs

- Misma identidad, encuadre, luz y fondo en los tres (si cambian, el corte se nota).
- Loop sin costura: primer frame ≈ último frame. Duración 3–6 s.
- H.264 `.mp4`, ~720p (o vertical si el widget es tipo burbuja). Opcional `.webm` como fallback.
- Muteados: el autoplay funciona sin bloqueo del navegador (`muted loop playsinline autoplay`).

Mientras no estén los clips, el escenario muestra el fondo negro del `.aitana__stage`.
