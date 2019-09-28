import * as React from 'react';
import MapObjects, {EVENT} from "../map_objects";
import {MarkerDataSchema} from "../components/marker";
import Pin from "../components/pin";
import * as Settings from '../user_settings';

import '../styles/gui/right_panel.scss';

const random99 = (1+Math.random()*99)|0;

interface RightPanelState {
	loadingData: boolean;
	markerTypes: {[index: string]: MarkerDataSchema};
}


export default class RightPanel extends React.Component<any, RightPanelState> {
	private readonly dataLoadListener = this.onDataLoaded.bind(this);
	private readonly markerTypesUpdateListener = this.onMarkerTypesUpdate.bind(this);
	
	private pickerOpen = false;
	
	state: RightPanelState = {
		loadingData: true,
		markerTypes: Settings.getValue('marker-types'),
	};
	
	componentDidMount() {
		MapObjects.on(EVENT.LOAD, this.dataLoadListener);
		Settings.onValueChanged('marker-types', this.markerTypesUpdateListener);
	}
	
	componentWillUnmount() {
		MapObjects.off(EVENT.LOAD, this.dataLoadListener);
		Settings.offValueChanged('marker-types', this.markerTypesUpdateListener);
	}
	
	private onMarkerTypesUpdate(value: {[index: string]: MarkerDataSchema}) {
		this.setState({markerTypes: value});
	}
	
	private onDataLoaded() {
		this.setState({loadingData: false});
	}
	
	private renderMarkerLegend([name, data]: [string, MarkerDataSchema], index: number) {
		return <div key={index}>
			<label>{name}</label>
			<div style={{
				width: '32px',
				height: '32px',
				margin: '5px auto'
			}}>
				<Pin size={32} markerData={data} elements={name === 'GROUP' ? random99 : 1}/>
			</div>
			<div>
				<input type={'color'} value={data.color} onChange={e => {
					data.color = e.target.value;
					this.setState({
						markerTypes: this.state.markerTypes
					})
				}} onFocus={() => {
					this.pickerOpen = !this.pickerOpen;
					if(!this.pickerOpen) {
						Settings.changeValue('marker-types', this.state.markerTypes);
					}
				}} />
			</div>
		</div>;
	}
	
	render() {//TODO: interface for changing marker icon with fontawesome
		return <div className={'right-panel'}>
			<div className={'objects-counter'}>{this.state.loadingData ?
				<span>Loading data <i className='fas fa-spinner fa-pulse'/></span> :
				<span>Total objects: {MapObjects.getTotalCount()}</span>
			}</div>
			<div className={'legend'}>
				<div className={'markers'}>
					{Object.entries(this.state.markerTypes).map(this.renderMarkerLegend.bind(this))}
				</div>
				<div><button className={'clean white-btn'} onClick={() => {
					Settings.restoreDefaultValue('marker-types');
				}}>RESTORE DEFAULTS</button></div>
			</div>
		</div>;
	}
}