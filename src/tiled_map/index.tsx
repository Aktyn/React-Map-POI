import * as React from 'react';
import UrlGenerator from "./url_generator";

export default class MapTiles extends React.Component<any, any> {
	
	private urlGenerator = new UrlGenerator('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png');
	
	constructor(props: any) {
		super(props);
		
		console.log( this.urlGenerator.generate(51.7769406,19.4279159) );
	}
	
	
	render() {
		return <img src={this.urlGenerator.generate(51.7769406,19.4279159, 18)} alt={'tile'} />;
	}
}