import * as React from 'react';
import UrlGenerator from "./url_generator";
import {CameraState, convertLatLongToTile} from "../utils";
import Tile from "./tile";

export const TILE_SIZE = 256;//256x256 is common tile resolution

export interface GridState {
	tilesX: number;
	tilesY: number;
}

interface LayerProps extends GridState{
	urlGenerator: UrlGenerator;
	camera: CameraState;
}

interface LayerState {
	tiles: Tile[],//rows and columns
	centerTileX: number,
	centerTileY: number;
	offsetX: number,
	offsetY: number
}

export default class Layer extends React.Component<LayerProps, LayerState> {
	state: LayerState = {
		tiles: [],
		centerTileX: 0,
		centerTileY: 0,
		offsetX: 0,
		offsetY: 0
	};
	
	componentDidMount() {
		const {xTile, yTile} = convertLatLongToTile(this.props.camera);
		const {tilesX, tilesY} = this.props;
		
		console.log( tilesX, tilesY );
		//console.log( xTile - (xTile|0), yTile - (yTile|0) );
		
		let tiles = this.state.tiles;
		for(let y=0; y<tilesY; y++) {
			for(let x=0; x<tilesX; x++) {
				tiles.push( new Tile(x - ((tilesX/2)|0), y - ((tilesY/2)|0)) );
			}
		}
		
		this.setState({
			tiles,
			centerTileX: xTile,
			centerTileY: yTile,
			offsetX: -TILE_SIZE * (xTile - (xTile|0) - 0.5),
			offsetY: -TILE_SIZE * (yTile - (yTile|0) - 0.5)
		});
	}
	
	componentDidUpdate(prevProps: Readonly<LayerProps>, prevState: Readonly<LayerState>, snapshot?: any): void {
		if(prevProps.tilesY !== this.props.tilesY || prevProps.tilesX !== this.props.tilesX) {
			//TODO: adjust tiles
		}
	}
	
	private renderTile(tile: Tile) {
		const url = this.props.urlGenerator.generate(
			this.state.centerTileX+tile.x, this.state.centerTileY+tile.y, this.props.camera.zoom);
		return <img style={{
			// width: `${TILE_SIZE+1-tile.y%2}px`,
			height: `${TILE_SIZE+1-tile.y%2}px`,
			width: `${TILE_SIZE}px`,
			// height: `${TILE_SIZE}px`,
			imageRendering: 'pixelated',//
			transform: `translate(${tile.x*TILE_SIZE}px, ${tile.y*TILE_SIZE}px)`
		}} key={tile.id} src={url}
		    alt={'tile'} role={'presentation'} />;
	}
	
	render() {
		return <div className={'layer'} style={{
			transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
		}}>{this.state.tiles.map(this.renderTile.bind(this))}</div>
	}
}