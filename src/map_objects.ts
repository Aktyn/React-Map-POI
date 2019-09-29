import {EventEmitter} from "events";

export const enum EVENT {
	LOAD = 'load'
}

const emitter = new EventEmitter();
const api_url = 'https://dev.vozilla.pl/api-client-portal/map?objectType=';
let loaded = false;

interface Location {
	latitude: number;
	longitude: number;
}

interface Color {
	rgb: string;
	alpha: number;
}

interface Picture {
	id: string;
	name: string;
	extension?: null;
	contentType?: null;
}

export interface Address {
	street?: string | null;
	house?: string | null;
	city: string;
}

export interface CommonSchema {
	id: string;
	name: string;
	discriminator: string;
	color: string | Color;
	location: Location;
	address?: string | Address | null;
	description?: null | string;
	metadata?: null | Object;
}

export interface VehicleSchema extends CommonSchema {
	platesNumber: string;
	sideNumber: string;
	type: string;
	picture: Picture;
	rangeKm: number;
	batteryLevelPct: number;
	reservationEnd?: null;
	reservation?: null;
	status: string;
	locationDescription?: null;
	mapColor: Color;
	promotion?: null;
}

export interface ParkingSchema extends CommonSchema {
	spacesCount: number;
	availableSpacesCount: number;
	chargers?: (string | null)[] | null;
	pictureId?: null;
}

export interface PoiSchema extends CommonSchema {
	category: string;
	picture?: null;
}

export type ObjectDataSchema = VehicleSchema | ParkingSchema | PoiSchema;

const OBJECTS = [
	{
		'type': 'VEHICLE',
		'objects': <VehicleSchema[]>[]
	}, {
		'type': 'PARKING',
		'objects': <ParkingSchema[]>[]
	}, {
		'type': 'POI',
		'objects': <PoiSchema[]>[]
	}
];

export type ObjectSchema = typeof OBJECTS;

async function loadObjectsData(obj: {type: string, objects: ObjectDataSchema[]}) {
	let data: { objects: ObjectDataSchema[] } = await fetch(api_url + obj.type).then(res => res.json());
	if ('objects' in data)
		obj.objects = data['objects'];
	return obj;
}

if( process.env.NODE_ENV === 'development' ) {
	OBJECTS[0].objects = require('./test_data/VEHICLE.json').objects;
	OBJECTS[1].objects = require('./test_data/PARKING.json').objects;
	OBJECTS[2].objects = require('./test_data/POI.json').objects;
	loaded = true;
	emitter.emit(EVENT.LOAD, OBJECTS);
}
else {
	Promise.all(OBJECTS.map(obj => loadObjectsData(obj))).then(() => {
		loaded = true;
		emitter.emit(EVENT.LOAD, OBJECTS);
	}).catch(console.error);
}


type callbackFunc = (...args: any[]) => void;
export default {
	on: (event: EVENT, callback: callbackFunc) => {
		// noinspection JSRedundantSwitchStatement
		switch (event) {
			case EVENT.LOAD:
				if(loaded)
					callback(OBJECTS);
				break;
		}
		return emitter.on(event, callback);
	},
	off: (event: EVENT, callback: callbackFunc) => emitter.off(event, callback),
	
	getTotalCount: () => OBJECTS.map(obj => obj.objects.length).reduce((a,b) => a+b)
}