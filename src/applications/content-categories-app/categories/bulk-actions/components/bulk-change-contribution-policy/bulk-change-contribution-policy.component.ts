import {Component, EventEmitter, Input, Output} from '@angular/core';
import {PopupWidgetComponent} from '@kaltura-ng/kaltura-ui/popup-widget/popup-widget.component';
import {KalturaContributionPolicyType} from 'kaltura-typescript-client/types/KalturaContributionPolicyType';

@Component({
  selector: 'kCategoriesBulkChangeContributionPolicy',
  templateUrl: './bulk-change-contribution-policy.component.html',
  styleUrls: ['./bulk-change-contribution-policy.component.scss']
})

export class CategoriesBulkChangeContributionPolicy {

  @Input() parentPopupWidget: PopupWidgetComponent;
  @Output() changeContributionPolicyChanged = new EventEmitter<KalturaContributionPolicyType>();
  public _selectedPolicy: KalturaContributionPolicyType;
  public _availablePolicies = KalturaContributionPolicyType;

  constructor() {
  }

  public _apply() {
    this.changeContributionPolicyChanged.emit(this._selectedPolicy);
    this.parentPopupWidget.close();
  }
}

