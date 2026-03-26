import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: "app-landing-page-providers-hero",
  standalone: true,
  imports: [TranslateModule],
  templateUrl: "./landing-providers-hero.component.html",
  styleUrl: "./landing-providers-hero.component.css"
})
export class LandingPageProvidersHeroComponent {
  url = input.required<string>();
}
