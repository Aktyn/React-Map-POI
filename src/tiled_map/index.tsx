import * as React from 'react';
import UrlGenerator from "./url_generator";
import Layer, {GridState, TILE_SIZE} from "./layer";
import {CameraState} from "../utils";

import '../styles/tiled_map.scss';

interface MapProps {
	width: number;
	height: number;
}

interface MapState extends GridState{
	camera: CameraState;
}

export default class TiledMap extends React.Component<MapProps, MapState> {
	
	private urlGenerator = new UrlGenerator('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	
	state: MapState = {
		camera: {
			latitude: 51.7769406,
			longitude: 19.4279159,
			zoom: 18
		},
		tilesX: Math.ceil(this.props.width / TILE_SIZE),
		tilesY: Math.ceil(this.props.height / TILE_SIZE)
	};
	
	componentDidMount() {
		//TODO: handle scroll and grab events to manipulate camera (assign to layers-container)
	}
	
	componentWillUnmount() {
	
	}
	
	componentDidUpdate(prevProps: Readonly<MapProps>) {
		if(prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
			this.setState({
				tilesX: Math.ceil(this.props.width / TILE_SIZE),
				tilesY: Math.ceil(this.props.height / TILE_SIZE)
			});
		}
	}
	
	render() {
		return <div className={'map-container'} style={{
			width: `${this.props.width}px`,
			height: `${this.props.height}px`
		}}>
			<div className={'layers-container'}>
				<Layer urlGenerator={this.urlGenerator} camera={this.state.camera}
				       tilesX={this.state.tilesX} tilesY={this.state.tilesY} />
			</div>
			<div className={'overlays'}>{this.props.children}</div>
		</div>;
	}
}