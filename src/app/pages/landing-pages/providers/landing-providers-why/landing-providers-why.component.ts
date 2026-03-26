import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

interface WhyJoinCard {
  titleKey: string;
  highlightKey: string;
  descriptionKey: string;
}

@Component({
  selector: "app-landing-page-providers-why",
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: "./landing-providers-why.component.html",
  styleUrl: "./landing-providers-why.component.css"
})
export class LandingPageProvidersWhyComponent {
  readonly cards: WhyJoinCard[] = [
    {
      titleKey: 'LANDINGPAGE.providers.whyJoinDome.cards.data.title',
      highlightKey: 'LANDINGPAGE.providers.whyJoinDome.cards.data.highlight',
      descriptionKey: 'LANDINGPAGE.providers.whyJoinDome.cards.data.description'
    },
    {
      titleKey: 'LANDINGPAGE.providers.whyJoinDome.cards.trust.title',
      highlightKey: 'LANDINGPAGE.providers.whyJoinDome.cards.trust.highlight',
      descriptionKey: 'LANDINGPAGE.providers.whyJoinDome.cards.trust.description'
    },
    {
      titleKey: 'LANDINGPAGE.providers.whyJoinDome.cards.easier.title',
      highlightKey: 'LANDINGPAGE.providers.whyJoinDome.cards.easier.highlight',
      descriptionKey: 'LANDINGPAGE.providers.whyJoinDome.cards.easier.description'
    },
    {
      titleKey: 'LANDINGPAGE.providers.whyJoinDome.cards.market.title',
      highlightKey: 'LANDINGPAGE.providers.whyJoinDome.cards.market.highlight',
      descriptionKey: 'LANDINGPAGE.providers.whyJoinDome.cards.market.description'
    }
  ];
}
