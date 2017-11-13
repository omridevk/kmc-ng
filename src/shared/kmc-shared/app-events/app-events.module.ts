import { ModuleWithProviders, NgModule } from '@angular/core';
import { AppEventsService } from 'app-shared/kmc-shared/app-events/app-events.service';

@NgModule({
    providers: [
    ]
})
export class AppEventsModule {
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: AppEventsModule,
            providers: [
                AppEventsService
            ]
        };
    }
}