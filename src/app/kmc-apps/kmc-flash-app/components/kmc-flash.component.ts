import { Component, OnInit } from '@angular/core';

declare var window: any;

@Component({
  selector: 'kmc-flash',
  templateUrl: './kmc-flash.component.html',
  styleUrls: ['./kmc-flash.component.scss']
})
export class KMCFlashComponent implements OnInit {

  private flashvars:any = {};
  private params:any = {};
  private kmc_swf_url: string = '';
  constructor() {}


  ngOnInit() {
    this.initializeBridgeVariables();

  }

  initializeBridgeVariables() : void{

      const kmc = window.kmc;
      this.kmc_swf_url = window.location.protocol + '//' + kmc.vars.cdn_host + '/flash/kmc/' + kmc.vars.kmc_version + '/kmc.swf';
      this.flashvars = 'kmc_uiconf=' + kmc.vars.kmc_general_uiconf +
        '&permission_uiconf=' + kmc.vars.kmc_permissions_uiconf +
        '&host=' + kmc.vars.host +
        '&cdnhost=' + kmc.vars.cdn_host +
        '&srvurl=api_v3/index.php' +
        '&protocol=' + window.location.protocol + '//' +
        '&partnerid=' + kmc.vars.partner_id +
        '&subpid=' + kmc.vars.partner_id + '00' +
        '&ks=' + kmc.vars.ks +
        '&entryId=-1' +
        '&kshowId=-1' +
        '&debugmode=true' +
        '&widget_id=_' + kmc.vars.partner_id +
        '&urchinNumber=' + kmc.vars.google_analytics_account +
        '&firstLogin=' + kmc.vars.first_login +
        '&openPlayer=kmc.preview_embed.doPreviewEmbed' +
        '&openPlaylist=kmc.preview_embed.doPreviewEmbed' +
        '&openCw=kmc.functions.openKcw' +
        '&maxUploadSize=2047' +
        '&language=en_US';

      this.params = {
        allowNetworking: "all",
        allowScriptAccess: "always"
      };
  }

}
