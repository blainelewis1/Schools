(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
/*jshint browser : true*/

function Controls() {
    this.load_style();

    this.control_div();
    var canvas = document.getElementsByTagName("canvas")[0];
    this.canvas_div().appendChild(canvas);

    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

Controls.prototype.control_div = function () {
    this.div = document.createElement("div");
    this.div.setAttribute("class", "controls");
    this.div.style.right = "0";
    this.div.style.width = "19%";
    this.div.style.height = "100%";
    this.div.style.float = "right";
    document.getElementsByTagName("body")[0].appendChild(this.div);
};

Controls.prototype.canvas_div = function () {
    var canvas_div = document.createElement("div");
    canvas_div.setAttribute("class", "canvas-container");
    canvas_div.style.position = "absolute";
    canvas_div.style.width = "80%";
    canvas_div.style.height = "100%";
    canvas_div.style.float = "left";

    document.getElementsByTagName("body")[0].appendChild(canvas_div);

    return canvas_div;
};

Controls.prototype.load_style = function() {
    var link = document.createElement("link");
    link.href = "style/controls.css";
    link.rel = "stylesheet";
    link.type = "text/css";
    document.getElementsByTagName("head")[0].appendChild(link);
};

Controls.prototype.add_control = function(control) {
    this.div.appendChild(control);
};

Controls.prototype.create_id = function() {
    return Math.random().toString(36).substring(7);
};

Controls.prototype.button = function(text, click) {
    var input = document.createElement("input");
    input.type = "button";
    input.value = text;
    input.addEventListener("click", click);

    this.add_control(input);
};

Controls.prototype.slider = function(text, obj, prop, min, max, step) {
    var input = document.createElement("input");
    input.type = "range";
    input.id = this.create_id();
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = obj[prop];

    input.addEventListener("input", function(e) {
        obj[prop] = e.target.value;
        label.innerText = label.textContent = text + " " + obj[prop];
    });

    var label = document.createElement("label");
    label.innerText = label.textContent = text + " " + obj[prop];
    label.for = input.id;

    var div = document.createElement("div");
    div.appendChild(label);
    div.appendChild(input);

    this.add_control(div);
};

Controls.prototype.radio = function(text, obj, prop, values, value) {
    var div = document.createElement("div");

    var label = document.createElement("label");
    label.innerHTML = text;
    div.appendChild(label);

    function update(e) {
        obj[prop] = e.target.value;
    }

    for(var i = 0; i < values.length; i++) {
        document.createElement("label");
        var radioLabel = document.createElement("label");
        radioLabel.innerHTML = values[i];
        div.appendChild(radioLabel);

        var input = document.createElement("input");
        input.type = "radio";
        input.name = prop;
        input.value = values[i];
        input.checked = values[i] === obj[prop];
        input.addEventListener("change", update);

        radioLabel.appendChild(input);
    }


    this.add_control(div);
};


module.exports = Controls;

},{}],2:[function(require,module,exports){
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

},{"./geometry.js":3}],3:[function(require,module,exports){
"use strict";

function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}

Line.prototype.equals = function(line) {
    return (this.p1.equals(line.p1) && this.p2.equals(line.p2)) ||
        (this.p1.equals(line.p2) && this.p2.equals(line.p1));
};

Line.prototype.draw = function(context, color) {
    context.strokeStyle = color || "#AAAAAA";
    context.lineWidth = 3;

    context.beginPath();
    context.moveTo(this.p1.x, this.p1.y);
    context.lineTo(this.p2.x, this.p2.y);
    context.stroke();
};

Line.prototype.toString = function() {
    return this.p1.toString() + " => " + this.p2.toString();
};

Line.prototype.hashCode = function() {
    return this.p1.hashCode() + this.p2.hashCode();
};

Line.prototype.intersects = function(line) {
    if (this.equals(line)) {
        return true;
    }

    var s1 = this.p2.subtract(this.p1);
    var s2 = line.p2.subtract(line.p1);

    var s = (-s1.y * (this.p1.x - line.p1.x) + s1.x * (this.p1.y - line.p1.y)) / (-s2.x * s1.y + s1.x * s2.y);
    var t = (s2.x * (this.p1.y - line.p1.y) - s2.y * (this.p1.x - line.p1.x)) / (-s2.x * s1.y + s1.x * s2.y);

    if (s >= 0 && s <= 1 && t >= 0 && t <= 1) {
        if (this.p1.equals(line.p1) || this.p2.equals(line.p1) || this.p1.equals(line.p2) || this.p2.equals(line.p2)) {
            return false;
        }
        return true;
    } else if (isNaN(s) || isNaN(t)) {
        //If they share no points they don't overlap.
        if (!(this.p1.equals(line.p1) || this.p2.equals(line.p1) || this.p1.equals(line.p2) || this.p2.equals(line.p2))) {
            return false;
        } else {
            return this.bounding_contains(line) || line.bounding_contains(this);
        }
        //Colinear, either they overlap or they don't...
        //If they share one point, then they overlap if any of the points falls within the range of the lines.
        //If they share both they're equal, which we cover above
    }

    return false;
};

Line.prototype.bounding_contains = function(line) {
    var top_left = new Point(Math.min(this.p1.x, this.p2.x), Math.min(this.p1.y, this.p2.y));
    var bottom_right = new Point(Math.max(this.p1.x, this.p2.x), Math.max(this.p1.y, this.p2.y));

    return line.p1.between(top_left, bottom_right) || line.p2.between(top_left, bottom_right);
};

Line.prototype.intersects_any = function(lines) {
    for (var k = 0; k < lines.length; k++) {
        if (this.intersects(lines[k])) {
            return true;
        }
    }

    return false;
};

function Point(x, y) {
    this.x = x;
    this.y = y;
}

Point.prototype.toString = function() {
    return "(" + this.x + ", " + this.y + ")";
};

Point.prototype.equals = function(point) {
    return this.x === point.x && this.y === point.y;
};

Point.prototype.fuzzyEquals = function(point, epsilon) {
    return Math.abs(this.x - point.x) < epsilon && Math.abs(this.y - point.y) < epsilon;
};

Point.prototype.subtract = function(v) {
    return new Point(this.x - v.x, this.y - v.y);
};

Point.prototype.add = function(v) {
    return new Point(this.x + v.x, this.y + v.y);
};

Point.prototype.scalar_product = function(c) {
    return new Point(c * this.x, c * this.y);
};

Point.prototype.cross_product = function(v) {
    return this.x * v.y - this.y * v.x;
};

Point.prototype.dot_product = function(v) {
    return this.x * v.x + this.y * v.y;
};

Point.prototype.between = function(p1, p2) {
    return this.x > p1.x && this.x < p2.x && this.y > p1.y && this.y < p2.y;
};

Point.prototype.distance = function(p) {
    return Math.sqrt(Math.pow(this.x - p.x, 2) + Math.pow(this.y - p.y, 2));
};

Point.prototype.draw = function(context, color) {
    context.fillStyle = color || "#AAAAAA";

    context.beginPath();
    context.arc(this.x, this.y, 10, 0, Math.PI * 2);
    context.fill();
};

Point.prototype.hashCode = function() {
    return this.x + this.y;
};

function Triangle(p1,p2,p3) {
    this.edges = [new Line(p1,p2), new Line(p2,p3), new Line(p3,p1)];
    this.neighbors = [];
    this.points = [p1,p2,p3];
    this.color = getRandomColor();
}

Triangle.prototype.equals = function(x) {
    return this.get_center().fuzzyEquals(x.get_center(), 0.01);
};

Triangle.prototype.get_center = function() {
    //Centroid:
    //return new Point((this.points[0].x + this.points[1].x + this.points[2].x) / 3, (this.points[0].y + this.points[1].y + this.points[2].y) / 3);

    var a = this.points[0].distance(this.points[1]);
    var b = this.points[0].distance(this.points[2]);
    var c = this.points[1].distance(this.points[2]);
    var p = a + b + c;

    return new Point((a * this.points[2].x + b * this.points[1].x + c * this.points[0].x) / p, (a * this.points[2].y + b * this.points[1].y + c * this.points[0].y) / p);
};

Triangle.prototype.distance = function(t) {
    return this.get_center().distance(t.get_center());
};

Triangle.prototype.hashCode = function() {
    return this.points[0].hashCode() + this.points[1].hashCode() + this.points[2].hashCode();
};

Triangle.prototype.contains = function(p) {
    var p1 = this.points[0];
    var p2 = this.points[1];
    var p3 = this.points[2];

    var alpha = ((p2.y - p3.y) * (p.x - p3.x) + (p3.x - p2.x) * (p.y - p3.y)) /
        ((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y));
    var beta = ((p3.y - p1.y) * (p.x - p3.x) + (p1.x - p3.x) * (p.y - p3.y)) /
        ((p2.y - p3.y) * (p1.x - p3.x) + (p3.x - p2.x) * (p1.y - p3.y));
    var gamma = 1 - alpha - beta;

    return alpha > 0 && beta > 0 && gamma > 0;
};

Triangle.prototype.is_neighbor = function(t) {
    for (var i = 0; i < this.edges.length; i++) {
        for (var j = 0; j < t.edges.length; j++) {
            if (this.edges[i].equals(t.edges[j])) {
                return true;
            }
        }
    }
    return false;
};

Triangle.prototype.add_neighbor = function(t) {
    this.neighbors.push(t);
};

Triangle.prototype.fill_triangle = function(context) {
    context.beginPath();
    context.fillStyle = this.color;
    context.moveTo(this.points[0].x, this.points[0].y);

    context.lineTo(this.points[1].x, this.points[1].y);
    context.lineTo(this.points[2].x, this.points[2].y);
    context.lineTo(this.points[0].x, this.points[0].y);
    context.fill();
};

Triangle.prototype.draw_weights = function(context) {
    context.fillStyle = "#222222";

    for (var i = 0; i < this.neighbors.length; i++) {
        var d = this.get_center().distance(this.neighbors[i].get_center());
        context.fillText(d.toFixed(0), (this.get_center().x + this.neighbors[i].get_center().x) / 2 + 10, (this.get_center().y + this.neighbors[i].get_center().y) / 2 + 10);
    }
};

Triangle.prototype.draw_edges = function(context) {
    context.strokeStyle = "#AAAAAA";
    context.lineWidth = 3;
    for (var i = 0; i < this.neighbors.length; i++) {

        context.beginPath();
        context.moveTo(this.get_center().x, this.get_center().y);
        context.lineTo(this.neighbors[i].get_center().x, this.neighbors[i].get_center().y);
        context.stroke();
    }
};

Triangle.prototype.draw_vertex = function(context) {
    context.fillStyle = "#222222";
    context.beginPath();
    context.arc(this.get_center().x, this.get_center().y, 8, 8, 0, Math.PI * 2);
    context.fill();
};

function getRandomColor() {
    var letters = '0123456789ABCDEF';
    var color = '#';
    for (var i = 0; i < 6; i++) {
        color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
}


module.exports.Point = Point;
module.exports.Line = Line;
module.exports.Triangle = Triangle;

},{}],4:[function(require,module,exports){
"use strict";

function HashMap() {
    //TODO: should be configurable (and expandable)
    this.num_buckets = 19;
    this.buckets = [];
}

HashMap.prototype.get = function(key) {
    if(!key) {
        return undefined;
    }

    var bucket = this.buckets[this.hash(key)];

    if(!bucket) {
        return undefined;
    }

    for(var i = 0; i < bucket.keys.length; i++) {
        if(bucket.keys[i].equals(key)) {
            return bucket.values[i];
        }
    }

    return undefined;
};

HashMap.prototype.getKey = function(key) {
    if(!key) {
        return undefined;
    }

    var bucket = this.buckets[this.hash(key)];

    if(!bucket) {
        return undefined;
    }

    for(var i = 0; i < bucket.keys.length; i++) {
        if(bucket.keys[i].equals(key)) {
            return bucket.keys[i];
        }
    }

    return undefined;
};


HashMap.prototype.put = function(key, value) {
    //TODO: resize the buckets if need be.
    var bucket = this.buckets[this.hash(key)];
    if(!bucket) {
        bucket = {keys : [], values : []};
        this.buckets[this.hash(key)] = bucket;
    }

    var index = bucket.keys.length;

    for(var i = 0; i < bucket.keys.length; i++) {
        if(bucket.keys[i].equals(key)) {
            index = i;
        }
    }

    bucket.keys[index] = key;
    bucket.values[index] = value;
};

HashMap.prototype.remove = function(key) {
    var bucket = this.buckets[this.hash(key)];

    if(!bucket) {
        return;
    }

    for(var i = 0; i < bucket.keys.length; i++) {
        if(bucket.keys[i].equals(key)) {
            bucket.keys.splice(i, 1);
            bucket.values.splice(i, 1);
            return bucket.keys[i];
        }
    }
};

HashMap.prototype.hash = function(val) {
    return val.hashCode() % this.num_buckets;
};

function HashSet(arr) {
    this.map = new HashMap();

    this.length = 0;

    if(Object.prototype.toString.call(arr) === "[object Array]"){
        for(var i = 0; i < arr.length; i++) {
            this.add(arr[i]);
        }
    }
}

HashSet.prototype.add = function(val) {
    this.map.put(val, true);
    this.length++;
};

HashSet.prototype.contains = function(val) {
    var value = this.map.getKey(val);
    if(value) {
        return value;
    }
};

HashSet.prototype.get = function(val) {
    var value = this.map.getKey(val);
    if(value) {
        return value;
    }
};

HashSet.prototype.remove = function(val) {
    var removed = this.map.remove(val);

    if(typeof removed !== "undefined"){
        this.length--;
    }

    return removed;
};

HashSet.prototype.remove_all = function(arr) {
    for(var i = 0; i < arr.length; i++) {
        this.remove(arr[i]);
    }
};

HashSet.prototype.to_array = function() {
    var arr = [];
    for(var i = 0; i < this.map.buckets.length; i++) {

        if(!this.map.buckets[i]){
            continue;
        }

        var keys = this.map.buckets[i].keys;
        for(var j = 0; j < keys.length; j++) {
            arr.push(keys[j]);
        }
    }

    return arr;
};

HashSet.prototype.get_any = function() {
    for(var i = 0; i < this.map.buckets.length; i++) {

        if(!this.map.buckets[i]){
            continue;
        }

        var keys = this.map.buckets[i].keys;
        for(var j = 0; j < keys.length; j++) {
            return keys[j];
        }
    }

    return undefined;
};

function SetMultiMap() {
    this.map = new HashMap();
}

SetMultiMap.prototype.get = function(key) {
    var vals = this.map.get(key);
    if(!vals) {
        this.map.put(key, []);
        vals = this.map.get(key);
    }

    return vals;
};

SetMultiMap.prototype.put = function(key, value) {
    var vals = this.get(key);
    for(var i = 0; i < vals.length; i++) {
        if((vals[i].hasOwnProperty("equals") && vals[i].equals(value)) || vals[i] === value) {
            vals[i] = value;
            return;
        }
    }

    vals.push(value);
};


module.exports = HashMap;
module.exports.HashSet = HashSet;
module.exports.SetMultiMap = SetMultiMap;

},{}],5:[function(require,module,exports){
/*global CONFIG : true */

var canvas = document.getElementsByTagName("canvas")[0];
var context = canvas.getContext("2d");
CONFIG = {};
CONFIG.DEBUG = 3;

(function() {
    'use strict';
    var Fish = require('./fish.js');
    var Point = require('./geometry.js').Point;
    var School = require('./school.js');
    var Ocean = require('./ocean.js');
    var Reef = require('./reef.js');
    var Controls = require('./controls.js');
    var Mouse = require('./mouse.js');

    var controls = new Controls();
    controls.slider("Debug: ", CONFIG, "DEBUG", 0, 10, 1);

    //debugger;
    var ocean = new Ocean(canvas.width, canvas.height, [new Reef(300, 100, 250, 200)]);

    //TODO: controllable spawning

    var school = new School(ocean, new Point(500,500));
    // school.add_fish(new Fish(200, 120, 10, 0.25));
    // school.add_fish(new Fish(200, 120, 10, 0.2));
    // school.add_fish(new Fish(30, 300, 10, 0.5));
    // school.add_fish(new Fish(130, 500, 20, 0.05));
    // school.add_fish(new Fish(230, 150, 20, 0.1));
    // school.add_fish(new Fish(230, 150, 20, 0.15));
    school.add_fish(new Fish(600, 600, 20, 0.2));

    var mouse = new Mouse(school, ocean, canvas);
    controls.radio("Mode: ", mouse, "mode", mouse.modes);

    var previous_time;
    var was_hidden = false;
    var playing = true;

    document.showing = true;

    function step(t) {
        if (playing && document.showing) {
            var time_delta = previous_time === undefined ? 0 : t - previous_time;

            if (was_hidden) {
                time_delta = 0;
                was_hidden = false;
            }

            school.fish.forEach(function(fish) {
                fish.move(time_delta, school.fish);
            });
        }

        context.clearRect(0, 0, canvas.width, canvas.height);

        ocean.draw(context);
        school.draw(context);

        mouse.draw(context);

        previous_time = t;
        window.requestAnimationFrame(step);
    }

    document.addEventListener("visibilitychange", function(e) {
        if (document.hidden) {
            was_hidden = true;
        }
    });

    document.addEventListener("keypress", function(e) {
        if (e.keyCode === 32) {
            playing = !playing;
            e.preventDefault();
        }
    });

    step();
})();

},{"./controls.js":1,"./fish.js":2,"./geometry.js":3,"./mouse.js":6,"./ocean.js":7,"./reef.js":8,"./school.js":9}],6:[function(require,module,exports){
"use strict";

var Ocean = require('./ocean.js');
var Point = require('./geometry.js').Point;
var Reef = require('./reef.js');

function Mouse(school, ocean, canvas) {
    this.school = school;
    this.ocean = ocean;
    this.mode = "target";
    this.modes = ["target", "create", "delete"];
    this.p = new Point(0, 0);

    canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var p = new Point(e.clientX - rect.left, e.clientY - rect.top);
        this[this.mode](p);
    }.bind(this), false);

    canvas.addEventListener("mousemove", function(e) {
        var rect = canvas.getBoundingClientRect();
        this.p = new Point(e.clientX - rect.left, e.clientY - rect.top);
    }.bind(this));
}

