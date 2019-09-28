import * as React from 'react';
import MapObjects, {EVENT, ObjectSchema} from './map_objects';
import { MapSharedContext } from './app';
import {convertLatLongToTile, TilePos} from "./utils";
import {TILE_SIZE} from "./tiled_map/layer";
import Marker, {MarkerData} from "./components/marker";

import './styles/overlays_grid.scss';
import CONFIG from "./config";

interface GridProps {
	width: number;
	height: number;
}

interface GridState {
	data: ObjectSchema;
	markers: MarkerData[];
	locked: boolean;
}

export default class Grid extends React.Component<GridProps, GridState> {
	private readonly dataLoadListener = this.onDataLoaded.bind(this);
	
	private dtx = 0;
	private dty = 0;
	
	private fromContext: {
		overlaysCenter: TilePos;
		camera_zoom: number;
	} | null = null;
	
	state: GridState = {
		data: [],
		markers: [],
		locked: false
	};
	
	componentDidMount() {
		MapObjects.on(EVENT.LOAD, this.dataLoadListener);
	}
	
	componentWillUnmount() {
		MapObjects.off(EVENT.LOAD, this.dataLoadListener);
	}
	
	componentDidUpdate(prevProps: Readonly<any>, prevState: Readonly<GridState>) {
		if(this.state.locked && !prevState.locked) {
			this.preprocessData(this.state.data);
		}
	}
	
	private onDataLoaded(data: ObjectSchema) {
		this.setState({data});
		this.preprocessData(data);
	}
	
	private static groupMarkers(markers: MarkerData[]) {
		let grouped: MarkerData[] = [];
		
		while( markers.length > 0 ) {
			let group = markers.pop() as MarkerData;
			
			for(let i=0; i<markers.length; i++) {//rest of the markers
				let marker = markers[i];
				let dst =   Math.pow(marker.relativePos.x - group.relativePos.x, 2) +
							Math.pow(marker.relativePos.y - group.relativePos.y, 2);
				
				let minDst = CONFIG.markerSize;
				if(dst < minDst*minDst) {
					//group markers and average its positions
					//group.id += marker.id;
					let elCount = group.elements.length;
					group.relativePos.x = (group.relativePos.x*elCount + marker.relativePos.x) / (elCount+1);
					group.elements.push( ...marker.elements );
					
					markers.splice(i, 1);//remove added marker from array
					i--;
				}
			}
			
			grouped.push(group);
		}
	    
		return grouped;
	}
	
	private preprocessData(data: ObjectSchema) {
		if( !this.fromContext )
			return;
		
		//calculate positions for markers
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
						x: (tilePos.x - this.fromContext.overlaysCenter.x)*TILE_SIZE,
						y: (tilePos.y - this.fromContext.overlaysCenter.y)*TILE_SIZE
					}
				});
			}
		}
		
		let grouped = Grid.groupMarkers(markers);
		
		this.setState({
			markers: grouped,
			locked: false
		});
	}
	
	private centerGrid(offsetX: number, offsetY: number) {
		let markers = this.state.markers;
		
		for(let marker of markers) {
			marker.relativePos.x += offsetX;
			marker.relativePos.y += offsetY;
		}
		
		return markers;
	}
	
	private renderMarkers(dtx: number, dty: number) {
		const offset = 256;
		return this.state.markers.map((marker_data) => {
			let posX = marker_data.relativePos.x + dtx;
			let posY = marker_data.relativePos.y + dty;
			if( posX < -(this.props.width/2+offset) || posX > this.props.width/2+offset ||
				posY < -(this.props.height/2+offset) || posY > this.props.height/2+offset)
			{
				return undefined;
			}
			return <span className={'marker-holder'} key={marker_data.id} style={{
				transform: `translate(${Math.floor(marker_data.relativePos.x)}px, ${
					Math.floor(marker_data.relativePos.y)}px)`
			}}><Marker data={marker_data} /></span>;
		});
	}
	
	render() {
		return <MapSharedContext.Consumer>{(context) => {
			let locked = this.state.locked;
			if( !this.fromContext || (this.fromContext.camera_zoom !== context.camera.zoom) )
			{
				let noContext = !this.fromContext;
				
				this.fromContext = {
					overlaysCenter: {...context.centerTile},//make sure not to create new object
					camera_zoom: context.camera.zoom
				};
				
				let dtx = this.dtx;
				let dty = this.dty;
				if(this.state.data.length) {
					//this.state.locked = true;
					locked = true;
					let centered_markers = this.centerGrid(dtx, dty);
					setTimeout(() => {
						this.setState({
							markers: centered_markers,
							locked: true
						});
					});
				}
				
				if(noContext)
					return 'Awaiting map context';
			}
			
			this.dtx = Math.floor( (this.fromContext.overlaysCenter.x - context.centerTile.x) * TILE_SIZE );
			this.dty = Math.floor( (this.fromContext.overlaysCenter.y - context.centerTile.y) * TILE_SIZE );
			return <div className={`overlays-grid${!locked ? ' zooming' : ''}`} style={{
				transform: `translate(${this.dtx}px, ${this.dty}px)`
			}}>{this.renderMarkers(this.dtx, this.dty)}</div>;
		}}</MapSharedContext.Consumer>;
	}
}