import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { ReplaySubject } from 'rxjs/ReplaySubject';
import { Observable } from 'rxjs/Observable';
import { ISubscription } from 'rxjs/Subscription';
import 'rxjs/add/observable/throw';
import 'rxjs/add/observable/forkJoin';

import { KalturaClient } from '@kaltura-ng/kaltura-client';
import {  KalturaMultiRequest, KalturaMultiResponse } from 'kaltura-typescript-client';
import { DistributionProfileListAction, AccessControlListAction } from 'kaltura-typescript-client/types/all';
import { MetadataProfileStore, MetadataProfileTypes, MetadataProfileCreateModes, MetadataProfile, MetadataItemTypes, FlavoursStore } from '@kaltura-ng2/kaltura-common';

import {
    KalturaAccessControlFilter,
    KalturaAccessControlProfile,
    KalturaDetachedResponseProfile,
    KalturaDistributionProfile,
    KalturaFilterPager,
    KalturaFlavorParams,
    KalturaResponseProfileType
} from 'kaltura-typescript-client/types/all'

import { ConstantsFilters } from './constant-filters';

import * as R from 'ramda';

export type UpdateStatus = {
    loading : boolean;
    errorMessage : string;
};

export class FilterGroupType
{
    constructor(public type : string, public caption : string)
    {

    }
}

export class filterGroupMetadataProfileType extends FilterGroupType
{
    constructor(type : string,caption : string, public metadataProfileId : number, public fieldPath : string[])
    {
        super(type,caption);
    }
}

export interface FilterGroup
{
    groupName : string,
    filtersTypes : FilterGroupType[]
    filtersByType : { [key : string] : {id : string, name : string}[]}
}

export interface AdditionalFilters
{
    groups : FilterGroup[];
}


export enum AdditionalFilterLoadingStatus
{
    Loading,
    Loaded,
    FailedToLoad
}

@Injectable()
export class EntriesAdditionalFiltersStore {

    // TODO [KMC] - clear cached data on logout
    private _filters: ReplaySubject<AdditionalFilters> = new ReplaySubject<AdditionalFilters>(1);
    private _status: BehaviorSubject<UpdateStatus> = new BehaviorSubject<UpdateStatus>({
        loading: false,
        errorMessage: null
    });
    private executeQuerySubscription: ISubscription = null;

    public filters$ = this._filters.asObservable();
    public status$ = this._status.asObservable();


    constructor(private kalturaServerClient: KalturaClient,
    private _metadataProfileStore : MetadataProfileStore, private _flavoursStore: FlavoursStore) {
        this.load();
    }

    private load() {
        // cancel previous requests
        if (this.executeQuerySubscription) {
            this.executeQuerySubscription.unsubscribe();
            this.executeQuerySubscription = null;
        }

        // execute the request
        const getMetadata$ = this._metadataProfileStore.get({ type : MetadataProfileTypes.Entry, ignoredCreateMode : MetadataProfileCreateModes.App});
        const otherData$ = this.buildQueryRequest();
	    const getFlavours$ = this._flavoursStore.get();
        this.executeQuerySubscription = Observable.forkJoin(getMetadata$,otherData$,getFlavours$)
            .subscribe(
                (responses) => {
                this.executeQuerySubscription = null;

                if (responses[1].hasErrors()) {
                    this._status.next({loading: false, errorMessage: 'failed to load refine filters'});

                } else {

                    const filters : AdditionalFilters = {groups : []};

                    const defaultFilterGroup = this._buildDefaultFiltersGroup(responses[1], responses[2].items);
                    filters.groups.push(defaultFilterGroup);

                    const metadataData = this._buildMetadataFiltersGroups(responses[0].items);
                    filters.groups = [...filters.groups, ...metadataData.groups];

                    this._status.next({ loading : false, errorMessage : null});
                    this._filters.next(filters);
                }
            },
            (error) => {
                this.executeQuerySubscription = null;

                this._status.next({loading: false, errorMessage: (<Error>error).message || <string>error});

            }
        );
    }

