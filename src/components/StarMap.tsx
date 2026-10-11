import { useEffect, useRef, useState, useCallback } from 'react';
import type { McParkMod } from '../utils/mcpark-parser';
import { UI } from '../i18n';

interface StarMapProps {
  mods: McParkMod[];
  resolvedIds: Set<string>;
  onSelectMod: (id: string | null) => void;
  selectedModId: string | null;
}

interface SimNode {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mod: McParkMod;
  degree: number;
  pinned: boolean;
}

const CAT_COLOR: Record<string, [number, number, number]> = {
  library: [96, 165, 250], redstone: [248, 113, 113], performance: [52, 211, 153],
  automation: [251, 191, 36], storage: [167, 139, 250], building: [34, 211, 238],
  ui: [129, 140, 248], visual: [244, 114, 182], network: [45, 212, 191],
  world: [74, 222, 128], resourcepack: [251, 146, 60], shaderpack: [192, 132, 252],
  other: [113, 113, 120], uncategorized: [113, 113, 120],
};

export default function StarMap({ mods, resolvedIds, onSelectMod, selectedModId }: StarMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const nodesRef = useRef<SimNode[]>([]);
  const edgesRef = useRef<[number, number][]>([]);
  const animRef = useRef(0);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{ nodeIdx: number; isPanning: boolean; lastX: number; lastY: number }>({
    nodeIdx: -1, isPanning: false, lastX: 0, lastY: 0,
  });
  const sizeRef = useRef({ w: 800, h: 600 });
  const hoveredRef = useRef<string | null>(null);
  const selectedRef = useRef<string | null>(null);
  const resolvedRef = useRef(resolvedIds);
  const [, forceRender] = useState(0);

  hoveredRef.current = selectedModId;
  resolvedRef.current = resolvedIds;
  selectedRef.current = selectedModId;

  const initGraph = useCallback(() => {
    const { w, h } = sizeRef.current;
    const degreeMap = new Map<string, number>();
    mods.forEach(m => degreeMap.set(m.id, 0));
    for (const mod of mods) {
      for (const dep of mod.dependencies) {
        degreeMap.set(mod.id, (degreeMap.get(mod.id) || 0) + 1);
        if (degreeMap.has(dep)) degreeMap.set(dep, degreeMap.get(dep)! + 1);
      }
    }

    const idToIdx = new Map<string, number>();
    const nodes: SimNode[] = mods.map((mod, i) => {
      idToIdx.set(mod.id, i);
      const angle = (i / mods.length) * Math.PI * 2;
      const r = Math.min(w, h) * 0.25;
      return {
        id: mod.id,
        x: w / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 40,
        y: h / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 40,
        vx: 0, vy: 0,
        mod,
        degree: degreeMap.get(mod.id) || 0,
        pinned: false,
      };
    });

    const edges: [number, number][] = [];
    for (const mod of mods) {
      const srcIdx = idToIdx.get(mod.id);
      if (srcIdx === undefined) continue;
      for (const dep of mod.dependencies) {
        const tgtIdx = idToIdx.get(dep);
        if (tgtIdx !== undefined) edges.push([srcIdx, tgtIdx]);
      }
    }

    nodesRef.current = nodes;
    edgesRef.current = edges;
  }, [mods]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const dpr = window.devicePixelRatio || 1;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      sizeRef.current = { w: rect.width, h: rect.height };
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      canvas.style.width = rect.width + 'px';
      canvas.style.height = rect.height + 'px';
    };
    resize();

    if (nodesRef.current.length === 0) initGraph();

    const ctx = canvas.getContext('2d')!;

    const stars: [number, number, number][] = [];
    for (let i = 0; i < 150; i++) {
      stars.push([Math.random() * sizeRef.current.w, Math.random() * sizeRef.current.h, Math.random() * 0.4 + 0.05]);
    }

    const particles: { edge: number; t: number; speed: number }[] = [];
    edgesRef.current.forEach((_, i) => {
      if (Math.random() < 0.4) {
        particles.push({ edge: i, t: Math.random(), speed: 0.001 + Math.random() * 0.003 });
      }
    });

    let alpha = 1;

    const simulate = () => {
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const { w, h } = sizeRef.current;
      if (nodes.length === 0) return;

      alpha = Math.max(0.005, alpha * 0.998);

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let dist2 = dx * dx + dy * dy;
          if (dist2 < 1) dist2 = 1;
          const dist = Math.sqrt(dist2);

          const chargeForce = (-25 * alpha) / dist2;
          const cfx = (dx / dist) * chargeForce;
          const cfy = (dy / dist) * chargeForce;
          if (!a.pinned) { a.vx -= cfx; a.vy -= cfy; }
          if (!b.pinned) { b.vx += cfx; b.vy += cfy; }

          const rA = Math.max(3, Math.min(10, 3 + a.degree * 1.2));
          const rB = Math.max(3, Math.min(10, 3 + b.degree * 1.2));
          const minDist = rA + rB + 6;
          if (dist < minDist) {
            const overlap = (minDist - dist) * 0.5;
            const ox = (dx / dist) * overlap;
            const oy = (dy / dist) * overlap;
            if (!a.pinned) { a.x -= ox; a.y -= oy; }
            if (!b.pinned) { b.x += ox; b.y += oy; }
          }
        }
      }

      for (const [si, ti] of edges) {
        const s = nodes[si], t = nodes[ti];
        if (!s || !t) continue;
        const dx = t.x - s.x, dy = t.y - s.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 80) * 0.004 * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        if (!s.pinned) { s.vx += fx; s.vy += fy; }
        if (!t.pinned) { t.vx -= fx; t.vy -= fy; }
      }

      for (const n of nodes) {
        if (n.pinned) continue;
        n.vx += (w / 2 - n.x) * 0.0005 * alpha;
        n.vy += (h / 2 - n.y) * 0.0005 * alpha;
        n.vx *= 0.55;
        n.vy *= 0.55;
        const speed = Math.sqrt(n.vx * n.vx + n.vy * n.vy);
        if (speed > 8) { n.vx = (n.vx / speed) * 8; n.vy = (n.vy / speed) * 8; }
        n.x += n.vx;
        n.y += n.vy;
        n.x = Math.max(15, Math.min(w - 15, n.x));
        n.y = Math.max(15, Math.min(h - 15, n.y));
      }
    };

    const draw = () => {
      simulate();
      const { w, h } = sizeRef.current;
      const t = transformRef.current;
      const nodes = nodesRef.current;
      const edges = edgesRef.current;
      const hov = hoveredRef.current;
      const sel = selectedRef.current;
      const res = resolvedRef.current;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      for (const [sx, sy, sb] of stars) {
        ctx.fillStyle = `rgba(255,255,255,${sb})`;
        ctx.fillRect(sx, sy, 1, 1);
      }

      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      for (const [si, ti] of edges) {
        const s = nodes[si], nd = nodes[ti];
        if (!s || !nd) continue;
        const isHl = hov === s.id || hov === nd.id || sel === s.id || sel === nd.id;
        ctx.beginPath();
        ctx.moveTo(s.x, s.y);
        ctx.lineTo(nd.x, nd.y);
        if (isHl) {
          ctx.strokeStyle = 'rgba(16,185,129,0.35)';
          ctx.lineWidth = 1.5;
        } else {
          ctx.strokeStyle = 'rgba(255,255,255,0.03)';
          ctx.lineWidth = 0.5;
        }
        ctx.stroke();
      }

      for (const p of particles) {
        p.t += p.speed;
        if (p.t > 1) p.t -= 1;
        const [si, ti] = edges[p.edge] || [0, 0];
        const s = nodes[si], nd = nodes[ti];
        if (!s || !nd) continue;
        const x = s.x + (nd.x - s.x) * p.t;
        const y = s.y + (nd.y - s.y) * p.t;
        const isHl = hov === s.id || hov === nd.id || sel === s.id || sel === nd.id;
        ctx.beginPath();
        ctx.arc(x, y, isHl ? 1.5 : 0.8, 0, Math.PI * 2);
        ctx.fillStyle = isHl ? 'rgba(16,185,129,0.6)' : 'rgba(16,185,129,0.15)';
        ctx.fill();
      }

      for (const node of nodes) {
        const rgb = CAT_COLOR[node.mod.category] || CAT_COLOR.other;
        const isRes = res.has(node.id);
        const isHov = hov === node.id;
        const isSel = sel === node.id;
        const r = Math.max(3, Math.min(10, 3 + node.degree * 1.2));

        if (isHov || isSel) {
          const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 3.5);
          grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.25)`);
          grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 3.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${isRes ? 0.9 : 0.25})`;
        ctx.fill();

        if (isSel) {
          ctx.strokeStyle = '#ffffff';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        if (isHov || isSel || node.degree >= 4) {
          ctx.fillStyle = isHov ? '#ffffff' : 'rgba(255,255,255,0.6)';
          ctx.font = '10px Inter, system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'top';
          ctx.fillText(node.mod.name, node.x, node.y + r + 3);
        }
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    };

    animRef.current = requestAnimationFrame(draw);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [initGraph]);

  const getNodeAt = useCallback((mx: number, my: number): number => {
    const t = transformRef.current;
    const x = (mx - t.x) / t.scale;
    const y = (my - t.y) / t.scale;
    const nodes = nodesRef.current;
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const r = Math.max(3, Math.min(10, 3 + n.degree * 1.2)) + 4;
      const dx = n.x - x, dy = n.y - y;
      if (dx * dx + dy * dy < r * r) return i;
    }
    return -1;
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const d = dragRef.current;

    if (d.nodeIdx >= 0 && nodesRef.current[d.nodeIdx]) {
      const t = transformRef.current;
      const node = nodesRef.current[d.nodeIdx];
      node.x = (mx - t.x) / t.scale;
      node.y = (my - t.y) / t.scale;
      node.vx = 0;
      node.vy = 0;
      alpha = Math.max(alpha, 0.1);
    } else if (d.isPanning) {
      const dx = e.clientX - d.lastX;
      const dy = e.clientY - d.lastY;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      d.lastX = e.clientX;
      d.lastY = e.clientY;
    } else {
      const idx = getNodeAt(mx, my);
      const newHov = idx >= 0 ? nodesRef.current[idx].id : null;
      if (newHov !== hoveredRef.current) {
        hoveredRef.current = newHov;
        forceRender(n => n + 1);
      }
    }
  }, [getNodeAt]);

  let alpha = 1;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const idx = getNodeAt(mx, my);
    if (idx >= 0) {
      nodesRef.current[idx].pinned = true;
      dragRef.current = { nodeIdx: idx, isPanning: false, lastX: e.clientX, lastY: e.clientY };
    } else {
      dragRef.current = { nodeIdx: -1, isPanning: true, lastX: e.clientX, lastY: e.clientY };
    }
  }, [getNodeAt]);

  const handleMouseUp = useCallback(() => {
    const d = dragRef.current;
    if (d.nodeIdx >= 0 && nodesRef.current[d.nodeIdx]) {
      nodesRef.current[d.nodeIdx].pinned = false;
    }
    dragRef.current = { nodeIdx: -1, isPanning: false, lastX: 0, lastY: 0 };
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const idx = getNodeAt(mx, my);
    onSelectMod(idx >= 0 ? nodesRef.current[idx].id : null);
  }, [getNodeAt, onSelectMod]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const t = transformRef.current;
    const factor = e.deltaY > 0 ? 0.92 : 1.08;
    const newScale = Math.max(0.2, Math.min(4, t.scale * factor));
    t.x = mx - (mx - t.x) * (newScale / t.scale);
    t.y = my - (my - t.y) * (newScale / t.scale);
    t.scale = newScale;
  }, []);

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={containerRef} className="absolute inset-0 rounded-xl overflow-hidden border border-mc-border">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { handleMouseUp(); hoveredRef.current = null; }}
          onClick={handleClick}
          onWheel={handleWheel}
        />
      </div>
      <div className="absolute bottom-3 left-3 text-[10px] text-zinc-600 pointer-events-none select-none">
        {UI.starMapHint}
      </div>
    </div>
  );
}
