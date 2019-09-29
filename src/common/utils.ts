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

export function getContrastColor(hexColor: string) {//true - use dark, false - use light
	// Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
	let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
	let hex = hexColor.replace(shorthandRegex, function (xd, r, g, b) {
		return r + r + g + g + b + b;
	});
	
	let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
	if (!result)
		return true;
	
	let r = parseInt(result[1], 16);
	let g = parseInt(result[2], 16);
	let b = parseInt(result[3], 16);
	let yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
	return yiq >= 128;
}