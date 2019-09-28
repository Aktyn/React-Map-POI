import {EventEmitter} from "events";
import {noop} from "./utils";

const emitter = new EventEmitter();

const DEFAULTS = {
	'marker-types': {
		'VEHICLE': {
			color: '#ef5350',
			icon: 'fas fa-car'
		},
		'PARKING': {
			color: '#26A69A',
			icon: 'fas fa-parking'
		},
		'POI': {
			color: '#66BB6A',
			icon: 'fas fa-dot-circle'
		},
		'GROUP': {
			color: '#607D8B',
			icon: 'far fa-circle'
		}
	}
};

type setting_name = keyof typeof DEFAULTS;
type value_type = {[index: string]: any} | boolean | string | number | undefined;
type changeListener = (...args: any[]) => void;

let storage: Storage = typeof localStorage === 'undefined' ? <never>{
	removeItem: noop,
	setItem: noop,
	getItem: noop,
} : localStorage;

//TODO: storage cache

export function getValue(name: setting_name) {
	let item = storage.getItem(name);
	if(item === null)
		return DEFAULTS[name];
	return JSON.parse(item);
}

export function getDefaultValue(name: setting_name) {
	return JSON.parse( JSON.stringify(DEFAULTS[name]) );//do not copy reference
}

export function restoreDefaultValue(name: setting_name) {
	changeValue(name, getDefaultValue(name));
}

export function changeValue(name: setting_name, value: value_type) {
	if(value === undefined)
		storage.removeItem(name);
	else
		storage.setItem(name, JSON.stringify(value));
	
	emitter.emit(name, value);
}

export function onValueChanged(name: setting_name, listener: changeListener) {
	emitter.on(name, listener);
}

export function offValueChanged(name: setting_name, listener: changeListener) {
	emitter.off(name, listener);
}