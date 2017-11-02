import { Component, EventEmitter, Output, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { EntriesListComponent } from 'app-shared/content-shared/entries-list/entries-list.component';
import { EntriesStore } from 'app-shared/content-shared/entries-store/entries-store.service';
import { AreaBlockerMessage } from '@kaltura-ng/kaltura-ui';
import { EntriesTableColumns } from 'app-shared/content-shared/entries-table/entries-table.component';
import { KalturaMediaEntry } from 'kaltura-typescript-client/types/KalturaMediaEntry';

@Component({
  selector: 'kEntriesSelector',
  templateUrl: './entries-selector.component.html',
  styleUrls: ['./entries-selector.component.scss'],
  providers: [EntriesStore]
})
export class EntriesSelectorComponent {
  @Output() onSelectionChanged = new EventEmitter<KalturaMediaEntry[]>();
  @ViewChild(EntriesListComponent) public _entriesList: EntriesListComponent;

  public _blockerMessage: AreaBlockerMessage = null;
  public _isBusy = false;
  public _selectedEntries: KalturaMediaEntry[] = [];

  public _columns: EntriesTableColumns = {
    thumbnailUrl: { width: '100px' },
    name: { sortable: true },
    mediaType: { sortable: true, width: '80px', align: 'center' },
    createdAt: { sortable: true, width: '140px' },
    plays: { sortable: true, width: '76px' },
    addToBucket: { sortable: false, width: '80px' }
  };

  constructor(public _entriesStore: EntriesStore) {
    this._entriesStore.paginationCacheToken = 'entries-list';
  }

  public _onActionSelected({ action, entryId }: { action: string, entryId: KalturaMediaEntry }): void {
    switch (action) {
      case 'addToBucket':
        this._selectedEntries.push(entryId);
        this.onSelectionChanged.emit(this._selectedEntries);
        break;
      default:
        break;
    }
  }

  public _removeSelected(entry: KalturaMediaEntry): void {
    this._selectedEntries.splice(this._selectedEntries.indexOf(entry), 1);
    this.onSelectionChanged.emit(this._selectedEntries);
  }
}
