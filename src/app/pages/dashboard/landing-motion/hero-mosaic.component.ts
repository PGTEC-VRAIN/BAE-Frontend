import { AfterViewInit, Component, ElementRef, HostListener, NgZone, OnDestroy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

// Seconds the mosaic keeps sending data after it appears; hovering it plays it once more
const RUN_SECONDS = 8;
// Trips per second of each packet towards the data space core
const TRIPS_PER_SECOND = 0.32;
const CORE = { x: 240, y: 279 };

/**
 * Climate data mosaic of the PGTEC landing hero. Each tile sends a data packet to the central
 * "data space" tile for a few seconds, then the card rests.
 */
@Component({
  selector: 'app-hero-mosaic',
  templateUrl: './hero-mosaic.component.html',
  styleUrl: './hero-mosaic.component.css',
  standalone: true,
  imports: [TranslateModule]
})
export class HeroMosaicComponent implements AfterViewInit, OnDestroy {
  private tiles: SVGRectElement[] = [];
  private tileCentres: { x: number; y: number }[] = [];
  private packets: SVGCircleElement[] = [];
  private flash: SVGRectElement | null = null;
  private frameId = 0;
  private clock = 0;
  private last = 0;
  private visible = true;
  private observer?: IntersectionObserver;
  private readonly reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  constructor(private host: ElementRef<HTMLElement>, private zone: NgZone) { }

  ngAfterViewInit(): void {
    const root = this.host.nativeElement;
    this.tiles = Array.from(root.querySelectorAll<SVGRectElement>('.hm-tile'));
    this.tileCentres = this.tiles.map((tile) => ({
      x: Number(tile.getAttribute('x')) + 64,
      y: Number(tile.getAttribute('y')) + 77
    }));
    this.packets = Array.from(root.querySelectorAll<SVGCircleElement>('.hm-packet'));
    this.flash = root.querySelector<SVGRectElement>('.hm-flash');

    if (this.reduceMotion) {
      return;
    }
    this.observer = new IntersectionObserver(([entry]) => { this.visible = entry.isIntersecting; });
    this.observer.observe(root);
    this.play();
  }

  @HostListener('pointerenter')
  replay(): void {
    if (!this.reduceMotion && !this.frameId) {
      this.play();
    }
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.frameId);
    this.observer?.disconnect();
  }

  private play(): void {
    this.clock = 0;
    this.last = performance.now();
    // The loop only touches SVG attributes, so it runs outside Angular change detection
    this.zone.runOutsideAngular(() => {
      this.frameId = requestAnimationFrame((now) => this.frame(now));
    });
  }

  private frame(now: number): void {
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.visible) {
      this.clock += dt;
    }
    const finished = this.draw(this.clock);
    this.frameId = finished ? 0 : requestAnimationFrame((next) => this.frame(next));
  }

  // The tile glows as its packet leaves and the core flashes as it arrives. No trip starts after
  // RUN_SECONDS; returns true once the last trip has landed.
  private draw(t: number): boolean {
    const count = this.packets.length;
    let glow = 0;
    let moving = false;

    this.packets.forEach((packet, k) => {
      const tile = this.tiles[k];
      const trips = t * TRIPS_PER_SECOND - k / count;
      const tripStart = (Math.floor(trips) + k / count) / TRIPS_PER_SECOND;

      if (trips < 0 || tripStart > RUN_SECONDS) {
        packet.setAttribute('cx', '-20');
        packet.setAttribute('cy', '-20');
        tile.setAttribute('fill-opacity', tile.dataset['base'] ?? '0.15');
        return;
      }

      moving = true;
      const q = trips - Math.floor(trips);
      const eased = q * q;
      const from = this.tileCentres[k];
      packet.setAttribute('cx', (from.x + (CORE.x - from.x) * eased).toFixed(1));
      packet.setAttribute('cy', (from.y + (CORE.y - from.y) * eased).toFixed(1));
      packet.setAttribute('fill-opacity', q > 0.92 ? ((1 - q) / 0.08).toFixed(2) : '0.95');

      const leaving = Math.max(0, 1 - q * 5);
      tile.setAttribute('fill-opacity', (Number(tile.dataset['base']) + 0.3 * leaving).toFixed(3));
      glow = Math.max(glow, Math.max(0, 1 - Math.abs(q - 0.97) * 18));
    });

    this.flash?.setAttribute('fill-opacity', (glow * 0.2).toFixed(3));
    return !moving && t > RUN_SECONDS;
  }
}
