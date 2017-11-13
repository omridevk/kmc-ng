import { Component, OnInit, OnDestroy, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { TagSearchAction } from 'kaltura-typescript-client/types/TagSearchAction';
import { KalturaFilterPager } from 'kaltura-typescript-client/types/KalturaFilterPager';
import { KalturaTagFilter } from 'kaltura-typescript-client/types/KalturaTagFilter';
import { KalturaTaggedObjectType } from 'kaltura-typescript-client/types/KalturaTaggedObjectType';
import { SuggestionsProviderData } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { BrowserService } from 'app-shared/kmc-shell';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';

@Component({
  selector: 'kCategoriesBulkAddTags',
  templateUrl: './bulk-add-tags.component.html',
  styleUrls: ['./bulk-add-tags.component.scss']
})
export class CategoriesBulkAddTags implements OnInit, OnDestroy, AfterViewInit {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() addTagsChanged = new EventEmitter<string[]>();

  public _loading = false;
  public _sectionBlockerMessage: AreaBlockerMessage;

  public _tagsProvider = new Subject<SuggestionsProviderData>();
  public tags: string[] = [];

  private _searchTagsSubscription : ISubscription;
  private _parentPopupStateChangeSubscribe : ISubscription;
  private _confirmClose: boolean = true;

  constructor(private _kalturaServerClient: KalturaClient, private _appLocalization: AppLocalization, private _browserService: BrowserService) {
  }

  ngOnInit() {
    this.tags = [];
  }

  ngAfterViewInit(){
    if (this.parentPopupWidget) {
      this._parentPopupStateChangeSubscribe = this.parentPopupWidget.state$
        .subscribe(event => {
          if (event.state === PopupWidgetStates.Open) {
            this._confirmClose = true;
          }
          if (event.state === PopupWidgetStates.BeforeClose) {
            if (event.context && event.context.allowClose){
              if (this.tags.length && this._confirmClose){
                event.context.allowClose = false;
                this._browserService.confirm(
                  {
                    header: this._appLocalization.get('applications.content.entryDetails.captions.cancelEdit'),
                    message: this._appLocalization.get('applications.content.entryDetails.captions.discard'),
                    accept: () => {
                      this._confirmClose = false;
                      this.parentPopupWidget.close();
                    }
                  }
                );
              }
            }
          }
        });
    }
  }

  ngOnDestroy(){
    this._parentPopupStateChangeSubscribe.unsubscribe();
  }

  _searchTags(event) : void {
    this._tagsProvider.next({ suggestions : [], isLoading : true});

    if (this._searchTagsSubscription)
    {
      // abort previous request
      this._searchTagsSubscription.unsubscribe();
      this._searchTagsSubscription = null;
    }

    const requestSubscription = this._kalturaServerClient.request(
      new TagSearchAction(
        {
          tagFilter: new KalturaTagFilter(
            {
              tagStartsWith : event.query,
              objectTypeEqual : KalturaTaggedObjectType.entry
            }
          ),
          pager: new KalturaFilterPager({
            pageIndex : 0,
            pageSize : 30
          })
        }
      )
    )
      .cancelOnDestroy(this)
      .monitor('search tags')
      .subscribe(
        result =>
        {
          const suggestions = [];
          const tags = result.objects.map(item => item.tag);
          (tags|| []).forEach(suggestedTag => {
            const isSelectable = !this.tags.find(tag => {
              return tag === suggestedTag;
            });
            suggestions.push({ item: suggestedTag, isSelectable: isSelectable});
          });
          this._tagsProvider.next({suggestions: suggestions, isLoading: false});
        },
        err =>
        {
          this._tagsProvider.next({ suggestions : [], isLoading : false, errorMessage : <any>(err.message || err)});
        }
      );

  }

  public _apply(){
    this.addTagsChanged.emit(this.tags);
    this._confirmClose = false;
    this.parentPopupWidget.close();
  }
}

