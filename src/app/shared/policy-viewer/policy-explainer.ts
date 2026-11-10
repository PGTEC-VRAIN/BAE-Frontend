/**
 * Convierte una política ODRL (JSON-LD del PAP) o una política de credenciales
 * ({claims, credentialsType}) en un árbol de frases traducibles.
 * No depende de Angular: cada nodo lleva una clave i18n y sus parámetros.
 */
export interface PolicyNode {
  key: string;
  params?: Record<string, any>;
  children?: PolicyNode[];
}

export interface PolicyBlock {
  /** 'permission' | 'prohibition' | 'obligation' | 'credentials' | 'unknown' */
  kind: string;
  nodes: PolicyNode[];
}

const P = 'PGTEC.POLICY.';

const local = (v: any): string => {
  const s = String(v ?? '');
  const i = Math.max(s.lastIndexOf(':'), s.lastIndexOf('#'), s.lastIndexOf('/'));
  return i >= 0 ? s.slice(i + 1) : s;
};

const asArray = (v: any): any[] => (v === undefined || v === null ? [] : Array.isArray(v) ? v : [v]);

const valueOf = (v: any): any => {
  if (v && typeof v === 'object' && !Array.isArray(v)) {
    if ('@value' in v) return v['@value'];
    if ('@id' in v) return v['@id'];
  }
  return v;
};

const list = (v: any): string => asArray(v).map(valueOf).map(x => (typeof x === 'object' ? JSON.stringify(x) : String(x))).join(', ');

/** Pares (operando, operador) que sabemos redactar; el resto se muestra en forma genérica. */
const KNOWN = new Set([
  'role_hasPart', 'role_eq', 'role_isAnyOf',
  'type_hasPart', 'type_eq',
  'currentParty_eq', 'currentParty_isAnyOf',
  'path_isInPath', 'path_eq',
  'entityType_eq', 'entityType_isAnyOf'
]);

const LOGICAL: Record<string, string> = { and: 'all_of', or: 'any_of', xone: 'one_of', andSequence: 'all_of', not: 'none_of' };

function constraintNode(c: any): PolicyNode {
  // Restricción lógica (and / or / xone)
  for (const op of Object.keys(LOGICAL)) {
    const members = c['odrl:' + op] ?? c[op];
    if (members !== undefined) {
      const key = P + LOGICAL[op];
      // Aplana grupos anidados del mismo tipo (todas → todas) y desenvuelve los de un solo elemento
      const kids: PolicyNode[] = [];
      for (const k of asArray(members).map(constraintNode)) {
        if (k.key === key && k.children && op !== 'not') kids.push(...k.children);
        else kids.push(k);
      }
      return kids.length === 1 && op !== 'not' ? kids[0] : { key, children: kids };
    }
  }
  const left = local(valueOf(c['odrl:leftOperand'] ?? c['leftOperand']));
  const oper = local(valueOf(c['odrl:operator'] ?? c['operator']));
  const right = c['odrl:rightOperand'] ?? c['rightOperand'];
  const v = list(right);
  const id = `${left}_${oper}`;
  if (KNOWN.has(id)) {
    return { key: `${P}c_${id}`, params: { v } };
  }
  return { key: P + 'c_generic', params: { l: left, o: oper, v } };
}

/** Describe una colección (target / assignee) con su refinamiento. */
function collectionNodes(col: any, keyPrefix: string): PolicyNode[] {
  if (col === undefined || col === null) return [];
  if (typeof col === 'string') return [{ key: P + keyPrefix + '_id', params: { v: col } }];
  const ref = col['odrl:refinement'] ?? col['refinement'];
  if (ref !== undefined) {
    return asArray(ref).map(constraintNode);
  }
  const id = valueOf(col['@id'] ?? col['odrl:source']);
  return id ? [{ key: P + keyPrefix + '_id', params: { v: id } }] : [];
}

function ruleBlock(kind: string, rule: any): PolicyBlock {
  const nodes: PolicyNode[] = [];
  const action = asArray(rule['odrl:action'] ?? rule['action']).map(a => local(valueOf(a['rdf:value'] ?? a)));
  nodes.push({ key: P + 'rule_' + kind, params: { actions: action } });

  const assigner = valueOf(rule['odrl:assigner']);
  if (assigner) nodes.push({ key: P + 'assigner', params: { v: assigner } });

  const target = collectionNodes(rule['odrl:target'] ?? rule['target'], 'target');
  if (target.length) nodes.push({ key: P + 'target', children: target });

  const who = collectionNodes(rule['odrl:assignee'] ?? rule['assignee'], 'assignee');
  nodes.push(who.length ? { key: P + 'assignee', children: who } : { key: P + 'assignee_any' });

  const cons = asArray(rule['odrl:constraint'] ?? rule['constraint']);
  if (cons.length) nodes.push({ key: P + 'constraints', children: cons.map(constraintNode) });
  return { kind, nodes };
}

function odrlBlocks(pol: any): PolicyBlock[] {
  const out: PolicyBlock[] = [];
  for (const [prefix, kind] of [['permission', 'permission'], ['prohibition', 'prohibition'], ['obligation', 'obligation']]) {
    for (const r of asArray(pol['odrl:' + prefix] ?? pol[prefix])) out.push(ruleBlock(kind, r));
  }
  return out;
}

function credentialsBlock(c: any): PolicyBlock {
  const nodes: PolicyNode[] = [];
  if (c.credentialsType) nodes.push({ key: P + 'cred_type', params: { v: c.credentialsType } });
  for (const claim of asArray(c.claims)) {
    const values = asArray(claim.allowedValues);
    nodes.push(values.length
      ? { key: P + 'cred_claim_values', params: { n: claim.name, v: values.join(', ') } }
      : { key: P + 'cred_claim', params: { n: claim.name } });
  }
  return { kind: 'credentials', nodes };
}

export function isPolicyValue(v: any): boolean {
  let x = parseMaybe(v);
  if (Array.isArray(x)) x = x[0];
  if (!x || typeof x !== 'object') return false;
  if (Array.isArray(x.claims) && 'credentialsType' in x) return true;
  const t = String(x['@type'] ?? '');
  return t.endsWith('Policy') || t.endsWith('Set') || t.endsWith('Offer') || t.endsWith('Agreement') ||
    Object.keys(x).some(k => /^(odrl:)?(permission|prohibition|obligation)$/.test(k));
}

function parseMaybe(v: any): any {
  if (typeof v === 'string') {
    const s = v.trim();
    if (s.startsWith('{') || s.startsWith('[')) {
      try { return JSON.parse(s); } catch { return v; }
    }
  }
  return v;
}

/** Devuelve los bloques explicados; si algo no se reconoce, la lista queda vacía y la UI muestra solo el JSON. */
export function explainPolicy(raw: any): PolicyBlock[] {
  try {
    const val = parseMaybe(raw);
    const blocks: PolicyBlock[] = [];
    for (const p of asArray(val)) {
      if (!p || typeof p !== 'object') continue;
      if (Array.isArray(p.claims) && 'credentialsType' in p) blocks.push(credentialsBlock(p));
      else blocks.push(...odrlBlocks(p));
    }
    return blocks;
  } catch {
    return [];
  }
}

export function prettyJson(raw: any): string {
  const val = parseMaybe(raw);
  return JSON.stringify(val, null, 2);
}
