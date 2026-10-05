import { NgClass } from '@angular/common';
import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, NgZone, OnDestroy, OnInit, SecurityContext, ViewChild } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { initFlowbite } from 'flowbite';
import * as moment from 'moment';
import { map, Subject, takeUntil } from 'rxjs';
import { LoginInfo } from 'src/app/models/interfaces';
import { ProductOffering } from 'src/app/models/product.model';
import { FeaturedComponent } from 'src/app/offerings/featured/featured.component';
import { EventMessageService } from 'src/app/services/event-message.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { LoginServiceService } from 'src/app/services/login-service.service';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { StatsServiceService } from 'src/app/services/stats-service.service';
import { ThemeService } from 'src/app/services/theme.service';
import { ThemeConfig } from 'src/app/themes';
import { environment } from 'src/environments/environment';
import { DashboardCustomersComponent } from './dashboard-customers/dashboard-customers.component';
import { DashboardEcosystemComponent } from './dashboard-ecosystem/dashboard-ecosystem.component';
import { DashboardHeroComponent } from './dashboard-hero/dashboard-hero.component';
import { DashboardProvidersComponent } from './dashboard-providers/dashboard-providers.component';
import { DashboardServicesComponent } from './dashboard-services/dashboard-services.component';
import { DashboardStatsComponent } from './dashboard-stats/dashboard-stats.component';
import { DashboardWhatsDome } from './dashboard-whatsdome/dashboard-whatsdome.component';
import { HeroMosaicComponent } from './landing-motion/hero-mosaic.component';
import { ProviderLogoComponent } from './landing-motion/provider-logo.component';

