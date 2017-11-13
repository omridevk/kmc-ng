import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { routing } from './content-bulk-log-app.routes';

import { AreaBlockerModule, KalturaUIModule, TooltipModule, StickyModule } from '@kaltura-ng/kaltura-ui';
import {
  ButtonModule,
  CalendarModule,
  CheckboxModule,
  DataTableModule,
  InputTextModule,
  MenuModule,
  PaginatorModule,
  SharedModule,
  TieredMenuModule,
  TreeModule
} from 'primeng/primeng';
import { KalturaCommonModule } from '@kaltura-ng/kaltura-common';
import { KalturaPrimeNgUIModule, PrimeTreeModule } from '@kaltura-ng/kaltura-primeng-ui';
import { AutoCompleteModule } from '@kaltura-ng/kaltura-primeng-ui/auto-complete';
import { TagsModule } from '@kaltura-ng/kaltura-ui/tags';
import { PopupWidgetModule } from '@kaltura-ng/kaltura-ui/popup-widget';
import { ContentBulkLogAppComponent } from './content-bulk-log-app.component';
import { BulkLogTableComponent } from './bulk-log-table/bulk-log-table.component';
import { BulkLogListComponent } from './bulk-log-list/bulk-log-list.component';
import { ContentSharedModule } from 'app-shared/content-shared/content-shared.module';
import { BulkLogObjectTypePipe } from './pipes/bulk-log-object-type.pipe';
import { BulkLogStatusPipe } from './pipes/bulk-log-status.pipe';
import { BulkLogRefineFiltersComponent } from './bulk-log-refine-filters/bulk-log-refine-filters.component';
import { BulkLogStatusIconPipe } from './pipes/bulk-log-status-icon.pipe';

@NgModule({
  imports: [
    CommonModule,
    AreaBlockerModule,
    DataTableModule,
    KalturaCommonModule,
    KalturaUIModule,
    PaginatorModule,
    TooltipModule,
    ButtonModule,
    TieredMenuModule,
    CheckboxModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    PopupWidgetModule,
    CalendarModule,
    MenuModule,
    TagsModule,
    KalturaPrimeNgUIModule,
    AutoCompleteModule,
    SharedModule,
    RouterModule.forChild(routing),
    ContentSharedModule,
    TreeModule,
    PrimeTreeModule,
    StickyModule
  ],
  declarations: [
    ContentBulkLogAppComponent,
    BulkLogTableComponent,
    BulkLogListComponent,
    BulkLogObjectTypePipe,
    BulkLogStatusPipe,
    BulkLogStatusIconPipe,
    BulkLogRefineFiltersComponent
  ],
  exports: []
})
export class ContentBulkLogAppModule {
}
