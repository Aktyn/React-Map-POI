import * as React from 'react';
import UrlGenerator from "./url_generator";
import Layer, {GridState, TILE_SIZE} from "./layer";
import {CameraState, TilePos, convertLatLongToTile, convertXYZToCamera, clamp, noop} from "../utils";

import '../styles/tiled_map.scss';

interface MapContextInterface extends MapProps {
	camera: CameraState;
	centerTile: TilePos;
	zooming: boolean;
	zoom(factor: number): void;
}
export const MapContext = React.createContext<MapContextInterface>({
	width: window.innerWidth,
	height: window.innerHeight,
	zooming: false,
	camera: {
		latitude: 0,
		longitude: 0,
		zoom: 0
	},
	centerTile: {x: 0, y: 0},
	zoom: noop
});

const OUTER_TILES = [3, 2];
const GRAB_SAMPLES = 20;

interface MapProps {
	width: number;
	height: number;
}

interface MapState {
	camera: CameraState;
	zooming: boolean;
	//pivotPoint: {x: number, y: number};
	centerTile: TilePos;
	grid: GridState;
	grabPos: {x: number, y: number, timestamp: number}[];
	
	layers: number[];
}

export default class TiledMap extends React.Component<MapProps, MapState> {
	private static layersCounter = 0;
	
