import * as React from 'react';
import { MapSharedContext } from '../app';
import AppearanceOptions from "./appearance_options";

import '../styles/gui/gui.scss';

const settings_icon = require('../img/icons/settings_dark.svg');

function padZero(val: number) {
	return val < 10 ? '0' + val : val.toString();
}

function formatDeg(float_deg: number) {
	let deg = Math.floor(float_deg);
	let minutes = (float_deg - Math.floor(float_deg)) * 60;
	let seconds = (minutes - Math.floor(minutes)) * 60;
	return padZero(deg) + "°" +
		padZero(Math.floor(minutes)) + "'" +
		padZero(seconds).replace(/(^[0-9]*[,.][0-9]).*/i, '$1') + "''";
}

//converts latitude and longitude values given in float degrees to geographic format
function formatLatitudeLongitude(latitude: number, longitude: number) {
	return `${formatDeg(latitude)}N ${formatDeg(longitude)}E`;
}

interface GUIState {
	appearanceBubble: {x: number, y: number} | null;
}

export default class GUI extends React.Component<any, GUIState> {
	
	state: GUIState = {
		appearanceBubble: null//{x: 0, y: 0}
	};
	
	private openAppearanceOptions(mouseX: number, mouseY: number) {
		this.setState({
			appearanceBubble: {x: mouseX, y: mouseY}
		});
	}
	
	render() {
		return <MapSharedContext.Consumer>{(context) => {
			return <div className={'gui'}>
				<div className={'left-panel'}>
					<div className={'zoom-buttons'}>
						<button className={'clean hover-icon zoom-out'} onClick={
							() => context.zoom(-1, true)
						} />
						<button className={'clean hover-icon zoom-in'} onClick={
							() => context.zoom(1, true)
						} />
					</div>
					<div className={'position-info'}>{
						formatLatitudeLongitude(context.camera.latitude, context.camera.longitude)
					}</div>
					<div className={'appearance-opener shaky-icon'} onClick={e => {
						this.openAppearanceOptions(e.clientX, e.clientY);
					}}>
						<span>Appearance</span> <img src={settings_icon} alt={'settings icon'} />
					</div>
				</div>
				<div className={`appearance-container${this.state.appearanceBubble ? ' open': ''}`}>
					{<div className={'bubble'} style={
						this.state.appearanceBubble ? {
							left: `${this.state.appearanceBubble.x}px`,
							top: `${this.state.appearanceBubble.y}px`
						} : {display: 'initial'}
					}/>}
					<div className={'content'}>
						<nav><button className={'clean shaky-icon hover-icon closer'} onClick={() => {
							this.setState({appearanceBubble: null})
						}} /></nav>
						<AppearanceOptions />
					</div>
				</div>
				<aside>Sidebar GUI</aside>
			</div>}
		}</MapSharedContext.Consumer>;
	}
}