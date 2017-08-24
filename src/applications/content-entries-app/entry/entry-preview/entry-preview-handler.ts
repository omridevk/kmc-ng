import { Injectable } from '@angular/core';
import {
    EntryFormWidget
} from '../entry-form-widget';
import { KalturaClient } from '@kaltura-ng/kaltura-client';
import { AppAuthentication } from 'app-shared/kmc-shell';
import { environment } from 'app-environment';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';
import { KalturaSourceType } from 'kaltura-typescript-client/types/KalturaSourceType';
import { KalturaPlayerComponent } from '@kaltura-ng/kaltura-ui';

@Injectable()
export class EntryPreviewHandler extends EntryFormWidget
{
    public player: KalturaPlayerComponent;
    public kdp: any = null;
    public _landingPage : string;
    public _playConfig : any = {};

    constructor(
                kalturaServerClient: KalturaClient,
                private appAuthentication: AppAuthentication)

    {
        super('entryPreview');
    }


    /**
     * Do some cleanups if needed once the section is removed
     */
    protected _onReset()
    {

    }

    protected _onActivate(firstTimeActivating: boolean) {
        const entry: KalturaMediaEntry = this.data;

	    this._landingPage = null;

        let landingPage = this.appAuthentication.appUser.partnerInfo.landingPage;
        if (landingPage) {
	        landingPage = landingPage.replace("{entryId}", entry.id);
        }
        this._landingPage = landingPage;

        if (!this.kdp) {
            // create preview embed code
            const sourceType = entry.sourceType.toString();
            const isLive = (sourceType === KalturaSourceType.liveStream.toString() ||
            sourceType === KalturaSourceType.akamaiLive.toString() ||
            sourceType === KalturaSourceType.akamaiUniversalLive.toString() ||
            sourceType === KalturaSourceType.manualLiveStream.toString());

            this._playConfig = {
                "pid": this.appAuthentication.appUser.partnerId,
                "uiconfid": environment.core.kaltura.previewUIConf,
                "entryid": entry.id,
                "flashvars": {
                    "ks": this.appAuthentication.appUser.ks || "",
                    "closedCaptions.plugin": true,
                    "EmbedPlayer.SimulateMobile": true,
                    "EmbedPlayer.EnableMobileSkin": true
                }
            };
            if (isLive) {
                this._playConfig["flashvars"]["disableEntryRedirect"] = true;
            }

            if (this.player) {
                // use a timeout to allow _playerConfig properties to bind to the player
                setTimeout(() => {
                    this.player.Embed()
                }, 0);
            }
        }else{
            this.kdp.sendNotification( "changeMedia", { 'entryId' : entry.id } );
        }
    }


}
