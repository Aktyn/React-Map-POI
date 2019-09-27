import * as React from 'react';
import LeftPanel from "./left_panel";
import RightPanel from "./right_panel";

import '../styles/gui/gui.scss';

export default class GUI extends React.Component {
	render() {
		return <div className={'gui'}>
			<LeftPanel />
			<RightPanel />
		</div>;
	}
}