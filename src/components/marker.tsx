import * as React from 'react';
import {ObjectDataSchema} from "../map_objects";
import CONFIG from "../config";
import Pin from "./pin";

import '../styles/components/marker.scss';

export interface MarkerDataSchema {
	color: string;
	icon: string;
}

/*export const markerTypeData = new Map<string, MarkerDataSchema>(
	Settings.getValue('marker-types')
);*/
const unknownMarkerTypeData: MarkerDataSchema = {color: '#555', icon: 'exclamation-triangle'};

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
	//fontSize: `${CONFIG.markerSize}px`
};

interface MarkerProps {
	data: MarkerData;
	markerTypes: {[index: string]: MarkerDataSchema}
}

interface MarkersState {

}

export default class Marker extends React.Component<MarkerProps, MarkersState> {
	
	state: MarkersState = {
	
	};
	
	componentDidUpdate(prevProps: Readonly<MarkerProps>) {
		if(prevProps.data.elements.length !== this.props.data.elements.length) {
			if(prevProps.data.elements.length < this.props.data.elements.length) {
				//markers joined
			}
			else {
				//markers split
			}
		}
	}
	
	private renderGroup(elements: ElementSchema[]) {
		let markerData = this.props.markerTypes['GROUP'] || unknownMarkerTypeData;
		return <div className={'marker group'} style={markerSize}>
			<div className={'bg fa-stack'} key={'group'}>
				<Pin size={CONFIG.markerSize} markerData={markerData} elements={elements.length} />
			</div>
		</div>;
	}
	
	private renderSingle(element: ElementSchema) {
		let markerData = this.props.markerTypes[element.type] || unknownMarkerTypeData;
		
		return <div className={'marker single'} style={markerSize}>
			<div className={'bg fa-stack'} key={'single'}>
				<Pin size={CONFIG.markerSize} markerData={markerData} />
			</div>
		</div>;
	}
	
	render() {
		return this.props.data.elements.length > 1 ?
			this.renderGroup(this.props.data.elements) :
			this.renderSingle(this.props.data.elements[0]);
	}
}