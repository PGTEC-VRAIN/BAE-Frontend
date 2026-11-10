import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { explainPolicy, PolicyBlock, PolicyNode, prettyJson } from './policy-explainer';
import { CodeBlockComponent } from '../code-block/code-block.component';

/**
 * Muestra una política (ODRL o de credenciales) como frases legibles.
 * El JSON original queda detrás de un icono (i), con un bloque de código de estilo Carbon.
 */
@Component({
  selector: 'app-policy-viewer',
  standalone: true,
  imports: [TranslateModule, NgTemplateOutlet, CodeBlockComponent],
  encapsulation: ViewEncapsulation.None,
  templateUrl: './policy-viewer.component.html',
  styleUrls: ['./policy-viewer.component.css']
})
export class PolicyViewerComponent implements OnChanges {
  @Input() value: any;

  blocks: PolicyBlock[] = [];
  json = '';
  showJson = false;
  private readonly knownActions = ['use', 'read', 'modify', 'distribute', 'reproduce', 'aggregate', 'transfer', 'delete', 'display'];

  constructor(private translate: TranslateService) {}

  ngOnChanges(): void {
    this.blocks = explainPolicy(this.value);
    this.json = prettyJson(this.value);
    // Si no se ha podido explicar, mostramos el JSON directamente
    this.showJson = this.blocks.length === 0;
  }

  /** Resuelve los parámetros del nodo; las acciones (use, read...) se traducen aquí */
  params(n: PolicyNode): Record<string, any> {
    const actions: string[] | undefined = n.params?.['actions'];
    if (!actions) return n.params ?? {};
    const a = actions.map(x => this.knownActions.includes(x) ? this.translate.instant('PGTEC.POLICY.action_' + x) : x).join(', ');
    return { ...n.params, a };
  }

  trackNode(_i: number, n: PolicyNode): string { return n.key; }

}
