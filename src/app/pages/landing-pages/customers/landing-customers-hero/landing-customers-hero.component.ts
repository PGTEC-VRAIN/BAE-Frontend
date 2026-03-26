import { Component, input } from "@angular/core";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: "app-landing-customers-hero",
  standalone: true,
  imports: [TranslateModule],
  templateUrl: "./landing-customers-hero.component.html",
  styleUrl: "./landing-customers-hero.component.css"
})
export class LandingCustomersHeroComponent {
  url = input.required<string>();
}
