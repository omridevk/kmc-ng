import {Component, ViewChild} from '@angular/core';
import {environment} from 'app-environment';
import {BrowserService} from 'app-shared/kmc-shell';
import {KalturaConversionProfile} from "kaltura-typescript-client/types/KalturaConversionProfile";
import {PopupWidgetComponent} from "@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component";

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss']
})
export class UploadMenuComponent {
  @ViewChild('transcodingProfileSelectMenu') public transcodingProfileSelectMenu: PopupWidgetComponent;
  constructor(private _browserService: BrowserService) {

  }

  onHighSpeedLinkClicked() {
    this._browserService.openLink(environment.core.externalLinks.HIGH_SPEED_UPLOAD);
  }

  onDownloadSamplesClicked() {
    this._browserService.openLink(environment.core.externalLinks.BULK_UPLOAD_SAMPLES);
  }

  private _prepareEntry() {
    this.transcodingProfileSelectMenu.open();
  }

  private _loadEntry(transcodingProfile: KalturaConversionProfile) {

  }
}