	private urlGenerator = new UrlGenerator('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	private zoomingTimeout: number | null = null;
	
	state: MapState = {
		camera: {
			latitude: 0,
			longitude: 0,
			zoom: 0
		},
		zooming: false,
		//pivotPoint: {x: 0, y: 0},
		centerTile: {x: 0, y: 0},
		grid: this.calculateGrid(),
		
		grabPos: [],
		
		layers: [0]
	};
	
	constructor(props: MapProps) {
		super(props);
		
		this.state.camera = {
			latitude: 51.4764211,
			longitude: 21.3709875,
			zoom: 14//18
		};
		this.state.centerTile = convertLatLongToTile(this.state.camera);
	}
	
	componentDidUpdate(prevProps: Readonly<MapProps>) {
		if(prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
			this.setState({
				grid: this.calculateGrid()
			});
		}
	}
	
	private calculateGrid(): GridState {
		let tilesX = Math.ceil(this.props.width / TILE_SIZE) + OUTER_TILES[0],
			tilesY = Math.ceil(this.props.height / TILE_SIZE) + OUTER_TILES[1];
		return {
			tilesX,
			tilesY,
			maxTilesX: tilesX * 2,
			maxTilesY: tilesY * 2
		};
	}
	
	private move(deltaX: number, deltaY: number) {//in pixels
		const maxTile = 2 ** this.state.camera.zoom;
		let newCenter = {
			x: Math.max(0, Math.min(maxTile, this.state.centerTile.x - deltaX / TILE_SIZE)),
			y: Math.max(0, Math.min(maxTile, this.state.centerTile.y - deltaY / TILE_SIZE))
		};
		
		let updatedCamera = convertXYZToCamera(newCenter, this.state.camera.zoom);
		
		this.setState({
			centerTile: newCenter,
			camera: updatedCamera
		});
	}
	
	private updateVelocity(vx: number, vy: number) {
		if(this.state.grabPos.length || this.state.zooming || (Math.abs(vx) < 1 && Math.abs(vy) < 1))
			return;
		this.move(vx, vy);
		
		requestAnimationFrame(() => this.updateVelocity(vx*0.9, vy*0.9));
	}
	
	private onGrabStart(x: number, y: number) {
		this.setState({
			grabPos: [{x, y, timestamp: Date.now()}]
		});
	}
	
	private onGrabEnd() {
		//calculate velocity
		let grabPos = this.state.grabPos;
		this.setState({grabPos: []});
		if (grabPos.length < 5)
			return;
		if (grabPos[grabPos.length - 1].timestamp - grabPos[0].timestamp > 200)
			return;
		if(grabPos[grabPos.length-1].timestamp - grabPos[grabPos.length-2].timestamp > 33)
			return;
		
		//min distance
		const min_distance = 32;
		if( Math.pow(grabPos[grabPos.length-1].x - grabPos[0].x, 2) +
			Math.pow(grabPos[grabPos.length-1].y - grabPos[0].y, 2) < min_distance*min_distance )
		{
			return;
		}
		
		//calculate weighted average velocity
		let vx = 0, vy = 0;
		for(let i=grabPos.length-1; i>0; i--) {
			vx += (grabPos[i].x - grabPos[i-1].x) * i;
			vy += (grabPos[i].y - grabPos[i-1].y) * i;
		}
		let weighs_sum = ((grabPos.length-1)**2 + grabPos.length-1) / 2;//4 + 3 + 2 + 1
		vx /= weighs_sum * 0.5;
		vy /= weighs_sum * 0.5;
		
		requestAnimationFrame(() => this.updateVelocity(vx, vy));
	}
	
	
	private onGrabMove(x: number, y: number) {
		let grabPos = this.state.grabPos;
		if( !grabPos.length || this.state.zooming )
			return;
		
		this.move(x - grabPos[grabPos.length-1].x, y - grabPos[grabPos.length-1].y);
		
		grabPos.push({x, y, timestamp: Date.now()});
		while(grabPos.length > GRAB_SAMPLES)
			grabPos.shift();
		
		this.setState({grabPos});
	}
	
	private onZoom(factor: number/*, zoomX: number, zoomY: number*/) {
		factor = clamp(factor, -1, 1);
		
		let new_zoom = clamp(this.state.camera.zoom+factor, 0, 19);
		if(new_zoom === this.state.camera.zoom || this.state.zooming)
			return;
		
		//new_zoom = this.state.camera.zoom;//temp
		
		//zoomX = zoomX - this.props.width/2;
		//zoomY = zoomY - this.props.height/2;
		//console.log(zoomX, zoomY);
		
		/*let newCenter = {
			x: this.state.centerTile.x + zoomX / TILE_SIZE,
			y: this.state.centerTile.y + zoomY / TILE_SIZE
		};
		
		let updatedCamera = convertXYZToCamera(newCenter, this.state.camera.zoom);
		updatedCamera.zoom = new_zoom;
		newCenter = convertLatLongToTile(updatedCamera);*/
		
		let updatedCamera = {
			...this.state.camera,
			zoom: new_zoom
		};
		
		let updatedLayers = this.state.layers.concat( ++TiledMap.layersCounter );
		if(updatedLayers.length > 2) {
			setTimeout(() => {
				let layers = this.state.layers;
				layers.splice(0, 1);
				this.setState({layers});
			}, 1000);
		}
		
		this.setState({
			centerTile: convertLatLongToTile(updatedCamera),
			camera: updatedCamera,
			/*pivotPoint: {
				x: (zoomX - this.props.width/2) / TILE_SIZE,
				y: (zoomY - this.props.height/2) / TILE_SIZE
			},*/
			zooming: true,
			layers: updatedLayers
		});
		
		if(this.zoomingTimeout)
			clearTimeout(this.zoomingTimeout);
		this.zoomingTimeout = setTimeout(() => {
			this.setState({
				zooming: false
			});
			this.zoomingTimeout = null;
		}, 400) as never;
	}
	
	private renderLayers() {
		return this.state.layers.map(layer_index => {
			return <Layer key={layer_index} urlGenerator={this.urlGenerator} {...this.state} />;
		});
	}
	
	render() {
		return <div className={'map-container'} style={{
			width: `${this.props.width}px`,
			height: `${this.props.height}px`
		}}>
			<div className={`layers-container${this.state.grabPos.length ? ' grabbed' : ''}`}
			     onMouseDown={e => this.onGrabStart(e.clientX, e.clientY)}
			     onTouchStart={e => this.onGrabStart(e.touches[0].clientX, e.touches[0].clientY)}
			     onMouseUp={this.onGrabEnd.bind(this)}
			     onTouchEnd={this.onGrabEnd.bind(this)}
			     onMouseLeave={this.onGrabEnd.bind(this)}
			     onMouseMove={e => this.onGrabMove(e.clientX, e.clientY)}
			     onTouchMove={e => this.onGrabMove(e.touches[0].clientX, e.touches[0].clientY)}
			     onWheel={e => this.onZoom(-e.deltaY/53/*, e.clientX, e.clientY*/)}>{this.renderLayers()}</div>
			<div className={'overlays'}>
				<MapContext.Provider value={{
					...this.props,
					camera: this.state.camera,
					centerTile: this.state.centerTile,
					zooming: this.state.zooming,
					zoom: factor => console.log(factor)
				}}>
					{this.props.children}
				</MapContext.Provider>
			</div>
		</div>;
	}
}