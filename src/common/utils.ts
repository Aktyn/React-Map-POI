export function noop() {}

export function clamp(value: number, min: number, max: number) {
	return Math.max(min, Math.min(max, value));
}

export interface CameraState {
	latitude: number;
	longitude: number;
	zoom: number;
}

export interface TilePos {
	x: number;
	y: number;
}

//Converts latitude, longitude, zoom to tile coordinates
export function convertLatLongToTile(camera: CameraState): TilePos {
	let lat_rad = camera.latitude / 180 * Math.PI;
	let n = 2 ** camera.zoom;
	return {
		x: (camera.longitude + 180.0) / 360.0 * n,
		y: (1.0 - Math.asinh(Math.tan(lat_rad)) / Math.PI) / 2.0 * n
	};
}

//Converts
export function convertXYZToCamera(tile: TilePos, zoom: number): CameraState {
	let n = 2 ** zoom;
	let lon_deg = tile.x / n * 360.0 - 180.0;
	let lat_rad = Math.atan(Math.sinh(Math.PI * (1 - 2 * tile.y / n)));
	let lat_deg = lat_rad / Math.PI * 180;
	return {
		latitude: lat_deg,
		longitude: lon_deg,
		zoom
	};
}