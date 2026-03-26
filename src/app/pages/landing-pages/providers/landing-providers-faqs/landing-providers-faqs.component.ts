import { Component } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faMinus, faPlus } from '@fortawesome/pro-solid-svg-icons';
import { TranslateModule } from '@ngx-translate/core';

type FaqItem = {
  id: string;
  questionKey: string;
  answerKey: string;
};


@Component({
  selector: "app-landing-page-providers-faqs",
  standalone: true,
  imports: [TranslateModule, FontAwesomeModule],
  templateUrl: "./landing-providers-faqs.component.html",
  styleUrl: "./landing-providers-faqs.component.css"
})
export class LandingPageProvidersFaqsComponent {
  faPlus = faPlus;
  faMinus = faMinus;

  openFaqId = '';

  faqs: FaqItem[] = [
    {
      id: '1',
      questionKey: 'LANDINGPAGE.providers.faqs._items.1.question',
      answerKey: 'LANDINGPAGE.providers.faqs._items.1.answer'
    },
    {
      id: '2',
      questionKey: 'LANDINGPAGE.providers.faqs._items.2.question',
      answerKey: 'LANDINGPAGE.providers.faqs._items.2.answer'
    },
    {
      id: '3',
      questionKey: 'LANDINGPAGE.providers.faqs._items.3.question',
      answerKey: 'LANDINGPAGE.providers.faqs._items.3.answer'
    },
    {
      id: '4',
      questionKey: 'LANDINGPAGE.providers.faqs._items.4.question',
      answerKey: 'LANDINGPAGE.providers.faqs._items.4.answer'
    },
    {
      id: '5',
      questionKey: 'LANDINGPAGE.providers.faqs._items.5.question',
      answerKey: 'LANDINGPAGE.providers.faqs._items.5.answer'
    },
    {
      id: '6',
      questionKey: 'LANDINGPAGE.providers.faqs._items.6.question',
      answerKey: 'LANDINGPAGE.providers.faqs._items.6.answer'
    }
  ];

  toggleFaq(id: string) {
    this.openFaqId = this.openFaqId === id ? '' : id;
  }

  isOpen(id: string): boolean {
    return this.openFaqId === id;
  }
}
