import * as React from 'react';
import {Address, CommonSchema, ObjectDataSchema, ParkingSchema, PoiSchema, VehicleSchema} from "../map_objects";
import {NorthEastCoords} from "../common/coord_converter";

import '../styles/components/details.scss';

function AddressFormat({address}: {address: string | Address}) {
	if(typeof address === 'string')
		return <span>{address}</span>;
	return <span>{/* street house city */}
		{address.street && (address.street + ' ' + (address.house||''))} {address.city}
	</span>;
}

function HeaderDetails({data}: {data: CommonSchema}) {
	return <div className={'header-details'}>
		<strong>{data.name}</strong>
		<span><NorthEastCoords {...data.location} /></span>
	</div>;
}

const DetailsBase: React.FunctionComponent<{data: ObjectDataSchema}> = (props) => {
	return <div className={'details'}>
		<HeaderDetails data={props.data}/>
		<div className={'props-list'}>
			{props.data.address && <><label>Address:</label><AddressFormat address={props.data.address} /></>}
			{props.children}
			{props.data.description && <><label>Description:</label><span>{props.data.description}</span></>}
		</div>
	</div>;
};

function VehicleDetails({data}: {data: VehicleSchema}) {
	return <DetailsBase data={data}>
		<p>dummy</p>
		<p>dummy</p>
		<p>dummy</p>
		<p>dummy</p>
		<p>dummy</p>
		<p>dummy</p>
		<p>dummy</p>
		<p>dummy</p>
	</DetailsBase>;
}

function ParkingDetails({data}: {data: ParkingSchema}) {
	return <DetailsBase data={data}>
	
	</DetailsBase>;
}

function POIDetails({data}: {data: PoiSchema}) {
	return <DetailsBase data={data}>
	
	</DetailsBase>;
}

export function ObjectDetails(props: { type: string, data: ObjectDataSchema }) {
	switch(props.type) {
		case 'VEHICLE':
			return <VehicleDetails data={props.data as VehicleSchema}/>;
		case 'PARKING':
			return <ParkingDetails data={props.data as ParkingSchema}/>;
		case 'POI':
			return <POIDetails data={props.data as PoiSchema}/>;
	}
	return <span>ERROR: Unknown element type</span>;
}