Mouse.prototype.target = function(p) {
    this.school.set_target(p);
};

Mouse.prototype.delete = function(p) {
    var reef = this.ocean.get_reef_under_point(p);
    if (reef) {
        this.ocean.delete_reef(reef);
    }
};

Mouse.prototype.draw = function(context) {
    if (this.mode === "create" && this.p1) {
        //TODO: Create a function out of this.
        var top_left = new Point(Math.min(this.p1.x, this.p.x), Math.min(this.p1.y, this.p.y));
        var bottom_right = new Point(Math.max(this.p1.x, this.p.x), Math.max(this.p1.y, this.p.y));
        var dimens = bottom_right.subtract(top_left);
        context.fillStyle = 'rgba(100,100,100,0.5)';
        context.fillRect(top_left.x, top_left.y, dimens.x, dimens.y);
    }
};

//TODO: create reverse watchable variables, return a function from controls, when the funciton is called it uses a closure to update the value and gets the value
//TODO: bug where point1 isn't reset on changing modes
Mouse.prototype.create = function(p2) {
    if (!this.p1) {
        this.p1 = p2;
    } else {
        //TODO: either deal with overlapping reefs or don't allow them.
        var top_left = new Point(Math.min(this.p1.x, p2.x), Math.min(this.p1.y, p2.y));
        var bottom_right = new Point(Math.max(this.p1.x, p2.x), Math.max(this.p1.y, p2.y));
        var dimens = bottom_right.subtract(top_left);
        this.ocean.add_reef(new Reef(top_left.x, top_left.y, dimens.x, dimens.y));

        delete this.p1;
    }

};

module.exports = Mouse;

},{"./geometry.js":3,"./ocean.js":7,"./reef.js":8}],7:[function(require,module,exports){
'use strict';

var Reef = require('./reef.js');
var Line = require('./geometry.js').Line;
var Triangle = require('./geometry.js').Triangle;
var Point = require('./geometry.js').Point;
var Triangulation = require('./triangulation.js');
var Stats = require('./stats.js');

function Ocean(width, height, reefs) {
    this.width = width;
    this.height = height;
    this.reefs = reefs;
    this.retriangulate();
}

//TODO: create a triangulation for every size of fish (just expand the width,height and topleft points by the radius.) Probably a way we can reuse most of the triangulation.
//TODO: overlapping reefs cause  abug, combine them into polygons with constraints and use those instead
//TODO: create a convex hull, then remove points inside (gift wrapping algo), then determine how to create a constriant from that,
//TODO: maybe just triangulate the points first, then use that triangulation as the constraints. Genius.

//TODO: remove inner points (3 cases, all points, 2 points, 1 point) and then add new points at intersections.
// The old diagonals can still be used as constraints I think, but new outer lines need to be made where the intersections are.

Ocean.prototype.retriangulate = function () {
    Stats.start("retriangulate");
    this.triangulation = new Triangulation(this.get_points(), this.get_lines(), this.get_diags());
    Stats.finish("retriangulate");
};

Ocean.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;

    this.retriangulate();
};

Ocean.prototype.get_path_to = function(start_point, end_point) {
    Stats.start("get_path_to");
    var path = this.triangulation.find_path(start_point, end_point);
    Stats.finish("get_path_to");
    return path;
};

Ocean.prototype.get_reef_under_point = function(p) {
    for(var i = 0; i < this.reefs.length; i++) {
        if(this.reefs[i].contains(p)) {
            return this.reefs[i];
        }
    }
};

Ocean.prototype.get_points = function() {
    var points = new Reef(0, 0, this.width, this.height).get_points();

    this.reefs.forEach(function(reef) {
        var ps = reef.get_points();
        for (var i = 0; i < ps.length; i++) {
            points.push(ps[i]);
        }
    });

    points.sort(function(a, b) {
        if(a.x == b.x) {
            return a.y > b.y;
        }

        return a.x > b.x;
    });

    return points;
};

Ocean.prototype.get_lines = function() {
    var lines = new Reef(0,0,this.width, this.height).get_lines();

    function add(line) {lines.push(line);}

    for(var i = 0; i < this.reefs.length; i++) {
        this.reefs[i].get_lines().forEach(add);
    }

    return lines;
};

Ocean.prototype.get_lines_overlaps = function() {
    var lines = new Reef(0,0,this.width, this.height).get_lines();
    var points = new Reef(0, 0, this.width, this.height).get_points();
    var constraints = [];

    var polygons = [];

    /*
        We create a list of polygons, then we test if each reef intersects any of those polygons,
        if not that reef becomes a polygon. if it interesects, then we find the intersection, add the lines and points
        to the polygon. (and the constraints to the whole thing).

        //TODO: what about holes, or total polygon enclosure
        //TODO: what about reefs intersecting with multiple polygons.

        //this seems like a recursive solution would work here...

    */

    for(var i = 0; i < this.reefs.length; i++) {
        var intersection_points = [];
        for(var j = 0; j < polygons.length; j++) {
            intersection_points = polygons[j].get_intersection_points(this.reefs[i]);
        }

    }

        //TODO: go through all the points, remove the ones that fall inside another square

        //TODO: sort the points. start at top left, then go down, removing them as you go. Ten go from right to left.

    return lines;
};


Ocean.prototype.get_diags = function() {
    return this.reefs.map(function(r) {return r.get_diagonal();});
};

Ocean.prototype.add_reef = function(reef) {
    this.reefs.push(reef);
    this.retriangulate();
};

Ocean.prototype.delete_reef = function(reef) {
    this.reefs.splice(this.reefs.indexOf(reef), 1);
    this.retriangulate();
};

Ocean.prototype.draw = function(context) {
    this.reefs.forEach(function(reef) {
        reef.draw(context);
    });

    this.triangulation.draw(context);
};

module.exports = Ocean;

},{"./geometry.js":3,"./reef.js":8,"./stats.js":10,"./triangulation.js":11}],8:[function(require,module,exports){
'use strict';

var geometry = require("./geometry.js");
var Point = geometry.Point;
var Line = geometry.Line;

function Reef(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.points = [new Point(this.x, this.y), new Point(this.x, this.y + this.height), new Point(this.x + this.width, this.y + this.height), new Point(this.x + this.width, this.y + 0)];
}

Reef.prototype.draw = function(context) {
    context.fillStyle = "#AA5555";
    context.beginPath();
    context.fillRect(this.x, this.y, this.width, this.height);
};

Reef.prototype.get_points = function() {
    return this.points;
};

Reef.prototype.get_lines = function() {
    var points = this.get_points();

    return [new Line(points[0], points[1]), new Line(points[1], points[2]), new Line(points[2], points[3]), new Line(points[3], points[0])];
};

Reef.prototype.get_diagonal = function() {
    var points = this.get_points();

    return new Line(points[0], points[2]);
};

Reef.prototype.get_diagonals = function() {
    var points = this.get_points();

    return [new Line(points[0], points[2]), new Line(this.points[1], this.points[3])];
};

Reef.prototype.intersects = function(line) {
    var diag1 = new Line(this.points[0], this.points[2]);
    var diag2 = new Line(this.points[1], this.points[3]);

    return diag1.intersects(line) ||  diag2.intersects(line);
};

Reef.prototype.contains = function(p) {
    return p.x >= this.x && p.y >= this.y && p.x <= this.x + this.width && p.y <= this.y + this.height;
};

module.exports = Reef;

},{"./geometry.js":3}],9:[function(require,module,exports){
"use strict";

function School(ocean, target) {
    this.fish = [];
    this.ocean = ocean;
    this.target = target;
}

School.prototype.add_fish = function(fish) {
    this.fish.push(fish);
    fish.set_path(this.ocean.get_path_to(fish.pos, this.target));
};

School.prototype.set_target = function(target) {
    this.target = target;
    for(var i = 0; i < this.fish.length; i++) {
        this.fish[i].set_path(this.ocean.get_path_to(this.fish[i].pos, target));
    }
};

School.prototype.draw = function(context) {
    this.fish.forEach(function(fish) {
        fish.draw(context);
    });

    context.beginPath();
    context.lineWidth = 5;
    context.strokeStyle = "#AA3333";
    context.arc(this.target.x, this.target.y, 15, 0, Math.PI * 2);
    context.stroke();
};

module.exports = School;

},{}],10:[function(require,module,exports){
"use strict";

var Stats = {
    start : {},
    values : {}
};

Stats.start = function(name) {
        this.start[name] = +new Date();
};

Stats.finish = function(name) {
    this.add_value(name, +new Date() - this.start[name]);
};

Stats.add_value = function(name, value) {
    if(!this.values.hasOwnProperty(name)) {
        this.values[name] = [];
    }

    this.values[name].push(value);
};

Stats.get_values = function(name) {
    return this.values[name];
};

Stats.average = function(name) {
    return this.get_values(name).reduce(function(sum, value) {return sum + value;}) / this.get_values(name).length;
};

module.exports = Stats;

},{}],11:[function(require,module,exports){
"use strict";

var Line = require('./geometry.js').Line;
var Triangle = require('./geometry.js').Triangle;
var Point = require('./geometry.js').Point;
var HashMap = require('./hashmap.js');
var SetMultiMap = require('./hashmap.js').SetMultiMap;
var HashSet = require('./hashmap.js').HashSet;

function Triangulation(points, constraints, removable_constraints) {
    this.points = points;
    this.constraints = constraints;
    var triangulated = this.triangulate(points, this.constraints, removable_constraints);

    this.lines = triangulated.lines;
    this.graph = this.build_graph(this.lines, triangulated.edges, constraints);

}

Triangulation.prototype.triangulate = function(points, constraints, removable_constraints) {
    //TODO: make the triangulation deluanuay
    var edges = new SetMultiMap();

    var lines = constraints.slice();

    for(var k = 0; k < constraints.length; k++) {
        var l = constraints[k];
        edges.put(l.p1, l.p2);
        edges.put(l.p2, l.p1);
    }

    for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
            var possible_line = new Line(points[i], points[j]);
            var valid = true;
            if (!possible_line.intersects_any(lines) && !possible_line.intersects_any(removable_constraints)) {
                lines.push(possible_line);
                edges.put(points[i], points[j]);
                edges.put(points[j], points[i]);
            }
        }
    }

    return {
        lines: lines,
        edges: edges
    };
};

