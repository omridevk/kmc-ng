import {Component, OnInit, ViewChild} from '@angular/core';
import {CreateLiveService, KalturaLiveStream} from './create-live.service';

@Component({
  selector: 'kCreateLive',
  templateUrl: './create-live.component.html',
  styleUrls: ['./create-live.component.scss'],
  providers: [CreateLiveService]
})
export class CreateLiveComponent implements OnInit {
  public _selectedStreamType: string = 'a';
  public kalturaLiveStreamData: KalturaLiveStream;
  public manualLiveData: KalturaLiveStream;

  @ViewChild('kalturaLiveStreamComponent') kalturaLiveStreamComponent;
  @ViewChild('manualLiveComponent') manualLiveComponent;

  constructor(createLiveService: CreateLiveService) {
  }

  ngOnInit() {
  }

  checkValidityOfCurrentSelectedForm() {
    if (this._selectedStreamType === 'a') {
      console.log(this.manualLiveComponent.isValid());
    } else if (this._selectedStreamType === 'b') {
      console.log(this.kalturaLiveStreamComponent.isValid());
    }
  }
}
