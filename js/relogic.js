
//Relay constants 1 - 31
const RELAY_KL  = 0x01;
const RELAY_KH  = 0x02;
const RELAY_KT  = 0x03;
const RELAY_KQC = 0x04;
const RELAY_KQT = 0x05;
const RELAY_KA  = 0x06;
const RELAY_KV  = 0x07;
const RELAY_KQ  = 0x08;
/* Reserved 0x09 - 0x1F */
  
//Contact constants 32 - 47 (0x20 - 0x2F)
const CONTACT_NC  = 0x20; // нормально закрытый
const CONTACT_NO  = 0x21; // нормально открытый
const CONTACT_NCA = 0x22; // нормально закрытый с выдержкой на срабатывание
const CONTACT_NCR = 0x23; // нормально закрытый с выдержкой на возврат
const CONTACT_NOA = 0x24; // нормально открытый с выдержкой на срабатывание
const CONTACT_NOR = 0x25; // нормально открытый с выдержкой на возврат
const CONTACT_NCB = 0x26; // нормально закрытый с выдержкой на срабатывание и на возврат
const CONTACT_NOB = 0x27; // нормально открытый с выдержкой на срабатывание и на возврат

//Windings constants (50, 51 - 0x32, 0x33)
const WIND_VOLTAGE = 0x32;
const WIND_CURRENT = 0x33;

const CONTACT_W = 25;

const DEBUG = false;

/**
 *  ReLogic file list:
 *						1) relogic.core.js    - relogic core
 *						2) relogic.contact.js - relogic contacts class
 *						3) relogic.winding.js - relogic winding class
 *						4) relogic.relay.js   - relogic relay class
 *						5) relogic.bus.js     - relogic bus class
 */


var ReLogic = {
	version: "0.8.0",
	scene: {},
	layout: {},
	sceneID: 1,
	schemeID: 1,
	
	createScene: function(elData){
		if(!("logic" in elData)){
			console.error("[ReLogic] Can't draw scheme without 'logic' scene.");
			return;
		}
		
		let scheme = {};
		scheme.logic = new ReLogicScene(elData.logic, this.sceneID++);
		
		if("AC" in elData){
			scheme.AC = new ReLogicScene(elData.AC, this.sceneID++);
		}
		
		if("signal" in elData){
			scheme.signal = new ReLogicScene(elData.signal, this.sceneID++);
		}
		
		scheme.id = this.schemeID;
		this.scene[this.schemeID++] = scheme;
		
		return scheme;
	},

	addRelay: function(type, params){

	},

	addResistor: function(type, params){

	},

	addBus: function(type, params){

	}
};

class ReLogicScene{
	
	sceneTmpl = '<div class="relogic_scheme_wrap" id="relogic_scheme_%id%"><div class="relogic_scheme_content" style="width:%w%px;height:%h%px;">\
				<div class="relogic_scheme_layout" id="relogic_layout_%id%" style="width:%w%px;height:%h%px;"></div>\
				<canvas class="relogic_current_layer" id="relogic_current_layer_%id%" width="%w%" height="%h%"></canvas>\
				<canvas class="relogic_scheme_scene" id="relogic_scene_%id%" width="%w%" height="%h%"></canvas>\
			</div></div>';
			
    tileTmpl = '<div class="relogic_scheme_tile" id="%selector%" style="width:%w%px;height:%h%px;top:%t%px;left:%l%px;">\
	            <div class="relogic_scheme_tile_title">%text%</div></div>';
				
	elementList = {};
	elementID = 1;
	
	source = [];
	
	constructor(selector, schemeID){		
		let scene = document.querySelector(selector);
		let w = scene.clientWidth,
		    h = scene.clientHeight - 2;

		scene.innerHTML = this.getHTML("scene", {id: schemeID, w: w, h: h});
		this.id = schemeID;
		this.ctx = document.getElementById("relogic_scene_" + schemeID).getContext("2d");
		this.current = document.getElementById("relogic_current_layer_" + schemeID).getContext("2d");
		this.size = [w, h];
		
		this.startTime = new Date().getTime();
		this.redrawBlock = 100;
	}
	
