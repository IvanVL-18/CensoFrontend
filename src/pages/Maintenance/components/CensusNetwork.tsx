import { useEffect, useRef } from "react";

/**
 * Red animada del censo: un nodo central (el sistema) rodeado de anillos de
 * nodos (instituciones / dependencias). Los pulsos viajan hacia el centro
 * representando respuestas capturadas y un barrido tipo radar "registra" los
 * nodos al pasar.
 */

type Node = { ring: number; angle: number; parent: number | null };

// Cantidad de nodos por anillo (de adentro hacia afuera)
const RINGS = [6, 12, 20];
const RING_RADII = [0.36, 0.64, 0.92];

const PALETTE = {
  ring: "rgba(221, 201, 163, 0.18)",
  link: "rgba(221, 201, 163, 0.22)",
  node: "#DDC9A3",
  nodeActive: "#FFFFFF",
  glow: "rgba(188, 149, 91, 0.45)",
  pulse: "#F3E2BF",
  sweep: "rgba(188, 149, 91, 0.22)",
  hubInner: "rgba(188, 149, 91, 0.35)",
  hubOuter: "rgba(105, 27, 49, 0)",
};

const TAU = Math.PI * 2;

// Construye los nodos y enlaza cada uno con el nodo más cercano del anillo interior
const buildNodes = (): Node[] => {
  const nodes: Node[] = [];
  const ringStart: number[] = [];

  RINGS.forEach((count, ring) => {
    ringStart.push(nodes.length);
    const offset = ring * 0.35;

    for (let k = 0; k < count; k++) {
      const angle = offset + (k / count) * TAU;
      let parent: number | null = null;

      if (ring > 0) {
        const prevStart = ringStart[ring - 1];
        const prevCount = RINGS[ring - 1];
        let best = Infinity;

        for (let j = 0; j < prevCount; j++) {
          const other = nodes[prevStart + j];
          const diff = Math.abs(
            Math.atan2(Math.sin(angle - other.angle), Math.cos(angle - other.angle)),
          );
          if (diff < best) {
            best = diff;
            parent = prevStart + j;
          }
        }
      }

      nodes.push({ ring, angle, parent });
    }
  });

  return nodes;
};

export default function CensusNetwork({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");

    if (!canvas || !ctx) return;

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    const nodes = buildNodes();
    const pulses = nodes.map((_, i) => ({
      offset: (i * 0.37) % 1,
      speed: 0.18 + ((i * 7) % 5) * 0.04,
    }));

    let width = 0;
    let height = 0;
    let frame = 0;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const observer = new ResizeObserver(resize);
    observer.observe(canvas);
    resize();

    const draw = (time: number) => {
      const t = time / 1000;
      const spin = reducedMotion ? 0 : t * 0.06;
      const sweepAngle = reducedMotion ? -Math.PI / 2 : t * 0.9;
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * 0.46;

      const position = (i: number) => {
        const n = nodes[i];
        const radius = RING_RADII[n.ring] * r;
        const a = n.angle + spin;
        return [cx + Math.cos(a) * radius, cy + Math.sin(a) * radius] as const;
      };

      // Qué tan "recién registrado" está un nodo según el barrido (1 = justo ahora)
      const sweepIntensity = (angle: number) => {
        const behind = (((sweepAngle - angle) % TAU) + TAU) % TAU;
        return Math.max(0, 1 - behind / (Math.PI * 0.9));
      };

      ctx.clearRect(0, 0, width, height);

      // Resplandor central
      const hub = ctx.createRadialGradient(cx, cy, 0, cx, cy, r * 0.5);
      hub.addColorStop(0, PALETTE.hubInner);
      hub.addColorStop(1, PALETTE.hubOuter);
      ctx.fillStyle = hub;
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.5, 0, TAU);
      ctx.fill();

      // Barrido tipo radar
      if (typeof ctx.createConicGradient === "function") {
        const sweep = ctx.createConicGradient(sweepAngle - Math.PI * 0.9, cx, cy);
        sweep.addColorStop(0, "rgba(188, 149, 91, 0)");
        sweep.addColorStop(0.45, PALETTE.sweep);
        sweep.addColorStop(0.45, "rgba(188, 149, 91, 0)");
        sweep.addColorStop(1, "rgba(188, 149, 91, 0)");
        ctx.fillStyle = sweep;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, TAU);
        ctx.fill();
      }

      // Anillos
      ctx.setLineDash([2, 6]);
      ctx.lineWidth = 1;
      ctx.strokeStyle = PALETTE.ring;
      RING_RADII.forEach((rr) => {
        ctx.beginPath();
        ctx.arc(cx, cy, rr * r, 0, TAU);
        ctx.stroke();
      });
      ctx.setLineDash([]);

      // Enlaces
      ctx.strokeStyle = PALETTE.link;
      ctx.lineWidth = 1;
      nodes.forEach((n, i) => {
        const [x1, y1] = position(i);
        const [x2, y2] = n.parent === null ? [cx, cy] : position(n.parent);
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      });

      // Pulsos que viajan hacia el centro (respuestas capturadas)
      if (!reducedMotion) {
        nodes.forEach((n, i) => {
          const progress = (t * pulses[i].speed + pulses[i].offset) % 1;
          const [x1, y1] = position(i);
          const [x2, y2] = n.parent === null ? [cx, cy] : position(n.parent);
          const x = x1 + (x2 - x1) * progress;
          const y = y1 + (y2 - y1) * progress;

          ctx.beginPath();
          ctx.arc(x, y, 1.8, 0, TAU);
          ctx.fillStyle = PALETTE.pulse;
          ctx.shadowColor = PALETTE.pulse;
          ctx.shadowBlur = 8;
          ctx.globalAlpha = Math.sin(Math.PI * progress);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1;
        });
      }

      // Nodos
      nodes.forEach((n, i) => {
        const [x, y] = position(i);
        const intensity = sweepIntensity(n.angle + spin);
        const size = 2.2 + (2 - n.ring * 0.4) * 0.6;

        if (intensity > 0) {
          ctx.beginPath();
          ctx.arc(x, y, size + 3 + (1 - intensity) * 8, 0, TAU);
          ctx.strokeStyle = PALETTE.glow;
          ctx.globalAlpha = intensity;
          ctx.lineWidth = 1.5;
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        ctx.beginPath();
        ctx.arc(x, y, size, 0, TAU);
        ctx.fillStyle = intensity > 0.6 ? PALETTE.nodeActive : PALETTE.node;
        ctx.globalAlpha = 0.55 + 0.45 * intensity;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // Nodo central
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.13, 0, TAU);
      ctx.fillStyle = "#691B31";
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = PALETTE.node;
      ctx.stroke();

      frame = requestAnimationFrame(draw);
    };

    frame = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}