Triangulation.prototype.build_graph = function(lines, connects, constraints) {
    //TODO: never traverse the constraints (especially not the outer ones)

    var graph = [];

    lines = new HashSet(lines);


    var checked = new HashSet();
    var triangles = new HashSet();
    var triangles_by_edges = new SetMultiMap();
    var to_check = [lines.get_any()];
    //add an edge.
    var context = document.getElementsByTagName("canvas")[0].getContext("2d");

    for(var l = 0; l < constraints.length; l++){
        lines.remove(constraints[l]);
        checked.add(constraints[l]);
    }

    while (to_check.length || lines.length) {
        var checking;
        if (to_check.length) {
            checking = to_check.pop();
        } else {
            checking = lines.get_any();
            if(!checking){
                break;
            }
        }

        checked.add(checking);
        lines.remove(checking);

        var p1_neighbors = connects.get(checking.p1); //all neighbours p1
        var p2_neighbors = connects.get(checking.p2);
        var shared_points = this.duplicated(p1_neighbors.concat(p2_neighbors));

        var ts = [];

        for (var i = 0; i < shared_points.length; i++) {
            var p3 = shared_points[i];
            var t = new Triangle(checking.p1, checking.p2, p3);
            var p1p2p3 = triangles.get(t);

            t.fill_triangle(context);
            checking.draw(context);

            if (!p1p2p3) {
                p1p2p3 = t;
                triangles.add(p1p2p3);
            }

            var p1p3 = new Line(checking.p1, p3);

            triangles_by_edges.put(checking, p1p2p3);

            if (!checked.contains(p1p3)) {
                to_check.push(p1p3);
            }

            var p2p3 = new Line(checking.p2, p3);
            if (!checked.contains(p2p3)) {
                to_check.push(p2p3);
            }

            ts.push(p1p2p3);
        }
    }

    //TODO: could probably do this inline (like in the for loops)
    var triangle_arr = triangles.to_array();
    for(var j = 0; j < triangle_arr.length; j++) {
        var triangle = triangle_arr[j];
        var neighbs = triangles_by_edges.get(triangle.edges[0])
            .concat(triangles_by_edges.get(triangle.edges[1])
            .concat(triangles_by_edges.get(triangle.edges[2])));

        for(var k = 0; k < neighbs.length; k++) {
            if(!neighbs[k].equals(triangle)) {
                triangle.add_neighbor(neighbs[k]);
            }
        }
    }

    return triangle_arr;
};

// for (var i = 0; i < lines.length; i++) {
//     for (var j = i + 1; j < lines.length; j++) {
//         for (var k = j + 1; k < lines.length; k++) {
//             var points = this.unique(lines[i].p1, lines[i].p2, lines[j].p1, lines[j].p2, lines[k].p1, lines[k].p2);
//             if (points.length === 3) {
//                 var triangle = new Triangle(lines[i], lines[j], lines[k], points);
//
//                 for (var l = 0; l < graph.length; l++) {
//                     if (graph[l].is_neighbor(triangle)) {
//                         triangle.add_neighbor(graph[l]);
//                         graph[l].add_neighbor(triangle);
//                     }
//                 }
//                 graph.push(triangle);
//             }
//         }
//     }
// }
//
// return graph;

Triangulation.prototype.get_closest_triangle = function(p) {
    var min_d = Infinity;
    var min;

    for (var i = 0; i < this.graph.length; i++) {
        var d = this.graph[i].get_center().distance(p);
        if (d < min_d && !this.intersects(new Line(p, this.graph[i].get_center()))) {
            min_d = d;
            min = this.graph[i];
        }
    }

    return min;
};
Triangulation.prototype.find_path = function(start_point, end_point) {
    //TODO: It's not optimal because I can reduce paths using my algorithm, but djkstras doesn't do that.can I actually reduce the graph before I run djkstras?
    var start = this.get_closest_triangle(start_point);
    var end = this.get_closest_triangle(end_point);

    for (var j = 0; j < this.graph.length; j++) {
        delete this.graph[j].d;
        delete this.graph[j].prev;
    }

    if (!end) {
        return [];
    }

    var queue = [start];
    start.d = 0;
    start.node = undefined;

    function distanceComparator(a, b) {
        return a.d > b.d;
    }

    while (queue.length) {
        var current = queue.shift();

        if (current === end) {
            return this.construct_path(current, start_point, end_point);
        }

        for (var i = 0; i < current.neighbors.length; i++) {
            var newD = current.d + current.neighbors[i].distance(current);

            if (typeof current.neighbors[i].d === 'undefined' || newD < current.neighbors[i].d) {
                current.neighbors[i].d = newD;
                current.neighbors[i].prev = current;
                if (queue.indexOf(current.neighbors[i]) === -1) {
                    queue.push(current.neighbors[i]);
                }
            }
        }

        queue.sort(distanceComparator);
    }

    return [];
};

Triangulation.prototype.construct_path = function(node, start_point, end_point) {
    var path = [];
    while (node.prev) {
        path.push(node.get_center());
        node = node.prev;
    }
    path.push(node.get_center());

    path.reverse();
    path.push(end_point);
    path.unshift(start_point);
    this.reduce_path(path);

    return path;
};

Triangulation.prototype.duplicated = function(arr) {
    arr.sort();
    var vals = [];
    for (var i = 0; i < arr.length - 1; i++) {
        if(arr[i].equals(arr[i+1])) {
            vals.push(arr[i]);
            i++;
        }
    }

    return vals;
};

Triangulation.prototype.reduce_path = function(path) {
    for (var i = 0; i < path.length - 2; i++) {
        if (!this.intersects(new Line(path[i], path[i + 2]))) {
            path.splice(i + 1, 1);
            i--;
        }
    }
};

Triangulation.prototype.intersects = function(line) {
    for (var i = 0; i < this.constraints.length; i++) {
        if (this.constraints[i].intersects(line)) {
            return true;
        }
    }

    return false;
};

Triangulation.prototype.draw = function(context) {
    if (CONFIG.DEBUG > 3) {
        this.points.forEach(function(point) {
            point.draw(context, "#5555AA");
        });

        this.lines.forEach(function(line) {
            line.draw(context, "#5555AA");
        });
    }

    this.graph.forEach(function(triangle) {
        if (CONFIG.DEBUG > 4) {
            triangle.fill_triangle(context);
        }
    });

    this.graph.forEach(function(triangle) {
        if (CONFIG.DEBUG > 1) {
            triangle.draw_edges(context);
        }
    });
    this.graph.forEach(function(triangle) {
        if (CONFIG.DEBUG > 0) {
            triangle.draw_vertex(context);
        }
    });
    this.graph.forEach(function(triangle) {
        if (CONFIG.DEBUG > 2) {
            triangle.draw_weights(context);
        }
    });
};