export interface IDashboardStats {
  services: number;
  providers: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: [
    './dashboard.onboarding.component.css',
    './dashboard.search.component.css',
    './dashboard.sections.component.css'
  ],
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, FeaturedComponent, NgClass, DashboardWhatsDome, DashboardHeroComponent, DashboardStatsComponent, DashboardServicesComponent, DashboardCustomersComponent, DashboardProvidersComponent, DashboardEcosystemComponent, HeroMosaicComponent, ProviderLogoComponent],
})
export class DashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  customersLink = 'https://citcomtef.eu/';
  providersLink = "https://onboard.sbx.evidenceledger.eu/register-provider";


  private unSub = new Subject<void>();
  productOfferings?: ProductOffering[];
  protected MAX_CATEGORIES_PER_PRODUCT_OFFERING = 3;

  providerThemeName = environment.providerThemeName;
  currentTheme: ThemeConfig | null = null;

  private rotationIntervalId?: ReturnType<typeof setInterval>;

  isFilterPanelShown = false;
  searchField = new FormControl();
  searchEnabled = environment.SEARCH_ENABLED;
  catalogSearchTerm = '';

  benefits = [1, 2, 3].map((n) => ({
    title: `DASHBOARD.landing._benefit${n}_title`,
    text: `DASHBOARD.landing._benefit${n}_text`
  }));

  domeRegister: string = environment.DOME_REGISTER_LINK;

  services: string[] = [];
  publishers: string[] = [];
  currentIndexServ = 0;
  currentIndexPub = 0;
  delay = 2000;

  stats?: IDashboardStats;

  // Hero card counters, animated from zero when the theme enables landing motion
  shownServices = 0;
  shownProviders = 0;

  @ViewChild('searchInput') searchInput?: ElementRef<HTMLInputElement>;

  private countFrame = 0;
  private typingId?: ReturnType<typeof setInterval>;
  private readonly reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

  constructor(
    private productService: ApiServiceService,
    private domSanitizer: DomSanitizer,
    private route: ActivatedRoute,
    private loginService: LoginServiceService,
    private localStorage: LocalStorageService,
    private eventMessage: EventMessageService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private statsService: StatsServiceService,
    private themeService: ThemeService,
    private translate: TranslateService,
    private zone: NgZone,
  ) { }

  // Landing animations based on the PGTEC logo's data line
  get motion(): boolean {
    return this.currentTheme?.dashboard?.motion === 'data-line';
  }

  get projectUrl(): string {
    return this.currentTheme?.links?.projectUrl ?? this.customersLink;
  }

  // Themes can move the hero metrics out of the image into cards under the actions
  get heroStatCards(): boolean {
    return this.currentTheme?.dashboard?.heroStats === 'cards';
  }

  get heroUrl(): string {
    return this.currentTheme?.assets?.heroUrl ?? 'assets/themes/citcom/onboarding-hero.webp';
  }

  ngOnInit() {
    this.themeService.currentTheme$.pipe(takeUntil(this.unSub)).subscribe((theme) => {
      this.currentTheme = theme;
    });

    this.getFirstThreeRandomProductOfferings();
    this.checkRouteForToken();
    this.getStats();
  }

  ngAfterViewInit() {
    if (this.motion && !this.reduceMotion) {
      this.startSearchExamples();
    }
  }

  private startTagTransition() {
    if (this.rotationIntervalId) {
      clearInterval(this.rotationIntervalId);
    }

    this.rotationIntervalId = setInterval(() => {
      if (this.services.length > 0) {
        this.currentIndexServ = (this.currentIndexServ + 1) % this.services.length;
      }
      if (this.publishers.length > 0) {
        this.currentIndexPub = (this.currentIndexPub + 1) % this.publishers.length;
      }
    }, this.delay);
  }

  private getStats() {
    this.statsService.getStats().then((data) => {
      this.services = data?.services || [];
      this.publishers = data?.organizations || [];

      this.stats = {
        services: this.services.length,
        providers: this.publishers.length,
      };

      this.countUp(this.services.length, this.publishers.length);
      this.startTagTransition();
    });
  }

  private countUp(services: number, providers: number) {
    cancelAnimationFrame(this.countFrame);
    if (!this.motion || this.reduceMotion) {
      this.shownServices = services;
      this.shownProviders = providers;
      return;
    }

    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / 1200);
      const eased = 1 - Math.pow(1 - progress, 3);
      this.shownServices = Math.round(services * eased);
      this.shownProviders = Math.round(providers * eased);
      if (progress < 1) {
        this.countFrame = requestAnimationFrame(step);
      }
    };
    this.countFrame = requestAnimationFrame(step);
  }

  // Types example searches into the placeholder of the empty search box. It writes the DOM
  // directly outside Angular, and shows the normal placeholder while the box is in use.
  private startSearchExamples() {
    let examples: string[] = [];
    this.translate.stream('DASHBOARD.landing._search_examples').pipe(takeUntil(this.unSub)).subscribe((value) => {
      examples = Array.isArray(value) ? value : [];
    });

    const secondsPerExample = 4;
    const tick = 0.06;
    let elapsed = 0;
    this.zone.runOutsideAngular(() => {
      this.typingId = setInterval(() => {
        const input = this.searchInput?.nativeElement;
        if (!input || examples.length === 0) {
          return;
        }

        let placeholder: string;
        if (document.activeElement === input || input.value) {
          placeholder = this.translate.instant('DASHBOARD._search_ph');
        } else {
          elapsed += tick;
          const text = examples[Math.floor(elapsed / secondsPerExample) % examples.length];
          const local = elapsed % secondsPerExample;
          placeholder = text.slice(0, Math.floor(local * 18));
        }

        if (input.placeholder !== placeholder) {
          input.placeholder = placeholder;
        }
      }, tick * 1000);
    });
  }

  private checkRouteForToken() {
    if (this.route.snapshot.queryParamMap.get('token') != null) {
      this.loginService.getLogin(this.route.snapshot.queryParamMap.get('token')).then((data) => {
        const info = {
          id: data.id,
          user: data.username,
          email: data.email,
          token: data.accessToken,
          expire: data.expire,
          partyId: data.partyId,
          roles: data.roles,
          organizations: data.organizations,
          logged_as: data.id,
        } as LoginInfo;

        // Using organization session by default if provided
        if (info.organizations != null && info.organizations.length > 0) {
          info.logged_as = info.organizations[0].id;
        }

        this.localStorage.addLoginInfo(info);
        this.eventMessage.emitLogin(info);
        initFlowbite();
      });
      this.router.navigate(['/dashboard']);
    } else {
      const aux = this.localStorage.getObject('login_items') as LoginInfo;
      if (JSON.stringify(aux) != '{}') {
        console.log(aux);
        console.log('moment');
        console.log(aux['expire']);
        console.log(moment().unix());
        console.log(aux['expire'] - moment().unix());
        console.log(aux['expire'] - moment().unix() <= 5);
      }
    }

    this.cdr.detectChanges();
    console.log('----')
  }

  private getFirstThreeRandomProductOfferings(): void {
    this.productService
      .getAllProducts()
      .pipe(
        map((items) =>
          items.map((el) => ({
            ...el,
            description: el.description
              ? (this.domSanitizer.sanitize(SecurityContext.HTML, el.description) ?? undefined)
              : el.description,
          })),
        ),
        map((items) => {
          const result = new Set<number>();
          const max = Math.min(15, items.length);

          while (result.size < max) {
            result.add(Math.floor(Math.random() * items.length));
          }

          return [...result].map((i) => items[i]);
        }),
        takeUntil(this.unSub),
      )
      .subscribe((picked) => {
        this.productService.getProductsDetails(picked).then((data) => {
          this.productOfferings = (data as ProductOffering[]).filter((offering) =>
            offering.attachment?.some(
              (a) => a.attachmentType === 'Picture' || a.name === 'Profile Picture'
            )
          );
        })
      });
  }

  goToSearch() {
    this.router.navigate(['/search']);
  }

  goToOffering(offering: ProductOffering) {
    this.router.navigate(['/search', offering.id]);
  }

  // Same image selection as the offering cards: profile picture first, then any picture
  getOfferingImage(offering: ProductOffering): string {
    const attachments = offering?.attachment ?? [];
    const profile = attachments.filter((a) => a.name === 'Profile Picture');
    const pictures = profile.length > 0 ? profile : attachments.filter((a) => a.attachmentType === 'Picture');
    return pictures.at(0)?.url ?? 'https://placehold.co/600x400/svg';
  }

  getOfferingCategory(offering: ProductOffering): string | undefined {
    return offering?.category?.find((c) => !!c?.name)?.name;
  }

  filterSearch(event: Event) {
    event.preventDefault();
    this.catalogSearchTerm = (this.searchField.value ?? '').toString().trim();
  }

  onSearchInput() {
    this.catalogSearchTerm = (this.searchField.value ?? '').toString().trim();
  }

  hasLongWord(str: string | undefined, threshold = 20) {
    if (str) {
      return str.split(/\s+/).some((word) => word.length > threshold);
    }
    return false;
  }

  ngOnDestroy() {
    if (this.rotationIntervalId) {
      clearInterval(this.rotationIntervalId);
    }
    clearInterval(this.typingId);
    cancelAnimationFrame(this.countFrame);

    this.unSub.next();
    this.unSub.complete();
  }
}
