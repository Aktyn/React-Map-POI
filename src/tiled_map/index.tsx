import * as React from 'react';
import UrlGenerator from "./url_generator";
import Layer, {GridState, TILE_SIZE} from "./layer";
import {CameraState, TilePos, convertLatLongToTile, convertXYZToCamera, clamp} from "../common/utils";
import { MapSharedContext } from '../app';
import {ProviderDefaults, TileProviderData} from "../config";

import '../styles/tiled_map.scss';

export interface MapSharedState {
	camera: CameraState;
	zooming: boolean;
	centerTile: TilePos;
}

const startCamera = {
	latitude: 51.107194,
	longitude: 17.038750,
	zoom: 15
};

export const defaultSharedState = {
	camera: startCamera,
	centerTile: convertLatLongToTile(startCamera),
	zooming: false,
};

const OUTER_TILES = [3, 2];
const GRAB_SAMPLES = 20;


interface MapProps {
	width: number;
	height: number;
	onUpdate?: (sharedState: MapSharedState) => void;
}

interface MapState extends MapSharedState {
	grid: GridState;
	grabPos: {x: number, y: number, timestamp: number}[];
	//pivot: {x: number, y: number};
	layers: number[];
}

export default class TiledMap extends React.Component<MapProps, MapState> {
	static layersCounter = 0;
	
	private urlGenerator: UrlGenerator | null = null;
	private tileProvider: TileProviderData | null = null;
	private zoomingTimeout: number | null = null;
	
	state: MapState = {
		...defaultSharedState,

		grid: this.calculateGrid(),
		
		grabPos: [],
		//pivot: {x: 0, y: 0},
		
		layers: [0]
	};
	
	constructor(props: MapProps) {
		super(props);
	}
	
	componentDidMount() {
		this.setState({//force parent to refresh shared state
			camera: {...startCamera}
		});
	}
	
	componentDidUpdate(prevProps: Readonly<MapProps>, prevState: Readonly<MapState>) {
		//console.log('report update');
		if(prevProps.width !== this.props.width || prevProps.height !== this.props.height) {
			this.setState({
				grid: this.calculateGrid()
			});
		}
		if(this.props.onUpdate && (
			prevState.camera !== this.state.camera ||
			prevState.centerTile !== this.state.centerTile ||
			prevState.zooming !== this.state.zooming) )
		{
			this.props.onUpdate({
				camera: this.state.camera,
				centerTile: this.state.centerTile,
				zooming: this.state.zooming
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
	
	public move(deltaX: number, deltaY: number) {//in pixels
		const maxTile = 2 ** this.state.camera.zoom;
		let newCenter = {
			x: Math.max(0, Math.min(maxTile, this.state.centerTile.x - deltaX / TILE_SIZE)),
			y: Math.max(0, Math.min(maxTile, this.state.centerTile.y - deltaY / TILE_SIZE))
		};
		
		let updatedCamera = convertXYZToCamera(newCenter, this.state.camera.zoom);
		this.state.centerTile = newCenter;
		
		this.setState({
			centerTile: newCenter,
			camera: updatedCamera
		});
		
		return updatedCamera;
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
		if(grabPos[grabPos.length-1].timestamp - grabPos[grabPos.length-2].timestamp > 32)
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
	
	public zoom(factor: number, force = false, pivotX = this.props.width/2, pivotY = this.props.height/2) {
		factor = clamp(factor, -1, 1);
		
		if(!this.tileProvider)
			return;
		
		let new_zoom = clamp(this.state.camera.zoom+factor,
			this.tileProvider.minZoom || ProviderDefaults.minZoom,
			this.tileProvider.maxZoom || ProviderDefaults.maxZoom);
		if( (new_zoom === this.state.camera.zoom || this.state.zooming) && !force )
			return;
		
		//pivotX -= this.props.width/2;
		//pivotY -= this.props.height/2;
		//console.log(pivotX, pivotY);
		
		//new_zoom = this.state.camera.zoom;//temp
		
		//let moved_camera = this.move(-pivotX, -pivotY);
		
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
			zooming: true,
			/*pivot: {
				x: pivotX,
				y: pivotY
			},*/
			layers: updatedLayers
		});
		
		if(this.zoomingTimeout)
			clearTimeout(this.zoomingTimeout);
		this.zoomingTimeout = setTimeout(() => {
			//this.move(this.state.pivot.x, this.state.pivot.y);
			this.setState({
				zooming: false,
				/*pivot: {
					x: 0,
					y: 0
				}*/
			});
			this.zoomingTimeout = null;
		}, 400) as never;
	}
	
	private renderLayers() {
		return <MapSharedContext.Consumer>{(context) => {
			this.tileProvider = context.tileProvider;
			let generator = this.urlGenerator ||
				(this.urlGenerator = new UrlGenerator(
					context.tileProvider.template_url, context.tileProvider.subdomains));
			if(generator.template !== context.tileProvider.template_url) {//provider changed
				generator = this.urlGenerator = new UrlGenerator(
					context.tileProvider.template_url, context.tileProvider.subdomains);
			}
			//TODO: fix problem with different min / max zoom values
			return this.state.layers.map(layer_index => {
				return <Layer key={layer_index} urlGenerator={generator} {...this.state} />;
			});
		}}</MapSharedContext.Consumer>;
	}
	
	render() {
		return <div className={'map-container'} onWheel={e => {
			this.zoom(-e.deltaY/53, false, e.clientX, e.clientY)
		}} style={{
			width: `${this.props.width}px`,
			height: `${this.props.height}px`,
			//transform: `translate(${Math.floor(this.state.pivot.x)}px, ${Math.floor(this.state.pivot.y)}px)`
		}}>
			{/*<div className={'zoom-shifter'}>*/}
				<div className={`layers-container${this.state.grabPos.length ? ' grabbed' : ''}`}
				     onMouseDown={e => this.onGrabStart(e.clientX, e.clientY)}
				     onTouchStart={e => this.onGrabStart(e.touches[0].clientX, e.touches[0].clientY)}
				     onMouseUp={this.onGrabEnd.bind(this)}
				     onTouchEnd={this.onGrabEnd.bind(this)}
				     onMouseLeave={this.onGrabEnd.bind(this)}
				     onMouseMove={e => this.onGrabMove(e.clientX, e.clientY)}
				     onTouchMove={e => this.onGrabMove(e.touches[0].clientX, e.touches[0].clientY)}>{
				        this.renderLayers()
				     }</div>
				<div className={'overlays'}>{this.props.children}</div>
			{/*</div>*/}
		</div>;
	}
}