	/**
	  * Generate HTML code with template and list of vars to replace
	  *		(string)tmpl - HTML template
	  *		(object)data - array of replace rules.
	  *				Example: data = {'varname' : 'value'}
	  */
	getHTML(tmpl, data){
		let code = this[tmpl + "Tmpl"];
		let exp;
		
		for(let varname in data){
			exp = new RegExp('\\%' + varname + '\\%', 'g');
			code = code.replace(exp, data[varname]);
		}
		
		return code;
	}
	
	drawTitle(elID, title, sub = 0){
		let selector = "relogic_tile_" + this.id + "_" + elID + (sub ? "_" + sub : "");
		let el = document.getElementById(selector);
		let data = this.elementList[elID].drawData;
		
		if(sub){
			data = data[sub];
		}
		
		if(!title){
			title = data.title;
		}
		
		if(el){
			el.querySelector(".relogic_scheme_tile_title").innerText = title;
			return;
		}

		let border = data.border;
		let w = border[2] - border[0];
		let h = border[3] - border[1];
		let top = border[1];
		let left = border[0];
		
		let code = this.getHTML("tile", {selector: selector, w: w, h: h, t: top, l: left, text: title});
		document.getElementById("relogic_layout_" + this.id).insertAdjacentHTML("beforeEnd", code);

		let self = this;
		document.getElementById(selector).onclick = function(){
			self.onClick(elID, this);
		};
	}
	
	onClick(elID, tile){
		if(this.elementList[elID].onClick){
			this.elementList[elID].onClick(tile);
		}
	}
	
	addElement(item){
		this.elementList[this.elementID] = item;
		item.id = this.elementID++;
		
		if(item instanceof ReLogicBus){
			this.source.push(item);
			this.addLinkRow(item.id, true);
		}
		else{
			this.addLinkRow(item.id);	
		}
		
		this.fillMatrix = false;
		
		return item.id;
	}
	
	draw(){
		for(let id in this.elementList){
			this.elementList[id].draw();
		}
		
		this.drawLinks();
	}
	
	fillMatrix = false;
	linkMatrix = [];
	linkMap = {};
	linkELid = 0;
	linkELmap = {}; // map el id - link id
	linkELmapInv = {}; // map link id - el id
	
	/**
	  * Create link matrix row and register element
	  */
	addLinkRow(id, source = false){
		id = id.toString();
		let type = (id.indexOf(",") === -1) ? this.elementList[id].type : "no";
		
		if(type == 'relay'){
			let item = this.elementList[id].pinout;
			
			for(let pin in item){
				if(typeof item[pin] == "string"){
					continue;
				}
				
				this.addLinkRow(id + "," + pin);
			}
			
			return;
		}	
		
		let sid = this.linkELid, eid = (!source ? sid + 1 : sid);
		
		this.linkELmap[id] = {start: sid, end: eid};
		this.linkELmapInv[sid] = [id, "start"];
		this.linkELmapInv[eid] = [id, "end"];
		this.linkMatrix[sid] = [];
		this.linkMatrix[eid] = [];
		
		this.linkELid += (!source ? 2 : 1);
	}
	
	/**
	 * Create link object between scheme elements
	 * el1 - object ID link FROM
	 * el2 - object ID link TO 
	 * type - connection type
	 *   serial - end to start
	 *   start  - start to start
	 *   end    - end to end
	 */
	connect(el1, el2, type = 'serial'){	
	    if(!this.fillMatrix){
			this.generateNullMatrix();
		}
	
		let fKey = this.getLinkKey(el1);
		let tKey = this.getLinkKey(el2);
		
		let place = [];
		switch(type){
			case "serial":
				place = ["end", "start"];
			break;
			case "start":
				place = ["start", "start"];
			break;
			case "end":
				place = ["end", "end"];
			break;
		}
		
		let fMid = this.linkELmap[fKey][place[0]];
		let tMid = this.linkELmap[tKey][place[1]];
		
		this.linkMatrix[fMid][tMid] = 1;
		this.linkMatrix[tMid][fMid] = 1;
	}
	
	/**
	  * Fill link matrix with 0.
	  */
	generateNullMatrix(){
		let len = this.linkMatrix.length;
		this.linkMatrix = getNullMatrix(len, len);
		this.fillMatrix = true;
	}
	
