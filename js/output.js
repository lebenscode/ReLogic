document.addEventListener("DOMContentLoaded", function(){	
	const scene = ReLogic.createScene({
						logic: "#relay_scheme_logic"
				  });
	
	const logic = window.logisimo = scene.logic;
    
	const bus1 = new ReLogicBus(logic, {
											title: "+EC",
											coors: [10, 30],
											voltage: 110
										  });
	
	const bus2 = new ReLogicBus(logic, {
											title: "-EC",
											coors: [logic.size[0] - 50, 30],
											voltage: -110
										  });

	const RPV = new ReLogicRelay(RELAY_KQC, scene, {
		title: "РПВ",
		pinout: {
			"1, 2" : {
				type: CONTACT_NO,
				coors: [80, 580]
			},

			"9, 10": {
				type: WIND_CURRENT,
				coors: [400, 100]
			}
		}
	});

	const RPO = new ReLogicRelay(RELAY_KQT, scene, {
		title: "РПО",
		pinout: {
			"1, 2" : {
				type: CONTACT_NO,
				coors: [80, 500]
			},

			"9, 10": {
				type: WIND_CURRENT,
				coors: [400, 250]
			}
		}
	});

	const Q = new ReLogicRelay(RELAY_KQ, scene, {
		title: "Q",
		pinout: {
			"1, 2": {
				type: CONTACT_NC,
				coors: [650, 250]
			},
			"3, 4" : {
				type: CONTACT_NO,
				coors: [650, 100]
			},
			"A,B": {
				type: WIND_VOLTAGE,
				coors: [800, 100]
			},
			"A1, A2":{
				type: WIND_VOLTAGE,
				coors: [800, 250]
			}
		}
	});

	const R1 = new ReLogicResistor(logic, "R1", [100, 200], 15000);

	let EC1 = logic.addElement(bus1);
	let EC2 = logic.addElement(bus2);
	let KL1 = logic.addElement(RPV);
	let KL2 = logic.addElement(RPO);
	let QC = logic.addElement(Q);
	let R = logic.addElement(R1);

	logic.connect(EC1, [KL2, 9]);
	logic.connect([KL2, 10], [QC, 1]);
	logic.connect([QC, 2], [QC, "A1"]);
	logic.connect([QC, "A2"], EC2);

	logic.connect(EC1, [KL1, 9]);
	logic.connect([KL1, 10], [QC, 3]);
	logic.connect([QC, 4], [QC, "A"]);
	logic.connect([QC, "B"], EC2);

	// Drawing
	logic.draw();
	
}, false);

window.onkeydown = function(e){
	if(e.key == "Enter" && e.shiftKey){
		logisimo.drawCurrent();
	}
}