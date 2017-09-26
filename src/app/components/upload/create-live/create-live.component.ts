import {Component, OnInit, ViewChild} from '@angular/core';
import {CreateLiveService, KalturaLiveStream, ManualLive, UniversalLive} from './create-live.service';
import {AppLocalization} from "@kaltura-ng/kaltura-common";

enum StreamTypes {
  kaltura,
  universal,
  manual
}

@Component({
  selector: 'kCreateLive',
  templateUrl: './create-live.component.html',
  styleUrls: ['./create-live.component.scss'],
  providers: [CreateLiveService]
})
export class CreateLiveComponent implements OnInit {
  public _selectedStreamType: StreamTypes = StreamTypes.kaltura;
  public kalturaLiveStreamData: KalturaLiveStream = {
    name: '',
    description: '',
    transcodingProfile: 'asd1',
    liveDVR: false,
    enableRecording: false,
    enableRecordingSelectedOption: 'asd1',
    previewMode: false
  };
  public manualLiveData: ManualLive;
  public universalLiveData: UniversalLive;
  public _availableStreamTypes: Array<{ value: StreamTypes, label: string }>;
  public _streamTypes = StreamTypes;

  @ViewChild('kalturaLiveStreamComponent') kalturaLiveStreamComponent;
  @ViewChild('manualLiveComponent') manualLiveComponent;
  @ViewChild('universalLiveData') universalLiveComponent;

  constructor(createLiveService: CreateLiveService, private _appLocalization: AppLocalization) {
  }

  ngOnInit() {
    this._availableStreamTypes = [
      {value: StreamTypes.kaltura, label: this._appLocalization.get('app.upload.prepareLive.streamTypes.kaltura')},
      {value: StreamTypes.manual, label: this._appLocalization.get('app.upload.prepareLive.streamTypes.manual')},
      {value: StreamTypes.universal, label: this._appLocalization.get('app.upload.prepareLive.streamTypes.universal')}
    ];
  }

  checkValidityOfCurrentSelectedForm() {
    // if (this._selectedStreamType === 'a') {
    //   console.log(this.manualLiveComponent.isValid());
    // } else if (this._selectedStreamType === 'b') {
    //   console.log(this.kalturaLiveStreamComponent.isValid());
    // }
  }
}
