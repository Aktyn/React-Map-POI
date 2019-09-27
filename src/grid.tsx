import * as React from 'react';
import Overlay from "./components/overlay";
import MapObjects, {EVENT, ObjectSchema} from './map_objects';

export default class Grid extends React.Component<any, any> {
	
	private readonly dataLoadListener = this.onDataLoaded.bind(this);
	
	constructor(props: any) {
		super(props);
	}
	
	componentDidMount() {
		MapObjects.on(EVENT.LOAD, this.dataLoadListener);
	}
	
	componentWillUnmount() {
		MapObjects.off(EVENT.LOAD, this.dataLoadListener);
	}
	
	// noinspection JSMethodCanBeStatic
	private onDataLoaded(data: ObjectSchema) {
		console.log( 'data loaded:', data );
	}
	
	render() {
		return <>
			<Overlay latitude={51.4764211} longitude={21.3709875}>Village & Pillage</Overlay>
			<Overlay latitude={51.7769046} longitude={19.4278944}>City of students</Overlay>
		</>;
	}
}