import {Injectable} from '@angular/core';

export interface KalturaLiveStream {
  name: string
}

export interface ManualLive {
  name: string
}

export interface UniversalLive{
  name: string
}

@Injectable()
export class CreateLiveService {

  constructor() {
  }

}
