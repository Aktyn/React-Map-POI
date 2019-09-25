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
	pivotPoint: {x: number, y: number};
	centerTile: TilePos;
	grid: GridState;
}

interface LayerState extends ViewOffset {
	tiles: Tile[][];//rows and columns
	pivot_offset: {x: number, y: number};
	zoomed: boolean;
}

export default class Layer extends React.Component<LayerProps, LayerState> {
	private readonly pivotTile: TilePos = {...this.props.centerTile};//copy;
	private readonly zoom = this.props.camera.zoom;
	
	private bounds = {
		left: 0,
		right: 0,
		top: 0,
		bottom: 0
	};
	
	state: LayerState = {
		tiles: [],
		...this.calculateOffset(),
		pivot_offset: {
			x: Math.floor(this.pivotTile.x) - this.pivotTile.x + 0.5,
			y: Math.floor(this.pivotTile.y) - this.pivotTile.y + 0.5
		},
		zoomed: false
	};
	
	constructor(props: LayerProps) {
		super(props);
	}
	
	public get zoom_diff() {
		return 2 ** (this.props.camera.zoom - this.zoom);
	}
	
	componentDidMount() {
		//put initial row with single tile to expand grid from 1x1 size
		this.state.tiles.push([new Tile(0, 0)]);
		this.recalculateGrid();
	}
	
	componentDidUpdate(prevProps: Readonly<LayerProps>): void {
		if(prevProps.grid.tilesY !== this.props.grid.tilesY || prevProps.grid.tilesX !== this.props.grid.tilesX) {
			this.recalculateGrid();
		}
		
		if(prevProps.camera.zoom !== this.props.camera.zoom) {
			this.onZoom(prevProps);
		}
		
		if(prevProps.centerTile.x !== this.props.centerTile.x ||
			prevProps.centerTile.y !== this.props.centerTile.y)
		{
			if( (prevProps.centerTile.x|0) !== (this.props.centerTile.x|0) ||
				(prevProps.centerTile.y|0) !== (this.props.centerTile.y|0) )
			{//TODO: recalculate new pivot point and center tile
				this.recalculateGrid();
			}
			
			this.onCameraMove();
		}
	}
	
	private calculateOffset(): ViewOffset {
		return {
			offsetX: TILE_SIZE * (this.pivotTile.x - this.props.centerTile.x),
			offsetY: TILE_SIZE * (this.pivotTile.y - this.props.centerTile.y)
		};
	}
	
	private onCameraMove() {
		this.setState({
			...this.calculateOffset()
		});
	}
	
	private onZoom(prevProps: Readonly<LayerProps>) {
		//console.log('zoomed', this.props.pivotPoint, this.pivotTile, this.zoom_diff);
		
		let prev_zoom_diff = 2 ** (prevProps.camera.zoom - this.zoom);
		let cx = (this.pivotTile.x - this.props.centerTile.x);
		let cy = (this.pivotTile.y - this.props.centerTile.y);
		this.props.pivotPoint.x = cx + (this.props.pivotPoint.x-cx) / prev_zoom_diff;
		this.props.pivotPoint.y = cy + (this.props.pivotPoint.y-cy) / prev_zoom_diff;
		
		let new_pivot_offset = {
			x: this.state.pivot_offset.x - this.props.pivotPoint.x + (this.pivotTile.x - this.props.centerTile.x),
			y: this.state.pivot_offset.y - this.props.pivotPoint.y + (this.pivotTile.y - this.props.centerTile.y)
		};
		
		this.props.centerTile.x = this.pivotTile.x - this.props.pivotPoint.x;
		this.props.centerTile.y = this.pivotTile.y - this.props.pivotPoint.y;
		
		//console.log( this.calculateOffset() );//should be 0, 0
		
		this.setState({
			...this.calculateOffset(),
			pivot_offset: new_pivot_offset,
			zoomed: true
		});
	}
	
	private recalculateGrid() {
		if( this.zoom_diff !== 1 )//do not change tiles on zoomed layer
			return;
		
		// noinspection JSUnusedAssignment
		let modified = false;
		
		const tileDeltaX = Math.round(this.props.centerTile.x - this.pivotTile.x);
		const tileDeltaY = Math.round(this.props.centerTile.y - this.pivotTile.y);
		
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
		
		///////////////////////////////////////////////////////////
		
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
	
	private expandGrid(side: SIDE, tiles: Tile[][], remove = false) {
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
			this.pivotTile.x+tile.x, this.pivotTile.y+tile.y, this.zoom, s);
		
		let offX = (tile.x+this.state.pivot_offset.x) * TILE_SIZE;
		let offY = (tile.y+this.state.pivot_offset.y) * TILE_SIZE;
		
		return <img style={{
			height: `${TILE_SIZE+1}px`,
			width: `${TILE_SIZE+1}px`,
			imageRendering: 'pixelated',
			transform: `translate(${offX}px, ${offY}px) scale(${this.state.zoomed ? 1 : 0.9})`
		}} key={tile.id} src={url}
		    alt={'tile'} role={'presentation'} onLoad={e =>
			{
				if(this.state.zoomed)
					return;
				let style = (e.target as HTMLImageElement).style;
				style.transform = `translate(${offX}px, ${offY}px) scale(1)`;
				style.opacity = '1';
		    }} />;
	}
	
	render() {
		return <div className={'layer'} style={{
			transform: `translate(${this.state.offsetX}px, ${this.state.offsetY}px)`
		}}>
			<div className={`tiles-grid${this.state.zoomed ? ' zoomed' : ''}`} style={{
				transform: `scale(${this.zoom_diff})`,
			}}>{this.state.tiles.map(this.renderRow.bind(this))}</div>
		</div>
	}
}