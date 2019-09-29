import * as React from 'react';

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
export function NorthEastCoords(props: {latitude: number, longitude: number}) {
	return <>
		<span>{formatDeg(props.latitude)}N</span><br />
		<span>{formatDeg(props.longitude)}E</span>
	</>;
}