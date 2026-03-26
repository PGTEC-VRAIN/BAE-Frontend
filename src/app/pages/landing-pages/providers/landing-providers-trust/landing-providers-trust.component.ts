import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faDatabase, faFileArrowDown, faFlag, faShieldCheck } from '@fortawesome/pro-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

interface TrustCard {
  titleKey: string;
  descriptionKey: string;
  icon: any;
  alignEnd?: boolean;
}

@Component({
  selector: "app-landing-page-providers-trust",
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: "./landing-providers-trust.component.html",
  styleUrl: "./landing-providers-trust.component.css"
})
export class LandingPageProvidersTrustComponent {
  leftCards: TrustCard[] = [
    {
      titleKey: 'LANDINGPAGE.providers.trust.cards.euBasedProviders.title',
      descriptionKey: 'LANDINGPAGE.providers.trust.cards.euBasedProviders.description',
      icon: faFlag,
      alignEnd: true
    },
    {
      titleKey: 'LANDINGPAGE.providers.trust.cards.transparency.title',
      descriptionKey: 'LANDINGPAGE.providers.trust.cards.transparency.description',
      icon: faShieldCheck
    }
  ];

  rightCards: TrustCard[] = [
    {
      titleKey: 'LANDINGPAGE.providers.trust.cards.trustedSourcing.title',
      descriptionKey: 'LANDINGPAGE.providers.trust.cards.trustedSourcing.description',
      icon: faFileArrowDown
    },
    {
      titleKey: 'LANDINGPAGE.providers.trust.cards.dataSovereignty.title',
      descriptionKey: 'LANDINGPAGE.providers.trust.cards.dataSovereignty.description',
      icon: faDatabase
    }
  ];
}
