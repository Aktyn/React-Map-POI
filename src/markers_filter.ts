import {ObjectDataSchema, ObjectType, ParkingSchema, VehicleSchema} from "./map_objects";

export const defaultFilters = {
	'VEHICLE': {
		display: true,
		status: ['AVAILABLE'],
		batteryLevelMin: 0,
		batteryLevelMax: 100
	},
	'PARKING': {
		display: true,
		availableSpacesMin: 0
	},
	'POI': {
		display: true
	}
};

import {onValueChanged, getValue} from './user_settings';

export type FiltersSchema = typeof defaultFilters;

let filters: FiltersSchema;

export function filter(obj: ObjectDataSchema, type: ObjectType) {
	if( !filters ) {
		filters = getValue('filters');
		onValueChanged('filters', new_filters => filters = new_filters);
	}
	
	let type_filters = filters[type];
	if( !type_filters.display )
		return false;
	
	switch (type) {
		case "VEHICLE":
			let vehicle = <VehicleSchema>obj;
			if( !filters['VEHICLE'].status.includes(vehicle.status) )
				return false;
			if(vehicle.batteryLevelPct < filters['VEHICLE'].batteryLevelMin || vehicle.batteryLevelPct > filters['VEHICLE'].batteryLevelMax)
			{
				return false;
			}
			break;
		case "PARKING":
			let parking = <ParkingSchema>obj;
			if( parking.availableSpacesCount < filters['PARKING'].availableSpacesMin )
				return false;
			break;
		case "POI":
			
			break;
	}
	
	return true;
}