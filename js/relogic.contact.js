/**
 * This class is part of ReLogic bundle.
 * Depends on relogic.core
 */

class ReLogicContact extends ReLogicElement{
	/**
	 *
	 * @type {boolean}
	 * false - parent relay winding without voltage
	 * true - parent relay winding has voltage on pins
	 *
	 */
	state = false;
	
	type = "contact";

	/**
	 *
	 * @type Object timer
	 * Timer for relay delay before action/reverse.
	 *
	 */
	timer = null;

	/**
	 *
	 * @type {{action: boolean, reverse: boolean}}
	 * Shows when contact action should be with delay.
	 *
	 */
	delayCond = {action: false, reverse: false};

	/**
	 *
	 * @type {boolean}
	 * Shows that contact works and can change state. Need to correct work with delays.
	 *
	 */
	work = false;

	/**
	 *
	 * @param ctx - {Canvas Context 2d}
	 * @param params {
	 *     @string title - contact title.
	 *     @hex    type  - contact type (normal closed, normal opened and so on).
	 *     @array [x, y] coors - start coordinates.
	 *     @array[pin1, pin2] contacts - title of contact pins.
	 *     @integer delay - delay on contact action in seconds.
	 *     @function hook - callback for setter property currentFlow.
	 * }
	 *
	 */
	constructor(ctx, params){
		super();

		this.ctx = ctx;
		this.title = params.title;
		this.type = params.type;
		this.coors = params.coors;
		this.contacts = params.contacts;
		
		switch(this.type){
			case CONTACT_NC:
			case CONTACT_NCA:
			case CONTACT_NCR:
			case CONTACT_NCB:
			  this._currentFlow = true;
			break;
			
			case CONTACT_NO:
			case CONTACT_NOA:
			case CONTACT_NOR:
			case CONTACT_NOB:
			  this._currentFlow = false;
			break;
			
			default:
			  console.log("[ReLogic] Unknown type is given to create contact: %s", this.type);
			break;
		}
		
		if(params.delay){
			this.delay = params.delay * 500;
			
			switch(this.type){
				case CONTACT_NCA:
				case CONTACT_NOA:
				case CONTACT_NCB:
				case CONTACT_NOB:
				  this.delayCond.action = true;
				break;
				case CONTACT_NCR:
				case CONTACT_NOR:
				case CONTACT_NCB:
				case CONTACT_NOB:
				  this.delayCond.reverse = true;
			}
		}
		
		if(isFunction(params.hook)){
			Reactor.hook(this, "_currentFlow", "currentFlow", params.hook)
		}
	}

	/**
	 *
	 * @param relayState - state of relay : false - relay without voltage, and true - vice versa.
	 * @param delayOver - indicates the delay is over and allow redraw the contact.
	 * @returns {{border: (*|number)[], title: *}}
	 */
	draw(relayState = false, delayOver = false){
		this.state = relayState;
		let x = this.coors[0], y = this.coors[1];
		let drawData = {title: this.title, border: [x, y - 50, x + 80, y + 10]};
		
	    if(this.delay > 0){
			if(this.delayCond.action && this.state && !delayOver){
				this.timer = setTimeout(() => this.draw(true, true), this.delay);
				return drawData;
			}
			else if(this.delayCond.reverse && !this.state && !delayOver && this.work){
				this.timer = setTimeout(() => this.draw(false, true), this.delay);
				return drawData;
			}
			else{
				clearTimeout(this.timer);
			}
		}	
		
		let ctx = this.ctx;
		this.work = this.state;
        
		//redraw
		if(this.drawData){
			this.currentFlow = !this.currentFlow;
			this.clear();
		}
		
		ctx.save();
		ctx.lineWidth = 2;
		ctx.beginPath();				
		
		ctx.moveTo(x, y);
		ctx.lineTo(x + CONTACT_W, y);
		
		ctx.moveTo(x + CONTACT_W + 30, y);
		ctx.lineTo(x + CONTACT_W * 2 + 30, y);
		
		switch(this.type){
			case CONTACT_NO: 
			    this.drawBase(this.coors, "NO", relayState);
				drawData.border = [x, y - 46, x + CONTACT_W * 2 + 30, y + 20];
			break;
			case CONTACT_NC:			
				this.drawBase(this.coors, "NC", relayState);
				drawData.border = [x, y - 30, x + CONTACT_W * 2 + 30, y + 22];
			break;
			case CONTACT_NCA:
				this.drawBase([x, y], "NC", relayState);				
				this.drawTimeDelayPart(this.coors, "action");
				drawData.border = [x, y - 50, x + CONTACT_W * 2 + 30, y + 22];
			break;
			case CONTACT_NCR:
				this.drawBase([x, y], "NC", relayState);				
				this.drawTimeDelayPart(this.coors, "reverse");
				drawData.border = [x, y - 50, x + CONTACT_W * 2 + 30, y + 22];			
			break;
			case CONTACT_NCB:
				this.drawBase([x, y], "NC", relayState);				
				this.drawTimeDelayPart(this.coors, "both");
				drawData.border = [x, y - 50, x + CONTACT_W * 2 + 30, y + 22];				
			break;
			case CONTACT_NOA:
				this.drawBase([x, y], "NO", relayState);				
				this.drawTimeDelayPart(this.coors, "action", "NO");	
                drawData.border = [x, y - 60, x + CONTACT_W * 2 + 30, y + 20];				
			break;
			case CONTACT_NOR:
				this.drawBase([x, y], "NO", relayState);				
				this.drawTimeDelayPart(this.coors, "reverse", "NO");	
                drawData.border = [x, y - 60, x + CONTACT_W * 2 + 30, y + 20];				
			break;
			case CONTACT_NOB:
				this.drawBase([x, y], "NO", relayState);				
				this.drawTimeDelayPart(this.coors, "both", "NO");	
                drawData.border = [x, y - 65, x + CONTACT_W * 2 + 30, y + 20];				
			break;
			default: 
			  console.error("[ReLogic] Wrong contact type code '%s' - %s", this.type, this.title);
			break;
		}
		
		if(this.hasCurrent){
			ctx.strokeStyle = ReLogicConfig.currentColor;
		}
		else{
			ctx.strokeStyle = ReLogicConfig.wireColor;
		}
		
		ctx.stroke();
		ctx.restore();
		
		drawData.start = [x, y];
		drawData.end = [x + CONTACT_W * 2 + 30, y];
		
		this.drawData = drawData;
		this.drawContactNums();
		
		return drawData;
	}

