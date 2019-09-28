import * as React from 'react';
import TiledMap, {defaultSharedState, MapSharedState} from "./tiled_map";
import Grid from "./grid";
import GUI from "./gui";
import {noop} from "./utils";
import CONFIG, {TileProviderData} from "./config";

import './styles/app.scss';

interface MapSharedContextInterface extends MapSharedState {
	zoom(factor: number, force?: boolean): void;
	tileProvider: TileProviderData;
	changeTileProvider(provider: TileProviderData): void;
}
export const MapSharedContext = React.createContext<MapSharedContextInterface>({
	...defaultSharedState,
	zoom: noop,
	changeTileProvider: noop,
	tileProvider: CONFIG.tileProviders[0]
});

interface ScreenResolution {
	screenWidth: number;
	screenHeight: number;
}

interface AppState extends ScreenResolution{
	mapState: MapSharedState;
	tileProvider: TileProviderData;
}

function screenResolution(): ScreenResolution {
	return {
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
	};
}

export default class App extends React.Component<any, AppState> {
	private readonly resizeListener: () => void;
	private mapReference: TiledMap | null = null;
	
	state: AppState = {
		...screenResolution(),
		mapState: defaultSharedState,
		tileProvider: CONFIG.tileProviders[0]
	};
	
	constructor(props: any) {
		super(props);
		
		this.resizeListener = () => this.setState({...screenResolution()});//update resolution
	}
	
	componentDidMount() {
		window.addEventListener('resize', this.resizeListener);
	}
	
	componentWillUnmount() {
		window.removeEventListener('resize', this.resizeListener);
	}
	
	render() {
		return <main className={'app'}>
			<MapSharedContext.Provider value={{
				...this.state.mapState,
				zoom: (factor, force) => {
					if(this.mapReference)
						this.mapReference.zoom(factor, !!force);
				},
				tileProvider: this.state.tileProvider,
				changeTileProvider: (provider) => {
					this.setState({tileProvider: provider});
				}
			}}>
				<TiledMap width={this.state.screenWidth} height={this.state.screenHeight} onUpdate={mapState => {
					this.setState({mapState})
				}} ref={el => this.mapReference = el}>
					<Grid width={this.state.screenWidth} height={this.state.screenHeight} />
				</TiledMap>
				<GUI />
			</MapSharedContext.Provider>
		</main>;
	}
}