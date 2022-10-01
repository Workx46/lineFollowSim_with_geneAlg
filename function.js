function resetPosition() {
	for (var i = 0; i < robots.length; i++) {
		robots[i].x = 210;
		robots[i].y = 61;
		robots[i].theta = -90;
		robots[i].isDead = false;
		robots[i].timer = frameCount;
		robots[i].last_timer = robots[i].timer;
		robots[i].score = 0;
	}
	winner = 0;
	winnerScore = 9999;
}

function delCarEvent() {
	robots.splice(currentID, 1);
	winner = 0;
	winnerScore = 9999;
}

function GUI(){
	saveButton = createButton('SAVE');
	saveButton.position(width - 100, height - 25);
	saveButton.size(50, 25);
	saveButton.mousePressed(saveEvent);

	loadButton = createButton('LOAD');
	loadButton.position(width - 50, height - 25);
	loadButton.size(50, 25);
	loadButton.mousePressed(loadEvent);

	resetButton = createButton('Reset position');
	resetButton.position(width - 100, height - 50);
	resetButton.size(100, 25);
	resetButton.style("font-size", "12px");
	resetButton.mousePressed(resetPosition);
}

function saveEvent(){
	saveJSON(bestRobots, "bestRobotData")
	// saveJSON(bestRobots, "Bestrobot")
}

function loadEvent(){
	fileSelectButton = createFileInput(handleFile);
	fileSelectButton.position(200, height - 25);
	
}

function handleFile(file) {
	if (file.type === 'application' && file.subtype === 'json') {
		RobotsStore = file.data;
		print(RobotsStore);

		for (var i = 0; i < RobotsStore.length; i++) {
			robots.push(new Robot(robotNoCounter, 210, 61, -90));
			robots[robots.length - 1].robotWidth = RobotsStore[i].robotWidth;
			robots[robots.length - 1].sensorNo = RobotsStore[i].sensorNo;
			robots[robots.length - 1].sensor_distance = RobotsStore[i].sensor_distance;
			robots[robots.length - 1].sensor_width = RobotsStore[i].sensor_width;
			robots[robots.length - 1].maxAccel = RobotsStore[i].maxAccel;
			robots[robots.length - 1].maxVel = RobotsStore[i].maxVel;
			robots[robots.length - 1].Kp = RobotsStore[i].Kp;
			robots[robots.length - 1].Kd = RobotsStore[i].Kd;
			robotNoCounter++;
		}
		fileSelectButton.remove();
	}
}

function print(a) {
	console.log(a);
}