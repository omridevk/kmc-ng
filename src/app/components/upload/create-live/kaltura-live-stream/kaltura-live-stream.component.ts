import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {AppLocalization} from '@kaltura-ng/kaltura-common';
import {KalturaLiveStream} from '../create-live.service';

@Component({
  selector: 'kKalturaLiveStream',
  templateUrl: './kaltura-live-stream.component.html',
  styleUrls: ['./kaltura-live-stream.component.scss']
})
export class KalturaLiveStreamComponent implements OnInit {

  public _form: FormGroup;

  @Input()
  data: KalturaLiveStream;

  @Output()
  dataChange = new EventEmitter<KalturaLiveStream>();

  constructor(private _appLocalization: AppLocalization,
              private _fb: FormBuilder) {
  }

  ngOnInit() {
    this._createForm();
  }

  // Create empty structured form on loading
  private _createForm(): void {
    this._form = this._fb.group({
      name: [''],
      // phone: ['', [Validators.required, phoneValidator()]],
      // comments: [''],
    });

    this._form.valueChanges.subscribe(data => {
      console.log('Form changes', data)
      this.dataChange.emit(data)
    })
  }

  public validate() {
    return this._form.valid;
  }
}
