import * as React from 'react';
import UrlGenerator from "./url_generator";
import {CameraState, TilePos} from "../utils";
import Tile from "./tile";

export const TILE_SIZE = 256;//256x256 is common tile resolution

export interface GridState {
	tilesX: number;
	tilesY: number;
}

interface ViewOffset {
	offsetX: number,
	offsetY: number
}

interface LayerProps extends GridState{
	urlGenerator: UrlGenerator;
	camera: CameraState;
	centerTile: TilePos;
}

interface LayerState extends ViewOffset {
	tiles: Tile[],//rows and columns
}

export default class Layer extends React.Component<LayerProps, LayerState> {
	private readonly initialCenter: TilePos;
	
	state: LayerState = {
		tiles: [],
		offsetX: 0,
		offsetY: 0
	};
	
	constructor(props: LayerProps) {
		super(props);
		this.initialCenter = {...this.props.centerTile};//copy
	}
	
	componentDidMount() {
		const {tilesX, tilesY} = this.props;
		
		let tiles = this.state.tiles;
		for(let y=0; y<tilesY; y++) {
			for(let x=0; x<tilesX; x++) {
				tiles.push( new Tile(x - ((tilesX/2)|0), y - ((tilesY/2)|0)) );
			}
		}
		console.log(this.props);
		this.setState({
			tiles,
			...this.calculateOffset()
		});
	}
	
	componentDidUpdate(prevProps: Readonly<LayerProps>, prevState: Readonly<LayerState>, snapshot?: any): void {
		if(prevProps.tilesY !== this.props.tilesY || prevProps.tilesX !== this.props.tilesX) {
			//TODO: adjust tiles
			console.log('adjust tiles because screen was resized');
		}
		if(prevProps.centerTile.x !== this.props.centerTile.x ||
			prevProps.centerTile.y !== this.props.centerTile.y)
		{
			this.onCameraMove();
		}
		
		if(prevProps.camera.zoom !== this.props.camera.zoom) {
		
		}
	}
	
	private calculateOffset(): ViewOffset {
		return {
			offsetX: TILE_SIZE * ((this.initialCenter.x|0) - this.props.centerTile.x + 0.5),
			offsetY: TILE_SIZE * ((this.initialCenter.y|0) - this.props.centerTile.y + 0.5)
		};
	}
	
	private onCameraMove() {
		this.setState({
			...this.calculateOffset()
		});
	}
	
	private renderTile(tile: Tile) {
		const url = this.props.urlGenerator.generate(
			this.initialCenter.x+tile.x, this.initialCenter.y+tile.y, this.props.camera.zoom);
		return <img style={{
			// width: `${TILE_SIZE+1-tile.y%2}px`,
			height: `${TILE_SIZE+1}px`,
			width: `${TILE_SIZE+1}px`,
			// height: `${TILE_SIZE}px`,
			imageRendering: 'pixelated',//
			transform: `translate3d(${tile.x*TILE_SIZE}px, ${tile.y*TILE_SIZE}px, 200px)`
		}} key={tile.id} src={url}
		    alt={'tile'} role={'presentation'} onLoad={e =>
			{
		    	// (e.target as HTMLImageElement).classList.add('loaded');
				let style = (e.target as HTMLImageElement).style;
				style.transform = `translate3d(${tile.x*TILE_SIZE}px, ${tile.y*TILE_SIZE}px, 0px)`;
				style.opacity = '1';
		    }} />;
	}
	
	render() {
		return <div className={'layer'} style={{
			transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
		}}>{this.state.tiles.map(this.renderTile.bind(this))}</div>
	}
}