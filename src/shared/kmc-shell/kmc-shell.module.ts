import { NgModule,SkipSelf, Optional, ModuleWithProviders } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

import { CheckboxModule, SharedModule } from 'primeng/primeng';

import { AppShellService } from "./providers/app-shell.service";
import { BrowserService } from "./providers/browser.service";
import { AppContainerComponent } from './components/app-container/app-container.component';
import { ReleaseNotesComponent } from './components/release-notes/release-notes.component';
import { ScrollToTopComponent } from './components/scroll-to-top/scroll-to-top.component';
import { EntryTypePipe } from 'app-shared/kmc-shell/pipes/entry-type.pipe';

@NgModule({
    imports: <any[]>[
        CommonModule,
        FormsModule,
        CheckboxModule,
        SharedModule
    ],
    declarations: <any[]>[
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe
    ],
    exports: <any[]>[
        AppContainerComponent,
        ReleaseNotesComponent,
        ScrollToTopComponent,
        EntryTypePipe
    ],
    providers: <any[]>[

    ]
})
export class KMCShellModule {
    // constructor(@Optional() @SkipSelf() module : KMCShellModule, private appBootstrap : AppBootstrap)
    // {
    //     if (module) {
    //         throw new Error("KMCShellModule module imported twice.");
    //     }
    // }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: KMCShellModule,
            providers: <any[]>[
                BrowserService,
                AppShellService
            ]
        };
    }
}
