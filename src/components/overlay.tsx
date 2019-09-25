import * as React from 'react';
import { MapContext } from '../tiled_map';
import {convertLatLongToTile} from "../utils";
import {TILE_SIZE} from "../tiled_map/layer";

import '../styles/overlay.scss';

interface OverlayProps {
	latitude: number;
	longitude: number;
}

export default class Overlay extends React.Component<OverlayProps, any> {
	
	render() {
		return <MapContext.Consumer>{(context) => {
			let center = convertLatLongToTile({
				latitude: this.props.latitude,
				longitude: this.props.longitude,
				zoom: context.camera.zoom
			});
			
			return <div className={`overlay${context.zooming ? ' is_map_zooming' : ''}`} style={{
				transform: `translate(${(center.x - context.centerTile.x)*TILE_SIZE}px, ${
					(center.y - context.centerTile.y)*TILE_SIZE}px)`
			}}>{this.props.children}</div>;
		}}</MapContext.Consumer>;
	}
}