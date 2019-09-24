export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export interface CameraState {
	latitude: number;
	longitude: number;
	zoom: number;
}

//Converts latitude, longitude, zoom to tile coordinates
export function convertLatLongToTile(camera: CameraState) {
	let lat_rad = camera.latitude / 180 * Math.PI;
	let n = 2 ** camera.zoom;
	return {
		xTile: (camera.longitude + 180.0) / 360.0 * n,
		yTile: (1.0 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2.0 * n
	};
}