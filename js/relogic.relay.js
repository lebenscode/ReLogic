/**
  * This class is part of ReLogic bundle.
  * Depends on relogic.core, relogic.winding, relogic.contact
  */

function relayDefName(type, num = ''){
	let names = [
	  "KL",
	  "KH",
	  "KT",
	  "KQC",
	  "KQT",
	  "KA",
	  "KV",
	  "KQ"
	];
	
	return names[type - 1] + num;
}

function extend(target) {
  if(!arguments[1]){
	  return;
  }
  
  let source;
  for(let i = 1, len = arguments.length;i < len;i++){
	  source = arguments[i];
	  
	  for(let prop in source){
		  if(source.hasOwnProperty(prop)){
			  target[prop] = source[prop];
		  }
	  }
  }
  
  return target;
}

class ReLogicRelay{
	
	contactsCounter = 1;
	type = "relay";

	/**
	 *
	 * @type {boolean}
	 * @private
	 * Indicates existence of voltage on relay winding pins.
	 */
	_hasCurrent = false;
	
	/**
	 * Relay pins data objects.
	 * {
	 *	 pinNum: {
	 *	 	type: 'winding' or 'contact';
	 *		dataType: CONTACT_NC - WIND code or CONTACT code;
	 *		contact: ReLogicContact - if is contact;
	 *		winding: ReLogicWinding - if is winding;
	 *		ctx: 'logic', 'AC' or 'signal' - context type where is drawing;
	 *		coors: [x, y] - start coors to draw it
	 *		pair: second pin num - just for information
	 *   }
	 * }
	 */
	pinout = {};
	
	/**
	 * Use only for check if pin is already saved
	 * {
	 * 	 pinNum: true
	 * }
	 */
	pinoutCheck = {};

	/**
	 *
	 * @type {boolean}
	 * Indicates relay is tightened or not.
	 */
	state = false;
	
	/**
	 * Create relay object
	 * int type - relay type according to relay constants.
	 * object scene - scene classes for each scheme part: logic, AC or signal.
	 * object params - relay pinout and title.
	 *   
	 */
	constructor(type, scene, params){
		if(!type || type > 0x1F){
			return console.error("[ReLogic] Wrong relay type %s.", type);
		}
		
		this.scene = scene;
		this.title = params.title || relayDefName(type);
		this.drawData = {};

		Reactor.hook(this, "_hasCurrent", "hasCurrent", (obj) => {
			if(this._hasCurrent && !this.state){
				this.toggle();
			}
		});
		
		this.setPins(params.pinout);
	}

	/**
	 *
	 * @param pinoutData
	 * Creates relay pinout object.
	 */
	setPins(pinoutData){
		let pinBase = {
			type: 'contact',
			dataType: 0x00,
			scene: 'logic',
			coors: [0, 0],
			pair: 0
		};
		
		let nums, data, label, pin;
		for(label in pinoutData){
			nums = label.replace(/\s*/g, '').split(",");
			
			if(nums[0] in this.pinout || nums[1] in this.pinout){
				continue;
			}
			
			data = pinoutData[label];			
			pin = pinBase;
			
			pin.type = this.isWinding(data.type) ? 'winding' : 'contact';
			pin.dataType = data.type;
			pin.coors = data.coors;
			pin.scene = data.scene || 'logic';
			pin.pair = nums[1];
			pin.label = nums;
			
			if(pin.type == 'contact'){
				pin.delay = data.delay;
			}
			
			if(!(pin.scene in this.scene)){
				console.log("[ReLogic] Can't create pin № %s without scene '%s' in relay %s.", label, pin.scene, this.title);		
				continue;
			}
				
			pin.contactTitle = nums;
			
			pin[pin.type] = this.createPinEL(pin);
			this.pinout[nums[0]] = extend({}, pin);
			this.pinout[nums[1]] = nums[0];
		}
		
		if(DEBUG){
			console.log("[ReLogic] Relay %s pinout finished. Waiting for render...", this.title);
		}
	}
	
	isWinding(type){
		return type >= WIND_VOLTAGE;
	}
	
	createPinEL(pin){	
		if(pin.type == 'winding'){
			return new ReLogicWinding(this.scene[pin.scene].ctx, {
							title: this.title, 
							current: pin.scene == 'AC' ? 'AC' : 'DC',
							type: pin.dataType,
							coors: pin.coors,
							contacts: pin.contactTitle
						});
		}
		else{
			return new ReLogicContact(this.scene[pin.scene].ctx, {
							title: this.title + "." + this.contactsCounter++,
							coors: pin.coors,
							type: pin.dataType,
							contacts: pin.contactTitle,
							delay: pin.delay || 0,
							hook: this.scene[pin.scene].currentHook.bind(this.scene[pin.scene])
						});
		}
	}
	
	draw(contactsOnly = false){
		let ex = [], pin, drawData;
		for(let num in this.pinout){
			pin = this.pinout[num];	

			if(pin.type == 'winding' && contactsOnly){
				continue;
			}
			
			if(typeof pin == "string"){
				continue;
			}
			
			drawData = pin[pin.type].draw(this.state);
			this.drawData[num] = drawData;
			this.scene[pin.scene].drawTitle(this.id, drawData.title, num);
		}
		
		if(!contactsOnly && DEBUG){
			console.log("[ReLogic] Relay %s render finished. Use method 'getDrawData' to connect relay with other elements.", this.title);
		}	
	}
	
	onClick(tile){
		let id = tile.id;
		let parts = id.split("_");
		let n = parts[parts.length - 1];
		
		if(this.pinout[n].type == 'winding'){
			this.toggle();
		}
	}
	
	toggle(){
		this.state = !this.state;
		this.draw(true);
	}
	
}







