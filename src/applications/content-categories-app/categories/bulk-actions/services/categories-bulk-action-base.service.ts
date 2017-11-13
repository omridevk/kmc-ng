import { Observable } from 'rxjs/Observable';
import { environment } from 'app-environment';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { KalturaRequest, KalturaMultiRequest, KalturaMultiResponse } from 'kaltura-typescript-client';
import { KalturaCategory } from "kaltura-typescript-client/types/KalturaCategory";


export abstract class CategoriesBulkActionBaseService<T> {

  constructor(public _kalturaServerClient: KalturaClient) {
  }

  public abstract execute(selectedCategories: KalturaCategory[] , params : T) : Observable<any>;

  transmit(requests : KalturaRequest<any>[], chunk : boolean) : Observable<{}>
  {
    let maxRequestsPerMultiRequest = requests.length;
    if (chunk){
      maxRequestsPerMultiRequest = environment.modules.contentEntries.bulkActionsLimit;
    }

    let multiRequests: Observable<KalturaMultiResponse>[] = [];
    let mr :KalturaMultiRequest = new KalturaMultiRequest();

    let counter = 0;
    for (let i = 0; i < requests.length; i++){
      if (counter === maxRequestsPerMultiRequest){
        multiRequests.push(this._kalturaServerClient.multiRequest(mr));
        mr = new KalturaMultiRequest();
        counter = 0;
      }
      mr.requests.push(requests[i]);
      counter++;
    }
    multiRequests.push(this._kalturaServerClient.multiRequest(mr));

    return Observable.forkJoin(multiRequests)
      .map(responses => {
        const mergedResponses = [].concat.apply([], responses);
        let hasFailure = mergedResponses.filter(function ( response ) {return response.error}).length > 0;
        if (hasFailure) {
          throw new Error("error");
        } else {
          return {};
        }
      });
  }

}
