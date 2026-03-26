import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faBuildingColumns, faCloud, faPuzzlePiece, faRocket } from '@fortawesome/pro-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';
import { VerticalScrollCardsModule } from '../../../../shared/vertical-scroll-cards/vertical-scroll-cards.module';

type ProviderGoodFitCard = {
  titleKey: string;
  descKey: string;
  icon: any;
};

@Component({
  selector: "app-landing-page-providers-fit",
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule, VerticalScrollCardsModule],
  templateUrl: "./landing-providers-fit.component.html",
  styleUrl: "./landing-providers-fit.component.css"
})
export class LandingPageProvidersFitComponent {
  get scrollHeight(): number {
    if (window.innerWidth < 768) return 460
    if (window.innerWidth < 1280) return 540
    return 636
  }

  cards: ProviderGoodFitCard[] = [
    {
      titleKey: "LANDINGPAGE.providers.goodFit.cards.cloud.title",
      descKey: "LANDINGPAGE.providers.goodFit.cards.cloud.desc",
      icon: faCloud
    },
    {
      titleKey: "LANDINGPAGE.providers.goodFit.cards.saas.title",
      descKey: "LANDINGPAGE.providers.goodFit.cards.saas.desc",
      icon: faPuzzlePiece
    },
    {
      titleKey: "LANDINGPAGE.providers.goodFit.cards.deepTech.title",
      descKey: "LANDINGPAGE.providers.goodFit.cards.deepTech.desc",
      icon: faRocket
    },
    {
      titleKey: "LANDINGPAGE.providers.goodFit.cards.publicSector.title",
      descKey: "LANDINGPAGE.providers.goodFit.cards.publicSector.desc",
      icon: faBuildingColumns
    }
  ];
}
