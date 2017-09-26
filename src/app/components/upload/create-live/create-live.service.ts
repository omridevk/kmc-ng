import {Injectable} from '@angular/core';

export interface KalturaLiveStream {
  name: string
  description: string,
  transcodingProfile: string,
  liveDVR: boolean,
  enableRecording: boolean,
  enableRecordingSelectedOption: string,
  previewMode: boolean
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
