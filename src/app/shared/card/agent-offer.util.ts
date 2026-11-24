/**
 * Reads the agent metadata that the MAS offerings publish as product specification
 * characteristics (see the agent offers of the multi-agent system):
 *  - "Skills": comma separated skills of the agent card
 *  - "Protocolo" / "Endpoint A2A": invocation protocol (A2A, ANP, MCP...)
 *  - valueType "credentialsConfiguration": the consumer must present a verifiable credential
 *  - valueType "authorizationPolicy": ODRL policy enforced at the agent gateway
 * Offerings without these characteristics simply return empty lists.
 */
export interface AgentProfile {
  isAgent: boolean;
  skills: string[];
  protocols: string[];
  requiresVc: boolean;
  hasOdrl: boolean;
}

const KNOWN_PROTOCOLS = ['A2A', 'ANP', 'MCP'];

function charValue(char: any): any {
  const values = char?.productSpecCharacteristicValue ?? [];
  const def = values.find((v: any) => v?.isDefault) ?? values[0];
  return def?.value;
}

export function getAgentProfile(offer: any, spec?: any): AgentProfile {
  const chars: any[] = (spec ?? offer?.productSpecification)?.productSpecCharacteristic ?? [];

  const skills: string[] = [];
  const protocols = new Set<string>();
  let requiresVc = false;
  let hasOdrl = false;

  for (const char of chars) {
    const name = String(char?.name ?? '');
    const valueType = String(char?.valueType ?? '');
    const value = charValue(char);

    if (/^(skills?|habilidades|capabilities)$/i.test(name.trim()) && value != null) {
      const list = Array.isArray(value) ? value : String(value).split(/[,;\n]/);
      list.map((s: any) => String(s).trim()).filter(Boolean).forEach((s: string) => {
        if (!skills.includes(s)) {
          skills.push(s);
        }
      });
    }

    if (valueType === 'credentialsConfiguration' || /credential|credencial/i.test(name)) {
      requiresVc = true;
    }
    if (valueType === 'authorizationPolicy' || /odrl/i.test(name)) {
      hasOdrl = true;
    }

    const text = `${name} ${typeof value === 'string' ? value : ''}`;
    for (const protocol of KNOWN_PROTOCOLS) {
      if (new RegExp(`\\b${protocol}\\b`, 'i').test(text)) {
        protocols.add(protocol);
      }
    }
  }

  const agentCategory = (offer?.category ?? []).some((c: any) => /\bagent|agente/i.test(c?.name ?? ''));

  return {
    isAgent: agentCategory || skills.length > 0 || protocols.size > 0,
    skills,
    protocols: KNOWN_PROTOCOLS.filter((p) => protocols.has(p)),
    requiresVc,
    hasOdrl
  };
}
