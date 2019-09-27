import * as React from 'react';
import {ObjectDataSchema} from "../map_objects";


export interface MarkerData {
	id: string;
	elements: {type: string; data: ObjectDataSchema}[],
	relativePos: {x: number, y: number}
}

interface MarkerProps {
	data: MarkerData;
}

export default class Marker extends React.Component<MarkerProps> {
	
	render() {
		return <div style={{
			transform: `translate(${this.props.data.relativePos.x}px, ${this.props.data.relativePos.y}px)`
		}}>Marker elements: {this.props.data.elements.length}</div>;
	}
}