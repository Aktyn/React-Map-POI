import * as React from 'react';
import CONFIG, {ProviderDefaults, TileProviderData} from "../config";
import UrlGenerator from "../tiled_map/url_generator";
import {clamp, convertLatLongToTile} from "../common/utils";
import { MapSharedContext } from '../app';

import '../styles/gui/appearance.scss';

interface GeneratedProvider {
	raw: TileProviderData;
	generator: UrlGenerator;
}

export default class AppearanceOptions extends React.Component {
	private static providers: GeneratedProvider[] = CONFIG.tileProviders.map(provider => {
		return {
			raw: provider,
			generator: new UrlGenerator(provider.template_url)
		}
	});
	
	private renderProvider(providerData: GeneratedProvider, index: number, tileProvider: TileProviderData,
	                       changeProvider: (provider: TileProviderData) => void)
	{
		let provider = providerData.raw;
		let zoom = clamp(12, provider.minZoom||0, provider.maxZoom||19);
		
		let tile = convertLatLongToTile({
			latitude: 51.7769046,
			longitude: 19.4278944,
			zoom: zoom
		});
		
		let current = provider === tileProvider;
		
		return <div key={index} onClick={() => {
			if(current)
				return;
			changeProvider(provider);
		}} className={`${current ? 'current' : ''}${provider.name ? '' : ' no-name'}`} >
			{provider.name && <label>{provider.name}</label>}
			<div className={'preview'}>
				<img alt={'provider preview'} src={providerData.generator.generate(tile.x, tile.y, zoom)}/>
			</div>
			<div className={'details'}>
				<span>zoom: {provider.minZoom||ProviderDefaults.minZoom} -> {provider.maxZoom||ProviderDefaults.maxZoom}</span>
			</div>
		</div>;
	}
	
	render() {
		return <div className={'appearance-options'}>
			<MapSharedContext.Consumer >{(context) => {
				return <div className={'providers-list'}>{AppearanceOptions.providers.map((provider, index) => {
					return this.renderProvider(provider, index, context.tileProvider, context.changeTileProvider);
				})}</div>;
			}}</MapSharedContext.Consumer>
		</div>;
	}
}