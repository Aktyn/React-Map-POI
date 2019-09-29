import * as React from 'react';

import '../styles/gui/gui.scss';

import LeftPanel from "./left_panel";
import RightPanel from "./right_panel";

interface GUIState {
	leftPanelOpen: boolean;
	rightPanelOpen: boolean;
}

export default class GUI extends React.Component<any, GUIState> {
	
	state: GUIState = {
		leftPanelOpen: false,
		rightPanelOpen: false
	};
	
	render() {
		return <div className={`gui${this.state.leftPanelOpen ? ' open-left': ''}${
			this.state.rightPanelOpen ? ' open-right': ''}`}>
			<LeftPanel />
			<RightPanel />
			<button className={'left-panel-opener clean hover-icon'} style={{
				fontSize: '20px'
			}} onClick={() => this.setState({leftPanelOpen: !this.state.leftPanelOpen})}>
				<i className="fas fa-angle-right"/>
			</button>
			<button className={'right-panel-opener clean hover-icon'} style={{
				fontSize: '20px'
			}} onClick={() => this.setState({rightPanelOpen: !this.state.rightPanelOpen})}>
				<i className="fas fa-angle-left"/>
			</button>
		</div>;
	}
}