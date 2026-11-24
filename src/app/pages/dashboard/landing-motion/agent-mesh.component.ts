import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, ViewChild } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

type Protocol = 'A2A' | 'ANP' | 'MCP' | 'VC';

interface Hub {
  label: string;
  x: number; // normalised position (0..1)
  y: number;
  color: string;
  r: number;
  phase: number;
}

interface Link {
  from: number;
  to: number;
  protocol: Protocol;
}

interface Packet {
  link: number;
  t: number;
  speed: number;
  forward: boolean;
}

interface Dust {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const COLORS: Record<Protocol, string> = {
  A2A: '#22d3ee',
  ANP: '#a78bfa',
  MCP: '#34d399',
  VC: '#fbbf24'
};

const HUBS: Hub[] = [
  { label: 'orchestrator', x: 0.5, y: 0.46, color: '#a78bfa', r: 13, phase: 0 },
  { label: 'ANP registry', x: 0.2, y: 0.17, color: '#a78bfa', r: 9, phase: 1.1 },
  { label: 'verifier · VC', x: 0.8, y: 0.16, color: '#fbbf24', r: 9, phase: 2.3 },
  { label: 'weather agent', x: 0.16, y: 0.6, color: '#22d3ee', r: 10, phase: 3.1 },
  { label: 'translator', x: 0.84, y: 0.57, color: '#22d3ee', r: 10, phase: 4.2 },
  { label: 'MCP · NGSI-LD', x: 0.3, y: 0.87, color: '#34d399', r: 9, phase: 5.0 },
  { label: 'LLM agent', x: 0.7, y: 0.86, color: '#22d3ee', r: 10, phase: 5.7 }
];

const LINKS: Link[] = [
  { from: 0, to: 3, protocol: 'A2A' },
  { from: 0, to: 4, protocol: 'A2A' },
  { from: 0, to: 6, protocol: 'A2A' },
  { from: 0, to: 1, protocol: 'ANP' },
  { from: 1, to: 3, protocol: 'ANP' },
  { from: 1, to: 4, protocol: 'ANP' },
  { from: 0, to: 2, protocol: 'VC' },
  { from: 2, to: 4, protocol: 'VC' },
  { from: 3, to: 5, protocol: 'MCP' },
  { from: 6, to: 5, protocol: 'MCP' }
];

const DUST_COUNT = 34;

/**
 * Hero illustration of the MAS theme: a network of agents (orchestrator, registry, verifier,
 * agents and MCP tools) exchanging A2A / ANP / MCP / VC messages over a drifting constellation.
 * Canvas based, runs outside Angular, pauses when off screen or in a hidden tab and draws a
 * single static frame when the user prefers reduced motion.
 */
@Component({
  selector: 'app-agent-mesh',
  templateUrl: './agent-mesh.component.html',
  styleUrl: './agent-mesh.component.css',
  standalone: true,
  imports: [TranslateModule]
})
export class AgentMeshComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  readonly legend: Protocol[] = ['A2A', 'ANP', 'MCP', 'VC'];
  readonly colors = COLORS;

