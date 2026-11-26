import { ChangeDetectorRef, Component, EventEmitter, Output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OdrlSuggestedTier, OdrlSuggestResponse, OdrlSuggestService } from 'src/app/services/odrl-suggest.service';
import { PolicyViewerComponent } from '../policy-viewer/policy-viewer.component';
import { jsonValidator } from 'src/app/validators/validators';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { LoginInfo } from 'src/app/models/interfaces';

const DID_PATTERN = /^did:[a-z0-9]+:[A-Za-z0-9._:%-]+$/;

/**
 * Panel del asistente de vendedor: pide la agent card (y opcionalmente las herramientas MCP), obtiene niveles de
 * politicas ODRL sugeridos y deja aceptar uno (se emite `accepted`; el padre rellena las caracteristicas).
 */
@Component({
  selector: 'app-odrl-suggest',
  standalone: true,
  imports: [ReactiveFormsModule, TranslateModule, PolicyViewerComponent],
  templateUrl: './odrl-suggest.component.html'
})
export class OdrlSuggestComponent {
  @Output() accepted = new EventEmitter<OdrlSuggestedTier>();
  @Output() closed = new EventEmitter<void>();

  form = new FormGroup({
    cardUrl: new FormControl('', [Validators.required, Validators.pattern(/^https?:\/\/\S+$/)]),
    sellerDid: new FormControl('', [Validators.required, Validators.pattern(DID_PATTERN)]),
    gateway: new FormControl('', [Validators.required, Validators.pattern(/^[A-Za-z0-9]([A-Za-z0-9.-]*[A-Za-z0-9])?$/)]),
    mcpTools: new FormControl('', [jsonValidator]),
  });

  loading = false;
  error = '';
  result: OdrlSuggestResponse | null = null;
  selectedId: string | null = null;
  /** true si el DID del vendedor se ha tomado de la organizacion de la sesion (campo de solo lectura). */
  sellerDidFromProfile = false;

  constructor(private odrl: OdrlSuggestService, private translate: TranslateService, private cdr: ChangeDetectorRef,
              private localStorage: LocalStorageService) {
    const did = this.profileDid();
    if (did) {
      this.form.controls.sellerDid.setValue(did);
      this.sellerDidFromProfile = true;
    }
  }

  /** DID de la organizacion con la que se actua (o de la unica del perfil); undefined si no tiene. */
  private profileDid(): string | undefined {
    const login = this.localStorage.getObject('login_items') as LoginInfo | null;
    const orgs: any[] = login?.organizations ?? [];
    const org = orgs.find(o => o?.id === login?.logged_as) ?? (orgs.length === 1 ? orgs[0] : undefined);
    return [org?.id, org?.name].find(v => typeof v === 'string' && DID_PATTERN.test(v));
  }

  get selected(): OdrlSuggestedTier | undefined {
    return this.result?.tiers.find(t => t.id === this.selectedId);
  }

  /** Acepta `[...]` o `{"tools": [...]}` (salida de tools/list de MCP). */
  private parseTools(): any[] | undefined {
    const raw = (this.form.value.mcpTools || '').trim();
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    const tools = Array.isArray(parsed) ? parsed : parsed?.tools;
    if (!Array.isArray(tools)) throw new Error('mcp_tools');
    return tools;
  }

  suggest(): void {
    this.error = '';
    this.form.markAllAsTouched();
    if (this.form.invalid || this.loading) return;
    let tools: any[] | undefined;
    try {
      tools = this.parseTools();
    } catch {
      this.error = this.translate.instant('ODRL_SUGGEST._invalid_tools');
      return;
    }
    const v = this.form.value;
    this.loading = true;
    this.result = null;
    this.selectedId = null;
    this.odrl.suggest({
      agent_card_url: v.cardUrl!.trim(),
      seller_did: v.sellerDid!.trim(),
      gateway: v.gateway!.trim(),
      ...(tools ? { mcp_tools: tools } : {})
    }).subscribe({
      next: res => {
        this.result = res;
        this.selectedId = res.tiers[0]?.id ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: err => {
        this.error = err?.error?.error || this.translate.instant('ODRL_SUGGEST._request_failed');
        this.loading = false;
        this.cdr.detectChanges();
      }
    });
  }

  accept(): void {
    const tier = this.selected;
    if (tier) this.accepted.emit(tier);
  }
}
