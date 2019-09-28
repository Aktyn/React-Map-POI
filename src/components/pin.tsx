import * as React from 'react';
import {MarkerDataSchema} from "./marker";

import '../styles/components/pin.scss';

export default function Pin(props: {size: number, markerData: MarkerDataSchema, elements?: number}) {
	let elements = props.elements || 1;
	return <div className={`pin fa-stack${elements > 1 ? ' group' : ''}`} style={{
		fontSize: `${props.size}px`,
		color: props.markerData.color
	}}>
		{elements === 1 ?
			<>
				<i className="pin-icon fas fa-map-marker" style={{fontSize: `${props.size}px`}}/>
				<i className={`icon ${props.markerData.icon}`} style={{
					fontSize: `${Math.floor(props.size*0.381)}px`
				}}/>
			</> :
			<>
				<i className={`pin-icon ${[props.markerData.icon]}`} style={{fontSize: `${props.size}px`}}/>
				<div className={'counter'}>{elements}</div>
			</>
		}
		
	</div>;
}