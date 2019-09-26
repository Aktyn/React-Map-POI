import * as React from 'react';
import { MapContext } from './tiled_map';

import './styles/gui.scss';

export default class GUI extends React.Component {
	
	render() {
		return <MapContext.Consumer>{(context) => {
			console.log(context);
			return <div className={'gui'}>
				<div className={'left-panel'}>
					<div className={'zoom-buttons'}>
						<button className={'clean zoom-out'} />
						<button className={'clean zoom-in'} />
					</div>
					<div className={'position-info'}>{context.camera.latitude}</div>
				</div>
				<aside>Sidebar GUI</aside>
			</div>}
		}</MapContext.Consumer>;
	}
}