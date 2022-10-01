let RobotsStore;
function GUI(){
	saveButton = createButton('SAVE');
	saveButton.position(width - 100, height - 25);
	saveButton.size(50, 25);
	saveButton.mousePressed(saveEvent);

	loadButton = createButton('LOAD');
	loadButton.position(width - 50, height - 25);
	loadButton.size(50, 25);
	loadButton.mousePressed(loadEvent);
}

function saveEvent(){
	best = [bestRobots[0]];
	saveJSON(best, "bestRobotData")
}

function loadEvent(){
	fileSelectButton = createFileInput(handleFile);
	fileSelectButton.position(200, height - 25);
	
}

function handleFile(file) {
	if (file.type === 'application' && file.subtype === 'json') {
		RobotsStore = file.data;

		for (var i = 0; i < RobotsStore.length; i++) {
			robots.push(new Robot(210, 61, -90));
			robots[robots.length - 1].robotWidth = RobotsStore[i].robotWidth;
			robots[robots.length - 1].sensorNo = RobotsStore[i].sensorNo;
			robots[robots.length - 1].sensor_distance = RobotsStore[i].sensor_distance;
			robots[robots.length - 1].sensor_width = RobotsStore[i].sensor_width;
			robots[robots.length - 1].maxAccel = RobotsStore[i].maxAccel;
			robots[robots.length - 1].maxVel = RobotsStore[i].maxVel;
			robots[robots.length - 1].Kp = RobotsStore[i].Kp;
			robots[robots.length - 1].Kd = RobotsStore[i].Kd;
		}
		fileSelectButton.remove();
	}
}