import * as React from 'react';
import TiledMap from "./tiled_map";

import './styles/app.scss';

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
		return <main className={'app'}>
			<TiledMap width={this.state.screenWidth} height={this.state.screenHeight}>
				<div style={{
					display: 'inline-block',
					backgroundColor: 'blue'
				}}>Example map overlay</div>
			</TiledMap>
			<div className={'gui'}>
				<aside>Sidebar GUI</aside>
			</div>
		</main>;
	}
}