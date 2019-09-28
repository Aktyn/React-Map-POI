import * as React from 'react';

import '../styles/gui/gui.scss';

import LeftPanel from "./left_panel";
import RightPanel from "./right_panel";

export default class GUI extends React.Component {
	render() {
		return <div className={'gui'}>
			<LeftPanel />
			<RightPanel />
		</div>;
	}
}