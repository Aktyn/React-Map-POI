import * as React from 'react';
import MapObjects, {EVENT} from "../map_objects";

import '../styles/gui/right_panel.scss';

interface RightPanelState {
	loadingData: boolean;
}

export default class RightPanel extends React.Component<any, RightPanelState> {
	private readonly dataLoadListener = this.onDataLoaded.bind(this);
	
	state: RightPanelState = {
		loadingData: true
	};
	
	componentDidMount() {
		MapObjects.on(EVENT.LOAD, this.dataLoadListener);
	}
	
	componentWillUnmount() {
		MapObjects.off(EVENT.LOAD, this.dataLoadListener);
	}
	
	private onDataLoaded() {
		this.setState({loadingData: false});
	}
	
	render() {
		return <div className={'right-panel'}>
			<div>{this.state.loadingData ? 'loading' : MapObjects.getTotalCount()}</div>
		</div>;
	}
}