    private _buildMetadataFiltersGroups(metadataProfiles : MetadataProfile[]) : { metadataProfiles : number[] , groups : FilterGroup[]} {

        const result: { metadataProfiles: number[] , groups: FilterGroup[]} = {metadataProfiles: [], groups: []};

        metadataProfiles.forEach(metadataProfile => {
            result.metadataProfiles.push(metadataProfile.id);

            // get only fields that are list, searchable and has values
            const profileLists = R.filter(field => {
                return (field.type === MetadataItemTypes.List && field.isSearchable && field.optionalValues.length > 0);
            }, metadataProfile.items);

            // if found relevant lists, create a group for that profile
            if (profileLists && profileLists.length > 0) {
                const filterGroup = {groupName: metadataProfile.name, filtersTypes: [], filtersByType: {}};
                result.groups.push(filterGroup);

                profileLists.forEach(list => {
                    filterGroup.filtersTypes.push(new filterGroupMetadataProfileType(list.id, list.label, metadataProfile.id, ['metadata',list.name]));
                    const items = filterGroup.filtersByType[list.id] = [];

                    list.optionalValues.forEach(item => {
                        items.push({
                            id: item.value,
                            name: item.text
                        })

                    });
                });
            }
        });

        return result;
    }

    private _buildDefaultFiltersGroup(responses : KalturaMultiResponse, flavours: KalturaFlavorParams[]) : FilterGroup{
        const result = {groupName : '', filtersTypes : [], filtersByType : {}};

        // build constant filters
        ConstantsFilters.forEach((filter) =>
        {
            result.filtersTypes.push(new FilterGroupType(filter.type,filter.name));
            const items = result.filtersByType[filter.type] = [];
            filter.items.forEach((item: any) => {
                items.push({id : item.id, name : item.name});
            });
        });

        // build distributions filters
        if (responses[0].result.objects.length > 0) {
            result.filtersTypes.push(new FilterGroupType('distributions',"Destinations"));
            const items = result.filtersByType['distributions'] = [];
            responses[0].result.objects.forEach((distributionProfile: KalturaDistributionProfile) => {
                items.push({id : distributionProfile.id, name : distributionProfile.name});
            });
        }

        //build flavors filters
        if (flavours.length > 0) {
            result.filtersTypes.push(new FilterGroupType('flavors',"Flavors"));
            const items = result.filtersByType['flavors'] = [];
	        flavours.forEach((flavor: KalturaFlavorParams) => {
                items.push({id: flavor.id, name: flavor.name});
            });
        }

        // build access control profile filters
        if (responses[1].result.objects.length > 0) {
            result.filtersTypes.push(new FilterGroupType('accessControlProfiles','Access Control Profiles'));
            const items = result.filtersByType['accessControlProfiles'] = [];
            responses[1].result.objects.forEach((accessControlProfile: KalturaAccessControlProfile) => {
                items.push({
                    id: accessControlProfile.id,
                    name: accessControlProfile.name
                });
            });
        }

        return result;
    }

    private buildQueryRequest(): Observable<KalturaMultiResponse> {

        try {
            const accessControlFilter = new KalturaAccessControlFilter({});
            accessControlFilter.orderBy = '-createdAt';

            const distributionProfilePager = new KalturaFilterPager({});
            distributionProfilePager.pageSize = 500;

            const accessControlPager = new KalturaFilterPager({});
            distributionProfilePager.pageSize = 1000;

            const responseProfile: KalturaDetachedResponseProfile = new KalturaDetachedResponseProfile({
                fields : "id,name",
                type : KalturaResponseProfileType.includeFields
            });

            const request = new KalturaMultiRequest(
                new DistributionProfileListAction({pager: distributionProfilePager}),
                new AccessControlListAction({
                    pager: accessControlPager,
                    filter: accessControlFilter,
                    responseProfile
                }),
            );

            return <any>this.kalturaServerClient.multiRequest(request);
        } catch (error) {
            return Observable.throw(error);
        }
    }
}