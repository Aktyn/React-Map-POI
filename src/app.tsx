import * as React from 'react';
import TiledMap from "./tiled_map";
import Overlay from "./components/overlay";

import './styles/app.scss';
import './styles/gui.scss';

interface ScreenResolution {
	screenWidth: number;
	screenHeight: number;
}

interface AppState extends ScreenResolution{

}

function screenResolution(): ScreenResolution {
	return {
		screenWidth: window.innerWidth,
		screenHeight: window.innerHeight,
	};
}

export default class App extends React.Component<any, AppState> {
	
	private readonly resizeListener: () => void;
	
	state: AppState = {
		...screenResolution()
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
		//TODO: zoom buttons
		return <main className={'app'}>
			<TiledMap width={this.state.screenWidth} height={this.state.screenHeight}>
				<Overlay latitude={51.4764211} longitude={21.3709875}>Village & Pillage</Overlay>
				<Overlay latitude={51.7769046} longitude={19.4278944}>City of students</Overlay>
			</TiledMap>
			<div className={'gui'}>
				<aside>Sidebar GUI</aside>
			</div>
		</main>;
	}
}