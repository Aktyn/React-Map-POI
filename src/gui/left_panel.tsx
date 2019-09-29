import * as React from 'react';
import { MapSharedContext } from '../app';
import AppearanceOptions from "./appearance_options";
import {NorthEastCoords} from "../common/coord_converter";

import '../styles/gui/left_panel.scss';

interface LeftPanelState {
	appearanceBubble: {x: number, y: number} | null;
}

export default class LeftPanel extends React.Component<any, LeftPanelState> {
	
	state: LeftPanelState = {
		appearanceBubble: null,//{x: 0, y: 0}
	};
	
	private openAppearanceOptions(mouseX: number, mouseY: number) {
		this.setState({
			appearanceBubble: {x: mouseX, y: mouseY}
		});
	}
	
	render() {
		return <MapSharedContext.Consumer>{(context) => <>
			<div className={'left-panel'}>
				<div className={'zoom-buttons'}>
					<button className={'clean hover-icon'} onClick={() => context.zoom(-1, true)}>
						<i className="fas fa-minus"/>
					</button>
					<button className={'clean hover-icon zoom-in'} onClick={() => context.zoom(1, true)}>
						<i className="fas fa-plus"/>
					</button>
				</div>
				<div className={'zoom-info'}>{context.camera.zoom}</div>
				<div className={'position-info'}>
					<NorthEastCoords {...context.camera} />
				</div>
				<div className={'appearance-opener shaky-icon'} onClick={e => {
					this.openAppearanceOptions(e.clientX, e.clientY);
				}}>
					<span>Appearance</span><i className="fas fa-cog"/>
				</div>
			</div>
			<div className={`appearance-container${this.state.appearanceBubble ? ' open' : ''}`}>
				{<div className={'bubble'} style={
					this.state.appearanceBubble ? {
						left: `${this.state.appearanceBubble.x}px`,
						top: `${this.state.appearanceBubble.y}px`
					} : {display: 'initial'}
				}/>}
				<div className={'content'}>
					<nav>
						<button className={'clean shaky-icon hover-icon'} onClick={() => {
							this.setState({appearanceBubble: null})
						}}><i className="fas fa-times"/></button>
					</nav>
					<AppearanceOptions/>
				</div>
			</div>
		</>}</MapSharedContext.Consumer>;
	}
}