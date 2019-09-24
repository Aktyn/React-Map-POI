import * as React from 'react';
import UrlGenerator, {subdomains} from "./url_generator";
import {CameraState, TilePos} from "../utils";
import Tile from "./tile";

export const TILE_SIZE = 256;//256x256 is common tile resolution

const enum SIDE {
	LEFT,
	RIGHT,
	TOP,
	BOTTOM
}

export interface GridState {
	tilesX: number;
	tilesY: number;
	maxTilesX: number;
	maxTilesY: number;
}

interface ViewOffset {
	offsetX: number,
	offsetY: number
}

interface LayerProps {
	urlGenerator: UrlGenerator;
	camera: CameraState;
	centerTile: TilePos;
	grid: GridState;
}

interface LayerState extends ViewOffset {
	tiles: Tile[][],//rows and columns
}

export default class Layer extends React.Component<LayerProps, LayerState> {
	private readonly initialCenter: TilePos = {...this.props.centerTile};//copy;
	private readonly zoom = this.props.camera.zoom;
	
	private bounds = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	};
	
	state: LayerState = {
		tiles: [],
		...this.calculateOffset()
	};
	
	constructor(props: LayerProps) {
		super(props);
	}
	
	componentDidMount() {
		//const {tilesX, tilesY} = this.props.grid;
		
		//let tiles = this.state.tiles;
		/*for(let y=0; y<tilesY; y++) {
			let row: Tile[] = [];
			for(let x=0; x<tilesX; x++) {
				row.push( new Tile(x - ((tilesX/2)|0), y - ((tilesY/2)|0)) );
			}
			tiles.push(row);
		}*/
		
		/*this.setState({
			tiles,
			...this.calculateOffset()
		});*/
		
		//put initial row with single tile to expand grid from 1x1 size
		this.state.tiles.push([new Tile(0, 0)]);
		this.recalculateGrid();
	}
	
	componentDidUpdate(prevProps: Readonly<LayerProps>, prevState: Readonly<LayerState>, snapshot?: any): void {
		if(prevProps.grid.tilesY !== this.props.grid.tilesY || prevProps.grid.tilesX !== this.props.grid.tilesX) {
			//TODO: adjust tiles
			console.log('adjust tiles because screen was resized');
		}
		
		if(prevProps.centerTile.x !== this.props.centerTile.x ||
			prevProps.centerTile.y !== this.props.centerTile.y)
		{
			this.onCameraMove();
			
			/*if( (prevProps.centerTile.x|0) < (this.props.centerTile.x|0) ) {//add column at right side
				console.log( 'test' );
				for(let y=0; y<this.state.tiles.length; y++) {//for each row
					this.state.tiles[y].push(
						new Tile(this.state.tiles[y].length - ((this.props.grid.tilesX/2)|0), y - ((this.props.grid.tilesY)|0)) );
				}
				this.setState({tiles: this.state.tiles});
			}*/
			if( (prevProps.centerTile.x|0) !== (this.props.centerTile.x|0) ||
				(prevProps.centerTile.y|0) !== (this.props.centerTile.y|0) )
			{
				this.recalculateGrid();
			}
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
	
	private recalculateGrid() {
		// noinspection JSUnusedAssignment
		let modified = false;
		
		const tileDeltaX = (this.props.centerTile.x|0) - (this.initialCenter.x|0);
		const tileDeltaY = (this.props.centerTile.y|0) - (this.initialCenter.y|0);
		
		let minLeft = tileDeltaX - Math.floor(this.props.grid.tilesX/2);
		while(minLeft < this.bounds.left && (modified = true))
			this.expandGrid(SIDE.LEFT, this.state.tiles);
		
		let minRight = tileDeltaX + Math.floor(this.props.grid.tilesX/2);
		while(minRight > this.bounds.right && (modified = true))
			this.expandGrid(SIDE.RIGHT, this.state.tiles);
		
		let minTop = tileDeltaY + Math.floor(this.props.grid.tilesY/2);
		while(minTop > this.bounds.top && (modified = true))
			this.expandGrid(SIDE.TOP, this.state.tiles);
		
		let minBottom = tileDeltaY - Math.floor(this.props.grid.tilesY/2);
		while(minBottom < this.bounds.bottom && (modified = true))
			this.expandGrid(SIDE.BOTTOM, this.state.tiles);
		
		///////////
		
		let maxLeft = tileDeltaX - Math.floor(this.props.grid.maxTilesX/2);
		while(maxLeft > this.bounds.left && (modified = true))
			this.expandGrid(SIDE.LEFT, this.state.tiles, true);
		
		let maxRight = tileDeltaX + Math.floor(this.props.grid.maxTilesX/2);
		while(maxRight < this.bounds.right && (modified = true))
			this.expandGrid(SIDE.RIGHT, this.state.tiles, true);
		
		let maxTop = tileDeltaY + Math.floor(this.props.grid.maxTilesY/2);
		while(maxTop < this.bounds.top && (modified = true))
			this.expandGrid(SIDE.TOP, this.state.tiles, true);
		
		let maxBottom = tileDeltaY - Math.floor(this.props.grid.maxTilesY/2);
		while(maxBottom > this.bounds.bottom && (modified = true))
			this.expandGrid(SIDE.BOTTOM, this.state.tiles, true);
		
		if(modified)
			this.setState({tiles: this.state.tiles});
	}
	
	private expandGrid(side: SIDE, tiles: Tile[][], remove = false) {//TODO: remove columns/rows
		switch (side) {
			case SIDE.LEFT: {
				this.bounds.left += remove ? 1 : -1;
				for(let y=0; y<=this.bounds.top-this.bounds.bottom; y++) {
					if(remove)
						tiles[y].shift();
					else
						tiles[y].unshift(new Tile(this.bounds.left, y+this.bounds.bottom));
				}
			}   break;
			case SIDE.RIGHT: {
				this.bounds.right += remove ? -1 : 1;
				for(let y=0; y<=this.bounds.top-this.bounds.bottom; y++) {
					if(remove)
						tiles[y].pop();
					else
						tiles[y].push(new Tile(this.bounds.right, y+this.bounds.bottom));
				}
			}   break;
			case SIDE.TOP: {
				this.bounds.top += remove ? -1 : 1;
				if(remove)
					tiles.pop();
				else {
					let row: Tile[] = [];
					for (let x = this.bounds.left; x <= this.bounds.right; x++)
						row.push(new Tile(x, this.bounds.top));
					tiles.push(row);
				}
			}   break;
			case SIDE.BOTTOM: {
				this.bounds.bottom += remove ? 1 : -1;
				if(remove)
					tiles.shift();
				else {
					let row: Tile[] = [];
					for (let x = this.bounds.left; x <= this.bounds.right; x++)
						row.push(new Tile(x, this.bounds.bottom));
					tiles.unshift(row);
				}
			}   break;
		}
	}
	
	private renderRow(row: Tile[], index: number) {
		return <div key={index+this.bounds.bottom}>{row.map(this.renderTile.bind(this))}</div>;
	}
	
	private renderTile(tile: Tile) {
		let s = subdomains[ tile.id % subdomains.length ];
		const url = this.props.urlGenerator.generate(
			this.initialCenter.x+tile.x, this.initialCenter.y+tile.y, this.zoom, s);
		return <img style={{
			// width: `${TILE_SIZE+1-tile.y%2}px`,
			height: `${TILE_SIZE+1}px`,
			width: `${TILE_SIZE+1}px`,
			// height: `${TILE_SIZE}px`,
			imageRendering: 'pixelated',//
			transform: `translate(${tile.x*TILE_SIZE}px, ${tile.y*TILE_SIZE}px) scale(0.9)`
		}} key={tile.id} src={url}
		    alt={'tile'} role={'presentation'} onLoad={e =>
			{
		    	// (e.target as HTMLImageElement).classList.add('loaded');
				let style = (e.target as HTMLImageElement).style;
				style.transform = `translate(${tile.x*TILE_SIZE}px, ${tile.y*TILE_SIZE}px) scale(1)`;
				style.opacity = '1';
		    }} />;
	}
	
	render() {
		return <div className={'layer'} style={{
			transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
		}}>{this.state.tiles.map(this.renderRow.bind(this))}</div>
	}
}