  private ctx: CanvasRenderingContext2D | null = null;
  private width = 0;
  private height = 0;
  private dpr = 1;
  private frameId = 0;
  private last = 0;
  private clock = 0;
  private visible = true;
  private dust: Dust[] = [];
  private packets: Packet[] = [];
  private observer?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;
  private readonly reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  private readonly onVisibility = () => this.schedule();

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) { }

  ngAfterViewInit(): void {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) {
      return;
    }

    // Deterministic pseudo random layout, so the static (reduced motion) frame is stable
    let seed = 7;
    const rand = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };
    this.dust = Array.from({ length: DUST_COUNT }, () => ({
      x: rand(),
      y: rand(),
      vx: (rand() - 0.5) * 0.012,
      vy: (rand() - 0.5) * 0.012
    }));
    this.packets = LINKS.map((_, i) => ({
      link: i,
      t: rand(),
      speed: 0.18 + rand() * 0.22,
      forward: rand() > 0.5
    }));

    this.zone.runOutsideAngular(() => {
      this.resizeObserver = new ResizeObserver(() => {
        this.resize();
        if (this.reduceMotion) {
          this.draw();
        }
      });
      this.resizeObserver.observe(this.host.nativeElement);
      this.resize();

      if (this.reduceMotion) {
        this.draw();
        return;
      }

      this.observer = new IntersectionObserver(([entry]) => {
        this.visible = entry.isIntersecting;
        this.schedule();
      });
      this.observer.observe(this.host.nativeElement);
      document.addEventListener('visibilitychange', this.onVisibility);
      this.schedule();
    });
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.observer?.disconnect();
    this.resizeObserver?.disconnect();
    document.removeEventListener('visibilitychange', this.onVisibility);
  }

  private schedule(): void {
    if (this.reduceMotion || this.frameId || !this.visible || document.hidden) {
      return;
    }
    this.last = performance.now();
    this.frameId = requestAnimationFrame((now) => this.frame(now));
  }

  private frame(now: number): void {
    this.frameId = 0;
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.clock += dt;
    this.step(dt);
    this.draw();
    this.schedule();
  }

  private resize(): void {
    const canvas = this.canvasRef.nativeElement;
    const rect = canvas.getBoundingClientRect();
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = Math.max(1, rect.width);
    this.height = Math.max(1, rect.height);
    canvas.width = Math.round(this.width * this.dpr);
    canvas.height = Math.round(this.height * this.dpr);
  }

  private step(dt: number): void {
    for (const d of this.dust) {
      d.x += d.vx * dt;
      d.y += d.vy * dt;
      if (d.x < 0 || d.x > 1) d.vx *= -1;
      if (d.y < 0 || d.y > 1) d.vy *= -1;
    }
    for (const p of this.packets) {
      p.t += p.speed * dt;
      if (p.t >= 1) {
        p.t = 0;
        p.forward = !p.forward;
      }
    }
  }

  private hubPos(i: number): { x: number; y: number } {
    const hub = HUBS[i];
    const float = this.reduceMotion ? 0 : 4;
    return {
      x: hub.x * this.width + Math.cos(this.clock * 0.6 + hub.phase) * float,
      y: hub.y * this.height + Math.sin(this.clock * 0.8 + hub.phase) * float
    };
  }

  private draw(): void {
    const ctx = this.ctx;
    if (!ctx) {
      return;
    }
    const { width: w, height: h } = this;
    ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    // Constellation of idle nodes
    const maxDist = Math.min(w, h) * 0.2;
    for (let i = 0; i < this.dust.length; i++) {
      const a = this.dust[i];
      for (let j = i + 1; j < this.dust.length; j++) {
        const b = this.dust[j];
        const dist = Math.hypot((a.x - b.x) * w, (a.y - b.y) * h);
        if (dist < maxDist) {
          ctx.strokeStyle = `rgba(125, 211, 252, ${0.14 * (1 - dist / maxDist)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x * w, a.y * h);
          ctx.lineTo(b.x * w, b.y * h);
          ctx.stroke();
        }
      }
    }
    ctx.fillStyle = 'rgba(148, 163, 200, 0.55)';
    for (const d of this.dust) {
      ctx.beginPath();
      ctx.arc(d.x * w, d.y * h, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Links between agents
    const positions = HUBS.map((_, i) => this.hubPos(i));
    for (const link of LINKS) {
      const a = positions[link.from];
      const b = positions[link.to];
      ctx.strokeStyle = this.alpha(COLORS[link.protocol], 0.35);
      ctx.lineWidth = 1.4;
      ctx.setLineDash(link.protocol === 'ANP' || link.protocol === 'VC' ? [4, 5] : []);
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    }
    ctx.setLineDash([]);

    // Messages travelling along the links
    for (const p of this.packets) {
      const link = LINKS[p.link];
      const a = positions[p.forward ? link.from : link.to];
      const b = positions[p.forward ? link.to : link.from];
      const x = a.x + (b.x - a.x) * p.t;
      const y = a.y + (b.y - a.y) * p.t;
      const color = COLORS[link.protocol];
      const glow = ctx.createRadialGradient(x, y, 0, x, y, 9);
      glow.addColorStop(0, this.alpha(color, 0.9));
      glow.addColorStop(1, this.alpha(color, 0));
      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(x, y, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 1.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Agent nodes with their labels
    ctx.font = '500 11px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'middle';
    HUBS.forEach((hub, i) => {
      const { x, y } = positions[i];
      const pulse = this.reduceMotion ? 0.5 : (Math.sin(this.clock * 2 + hub.phase) + 1) / 2;
      const halo = ctx.createRadialGradient(x, y, hub.r * 0.6, x, y, hub.r * (2.4 + pulse));
      halo.addColorStop(0, this.alpha(hub.color, 0.35));
      halo.addColorStop(1, this.alpha(hub.color, 0));
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(x, y, hub.r * (2.4 + pulse), 0, Math.PI * 2);
      ctx.fill();

      this.hexagon(ctx, x, y, hub.r);
      ctx.fillStyle = '#0b1124';
      ctx.fill();
      ctx.strokeStyle = hub.color;
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.fillStyle = hub.color;
      ctx.beginPath();
      ctx.arc(x, y, hub.r * 0.35, 0, Math.PI * 2);
      ctx.fill();

      const text = hub.label;
      const tw = ctx.measureText(text).width;
      const below = y < h * 0.3 ? 1 : (y > h * 0.75 ? -1 : 1);
      const ly = y + below * (hub.r + 16);
      const lx = Math.min(Math.max(x, tw / 2 + 10), w - tw / 2 - 10);
      ctx.fillStyle = 'rgba(8, 12, 28, 0.82)';
      this.roundRect(ctx, lx - tw / 2 - 7, ly - 10, tw + 14, 20, 6);
      ctx.fill();
      ctx.strokeStyle = this.alpha(hub.color, 0.45);
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = '#e2e8f8';
      ctx.fillText(text, lx - tw / 2, ly + 0.5);
    });
  }

  private hexagon(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
    ctx.beginPath();
    for (let k = 0; k < 6; k++) {
      const angle = Math.PI / 6 + (k * Math.PI) / 3;
      const px = x + r * Math.cos(angle);
      const py = y + r * Math.sin(angle);
      if (k === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
    }
    ctx.closePath();
  }

  private roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number): void {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  private alpha(hex: string, a: number): string {
    const n = parseInt(hex.slice(1), 16);
    return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
  }
}
