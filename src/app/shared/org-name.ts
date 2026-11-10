import { Pipe, PipeTransform } from '@angular/core';

/**
 * Nombre legible de una organización. Si el perfil guarda un DID como nombre
 * (did:web:vrain.pgtec-vrain-dataspace.eu) se muestra la etiqueta del host en mayúsculas (VRAIN).
 */
export function orgDisplayName(org: any): string {
  const name = String(org?.tradingName || org?.name || '').trim();
  if (/^did:/i.test(name)) {
    const host = name.split(':').pop() || name;
    return (host.split('.')[0] || host).toUpperCase();
  }
  return name;
}

@Pipe({ name: 'orgName', standalone: true })
export class OrgNamePipe implements PipeTransform {
  transform(org: any): string {
    return orgDisplayName(org);
  }
}
