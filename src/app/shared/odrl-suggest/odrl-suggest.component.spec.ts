import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { OdrlSuggestComponent } from './odrl-suggest.component';
import { OdrlSuggestService, OdrlSuggestResponse } from 'src/app/services/odrl-suggest.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

const RESPONSE: OdrlSuggestResponse = {
  tiers: [{
    id: 'basic', name: 'Agente - Basico', description: 'd', price: { amount: 0, currency: 'EUR', plan: 'p' }, tools: ['list_stations'],
    reasons: [{ tool: 'list_stations', tier: 'basic', rule: 'R3', reason: 'catalogo' }],
    policies: [{ kind: 'agent-invoke', file: 'f.json', uid: 'urn:x', policy: { '@id': 'urn:x' } }]
  }]
};

describe('OdrlSuggestComponent', () => {
  let component: OdrlSuggestComponent;
  let fixture: ComponentFixture<OdrlSuggestComponent>;
  let service: jasmine.SpyObj<OdrlSuggestService>;

  let login: any;

  beforeEach(async () => {
    login = {};
    service = jasmine.createSpyObj('OdrlSuggestService', ['suggest']);
    await TestBed.configureTestingModule({
      imports: [OdrlSuggestComponent, TranslateModule.forRoot()],
      providers: [
        { provide: OdrlSuggestService, useValue: service },
        { provide: LocalStorageService, useValue: { getObject: () => login } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(OdrlSuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  const fill = (tools = '') => component.form.setValue({
    cardUrl: 'http://a.avamet.svc.cluster.local/c.json', sellerDid: 'did:web:avamet.ts.net',
    gateway: 'a-gw.avamet.svc.cluster.local', mcpTools: tools
  });

  const createWith = (info: any) => {
    login = info;
    fixture = TestBed.createComponent(OdrlSuggestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    return fixture.nativeElement.querySelector('[data-cy="odrlSellerDid"]') as HTMLInputElement;
  };

  it('takes the seller DID from the organization in use and locks the field', () => {
    const input = createWith({
      id: 'user-1', logged_as: 'did:web:b.example.org',
      organizations: [{ id: 'did:web:a.example.org' }, { id: 'did:web:b.example.org' }]
    });
    expect(component.form.value.sellerDid).toBe('did:web:b.example.org');
    expect(input.readOnly).toBeTrue();
  });

  it('uses the only organization of the profile, also when its DID is in the name', () => {
    createWith({ id: 'user-1', logged_as: 'user-1', organizations: [{ id: 'org-1', name: 'did:web:a.example.org' }] });
    expect(component.form.value.sellerDid).toBe('did:web:a.example.org');
  });

  it('leaves the field editable when no DID can be determined', () => {
    const input = createWith({
      id: 'user-1', logged_as: 'user-1',
      organizations: [{ id: 'did:web:a.example.org' }, { id: 'did:web:b.example.org' }]
    });
    expect(component.form.value.sellerDid).toBe('');
    expect(input.readOnly).toBeFalse();
  });

  it('does not call the service with an invalid form', () => {
    component.suggest();
    expect(service.suggest).not.toHaveBeenCalled();
  });

  it('calls the service, selects the first tier and emits the accepted tier', () => {
    service.suggest.and.returnValue(of(RESPONSE));
    fill('{"tools": [{"name": "list_stations"}]}');
    let accepted: any;
    component.accepted.subscribe(t => accepted = t);
    component.suggest();
    expect(service.suggest).toHaveBeenCalledWith(jasmine.objectContaining({
      agent_card_url: 'http://a.avamet.svc.cluster.local/c.json', mcp_tools: [{ name: 'list_stations' }]
    }));
    expect(component.selectedId).toBe('basic');
    component.accept();
    expect(accepted.id).toBe('basic');
  });

  it('shows the error returned by the proxy', () => {
    service.suggest.and.returnValue(throwError(() => ({ error: { error: 'host no permitido' } })));
    fill();
    component.suggest();
    expect(component.error).toBe('host no permitido');
    expect(component.loading).toBeFalse();
  });

  it('rejects MCP tools that are not a list', () => {
    fill('{"foo": 1}');
    component.suggest();
    expect(service.suggest).not.toHaveBeenCalled();
    expect(component.error).not.toBe('');
  });
});
