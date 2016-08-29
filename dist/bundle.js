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
            
            debugger;

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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29udHJvbHMuanMiLCJhcHAvanMvZmlzaC5qcyIsImFwcC9qcy9nZW9tZXRyeS5qcyIsImFwcC9qcy9oYXNobWFwLmpzIiwiYXBwL2pzL2luZGV4LmpzIiwiYXBwL2pzL21vdXNlLmpzIiwiYXBwL2pzL29jZWFuLmpzIiwiYXBwL2pzL3JlZWYuanMiLCJhcHAvanMvc2Nob29sLmpzIiwiYXBwL2pzL3N0YXRzLmpzIiwiYXBwL2pzL3RyaWFuZ3VsYXRpb24uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdlBBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdk1BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0lBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiJ3VzZSBzdHJpY3QnO1xuLypqc2hpbnQgYnJvd3NlciA6IHRydWUqL1xuXG5mdW5jdGlvbiBDb250cm9scygpIHtcbiAgICB0aGlzLmxvYWRfc3R5bGUoKTtcblxuICAgIHRoaXMuY29udHJvbF9kaXYoKTtcbiAgICB2YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjYW52YXNcIilbMF07XG4gICAgdGhpcy5jYW52YXNfZGl2KCkuYXBwZW5kQ2hpbGQoY2FudmFzKTtcblxuICAgIGNhbnZhcy5zdHlsZS53aWR0aCA9JzEwMCUnO1xuICAgIGNhbnZhcy5zdHlsZS5oZWlnaHQ9JzEwMCUnO1xuICAgIGNhbnZhcy53aWR0aCAgPSBjYW52YXMub2Zmc2V0V2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGNhbnZhcy5vZmZzZXRIZWlnaHQ7XG59XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5jb250cm9sX2RpdiA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgdGhpcy5kaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJjb250cm9sc1wiKTtcbiAgICB0aGlzLmRpdi5zdHlsZS5yaWdodCA9IFwiMFwiO1xuICAgIHRoaXMuZGl2LnN0eWxlLndpZHRoID0gXCIxOSVcIjtcbiAgICB0aGlzLmRpdi5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcbiAgICB0aGlzLmRpdi5zdHlsZS5mbG9hdCA9IFwicmlnaHRcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0uYXBwZW5kQ2hpbGQodGhpcy5kaXYpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmNhbnZhc19kaXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGNhbnZhc19kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGNhbnZhc19kaXYuc2V0QXR0cmlidXRlKFwiY2xhc3NcIiwgXCJjYW52YXMtY29udGFpbmVyXCIpO1xuICAgIGNhbnZhc19kaXYuc3R5bGUucG9zaXRpb24gPSBcImFic29sdXRlXCI7XG4gICAgY2FudmFzX2Rpdi5zdHlsZS53aWR0aCA9IFwiODAlXCI7XG4gICAgY2FudmFzX2Rpdi5zdHlsZS5oZWlnaHQgPSBcIjEwMCVcIjtcbiAgICBjYW52YXNfZGl2LnN0eWxlLmZsb2F0ID0gXCJsZWZ0XCI7XG5cbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImJvZHlcIilbMF0uYXBwZW5kQ2hpbGQoY2FudmFzX2Rpdik7XG5cbiAgICByZXR1cm4gY2FudmFzX2Rpdjtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5sb2FkX3N0eWxlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpbmsgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlua1wiKTtcbiAgICBsaW5rLmhyZWYgPSBcInN0eWxlL2NvbnRyb2xzLmNzc1wiO1xuICAgIGxpbmsucmVsID0gXCJzdHlsZXNoZWV0XCI7XG4gICAgbGluay50eXBlID0gXCJ0ZXh0L2Nzc1wiO1xuICAgIGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiaGVhZFwiKVswXS5hcHBlbmRDaGlsZChsaW5rKTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5hZGRfY29udHJvbCA9IGZ1bmN0aW9uKGNvbnRyb2wpIHtcbiAgICB0aGlzLmRpdi5hcHBlbmRDaGlsZChjb250cm9sKTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5jcmVhdGVfaWQgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gTWF0aC5yYW5kb20oKS50b1N0cmluZygzNikuc3Vic3RyaW5nKDcpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLmJ1dHRvbiA9IGZ1bmN0aW9uKHRleHQsIGNsaWNrKSB7XG4gICAgdmFyIGlucHV0ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImlucHV0XCIpO1xuICAgIGlucHV0LnR5cGUgPSBcImJ1dHRvblwiO1xuICAgIGlucHV0LnZhbHVlID0gdGV4dDtcbiAgICBpbnB1dC5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIiwgY2xpY2spO1xuXG4gICAgdGhpcy5hZGRfY29udHJvbChpbnB1dCk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUuc2xpZGVyID0gZnVuY3Rpb24odGV4dCwgb2JqLCBwcm9wLCBtaW4sIG1heCwgc3RlcCkge1xuICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICBpbnB1dC50eXBlID0gXCJyYW5nZVwiO1xuICAgIGlucHV0LmlkID0gdGhpcy5jcmVhdGVfaWQoKTtcbiAgICBpbnB1dC5taW4gPSBtaW47XG4gICAgaW5wdXQubWF4ID0gbWF4O1xuICAgIGlucHV0LnN0ZXAgPSBzdGVwO1xuICAgIGlucHV0LnZhbHVlID0gb2JqW3Byb3BdO1xuXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgb2JqW3Byb3BdID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIGxhYmVsLmlubmVyVGV4dCA9IGxhYmVsLnRleHRDb250ZW50ID0gdGV4dCArIFwiIFwiICsgb2JqW3Byb3BdO1xuICAgIH0pO1xuXG4gICAgdmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xuICAgIGxhYmVsLmlubmVyVGV4dCA9IGxhYmVsLnRleHRDb250ZW50ID0gdGV4dCArIFwiIFwiICsgb2JqW3Byb3BdO1xuICAgIGxhYmVsLmZvciA9IGlucHV0LmlkO1xuXG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG4gICAgZGl2LmFwcGVuZENoaWxkKGxhYmVsKTtcbiAgICBkaXYuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG4gICAgdGhpcy5hZGRfY29udHJvbChkaXYpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnJhZGlvID0gZnVuY3Rpb24odGV4dCwgb2JqLCBwcm9wLCB2YWx1ZXMsIHZhbHVlKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gICAgbGFiZWwuaW5uZXJIVE1MID0gdGV4dDtcbiAgICBkaXYuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlKGUpIHtcbiAgICAgICAgb2JqW3Byb3BdID0gZS50YXJnZXQudmFsdWU7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gICAgICAgIHZhciByYWRpb0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xuICAgICAgICByYWRpb0xhYmVsLmlubmVySFRNTCA9IHZhbHVlc1tpXTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHJhZGlvTGFiZWwpO1xuXG4gICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgaW5wdXQudHlwZSA9IFwicmFkaW9cIjtcbiAgICAgICAgaW5wdXQubmFtZSA9IHByb3A7XG4gICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWVzW2ldO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdmFsdWVzW2ldID09PSBvYmpbcHJvcF07XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdXBkYXRlKTtcblxuICAgICAgICByYWRpb0xhYmVsLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICB9XG5cblxuICAgIHRoaXMuYWRkX2NvbnRyb2woZGl2KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xuXG5mdW5jdGlvbiBGaXNoKHgsIHksIHJhZGl1cywgc3BlZWQpIHtcbiAgICB0aGlzLnBvcyA9IG5ldyBQb2ludCh4LHkpO1xuICAgIHRoaXMucm90YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgdGhpcy5yb3RhdGlvbl9zcGVlZCA9IHNwZWVkIC8gMTA7XG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgdGhpcy5jb2xsaWRpbmcgPSBmYWxzZTtcbn1cblxuRmlzaC5wcm90b3R5cGUuc2V0X3BhdGggPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbn07XG5cbkZpc2gucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkZWx0YV90aW1lLCBjb2xsaWRhYmxlcykge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLm5leHRfdGFyZ2V0KCk7XG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhX3ZlbG9jaXR5ID0gdGhpcy5zcGVlZCAqIGRlbHRhX3RpbWU7XG5cbiAgICAvL3JvdGF0ZSB0b3dhcmRzIHRhcmdldCwgdGhlbiBtb3ZlIHRvd2FyZHMgaXQuXG4gICAgdGhpcy5wb3MueCArPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKSAqIGRlbHRhX3ZlbG9jaXR5O1xuICAgIHRoaXMucG9zLnkgKz0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbikgKiBkZWx0YV92ZWxvY2l0eTtcblxuICAgIC8vVHJhY2UgYSByYXkgdG8gZWFjaCBhbmQgdGVzdCBpZiB3ZSdkIGJlIHRvdWNoaW5nIGFueSBvZiB0aGVtIGFmdGVyIG1vdmluZy5cblxuICAgIGNvbGxpZGFibGVzLmZvckVhY2goZnVuY3Rpb24oY29sbGlkYWJsZSkge1xuICAgICAgICB0aGlzLmNvbGxpZGluZyA9IGNvbGxpZGFibGUucG9zLmRpc3RhbmNlKHRoaXMucG9zKSA8PSAwICYmIGNvbGxpZGFibGUgIT09IHRoaXM7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuXG4gICAgdmFyIGRlc2lyZWRfYW5nbGUgPSBNYXRoLmF0YW4yKHRhcmdldC55IC0gdGhpcy5wb3MueSwgdGFyZ2V0LnggLSB0aGlzLnBvcy54KTtcblxuICAgIC8vIHRoaXMucm90YXRpb24gPSBkZXNpcmVkX2FuZ2xlO1xuICAgIC8vIHRoaXMucm90YXRpb24gJT0gTWF0aC5QSSAqIDI7XG5cbiAgICB2YXIgY3dfZGlzdCA9ICgoKGRlc2lyZWRfYW5nbGUgLSB0aGlzLnJvdGF0aW9uKSAlIChNYXRoLlBJICogMikpICsgKE1hdGguUEkgKiAyKSkgJSAoTWF0aC5QSSAqIDIpO1xuICAgIHZhciBjY3dfZGlzdCA9ICgoKHRoaXMucm90YXRpb24gLSBkZXNpcmVkX2FuZ2xlKSAlIChNYXRoLlBJICogMikpICsgKE1hdGguUEkgKiAyKSkgJSAoTWF0aC5QSSAqIDIpO1xuXG4gICAgdmFyIGRlbHRhX3JvdGF0aW9uID0gdGhpcy5yb3RhdGlvbl9zcGVlZCAqIGRlbHRhX3RpbWU7XG5cbiAgICBpZiAoY3dfZGlzdCA8IGRlbHRhX3JvdGF0aW9uIHx8IGNjd19kaXN0IDwgZGVsdGFfcm90YXRpb24pIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGRlc2lyZWRfYW5nbGU7XG4gICAgfSBlbHNlIGlmIChjd19kaXN0ID4gY2N3X2Rpc3QpIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiAtPSBkZWx0YV9yb3RhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvdGF0aW9uICs9IGRlbHRhX3JvdGF0aW9uO1xuICAgIH1cblxuICAgIHRoaXMucm90YXRpb24gJT0gTWF0aC5QSSAqIDI7XG59O1xuXG5GaXNoLnByb3RvdHlwZS5uZXh0X3RhcmdldCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCF0aGlzLnBhdGggfHwgdGhpcy5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmKHRoaXMucGF0aFswXS5kaXN0YW5jZSh0aGlzLnBvcykgPD0gMTAgJiYgdGhpcy5wYXRoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5wYXRoLnNoaWZ0KCk7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gdGhpcy5wYXRoWzBdO1xufTtcblxuRmlzaC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDI7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiIzAwMDAwMFwiO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xsaWRpbmcgPyBcIiNBQTc3NzdcIiA6IFwiI0FBQUFBQVwiO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyh0aGlzLnBvcy54LCB0aGlzLnBvcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLnBvcy54LCB0aGlzLnBvcy55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvcy54ICsgTWF0aC5jb3ModGhpcy5yb3RhdGlvbikgKiB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5wb3MueSArIE1hdGguc2luKHRoaXMucm90YXRpb24pICogdGhpcy5yYWRpdXMgKiAxLjUpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRmlzaDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBMaW5lKHAxLCBwMikge1xuICAgIHRoaXMucDEgPSBwMTtcbiAgICB0aGlzLnAyID0gcDI7XG59XG5cbkxpbmUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpICYmIHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSB8fFxuICAgICAgICAodGhpcy5wMS5lcXVhbHMobGluZS5wMikgJiYgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkpO1xufTtcblxuTGluZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yIHx8IFwiI0FBQUFBQVwiO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wMS54LCB0aGlzLnAxLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMucDIueCwgdGhpcy5wMi55KTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufTtcblxuTGluZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wMS50b1N0cmluZygpICsgXCIgPT4gXCIgKyB0aGlzLnAyLnRvU3RyaW5nKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5oYXNoQ29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnAxLmhhc2hDb2RlKCkgKyB0aGlzLnAyLmhhc2hDb2RlKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIGlmICh0aGlzLmVxdWFscyhsaW5lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgczEgPSB0aGlzLnAyLnN1YnRyYWN0KHRoaXMucDEpO1xuICAgIHZhciBzMiA9IGxpbmUucDIuc3VidHJhY3QobGluZS5wMSk7XG5cbiAgICB2YXIgcyA9ICgtczEueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpICsgczEueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG4gICAgdmFyIHQgPSAoczIueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpIC0gczIueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG5cbiAgICBpZiAocyA+PSAwICYmIHMgPD0gMSAmJiB0ID49IDAgJiYgdCA8PSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaXNOYU4ocykgfHwgaXNOYU4odCkpIHtcbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG5vIHBvaW50cyB0aGV5IGRvbid0IG92ZXJsYXAuXG4gICAgICAgIGlmICghKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDEuZXF1YWxzKGxpbmUucDIpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm91bmRpbmdfY29udGFpbnMobGluZSkgfHwgbGluZS5ib3VuZGluZ19jb250YWlucyh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICAvL0NvbGluZWFyLCBlaXRoZXIgdGhleSBvdmVybGFwIG9yIHRoZXkgZG9uJ3QuLi5cbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG9uZSBwb2ludCwgdGhlbiB0aGV5IG92ZXJsYXAgaWYgYW55IG9mIHRoZSBwb2ludHMgZmFsbHMgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgbGluZXMuXG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBib3RoIHRoZXkncmUgZXF1YWwsIHdoaWNoIHdlIGNvdmVyIGFib3ZlXG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuTGluZS5wcm90b3R5cGUuYm91bmRpbmdfY29udGFpbnMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgdmFyIHRvcF9sZWZ0ID0gbmV3IFBvaW50KE1hdGgubWluKHRoaXMucDEueCwgdGhpcy5wMi54KSwgTWF0aC5taW4odGhpcy5wMS55LCB0aGlzLnAyLnkpKTtcbiAgICB2YXIgYm90dG9tX3JpZ2h0ID0gbmV3IFBvaW50KE1hdGgubWF4KHRoaXMucDEueCwgdGhpcy5wMi54KSwgTWF0aC5tYXgodGhpcy5wMS55LCB0aGlzLnAyLnkpKTtcblxuICAgIHJldHVybiBsaW5lLnAxLmJldHdlZW4odG9wX2xlZnQsIGJvdHRvbV9yaWdodCkgfHwgbGluZS5wMi5iZXR3ZWVuKHRvcF9sZWZ0LCBib3R0b21fcmlnaHQpO1xufTtcblxuTGluZS5wcm90b3R5cGUuaW50ZXJzZWN0c19hbnkgPSBmdW5jdGlvbihsaW5lcykge1xuICAgIGZvciAodmFyIGsgPSAwOyBrIDwgbGluZXMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgaWYgKHRoaXMuaW50ZXJzZWN0cyhsaW5lc1trXSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuZnVuY3Rpb24gUG9pbnQoeCwgeSkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbn1cblxuUG9pbnQucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIFwiKFwiICsgdGhpcy54ICsgXCIsIFwiICsgdGhpcy55ICsgXCIpXCI7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24ocG9pbnQpIHtcbiAgICByZXR1cm4gdGhpcy54ID09PSBwb2ludC54ICYmIHRoaXMueSA9PT0gcG9pbnQueTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5mdXp6eUVxdWFscyA9IGZ1bmN0aW9uKHBvaW50LCBlcHNpbG9uKSB7XG4gICAgcmV0dXJuIE1hdGguYWJzKHRoaXMueCAtIHBvaW50LngpIDwgZXBzaWxvbiAmJiBNYXRoLmFicyh0aGlzLnkgLSBwb2ludC55KSA8IGVwc2lsb247XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLnNjYWxhcl9wcm9kdWN0ID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBuZXcgUG9pbnQoYyAqIHRoaXMueCwgYyAqIHRoaXMueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuY3Jvc3NfcHJvZHVjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRvdF9wcm9kdWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYmV0d2VlbiA9IGZ1bmN0aW9uKHAxLCBwMikge1xuICAgIHJldHVybiB0aGlzLnggPiBwMS54ICYmIHRoaXMueCA8IHAyLnggJiYgdGhpcy55ID4gcDEueSAmJiB0aGlzLnkgPCBwMi55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy54IC0gcC54LCAyKSArIE1hdGgucG93KHRoaXMueSAtIHAueSwgMikpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3IgfHwgXCIjQUFBQUFBXCI7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMueCwgdGhpcy55LCAxMCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmhhc2hDb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMueCArIHRoaXMueTtcbn07XG5cbmZ1bmN0aW9uIFRyaWFuZ2xlKHAxLHAyLHAzKSB7XG4gICAgdGhpcy5lZGdlcyA9IFtuZXcgTGluZShwMSxwMiksIG5ldyBMaW5lKHAyLHAzKSwgbmV3IExpbmUocDMscDEpXTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMucG9pbnRzID0gW3AxLHAyLHAzXTtcbiAgICB0aGlzLmNvbG9yID0gZ2V0UmFuZG9tQ29sb3IoKTtcbn1cblxuVHJpYW5nbGUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfY2VudGVyKCkuZnV6enlFcXVhbHMoeC5nZXRfY2VudGVyKCksIDAuMDEpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmdldF9jZW50ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvL0NlbnRyb2lkOlxuICAgIC8vcmV0dXJuIG5ldyBQb2ludCgodGhpcy5wb2ludHNbMF0ueCArIHRoaXMucG9pbnRzWzFdLnggKyB0aGlzLnBvaW50c1syXS54KSAvIDMsICh0aGlzLnBvaW50c1swXS55ICsgdGhpcy5wb2ludHNbMV0ueSArIHRoaXMucG9pbnRzWzJdLnkpIC8gMyk7XG5cbiAgICB2YXIgYSA9IHRoaXMucG9pbnRzWzBdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzFdKTtcbiAgICB2YXIgYiA9IHRoaXMucG9pbnRzWzBdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzJdKTtcbiAgICB2YXIgYyA9IHRoaXMucG9pbnRzWzFdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzJdKTtcbiAgICB2YXIgcCA9IGEgKyBiICsgYztcblxuICAgIHJldHVybiBuZXcgUG9pbnQoKGEgKiB0aGlzLnBvaW50c1syXS54ICsgYiAqIHRoaXMucG9pbnRzWzFdLnggKyBjICogdGhpcy5wb2ludHNbMF0ueCkgLyBwLCAoYSAqIHRoaXMucG9pbnRzWzJdLnkgKyBiICogdGhpcy5wb2ludHNbMV0ueSArIGMgKiB0aGlzLnBvaW50c1swXS55KSAvIHApO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0LmdldF9jZW50ZXIoKSk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuaGFzaENvZGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wb2ludHNbMF0uaGFzaENvZGUoKSArIHRoaXMucG9pbnRzWzFdLmhhc2hDb2RlKCkgKyB0aGlzLnBvaW50c1syXS5oYXNoQ29kZSgpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24ocCkge1xuICAgIHZhciBwMSA9IHRoaXMucG9pbnRzWzBdO1xuICAgIHZhciBwMiA9IHRoaXMucG9pbnRzWzFdO1xuICAgIHZhciBwMyA9IHRoaXMucG9pbnRzWzJdO1xuXG4gICAgdmFyIGFscGhhID0gKChwMi55IC0gcDMueSkgKiAocC54IC0gcDMueCkgKyAocDMueCAtIHAyLngpICogKHAueSAtIHAzLnkpKSAvXG4gICAgICAgICgocDIueSAtIHAzLnkpICogKHAxLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocDEueSAtIHAzLnkpKTtcbiAgICB2YXIgYmV0YSA9ICgocDMueSAtIHAxLnkpICogKHAueCAtIHAzLngpICsgKHAxLnggLSBwMy54KSAqIChwLnkgLSBwMy55KSkgL1xuICAgICAgICAoKHAyLnkgLSBwMy55KSAqIChwMS54IC0gcDMueCkgKyAocDMueCAtIHAyLngpICogKHAxLnkgLSBwMy55KSk7XG4gICAgdmFyIGdhbW1hID0gMSAtIGFscGhhIC0gYmV0YTtcblxuICAgIHJldHVybiBhbHBoYSA+IDAgJiYgYmV0YSA+IDAgJiYgZ2FtbWEgPiAwO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmlzX25laWdoYm9yID0gZnVuY3Rpb24odCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5lZGdlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IHQuZWRnZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICh0aGlzLmVkZ2VzW2ldLmVxdWFscyh0LmVkZ2VzW2pdKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5hZGRfbmVpZ2hib3IgPSBmdW5jdGlvbih0KSB7XG4gICAgdGhpcy5uZWlnaGJvcnMucHVzaCh0KTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5maWxsX3RyaWFuZ2xlID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSB0aGlzLmNvbG9yO1xuICAgIGNvbnRleHQubW92ZVRvKHRoaXMucG9pbnRzWzBdLngsIHRoaXMucG9pbnRzWzBdLnkpO1xuXG4gICAgY29udGV4dC5saW5lVG8odGhpcy5wb2ludHNbMV0ueCwgdGhpcy5wb2ludHNbMV0ueSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy5wb2ludHNbMl0ueCwgdGhpcy5wb2ludHNbMl0ueSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG4gICAgY29udGV4dC5maWxsKCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd193ZWlnaHRzID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMjIyMjIyXCI7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubmVpZ2hib3JzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkID0gdGhpcy5nZXRfY2VudGVyKCkuZGlzdGFuY2UodGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpKTtcbiAgICAgICAgY29udGV4dC5maWxsVGV4dChkLnRvRml4ZWQoMCksICh0aGlzLmdldF9jZW50ZXIoKS54ICsgdGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLngpIC8gMiArIDEwLCAodGhpcy5nZXRfY2VudGVyKCkueSArIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS55KSAvIDIgKyAxMCk7XG4gICAgfVxufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRyYXdfZWRnZXMgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiI0FBQUFBQVwiO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMubmVpZ2hib3JzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgY29udGV4dC5tb3ZlVG8odGhpcy5nZXRfY2VudGVyKCkueCwgdGhpcy5nZXRfY2VudGVyKCkueSk7XG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS54LCB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueSk7XG4gICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgfVxufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRyYXdfdmVydGV4ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjMjIyMjIyXCI7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyh0aGlzLmdldF9jZW50ZXIoKS54LCB0aGlzLmdldF9jZW50ZXIoKS55LCA4LCA4LCAwLCBNYXRoLlBJICogMik7XG4gICAgY29udGV4dC5maWxsKCk7XG59O1xuXG5mdW5jdGlvbiBnZXRSYW5kb21Db2xvcigpIHtcbiAgICB2YXIgbGV0dGVycyA9ICcwMTIzNDU2Nzg5QUJDREVGJztcbiAgICB2YXIgY29sb3IgPSAnIyc7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCA2OyBpKyspIHtcbiAgICAgICAgY29sb3IgKz0gbGV0dGVyc1tNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAxNildO1xuICAgIH1cbiAgICByZXR1cm4gY29sb3I7XG59XG5cblxubW9kdWxlLmV4cG9ydHMuUG9pbnQgPSBQb2ludDtcbm1vZHVsZS5leHBvcnRzLkxpbmUgPSBMaW5lO1xubW9kdWxlLmV4cG9ydHMuVHJpYW5nbGUgPSBUcmlhbmdsZTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBIYXNoTWFwKCkge1xuICAgIC8vVE9ETzogc2hvdWxkIGJlIGNvbmZpZ3VyYWJsZSAoYW5kIGV4cGFuZGFibGUpXG4gICAgdGhpcy5udW1fYnVja2V0cyA9IDE5O1xuICAgIHRoaXMuYnVja2V0cyA9IFtdO1xufVxuXG5IYXNoTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZigha2V5KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGJ1Y2tldCA9IHRoaXMuYnVja2V0c1t0aGlzLmhhc2goa2V5KV07XG5cbiAgICBpZighYnVja2V0KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJ1Y2tldC5rZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKGJ1Y2tldC5rZXlzW2ldLmVxdWFscyhrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVja2V0LnZhbHVlc1tpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5IYXNoTWFwLnByb3RvdHlwZS5nZXRLZXkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICBpZigha2V5KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgdmFyIGJ1Y2tldCA9IHRoaXMuYnVja2V0c1t0aGlzLmhhc2goa2V5KV07XG5cbiAgICBpZighYnVja2V0KSB7XG4gICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJ1Y2tldC5rZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKGJ1Y2tldC5rZXlzW2ldLmVxdWFscyhrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gYnVja2V0LmtleXNbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuXG5IYXNoTWFwLnByb3RvdHlwZS5wdXQgPSBmdW5jdGlvbihrZXksIHZhbHVlKSB7XG4gICAgLy9UT0RPOiByZXNpemUgdGhlIGJ1Y2tldHMgaWYgbmVlZCBiZS5cbiAgICB2YXIgYnVja2V0ID0gdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXTtcbiAgICBpZighYnVja2V0KSB7XG4gICAgICAgIGJ1Y2tldCA9IHtrZXlzIDogW10sIHZhbHVlcyA6IFtdfTtcbiAgICAgICAgdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXSA9IGJ1Y2tldDtcbiAgICB9XG5cbiAgICB2YXIgaW5kZXggPSBidWNrZXQua2V5cy5sZW5ndGg7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVja2V0LmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoYnVja2V0LmtleXNbaV0uZXF1YWxzKGtleSkpIHtcbiAgICAgICAgICAgIGluZGV4ID0gaTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGJ1Y2tldC5rZXlzW2luZGV4XSA9IGtleTtcbiAgICBidWNrZXQudmFsdWVzW2luZGV4XSA9IHZhbHVlO1xufTtcblxuSGFzaE1hcC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgdmFyIGJ1Y2tldCA9IHRoaXMuYnVja2V0c1t0aGlzLmhhc2goa2V5KV07XG5cbiAgICBpZighYnVja2V0KSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVja2V0LmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoYnVja2V0LmtleXNbaV0uZXF1YWxzKGtleSkpIHtcbiAgICAgICAgICAgIGJ1Y2tldC5rZXlzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIGJ1Y2tldC52YWx1ZXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgcmV0dXJuIGJ1Y2tldC5rZXlzW2ldO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuSGFzaE1hcC5wcm90b3R5cGUuaGFzaCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHJldHVybiB2YWwuaGFzaENvZGUoKSAlIHRoaXMubnVtX2J1Y2tldHM7XG59O1xuXG5mdW5jdGlvbiBIYXNoU2V0KGFycikge1xuICAgIHRoaXMubWFwID0gbmV3IEhhc2hNYXAoKTtcblxuICAgIHRoaXMubGVuZ3RoID0gMDtcblxuICAgIGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChhcnIpID09PSBcIltvYmplY3QgQXJyYXldXCIpe1xuICAgICAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmFkZChhcnJbaV0pO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5IYXNoU2V0LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB0aGlzLm1hcC5wdXQodmFsLCB0cnVlKTtcbiAgICB0aGlzLmxlbmd0aCsrO1xufTtcblxuSGFzaFNldC5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1hcC5nZXRLZXkodmFsKTtcbiAgICBpZih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufTtcblxuSGFzaFNldC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHZhbHVlID0gdGhpcy5tYXAuZ2V0S2V5KHZhbCk7XG4gICAgaWYodmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciByZW1vdmVkID0gdGhpcy5tYXAucmVtb3ZlKHZhbCk7XG5cbiAgICBpZih0eXBlb2YgcmVtb3ZlZCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbW92ZWQ7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5yZW1vdmVfYWxsID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnJlbW92ZShhcnJbaV0pO1xuICAgIH1cbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnRvX2FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcC5idWNrZXRzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgaWYoIXRoaXMubWFwLmJ1Y2tldHNbaV0pe1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5cyA9IHRoaXMubWFwLmJ1Y2tldHNbaV0ua2V5cztcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGtleXNbal0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLmdldF9hbnkgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXAuYnVja2V0cy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGlmKCF0aGlzLm1hcC5idWNrZXRzW2ldKXtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGtleXMgPSB0aGlzLm1hcC5idWNrZXRzW2ldLmtleXM7XG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBrZXlzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5c1tqXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5mdW5jdGlvbiBTZXRNdWx0aU1hcCgpIHtcbiAgICB0aGlzLm1hcCA9IG5ldyBIYXNoTWFwKCk7XG59XG5cblNldE11bHRpTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgdmFscyA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIGlmKCF2YWxzKSB7XG4gICAgICAgIHRoaXMubWFwLnB1dChrZXksIFtdKTtcbiAgICAgICAgdmFscyA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxzO1xufTtcblxuU2V0TXVsdGlNYXAucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgdmFscyA9IHRoaXMuZ2V0KGtleSk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHZhbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoKHZhbHNbaV0uaGFzT3duUHJvcGVydHkoXCJlcXVhbHNcIikgJiYgdmFsc1tpXS5lcXVhbHModmFsdWUpKSB8fCB2YWxzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsc1tpXSA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFscy5wdXNoKHZhbHVlKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBIYXNoTWFwO1xubW9kdWxlLmV4cG9ydHMuSGFzaFNldCA9IEhhc2hTZXQ7XG5tb2R1bGUuZXhwb3J0cy5TZXRNdWx0aU1hcCA9IFNldE11bHRpTWFwO1xuIiwiLypnbG9iYWwgQ09ORklHIDogdHJ1ZSAqL1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjYW52YXNcIilbMF07XG52YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5DT05GSUcgPSB7fTtcbkNPTkZJRy5ERUJVRyA9IDM7XG5cbihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIEZpc2ggPSByZXF1aXJlKCcuL2Zpc2guanMnKTtcbiAgICB2YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG4gICAgdmFyIFNjaG9vbCA9IHJlcXVpcmUoJy4vc2Nob29sLmpzJyk7XG4gICAgdmFyIE9jZWFuID0gcmVxdWlyZSgnLi9vY2Vhbi5qcycpO1xuICAgIHZhciBSZWVmID0gcmVxdWlyZSgnLi9yZWVmLmpzJyk7XG4gICAgdmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scy5qcycpO1xuICAgIHZhciBNb3VzZSA9IHJlcXVpcmUoJy4vbW91c2UuanMnKTtcblxuICAgIHZhciBjb250cm9scyA9IG5ldyBDb250cm9scygpO1xuICAgIGNvbnRyb2xzLnNsaWRlcihcIkRlYnVnOiBcIiwgQ09ORklHLCBcIkRFQlVHXCIsIDAsIDEwLCAxKTtcblxuICAgIC8vZGVidWdnZXI7XG4gICAgdmFyIG9jZWFuID0gbmV3IE9jZWFuKGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCwgW25ldyBSZWVmKDMwMCwgMTAwLCAyNTAsIDIwMCldKTtcblxuICAgIC8vVE9ETzogY29udHJvbGxhYmxlIHNwYXduaW5nXG5cbiAgICB2YXIgc2Nob29sID0gbmV3IFNjaG9vbChvY2VhbiwgbmV3IFBvaW50KDUwMCw1MDApKTtcbiAgICAvLyBzY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMjAwLCAxMjAsIDEwLCAwLjI1KSk7XG4gICAgLy8gc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDIwMCwgMTIwLCAxMCwgMC4yKSk7XG4gICAgLy8gc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDMwLCAzMDAsIDEwLCAwLjUpKTtcbiAgICAvLyBzY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMTMwLCA1MDAsIDIwLCAwLjA1KSk7XG4gICAgLy8gc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDIzMCwgMTUwLCAyMCwgMC4xKSk7XG4gICAgLy8gc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDIzMCwgMTUwLCAyMCwgMC4xNSkpO1xuICAgIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCg2MDAsIDYwMCwgMjAsIDAuMikpO1xuXG4gICAgdmFyIG1vdXNlID0gbmV3IE1vdXNlKHNjaG9vbCwgb2NlYW4sIGNhbnZhcyk7XG4gICAgY29udHJvbHMucmFkaW8oXCJNb2RlOiBcIiwgbW91c2UsIFwibW9kZVwiLCBtb3VzZS5tb2Rlcyk7XG5cbiAgICB2YXIgcHJldmlvdXNfdGltZTtcbiAgICB2YXIgd2FzX2hpZGRlbiA9IGZhbHNlO1xuICAgIHZhciBwbGF5aW5nID0gdHJ1ZTtcblxuICAgIGRvY3VtZW50LnNob3dpbmcgPSB0cnVlO1xuXG4gICAgZnVuY3Rpb24gc3RlcCh0KSB7XG4gICAgICAgIGlmIChwbGF5aW5nICYmIGRvY3VtZW50LnNob3dpbmcpIHtcbiAgICAgICAgICAgIHZhciB0aW1lX2RlbHRhID0gcHJldmlvdXNfdGltZSA9PT0gdW5kZWZpbmVkID8gMCA6IHQgLSBwcmV2aW91c190aW1lO1xuXG4gICAgICAgICAgICBpZiAod2FzX2hpZGRlbikge1xuICAgICAgICAgICAgICAgIHRpbWVfZGVsdGEgPSAwO1xuICAgICAgICAgICAgICAgIHdhc19oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2Nob29sLmZpc2guZm9yRWFjaChmdW5jdGlvbihmaXNoKSB7XG4gICAgICAgICAgICAgICAgZmlzaC5tb3ZlKHRpbWVfZGVsdGEsIHNjaG9vbC5maXNoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICBvY2Vhbi5kcmF3KGNvbnRleHQpO1xuICAgICAgICBzY2hvb2wuZHJhdyhjb250ZXh0KTtcblxuICAgICAgICBtb3VzZS5kcmF3KGNvbnRleHQpO1xuXG4gICAgICAgIHByZXZpb3VzX3RpbWUgPSB0O1xuICAgICAgICB3aW5kb3cucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xuICAgIH1cblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LmhpZGRlbikge1xuICAgICAgICAgICAgd2FzX2hpZGRlbiA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7XG4gICAgICAgICAgICBwbGF5aW5nID0gIXBsYXlpbmc7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHN0ZXAoKTtcbn0pKCk7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE9jZWFuID0gcmVxdWlyZSgnLi9vY2Vhbi5qcycpO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xudmFyIFJlZWYgPSByZXF1aXJlKCcuL3JlZWYuanMnKTtcblxuZnVuY3Rpb24gTW91c2Uoc2Nob29sLCBvY2VhbiwgY2FudmFzKSB7XG4gICAgdGhpcy5zY2hvb2wgPSBzY2hvb2w7XG4gICAgdGhpcy5vY2VhbiA9IG9jZWFuO1xuICAgIHRoaXMubW9kZSA9IFwidGFyZ2V0XCI7XG4gICAgdGhpcy5tb2RlcyA9IFtcInRhcmdldFwiLCBcImNyZWF0ZVwiLCBcImRlbGV0ZVwiXTtcbiAgICB0aGlzLnAgPSBuZXcgUG9pbnQoMCwgMCk7XG5cbiAgICBjYW52YXMuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIHZhciByZWN0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpO1xuICAgICAgICB2YXIgcCA9IG5ldyBQb2ludChlLmNsaWVudFggLSByZWN0LmxlZnQsIGUuY2xpZW50WSAtIHJlY3QudG9wKTtcbiAgICAgICAgdGhpc1t0aGlzLm1vZGVdKHApO1xuICAgIH0uYmluZCh0aGlzKSwgZmFsc2UpO1xuXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoXCJtb3VzZW1vdmVcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdGhpcy5wID0gbmV3IFBvaW50KGUuY2xpZW50WCAtIHJlY3QubGVmdCwgZS5jbGllbnRZIC0gcmVjdC50b3ApO1xuICAgIH0uYmluZCh0aGlzKSk7XG59XG5cbk1vdXNlLnByb3RvdHlwZS50YXJnZXQgPSBmdW5jdGlvbihwKSB7XG4gICAgdGhpcy5zY2hvb2wuc2V0X3RhcmdldChwKTtcbn07XG5cbk1vdXNlLnByb3RvdHlwZS5kZWxldGUgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHJlZWYgPSB0aGlzLm9jZWFuLmdldF9yZWVmX3VuZGVyX3BvaW50KHApO1xuICAgIGlmIChyZWVmKSB7XG4gICAgICAgIHRoaXMub2NlYW4uZGVsZXRlX3JlZWYocmVlZik7XG4gICAgfVxufTtcblxuTW91c2UucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYgKHRoaXMubW9kZSA9PT0gXCJjcmVhdGVcIiAmJiB0aGlzLnAxKSB7XG4gICAgICAgIC8vVE9ETzogQ3JlYXRlIGEgZnVuY3Rpb24gb3V0IG9mIHRoaXMuXG4gICAgICAgIHZhciB0b3BfbGVmdCA9IG5ldyBQb2ludChNYXRoLm1pbih0aGlzLnAxLngsIHRoaXMucC54KSwgTWF0aC5taW4odGhpcy5wMS55LCB0aGlzLnAueSkpO1xuICAgICAgICB2YXIgYm90dG9tX3JpZ2h0ID0gbmV3IFBvaW50KE1hdGgubWF4KHRoaXMucDEueCwgdGhpcy5wLngpLCBNYXRoLm1heCh0aGlzLnAxLnksIHRoaXMucC55KSk7XG4gICAgICAgIHZhciBkaW1lbnMgPSBib3R0b21fcmlnaHQuc3VidHJhY3QodG9wX2xlZnQpO1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKDEwMCwxMDAsMTAwLDAuNSknO1xuICAgICAgICBjb250ZXh0LmZpbGxSZWN0KHRvcF9sZWZ0LngsIHRvcF9sZWZ0LnksIGRpbWVucy54LCBkaW1lbnMueSk7XG4gICAgfVxufTtcblxuLy9UT0RPOiBjcmVhdGUgcmV2ZXJzZSB3YXRjaGFibGUgdmFyaWFibGVzLCByZXR1cm4gYSBmdW5jdGlvbiBmcm9tIGNvbnRyb2xzLCB3aGVuIHRoZSBmdW5jaXRvbiBpcyBjYWxsZWQgaXQgdXNlcyBhIGNsb3N1cmUgdG8gdXBkYXRlIHRoZSB2YWx1ZSBhbmQgZ2V0cyB0aGUgdmFsdWVcbi8vVE9ETzogYnVnIHdoZXJlIHBvaW50MSBpc24ndCByZXNldCBvbiBjaGFuZ2luZyBtb2Rlc1xuTW91c2UucHJvdG90eXBlLmNyZWF0ZSA9IGZ1bmN0aW9uKHAyKSB7XG4gICAgaWYgKCF0aGlzLnAxKSB7XG4gICAgICAgIHRoaXMucDEgPSBwMjtcbiAgICB9IGVsc2Uge1xuICAgICAgICAvL1RPRE86IGVpdGhlciBkZWFsIHdpdGggb3ZlcmxhcHBpbmcgcmVlZnMgb3IgZG9uJ3QgYWxsb3cgdGhlbS5cbiAgICAgICAgdmFyIHRvcF9sZWZ0ID0gbmV3IFBvaW50KE1hdGgubWluKHRoaXMucDEueCwgcDIueCksIE1hdGgubWluKHRoaXMucDEueSwgcDIueSkpO1xuICAgICAgICB2YXIgYm90dG9tX3JpZ2h0ID0gbmV3IFBvaW50KE1hdGgubWF4KHRoaXMucDEueCwgcDIueCksIE1hdGgubWF4KHRoaXMucDEueSwgcDIueSkpO1xuICAgICAgICB2YXIgZGltZW5zID0gYm90dG9tX3JpZ2h0LnN1YnRyYWN0KHRvcF9sZWZ0KTtcbiAgICAgICAgdGhpcy5vY2Vhbi5hZGRfcmVlZihuZXcgUmVlZih0b3BfbGVmdC54LCB0b3BfbGVmdC55LCBkaW1lbnMueCwgZGltZW5zLnkpKTtcblxuICAgICAgICBkZWxldGUgdGhpcy5wMTtcbiAgICB9XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gTW91c2U7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWVmID0gcmVxdWlyZSgnLi9yZWVmLmpzJyk7XG52YXIgTGluZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5MaW5lO1xudmFyIFRyaWFuZ2xlID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlRyaWFuZ2xlO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xudmFyIFRyaWFuZ3VsYXRpb24gPSByZXF1aXJlKCcuL3RyaWFuZ3VsYXRpb24uanMnKTtcbnZhciBTdGF0cyA9IHJlcXVpcmUoJy4vc3RhdHMuanMnKTtcblxuZnVuY3Rpb24gT2NlYW4od2lkdGgsIGhlaWdodCwgcmVlZnMpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5yZWVmcyA9IHJlZWZzO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufVxuXG4vL1RPRE86IGNyZWF0ZSBhIHRyaWFuZ3VsYXRpb24gZm9yIGV2ZXJ5IHNpemUgb2YgZmlzaCAoanVzdCBleHBhbmQgdGhlIHdpZHRoLGhlaWdodCBhbmQgdG9wbGVmdCBwb2ludHMgYnkgdGhlIHJhZGl1cy4pIFByb2JhYmx5IGEgd2F5IHdlIGNhbiByZXVzZSBtb3N0IG9mIHRoZSB0cmlhbmd1bGF0aW9uLlxuLy9UT0RPOiBvdmVybGFwcGluZyByZWVmcyBjYXVzZSAgYWJ1ZywgY29tYmluZSB0aGVtIGludG8gcG9seWdvbnMgd2l0aCBjb25zdHJhaW50cyBhbmQgdXNlIHRob3NlIGluc3RlYWRcbi8vVE9ETzogY3JlYXRlIGEgY29udmV4IGh1bGwsIHRoZW4gcmVtb3ZlIHBvaW50cyBpbnNpZGUgKGdpZnQgd3JhcHBpbmcgYWxnbyksIHRoZW4gZGV0ZXJtaW5lIGhvdyB0byBjcmVhdGUgYSBjb25zdHJpYW50IGZyb20gdGhhdCxcbi8vVE9ETzogbWF5YmUganVzdCB0cmlhbmd1bGF0ZSB0aGUgcG9pbnRzIGZpcnN0LCB0aGVuIHVzZSB0aGF0IHRyaWFuZ3VsYXRpb24gYXMgdGhlIGNvbnN0cmFpbnRzLiBHZW5pdXMuXG5cbi8vVE9ETzogcmVtb3ZlIGlubmVyIHBvaW50cyAoMyBjYXNlcywgYWxsIHBvaW50cywgMiBwb2ludHMsIDEgcG9pbnQpIGFuZCB0aGVuIGFkZCBuZXcgcG9pbnRzIGF0IGludGVyc2VjdGlvbnMuXG4vLyBUaGUgb2xkIGRpYWdvbmFscyBjYW4gc3RpbGwgYmUgdXNlZCBhcyBjb25zdHJhaW50cyBJIHRoaW5rLCBidXQgbmV3IG91dGVyIGxpbmVzIG5lZWQgdG8gYmUgbWFkZSB3aGVyZSB0aGUgaW50ZXJzZWN0aW9ucyBhcmUuXG5cbk9jZWFuLnByb3RvdHlwZS5yZXRyaWFuZ3VsYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIFN0YXRzLnN0YXJ0KFwicmV0cmlhbmd1bGF0ZVwiKTtcbiAgICB0aGlzLnRyaWFuZ3VsYXRpb24gPSBuZXcgVHJpYW5ndWxhdGlvbih0aGlzLmdldF9wb2ludHMoKSwgdGhpcy5nZXRfbGluZXMoKSwgdGhpcy5nZXRfZGlhZ3MoKSk7XG4gICAgU3RhdHMuZmluaXNoKFwicmV0cmlhbmd1bGF0ZVwiKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3BhdGhfdG8gPSBmdW5jdGlvbihzdGFydF9wb2ludCwgZW5kX3BvaW50KSB7XG4gICAgU3RhdHMuc3RhcnQoXCJnZXRfcGF0aF90b1wiKTtcbiAgICB2YXIgcGF0aCA9IHRoaXMudHJpYW5ndWxhdGlvbi5maW5kX3BhdGgoc3RhcnRfcG9pbnQsIGVuZF9wb2ludCk7XG4gICAgU3RhdHMuZmluaXNoKFwiZ2V0X3BhdGhfdG9cIik7XG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3JlZWZfdW5kZXJfcG9pbnQgPSBmdW5jdGlvbihwKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYodGhpcy5yZWVmc1tpXS5jb250YWlucyhwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVlZnNbaV07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSBuZXcgUmVlZigwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X3BvaW50cygpO1xuXG4gICAgdGhpcy5yZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKHJlZWYpIHtcbiAgICAgICAgdmFyIHBzID0gcmVlZi5nZXRfcG9pbnRzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHBzW2ldKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBpZihhLnggPT0gYi54KSB7XG4gICAgICAgICAgICByZXR1cm4gYS55ID4gYi55O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGEueCA+IGIueDtcbiAgICB9KTtcblxuICAgIHJldHVybiBwb2ludHM7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2xpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpbmVzID0gbmV3IFJlZWYoMCwwLHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfbGluZXMoKTtcblxuICAgIGZ1bmN0aW9uIGFkZChsaW5lKSB7bGluZXMucHVzaChsaW5lKTt9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnJlZWZzW2ldLmdldF9saW5lcygpLmZvckVhY2goYWRkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXM7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2xpbmVzX292ZXJsYXBzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpbmVzID0gbmV3IFJlZWYoMCwwLHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfbGluZXMoKTtcbiAgICB2YXIgcG9pbnRzID0gbmV3IFJlZWYoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9wb2ludHMoKTtcbiAgICB2YXIgY29uc3RyYWludHMgPSBbXTtcblxuICAgIHZhciBwb2x5Z29ucyA9IFtdO1xuXG4gICAgLypcbiAgICAgICAgV2UgY3JlYXRlIGEgbGlzdCBvZiBwb2x5Z29ucywgdGhlbiB3ZSB0ZXN0IGlmIGVhY2ggcmVlZiBpbnRlcnNlY3RzIGFueSBvZiB0aG9zZSBwb2x5Z29ucyxcbiAgICAgICAgaWYgbm90IHRoYXQgcmVlZiBiZWNvbWVzIGEgcG9seWdvbi4gaWYgaXQgaW50ZXJlc2VjdHMsIHRoZW4gd2UgZmluZCB0aGUgaW50ZXJzZWN0aW9uLCBhZGQgdGhlIGxpbmVzIGFuZCBwb2ludHNcbiAgICAgICAgdG8gdGhlIHBvbHlnb24uIChhbmQgdGhlIGNvbnN0cmFpbnRzIHRvIHRoZSB3aG9sZSB0aGluZykuXG5cbiAgICAgICAgLy9UT0RPOiB3aGF0IGFib3V0IGhvbGVzLCBvciB0b3RhbCBwb2x5Z29uIGVuY2xvc3VyZVxuICAgICAgICAvL1RPRE86IHdoYXQgYWJvdXQgcmVlZnMgaW50ZXJzZWN0aW5nIHdpdGggbXVsdGlwbGUgcG9seWdvbnMuXG5cbiAgICAgICAgLy90aGlzIHNlZW1zIGxpa2UgYSByZWN1cnNpdmUgc29sdXRpb24gd291bGQgd29yayBoZXJlLi4uXG5cbiAgICAqL1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbl9wb2ludHMgPSBbXTtcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHBvbHlnb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpbnRlcnNlY3Rpb25fcG9pbnRzID0gcG9seWdvbnNbal0uZ2V0X2ludGVyc2VjdGlvbl9wb2ludHModGhpcy5yZWVmc1tpXSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgICAgICAvL1RPRE86IGdvIHRocm91Z2ggYWxsIHRoZSBwb2ludHMsIHJlbW92ZSB0aGUgb25lcyB0aGF0IGZhbGwgaW5zaWRlIGFub3RoZXIgc3F1YXJlXG5cbiAgICAgICAgLy9UT0RPOiBzb3J0IHRoZSBwb2ludHMuIHN0YXJ0IGF0IHRvcCBsZWZ0LCB0aGVuIGdvIGRvd24sIHJlbW92aW5nIHRoZW0gYXMgeW91IGdvLiBUZW4gZ28gZnJvbSByaWdodCB0byBsZWZ0LlxuXG4gICAgcmV0dXJuIGxpbmVzO1xufTtcblxuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2RpYWdzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVlZnMubWFwKGZ1bmN0aW9uKHIpIHtyZXR1cm4gci5nZXRfZGlhZ29uYWwoKTt9KTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5hZGRfcmVlZiA9IGZ1bmN0aW9uKHJlZWYpIHtcbiAgICB0aGlzLnJlZWZzLnB1c2gocmVlZik7XG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZGVsZXRlX3JlZWYgPSBmdW5jdGlvbihyZWVmKSB7XG4gICAgdGhpcy5yZWVmcy5zcGxpY2UodGhpcy5yZWVmcy5pbmRleE9mKHJlZWYpLCAxKTtcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIHRoaXMucmVlZnMuZm9yRWFjaChmdW5jdGlvbihyZWVmKSB7XG4gICAgICAgIHJlZWYuZHJhdyhjb250ZXh0KTtcbiAgICB9KTtcblxuICAgIHRoaXMudHJpYW5ndWxhdGlvbi5kcmF3KGNvbnRleHQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPY2VhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlb21ldHJ5ID0gcmVxdWlyZShcIi4vZ2VvbWV0cnkuanNcIik7XG52YXIgUG9pbnQgPSBnZW9tZXRyeS5Qb2ludDtcbnZhciBMaW5lID0gZ2VvbWV0cnkuTGluZTtcblxuZnVuY3Rpb24gUmVlZih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMucG9pbnRzID0gW25ldyBQb2ludCh0aGlzLngsIHRoaXMueSksIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSArIHRoaXMuaGVpZ2h0KSwgbmV3IFBvaW50KHRoaXMueCArIHRoaXMud2lkdGgsIHRoaXMueSArIHRoaXMuaGVpZ2h0KSwgbmV3IFBvaW50KHRoaXMueCArIHRoaXMud2lkdGgsIHRoaXMueSArIDApXTtcbn1cblxuUmVlZi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiI0FBNTU1NVwiO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50cztcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9saW5lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldF9wb2ludHMoKTtcblxuICAgIHJldHVybiBbbmV3IExpbmUocG9pbnRzWzBdLCBwb2ludHNbMV0pLCBuZXcgTGluZShwb2ludHNbMV0sIHBvaW50c1syXSksIG5ldyBMaW5lKHBvaW50c1syXSwgcG9pbnRzWzNdKSwgbmV3IExpbmUocG9pbnRzWzNdLCBwb2ludHNbMF0pXTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9kaWFnb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldF9wb2ludHMoKTtcblxuICAgIHJldHVybiBuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1syXSk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfZGlhZ29uYWxzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIFtuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1syXSksIG5ldyBMaW5lKHRoaXMucG9pbnRzWzFdLCB0aGlzLnBvaW50c1szXSldO1xufTtcblxuUmVlZi5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgZGlhZzEgPSBuZXcgTGluZSh0aGlzLnBvaW50c1swXSwgdGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBkaWFnMiA9IG5ldyBMaW5lKHRoaXMucG9pbnRzWzFdLCB0aGlzLnBvaW50c1szXSk7XG5cbiAgICByZXR1cm4gZGlhZzEuaW50ZXJzZWN0cyhsaW5lKSB8fCAgZGlhZzIuaW50ZXJzZWN0cyhsaW5lKTtcbn07XG5cblJlZWYucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBwLnggPj0gdGhpcy54ICYmIHAueSA+PSB0aGlzLnkgJiYgcC54IDw9IHRoaXMueCArIHRoaXMud2lkdGggJiYgcC55IDw9IHRoaXMueSArIHRoaXMuaGVpZ2h0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWVmO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIFNjaG9vbChvY2VhbiwgdGFyZ2V0KSB7XG4gICAgdGhpcy5maXNoID0gW107XG4gICAgdGhpcy5vY2VhbiA9IG9jZWFuO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xufVxuXG5TY2hvb2wucHJvdG90eXBlLmFkZF9maXNoID0gZnVuY3Rpb24oZmlzaCkge1xuICAgIHRoaXMuZmlzaC5wdXNoKGZpc2gpO1xuICAgIGZpc2guc2V0X3BhdGgodGhpcy5vY2Vhbi5nZXRfcGF0aF90byhmaXNoLnBvcywgdGhpcy50YXJnZXQpKTtcbn07XG5cblNjaG9vbC5wcm90b3R5cGUuc2V0X3RhcmdldCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmZpc2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5maXNoW2ldLnNldF9wYXRoKHRoaXMub2NlYW4uZ2V0X3BhdGhfdG8odGhpcy5maXNoW2ldLnBvcywgdGFyZ2V0KSk7XG4gICAgfVxufTtcblxuU2Nob29sLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIHRoaXMuZmlzaC5mb3JFYWNoKGZ1bmN0aW9uKGZpc2gpIHtcbiAgICAgICAgZmlzaC5kcmF3KGNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDU7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiI0FBMzMzM1wiO1xuICAgIGNvbnRleHQuYXJjKHRoaXMudGFyZ2V0LngsIHRoaXMudGFyZ2V0LnksIDE1LCAwLCBNYXRoLlBJICogMik7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nob29sO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBTdGF0cyA9IHtcbiAgICBzdGFydCA6IHt9LFxuICAgIHZhbHVlcyA6IHt9XG59O1xuXG5TdGF0cy5zdGFydCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5zdGFydFtuYW1lXSA9ICtuZXcgRGF0ZSgpO1xufTtcblxuU3RhdHMuZmluaXNoID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMuYWRkX3ZhbHVlKG5hbWUsICtuZXcgRGF0ZSgpIC0gdGhpcy5zdGFydFtuYW1lXSk7XG59O1xuXG5TdGF0cy5hZGRfdmFsdWUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIGlmKCF0aGlzLnZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICB0aGlzLnZhbHVlc1tuYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWVzW25hbWVdLnB1c2godmFsdWUpO1xufTtcblxuU3RhdHMuZ2V0X3ZhbHVlcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXNbbmFtZV07XG59O1xuXG5TdGF0cy5hdmVyYWdlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdldF92YWx1ZXMobmFtZSkucmVkdWNlKGZ1bmN0aW9uKHN1bSwgdmFsdWUpIHtyZXR1cm4gc3VtICsgdmFsdWU7fSkgLyB0aGlzLmdldF92YWx1ZXMobmFtZSkubGVuZ3RoO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0cztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTGluZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5MaW5lO1xudmFyIFRyaWFuZ2xlID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlRyaWFuZ2xlO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xudmFyIEhhc2hNYXAgPSByZXF1aXJlKCcuL2hhc2htYXAuanMnKTtcbnZhciBTZXRNdWx0aU1hcCA9IHJlcXVpcmUoJy4vaGFzaG1hcC5qcycpLlNldE11bHRpTWFwO1xudmFyIEhhc2hTZXQgPSByZXF1aXJlKCcuL2hhc2htYXAuanMnKS5IYXNoU2V0O1xuXG5mdW5jdGlvbiBUcmlhbmd1bGF0aW9uKHBvaW50cywgY29uc3RyYWludHMsIHJlbW92YWJsZV9jb25zdHJhaW50cykge1xuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgIHRoaXMuY29uc3RyYWludHMgPSBjb25zdHJhaW50cztcbiAgICB2YXIgdHJpYW5ndWxhdGVkID0gdGhpcy50cmlhbmd1bGF0ZShwb2ludHMsIHRoaXMuY29uc3RyYWludHMsIHJlbW92YWJsZV9jb25zdHJhaW50cyk7XG5cbiAgICB0aGlzLmxpbmVzID0gdHJpYW5ndWxhdGVkLmxpbmVzO1xuICAgIHRoaXMuZ3JhcGggPSB0aGlzLmJ1aWxkX2dyYXBoKHRoaXMubGluZXMsIHRyaWFuZ3VsYXRlZC5lZGdlcywgY29uc3RyYWludHMpO1xuXG59XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnRyaWFuZ3VsYXRlID0gZnVuY3Rpb24ocG9pbnRzLCBjb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSB7XG4gICAgLy9UT0RPOiBtYWtlIHRoZSB0cmlhbmd1bGF0aW9uIGRlbHVhbnVheVxuICAgIHZhciBlZGdlcyA9IG5ldyBTZXRNdWx0aU1hcCgpO1xuXG4gICAgdmFyIGxpbmVzID0gY29uc3RyYWludHMuc2xpY2UoKTtcblxuICAgIGZvcih2YXIgayA9IDA7IGsgPCBjb25zdHJhaW50cy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgbCA9IGNvbnN0cmFpbnRzW2tdO1xuICAgICAgICBlZGdlcy5wdXQobC5wMSwgbC5wMik7XG4gICAgICAgIGVkZ2VzLnB1dChsLnAyLCBsLnAxKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCBwb2ludHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwb3NzaWJsZV9saW5lID0gbmV3IExpbmUocG9pbnRzW2ldLCBwb2ludHNbal0pO1xuICAgICAgICAgICAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghcG9zc2libGVfbGluZS5pbnRlcnNlY3RzX2FueShsaW5lcykgJiYgIXBvc3NpYmxlX2xpbmUuaW50ZXJzZWN0c19hbnkocmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2gocG9zc2libGVfbGluZSk7XG4gICAgICAgICAgICAgICAgZWRnZXMucHV0KHBvaW50c1tpXSwgcG9pbnRzW2pdKTtcbiAgICAgICAgICAgICAgICBlZGdlcy5wdXQocG9pbnRzW2pdLCBwb2ludHNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluZXM6IGxpbmVzLFxuICAgICAgICBlZGdlczogZWRnZXNcbiAgICB9O1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuYnVpbGRfZ3JhcGggPSBmdW5jdGlvbihsaW5lcywgY29ubmVjdHMsIGNvbnN0cmFpbnRzKSB7XG4gICAgLy9UT0RPOiBuZXZlciB0cmF2ZXJzZSB0aGUgY29uc3RyYWludHMgKGVzcGVjaWFsbHkgbm90IHRoZSBvdXRlciBvbmVzKVxuXG4gICAgdmFyIGdyYXBoID0gW107XG5cbiAgICBsaW5lcyA9IG5ldyBIYXNoU2V0KGxpbmVzKTtcblxuXG4gICAgdmFyIGNoZWNrZWQgPSBuZXcgSGFzaFNldCgpO1xuICAgIHZhciB0cmlhbmdsZXMgPSBuZXcgSGFzaFNldCgpO1xuICAgIHZhciB0cmlhbmdsZXNfYnlfZWRnZXMgPSBuZXcgU2V0TXVsdGlNYXAoKTtcbiAgICB2YXIgdG9fY2hlY2sgPSBbbGluZXMuZ2V0X2FueSgpXTtcbiAgICAvL2FkZCBhbiBlZGdlLlxuICAgIHZhciBjb250ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjYW52YXNcIilbMF0uZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgZm9yKHZhciBsID0gMDsgbCA8IGNvbnN0cmFpbnRzLmxlbmd0aDsgbCsrKXtcbiAgICAgICAgbGluZXMucmVtb3ZlKGNvbnN0cmFpbnRzW2xdKTtcbiAgICAgICAgY2hlY2tlZC5hZGQoY29uc3RyYWludHNbbF0pO1xuICAgIH1cblxuICAgIHdoaWxlICh0b19jaGVjay5sZW5ndGggfHwgbGluZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBjaGVja2luZztcbiAgICAgICAgaWYgKHRvX2NoZWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgY2hlY2tpbmcgPSB0b19jaGVjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoZWNraW5nID0gbGluZXMuZ2V0X2FueSgpO1xuICAgICAgICAgICAgaWYoIWNoZWNraW5nKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNoZWNrZWQuYWRkKGNoZWNraW5nKTtcbiAgICAgICAgbGluZXMucmVtb3ZlKGNoZWNraW5nKTtcblxuICAgICAgICB2YXIgcDFfbmVpZ2hib3JzID0gY29ubmVjdHMuZ2V0KGNoZWNraW5nLnAxKTsgLy9hbGwgbmVpZ2hib3VycyBwMVxuICAgICAgICB2YXIgcDJfbmVpZ2hib3JzID0gY29ubmVjdHMuZ2V0KGNoZWNraW5nLnAyKTtcbiAgICAgICAgdmFyIHNoYXJlZF9wb2ludHMgPSB0aGlzLmR1cGxpY2F0ZWQocDFfbmVpZ2hib3JzLmNvbmNhdChwMl9uZWlnaGJvcnMpKTtcblxuICAgICAgICB2YXIgdHMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXJlZF9wb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwMyA9IHNoYXJlZF9wb2ludHNbaV07XG4gICAgICAgICAgICB2YXIgdCA9IG5ldyBUcmlhbmdsZShjaGVja2luZy5wMSwgY2hlY2tpbmcucDIsIHAzKTtcbiAgICAgICAgICAgIHZhciBwMXAycDMgPSB0cmlhbmdsZXMuZ2V0KHQpO1xuXG4gICAgICAgICAgICB0LmZpbGxfdHJpYW5nbGUoY29udGV4dCk7XG4gICAgICAgICAgICBjaGVja2luZy5kcmF3KGNvbnRleHQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcblxuICAgICAgICAgICAgaWYgKCFwMXAycDMpIHtcbiAgICAgICAgICAgICAgICBwMXAycDMgPSB0O1xuICAgICAgICAgICAgICAgIHRyaWFuZ2xlcy5hZGQocDFwMnAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHAxcDMgPSBuZXcgTGluZShjaGVja2luZy5wMSwgcDMpO1xuXG4gICAgICAgICAgICB0cmlhbmdsZXNfYnlfZWRnZXMucHV0KGNoZWNraW5nLCBwMXAycDMpO1xuXG4gICAgICAgICAgICBpZiAoIWNoZWNrZWQuY29udGFpbnMocDFwMykpIHtcbiAgICAgICAgICAgICAgICB0b19jaGVjay5wdXNoKHAxcDMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcDJwMyA9IG5ldyBMaW5lKGNoZWNraW5nLnAyLCBwMyk7XG4gICAgICAgICAgICBpZiAoIWNoZWNrZWQuY29udGFpbnMocDJwMykpIHtcbiAgICAgICAgICAgICAgICB0b19jaGVjay5wdXNoKHAycDMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cy5wdXNoKHAxcDJwMyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL1RPRE86IGNvdWxkIHByb2JhYmx5IGRvIHRoaXMgaW5saW5lIChsaWtlIGluIHRoZSBmb3IgbG9vcHMpXG4gICAgdmFyIHRyaWFuZ2xlX2FyciA9IHRyaWFuZ2xlcy50b19hcnJheSgpO1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCB0cmlhbmdsZV9hcnIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIHRyaWFuZ2xlID0gdHJpYW5nbGVfYXJyW2pdO1xuICAgICAgICB2YXIgbmVpZ2hicyA9IHRyaWFuZ2xlc19ieV9lZGdlcy5nZXQodHJpYW5nbGUuZWRnZXNbMF0pXG4gICAgICAgICAgICAuY29uY2F0KHRyaWFuZ2xlc19ieV9lZGdlcy5nZXQodHJpYW5nbGUuZWRnZXNbMV0pXG4gICAgICAgICAgICAuY29uY2F0KHRyaWFuZ2xlc19ieV9lZGdlcy5nZXQodHJpYW5nbGUuZWRnZXNbMl0pKSk7XG5cbiAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IG5laWdoYnMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGlmKCFuZWlnaGJzW2tdLmVxdWFscyh0cmlhbmdsZSkpIHtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZS5hZGRfbmVpZ2hib3IobmVpZ2hic1trXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJpYW5nbGVfYXJyO1xufTtcblxuLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IGxpbmVzLmxlbmd0aDsgaisrKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGsgPSBqICsgMTsgayA8IGxpbmVzLmxlbmd0aDsgaysrKSB7XG4vLyAgICAgICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy51bmlxdWUobGluZXNbaV0ucDEsIGxpbmVzW2ldLnAyLCBsaW5lc1tqXS5wMSwgbGluZXNbal0ucDIsIGxpbmVzW2tdLnAxLCBsaW5lc1trXS5wMik7XG4vLyAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMykge1xuLy8gICAgICAgICAgICAgICAgIHZhciB0cmlhbmdsZSA9IG5ldyBUcmlhbmdsZShsaW5lc1tpXSwgbGluZXNbal0sIGxpbmVzW2tdLCBwb2ludHMpO1xuLy9cbi8vICAgICAgICAgICAgICAgICBmb3IgKHZhciBsID0gMDsgbCA8IGdyYXBoLmxlbmd0aDsgbCsrKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIGlmIChncmFwaFtsXS5pc19uZWlnaGJvcih0cmlhbmdsZSkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlLmFkZF9uZWlnaGJvcihncmFwaFtsXSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBncmFwaFtsXS5hZGRfbmVpZ2hib3IodHJpYW5nbGUpO1xuLy8gICAgICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgIGdyYXBoLnB1c2godHJpYW5nbGUpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gfVxuLy9cbi8vIHJldHVybiBncmFwaDtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIG1pbl9kID0gSW5maW5pdHk7XG4gICAgdmFyIG1pbjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZCA9IHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHApO1xuICAgICAgICBpZiAoZCA8IG1pbl9kICYmICF0aGlzLmludGVyc2VjdHMobmV3IExpbmUocCwgdGhpcy5ncmFwaFtpXS5nZXRfY2VudGVyKCkpKSkge1xuICAgICAgICAgICAgbWluX2QgPSBkO1xuICAgICAgICAgICAgbWluID0gdGhpcy5ncmFwaFtpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtaW47XG59O1xuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZmluZF9wYXRoID0gZnVuY3Rpb24oc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIC8vVE9ETzogSXQncyBub3Qgb3B0aW1hbCBiZWNhdXNlIEkgY2FuIHJlZHVjZSBwYXRocyB1c2luZyBteSBhbGdvcml0aG0sIGJ1dCBkamtzdHJhcyBkb2Vzbid0IGRvIHRoYXQuY2FuIEkgYWN0dWFsbHkgcmVkdWNlIHRoZSBncmFwaCBiZWZvcmUgSSBydW4gZGprc3RyYXM/XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5nZXRfY2xvc2VzdF90cmlhbmdsZShzdGFydF9wb2ludCk7XG4gICAgdmFyIGVuZCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoZW5kX3BvaW50KTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGorKykge1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5kO1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5wcmV2O1xuICAgIH1cblxuICAgIGlmICghZW5kKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbc3RhcnRdO1xuICAgIHN0YXJ0LmQgPSAwO1xuICAgIHN0YXJ0Lm5vZGUgPSB1bmRlZmluZWQ7XG5cbiAgICBmdW5jdGlvbiBkaXN0YW5jZUNvbXBhcmF0b3IoYSwgYikge1xuICAgICAgICByZXR1cm4gYS5kID4gYi5kO1xuICAgIH1cblxuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBxdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdF9wYXRoKGN1cnJlbnQsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdXJyZW50Lm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBjdXJyZW50LmQgKyBjdXJyZW50Lm5laWdoYm9yc1tpXS5kaXN0YW5jZShjdXJyZW50KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50Lm5laWdoYm9yc1tpXS5kID09PSAndW5kZWZpbmVkJyB8fCBuZXdEIDwgY3VycmVudC5uZWlnaGJvcnNbaV0uZCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLmQgPSBuZXdEO1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLnByZXYgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5pbmRleE9mKGN1cnJlbnQubmVpZ2hib3JzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChjdXJyZW50Lm5laWdoYm9yc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcXVldWUuc29ydChkaXN0YW5jZUNvbXBhcmF0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdF9wYXRoID0gZnVuY3Rpb24obm9kZSwgc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIHZhciBwYXRoID0gW107XG4gICAgd2hpbGUgKG5vZGUucHJldikge1xuICAgICAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuXG4gICAgcGF0aC5yZXZlcnNlKCk7XG4gICAgcGF0aC5wdXNoKGVuZF9wb2ludCk7XG4gICAgcGF0aC51bnNoaWZ0KHN0YXJ0X3BvaW50KTtcbiAgICB0aGlzLnJlZHVjZV9wYXRoKHBhdGgpO1xuXG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5kdXBsaWNhdGVkID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgYXJyLnNvcnQoKTtcbiAgICB2YXIgdmFscyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBpZihhcnJbaV0uZXF1YWxzKGFycltpKzFdKSkge1xuICAgICAgICAgICAgdmFscy5wdXNoKGFycltpXSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFscztcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnJlZHVjZV9wYXRoID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzLmludGVyc2VjdHMobmV3IExpbmUocGF0aFtpXSwgcGF0aFtpICsgMl0pKSkge1xuICAgICAgICAgICAgcGF0aC5zcGxpY2UoaSArIDEsIDEpO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuY29uc3RyYWludHNbaV0uaW50ZXJzZWN0cyhsaW5lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGlmIChDT05GSUcuREVCVUcgPiAzKSB7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgICAgIHBvaW50LmRyYXcoY29udGV4dCwgXCIjNTU1NUFBXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpbmVzLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgbGluZS5kcmF3KGNvbnRleHQsIFwiIzU1NTVBQVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiA0KSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5maWxsX3RyaWFuZ2xlKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDEpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmRyYXdfZWRnZXMoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDApIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmRyYXdfdmVydGV4KGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiAyKSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5kcmF3X3dlaWdodHMoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVHJpYW5ndWxhdGlvbjtcbiJdfQ==
