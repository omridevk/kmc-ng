import { Component, OnInit, AfterViewInit, ViewChild, OnDestroy } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';
import { EntryRelatedWidget } from './entry-related-widget.service';
import { KalturaAttachmentType } from 'kaltura-typescript-client/types/KalturaAttachmentType';
import { KalturaAttachmentAsset } from 'kaltura-typescript-client/types/KalturaAttachmentAsset';
import { KalturaEntryStatus } from 'kaltura-typescript-client/types/KalturaEntryStatus';
import { PopupWidgetComponent, PopupWidgetStates } from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import { AppLocalization } from '@kaltura-ng/kaltura-common';
import { SelectItem, Menu, MenuItem } from 'primeng/primeng';


@Component({
    selector: 'kEntryRelated',
    templateUrl: './entry-related.component.html',
    styleUrls: ['./entry-related.component.scss']
})
export class EntryRelated implements OnInit, AfterViewInit, OnDestroy{

    public _loading = false;
    public _loadingError = null;

	@ViewChild('actionsmenu') private actionsMenu: Menu;
	@ViewChild('editPopup') public editPopup: PopupWidgetComponent;
	public _currentFile: KalturaAttachmentAsset;

	public _fileTypes: SelectItem[] = [
		{"label": this._appLocalization.get('applications.content.entryDetails.related.document'), "value": KalturaAttachmentType.document},
		{"label": this._appLocalization.get('applications.content.entryDetails.related.media'), "value": KalturaAttachmentType.media},
		{"label": this._appLocalization.get('applications.content.entryDetails.related.text'), "value": KalturaAttachmentType.text},
	];

	public _actions: MenuItem[] = [];

	private _editPopupStateChangeSubscribe : ISubscription;

	constructor(public _widgetService: EntryRelatedWidget,
				private _appLocalization: AppLocalization) {
    }

    ngOnDestroy()
	{
		this.actionsMenu.hide();
		this._widgetService.detachForm();
		if (this._editPopupStateChangeSubscribe) {
			this._editPopupStateChangeSubscribe.unsubscribe();
		}

	}

	ngOnInit() {

        this._widgetService.attachForm();

		this._actions = [
			{label: this._appLocalization.get('applications.content.entryDetails.related.edit'), command: (event) => {this.actionSelected("edit");}},
			{label: this._appLocalization.get('applications.content.entryDetails.related.download'), command: (event) => {this.actionSelected("download");}},
			{label: this._appLocalization.get('applications.content.entryDetails.related.delete'), command: (event) => {this.actionSelected("delete");}},
			{label: this._appLocalization.get('applications.content.entryDetails.related.preview'), command: (event) => {this.actionSelected("preview");}}
		];
	}

	ngAfterViewInit(){
		if (this.editPopup) {
			this._editPopupStateChangeSubscribe = this.editPopup.state$
				.subscribe(event => {
					if (event.state === PopupWidgetStates.Close && event.context && event.context.dataChanged) {
						this._widgetService._setDirty();
					}
				});
		}
	}

	openActionsMenu(event: any, file: KalturaAttachmentAsset): void{
		if (this.actionsMenu){
			// save the selected file for usage in the actions menu
			this._currentFile = file;
			//disable Edit action for files that are not in "ready" state
			if (file.status && file.status.toString() !== KalturaEntryStatus.ready.toString()){
				this._actions[0].disabled = true;
			}
			// disable edit, download and preview for added files that were not saved to the server yet (don't have status)
			this._actions[0].disabled = (file.status === undefined);
			this._actions[1].disabled = (file.status === undefined);
			this._actions[3].disabled = (file.status === undefined);
			this.actionsMenu.toggle(event);
		}
	}

	private actionSelected(action: string): void{
		switch (action){
			case "edit":
				this.editPopup.open();
				break;
			case "delete":
				this._widgetService._removeFile(this._currentFile);
				break;
			case "download":
				this._widgetService.downloadFile(this._currentFile);
				break;
			case "preview":
				this._widgetService.previewFile(this._currentFile);
				break;
		}
	}

	public _relatedTableRowStyle(rowData, rowIndex): string{
		return rowData.uploading ? "uploading" : rowData.uploadFailure ? "uploadFailure" : '';
	}
}

