export interface TileProviderData {
	//visible name in GUI
	name?: string;
	
	template_url: string;
	
	//available subdomains for given provider (default: 'abc')
	subdomains?: string | string[];
	
	//default: 0
	minZoom?: number;
	
	//default: 19
	maxZoom?: number;
}

export const ProviderDefaults = {
	subdomains: 'abc',
	minZoom: 0,
	maxZoom: 19
};

// noinspection SpellCheckingInspection
const CONFIG = {
	tileProviders: <TileProviderData[]>[
		{
			name: 'OpenStreetMap',
			template_url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
		}, {
			name: 'OpenTopoMap',
			template_url: 'https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png',
			maxZoom: 17,
			subdomains: ['a', 'b', 'c']
		}, {
			name: 'OpenMapsSurfer.Roads',
			template_url: 'https://maps.heigit.org/openmapsurfer/tiles/roads/webmercator/{z}/{x}/{y}.png',
			maxZoom: 19
		}, {
			name: 'World Imagery',
			template_url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}'
		}
	]
};

export default CONFIG;