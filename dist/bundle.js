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

Controls.prototype.button = function(text, click) {
    var input = document.createElement("input");
    input.type = "button";
    input.value = text;
    input.addEventListener("click", click);

    this.add_control(input);
};

Controls.prototype.slider = function(text, obj, prop, min, max, step) {
    var label = document.createElement("label");
    label.innerHTML = text;

    var input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = obj[prop];

    input.addEventListener("input", function(e) {
        console.log(e.target.value);
        obj[prop] = e.target.value;
    });

    var div = document.createElement("div");
    div.appendChild(label);
    label.appendChild(input);

    this.add_control(div);
};

Controls.prototype.radio = function(text, obj, prop, values, value) {
    var div = document.createElement("div");

    var label = document.createElement("label");
    label.innerHTML = text;
    div.appendChild(label);

    function update(e) {
        obj[prop] = e.target.value;
        console.log(obj);
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

function Triangle(e1, e2, e3, points) {
    this.edges = [e1, e2, e3];
    this.neighbors = [];
    this.points = points;
    this.color = getRandomColor();
}

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

Triangle.prototype.fill_triangle = function(context, color) {
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
/*global CONFIG : true */

var canvas = document.getElementsByTagName("canvas")[0];
var context = canvas.getContext("2d");
CONFIG = {};
CONFIG.DEBUG = 5;

(function() {
    'use strict';
    var Fish = require('./fish.js');
    var Point = require('./geometry.js').Point;
    var School = require('./school.js');
    var Ocean = require('./ocean.js');
    var Reef = require('./reef.js');
    var Controls = require('./controls.js');

    var mouse = {mode : "target",
                 modes : ["target", "create", "delete"]};

    var controls = new Controls();
    controls.slider("Debug: ", CONFIG, "DEBUG", 0, 10, 1);
    controls.radio("Mode: ", mouse, "mode", mouse.modes);

    var ocean = new Ocean(canvas.width, canvas.height, [new Reef(200, 200, 200, 200),new Reef(800, 200, 200, 200)]);

    //TODO: controllable spawning
    //TODO: animation while drawing a rectagle

    var school = new School(ocean, new Point(500,400));
    school.add_fish(new Fish(200, 120, 10, 0.25));
    school.add_fish(new Fish(200, 120, 10, 0.2));
    school.add_fish(new Fish(30, 300, 10, 0.5));
    school.add_fish(new Fish(130, 500, 20, 0.05));
    school.add_fish(new Fish(230, 150, 20, 0.1));
    school.add_fish(new Fish(230, 150, 20, 0.15));

    mouse.target = function(p) {
        school.set_target(p);
    };

    mouse.delete = function(p) {
        //TODO: find if the click is inside a reef, delete and retriangulate if so.
        var reef = ocean.get_reef_under_point(p);
        if(reef) {
            ocean.delete_reef(reef);
        }
    };

    //TODO: time things (then use reverse watchables to display the times.)
    //TODO: create reverse watchable variables, return a function from controls, when the funciton is called it uses a closure to update the value and gets the value
    //TODO: bug where point1 isn't reset on changing modes
    mouse.create = function(p2) {
        if(!mouse.p1) {
            mouse.p1 = p2;
        } else {
            //TODO: either deal with overlapping reefs or don't allow them.
            var top_left = new Point(Math.min(mouse.p1.x, p2.x), Math.min(mouse.p1.y, p2.y));
            var bottom_right = new Point(Math.max(mouse.p1.x, p2.x), Math.max(mouse.p1.y, p2.y));
            var dimens = bottom_right.subtract(top_left);
            ocean.add_reef(new Reef(top_left.x, top_left.y, dimens.x, dimens.y));

            delete mouse.p1;
        }

    };

    canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var p = new Point(e.clientX - rect.left, e.clientY - rect.top);
        mouse[mouse.mode](p);
    }, false);

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

},{"./controls.js":1,"./fish.js":2,"./geometry.js":3,"./ocean.js":5,"./reef.js":6,"./school.js":7}],5:[function(require,module,exports){
'use strict';

var Reef = require('./reef.js');
var Line = require('./geometry.js').Line;
var Triangle = require('./geometry.js').Triangle;
var Point = require('./geometry.js').Point;
var Triangulation = require('./triangulation.js');

function Ocean(width, height, reefs) {
    this.width = width;
    this.height = height;
    this.reefs = reefs;
    this.retriangulate();
}

//TODO: create a triangulation for every size of fish
Ocean.prototype.retriangulate = function () {
    this.triangulation = new Triangulation(this.get_points(), this.get_lines(), this.get_diags());
};

Ocean.prototype.resize = function(width, height) {
    this.width = width;
    this.height = height;

    this.retriangulate();
};

Ocean.prototype.get_path_to = function(start_point, end_point) {
    return this.triangulation.find_path(start_point, end_point);
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

},{"./geometry.js":3,"./reef.js":6,"./triangulation.js":8}],6:[function(require,module,exports){
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

},{"./geometry.js":3}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";

var Line = require('./geometry.js').Line;
var Triangle = require('./geometry.js').Triangle;
var Point = require('./geometry.js').Point;

function Triangulation(points, constraints, removable_constraints) {
    this.points = points;
    this.constraints = removable_constraints.concat(constraints);
    this.lines = this.triangulate(points, this.constraints);
    this.lines.splice(0, removable_constraints.length);
    this.graph = this.build_graph(this.lines);
}

Triangulation.prototype.triangulate = function(points, constraints) {
    //TODO: make the triangulation deluanuay
    var lines = constraints.slice();

    for (var i = 0; i < points.length; i++) {
        for (var j = i + 1; j < points.length; j++) {
            var possible_line = new Line(points[i], points[j]);
            var valid = true;
            if (!possible_line.intersects_any(lines)) {
                lines.push(possible_line);
            }
        }
    }

    return lines;
};

Triangulation.prototype.build_graph = function(lines) {
    //TODO: optimise this....
    var graph = [];

    for (var i = 0; i < lines.length; i++) {
        for (var j = i + 1; j < lines.length; j++) {
            for (var k = j + 1; k < lines.length; k++) {
                var points = this.unique(lines[i].p1, lines[i].p2, lines[j].p1, lines[j].p2, lines[k].p1, lines[k].p2);
                if (points.length === 3) {
                    var triangle = new Triangle(lines[i], lines[j], lines[k], points);

                    for (var l = 0; l < graph.length; l++) {
                        if (graph[l].is_neighbor(triangle)) {
                            triangle.add_neighbor(graph[l]);
                            graph[l].add_neighbor(triangle);
                        }
                    }
                    graph.push(triangle);
                }
            }
        }
    }

    return graph;
};

Triangulation.prototype.get_closest_triangle = function(p) {
    //TODO: I could sort the graph and make this faster.

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

Triangulation.prototype.unique = function() {
    var arr = [];
    for (var i = 0; i < arguments.length; i++) {
        var contained = false;
        for (var j = 0; j < arr.length; j++) {
            if (arguments[i].equals(arr[j])) {
                contained = true;
                break;
            }
        }
        if (!contained) {
            arr.push(arguments[i]);
        }
    }

    return arr;
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

},{"./geometry.js":3}]},{},[4])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvY29udHJvbHMuanMiLCJhcHAvanMvZmlzaC5qcyIsImFwcC9qcy9nZW9tZXRyeS5qcyIsImFwcC9qcy9pbmRleC5qcyIsImFwcC9qcy9vY2Vhbi5qcyIsImFwcC9qcy9yZWVmLmpzIiwiYXBwL2pzL3NjaG9vbC5qcyIsImFwcC9qcy90cmlhbmd1bGF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDckhBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDeEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDck9BO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xIQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIid1c2Ugc3RyaWN0Jztcbi8qanNoaW50IGJyb3dzZXIgOiB0cnVlKi9cblxuZnVuY3Rpb24gQ29udHJvbHMoKSB7XG4gICAgdGhpcy5sb2FkX3N0eWxlKCk7XG5cbiAgICB0aGlzLmNvbnRyb2xfZGl2KCk7XG4gICAgdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY2FudmFzXCIpWzBdO1xuICAgIHRoaXMuY2FudmFzX2RpdigpLmFwcGVuZENoaWxkKGNhbnZhcyk7XG5cbiAgICBjYW52YXMuc3R5bGUud2lkdGggPScxMDAlJztcbiAgICBjYW52YXMuc3R5bGUuaGVpZ2h0PScxMDAlJztcbiAgICBjYW52YXMud2lkdGggID0gY2FudmFzLm9mZnNldFdpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBjYW52YXMub2Zmc2V0SGVpZ2h0O1xufVxuXG5Db250cm9scy5wcm90b3R5cGUuY29udHJvbF9kaXYgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy5kaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIHRoaXMuZGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiY29udHJvbHNcIik7XG4gICAgdGhpcy5kaXYuc3R5bGUucmlnaHQgPSBcIjBcIjtcbiAgICB0aGlzLmRpdi5zdHlsZS53aWR0aCA9IFwiMTklXCI7XG4gICAgdGhpcy5kaXYuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XG4gICAgdGhpcy5kaXYuc3R5bGUuZmxvYXQgPSBcInJpZ2h0XCI7XG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKHRoaXMuZGl2KTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5jYW52YXNfZGl2ID0gZnVuY3Rpb24gKCkge1xuICAgIHZhciBjYW52YXNfZGl2ID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImRpdlwiKTtcbiAgICBjYW52YXNfZGl2LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsIFwiY2FudmFzLWNvbnRhaW5lclwiKTtcbiAgICBjYW52YXNfZGl2LnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgIGNhbnZhc19kaXYuc3R5bGUud2lkdGggPSBcIjgwJVwiO1xuICAgIGNhbnZhc19kaXYuc3R5bGUuaGVpZ2h0ID0gXCIxMDAlXCI7XG4gICAgY2FudmFzX2Rpdi5zdHlsZS5mbG9hdCA9IFwibGVmdFwiO1xuXG4gICAgZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJib2R5XCIpWzBdLmFwcGVuZENoaWxkKGNhbnZhc19kaXYpO1xuXG4gICAgcmV0dXJuIGNhbnZhc19kaXY7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUubG9hZF9zdHlsZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsaW5rID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxpbmtcIik7XG4gICAgbGluay5ocmVmID0gXCJzdHlsZS9jb250cm9scy5jc3NcIjtcbiAgICBsaW5rLnJlbCA9IFwic3R5bGVzaGVldFwiO1xuICAgIGxpbmsudHlwZSA9IFwidGV4dC9jc3NcIjtcbiAgICBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF0uYXBwZW5kQ2hpbGQobGluayk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUuYWRkX2NvbnRyb2wgPSBmdW5jdGlvbihjb250cm9sKSB7XG4gICAgdGhpcy5kaXYuYXBwZW5kQ2hpbGQoY29udHJvbCk7XG59O1xuXG5Db250cm9scy5wcm90b3R5cGUuYnV0dG9uID0gZnVuY3Rpb24odGV4dCwgY2xpY2spIHtcbiAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgaW5wdXQudHlwZSA9IFwiYnV0dG9uXCI7XG4gICAgaW5wdXQudmFsdWUgPSB0ZXh0O1xuICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLCBjbGljayk7XG5cbiAgICB0aGlzLmFkZF9jb250cm9sKGlucHV0KTtcbn07XG5cbkNvbnRyb2xzLnByb3RvdHlwZS5zbGlkZXIgPSBmdW5jdGlvbih0ZXh0LCBvYmosIHByb3AsIG1pbiwgbWF4LCBzdGVwKSB7XG4gICAgdmFyIGxhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xuICAgIGxhYmVsLmlubmVySFRNTCA9IHRleHQ7XG5cbiAgICB2YXIgaW5wdXQgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7XG4gICAgaW5wdXQudHlwZSA9IFwicmFuZ2VcIjtcbiAgICBpbnB1dC5taW4gPSBtaW47XG4gICAgaW5wdXQubWF4ID0gbWF4O1xuICAgIGlucHV0LnN0ZXAgPSBzdGVwO1xuICAgIGlucHV0LnZhbHVlID0gb2JqW3Byb3BdO1xuXG4gICAgaW5wdXQuYWRkRXZlbnRMaXN0ZW5lcihcImlucHV0XCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgY29uc29sZS5sb2coZS50YXJnZXQudmFsdWUpO1xuICAgICAgICBvYmpbcHJvcF0gPSBlLnRhcmdldC52YWx1ZTtcbiAgICB9KTtcblxuICAgIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgIGRpdi5hcHBlbmRDaGlsZChsYWJlbCk7XG4gICAgbGFiZWwuYXBwZW5kQ2hpbGQoaW5wdXQpO1xuXG4gICAgdGhpcy5hZGRfY29udHJvbChkaXYpO1xufTtcblxuQ29udHJvbHMucHJvdG90eXBlLnJhZGlvID0gZnVuY3Rpb24odGV4dCwgb2JqLCBwcm9wLCB2YWx1ZXMsIHZhbHVlKSB7XG4gICAgdmFyIGRpdiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7XG5cbiAgICB2YXIgbGFiZWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gICAgbGFiZWwuaW5uZXJIVE1MID0gdGV4dDtcbiAgICBkaXYuYXBwZW5kQ2hpbGQobGFiZWwpO1xuXG4gICAgZnVuY3Rpb24gdXBkYXRlKGUpIHtcbiAgICAgICAgb2JqW3Byb3BdID0gZS50YXJnZXQudmFsdWU7XG4gICAgICAgIGNvbnNvbGUubG9nKG9iaik7XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHZhbHVlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGFiZWxcIik7XG4gICAgICAgIHZhciByYWRpb0xhYmVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImxhYmVsXCIpO1xuICAgICAgICByYWRpb0xhYmVsLmlubmVySFRNTCA9IHZhbHVlc1tpXTtcbiAgICAgICAgZGl2LmFwcGVuZENoaWxkKHJhZGlvTGFiZWwpO1xuXG4gICAgICAgIHZhciBpbnB1dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKTtcbiAgICAgICAgaW5wdXQudHlwZSA9IFwicmFkaW9cIjtcbiAgICAgICAgaW5wdXQubmFtZSA9IHByb3A7XG4gICAgICAgIGlucHV0LnZhbHVlID0gdmFsdWVzW2ldO1xuICAgICAgICBpbnB1dC5jaGVja2VkID0gdmFsdWVzW2ldID09PSBvYmpbcHJvcF07XG4gICAgICAgIGlucHV0LmFkZEV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIiwgdXBkYXRlKTtcblxuICAgICAgICByYWRpb0xhYmVsLmFwcGVuZENoaWxkKGlucHV0KTtcbiAgICB9XG5cblxuICAgIHRoaXMuYWRkX2NvbnRyb2woZGl2KTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBDb250cm9scztcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xuXG5mdW5jdGlvbiBGaXNoKHgsIHksIHJhZGl1cywgc3BlZWQpIHtcbiAgICB0aGlzLnBvcyA9IG5ldyBQb2ludCh4LHkpO1xuICAgIHRoaXMucm90YXRpb24gPSBNYXRoLlBJIC8gMjtcbiAgICB0aGlzLnNwZWVkID0gc3BlZWQ7XG4gICAgdGhpcy5yb3RhdGlvbl9zcGVlZCA9IHNwZWVkIC8gMTA7XG4gICAgdGhpcy5yYWRpdXMgPSByYWRpdXM7XG4gICAgdGhpcy5jb2xsaWRpbmcgPSBmYWxzZTtcbn1cblxuRmlzaC5wcm90b3R5cGUuc2V0X3BhdGggPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgdGhpcy5wYXRoID0gcGF0aDtcbn07XG5cbkZpc2gucHJvdG90eXBlLm1vdmUgPSBmdW5jdGlvbihkZWx0YV90aW1lLCBjb2xsaWRhYmxlcykge1xuICAgIHZhciB0YXJnZXQgPSB0aGlzLm5leHRfdGFyZ2V0KCk7XG5cbiAgICBpZiAoIXRhcmdldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdmFyIGRlbHRhX3ZlbG9jaXR5ID0gdGhpcy5zcGVlZCAqIGRlbHRhX3RpbWU7XG5cbiAgICAvL3JvdGF0ZSB0b3dhcmRzIHRhcmdldCwgdGhlbiBtb3ZlIHRvd2FyZHMgaXQuXG4gICAgdGhpcy5wb3MueCArPSBNYXRoLmNvcyh0aGlzLnJvdGF0aW9uKSAqIGRlbHRhX3ZlbG9jaXR5O1xuICAgIHRoaXMucG9zLnkgKz0gTWF0aC5zaW4odGhpcy5yb3RhdGlvbikgKiBkZWx0YV92ZWxvY2l0eTtcblxuICAgIC8vVHJhY2UgYSByYXkgdG8gZWFjaCBhbmQgdGVzdCBpZiB3ZSdkIGJlIHRvdWNoaW5nIGFueSBvZiB0aGVtIGFmdGVyIG1vdmluZy5cblxuICAgIGNvbGxpZGFibGVzLmZvckVhY2goZnVuY3Rpb24oY29sbGlkYWJsZSkge1xuICAgICAgICB0aGlzLmNvbGxpZGluZyA9IGNvbGxpZGFibGUucG9zLmRpc3RhbmNlKHRoaXMucG9zKSA8PSAwICYmIGNvbGxpZGFibGUgIT09IHRoaXM7XG4gICAgfS5iaW5kKHRoaXMpKTtcblxuXG4gICAgdmFyIGRlc2lyZWRfYW5nbGUgPSBNYXRoLmF0YW4yKHRhcmdldC55IC0gdGhpcy5wb3MueSwgdGFyZ2V0LnggLSB0aGlzLnBvcy54KTtcblxuICAgIC8vIHRoaXMucm90YXRpb24gPSBkZXNpcmVkX2FuZ2xlO1xuICAgIC8vIHRoaXMucm90YXRpb24gJT0gTWF0aC5QSSAqIDI7XG5cbiAgICB2YXIgY3dfZGlzdCA9ICgoKGRlc2lyZWRfYW5nbGUgLSB0aGlzLnJvdGF0aW9uKSAlIChNYXRoLlBJICogMikpICsgKE1hdGguUEkgKiAyKSkgJSAoTWF0aC5QSSAqIDIpO1xuICAgIHZhciBjY3dfZGlzdCA9ICgoKHRoaXMucm90YXRpb24gLSBkZXNpcmVkX2FuZ2xlKSAlIChNYXRoLlBJICogMikpICsgKE1hdGguUEkgKiAyKSkgJSAoTWF0aC5QSSAqIDIpO1xuXG4gICAgdmFyIGRlbHRhX3JvdGF0aW9uID0gdGhpcy5yb3RhdGlvbl9zcGVlZCAqIGRlbHRhX3RpbWU7XG5cbiAgICBpZiAoY3dfZGlzdCA8IGRlbHRhX3JvdGF0aW9uIHx8IGNjd19kaXN0IDwgZGVsdGFfcm90YXRpb24pIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiA9IGRlc2lyZWRfYW5nbGU7XG4gICAgfSBlbHNlIGlmIChjd19kaXN0ID4gY2N3X2Rpc3QpIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiAtPSBkZWx0YV9yb3RhdGlvbjtcbiAgICB9IGVsc2Uge1xuICAgICAgICB0aGlzLnJvdGF0aW9uICs9IGRlbHRhX3JvdGF0aW9uO1xuICAgIH1cblxuICAgIHRoaXMucm90YXRpb24gJT0gTWF0aC5QSSAqIDI7XG59O1xuXG5GaXNoLnByb3RvdHlwZS5uZXh0X3RhcmdldCA9IGZ1bmN0aW9uKCkge1xuICAgIGlmKCF0aGlzLnBhdGggfHwgdGhpcy5wYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGlmKHRoaXMucGF0aFswXS5kaXN0YW5jZSh0aGlzLnBvcykgPD0gMTAgJiYgdGhpcy5wYXRoLmxlbmd0aCA+IDEpIHtcbiAgICAgICAgdGhpcy5wYXRoLnNoaWZ0KCk7XG4gICAgfVxuXG5cbiAgICByZXR1cm4gdGhpcy5wYXRoWzBdO1xufTtcblxuRmlzaC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDI7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiIzAwMDAwMFwiO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xsaWRpbmcgPyBcIiNBQTc3NzdcIiA6IFwiI0FBQUFBQVwiO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyh0aGlzLnBvcy54LCB0aGlzLnBvcy55LCB0aGlzLnJhZGl1cywgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLnBvcy54LCB0aGlzLnBvcy55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvcy54ICsgTWF0aC5jb3ModGhpcy5yb3RhdGlvbikgKiB0aGlzLnJhZGl1cyAqIDEuNSwgdGhpcy5wb3MueSArIE1hdGguc2luKHRoaXMucm90YXRpb24pICogdGhpcy5yYWRpdXMgKiAxLjUpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG59O1xuXG5cbm1vZHVsZS5leHBvcnRzID0gRmlzaDtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBMaW5lKHAxLCBwMikge1xuICAgIHRoaXMucDEgPSBwMTtcbiAgICB0aGlzLnAyID0gcDI7XG59XG5cbkxpbmUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpICYmIHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSB8fFxuICAgICAgICAodGhpcy5wMS5lcXVhbHMobGluZS5wMikgJiYgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkpO1xufTtcblxuTGluZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yIHx8IFwiI0FBQUFBQVwiO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wMS54LCB0aGlzLnAxLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMucDIueCwgdGhpcy5wMi55KTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufTtcblxuTGluZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wMS50b1N0cmluZygpICsgXCIgPT4gXCIgKyB0aGlzLnAyLnRvU3RyaW5nKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIGlmICh0aGlzLmVxdWFscyhsaW5lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgczEgPSB0aGlzLnAyLnN1YnRyYWN0KHRoaXMucDEpO1xuICAgIHZhciBzMiA9IGxpbmUucDIuc3VidHJhY3QobGluZS5wMSk7XG5cbiAgICB2YXIgcyA9ICgtczEueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpICsgczEueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG4gICAgdmFyIHQgPSAoczIueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpIC0gczIueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG5cbiAgICBpZiAocyA+PSAwICYmIHMgPD0gMSAmJiB0ID49IDAgJiYgdCA8PSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaXNOYU4ocykgfHwgaXNOYU4odCkpIHtcbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG5vIHBvaW50cyB0aGV5IGRvbid0IG92ZXJsYXAuXG4gICAgICAgIGlmICghKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDEuZXF1YWxzKGxpbmUucDIpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm91bmRpbmdfY29udGFpbnMobGluZSkgfHwgbGluZS5ib3VuZGluZ19jb250YWlucyh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICAvL0NvbGluZWFyLCBlaXRoZXIgdGhleSBvdmVybGFwIG9yIHRoZXkgZG9uJ3QuLi5cbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG9uZSBwb2ludCwgdGhlbiB0aGV5IG92ZXJsYXAgaWYgYW55IG9mIHRoZSBwb2ludHMgZmFsbHMgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgbGluZXMuXG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBib3RoIHRoZXkncmUgZXF1YWwsIHdoaWNoIHdlIGNvdmVyIGFib3ZlXG5cblxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmJvdW5kaW5nX2NvbnRhaW5zID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciB0b3BfbGVmdCA9IG5ldyBQb2ludChNYXRoLm1pbih0aGlzLnAxLngsIHRoaXMucDIueCksIE1hdGgubWluKHRoaXMucDEueSwgdGhpcy5wMi55KSk7XG4gICAgdmFyIGJvdHRvbV9yaWdodCA9IG5ldyBQb2ludChNYXRoLm1heCh0aGlzLnAxLngsIHRoaXMucDIueCksIE1hdGgubWF4KHRoaXMucDEueSwgdGhpcy5wMi55KSk7XG5cbiAgICByZXR1cm4gbGluZS5wMS5iZXR3ZWVuKHRvcF9sZWZ0LCBib3R0b21fcmlnaHQpIHx8IGxpbmUucDIuYmV0d2Vlbih0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmludGVyc2VjdHNfYW55ID0gZnVuY3Rpb24obGluZXMpIHtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGxpbmVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIGlmICh0aGlzLmludGVyc2VjdHMobGluZXNba10pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIFBvaW50KHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG59XG5cblBvaW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIihcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gcG9pbnQueCAmJiB0aGlzLnkgPT09IHBvaW50Lnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLnNjYWxhcl9wcm9kdWN0ID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBuZXcgUG9pbnQoYyAqIHRoaXMueCwgYyAqIHRoaXMueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuY3Jvc3NfcHJvZHVjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRvdF9wcm9kdWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYmV0d2VlbiA9IGZ1bmN0aW9uKHAxLCBwMikge1xuICAgIHJldHVybiB0aGlzLnggPiBwMS54ICYmIHRoaXMueCA8IHAyLnggJiYgdGhpcy55ID4gcDEueSAmJiB0aGlzLnkgPCBwMi55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy54IC0gcC54LCAyKSArIE1hdGgucG93KHRoaXMueSAtIHAueSwgMikpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3IgfHwgXCIjQUFBQUFBXCI7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMueCwgdGhpcy55LCAxMCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xufTtcblxuZnVuY3Rpb24gVHJpYW5nbGUoZTEsIGUyLCBlMywgcG9pbnRzKSB7XG4gICAgdGhpcy5lZGdlcyA9IFtlMSwgZTIsIGUzXTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgIHRoaXMuY29sb3IgPSBnZXRSYW5kb21Db2xvcigpO1xufVxuXG5UcmlhbmdsZS5wcm90b3R5cGUuZ2V0X2NlbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vQ2VudHJvaWQ6XG4gICAgLy9yZXR1cm4gbmV3IFBvaW50KCh0aGlzLnBvaW50c1swXS54ICsgdGhpcy5wb2ludHNbMV0ueCArIHRoaXMucG9pbnRzWzJdLngpIC8gMywgKHRoaXMucG9pbnRzWzBdLnkgKyB0aGlzLnBvaW50c1sxXS55ICsgdGhpcy5wb2ludHNbMl0ueSkgLyAzKTtcblxuICAgIHZhciBhID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMV0pO1xuICAgIHZhciBiID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBjID0gdGhpcy5wb2ludHNbMV0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBwID0gYSArIGIgKyBjO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludCgoYSAqIHRoaXMucG9pbnRzWzJdLnggKyBiICogdGhpcy5wb2ludHNbMV0ueCArIGMgKiB0aGlzLnBvaW50c1swXS54KSAvIHAsIChhICogdGhpcy5wb2ludHNbMl0ueSArIGIgKiB0aGlzLnBvaW50c1sxXS55ICsgYyAqIHRoaXMucG9pbnRzWzBdLnkpIC8gcCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHQuZ2V0X2NlbnRlcigpKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgcDEgPSB0aGlzLnBvaW50c1swXTtcbiAgICB2YXIgcDIgPSB0aGlzLnBvaW50c1sxXTtcbiAgICB2YXIgcDMgPSB0aGlzLnBvaW50c1syXTtcblxuICAgIHZhciBhbHBoYSA9ICgocDIueSAtIHAzLnkpICogKHAueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwLnkgLSBwMy55KSkgL1xuICAgICAgICAoKHAyLnkgLSBwMy55KSAqIChwMS54IC0gcDMueCkgKyAocDMueCAtIHAyLngpICogKHAxLnkgLSBwMy55KSk7XG4gICAgdmFyIGJldGEgPSAoKHAzLnkgLSBwMS55KSAqIChwLnggLSBwMy54KSArIChwMS54IC0gcDMueCkgKiAocC55IC0gcDMueSkpIC9cbiAgICAgICAgKChwMi55IC0gcDMueSkgKiAocDEueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwMS55IC0gcDMueSkpO1xuICAgIHZhciBnYW1tYSA9IDEgLSBhbHBoYSAtIGJldGE7XG5cbiAgICByZXR1cm4gYWxwaGEgPiAwICYmIGJldGEgPiAwICYmIGdhbW1hID4gMDtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5pc19uZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0LmVkZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lZGdlc1tpXS5lcXVhbHModC5lZGdlc1tqXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuYWRkX25laWdoYm9yID0gZnVuY3Rpb24odCkge1xuICAgIHRoaXMubmVpZ2hib3JzLnB1c2godCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZmlsbF90cmlhbmdsZSA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG5cbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1sxXS54LCB0aGlzLnBvaW50c1sxXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1syXS54LCB0aGlzLnBvaW50c1syXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1swXS54LCB0aGlzLnBvaW50c1swXS55KTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5kcmF3X3dlaWdodHMgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KGQudG9GaXhlZCgwKSwgKHRoaXMuZ2V0X2NlbnRlcigpLnggKyB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueCkgLyAyICsgMTAsICh0aGlzLmdldF9jZW50ZXIoKS55ICsgdGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLnkpIC8gMiArIDEwKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd19lZGdlcyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUFBQUFBXCI7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLmdldF9jZW50ZXIoKS54LCB0aGlzLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLngsIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd192ZXJ0ZXggPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMuZ2V0X2NlbnRlcigpLngsIHRoaXMuZ2V0X2NlbnRlcigpLnksIDgsIDgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xuICAgIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnO1xuICAgIHZhciBjb2xvciA9ICcjJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5Qb2ludCA9IFBvaW50O1xubW9kdWxlLmV4cG9ydHMuTGluZSA9IExpbmU7XG5tb2R1bGUuZXhwb3J0cy5UcmlhbmdsZSA9IFRyaWFuZ2xlO1xuIiwiLypnbG9iYWwgQ09ORklHIDogdHJ1ZSAqL1xuXG52YXIgY2FudmFzID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjYW52YXNcIilbMF07XG52YXIgY29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5DT05GSUcgPSB7fTtcbkNPTkZJRy5ERUJVRyA9IDU7XG5cbihmdW5jdGlvbigpIHtcbiAgICAndXNlIHN0cmljdCc7XG4gICAgdmFyIEZpc2ggPSByZXF1aXJlKCcuL2Zpc2guanMnKTtcbiAgICB2YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG4gICAgdmFyIFNjaG9vbCA9IHJlcXVpcmUoJy4vc2Nob29sLmpzJyk7XG4gICAgdmFyIE9jZWFuID0gcmVxdWlyZSgnLi9vY2Vhbi5qcycpO1xuICAgIHZhciBSZWVmID0gcmVxdWlyZSgnLi9yZWVmLmpzJyk7XG4gICAgdmFyIENvbnRyb2xzID0gcmVxdWlyZSgnLi9jb250cm9scy5qcycpO1xuXG4gICAgdmFyIG1vdXNlID0ge21vZGUgOiBcInRhcmdldFwiLFxuICAgICAgICAgICAgICAgICBtb2RlcyA6IFtcInRhcmdldFwiLCBcImNyZWF0ZVwiLCBcImRlbGV0ZVwiXX07XG5cbiAgICB2YXIgY29udHJvbHMgPSBuZXcgQ29udHJvbHMoKTtcbiAgICBjb250cm9scy5zbGlkZXIoXCJEZWJ1ZzogXCIsIENPTkZJRywgXCJERUJVR1wiLCAwLCAxMCwgMSk7XG4gICAgY29udHJvbHMucmFkaW8oXCJNb2RlOiBcIiwgbW91c2UsIFwibW9kZVwiLCBtb3VzZS5tb2Rlcyk7XG5cbiAgICB2YXIgb2NlYW4gPSBuZXcgT2NlYW4oY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCBbbmV3IFJlZWYoMjAwLCAyMDAsIDIwMCwgMjAwKSxuZXcgUmVlZig4MDAsIDIwMCwgMjAwLCAyMDApXSk7XG5cbiAgICAvL1RPRE86IGNvbnRyb2xsYWJsZSBzcGF3bmluZ1xuICAgIC8vVE9ETzogYW5pbWF0aW9uIHdoaWxlIGRyYXdpbmcgYSByZWN0YWdsZVxuXG4gICAgdmFyIHNjaG9vbCA9IG5ldyBTY2hvb2wob2NlYW4sIG5ldyBQb2ludCg1MDAsNDAwKSk7XG4gICAgc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDIwMCwgMTIwLCAxMCwgMC4yNSkpO1xuICAgIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgyMDAsIDEyMCwgMTAsIDAuMikpO1xuICAgIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgzMCwgMzAwLCAxMCwgMC41KSk7XG4gICAgc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDEzMCwgNTAwLCAyMCwgMC4wNSkpO1xuICAgIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgyMzAsIDE1MCwgMjAsIDAuMSkpO1xuICAgIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgyMzAsIDE1MCwgMjAsIDAuMTUpKTtcblxuICAgIG1vdXNlLnRhcmdldCA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgc2Nob29sLnNldF90YXJnZXQocCk7XG4gICAgfTtcblxuICAgIG1vdXNlLmRlbGV0ZSA9IGZ1bmN0aW9uKHApIHtcbiAgICAgICAgLy9UT0RPOiBmaW5kIGlmIHRoZSBjbGljayBpcyBpbnNpZGUgYSByZWVmLCBkZWxldGUgYW5kIHJldHJpYW5ndWxhdGUgaWYgc28uXG4gICAgICAgIHZhciByZWVmID0gb2NlYW4uZ2V0X3JlZWZfdW5kZXJfcG9pbnQocCk7XG4gICAgICAgIGlmKHJlZWYpIHtcbiAgICAgICAgICAgIG9jZWFuLmRlbGV0ZV9yZWVmKHJlZWYpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIC8vVE9ETzogdGltZSB0aGluZ3MgKHRoZW4gdXNlIHJldmVyc2Ugd2F0Y2hhYmxlcyB0byBkaXNwbGF5IHRoZSB0aW1lcy4pXG4gICAgLy9UT0RPOiBjcmVhdGUgcmV2ZXJzZSB3YXRjaGFibGUgdmFyaWFibGVzLCByZXR1cm4gYSBmdW5jdGlvbiBmcm9tIGNvbnRyb2xzLCB3aGVuIHRoZSBmdW5jaXRvbiBpcyBjYWxsZWQgaXQgdXNlcyBhIGNsb3N1cmUgdG8gdXBkYXRlIHRoZSB2YWx1ZSBhbmQgZ2V0cyB0aGUgdmFsdWVcbiAgICAvL1RPRE86IGJ1ZyB3aGVyZSBwb2ludDEgaXNuJ3QgcmVzZXQgb24gY2hhbmdpbmcgbW9kZXNcbiAgICBtb3VzZS5jcmVhdGUgPSBmdW5jdGlvbihwMikge1xuICAgICAgICBpZighbW91c2UucDEpIHtcbiAgICAgICAgICAgIG1vdXNlLnAxID0gcDI7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvL1RPRE86IGVpdGhlciBkZWFsIHdpdGggb3ZlcmxhcHBpbmcgcmVlZnMgb3IgZG9uJ3QgYWxsb3cgdGhlbS5cbiAgICAgICAgICAgIHZhciB0b3BfbGVmdCA9IG5ldyBQb2ludChNYXRoLm1pbihtb3VzZS5wMS54LCBwMi54KSwgTWF0aC5taW4obW91c2UucDEueSwgcDIueSkpO1xuICAgICAgICAgICAgdmFyIGJvdHRvbV9yaWdodCA9IG5ldyBQb2ludChNYXRoLm1heChtb3VzZS5wMS54LCBwMi54KSwgTWF0aC5tYXgobW91c2UucDEueSwgcDIueSkpO1xuICAgICAgICAgICAgdmFyIGRpbWVucyA9IGJvdHRvbV9yaWdodC5zdWJ0cmFjdCh0b3BfbGVmdCk7XG4gICAgICAgICAgICBvY2Vhbi5hZGRfcmVlZihuZXcgUmVlZih0b3BfbGVmdC54LCB0b3BfbGVmdC55LCBkaW1lbnMueCwgZGltZW5zLnkpKTtcblxuICAgICAgICAgICAgZGVsZXRlIG1vdXNlLnAxO1xuICAgICAgICB9XG5cbiAgICB9O1xuXG4gICAgY2FudmFzLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgZnVuY3Rpb24oZSkge1xuICAgICAgICB2YXIgcmVjdCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgICAgICAgdmFyIHAgPSBuZXcgUG9pbnQoZS5jbGllbnRYIC0gcmVjdC5sZWZ0LCBlLmNsaWVudFkgLSByZWN0LnRvcCk7XG4gICAgICAgIG1vdXNlW21vdXNlLm1vZGVdKHApO1xuICAgIH0sIGZhbHNlKTtcblxuICAgIHZhciBwcmV2aW91c190aW1lO1xuICAgIHZhciB3YXNfaGlkZGVuID0gZmFsc2U7XG4gICAgdmFyIHBsYXlpbmcgPSB0cnVlO1xuXG4gICAgZG9jdW1lbnQuc2hvd2luZyA9IHRydWU7XG5cbiAgICBmdW5jdGlvbiBzdGVwKHQpIHtcbiAgICAgICAgaWYgKHBsYXlpbmcgJiYgZG9jdW1lbnQuc2hvd2luZykge1xuICAgICAgICAgICAgdmFyIHRpbWVfZGVsdGEgPSBwcmV2aW91c190aW1lID09PSB1bmRlZmluZWQgPyAwIDogdCAtIHByZXZpb3VzX3RpbWU7XG5cbiAgICAgICAgICAgIGlmICh3YXNfaGlkZGVuKSB7XG4gICAgICAgICAgICAgICAgdGltZV9kZWx0YSA9IDA7XG4gICAgICAgICAgICAgICAgd2FzX2hpZGRlbiA9IGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBzY2hvb2wuZmlzaC5mb3JFYWNoKGZ1bmN0aW9uKGZpc2gpIHtcbiAgICAgICAgICAgICAgICBmaXNoLm1vdmUodGltZV9kZWx0YSwgc2Nob29sLmZpc2gpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICBjb250ZXh0LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICAgIFxuICAgICAgICBvY2Vhbi5kcmF3KGNvbnRleHQpO1xuICAgICAgICBzY2hvb2wuZHJhdyhjb250ZXh0KTtcblxuICAgICAgICBwcmV2aW91c190aW1lID0gdDtcbiAgICAgICAgd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZShzdGVwKTtcbiAgICB9XG5cbiAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwidmlzaWJpbGl0eWNoYW5nZVwiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5oaWRkZW4pIHtcbiAgICAgICAgICAgIHdhc19oaWRkZW4gPSB0cnVlO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgaWYgKGUua2V5Q29kZSA9PT0gMzIpIHtcbiAgICAgICAgICAgIHBsYXlpbmcgPSAhcGxheWluZztcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHN0ZXAoKTtcbn0pKCk7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWVmID0gcmVxdWlyZSgnLi9yZWVmLmpzJyk7XG52YXIgTGluZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5MaW5lO1xudmFyIFRyaWFuZ2xlID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlRyaWFuZ2xlO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xudmFyIFRyaWFuZ3VsYXRpb24gPSByZXF1aXJlKCcuL3RyaWFuZ3VsYXRpb24uanMnKTtcblxuZnVuY3Rpb24gT2NlYW4od2lkdGgsIGhlaWdodCwgcmVlZnMpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5yZWVmcyA9IHJlZWZzO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufVxuXG4vL1RPRE86IGNyZWF0ZSBhIHRyaWFuZ3VsYXRpb24gZm9yIGV2ZXJ5IHNpemUgb2YgZmlzaFxuT2NlYW4ucHJvdG90eXBlLnJldHJpYW5ndWxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50cmlhbmd1bGF0aW9uID0gbmV3IFRyaWFuZ3VsYXRpb24odGhpcy5nZXRfcG9pbnRzKCksIHRoaXMuZ2V0X2xpbmVzKCksIHRoaXMuZ2V0X2RpYWdzKCkpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLnJlc2l6ZSA9IGZ1bmN0aW9uKHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfcGF0aF90byA9IGZ1bmN0aW9uKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICByZXR1cm4gdGhpcy50cmlhbmd1bGF0aW9uLmZpbmRfcGF0aChzdGFydF9wb2ludCwgZW5kX3BvaW50KTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfcmVlZl91bmRlcl9wb2ludCA9IGZ1bmN0aW9uKHApIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZih0aGlzLnJlZWZzW2ldLmNvbnRhaW5zKHApKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWVmc1tpXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfcG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IG5ldyBSZWVmKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfcG9pbnRzKCk7XG5cbiAgICB0aGlzLnJlZWZzLmZvckVhY2goZnVuY3Rpb24ocmVlZikge1xuICAgICAgICB2YXIgcHMgPSByZWVmLmdldF9wb2ludHMoKTtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgcG9pbnRzLnB1c2gocHNbaV0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBwb2ludHMuc29ydChmdW5jdGlvbihhLCBiKSB7XG4gICAgICAgIGlmKGEueCA9PSBiLngpIHtcbiAgICAgICAgICAgIHJldHVybiBhLnkgPiBiLnk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gYS54ID4gYi54O1xuICAgIH0pO1xuXG4gICAgcmV0dXJuIHBvaW50cztcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfbGluZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgbGluZXMgPSBuZXcgUmVlZigwLDAsdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9saW5lcygpO1xuXG4gICAgZnVuY3Rpb24gYWRkKGxpbmUpIHtsaW5lcy5wdXNoKGxpbmUpO31cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVlZnNbaV0uZ2V0X2xpbmVzKCkuZm9yRWFjaChhZGQpO1xuICAgIH1cblxuICAgIHJldHVybiBsaW5lcztcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5nZXRfZGlhZ3MgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5yZWVmcy5tYXAoZnVuY3Rpb24ocikge3JldHVybiByLmdldF9kaWFnb25hbCgpO30pO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmFkZF9yZWVmID0gZnVuY3Rpb24ocmVlZikge1xuICAgIHRoaXMucmVlZnMucHVzaChyZWVmKTtcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5kZWxldGVfcmVlZiA9IGZ1bmN0aW9uKHJlZWYpIHtcbiAgICB0aGlzLnJlZWZzLnNwbGljZSh0aGlzLnJlZWZzLmluZGV4T2YocmVlZiksIDEpO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgdGhpcy5yZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKHJlZWYpIHtcbiAgICAgICAgcmVlZi5kcmF3KGNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy50cmlhbmd1bGF0aW9uLmRyYXcoY29udGV4dCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9jZWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VvbWV0cnkgPSByZXF1aXJlKFwiLi9nZW9tZXRyeS5qc1wiKTtcbnZhciBQb2ludCA9IGdlb21ldHJ5LlBvaW50O1xudmFyIExpbmUgPSBnZW9tZXRyeS5MaW5lO1xuXG5mdW5jdGlvbiBSZWVmKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5wb2ludHMgPSBbbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KSwgbmV3IFBvaW50KHRoaXMueCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgMCldO1xufVxuXG5SZWVmLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjQUE1NTU1XCI7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfcG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRzO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2xpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIFtuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1sxXSksIG5ldyBMaW5lKHBvaW50c1sxXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUocG9pbnRzWzJdLCBwb2ludHNbM10pLCBuZXcgTGluZShwb2ludHNbM10sIHBvaW50c1swXSldO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2RpYWdvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIG5ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9kaWFnb25hbHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRfcG9pbnRzKCk7XG5cbiAgICByZXR1cm4gW25ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKV07XG59O1xuXG5SZWVmLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBkaWFnMSA9IG5ldyBMaW5lKHRoaXMucG9pbnRzWzBdLCB0aGlzLnBvaW50c1syXSk7XG4gICAgdmFyIGRpYWcyID0gbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKTtcblxuICAgIHJldHVybiBkaWFnMS5pbnRlcnNlY3RzKGxpbmUpIHx8ICBkaWFnMi5pbnRlcnNlY3RzKGxpbmUpO1xufTtcblxuUmVlZi5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIHAueCA+PSB0aGlzLnggJiYgcC55ID49IHRoaXMueSAmJiBwLnggPD0gdGhpcy54ICsgdGhpcy53aWR0aCAmJiBwLnkgPD0gdGhpcy55ICsgdGhpcy5oZWlnaHQ7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFJlZWY7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gU2Nob29sKG9jZWFuLCB0YXJnZXQpIHtcbiAgICB0aGlzLmZpc2ggPSBbXTtcbiAgICB0aGlzLm9jZWFuID0gb2NlYW47XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG59XG5cblNjaG9vbC5wcm90b3R5cGUuYWRkX2Zpc2ggPSBmdW5jdGlvbihmaXNoKSB7XG4gICAgdGhpcy5maXNoLnB1c2goZmlzaCk7XG4gICAgZmlzaC5zZXRfcGF0aCh0aGlzLm9jZWFuLmdldF9wYXRoX3RvKGZpc2gucG9zLCB0aGlzLnRhcmdldCkpO1xufTtcblxuU2Nob29sLnByb3RvdHlwZS5zZXRfdGFyZ2V0ID0gZnVuY3Rpb24odGFyZ2V0KSB7XG4gICAgdGhpcy50YXJnZXQgPSB0YXJnZXQ7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuZmlzaC5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLmZpc2hbaV0uc2V0X3BhdGgodGhpcy5vY2Vhbi5nZXRfcGF0aF90byh0aGlzLmZpc2hbaV0ucG9zLCB0YXJnZXQpKTtcbiAgICB9XG59O1xuXG5TY2hvb2wucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgdGhpcy5maXNoLmZvckVhY2goZnVuY3Rpb24oZmlzaCkge1xuICAgICAgICBmaXNoLmRyYXcoY29udGV4dCk7XG4gICAgfSk7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gNTtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUEzMzMzXCI7XG4gICAgY29udGV4dC5hcmModGhpcy50YXJnZXQueCwgdGhpcy50YXJnZXQueSwgMTUsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTY2hvb2w7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIExpbmUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuTGluZTtcbnZhciBUcmlhbmdsZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5UcmlhbmdsZTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcblxuZnVuY3Rpb24gVHJpYW5ndWxhdGlvbihwb2ludHMsIGNvbnN0cmFpbnRzLCByZW1vdmFibGVfY29uc3RyYWludHMpIHtcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgICB0aGlzLmNvbnN0cmFpbnRzID0gcmVtb3ZhYmxlX2NvbnN0cmFpbnRzLmNvbmNhdChjb25zdHJhaW50cyk7XG4gICAgdGhpcy5saW5lcyA9IHRoaXMudHJpYW5ndWxhdGUocG9pbnRzLCB0aGlzLmNvbnN0cmFpbnRzKTtcbiAgICB0aGlzLmxpbmVzLnNwbGljZSgwLCByZW1vdmFibGVfY29uc3RyYWludHMubGVuZ3RoKTtcbiAgICB0aGlzLmdyYXBoID0gdGhpcy5idWlsZF9ncmFwaCh0aGlzLmxpbmVzKTtcbn1cblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUudHJpYW5ndWxhdGUgPSBmdW5jdGlvbihwb2ludHMsIGNvbnN0cmFpbnRzKSB7XG4gICAgLy9UT0RPOiBtYWtlIHRoZSB0cmlhbmd1bGF0aW9uIGRlbHVhbnVheVxuICAgIHZhciBsaW5lcyA9IGNvbnN0cmFpbnRzLnNsaWNlKCk7XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCBwb2ludHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwb3NzaWJsZV9saW5lID0gbmV3IExpbmUocG9pbnRzW2ldLCBwb2ludHNbal0pO1xuICAgICAgICAgICAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghcG9zc2libGVfbGluZS5pbnRlcnNlY3RzX2FueShsaW5lcykpIHtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHBvc3NpYmxlX2xpbmUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuYnVpbGRfZ3JhcGggPSBmdW5jdGlvbihsaW5lcykge1xuICAgIC8vVE9ETzogb3B0aW1pc2UgdGhpcy4uLi5cbiAgICB2YXIgZ3JhcGggPSBbXTtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgbGluZXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAodmFyIGsgPSBqICsgMTsgayA8IGxpbmVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgICAgICAgICAgdmFyIHBvaW50cyA9IHRoaXMudW5pcXVlKGxpbmVzW2ldLnAxLCBsaW5lc1tpXS5wMiwgbGluZXNbal0ucDEsIGxpbmVzW2pdLnAyLCBsaW5lc1trXS5wMSwgbGluZXNba10ucDIpO1xuICAgICAgICAgICAgICAgIGlmIChwb2ludHMubGVuZ3RoID09PSAzKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0cmlhbmdsZSA9IG5ldyBUcmlhbmdsZShsaW5lc1tpXSwgbGluZXNbal0sIGxpbmVzW2tdLCBwb2ludHMpO1xuXG4gICAgICAgICAgICAgICAgICAgIGZvciAodmFyIGwgPSAwOyBsIDwgZ3JhcGgubGVuZ3RoOyBsKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChncmFwaFtsXS5pc19uZWlnaGJvcih0cmlhbmdsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZS5hZGRfbmVpZ2hib3IoZ3JhcGhbbF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYXBoW2xdLmFkZF9uZWlnaGJvcih0cmlhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZ3JhcGgucHVzaCh0cmlhbmdsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyYXBoO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUgPSBmdW5jdGlvbihwKSB7XG4gICAgLy9UT0RPOiBJIGNvdWxkIHNvcnQgdGhlIGdyYXBoIGFuZCBtYWtlIHRoaXMgZmFzdGVyLlxuXG4gICAgdmFyIG1pbl9kID0gSW5maW5pdHk7XG4gICAgdmFyIG1pbjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZCA9IHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHApO1xuICAgICAgICBpZiAoZCA8IG1pbl9kICYmICF0aGlzLmludGVyc2VjdHMobmV3IExpbmUocCwgdGhpcy5ncmFwaFtpXS5nZXRfY2VudGVyKCkpKSkge1xuICAgICAgICAgICAgbWluX2QgPSBkO1xuICAgICAgICAgICAgbWluID0gdGhpcy5ncmFwaFtpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtaW47XG59O1xuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZmluZF9wYXRoID0gZnVuY3Rpb24oc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIC8vVE9ETzogSXQncyBub3Qgb3B0aW1hbCBiZWNhdXNlIEkgY2FuIHJlZHVjZSBwYXRocyB1c2luZyBteSBhbGdvcml0aG0sIGJ1dCBkamtzdHJhcyBkb2Vzbid0IGRvIHRoYXQuY2FuIEkgYWN0dWFsbHkgcmVkdWNlIHRoZSBncmFwaCBiZWZvcmUgSSBydW4gZGprc3RyYXM/XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5nZXRfY2xvc2VzdF90cmlhbmdsZShzdGFydF9wb2ludCk7XG4gICAgdmFyIGVuZCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoZW5kX3BvaW50KTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGorKykge1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5kO1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5wcmV2O1xuICAgIH1cblxuICAgIGlmICghZW5kKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbc3RhcnRdO1xuICAgIHN0YXJ0LmQgPSAwO1xuICAgIHN0YXJ0Lm5vZGUgPSB1bmRlZmluZWQ7XG5cbiAgICBmdW5jdGlvbiBkaXN0YW5jZUNvbXBhcmF0b3IoYSwgYikge1xuICAgICAgICByZXR1cm4gYS5kID4gYi5kO1xuICAgIH1cblxuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBxdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdF9wYXRoKGN1cnJlbnQsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdXJyZW50Lm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBjdXJyZW50LmQgKyBjdXJyZW50Lm5laWdoYm9yc1tpXS5kaXN0YW5jZShjdXJyZW50KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50Lm5laWdoYm9yc1tpXS5kID09PSAndW5kZWZpbmVkJyB8fCBuZXdEIDwgY3VycmVudC5uZWlnaGJvcnNbaV0uZCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLmQgPSBuZXdEO1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLnByZXYgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5pbmRleE9mKGN1cnJlbnQubmVpZ2hib3JzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChjdXJyZW50Lm5laWdoYm9yc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcXVldWUuc29ydChkaXN0YW5jZUNvbXBhcmF0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdF9wYXRoID0gZnVuY3Rpb24obm9kZSwgc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIHZhciBwYXRoID0gW107XG4gICAgd2hpbGUgKG5vZGUucHJldikge1xuICAgICAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuXG4gICAgcGF0aC5yZXZlcnNlKCk7XG4gICAgcGF0aC5wdXNoKGVuZF9wb2ludCk7XG4gICAgcGF0aC51bnNoaWZ0KHN0YXJ0X3BvaW50KTtcbiAgICB0aGlzLnJlZHVjZV9wYXRoKHBhdGgpO1xuXG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFyci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKGFyZ3VtZW50c1tpXS5lcXVhbHMoYXJyW2pdKSkge1xuICAgICAgICAgICAgICAgIGNvbnRhaW5lZCA9IHRydWU7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFjb250YWluZWQpIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGFyZ3VtZW50c1tpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUucmVkdWNlX3BhdGggPSBmdW5jdGlvbihwYXRoKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICBpZiAoIXRoaXMuaW50ZXJzZWN0cyhuZXcgTGluZShwYXRoW2ldLCBwYXRoW2kgKyAyXSkpKSB7XG4gICAgICAgICAgICBwYXRoLnNwbGljZShpICsgMSwgMSk7XG4gICAgICAgICAgICBpLS07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5jb25zdHJhaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodGhpcy5jb25zdHJhaW50c1tpXS5pbnRlcnNlY3RzKGxpbmUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYgKENPTkZJRy5ERUJVRyA+IDMpIHtcbiAgICAgICAgdGhpcy5wb2ludHMuZm9yRWFjaChmdW5jdGlvbihwb2ludCkge1xuICAgICAgICAgICAgcG9pbnQuZHJhdyhjb250ZXh0LCBcIiM1NTU1QUFcIik7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMubGluZXMuZm9yRWFjaChmdW5jdGlvbihsaW5lKSB7XG4gICAgICAgICAgICBsaW5lLmRyYXcoY29udGV4dCwgXCIjNTU1NUFBXCIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDQpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmZpbGxfdHJpYW5nbGUoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMuZ3JhcGguZm9yRWFjaChmdW5jdGlvbih0cmlhbmdsZSkge1xuICAgICAgICBpZiAoQ09ORklHLkRFQlVHID4gMSkge1xuICAgICAgICAgICAgdHJpYW5nbGUuZHJhd19lZGdlcyhjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuZ3JhcGguZm9yRWFjaChmdW5jdGlvbih0cmlhbmdsZSkge1xuICAgICAgICBpZiAoQ09ORklHLkRFQlVHID4gMCkge1xuICAgICAgICAgICAgdHJpYW5nbGUuZHJhd192ZXJ0ZXgoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDIpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmRyYXdfd2VpZ2h0cyhjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUcmlhbmd1bGF0aW9uO1xuIl19
