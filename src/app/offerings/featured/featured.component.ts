import { CommonModule } from '@angular/common';
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { MarkdownModule } from 'ngx-markdown';
import { ApiServiceService } from 'src/app/services/product-service.service';
import { Category } from "../../models/interfaces";
import { EventMessageService } from "../../services/event-message.service";
import { LocalStorageService } from "../../services/local-storage.service";

@Component({
  selector: 'bae-off-featured',
  templateUrl: './featured.component.html',
  styleUrl: './featured.component.css',
  standalone: true,
  imports: [CommonModule, TranslateModule, MarkdownModule]
})
export class FeaturedComponent implements OnInit, OnDestroy {
  categories: any[] = [];
  @Input() searchTerm = '';
  // Lights one category after another (landing motion of themes that enable it)
  @Input() highlight = false;
  litIndex = -1;
  private litTimer?: ReturnType<typeof setInterval>;

  get filteredCategories(): any[] {
    const normalizedTerm = this.searchTerm.trim().toLowerCase();
    if (!normalizedTerm) {
      return this.categories;
    }

    return this.categories.filter((cat) => {
      const name = (cat?.name || '').toLowerCase();
      const description = (cat?.description || '').toLowerCase();
      return name.includes(normalizedTerm) || description.includes(normalizedTerm);
    });
  }

  constructor(
    private eventMessage: EventMessageService,
    private localStorage: LocalStorageService,
    private router: Router,
    private api: ApiServiceService
  ) {
  }

  ngOnInit(): void {
    this.api.getDefaultCategories().then(data => {
      for (let i = 0; i < data.length; i++) {
        if (data[i].isRoot == true) {
          this.categories.push(data[i])
        }
      }
    })

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
    if (this.highlight && !reduceMotion) {
      this.litTimer = setInterval(() => {
        const shown = Math.min(8, this.filteredCategories.length);
        this.litIndex = shown ? (this.litIndex + 1) % shown : -1;
      }, 1800);
    }
  }

  ngOnDestroy(): void {
    clearInterval(this.litTimer);
  }

  searchByCategory(cat: Category) {
    //MOCKED CATEGORY
    //TO-DO CHANGE THIS TO MATCH ALL THE CATEGORIES ON THE LIST
    /*const cat = {
      "id": "urn:ngsi-ld:category:b6d7450f-3da7-4a90-9655-32e6d342ee4a",
      "href": "urn:ngsi-ld:category:b6d7450f-3da7-4a90-9655-32e6d342ee4a",
      "description": "",
      "isRoot": true,
      "lastUpdate": "2024-11-04T08:26:58.683281084Z",
      "lifecycleStatus": "Launched",
      "name": "Software as a Service (SaaS)",
      "validFor": {
          "startDateTime": "2024-11-04T08:26:53.558Z"
      },
      "children": []
    } as Category;*/
    this.localStorage.addCategoryFilter(cat);
    this.eventMessage.emitAddedFilter(cat);
    this.router.navigate(['/search']);

  }
}
