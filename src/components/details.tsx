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

function HeaderDetails({data, status}: {data: CommonSchema, status?: string}) {
	return <div className={'header-details'}>
		<div>
			<strong>{data.name}</strong>
			{status && <><br/><span className={'status'}>{status}</span></>}
		</div>
		<span className={'coords'}><NorthEastCoords {...data.location} /></span>
	</div>;
}

const DetailsBase: React.FunctionComponent<{data: ObjectDataSchema, status?: string}> = (props) => {
	return <div className={'details'}>
		<HeaderDetails data={props.data} status={props.status}/>
		<div className={'props-list'}>
			{props.data.address && <><label>Address:</label><AddressFormat address={props.data.address} /></>}
			{props.data.description && <><label>Description:</label><span>{props.data.description}</span></>}
			{props.children}
		</div>
	</div>;
};

function VehicleDetails({data}: {data: VehicleSchema}) {
	return <DetailsBase data={data} status={data.status}>
		<label>Plate:</label><span>{data.platesNumber}</span>
		<label>Sides number:</label><span>{data.sideNumber}</span>
		<label>Type:</label><span>{data.type}</span>
		<label>Range:</label><span>{data.rangeKm}km</span>
		<label>Battery:</label><span>{data.batteryLevelPct}%</span>
		{data.locationDescription && <><label>Location desc:</label><span>{data.locationDescription}</span></>}
	</DetailsBase>;
}

function ParkingDetails({data}: {data: ParkingSchema}) {
	return <DetailsBase data={data}>
		<label>Taken spaces:</label><span>{data.spacesCount - data.availableSpacesCount}/{data.spacesCount}</span>
		{(data.chargers && data.chargers.length > 0) && <><label>Chargers:</label><span>{data.chargers}</span></>}
	</DetailsBase>;
}

function POIDetails({data}: {data: PoiSchema}) {
	return <DetailsBase data={data}>
		<label>Category:</label><span>{data.category}</span>
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