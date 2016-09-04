import { Component, OnInit,AfterViewInit,ViewChild, OnDestroy } from '@angular/core';
import { Http, RequestOptions, Request, RequestMethod } from '@angular/http';
import { AuthenticationService } from '../../../shared/@kmc/auth/authentication.service';
import { UserContext } from '../../../shared/@kmc/auth/user-context';
import { Observable } from 'rxjs/rx';

import {AppMenuComponent} from "../app-menu/app-menu.component";
import { AppMenuService } from '../../shared/app-menu.service';
import { KMCShellService } from "../../../shared/kmc-shell.service";
import * as $ from 'jquery';

function handleLoadError (error: any) {
  let errMsg = (error.message) ? error.message :
    error.status ? `${error.status} - ${error.statusText}` : 'Server error';
  console.error(errMsg); // log to console instead
  return Observable.throw(errMsg);
}

@Component({
  selector: 'kmc-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  providers : [AppMenuService]
})
export class DashboardComponent implements OnInit, OnDestroy {
  @ViewChild('appMenu',true) private _appMenuRef : any;
  private onResize : () => void;
  private _userContext: UserContext;

  constructor(private authenticationService: AuthenticationService, private kmcShellService : KMCShellService, private http: Http) {
    this.onResize = this._resizeContent.bind(this);
    this._userContext = authenticationService.userContext;
  }

  private _resizeContent() : void
  {
    const $window = $(window);
    const $appMenu = $(this._appMenuRef.nativeElement);
    this.kmcShellService.setContentAreaHeight($window.outerHeight()-$appMenu.outerHeight());
  }

  ngAfterViewInit()
  {
    $(window).bind('resize',this.onResize); // We bind the event to a function reference that proxy 'actual' this inside
    this._resizeContent();
  }

  ngOnInit() {
    this.http.get(
      'http://kmc.kaltura.com/index.php/kmc/kmc4/extlogin?ks=' + this._userContext.ks + '&partner_id=' + this._userContext.partnerId)
      .catch(handleLoadError)
      .subscribe(
        (data) => {
          let response = data._body;
          let varsStr = response.substring(response.indexOf('vars :') + 7, response.indexOf('}};') + 1);
          window['kmc'] = {
            vars: JSON.parse(varsStr)
          }
        },
        (error) => {
          handleLoadError(error);
        }
      );
  }

  ngOnDestroy(){
    $(window).unbind('resize',this.onResize);
  }

}
