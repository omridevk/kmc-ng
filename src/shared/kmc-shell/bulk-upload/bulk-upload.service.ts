import { Injectable } from '@angular/core';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { BulkUploadAddAction } from 'kaltura-typescript-client/types/BulkUploadAddAction';
import { KalturaBulkUploadType } from 'kaltura-typescript-client/types/KalturaBulkUploadType';
import { KalturaBulkUploadCsvJobData } from 'kaltura-typescript-client/types/KalturaBulkUploadCsvJobData';
import { CategoryAddFromBulkUploadAction } from 'kaltura-typescript-client/types/CategoryAddFromBulkUploadAction';
import { KalturaBulkUploadCategoryData } from 'kaltura-typescript-client/types/KalturaBulkUploadCategoryData';
import { KalturaBulkUploadUserData } from 'kaltura-typescript-client/types/KalturaBulkUploadUserData';
import { KalturaBulkUploadCategoryUserData } from 'kaltura-typescript-client/types/KalturaBulkUploadCategoryUserData';
import { UserAddFromBulkUploadAction } from 'kaltura-typescript-client/types/UserAddFromBulkUploadAction';
import { CategoryUserAddFromBulkUploadAction } from 'kaltura-typescript-client/types/CategoryUserAddFromBulkUploadAction';
import { Observable } from 'rxjs/Observable';
import { KalturaBulkUpload } from 'kaltura-typescript-client/types/KalturaBulkUpload';

export enum BulkUploadTypes {
  entries,
  categories,
  endUsers,
  endUsersEntitlement
}

@Injectable()
export class BulkUploadService {
  constructor(private _kalturaServerClient: KalturaClient) {
  }

  private _getKalturaBulkUploadType(file: File): KalturaBulkUploadType {
    const extension = /(?:\.([^.]+))?$/.exec(file.name)[1];
    return 'csv' === extension ? KalturaBulkUploadType.csv : KalturaBulkUploadType.xml;
  }

  private _getKalturaActionByType(fileData: File, type: BulkUploadTypes): BulkUploadAddAction
    | CategoryAddFromBulkUploadAction
    | UserAddFromBulkUploadAction
    | CategoryUserAddFromBulkUploadAction {

    const bulkUploadData = new KalturaBulkUploadCsvJobData();
    bulkUploadData.fileName = fileData.name;

    switch (type) {
      case BulkUploadTypes.entries:
        return new BulkUploadAddAction({
          conversionProfileId: -1,
          csvFileData: fileData,
          bulkUploadType: this._getKalturaBulkUploadType(fileData)
        });
      case BulkUploadTypes.categories:
        return new CategoryAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadCategoryData: new KalturaBulkUploadCategoryData()
        });
      case BulkUploadTypes.endUsers:
        return new UserAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadUserData: new KalturaBulkUploadUserData()
        });
      case BulkUploadTypes.endUsersEntitlement:
        return new CategoryUserAddFromBulkUploadAction({
          fileData,
          bulkUploadData,
          bulkUploadCategoryUserData: new KalturaBulkUploadCategoryUserData()
        });
      default:
        return null;
    }
  }

  private _getAction(files: File[], type: BulkUploadTypes): (BulkUploadAddAction
    | CategoryAddFromBulkUploadAction
    | UserAddFromBulkUploadAction
    | CategoryUserAddFromBulkUploadAction)[] {
    return files
      .map(file => this._getKalturaActionByType(file, type))
      .filter(Boolean);
  }

  public upload(files: FileList, type: BulkUploadTypes): Observable<KalturaBulkUpload> {
    const actions = this._getAction(Array.from(files), type);

    return Observable.from(actions)
      .flatMap(action => this._kalturaServerClient.request(action));
  }
}
