import * as React from 'react';
import {ObjectDataSchema} from "../map_objects";

import '../styles/marker.scss';
import CONFIG from "../config";

interface MarkerDataSchema {
	color: string;
	icon: string;
}

const markerTypeData = new Map<string, MarkerDataSchema>([
	['VEHICLE', {
		color: '#ef5350',
		icon: 'fa-car'
	}],
	['PARKING', {
		color: '#26A69A',
		icon: 'fa-parking'
	}],
	['POI', {
		color: '#66BB6A',
		icon: 'fa-dot-circle'
	}]
]);

interface ElementSchema {
	type: string;
	data: ObjectDataSchema;
}

export interface MarkerData {
	id: string;
	elements: ElementSchema[],
	relativePos: {x: number, y: number}
}

const markerSize = {
	width: `${CONFIG.markerSize}px`,
	height: `${CONFIG.markerSize}px`,
	fontSize: `${CONFIG.markerSize}px`
};

interface MarkerProps {
	data: MarkerData;
}

export default class Marker extends React.Component<MarkerProps> {
	
	componentDidUpdate(prevProps: Readonly<MarkerProps>) {
		if(prevProps.data.elements.length !== this.props.data.elements.length) {
			if(prevProps.data.elements.length < this.props.data.elements.length)
				console.log('markers joined');
		}
	}
	
	private renderGroup(elements: ElementSchema[]) {
		return <div className={'marker group'} style={{
			...markerSize,
			color: '#607D8B'
		}}>
			<div className={'bg'} key={'group'}>
				<i className="far fa-circle" style={{fontSize: `${CONFIG.markerSize}px`}}/>
			</div>
			<span className={'counter'}>{elements.length}</span>
		</div>;
	}
	
	private renderSingle(element: ElementSchema) {
		const iconSize = {fontSize: `${Math.floor(CONFIG.markerSize*0.381)}px`};
		let markerData = markerTypeData.get(element.type) || {color: '#555', icon: 'exclamation-triangle'};
		
		return <div className={'marker single'} style={{
			...markerSize,
			color: markerData.color
		}}>
			<div className={'bg'} key={'single'}>
				<i className="fas fa-map-marker" style={{fontSize: `${CONFIG.markerSize}px`}}/>
			</div>
			<div className={'icon'}>
				<i className={`fas ${markerData.icon}`} style={iconSize} />
			</div>
		</div>;
	}
	
	render() {
		return this.props.data.elements.length > 1 ?
			this.renderGroup(this.props.data.elements) :
			this.renderSingle(this.props.data.elements[0]);
	}
}