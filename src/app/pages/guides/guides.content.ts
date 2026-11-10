/**
 * Contenido de las guías del marketplace (español e inglés).
 * Los textos son Markdown; las plantillas ODRL se construyen como objetos para que el JSON sea siempre válido.
 * Los valores entre <...> son datos que hay que sustituir por los tuyos.
 */
export type Lang = 'es' | 'en';
export type L10n = Record<Lang, string>;

export interface GuideSection { id: string; title: L10n; md: L10n; }
export interface PolicyTemplate { id: string; title: L10n; when: L10n; title_file: string; json: unknown; }

// ---------------------------------------------------------------------------------------------
// Plantillas
// ---------------------------------------------------------------------------------------------

const ODRL_CONTEXT = {
  odrl: 'http://www.w3.org/ns/odrl/2/',
  xsd: 'http://www.w3.org/2001/XMLSchema#',
  vc: 'https://www.w3.org/2018/credentials#',
  http: 'https://github.com/SEAMWARE/odrl-pap/http#'
};

const str = (v: string) => ({ '@type': 'xsd:string', '@value': v });
const constraint = (left: string, op: string, v: string) => ({
  '@type': 'odrl:Constraint', 'odrl:leftOperand': left, 'odrl:operator': op, 'odrl:rightOperand': str(v)
});
const pathTarget = (path: string) => ({
  '@type': 'odrl:AssetCollection', 'odrl:source': 'urn:asset',
  'odrl:refinement': constraint('http:path', 'http:isInPath', path)
});
const policy = (id: string, target: unknown, assigneeConstraints: unknown[]) => ({
  '@context': ODRL_CONTEXT,
  '@id': id,
  'odrl:uid': id,
  '@type': 'odrl:Policy',
  'odrl:permission': {
    'odrl:assigner': 'did:web:<tu-organizacion>.pgtec-vrain-dataspace.eu',
    'odrl:action': 'odrl:use',
    'odrl:target': target,
    'odrl:assignee': {
      '@type': 'odrl:PartyCollection', 'odrl:source': 'urn:user',
      'odrl:refinement': { '@type': 'odrl:LogicalConstraint', 'odrl:and': assigneeConstraints }
    }
  }
});

