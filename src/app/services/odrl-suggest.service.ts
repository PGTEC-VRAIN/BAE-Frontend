import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

export interface OdrlSuggestRequest {
  agent_card_url: string;
  seller_did: string;
  gateway: string;
  mcp_tools?: any[];
  price?: number | Record<string, number>;
}

export interface OdrlSuggestedPolicy {
  kind: 'agent-invoke' | 'mcp-tools' | string;
  file: string;
  uid: string;
  policy: any;
}

export interface OdrlSuggestedTier {
  id: string;
  name: string;
  description: string;
  price: { amount: number; currency: string; plan: string };
  tools: string[];
  reasons: { tool: string; tier: string; rule: string; reason: string; depends_on?: string[] }[];
  policies: OdrlSuggestedPolicy[];
}

export interface OdrlSuggestResponse {
  tiers: OdrlSuggestedTier[];
  review?: { notes?: string[]; mcp_host?: string | null };
}

/** Sugerencia de politicas ODRL a partir de la agent card (proxy logico -> servicio odrl-suggest). */
@Injectable({
  providedIn: 'root'
})
export class OdrlSuggestService {
  protected BASE_URL = environment.BASE_URL;

  constructor(private http: HttpClient) { }

  suggest(req: OdrlSuggestRequest): Observable<OdrlSuggestResponse> {
    return this.http.post<OdrlSuggestResponse>(`${this.BASE_URL}/api/odrl/suggest`, req);
  }
}
