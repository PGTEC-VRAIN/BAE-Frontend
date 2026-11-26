import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { OdrlSuggestService } from './odrl-suggest.service';
import { environment } from 'src/environments/environment';

describe('OdrlSuggestService', () => {
  let service: OdrlSuggestService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(OdrlSuggestService);
    http = TestBed.inject(HttpTestingController);
  });

  it('posts the request to /api/odrl/suggest', () => {
    const req = { agent_card_url: 'http://a.svc.cluster.local/c', seller_did: 'did:web:x.ts.net', gateway: 'a-gw.x.svc.cluster.local' };
    let result: any;
    service.suggest(req).subscribe(r => result = r);
    const call = http.expectOne(`${environment.BASE_URL}/api/odrl/suggest`);
    expect(call.request.method).toBe('POST');
    expect(call.request.body).toEqual(req);
    call.flush({ tiers: [] });
    expect(result).toEqual({ tiers: [] });
    http.verify();
  });
});
