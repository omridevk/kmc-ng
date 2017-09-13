import {Component, ViewChild} from '@angular/core';
import {environment} from 'app-environment';
import {BrowserService} from 'app-shared/kmc-shell';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {DraftEntry, UploadMenuService} from './upload-menu.service';
import {KalturaMediaType} from 'kaltura-typescript-client/types/KalturaMediaType';
import {Router} from '@angular/router';
import {AreaBlockerMessage} from "@kaltura-ng/kaltura-ui";
import {AppLocalization} from "@kaltura-ng/kaltura-common";

@Component({
  selector: 'kKMCUploadMenu',
  templateUrl: './upload-menu.component.html',
  styleUrls: ['./upload-menu.component.scss'],
  providers: [UploadMenuService]
})
export class UploadMenuComponent {
  @ViewChild('transcodingProfileSelectMenu') public transcodingProfileSelectMenu: PopupWidgetComponent;

  private _entryMediaType = KalturaMediaType;
  private _selectedMediaType: KalturaMediaType;

  constructor(private _browserService: BrowserService,
              private _uploadMenuService: UploadMenuService,
              private _router: Router,
              private _appLocalization: AppLocalization) {

  }

  onHighSpeedLinkClicked() {
    this._browserService.openLink(environment.core.externalLinks.HIGH_SPEED_UPLOAD);
  }

  onDownloadSamplesClicked() {
    this._browserService.openLink(environment.core.externalLinks.BULK_UPLOAD_SAMPLES);
  }

  private _prepareEntry(mediaType: KalturaMediaType) {
    this._selectedMediaType = mediaType;
    if (true) {
      this.transcodingProfileSelectMenu.open();
    } else {
    // this._loadEntry({profileId: -1});
    }
  }


  private _loadEntry(selectedProfile: { profileId: number }) {
    this._uploadMenuService.createDraftEntry(this._selectedMediaType,
      selectedProfile.profileId || -1)
      .subscribe((draftEntry: DraftEntry) => {
          this._router.navigate(['/content/entries/entry', draftEntry.id]);
          this.transcodingProfileSelectMenu.close();
        },
        error => {
          // const blockerMessage = new AreaBlockerMessage(
          //   {
          //     message: this._appLocalization.get('applications.settings.accountUpgrade.errors.sendFailed'),
          //     buttons: [
          //       {
          //         label: this._appLocalization.get('app.common.ok'),
          //         action: () => {
          //           this._updateAreaBlockerState(false, null);
          //         }
          //       }
          //     ]
          //   }
          // );
          // this._updateAreaBlockerState(false, blockerMessage);
        });
  }
}
