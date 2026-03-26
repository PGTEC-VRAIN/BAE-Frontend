import { Component } from "@angular/core";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCircleCheck, faFileLines, faGlobe, faTableCellsLarge, faThumbsUp, IconDefinition } from '@fortawesome/pro-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

type ValueItem = {
  key: string;
};

type InfoCard = {
  titleKey: string;
  descKey: string;
  icon: IconDefinition;
};

@Component({
  selector: "app-landing-customers-trusted",
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: "./landing-customers-trusted.component.html",
  styleUrl: "./landing-customers-trusted.component.css"
})
export class LandingCustomersTrustedComponent {
  faCircleCheck = faCircleCheck;

  values: ValueItem[] = [
    { key: "LANDINGPAGE.customers.trusted.values.trustStandardised" },
    { key: "LANDINGPAGE.customers.trusted.values.evidenceVisible" },
    { key: "LANDINGPAGE.customers.trusted.values.comparisonSimplified" },
  ];

  leftCards: InfoCard[] = [
    {
      titleKey: "LANDINGPAGE.customers.trusted.cards.verifiedServices.title",
      descKey: "LANDINGPAGE.customers.trusted.cards.verifiedServices.desc",
      icon: faTableCellsLarge,
    },
    {
      titleKey: "LANDINGPAGE.customers.trusted.cards.trustIndicators.title",
      descKey: "LANDINGPAGE.customers.trusted.cards.trustIndicators.desc",
      icon: faThumbsUp,
    },
  ];

  rightCards: InfoCard[] = [
    {
      titleKey: "LANDINGPAGE.customers.trusted.cards.documentation.title",
      descKey: "LANDINGPAGE.customers.trusted.cards.documentation.desc",
      icon: faFileLines,
    },
    {
      titleKey: "LANDINGPAGE.customers.trusted.cards.crossBorderAccess.title",
      descKey: "LANDINGPAGE.customers.trusted.cards.crossBorderAccess.desc",
      icon: faGlobe,
    },
  ];
}
