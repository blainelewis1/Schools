(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{"./geometry.js":2}],2:[function(require,module,exports){
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

Triangle.prototype.draw = function(context, color) {

    if (DEBUG > 5) {
        context.beginPath();
        context.fillStyle = this.color;
        context.moveTo(this.points[0].x, this.points[0].y);

        context.lineTo(this.points[1].x, this.points[1].y);
        context.lineTo(this.points[2].x, this.points[2].y);
        context.lineTo(this.points[0].x, this.points[0].y);
        context.fill();
    }

    if (DEBUG > 2) {
        context.fillStyle = "#222222";

        context.strokeStyle = "#AAAAAA";
        for (var i = 0; i < this.neighbors.length; i++) {

            context.beginPath();
            context.moveTo(this.get_center().x, this.get_center().y);
            context.lineTo(this.neighbors[i].get_center().x, this.neighbors[i].get_center().y);
            context.stroke();
            if (DEBUG > 3) {
                var d = this.get_center().distance(this.neighbors[i].get_center());
                context.fillText(d.toFixed(0), (this.get_center().x + this.neighbors[i].get_center().x) / 2 + 10, (this.get_center().y + this.neighbors[i].get_center().y) / 2 + 10);
            }
        }
    }

    if (DEBUG > 0) {
        context.beginPath();
        context.arc(this.get_center().x, this.get_center().y, 8, 8, 0, Math.PI * 2);
        context.fill();
    }
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

},{}],3:[function(require,module,exports){
/*global DEBUG : true */

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
DEBUG = 5;

(function() {
    'use strict';
    var Fish = require('./fish.js');
    var Point = require('./geometry.js').Point;
    var School = require('./school.js');
    var Ocean = require('./ocean.js');
    var Reef = require('./reef.js');


    // var canvas = document.getElementById("canvas");
    // var context = canvas.getContext("2d");

    //canvas.width = 900;
    //canvas.height = 800;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    var ocean = new Ocean(canvas.width, canvas.height, [new Reef(200, 200, 200, 200),new Reef(800, 200, 200, 200)]);

    //TODO: more intersting spawning.
    //TODO: create your own reefs etc.
    var school = new School(ocean, new Point(500,400));
    // //school.add_fish(new Fish(0, 0, 10, 0.25));
    school.add_fish(new Fish(200, 120, 10, 0.25));
    school.add_fish(new Fish(200, 120, 10, 0.2));
    school.add_fish(new Fish(30, 300, 10, 0.5));
    //
    // //school.add_fish(new Fish(30, 0, 20, 0.1));
    school.add_fish(new Fish(130, 500, 20, 0.05));
    school.add_fish(new Fish(230, 150, 20, 0.1));
    school.add_fish(new Fish(230, 150, 20, 0.15));

    canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var p = new Point(e.clientX - rect.left, e.clientY - rect.top);
        school.set_target(p);
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
        school.draw(context);
        ocean.draw(context);

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

},{"./fish.js":1,"./geometry.js":2,"./ocean.js":4,"./reef.js":5,"./school.js":6}],4:[function(require,module,exports){
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

Ocean.prototype.retriangulate = function () {
    this.triangulation = new Triangulation(this.get_points(), this.get_lines(), this.get_diags());
};

Ocean.prototype.get_path_to = function(start_point, end_point) {
    return this.triangulation.find_path(start_point, end_point);
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

Ocean.prototype.draw = function(context) {
    this.reefs.forEach(function(reef) {
        reef.draw(context);
    });

    this.triangulation.draw(context);
};

module.exports = Ocean;

},{"./geometry.js":2,"./reef.js":5,"./triangulation.js":7}],5:[function(require,module,exports){
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

module.exports = Reef;

},{"./geometry.js":2}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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
    //I could create a dictionary, then take a point, loop through it's neighbouring points.
    //For each neighbouring point look them up in the dictionary and attempt to find the first point.

    //get the initial lines. then loop through the points and attempt to add a line until we've tried all of them.
    //Could we use sortedness? Then we only add points in a clockwise order.
    var lines = constraints.slice();

    for(var i = 0; i < points.length; i++) {
        for(var j = i + 1; j < points.length; j++) {
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

    for(var i = 0; i < lines.length; i++) {
        for(var j = i + 1; j < lines.length; j++) {
            for(var k = j + 1; k < lines.length; k++) {
                var points = this.unique(lines[i].p1, lines[i].p2, lines[j].p1, lines[j].p2, lines[k].p1, lines[k].p2);
                if(points.length === 3){
                    var triangle = new Triangle(lines[i], lines[j], lines[k], points);

                    for(var l = 0; l < graph.length; l++) {
                        if(graph[l].is_neighbor(triangle)) {
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

    for(var i = 0; i < this.graph.length; i++) {
        var d = this.graph[i].get_center().distance(p);
        if(d < min_d && !this.intersects(new Line(p, this.graph[i].get_center()))) {
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

    for(var j = 0; j < this.graph.length; j++){
        delete this.graph[j].d;
        delete this.graph[j].prev;
    }

    if(!end) {
        return [];
    }

    var queue = [start];
    start.d = 0;
    start.node = undefined;

    function distanceComparator(a, b) {return a.d > b.d;}

    while(queue.length) {
        var current = queue.shift();

        if(current === end) {
            return this.construct_path(current, start_point, end_point);
        }

        for(var i = 0; i < current.neighbors.length; i++) {
            var newD = current.d + current.neighbors[i].distance(current);

            if(typeof current.neighbors[i].d === 'undefined' || newD < current.neighbors[i].d) {
                current.neighbors[i].d = newD;
                current.neighbors[i].prev = current;
                if(queue.indexOf(current.neighbors[i]) === -1) {
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
    while(node.prev) {
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
            if(arguments[i].equals(arr[j])) {
                contained = true;
                break;
            }
        }
        if(!contained) {
            arr.push(arguments[i]);
        }
    }

    return arr;
};

Triangulation.prototype.reduce_path = function(path) {
    for(var i = 0; i < path.length - 2; i++) {
        if(!this.intersects(new Line(path[i], path[i + 2]))) {
            path.splice(i + 1, 1);
            i--;
        }
    }
};

Triangulation.prototype.intersects = function(line) {
    for(var i = 0; i < this.constraints.length; i++) {
        if(this.constraints[i].intersects(line)) {
            return true;
        }
    }

    return false;
};

Triangulation.prototype.draw = function(context) {
    if(DEBUG > 4) {
        this.points.forEach(function(point) {
            point.draw(context, "#5555AA");
        });

        this.lines.forEach(function(line) {
            line.draw(context, "#5555AA");
        });
    }

    this.graph.forEach(function(triangle) {
        triangle.draw(context);
    });
};

module.exports = Triangulation;

},{"./geometry.js":2}]},{},[3])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvZmlzaC5qcyIsImFwcC9qcy9nZW9tZXRyeS5qcyIsImFwcC9qcy9pbmRleC5qcyIsImFwcC9qcy9vY2Vhbi5qcyIsImFwcC9qcy9yZWVmLmpzIiwiYXBwL2pzL3NjaG9vbC5qcyIsImFwcC9qcy90cmlhbmd1bGF0aW9uLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN4RkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMxRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcblxuZnVuY3Rpb24gRmlzaCh4LCB5LCByYWRpdXMsIHNwZWVkKSB7XG4gICAgdGhpcy5wb3MgPSBuZXcgUG9pbnQoeCx5KTtcbiAgICB0aGlzLnJvdGF0aW9uID0gTWF0aC5QSSAvIDI7XG4gICAgdGhpcy5zcGVlZCA9IHNwZWVkO1xuICAgIHRoaXMucm90YXRpb25fc3BlZWQgPSBzcGVlZCAvIDEwO1xuICAgIHRoaXMucmFkaXVzID0gcmFkaXVzO1xuICAgIHRoaXMuY29sbGlkaW5nID0gZmFsc2U7XG59XG5cbkZpc2gucHJvdG90eXBlLnNldF9wYXRoID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIHRoaXMucGF0aCA9IHBhdGg7XG59O1xuXG5GaXNoLnByb3RvdHlwZS5tb3ZlID0gZnVuY3Rpb24oZGVsdGFfdGltZSwgY29sbGlkYWJsZXMpIHtcbiAgICB2YXIgdGFyZ2V0ID0gdGhpcy5uZXh0X3RhcmdldCgpO1xuXG4gICAgaWYgKCF0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIHZhciBkZWx0YV92ZWxvY2l0eSA9IHRoaXMuc3BlZWQgKiBkZWx0YV90aW1lO1xuXG4gICAgLy9yb3RhdGUgdG93YXJkcyB0YXJnZXQsIHRoZW4gbW92ZSB0b3dhcmRzIGl0LlxuICAgIHRoaXMucG9zLnggKz0gTWF0aC5jb3ModGhpcy5yb3RhdGlvbikgKiBkZWx0YV92ZWxvY2l0eTtcbiAgICB0aGlzLnBvcy55ICs9IE1hdGguc2luKHRoaXMucm90YXRpb24pICogZGVsdGFfdmVsb2NpdHk7XG5cbiAgICAvL1RyYWNlIGEgcmF5IHRvIGVhY2ggYW5kIHRlc3QgaWYgd2UnZCBiZSB0b3VjaGluZyBhbnkgb2YgdGhlbSBhZnRlciBtb3ZpbmcuXG5cbiAgICBjb2xsaWRhYmxlcy5mb3JFYWNoKGZ1bmN0aW9uKGNvbGxpZGFibGUpIHtcbiAgICAgICAgdGhpcy5jb2xsaWRpbmcgPSBjb2xsaWRhYmxlLnBvcy5kaXN0YW5jZSh0aGlzLnBvcykgPD0gMCAmJiBjb2xsaWRhYmxlICE9PSB0aGlzO1xuICAgIH0uYmluZCh0aGlzKSk7XG5cblxuICAgIHZhciBkZXNpcmVkX2FuZ2xlID0gTWF0aC5hdGFuMih0YXJnZXQueSAtIHRoaXMucG9zLnksIHRhcmdldC54IC0gdGhpcy5wb3MueCk7XG5cbiAgICAvLyB0aGlzLnJvdGF0aW9uID0gZGVzaXJlZF9hbmdsZTtcbiAgICAvLyB0aGlzLnJvdGF0aW9uICU9IE1hdGguUEkgKiAyO1xuXG4gICAgdmFyIGN3X2Rpc3QgPSAoKChkZXNpcmVkX2FuZ2xlIC0gdGhpcy5yb3RhdGlvbikgJSAoTWF0aC5QSSAqIDIpKSArIChNYXRoLlBJICogMikpICUgKE1hdGguUEkgKiAyKTtcbiAgICB2YXIgY2N3X2Rpc3QgPSAoKCh0aGlzLnJvdGF0aW9uIC0gZGVzaXJlZF9hbmdsZSkgJSAoTWF0aC5QSSAqIDIpKSArIChNYXRoLlBJICogMikpICUgKE1hdGguUEkgKiAyKTtcblxuICAgIHZhciBkZWx0YV9yb3RhdGlvbiA9IHRoaXMucm90YXRpb25fc3BlZWQgKiBkZWx0YV90aW1lO1xuXG4gICAgaWYgKGN3X2Rpc3QgPCBkZWx0YV9yb3RhdGlvbiB8fCBjY3dfZGlzdCA8IGRlbHRhX3JvdGF0aW9uKSB7XG4gICAgICAgIHRoaXMucm90YXRpb24gPSBkZXNpcmVkX2FuZ2xlO1xuICAgIH0gZWxzZSBpZiAoY3dfZGlzdCA+IGNjd19kaXN0KSB7XG4gICAgICAgIHRoaXMucm90YXRpb24gLT0gZGVsdGFfcm90YXRpb247XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdGhpcy5yb3RhdGlvbiArPSBkZWx0YV9yb3RhdGlvbjtcbiAgICB9XG5cbiAgICB0aGlzLnJvdGF0aW9uICU9IE1hdGguUEkgKiAyO1xufTtcblxuRmlzaC5wcm90b3R5cGUubmV4dF90YXJnZXQgPSBmdW5jdGlvbigpIHtcbiAgICBpZighdGhpcy5wYXRoIHx8IHRoaXMucGF0aC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBpZih0aGlzLnBhdGhbMF0uZGlzdGFuY2UodGhpcy5wb3MpIDw9IDEwICYmIHRoaXMucGF0aC5sZW5ndGggPiAxKSB7XG4gICAgICAgIHRoaXMucGF0aC5zaGlmdCgpO1xuICAgIH1cblxuXG4gICAgcmV0dXJuIHRoaXMucGF0aFswXTtcbn07XG5cbkZpc2gucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAyO1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcIiMwMDAwMDBcIjtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sbGlkaW5nID8gXCIjQUE3Nzc3XCIgOiBcIiNBQUFBQUFcIjtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5hcmModGhpcy5wb3MueCwgdGhpcy5wb3MueSwgdGhpcy5yYWRpdXMsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wb3MueCwgdGhpcy5wb3MueSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy5wb3MueCArIE1hdGguY29zKHRoaXMucm90YXRpb24pICogdGhpcy5yYWRpdXMgKiAxLjUsIHRoaXMucG9zLnkgKyBNYXRoLnNpbih0aGlzLnJvdGF0aW9uKSAqIHRoaXMucmFkaXVzICogMS41KTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEZpc2g7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gTGluZShwMSwgcDIpIHtcbiAgICB0aGlzLnAxID0gcDE7XG4gICAgdGhpcy5wMiA9IHAyO1xufVxuXG5MaW5lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuICh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSAmJiB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkgfHxcbiAgICAgICAgKHRoaXMucDEuZXF1YWxzKGxpbmUucDIpICYmIHRoaXMucDIuZXF1YWxzKGxpbmUucDEpKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvciB8fCBcIiNBQUFBQUFcIjtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDM7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKHRoaXMucDEueCwgdGhpcy5wMS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnAyLngsIHRoaXMucDIueSk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucDEudG9TdHJpbmcoKSArIFwiID0+IFwiICsgdGhpcy5wMi50b1N0cmluZygpO1xufTtcblxuTGluZS5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBpZiAodGhpcy5lcXVhbHMobGluZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHMxID0gdGhpcy5wMi5zdWJ0cmFjdCh0aGlzLnAxKTtcbiAgICB2YXIgczIgPSBsaW5lLnAyLnN1YnRyYWN0KGxpbmUucDEpO1xuXG4gICAgdmFyIHMgPSAoLXMxLnkgKiAodGhpcy5wMS54IC0gbGluZS5wMS54KSArIHMxLnggKiAodGhpcy5wMS55IC0gbGluZS5wMS55KSkgLyAoLXMyLnggKiBzMS55ICsgczEueCAqIHMyLnkpO1xuICAgIHZhciB0ID0gKHMyLnggKiAodGhpcy5wMS55IC0gbGluZS5wMS55KSAtIHMyLnkgKiAodGhpcy5wMS54IC0gbGluZS5wMS54KSkgLyAoLXMyLnggKiBzMS55ICsgczEueCAqIHMyLnkpO1xuXG4gICAgaWYgKHMgPj0gMCAmJiBzIDw9IDEgJiYgdCA+PSAwICYmIHQgPD0gMSkge1xuICAgICAgICBpZiAodGhpcy5wMS5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMS5lcXVhbHMobGluZS5wMikgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGlzTmFOKHMpIHx8IGlzTmFOKHQpKSB7XG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBubyBwb2ludHMgdGhleSBkb24ndCBvdmVybGFwLlxuICAgICAgICBpZiAoISh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJvdW5kaW5nX2NvbnRhaW5zKGxpbmUpIHx8IGxpbmUuYm91bmRpbmdfY29udGFpbnModGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9Db2xpbmVhciwgZWl0aGVyIHRoZXkgb3ZlcmxhcCBvciB0aGV5IGRvbid0Li4uXG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBvbmUgcG9pbnQsIHRoZW4gdGhleSBvdmVybGFwIGlmIGFueSBvZiB0aGUgcG9pbnRzIGZhbGxzIHdpdGhpbiB0aGUgcmFuZ2Ugb2YgdGhlIGxpbmVzLlxuICAgICAgICAvL0lmIHRoZXkgc2hhcmUgYm90aCB0aGV5J3JlIGVxdWFsLCB3aGljaCB3ZSBjb3ZlciBhYm92ZVxuXG5cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5ib3VuZGluZ19jb250YWlucyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgdG9wX2xlZnQgPSBuZXcgUG9pbnQoTWF0aC5taW4odGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1pbih0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuICAgIHZhciBib3R0b21fcmlnaHQgPSBuZXcgUG9pbnQoTWF0aC5tYXgodGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1heCh0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuXG4gICAgcmV0dXJuIGxpbmUucDEuYmV0d2Vlbih0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KSB8fCBsaW5lLnAyLmJldHdlZW4odG9wX2xlZnQsIGJvdHRvbV9yaWdodCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzX2FueSA9IGZ1bmN0aW9uKGxpbmVzKSB7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGxpbmVzW2tdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBQb2ludCh4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xufVxuXG5Qb2ludC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCIoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbn07XG5cblBvaW50LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiB0aGlzLnggPT09IHBvaW50LnggJiYgdGhpcy55ID09PSBwb2ludC55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55KTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5zY2FsYXJfcHJvZHVjdCA9IGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KGMgKiB0aGlzLngsIGMgKiB0aGlzLnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmNyb3NzX3Byb2R1Y3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueDtcbn07XG5cblBvaW50LnByb3RvdHlwZS5kb3RfcHJvZHVjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmJldHdlZW4gPSBmdW5jdGlvbihwMSwgcDIpIHtcbiAgICByZXR1cm4gdGhpcy54ID4gcDEueCAmJiB0aGlzLnggPCBwMi54ICYmIHRoaXMueSA+IHAxLnkgJiYgdGhpcy55IDwgcDIueTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5kaXN0YW5jZSA9IGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHRoaXMueCAtIHAueCwgMikgKyBNYXRoLnBvdyh0aGlzLnkgLSBwLnksIDIpKTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCwgY29sb3IpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yIHx8IFwiI0FBQUFBQVwiO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyh0aGlzLngsIHRoaXMueSwgMTAsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cbmZ1bmN0aW9uIFRyaWFuZ2xlKGUxLCBlMiwgZTMsIHBvaW50cykge1xuICAgIHRoaXMuZWRnZXMgPSBbZTEsIGUyLCBlM107XG4gICAgdGhpcy5uZWlnaGJvcnMgPSBbXTtcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgICB0aGlzLmNvbG9yID0gZ2V0UmFuZG9tQ29sb3IoKTtcbn1cblxuVHJpYW5nbGUucHJvdG90eXBlLmdldF9jZW50ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvL0NlbnRyb2lkOlxuICAgIC8vcmV0dXJuIG5ldyBQb2ludCgodGhpcy5wb2ludHNbMF0ueCArIHRoaXMucG9pbnRzWzFdLnggKyB0aGlzLnBvaW50c1syXS54KSAvIDMsICh0aGlzLnBvaW50c1swXS55ICsgdGhpcy5wb2ludHNbMV0ueSArIHRoaXMucG9pbnRzWzJdLnkpIC8gMyk7XG5cbiAgICB2YXIgYSA9IHRoaXMucG9pbnRzWzBdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzFdKTtcbiAgICB2YXIgYiA9IHRoaXMucG9pbnRzWzBdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzJdKTtcbiAgICB2YXIgYyA9IHRoaXMucG9pbnRzWzFdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzJdKTtcbiAgICB2YXIgcCA9IGEgKyBiICsgYztcblxuICAgIHJldHVybiBuZXcgUG9pbnQoKGEgKiB0aGlzLnBvaW50c1syXS54ICsgYiAqIHRoaXMucG9pbnRzWzFdLnggKyBjICogdGhpcy5wb2ludHNbMF0ueCkgLyBwLCAoYSAqIHRoaXMucG9pbnRzWzJdLnkgKyBiICogdGhpcy5wb2ludHNbMV0ueSArIGMgKiB0aGlzLnBvaW50c1swXS55KSAvIHApO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0LmdldF9jZW50ZXIoKSk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHAxID0gdGhpcy5wb2ludHNbMF07XG4gICAgdmFyIHAyID0gdGhpcy5wb2ludHNbMV07XG4gICAgdmFyIHAzID0gdGhpcy5wb2ludHNbMl07XG5cbiAgICB2YXIgYWxwaGEgPSAoKHAyLnkgLSBwMy55KSAqIChwLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocC55IC0gcDMueSkpIC9cbiAgICAgICAgKChwMi55IC0gcDMueSkgKiAocDEueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwMS55IC0gcDMueSkpO1xuICAgIHZhciBiZXRhID0gKChwMy55IC0gcDEueSkgKiAocC54IC0gcDMueCkgKyAocDEueCAtIHAzLngpICogKHAueSAtIHAzLnkpKSAvXG4gICAgICAgICgocDIueSAtIHAzLnkpICogKHAxLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocDEueSAtIHAzLnkpKTtcbiAgICB2YXIgZ2FtbWEgPSAxIC0gYWxwaGEgLSBiZXRhO1xuXG4gICAgcmV0dXJuIGFscGhhID4gMCAmJiBiZXRhID4gMCAmJiBnYW1tYSA+IDA7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuaXNfbmVpZ2hib3IgPSBmdW5jdGlvbih0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdC5lZGdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZWRnZXNbaV0uZXF1YWxzKHQuZWRnZXNbal0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmFkZF9uZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLm5laWdoYm9ycy5wdXNoKHQpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuXG4gICAgaWYgKERFQlVHID4gNSkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMucG9pbnRzWzBdLngsIHRoaXMucG9pbnRzWzBdLnkpO1xuXG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMucG9pbnRzWzFdLngsIHRoaXMucG9pbnRzWzFdLnkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1syXS54LCB0aGlzLnBvaW50c1syXS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuICAgIGlmIChERUJVRyA+IDIpIHtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcblxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUFBQUFBXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMuZ2V0X2NlbnRlcigpLngsIHRoaXMuZ2V0X2NlbnRlcigpLnkpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLngsIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgICBpZiAoREVCVUcgPiAzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFRleHQoZC50b0ZpeGVkKDApLCAodGhpcy5nZXRfY2VudGVyKCkueCArIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS54KSAvIDIgKyAxMCwgKHRoaXMuZ2V0X2NlbnRlcigpLnkgKyB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueSkgLyAyICsgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKERFQlVHID4gMCkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmFyYyh0aGlzLmdldF9jZW50ZXIoKS54LCB0aGlzLmdldF9jZW50ZXIoKS55LCA4LCA4LCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xuICAgIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnO1xuICAgIHZhciBjb2xvciA9ICcjJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5Qb2ludCA9IFBvaW50O1xubW9kdWxlLmV4cG9ydHMuTGluZSA9IExpbmU7XG5tb2R1bGUuZXhwb3J0cy5UcmlhbmdsZSA9IFRyaWFuZ2xlO1xuIiwiLypnbG9iYWwgREVCVUcgOiB0cnVlICovXG5cbnZhciBjYW52YXMgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImNhbnZhc1wiKTtcbnZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcbkRFQlVHID0gNTtcblxuKGZ1bmN0aW9uKCkge1xuICAgICd1c2Ugc3RyaWN0JztcbiAgICB2YXIgRmlzaCA9IHJlcXVpcmUoJy4vZmlzaC5qcycpO1xuICAgIHZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcbiAgICB2YXIgU2Nob29sID0gcmVxdWlyZSgnLi9zY2hvb2wuanMnKTtcbiAgICB2YXIgT2NlYW4gPSByZXF1aXJlKCcuL29jZWFuLmpzJyk7XG4gICAgdmFyIFJlZWYgPSByZXF1aXJlKCcuL3JlZWYuanMnKTtcblxuXG4gICAgLy8gdmFyIGNhbnZhcyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiY2FudmFzXCIpO1xuICAgIC8vIHZhciBjb250ZXh0ID0gY2FudmFzLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgIC8vY2FudmFzLndpZHRoID0gOTAwO1xuICAgIC8vY2FudmFzLmhlaWdodCA9IDgwMDtcbiAgICBjYW52YXMud2lkdGggPSB3aW5kb3cuaW5uZXJXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXG5cbiAgICB2YXIgb2NlYW4gPSBuZXcgT2NlYW4oY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0LCBbbmV3IFJlZWYoMjAwLCAyMDAsIDIwMCwgMjAwKSxuZXcgUmVlZig4MDAsIDIwMCwgMjAwLCAyMDApXSk7XG5cbiAgICAvL1RPRE86IG1vcmUgaW50ZXJzdGluZyBzcGF3bmluZy5cbiAgICAvL1RPRE86IGNyZWF0ZSB5b3VyIG93biByZWVmcyBldGMuXG4gICAgdmFyIHNjaG9vbCA9IG5ldyBTY2hvb2wob2NlYW4sIG5ldyBQb2ludCg1MDAsNDAwKSk7XG4gICAgLy8gLy9zY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMCwgMCwgMTAsIDAuMjUpKTtcbiAgICBzY2hvb2wuYWRkX2Zpc2gobmV3IEZpc2goMjAwLCAxMjAsIDEwLCAwLjI1KSk7XG4gICAgc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDIwMCwgMTIwLCAxMCwgMC4yKSk7XG4gICAgc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDMwLCAzMDAsIDEwLCAwLjUpKTtcbiAgICAvL1xuICAgIC8vIC8vc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDMwLCAwLCAyMCwgMC4xKSk7XG4gICAgc2Nob29sLmFkZF9maXNoKG5ldyBGaXNoKDEzMCwgNTAwLCAyMCwgMC4wNSkpO1xuICAgIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgyMzAsIDE1MCwgMjAsIDAuMSkpO1xuICAgIHNjaG9vbC5hZGRfZmlzaChuZXcgRmlzaCgyMzAsIDE1MCwgMjAsIDAuMTUpKTtcblxuICAgIGNhbnZhcy5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHJlY3QgPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgICAgIHZhciBwID0gbmV3IFBvaW50KGUuY2xpZW50WCAtIHJlY3QubGVmdCwgZS5jbGllbnRZIC0gcmVjdC50b3ApO1xuICAgICAgICBzY2hvb2wuc2V0X3RhcmdldChwKTtcbiAgICB9LCBmYWxzZSk7XG5cbiAgICB2YXIgcHJldmlvdXNfdGltZTtcbiAgICB2YXIgd2FzX2hpZGRlbiA9IGZhbHNlO1xuICAgIHZhciBwbGF5aW5nID0gdHJ1ZTtcblxuICAgIGRvY3VtZW50LnNob3dpbmcgPSB0cnVlO1xuXG4gICAgZnVuY3Rpb24gc3RlcCh0KSB7XG4gICAgICAgIGlmIChwbGF5aW5nICYmIGRvY3VtZW50LnNob3dpbmcpIHtcbiAgICAgICAgICAgIHZhciB0aW1lX2RlbHRhID0gcHJldmlvdXNfdGltZSA9PT0gdW5kZWZpbmVkID8gMCA6IHQgLSBwcmV2aW91c190aW1lO1xuXG4gICAgICAgICAgICBpZiAod2FzX2hpZGRlbikge1xuICAgICAgICAgICAgICAgIHRpbWVfZGVsdGEgPSAwO1xuICAgICAgICAgICAgICAgIHdhc19oaWRkZW4gPSBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgc2Nob29sLmZpc2guZm9yRWFjaChmdW5jdGlvbihmaXNoKSB7XG4gICAgICAgICAgICAgICAgZmlzaC5tb3ZlKHRpbWVfZGVsdGEsIHNjaG9vbC5maXNoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgY29udGV4dC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgc2Nob29sLmRyYXcoY29udGV4dCk7XG4gICAgICAgIG9jZWFuLmRyYXcoY29udGV4dCk7XG5cbiAgICAgICAgcHJldmlvdXNfdGltZSA9IHQ7XG4gICAgICAgIHdpbmRvdy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUoc3RlcCk7XG4gICAgfVxuXG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIiwgZnVuY3Rpb24oZSkge1xuICAgICAgICBpZiAoZG9jdW1lbnQuaGlkZGVuKSB7XG4gICAgICAgICAgICB3YXNfaGlkZGVuID0gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJrZXlwcmVzc1wiLCBmdW5jdGlvbihlKSB7XG4gICAgICAgIGlmIChlLmtleUNvZGUgPT09IDMyKSB7XG4gICAgICAgICAgICBwbGF5aW5nID0gIXBsYXlpbmc7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICBzdGVwKCk7XG59KSgpO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVlZiA9IHJlcXVpcmUoJy4vcmVlZi5qcycpO1xudmFyIExpbmUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuTGluZTtcbnZhciBUcmlhbmdsZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5UcmlhbmdsZTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcbnZhciBUcmlhbmd1bGF0aW9uID0gcmVxdWlyZSgnLi90cmlhbmd1bGF0aW9uLmpzJyk7XG5cbmZ1bmN0aW9uIE9jZWFuKHdpZHRoLCBoZWlnaHQsIHJlZWZzKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVlZnMgPSByZWVmcztcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn1cblxuT2NlYW4ucHJvdG90eXBlLnJldHJpYW5ndWxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50cmlhbmd1bGF0aW9uID0gbmV3IFRyaWFuZ3VsYXRpb24odGhpcy5nZXRfcG9pbnRzKCksIHRoaXMuZ2V0X2xpbmVzKCksIHRoaXMuZ2V0X2RpYWdzKCkpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9wYXRoX3RvID0gZnVuY3Rpb24oc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXRpb24uZmluZF9wYXRoKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9wb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gbmV3IFJlZWYoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9wb2ludHMoKTtcblxuICAgIHRoaXMucmVlZnMuZm9yRWFjaChmdW5jdGlvbihyZWVmKSB7XG4gICAgICAgIHZhciBwcyA9IHJlZWYuZ2V0X3BvaW50cygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwc1tpXSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHBvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgaWYoYS54ID09IGIueCkge1xuICAgICAgICAgICAgcmV0dXJuIGEueSA+IGIueTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhLnggPiBiLng7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcG9pbnRzO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9saW5lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsaW5lcyA9IG5ldyBSZWVmKDAsMCx0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X2xpbmVzKCk7XG5cbiAgICBmdW5jdGlvbiBhZGQobGluZSkge2xpbmVzLnB1c2gobGluZSk7fVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZWVmc1tpXS5nZXRfbGluZXMoKS5mb3JFYWNoKGFkZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9kaWFncyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlZWZzLm1hcChmdW5jdGlvbihyKSB7cmV0dXJuIHIuZ2V0X2RpYWdvbmFsKCk7fSk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuYWRkX3JlZWYgPSBmdW5jdGlvbihyZWVmKSB7XG4gICAgdGhpcy5yZWVmcy5wdXNoKHJlZWYpO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgdGhpcy5yZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKHJlZWYpIHtcbiAgICAgICAgcmVlZi5kcmF3KGNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy50cmlhbmd1bGF0aW9uLmRyYXcoY29udGV4dCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9jZWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VvbWV0cnkgPSByZXF1aXJlKFwiLi9nZW9tZXRyeS5qc1wiKTtcbnZhciBQb2ludCA9IGdlb21ldHJ5LlBvaW50O1xudmFyIExpbmUgPSBnZW9tZXRyeS5MaW5lO1xuXG5mdW5jdGlvbiBSZWVmKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5wb2ludHMgPSBbbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KSwgbmV3IFBvaW50KHRoaXMueCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgMCldO1xufVxuXG5SZWVmLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjQUE1NTU1XCI7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfcG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRzO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2xpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIFtuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1sxXSksIG5ldyBMaW5lKHBvaW50c1sxXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUocG9pbnRzWzJdLCBwb2ludHNbM10pLCBuZXcgTGluZShwb2ludHNbM10sIHBvaW50c1swXSldO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2RpYWdvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIG5ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9kaWFnb25hbHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRfcG9pbnRzKCk7XG5cbiAgICByZXR1cm4gW25ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKV07XG59O1xuXG5SZWVmLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBkaWFnMSA9IG5ldyBMaW5lKHRoaXMucG9pbnRzWzBdLCB0aGlzLnBvaW50c1syXSk7XG4gICAgdmFyIGRpYWcyID0gbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKTtcblxuICAgIHJldHVybiBkaWFnMS5pbnRlcnNlY3RzKGxpbmUpIHx8ICBkaWFnMi5pbnRlcnNlY3RzKGxpbmUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWVmO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIFNjaG9vbChvY2VhbiwgdGFyZ2V0KSB7XG4gICAgdGhpcy5maXNoID0gW107XG4gICAgdGhpcy5vY2VhbiA9IG9jZWFuO1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xufVxuXG5TY2hvb2wucHJvdG90eXBlLmFkZF9maXNoID0gZnVuY3Rpb24oZmlzaCkge1xuICAgIHRoaXMuZmlzaC5wdXNoKGZpc2gpO1xuICAgIGZpc2guc2V0X3BhdGgodGhpcy5vY2Vhbi5nZXRfcGF0aF90byhmaXNoLnBvcywgdGhpcy50YXJnZXQpKTtcbn07XG5cblNjaG9vbC5wcm90b3R5cGUuc2V0X3RhcmdldCA9IGZ1bmN0aW9uKHRhcmdldCkge1xuICAgIHRoaXMudGFyZ2V0ID0gdGFyZ2V0O1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmZpc2gubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5maXNoW2ldLnNldF9wYXRoKHRoaXMub2NlYW4uZ2V0X3BhdGhfdG8odGhpcy5maXNoW2ldLnBvcywgdGFyZ2V0KSk7XG4gICAgfVxufTtcblxuU2Nob29sLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIHRoaXMuZmlzaC5mb3JFYWNoKGZ1bmN0aW9uKGZpc2gpIHtcbiAgICAgICAgZmlzaC5kcmF3KGNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDU7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IFwiI0FBMzMzM1wiO1xuICAgIGNvbnRleHQuYXJjKHRoaXMudGFyZ2V0LngsIHRoaXMudGFyZ2V0LnksIDE1LCAwLCBNYXRoLlBJICogMik7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU2Nob29sO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBMaW5lID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLkxpbmU7XG52YXIgVHJpYW5nbGUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuVHJpYW5nbGU7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG5cbmZ1bmN0aW9uIFRyaWFuZ3VsYXRpb24ocG9pbnRzLCBjb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSB7XG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgdGhpcy5jb25zdHJhaW50cyA9IHJlbW92YWJsZV9jb25zdHJhaW50cy5jb25jYXQoY29uc3RyYWludHMpO1xuICAgIHRoaXMubGluZXMgPSB0aGlzLnRyaWFuZ3VsYXRlKHBvaW50cywgdGhpcy5jb25zdHJhaW50cyk7XG4gICAgdGhpcy5saW5lcy5zcGxpY2UoMCwgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzLmxlbmd0aCk7XG4gICAgdGhpcy5ncmFwaCA9IHRoaXMuYnVpbGRfZ3JhcGgodGhpcy5saW5lcyk7XG59XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnRyaWFuZ3VsYXRlID0gZnVuY3Rpb24ocG9pbnRzLCBjb25zdHJhaW50cykge1xuICAgIC8vSSBjb3VsZCBjcmVhdGUgYSBkaWN0aW9uYXJ5LCB0aGVuIHRha2UgYSBwb2ludCwgbG9vcCB0aHJvdWdoIGl0J3MgbmVpZ2hib3VyaW5nIHBvaW50cy5cbiAgICAvL0ZvciBlYWNoIG5laWdoYm91cmluZyBwb2ludCBsb29rIHRoZW0gdXAgaW4gdGhlIGRpY3Rpb25hcnkgYW5kIGF0dGVtcHQgdG8gZmluZCB0aGUgZmlyc3QgcG9pbnQuXG5cbiAgICAvL2dldCB0aGUgaW5pdGlhbCBsaW5lcy4gdGhlbiBsb29wIHRocm91Z2ggdGhlIHBvaW50cyBhbmQgYXR0ZW1wdCB0byBhZGQgYSBsaW5lIHVudGlsIHdlJ3ZlIHRyaWVkIGFsbCBvZiB0aGVtLlxuICAgIC8vQ291bGQgd2UgdXNlIHNvcnRlZG5lc3M/IFRoZW4gd2Ugb25seSBhZGQgcG9pbnRzIGluIGEgY2xvY2t3aXNlIG9yZGVyLlxuICAgIHZhciBsaW5lcyA9IGNvbnN0cmFpbnRzLnNsaWNlKCk7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvcih2YXIgaiA9IGkgKyAxOyBqIDwgcG9pbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcG9zc2libGVfbGluZSA9IG5ldyBMaW5lKHBvaW50c1tpXSwgcG9pbnRzW2pdKTtcbiAgICAgICAgICAgIHZhciB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIXBvc3NpYmxlX2xpbmUuaW50ZXJzZWN0c19hbnkobGluZXMpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChwb3NzaWJsZV9saW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lcztcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmJ1aWxkX2dyYXBoID0gZnVuY3Rpb24obGluZXMpIHtcbiAgICAvL1RPRE86IG9wdGltaXNlIHRoaXMuLi4uXG4gICAgdmFyIGdyYXBoID0gW107XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yKHZhciBqID0gaSArIDE7IGogPCBsaW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZm9yKHZhciBrID0gaiArIDE7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIHZhciBwb2ludHMgPSB0aGlzLnVuaXF1ZShsaW5lc1tpXS5wMSwgbGluZXNbaV0ucDIsIGxpbmVzW2pdLnAxLCBsaW5lc1tqXS5wMiwgbGluZXNba10ucDEsIGxpbmVzW2tdLnAyKTtcbiAgICAgICAgICAgICAgICBpZihwb2ludHMubGVuZ3RoID09PSAzKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyaWFuZ2xlID0gbmV3IFRyaWFuZ2xlKGxpbmVzW2ldLCBsaW5lc1tqXSwgbGluZXNba10sIHBvaW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBsID0gMDsgbCA8IGdyYXBoLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihncmFwaFtsXS5pc19uZWlnaGJvcih0cmlhbmdsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZS5hZGRfbmVpZ2hib3IoZ3JhcGhbbF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYXBoW2xdLmFkZF9uZWlnaGJvcih0cmlhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZ3JhcGgucHVzaCh0cmlhbmdsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyYXBoO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUgPSBmdW5jdGlvbihwKSB7XG4gICAgLy9UT0RPOiBJIGNvdWxkIHNvcnQgdGhlIGdyYXBoIGFuZCBtYWtlIHRoaXMgZmFzdGVyLlxuXG4gICAgdmFyIG1pbl9kID0gSW5maW5pdHk7XG4gICAgdmFyIG1pbjtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkID0gdGhpcy5ncmFwaFtpXS5nZXRfY2VudGVyKCkuZGlzdGFuY2UocCk7XG4gICAgICAgIGlmKGQgPCBtaW5fZCAmJiAhdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHAsIHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpKSkpIHtcbiAgICAgICAgICAgIG1pbl9kID0gZDtcbiAgICAgICAgICAgIG1pbiA9IHRoaXMuZ3JhcGhbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWluO1xufTtcblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmZpbmRfcGF0aCA9IGZ1bmN0aW9uKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICAvL1RPRE86IEl0J3Mgbm90IG9wdGltYWwgYmVjYXVzZSBJIGNhbiByZWR1Y2UgcGF0aHMgdXNpbmcgbXkgYWxnb3JpdGhtLCBidXQgZGprc3RyYXMgZG9lc24ndCBkbyB0aGF0LmNhbiBJIGFjdHVhbGx5IHJlZHVjZSB0aGUgZ3JhcGggYmVmb3JlIEkgcnVuIGRqa3N0cmFzP1xuICAgIHZhciBzdGFydCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoc3RhcnRfcG9pbnQpO1xuICAgIHZhciBlbmQgPSB0aGlzLmdldF9jbG9zZXN0X3RyaWFuZ2xlKGVuZF9wb2ludCk7XG5cbiAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGorKyl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmdyYXBoW2pdLmQ7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmdyYXBoW2pdLnByZXY7XG4gICAgfVxuXG4gICAgaWYoIWVuZCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW3N0YXJ0XTtcbiAgICBzdGFydC5kID0gMDtcbiAgICBzdGFydC5ub2RlID0gdW5kZWZpbmVkO1xuXG4gICAgZnVuY3Rpb24gZGlzdGFuY2VDb21wYXJhdG9yKGEsIGIpIHtyZXR1cm4gYS5kID4gYi5kO31cblxuICAgIHdoaWxlKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICB2YXIgY3VycmVudCA9IHF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgaWYoY3VycmVudCA9PT0gZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RfcGF0aChjdXJyZW50LCBzdGFydF9wb2ludCwgZW5kX3BvaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjdXJyZW50Lm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBjdXJyZW50LmQgKyBjdXJyZW50Lm5laWdoYm9yc1tpXS5kaXN0YW5jZShjdXJyZW50KTtcblxuICAgICAgICAgICAgaWYodHlwZW9mIGN1cnJlbnQubmVpZ2hib3JzW2ldLmQgPT09ICd1bmRlZmluZWQnIHx8IG5ld0QgPCBjdXJyZW50Lm5laWdoYm9yc1tpXS5kKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudC5uZWlnaGJvcnNbaV0uZCA9IG5ld0Q7XG4gICAgICAgICAgICAgICAgY3VycmVudC5uZWlnaGJvcnNbaV0ucHJldiA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgaWYocXVldWUuaW5kZXhPZihjdXJyZW50Lm5laWdoYm9yc1tpXSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY3VycmVudC5uZWlnaGJvcnNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXVlLnNvcnQoZGlzdGFuY2VDb21wYXJhdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RfcGF0aCA9IGZ1bmN0aW9uKG5vZGUsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICB2YXIgcGF0aCA9IFtdO1xuICAgIHdoaWxlKG5vZGUucHJldikge1xuICAgICAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuXG4gICAgcGF0aC5yZXZlcnNlKCk7XG4gICAgcGF0aC5wdXNoKGVuZF9wb2ludCk7XG4gICAgcGF0aC51bnNoaWZ0KHN0YXJ0X3BvaW50KTtcbiAgICB0aGlzLnJlZHVjZV9wYXRoKHBhdGgpO1xuXG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFyci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmVxdWFscyhhcnJbal0pKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZighY29udGFpbmVkKSB7XG4gICAgICAgICAgICBhcnIucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnJlZHVjZV9wYXRoID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICBpZighdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHBhdGhbaV0sIHBhdGhbaSArIDJdKSkpIHtcbiAgICAgICAgICAgIHBhdGguc3BsaWNlKGkgKyAxLCAxKTtcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYodGhpcy5jb25zdHJhaW50c1tpXS5pbnRlcnNlY3RzKGxpbmUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYoREVCVUcgPiA0KSB7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgICAgIHBvaW50LmRyYXcoY29udGV4dCwgXCIjNTU1NUFBXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpbmVzLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgbGluZS5kcmF3KGNvbnRleHQsIFwiIzU1NTVBQVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIHRyaWFuZ2xlLmRyYXcoY29udGV4dCk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaWFuZ3VsYXRpb247XG4iXX0=
