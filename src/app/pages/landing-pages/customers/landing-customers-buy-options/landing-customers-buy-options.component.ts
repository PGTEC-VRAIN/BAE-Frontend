import { Component } from "@angular/core";
import { TranslateModule } from '@ngx-translate/core';

type BuyOptionCard = {
  key: string;
  featured?: boolean;
  badgeKey?: string;
};

@Component({
  selector: "app-landing-customers-buy-options",
  standalone: true,
  imports: [TranslateModule],
  templateUrl: "./landing-customers-buy-options.component.html",
  styleUrl: "./landing-customers-buy-options.component.css"
})
export class LandingCustomersBuyOptionsComponent {
  cards: BuyOptionCard[] = [
    {
      key: 'offTheShelf'
    },
    {
      key: 'tailored',
      featured: true,
      badgeKey: 'LANDINGPAGE.customers.buyOptions.cards.tailored._badge'
    },
    {
      key: 'tender'
    }
  ];
}
