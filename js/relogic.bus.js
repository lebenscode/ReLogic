
class ReLogicBus{
	
	type = "source";
	
	currentFlow = true;
	
	constructor(scene, params){
		this.scene = scene;
		this.ctx = scene.ctx;
		this.title = params.title;
		this.voltage = params.voltage || 110;
		this.coors = params.coors;
	}
	
	getVoltage(bus){
		return this.voltage - bus.voltage;
	}
	
	draw(){
		let x = this.coors[0], y = this.coors[1];
		let ctx = this.ctx;
		
		ctx.save();
		ctx.beginPath();
		ctx.fillStyle = 'black';
		ctx.fillRect(x, y, 40, 14);
		
		ctx.fillStyle = 'white';
		ctx.arc(x + 20, y + 7, 5, 0, 2 * Math.PI, false);		
		ctx.fill();
		
		ctx.lineWidth = 2;
		ctx.moveTo(x + 20, y + 14);
		ctx.lineTo(x + 20, y + 14 + CONTACT_W);
		ctx.stroke();
		
		ctx.restore();
		
		this.drawData = {
						title: this.title, 
						border: [x, y - 24, x + 40, y + 14 + CONTACT_W], 
						end: [x + 20, y + 14 + CONTACT_W],
						start: [x + 20, y + 14 + CONTACT_W]
						};
						
		this.scene.drawTitle(this.id, this.title);
	}
}