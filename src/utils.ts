export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

//Converts latitude, longitude, zoom to tile coordinates
export function convertLatLongToTile(latitude: number, longitude: number, zoom: number) {
	let lat_rad = latitude / 180 * Math.PI;
	let n = 2 ** zoom;
	return {
		xTile: (longitude + 180.0) / 360.0 * n,
		yTile: (1.0 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2.0 * n
	};
}