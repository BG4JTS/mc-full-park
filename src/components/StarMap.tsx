import { useEffect, useRef, useState } from 'react';
import type { McParkMod } from '../utils/mcpark-parser';
import { UI } from '../i18n';

interface StarMapProps {
  mods: McParkMod[];
  resolvedIds: Set<string>;
  onSelectMod: (id: string | null) => void;
  selectedModId: string | null;
}

interface Node {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  mod: McParkMod;
  degree: number;
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
  const [hovered, setHovered] = useState<string | null>(null);
  const nodesRef = useRef<Map<string, Node>>(new Map());
  const animRef = useRef<number>(0);
  const transformRef = useRef({ x: 0, y: 0, scale: 1 });
  const dragRef = useRef<{ node: Node | null; startX: number; startY: number; isPanning: boolean }>({
    node: null, startX: 0, startY: 0, isPanning: false,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + 'px';
    canvas.style.height = rect.height + 'px';

    const ctx = canvas.getContext('2d')!;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;

    const degreeMap = new Map<string, number>();
    for (const mod of mods) {
      if (!degreeMap.has(mod.id)) degreeMap.set(mod.id, 0);
      for (const dep of mod.dependencies) {
        degreeMap.set(dep, (degreeMap.get(dep) || 0) + 1);
        degreeMap.set(mod.id, (degreeMap.get(mod.id) || 0) + 1);
      }
    }

    const nodes = new Map<string, Node>();
    const existing = nodesRef.current;
    mods.forEach((mod, i) => {
      const angle = (i / mods.length) * Math.PI * 2;
      const r = Math.min(w, h) * 0.3;
      const ex = existing.get(mod.id);
      nodes.set(mod.id, {
        id: mod.id,
        x: ex ? ex.x : w / 2 + Math.cos(angle) * r + (Math.random() - 0.5) * 50,
        y: ex ? ex.y : h / 2 + Math.sin(angle) * r + (Math.random() - 0.5) * 50,
        vx: ex ? ex.vx : 0,
        vy: ex ? ex.vy : 0,
        mod,
        degree: degreeMap.get(mod.id) || 0,
      });
    });
    nodesRef.current = nodes;

    const edges: [string, string][] = [];
    for (const mod of mods) {
      for (const dep of mod.dependencies) {
        if (nodes.has(dep)) edges.push([mod.id, dep]);
      }
    }

    let frame = 0;
    const maxFrames = 300;

    function simulate() {
      if (frame > maxFrames) return;
      const alpha = Math.max(0.001, 1 - frame / maxFrames);
      const nodeArr = Array.from(nodes.values());

      for (let i = 0; i < nodeArr.length; i++) {
        for (let j = i + 1; j < nodeArr.length; j++) {
          const a = nodeArr[i], b = nodeArr[j];
          let dx = b.x - a.x, dy = b.y - a.y;
          let dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = -80 * alpha / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          a.vx -= fx; a.vy -= fy;
          b.vx += fx; b.vy += fy;
        }
      }

      for (const [srcId, tgtId] of edges) {
        const src = nodes.get(srcId)!;
        const tgt = nodes.get(tgtId)!;
        let dx = tgt.x - src.x, dy = tgt.y - src.y;
        let dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = (dist - 100) * 0.005 * alpha;
        const fx = (dx / dist) * force;
        const fy = (dy / dist) * force;
        src.vx += fx; src.vy += fy;
        tgt.vx -= fx; tgt.vy -= fy;
      }

      for (const n of nodeArr) {
        n.vx += (w / 2 - n.x) * 0.001 * alpha;
        n.vy += (h / 2 - n.y) * 0.001 * alpha;
        n.vx *= 0.85; n.vy *= 0.85;
        n.x += n.vx; n.y += n.vy;
        n.x = Math.max(20, Math.min(w - 20, n.x));
        n.y = Math.max(20, Math.min(h - 20, n.y));
      }

      frame++;
    }

    const stars: [number, number, number][] = [];
    for (let i = 0; i < 200; i++) {
      stars.push([Math.random() * w, Math.random() * h, Math.random() * 0.5 + 0.1]);
    }

    function draw() {
      simulate();
      const t = transformRef.current;
      ctx.save();
      ctx.clearRect(0, 0, w, h);

      ctx.fillStyle = '#09090b';
      ctx.fillRect(0, 0, w, h);

      for (const [sx, sy, sb] of stars) {
        ctx.fillStyle = `rgba(255,255,255,${sb * 0.3})`;
        ctx.fillRect(sx, sy, 1, 1);
      }

      ctx.translate(t.x, t.y);
      ctx.scale(t.scale, t.scale);

      for (const [srcId, tgtId] of edges) {
        const src = nodes.get(srcId);
        const tgt = nodes.get(tgtId);
        if (!src || !tgt) continue;
        const isHighlight = hovered === srcId || hovered === tgtId || selectedModId === srcId || selectedModId === tgtId;
        ctx.beginPath();
        ctx.moveTo(src.x, src.y);
        ctx.lineTo(tgt.x, tgt.y);
        ctx.strokeStyle = isHighlight ? 'rgba(16,185,129,0.4)' : 'rgba(255,255,255,0.04)';
        ctx.lineWidth = isHighlight ? 1.5 : 0.5;
        ctx.stroke();
      }

      for (const [, node] of nodes) {
        const rgb = CAT_COLOR[node.mod.category] || CAT_COLOR.other;
        const isResolved = resolvedIds.has(node.id);
        const isHovered = hovered === node.id;
        const isSelected = selectedModId === node.id;
        const r = Math.max(3, Math.min(12, 3 + node.degree * 1.5));

        if (isHovered || isSelected) {
          const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 4);
          grad.addColorStop(0, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0.3)`);
          grad.addColorStop(1, `rgba(${rgb[0]},${rgb[1]},${rgb[2]},0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(node.x, node.y, r * 4, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        const alpha = isResolved ? 1 : 0.3;
        ctx.fillStyle = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},${alpha})`;
        ctx.fill();

        if (isSelected) {
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        if (isHovered) {
          ctx.fillStyle = '#fff';
          ctx.font = '11px Inter, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText(node.mod.name, node.x, node.y - r - 6);
        }
      }

      ctx.restore();
      animRef.current = requestAnimationFrame(draw);
    }

    animRef.current = requestAnimationFrame(draw);

    const handleResize = () => {
      const r2 = container.getBoundingClientRect();
      canvas.width = r2.width * dpr;
      canvas.height = r2.height * dpr;
      canvas.style.width = r2.width + 'px';
      canvas.style.height = r2.height + 'px';
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [mods, resolvedIds, hovered, selectedModId]);

  const getNodeAt = (mx: number, my: number): Node | null => {
    const t = transformRef.current;
    const x = (mx - t.x) / t.scale;
    const y = (my - t.y) / t.scale;
    for (const [, node] of nodesRef.current) {
      const r = Math.max(3, Math.min(12, 3 + node.degree * 1.5));
      const dx = node.x - x, dy = node.y - y;
      if (dx * dx + dy * dy < (r + 4) * (r + 4)) return node;
    }
    return null;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const node = getNodeAt(mx, my);
    setHovered(node ? node.id : null);

    if (dragRef.current.node) {
      const t = transformRef.current;
      const x = (mx - t.x) / t.scale;
      const y = (my - t.y) / t.scale;
      dragRef.current.node.x = x;
      dragRef.current.node.y = y;
      dragRef.current.node.vx = 0;
      dragRef.current.node.vy = 0;
    } else if (dragRef.current.isPanning) {
      const dx = e.clientX - dragRef.current.startX;
      const dy = e.clientY - dragRef.current.startY;
      transformRef.current.x += dx;
      transformRef.current.y += dy;
      dragRef.current.startX = e.clientX;
      dragRef.current.startY = e.clientY;
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const node = getNodeAt(mx, my);
    if (node) {
      dragRef.current = { node, startX: mx, startY: my, isPanning: false };
    } else {
      dragRef.current = { node: null, startX: e.clientX, startY: e.clientY, isPanning: true };
    }
  };

  const handleMouseUp = () => {
    dragRef.current = { node: null, startX: 0, startY: 0, isPanning: false };
  };

  const handleClick = (e: React.MouseEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const node = getNodeAt(mx, my);
    onSelectMod(node ? node.id : null);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const rect = canvasRef.current!.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    const t = transformRef.current;
    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newScale = Math.max(0.3, Math.min(3, t.scale * delta));
    t.x = mx - (mx - t.x) * (newScale / t.scale);
    t.y = my - (my - t.y) * (newScale / t.scale);
    t.scale = newScale;
  };

  return (
    <div className="relative w-full h-full min-h-[500px]">
      <div ref={containerRef} className="absolute inset-0 rounded-xl overflow-hidden border border-mc-border">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => { handleMouseUp(); setHovered(null); }}
          onClick={handleClick}
          onWheel={handleWheel}
        />
      </div>
      <div className="absolute bottom-3 left-3 text-[10px] text-zinc-600 pointer-events-none">
        {UI.starMapHint}
      </div>
    </div>
  );
}
