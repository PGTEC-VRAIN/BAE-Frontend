import { Component, HostListener } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faBadgeCheck,
  faBullhorn,
  faChartColumn,
  faCircleQuestion,
  faCreditCard,
  faGear,
  faGlobe,
  faRocket,
  faShieldHalved
} from '@fortawesome/pro-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { CarouselComponent } from '../../../../shared/carousel/carousel.component';

type ProviderIncludedCard = {
  titleKey: string;
  descriptionKey: string;
  icon: any;
};

@Component({
  selector: 'app-landing-page-providers-included',
  standalone: true,
  templateUrl: './landing-providers-included.component.html',
  styleUrl: './landing-providers-included.component.css',
  imports: [TranslateModule, FontAwesomeModule, CarouselComponent]
})
export class LandingPageProvidersIncludedComponent {
  visibleItems = 3;

  cards: ProviderIncludedCard[] = [
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.onboarding.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.onboarding.description',
      icon: faBadgeCheck
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.procurement.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.procurement.description',
      icon: faRocket
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.trust.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.trust.description',
      icon: faShieldHalved
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.performance.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.performance.description',
      icon: faChartColumn
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.advanced.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.advanced.description',
      icon: faGear
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.commercial.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.commercial.description',
      icon: faCreditCard
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.operational.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.operational.description',
      icon: faCircleQuestion
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.marketing.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.marketing.description',
      icon: faBullhorn
    },
    {
      titleKey: 'LANDINGPAGE.providers.included.cards.federated.title',
      descriptionKey: 'LANDINGPAGE.providers.included.cards.federated.description',
      icon: faGlobe
    }
  ];

  constructor() {
    this.updateVisibleItems();
  }

  @HostListener('window:resize')
  onResize(): void {
    this.updateVisibleItems();
  }

  private updateVisibleItems(): void {

    const width = window.innerWidth;

    if (width < 768) {
      this.visibleItems = 1;
      return;
    }

    if (width < 1280) {
      this.visibleItems = 2;
      return;
    }

    this.visibleItems = 3;
  }
}
