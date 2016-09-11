import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { AppAuthentication, AppAuthEventTypes } from '@kaltura/kmcng-core';
import { BrowserService } from '@kaltura/kmcng-shell';

@Component({
  selector: 'kmc-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  sessionKS : string;
  localKS : string;
  errorMessage : string;
  automaticLogin = false;
  inProgress = false;
  userContext : any;
  constructor(private appAuthentication : AppAuthentication, private browserService : BrowserService) {

  }

  ngOnInit() {
    this.updateSessionKS();


    this.inProgress = true;
    const appEventSubscriber = this.appAuthentication.appEvents$.subscribe(
        (result) =>
        {
          if (result !== AppAuthEventTypes.Bootstrapping) {
            if (appEventSubscriber) {
              appEventSubscriber.unsubscribe();
            }

            this.userContext = this.appAuthentication.appUser;
            this.inProgress = false;
          }
        },
        (err) =>{
          if (appEventSubscriber)
          {
            appEventSubscriber.unsubscribe();
          }

          this.errorMessage = err.message;
          this.inProgress = false;
        }
    );
  }


  login(username, password, rememberMe,event) {


    event.preventDefault();


    this.errorMessage = '';
    this.inProgress = true;
    this.automaticLogin = false;


    this.appAuthentication.login(username, password,rememberMe).subscribe(
        (result) =>
        {
          this.userContext = this.appAuthentication.appUser;

          this.inProgress = false;
        },
        (err) =>{
            this.errorMessage = err.message;
            this.userContext = '';
          this.inProgress = false;
        }
    );
  }

  private updateSessionKS():void {
    // TODO [kmc] should remove this function - temporary for demonstration
    this.localKS = this.browserService.getFromLocalStorage('auth.ks');
    this.sessionKS = this.browserService.getFromSessionStorage('auth.ks');
  }


}