	getLinkKey(id){
		let key;
		if(Array.isArray(id)){
			//relay pin case
			let pin = id[1];
			id = id[0];
			
			let pinv = this.elementList[id].pinout[pin];
			
			if(typeof pinv == "string"){
				pin = pinv;
			}
			
			key = id + "," + pin;
		}
		else{
			key = id;
		}
		
		return key;
	}
	
	connectMap = {};
	drawLinks(){
		let matrix = this.linkMatrix;
		let len = matrix.length;
		let data, coors;

		for(let i = 0;i < len;i++){
			for(let j = 0;j < len;j++){
				if(j <= i || matrix[i][j] != 1){
					continue;
				}
				
				this.drawLinkLine(i, j);
				
				if(!(i in this.connectMap)){
					this.connectMap[i] = [];
				}
				
				if(!(j in this.connectMap)){
					this.connectMap[j] = [];
				}
				
				if(!this.connectMap[i].includes(j))
					this.connectMap[i].push(j);
				
			   if(!this.connectMap[j].includes(i))
					this.connectMap[j].push(i);
			}
		}
		
		this.drawUnits();
	}
	
	/**
	  * Map of filled coordinates for next counting right shift.
	  */
	fillMap = {};
	
	/** 
	  * Map with numbers of point usages. 
	  *  {
	  *	   x : {
	  *  		 y : count
	  *     }
	  *  }
	  */
	pointUsage = {};
	
	/**
	  * Draw link between 2 elements by them matrix ID.
	  */
	drawLinkLine(fmID, tmID){
		let fData = this.getLinkData(fmID);
		let tData = this.getLinkData(tmID);

		let fCoors = this.getDrawData(fData.id, fData.pin)[fData.place];
		let tCoors = this.getDrawData(tData.id, tData.pin)[tData.place];
		
		let fX, fY, tX, tY;
		
		if(fData.type == "winding" || tData.type == "source"){
			fX = tCoors[0];
			fY = tCoors[1];
			tX = fCoors[0];
			tY = fCoors[1];

			let tmp = tData;
			tData = fData;
			fData = tmp;
		}
		else{
			fX = fCoors[0];
			fY = fCoors[1];
			tX = tCoors[0];
			tY = tCoors[1];			
		}
		
		let ctx = this.ctx;
		let stepX = 50, midX;
		
		ctx.save();
		ctx.beginPath();
		
		if((fX == tX) || (fY == tY)){
			//one line
			
			ctx.moveTo(fX, fY);
			ctx.lineTo(tX, tY);

			this.saveLink(fmID, tmID, [[fX, fY], [tX, tY]]);
		}
		else if(fData.type == "source" || tData.type == "source"){
			//two line
			//always go from source
			
			ctx.moveTo(fX, fY);
			ctx.lineTo(fX, tY);
			ctx.lineTo(tX, tY);
			
			this.savePointUsage(fX, tX, fY, tY);
			this.saveLink(fmID, tmID, [[fX, fY], [fX, tY], [tX, tY]]);				
		}
		else{
			//three line			
			midX = this.getShift(fX + stepX, [fY, tY], tData);
			
			ctx.moveTo(fX, fY);
			ctx.lineTo(midX, fY);
			ctx.lineTo(midX, tY);
			ctx.lineTo(tX, tY);
			
			this.savePointUsage(midX, fY, tY);
			this.regFill(midX, [fY, tY], tData);
			this.saveLink(fmID, tmID, [[fX, fY], [midX, fY], [midX, tY], [tX, tY]]);				
		}
		
		ctx.lineWidth = 2;
		ctx.stroke();
		ctx.restore();
	}
	
	color = 0;
	getColor(){
		let colors = ["red", "blue", "green", "orange", "orchid", "#afba49", "#7d6c4f", "#724c47", "#0a6a77"];
		
		if(this.color == colors.length){
			this.color = 0;
		}
		
		return colors[this.color++];
	}
	
	regFill(x, arr, tData){
		if(!(x in this.fillMap)){
			this.fillMap[x] = [];
		}
		
		let info = {
			id: tData.id,
			pin: tData.pin,
			coor: arr.sort((a, b) => {return a - b;})
		};
		
		this.fillMap[x].push(extend({}, info));
	}
	
