import * as React from 'react';
import {ObjectDataSchema} from "../map_objects";
import CONFIG from "../config";
import Pin from "./pin"
import {ObjectDetails} from "./details";

import '../styles/components/marker.scss';

export interface MarkerDataSchema {
	color: string;
	icon: string;
}

const unknownMarkerTypeData: MarkerDataSchema = {color: '#555', icon: 'exclamation-triangle'};

interface ElementSchema {
	type: string;
	data: ObjectDataSchema;
}

export interface MarkerData {
	id: string;
	elements: ElementSchema[],
	relativePos: {x: number, y: number}
}

const markerSize = {
	width: `${CONFIG.markerSize}px`,
	height: `${CONFIG.markerSize}px`,
};

interface MarkerProps {
	data: MarkerData;
	markerTypes: {[index: string]: MarkerDataSchema};
	requestFocus(popupBounds: ClientRect | DOMRect): void;
	requestCenter(): void;
}

interface MarkersState {
	open: boolean;
	focusedElement: number;//index of focused element's details
}

export default class Marker extends React.Component<MarkerProps, MarkersState> {
	private popupRef: HTMLDivElement | null = null;

	state: MarkersState = {
		open: false,
		focusedElement: 0
	};
	
	componentDidUpdate(prevProps: Readonly<MarkerProps>) {
		if(prevProps.data.elements.length !== this.props.data.elements.length) {
			if(this.state.open)
				this.setState({
					open: false,
					focusedElement: 0
				});
			
			if(prevProps.data.elements.length < this.props.data.elements.length) {
				//markers joined
			}
			else {
				//markers split
			}
		}
		
		if(prevProps.data.relativePos !== this.props.data.relativePos && this.state.open) {
			this.setState({
				open: false,
				focusedElement: 0
			});
		}
	}
	
	private open() {
		this.setState({open: true});
		setTimeout(() => {
			if(this.state.open && this.popupRef)
				this.props.requestFocus(this.popupRef.getBoundingClientRect());
		}, 400);
	}
	
	
	private renderGroup(elements: ElementSchema[]) {
		let markerData = this.props.markerTypes['GROUP'] || unknownMarkerTypeData;
		return <div className={'marker group'} style={markerSize} onClick={this.open.bind(this)}>
			<div className={'bg fa-stack'} key={'group'}>
				<Pin size={CONFIG.markerSize} markerData={markerData} elements={elements.length} />
			</div>
		</div>;
	}
	
	private renderSingle(element: ElementSchema) {
		let markerData = this.props.markerTypes[element.type] || unknownMarkerTypeData;
		
		return <div className={'marker single'} style={markerSize} onClick={this.open.bind(this)}>
			<div className={'bg fa-stack'} key={'single'}>
				<Pin size={CONFIG.markerSize} markerData={markerData} />
			</div>
		</div>;
	}
	
	private pageTo(index: number) {
		this.setState({focusedElement: index});
	}
	
	private renderPager() {
		let count = this.props.data.elements.length;
		let prev = Math.max(0, this.state.focusedElement-1);
		let next = Math.min(count-1, this.state.focusedElement+1);
		return <label>
			<button className={'clean hover-icon'} key={'full-left'} onClick={() => this.pageTo(0)}>
				<i key={'abc'} className="fas fa-angle-double-left"/>
			</button>
			<button className={'clean hover-icon'} key={'left'} onClick={() => this.pageTo(prev)}>
				<i className="fas fa-angle-left"/>
			</button>
			<span>{this.state.focusedElement + 1}&nbsp;/&nbsp;{this.props.data.elements.length}</span>
			<button className={'clean hover-icon'} key={'right'} onClick={() => this.pageTo(next)}>
				<i className="fas fa-angle-right"/>
			</button>
			<button className={'clean hover-icon'} key={'full-right'} onClick={() => this.pageTo(count-1)}>
				<i className="fas fa-angle-double-right"/>
			</button>
		</label>;
	}
	
	render() {
		let isGroup = this.props.data.elements.length > 1;
		return <div className={'marker-container'}>
			{
				this.props.data.elements.length > 1 ?
					this.renderGroup(this.props.data.elements) :
					this.renderSingle(this.props.data.elements[0])
			}
			<div className={`popup${this.state.open ? ' open' : ''}`} onClick={() => {
				if(this.popupRef)
					this.props.requestFocus(this.popupRef.getBoundingClientRect());
			}}
				ref={el => this.popupRef = el}
			>
				<span className={'ripple'} />
				<section className={'content'}>
					<header className={isGroup ? 'dark' : ''}>
						<button className={'clean shaky-icon hover-icon focus-btn'} onClick={() => {
							this.props.requestCenter();
						}}><i className="fas fa-compress-arrows-alt"/></button>
						{ isGroup ? this.renderPager() : <span/> }
						<button className={'clean shaky-icon hover-icon closer'} onClick={() => {
							this.setState({open: false})
						}}><i className="fas fa-times"/></button>
					</header>
					
					<div className={'details-scroller'} style={{
						transform: `translateX(${-100*this.state.focusedElement}%)`
					}} onWheel={(e) => {
						e.stopPropagation();
					}}>{
						this.props.data.elements.map(element => {
							return <div className={'details-container'} key={element.data.id}>
								<ObjectDetails {...element} />
							</div>;
						})
					}</div>
				</section>
			</div>
		</div>;
	}
}