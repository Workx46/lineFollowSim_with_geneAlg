var img;
var FPS = 144;
var population = 50;
let robots = [];
let bestRobots = [];
let best = [];
var isAutoDelCar = true;
var currentID;
var robotWidth;
var sensorNo;
var sensorSize;
var sensor_distance;
var sensor_width;
var maxAccel;
var maxVel;
var Kp;
var Kd;
var generation = 1;
var fittest = 990000000;

function preload() {
    img = loadImage('line guide-01.svg')
}

function setup() {
    createCanvas(600, 600);
	pixelDensity(2.0);
	frameRate(FPS);
	GUI();
    for (var i = 0; i < population; i++) generateCar();
    // generateCar();
	for(var i = 0; i<population; i++){
		bestRobots.push(robots[i])
	}
}

function draw() {
	var fittestData = []
	//set the fps
	frameRate(FPS);
	//draw background
	drawStage();
	if(computed()){
		reduction();
		crossover();
		mutation();
		fittestData = [generation, fittest, bestRobots[0]]
		best.push(fittestData);
		generation++;
	}

	
}

function generateCar() {
	robots.push(new Robot(210, 61, -90));
	robots[robots.length - 1].robotWidth = random(60, 180);
	robots[robots.length - 1].sensorNo = 15;
	robots[robots.length - 1].sensor_distance = random(50, 200);
	robots[robots.length - 1].sensor_width = random(12, 20);
	robots[robots.length - 1].maxVel = random(5., 9.);
	robots[robots.length - 1].maxAccel = .5;
	robots[robots.length - 1].Kp = random(5);
	robots[robots.length - 1].Kd = random(5);
}

function computed() {
	var finished = true;
	for (var i = 0; i < robots.length; i++) robots[i].update();
    for (var i = 0; i < robots.length; i++) robots[i].show();
	for (var i = 0; i < robots.length; i++) finished &= (robots[i].getScore()!=0);
	return finished;
}

function reduction(){
	for(var i = 0; i<robots.length; i++){
		bestRobots.push(robots[i]);
		robots.splice(i, 1);
	}
	bestRobots.sort(function(a, b){return a.score - b.score;});
	for(var i=bestRobots.length - 1; i >= population; i--) bestRobots.splice(i, 1)
	
	fittest = bestRobots[0].getScore();
}
/**
 * @param {Robot} a
 * @param {Robot} a1
 * @param {Robot} a2
 * @param {Robot} b
 * @param {Robot} b1
 * @param {Robot} b2
 */
function crossover(){
	for (var i = 0; i < 5; i++) generateCar();
	for (var i = 0; i < population - 5; i++){
		a1 = bestRobots[int(random(20))];
		a2 = bestRobots[int(random(20))];
		a = a1.getScore()<a2.getScore()? a1:a2;
		b1 = bestRobots[int(random(20))];
		b2 = bestRobots[int(random(20))];
		b = b1.getScore()<b2.getScore()? b1:b2;
		if(random(1) < 0.8) {
			robots.push(a.crossover(b))
		} else {
			if(a.getScore()>b.getScore()){a = b;} 
			robots.push(new Robot(210, 61, -90))
			robots[robots.length - 1].robotWidth = a.robotWidth;
			robots[robots.length - 1].sensorNo = 15;
			robots[robots.length - 1].sensor_distance = a.sensor_distance;
			robots[robots.length - 1].sensor_width = a.sensor_width;
			robots[robots.length - 1].maxVel = a.maxVel;
			robots[robots.length - 1].maxAccel = .5;
			robots[robots.length - 1].Kp = a.Kp;
			robots[robots.length - 1].Kd = a.Kd;
		}
	}
}

function mutation(){
	for(var i = 0; i < robots.length; i++){
		if(random(1) < 0.2) robots[i].mutate();
	}
}

function drawStage(){
	//background
	image(img, 0, 0, 600, 600);
	
	//draw the start line
	fill(127, 127, 255, 127);
	noStroke();
	rectMode(CORNER);
	rect(200, 0, 10, 110);

	//draw the fps text
	fill(0);
	textAlign(LEFT, TOP);
	text("fps: " + nf(frameRate(), 3, 1) + '/' + FPS, 0, 0);

	//draw the stroke of field
	noFill();
	stroke(0);
	strokeWeight(.5);
	rect(0, 0, 600, 600);

	fill(0);
	textSize(25);
	textAlign(LEFT, TOP);
	text("Gen: " + generation, 200, 0);
	text("fittest: " + fittest, 350, 0);

}