export const TEMPLATES: PolicyTemplate[] = [
  {
    id: 'credentials',
    title: { es: 'Política de credenciales (qué credencial pide el verificador)', en: 'Credentials policy (what the verifier asks for)' },
    when: {
      es: 'Siempre. Es la característica de tipo **Credentials Configuration**. Indica el tipo de credencial y los roles que se aceptan. Pon en `allowedValues` **todos** los roles que quieras admitir en este servicio.',
      en: 'Always. This is the **Credentials Configuration** characteristic. It states the credential type and the accepted roles. Put **every** role you want to admit for this service in `allowedValues`.'
    },
    title_file: 'politica-de-credenciales.json',
    json: {
      credentialsType: 'ServiceCredential',
      claims: [{
        name: 'roles',
        path: '$.roles[?(@.target=="roles-dataspace")].names[*]',
        allowedValues: ['<rol_usuario>', '<rol_administrador>']
      }]
    }
  },
  {
    id: 'role-path',
    title: { es: 'Cualquier organización con un rol, sobre una ruta', en: 'Any organisation with a role, on a path' },
    when: {
      es: 'Para servicios web (un panel, una API). Pueden entrar los usuarios con una `ServiceCredential` que lleve el rol indicado, sea cual sea su organización. Es una política **abierta** por rol.',
      en: 'For web services (a dashboard, an API). Users with a `ServiceCredential` carrying the given role can enter, whatever their organisation. It is a **role-based, open** policy.'
    },
    title_file: 'politica-odrl-rol-ruta.json',
    json: policy(
      'https://<tu-organizacion>.pgtec-vrain-dataspace.eu/policy/<servicio>/acceso-rol',
      pathTarget('/<ruta-del-servicio>'),
      [constraint('vc:role', 'odrl:hasPart', '<rol_usuario>'), constraint('vc:type', 'odrl:hasPart', 'ServiceCredential')]
    )
  },
  {
    id: 'party',
    title: { es: 'Solo una organización o emisor concreto (currentParty)', en: 'Only one specific organisation or issuer (currentParty)' },
    when: {
      es: 'Cuando el acceso es para una organización determinada, por ejemplo la que ha comprado la oferta o el emisor de credenciales de ciudadanía. Añade a la plantilla anterior la condición `vc:currentParty`. Cuando alguien **compra** la oferta, el contract-management crea esta política automáticamente con el DID del comprador.',
      en: 'When access is for one particular organisation, for example the one that bought the offer or the citizens credential issuer. It adds the `vc:currentParty` condition to the previous template. When someone **buys** the offer, the contract-management creates this policy automatically with the buyer\'s DID.'
    },
    title_file: 'politica-odrl-organizacion.json',
    json: policy(
      'https://<tu-organizacion>.pgtec-vrain-dataspace.eu/policy/<servicio>/acceso-organizacion',
      pathTarget('/<ruta-del-servicio>'),
      [
        constraint('vc:currentParty', 'odrl:eq', 'did:web:<organizacion-o-emisor>.pgtec-vrain-dataspace.eu'),
        constraint('vc:role', 'odrl:hasPart', '<rol_usuario>'),
        constraint('vc:type', 'odrl:hasPart', 'ServiceCredential')
      ]
    )
  },
  {
    id: 'ngsi-ld',
    title: { es: 'Datos NGSI-LD de un tipo de entidad', en: 'NGSI-LD data of one entity type' },
    when: {
      es: 'Para publicar **datos** (no un servicio web). En vez de una ruta se limita por tipo de entidad, por ejemplo `WeatherObserved`. Pensada para acceso automático de máquina con una `MachineCredential`.',
      en: 'To publish **data** (not a web service). Instead of a path it is limited by entity type, for example `WeatherObserved`. Meant for automatic machine access with a `MachineCredential`.'
    },
    title_file: 'politica-odrl-datos-ngsi-ld.json',
    json: policy(
      'https://<tu-organizacion>.pgtec-vrain-dataspace.eu/policy/<datos>/acceso-datos',
      {
        '@type': 'odrl:AssetCollection', 'odrl:source': 'urn:asset',
        'odrl:refinement': { '@type': 'odrl:Constraint', 'odrl:leftOperand': 'ngsi-ld:entityType', 'odrl:operator': 'odrl:eq', 'odrl:rightOperand': '<TipoDeEntidad>' }
      },
      [constraint('vc:role', 'odrl:hasPart', '<rol_usuario>'), constraint('vc:type', 'odrl:hasPart', 'MachineCredential')]
    )
  }
];

// ---------------------------------------------------------------------------------------------
// Guía 1: publicar datos o servicios
// ---------------------------------------------------------------------------------------------

