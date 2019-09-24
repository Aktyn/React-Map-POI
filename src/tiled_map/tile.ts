
export default class Tile {
	private static id_counter = 0;
	
	public readonly x: number;
	public readonly y: number;
	public readonly id: number;
	
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
		this.id = Tile.id_counter++;
	}
}