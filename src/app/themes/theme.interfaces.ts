export interface ThemeAssetConfig {
  logoUrl: string;
  logoDarkUrl?: string;
  faviconUrl?: string;
  jumboBgUrl?: string;
  cardDefaultBgUrl?: string;
  heroUrl?: string; // Optional: illustration shown in the landing hero
  // other specific theme assets
}

export interface NavHeaderLink {
  label: string;
  navLinks: NavLink[];
}

export interface NavLink {
  label: string; // Text to be shown, ie. 'About Us', 'Contact'
  id?: string; // dropdown ID, ie: 'browseDropdown'
  environmentName?: string;

  // simple link
  url?: string;   // URL or router link
  isRouterLink?: boolean; // true if routerLink, false if external link

  // Dropdown menu links
  children?: NavLink[];

  icon?: string; // Optional: icon next to the link
}

export interface ThemeLinkConfig {
  headerLinks?: NavLink[];
  footerLinks?: NavHeaderLink[];
  footerLinksColsNumber?: number;

  // Social networks
  linkedin?: string;
  github?: string;
  youtube?: string;
  twitter?: string;

  // Add more theme specific links
  privacyPolicy?: string;
  termsOfService?: string;
  contactUs?: string;
  projectUrl?: string; // Optional: public website of the project behind the marketplace
}

export interface ThemeColorsConfig {
  // Optional: to manage base colors from JS moreover from CSS vars
  primary?: string;
  secondary?: string;
}

export interface ThemeAuthUrlsConfig {
  loginUrl?: string; // loginURL
  registerUrl?: string; // registerURL
  // Other possible URLs..
}

export interface DashboardConfig {
  showFeaturedOfferings?: boolean;
  showPlatformBenefits?: boolean;
  heroStats?: 'overlay' | 'cards'; // Landing metrics over the hero image (default) or as cards under the hero actions
  // Add more sections
}


export interface ThemeConfig {
  name: string; // Theme Id, ej: 'DOME', 'OCEAN'
  displayName?: string; // Name to be displayed, ej: 'Dome Marketplace', 'Ocean Breeze'
  browserTitle?: string; // Browser tab title
  isDefault?: boolean; // Optional: sets default theme
  assets: ThemeAssetConfig;
  links?: ThemeLinkConfig;
  authUrls?: ThemeAuthUrlsConfig;
  colors?: ThemeColorsConfig;
  dashboard?: DashboardConfig;
  forceLightMode?: boolean; // Optional: ignore the OS/stored dark preference for this theme
  lightHeader?: boolean; // Optional: white header with brand label instead of the dark glass one
  colorSchemeToggle?: boolean; // Optional: show a light/dark switch in the header
  // More theme specific propierties
}