export const PUBLISH: GuideSection[] = [
  {
    id: 'requirements',
    title: { es: '1. Antes de empezar', en: '1. Before you start' },
    md: {
      es: `Para publicar necesitas:

- Que tu organización esté **adherida** al espacio de datos (portal de adhesión).
- Poder **iniciar sesión** en el marketplace con tu wallet o con certificado digital.
- Que tu organización tenga desplegado su **contract-management**, el componente que, al aprobarse una solicitud, da acceso al comprador. Si no lo tienes, pídelo al equipo del espacio de datos.

Una vez dentro, comprueba arriba a la derecha con qué organización estás actuando («Actuando como»). Todo lo que hagas se guarda a nombre de esa organización.`,
      en: `To publish you need:

- Your organisation to be **onboarded** to the data space (onboarding portal).
- To be able to **sign in** to the marketplace with your wallet or a digital certificate.
- Your organisation to have its **contract-management** deployed. It is the component that, when a request is approved, grants access to the buyer. If you don't have one, ask the data space team.

Once inside, check at the top right which organisation you are acting as ("Acting as"). Everything you do is saved on behalf of that organisation.`
    }
  },
  {
    id: 'profile',
    title: { es: '2. Completa el perfil: dos cosas imprescindibles', en: '2. Complete the profile: two essential things' },
    md: {
      es: `En el menú de usuario abre **Perfil** y, en los datos de la organización, rellena **dos cosas**. Sin ellas, la publicación no funciona del todo:

**a) Campos del contract-management**

- **Contract Management Address**: la URL pública del contract-management de tu organización, con el formato \`https://contract-management-<tu-organizacion>.pgtec-vrain-dataspace.eu\` (por ejemplo, \`https://contract-management-vrain.pgtec-vrain-dataspace.eu\`).
- **Contract Management Client ID**: \`contract-management\`.
- **Contract Management Scopes**: \`external-marketplace\`.

Sin estos campos, cuando alguien compre tu oferta no se creará el acceso.

**b) Correo electrónico**

En *Información de contacto*, añade un medio de contacto de tipo **Email** (y márcalo como preferido). **Si no hay un correo en el perfil, no recibirás ningún aviso**: ni las solicitudes de acceso a tus ofertas ni los cambios de estado de tus propias compras.

Guarda los cambios con **Actualizar**.`,
      en: `In the user menu open **Profile** and, in the organisation data, fill in **two things**. Without them publishing does not fully work:

**a) Contract-management fields**

- **Contract Management Address**: the public URL of your organisation's contract-management, in the form \`https://contract-management-<your-organisation>.pgtec-vrain-dataspace.eu\` (for example, \`https://contract-management-vrain.pgtec-vrain-dataspace.eu\`).
- **Contract Management Client ID**: \`contract-management\`.
- **Contract Management Scopes**: \`external-marketplace\`.

Without these fields, when someone buys your offer the access will not be created.

**b) Email address**

Under *Contact information*, add a contact medium of type **Email** (and mark it as preferred). **If there is no email in the profile you will not receive any notification**: neither access requests for your offers nor status changes of your own purchases.

Save the changes with **Update**.`
    }
  },
  {
    id: 'catalog',
    title: { es: '3. Crea un catálogo', en: '3. Create a catalogue' },
    md: {
      es: `En **Mis ofertas** > **Catálogos** pulsa **Añadir catálogo** y ponle nombre y descripción. Es la «estantería» donde aparecerán tus ofertas. Si ya tienes uno, puedes reutilizarlo.`,
      en: `In **My offerings** > **Catalogues** press **Add new catalogue** and give it a name and description. It is the "shelf" where your offers will appear. If you already have one you can reuse it.`
    }
  },
  {
    id: 'spec',
    title: { es: '4. Describe el producto (especificación de producto)', en: '4. Describe the product (product specification)' },
    md: {
      es: `En **Mis ofertas** > **Especificaciones de producto** pulsa **Añadir especificación de producto**.

1. Rellena nombre, versión, marca y **descripción**. En la descripción (admite Markdown) explica qué ofreces y pon el **enlace de acceso** al servicio.
2. En el paso **Características**, crea las dos características que controlan el acceso:
   - **Política de credenciales**, de tipo **Credentials Configuration**: qué credencial y qué roles se aceptan (plantilla 1).
   - **Política ODRL**, de tipo **Authorization Policy**: quién puede hacer qué (plantillas 2, 3 o 4).
3. Termina con **Crear producto**.

> Lo que cuenta para el contract-management es el **tipo** de cada característica, no su nombre. Pega el JSON tal cual, sin envolverlo en otra estructura. Puedes copiar las plantillas de la pestaña *Plantillas ODRL*.`,
      en: `In **My offerings** > **Product specifications** press **Add new product specification**.

1. Fill in name, version, brand and **description**. In the description (Markdown is supported) explain what you offer and add the **access link** to the service.
2. In the **Characteristics** step, create the two characteristics that control access:
   - **Credentials policy**, of type **Credentials Configuration**: which credential and which roles are accepted (template 1).
   - **ODRL policy**, of type **Authorization Policy**: who can do what (templates 2, 3 or 4).
3. Finish with **Create product**.

> What matters to the contract-management is the **type** of each characteristic, not its name. Paste the JSON as it is, without wrapping it in another structure. You can copy the templates from the *ODRL templates* tab.`
    }
  },
  {
    id: 'offer',
    title: { es: '5. Publica la oferta', en: '5. Publish the offer' },
    md: {
      es: `En **Mis ofertas** > **Ofertas** pulsa **Añadir oferta de producto**:

1. Elige el **catálogo**, la **categoría** y la **especificación de producto** del paso anterior.
2. Añade un **plan de precios**. Si no añades ninguno, la oferta es **gratuita**.
3. Escribe la **licencia** o términos y condiciones: es lo que el comprador acepta al solicitar.
4. Deja la oferta en estado **Publicado** (*Launched*) para que se vea en el catálogo.

Abre la oferta como la vería un cliente y comprueba que las políticas se leen bien: la página las muestra explicadas en frases, con el JSON detrás del icono **(i)**.`,
      en: `In **My offerings** > **Offers** press **Add new product offer**:

1. Choose the **catalogue**, the **category** and the **product specification** from the previous step.
2. Add a **price plan**. If you add none, the offer is **free**.
3. Write the **licence** or terms and conditions: it is what the buyer accepts when requesting.
4. Leave the offer in **Launched** status so it shows in the catalogue.

Open the offer as a customer would see it and check the policies read well: the page shows them explained in sentences, with the JSON behind the **(i)** icon.`
    }
  },
  {
    id: 'requests',
    title: { es: '6. Recibe y acepta solicitudes', en: '6. Receive and accept requests' },
    md: {
      es: `Cuando una organización solicita tu oferta:

- Recibes un **correo** (si tu perfil tiene Email) y la solicitud aparece en **Pedidos** > **Como proveedor**.
- Abre el pedido y cambia el estado del elemento: *Recibida* (acusas recibo), *En tramitación* y, para **aceptar el uso**, *Completada*.
- Al pasar a *Completada* el contract-management crea la política en tu servidor y da de alta al comprador, que ya puede acceder. El comprador recibe un correo.
- Si rechazas la solicitud, márcala como *Fallida* o *Cancelada*; el comprador también recibe un correo.

> No uses *En tramitación* para «reintentar» un pedido ya completado: el contract-management lo interpreta como una **revocación** del acceso.

Además, el dueño del espacio de datos recibe cada mes un **resumen** de actividad.`,
      en: `When an organisation requests your offer:

- You receive an **email** (if your profile has an Email) and the request appears in **Orders** > **As provider**.
- Open the order and change the item status: *Received* (acknowledge), *In progress* and, to **accept the use**, *Completed*.
- When it moves to *Completed* the contract-management creates the policy on your server and registers the buyer, who can then access. The buyer receives an email.
- If you reject the request, mark it as *Failed* or *Cancelled*; the buyer also receives an email.

> Do not use *In progress* to "retry" an already completed order: the contract-management reads it as an access **revocation**.

In addition, the data space owner receives a monthly activity **summary**.`
    }
  },
  {
    id: 'troubleshooting',
    title: { es: '7. Si algo no funciona', en: '7. If something does not work' },
    md: {
      es: `- **No recibes correos**: falta el Email en el perfil (paso 2b) o el aviso ha caído en spam. Los avisos pueden tardar un par de minutos.
- **El comprador no puede entrar tras aceptar**: comprueba los campos del contract-management del perfil (2a) y que las dos características de la especificación tienen el tipo correcto y el JSON sin envolver.
- **La política se ve como JSON sin explicar**: el marketplace no reconoce algún patrón. Pulsa **(i)** para ver el JSON y avisa al equipo.
- **Cambiaste una característica y no hace efecto**: las compras anteriores conservan la política con la que se hicieron; el cambio vale para compras nuevas.`,
      en: `- **You get no emails**: the Email is missing from the profile (step 2b) or the message went to spam. Notifications can take a couple of minutes.
- **The buyer cannot get in after acceptance**: check the contract-management fields of the profile (2a) and that the two characteristics of the specification have the right type and unwrapped JSON.
- **The policy shows as unexplained JSON**: the marketplace does not recognise some pattern. Press **(i)** to see the JSON and tell the team.
- **You changed a characteristic and nothing happens**: previous purchases keep the policy they were made with; the change applies to new purchases.`
    }
  }
];

