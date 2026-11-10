import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { MarkdownModule } from 'ngx-markdown';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CodeBlockComponent } from 'src/app/shared/code-block/code-block.component';
import { CONSUME, GuideSection, Lang, PUBLISH, TEMPLATES } from './guides.content';

type Tab = 'publish' | 'consume' | 'templates';
const TABS: Tab[] = ['publish', 'consume', 'templates'];

/** Guías del marketplace: cómo publicar, cómo consumir y plantillas de políticas ODRL (es / en). */
@Component({
  selector: 'app-guides',
  standalone: true,
  imports: [TranslateModule, MarkdownModule, CodeBlockComponent],
  templateUrl: './guides.component.html',
  styleUrls: ['./guides.component.css']
})
export class GuidesComponent implements OnInit, OnDestroy {
  tabs = TABS;
  tab: Tab = 'publish';
  lang: Lang = 'es';
  templates = TEMPLATES;
  private subs = new Subscription();

  constructor(private route: ActivatedRoute, private router: Router, private translate: TranslateService, private pageTitle: Title) {}

  private baseTitle = '';

  ngOnInit(): void {
    this.baseTitle = this.pageTitle.getTitle();
    this.updateTitle();
    this.setLang(this.translate.currentLang || this.translate.getDefaultLang());
    this.subs.add(this.translate.onLangChange.subscribe(e => this.setLang(e.lang)));
    this.subs.add(this.route.queryParamMap.subscribe(p => {
      const g = p.get('g') as Tab | null;
      this.tab = g && TABS.includes(g) ? g : 'publish';
    }));
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    if (this.baseTitle) this.pageTitle.setTitle(this.baseTitle);
  }

  private setLang(l: string): void {
    this.lang = l === 'en' ? 'en' : 'es';
    if (this.baseTitle) this.updateTitle();
  }

  private updateTitle(): void {
    this.pageTitle.setTitle(`${this.lang === 'en' ? 'Guides' : 'Guías'} · ${this.baseTitle}`);
  }

  get sections(): GuideSection[] {
    return this.tab === 'consume' ? CONSUME : PUBLISH;
  }

  select(t: Tab): void {
    this.router.navigate([], { queryParams: { g: t }, queryParamsHandling: 'merge' });
  }

  json(t: { json: unknown }): string {
    return JSON.stringify(t.json, null, 2);
  }

  goTo(id: string): void {
    document.getElementById('guide-' + id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}
