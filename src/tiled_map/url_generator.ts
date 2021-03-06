import {ProviderDefaults} from "../config";

//export const subdomains = ['a', 'b', 'c'];

/*function strEnum<T extends string>(o: Array<T>): { [K in T]: string } {
	return o.reduce((res, key) => {
		res[key] = key;
		return res;
	}, Object.create(null));
}

const domainKeys = strEnum(subdomains);*/

const enum URL_ARGS {
	SUBDOMAIN = '{s}',
	Z = '{z}',
	X = '{x}',
	Y = '{y}'
}

interface TemplateArguments {
	subdomain: string;//keyof typeof domainKeys;
	x: number;
	y: number;
	z: number;
}

type TemplateFunc = (args: TemplateArguments) => string;

export default class UrlGenerator {
	private subdomain_index = 0;//0 -> 3
	
	private readonly concatenateUrl: TemplateFunc;
	public readonly template: string;
	public readonly subdomains: string[];
	
	//eg template: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
	constructor(template: string, subdomains: string | string[] = ProviderDefaults.subdomains) {
		if( Array.isArray(subdomains) )
			this.subdomains = subdomains;
		else
			this.subdomains = [...subdomains];
		
		this.template = template;
		let url_args = template.match(/{[a-z]+}/gi) || [];
		let url_parts = template.split(/{[a-z]+}/);
		
		if(url_args.length !== url_parts.length-1)
			throw new Error('Incorrect template format');
		
		let getArg: TemplateFunc[] = [];
		for(let i=0; i<url_args.length; i++) {
			let arg_getter: TemplateFunc;
			
			switch (url_args[i]) {
				default:
					throw new Error('Unknown template argument: ' + url_args[i]);
				case URL_ARGS.SUBDOMAIN:
					arg_getter = args => args.subdomain;
					break;
				case URL_ARGS.X:    arg_getter = args => args.x.toString();    break;
				case URL_ARGS.Y:    arg_getter = args => args.y.toString();    break;
				case URL_ARGS.Z:    arg_getter = args => args.z.toString();    break;
			}
			
			getArg.push(
				function (args) {
					return arg_getter(args);
				}
			);
		}
		
		this.concatenateUrl = function(args) {
			let url = '';
			let i=0;
			for(; i<getArg.length; i++)
				url += url_parts[i] + getArg[i](args);
			return url + url_parts[i];
		};
	}
	
	private nextSubdomain() {
		if( this.subdomains.length === ++this.subdomain_index )
			this.subdomain_index = 0;
		return this.subdomains[this.subdomain_index];
	}
	
	public generate(tile_x: number, tile_y: number, zoom = 13, subdomain = this.nextSubdomain()) {
		const maxI = 2 ** zoom;
		
		return this.concatenateUrl({
			subdomain: subdomain,
			x: (((tile_x|0)%maxI)+maxI)%maxI,
			y: (((tile_y|0)%maxI)+maxI)%maxI,
			z: zoom
		});
	}
}