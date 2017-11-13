import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BaseEntryDeleteAction } from 'kaltura-typescript-client/types/BaseEntryDeleteAction';

@Injectable()
export class ContentEntriesAppService {
  constructor(private _kalturaServerClient: KalturaClient) {

  }

  public deleteEntry(entryId: string): Observable<void> {
    return Observable.create(observer => {
      let subscription: ISubscription;
      if (entryId && entryId.length) {
        subscription = this._kalturaServerClient.request(new BaseEntryDeleteAction({ entryId: entryId })).subscribe(
          () => {
            observer.next();
            observer.complete();
          },
          error => {
            observer.error(error);
          }
        );
      } else {
        observer.error(new Error('missing entryId argument'));
      }
      return () => {
        if (subscription) {
          subscription.unsubscribe();
        }
      }
    });
  }
}
