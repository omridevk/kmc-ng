import { Component, OnInit, AfterViewInit, OnDestroy } from '@angular/core';
import { AppAuthentication } from '@kaltura-ng/kaltura-common';

@Component({
  selector: 'kStudio',
  templateUrl: './studio.component.html',
  styleUrls: ['./studio.component.scss']
})
export class StudioComponent implements OnInit, AfterViewInit, OnDestroy {

  public studioUrl: string = "";

  constructor(private appAuthentication: AppAuthentication) {
    window["kmc"] = {
      "version": "3",
      "vars": {
        "ks": this.appAuthentication.appUser.ks,
        "api_url": "http://www.kaltura.com",
        "studio": {
          "config": '{"version":"v2.0.9", "name":"Video Studio V2", "tags":"studio_v2", "html5_version":"v2.57.2", "html5lib":"http://cdnapi.kaltura.com/html5/html5lib/v2.57.2/mwEmbedLoader.php"}',
          "showFlashStudio": false,
          "showHTMLStudio": true,
          "uiConfID": 39700052,
          "version": "v2.0.9"
        }
      }
    }
  }

  ngOnInit() {
    this.studioUrl = "./assets/studio/index.html";
  }

  ngAfterViewInit() {
  }


  ngOnDestroy() {

  }

}
