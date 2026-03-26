import { NgModule } from "@angular/core";
import { VerticalScrollCardsDirective } from './vertical-scroll-cards-directive';
import { VerticalScrollCardsComponent } from './vertical-scroll-cards.component';

@NgModule({
  imports: [
    VerticalScrollCardsComponent,
    VerticalScrollCardsDirective
  ],
  exports: [
    VerticalScrollCardsComponent,
    VerticalScrollCardsDirective
  ]
})
export class VerticalScrollCardsModule { }