// ---------------------------------------------------------------------------------------------
// Guía 2: consumir datos o servicios
// ---------------------------------------------------------------------------------------------

export const CONSUME: GuideSection[] = [
  {
    id: 'access',
    title: { es: '1. Entra en el marketplace', en: '1. Sign in to the marketplace' },
    md: {
      es: `Puedes **explorar el catálogo sin iniciar sesión**. Para solicitar una oferta necesitas:

- Que tu organización esté **adherida** al espacio de datos (portal de adhesión).
- **Iniciar sesión** con tu wallet (OID4VP) o con certificado digital.
- Tener un **correo electrónico en el perfil** de tu organización (menú de usuario > Perfil > Información de contacto > Email). **Sin él no recibirás los avisos** de tus solicitudes.`,
      en: `You can **browse the catalogue without signing in**. To request an offer you need:

- Your organisation to be **onboarded** to the data space (onboarding portal).
- To **sign in** with your wallet (OID4VP) or a digital certificate.
- An **email address in your organisation's profile** (user menu > Profile > Contact information > Email). **Without it you will not receive notifications** about your requests.`
    }
  },
  {
    id: 'policies',
    title: { es: '2. Qué política te aplica según quién seas', en: '2. Which policy applies to you depending on who you are' },
    md: {
      es: `Cada oferta muestra, en **Características del producto**, dos políticas explicadas en frases:

- **Política de credenciales**: qué tipo de credencial debes presentar y con qué rol.
- **Política ODRL**: quién puede usar el servicio o los datos y bajo qué condiciones.

Lee las frases (el JSON está detrás del icono **(i)**) y compara con tu caso:

| Quién eres | Qué se te pide | Cómo lo consigues |
|---|---|---|
| **Organización adherida** que usa un servicio web | Una \`ServiceCredential\` con el rol de la oferta (por ejemplo \`tetis_user\`) | Al **comprar** la oferta se crea tu acceso con tu DID |
| **Organización adherida** que consume datos automáticamente | Una \`MachineCredential\` con el rol de la oferta | Igual: al comprar la oferta |
| **Ciudadanía** | Una credencial emitida por el emisor de ciudadanía, con el rol del servicio | Políticas específicas de ciudadanía; no se compran en el marketplace |
| **Usuario con otro rol** (p. ej. administrador del servicio) | El rol más alto, si la oferta lo prevé (por ejemplo \`tetis_admin\`) | Pídelo al proveedor |

Si en la política aparece «Actúa en nombre de la organización …», solo esa organización puede entrar. Si no aparece, puede entrar cualquiera con el rol.`,
      en: `Each offer shows, under **Product characteristics**, two policies explained in sentences:

- **Credentials policy**: which type of credential you must present and with which role.
- **ODRL policy**: who can use the service or data and under which conditions.

Read the sentences (the JSON is behind the **(i)** icon) and compare with your case:

| Who you are | What is asked of you | How you get it |
|---|---|---|
| **Onboarded organisation** using a web service | A \`ServiceCredential\` with the offer's role (for example \`tetis_user\`) | When you **buy** the offer your access is created with your DID |
| **Onboarded organisation** consuming data automatically | A \`MachineCredential\` with the offer's role | Same: when buying the offer |
| **Citizens** | A credential issued by the citizens issuer, with the service role | Citizen-specific policies; they are not bought in the marketplace |
| **User with another role** (e.g. service administrator) | The higher role, if the offer provides one (for example \`tetis_admin\`) | Ask the provider |

If the policy says "Acts on behalf of the organisation …", only that organisation can enter. If it does not, anyone with the role can.`
    }
  },
  {
    id: 'buy',
    title: { es: '3. Solicita la oferta', en: '3. Request the offer' },
    md: {
      es: `1. Abre la oferta y pulsa **Añadir al carrito**.
2. Elige el **plan de precios** (si lo hay) y las **características** que necesites.
3. Lee y **acepta los términos y condiciones**.
4. Ve al carrito y finaliza la compra. Si la oferta es gratuita no hay pago.

Recibirás un correo confirmando que tu solicitud se ha registrado.`,
      en: `1. Open the offer and press **Add to cart**.
2. Choose the **price plan** (if any) and the **characteristics** you need.
3. Read and **accept the terms and conditions**.
4. Go to the cart and complete the purchase. If the offer is free there is no payment.

You will receive an email confirming your request has been registered.`
    }
  },
  {
    id: 'follow',
    title: { es: '4. Sigue el estado y usa el servicio', en: '4. Follow the status and use the service' },
    md: {
      es: `En **Pedidos** > **Como consumidor** ves el estado de cada solicitud. Además, **cada vez que cambie** recibirás un correo:

- **Recibida**: el proveedor ha visto tu solicitud.
- **En tramitación**: la está gestionando.
- **Completada**: **aceptada**. Ya puedes usar el servicio o los datos con la credencial.
- **Fallida / Cancelada**: rechazada o cancelada.

Puedes **cancelar** una solicitud mientras todos sus elementos estén en *Recibida*.

Una vez aceptada, entra en el servicio (el enlace está en la descripción de la oferta) con tu wallet o certificado. Si te rechaza el acceso, comprueba que tu credencial lleva el rol de la oferta y espera un par de minutos.`,
      en: `Under **Orders** > **As customer** you see the status of each request. In addition, **every time it changes** you will get an email:

- **Received**: the provider has seen your request.
- **In progress**: it is being handled.
- **Completed**: **accepted**. You can now use the service or data with your credential.
- **Failed / Cancelled**: rejected or cancelled.

You can **cancel** a request while all its items are *Received*.

Once accepted, enter the service (the link is in the offer description) with your wallet or certificate. If access is refused, check that your credential carries the offer's role and wait a couple of minutes.`
    }
  }
];
