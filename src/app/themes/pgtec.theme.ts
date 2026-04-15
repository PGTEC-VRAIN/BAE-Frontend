import {NavLink, ThemeConfig} from './theme.interfaces';
import {environment} from "../../environments/environment";

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
  }
  ];


export const PGTEC_THEME_CONFIG: ThemeConfig = {
  name: 'PGTEC',
  displayName: 'PGTEC Marketplace',
  isDefault: true,
  assets: {
    logoUrl: 'assets/themes/pgtec/logo_PGTEC.png',
    jumboBgUrl: 'assets/themes/pgtec/blueBackground.png',
    cardDefaultBgUrl: 'assets/themes/pgtec/cardBackground.svg'
  },
  links: {
    headerLinks: pgtecHeaderLinks,
  },
  dashboard: {
    showFeaturedOfferings: true,
    showPlatformBenefits: false,
  }
};
