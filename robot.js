
class Robot {
    lastX = 210;
    lastY = 61;
    turn = 0; iteration = 0; itt = 0;
    checkFullTurn = true;
    robotWidth = 100;        //unit: mm
    sensorNo = 7;
    sensor_distance = 133.3;  //unit: mm
    sensor_width = 16.       //unit: mm
    maxAccel = .5;          // .5  代表有跣軚, 0是完全跣軚不會行走, max是maxVel
    maxVel = 7.;            // 7.
    Kp = 2.1;
    Kd = 1.2;                 //Core PID

    sensorSize = 4;         //unit is pixel, not in mm
    state = [];             //the state of the sensor array, true is on black line, false is on white bg
    vr = 0.; vl = 0.;           //velocity of the left and right wheel
    error = 0; last_error = 0; output;  //using for PID
    desiredVl = 0; desiredVr = 0;     //after PID output, calculator the drsire velocity
    wheelWidth = 8;
    isDead = false;                 //the robot is out of range

    drift = 0; lastDrift = 0;       //drift(偏移) of the car
    timer = 0; last_timer = 0;
    enterTimerZone;
    score = 0;
    checkTimer = 0; lastCheckTimer = 0;
    GUI;
    /**
     * 
     * @param {number} _id 
     * @param {number} _x 
     * @param {number} _y 
     * @param {number} _theta 
     */
    constructor(_x, _y, _theta) {
        this.x = _x;
        this.y = _y;
        this.theta = _theta;
        for (var i = 0; i < this.sensorNo; i++)
            this.state[i] = false;
        ellipseMode(CENTER);
        this.enterTimerZone = true;
        this.isDead = false;

        this.timer = frameCount;
        this.last_timer = this.timer;
        this.score = 0;

    }
    /**
     * 
     */
    updateSensor() {
        var avg = 0, sum = 0;
        var online = false;
        var sensor_position_x = 0;
        var sensor_position_y = 0;
        var thisSensorX = 0;
        var thisSensorY = 0;
        var _theta = 0;
        if (this.x <= 0 || this.x >= 580 || this.y <= 0 || this.y >= 580) this.isDead = true;

        for (var i = 0; i < this.sensorNo; i++) {
            _theta = radians(this.theta);
            thisSensorX = this.sensor_distance * 0.3 * sin(this.sensor_width * 0.3 * (i - floor(this.sensorNo / 2)) / (this.sensor_distance * 0.3));
            thisSensorY = this.sensor_distance * 0.3 * cos(this.sensor_width * 0.3 * (i - floor(this.sensorNo / 2)) / (this.sensor_distance * 0.3));
            sensor_position_x = this.x + thisSensorX * cos(_theta) + thisSensorY * sin(_theta);
            sensor_position_y = this.y + thisSensorX * sin(_theta) - thisSensorY * cos(_theta);

            var blackValue = 0;
            for (var j = 0; j < this.sensorSize; j++) {
                for (var k = 0; k < this.sensorSize; k++) {
                    var c = get(int(sensor_position_x) + j - floor(j / 2), +int(sensor_position_y) + k - floor(k / 2));
                    blackValue += (c[0] + c[1] + c[2]) / 3.;
                }
            }
            blackValue = 255. - blackValue / (this.sensorSize * this.sensorSize);

            if (blackValue > 127) this.state[i] = true;
            else this.state[i] = false;
            //turn the sensor state into PID input
            if (blackValue > 127) online = true;
            //only average in values that are above a noise threshold
            if (blackValue > 20) {
                avg += blackValue * (i * 1000.);
                sum += blackValue;
            }
        }
        if (!online) {
            this.drift = this.lastDrift;
        }
        else {
            this.lastDrift = avg / sum;
            this.drift = this.lastDrift;
        }
    }
    /**
     * 
     * @param {number} _Kp 
     * @param {number} _Kd 
     */
    setPD(_Kp, _Kd) {
        this.Kp = _Kp;
        this.Kd = _Kd;
    }
    /**
     * 
     */
    PID() {
        // PID controller////////////////////////////////
        this.error = this.drift / 1000. - (this.sensorNo - 1) / 2.;
        this.output = this.Kp * this.error + this.Kd * (this.error - this.last_error);

        // output = Kp.getValueF() * input;
        this.output = constrain(this.output, -2 * this.maxVel, 2 * this.maxVel);
        this.last_error = this.error;

        if (this.output > 0) {
            this.desiredVl = this.maxVel;
            this.desiredVr = this.maxVel - this.output;
        } else {
            this.desiredVl = this.maxVel + this.output;
            this.desiredVr = this.maxVel;
        }
    }
    /**
     * 
     */
    drive() {
        this.desiredVl = constrain(this.desiredVl, -this.maxVel, this.maxVel);
        this.desiredVr = constrain(this.desiredVr, -this.maxVel, this.maxVel);

        this.vl = (this.desiredVl - this.vl > 0) ? this.vl + this.maxAccel : this.vl - this.maxAccel;
        this.vr = (this.desiredVr - this.vr > 0) ? this.vr + this.maxAccel : this.vr - this.maxAccel;

        this.vl = constrain(this.vl, -this.maxVel, this.maxVel);
        this.vr = constrain(this.vr, -this.maxVel, this.maxVel);

        // var R = -this.robotWidthh0.3vl+this.vr)/(2*(this.vr-this.vl));
        var dtheta = -(this.vr - this.vl) / (this.robotWidth * 0.3);
        var dx = (this.vr + this.vl) / 2 * sin(radians(this.theta));
        var dy = -(this.vr + this.vl) / 2 * cos(radians(this.theta));
        // this.x = -R*sin(radians(this.theta)) + R*sin(dtheta+radians(this.theta)) + this.x;
        // this.y =  R*cos(radians(this.theta)) - R*cos(dtheta+radians(this.theta)) + this.y;
        this.theta += degrees(dtheta);
        if (this.theta > 360) this.theta -= 360;
        if (this.theta < -360) this.theta += 360;
        this.x += dx;
        this.y += dy;

        this.iteration++;
        this.itt++;
        //check the car whether it is on the line
        if((this.x >= 205 && this.x <= 215) && (this.y >= 41 && this.y <= 81)){
            if(!this.checkFullTurn){ 
                this.turn++;
                this.checkFullTurn = true;
            } 
        } else {
            this.checkFullTurn = false;
        }
        
        if(this.turn == 2){
            this.isDead = true;
        }
        if(this.itt == 30){
            this.itt = 0;
            if(this.error > 6.8 || this.error < -6.8) this.isDead = true;
            if(abs(this.x - this.lastX)+abs(this.y - this.lastY) < 35) this.isDead = true;
            this.lastX = this.x;
            this.lastY = this.y;
        }
    }
    /**
     * 
     */
    getScore() {
        if(!this.isDead) return 0;

        this.score = 0;
        if(this.turn < 2){
            this.score = 800000000;
            if(this.turn == 1){
                if(this.y>300){
                    this.score -= 400000000;
                    this.score -= (600-this.x);
                } else {
                    if(this.x>300){
                        this.score -= 300000000;
                        this.score -= this.x
                    } else {
                        this.score -= 450000000;
                        this.score -= this.x;
                    }
                }
            } else {
                if(this.y>300){
                    this.score -= 100000000;
                    this.score -= (600-this.x);
                } else {
                    if(this.x>300){
                        this.score -= this.x;
                    } else {
                        this.score -= 15000000;
                        this.score -= this.x;
                    }
                }
            }
        } else {
            this.score = this.iteration;
        }
        return this.score;
    }
    /**
     * @param {Robot} couple
     */
    crossover(couple){
        let robotData;
        var rw = 0;
        var sd = 0;
        var sw = 0;
        var mv = 0;
        var kp = 0;
        var kd = 0;
        if(int(random(10))%2==0){
            rw = this.robotWidth;
        } else {
            rw = couple.robotWidth;
        }
        if(int(random(10))%2==0){
            sd = this.sensor_distance;
        } else {
            sd = couple.sensor_distance;
        }
        if(int(random(10))%2==0){
            sw = this.sensor_width;
        } else {
            sw = couple.sensor_width;
        }
        if(int(random(10))%2==0){
            mv = this.maxVel;
        } else {
            mv = couple.maxVel;
        }
        if(int(random(10))%2==0){
            kp = this.Kp;
        } else {
            kp = couple.Kp;
        }
        if(int(random(10))%2==0){
            kd = this.Kd;
        } else {
            kd = couple.Kd;
        }
        robotData = new Robot(210, 61, -90);
        robotData.robotWidth = rw;
        robotData.sensorNo = 15;
        robotData.sensor_distance = sd;
        robotData.sensor_width = sw;
        robotData.maxVel = mv;
        robotData.maxAccel = .5;
        robotData.Kp = kp;
        robotData.Kd = kd;
        return robotData;
    }
    /**
     * 
     */
    mutate() {
        var choice = int(random(6));
        switch(choice){
            case 0:
                this.robotWidth = random(80, 180);
            case 1:
                this.sensor_distance = random(50, 200);
            case 2:
                this.sensor_width = random(12, 20);
            case 3:
                this.maxVel = random(5., 9.);
            case 4:
                this.Kp = random(0, 5);
            case 5:
                this.Kd = random(0, 5);
        }
    } 
    /**
     * 
     */
    show() {
        // if the car is dead, stop showing it
        if(this.isDead) {
            return;
        }
        var sensor_position_x = 0;
        var sensor_position_y = 0;
        var thisSensorX = 0;
        var thisSensorY = 0;
        var _theta = 0;

        // draw the body of robot////////////////////////////////
        push();
        {
            stroke(0);
            strokeWeight(3);
            translate(this.x, this.y);
            rotate(radians(this.theta));
            //draw the body of car
            fill('#325AA8');
            rectMode(CORNER);
            rect(-this.robotWidth * 0.3 / 2., -20.0, this.robotWidth * 0.3, 30.);
            //draw the two wheels
            fill('#f2511f');
            rectMode(CENTER);
            rect(-this.robotWidth * 0.3 / 2 - this.wheelWidth / 2, 0, this.wheelWidth, 20);
            rect(this.robotWidth * 0.3 / 2 + this.wheelWidth / 2, 0, this.wheelWidth, 20);
            //draw the center line of car
            stroke('#FF00FF');
            strokeWeight(.5);
            line(-this.robotWidth * 0.3 / 2. - this.wheelWidth - 10, 0, this.robotWidth * 0.3 / 2 + this.wheelWidth / 2 + 10, 0);
            line(0, -30, 0, 15);
        }
        pop();

        fill('#0000FF');
        noStroke();

        for (var i = 0; i < this.sensorNo; i++) {
            _theta = radians(this.theta);
            thisSensorX = this.sensor_distance * 0.3 * sin(this.sensor_width * 0.3 * (i - floor(this.sensorNo / 2)) / (this.sensor_distance * 0.3));
            thisSensorY = this.sensor_distance * 0.3 * cos(this.sensor_width * 0.3 * (i - floor(this.sensorNo / 2)) / (this.sensor_distance * 0.3));
            sensor_position_x = this.x + thisSensorX * cos(_theta) + thisSensorY * sin(_theta);
            sensor_position_y = this.y + thisSensorX * sin(_theta) - thisSensorY * cos(_theta);
            // draw the sensor array of car
            noFill();
            strokeWeight(.5);
            stroke(0);
            ellipse(sensor_position_x, sensor_position_y, this.sensorSize, this.sensorSize);
            // draw the result of sensor array///////////////////////////////////
            var thisSensorResultX = 8. * (i - floor(this.sensorNo / 2));
            var thisSensorResultY = 50.;
            fill(this.state[i] == true ? '#FF0000' : 'FFFFFF');
            ellipse(this.x + thisSensorResultX, this.y - thisSensorResultY, this.sensorSize, this.sensorSize);
        }


    }
    /**
     * 
     */
    oneLoop() {
        if (this.x >= 0 && this.x <= 210 && this.y <= 110) {
            if (!this.enterTimerZone) {
                this.timer = frameCount;
                this.score = this.timer - this.last_timer;
                this.enterTimerZone = true;
                this.last_timer = this.timer;

            }
        }
        else this.enterTimerZone = false;

    }
    /**
     * 
     */
    update() {
        if (!this.isDead) {
            this.updateSensor();
            this.PID();
            this.drive();
        }
    }
}
