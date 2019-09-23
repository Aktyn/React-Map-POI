import * as React from 'react';
import UrlGenerator from "./url_generator";

import '../styles/tiled_map.scss';

interface MapProps {
	width: number;
	height: number;
}

export default class TiledMap extends React.Component<MapProps, any> {
	
	static defaultProps = {
	
	};
	
	private urlGenerator = new UrlGenerator('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	
	constructor(props: any) {
		super(props);
	}
	
	
	render() {
		return <div className={'map-container'} style={{
			width: `${this.props.width}px`,
			height: `${this.props.height}px`
		}}>
			<div className={'tile-layers'}>
				<div className={'layer'}>
					<img src={this.urlGenerator.generate(51.7769406,19.4279159, 18)}
					     alt={'tile'} role={'presentation'} />
					<img src={this.urlGenerator.generate(51.7769406,19.4279159, 18)}
					     alt={'tile'} role={'presentation'} />
				</div>
			</div>
			<div className={'overlays'}>{this.props.children}</div>
		</div>;
	}
}