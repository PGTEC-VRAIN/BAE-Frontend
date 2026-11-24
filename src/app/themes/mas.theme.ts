import { NavLink, ThemeConfig } from './theme.interfaces';

/*
 * MAS theme: marketplace of AI agents for the multi-agent system (MAS) of the data space.
 * Dark-only, network-of-agents look. Activate it with BAE_LP_THEME=MAS in the logic proxy
 * (or "theme": "MAS" in assets/config.json when the /config endpoint is not available).
 */
const masHeaderLinks: NavLink[] = [
  {
    label: 'HEADER._home',
    url: '/',
    isRouterLink: true
  },
  {
    label: 'HEADER._browse',
    id: 'searchDropdown', // ID para el toggle de Flowbite
    children: [
      { label: 'HEADER._services', url: '/search', isRouterLink: true },
      { label: 'HEADER._catalogs', url: '/catalogues', isRouterLink: true }
    ]
  },
  {
    label: 'PGTEC._guides',
    url: '/guides',
    isRouterLink: true
  },
  {
    label: 'HEADER._onboarding',
    url: 'https://onboarding.pgtec-vrain-dataspace.eu/',
    isRouterLink: false
  }
];

export const MAS_THEME_CONFIG: ThemeConfig = {
  name: 'MAS',
  displayName: 'MAS Agent Marketplace',
  browserTitle: 'MAS · Agent Marketplace',
  assets: {
    logoUrl: 'assets/themes/mas/mas-logo.svg',
    faviconUrl: 'assets/themes/mas/mas-favicon.svg',
    offerPlaceholderUrl: 'assets/themes/mas/agent-placeholder.svg'
  },
  links: {
    headerLinks: masHeaderLinks,
    projectUrl: 'https://pgtec.webs.upv.es/',
    github: 'https://github.com/PGTEC-VRAIN',
  },
  dashboard: {
    showFeaturedOfferings: true,
    showPlatformBenefits: false,
    heroStats: 'cards',
    motion: 'agent-mesh',
  },
  hideCompliance: true,
  forceDarkMode: true,
  agentCards: true,
  features: {
    colorSchemeSelector: false,
    darkMode: true,
  },
  metaTags: [
    { name: 'theme-color', content: '#060914' },
    { name: 'color-scheme', content: 'dark' }
  ]
};
