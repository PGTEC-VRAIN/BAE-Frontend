import { NavLink, ThemeConfig } from './theme.interfaces';

const pgtecHeaderLinks: NavLink[] = [
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
    label: 'HEADER._onboarding',
    url: 'https://onboarding.pgtec-vrain-dataspace.eu/',
    isRouterLink: false
  }
];


export const PGTEC_THEME_CONFIG: ThemeConfig = {
  name: 'PGTEC',
  displayName: 'PGTEC Marketplace',
  browserTitle: 'PGTEC Marketplace',
  assets: {
    logoUrl: 'assets/themes/pgtec/logo_PGTEC_mark.png',
    faviconUrl: 'assets/themes/pgtec/logo_PGTEC.svg',
    heroUrl: 'assets/themes/pgtec/logo_PGTEC_mark.png'
  },
  links: {
    headerLinks: pgtecHeaderLinks,
    projectUrl: 'https://pgtec.webs.upv.es/',
    github: 'https://github.com/PGTEC-VRAIN',
  },
  dashboard: {
    showFeaturedOfferings: true,
    showPlatformBenefits: false,
  },
  lightHeader: true,
  colorSchemeToggle: true
};
