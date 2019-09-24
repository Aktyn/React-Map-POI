import * as React from 'react';
import UrlGenerator from "./url_generator";
import {convertLatLongToTile} from "../utils";
import Tile from "./tile";

const TILE_RES = 256;//256x256 is common tile resolution

export interface CameraState {
	latitude: number;
	longitude: number;
	zoom: number;
}

interface LayerProps {
	urlGenerator: UrlGenerator;
	camera: CameraState;
}

interface LayerState {
	tiles: Tile[],
	offsetX: number,
	offsetY: number
}

export default class Layer extends React.Component<LayerProps, LayerState> {
	state: LayerState = {
		tiles: [],
		offsetX: 0,
		offsetY: 0
	};
	
	componentDidMount() {
		let camera = this.props.camera;
		const {xTile, yTile} = convertLatLongToTile(camera.latitude, camera.longitude, camera.zoom);
		
		let tiles = this.state.tiles;
		tiles.push(new Tile(xTile, yTile));
		
		console.log( xTile - (xTile|0), yTile - (yTile|0) );
		
		this.setState({
			tiles,
			offsetX: -TILE_RES * (xTile - (xTile|0) - 0.5),
			offsetY: -TILE_RES * (yTile - (yTile|0) - 0.5),
		});
	}
	
	render() {
		return <div className={'layer'} style={{
			transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
		}}>{this.state.tiles.map(tile => {
			return <img key={tile.id} src={this.props.urlGenerator.generate(tile.x, tile.y, this.props.camera.zoom)}
			     alt={'tile'} role={'presentation'} />;
		})}</div>
	}
}