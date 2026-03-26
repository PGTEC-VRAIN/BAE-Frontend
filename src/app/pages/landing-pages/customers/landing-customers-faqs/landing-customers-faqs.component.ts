import { Component } from "@angular/core";
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus, faPlus } from '@fortawesome/pro-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

type FaqItem = {
  id: string;
  questionKey: string;
  answerKey: string;
};

@Component({
  selector: "app-landing-customers-faqs",
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: "./landing-customers-faqs.component.html",
  styleUrl: "./landing-customers-faqs.component.css"
})
export class LandingCustomersFaqsComponent {

  faPlus = faPlus;
  faMinus = faMinus;

  openFaqId = '';

  faqs: FaqItem[] = [
    {
      id: 'eligibility',
      questionKey: 'LANDINGPAGE.customers.faqs._items.eligibility.question',
      answerKey: 'LANDINGPAGE.customers.faqs._items.eligibility.answer'
    },
    {
      id: 'trustworthiness',
      questionKey: 'LANDINGPAGE.customers.faqs._items.trustworthiness.question',
      answerKey: 'LANDINGPAGE.customers.faqs._items.trustworthiness.answer'
    },
    {
      id: 'fee',
      questionKey: 'LANDINGPAGE.customers.faqs._items.fee.question',
      answerKey: 'LANDINGPAGE.customers.faqs._items.fee.answer'
    },
    {
      id: 'process',
      questionKey: 'LANDINGPAGE.customers.faqs._items.process.question',
      answerKey: 'LANDINGPAGE.customers.faqs._items.process.answer'
    },
    {
      id: 'provider',
      questionKey: 'LANDINGPAGE.customers.faqs._items.provider.question',
      answerKey: 'LANDINGPAGE.customers.faqs._items.provider.answer'
    },
    {
      id: 'dispute',
      questionKey: 'LANDINGPAGE.customers.faqs._items.dispute.question',
      answerKey: 'LANDINGPAGE.customers.faqs._items.dispute.answer'
    }
  ];

  toggleFaq(id: string) {
    this.openFaqId = this.openFaqId === id ? '' : id;
  }

  isOpen(id: string): boolean {
    return this.openFaqId === id;
  }
}
