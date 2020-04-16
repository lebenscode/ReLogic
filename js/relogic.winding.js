
class ReLogicWinding{
	drawData = null;
	
	type = "winding";
	
	currentFlow = true;
	
	constructor(ctx, params, cb = function(){}){
		this.ctx = ctx;
		
		if(params.type != WIND_VOLTAGE && params.type != WIND_CURRENT){
			return;
		}
		
		this.type = params.type;
		this.title = params.title;
		this.current = params.current;
		this.coors = params.coors;
		this.contacts = params.contacts || null;
		
		this.callback = cb;
	}
	
	draw(){
		let result;
		if(this.current == 'AC'){
			result = this.drawAC();
		}
		else{
			result = this.drawDC();
		}
		
		return result;
	}
	
	drawAC(){
		
	}
	
	drawDC(){
		let x = this.coors[0], y = this.coors[1];
		
		let ctx = this.ctx;
		let w = 30,
		    h = 60,
			contact = CONTACT_W;
			
		let result;
        if(!this.drawData){
			result = {
				start:  [x, y],
				end: [x + 2 * contact + w, y]
			};
			
			result.border = [x, y - h/2 - 26, result.end[0], y + h/2 + 1];
			result.title = this.title;
		}
		else{
			result = this.drawData;
		}
			
		ctx.save();
		ctx.beginPath();
		ctx.lineWidth = 2;
		ctx.moveTo(x, y);
		ctx.lineTo(x + contact, y);
		ctx.strokeRect(x + contact, y - h /2, w, h);
		
		//draw lines
		if(this.type == WIND_VOLTAGE){
			let shift = 14;
			ctx.moveTo(x + contact, y);
			ctx.lineTo(x + contact + w, y - shift);
            ctx.moveTo(x + contact + w, y);
			ctx.lineTo(x + contact, y + shift);
		}
		else{
			
		}

		ctx.moveTo(x + contact + w, y);
		ctx.lineTo(result.end[0], result.end[1]);
		ctx.stroke();
		ctx.restore();
		
		this.drawData = result;
		this.drawContactNums();
		
		return result;
	}
	
	drawContactNums(){
		if(!this.contacts){
			return;
		}
		
		let ctx = this.ctx;
		let left = this.contacts[0], right = this.contacts[1];
		let data = this.drawData, x1 = data.start[0], x2 = data.end[0], y = data.end[1];
		
		ctx.save();
		ctx.font = "bold 14px sans-serif";
		ctx.fillStyle = "#444";
		
		ctx.fillText(left, x1 + 5, y + 12);
		ctx.fillText(right, x2 - 14, y + 12);
		
		ctx.restore();
	}
	
	onClick(){
		this.callback.call(this);
	}
}