import { MenuItem } from 'primeng/primeng';
import { ISubscription } from 'rxjs/Subscription';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { Subject } from 'rxjs/Subject';
import { Component, OnInit, QueryList, ViewChild, ViewChildren, Inject, ElementRef } from '@angular/core';
import { JumpToSection } from './jump-to-section.component';
import { DOCUMENT } from '@angular/platform-browser';
import { PageScrollService, PageScrollInstance } from 'ng2-page-scroll';
import { CategoryMetadataWidget } from './category-metadata-widget.service';



@Component({
  selector: 'kmc-category-metadata',
  templateUrl: './category-metadata.component.html',
  styleUrls: ['./category-metadata.component.scss']
})
export class CategoryMetadataComponent implements OnInit {

  public _tagsProvider = new Subject<SuggestionsProviderData>();
  private _searchTagsSubscription: ISubscription;
  private _popupStateChangeSubscribe: ISubscription;
  public _jumpToMenu: MenuItem[] = [];

  @ViewChildren(JumpToSection) private _jumpToSectionQuery: QueryList<JumpToSection> = null;

  @ViewChild('metadataContainer')
  public _container: ElementRef;

  constructor(public _widgetService: CategoryMetadataWidget,
    private _pageScrollService: PageScrollService,
    @Inject(DOCUMENT) private document: any) {
  }

  ngOnInit() {
      this._widgetService.attachForm();
  }

  _searchTags(event): void {
    this._tagsProvider.next({ suggestions: [], isLoading: true });

    if (this._searchTagsSubscription) {
      // abort previous request
      this._searchTagsSubscription.unsubscribe();
      this._searchTagsSubscription = null;
    }

    this._searchTagsSubscription = this._widgetService.searchTags(event.query).subscribe(data => {
      const suggestions = [];
      const categoryTags = this._widgetService.metadataForm.value.tags || [];

      (data || []).forEach(suggestedTag => {
        const isSelectable = !categoryTags.find(tag => {
          return tag === suggestedTag;
        });
        suggestions.push({ item: suggestedTag, isSelectable: isSelectable });
      });
      this._tagsProvider.next({ suggestions: suggestions, isLoading: false });
    },
      (err) => {
        this._tagsProvider.next({ suggestions: [], isLoading: false, errorMessage: <any>(err.message || err) });
      });
  }

  ngOnDestroy() {
    this._tagsProvider.complete();
    this._searchTagsSubscription && this._searchTagsSubscription.unsubscribe();
    this._popupStateChangeSubscribe && this._popupStateChangeSubscribe.unsubscribe();

      this._widgetService.detachForm();
  }

  ngAfterViewInit() {

    this._jumpToSectionQuery.changes
      .cancelOnDestroy(this)
      .subscribe((query) => {
        this._updateJumpToSectionsMenu();
      });

    this._updateJumpToSectionsMenu();
  }


  private _updateJumpToSectionsMenu() {
    const jumpToItems: any[] = [];

    this._jumpToSectionQuery.forEach(section => {
      const jumpToLabel = section.label;
      jumpToItems.push({
        label: jumpToLabel,
        command: (event) => {
          this._jumpTo(section.htmlElement);
        }
      });

    });

    setTimeout(() => {
      this._jumpToMenu = jumpToItems;
    });
  }

  private _jumpTo(element: HTMLElement) {
    let pageScrollInstance: PageScrollInstance = PageScrollInstance.newInstance({
      document: this.document,
      scrollTarget: element,
      scrollingViews: [this._container.nativeElement]
    });
    this._pageScrollService.start(pageScrollInstance);
  }

}