	/**
	  * Find link collision by x coordinate and returns X according to the empty coordinates.
	    x - start x 
		range - [from y, to y]
		tData - [to element id, to element pin]
	  */
	getShift(x, range, tData){
		let step = 50;
		
		if(!(x in this.fillMap)){
			return x;
		}
		
		range = range.sort((a, b) => {return a - b;});
		
		let data = this.fillMap[x];
		let fRange, item;
		for(let i = 0, len = data.length;i < len;i++){
			item = data[i];
			fRange = item.coor;
			
			if(inRange(range[0], fRange) || inRange(range[1], fRange) || (range[0] < fRange[0] && range[1] > fRange[1])){				
				if((item.id == tData.id && item.pin == tData.pin)){
					break;
				}
				else{
					return this.getShift(x + step, range, tData);
				}
			}
		}
		
		return x;
	}
	
	/**
	  * Get element id, pin, place, type by a matrix ID.
	  */
	getLinkData(id){
		let data = {};
		let item = this.linkELmapInv[id];
		let eid, pin = null, type;
		
		if(item[0].indexOf(",") !== -1){
			eid = item[0].split(",");
			pin = eid[1];
			eid = eid[0];
			type = this.elementList[eid].pinout[pin].type;
		}
		else{
			eid = item[0];
			type = this.elementList[eid].type;
		}
		
		data.id = eid;
		data.place = item[1];
		data.pin = pin;
		data.type = type;
		
		return data;
	}
	
	getDrawData(id, pin = null){
		let el = this.elementList[id];
		
		if(!el){
			console.log("[ReLogic] Undefined element id #%s.", id);
			return;
		}
		
		if(pin !== null && !(el instanceof ReLogicRelay)){
			console.log("[ReLogic] Element id #%s is'nt relay.", id);
			return;
		}
		
		if(pin === null){
			return el.drawData;
		}
		else{
			let data = el.pinout[pin];
			
			if(typeof data == "string"){
				return el.drawData[data];
			}
			else{
				return el.drawData[pin];
			}
		}
	}
	
	linkRegistr = {};
	saveLink(fmID, tmID, coors){
		let key = fmID + "|" + tmID;
		let invKey = tmID + "|" + fmID;
		
		this.linkRegistr[key] = this.linkRegistr[invKey] = coors;
	}
	
    unitMap = {};
	drawUnits(){
		this.correctPointUsage();
		
		let matrix = this.linkMatrix;
		let len = matrix.length;
		let key, links, unitType;
		let x, y;
		let fY, tY, ufRate, utRate;
		let usage = this.pointUsage;
		
		for(let i = 0;i < len;i++){
			for(let j = 0;j < len;j++){
				if(j <= i || matrix[i][j] != 1){
					continue;
				}
				
				key = i + "|" + j;
				links = this.linkRegistr[key];
				unitType = links.length - 1;
								
				if(unitType == 3){
					/**
					 * links[0] - fX fY
					 * links[1] - midX fY
					 * links[2] - midX tY
					 * links[3] - tX tY
					 */
					 
					x = links[1][0];
					 
					fY = links[1][1];
					tY = links[2][1];
					
					ufRate = usage[x][fY];
					utRate = usage[x][tY];
					
					if(ufRate == utRate && ufRate <= 1){
						continue;
					}
					
					if(utRate >= ufRate){
						if(ufRate <= 1){
							continue;
						}

						y = fY;
					}			
					else{
						y = tY;
					}
				}
				else if(unitType == 2){
					x = links[1][0];
					y = links[1][1];
					
					ufRate = usage[x][y];
					
					if(ufRate <= 1){
						continue;
					}					
				}
				else{
					continue;
				}
				
					this.drawUnitPoint([x, y]);
					this.unitMap[i + "|" + j] = [x, y];
			}
		}
	}

	drawUnitPoint(coors, layer = null){		
		let ctx = (layer) ? layer : this.ctx;
		let x = coors[0], y = coors[1];
		let color = (!layer) ? ReLogicConfig.wireColor : ReLogicConfig.currentColor;
		
		ctx.save();
		ctx.beginPath();
		ctx.moveTo(x, y);
		ctx.arc(x, y, 5, 0, 2 * Math.PI, false);
		ctx.fillStyle = color;
		ctx.fill();
		ctx.restore();
	}
	
