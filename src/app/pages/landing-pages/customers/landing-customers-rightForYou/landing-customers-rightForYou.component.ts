import { Component } from "@angular/core";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import {
  faBuilding,
  faFileShield,
  faLandmark,
  faScaleBalanced,
  faShieldHalved
} from "@fortawesome/free-solid-svg-icons";
import { TranslateModule } from "@ngx-translate/core";
import { VerticalScrollCardsModule } from '../../../../shared/vertical-scroll-cards/vertical-scroll-cards.module';

type RightForYouCard = {
  titleKey: string;
  descKey: string;
  icon: any;
};

@Component({
  selector: "app-landingpage-customers-right-for-you",
  standalone: true,
  imports: [
    TranslateModule,
    FontAwesomeModule,
    VerticalScrollCardsModule
  ],
  templateUrl: "./landing-customers-rightForYou.component.html",
  styleUrl: "./landing-customers-rightForYou.component.css"
})
export class LandingpageCustomersRightForYouComponent {

  get scrollHeight(): number {
    if (window.innerWidth < 768) return 460
    if (window.innerWidth < 1280) return 540
    return 636
  }

  cards: RightForYouCard[] = [
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._regulatedIndustriesTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._regulatedIndustriesDesc",
      icon: faShieldHalved
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._enterprisesTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._enterprisesDesc",
      icon: faBuilding
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._publicSectorTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._publicSectorDesc",
      icon: faLandmark
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._complianceTeamsTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._complianceTeamsDesc",
      icon: faScaleBalanced
    },
    {
      titleKey: "LANDINGPAGE.customers.rightForYou._structuredProcurementTitle",
      descKey: "LANDINGPAGE.customers.rightForYou._structuredProcurementDesc",
      icon: faFileShield
    }
  ];
}
