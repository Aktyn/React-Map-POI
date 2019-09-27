import * as React from 'react';
import {ObjectDataSchema} from "../map_objects";

//TODO: styles for marker

export interface MarkerData {
	id: string;
	elements: {type: string; data: ObjectDataSchema}[],
	relativePos: {x: number, y: number}
}

interface MarkerProps {
	data: MarkerData;
}

export default class Marker extends React.Component<MarkerProps> {
	
	componentDidUpdate(prevProps: Readonly<MarkerProps>) {
		if(prevProps.data.elements.length !== this.props.data.elements.length) {
			//markers grouped/ungrouped
		}
	}
	
	render() {
		return <div className={'marker'}>Marker elements: {this.props.data.elements.length}</div>;
	}
}