	/**
	  * Save point coordinates for unit count.
	  */
	savePointUsage(){
		let fX, tX, fY, tY;
		if(arguments.length == 3){
			fX = arguments[0];
			fY = arguments[1];
			tY = arguments[2];
		}
		else{
			fX = arguments[0];
			tX = arguments[1];
			fY = arguments[2];
			tY = arguments[3];			
		}
		
		if(!(fX in this.pointUsage)){
			this.pointUsage[fX] = {};
		}
		
		let tmp;
		if(fY > tY){
			tmp = fY;
			fY = tY;
			tY = tmp;
		}
		
		if(!(fY in this.pointUsage[fX])){
			this.pointUsage[fX][fY] = 0;
		}
		
		if(!(tY in this.pointUsage[fX])){
			this.pointUsage[fX][tY] = 0;
		}
			
		this.pointUsage[fX][tY]++;
		this.pointUsage[fX][fY]++;
		
		this.usageCorrectMap.push(arguments);
	}
	
	/**
	  * Array with arguments for correct point usage function.
	  */
	usageCorrectMap = [];
	
	/**
	  * Correct number of point usages.
	  */
	correctPointUsage(){
		if(arguments.length == 0){
			this.usageCorrectMap.forEach((el) => {
				this.correctPointUsage.apply(this, el);
			});
		}
		else{
			let fX, tX, fY, tY, tmp;
			let line3 = false;
			if(arguments.length == 3){
				fX = arguments[0];
				fY = arguments[1];
				tY = arguments[2];
				line3 = true;
			}
			else{
				fX = arguments[0];
				tX = arguments[1];
				fY = arguments[2];
				tY = arguments[3];
			}
			
			if(fY > tY){
			  tmp = tY;
			  tY = fY;
			  fY = tmp;
			}
			
			for(let y in this.pointUsage[fX]){
				if(y == fY || y == tY || !inRange(y, [fY, tY])){
					continue;
				}

				this.pointUsage[fX][y]++;
			}
			
			if(!line3){
				if(fX > tX){
					tmp = tX;
					tX = fX;
					fX = tmp;
				}
				
				for(let x in this.pointUsage){
				  if(x > fX && x < tX){
					for(let y in this.pointUsage[x]){
						if(y == fY || y == tY){
							this.pointUsage[x][y]++;
						}
					}
				  }
				}
			}
		}
	}
	
	currentSchemeReady = false;
	
	/**
	 * Find closed circuits and draw current layer.
	 * Toggle relays if it's winding electrified.
	 */
	drawCurrent(){
	  if(this.circuitStore.length == 0){
		 this.findCircuits();
		 this.circuitStateReload();
	  }
	   
	   let layer = this.current;
	   layer.clearRect(0, 0, this.size[0], this.size[1]);
	   
	   this.circuitStore.forEach((data, index) => {
		   if(!data.closed){
			   return;
		   }
		   
		   let arr = data.matrixCircuit, unit;
		   for(let i = 0, len = arr.length;i < len;i+=2){
			   this.drawCurrentPart(arr[i], arr[i+1]);
		   }
	   });

	   let blockTime = 100;
	   setTimeout(() => {
		   this.currentSchemeReady = true;
	   }, blockTime);
	   //console.log("[ReLogic] Current is drawed");
	}
	
	drawCurrentPart(from, to){
		this.current.save();
		this.current.beginPath();
		this.linkRegistr[from + "|" + to].forEach((coor, i) => {
			if(i == 0){
				this.current.moveTo(coor[0], coor[1]);
			}
			else{
				this.current.lineTo(coor[0], coor[1]);
			}
		});
		
		this.current.lineWidth = 2;
		this.current.strokeStyle = ReLogicConfig.currentColor;
		this.current.stroke();
		this.current.restore();
			   
		let unit = this.unitMap[from + "|" + to];
		if(!unit){
			unit = this.unitMap[to + "|" + from];
		}
				
		//no unit - go next
		if(!Array.isArray(unit)){
			return;
		}
				
		this.drawUnitPoint(unit, this.current);
	}
	
