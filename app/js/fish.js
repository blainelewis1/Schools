'use strict';

var Point = require('./geometry.js').Point;

function Fish(x, y, radius, speed) {
    this.pos = new Point(x,y);
    this.rotation = Math.PI / 2;
    this.speed = speed;
    this.rotation_speed = speed / 10;
    this.radius = radius;
    this.colliding = false;
}

Fish.prototype.set_path = function(path) {
    this.path = path;
};

Fish.prototype.move = function(delta_time, collidables) {
    var target = this.next_target();

    if (!target) {
        return;
    }

    var delta_velocity = this.speed * delta_time;

    //rotate towards target, then move towards it.
    this.pos.x += Math.cos(this.rotation) * delta_velocity;
    this.pos.y += Math.sin(this.rotation) * delta_velocity;

    //Trace a ray to each and test if we'd be touching any of them after moving.

    collidables.forEach(function(collidable) {
        this.colliding = collidable.pos.distance(this.pos) <= 0 && collidable !== this;
    }.bind(this));


    var desired_angle = Math.atan2(target.y - this.pos.y, target.x - this.pos.x);

    // this.rotation = desired_angle;
    // this.rotation %= Math.PI * 2;

    var cw_dist = (((desired_angle - this.rotation) % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
    var ccw_dist = (((this.rotation - desired_angle) % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

    var delta_rotation = this.rotation_speed * delta_time;

    if (cw_dist < delta_rotation || ccw_dist < delta_rotation) {
        this.rotation = desired_angle;
    } else if (cw_dist > ccw_dist) {
        this.rotation -= delta_rotation;
    } else {
        this.rotation += delta_rotation;
    }

    this.rotation %= Math.PI * 2;
};

Fish.prototype.next_target = function() {
    if(!this.path || this.path.length === 0) {
        return undefined;
    }

    if(this.path[0].distance(this.pos) <= 10 && this.path.length > 1) {
        this.path.shift();
    }


    return this.path[0];
};

Fish.prototype.draw = function(context) {
    context.lineWidth = 2;
    context.strokeStyle = "#000000";
    context.fillStyle = this.colliding ? "#AA7777" : "#AAAAAA";

    context.beginPath();
    context.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);
    context.fill();

    context.beginPath();
    context.moveTo(this.pos.x, this.pos.y);
    context.lineTo(this.pos.x + Math.cos(this.rotation) * this.radius * 1.5, this.pos.y + Math.sin(this.rotation) * this.radius * 1.5);
    context.stroke();
};


module.exports = Fish;
