import * as React from 'react';
import { MapSharedContext } from './app';

import './styles/gui.scss';

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

export default class GUI extends React.Component {
	
	render() {
		return <MapSharedContext.Consumer>{(context) => {
			return <div className={'gui'}>
				<div className={'left-panel'}>
					<div className={'zoom-buttons'}>
						<button className={'clean zoom-out'} onClick={() => context.zoom(-1, true)} />
						<button className={'clean zoom-in'} onClick={() => context.zoom(1, true)} />
					</div>
					<div className={'position-info'}>{
						formatLatitudeLongitude(context.camera.latitude, context.camera.longitude)
					}</div>
				</div>
				<aside>Sidebar GUI</aside>
			</div>}
		}</MapSharedContext.Consumer>;
	}
}