import * as React from 'react';
import MapObjects, {EVENT, ObjectType} from "../map_objects";
import {MarkerDataSchema} from "../components/marker";
import Pin from "../components/pin";
import * as Settings from '../user_settings';
import {FiltersSchema} from "../markers_filter";

import '../styles/gui/right_panel.scss';

const random99 = (1+Math.random()*99)|0;

interface RightPanelState {
	loadingData: boolean;
	markerTypes: {[index: string]: MarkerDataSchema};
	filtersData: FiltersSchema;
}

export default class RightPanel extends React.Component<any, RightPanelState> {
	private readonly dataLoadListener = this.onDataLoaded.bind(this);
	private readonly markerTypesUpdateListener = this.onMarkerTypesUpdate.bind(this);
	private readonly filtersUpdateListener = this.onFiltersUpdate.bind(this);
	
	private pickerOpen = false;
	
	state: RightPanelState = {
		loadingData: true,
		markerTypes: Settings.getValue('marker-types'),
		filtersData: Settings.getValue('filters')
	};
	
	componentDidMount() {
		MapObjects.on(EVENT.LOAD, this.dataLoadListener);
		Settings.onValueChanged('marker-types', this.markerTypesUpdateListener);
		Settings.onValueChanged('filters', this.filtersUpdateListener);
	}
	
	componentWillUnmount() {
		MapObjects.off(EVENT.LOAD, this.dataLoadListener);
		Settings.offValueChanged('marker-types', this.markerTypesUpdateListener);
		Settings.offValueChanged('filters', this.filtersUpdateListener);
	}
	
	private onDataLoaded() {
		this.setState({loadingData: false});
	}
	
	private onMarkerTypesUpdate(value: {[index: string]: MarkerDataSchema}) {
		this.setState({markerTypes: value});
	}
	
	private onFiltersUpdate(filters: FiltersSchema) {
		this.setState({filtersData: filters});
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
	
	private renderHideAllOption(type: ObjectType, filters: FiltersSchema) {
		return <div className={'row'} style={{flex: 'none'}}>
			<label>Show:</label>
			<input type={'checkbox'} checked={filters[type].display} onChange={e => {
				filters[type].display = e.target.checked;
				Settings.changeValue('filters', filters);
			}}/>
		</div>;
	}
	
	private renderFilters() {
		let filters = this.state.filtersData;
		return <>
			<section>
				<label>VEHICLE</label>
				<article>
					{this.renderHideAllOption('VEHICLE', filters)}
					{filters['VEHICLE'].display && <>
						<div>
							<strong style={{display: 'block'}}>STATUS</strong>
							<div className={'row'}>
								<label>Available:</label>
								<input type={'checkbox'}
								       checked={filters['VEHICLE'].status.includes('AVAILABLE')} onChange={e =>
								{
								    if(e.target.checked)
										filters['VEHICLE'].status.push('AVAILABLE');
								    else
								        filters['VEHICLE'].status = filters['VEHICLE'].status.filter(s => {
								        	return s !== 'AVAILABLE';
								        });
									Settings.changeValue('filters', filters);
								}} />
							</div>
						</div>
						<div>
							<strong style={{display: 'block'}}>BATTERY</strong>
							<span style={{
								display: 'grid',
								gridTemplateColumns: '1fr auto',
								gridTemplateRows: 'auto auto'
							}}>
								<label>min:</label>
								<input style={{width: '40px'}} type={'number'} min={0} max={100}
								       value={filters['VEHICLE'].batteryLevelMin.toString()} onChange={e => {
								        filters['VEHICLE'].batteryLevelMin = parseInt(e.target.value);
								        Settings.changeValue('filters', filters);
								}}/>
								
								<label>max:</label>
								<input style={{width: '40px'}} type={'number'} min={0} max={100}
								       value={filters['VEHICLE'].batteryLevelMax.toString()} onChange={e =>
								{
									filters['VEHICLE'].batteryLevelMax = parseInt(e.target.value);
									Settings.changeValue('filters', filters);
								}}/>
							</span>
						</div>
					</>}
				</article>
			</section>
			<section>
				<label>PARKING</label>
				<article>
					{this.renderHideAllOption('PARKING', filters)}
					{filters['PARKING'].display && <>
						<div className={'row'}>
							<label>Minimum available spaces:</label>
							<input style={{width: '40px'}} type={'number'}
							       value={filters['PARKING'].availableSpacesMin} min={0} max={999} onChange={e =>
							{
								filters['PARKING'].availableSpacesMin = parseInt(e.target.value);
								Settings.changeValue('filters', filters);
							}} />
						</div>
					</>}
				</article>
			</section>
			<section>
				<label>POI</label>
				<article>
					{this.renderHideAllOption('POI', filters)}
				</article>
			</section>
		</>;
	}
	
	render() {//TODO: interface for changing marker icon with fontawesome
		return <div className={'right-panel'}>
			<div className={'objects-counter'}>{this.state.loadingData ?
				<span>Loading data <span key={'loader'}><i className='fas fa-spinner fa-pulse'/></span></span> :
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
			<div className={'filters'}>
				{this.renderFilters()}
				<div><button className={'clean white-btn'} onClick={() => {
					Settings.restoreDefaultValue('filters');
				}}>CLEAR FILTERS</button></div>
			</div>
		</div>;
	}
}