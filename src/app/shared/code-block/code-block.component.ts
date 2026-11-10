import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** Resaltado de sintaxis JSON mínimo (sin dependencias). */
export function highlightJson(json: string): string {
  return esc(json).replace(
    /("(?:\\.|[^"\\])*")(\s*:)?|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)/g,
    (_m, str, colon, lit, num) => {
      if (str) return colon ? `<span class="cb-k">${str}</span>${colon}` : `<span class="cb-s">${str}</span>`;
      if (lit) return `<span class="cb-l">${lit}</span>`;
      return `<span class="cb-n">${num}</span>`;
    });
}

/**
 * Bloque de código al estilo Carbon (carbon.now.sh): ventana oscura con tres puntos,
 * resaltado de sintaxis y botón de copiar. Es texto real (se puede seleccionar y copiar).
 */
@Component({
  selector: 'app-code-block',
  standalone: true,
  imports: [TranslateModule],
  encapsulation: ViewEncapsulation.None,
  template: `
    <div class="cb-root" role="region" [attr.aria-label]="title">
      <div class="cb-bar">
        <span class="cb-dot cb-dot-r"></span><span class="cb-dot cb-dot-y"></span><span class="cb-dot cb-dot-g"></span>
        <span class="cb-name">{{ title }}</span>
        <button type="button" class="cb-copy" (click)="copy()">
          {{ (copied ? 'PGTEC.POLICY.copied' : 'PGTEC.POLICY.copy') | translate }}
        </button>
      </div>
      <pre class="cb-pre" [style.max-height]="maxHeight"><code [innerHTML]="html"></code></pre>
    </div>`,
  styles: [`
    .cb-root { margin: .75rem 0; border-radius: .6rem; overflow: hidden; background: #181818; box-shadow: 0 8px 24px rgba(0,0,0,.4); border: 1px solid rgba(255,255,255,.08); text-align: left; }
    .cb-bar { display: flex; align-items: center; gap: .4rem; padding: .5rem .75rem; background: #1f1f1f; }
    .cb-dot { width: .7rem; height: .7rem; border-radius: 9999px; display: inline-block; }
    .cb-dot-r { background: #ff5f56; } .cb-dot-y { background: #ffbd2e; } .cb-dot-g { background: #27c93f; }
    .cb-name { margin-left: .5rem; font: .72rem ui-monospace, monospace; color: #9ca3af; flex: 1; }
    .cb-copy { font-size: .7rem; color: #d1d5db; border: 1px solid #4b5563; border-radius: .3rem; padding: .1rem .5rem; background: transparent; cursor: pointer; }
    .cb-copy:hover { background: #374151; }
    .cb-copy:focus-visible { outline: 2px solid #818cf8; outline-offset: 2px; }
    .cb-pre { margin: 0; padding: .9rem 1rem; overflow: auto; font: .78rem/1.55 ui-monospace, 'Fira Code', Menlo, monospace; color: #e5e7eb; white-space: pre; }
    .cb-k { color: #7dd3fc; } .cb-s { color: #a5d6a7; } .cb-n { color: #f9a8d4; } .cb-l { color: #fbbf24; }
  `]
})
export class CodeBlockComponent implements OnChanges {
  @Input() code = '';
  @Input() title = 'JSON';
  @Input() maxHeight = '22rem';

  html = '';
  copied = false;

  ngOnChanges(): void {
    this.html = highlightJson(this.code);
  }

  copy(): void {
    navigator.clipboard?.writeText(this.code).then(() => {
      this.copied = true;
      setTimeout(() => (this.copied = false), 1500);
    }).catch(() => { /* sin permiso de portapapeles: no pasa nada */ });
  }
}
