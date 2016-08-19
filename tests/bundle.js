(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

},{}],2:[function(require,module,exports){
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

},{"./geometry.js":1,"./reef.js":3,"./triangulation.js":4}],3:[function(require,module,exports){
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

},{"./geometry.js":1}],4:[function(require,module,exports){
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

},{"./geometry.js":1}],5:[function(require,module,exports){
"use strict";

var geometry = require("../app/js/geometry.js");
var Point = geometry.Point;
var Line = geometry.Line;

QUnit.assert.intersects = function(l1, l2, message) {
    this.push(l1.intersects(l2) && l2.intersects(l1), l1.toString() + "-/-" + l2.toString(), true, message);
};

QUnit.assert.notIntersects = function(l1, l2, message) {
    this.push(!l1.intersects(l2) && !l2.intersects(l1), l1.toString() + " --  / " + l2.toString(), false, message);
};

QUnit.module("Point");

QUnit.test("equals", function(assert) {
    assert.ok(new Point(10, 10).equals(new Point(10, 10)));
    assert.notOk(new Point(10, 20).equals(new Point(10, 10)));
    assert.notOk(new Point(20, 10).equals(new Point(10, 10)));
    assert.notOk(new Point(10, 10).equals(new Point(20, 10)));
    assert.notOk(new Point(10, 10).equals(new Point(10, 20)));
});

QUnit.test("subtract", function(assert) {
    var p1 = new Point(10, 10);
    var p0 = new Point(0, 0);

    assert.ok(p1.subtract(p0).equals(p1));
    assert.ok(p1.subtract(p1).equals(p0));
});

QUnit.test("add", function(assert) {
    var p1 = new Point(10, 10);
    var p0 = new Point(0, 0);

    assert.ok(p1.add(p0).equals(p1));
    assert.ok(p0.add(p1).equals(p1));

    assert.ok(p0.add(p0).equals(p0));
});

QUnit.test("cross_product", function(assert) {
    var p1 = new Point(1, 2);
    var p2 = new Point(3, 4);

    assert.equal(p1.cross_product(p2), -2);
});

QUnit.test("dot_product", function(assert) {
    var p1 = new Point(1, 2);
    var p2 = new Point(3, 4);

    assert.equal(p1.dot_product(p2), 11);
});

QUnit.test("scalar_product", function(assert) {
    var p1 = new Point(1, 2);

    assert.ok(p1.scalar_product(2).equals(new Point(2, 4)));
});

QUnit.module("Line");

QUnit.test("equals", function(assert) {
    var p1 = new Point(0, 0);
    var p2 = new Point(10, 10);
    var p3 = new Point(20, 20);
    var l1 = new Line(p1, p2);
    var l12 = new Line(p1, p2);
    var l2 = new Line(p1, p3);
    var l3 = new Line(p3, p1);

    assert.ok(l1.equals(l1));
    assert.ok(l1.equals(l12));
    assert.ok(l12.equals(l1));

    assert.notOk(l1.equals(l2));
    assert.notOk(l2.equals(l1));
    assert.notOk(l1.equals(l3));
});

QUnit.test("intersects", function(assert) {
    var p1 = new Point(0, 0);
    var p2 = new Point(0, 10);
    var p3 = new Point(10, 10);
    var p4 = new Point(10, 0);

    var l1 = new Line(p1, p3);
    var l12 = new Line(p3, p1);

    var l2 = new Line(p2, p4);
    var l3 = new Line(p1, p2);
    var l4 = new Line(p4, p3);

    //TODO: test more endpoint intersections


    assert.intersects(l1, l1);
    assert.intersects(l12, l1);
    assert.intersects(l1, l12);

    assert.intersects(l1,l2);
    assert.intersects(l12,l2);
    assert.intersects(l1,l1);

    assert.notIntersects(l3,l4);

    assert.notIntersects(l1,l3);
});

QUnit.test("intersects realistic", function(assert) {
    var p1 = new Point(0, 0);
    var p2 = new Point(600, 0);
    var p3 = new Point(600, 600);
    var p4 = new Point(0, 600);

    var r1 = new Point(200, 200);
    var r2 = new Point(400, 200);
    var r3 = new Point(400, 400);
    var r4 = new Point(200, 400);

    var r1r3 = new Line(r1, r3);
    var r2r4 = new Line(r2, r4);

    var r1r2 = new Line(r1, r2);
    var r2r3 = new Line(r2, r3);
    var r3r4 = new Line(r3, r4);
    var r4r1 = new Line(r4, r1);

    var reefs = [r1r3, r1r2, r2r3, r3r4, r4r1];

    reefs.forEach(function(l1) {
        reefs.forEach(function(l2) {
            if(!l2.equals(l1)) {
                assert.notIntersects(l1,l2);
            }
        });
    });

    assert.intersects(r1r3, r2r4);
});

QUnit.test("intersects regression", function(assert) {
    var p1 = new Point(0, 0);
    var p2 = new Point(600, 0);
    var p3 = new Point(600, 600);
    var p4 = new Point(0, 600);

    var r1 = new Point(200, 200);
    var r2 = new Point(400, 200);
    var r3 = new Point(400, 400);
    var r4 = new Point(200, 400);

    var r2r1 = new Line(r2, r1);

    var r1r2 = new Line(r1, r2);
    var r2r3 = new Line(r2, r3);
    var r3r4 = new Line(r3, r4);
    var r4r1 = new Line(r4, r1);

    var p1r1 = new Line(p1,r1);
    var r1r3 = new Line(r1,r3);

    var p1r2 = new Line(p1,r2);
    var p1r3 = new Line(p1,r3);
    var p2r1 = new Line(p2,r1);
    var r3p4 = new Line(p2,r1);

    assert.notIntersects(r1r2, r2r3);
    assert.notIntersects(r2r3, r1r2);
    assert.intersects(r1r2, r2r1);

    //debugger;
    assert.notIntersects(p1r1, r1r3);

    assert.intersects(p1r2, p2r1);
    assert.notIntersects(p1r1, r3p4);

    // debugger;
    assert.intersects(p1r1, p1r3);
});

},{"../app/js/geometry.js":1}],6:[function(require,module,exports){
"use strict";

require("./geometry.js");
require("./ocean.js");

},{"./geometry.js":5,"./ocean.js":7}],7:[function(require,module,exports){
"use strict";

var Ocean = require("../app/js/ocean.js");
var Reef = require("../app/js/reef.js");
var Line = require("../app/js/geometry.js").Line;
var Point = require("../app/js/geometry.js").Point;

QUnit.assert.contains = function(line, arr, message, truthy) {
    var found = false;
    arr.forEach(function(l) {
        if(line.equals(l)) {
            found = true;
            return;
        }
    });

    this.push(found &&  !truthy, found, line, message);
};

QUnit.module("Ocean");

},{"../app/js/geometry.js":1,"../app/js/ocean.js":2,"../app/js/reef.js":3}]},{},[6])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvZ2VvbWV0cnkuanMiLCJhcHAvanMvb2NlYW4uanMiLCJhcHAvanMvcmVlZi5qcyIsImFwcC9qcy90cmlhbmd1bGF0aW9uLmpzIiwidGVzdHMvZ2VvbWV0cnkuanMiLCJ0ZXN0cy9pbmRleC5qcyIsInRlc3RzL29jZWFuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25PQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25EQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoTUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3RMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gTGluZShwMSwgcDIpIHtcbiAgICB0aGlzLnAxID0gcDE7XG4gICAgdGhpcy5wMiA9IHAyO1xufVxuXG5MaW5lLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgcmV0dXJuICh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSAmJiB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkgfHxcbiAgICAgICAgKHRoaXMucDEuZXF1YWxzKGxpbmUucDIpICYmIHRoaXMucDIuZXF1YWxzKGxpbmUucDEpKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBjb2xvciB8fCBcIiNBQUFBQUFcIjtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDM7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQubW92ZVRvKHRoaXMucDEueCwgdGhpcy5wMS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnAyLngsIHRoaXMucDIueSk7XG4gICAgY29udGV4dC5zdHJva2UoKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucDEudG9TdHJpbmcoKSArIFwiID0+IFwiICsgdGhpcy5wMi50b1N0cmluZygpO1xufTtcblxuTGluZS5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBpZiAodGhpcy5lcXVhbHMobGluZSkpIHtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgdmFyIHMxID0gdGhpcy5wMi5zdWJ0cmFjdCh0aGlzLnAxKTtcbiAgICB2YXIgczIgPSBsaW5lLnAyLnN1YnRyYWN0KGxpbmUucDEpO1xuXG4gICAgdmFyIHMgPSAoLXMxLnkgKiAodGhpcy5wMS54IC0gbGluZS5wMS54KSArIHMxLnggKiAodGhpcy5wMS55IC0gbGluZS5wMS55KSkgLyAoLXMyLnggKiBzMS55ICsgczEueCAqIHMyLnkpO1xuICAgIHZhciB0ID0gKHMyLnggKiAodGhpcy5wMS55IC0gbGluZS5wMS55KSAtIHMyLnkgKiAodGhpcy5wMS54IC0gbGluZS5wMS54KSkgLyAoLXMyLnggKiBzMS55ICsgczEueCAqIHMyLnkpO1xuXG4gICAgaWYgKHMgPj0gMCAmJiBzIDw9IDEgJiYgdCA+PSAwICYmIHQgPD0gMSkge1xuICAgICAgICBpZiAodGhpcy5wMS5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMS5lcXVhbHMobGluZS5wMikgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMikpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9IGVsc2UgaWYgKGlzTmFOKHMpIHx8IGlzTmFOKHQpKSB7XG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBubyBwb2ludHMgdGhleSBkb24ndCBvdmVybGFwLlxuICAgICAgICBpZiAoISh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmJvdW5kaW5nX2NvbnRhaW5zKGxpbmUpIHx8IGxpbmUuYm91bmRpbmdfY29udGFpbnModGhpcyk7XG4gICAgICAgIH1cbiAgICAgICAgLy9Db2xpbmVhciwgZWl0aGVyIHRoZXkgb3ZlcmxhcCBvciB0aGV5IGRvbid0Li4uXG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBvbmUgcG9pbnQsIHRoZW4gdGhleSBvdmVybGFwIGlmIGFueSBvZiB0aGUgcG9pbnRzIGZhbGxzIHdpdGhpbiB0aGUgcmFuZ2Ugb2YgdGhlIGxpbmVzLlxuICAgICAgICAvL0lmIHRoZXkgc2hhcmUgYm90aCB0aGV5J3JlIGVxdWFsLCB3aGljaCB3ZSBjb3ZlciBhYm92ZVxuXG5cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5ib3VuZGluZ19jb250YWlucyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgdG9wX2xlZnQgPSBuZXcgUG9pbnQoTWF0aC5taW4odGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1pbih0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuICAgIHZhciBib3R0b21fcmlnaHQgPSBuZXcgUG9pbnQoTWF0aC5tYXgodGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1heCh0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuXG4gICAgcmV0dXJuIGxpbmUucDEuYmV0d2Vlbih0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KSB8fCBsaW5lLnAyLmJldHdlZW4odG9wX2xlZnQsIGJvdHRvbV9yaWdodCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzX2FueSA9IGZ1bmN0aW9uKGxpbmVzKSB7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGxpbmVzW2tdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBQb2ludCh4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xufVxuXG5Qb2ludC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCIoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbn07XG5cblBvaW50LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiB0aGlzLnggPT09IHBvaW50LnggJiYgdGhpcy55ID09PSBwb2ludC55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLnN1YnRyYWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54IC0gdi54LCB0aGlzLnkgLSB2LnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCArIHYueCwgdGhpcy55ICsgdi55KTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5zY2FsYXJfcHJvZHVjdCA9IGZ1bmN0aW9uKGMpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KGMgKiB0aGlzLngsIGMgKiB0aGlzLnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmNyb3NzX3Byb2R1Y3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueSAtIHRoaXMueSAqIHYueDtcbn07XG5cblBvaW50LnByb3RvdHlwZS5kb3RfcHJvZHVjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi54ICsgdGhpcy55ICogdi55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmJldHdlZW4gPSBmdW5jdGlvbihwMSwgcDIpIHtcbiAgICByZXR1cm4gdGhpcy54ID4gcDEueCAmJiB0aGlzLnggPCBwMi54ICYmIHRoaXMueSA+IHAxLnkgJiYgdGhpcy55IDwgcDIueTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5kaXN0YW5jZSA9IGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gTWF0aC5zcXJ0KE1hdGgucG93KHRoaXMueCAtIHAueCwgMikgKyBNYXRoLnBvdyh0aGlzLnkgLSBwLnksIDIpKTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCwgY29sb3IpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IGNvbG9yIHx8IFwiI0FBQUFBQVwiO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmFyYyh0aGlzLngsIHRoaXMueSwgMTAsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cbmZ1bmN0aW9uIFRyaWFuZ2xlKGUxLCBlMiwgZTMsIHBvaW50cykge1xuICAgIHRoaXMuZWRnZXMgPSBbZTEsIGUyLCBlM107XG4gICAgdGhpcy5uZWlnaGJvcnMgPSBbXTtcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgICB0aGlzLmNvbG9yID0gZ2V0UmFuZG9tQ29sb3IoKTtcbn1cblxuVHJpYW5nbGUucHJvdG90eXBlLmdldF9jZW50ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAvL0NlbnRyb2lkOlxuICAgIC8vcmV0dXJuIG5ldyBQb2ludCgodGhpcy5wb2ludHNbMF0ueCArIHRoaXMucG9pbnRzWzFdLnggKyB0aGlzLnBvaW50c1syXS54KSAvIDMsICh0aGlzLnBvaW50c1swXS55ICsgdGhpcy5wb2ludHNbMV0ueSArIHRoaXMucG9pbnRzWzJdLnkpIC8gMyk7XG5cbiAgICB2YXIgYSA9IHRoaXMucG9pbnRzWzBdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzFdKTtcbiAgICB2YXIgYiA9IHRoaXMucG9pbnRzWzBdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzJdKTtcbiAgICB2YXIgYyA9IHRoaXMucG9pbnRzWzFdLmRpc3RhbmNlKHRoaXMucG9pbnRzWzJdKTtcbiAgICB2YXIgcCA9IGEgKyBiICsgYztcblxuICAgIHJldHVybiBuZXcgUG9pbnQoKGEgKiB0aGlzLnBvaW50c1syXS54ICsgYiAqIHRoaXMucG9pbnRzWzFdLnggKyBjICogdGhpcy5wb2ludHNbMF0ueCkgLyBwLCAoYSAqIHRoaXMucG9pbnRzWzJdLnkgKyBiICogdGhpcy5wb2ludHNbMV0ueSArIGMgKiB0aGlzLnBvaW50c1swXS55KSAvIHApO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24odCkge1xuICAgIHJldHVybiB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0LmdldF9jZW50ZXIoKSk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHAxID0gdGhpcy5wb2ludHNbMF07XG4gICAgdmFyIHAyID0gdGhpcy5wb2ludHNbMV07XG4gICAgdmFyIHAzID0gdGhpcy5wb2ludHNbMl07XG5cbiAgICB2YXIgYWxwaGEgPSAoKHAyLnkgLSBwMy55KSAqIChwLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocC55IC0gcDMueSkpIC9cbiAgICAgICAgKChwMi55IC0gcDMueSkgKiAocDEueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwMS55IC0gcDMueSkpO1xuICAgIHZhciBiZXRhID0gKChwMy55IC0gcDEueSkgKiAocC54IC0gcDMueCkgKyAocDEueCAtIHAzLngpICogKHAueSAtIHAzLnkpKSAvXG4gICAgICAgICgocDIueSAtIHAzLnkpICogKHAxLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocDEueSAtIHAzLnkpKTtcbiAgICB2YXIgZ2FtbWEgPSAxIC0gYWxwaGEgLSBiZXRhO1xuXG4gICAgcmV0dXJuIGFscGhhID4gMCAmJiBiZXRhID4gMCAmJiBnYW1tYSA+IDA7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuaXNfbmVpZ2hib3IgPSBmdW5jdGlvbih0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdC5lZGdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZWRnZXNbaV0uZXF1YWxzKHQuZWRnZXNbal0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmFkZF9uZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLm5laWdoYm9ycy5wdXNoKHQpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuXG4gICAgaWYgKERFQlVHID4gNSkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMucG9pbnRzWzBdLngsIHRoaXMucG9pbnRzWzBdLnkpO1xuXG4gICAgICAgIGNvbnRleHQubGluZVRvKHRoaXMucG9pbnRzWzFdLngsIHRoaXMucG9pbnRzWzFdLnkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1syXS54LCB0aGlzLnBvaW50c1syXS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgIH1cblxuICAgIGlmIChERUJVRyA+IDIpIHtcbiAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcblxuICAgICAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUFBQUFBXCI7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICAgICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICAgICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMuZ2V0X2NlbnRlcigpLngsIHRoaXMuZ2V0X2NlbnRlcigpLnkpO1xuICAgICAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLngsIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgICAgIGNvbnRleHQuc3Ryb2tlKCk7XG4gICAgICAgICAgICBpZiAoREVCVUcgPiAzKSB7XG4gICAgICAgICAgICAgICAgdmFyIGQgPSB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkpO1xuICAgICAgICAgICAgICAgIGNvbnRleHQuZmlsbFRleHQoZC50b0ZpeGVkKDApLCAodGhpcy5nZXRfY2VudGVyKCkueCArIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS54KSAvIDIgKyAxMCwgKHRoaXMuZ2V0X2NlbnRlcigpLnkgKyB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueSkgLyAyICsgMTApO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgaWYgKERFQlVHID4gMCkge1xuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0LmFyYyh0aGlzLmdldF9jZW50ZXIoKS54LCB0aGlzLmdldF9jZW50ZXIoKS55LCA4LCA4LCAwLCBNYXRoLlBJICogMik7XG4gICAgICAgIGNvbnRleHQuZmlsbCgpO1xuICAgIH1cbn07XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xuICAgIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnO1xuICAgIHZhciBjb2xvciA9ICcjJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5Qb2ludCA9IFBvaW50O1xubW9kdWxlLmV4cG9ydHMuTGluZSA9IExpbmU7XG5tb2R1bGUuZXhwb3J0cy5UcmlhbmdsZSA9IFRyaWFuZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVlZiA9IHJlcXVpcmUoJy4vcmVlZi5qcycpO1xudmFyIExpbmUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuTGluZTtcbnZhciBUcmlhbmdsZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5UcmlhbmdsZTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcbnZhciBUcmlhbmd1bGF0aW9uID0gcmVxdWlyZSgnLi90cmlhbmd1bGF0aW9uLmpzJyk7XG5cbmZ1bmN0aW9uIE9jZWFuKHdpZHRoLCBoZWlnaHQsIHJlZWZzKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVlZnMgPSByZWVmcztcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn1cblxuT2NlYW4ucHJvdG90eXBlLnJldHJpYW5ndWxhdGUgPSBmdW5jdGlvbiAoKSB7XG4gICAgdGhpcy50cmlhbmd1bGF0aW9uID0gbmV3IFRyaWFuZ3VsYXRpb24odGhpcy5nZXRfcG9pbnRzKCksIHRoaXMuZ2V0X2xpbmVzKCksIHRoaXMuZ2V0X2RpYWdzKCkpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9wYXRoX3RvID0gZnVuY3Rpb24oc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIHJldHVybiB0aGlzLnRyaWFuZ3VsYXRpb24uZmluZF9wYXRoKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9wb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gbmV3IFJlZWYoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9wb2ludHMoKTtcblxuICAgIHRoaXMucmVlZnMuZm9yRWFjaChmdW5jdGlvbihyZWVmKSB7XG4gICAgICAgIHZhciBwcyA9IHJlZWYuZ2V0X3BvaW50cygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwc1tpXSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHBvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgaWYoYS54ID09IGIueCkge1xuICAgICAgICAgICAgcmV0dXJuIGEueSA+IGIueTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhLnggPiBiLng7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcG9pbnRzO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9saW5lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsaW5lcyA9IG5ldyBSZWVmKDAsMCx0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X2xpbmVzKCk7XG5cbiAgICBmdW5jdGlvbiBhZGQobGluZSkge2xpbmVzLnB1c2gobGluZSk7fVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZWVmc1tpXS5nZXRfbGluZXMoKS5mb3JFYWNoKGFkZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9kaWFncyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlZWZzLm1hcChmdW5jdGlvbihyKSB7cmV0dXJuIHIuZ2V0X2RpYWdvbmFsKCk7fSk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuYWRkX3JlZWYgPSBmdW5jdGlvbihyZWVmKSB7XG4gICAgdGhpcy5yZWVmcy5wdXNoKHJlZWYpO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgdGhpcy5yZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKHJlZWYpIHtcbiAgICAgICAgcmVlZi5kcmF3KGNvbnRleHQpO1xuICAgIH0pO1xuXG4gICAgdGhpcy50cmlhbmd1bGF0aW9uLmRyYXcoY29udGV4dCk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IE9jZWFuO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgZ2VvbWV0cnkgPSByZXF1aXJlKFwiLi9nZW9tZXRyeS5qc1wiKTtcbnZhciBQb2ludCA9IGdlb21ldHJ5LlBvaW50O1xudmFyIExpbmUgPSBnZW9tZXRyeS5MaW5lO1xuXG5mdW5jdGlvbiBSZWVmKHgsIHksIHdpZHRoLCBoZWlnaHQpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5wb2ludHMgPSBbbmV3IFBvaW50KHRoaXMueCwgdGhpcy55KSwgbmV3IFBvaW50KHRoaXMueCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgdGhpcy5oZWlnaHQpLCBuZXcgUG9pbnQodGhpcy54ICsgdGhpcy53aWR0aCwgdGhpcy55ICsgMCldO1xufVxuXG5SZWVmLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gXCIjQUE1NTU1XCI7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxSZWN0KHRoaXMueCwgdGhpcy55LCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfcG9pbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRzO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2xpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIFtuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1sxXSksIG5ldyBMaW5lKHBvaW50c1sxXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUocG9pbnRzWzJdLCBwb2ludHNbM10pLCBuZXcgTGluZShwb2ludHNbM10sIHBvaW50c1swXSldO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2RpYWdvbmFsID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIG5ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9kaWFnb25hbHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRfcG9pbnRzKCk7XG5cbiAgICByZXR1cm4gW25ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzJdKSwgbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKV07XG59O1xuXG5SZWVmLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciBkaWFnMSA9IG5ldyBMaW5lKHRoaXMucG9pbnRzWzBdLCB0aGlzLnBvaW50c1syXSk7XG4gICAgdmFyIGRpYWcyID0gbmV3IExpbmUodGhpcy5wb2ludHNbMV0sIHRoaXMucG9pbnRzWzNdKTtcblxuICAgIHJldHVybiBkaWFnMS5pbnRlcnNlY3RzKGxpbmUpIHx8ICBkaWFnMi5pbnRlcnNlY3RzKGxpbmUpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWVmO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBMaW5lID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLkxpbmU7XG52YXIgVHJpYW5nbGUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuVHJpYW5nbGU7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG5cbmZ1bmN0aW9uIFRyaWFuZ3VsYXRpb24ocG9pbnRzLCBjb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSB7XG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgdGhpcy5jb25zdHJhaW50cyA9IHJlbW92YWJsZV9jb25zdHJhaW50cy5jb25jYXQoY29uc3RyYWludHMpO1xuICAgIHRoaXMubGluZXMgPSB0aGlzLnRyaWFuZ3VsYXRlKHBvaW50cywgdGhpcy5jb25zdHJhaW50cyk7XG4gICAgdGhpcy5saW5lcy5zcGxpY2UoMCwgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzLmxlbmd0aCk7XG4gICAgdGhpcy5ncmFwaCA9IHRoaXMuYnVpbGRfZ3JhcGgodGhpcy5saW5lcyk7XG59XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnRyaWFuZ3VsYXRlID0gZnVuY3Rpb24ocG9pbnRzLCBjb25zdHJhaW50cykge1xuICAgIC8vSSBjb3VsZCBjcmVhdGUgYSBkaWN0aW9uYXJ5LCB0aGVuIHRha2UgYSBwb2ludCwgbG9vcCB0aHJvdWdoIGl0J3MgbmVpZ2hib3VyaW5nIHBvaW50cy5cbiAgICAvL0ZvciBlYWNoIG5laWdoYm91cmluZyBwb2ludCBsb29rIHRoZW0gdXAgaW4gdGhlIGRpY3Rpb25hcnkgYW5kIGF0dGVtcHQgdG8gZmluZCB0aGUgZmlyc3QgcG9pbnQuXG5cbiAgICAvL2dldCB0aGUgaW5pdGlhbCBsaW5lcy4gdGhlbiBsb29wIHRocm91Z2ggdGhlIHBvaW50cyBhbmQgYXR0ZW1wdCB0byBhZGQgYSBsaW5lIHVudGlsIHdlJ3ZlIHRyaWVkIGFsbCBvZiB0aGVtLlxuICAgIC8vQ291bGQgd2UgdXNlIHNvcnRlZG5lc3M/IFRoZW4gd2Ugb25seSBhZGQgcG9pbnRzIGluIGEgY2xvY2t3aXNlIG9yZGVyLlxuICAgIHZhciBsaW5lcyA9IGNvbnN0cmFpbnRzLnNsaWNlKCk7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvcih2YXIgaiA9IGkgKyAxOyBqIDwgcG9pbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcG9zc2libGVfbGluZSA9IG5ldyBMaW5lKHBvaW50c1tpXSwgcG9pbnRzW2pdKTtcbiAgICAgICAgICAgIHZhciB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIXBvc3NpYmxlX2xpbmUuaW50ZXJzZWN0c19hbnkobGluZXMpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChwb3NzaWJsZV9saW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lcztcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmJ1aWxkX2dyYXBoID0gZnVuY3Rpb24obGluZXMpIHtcbiAgICAvL1RPRE86IG9wdGltaXNlIHRoaXMuLi4uXG4gICAgdmFyIGdyYXBoID0gW107XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yKHZhciBqID0gaSArIDE7IGogPCBsaW5lcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgZm9yKHZhciBrID0gaiArIDE7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIHZhciBwb2ludHMgPSB0aGlzLnVuaXF1ZShsaW5lc1tpXS5wMSwgbGluZXNbaV0ucDIsIGxpbmVzW2pdLnAxLCBsaW5lc1tqXS5wMiwgbGluZXNba10ucDEsIGxpbmVzW2tdLnAyKTtcbiAgICAgICAgICAgICAgICBpZihwb2ludHMubGVuZ3RoID09PSAzKXtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyaWFuZ2xlID0gbmV3IFRyaWFuZ2xlKGxpbmVzW2ldLCBsaW5lc1tqXSwgbGluZXNba10sIHBvaW50cyk7XG5cbiAgICAgICAgICAgICAgICAgICAgZm9yKHZhciBsID0gMDsgbCA8IGdyYXBoLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZihncmFwaFtsXS5pc19uZWlnaGJvcih0cmlhbmdsZSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZS5hZGRfbmVpZ2hib3IoZ3JhcGhbbF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGdyYXBoW2xdLmFkZF9uZWlnaGJvcih0cmlhbmdsZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZ3JhcGgucHVzaCh0cmlhbmdsZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGdyYXBoO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUgPSBmdW5jdGlvbihwKSB7XG4gICAgLy9UT0RPOiBJIGNvdWxkIHNvcnQgdGhlIGdyYXBoIGFuZCBtYWtlIHRoaXMgZmFzdGVyLlxuXG4gICAgdmFyIG1pbl9kID0gSW5maW5pdHk7XG4gICAgdmFyIG1pbjtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLmdyYXBoLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBkID0gdGhpcy5ncmFwaFtpXS5nZXRfY2VudGVyKCkuZGlzdGFuY2UocCk7XG4gICAgICAgIGlmKGQgPCBtaW5fZCAmJiAhdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHAsIHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpKSkpIHtcbiAgICAgICAgICAgIG1pbl9kID0gZDtcbiAgICAgICAgICAgIG1pbiA9IHRoaXMuZ3JhcGhbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWluO1xufTtcblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmZpbmRfcGF0aCA9IGZ1bmN0aW9uKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICAvL1RPRE86IEl0J3Mgbm90IG9wdGltYWwgYmVjYXVzZSBJIGNhbiByZWR1Y2UgcGF0aHMgdXNpbmcgbXkgYWxnb3JpdGhtLCBidXQgZGprc3RyYXMgZG9lc24ndCBkbyB0aGF0LmNhbiBJIGFjdHVhbGx5IHJlZHVjZSB0aGUgZ3JhcGggYmVmb3JlIEkgcnVuIGRqa3N0cmFzP1xuICAgIHZhciBzdGFydCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoc3RhcnRfcG9pbnQpO1xuICAgIHZhciBlbmQgPSB0aGlzLmdldF9jbG9zZXN0X3RyaWFuZ2xlKGVuZF9wb2ludCk7XG5cbiAgICBmb3IodmFyIGogPSAwOyBqIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGorKyl7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmdyYXBoW2pdLmQ7XG4gICAgICAgIGRlbGV0ZSB0aGlzLmdyYXBoW2pdLnByZXY7XG4gICAgfVxuXG4gICAgaWYoIWVuZCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW3N0YXJ0XTtcbiAgICBzdGFydC5kID0gMDtcbiAgICBzdGFydC5ub2RlID0gdW5kZWZpbmVkO1xuXG4gICAgZnVuY3Rpb24gZGlzdGFuY2VDb21wYXJhdG9yKGEsIGIpIHtyZXR1cm4gYS5kID4gYi5kO31cblxuICAgIHdoaWxlKHF1ZXVlLmxlbmd0aCkge1xuICAgICAgICB2YXIgY3VycmVudCA9IHF1ZXVlLnNoaWZ0KCk7XG5cbiAgICAgICAgaWYoY3VycmVudCA9PT0gZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RfcGF0aChjdXJyZW50LCBzdGFydF9wb2ludCwgZW5kX3BvaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBjdXJyZW50Lm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBjdXJyZW50LmQgKyBjdXJyZW50Lm5laWdoYm9yc1tpXS5kaXN0YW5jZShjdXJyZW50KTtcblxuICAgICAgICAgICAgaWYodHlwZW9mIGN1cnJlbnQubmVpZ2hib3JzW2ldLmQgPT09ICd1bmRlZmluZWQnIHx8IG5ld0QgPCBjdXJyZW50Lm5laWdoYm9yc1tpXS5kKSB7XG4gICAgICAgICAgICAgICAgY3VycmVudC5uZWlnaGJvcnNbaV0uZCA9IG5ld0Q7XG4gICAgICAgICAgICAgICAgY3VycmVudC5uZWlnaGJvcnNbaV0ucHJldiA9IGN1cnJlbnQ7XG4gICAgICAgICAgICAgICAgaWYocXVldWUuaW5kZXhPZihjdXJyZW50Lm5laWdoYm9yc1tpXSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY3VycmVudC5uZWlnaGJvcnNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXVlLnNvcnQoZGlzdGFuY2VDb21wYXJhdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RfcGF0aCA9IGZ1bmN0aW9uKG5vZGUsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICB2YXIgcGF0aCA9IFtdO1xuICAgIHdoaWxlKG5vZGUucHJldikge1xuICAgICAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuXG4gICAgcGF0aC5yZXZlcnNlKCk7XG4gICAgcGF0aC5wdXNoKGVuZF9wb2ludCk7XG4gICAgcGF0aC51bnNoaWZ0KHN0YXJ0X3BvaW50KTtcbiAgICB0aGlzLnJlZHVjZV9wYXRoKHBhdGgpO1xuXG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGNvbnRhaW5lZCA9IGZhbHNlO1xuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGFyci5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYoYXJndW1lbnRzW2ldLmVxdWFscyhhcnJbal0pKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZighY29udGFpbmVkKSB7XG4gICAgICAgICAgICBhcnIucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnJlZHVjZV9wYXRoID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBwYXRoLmxlbmd0aCAtIDI7IGkrKykge1xuICAgICAgICBpZighdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHBhdGhbaV0sIHBhdGhbaSArIDJdKSkpIHtcbiAgICAgICAgICAgIHBhdGguc3BsaWNlKGkgKyAxLCAxKTtcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYodGhpcy5jb25zdHJhaW50c1tpXS5pbnRlcnNlY3RzKGxpbmUpKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgaWYoREVCVUcgPiA0KSB7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgICAgIHBvaW50LmRyYXcoY29udGV4dCwgXCIjNTU1NUFBXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpbmVzLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgbGluZS5kcmF3KGNvbnRleHQsIFwiIzU1NTVBQVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIHRyaWFuZ2xlLmRyYXcoY29udGV4dCk7XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaWFuZ3VsYXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGdlb21ldHJ5ID0gcmVxdWlyZShcIi4uL2FwcC9qcy9nZW9tZXRyeS5qc1wiKTtcbnZhciBQb2ludCA9IGdlb21ldHJ5LlBvaW50O1xudmFyIExpbmUgPSBnZW9tZXRyeS5MaW5lO1xuXG5RVW5pdC5hc3NlcnQuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGwxLCBsMiwgbWVzc2FnZSkge1xuICAgIHRoaXMucHVzaChsMS5pbnRlcnNlY3RzKGwyKSAmJiBsMi5pbnRlcnNlY3RzKGwxKSwgbDEudG9TdHJpbmcoKSArIFwiLS8tXCIgKyBsMi50b1N0cmluZygpLCB0cnVlLCBtZXNzYWdlKTtcbn07XG5cblFVbml0LmFzc2VydC5ub3RJbnRlcnNlY3RzID0gZnVuY3Rpb24obDEsIGwyLCBtZXNzYWdlKSB7XG4gICAgdGhpcy5wdXNoKCFsMS5pbnRlcnNlY3RzKGwyKSAmJiAhbDIuaW50ZXJzZWN0cyhsMSksIGwxLnRvU3RyaW5nKCkgKyBcIiAtLSAgLyBcIiArIGwyLnRvU3RyaW5nKCksIGZhbHNlLCBtZXNzYWdlKTtcbn07XG5cblFVbml0Lm1vZHVsZShcIlBvaW50XCIpO1xuXG5RVW5pdC50ZXN0KFwiZXF1YWxzXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIGFzc2VydC5vayhuZXcgUG9pbnQoMTAsIDEwKS5lcXVhbHMobmV3IFBvaW50KDEwLCAxMCkpKTtcbiAgICBhc3NlcnQubm90T2sobmV3IFBvaW50KDEwLCAyMCkuZXF1YWxzKG5ldyBQb2ludCgxMCwgMTApKSk7XG4gICAgYXNzZXJ0Lm5vdE9rKG5ldyBQb2ludCgyMCwgMTApLmVxdWFscyhuZXcgUG9pbnQoMTAsIDEwKSkpO1xuICAgIGFzc2VydC5ub3RPayhuZXcgUG9pbnQoMTAsIDEwKS5lcXVhbHMobmV3IFBvaW50KDIwLCAxMCkpKTtcbiAgICBhc3NlcnQubm90T2sobmV3IFBvaW50KDEwLCAxMCkuZXF1YWxzKG5ldyBQb2ludCgxMCwgMjApKSk7XG59KTtcblxuUVVuaXQudGVzdChcInN1YnRyYWN0XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwMCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAgIGFzc2VydC5vayhwMS5zdWJ0cmFjdChwMCkuZXF1YWxzKHAxKSk7XG4gICAgYXNzZXJ0Lm9rKHAxLnN1YnRyYWN0KHAxKS5lcXVhbHMocDApKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiYWRkXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwMCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAgIGFzc2VydC5vayhwMS5hZGQocDApLmVxdWFscyhwMSkpO1xuICAgIGFzc2VydC5vayhwMC5hZGQocDEpLmVxdWFscyhwMSkpO1xuXG4gICAgYXNzZXJ0Lm9rKHAwLmFkZChwMCkuZXF1YWxzKHAwKSk7XG59KTtcblxuUVVuaXQudGVzdChcImNyb3NzX3Byb2R1Y3RcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDEsIDIpO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCgzLCA0KTtcblxuICAgIGFzc2VydC5lcXVhbChwMS5jcm9zc19wcm9kdWN0KHAyKSwgLTIpO1xufSk7XG5cblFVbml0LnRlc3QoXCJkb3RfcHJvZHVjdFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMSwgMik7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDMsIDQpO1xuXG4gICAgYXNzZXJ0LmVxdWFsKHAxLmRvdF9wcm9kdWN0KHAyKSwgMTEpO1xufSk7XG5cblFVbml0LnRlc3QoXCJzY2FsYXJfcHJvZHVjdFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMSwgMik7XG5cbiAgICBhc3NlcnQub2socDEuc2NhbGFyX3Byb2R1Y3QoMikuZXF1YWxzKG5ldyBQb2ludCgyLCA0KSkpO1xufSk7XG5cblFVbml0Lm1vZHVsZShcIkxpbmVcIik7XG5cblFVbml0LnRlc3QoXCJlcXVhbHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCgyMCwgMjApO1xuICAgIHZhciBsMSA9IG5ldyBMaW5lKHAxLCBwMik7XG4gICAgdmFyIGwxMiA9IG5ldyBMaW5lKHAxLCBwMik7XG4gICAgdmFyIGwyID0gbmV3IExpbmUocDEsIHAzKTtcbiAgICB2YXIgbDMgPSBuZXcgTGluZShwMywgcDEpO1xuXG4gICAgYXNzZXJ0Lm9rKGwxLmVxdWFscyhsMSkpO1xuICAgIGFzc2VydC5vayhsMS5lcXVhbHMobDEyKSk7XG4gICAgYXNzZXJ0Lm9rKGwxMi5lcXVhbHMobDEpKTtcblxuICAgIGFzc2VydC5ub3RPayhsMS5lcXVhbHMobDIpKTtcbiAgICBhc3NlcnQubm90T2sobDIuZXF1YWxzKGwxKSk7XG4gICAgYXNzZXJ0Lm5vdE9rKGwxLmVxdWFscyhsMykpO1xufSk7XG5cblFVbml0LnRlc3QoXCJpbnRlcnNlY3RzXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB2YXIgcDIgPSBuZXcgUG9pbnQoMCwgMTApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwNCA9IG5ldyBQb2ludCgxMCwgMCk7XG5cbiAgICB2YXIgbDEgPSBuZXcgTGluZShwMSwgcDMpO1xuICAgIHZhciBsMTIgPSBuZXcgTGluZShwMywgcDEpO1xuXG4gICAgdmFyIGwyID0gbmV3IExpbmUocDIsIHA0KTtcbiAgICB2YXIgbDMgPSBuZXcgTGluZShwMSwgcDIpO1xuICAgIHZhciBsNCA9IG5ldyBMaW5lKHA0LCBwMyk7XG5cbiAgICAvL1RPRE86IHRlc3QgbW9yZSBlbmRwb2ludCBpbnRlcnNlY3Rpb25zXG5cblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKGwxLCBsMSk7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEyLCBsMSk7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEsIGwxMik7XG5cbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMSxsMik7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEyLGwyKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMSxsMSk7XG5cbiAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhsMyxsNCk7XG5cbiAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhsMSxsMyk7XG59KTtcblxuUVVuaXQudGVzdChcImludGVyc2VjdHMgcmVhbGlzdGljXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB2YXIgcDIgPSBuZXcgUG9pbnQoNjAwLCAwKTtcbiAgICB2YXIgcDMgPSBuZXcgUG9pbnQoNjAwLCA2MDApO1xuICAgIHZhciBwNCA9IG5ldyBQb2ludCgwLCA2MDApO1xuXG4gICAgdmFyIHIxID0gbmV3IFBvaW50KDIwMCwgMjAwKTtcbiAgICB2YXIgcjIgPSBuZXcgUG9pbnQoNDAwLCAyMDApO1xuICAgIHZhciByMyA9IG5ldyBQb2ludCg0MDAsIDQwMCk7XG4gICAgdmFyIHI0ID0gbmV3IFBvaW50KDIwMCwgNDAwKTtcblxuICAgIHZhciByMXIzID0gbmV3IExpbmUocjEsIHIzKTtcbiAgICB2YXIgcjJyNCA9IG5ldyBMaW5lKHIyLCByNCk7XG5cbiAgICB2YXIgcjFyMiA9IG5ldyBMaW5lKHIxLCByMik7XG4gICAgdmFyIHIycjMgPSBuZXcgTGluZShyMiwgcjMpO1xuICAgIHZhciByM3I0ID0gbmV3IExpbmUocjMsIHI0KTtcbiAgICB2YXIgcjRyMSA9IG5ldyBMaW5lKHI0LCByMSk7XG5cbiAgICB2YXIgcmVlZnMgPSBbcjFyMywgcjFyMiwgcjJyMywgcjNyNCwgcjRyMV07XG5cbiAgICByZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKGwxKSB7XG4gICAgICAgIHJlZWZzLmZvckVhY2goZnVuY3Rpb24obDIpIHtcbiAgICAgICAgICAgIGlmKCFsMi5lcXVhbHMobDEpKSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMobDEsbDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKHIxcjMsIHIycjQpO1xufSk7XG5cblFVbml0LnRlc3QoXCJpbnRlcnNlY3RzIHJlZ3Jlc3Npb25cIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCg2MDAsIDApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCg2MDAsIDYwMCk7XG4gICAgdmFyIHA0ID0gbmV3IFBvaW50KDAsIDYwMCk7XG5cbiAgICB2YXIgcjEgPSBuZXcgUG9pbnQoMjAwLCAyMDApO1xuICAgIHZhciByMiA9IG5ldyBQb2ludCg0MDAsIDIwMCk7XG4gICAgdmFyIHIzID0gbmV3IFBvaW50KDQwMCwgNDAwKTtcbiAgICB2YXIgcjQgPSBuZXcgUG9pbnQoMjAwLCA0MDApO1xuXG4gICAgdmFyIHIycjEgPSBuZXcgTGluZShyMiwgcjEpO1xuXG4gICAgdmFyIHIxcjIgPSBuZXcgTGluZShyMSwgcjIpO1xuICAgIHZhciByMnIzID0gbmV3IExpbmUocjIsIHIzKTtcbiAgICB2YXIgcjNyNCA9IG5ldyBMaW5lKHIzLCByNCk7XG4gICAgdmFyIHI0cjEgPSBuZXcgTGluZShyNCwgcjEpO1xuXG4gICAgdmFyIHAxcjEgPSBuZXcgTGluZShwMSxyMSk7XG4gICAgdmFyIHIxcjMgPSBuZXcgTGluZShyMSxyMyk7XG5cbiAgICB2YXIgcDFyMiA9IG5ldyBMaW5lKHAxLHIyKTtcbiAgICB2YXIgcDFyMyA9IG5ldyBMaW5lKHAxLHIzKTtcbiAgICB2YXIgcDJyMSA9IG5ldyBMaW5lKHAyLHIxKTtcbiAgICB2YXIgcjNwNCA9IG5ldyBMaW5lKHAyLHIxKTtcblxuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHIxcjIsIHIycjMpO1xuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHIycjMsIHIxcjIpO1xuICAgIGFzc2VydC5pbnRlcnNlY3RzKHIxcjIsIHIycjEpO1xuXG4gICAgLy9kZWJ1Z2dlcjtcbiAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhwMXIxLCByMXIzKTtcblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKHAxcjIsIHAycjEpO1xuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHAxcjEsIHIzcDQpO1xuXG4gICAgLy8gZGVidWdnZXI7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMocDFyMSwgcDFyMyk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKFwiLi9nZW9tZXRyeS5qc1wiKTtcbnJlcXVpcmUoXCIuL29jZWFuLmpzXCIpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBPY2VhbiA9IHJlcXVpcmUoXCIuLi9hcHAvanMvb2NlYW4uanNcIik7XG52YXIgUmVlZiA9IHJlcXVpcmUoXCIuLi9hcHAvanMvcmVlZi5qc1wiKTtcbnZhciBMaW5lID0gcmVxdWlyZShcIi4uL2FwcC9qcy9nZW9tZXRyeS5qc1wiKS5MaW5lO1xudmFyIFBvaW50ID0gcmVxdWlyZShcIi4uL2FwcC9qcy9nZW9tZXRyeS5qc1wiKS5Qb2ludDtcblxuUVVuaXQuYXNzZXJ0LmNvbnRhaW5zID0gZnVuY3Rpb24obGluZSwgYXJyLCBtZXNzYWdlLCB0cnV0aHkpIHtcbiAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbihsKSB7XG4gICAgICAgIGlmKGxpbmUuZXF1YWxzKGwpKSB7XG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucHVzaChmb3VuZCAmJiAgIXRydXRoeSwgZm91bmQsIGxpbmUsIG1lc3NhZ2UpO1xufTtcblxuUVVuaXQubW9kdWxlKFwiT2NlYW5cIik7XG4iXX0=
