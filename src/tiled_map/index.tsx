import * as React from 'react';
import UrlGenerator from "./url_generator";
import Layer, {GridState, TILE_SIZE} from "./layer";
import {CameraState, TilePos, convertLatLongToTile, convertXYZToLatLong} from "../utils";

import '../styles/tiled_map.scss';

const OUTER_TILES = 2;

interface MapProps {
	width: number;
	height: number;
}

interface MapState {
	camera: CameraState;
	centerTile: TilePos;
	grid: GridState;
	grabPos: {x: number, y: number} | null;
}

export default class TiledMap extends React.Component<MapProps, MapState> {
	private urlGenerator = new UrlGenerator('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	
	state: MapState = {
		camera: {
			latitude: 0,
			longitude: 0,
			zoom: 0
		},
		centerTile: {x: 0, y: 0},
		grid: this.calculateGrid(),
		
		grabPos: null
	};
	
	constructor(props: MapProps) {
		super(props);
		
		this.state.camera = {
			latitude: 51.7769406,
			longitude: 19.4279159,
			zoom: 18
		};
		this.state.centerTile = convertLatLongToTile(this.state.camera);
	}
	
	componentDidMount() {
		//TODO: handle scroll and grab events to manipulate camera (assign to layers-container)
	}
	
	componentWillUnmount() {
	
	}
	
	componentDidUpdate(prevProps: Readonly<MapProps>) {
		if(prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
			this.setState({
				grid: this.calculateGrid()
			});
		}
	}
	
	private calculateGrid(): GridState {
		let tilesX = TiledMap.calculateTiles(this.props.width),
			tilesY = TiledMap.calculateTiles(this.props.height);
		return {
			tilesX,
			tilesY,
			maxTilesX: tilesX * 2,
			maxTilesY: tilesY * 2
		};
	}
	
	private static calculateTiles(distance: number) {
		return Math.ceil(distance / TILE_SIZE) + OUTER_TILES;
	}
	
	private onGrabStart(x: number, y: number) {
		this.setState({
			grabPos: {x, y}
		});
	}
	
	private onGrabEnd() {
		this.setState({grabPos: null});
	}
	
	private onGrabMove(x: number, y: number) {
		if( !this.state.grabPos )
			return;
		
		let newCenter = {
			x: this.state.centerTile.x - (x - this.state.grabPos.x) / TILE_SIZE,
			y: this.state.centerTile.y - (y - this.state.grabPos.y) / TILE_SIZE
		};
		
		let updatedLatLong = convertXYZToLatLong(newCenter, this.state.camera.zoom);
		
		this.setState({
			centerTile: newCenter,
			camera: {
				latitude: updatedLatLong.latitude,
				longitude: updatedLatLong.longitude,
				zoom: this.state.camera.zoom
			}
		});
		
		this.setState({
			grabPos: {x, y}
		});
	}
	
	render() {
		return <div className={'map-container'} style={{
			width: `${this.props.width}px`,
			height: `${this.props.height}px`
		}}>
			<div className={`layers-container${this.state.grabPos ? ' grabbed' : ''}`}
			     onMouseDown={e => this.onGrabStart(e.clientX, e.clientY)}
			     onTouchStart={e => this.onGrabStart(e.touches[0].clientX, e.touches[0].clientY)}
			     onMouseUp={this.onGrabEnd.bind(this)}
			     onTouchEnd={this.onGrabEnd.bind(this)}
			     onMouseLeave={this.onGrabEnd.bind(this)}
			     onMouseMove={e => this.onGrabMove(e.clientX, e.clientY)}
			     onTouchMove={e => this.onGrabMove(e.touches[0].clientX, e.touches[0].clientY)} >
				<Layer urlGenerator={this.urlGenerator} camera={this.state.camera} centerTile={this.state.centerTile}
				       grid={this.state.grid} />
			</div>
			<div className={'overlays'}>{this.props.children}</div>
		</div>;
	}
}