module.exports = Triangulation;

},{"./geometry.js":3,"./hashmap.js":4}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29udHJvbHMuanMiLCJhcHAvanMvZmlzaC5qcyIsImFwcC9qcy9nZW9tZXRyeS5qcyIsImFwcC9qcy9oYXNobWFwLmpzIiwiYXBwL2pzL2luZGV4LmpzIiwiYXBwL2pzL21vdXNlLmpzIiwiYXBwL2pzL29jZWFuLmpzIiwiYXBwL2pzL3JlZWYuanMiLCJhcHAvanMvc2Nob29sLmpzIiwiYXBwL2pzL3N0YXRzLmpzIiwiYXBwL2pzL3RyaWFuZ3VsYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG4vKmpzaGludCBicm93c2VyIDogdHJ1ZSovXG5cbmZ1bmN0aW9uIENvbnRyb2xzKCkge1xuICAgIHRoaXMubG9hZF9zdHlsZSgpO1xuXG4gICAgdGhpcy5jb250cm9sX2RpdigpO1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNhbnZhc1wiKVswXTtcbiAgICB0aGlzLmNhbnZhc19kaXYoKS5hcHBlbmRDaGlsZChjYW52YXMpO1xuXG4gICAgY2FudmFzLnN0eWxlLndpZHRoID0nMTAwJSc7XG4gICAgY2FudmFzLnN0eWxlLmhlaWdodD0nMTAwJSc7XG4gICAgY2FudmFzLndpZHRoICA9IGNhbnZhcy5vZmZzZXRXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gY2FudmFzLm9mZnNldEhlaWdodDtcbn1cblxuQ29udHJvbHMucHJvdG90eXBlLmNvbnRyb2xfZGl2ID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMuZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICB0aGlzLmRpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImNvbnRyb2xzXCIpO1xuICAgIHRoaXMuZGl2LnN0eWxlLnJpZ2h0ID0gXCIwXCI7XG4gICAgdGhpcy5kaXYuc3R5bGUud2lkdGggPSBcIjE5JVwiO1xuICAgIHRoaXMuZGl2LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgIHRoaXMuZGl2LnN0eWxlLmZsb2F0ID0gXCJyaWdodFwiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXS5hcHBlbmRDaGlsZCh0aGlzLmRpdik7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUuY2FudmFzX2RpdiA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY2FudmFzX2RpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgY2FudmFzX2Rpdi5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLCBcImNhbnZhcy1jb250YWluZXJcIik7XG4gICAgY2FudmFzX2Rpdi5zdHlsZS5wb3NpdGlvbiA9IFwiYWJzb2x1dGVcIjtcbiAgICBjYW52YXNfZGl2LnN0eWxlLndpZHRoID0gXCI4MCVcIjtcbiAgICBjYW52YXNfZGl2LnN0eWxlLmhlaWdodCA9IFwiMTAwJVwiO1xuICAgIGNhbnZhc19kaXYuc3R5bGUuZmxvYXQgPSBcImxlZnRcIjtcblxuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiYm9keVwiKVswXS5hcHBlbmRDaGlsZChjYW52YXNfZGl2KTtcblxuICAgIHJldHVybiBjYW52YXNfZGl2O1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmxvYWRfc3R5bGUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGluayA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsaW5rXCIpO1xuICAgIGxpbmsuaHJlZiA9IFwic3R5bGUvY29udHJvbHMuY3NzXCI7XG4gICAgbGluay5yZWwgPSBcInN0eWxlc2hlZXRcIjtcbiAgICBsaW5rLnR5cGUgPSBcInRleHQvY3NzXCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJoZWFkXCIpWzBdLmFwcGVuZENoaWxkKGxpbmspO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmFkZF9jb250cm9sID0gZnVuY3Rpb24oY29udHJvbCkge1xuICAgIHRoaXMuZGl2LmFwcGVuZENoaWxkKGNvbnRyb2wpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmNyZWF0ZV9pZCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHJpbmcoNyk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUuYnV0dG9uID0gZnVuY3Rpb24odGV4dCwgY2xpY2spIHtcbiAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgaW5wdXQudHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgaW5wdXQudmFsdWUgPSB0ZXh0O1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGljayk7XG5cbiAgICB0aGlzLmFkZF9jb250cm9sKGlucHV0KTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5zbGlkZXIgPSBmdW5jdGlvbih0ZXh0LCBvYmosIHByb3AsIG1pbiwgbWF4LCBzdGVwKSB7XG4gICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgIGlucHV0LnR5cGUgPSBcInJhbmdlXCI7XG4gICAgaW5wdXQuaWQgPSB0aGlzLmNyZWF0ZV9pZCgpO1xuICAgIGlucHV0Lm1pbiA9IG1pbjtcbiAgICBpbnB1dC5tYXggPSBtYXg7XG4gICAgaW5wdXQuc3RlcCA9IHN0ZXA7XG4gICAgaW5wdXQudmFsdWUgPSBvYmpbcHJvcF07XG5cbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiaW5wdXRcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBvYmpbcHJvcF0gPSBlLnRhcmdldC52YWx1ZTtcbiAgICAgICAgbGFiZWwuaW5uZXJUZXh0ID0gbGFiZWwudGV4dENvbnRlbnQgPSB0ZXh0ICsgXCIgXCIgKyBvYmpbcHJvcF07XG4gICAgfSk7XG5cbiAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gICAgbGFiZWwuaW5uZXJUZXh0ID0gbGFiZWwudGV4dENvbnRlbnQgPSB0ZXh0ICsgXCIgXCIgKyBvYmpbcHJvcF07XG4gICAgbGFiZWwuZm9yID0gaW5wdXQuaWQ7XG5cbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQobGFiZWwpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChpbnB1dCk7XG5cbiAgICB0aGlzLmFkZF9jb250cm9sKGRpdik7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUucmFkaW8gPSBmdW5jdGlvbih0ZXh0LCBvYmosIHByb3AsIHZhbHVlcywgdmFsdWUpIHtcbiAgICB2YXIgZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcblxuICAgIHZhciBsYWJlbCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICBsYWJlbC5pbm5lckhUTUwgPSB0ZXh0O1xuICAgIGRpdi5hcHBlbmRDaGlsZChsYWJlbCk7XG5cbiAgICBmdW5jdGlvbiB1cGRhdGUoZSkge1xuICAgICAgICBvYmpbcHJvcF0gPSBlLnRhcmdldC52YWx1ZTtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdmFsdWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJsYWJlbFwiKTtcbiAgICAgICAgdmFyIHJhZGlvTGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gICAgICAgIHJhZGlvTGFiZWwuaW5uZXJIVE1MID0gdmFsdWVzW2ldO1xuICAgICAgICBkaXYuYXBwZW5kQ2hpbGQocmFkaW9MYWJlbCk7XG5cbiAgICAgICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgICAgICBpbnB1dC50eXBlID0gXCJyYWRpb1wiO1xuICAgICAgICBpbnB1dC5uYW1lID0gcHJvcDtcbiAgICAgICAgaW5wdXQudmFsdWUgPSB2YWx1ZXNbaV07XG4gICAgICAgIGlucHV0LmNoZWNrZWQgPSB2YWx1ZXNbaV0gPT09IG9ialtwcm9wXTtcbiAgICAgICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLCB1cGRhdGUpO1xuXG4gICAgICAgIHJhZGlvTGFiZWwuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuICAgIH1cblxuXG4gICAgdGhpcy5hZGRfY29udHJvbChkaXYpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IENvbnRyb2xzO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG5cbmZ1bmN0aW9uIEZpc2goeCwgeSwgcmFkaXVzLCBzcGVlZCkge1xuICAgIHRoaXMucG9zID0gbmV3IFBvaW50KHgseSk7XG4gICAgdGhpcy5yb3RhdGlvbiA9IE1hdGguUEkgLyAyO1xuICAgIHRoaXMuc3BlZWQgPSBzcGVlZDtcbiAgICB0aGlzLnJvdGF0aW9uX3NwZWVkID0gc3BlZWQgLyAxMDtcbiAgICB0aGlzLnJhZGl1cyA9IHJhZGl1cztcbiAgICB0aGlzLmNvbGxpZGluZyA9IGZhbHNlO1xufVxuXG5GaXNoLnByb3RvdHlwZS5zZXRfcGF0aCA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICB0aGlzLnBhdGggPSBwYXRoO1xufTtcblxuRmlzaC5wcm90b3R5cGUubW92ZSA9IGZ1bmN0aW9uKGRlbHRhX3RpbWUsIGNvbGxpZGFibGVzKSB7XG4gICAgdmFyIHRhcmdldCA9IHRoaXMubmV4dF90YXJnZXQoKTtcblxuICAgIGlmICghdGFyZ2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICB2YXIgZGVsdGFfdmVsb2NpdHkgPSB0aGlzLnNwZWVkICogZGVsdGFfdGltZTtcblxuICAgIC8vcm90YXRlIHRvd2FyZHMgdGFyZ2V0LCB0aGVuIG1vdmUgdG93YXJkcyBpdC5cbiAgICB0aGlzLnBvcy54ICs9IE1hdGguY29zKHRoaXMucm90YXRpb24pICogZGVsdGFfdmVsb2NpdHk7XG4gICAgdGhpcy5wb3MueSArPSBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSAqIGRlbHRhX3ZlbG9jaXR5O1xuXG4gICAgLy9UcmFjZSBhIHJheSB0byBlYWNoIGFuZCB0ZXN0IGlmIHdlJ2QgYmUgdG91Y2hpbmcgYW55IG9mIHRoZW0gYWZ0ZXIgbW92aW5nLlxuXG4gICAgY29sbGlkYWJsZXMuZm9yRWFjaChmdW5jdGlvbihjb2xsaWRhYmxlKSB7XG4gICAgICAgIHRoaXMuY29sbGlkaW5nID0gY29sbGlkYWJsZS5wb3MuZGlzdGFuY2UodGhpcy5wb3MpIDw9IDAgJiYgY29sbGlkYWJsZSAhPT0gdGhpcztcbiAgICB9LmJpbmQodGhpcykpO1xuXG5cbiAgICB2YXIgZGVzaXJlZF9hbmdsZSA9IE1hdGguYXRhbjIodGFyZ2V0LnkgLSB0aGlzLnBvcy55LCB0YXJnZXQueCAtIHRoaXMucG9zLngpO1xuXG4gICAgLy8gdGhpcy5yb3RhdGlvbiA9IGRlc2lyZWRfYW5nbGU7XG4gICAgLy8gdGhpcy5yb3RhdGlvbiAlPSBNYXRoLlBJICogMjtcblxuICAgIHZhciBjd19kaXN0ID0gKCgoZGVzaXJlZF9hbmdsZSAtIHRoaXMucm90YXRpb24pICUgKE1hdGguUEkgKiAyKSkgKyAoTWF0aC5QSSAqIDIpKSAlIChNYXRoLlBJICogMik7XG4gICAgdmFyIGNjd19kaXN0ID0gKCgodGhpcy5yb3RhdGlvbiAtIGRlc2lyZWRfYW5nbGUpICUgKE1hdGguUEkgKiAyKSkgKyAoTWF0aC5QSSAqIDIpKSAlIChNYXRoLlBJICogMik7XG5cbiAgICB2YXIgZGVsdGFfcm90YXRpb24gPSB0aGlzLnJvdGF0aW9uX3NwZWVkICogZGVsdGFfdGltZTtcblxuICAgIGlmIChjd19kaXN0IDwgZGVsdGFfcm90YXRpb24gfHwgY2N3X2Rpc3QgPCBkZWx0YV9yb3RhdGlvbikge1xuICAgICAgICB0aGlzLnJvdGF0aW9uID0gZGVzaXJlZF9hbmdsZTtcbiAgICB9IGVsc2UgaWYgKGN3X2Rpc3QgPiBjY3dfZGlzdCkge1xuICAgICAgICB0aGlzLnJvdGF0aW9uIC09IGRlbHRhX3JvdGF0aW9uO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIHRoaXMucm90YXRpb24gKz0gZGVsdGFfcm90YXRpb247XG4gICAgfVxuXG4gICAgdGhpcy5yb3RhdGlvbiAlPSBNYXRoLlBJICogMjtcbn07XG5cbkZpc2gucHJvdG90eXBlLm5leHRfdGFyZ2V0ID0gZnVuY3Rpb24oKSB7XG4gICAgaWYoIXRoaXMucGF0aCB8fCB0aGlzLnBhdGgubGVuZ3RoID09PSAwKSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgaWYodGhpcy5wYXRoWzBdLmRpc3RhbmNlKHRoaXMucG9zKSA8PSAxMCAmJiB0aGlzLnBhdGgubGVuZ3RoID4gMSkge1xuICAgICAgICB0aGlzLnBhdGguc2hpZnQoKTtcbiAgICB9XG5cblxuICAgIHJldHVybiB0aGlzLnBhdGhbMF07XG59O1xuXG5GaXNoLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMjtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjMDAwMDAwXCI7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLmNvbGxpZGluZyA/IFwiI0FBNzc3N1wiIDogXCIjQUFBQUFBXCI7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMucG9zLngsIHRoaXMucG9zLnksIHRoaXMucmFkaXVzLCAwLCBNYXRoLlBJICogMik7XG4gICAgY29udGV4dC5maWxsKCk7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKHRoaXMucG9zLngsIHRoaXMucG9zLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMucG9zLnggKyBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKSAqIHRoaXMucmFkaXVzICogMS41LCB0aGlzLnBvcy55ICsgTWF0aC5zaW4odGhpcy5yb3RhdGlvbikgKiB0aGlzLnJhZGl1cyAqIDEuNSk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBGaXNoO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIExpbmUocDEsIHAyKSB7XG4gICAgdGhpcy5wMSA9IHAxO1xuICAgIHRoaXMucDIgPSBwMjtcbn1cblxuTGluZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiAodGhpcy5wMS5lcXVhbHMobGluZS5wMSkgJiYgdGhpcy5wMi5lcXVhbHMobGluZS5wMikpIHx8XG4gICAgICAgICh0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSAmJiB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCwgY29sb3IpIHtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3IgfHwgXCIjQUFBQUFBXCI7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLnAxLngsIHRoaXMucDEueSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy5wMi54LCB0aGlzLnAyLnkpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnAxLnRvU3RyaW5nKCkgKyBcIiA9PiBcIiArIHRoaXMucDIudG9TdHJpbmcoKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmhhc2hDb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucDEuaGFzaENvZGUoKSArIHRoaXMucDIuaGFzaENvZGUoKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgaWYgKHRoaXMuZXF1YWxzKGxpbmUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBzMSA9IHRoaXMucDIuc3VidHJhY3QodGhpcy5wMSk7XG4gICAgdmFyIHMyID0gbGluZS5wMi5zdWJ0cmFjdChsaW5lLnAxKTtcblxuICAgIHZhciBzID0gKC1zMS55ICogKHRoaXMucDEueCAtIGxpbmUucDEueCkgKyBzMS54ICogKHRoaXMucDEueSAtIGxpbmUucDEueSkpIC8gKC1zMi54ICogczEueSArIHMxLnggKiBzMi55KTtcbiAgICB2YXIgdCA9IChzMi54ICogKHRoaXMucDEueSAtIGxpbmUucDEueSkgLSBzMi55ICogKHRoaXMucDEueCAtIGxpbmUucDEueCkpIC8gKC1zMi54ICogczEueSArIHMxLnggKiBzMi55KTtcblxuICAgIGlmIChzID49IDAgJiYgcyA8PSAxICYmIHQgPj0gMCAmJiB0IDw9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDEuZXF1YWxzKGxpbmUucDIpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChpc05hTihzKSB8fCBpc05hTih0KSkge1xuICAgICAgICAvL0lmIHRoZXkgc2hhcmUgbm8gcG9pbnRzIHRoZXkgZG9uJ3Qgb3ZlcmxhcC5cbiAgICAgICAgaWYgKCEodGhpcy5wMS5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMS5lcXVhbHMobGluZS5wMikgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMikpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib3VuZGluZ19jb250YWlucyhsaW5lKSB8fCBsaW5lLmJvdW5kaW5nX2NvbnRhaW5zKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vQ29saW5lYXIsIGVpdGhlciB0aGV5IG92ZXJsYXAgb3IgdGhleSBkb24ndC4uLlxuICAgICAgICAvL0lmIHRoZXkgc2hhcmUgb25lIHBvaW50LCB0aGVuIHRoZXkgb3ZlcmxhcCBpZiBhbnkgb2YgdGhlIHBvaW50cyBmYWxscyB3aXRoaW4gdGhlIHJhbmdlIG9mIHRoZSBsaW5lcy5cbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIGJvdGggdGhleSdyZSBlcXVhbCwgd2hpY2ggd2UgY292ZXIgYWJvdmVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5ib3VuZGluZ19jb250YWlucyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgdG9wX2xlZnQgPSBuZXcgUG9pbnQoTWF0aC5taW4odGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1pbih0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuICAgIHZhciBib3R0b21fcmlnaHQgPSBuZXcgUG9pbnQoTWF0aC5tYXgodGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1heCh0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuXG4gICAgcmV0dXJuIGxpbmUucDEuYmV0d2Vlbih0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KSB8fCBsaW5lLnAyLmJldHdlZW4odG9wX2xlZnQsIGJvdHRvbV9yaWdodCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzX2FueSA9IGZ1bmN0aW9uKGxpbmVzKSB7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGxpbmVzW2tdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBQb2ludCh4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xufVxuXG5Qb2ludC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCIoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbn07XG5cblBvaW50LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiB0aGlzLnggPT09IHBvaW50LnggJiYgdGhpcy55ID09PSBwb2ludC55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmZ1enp5RXF1YWxzID0gZnVuY3Rpb24ocG9pbnQsIGVwc2lsb24pIHtcbiAgICByZXR1cm4gTWF0aC5hYnModGhpcy54IC0gcG9pbnQueCkgPCBlcHNpbG9uICYmIE1hdGguYWJzKHRoaXMueSAtIHBvaW50LnkpIDwgZXBzaWxvbjtcbn07XG5cblBvaW50LnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55KTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuc2NhbGFyX3Byb2R1Y3QgPSBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludChjICogdGhpcy54LCBjICogdGhpcy55KTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5jcm9zc19wcm9kdWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2Lng7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuZG90X3Byb2R1Y3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5iZXR3ZWVuID0gZnVuY3Rpb24ocDEsIHAyKSB7XG4gICAgcmV0dXJuIHRoaXMueCA+IHAxLnggJiYgdGhpcy54IDwgcDIueCAmJiB0aGlzLnkgPiBwMS55ICYmIHRoaXMueSA8IHAyLnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh0aGlzLnggLSBwLngsIDIpICsgTWF0aC5wb3codGhpcy55IC0gcC55LCAyKSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvciB8fCBcIiNBQUFBQUFcIjtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5hcmModGhpcy54LCB0aGlzLnksIDEwLCAwLCBNYXRoLlBJICogMik7XG4gICAgY29udGV4dC5maWxsKCk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuaGFzaENvZGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy54ICsgdGhpcy55O1xufTtcblxuZnVuY3Rpb24gVHJpYW5nbGUocDEscDIscDMpIHtcbiAgICB0aGlzLmVkZ2VzID0gW25ldyBMaW5lKHAxLHAyKSwgbmV3IExpbmUocDIscDMpLCBuZXcgTGluZShwMyxwMSldO1xuICAgIHRoaXMubmVpZ2hib3JzID0gW107XG4gICAgdGhpcy5wb2ludHMgPSBbcDEscDIscDNdO1xuICAgIHRoaXMuY29sb3IgPSBnZXRSYW5kb21Db2xvcigpO1xufVxuXG5UcmlhbmdsZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLmdldF9jZW50ZXIoKS5mdXp6eUVxdWFscyh4LmdldF9jZW50ZXIoKSwgMC4wMSk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZ2V0X2NlbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vQ2VudHJvaWQ6XG4gICAgLy9yZXR1cm4gbmV3IFBvaW50KCh0aGlzLnBvaW50c1swXS54ICsgdGhpcy5wb2ludHNbMV0ueCArIHRoaXMucG9pbnRzWzJdLngpIC8gMywgKHRoaXMucG9pbnRzWzBdLnkgKyB0aGlzLnBvaW50c1sxXS55ICsgdGhpcy5wb2ludHNbMl0ueSkgLyAzKTtcblxuICAgIHZhciBhID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMV0pO1xuICAgIHZhciBiID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBjID0gdGhpcy5wb2ludHNbMV0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBwID0gYSArIGIgKyBjO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludCgoYSAqIHRoaXMucG9pbnRzWzJdLnggKyBiICogdGhpcy5wb2ludHNbMV0ueCArIGMgKiB0aGlzLnBvaW50c1swXS54KSAvIHAsIChhICogdGhpcy5wb2ludHNbMl0ueSArIGIgKiB0aGlzLnBvaW50c1sxXS55ICsgYyAqIHRoaXMucG9pbnRzWzBdLnkpIC8gcCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHQuZ2V0X2NlbnRlcigpKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5oYXNoQ29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50c1swXS5oYXNoQ29kZSgpICsgdGhpcy5wb2ludHNbMV0uaGFzaENvZGUoKSArIHRoaXMucG9pbnRzWzJdLmhhc2hDb2RlKCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHAxID0gdGhpcy5wb2ludHNbMF07XG4gICAgdmFyIHAyID0gdGhpcy5wb2ludHNbMV07XG4gICAgdmFyIHAzID0gdGhpcy5wb2ludHNbMl07XG5cbiAgICB2YXIgYWxwaGEgPSAoKHAyLnkgLSBwMy55KSAqIChwLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocC55IC0gcDMueSkpIC9cbiAgICAgICAgKChwMi55IC0gcDMueSkgKiAocDEueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwMS55IC0gcDMueSkpO1xuICAgIHZhciBiZXRhID0gKChwMy55IC0gcDEueSkgKiAocC54IC0gcDMueCkgKyAocDEueCAtIHAzLngpICogKHAueSAtIHAzLnkpKSAvXG4gICAgICAgICgocDIueSAtIHAzLnkpICogKHAxLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocDEueSAtIHAzLnkpKTtcbiAgICB2YXIgZ2FtbWEgPSAxIC0gYWxwaGEgLSBiZXRhO1xuXG4gICAgcmV0dXJuIGFscGhhID4gMCAmJiBiZXRhID4gMCAmJiBnYW1tYSA+IDA7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuaXNfbmVpZ2hib3IgPSBmdW5jdGlvbih0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdC5lZGdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZWRnZXNbaV0uZXF1YWxzKHQuZWRnZXNbal0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmFkZF9uZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLm5laWdoYm9ycy5wdXNoKHQpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmZpbGxfdHJpYW5nbGUgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG5cbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1sxXS54LCB0aGlzLnBvaW50c1sxXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1syXS54LCB0aGlzLnBvaW50c1syXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1swXS54LCB0aGlzLnBvaW50c1swXS55KTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5kcmF3X3dlaWdodHMgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KGQudG9GaXhlZCgwKSwgKHRoaXMuZ2V0X2NlbnRlcigpLnggKyB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueCkgLyAyICsgMTAsICh0aGlzLmdldF9jZW50ZXIoKS55ICsgdGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLnkpIC8gMiArIDEwKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd19lZGdlcyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUFBQUFBXCI7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLmdldF9jZW50ZXIoKS54LCB0aGlzLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLngsIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd192ZXJ0ZXggPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMuZ2V0X2NlbnRlcigpLngsIHRoaXMuZ2V0X2NlbnRlcigpLnksIDgsIDgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xuICAgIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnO1xuICAgIHZhciBjb2xvciA9ICcjJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5Qb2ludCA9IFBvaW50O1xubW9kdWxlLmV4cG9ydHMuTGluZSA9IExpbmU7XG5tb2R1bGUuZXhwb3J0cy5UcmlhbmdsZSA9IFRyaWFuZ2xlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEhhc2hNYXAoKSB7XG4gICAgLy9UT0RPOiBzaG91bGQgYmUgY29uZmlndXJhYmxlIChhbmQgZXhwYW5kYWJsZSlcbiAgICB0aGlzLm51bV9idWNrZXRzID0gMTk7XG4gICAgdGhpcy5idWNrZXRzID0gW107XG59XG5cbkhhc2hNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKCFrZXkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgYnVja2V0ID0gdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXTtcblxuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVja2V0LmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoYnVja2V0LmtleXNbaV0uZXF1YWxzKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiBidWNrZXQudmFsdWVzW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbkhhc2hNYXAucHJvdG90eXBlLmdldEtleSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKCFrZXkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgYnVja2V0ID0gdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXTtcblxuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVja2V0LmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoYnVja2V0LmtleXNbaV0uZXF1YWxzKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiBidWNrZXQua2V5c1tpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5cbkhhc2hNYXAucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAvL1RPRE86IHJlc2l6ZSB0aGUgYnVja2V0cyBpZiBuZWVkIGJlLlxuICAgIHZhciBidWNrZXQgPSB0aGlzLmJ1Y2tldHNbdGhpcy5oYXNoKGtleSldO1xuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgYnVja2V0ID0ge2tleXMgOiBbXSwgdmFsdWVzIDogW119O1xuICAgICAgICB0aGlzLmJ1Y2tldHNbdGhpcy5oYXNoKGtleSldID0gYnVja2V0O1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGJ1Y2tldC5rZXlzLmxlbmd0aDtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBidWNrZXQua2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihidWNrZXQua2V5c1tpXS5lcXVhbHMoa2V5KSkge1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYnVja2V0LmtleXNbaW5kZXhdID0ga2V5O1xuICAgIGJ1Y2tldC52YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG59O1xuXG5IYXNoTWFwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgYnVja2V0ID0gdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXTtcblxuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBidWNrZXQua2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihidWNrZXQua2V5c1tpXS5lcXVhbHMoa2V5KSkge1xuICAgICAgICAgICAgYnVja2V0LmtleXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnVja2V0LnZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICByZXR1cm4gYnVja2V0LmtleXNbaV07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5IYXNoTWFwLnByb3RvdHlwZS5oYXNoID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHZhbC5oYXNoQ29kZSgpICUgdGhpcy5udW1fYnVja2V0cztcbn07XG5cbmZ1bmN0aW9uIEhhc2hTZXQoYXJyKSB7XG4gICAgdGhpcy5tYXAgPSBuZXcgSGFzaE1hcCgpO1xuXG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgaWYoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT09IFwiW29iamVjdCBBcnJheV1cIil7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYWRkKGFycltpXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkhhc2hTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHRoaXMubWFwLnB1dCh2YWwsIHRydWUpO1xuICAgIHRoaXMubGVuZ3RoKys7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMubWFwLmdldEtleSh2YWwpO1xuICAgIGlmKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1hcC5nZXRLZXkodmFsKTtcbiAgICBpZih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufTtcblxuSGFzaFNldC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJlbW92ZWQgPSB0aGlzLm1hcC5yZW1vdmUodmFsKTtcblxuICAgIGlmKHR5cGVvZiByZW1vdmVkICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVtb3ZlZDtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnJlbW92ZV9hbGwgPSBmdW5jdGlvbihhcnIpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKGFycltpXSk7XG4gICAgfVxufTtcblxuSGFzaFNldC5wcm90b3R5cGUudG9fYXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubWFwLmJ1Y2tldHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBpZighdGhpcy5tYXAuYnVja2V0c1tpXSl7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXlzID0gdGhpcy5tYXAuYnVja2V0c1tpXS5rZXlzO1xuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgYXJyLnB1c2goa2V5c1tqXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufTtcblxuSGFzaFNldC5wcm90b3R5cGUuZ2V0X2FueSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcC5idWNrZXRzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgaWYoIXRoaXMubWFwLmJ1Y2tldHNbaV0pe1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5cyA9IHRoaXMubWFwLmJ1Y2tldHNbaV0ua2V5cztcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHJldHVybiBrZXlzW2pdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmZ1bmN0aW9uIFNldE11bHRpTWFwKCkge1xuICAgIHRoaXMubWFwID0gbmV3IEhhc2hNYXAoKTtcbn1cblxuU2V0TXVsdGlNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciB2YWxzID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgaWYoIXZhbHMpIHtcbiAgICAgICAgdGhpcy5tYXAucHV0KGtleSwgW10pO1xuICAgICAgICB2YWxzID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHM7XG59O1xuXG5TZXRNdWx0aU1hcC5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIHZhciB2YWxzID0gdGhpcy5nZXQoa2V5KTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdmFscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZigodmFsc1tpXS5oYXNPd25Qcm9wZXJ0eShcImVxdWFsc1wiKSAmJiB2YWxzW2ldLmVxdWFscyh2YWx1ZSkpIHx8IHZhbHNbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICB2YWxzW2ldID0gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxzLnB1c2godmFsdWUpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2hNYXA7XG5tb2R1bGUuZXhwb3J0cy5IYXNoU2V0ID0gSGFzaFNldDtcbm1vZHVsZS5leHBvcnRzLlNldE11bHRpTWFwID0gU2V0TXVsdGlNYXA7XG4iLCIvKmdsb2JhbCBDT05GSUcgOiB0cnVlICovXG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNhbnZhc1wiKVswXTtcbnZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbkNPTkZJRyA9IHt9O1xuQ09ORklHLkRFQlVHID0gMztcblxuKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgRmlzaCA9IHJlcXVpcmUoJy4vZmlzaC5qcycpO1xuICAgIHZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcbiAgICB2YXIgU2Nob29sID0gcmVxdWlyZSgnLi9zY2hvb2wuanMnKTtcbiAgICB2YXIgT2NlYW4gPSByZXF1aXJlKCcuL29jZWFuLmpzJyk7XG4gICAgdmFyIFJlZWYgPSByZXF1aXJlKCcuL3JlZWYuanMnKTtcbiAgICB2YXIgQ29udHJvbHMgPSByZXF1aXJlKCcuL2NvbnRyb2xzLmpzJyk7XG4gICAgdmFyIE1vdXNlID0gcmVxdWlyZSgnLi9tb3VzZS5qcycpO1xuXG4gICAgdmFyIGNvbnRyb2xzID0gbmV3IENvbnRyb2xzKCk7XG4gICAgY29udHJvbHMuc2xpZGVyKFwiRGVidWc6IFwiLCBDT05GSUcsIFwiREVCVUdcIiwgMCwgMTAsIDEpO1xuXG4gICAgLy9kZWJ1Z2dlcjtcbiAgICB2YXIgb2NlYW4gPSBuZXcgT2NlYW4oY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCBbbmV3IFJlZWYoMzAwLCAxMDAsIDI1MCwgMjAwKV0pO1xuXG4gICAgLy9UT0RPOiBjb250cm9sbGFibGUgc3Bhd25pbmdcblxuICAgIHZhciBzY2hvb2wgPSBuZXcgU2Nob29sKG9jZWFuLCBuZXcgUG9pbnQoNTAwLDUwMCkpO1xuICAgIC8vIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgyMDAsIDEyMCwgMTAsIDAuMjUpKTtcbiAgICAvLyBzY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMjAwLCAxMjAsIDEwLCAwLjIpKTtcbiAgICAvLyBzY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMzAsIDMwMCwgMTAsIDAuNSkpO1xuICAgIC8vIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgxMzAsIDUwMCwgMjAsIDAuMDUpKTtcbiAgICAvLyBzY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMjMwLCAxNTAsIDIwLCAwLjEpKTtcbiAgICAvLyBzY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMjMwLCAxNTAsIDIwLCAwLjE1KSk7XG4gICAgc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDYwMCwgNjAwLCAyMCwgMC4yKSk7XG5cbiAgICB2YXIgbW91c2UgPSBuZXcgTW91c2Uoc2Nob29sLCBvY2VhbiwgY2FudmFzKTtcbiAgICBjb250cm9scy5yYWRpbyhcIk1vZGU6IFwiLCBtb3VzZSwgXCJtb2RlXCIsIG1vdXNlLm1vZGVzKTtcblxuICAgIHZhciBwcmV2aW91c190aW1lO1xuICAgIHZhciB3YXNfaGlkZGVuID0gZmFsc2U7XG4gICAgdmFyIHBsYXlpbmcgPSB0cnVlO1xuXG4gICAgZG9jdW1lbnQuc2hvd2luZyA9IHRydWU7XG5cbiAgICBmdW5jdGlvbiBzdGVwKHQpIHtcbiAgICAgICAgaWYgKHBsYXlpbmcgJiYgZG9jdW1lbnQuc2hvd2luZykge1xuICAgICAgICAgICAgdmFyIHRpbWVfZGVsdGEgPSBwcmV2aW91c190aW1lID09PSB1bmRlZmluZWQgPyAwIDogdCAtIHByZXZpb3VzX3RpbWU7XG5cbiAgICAgICAgICAgIGlmICh3YXNfaGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgdGltZV9kZWx0YSA9IDA7XG4gICAgICAgICAgICAgICAgd2FzX2hpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY2hvb2wuZmlzaC5mb3JFYWNoKGZ1bmN0aW9uKGZpc2gpIHtcbiAgICAgICAgICAgICAgICBmaXNoLm1vdmUodGltZV9kZWx0YSwgc2Nob29sLmZpc2gpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuXG4gICAgICAgIG9jZWFuLmRyYXcoY29udGV4dCk7XG4gICAgICAgIHNjaG9vbC5kcmF3KGNvbnRleHQpO1xuXG4gICAgICAgIG1vdXNlLmRyYXcoY29udGV4dCk7XG5cbiAgICAgICAgcHJldmlvdXNfdGltZSA9IHQ7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgICAgICAgICB3YXNfaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHtcbiAgICAgICAgICAgIHBsYXlpbmcgPSAhcGxheWluZztcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgc3RlcCgpO1xufSkoKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgT2NlYW4gPSByZXF1aXJlKCcuL29jZWFuLmpzJyk7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG52YXIgUmVlZiA9IHJlcXVpcmUoJy4vcmVlZi5qcycpO1xuXG5mdW5jdGlvbiBNb3VzZShzY2hvb2wsIG9jZWFuLCBjYW52YXMpIHtcbiAgICB0aGlzLnNjaG9vbCA9IHNjaG9vbDtcbiAgICB0aGlzLm9jZWFuID0gb2NlYW47XG4gICAgdGhpcy5tb2RlID0gXCJ0YXJnZXRcIjtcbiAgICB0aGlzLm1vZGVzID0gW1widGFyZ2V0XCIsIFwiY3JlYXRlXCIsIFwiZGVsZXRlXCJdO1xuICAgIHRoaXMucCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHZhciBwID0gbmV3IFBvaW50KGUuY2xpZW50WCAtIHJlY3QubGVmdCwgZS5jbGllbnRZIC0gcmVjdC50b3ApO1xuICAgICAgICB0aGlzW3RoaXMubW9kZV0ocCk7XG4gICAgfS5iaW5kKHRoaXMpLCBmYWxzZSk7XG5cbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbW92ZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB0aGlzLnAgPSBuZXcgUG9pbnQoZS5jbGllbnRYIC0gcmVjdC5sZWZ0LCBlLmNsaWVudFkgLSByZWN0LnRvcCk7XG4gICAgfS5iaW5kKHRoaXMpKTtcbn1cblxuTW91c2UucHJvdG90eXBlLnRhcmdldCA9IGZ1bmN0aW9uKHApIHtcbiAgICB0aGlzLnNjaG9vbC5zZXRfdGFyZ2V0KHApO1xufTtcblxuTW91c2UucHJvdG90eXBlLmRlbGV0ZSA9IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgcmVlZiA9IHRoaXMub2NlYW4uZ2V0X3JlZWZfdW5kZXJfcG9pbnQocCk7XG4gICAgaWYgKHJlZWYpIHtcbiAgICAgICAgdGhpcy5vY2Vhbi5kZWxldGVfcmVlZihyZWVmKTtcbiAgICB9XG59O1xuXG5Nb3VzZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBpZiAodGhpcy5tb2RlID09PSBcImNyZWF0ZVwiICYmIHRoaXMucDEpIHtcbiAgICAgICAgLy9UT0RPOiBDcmVhdGUgYSBmdW5jdGlvbiBvdXQgb2YgdGhpcy5cbiAgICAgICAgdmFyIHRvcF9sZWZ0ID0gbmV3IFBvaW50KE1hdGgubWluKHRoaXMucDEueCwgdGhpcy5wLngpLCBNYXRoLm1pbih0aGlzLnAxLnksIHRoaXMucC55KSk7XG4gICAgICAgIHZhciBib3R0b21fcmlnaHQgPSBuZXcgUG9pbnQoTWF0aC5tYXgodGhpcy5wMS54LCB0aGlzLnAueCksIE1hdGgubWF4KHRoaXMucDEueSwgdGhpcy5wLnkpKTtcbiAgICAgICAgdmFyIGRpbWVucyA9IGJvdHRvbV9yaWdodC5zdWJ0cmFjdCh0b3BfbGVmdCk7XG4gICAgICAgIGNvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoMTAwLDEwMCwxMDAsMC41KSc7XG4gICAgICAgIGNvbnRleHQuZmlsbFJlY3QodG9wX2xlZnQueCwgdG9wX2xlZnQueSwgZGltZW5zLngsIGRpbWVucy55KTtcbiAgICB9XG59O1xuXG4vL1RPRE86IGNyZWF0ZSByZXZlcnNlIHdhdGNoYWJsZSB2YXJpYWJsZXMsIHJldHVybiBhIGZ1bmN0aW9uIGZyb20gY29udHJvbHMsIHdoZW4gdGhlIGZ1bmNpdG9uIGlzIGNhbGxlZCBpdCB1c2VzIGEgY2xvc3VyZSB0byB1cGRhdGUgdGhlIHZhbHVlIGFuZCBnZXRzIHRoZSB2YWx1ZVxuLy9UT0RPOiBidWcgd2hlcmUgcG9pbnQxIGlzbid0IHJlc2V0IG9uIGNoYW5naW5nIG1vZGVzXG5Nb3VzZS5wcm90b3R5cGUuY3JlYXRlID0gZnVuY3Rpb24ocDIpIHtcbiAgICBpZiAoIXRoaXMucDEpIHtcbiAgICAgICAgdGhpcy5wMSA9IHAyO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vVE9ETzogZWl0aGVyIGRlYWwgd2l0aCBvdmVybGFwcGluZyByZWVmcyBvciBkb24ndCBhbGxvdyB0aGVtLlxuICAgICAgICB2YXIgdG9wX2xlZnQgPSBuZXcgUG9pbnQoTWF0aC5taW4odGhpcy5wMS54LCBwMi54KSwgTWF0aC5taW4odGhpcy5wMS55LCBwMi55KSk7XG4gICAgICAgIHZhciBib3R0b21fcmlnaHQgPSBuZXcgUG9pbnQoTWF0aC5tYXgodGhpcy5wMS54LCBwMi54KSwgTWF0aC5tYXgodGhpcy5wMS55LCBwMi55KSk7XG4gICAgICAgIHZhciBkaW1lbnMgPSBib3R0b21fcmlnaHQuc3VidHJhY3QodG9wX2xlZnQpO1xuICAgICAgICB0aGlzLm9jZWFuLmFkZF9yZWVmKG5ldyBSZWVmKHRvcF9sZWZ0LngsIHRvcF9sZWZ0LnksIGRpbWVucy54LCBkaW1lbnMueSkpO1xuXG4gICAgICAgIGRlbGV0ZSB0aGlzLnAxO1xuICAgIH1cblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBNb3VzZTtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFJlZWYgPSByZXF1aXJlKCcuL3JlZWYuanMnKTtcbnZhciBMaW5lID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLkxpbmU7XG52YXIgVHJpYW5nbGUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuVHJpYW5nbGU7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG52YXIgVHJpYW5ndWxhdGlvbiA9IHJlcXVpcmUoJy4vdHJpYW5ndWxhdGlvbi5qcycpO1xudmFyIFN0YXRzID0gcmVxdWlyZSgnLi9zdGF0cy5qcycpO1xuXG5mdW5jdGlvbiBPY2Vhbih3aWR0aCwgaGVpZ2h0LCByZWVmcykge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcbiAgICB0aGlzLnJlZWZzID0gcmVlZnM7XG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59XG5cbi8vVE9ETzogY3JlYXRlIGEgdHJpYW5ndWxhdGlvbiBmb3IgZXZlcnkgc2l6ZSBvZiBmaXNoIChqdXN0IGV4cGFuZCB0aGUgd2lkdGgsaGVpZ2h0IGFuZCB0b3BsZWZ0IHBvaW50cyBieSB0aGUgcmFkaXVzLikgUHJvYmFibHkgYSB3YXkgd2UgY2FuIHJldXNlIG1vc3Qgb2YgdGhlIHRyaWFuZ3VsYXRpb24uXG4vL1RPRE86IG92ZXJsYXBwaW5nIHJlZWZzIGNhdXNlICBhYnVnLCBjb21iaW5lIHRoZW0gaW50byBwb2x5Z29ucyB3aXRoIGNvbnN0cmFpbnRzIGFuZCB1c2UgdGhvc2UgaW5zdGVhZFxuLy9UT0RPOiBjcmVhdGUgYSBjb252ZXggaHVsbCwgdGhlbiByZW1vdmUgcG9pbnRzIGluc2lkZSAoZ2lmdCB3cmFwcGluZyBhbGdvKSwgdGhlbiBkZXRlcm1pbmUgaG93IHRvIGNyZWF0ZSBhIGNvbnN0cmlhbnQgZnJvbSB0aGF0LFxuLy9UT0RPOiBtYXliZSBqdXN0IHRyaWFuZ3VsYXRlIHRoZSBwb2ludHMgZmlyc3QsIHRoZW4gdXNlIHRoYXQgdHJpYW5ndWxhdGlvbiBhcyB0aGUgY29uc3RyYWludHMuIEdlbml1cy5cblxuLy9UT0RPOiByZW1vdmUgaW5uZXIgcG9pbnRzICgzIGNhc2VzLCBhbGwgcG9pbnRzLCAyIHBvaW50cywgMSBwb2ludCkgYW5kIHRoZW4gYWRkIG5ldyBwb2ludHMgYXQgaW50ZXJzZWN0aW9ucy5cbi8vIFRoZSBvbGQgZGlhZ29uYWxzIGNhbiBzdGlsbCBiZSB1c2VkIGFzIGNvbnN0cmFpbnRzIEkgdGhpbmssIGJ1dCBuZXcgb3V0ZXIgbGluZXMgbmVlZCB0byBiZSBtYWRlIHdoZXJlIHRoZSBpbnRlcnNlY3Rpb25zIGFyZS5cblxuT2NlYW4ucHJvdG90eXBlLnJldHJpYW5ndWxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgU3RhdHMuc3RhcnQoXCJyZXRyaWFuZ3VsYXRlXCIpO1xuICAgIHRoaXMudHJpYW5ndWxhdGlvbiA9IG5ldyBUcmlhbmd1bGF0aW9uKHRoaXMuZ2V0X3BvaW50cygpLCB0aGlzLmdldF9saW5lcygpLCB0aGlzLmdldF9kaWFncygpKTtcbiAgICBTdGF0cy5maW5pc2goXCJyZXRyaWFuZ3VsYXRlXCIpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfcGF0aF90byA9IGZ1bmN0aW9uKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICBTdGF0cy5zdGFydChcImdldF9wYXRoX3RvXCIpO1xuICAgIHZhciBwYXRoID0gdGhpcy50cmlhbmd1bGF0aW9uLmZpbmRfcGF0aChzdGFydF9wb2ludCwgZW5kX3BvaW50KTtcbiAgICBTdGF0cy5maW5pc2goXCJnZXRfcGF0aF90b1wiKTtcbiAgICByZXR1cm4gcGF0aDtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfcmVlZl91bmRlcl9wb2ludCA9IGZ1bmN0aW9uKHApIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZih0aGlzLnJlZWZzW2ldLmNvbnRhaW5zKHApKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWVmc1tpXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfcG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IG5ldyBSZWVmKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfcG9pbnRzKCk7XG5cbiAgICB0aGlzLnJlZWZzLmZvckVhY2goZnVuY3Rpb24ocmVlZikge1xuICAgICAgICB2YXIgcHMgPSByZWVmLmdldF9wb2ludHMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcG9pbnRzLnB1c2gocHNbaV0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIGlmKGEueCA9PSBiLngpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnkgPiBiLnk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYS54ID4gYi54O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHBvaW50cztcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfbGluZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGluZXMgPSBuZXcgUmVlZigwLDAsdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9saW5lcygpO1xuXG4gICAgZnVuY3Rpb24gYWRkKGxpbmUpIHtsaW5lcy5wdXNoKGxpbmUpO31cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVlZnNbaV0uZ2V0X2xpbmVzKCkuZm9yRWFjaChhZGQpO1xuICAgIH1cblxuICAgIHJldHVybiBsaW5lcztcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfbGluZXNfb3ZlcmxhcHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGluZXMgPSBuZXcgUmVlZigwLDAsdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9saW5lcygpO1xuICAgIHZhciBwb2ludHMgPSBuZXcgUmVlZigwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X3BvaW50cygpO1xuICAgIHZhciBjb25zdHJhaW50cyA9IFtdO1xuXG4gICAgdmFyIHBvbHlnb25zID0gW107XG5cbiAgICAvKlxuICAgICAgICBXZSBjcmVhdGUgYSBsaXN0IG9mIHBvbHlnb25zLCB0aGVuIHdlIHRlc3QgaWYgZWFjaCByZWVmIGludGVyc2VjdHMgYW55IG9mIHRob3NlIHBvbHlnb25zLFxuICAgICAgICBpZiBub3QgdGhhdCByZWVmIGJlY29tZXMgYSBwb2x5Z29uLiBpZiBpdCBpbnRlcmVzZWN0cywgdGhlbiB3ZSBmaW5kIHRoZSBpbnRlcnNlY3Rpb24sIGFkZCB0aGUgbGluZXMgYW5kIHBvaW50c1xuICAgICAgICB0byB0aGUgcG9seWdvbi4gKGFuZCB0aGUgY29uc3RyYWludHMgdG8gdGhlIHdob2xlIHRoaW5nKS5cblxuICAgICAgICAvL1RPRE86IHdoYXQgYWJvdXQgaG9sZXMsIG9yIHRvdGFsIHBvbHlnb24gZW5jbG9zdXJlXG4gICAgICAgIC8vVE9ETzogd2hhdCBhYm91dCByZWVmcyBpbnRlcnNlY3Rpbmcgd2l0aCBtdWx0aXBsZSBwb2x5Z29ucy5cblxuICAgICAgICAvL3RoaXMgc2VlbXMgbGlrZSBhIHJlY3Vyc2l2ZSBzb2x1dGlvbiB3b3VsZCB3b3JrIGhlcmUuLi5cblxuICAgICovXG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgaW50ZXJzZWN0aW9uX3BvaW50cyA9IFtdO1xuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwgcG9seWdvbnMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGludGVyc2VjdGlvbl9wb2ludHMgPSBwb2x5Z29uc1tqXS5nZXRfaW50ZXJzZWN0aW9uX3BvaW50cyh0aGlzLnJlZWZzW2ldKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgICAgIC8vVE9ETzogZ28gdGhyb3VnaCBhbGwgdGhlIHBvaW50cywgcmVtb3ZlIHRoZSBvbmVzIHRoYXQgZmFsbCBpbnNpZGUgYW5vdGhlciBzcXVhcmVcblxuICAgICAgICAvL1RPRE86IHNvcnQgdGhlIHBvaW50cy4gc3RhcnQgYXQgdG9wIGxlZnQsIHRoZW4gZ28gZG93biwgcmVtb3ZpbmcgdGhlbSBhcyB5b3UgZ28uIFRlbiBnbyBmcm9tIHJpZ2h0IHRvIGxlZnQuXG5cbiAgICByZXR1cm4gbGluZXM7XG59O1xuXG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfZGlhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWVmcy5tYXAoZnVuY3Rpb24ocikge3JldHVybiByLmdldF9kaWFnb25hbCgpO30pO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmFkZF9yZWVmID0gZnVuY3Rpb24ocmVlZikge1xuICAgIHRoaXMucmVlZnMucHVzaChyZWVmKTtcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5kZWxldGVfcmVlZiA9IGZ1bmN0aW9uKHJlZWYpIHtcbiAgICB0aGlzLnJlZWZzLnNwbGljZSh0aGlzLnJlZWZzLmluZGV4T2YocmVlZiksIDEpO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgdGhpcy5yZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKHJlZWYpIHtcbiAgICAgICAgcmVlZi5kcmF3KGNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy50cmlhbmd1bGF0aW9uLmRyYXcoY29udGV4dCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9jZWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VvbWV0cnkgPSByZXF1aXJlKFwiLi9nZW9tZXRyeS5qc1wiKTtcbnZhciBQb2ludCA9IGdlb21ldHJ5LlBvaW50O1xudmFyIExpbmUgPSBnZW9tZXRyeS5MaW5lO1xuXG5mdW5jdGlvbiBSZWVmKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5wb2ludHMgPSBbbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KSwgbmV3IFBvaW50KHRoaXMueCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgMCldO1xufVxuXG5SZWVmLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjQUE1NTU1XCI7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfcG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRzO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2xpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIFtuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1sxXSksIG5ldyBMaW5lKHBvaW50c1sxXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUocG9pbnRzWzJdLCBwb2ludHNbM10pLCBuZXcgTGluZShwb2ludHNbM10sIHBvaW50c1swXSldO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2RpYWdvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIG5ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9kaWFnb25hbHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRfcG9pbnRzKCk7XG5cbiAgICByZXR1cm4gW25ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKV07XG59O1xuXG5SZWVmLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBkaWFnMSA9IG5ldyBMaW5lKHRoaXMucG9pbnRzWzBdLCB0aGlzLnBvaW50c1syXSk7XG4gICAgdmFyIGRpYWcyID0gbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKTtcblxuICAgIHJldHVybiBkaWFnMS5pbnRlcnNlY3RzKGxpbmUpIHx8ICBkaWFnMi5pbnRlcnNlY3RzKGxpbmUpO1xufTtcblxuUmVlZi5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHAueCA+PSB0aGlzLnggJiYgcC55ID49IHRoaXMueSAmJiBwLnggPD0gdGhpcy54ICsgdGhpcy53aWR0aCAmJiBwLnkgPD0gdGhpcy55ICsgdGhpcy5oZWlnaHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZWY7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gU2Nob29sKG9jZWFuLCB0YXJnZXQpIHtcbiAgICB0aGlzLmZpc2ggPSBbXTtcbiAgICB0aGlzLm9jZWFuID0gb2NlYW47XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG59XG5cblNjaG9vbC5wcm90b3R5cGUuYWRkX2Zpc2ggPSBmdW5jdGlvbihmaXNoKSB7XG4gICAgdGhpcy5maXNoLnB1c2goZmlzaCk7XG4gICAgZmlzaC5zZXRfcGF0aCh0aGlzLm9jZWFuLmdldF9wYXRoX3RvKGZpc2gucG9zLCB0aGlzLnRhcmdldCkpO1xufTtcblxuU2Nob29sLnByb3RvdHlwZS5zZXRfdGFyZ2V0ID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmZpc2hbaV0uc2V0X3BhdGgodGhpcy5vY2Vhbi5nZXRfcGF0aF90byh0aGlzLmZpc2hbaV0ucG9zLCB0YXJnZXQpKTtcbiAgICB9XG59O1xuXG5TY2hvb2wucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgdGhpcy5maXNoLmZvckVhY2goZnVuY3Rpb24oZmlzaCkge1xuICAgICAgICBmaXNoLmRyYXcoY29udGV4dCk7XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gNTtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUEzMzMzXCI7XG4gICAgY29udGV4dC5hcmModGhpcy50YXJnZXQueCwgdGhpcy50YXJnZXQueSwgMTUsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2hvb2w7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIFN0YXRzID0ge1xuICAgIHN0YXJ0IDoge30sXG4gICAgdmFsdWVzIDoge31cbn07XG5cblN0YXRzLnN0YXJ0ID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICB0aGlzLnN0YXJ0W25hbWVdID0gK25ldyBEYXRlKCk7XG59O1xuXG5TdGF0cy5maW5pc2ggPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgdGhpcy5hZGRfdmFsdWUobmFtZSwgK25ldyBEYXRlKCkgLSB0aGlzLnN0YXJ0W25hbWVdKTtcbn07XG5cblN0YXRzLmFkZF92YWx1ZSA9IGZ1bmN0aW9uKG5hbWUsIHZhbHVlKSB7XG4gICAgaWYoIXRoaXMudmFsdWVzLmhhc093blByb3BlcnR5KG5hbWUpKSB7XG4gICAgICAgIHRoaXMudmFsdWVzW25hbWVdID0gW107XG4gICAgfVxuXG4gICAgdGhpcy52YWx1ZXNbbmFtZV0ucHVzaCh2YWx1ZSk7XG59O1xuXG5TdGF0cy5nZXRfdmFsdWVzID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLnZhbHVlc1tuYW1lXTtcbn07XG5cblN0YXRzLmF2ZXJhZ2UgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X3ZhbHVlcyhuYW1lKS5yZWR1Y2UoZnVuY3Rpb24oc3VtLCB2YWx1ZSkge3JldHVybiBzdW0gKyB2YWx1ZTt9KSAvIHRoaXMuZ2V0X3ZhbHVlcyhuYW1lKS5sZW5ndGg7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFN0YXRzO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBMaW5lID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLkxpbmU7XG52YXIgVHJpYW5nbGUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuVHJpYW5nbGU7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG52YXIgSGFzaE1hcCA9IHJlcXVpcmUoJy4vaGFzaG1hcC5qcycpO1xudmFyIFNldE11bHRpTWFwID0gcmVxdWlyZSgnLi9oYXNobWFwLmpzJykuU2V0TXVsdGlNYXA7XG52YXIgSGFzaFNldCA9IHJlcXVpcmUoJy4vaGFzaG1hcC5qcycpLkhhc2hTZXQ7XG5cbmZ1bmN0aW9uIFRyaWFuZ3VsYXRpb24ocG9pbnRzLCBjb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSB7XG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgdGhpcy5jb25zdHJhaW50cyA9IGNvbnN0cmFpbnRzO1xuICAgIHZhciB0cmlhbmd1bGF0ZWQgPSB0aGlzLnRyaWFuZ3VsYXRlKHBvaW50cywgdGhpcy5jb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKTtcblxuICAgIHRoaXMubGluZXMgPSB0cmlhbmd1bGF0ZWQubGluZXM7XG4gICAgdGhpcy5ncmFwaCA9IHRoaXMuYnVpbGRfZ3JhcGgodGhpcy5saW5lcywgdHJpYW5ndWxhdGVkLmVkZ2VzLCBjb25zdHJhaW50cyk7XG5cbn1cblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUudHJpYW5ndWxhdGUgPSBmdW5jdGlvbihwb2ludHMsIGNvbnN0cmFpbnRzLCByZW1vdmFibGVfY29uc3RyYWludHMpIHtcbiAgICAvL1RPRE86IG1ha2UgdGhlIHRyaWFuZ3VsYXRpb24gZGVsdWFudWF5XG4gICAgdmFyIGVkZ2VzID0gbmV3IFNldE11bHRpTWFwKCk7XG5cbiAgICB2YXIgbGluZXMgPSBjb25zdHJhaW50cy5zbGljZSgpO1xuXG4gICAgZm9yKHZhciBrID0gMDsgayA8IGNvbnN0cmFpbnRzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIHZhciBsID0gY29uc3RyYWludHNba107XG4gICAgICAgIGVkZ2VzLnB1dChsLnAxLCBsLnAyKTtcbiAgICAgICAgZWRnZXMucHV0KGwucDIsIGwucDEpO1xuICAgIH1cblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IHBvaW50cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdmFyIHBvc3NpYmxlX2xpbmUgPSBuZXcgTGluZShwb2ludHNbaV0sIHBvaW50c1tqXSk7XG4gICAgICAgICAgICB2YXIgdmFsaWQgPSB0cnVlO1xuICAgICAgICAgICAgaWYgKCFwb3NzaWJsZV9saW5lLmludGVyc2VjdHNfYW55KGxpbmVzKSAmJiAhcG9zc2libGVfbGluZS5pbnRlcnNlY3RzX2FueShyZW1vdmFibGVfY29uc3RyYWludHMpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChwb3NzaWJsZV9saW5lKTtcbiAgICAgICAgICAgICAgICBlZGdlcy5wdXQocG9pbnRzW2ldLCBwb2ludHNbal0pO1xuICAgICAgICAgICAgICAgIGVkZ2VzLnB1dChwb2ludHNbal0sIHBvaW50c1tpXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBsaW5lczogbGluZXMsXG4gICAgICAgIGVkZ2VzOiBlZGdlc1xuICAgIH07XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5idWlsZF9ncmFwaCA9IGZ1bmN0aW9uKGxpbmVzLCBjb25uZWN0cywgY29uc3RyYWludHMpIHtcbiAgICAvL1RPRE86IG5ldmVyIHRyYXZlcnNlIHRoZSBjb25zdHJhaW50cyAoZXNwZWNpYWxseSBub3QgdGhlIG91dGVyIG9uZXMpXG5cbiAgICB2YXIgZ3JhcGggPSBbXTtcblxuICAgIGxpbmVzID0gbmV3IEhhc2hTZXQobGluZXMpO1xuXG5cbiAgICB2YXIgY2hlY2tlZCA9IG5ldyBIYXNoU2V0KCk7XG4gICAgdmFyIHRyaWFuZ2xlcyA9IG5ldyBIYXNoU2V0KCk7XG4gICAgdmFyIHRyaWFuZ2xlc19ieV9lZGdlcyA9IG5ldyBTZXRNdWx0aU1hcCgpO1xuICAgIHZhciB0b19jaGVjayA9IFtsaW5lcy5nZXRfYW55KCldO1xuICAgIC8vYWRkIGFuIGVkZ2UuXG4gICAgdmFyIGNvbnRleHQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImNhbnZhc1wiKVswXS5nZXRDb250ZXh0KFwiMmRcIik7XG5cbiAgICBmb3IodmFyIGwgPSAwOyBsIDwgY29uc3RyYWludHMubGVuZ3RoOyBsKyspe1xuICAgICAgICBsaW5lcy5yZW1vdmUoY29uc3RyYWludHNbbF0pO1xuICAgICAgICBjaGVja2VkLmFkZChjb25zdHJhaW50c1tsXSk7XG4gICAgfVxuXG4gICAgd2hpbGUgKHRvX2NoZWNrLmxlbmd0aCB8fCBsaW5lcy5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGNoZWNraW5nO1xuICAgICAgICBpZiAodG9fY2hlY2subGVuZ3RoKSB7XG4gICAgICAgICAgICBjaGVja2luZyA9IHRvX2NoZWNrLnBvcCgpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY2hlY2tpbmcgPSBsaW5lcy5nZXRfYW55KCk7XG4gICAgICAgICAgICBpZighY2hlY2tpbmcpe1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY2hlY2tlZC5hZGQoY2hlY2tpbmcpO1xuICAgICAgICBsaW5lcy5yZW1vdmUoY2hlY2tpbmcpO1xuXG4gICAgICAgIHZhciBwMV9uZWlnaGJvcnMgPSBjb25uZWN0cy5nZXQoY2hlY2tpbmcucDEpOyAvL2FsbCBuZWlnaGJvdXJzIHAxXG4gICAgICAgIHZhciBwMl9uZWlnaGJvcnMgPSBjb25uZWN0cy5nZXQoY2hlY2tpbmcucDIpO1xuICAgICAgICB2YXIgc2hhcmVkX3BvaW50cyA9IHRoaXMuZHVwbGljYXRlZChwMV9uZWlnaGJvcnMuY29uY2F0KHAyX25laWdoYm9ycykpO1xuXG4gICAgICAgIHZhciB0cyA9IFtdO1xuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgc2hhcmVkX3BvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIHAzID0gc2hhcmVkX3BvaW50c1tpXTtcbiAgICAgICAgICAgIHZhciB0ID0gbmV3IFRyaWFuZ2xlKGNoZWNraW5nLnAxLCBjaGVja2luZy5wMiwgcDMpO1xuICAgICAgICAgICAgdmFyIHAxcDJwMyA9IHRyaWFuZ2xlcy5nZXQodCk7XG5cbiAgICAgICAgICAgIHQuZmlsbF90cmlhbmdsZShjb250ZXh0KTtcbiAgICAgICAgICAgIGNoZWNraW5nLmRyYXcoY29udGV4dCk7XG5cbiAgICAgICAgICAgIGlmICghcDFwMnAzKSB7XG4gICAgICAgICAgICAgICAgcDFwMnAzID0gdDtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZXMuYWRkKHAxcDJwMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwMXAzID0gbmV3IExpbmUoY2hlY2tpbmcucDEsIHAzKTtcblxuICAgICAgICAgICAgdHJpYW5nbGVzX2J5X2VkZ2VzLnB1dChjaGVja2luZywgcDFwMnAzKTtcblxuICAgICAgICAgICAgaWYgKCFjaGVja2VkLmNvbnRhaW5zKHAxcDMpKSB7XG4gICAgICAgICAgICAgICAgdG9fY2hlY2sucHVzaChwMXAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHAycDMgPSBuZXcgTGluZShjaGVja2luZy5wMiwgcDMpO1xuICAgICAgICAgICAgaWYgKCFjaGVja2VkLmNvbnRhaW5zKHAycDMpKSB7XG4gICAgICAgICAgICAgICAgdG9fY2hlY2sucHVzaChwMnAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdHMucHVzaChwMXAycDMpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy9UT0RPOiBjb3VsZCBwcm9iYWJseSBkbyB0aGlzIGlubGluZSAobGlrZSBpbiB0aGUgZm9yIGxvb3BzKVxuICAgIHZhciB0cmlhbmdsZV9hcnIgPSB0cmlhbmdsZXMudG9fYXJyYXkoKTtcbiAgICBmb3IodmFyIGogPSAwOyBqIDwgdHJpYW5nbGVfYXJyLmxlbmd0aDsgaisrKSB7XG4gICAgICAgIHZhciB0cmlhbmdsZSA9IHRyaWFuZ2xlX2FycltqXTtcbiAgICAgICAgdmFyIG5laWdoYnMgPSB0cmlhbmdsZXNfYnlfZWRnZXMuZ2V0KHRyaWFuZ2xlLmVkZ2VzWzBdKVxuICAgICAgICAgICAgLmNvbmNhdCh0cmlhbmdsZXNfYnlfZWRnZXMuZ2V0KHRyaWFuZ2xlLmVkZ2VzWzFdKVxuICAgICAgICAgICAgLmNvbmNhdCh0cmlhbmdsZXNfYnlfZWRnZXMuZ2V0KHRyaWFuZ2xlLmVkZ2VzWzJdKSkpO1xuXG4gICAgICAgIGZvcih2YXIgayA9IDA7IGsgPCBuZWlnaGJzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICBpZighbmVpZ2hic1trXS5lcXVhbHModHJpYW5nbGUpKSB7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGUuYWRkX25laWdoYm9yKG5laWdoYnNba10pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHRyaWFuZ2xlX2Fycjtcbn07XG5cbi8vIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbi8vICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCBsaW5lcy5sZW5ndGg7IGorKykge1xuLy8gICAgICAgICBmb3IgKHZhciBrID0gaiArIDE7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuLy8gICAgICAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMudW5pcXVlKGxpbmVzW2ldLnAxLCBsaW5lc1tpXS5wMiwgbGluZXNbal0ucDEsIGxpbmVzW2pdLnAyLCBsaW5lc1trXS5wMSwgbGluZXNba10ucDIpO1xuLy8gICAgICAgICAgICAgaWYgKHBvaW50cy5sZW5ndGggPT09IDMpIHtcbi8vICAgICAgICAgICAgICAgICB2YXIgdHJpYW5nbGUgPSBuZXcgVHJpYW5nbGUobGluZXNbaV0sIGxpbmVzW2pdLCBsaW5lc1trXSwgcG9pbnRzKTtcbi8vXG4vLyAgICAgICAgICAgICAgICAgZm9yICh2YXIgbCA9IDA7IGwgPCBncmFwaC5sZW5ndGg7IGwrKykge1xuLy8gICAgICAgICAgICAgICAgICAgICBpZiAoZ3JhcGhbbF0uaXNfbmVpZ2hib3IodHJpYW5nbGUpKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZS5hZGRfbmVpZ2hib3IoZ3JhcGhbbF0pO1xuLy8gICAgICAgICAgICAgICAgICAgICAgICAgZ3JhcGhbbF0uYWRkX25laWdoYm9yKHRyaWFuZ2xlKTtcbi8vICAgICAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgIH1cbi8vICAgICAgICAgICAgICAgICBncmFwaC5wdXNoKHRyaWFuZ2xlKTtcbi8vICAgICAgICAgICAgIH1cbi8vICAgICAgICAgfVxuLy8gICAgIH1cbi8vIH1cbi8vXG4vLyByZXR1cm4gZ3JhcGg7XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmdldF9jbG9zZXN0X3RyaWFuZ2xlID0gZnVuY3Rpb24ocCkge1xuICAgIHZhciBtaW5fZCA9IEluZmluaXR5O1xuICAgIHZhciBtaW47XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmdyYXBoW2ldLmdldF9jZW50ZXIoKS5kaXN0YW5jZShwKTtcbiAgICAgICAgaWYgKGQgPCBtaW5fZCAmJiAhdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHAsIHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpKSkpIHtcbiAgICAgICAgICAgIG1pbl9kID0gZDtcbiAgICAgICAgICAgIG1pbiA9IHRoaXMuZ3JhcGhbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWluO1xufTtcblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmZpbmRfcGF0aCA9IGZ1bmN0aW9uKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICAvL1RPRE86IEl0J3Mgbm90IG9wdGltYWwgYmVjYXVzZSBJIGNhbiByZWR1Y2UgcGF0aHMgdXNpbmcgbXkgYWxnb3JpdGhtLCBidXQgZGprc3RyYXMgZG9lc24ndCBkbyB0aGF0LmNhbiBJIGFjdHVhbGx5IHJlZHVjZSB0aGUgZ3JhcGggYmVmb3JlIEkgcnVuIGRqa3N0cmFzP1xuICAgIHZhciBzdGFydCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoc3RhcnRfcG9pbnQpO1xuICAgIHZhciBlbmQgPSB0aGlzLmdldF9jbG9zZXN0X3RyaWFuZ2xlKGVuZF9wb2ludCk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuZ3JhcGgubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZ3JhcGhbal0uZDtcbiAgICAgICAgZGVsZXRlIHRoaXMuZ3JhcGhbal0ucHJldjtcbiAgICB9XG5cbiAgICBpZiAoIWVuZCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW3N0YXJ0XTtcbiAgICBzdGFydC5kID0gMDtcbiAgICBzdGFydC5ub2RlID0gdW5kZWZpbmVkO1xuXG4gICAgZnVuY3Rpb24gZGlzdGFuY2VDb21wYXJhdG9yKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuZCA+IGIuZDtcbiAgICB9XG5cbiAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gcXVldWUuc2hpZnQoKTtcblxuICAgICAgICBpZiAoY3VycmVudCA9PT0gZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RfcGF0aChjdXJyZW50LCBzdGFydF9wb2ludCwgZW5kX3BvaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudC5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuZXdEID0gY3VycmVudC5kICsgY3VycmVudC5uZWlnaGJvcnNbaV0uZGlzdGFuY2UoY3VycmVudCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudC5uZWlnaGJvcnNbaV0uZCA9PT0gJ3VuZGVmaW5lZCcgfHwgbmV3RCA8IGN1cnJlbnQubmVpZ2hib3JzW2ldLmQpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Lm5laWdoYm9yc1tpXS5kID0gbmV3RDtcbiAgICAgICAgICAgICAgICBjdXJyZW50Lm5laWdoYm9yc1tpXS5wcmV2ID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUuaW5kZXhPZihjdXJyZW50Lm5laWdoYm9yc1tpXSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY3VycmVudC5uZWlnaGJvcnNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXVlLnNvcnQoZGlzdGFuY2VDb21wYXJhdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RfcGF0aCA9IGZ1bmN0aW9uKG5vZGUsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICB2YXIgcGF0aCA9IFtdO1xuICAgIHdoaWxlIChub2RlLnByZXYpIHtcbiAgICAgICAgcGF0aC5wdXNoKG5vZGUuZ2V0X2NlbnRlcigpKTtcbiAgICAgICAgbm9kZSA9IG5vZGUucHJldjtcbiAgICB9XG4gICAgcGF0aC5wdXNoKG5vZGUuZ2V0X2NlbnRlcigpKTtcblxuICAgIHBhdGgucmV2ZXJzZSgpO1xuICAgIHBhdGgucHVzaChlbmRfcG9pbnQpO1xuICAgIHBhdGgudW5zaGlmdChzdGFydF9wb2ludCk7XG4gICAgdGhpcy5yZWR1Y2VfcGF0aChwYXRoKTtcblxuICAgIHJldHVybiBwYXRoO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZHVwbGljYXRlZCA9IGZ1bmN0aW9uKGFycikge1xuICAgIGFyci5zb3J0KCk7XG4gICAgdmFyIHZhbHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgaWYoYXJyW2ldLmVxdWFscyhhcnJbaSsxXSkpIHtcbiAgICAgICAgICAgIHZhbHMucHVzaChhcnJbaV0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHM7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5yZWR1Y2VfcGF0aCA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHBhdGhbaV0sIHBhdGhbaSArIDJdKSkpIHtcbiAgICAgICAgICAgIHBhdGguc3BsaWNlKGkgKyAxLCAxKTtcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnN0cmFpbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnN0cmFpbnRzW2ldLmludGVyc2VjdHMobGluZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBpZiAoQ09ORklHLkRFQlVHID4gMykge1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgICAgICAgICBwb2ludC5kcmF3KGNvbnRleHQsIFwiIzU1NTVBQVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5saW5lcy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIGxpbmUuZHJhdyhjb250ZXh0LCBcIiM1NTU1QUFcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuZ3JhcGguZm9yRWFjaChmdW5jdGlvbih0cmlhbmdsZSkge1xuICAgICAgICBpZiAoQ09ORklHLkRFQlVHID4gNCkge1xuICAgICAgICAgICAgdHJpYW5nbGUuZmlsbF90cmlhbmdsZShjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiAxKSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5kcmF3X2VkZ2VzKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiAwKSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5kcmF3X3ZlcnRleChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuZ3JhcGguZm9yRWFjaChmdW5jdGlvbih0cmlhbmdsZSkge1xuICAgICAgICBpZiAoQ09ORklHLkRFQlVHID4gMikge1xuICAgICAgICAgICAgdHJpYW5nbGUuZHJhd193ZWlnaHRzKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaWFuZ3VsYXRpb247XG4iXX0=
