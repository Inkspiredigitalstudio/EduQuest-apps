import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, Eraser, PenLine, Trash2, Undo2 } from 'lucide-react';

type Tool = 'pen' | 'eraser';

interface Point {
  x: number;
  y: number;
  p: number;
}

interface Stroke {
  tool: Tool;
  points: Point[];
}

interface ScratchPadProps {
  // Strokes are kept per question so flipping back to an earlier question
  // shows the working the student already did there.
  questionId: string;
}

const PEN_COLOR = '#2b2a33';
const PEN_WIDTH = 2.5;
const ERASER_WIDTH = 22;

// Points are stored normalised to 0..1 of the canvas box so a rotate/resize
// (common on tablets) redraws the working in the right place.
function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke, w: number, h: number) {
  const pts = stroke.points;
  if (pts.length === 0) return;
  ctx.save();
  ctx.globalCompositeOperation = stroke.tool === 'eraser' ? 'destination-out' : 'source-over';
  ctx.strokeStyle = PEN_COLOR;
  ctx.fillStyle = PEN_COLOR;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  const base = stroke.tool === 'eraser' ? ERASER_WIDTH : PEN_WIDTH;

  if (pts.length === 1) {
    ctx.beginPath();
    ctx.arc(pts[0].x * w, pts[0].y * h, (base * (0.5 + pts[0].p)) / 2, 0, Math.PI * 2);
    ctx.fill();
  } else {
    for (let i = 1; i < pts.length; i++) {
      const a = pts[i - 1];
      const b = pts[i];
      ctx.lineWidth = stroke.tool === 'eraser' ? base : base * (0.5 + (a.p + b.p) / 2);
      ctx.beginPath();
      ctx.moveTo(a.x * w, a.y * h);
      ctx.lineTo(b.x * w, b.y * h);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export const ScratchPad: React.FC<ScratchPadProps> = ({ questionId }) => {
  const [isOpen, setIsOpen] = useState(() => typeof window !== 'undefined' && window.matchMedia('(min-width: 1024px)').matches);
  const [tool, setTool] = useState<Tool>('pen');
  const [strokeCount, setStrokeCount] = useState(0);
  const [penDetected, setPenDetected] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const strokesByQuestion = useRef(new Map<string, Stroke[]>());
  const activeStroke = useRef<Stroke | null>(null);
  const activePointerId = useRef<number | null>(null);
  const penDetectedRef = useRef(false);

  const currentStrokes = useCallback(() => {
    let list = strokesByQuestion.current.get(questionId);
    if (!list) {
      list = [];
      strokesByQuestion.current.set(questionId, list);
    }
    return list;
  }, [questionId]);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    currentStrokes().forEach((s) => drawStroke(ctx, s, w, h));
  }, [currentStrokes]);

  // Keep the backing store sized to the box (and to devicePixelRatio, so lines
  // stay crisp on retina iPads) and redraw whenever the box changes size.
  useEffect(() => {
    if (!isOpen) return;
    const canvas = canvasRef.current;
    const box = boxRef.current;
    if (!canvas || !box) return;
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = box.getBoundingClientRect();
      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      redraw();
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(box);
    return () => ro.disconnect();
  }, [isOpen, redraw]);

  useEffect(() => {
    activeStroke.current = null;
    activePointerId.current = null;
    setStrokeCount(currentStrokes().length);
    if (isOpen) redraw();
  }, [questionId, isOpen, currentStrokes, redraw]);

  const toPoint = (e: { clientX: number; clientY: number; pressure: number; pointerType: string }): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    // Mouse and most fingers report a flat 0.5 (or 0); only a real stylus
    // gives meaningful pressure.
    const p = e.pointerType === 'pen' && e.pressure > 0 ? e.pressure : 0.5;
    return { x: (e.clientX - rect.left) / rect.width, y: (e.clientY - rect.top) / rect.height, p };
  };

  const drawLatestSegment = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    const stroke = activeStroke.current;
    if (!canvas || !ctx || !stroke) return;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.width / dpr;
    const h = canvas.height / dpr;
    const pts = stroke.points;
    drawStroke(ctx, { tool: stroke.tool, points: pts.length > 1 ? pts.slice(-2) : pts }, w, h);
  };

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === 'pen' && !penDetectedRef.current) {
      penDetectedRef.current = true;
      setPenDetected(true);
    }
    // Palm rejection: once a stylus has been used, ignore finger/palm touches.
    if (penDetectedRef.current && e.pointerType === 'touch') return;
    if (activePointerId.current !== null) return;
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    activePointerId.current = e.pointerId;
    activeStroke.current = { tool, points: [toPoint(e)] };
    drawLatestSegment();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointerId.current || !activeStroke.current) return;
    e.preventDefault();
    const native = e.nativeEvent;
    const events = typeof native.getCoalescedEvents === 'function' ? native.getCoalescedEvents() : [];
    for (const ev of events.length ? events : [native]) {
      activeStroke.current.points.push(toPoint(ev));
      drawLatestSegment();
    }
  };

  const endStroke = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerId !== activePointerId.current) return;
    if (activeStroke.current) {
      currentStrokes().push(activeStroke.current);
      setStrokeCount(currentStrokes().length);
    }
    activeStroke.current = null;
    activePointerId.current = null;
  };

  const handleUndo = () => {
    currentStrokes().pop();
    setStrokeCount(currentStrokes().length);
    redraw();
  };

  const handleClear = () => {
    strokesByQuestion.current.set(questionId, []);
    setStrokeCount(0);
    redraw();
  };

  const toolButton = (value: Tool, label: string, Icon: React.FC<{ className?: string }>) => (
    <button
      type="button"
      onClick={() => setTool(value)}
      aria-pressed={tool === value}
      className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
        tool === value ? 'bg-mist-500 border-mist-500 text-white' : 'bg-cream-100 border-sand-200 text-ink-700 hover:bg-cream-200'
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="bg-cream-50 border border-sand-200 rounded-3xl overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((o) => !o)}
        aria-expanded={isOpen}
        className="w-full flex items-center justify-between gap-3 px-5 py-3.5 text-left hover:bg-cream-100 transition-colors"
      >
        <span className="flex items-center gap-2 font-display font-bold text-sm text-ink-900">
          <PenLine className="w-4 h-4 text-mist-600" />
          Kertas Conteng
        </span>
        <ChevronDown className={`w-4 h-4 text-ink-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="px-4 pb-4 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {toolButton('pen', 'Pen', PenLine)}
            {toolButton('eraser', 'Pemadam', Eraser)}
            <div className="flex-1" />
            <button
              type="button"
              onClick={handleUndo}
              disabled={strokeCount === 0}
              aria-label="Undo"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-cream-100 border-sand-200 text-ink-700 hover:bg-cream-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
            </button>
            <button
              type="button"
              onClick={handleClear}
              disabled={strokeCount === 0}
              aria-label="Kosongkan"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold border bg-cream-100 border-sand-200 text-ink-700 hover:bg-cream-200 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              <span className="hidden sm:inline">Kosongkan</span>
            </button>
          </div>

          <div
            ref={boxRef}
            className="relative h-72 lg:h-[520px] rounded-2xl border border-sand-200 overflow-hidden bg-white"
            style={{
              backgroundImage:
                'linear-gradient(to right, rgba(120,120,140,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(120,120,140,0.12) 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          >
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              style={{ touchAction: 'none', cursor: tool === 'eraser' ? 'cell' : 'crosshair' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={endStroke}
              onPointerCancel={endStroke}
            />
          </div>

          <p className="text-[11px] text-ink-500">
            {penDetected
              ? 'Mod pen aktif: sentuhan jari/tapak tangan diabaikan supaya tidak terconteng.'
              : 'Conteng di sini untuk mengira. Contengan tidak dihantar dan tidak dimarkah.'}
          </p>
        </div>
      )}
    </div>
  );
};
