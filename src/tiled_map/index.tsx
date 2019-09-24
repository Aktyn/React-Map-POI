import * as React from 'react';
import UrlGenerator from "./url_generator";

import '../styles/tiled_map.scss';
import Layer, {CameraState} from "./layer";

interface MapProps {
	width: number;
	height: number;
}

interface MapState {
	camera: CameraState
}

export default class TiledMap extends React.Component<MapProps, MapState> {
	
	private urlGenerator = new UrlGenerator('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	
	state: MapState = {
		camera: {
			latitude: 51.7769406,
			longitude: 19.4279159,
			zoom: 18
		}
	};
	
	componentDidMount() {
		//TODO: handle scroll and grab events to manipulate camera (assign to layers-container)
	}
	
	componentWillUnmount() {
	
	}
	
	render() {
		return <div className={'map-container'} style={{
			width: `${this.props.width}px`,
			height: `${this.props.height}px`
		}}>
			<div className={'layers-container'}>
				<Layer urlGenerator={this.urlGenerator} camera={this.state.camera} />
			</div>
			<div className={'overlays'}>{this.props.children}</div>
		</div>;
	}
}