import { NgModule }           from '@angular/core';
import { CommonModule }       from '@angular/common';

import { routing} from './kmc-flash-app.routes';
import { KMCFlashComponent } from "./components/kmc-flash.component";

@NgModule({
  imports:      [ CommonModule, routing ],
  declarations: [ KMCFlashComponent ],
  providers:    [ ]
})
export class KMCFlashAppModule { }
