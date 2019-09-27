import * as React from 'react';
import MapObjects, {EVENT, ObjectSchema} from './map_objects';
import { MapSharedContext } from './app';
import {convertLatLongToTile, TilePos} from "./utils";
import {TILE_SIZE} from "./tiled_map/layer";
import Marker, {MarkerData} from "./components/marker";

import './styles/overlays_grid.scss';

interface GridState {
	data: ObjectSchema;
	markers: MarkerData[];
}

export default class Grid extends React.Component<any, GridState> {
	private readonly dataLoadListener = this.onDataLoaded.bind(this);
	
	private fromContext: {
		overlaysCenter: TilePos;
		camera_zoom: number;
	} | null = null;
	
	state: GridState = {
		data: [],
		markers: []
	};
	
	constructor(props: any) {
		super(props);
	}
	
	componentDidMount() {
		MapObjects.on(EVENT.LOAD, this.dataLoadListener);
	}
	
	componentWillUnmount() {
		MapObjects.off(EVENT.LOAD, this.dataLoadListener);
	}
	
	private onDataLoaded(data: ObjectSchema) {
		this.setState({data});
		this.preprocessData(data);
	}
	
	private preprocessData(data: ObjectSchema) {
		if( !this.fromContext )
			return;
		
		//here goes positioning and deciding whether to group overlays
		let markers: MarkerData[] = [];
		
		for(let obj_type of data) {
			for(let obj of obj_type.objects) {
				let tilePos = convertLatLongToTile({
					latitude: obj.location.latitude,
					longitude: obj.location.longitude,
					zoom: this.fromContext.camera_zoom
				});
				
				markers.push({
					id: obj.id,//or concatenated id for multiple elements
					elements: [
						{
							type: obj_type.type,
							data: obj
						}
					],
					relativePos: {
						x: Math.floor((tilePos.x - this.fromContext.overlaysCenter.x)*TILE_SIZE),
						y: Math.floor((tilePos.y - this.fromContext.overlaysCenter.y)*TILE_SIZE)
					}
				});
			}
		}
		
		//make sure to update state outside render function
		setTimeout(() => this.setState({markers}), 1);
	}
	
	private renderMarkers() {
		return this.state.markers.map((marker_data) => {
			return <Marker key={marker_data.id} data={marker_data} />;
		});
	}
	
	render() {
		return <MapSharedContext.Consumer>{(context) => {
			if( !this.fromContext || this.fromContext.camera_zoom !== context.camera.zoom ) {
				this.fromContext = {
					overlaysCenter: {...context.centerTile},//make sure not to create new object
					camera_zoom: context.camera.zoom
				};
				
				if(this.state.data.length)
					this.preprocessData(this.state.data);
			}
			
			let dtx = Math.floor( (this.fromContext.overlaysCenter.x - context.centerTile.x) * TILE_SIZE );
			let dty = Math.floor( (this.fromContext.overlaysCenter.y - context.centerTile.y) * TILE_SIZE );
			return <div className={`overlays-grid${context.zooming ? ' zooming' : ''}`} style={{
				transform: `translate(${dtx}px, ${dty}px)`
			}}>{this.renderMarkers()}</div>;
		}}</MapSharedContext.Consumer>;
	}
}