	/**
	 *
	 * @param coors
	 * @param type - NC or NO
	 * Draw simple contact picture.
	 */
	drawBase(coors, type = "NC"){
		let ctx = this.ctx;
		let x = coors[0], y = coors[1];
		
		if(type == "NC"){
			ctx.moveTo(x + CONTACT_W, y);
			if(this.state == false){
				ctx.lineTo(x + CONTACT_W + 30, y + 10);
				ctx.moveTo(x + CONTACT_W + 30, y - 1);
				ctx.lineTo(x + CONTACT_W + 30, y + 15);
			}
			else{
				ctx.lineTo(x + CONTACT_W + 30, y + 15);				
			}
		}
		else{
			ctx.moveTo(x + CONTACT_W, y);
			if(this.state == false){
				ctx.lineTo(x + CONTACT_W + 30, y - 15);
			}
			else{
				ctx.lineTo(x + CONTACT_W + 30, y - 10);
				ctx.moveTo(x + CONTACT_W + 30, y - 15);
				ctx.lineTo(x + CONTACT_W + 30, y + 1);
			}
		}
	}

	/**
	 *
	 * @param coors
	 * @param type - delay type: action or reverse.
	 * @param baseType - NC or NO.
	 * Draw delay badge on the contact base.
	 */
	drawTimeDelayPart(coors, type, baseType = "NC"){
		let yShift = (this.state) ? 3 : 0;
		let x = coors[0], y = coors[1];
		let ctx  = this.ctx;
		
		if(baseType == "NO"){
			yShift = (this.state) ? -11 : -14;
		}
		
		let x1 = x + CONTACT_W + 14,
		    x2 = x + CONTACT_W + 20;
			
		let leftX = (baseType == "NC") ? x1 : x2;
		let rightX = (baseType == "NC") ? x2 : x1;
		let h = (type == "action" || "both") ? 16 : 10;
				
		ctx.moveTo(leftX, y + 5 + yShift);
		ctx.lineTo(leftX, y - h + yShift);
		ctx.moveTo(rightX, y + 6 + yShift);
		ctx.lineTo(rightX, y - h + yShift);
		
        if(type == "action"){		
			ctx.moveTo(x + CONTACT_W + 26, y - 8 + yShift);
			ctx.arc(x + CONTACT_W + 17, y - 8 + yShift, 10, 0, Math.PI, true);
		}
		else if(type == "reverse"){
			ctx.moveTo(x + CONTACT_W + 26, y - 20 + yShift);
			ctx.arc(x + CONTACT_W + 17, y - 20 + yShift, 10, 0, Math.PI, false);
		}
		else{
			ctx.moveTo(x + CONTACT_W + 26, y - 27 + yShift);
			ctx.arc(x + CONTACT_W + 17, y - 27 + yShift, 10, 0, Math.PI, false);
			
			ctx.moveTo(x + CONTACT_W + 26, y - 6 + yShift);
			ctx.arc(x + CONTACT_W + 17, y - 6 + yShift, 10, 0, Math.PI, true);
		}
	}
	
	drawContactNums(){
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
}