	/**
	 * This is array of contour elements.
	 * circuitStore = [
	 *					{
	 *	 					contour: contArr,
	 *						closed: true
	 *					}, ...
	 *   				  ]
	 */
	circuitStore = [];
	findCircuits(){
		let startEl, endEl;
		
		this.source.forEach(source => {
			if(source.voltage > 0){
				startEl = source;
			}
			
			if(source.voltage < 0){
				endEl = source;
			}
		});
		
		let startSourceID = this.linkELmap[startEl.id].start;
		let endSourceID = this.linkELmap[endEl.id].start;
		let storage = [];
		
		let links = this.connectMap[startSourceID];
		let nextID;
		
		let recursy = (id, n) => {
			let linkMap = this.connectMap[id];
			let base = storage[n];
			
			if(!linkMap){
				console.log(id);
				return;
			}
			
			if(base.includes(endEl.id.toString())){
				return;
			}

			linkMap.forEach((start, ind, arr) => {
				let elID = this.getELid(start), 
				    stInd = n;
				let narr = base.concat([elID]);

				if(ind > 0){
					storage.push(narr);
					stInd = storage.length - 1;
				}
				else{
					storage[n] = narr;
				}
				
				nextID = this.getEndID(start);
				
				if(endSourceID == nextID){
					return;
				}

				recursy(nextID, stInd);
			});
			
		};

		let index;
		links.forEach((startID, i, arr) => {
			index = i;
			
			while(index in storage){
				index++;
			}
			
			storage.push([startEl.id, this.getELid(startID)]);
			nextID = this.getEndID(startID);

			recursy(nextID, index);
		});
		
		storage.forEach((item) => {
			let data = {
				circuit: item,
				matrixCircuit: [],
				closed: true
			};
		
			item.forEach((id) => {
				let start = this.linkELmap[id].start;
				let end = this.linkELmap[id].end;
				let isSource = (start == end);
				
				if(isSource){
					data.matrixCircuit.push(start);
				}
				else{
					data.matrixCircuit.push(start);
					data.matrixCircuit.push(end);
				}
				
				let el;				
				if(id.toString().indexOf(",") > -1){
					id = id.split(",");
					el = this.elementList[id[0]].pinout[id[1]];
					let type = el.type;
					el = el[type];
				}
				else{
					el = this.elementList[id];
				}
				
				if(!el.currentFlow){
					data.closed = false;
				}
			});
		
			this.circuitStore.push(extend({}, data));
		});
	}
	
	/**
	 * Hook for changing current scheme when currentFlow property changes.
	 */
	currentHook(){
		this.circuitStateReload();
		if(!this.currentSchemeReady){
			return;
		}

		this.currentSchemeReady = false;
		this.drawCurrent();
	}
	
	/**
	 * Update state of contacts in circuit objects.
	 */
	circuitStateReload(){
		this.circuitStore.forEach((data, i) => {
			this.circuitStore[i].closed = data.circuit.every((id) => {
				let el;
				if(id.toString().indexOf(",") > -1){
					id = id.split(",");
					el = this.elementList[id[0]].pinout[id[1]];
					let type = el.type;
					el = el[type];
				}
				else{
					el = this.elementList[id];
				}
				
				return el.currentFlow;
			});

			data.circuit.forEach((id) => {
				let el;
				if(id.toString().indexOf(",") > -1){
					id = id.split(",");
					el = this.elementList[id[0]].pinout[id[1]];
					let type = el.type;

					if(type == "contact"){
						el = el[type];
					}
					else{
						el = this.elementList[id[0]];
					}
				}
				else{
					el = this.elementList[id];
				}

				el.hasCurrent = this.circuitStore[i].closed;
				//console.log(el.title, el.hasCurrent);
			});

		});
	}
	
	getEndID(id){
		return this.linkELmap[this.linkELmapInv[id][0]].end;
	}
	
	getELid(mid){
		return this.linkELmapInv[mid][0];
	}

}

function getNullMatrix(m, n){
	let matrix = [];
	for(let i = 0;i < m;i++){
		matrix[i] = [];
		for(let j = 0;j < n;j++){
			matrix[i][j] = 0;
		}
	}
	
	if(m == 1){
		matrix = matrix[0];
	}
	
	return matrix;
}

function inRange(num, range){
	return (num >= range[0] && num <= range[1]);
}

function count(obj){
	let counter = 0;
	for(let i in obj){
		if(obj.hasOwnProperty(i)){
			counter++;
		}
	}
	
	return counter;
}

function isFunction(func){
	return Object.prototype.toString.call(func) === '[object Function]';
}
