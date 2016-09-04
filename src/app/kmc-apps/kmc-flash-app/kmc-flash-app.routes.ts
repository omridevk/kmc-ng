import { ModuleWithProviders } from '@angular/core';
import { RouterModule }        from '@angular/router';

import {KMCFlashComponent} from "./components/kmc-flash.component";

export const routing: ModuleWithProviders = RouterModule.forChild([
  { path: '', component: KMCFlashComponent}
]);
