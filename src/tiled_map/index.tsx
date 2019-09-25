import * as React from 'react';
import UrlGenerator from "./url_generator";
import Layer, {GridState, TILE_SIZE} from "./layer";
import {CameraState, TilePos, convertLatLongToTile, convertXYZToCamera, clamp} from "../utils";

import '../styles/tiled_map.scss';

const OUTER_TILES = 2;

interface MapProps {
	width: number;
	height: number;
}

interface MapState {
	camera: CameraState;
	pivotPoint: {x: number, y: number};
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
		pivotPoint: {x: 0, y: 0},
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
		
		let updatedCamera = convertXYZToCamera(newCenter, this.state.camera.zoom);
		
		this.setState({
			centerTile: newCenter,
			camera: updatedCamera
		});
		
		this.setState({
			grabPos: {x, y}
		});
	}
	
	private onZoom(factor: number, zoomX: number, zoomY: number) {
		this.setState({
			camera: {
				...this.state.camera,
				zoom: clamp(this.state.camera.zoom-factor, 0, 22)
			},
			pivotPoint: {
				x: (zoomX - this.props.width/2) / TILE_SIZE,
				y: (zoomY - this.props.height/2) / TILE_SIZE
			}
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
			     onTouchMove={e => this.onGrabMove(e.touches[0].clientX, e.touches[0].clientY)}
			     onWheel={e => this.onZoom(e.deltaY/53, e.clientX, e.clientY)}>
				<Layer urlGenerator={this.urlGenerator} {...this.state} />
			</div>
			<div className={'overlays'}>{this.props.children}</div>
		</div>;
	}
}