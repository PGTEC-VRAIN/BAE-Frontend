import { Component, input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: "app-landing-page-providers-grow",
  standalone: true,
  imports: [TranslateModule],
  templateUrl: "./landing-providers-grow.component.html",
  styleUrl: "./landing-providers-grow.component.css"
})
export class LandingPageProvidersGrowComponent {
  url = input.required<string>();
}
