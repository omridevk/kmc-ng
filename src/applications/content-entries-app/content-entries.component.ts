import { Component } from '@angular/core';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { EntriesFiltersService } from 'app-shared/content-shared/entries-store/entries-filters.service';

@Component({
    selector: 'kEntries',
    templateUrl: './content-entries.component.html',
    styleUrls: ['./content-entries.component.scss'],
    providers : [EntriesStore, EntriesFiltersService]
})
export class ContentEntriesComponent  {



}

