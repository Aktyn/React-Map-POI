import * as React from 'react';
import {ObjectDataSchema} from "../map_objects";

import '../styles/marker.scss';
import CONFIG from "../config";

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
			//markers grouped/ungrouped
		}
	}
	
	private renderGroup(elements: ElementSchema[]) {
		return <div className={'marker group'} style={markerSize}>
			<div className={'bg'} key={'group'}>
				<i className="fas fa-circle" style={{fontSize: `${CONFIG.markerSize}px`}}/>
			</div>
			<span className={'counter'}>{elements.length}</span>
		</div>;
	}
	
	private renderTypeIcon(type: string) {
		const iconSize = {fontSize: `${Math.floor(CONFIG.markerSize*0.381)}px`};
		switch (type) {//TODO: just return icon classname and marker color
			//TODO: center map on marker when clicked
			default:
				return 'UNKNOWN TYPE';
			case 'VEHICLE':
				return <i className="fas fa-car" style={iconSize}/>;
			case 'PARKING':
				return <i className="fas fa-parking" style={iconSize}/>;
			case 'POI':
				return <i className="fas fa-dot-circle" style={iconSize}/>;
		}
	}
	
	private renderSingle(element: ElementSchema) {
		return <div className={'marker single'} style={{
			...markerSize,
			color: '#f55'
		}}>
			<div className={'bg'} key={'single'}>
				<i className="fas fa-map-marker" style={{fontSize: `${CONFIG.markerSize}px`}}/>
			</div>
			<div className={'icon'}>{this.renderTypeIcon(element.type)}</div>
		</div>;
	}
	
	render() {
		return this.props.data.elements.length > 1 ?
			this.renderGroup(this.props.data.elements) :
			this.renderSingle(this.props.data.elements[0]);
	}
}