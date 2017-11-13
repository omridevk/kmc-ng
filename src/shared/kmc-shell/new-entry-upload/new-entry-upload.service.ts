import { Injectable, OnDestroy } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { KalturaMediaType } from 'kaltura-typescript-client/types/KalturaMediaType';
import { TrackedFile, TrackedFileStatuses, UploadManagement } from '@kaltura-ng/kaltura-common';
import { NewEntryUploadFile } from './new-entry-upload-file';
import { MediaAddAction } from 'kaltura-typescript-client/types/MediaAddAction';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaUploadedFileTokenResource } from 'kaltura-typescript-client/types/KalturaUploadedFileTokenResource';
import { KalturaAssetParamsResourceContainer } from 'kaltura-typescript-client/types/KalturaAssetParamsResourceContainer';
import { KalturaAssetsParamsResourceContainers } from 'kaltura-typescript-client/types/KalturaAssetsParamsResourceContainers';
import { MediaUpdateContentAction } from 'kaltura-typescript-client/types/MediaUpdateContentAction';
import { UploadTokenDeleteAction } from 'kaltura-typescript-client/types/UploadTokenDeleteAction';
import { TrackedFileData } from '@kaltura-ng/kaltura-common/upload-management/tracked-file';

export interface KmcNewEntryUpload {
  file: File;
  mediaType: KalturaMediaType;
  entryName: string;
}

@Injectable()
export class NewEntryUploadService implements OnDestroy {
  public _mediaCreated = new BehaviorSubject<{ id?: string, entryId?: string }>({});
  public onMediaCreated$ = this._mediaCreated.asObservable();

  constructor(private _kalturaServerClient: KalturaClient,
              private _uploadManagement: UploadManagement) {
    this._monitorTrackedFilesChanges();
  }

  ngOnDestroy() {

  }

  private _monitorTrackedFilesChanges(): void {
    this._uploadManagement.onTrackedFileChanged$
      .cancelOnDestroy(this)
      .filter(trackedFile => trackedFile.data instanceof NewEntryUploadFile)
      .subscribe(
        trackedFile => {
          // NOTE: this service handles only 'purged' and 'waitingUpload' statuses by design.
          switch (trackedFile.status) {
            case TrackedFileStatuses.purged:
              this._cleanupUpload(trackedFile);
              break;
            case TrackedFileStatuses.prepared:
              this._linkEntryWithFile(trackedFile);
              break;
            default:
              break;
          }
        }
      );
  }

  private _cleanupUpload(trackedFile: TrackedFileData): void {
    const trackedFileData = <NewEntryUploadFile>trackedFile.data;

    if (trackedFileData.createMediaEntrySubscription instanceof Subscription) {
      trackedFileData.createMediaEntrySubscription.unsubscribe();
      trackedFileData.createMediaEntrySubscription = null;
    }

    if (trackedFileData.serverUploadToken) {
      this._removeUploadToken(trackedFileData.serverUploadToken)
        .subscribe(
          () => {
          },
          (error) => {
            console.warn(this._formatError('Failed to remove upload token', error));
          }
        );
    }
  }

  private _linkEntryWithFile(trackedFile: TrackedFileData): void {
    (<NewEntryUploadFile>trackedFile.data).createMediaEntrySubscription = this._createMediaEntry(<NewEntryUploadFile>trackedFile.data)
      .do(entry => {
        (<NewEntryUploadFile>trackedFile.data).entryId = entry.id;
        this._mediaCreated.next({ id: trackedFile.id, entryId: entry.id });
      })
      .switchMap((entry: KalturaMediaEntry) => this._updateMediaContent(entry, <NewEntryUploadFile>trackedFile.data))
      .subscribe(
        () => {
        },
        (error) => {
          this._uploadManagement.cancelUploadWithError(trackedFile.id, this._formatError('Failed to create entry', error));
        }
      );
  }

  private _updateMediaContent(entry: KalturaMediaEntry, file: NewEntryUploadFile): Observable<KalturaMediaEntry> {
    const entryId = entry.id;
    const conversionProfileId = file.transcodingProfileId;
    const subSubResource = new KalturaUploadedFileTokenResource({ token: file.serverUploadToken });
    let resource = null;

    if (file.mediaType === KalturaMediaType.image) {
      resource = subSubResource;
    } else {
      const subResource = new KalturaAssetParamsResourceContainer({ resource: subSubResource, assetParamsId: 0 });
      resource = new KalturaAssetsParamsResourceContainers({ resources: [subResource] });
    }

    return this._kalturaServerClient.request(new MediaUpdateContentAction({ entryId, resource, conversionProfileId }));
  }

  private _createMediaEntry(file: NewEntryUploadFile): Observable<KalturaMediaEntry> {
    return this._kalturaServerClient.request(new MediaAddAction({
      entry: new KalturaMediaEntry({
        mediaType: file.mediaType,
        name: file.entryName,
        conversionProfileId: file.transcodingProfileId
      })
    }));
  }

  private _removeUploadToken(uploadTokenId: string): Observable<void> {
    return this._kalturaServerClient.request(new UploadTokenDeleteAction({ uploadTokenId }))
  }

  private _formatError(message: string, error: string | { message: string }): string {
    const errorMessage = typeof error === 'string' ? error : error && error.message ? error.message : 'unknown reason';
    return `${message}: ${errorMessage}`;
  }

  public upload(files: KmcNewEntryUpload[], trancodingProfileId: number): void {
    this._uploadManagement.addFiles(
      files.map(file => new NewEntryUploadFile(file.file, file.mediaType, trancodingProfileId, file.entryName))
    );
  }
}
