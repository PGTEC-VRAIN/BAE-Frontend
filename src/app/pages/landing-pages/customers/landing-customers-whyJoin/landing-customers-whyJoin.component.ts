import { Component } from "@angular/core";
import { TranslateModule } from "@ngx-translate/core";

type WhyJoinCard = {
  titleStartKey: string;
  titleAccentKey: string;
  titleEndKey?: string;
  descKey: string;
};

@Component({
  selector: "app-landingpage-customers-why-join",
  standalone: true,
  imports: [TranslateModule],
  templateUrl: "./landing-customers-whyJoin.component.html",
})
export class LandingpageCustomersWhyJoinComponent {

  cards: WhyJoinCard[] = [
    {
      titleStartKey: "LANDINGPAGE.customers.whyJoin._dataTitleStart",
      titleAccentKey: "LANDINGPAGE.customers.whyJoin._dataTitleAccent",
      descKey: "LANDINGPAGE.customers.whyJoin._dataDesc"
    },
    {
      titleStartKey: "LANDINGPAGE.customers.whyJoin._crossTitleStart",
      titleAccentKey: "LANDINGPAGE.customers.whyJoin._crossTitleAccent",
      descKey: "LANDINGPAGE.customers.whyJoin._crossDesc"
    },
    {
      titleStartKey: "LANDINGPAGE.customers.whyJoin._riskTitleStart",
      titleAccentKey: "LANDINGPAGE.customers.whyJoin._riskTitleAccent",
      titleEndKey: "LANDINGPAGE.customers.whyJoin._riskTitleEnd",
      descKey: "LANDINGPAGE.customers.whyJoin._riskDesc"
    },
    {
      titleStartKey: "LANDINGPAGE.customers.whyJoin._actionTitleStart",
      titleAccentKey: "LANDINGPAGE.customers.whyJoin._actionTitleAccent",
      descKey: "LANDINGPAGE.customers.whyJoin._actionDesc"
    }
  ];

}
