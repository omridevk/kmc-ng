import {Component, EventEmitter, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaLiveStream} from '../create-live.service';

@Component({
  selector: 'kKalturaLiveStream',
  templateUrl: './kaltura-live-stream.component.html',
  styleUrls: ['./kaltura-live-stream.component.scss']
})
export class KalturaLiveStreamComponent implements OnInit, OnDestroy {

  public _form: FormGroup;
  public _availableTranscodingProfiles: Array<{ value: string, label: string }>;
  public _enableRecordingOptions: Array<{ value: string, label: string }>;

  @Input()
  data: KalturaLiveStream;

  @Output()
  dataChange = new EventEmitter<KalturaLiveStream>();

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnInit(): void {
    this._createForm();
    this._availableTranscodingProfiles = [
      {value: 'asd1', label: this._appLocalization.get('app.upload.prepareLive.streamTypes.kaltura')},
      {value: 'asd2', label: this._appLocalization.get('app.upload.prepareLive.streamTypes.manual')},
      {value: 'asd3', label: this._appLocalization.get('app.upload.prepareLive.streamTypes.universal')}
    ];

    this._enableRecordingOptions = [
      {value: 'asd1', label: this._appLocalization.get('app.upload.prepareLive.streamTypes.kaltura')},
      {value: 'asd2', label: this._appLocalization.get('app.upload.prepareLive.streamTypes.manual')},
      {value: 'asd3', label: this._appLocalization.get('app.upload.prepareLive.streamTypes.universal')}
    ];
  }

  ngOnDestroy(): void {
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._form = this._fb.group({
      name: ['', Validators.required],
      description: [''],
      transcodingProfile: [''],
      liveDVR: [false],
      enableRecording: [false],
      enableRecordingSelectedOption: [''],
      previewMode: [false]
    });

    this._form
      .valueChanges
      .cancelOnDestroy(this)
      .subscribe(data => {
        console.log('Form changes', data);
        this.dataChange.emit(data);
      });

    this._form.reset(this.data);
  }

  public validate() {
    return this._form.valid;
  }
}
