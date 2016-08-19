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

Reef.prototype.contains = function(p) {
    return p.x >= this.x && p.y >= this.y && p.x <= this.x + this.width && p.y <= this.y + this.height;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvZ2VvbWV0cnkuanMiLCJhcHAvanMvb2NlYW4uanMiLCJhcHAvanMvcmVlZi5qcyIsImFwcC9qcy90cmlhbmd1bGF0aW9uLmpzIiwidGVzdHMvZ2VvbWV0cnkuanMiLCJ0ZXN0cy9pbmRleC5qcyIsInRlc3RzL29jZWFuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyT0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9GQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hOQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBMaW5lKHAxLCBwMikge1xuICAgIHRoaXMucDEgPSBwMTtcbiAgICB0aGlzLnAyID0gcDI7XG59XG5cbkxpbmUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpICYmIHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSB8fFxuICAgICAgICAodGhpcy5wMS5lcXVhbHMobGluZS5wMikgJiYgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkpO1xufTtcblxuTGluZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yIHx8IFwiI0FBQUFBQVwiO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wMS54LCB0aGlzLnAxLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMucDIueCwgdGhpcy5wMi55KTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufTtcblxuTGluZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wMS50b1N0cmluZygpICsgXCIgPT4gXCIgKyB0aGlzLnAyLnRvU3RyaW5nKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIGlmICh0aGlzLmVxdWFscyhsaW5lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgczEgPSB0aGlzLnAyLnN1YnRyYWN0KHRoaXMucDEpO1xuICAgIHZhciBzMiA9IGxpbmUucDIuc3VidHJhY3QobGluZS5wMSk7XG5cbiAgICB2YXIgcyA9ICgtczEueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpICsgczEueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG4gICAgdmFyIHQgPSAoczIueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpIC0gczIueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG5cbiAgICBpZiAocyA+PSAwICYmIHMgPD0gMSAmJiB0ID49IDAgJiYgdCA8PSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaXNOYU4ocykgfHwgaXNOYU4odCkpIHtcbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG5vIHBvaW50cyB0aGV5IGRvbid0IG92ZXJsYXAuXG4gICAgICAgIGlmICghKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDEuZXF1YWxzKGxpbmUucDIpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm91bmRpbmdfY29udGFpbnMobGluZSkgfHwgbGluZS5ib3VuZGluZ19jb250YWlucyh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICAvL0NvbGluZWFyLCBlaXRoZXIgdGhleSBvdmVybGFwIG9yIHRoZXkgZG9uJ3QuLi5cbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG9uZSBwb2ludCwgdGhlbiB0aGV5IG92ZXJsYXAgaWYgYW55IG9mIHRoZSBwb2ludHMgZmFsbHMgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgbGluZXMuXG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBib3RoIHRoZXkncmUgZXF1YWwsIHdoaWNoIHdlIGNvdmVyIGFib3ZlXG5cblxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmJvdW5kaW5nX2NvbnRhaW5zID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciB0b3BfbGVmdCA9IG5ldyBQb2ludChNYXRoLm1pbih0aGlzLnAxLngsIHRoaXMucDIueCksIE1hdGgubWluKHRoaXMucDEueSwgdGhpcy5wMi55KSk7XG4gICAgdmFyIGJvdHRvbV9yaWdodCA9IG5ldyBQb2ludChNYXRoLm1heCh0aGlzLnAxLngsIHRoaXMucDIueCksIE1hdGgubWF4KHRoaXMucDEueSwgdGhpcy5wMi55KSk7XG5cbiAgICByZXR1cm4gbGluZS5wMS5iZXR3ZWVuKHRvcF9sZWZ0LCBib3R0b21fcmlnaHQpIHx8IGxpbmUucDIuYmV0d2Vlbih0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmludGVyc2VjdHNfYW55ID0gZnVuY3Rpb24obGluZXMpIHtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGxpbmVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIGlmICh0aGlzLmludGVyc2VjdHMobGluZXNba10pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIFBvaW50KHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG59XG5cblBvaW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIihcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gcG9pbnQueCAmJiB0aGlzLnkgPT09IHBvaW50Lnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLnNjYWxhcl9wcm9kdWN0ID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBuZXcgUG9pbnQoYyAqIHRoaXMueCwgYyAqIHRoaXMueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuY3Jvc3NfcHJvZHVjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRvdF9wcm9kdWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYmV0d2VlbiA9IGZ1bmN0aW9uKHAxLCBwMikge1xuICAgIHJldHVybiB0aGlzLnggPiBwMS54ICYmIHRoaXMueCA8IHAyLnggJiYgdGhpcy55ID4gcDEueSAmJiB0aGlzLnkgPCBwMi55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy54IC0gcC54LCAyKSArIE1hdGgucG93KHRoaXMueSAtIHAueSwgMikpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3IgfHwgXCIjQUFBQUFBXCI7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMueCwgdGhpcy55LCAxMCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xufTtcblxuZnVuY3Rpb24gVHJpYW5nbGUoZTEsIGUyLCBlMywgcG9pbnRzKSB7XG4gICAgdGhpcy5lZGdlcyA9IFtlMSwgZTIsIGUzXTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgIHRoaXMuY29sb3IgPSBnZXRSYW5kb21Db2xvcigpO1xufVxuXG5UcmlhbmdsZS5wcm90b3R5cGUuZ2V0X2NlbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vQ2VudHJvaWQ6XG4gICAgLy9yZXR1cm4gbmV3IFBvaW50KCh0aGlzLnBvaW50c1swXS54ICsgdGhpcy5wb2ludHNbMV0ueCArIHRoaXMucG9pbnRzWzJdLngpIC8gMywgKHRoaXMucG9pbnRzWzBdLnkgKyB0aGlzLnBvaW50c1sxXS55ICsgdGhpcy5wb2ludHNbMl0ueSkgLyAzKTtcblxuICAgIHZhciBhID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMV0pO1xuICAgIHZhciBiID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBjID0gdGhpcy5wb2ludHNbMV0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBwID0gYSArIGIgKyBjO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludCgoYSAqIHRoaXMucG9pbnRzWzJdLnggKyBiICogdGhpcy5wb2ludHNbMV0ueCArIGMgKiB0aGlzLnBvaW50c1swXS54KSAvIHAsIChhICogdGhpcy5wb2ludHNbMl0ueSArIGIgKiB0aGlzLnBvaW50c1sxXS55ICsgYyAqIHRoaXMucG9pbnRzWzBdLnkpIC8gcCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHQuZ2V0X2NlbnRlcigpKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgcDEgPSB0aGlzLnBvaW50c1swXTtcbiAgICB2YXIgcDIgPSB0aGlzLnBvaW50c1sxXTtcbiAgICB2YXIgcDMgPSB0aGlzLnBvaW50c1syXTtcblxuICAgIHZhciBhbHBoYSA9ICgocDIueSAtIHAzLnkpICogKHAueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwLnkgLSBwMy55KSkgL1xuICAgICAgICAoKHAyLnkgLSBwMy55KSAqIChwMS54IC0gcDMueCkgKyAocDMueCAtIHAyLngpICogKHAxLnkgLSBwMy55KSk7XG4gICAgdmFyIGJldGEgPSAoKHAzLnkgLSBwMS55KSAqIChwLnggLSBwMy54KSArIChwMS54IC0gcDMueCkgKiAocC55IC0gcDMueSkpIC9cbiAgICAgICAgKChwMi55IC0gcDMueSkgKiAocDEueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwMS55IC0gcDMueSkpO1xuICAgIHZhciBnYW1tYSA9IDEgLSBhbHBoYSAtIGJldGE7XG5cbiAgICByZXR1cm4gYWxwaGEgPiAwICYmIGJldGEgPiAwICYmIGdhbW1hID4gMDtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5pc19uZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0LmVkZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lZGdlc1tpXS5lcXVhbHModC5lZGdlc1tqXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuYWRkX25laWdoYm9yID0gZnVuY3Rpb24odCkge1xuICAgIHRoaXMubmVpZ2hib3JzLnB1c2godCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZmlsbF90cmlhbmdsZSA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG5cbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1sxXS54LCB0aGlzLnBvaW50c1sxXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1syXS54LCB0aGlzLnBvaW50c1syXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1swXS54LCB0aGlzLnBvaW50c1swXS55KTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5kcmF3X3dlaWdodHMgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KGQudG9GaXhlZCgwKSwgKHRoaXMuZ2V0X2NlbnRlcigpLnggKyB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueCkgLyAyICsgMTAsICh0aGlzLmdldF9jZW50ZXIoKS55ICsgdGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLnkpIC8gMiArIDEwKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd19lZGdlcyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUFBQUFBXCI7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLmdldF9jZW50ZXIoKS54LCB0aGlzLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLngsIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd192ZXJ0ZXggPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMuZ2V0X2NlbnRlcigpLngsIHRoaXMuZ2V0X2NlbnRlcigpLnksIDgsIDgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xuICAgIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnO1xuICAgIHZhciBjb2xvciA9ICcjJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5Qb2ludCA9IFBvaW50O1xubW9kdWxlLmV4cG9ydHMuTGluZSA9IExpbmU7XG5tb2R1bGUuZXhwb3J0cy5UcmlhbmdsZSA9IFRyaWFuZ2xlO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVlZiA9IHJlcXVpcmUoJy4vcmVlZi5qcycpO1xudmFyIExpbmUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuTGluZTtcbnZhciBUcmlhbmdsZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5UcmlhbmdsZTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcbnZhciBUcmlhbmd1bGF0aW9uID0gcmVxdWlyZSgnLi90cmlhbmd1bGF0aW9uLmpzJyk7XG5cbmZ1bmN0aW9uIE9jZWFuKHdpZHRoLCBoZWlnaHQsIHJlZWZzKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVlZnMgPSByZWVmcztcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn1cblxuLy9UT0RPOiBjcmVhdGUgYSB0cmlhbmd1bGF0aW9uIGZvciBldmVyeSBzaXplIG9mIGZpc2hcbk9jZWFuLnByb3RvdHlwZS5yZXRyaWFuZ3VsYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIHRoaXMudHJpYW5ndWxhdGlvbiA9IG5ldyBUcmlhbmd1bGF0aW9uKHRoaXMuZ2V0X3BvaW50cygpLCB0aGlzLmdldF9saW5lcygpLCB0aGlzLmdldF9kaWFncygpKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3BhdGhfdG8gPSBmdW5jdGlvbihzdGFydF9wb2ludCwgZW5kX3BvaW50KSB7XG4gICAgcmV0dXJuIHRoaXMudHJpYW5ndWxhdGlvbi5maW5kX3BhdGgoc3RhcnRfcG9pbnQsIGVuZF9wb2ludCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3JlZWZfdW5kZXJfcG9pbnQgPSBmdW5jdGlvbihwKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYodGhpcy5yZWVmc1tpXS5jb250YWlucyhwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVlZnNbaV07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSBuZXcgUmVlZigwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X3BvaW50cygpO1xuXG4gICAgdGhpcy5yZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKHJlZWYpIHtcbiAgICAgICAgdmFyIHBzID0gcmVlZi5nZXRfcG9pbnRzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHBzW2ldKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBpZihhLnggPT0gYi54KSB7XG4gICAgICAgICAgICByZXR1cm4gYS55ID4gYi55O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGEueCA+IGIueDtcbiAgICB9KTtcblxuICAgIHJldHVybiBwb2ludHM7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2xpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpbmVzID0gbmV3IFJlZWYoMCwwLHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfbGluZXMoKTtcblxuICAgIGZ1bmN0aW9uIGFkZChsaW5lKSB7bGluZXMucHVzaChsaW5lKTt9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnJlZWZzW2ldLmdldF9saW5lcygpLmZvckVhY2goYWRkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXM7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2RpYWdzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVlZnMubWFwKGZ1bmN0aW9uKHIpIHtyZXR1cm4gci5nZXRfZGlhZ29uYWwoKTt9KTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5hZGRfcmVlZiA9IGZ1bmN0aW9uKHJlZWYpIHtcbiAgICB0aGlzLnJlZWZzLnB1c2gocmVlZik7XG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZGVsZXRlX3JlZWYgPSBmdW5jdGlvbihyZWVmKSB7XG4gICAgdGhpcy5yZWVmcy5zcGxpY2UodGhpcy5yZWVmcy5pbmRleE9mKHJlZWYpLCAxKTtcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIHRoaXMucmVlZnMuZm9yRWFjaChmdW5jdGlvbihyZWVmKSB7XG4gICAgICAgIHJlZWYuZHJhdyhjb250ZXh0KTtcbiAgICB9KTtcblxuICAgIHRoaXMudHJpYW5ndWxhdGlvbi5kcmF3KGNvbnRleHQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPY2VhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlb21ldHJ5ID0gcmVxdWlyZShcIi4vZ2VvbWV0cnkuanNcIik7XG52YXIgUG9pbnQgPSBnZW9tZXRyeS5Qb2ludDtcbnZhciBMaW5lID0gZ2VvbWV0cnkuTGluZTtcblxuZnVuY3Rpb24gUmVlZih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMucG9pbnRzID0gW25ldyBQb2ludCh0aGlzLngsIHRoaXMueSksIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSArIHRoaXMuaGVpZ2h0KSwgbmV3IFBvaW50KHRoaXMueCArIHRoaXMud2lkdGgsIHRoaXMueSArIHRoaXMuaGVpZ2h0KSwgbmV3IFBvaW50KHRoaXMueCArIHRoaXMud2lkdGgsIHRoaXMueSArIDApXTtcbn1cblxuUmVlZi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiI0FBNTU1NVwiO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50cztcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9saW5lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldF9wb2ludHMoKTtcblxuICAgIHJldHVybiBbbmV3IExpbmUocG9pbnRzWzBdLCBwb2ludHNbMV0pLCBuZXcgTGluZShwb2ludHNbMV0sIHBvaW50c1syXSksIG5ldyBMaW5lKHBvaW50c1syXSwgcG9pbnRzWzNdKSwgbmV3IExpbmUocG9pbnRzWzNdLCBwb2ludHNbMF0pXTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9kaWFnb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldF9wb2ludHMoKTtcblxuICAgIHJldHVybiBuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1syXSk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfZGlhZ29uYWxzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIFtuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1syXSksIG5ldyBMaW5lKHRoaXMucG9pbnRzWzFdLCB0aGlzLnBvaW50c1szXSldO1xufTtcblxuUmVlZi5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgZGlhZzEgPSBuZXcgTGluZSh0aGlzLnBvaW50c1swXSwgdGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBkaWFnMiA9IG5ldyBMaW5lKHRoaXMucG9pbnRzWzFdLCB0aGlzLnBvaW50c1szXSk7XG5cbiAgICByZXR1cm4gZGlhZzEuaW50ZXJzZWN0cyhsaW5lKSB8fCAgZGlhZzIuaW50ZXJzZWN0cyhsaW5lKTtcbn07XG5cblJlZWYucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBwLnggPj0gdGhpcy54ICYmIHAueSA+PSB0aGlzLnkgJiYgcC54IDw9IHRoaXMueCArIHRoaXMud2lkdGggJiYgcC55IDw9IHRoaXMueSArIHRoaXMuaGVpZ2h0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWVmO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBMaW5lID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLkxpbmU7XG52YXIgVHJpYW5nbGUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuVHJpYW5nbGU7XG52YXIgUG9pbnQgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuUG9pbnQ7XG5cbmZ1bmN0aW9uIFRyaWFuZ3VsYXRpb24ocG9pbnRzLCBjb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSB7XG4gICAgdGhpcy5wb2ludHMgPSBwb2ludHM7XG4gICAgdGhpcy5jb25zdHJhaW50cyA9IHJlbW92YWJsZV9jb25zdHJhaW50cy5jb25jYXQoY29uc3RyYWludHMpO1xuICAgIHRoaXMubGluZXMgPSB0aGlzLnRyaWFuZ3VsYXRlKHBvaW50cywgdGhpcy5jb25zdHJhaW50cyk7XG4gICAgdGhpcy5saW5lcy5zcGxpY2UoMCwgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzLmxlbmd0aCk7XG4gICAgdGhpcy5ncmFwaCA9IHRoaXMuYnVpbGRfZ3JhcGgodGhpcy5saW5lcyk7XG59XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnRyaWFuZ3VsYXRlID0gZnVuY3Rpb24ocG9pbnRzLCBjb25zdHJhaW50cykge1xuICAgIC8vVE9ETzogbWFrZSB0aGUgdHJpYW5ndWxhdGlvbiBkZWx1YW51YXlcbiAgICB2YXIgbGluZXMgPSBjb25zdHJhaW50cy5zbGljZSgpO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgcG9pbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcG9zc2libGVfbGluZSA9IG5ldyBMaW5lKHBvaW50c1tpXSwgcG9pbnRzW2pdKTtcbiAgICAgICAgICAgIHZhciB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIXBvc3NpYmxlX2xpbmUuaW50ZXJzZWN0c19hbnkobGluZXMpKSB7XG4gICAgICAgICAgICAgICAgbGluZXMucHVzaChwb3NzaWJsZV9saW5lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBsaW5lcztcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmJ1aWxkX2dyYXBoID0gZnVuY3Rpb24obGluZXMpIHtcbiAgICAvL1RPRE86IG9wdGltaXNlIHRoaXMuLi4uXG4gICAgdmFyIGdyYXBoID0gW107XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IGxpbmVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBmb3IgKHZhciBrID0gaiArIDE7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgICAgIHZhciBwb2ludHMgPSB0aGlzLnVuaXF1ZShsaW5lc1tpXS5wMSwgbGluZXNbaV0ucDIsIGxpbmVzW2pdLnAxLCBsaW5lc1tqXS5wMiwgbGluZXNba10ucDEsIGxpbmVzW2tdLnAyKTtcbiAgICAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdHJpYW5nbGUgPSBuZXcgVHJpYW5nbGUobGluZXNbaV0sIGxpbmVzW2pdLCBsaW5lc1trXSwgcG9pbnRzKTtcblxuICAgICAgICAgICAgICAgICAgICBmb3IgKHZhciBsID0gMDsgbCA8IGdyYXBoLmxlbmd0aDsgbCsrKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoZ3JhcGhbbF0uaXNfbmVpZ2hib3IodHJpYW5nbGUpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpYW5nbGUuYWRkX25laWdoYm9yKGdyYXBoW2xdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBncmFwaFtsXS5hZGRfbmVpZ2hib3IodHJpYW5nbGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGdyYXBoLnB1c2godHJpYW5nbGUpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBncmFwaDtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmdldF9jbG9zZXN0X3RyaWFuZ2xlID0gZnVuY3Rpb24ocCkge1xuICAgIC8vVE9ETzogSSBjb3VsZCBzb3J0IHRoZSBncmFwaCBhbmQgbWFrZSB0aGlzIGZhc3Rlci5cblxuICAgIHZhciBtaW5fZCA9IEluZmluaXR5O1xuICAgIHZhciBtaW47XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZ3JhcGgubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmdyYXBoW2ldLmdldF9jZW50ZXIoKS5kaXN0YW5jZShwKTtcbiAgICAgICAgaWYgKGQgPCBtaW5fZCAmJiAhdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHAsIHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpKSkpIHtcbiAgICAgICAgICAgIG1pbl9kID0gZDtcbiAgICAgICAgICAgIG1pbiA9IHRoaXMuZ3JhcGhbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbWluO1xufTtcblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmZpbmRfcGF0aCA9IGZ1bmN0aW9uKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICAvL1RPRE86IEl0J3Mgbm90IG9wdGltYWwgYmVjYXVzZSBJIGNhbiByZWR1Y2UgcGF0aHMgdXNpbmcgbXkgYWxnb3JpdGhtLCBidXQgZGprc3RyYXMgZG9lc24ndCBkbyB0aGF0LmNhbiBJIGFjdHVhbGx5IHJlZHVjZSB0aGUgZ3JhcGggYmVmb3JlIEkgcnVuIGRqa3N0cmFzP1xuICAgIHZhciBzdGFydCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoc3RhcnRfcG9pbnQpO1xuICAgIHZhciBlbmQgPSB0aGlzLmdldF9jbG9zZXN0X3RyaWFuZ2xlKGVuZF9wb2ludCk7XG5cbiAgICBmb3IgKHZhciBqID0gMDsgaiA8IHRoaXMuZ3JhcGgubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgZGVsZXRlIHRoaXMuZ3JhcGhbal0uZDtcbiAgICAgICAgZGVsZXRlIHRoaXMuZ3JhcGhbal0ucHJldjtcbiAgICB9XG5cbiAgICBpZiAoIWVuZCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgdmFyIHF1ZXVlID0gW3N0YXJ0XTtcbiAgICBzdGFydC5kID0gMDtcbiAgICBzdGFydC5ub2RlID0gdW5kZWZpbmVkO1xuXG4gICAgZnVuY3Rpb24gZGlzdGFuY2VDb21wYXJhdG9yKGEsIGIpIHtcbiAgICAgICAgcmV0dXJuIGEuZCA+IGIuZDtcbiAgICB9XG5cbiAgICB3aGlsZSAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHZhciBjdXJyZW50ID0gcXVldWUuc2hpZnQoKTtcblxuICAgICAgICBpZiAoY3VycmVudCA9PT0gZW5kKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb25zdHJ1Y3RfcGF0aChjdXJyZW50LCBzdGFydF9wb2ludCwgZW5kX3BvaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgY3VycmVudC5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBuZXdEID0gY3VycmVudC5kICsgY3VycmVudC5uZWlnaGJvcnNbaV0uZGlzdGFuY2UoY3VycmVudCk7XG5cbiAgICAgICAgICAgIGlmICh0eXBlb2YgY3VycmVudC5uZWlnaGJvcnNbaV0uZCA9PT0gJ3VuZGVmaW5lZCcgfHwgbmV3RCA8IGN1cnJlbnQubmVpZ2hib3JzW2ldLmQpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50Lm5laWdoYm9yc1tpXS5kID0gbmV3RDtcbiAgICAgICAgICAgICAgICBjdXJyZW50Lm5laWdoYm9yc1tpXS5wcmV2ID0gY3VycmVudDtcbiAgICAgICAgICAgICAgICBpZiAocXVldWUuaW5kZXhPZihjdXJyZW50Lm5laWdoYm9yc1tpXSkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgIHF1ZXVlLnB1c2goY3VycmVudC5uZWlnaGJvcnNbaV0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHF1ZXVlLnNvcnQoZGlzdGFuY2VDb21wYXJhdG9yKTtcbiAgICB9XG5cbiAgICByZXR1cm4gW107XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5jb25zdHJ1Y3RfcGF0aCA9IGZ1bmN0aW9uKG5vZGUsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpIHtcbiAgICB2YXIgcGF0aCA9IFtdO1xuICAgIHdoaWxlIChub2RlLnByZXYpIHtcbiAgICAgICAgcGF0aC5wdXNoKG5vZGUuZ2V0X2NlbnRlcigpKTtcbiAgICAgICAgbm9kZSA9IG5vZGUucHJldjtcbiAgICB9XG4gICAgcGF0aC5wdXNoKG5vZGUuZ2V0X2NlbnRlcigpKTtcblxuICAgIHBhdGgucmV2ZXJzZSgpO1xuICAgIHBhdGgucHVzaChlbmRfcG9pbnQpO1xuICAgIHBhdGgudW5zaGlmdChzdGFydF9wb2ludCk7XG4gICAgdGhpcy5yZWR1Y2VfcGF0aChwYXRoKTtcblxuICAgIHJldHVybiBwYXRoO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUudW5pcXVlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjb250YWluZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhcnIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChhcmd1bWVudHNbaV0uZXF1YWxzKGFycltqXSkpIHtcbiAgICAgICAgICAgICAgICBjb250YWluZWQgPSB0cnVlO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghY29udGFpbmVkKSB7XG4gICAgICAgICAgICBhcnIucHVzaChhcmd1bWVudHNbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnJlZHVjZV9wYXRoID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzLmludGVyc2VjdHMobmV3IExpbmUocGF0aFtpXSwgcGF0aFtpICsgMl0pKSkge1xuICAgICAgICAgICAgcGF0aC5zcGxpY2UoaSArIDEsIDEpO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuY29uc3RyYWludHNbaV0uaW50ZXJzZWN0cyhsaW5lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGlmIChDT05GSUcuREVCVUcgPiAzKSB7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgICAgIHBvaW50LmRyYXcoY29udGV4dCwgXCIjNTU1NUFBXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpbmVzLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgbGluZS5kcmF3KGNvbnRleHQsIFwiIzU1NTVBQVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiA0KSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5maWxsX3RyaWFuZ2xlKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDEpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmRyYXdfZWRnZXMoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDApIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmRyYXdfdmVydGV4KGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiAyKSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5kcmF3X3dlaWdodHMoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVHJpYW5ndWxhdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZ2VvbWV0cnkgPSByZXF1aXJlKFwiLi4vYXBwL2pzL2dlb21ldHJ5LmpzXCIpO1xudmFyIFBvaW50ID0gZ2VvbWV0cnkuUG9pbnQ7XG52YXIgTGluZSA9IGdlb21ldHJ5LkxpbmU7XG5cblFVbml0LmFzc2VydC5pbnRlcnNlY3RzID0gZnVuY3Rpb24obDEsIGwyLCBtZXNzYWdlKSB7XG4gICAgdGhpcy5wdXNoKGwxLmludGVyc2VjdHMobDIpICYmIGwyLmludGVyc2VjdHMobDEpLCBsMS50b1N0cmluZygpICsgXCItLy1cIiArIGwyLnRvU3RyaW5nKCksIHRydWUsIG1lc3NhZ2UpO1xufTtcblxuUVVuaXQuYXNzZXJ0Lm5vdEludGVyc2VjdHMgPSBmdW5jdGlvbihsMSwgbDIsIG1lc3NhZ2UpIHtcbiAgICB0aGlzLnB1c2goIWwxLmludGVyc2VjdHMobDIpICYmICFsMi5pbnRlcnNlY3RzKGwxKSwgbDEudG9TdHJpbmcoKSArIFwiIC0tICAvIFwiICsgbDIudG9TdHJpbmcoKSwgZmFsc2UsIG1lc3NhZ2UpO1xufTtcblxuUVVuaXQubW9kdWxlKFwiUG9pbnRcIik7XG5cblFVbml0LnRlc3QoXCJlcXVhbHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKG5ldyBQb2ludCgxMCwgMTApLmVxdWFscyhuZXcgUG9pbnQoMTAsIDEwKSkpO1xuICAgIGFzc2VydC5ub3RPayhuZXcgUG9pbnQoMTAsIDIwKS5lcXVhbHMobmV3IFBvaW50KDEwLCAxMCkpKTtcbiAgICBhc3NlcnQubm90T2sobmV3IFBvaW50KDIwLCAxMCkuZXF1YWxzKG5ldyBQb2ludCgxMCwgMTApKSk7XG4gICAgYXNzZXJ0Lm5vdE9rKG5ldyBQb2ludCgxMCwgMTApLmVxdWFscyhuZXcgUG9pbnQoMjAsIDEwKSkpO1xuICAgIGFzc2VydC5ub3RPayhuZXcgUG9pbnQoMTAsIDEwKS5lcXVhbHMobmV3IFBvaW50KDEwLCAyMCkpKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwic3VidHJhY3RcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHAwID0gbmV3IFBvaW50KDAsIDApO1xuXG4gICAgYXNzZXJ0Lm9rKHAxLnN1YnRyYWN0KHAwKS5lcXVhbHMocDEpKTtcbiAgICBhc3NlcnQub2socDEuc3VidHJhY3QocDEpLmVxdWFscyhwMCkpO1xufSk7XG5cblFVbml0LnRlc3QoXCJhZGRcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHAwID0gbmV3IFBvaW50KDAsIDApO1xuXG4gICAgYXNzZXJ0Lm9rKHAxLmFkZChwMCkuZXF1YWxzKHAxKSk7XG4gICAgYXNzZXJ0Lm9rKHAwLmFkZChwMSkuZXF1YWxzKHAxKSk7XG5cbiAgICBhc3NlcnQub2socDAuYWRkKHAwKS5lcXVhbHMocDApKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiY3Jvc3NfcHJvZHVjdFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMSwgMik7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDMsIDQpO1xuXG4gICAgYXNzZXJ0LmVxdWFsKHAxLmNyb3NzX3Byb2R1Y3QocDIpLCAtMik7XG59KTtcblxuUVVuaXQudGVzdChcImRvdF9wcm9kdWN0XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxLCAyKTtcbiAgICB2YXIgcDIgPSBuZXcgUG9pbnQoMywgNCk7XG5cbiAgICBhc3NlcnQuZXF1YWwocDEuZG90X3Byb2R1Y3QocDIpLCAxMSk7XG59KTtcblxuUVVuaXQudGVzdChcInNjYWxhcl9wcm9kdWN0XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxLCAyKTtcblxuICAgIGFzc2VydC5vayhwMS5zY2FsYXJfcHJvZHVjdCgyKS5lcXVhbHMobmV3IFBvaW50KDIsIDQpKSk7XG59KTtcblxuUVVuaXQubW9kdWxlKFwiTGluZVwiKTtcblxuUVVuaXQudGVzdChcImVxdWFsc1wiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHAzID0gbmV3IFBvaW50KDIwLCAyMCk7XG4gICAgdmFyIGwxID0gbmV3IExpbmUocDEsIHAyKTtcbiAgICB2YXIgbDEyID0gbmV3IExpbmUocDEsIHAyKTtcbiAgICB2YXIgbDIgPSBuZXcgTGluZShwMSwgcDMpO1xuICAgIHZhciBsMyA9IG5ldyBMaW5lKHAzLCBwMSk7XG5cbiAgICBhc3NlcnQub2sobDEuZXF1YWxzKGwxKSk7XG4gICAgYXNzZXJ0Lm9rKGwxLmVxdWFscyhsMTIpKTtcbiAgICBhc3NlcnQub2sobDEyLmVxdWFscyhsMSkpO1xuXG4gICAgYXNzZXJ0Lm5vdE9rKGwxLmVxdWFscyhsMikpO1xuICAgIGFzc2VydC5ub3RPayhsMi5lcXVhbHMobDEpKTtcbiAgICBhc3NlcnQubm90T2sobDEuZXF1YWxzKGwzKSk7XG59KTtcblxuUVVuaXQudGVzdChcImludGVyc2VjdHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCgwLCAxMCk7XG4gICAgdmFyIHAzID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHA0ID0gbmV3IFBvaW50KDEwLCAwKTtcblxuICAgIHZhciBsMSA9IG5ldyBMaW5lKHAxLCBwMyk7XG4gICAgdmFyIGwxMiA9IG5ldyBMaW5lKHAzLCBwMSk7XG5cbiAgICB2YXIgbDIgPSBuZXcgTGluZShwMiwgcDQpO1xuICAgIHZhciBsMyA9IG5ldyBMaW5lKHAxLCBwMik7XG4gICAgdmFyIGw0ID0gbmV3IExpbmUocDQsIHAzKTtcblxuICAgIC8vVE9ETzogdGVzdCBtb3JlIGVuZHBvaW50IGludGVyc2VjdGlvbnNcblxuXG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEsIGwxKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMTIsIGwxKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMSwgbDEyKTtcblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKGwxLGwyKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMTIsbDIpO1xuICAgIGFzc2VydC5pbnRlcnNlY3RzKGwxLGwxKTtcblxuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKGwzLGw0KTtcblxuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKGwxLGwzKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiaW50ZXJzZWN0cyByZWFsaXN0aWNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCg2MDAsIDApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCg2MDAsIDYwMCk7XG4gICAgdmFyIHA0ID0gbmV3IFBvaW50KDAsIDYwMCk7XG5cbiAgICB2YXIgcjEgPSBuZXcgUG9pbnQoMjAwLCAyMDApO1xuICAgIHZhciByMiA9IG5ldyBQb2ludCg0MDAsIDIwMCk7XG4gICAgdmFyIHIzID0gbmV3IFBvaW50KDQwMCwgNDAwKTtcbiAgICB2YXIgcjQgPSBuZXcgUG9pbnQoMjAwLCA0MDApO1xuXG4gICAgdmFyIHIxcjMgPSBuZXcgTGluZShyMSwgcjMpO1xuICAgIHZhciByMnI0ID0gbmV3IExpbmUocjIsIHI0KTtcblxuICAgIHZhciByMXIyID0gbmV3IExpbmUocjEsIHIyKTtcbiAgICB2YXIgcjJyMyA9IG5ldyBMaW5lKHIyLCByMyk7XG4gICAgdmFyIHIzcjQgPSBuZXcgTGluZShyMywgcjQpO1xuICAgIHZhciByNHIxID0gbmV3IExpbmUocjQsIHIxKTtcblxuICAgIHZhciByZWVmcyA9IFtyMXIzLCByMXIyLCByMnIzLCByM3I0LCByNHIxXTtcblxuICAgIHJlZWZzLmZvckVhY2goZnVuY3Rpb24obDEpIHtcbiAgICAgICAgcmVlZnMuZm9yRWFjaChmdW5jdGlvbihsMikge1xuICAgICAgICAgICAgaWYoIWwyLmVxdWFscyhsMSkpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhsMSxsMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXNzZXJ0LmludGVyc2VjdHMocjFyMywgcjJyNCk7XG59KTtcblxuUVVuaXQudGVzdChcImludGVyc2VjdHMgcmVncmVzc2lvblwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDYwMCwgMCk7XG4gICAgdmFyIHAzID0gbmV3IFBvaW50KDYwMCwgNjAwKTtcbiAgICB2YXIgcDQgPSBuZXcgUG9pbnQoMCwgNjAwKTtcblxuICAgIHZhciByMSA9IG5ldyBQb2ludCgyMDAsIDIwMCk7XG4gICAgdmFyIHIyID0gbmV3IFBvaW50KDQwMCwgMjAwKTtcbiAgICB2YXIgcjMgPSBuZXcgUG9pbnQoNDAwLCA0MDApO1xuICAgIHZhciByNCA9IG5ldyBQb2ludCgyMDAsIDQwMCk7XG5cbiAgICB2YXIgcjJyMSA9IG5ldyBMaW5lKHIyLCByMSk7XG5cbiAgICB2YXIgcjFyMiA9IG5ldyBMaW5lKHIxLCByMik7XG4gICAgdmFyIHIycjMgPSBuZXcgTGluZShyMiwgcjMpO1xuICAgIHZhciByM3I0ID0gbmV3IExpbmUocjMsIHI0KTtcbiAgICB2YXIgcjRyMSA9IG5ldyBMaW5lKHI0LCByMSk7XG5cbiAgICB2YXIgcDFyMSA9IG5ldyBMaW5lKHAxLHIxKTtcbiAgICB2YXIgcjFyMyA9IG5ldyBMaW5lKHIxLHIzKTtcblxuICAgIHZhciBwMXIyID0gbmV3IExpbmUocDEscjIpO1xuICAgIHZhciBwMXIzID0gbmV3IExpbmUocDEscjMpO1xuICAgIHZhciBwMnIxID0gbmV3IExpbmUocDIscjEpO1xuICAgIHZhciByM3A0ID0gbmV3IExpbmUocDIscjEpO1xuXG4gICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMocjFyMiwgcjJyMyk7XG4gICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMocjJyMywgcjFyMik7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMocjFyMiwgcjJyMSk7XG5cbiAgICAvL2RlYnVnZ2VyO1xuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHAxcjEsIHIxcjMpO1xuXG4gICAgYXNzZXJ0LmludGVyc2VjdHMocDFyMiwgcDJyMSk7XG4gICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMocDFyMSwgcjNwNCk7XG5cbiAgICAvLyBkZWJ1Z2dlcjtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhwMXIxLCBwMXIzKTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCIuL2dlb21ldHJ5LmpzXCIpO1xucmVxdWlyZShcIi4vb2NlYW4uanNcIik7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIE9jZWFuID0gcmVxdWlyZShcIi4uL2FwcC9qcy9vY2Vhbi5qc1wiKTtcbnZhciBSZWVmID0gcmVxdWlyZShcIi4uL2FwcC9qcy9yZWVmLmpzXCIpO1xudmFyIExpbmUgPSByZXF1aXJlKFwiLi4vYXBwL2pzL2dlb21ldHJ5LmpzXCIpLkxpbmU7XG52YXIgUG9pbnQgPSByZXF1aXJlKFwiLi4vYXBwL2pzL2dlb21ldHJ5LmpzXCIpLlBvaW50O1xuXG5RVW5pdC5hc3NlcnQuY29udGFpbnMgPSBmdW5jdGlvbihsaW5lLCBhcnIsIG1lc3NhZ2UsIHRydXRoeSkge1xuICAgIHZhciBmb3VuZCA9IGZhbHNlO1xuICAgIGFyci5mb3JFYWNoKGZ1bmN0aW9uKGwpIHtcbiAgICAgICAgaWYobGluZS5lcXVhbHMobCkpIHtcbiAgICAgICAgICAgIGZvdW5kID0gdHJ1ZTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5wdXNoKGZvdW5kICYmICAhdHJ1dGh5LCBmb3VuZCwgbGluZSwgbWVzc2FnZSk7XG59O1xuXG5RVW5pdC5tb2R1bGUoXCJPY2VhblwiKTtcbiJdfQ==
