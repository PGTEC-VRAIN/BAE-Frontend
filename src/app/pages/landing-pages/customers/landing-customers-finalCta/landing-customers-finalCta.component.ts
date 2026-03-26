import { Component, input } from "@angular/core";
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: "app-landing-customers-finalCta",
  standalone: true,
  imports: [TranslateModule],
  templateUrl: "./landing-customers-finalCta.component.html",
  styleUrl: "./landing-customers-finalCta.component.css"
})
export class LandingCustomersFinalCtaComponent {
  url = input.required<string>();
}
