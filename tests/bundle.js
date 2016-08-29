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

},{}],2:[function(require,module,exports){
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

},{}],3:[function(require,module,exports){
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

},{"./geometry.js":1,"./reef.js":4,"./stats.js":5,"./triangulation.js":6}],4:[function(require,module,exports){
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

},{"./geometry.js":1}],5:[function(require,module,exports){
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

},{}],6:[function(require,module,exports){
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

},{"./geometry.js":1,"./hashmap.js":2}],7:[function(require,module,exports){
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

},{"../app/js/geometry.js":1}],8:[function(require,module,exports){
"use strict";

var HashMap = require("../app/js/hashmap.js");
var HashSet = require("../app/js/hashmap.js").HashSet;
var SetMultiMap = require("../app/js/hashmap.js").SetMultiMap;

function Obj(i) {
    this.i = i;
}

Obj.prototype.equals = function(x) {
    return x.i === this.i;
};

Obj.prototype.hashCode = function() {
    return this.i;
};

QUnit.module("HashMap");


QUnit.test("get", function(assert) {
    var map = new HashMap();

    var o = new Obj(1);
    assert.notOk(map.get(o));
    map.put(o, 10);
    assert.equal(map.get(o), 10);
});

QUnit.test("remove", function(assert) {
    var map = new HashMap();

    var o = new Obj(1);
    var o2 = new Obj(20);
    map.put(o, 10);
    map.put(o2, 20);
    assert.equal(map.get(o), 10);
    assert.equal(map.get(o2), 20);

    map.remove(o);

    assert.notOk(map.get(o));
    assert.equal(map.get(o2), 20);
});

QUnit.test("get lots", function(assert) {
    var map = new HashMap();

    for(var i = 0; i < 100; i++) {
        var o = new Obj(i);
        map.put(o, i);
        assert.equal(map.get(o), i);
    }
});

QUnit.module("HashSet");
QUnit.test("get", function(assert) {
    var set = new HashSet();

    var o = new Obj(1);
    assert.notOk(set.contains(o));
    set.add(o, 10);
    assert.ok(set.contains(o));
});

QUnit.test("remove", function(assert) {
    var set = new HashSet();

    var o = new Obj(1);
    var o2 = new Obj(20);
    set.add(o);
    set.add(o2);
    assert.ok(set.contains(o));
    assert.ok(set.contains(o2));

    set.remove(o);

    assert.notOk(set.contains(o));
    assert.ok(set.contains(o2));
});

QUnit.test("get lots", function(assert) {
    var set = new HashSet();

    for(var i = 0; i < 100; i++) {
        var o = new Obj(i);
        set.add(o);
        assert.ok(set.contains(o));
    }
});

QUnit.test("to_array", function(assert) {
    var set = new HashSet();
    var truth_arr = [];
    for(var i = 0; i < 10; i++) {
        var o = new Obj(i);
        truth_arr.push(o);
        set.add(o);
    }

    var arr = set.to_array();
    for(i = 0; i < 10; i++) {
        assert.ok(arr.indexOf(truth_arr[i]) > -1);
    }

});

QUnit.test("from_array", function(assert) {

    var truth_arr = [];
    for(var i = 0; i < 10; i++) {
        var o = new Obj(i);
        truth_arr.push(o);
    }

    var set = new HashSet(truth_arr);

    var arr = set.to_array();
    for(i = 0; i < 10; i++) {
        assert.ok(set.contains(truth_arr[i]));
    }
});

QUnit.module("SetMultiMap");
QUnit.test("get", function(assert) {
    var multi_map = new SetMultiMap();

    var o = new Obj(1);
    multi_map.put(o, 10);
    multi_map.put(o, 20);

    var vals = multi_map.get(o);
    assert.equal(vals.length, 2);
    assert.notEqual(vals.indexOf(10), -1);
    assert.notEqual(vals.indexOf(20), -1);

});

},{"../app/js/hashmap.js":2}],9:[function(require,module,exports){
"use strict";

require("./geometry.js");
require("./ocean.js");
require("./hashmap.js");

},{"./geometry.js":7,"./hashmap.js":8,"./ocean.js":10}],10:[function(require,module,exports){
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

},{"../app/js/geometry.js":1,"../app/js/ocean.js":3,"../app/js/reef.js":4}]},{},[9])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvZ2VvbWV0cnkuanMiLCJhcHAvanMvaGFzaG1hcC5qcyIsImFwcC9qcy9vY2Vhbi5qcyIsImFwcC9qcy9yZWVmLmpzIiwiYXBwL2pzL3N0YXRzLmpzIiwiYXBwL2pzL3RyaWFuZ3VsYXRpb24uanMiLCJ0ZXN0cy9nZW9tZXRyeS5qcyIsInRlc3RzL2hhc2htYXAuanMiLCJ0ZXN0cy9pbmRleC5qcyIsInRlc3RzL29jZWFuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2UEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2TUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9JQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaENBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaFRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0TEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUlBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNMQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIExpbmUocDEsIHAyKSB7XG4gICAgdGhpcy5wMSA9IHAxO1xuICAgIHRoaXMucDIgPSBwMjtcbn1cblxuTGluZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24obGluZSkge1xuICAgIHJldHVybiAodGhpcy5wMS5lcXVhbHMobGluZS5wMSkgJiYgdGhpcy5wMi5lcXVhbHMobGluZS5wMikpIHx8XG4gICAgICAgICh0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSAmJiB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCwgY29sb3IpIHtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gY29sb3IgfHwgXCIjQUFBQUFBXCI7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuXG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLnAxLngsIHRoaXMucDEueSk7XG4gICAgY29udGV4dC5saW5lVG8odGhpcy5wMi54LCB0aGlzLnAyLnkpO1xuICAgIGNvbnRleHQuc3Ryb2tlKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnAxLnRvU3RyaW5nKCkgKyBcIiA9PiBcIiArIHRoaXMucDIudG9TdHJpbmcoKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmhhc2hDb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucDEuaGFzaENvZGUoKSArIHRoaXMucDIuaGFzaENvZGUoKTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgaWYgKHRoaXMuZXF1YWxzKGxpbmUpKSB7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH1cblxuICAgIHZhciBzMSA9IHRoaXMucDIuc3VidHJhY3QodGhpcy5wMSk7XG4gICAgdmFyIHMyID0gbGluZS5wMi5zdWJ0cmFjdChsaW5lLnAxKTtcblxuICAgIHZhciBzID0gKC1zMS55ICogKHRoaXMucDEueCAtIGxpbmUucDEueCkgKyBzMS54ICogKHRoaXMucDEueSAtIGxpbmUucDEueSkpIC8gKC1zMi54ICogczEueSArIHMxLnggKiBzMi55KTtcbiAgICB2YXIgdCA9IChzMi54ICogKHRoaXMucDEueSAtIGxpbmUucDEueSkgLSBzMi55ICogKHRoaXMucDEueCAtIGxpbmUucDEueCkpIC8gKC1zMi54ICogczEueSArIHMxLnggKiBzMi55KTtcblxuICAgIGlmIChzID49IDAgJiYgcyA8PSAxICYmIHQgPj0gMCAmJiB0IDw9IDEpIHtcbiAgICAgICAgaWYgKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDEuZXF1YWxzKGxpbmUucDIpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfSBlbHNlIGlmIChpc05hTihzKSB8fCBpc05hTih0KSkge1xuICAgICAgICAvL0lmIHRoZXkgc2hhcmUgbm8gcG9pbnRzIHRoZXkgZG9uJ3Qgb3ZlcmxhcC5cbiAgICAgICAgaWYgKCEodGhpcy5wMS5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkgfHwgdGhpcy5wMS5lcXVhbHMobGluZS5wMikgfHwgdGhpcy5wMi5lcXVhbHMobGluZS5wMikpKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5ib3VuZGluZ19jb250YWlucyhsaW5lKSB8fCBsaW5lLmJvdW5kaW5nX2NvbnRhaW5zKHRoaXMpO1xuICAgICAgICB9XG4gICAgICAgIC8vQ29saW5lYXIsIGVpdGhlciB0aGV5IG92ZXJsYXAgb3IgdGhleSBkb24ndC4uLlxuICAgICAgICAvL0lmIHRoZXkgc2hhcmUgb25lIHBvaW50LCB0aGVuIHRoZXkgb3ZlcmxhcCBpZiBhbnkgb2YgdGhlIHBvaW50cyBmYWxscyB3aXRoaW4gdGhlIHJhbmdlIG9mIHRoZSBsaW5lcy5cbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIGJvdGggdGhleSdyZSBlcXVhbCwgd2hpY2ggd2UgY292ZXIgYWJvdmVcbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5ib3VuZGluZ19jb250YWlucyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgdG9wX2xlZnQgPSBuZXcgUG9pbnQoTWF0aC5taW4odGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1pbih0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuICAgIHZhciBib3R0b21fcmlnaHQgPSBuZXcgUG9pbnQoTWF0aC5tYXgodGhpcy5wMS54LCB0aGlzLnAyLngpLCBNYXRoLm1heCh0aGlzLnAxLnksIHRoaXMucDIueSkpO1xuXG4gICAgcmV0dXJuIGxpbmUucDEuYmV0d2Vlbih0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KSB8fCBsaW5lLnAyLmJldHdlZW4odG9wX2xlZnQsIGJvdHRvbV9yaWdodCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzX2FueSA9IGZ1bmN0aW9uKGxpbmVzKSB7XG4gICAgZm9yICh2YXIgayA9IDA7IGsgPCBsaW5lcy5sZW5ndGg7IGsrKykge1xuICAgICAgICBpZiAodGhpcy5pbnRlcnNlY3RzKGxpbmVzW2tdKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5mdW5jdGlvbiBQb2ludCh4LCB5KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xufVxuXG5Qb2ludC5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXCIoXCIgKyB0aGlzLnggKyBcIiwgXCIgKyB0aGlzLnkgKyBcIilcIjtcbn07XG5cblBvaW50LnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbihwb2ludCkge1xuICAgIHJldHVybiB0aGlzLnggPT09IHBvaW50LnggJiYgdGhpcy55ID09PSBwb2ludC55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmZ1enp5RXF1YWxzID0gZnVuY3Rpb24ocG9pbnQsIGVwc2lsb24pIHtcbiAgICByZXR1cm4gTWF0aC5hYnModGhpcy54IC0gcG9pbnQueCkgPCBlcHNpbG9uICYmIE1hdGguYWJzKHRoaXMueSAtIHBvaW50LnkpIDwgZXBzaWxvbjtcbn07XG5cblBvaW50LnByb3RvdHlwZS5zdWJ0cmFjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gbmV3IFBvaW50KHRoaXMueCAtIHYueCwgdGhpcy55IC0gdi55KTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggKyB2LngsIHRoaXMueSArIHYueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuc2NhbGFyX3Byb2R1Y3QgPSBmdW5jdGlvbihjKSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludChjICogdGhpcy54LCBjICogdGhpcy55KTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5jcm9zc19wcm9kdWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnkgLSB0aGlzLnkgKiB2Lng7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuZG90X3Byb2R1Y3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIHRoaXMueCAqIHYueCArIHRoaXMueSAqIHYueTtcbn07XG5cblBvaW50LnByb3RvdHlwZS5iZXR3ZWVuID0gZnVuY3Rpb24ocDEsIHAyKSB7XG4gICAgcmV0dXJuIHRoaXMueCA+IHAxLnggJiYgdGhpcy54IDwgcDIueCAmJiB0aGlzLnkgPiBwMS55ICYmIHRoaXMueSA8IHAyLnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbihwKSB7XG4gICAgcmV0dXJuIE1hdGguc3FydChNYXRoLnBvdyh0aGlzLnggLSBwLngsIDIpICsgTWF0aC5wb3codGhpcy55IC0gcC55LCAyKSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBjb2xvciB8fCBcIiNBQUFBQUFcIjtcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5hcmModGhpcy54LCB0aGlzLnksIDEwLCAwLCBNYXRoLlBJICogMik7XG4gICAgY29udGV4dC5maWxsKCk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuaGFzaENvZGUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy54ICsgdGhpcy55O1xufTtcblxuZnVuY3Rpb24gVHJpYW5nbGUocDEscDIscDMpIHtcbiAgICB0aGlzLmVkZ2VzID0gW25ldyBMaW5lKHAxLHAyKSwgbmV3IExpbmUocDIscDMpLCBuZXcgTGluZShwMyxwMSldO1xuICAgIHRoaXMubmVpZ2hib3JzID0gW107XG4gICAgdGhpcy5wb2ludHMgPSBbcDEscDIscDNdO1xuICAgIHRoaXMuY29sb3IgPSBnZXRSYW5kb21Db2xvcigpO1xufVxuXG5UcmlhbmdsZS5wcm90b3R5cGUuZXF1YWxzID0gZnVuY3Rpb24oeCkge1xuICAgIHJldHVybiB0aGlzLmdldF9jZW50ZXIoKS5mdXp6eUVxdWFscyh4LmdldF9jZW50ZXIoKSwgMC4wMSk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZ2V0X2NlbnRlciA9IGZ1bmN0aW9uKCkge1xuICAgIC8vQ2VudHJvaWQ6XG4gICAgLy9yZXR1cm4gbmV3IFBvaW50KCh0aGlzLnBvaW50c1swXS54ICsgdGhpcy5wb2ludHNbMV0ueCArIHRoaXMucG9pbnRzWzJdLngpIC8gMywgKHRoaXMucG9pbnRzWzBdLnkgKyB0aGlzLnBvaW50c1sxXS55ICsgdGhpcy5wb2ludHNbMl0ueSkgLyAzKTtcblxuICAgIHZhciBhID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMV0pO1xuICAgIHZhciBiID0gdGhpcy5wb2ludHNbMF0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBjID0gdGhpcy5wb2ludHNbMV0uZGlzdGFuY2UodGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBwID0gYSArIGIgKyBjO1xuXG4gICAgcmV0dXJuIG5ldyBQb2ludCgoYSAqIHRoaXMucG9pbnRzWzJdLnggKyBiICogdGhpcy5wb2ludHNbMV0ueCArIGMgKiB0aGlzLnBvaW50c1swXS54KSAvIHAsIChhICogdGhpcy5wb2ludHNbMl0ueSArIGIgKiB0aGlzLnBvaW50c1sxXS55ICsgYyAqIHRoaXMucG9pbnRzWzBdLnkpIC8gcCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZGlzdGFuY2UgPSBmdW5jdGlvbih0KSB7XG4gICAgcmV0dXJuIHRoaXMuZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHQuZ2V0X2NlbnRlcigpKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5oYXNoQ29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50c1swXS5oYXNoQ29kZSgpICsgdGhpcy5wb2ludHNbMV0uaGFzaENvZGUoKSArIHRoaXMucG9pbnRzWzJdLmhhc2hDb2RlKCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuY29udGFpbnMgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIHAxID0gdGhpcy5wb2ludHNbMF07XG4gICAgdmFyIHAyID0gdGhpcy5wb2ludHNbMV07XG4gICAgdmFyIHAzID0gdGhpcy5wb2ludHNbMl07XG5cbiAgICB2YXIgYWxwaGEgPSAoKHAyLnkgLSBwMy55KSAqIChwLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocC55IC0gcDMueSkpIC9cbiAgICAgICAgKChwMi55IC0gcDMueSkgKiAocDEueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwMS55IC0gcDMueSkpO1xuICAgIHZhciBiZXRhID0gKChwMy55IC0gcDEueSkgKiAocC54IC0gcDMueCkgKyAocDEueCAtIHAzLngpICogKHAueSAtIHAzLnkpKSAvXG4gICAgICAgICgocDIueSAtIHAzLnkpICogKHAxLnggLSBwMy54KSArIChwMy54IC0gcDIueCkgKiAocDEueSAtIHAzLnkpKTtcbiAgICB2YXIgZ2FtbWEgPSAxIC0gYWxwaGEgLSBiZXRhO1xuXG4gICAgcmV0dXJuIGFscGhhID4gMCAmJiBiZXRhID4gMCAmJiBnYW1tYSA+IDA7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuaXNfbmVpZ2hib3IgPSBmdW5jdGlvbih0KSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmVkZ2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGZvciAodmFyIGogPSAwOyBqIDwgdC5lZGdlcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaWYgKHRoaXMuZWRnZXNbaV0uZXF1YWxzKHQuZWRnZXNbal0pKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmFkZF9uZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICB0aGlzLm5laWdoYm9ycy5wdXNoKHQpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmZpbGxfdHJpYW5nbGUgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5iZWdpblBhdGgoKTtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IHRoaXMuY29sb3I7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wb2ludHNbMF0ueCwgdGhpcy5wb2ludHNbMF0ueSk7XG5cbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1sxXS54LCB0aGlzLnBvaW50c1sxXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1syXS54LCB0aGlzLnBvaW50c1syXS55KTtcbiAgICBjb250ZXh0LmxpbmVUbyh0aGlzLnBvaW50c1swXS54LCB0aGlzLnBvaW50c1swXS55KTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5kcmF3X3dlaWdodHMgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGQgPSB0aGlzLmdldF9jZW50ZXIoKS5kaXN0YW5jZSh0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBjb250ZXh0LmZpbGxUZXh0KGQudG9GaXhlZCgwKSwgKHRoaXMuZ2V0X2NlbnRlcigpLnggKyB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueCkgLyAyICsgMTAsICh0aGlzLmdldF9jZW50ZXIoKS55ICsgdGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLnkpIC8gMiArIDEwKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd19lZGdlcyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LnN0cm9rZVN0eWxlID0gXCIjQUFBQUFBXCI7XG4gICAgY29udGV4dC5saW5lV2lkdGggPSAzO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5uZWlnaGJvcnMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgICAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLmdldF9jZW50ZXIoKS54LCB0aGlzLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5saW5lVG8odGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLngsIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS55KTtcbiAgICAgICAgY29udGV4dC5zdHJva2UoKTtcbiAgICB9XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZHJhd192ZXJ0ZXggPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiMyMjIyMjJcIjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMuZ2V0X2NlbnRlcigpLngsIHRoaXMuZ2V0X2NlbnRlcigpLnksIDgsIDgsIDAsIE1hdGguUEkgKiAyKTtcbiAgICBjb250ZXh0LmZpbGwoKTtcbn07XG5cbmZ1bmN0aW9uIGdldFJhbmRvbUNvbG9yKCkge1xuICAgIHZhciBsZXR0ZXJzID0gJzAxMjM0NTY3ODlBQkNERUYnO1xuICAgIHZhciBjb2xvciA9ICcjJztcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IDY7IGkrKykge1xuICAgICAgICBjb2xvciArPSBsZXR0ZXJzW01hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIDE2KV07XG4gICAgfVxuICAgIHJldHVybiBjb2xvcjtcbn1cblxuXG5tb2R1bGUuZXhwb3J0cy5Qb2ludCA9IFBvaW50O1xubW9kdWxlLmV4cG9ydHMuTGluZSA9IExpbmU7XG5tb2R1bGUuZXhwb3J0cy5UcmlhbmdsZSA9IFRyaWFuZ2xlO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmZ1bmN0aW9uIEhhc2hNYXAoKSB7XG4gICAgLy9UT0RPOiBzaG91bGQgYmUgY29uZmlndXJhYmxlIChhbmQgZXhwYW5kYWJsZSlcbiAgICB0aGlzLm51bV9idWNrZXRzID0gMTk7XG4gICAgdGhpcy5idWNrZXRzID0gW107XG59XG5cbkhhc2hNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKCFrZXkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgYnVja2V0ID0gdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXTtcblxuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVja2V0LmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoYnVja2V0LmtleXNbaV0uZXF1YWxzKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiBidWNrZXQudmFsdWVzW2ldO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbkhhc2hNYXAucHJvdG90eXBlLmdldEtleSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIGlmKCFrZXkpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICB2YXIgYnVja2V0ID0gdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXTtcblxuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICB9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYnVja2V0LmtleXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoYnVja2V0LmtleXNbaV0uZXF1YWxzKGtleSkpIHtcbiAgICAgICAgICAgIHJldHVybiBidWNrZXQua2V5c1tpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5cbkhhc2hNYXAucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICAvL1RPRE86IHJlc2l6ZSB0aGUgYnVja2V0cyBpZiBuZWVkIGJlLlxuICAgIHZhciBidWNrZXQgPSB0aGlzLmJ1Y2tldHNbdGhpcy5oYXNoKGtleSldO1xuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgYnVja2V0ID0ge2tleXMgOiBbXSwgdmFsdWVzIDogW119O1xuICAgICAgICB0aGlzLmJ1Y2tldHNbdGhpcy5oYXNoKGtleSldID0gYnVja2V0O1xuICAgIH1cblxuICAgIHZhciBpbmRleCA9IGJ1Y2tldC5rZXlzLmxlbmd0aDtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBidWNrZXQua2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihidWNrZXQua2V5c1tpXS5lcXVhbHMoa2V5KSkge1xuICAgICAgICAgICAgaW5kZXggPSBpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYnVja2V0LmtleXNbaW5kZXhdID0ga2V5O1xuICAgIGJ1Y2tldC52YWx1ZXNbaW5kZXhdID0gdmFsdWU7XG59O1xuXG5IYXNoTWFwLnByb3RvdHlwZS5yZW1vdmUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgYnVja2V0ID0gdGhpcy5idWNrZXRzW3RoaXMuaGFzaChrZXkpXTtcblxuICAgIGlmKCFidWNrZXQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBidWNrZXQua2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihidWNrZXQua2V5c1tpXS5lcXVhbHMoa2V5KSkge1xuICAgICAgICAgICAgYnVja2V0LmtleXMuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgYnVja2V0LnZhbHVlcy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICByZXR1cm4gYnVja2V0LmtleXNbaV07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5IYXNoTWFwLnByb3RvdHlwZS5oYXNoID0gZnVuY3Rpb24odmFsKSB7XG4gICAgcmV0dXJuIHZhbC5oYXNoQ29kZSgpICUgdGhpcy5udW1fYnVja2V0cztcbn07XG5cbmZ1bmN0aW9uIEhhc2hTZXQoYXJyKSB7XG4gICAgdGhpcy5tYXAgPSBuZXcgSGFzaE1hcCgpO1xuXG4gICAgdGhpcy5sZW5ndGggPSAwO1xuXG4gICAgaWYoT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKGFycikgPT09IFwiW29iamVjdCBBcnJheV1cIil7XG4gICAgICAgIGZvcih2YXIgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYWRkKGFycltpXSk7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbkhhc2hTZXQucHJvdG90eXBlLmFkZCA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHRoaXMubWFwLnB1dCh2YWwsIHRydWUpO1xuICAgIHRoaXMubGVuZ3RoKys7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciB2YWx1ZSA9IHRoaXMubWFwLmdldEtleSh2YWwpO1xuICAgIGlmKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICB2YXIgdmFsdWUgPSB0aGlzLm1hcC5nZXRLZXkodmFsKTtcbiAgICBpZih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxufTtcblxuSGFzaFNldC5wcm90b3R5cGUucmVtb3ZlID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdmFyIHJlbW92ZWQgPSB0aGlzLm1hcC5yZW1vdmUodmFsKTtcblxuICAgIGlmKHR5cGVvZiByZW1vdmVkICE9PSBcInVuZGVmaW5lZFwiKXtcbiAgICAgICAgdGhpcy5sZW5ndGgtLTtcbiAgICB9XG5cbiAgICByZXR1cm4gcmVtb3ZlZDtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnJlbW92ZV9hbGwgPSBmdW5jdGlvbihhcnIpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlKGFycltpXSk7XG4gICAgfVxufTtcblxuSGFzaFNldC5wcm90b3R5cGUudG9fYXJyYXkgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMubWFwLmJ1Y2tldHMubGVuZ3RoOyBpKyspIHtcblxuICAgICAgICBpZighdGhpcy5tYXAuYnVja2V0c1tpXSl7XG4gICAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBrZXlzID0gdGhpcy5tYXAuYnVja2V0c1tpXS5rZXlzO1xuICAgICAgICBmb3IodmFyIGogPSAwOyBqIDwga2V5cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgYXJyLnB1c2goa2V5c1tqXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufTtcblxuSGFzaFNldC5wcm90b3R5cGUuZ2V0X2FueSA9IGZ1bmN0aW9uKCkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcC5idWNrZXRzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgaWYoIXRoaXMubWFwLmJ1Y2tldHNbaV0pe1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5cyA9IHRoaXMubWFwLmJ1Y2tldHNbaV0ua2V5cztcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHJldHVybiBrZXlzW2pdO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbn07XG5cbmZ1bmN0aW9uIFNldE11bHRpTWFwKCkge1xuICAgIHRoaXMubWFwID0gbmV3IEhhc2hNYXAoKTtcbn1cblxuU2V0TXVsdGlNYXAucHJvdG90eXBlLmdldCA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciB2YWxzID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgaWYoIXZhbHMpIHtcbiAgICAgICAgdGhpcy5tYXAucHV0KGtleSwgW10pO1xuICAgICAgICB2YWxzID0gdGhpcy5tYXAuZ2V0KGtleSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHM7XG59O1xuXG5TZXRNdWx0aU1hcC5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIHZhciB2YWxzID0gdGhpcy5nZXQoa2V5KTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdmFscy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZigodmFsc1tpXS5oYXNPd25Qcm9wZXJ0eShcImVxdWFsc1wiKSAmJiB2YWxzW2ldLmVxdWFscyh2YWx1ZSkpIHx8IHZhbHNbaV0gPT09IHZhbHVlKSB7XG4gICAgICAgICAgICB2YWxzW2ldID0gdmFsdWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICB2YWxzLnB1c2godmFsdWUpO1xufTtcblxuXG5tb2R1bGUuZXhwb3J0cyA9IEhhc2hNYXA7XG5tb2R1bGUuZXhwb3J0cy5IYXNoU2V0ID0gSGFzaFNldDtcbm1vZHVsZS5leHBvcnRzLlNldE11bHRpTWFwID0gU2V0TXVsdGlNYXA7XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBSZWVmID0gcmVxdWlyZSgnLi9yZWVmLmpzJyk7XG52YXIgTGluZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5MaW5lO1xudmFyIFRyaWFuZ2xlID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlRyaWFuZ2xlO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xudmFyIFRyaWFuZ3VsYXRpb24gPSByZXF1aXJlKCcuL3RyaWFuZ3VsYXRpb24uanMnKTtcbnZhciBTdGF0cyA9IHJlcXVpcmUoJy4vc3RhdHMuanMnKTtcblxuZnVuY3Rpb24gT2NlYW4od2lkdGgsIGhlaWdodCwgcmVlZnMpIHtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgdGhpcy5yZWVmcyA9IHJlZWZzO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufVxuXG4vL1RPRE86IGNyZWF0ZSBhIHRyaWFuZ3VsYXRpb24gZm9yIGV2ZXJ5IHNpemUgb2YgZmlzaCAoanVzdCBleHBhbmQgdGhlIHdpZHRoLGhlaWdodCBhbmQgdG9wbGVmdCBwb2ludHMgYnkgdGhlIHJhZGl1cy4pIFByb2JhYmx5IGEgd2F5IHdlIGNhbiByZXVzZSBtb3N0IG9mIHRoZSB0cmlhbmd1bGF0aW9uLlxuLy9UT0RPOiBvdmVybGFwcGluZyByZWVmcyBjYXVzZSAgYWJ1ZywgY29tYmluZSB0aGVtIGludG8gcG9seWdvbnMgd2l0aCBjb25zdHJhaW50cyBhbmQgdXNlIHRob3NlIGluc3RlYWRcbi8vVE9ETzogY3JlYXRlIGEgY29udmV4IGh1bGwsIHRoZW4gcmVtb3ZlIHBvaW50cyBpbnNpZGUgKGdpZnQgd3JhcHBpbmcgYWxnbyksIHRoZW4gZGV0ZXJtaW5lIGhvdyB0byBjcmVhdGUgYSBjb25zdHJpYW50IGZyb20gdGhhdCxcbi8vVE9ETzogbWF5YmUganVzdCB0cmlhbmd1bGF0ZSB0aGUgcG9pbnRzIGZpcnN0LCB0aGVuIHVzZSB0aGF0IHRyaWFuZ3VsYXRpb24gYXMgdGhlIGNvbnN0cmFpbnRzLiBHZW5pdXMuXG5cbi8vVE9ETzogcmVtb3ZlIGlubmVyIHBvaW50cyAoMyBjYXNlcywgYWxsIHBvaW50cywgMiBwb2ludHMsIDEgcG9pbnQpIGFuZCB0aGVuIGFkZCBuZXcgcG9pbnRzIGF0IGludGVyc2VjdGlvbnMuXG4vLyBUaGUgb2xkIGRpYWdvbmFscyBjYW4gc3RpbGwgYmUgdXNlZCBhcyBjb25zdHJhaW50cyBJIHRoaW5rLCBidXQgbmV3IG91dGVyIGxpbmVzIG5lZWQgdG8gYmUgbWFkZSB3aGVyZSB0aGUgaW50ZXJzZWN0aW9ucyBhcmUuXG5cbk9jZWFuLnByb3RvdHlwZS5yZXRyaWFuZ3VsYXRlID0gZnVuY3Rpb24gKCkge1xuICAgIFN0YXRzLnN0YXJ0KFwicmV0cmlhbmd1bGF0ZVwiKTtcbiAgICB0aGlzLnRyaWFuZ3VsYXRpb24gPSBuZXcgVHJpYW5ndWxhdGlvbih0aGlzLmdldF9wb2ludHMoKSwgdGhpcy5nZXRfbGluZXMoKSwgdGhpcy5nZXRfZGlhZ3MoKSk7XG4gICAgU3RhdHMuZmluaXNoKFwicmV0cmlhbmd1bGF0ZVwiKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5yZXNpemUgPSBmdW5jdGlvbih3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3BhdGhfdG8gPSBmdW5jdGlvbihzdGFydF9wb2ludCwgZW5kX3BvaW50KSB7XG4gICAgU3RhdHMuc3RhcnQoXCJnZXRfcGF0aF90b1wiKTtcbiAgICB2YXIgcGF0aCA9IHRoaXMudHJpYW5ndWxhdGlvbi5maW5kX3BhdGgoc3RhcnRfcG9pbnQsIGVuZF9wb2ludCk7XG4gICAgU3RhdHMuZmluaXNoKFwiZ2V0X3BhdGhfdG9cIik7XG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3JlZWZfdW5kZXJfcG9pbnQgPSBmdW5jdGlvbihwKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYodGhpcy5yZWVmc1tpXS5jb250YWlucyhwKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVlZnNbaV07XG4gICAgICAgIH1cbiAgICB9XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSBuZXcgUmVlZigwLCAwLCB0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X3BvaW50cygpO1xuXG4gICAgdGhpcy5yZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKHJlZWYpIHtcbiAgICAgICAgdmFyIHBzID0gcmVlZi5nZXRfcG9pbnRzKCk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHBvaW50cy5wdXNoKHBzW2ldKTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcG9pbnRzLnNvcnQoZnVuY3Rpb24oYSwgYikge1xuICAgICAgICBpZihhLnggPT0gYi54KSB7XG4gICAgICAgICAgICByZXR1cm4gYS55ID4gYi55O1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIGEueCA+IGIueDtcbiAgICB9KTtcblxuICAgIHJldHVybiBwb2ludHM7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2xpbmVzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpbmVzID0gbmV3IFJlZWYoMCwwLHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfbGluZXMoKTtcblxuICAgIGZ1bmN0aW9uIGFkZChsaW5lKSB7bGluZXMucHVzaChsaW5lKTt9XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5yZWVmcy5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnJlZWZzW2ldLmdldF9saW5lcygpLmZvckVhY2goYWRkKTtcbiAgICB9XG5cbiAgICByZXR1cm4gbGluZXM7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2xpbmVzX292ZXJsYXBzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGxpbmVzID0gbmV3IFJlZWYoMCwwLHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfbGluZXMoKTtcbiAgICB2YXIgcG9pbnRzID0gbmV3IFJlZWYoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9wb2ludHMoKTtcbiAgICB2YXIgY29uc3RyYWludHMgPSBbXTtcblxuICAgIHZhciBwb2x5Z29ucyA9IFtdO1xuXG4gICAgLypcbiAgICAgICAgV2UgY3JlYXRlIGEgbGlzdCBvZiBwb2x5Z29ucywgdGhlbiB3ZSB0ZXN0IGlmIGVhY2ggcmVlZiBpbnRlcnNlY3RzIGFueSBvZiB0aG9zZSBwb2x5Z29ucyxcbiAgICAgICAgaWYgbm90IHRoYXQgcmVlZiBiZWNvbWVzIGEgcG9seWdvbi4gaWYgaXQgaW50ZXJlc2VjdHMsIHRoZW4gd2UgZmluZCB0aGUgaW50ZXJzZWN0aW9uLCBhZGQgdGhlIGxpbmVzIGFuZCBwb2ludHNcbiAgICAgICAgdG8gdGhlIHBvbHlnb24uIChhbmQgdGhlIGNvbnN0cmFpbnRzIHRvIHRoZSB3aG9sZSB0aGluZykuXG5cbiAgICAgICAgLy9UT0RPOiB3aGF0IGFib3V0IGhvbGVzLCBvciB0b3RhbCBwb2x5Z29uIGVuY2xvc3VyZVxuICAgICAgICAvL1RPRE86IHdoYXQgYWJvdXQgcmVlZnMgaW50ZXJzZWN0aW5nIHdpdGggbXVsdGlwbGUgcG9seWdvbnMuXG5cbiAgICAgICAgLy90aGlzIHNlZW1zIGxpa2UgYSByZWN1cnNpdmUgc29sdXRpb24gd291bGQgd29yayBoZXJlLi4uXG5cbiAgICAqL1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGludGVyc2VjdGlvbl9wb2ludHMgPSBbXTtcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IHBvbHlnb25zLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpbnRlcnNlY3Rpb25fcG9pbnRzID0gcG9seWdvbnNbal0uZ2V0X2ludGVyc2VjdGlvbl9wb2ludHModGhpcy5yZWVmc1tpXSk7XG4gICAgICAgIH1cblxuICAgIH1cblxuICAgICAgICAvL1RPRE86IGdvIHRocm91Z2ggYWxsIHRoZSBwb2ludHMsIHJlbW92ZSB0aGUgb25lcyB0aGF0IGZhbGwgaW5zaWRlIGFub3RoZXIgc3F1YXJlXG5cbiAgICAgICAgLy9UT0RPOiBzb3J0IHRoZSBwb2ludHMuIHN0YXJ0IGF0IHRvcCBsZWZ0LCB0aGVuIGdvIGRvd24sIHJlbW92aW5nIHRoZW0gYXMgeW91IGdvLiBUZW4gZ28gZnJvbSByaWdodCB0byBsZWZ0LlxuXG4gICAgcmV0dXJuIGxpbmVzO1xufTtcblxuXG5PY2Vhbi5wcm90b3R5cGUuZ2V0X2RpYWdzID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucmVlZnMubWFwKGZ1bmN0aW9uKHIpIHtyZXR1cm4gci5nZXRfZGlhZ29uYWwoKTt9KTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5hZGRfcmVlZiA9IGZ1bmN0aW9uKHJlZWYpIHtcbiAgICB0aGlzLnJlZWZzLnB1c2gocmVlZik7XG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZGVsZXRlX3JlZWYgPSBmdW5jdGlvbihyZWVmKSB7XG4gICAgdGhpcy5yZWVmcy5zcGxpY2UodGhpcy5yZWVmcy5pbmRleE9mKHJlZWYpLCAxKTtcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn07XG5cbk9jZWFuLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIHRoaXMucmVlZnMuZm9yRWFjaChmdW5jdGlvbihyZWVmKSB7XG4gICAgICAgIHJlZWYuZHJhdyhjb250ZXh0KTtcbiAgICB9KTtcblxuICAgIHRoaXMudHJpYW5ndWxhdGlvbi5kcmF3KGNvbnRleHQpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBPY2VhbjtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGdlb21ldHJ5ID0gcmVxdWlyZShcIi4vZ2VvbWV0cnkuanNcIik7XG52YXIgUG9pbnQgPSBnZW9tZXRyeS5Qb2ludDtcbnZhciBMaW5lID0gZ2VvbWV0cnkuTGluZTtcblxuZnVuY3Rpb24gUmVlZih4LCB5LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgdGhpcy54ID0geDtcbiAgICB0aGlzLnkgPSB5O1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMucG9pbnRzID0gW25ldyBQb2ludCh0aGlzLngsIHRoaXMueSksIG5ldyBQb2ludCh0aGlzLngsIHRoaXMueSArIHRoaXMuaGVpZ2h0KSwgbmV3IFBvaW50KHRoaXMueCArIHRoaXMud2lkdGgsIHRoaXMueSArIHRoaXMuaGVpZ2h0KSwgbmV3IFBvaW50KHRoaXMueCArIHRoaXMud2lkdGgsIHRoaXMueSArIDApXTtcbn1cblxuUmVlZi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiI0FBNTU1NVwiO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5maWxsUmVjdCh0aGlzLngsIHRoaXMueSwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X3BvaW50cyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnBvaW50cztcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9saW5lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldF9wb2ludHMoKTtcblxuICAgIHJldHVybiBbbmV3IExpbmUocG9pbnRzWzBdLCBwb2ludHNbMV0pLCBuZXcgTGluZShwb2ludHNbMV0sIHBvaW50c1syXSksIG5ldyBMaW5lKHBvaW50c1syXSwgcG9pbnRzWzNdKSwgbmV3IExpbmUocG9pbnRzWzNdLCBwb2ludHNbMF0pXTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9kaWFnb25hbCA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldF9wb2ludHMoKTtcblxuICAgIHJldHVybiBuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1syXSk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfZGlhZ29uYWxzID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIHBvaW50cyA9IHRoaXMuZ2V0X3BvaW50cygpO1xuXG4gICAgcmV0dXJuIFtuZXcgTGluZShwb2ludHNbMF0sIHBvaW50c1syXSksIG5ldyBMaW5lKHRoaXMucG9pbnRzWzFdLCB0aGlzLnBvaW50c1szXSldO1xufTtcblxuUmVlZi5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICB2YXIgZGlhZzEgPSBuZXcgTGluZSh0aGlzLnBvaW50c1swXSwgdGhpcy5wb2ludHNbMl0pO1xuICAgIHZhciBkaWFnMiA9IG5ldyBMaW5lKHRoaXMucG9pbnRzWzFdLCB0aGlzLnBvaW50c1szXSk7XG5cbiAgICByZXR1cm4gZGlhZzEuaW50ZXJzZWN0cyhsaW5lKSB8fCAgZGlhZzIuaW50ZXJzZWN0cyhsaW5lKTtcbn07XG5cblJlZWYucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBwLnggPj0gdGhpcy54ICYmIHAueSA+PSB0aGlzLnkgJiYgcC54IDw9IHRoaXMueCArIHRoaXMud2lkdGggJiYgcC55IDw9IHRoaXMueSArIHRoaXMuaGVpZ2h0O1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBSZWVmO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBTdGF0cyA9IHtcbiAgICBzdGFydCA6IHt9LFxuICAgIHZhbHVlcyA6IHt9XG59O1xuXG5TdGF0cy5zdGFydCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgICAgdGhpcy5zdGFydFtuYW1lXSA9ICtuZXcgRGF0ZSgpO1xufTtcblxuU3RhdHMuZmluaXNoID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHRoaXMuYWRkX3ZhbHVlKG5hbWUsICtuZXcgRGF0ZSgpIC0gdGhpcy5zdGFydFtuYW1lXSk7XG59O1xuXG5TdGF0cy5hZGRfdmFsdWUgPSBmdW5jdGlvbihuYW1lLCB2YWx1ZSkge1xuICAgIGlmKCF0aGlzLnZhbHVlcy5oYXNPd25Qcm9wZXJ0eShuYW1lKSkge1xuICAgICAgICB0aGlzLnZhbHVlc1tuYW1lXSA9IFtdO1xuICAgIH1cblxuICAgIHRoaXMudmFsdWVzW25hbWVdLnB1c2godmFsdWUpO1xufTtcblxuU3RhdHMuZ2V0X3ZhbHVlcyA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy52YWx1ZXNbbmFtZV07XG59O1xuXG5TdGF0cy5hdmVyYWdlID0gZnVuY3Rpb24obmFtZSkge1xuICAgIHJldHVybiB0aGlzLmdldF92YWx1ZXMobmFtZSkucmVkdWNlKGZ1bmN0aW9uKHN1bSwgdmFsdWUpIHtyZXR1cm4gc3VtICsgdmFsdWU7fSkgLyB0aGlzLmdldF92YWx1ZXMobmFtZSkubGVuZ3RoO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBTdGF0cztcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgTGluZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5MaW5lO1xudmFyIFRyaWFuZ2xlID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlRyaWFuZ2xlO1xudmFyIFBvaW50ID0gcmVxdWlyZSgnLi9nZW9tZXRyeS5qcycpLlBvaW50O1xudmFyIEhhc2hNYXAgPSByZXF1aXJlKCcuL2hhc2htYXAuanMnKTtcbnZhciBTZXRNdWx0aU1hcCA9IHJlcXVpcmUoJy4vaGFzaG1hcC5qcycpLlNldE11bHRpTWFwO1xudmFyIEhhc2hTZXQgPSByZXF1aXJlKCcuL2hhc2htYXAuanMnKS5IYXNoU2V0O1xuXG5mdW5jdGlvbiBUcmlhbmd1bGF0aW9uKHBvaW50cywgY29uc3RyYWludHMsIHJlbW92YWJsZV9jb25zdHJhaW50cykge1xuICAgIHRoaXMucG9pbnRzID0gcG9pbnRzO1xuICAgIHRoaXMuY29uc3RyYWludHMgPSBjb25zdHJhaW50cztcbiAgICB2YXIgdHJpYW5ndWxhdGVkID0gdGhpcy50cmlhbmd1bGF0ZShwb2ludHMsIHRoaXMuY29uc3RyYWludHMsIHJlbW92YWJsZV9jb25zdHJhaW50cyk7XG5cbiAgICB0aGlzLmxpbmVzID0gdHJpYW5ndWxhdGVkLmxpbmVzO1xuICAgIHRoaXMuZ3JhcGggPSB0aGlzLmJ1aWxkX2dyYXBoKHRoaXMubGluZXMsIHRyaWFuZ3VsYXRlZC5lZGdlcywgY29uc3RyYWludHMpO1xuXG59XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnRyaWFuZ3VsYXRlID0gZnVuY3Rpb24ocG9pbnRzLCBjb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSB7XG4gICAgLy9UT0RPOiBtYWtlIHRoZSB0cmlhbmd1bGF0aW9uIGRlbHVhbnVheVxuICAgIHZhciBlZGdlcyA9IG5ldyBTZXRNdWx0aU1hcCgpO1xuXG4gICAgdmFyIGxpbmVzID0gY29uc3RyYWludHMuc2xpY2UoKTtcblxuICAgIGZvcih2YXIgayA9IDA7IGsgPCBjb25zdHJhaW50cy5sZW5ndGg7IGsrKykge1xuICAgICAgICB2YXIgbCA9IGNvbnN0cmFpbnRzW2tdO1xuICAgICAgICBlZGdlcy5wdXQobC5wMSwgbC5wMik7XG4gICAgICAgIGVkZ2VzLnB1dChsLnAyLCBsLnAxKTtcbiAgICB9XG5cbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBvaW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBmb3IgKHZhciBqID0gaSArIDE7IGogPCBwb2ludHMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIHZhciBwb3NzaWJsZV9saW5lID0gbmV3IExpbmUocG9pbnRzW2ldLCBwb2ludHNbal0pO1xuICAgICAgICAgICAgdmFyIHZhbGlkID0gdHJ1ZTtcbiAgICAgICAgICAgIGlmICghcG9zc2libGVfbGluZS5pbnRlcnNlY3RzX2FueShsaW5lcykgJiYgIXBvc3NpYmxlX2xpbmUuaW50ZXJzZWN0c19hbnkocmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSkge1xuICAgICAgICAgICAgICAgIGxpbmVzLnB1c2gocG9zc2libGVfbGluZSk7XG4gICAgICAgICAgICAgICAgZWRnZXMucHV0KHBvaW50c1tpXSwgcG9pbnRzW2pdKTtcbiAgICAgICAgICAgICAgICBlZGdlcy5wdXQocG9pbnRzW2pdLCBwb2ludHNbaV0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgbGluZXM6IGxpbmVzLFxuICAgICAgICBlZGdlczogZWRnZXNcbiAgICB9O1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuYnVpbGRfZ3JhcGggPSBmdW5jdGlvbihsaW5lcywgY29ubmVjdHMsIGNvbnN0cmFpbnRzKSB7XG4gICAgLy9UT0RPOiBuZXZlciB0cmF2ZXJzZSB0aGUgY29uc3RyYWludHMgKGVzcGVjaWFsbHkgbm90IHRoZSBvdXRlciBvbmVzKVxuXG4gICAgdmFyIGdyYXBoID0gW107XG5cbiAgICBsaW5lcyA9IG5ldyBIYXNoU2V0KGxpbmVzKTtcblxuXG4gICAgdmFyIGNoZWNrZWQgPSBuZXcgSGFzaFNldCgpO1xuICAgIHZhciB0cmlhbmdsZXMgPSBuZXcgSGFzaFNldCgpO1xuICAgIHZhciB0cmlhbmdsZXNfYnlfZWRnZXMgPSBuZXcgU2V0TXVsdGlNYXAoKTtcbiAgICB2YXIgdG9fY2hlY2sgPSBbbGluZXMuZ2V0X2FueSgpXTtcbiAgICAvL2FkZCBhbiBlZGdlLlxuICAgIHZhciBjb250ZXh0ID0gZG9jdW1lbnQuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJjYW52YXNcIilbMF0uZ2V0Q29udGV4dChcIjJkXCIpO1xuXG4gICAgZm9yKHZhciBsID0gMDsgbCA8IGNvbnN0cmFpbnRzLmxlbmd0aDsgbCsrKXtcbiAgICAgICAgbGluZXMucmVtb3ZlKGNvbnN0cmFpbnRzW2xdKTtcbiAgICAgICAgY2hlY2tlZC5hZGQoY29uc3RyYWludHNbbF0pO1xuICAgIH1cblxuICAgIHdoaWxlICh0b19jaGVjay5sZW5ndGggfHwgbGluZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBjaGVja2luZztcbiAgICAgICAgaWYgKHRvX2NoZWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgY2hlY2tpbmcgPSB0b19jaGVjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoZWNraW5nID0gbGluZXMuZ2V0X2FueSgpO1xuICAgICAgICAgICAgaWYoIWNoZWNraW5nKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNoZWNrZWQuYWRkKGNoZWNraW5nKTtcbiAgICAgICAgbGluZXMucmVtb3ZlKGNoZWNraW5nKTtcblxuICAgICAgICB2YXIgcDFfbmVpZ2hib3JzID0gY29ubmVjdHMuZ2V0KGNoZWNraW5nLnAxKTsgLy9hbGwgbmVpZ2hib3VycyBwMVxuICAgICAgICB2YXIgcDJfbmVpZ2hib3JzID0gY29ubmVjdHMuZ2V0KGNoZWNraW5nLnAyKTtcbiAgICAgICAgdmFyIHNoYXJlZF9wb2ludHMgPSB0aGlzLmR1cGxpY2F0ZWQocDFfbmVpZ2hib3JzLmNvbmNhdChwMl9uZWlnaGJvcnMpKTtcblxuICAgICAgICB2YXIgdHMgPSBbXTtcblxuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHNoYXJlZF9wb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHZhciBwMyA9IHNoYXJlZF9wb2ludHNbaV07XG4gICAgICAgICAgICB2YXIgdCA9IG5ldyBUcmlhbmdsZShjaGVja2luZy5wMSwgY2hlY2tpbmcucDIsIHAzKTtcbiAgICAgICAgICAgIHZhciBwMXAycDMgPSB0cmlhbmdsZXMuZ2V0KHQpO1xuXG4gICAgICAgICAgICB0LmZpbGxfdHJpYW5nbGUoY29udGV4dCk7XG4gICAgICAgICAgICBjaGVja2luZy5kcmF3KGNvbnRleHQpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICBkZWJ1Z2dlcjtcblxuICAgICAgICAgICAgaWYgKCFwMXAycDMpIHtcbiAgICAgICAgICAgICAgICBwMXAycDMgPSB0O1xuICAgICAgICAgICAgICAgIHRyaWFuZ2xlcy5hZGQocDFwMnAzKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdmFyIHAxcDMgPSBuZXcgTGluZShjaGVja2luZy5wMSwgcDMpO1xuXG4gICAgICAgICAgICB0cmlhbmdsZXNfYnlfZWRnZXMucHV0KGNoZWNraW5nLCBwMXAycDMpO1xuXG4gICAgICAgICAgICBpZiAoIWNoZWNrZWQuY29udGFpbnMocDFwMykpIHtcbiAgICAgICAgICAgICAgICB0b19jaGVjay5wdXNoKHAxcDMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB2YXIgcDJwMyA9IG5ldyBMaW5lKGNoZWNraW5nLnAyLCBwMyk7XG4gICAgICAgICAgICBpZiAoIWNoZWNrZWQuY29udGFpbnMocDJwMykpIHtcbiAgICAgICAgICAgICAgICB0b19jaGVjay5wdXNoKHAycDMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0cy5wdXNoKHAxcDJwMyk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL1RPRE86IGNvdWxkIHByb2JhYmx5IGRvIHRoaXMgaW5saW5lIChsaWtlIGluIHRoZSBmb3IgbG9vcHMpXG4gICAgdmFyIHRyaWFuZ2xlX2FyciA9IHRyaWFuZ2xlcy50b19hcnJheSgpO1xuICAgIGZvcih2YXIgaiA9IDA7IGogPCB0cmlhbmdsZV9hcnIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgdmFyIHRyaWFuZ2xlID0gdHJpYW5nbGVfYXJyW2pdO1xuICAgICAgICB2YXIgbmVpZ2hicyA9IHRyaWFuZ2xlc19ieV9lZGdlcy5nZXQodHJpYW5nbGUuZWRnZXNbMF0pXG4gICAgICAgICAgICAuY29uY2F0KHRyaWFuZ2xlc19ieV9lZGdlcy5nZXQodHJpYW5nbGUuZWRnZXNbMV0pXG4gICAgICAgICAgICAuY29uY2F0KHRyaWFuZ2xlc19ieV9lZGdlcy5nZXQodHJpYW5nbGUuZWRnZXNbMl0pKSk7XG5cbiAgICAgICAgZm9yKHZhciBrID0gMDsgayA8IG5laWdoYnMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgICAgIGlmKCFuZWlnaGJzW2tdLmVxdWFscyh0cmlhbmdsZSkpIHtcbiAgICAgICAgICAgICAgICB0cmlhbmdsZS5hZGRfbmVpZ2hib3IobmVpZ2hic1trXSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdHJpYW5nbGVfYXJyO1xufTtcblxuLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IGxpbmVzLmxlbmd0aDsgaisrKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGsgPSBqICsgMTsgayA8IGxpbmVzLmxlbmd0aDsgaysrKSB7XG4vLyAgICAgICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy51bmlxdWUobGluZXNbaV0ucDEsIGxpbmVzW2ldLnAyLCBsaW5lc1tqXS5wMSwgbGluZXNbal0ucDIsIGxpbmVzW2tdLnAxLCBsaW5lc1trXS5wMik7XG4vLyAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMykge1xuLy8gICAgICAgICAgICAgICAgIHZhciB0cmlhbmdsZSA9IG5ldyBUcmlhbmdsZShsaW5lc1tpXSwgbGluZXNbal0sIGxpbmVzW2tdLCBwb2ludHMpO1xuLy9cbi8vICAgICAgICAgICAgICAgICBmb3IgKHZhciBsID0gMDsgbCA8IGdyYXBoLmxlbmd0aDsgbCsrKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIGlmIChncmFwaFtsXS5pc19uZWlnaGJvcih0cmlhbmdsZSkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlLmFkZF9uZWlnaGJvcihncmFwaFtsXSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBncmFwaFtsXS5hZGRfbmVpZ2hib3IodHJpYW5nbGUpO1xuLy8gICAgICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgIGdyYXBoLnB1c2godHJpYW5nbGUpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gfVxuLy9cbi8vIHJldHVybiBncmFwaDtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUgPSBmdW5jdGlvbihwKSB7XG4gICAgdmFyIG1pbl9kID0gSW5maW5pdHk7XG4gICAgdmFyIG1pbjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZCA9IHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHApO1xuICAgICAgICBpZiAoZCA8IG1pbl9kICYmICF0aGlzLmludGVyc2VjdHMobmV3IExpbmUocCwgdGhpcy5ncmFwaFtpXS5nZXRfY2VudGVyKCkpKSkge1xuICAgICAgICAgICAgbWluX2QgPSBkO1xuICAgICAgICAgICAgbWluID0gdGhpcy5ncmFwaFtpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtaW47XG59O1xuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZmluZF9wYXRoID0gZnVuY3Rpb24oc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIC8vVE9ETzogSXQncyBub3Qgb3B0aW1hbCBiZWNhdXNlIEkgY2FuIHJlZHVjZSBwYXRocyB1c2luZyBteSBhbGdvcml0aG0sIGJ1dCBkamtzdHJhcyBkb2Vzbid0IGRvIHRoYXQuY2FuIEkgYWN0dWFsbHkgcmVkdWNlIHRoZSBncmFwaCBiZWZvcmUgSSBydW4gZGprc3RyYXM/XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5nZXRfY2xvc2VzdF90cmlhbmdsZShzdGFydF9wb2ludCk7XG4gICAgdmFyIGVuZCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoZW5kX3BvaW50KTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGorKykge1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5kO1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5wcmV2O1xuICAgIH1cblxuICAgIGlmICghZW5kKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbc3RhcnRdO1xuICAgIHN0YXJ0LmQgPSAwO1xuICAgIHN0YXJ0Lm5vZGUgPSB1bmRlZmluZWQ7XG5cbiAgICBmdW5jdGlvbiBkaXN0YW5jZUNvbXBhcmF0b3IoYSwgYikge1xuICAgICAgICByZXR1cm4gYS5kID4gYi5kO1xuICAgIH1cblxuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBxdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdF9wYXRoKGN1cnJlbnQsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdXJyZW50Lm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBjdXJyZW50LmQgKyBjdXJyZW50Lm5laWdoYm9yc1tpXS5kaXN0YW5jZShjdXJyZW50KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50Lm5laWdoYm9yc1tpXS5kID09PSAndW5kZWZpbmVkJyB8fCBuZXdEIDwgY3VycmVudC5uZWlnaGJvcnNbaV0uZCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLmQgPSBuZXdEO1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLnByZXYgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5pbmRleE9mKGN1cnJlbnQubmVpZ2hib3JzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChjdXJyZW50Lm5laWdoYm9yc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcXVldWUuc29ydChkaXN0YW5jZUNvbXBhcmF0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdF9wYXRoID0gZnVuY3Rpb24obm9kZSwgc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIHZhciBwYXRoID0gW107XG4gICAgd2hpbGUgKG5vZGUucHJldikge1xuICAgICAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuXG4gICAgcGF0aC5yZXZlcnNlKCk7XG4gICAgcGF0aC5wdXNoKGVuZF9wb2ludCk7XG4gICAgcGF0aC51bnNoaWZ0KHN0YXJ0X3BvaW50KTtcbiAgICB0aGlzLnJlZHVjZV9wYXRoKHBhdGgpO1xuXG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5kdXBsaWNhdGVkID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgYXJyLnNvcnQoKTtcbiAgICB2YXIgdmFscyA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgYXJyLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICBpZihhcnJbaV0uZXF1YWxzKGFycltpKzFdKSkge1xuICAgICAgICAgICAgdmFscy5wdXNoKGFycltpXSk7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdmFscztcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnJlZHVjZV9wYXRoID0gZnVuY3Rpb24ocGF0aCkge1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgcGF0aC5sZW5ndGggLSAyOyBpKyspIHtcbiAgICAgICAgaWYgKCF0aGlzLmludGVyc2VjdHMobmV3IExpbmUocGF0aFtpXSwgcGF0aFtpICsgMl0pKSkge1xuICAgICAgICAgICAgcGF0aC5zcGxpY2UoaSArIDEsIDEpO1xuICAgICAgICAgICAgaS0tO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuY29uc3RyYWludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHRoaXMuY29uc3RyYWludHNbaV0uaW50ZXJzZWN0cyhsaW5lKSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5kcmF3ID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGlmIChDT05GSUcuREVCVUcgPiAzKSB7XG4gICAgICAgIHRoaXMucG9pbnRzLmZvckVhY2goZnVuY3Rpb24ocG9pbnQpIHtcbiAgICAgICAgICAgIHBvaW50LmRyYXcoY29udGV4dCwgXCIjNTU1NUFBXCIpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLmxpbmVzLmZvckVhY2goZnVuY3Rpb24obGluZSkge1xuICAgICAgICAgICAgbGluZS5kcmF3KGNvbnRleHQsIFwiIzU1NTVBQVwiKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiA0KSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5maWxsX3RyaWFuZ2xlKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDEpIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmRyYXdfZWRnZXMoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcbiAgICB0aGlzLmdyYXBoLmZvckVhY2goZnVuY3Rpb24odHJpYW5nbGUpIHtcbiAgICAgICAgaWYgKENPTkZJRy5ERUJVRyA+IDApIHtcbiAgICAgICAgICAgIHRyaWFuZ2xlLmRyYXdfdmVydGV4KGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiAyKSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5kcmF3X3dlaWdodHMoY29udGV4dCk7XG4gICAgICAgIH1cbiAgICB9KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVHJpYW5ndWxhdGlvbjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgZ2VvbWV0cnkgPSByZXF1aXJlKFwiLi4vYXBwL2pzL2dlb21ldHJ5LmpzXCIpO1xudmFyIFBvaW50ID0gZ2VvbWV0cnkuUG9pbnQ7XG52YXIgTGluZSA9IGdlb21ldHJ5LkxpbmU7XG5cblFVbml0LmFzc2VydC5pbnRlcnNlY3RzID0gZnVuY3Rpb24obDEsIGwyLCBtZXNzYWdlKSB7XG4gICAgdGhpcy5wdXNoKGwxLmludGVyc2VjdHMobDIpICYmIGwyLmludGVyc2VjdHMobDEpLCBsMS50b1N0cmluZygpICsgXCItLy1cIiArIGwyLnRvU3RyaW5nKCksIHRydWUsIG1lc3NhZ2UpO1xufTtcblxuUVVuaXQuYXNzZXJ0Lm5vdEludGVyc2VjdHMgPSBmdW5jdGlvbihsMSwgbDIsIG1lc3NhZ2UpIHtcbiAgICB0aGlzLnB1c2goIWwxLmludGVyc2VjdHMobDIpICYmICFsMi5pbnRlcnNlY3RzKGwxKSwgbDEudG9TdHJpbmcoKSArIFwiIC0tICAvIFwiICsgbDIudG9TdHJpbmcoKSwgZmFsc2UsIG1lc3NhZ2UpO1xufTtcblxuUVVuaXQubW9kdWxlKFwiUG9pbnRcIik7XG5cblFVbml0LnRlc3QoXCJlcXVhbHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgYXNzZXJ0Lm9rKG5ldyBQb2ludCgxMCwgMTApLmVxdWFscyhuZXcgUG9pbnQoMTAsIDEwKSkpO1xuICAgIGFzc2VydC5ub3RPayhuZXcgUG9pbnQoMTAsIDIwKS5lcXVhbHMobmV3IFBvaW50KDEwLCAxMCkpKTtcbiAgICBhc3NlcnQubm90T2sobmV3IFBvaW50KDIwLCAxMCkuZXF1YWxzKG5ldyBQb2ludCgxMCwgMTApKSk7XG4gICAgYXNzZXJ0Lm5vdE9rKG5ldyBQb2ludCgxMCwgMTApLmVxdWFscyhuZXcgUG9pbnQoMjAsIDEwKSkpO1xuICAgIGFzc2VydC5ub3RPayhuZXcgUG9pbnQoMTAsIDEwKS5lcXVhbHMobmV3IFBvaW50KDEwLCAyMCkpKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwic3VidHJhY3RcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHAwID0gbmV3IFBvaW50KDAsIDApO1xuXG4gICAgYXNzZXJ0Lm9rKHAxLnN1YnRyYWN0KHAwKS5lcXVhbHMocDEpKTtcbiAgICBhc3NlcnQub2socDEuc3VidHJhY3QocDEpLmVxdWFscyhwMCkpO1xufSk7XG5cblFVbml0LnRlc3QoXCJhZGRcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHAwID0gbmV3IFBvaW50KDAsIDApO1xuXG4gICAgYXNzZXJ0Lm9rKHAxLmFkZChwMCkuZXF1YWxzKHAxKSk7XG4gICAgYXNzZXJ0Lm9rKHAwLmFkZChwMSkuZXF1YWxzKHAxKSk7XG5cbiAgICBhc3NlcnQub2socDAuYWRkKHAwKS5lcXVhbHMocDApKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiY3Jvc3NfcHJvZHVjdFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMSwgMik7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDMsIDQpO1xuXG4gICAgYXNzZXJ0LmVxdWFsKHAxLmNyb3NzX3Byb2R1Y3QocDIpLCAtMik7XG59KTtcblxuUVVuaXQudGVzdChcImRvdF9wcm9kdWN0XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxLCAyKTtcbiAgICB2YXIgcDIgPSBuZXcgUG9pbnQoMywgNCk7XG5cbiAgICBhc3NlcnQuZXF1YWwocDEuZG90X3Byb2R1Y3QocDIpLCAxMSk7XG59KTtcblxuUVVuaXQudGVzdChcInNjYWxhcl9wcm9kdWN0XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxLCAyKTtcblxuICAgIGFzc2VydC5vayhwMS5zY2FsYXJfcHJvZHVjdCgyKS5lcXVhbHMobmV3IFBvaW50KDIsIDQpKSk7XG59KTtcblxuUVVuaXQubW9kdWxlKFwiTGluZVwiKTtcblxuUVVuaXQudGVzdChcImVxdWFsc1wiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHAzID0gbmV3IFBvaW50KDIwLCAyMCk7XG4gICAgdmFyIGwxID0gbmV3IExpbmUocDEsIHAyKTtcbiAgICB2YXIgbDEyID0gbmV3IExpbmUocDEsIHAyKTtcbiAgICB2YXIgbDIgPSBuZXcgTGluZShwMSwgcDMpO1xuICAgIHZhciBsMyA9IG5ldyBMaW5lKHAzLCBwMSk7XG5cbiAgICBhc3NlcnQub2sobDEuZXF1YWxzKGwxKSk7XG4gICAgYXNzZXJ0Lm9rKGwxLmVxdWFscyhsMTIpKTtcbiAgICBhc3NlcnQub2sobDEyLmVxdWFscyhsMSkpO1xuXG4gICAgYXNzZXJ0Lm5vdE9rKGwxLmVxdWFscyhsMikpO1xuICAgIGFzc2VydC5ub3RPayhsMi5lcXVhbHMobDEpKTtcbiAgICBhc3NlcnQubm90T2sobDEuZXF1YWxzKGwzKSk7XG59KTtcblxuUVVuaXQudGVzdChcImludGVyc2VjdHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCgwLCAxMCk7XG4gICAgdmFyIHAzID0gbmV3IFBvaW50KDEwLCAxMCk7XG4gICAgdmFyIHA0ID0gbmV3IFBvaW50KDEwLCAwKTtcblxuICAgIHZhciBsMSA9IG5ldyBMaW5lKHAxLCBwMyk7XG4gICAgdmFyIGwxMiA9IG5ldyBMaW5lKHAzLCBwMSk7XG5cbiAgICB2YXIgbDIgPSBuZXcgTGluZShwMiwgcDQpO1xuICAgIHZhciBsMyA9IG5ldyBMaW5lKHAxLCBwMik7XG4gICAgdmFyIGw0ID0gbmV3IExpbmUocDQsIHAzKTtcblxuICAgIC8vVE9ETzogdGVzdCBtb3JlIGVuZHBvaW50IGludGVyc2VjdGlvbnNcblxuXG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEsIGwxKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMTIsIGwxKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMSwgbDEyKTtcblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKGwxLGwyKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMTIsbDIpO1xuICAgIGFzc2VydC5pbnRlcnNlY3RzKGwxLGwxKTtcblxuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKGwzLGw0KTtcblxuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKGwxLGwzKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiaW50ZXJzZWN0cyByZWFsaXN0aWNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCg2MDAsIDApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCg2MDAsIDYwMCk7XG4gICAgdmFyIHA0ID0gbmV3IFBvaW50KDAsIDYwMCk7XG5cbiAgICB2YXIgcjEgPSBuZXcgUG9pbnQoMjAwLCAyMDApO1xuICAgIHZhciByMiA9IG5ldyBQb2ludCg0MDAsIDIwMCk7XG4gICAgdmFyIHIzID0gbmV3IFBvaW50KDQwMCwgNDAwKTtcbiAgICB2YXIgcjQgPSBuZXcgUG9pbnQoMjAwLCA0MDApO1xuXG4gICAgdmFyIHIxcjMgPSBuZXcgTGluZShyMSwgcjMpO1xuICAgIHZhciByMnI0ID0gbmV3IExpbmUocjIsIHI0KTtcblxuICAgIHZhciByMXIyID0gbmV3IExpbmUocjEsIHIyKTtcbiAgICB2YXIgcjJyMyA9IG5ldyBMaW5lKHIyLCByMyk7XG4gICAgdmFyIHIzcjQgPSBuZXcgTGluZShyMywgcjQpO1xuICAgIHZhciByNHIxID0gbmV3IExpbmUocjQsIHIxKTtcblxuICAgIHZhciByZWVmcyA9IFtyMXIzLCByMXIyLCByMnIzLCByM3I0LCByNHIxXTtcblxuICAgIHJlZWZzLmZvckVhY2goZnVuY3Rpb24obDEpIHtcbiAgICAgICAgcmVlZnMuZm9yRWFjaChmdW5jdGlvbihsMikge1xuICAgICAgICAgICAgaWYoIWwyLmVxdWFscyhsMSkpIHtcbiAgICAgICAgICAgICAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhsMSxsMik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgYXNzZXJ0LmludGVyc2VjdHMocjFyMywgcjJyNCk7XG59KTtcblxuUVVuaXQudGVzdChcImludGVyc2VjdHMgcmVncmVzc2lvblwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMCwgMCk7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDYwMCwgMCk7XG4gICAgdmFyIHAzID0gbmV3IFBvaW50KDYwMCwgNjAwKTtcbiAgICB2YXIgcDQgPSBuZXcgUG9pbnQoMCwgNjAwKTtcblxuICAgIHZhciByMSA9IG5ldyBQb2ludCgyMDAsIDIwMCk7XG4gICAgdmFyIHIyID0gbmV3IFBvaW50KDQwMCwgMjAwKTtcbiAgICB2YXIgcjMgPSBuZXcgUG9pbnQoNDAwLCA0MDApO1xuICAgIHZhciByNCA9IG5ldyBQb2ludCgyMDAsIDQwMCk7XG5cbiAgICB2YXIgcjJyMSA9IG5ldyBMaW5lKHIyLCByMSk7XG5cbiAgICB2YXIgcjFyMiA9IG5ldyBMaW5lKHIxLCByMik7XG4gICAgdmFyIHIycjMgPSBuZXcgTGluZShyMiwgcjMpO1xuICAgIHZhciByM3I0ID0gbmV3IExpbmUocjMsIHI0KTtcbiAgICB2YXIgcjRyMSA9IG5ldyBMaW5lKHI0LCByMSk7XG5cbiAgICB2YXIgcDFyMSA9IG5ldyBMaW5lKHAxLHIxKTtcbiAgICB2YXIgcjFyMyA9IG5ldyBMaW5lKHIxLHIzKTtcblxuICAgIHZhciBwMXIyID0gbmV3IExpbmUocDEscjIpO1xuICAgIHZhciBwMXIzID0gbmV3IExpbmUocDEscjMpO1xuICAgIHZhciBwMnIxID0gbmV3IExpbmUocDIscjEpO1xuICAgIHZhciByM3A0ID0gbmV3IExpbmUocDIscjEpO1xuXG4gICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMocjFyMiwgcjJyMyk7XG4gICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMocjJyMywgcjFyMik7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMocjFyMiwgcjJyMSk7XG5cbiAgICAvL2RlYnVnZ2VyO1xuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHAxcjEsIHIxcjMpO1xuXG4gICAgYXNzZXJ0LmludGVyc2VjdHMocDFyMiwgcDJyMSk7XG4gICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMocDFyMSwgcjNwNCk7XG5cbiAgICAvLyBkZWJ1Z2dlcjtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhwMXIxLCBwMXIzKTtcbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBIYXNoTWFwID0gcmVxdWlyZShcIi4uL2FwcC9qcy9oYXNobWFwLmpzXCIpO1xudmFyIEhhc2hTZXQgPSByZXF1aXJlKFwiLi4vYXBwL2pzL2hhc2htYXAuanNcIikuSGFzaFNldDtcbnZhciBTZXRNdWx0aU1hcCA9IHJlcXVpcmUoXCIuLi9hcHAvanMvaGFzaG1hcC5qc1wiKS5TZXRNdWx0aU1hcDtcblxuZnVuY3Rpb24gT2JqKGkpIHtcbiAgICB0aGlzLmkgPSBpO1xufVxuXG5PYmoucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4geC5pID09PSB0aGlzLmk7XG59O1xuXG5PYmoucHJvdG90eXBlLmhhc2hDb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuaTtcbn07XG5cblFVbml0Lm1vZHVsZShcIkhhc2hNYXBcIik7XG5cblxuUVVuaXQudGVzdChcImdldFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgbWFwID0gbmV3IEhhc2hNYXAoKTtcblxuICAgIHZhciBvID0gbmV3IE9iaigxKTtcbiAgICBhc3NlcnQubm90T2sobWFwLmdldChvKSk7XG4gICAgbWFwLnB1dChvLCAxMCk7XG4gICAgYXNzZXJ0LmVxdWFsKG1hcC5nZXQobyksIDEwKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwicmVtb3ZlXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBtYXAgPSBuZXcgSGFzaE1hcCgpO1xuXG4gICAgdmFyIG8gPSBuZXcgT2JqKDEpO1xuICAgIHZhciBvMiA9IG5ldyBPYmooMjApO1xuICAgIG1hcC5wdXQobywgMTApO1xuICAgIG1hcC5wdXQobzIsIDIwKTtcbiAgICBhc3NlcnQuZXF1YWwobWFwLmdldChvKSwgMTApO1xuICAgIGFzc2VydC5lcXVhbChtYXAuZ2V0KG8yKSwgMjApO1xuXG4gICAgbWFwLnJlbW92ZShvKTtcblxuICAgIGFzc2VydC5ub3RPayhtYXAuZ2V0KG8pKTtcbiAgICBhc3NlcnQuZXF1YWwobWFwLmdldChvMiksIDIwKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiZ2V0IGxvdHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIG1hcCA9IG5ldyBIYXNoTWFwKCk7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgdmFyIG8gPSBuZXcgT2JqKGkpO1xuICAgICAgICBtYXAucHV0KG8sIGkpO1xuICAgICAgICBhc3NlcnQuZXF1YWwobWFwLmdldChvKSwgaSk7XG4gICAgfVxufSk7XG5cblFVbml0Lm1vZHVsZShcIkhhc2hTZXRcIik7XG5RVW5pdC50ZXN0KFwiZ2V0XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBzZXQgPSBuZXcgSGFzaFNldCgpO1xuXG4gICAgdmFyIG8gPSBuZXcgT2JqKDEpO1xuICAgIGFzc2VydC5ub3RPayhzZXQuY29udGFpbnMobykpO1xuICAgIHNldC5hZGQobywgMTApO1xuICAgIGFzc2VydC5vayhzZXQuY29udGFpbnMobykpO1xufSk7XG5cblFVbml0LnRlc3QoXCJyZW1vdmVcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHNldCA9IG5ldyBIYXNoU2V0KCk7XG5cbiAgICB2YXIgbyA9IG5ldyBPYmooMSk7XG4gICAgdmFyIG8yID0gbmV3IE9iaigyMCk7XG4gICAgc2V0LmFkZChvKTtcbiAgICBzZXQuYWRkKG8yKTtcbiAgICBhc3NlcnQub2soc2V0LmNvbnRhaW5zKG8pKTtcbiAgICBhc3NlcnQub2soc2V0LmNvbnRhaW5zKG8yKSk7XG5cbiAgICBzZXQucmVtb3ZlKG8pO1xuXG4gICAgYXNzZXJ0Lm5vdE9rKHNldC5jb250YWlucyhvKSk7XG4gICAgYXNzZXJ0Lm9rKHNldC5jb250YWlucyhvMikpO1xufSk7XG5cblFVbml0LnRlc3QoXCJnZXQgbG90c1wiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgc2V0ID0gbmV3IEhhc2hTZXQoKTtcblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCAxMDA7IGkrKykge1xuICAgICAgICB2YXIgbyA9IG5ldyBPYmooaSk7XG4gICAgICAgIHNldC5hZGQobyk7XG4gICAgICAgIGFzc2VydC5vayhzZXQuY29udGFpbnMobykpO1xuICAgIH1cbn0pO1xuXG5RVW5pdC50ZXN0KFwidG9fYXJyYXlcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHNldCA9IG5ldyBIYXNoU2V0KCk7XG4gICAgdmFyIHRydXRoX2FyciA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIHZhciBvID0gbmV3IE9iaihpKTtcbiAgICAgICAgdHJ1dGhfYXJyLnB1c2gobyk7XG4gICAgICAgIHNldC5hZGQobyk7XG4gICAgfVxuXG4gICAgdmFyIGFyciA9IHNldC50b19hcnJheSgpO1xuICAgIGZvcihpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgYXNzZXJ0Lm9rKGFyci5pbmRleE9mKHRydXRoX2FycltpXSkgPiAtMSk7XG4gICAgfVxuXG59KTtcblxuUVVuaXQudGVzdChcImZyb21fYXJyYXlcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG5cbiAgICB2YXIgdHJ1dGhfYXJyID0gW107XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IDEwOyBpKyspIHtcbiAgICAgICAgdmFyIG8gPSBuZXcgT2JqKGkpO1xuICAgICAgICB0cnV0aF9hcnIucHVzaChvKTtcbiAgICB9XG5cbiAgICB2YXIgc2V0ID0gbmV3IEhhc2hTZXQodHJ1dGhfYXJyKTtcblxuICAgIHZhciBhcnIgPSBzZXQudG9fYXJyYXkoKTtcbiAgICBmb3IoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGFzc2VydC5vayhzZXQuY29udGFpbnModHJ1dGhfYXJyW2ldKSk7XG4gICAgfVxufSk7XG5cblFVbml0Lm1vZHVsZShcIlNldE11bHRpTWFwXCIpO1xuUVVuaXQudGVzdChcImdldFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgbXVsdGlfbWFwID0gbmV3IFNldE11bHRpTWFwKCk7XG5cbiAgICB2YXIgbyA9IG5ldyBPYmooMSk7XG4gICAgbXVsdGlfbWFwLnB1dChvLCAxMCk7XG4gICAgbXVsdGlfbWFwLnB1dChvLCAyMCk7XG5cbiAgICB2YXIgdmFscyA9IG11bHRpX21hcC5nZXQobyk7XG4gICAgYXNzZXJ0LmVxdWFsKHZhbHMubGVuZ3RoLCAyKTtcbiAgICBhc3NlcnQubm90RXF1YWwodmFscy5pbmRleE9mKDEwKSwgLTEpO1xuICAgIGFzc2VydC5ub3RFcXVhbCh2YWxzLmluZGV4T2YoMjApLCAtMSk7XG5cbn0pO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnJlcXVpcmUoXCIuL2dlb21ldHJ5LmpzXCIpO1xucmVxdWlyZShcIi4vb2NlYW4uanNcIik7XG5yZXF1aXJlKFwiLi9oYXNobWFwLmpzXCIpO1xuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbnZhciBPY2VhbiA9IHJlcXVpcmUoXCIuLi9hcHAvanMvb2NlYW4uanNcIik7XG52YXIgUmVlZiA9IHJlcXVpcmUoXCIuLi9hcHAvanMvcmVlZi5qc1wiKTtcbnZhciBMaW5lID0gcmVxdWlyZShcIi4uL2FwcC9qcy9nZW9tZXRyeS5qc1wiKS5MaW5lO1xudmFyIFBvaW50ID0gcmVxdWlyZShcIi4uL2FwcC9qcy9nZW9tZXRyeS5qc1wiKS5Qb2ludDtcblxuUVVuaXQuYXNzZXJ0LmNvbnRhaW5zID0gZnVuY3Rpb24obGluZSwgYXJyLCBtZXNzYWdlLCB0cnV0aHkpIHtcbiAgICB2YXIgZm91bmQgPSBmYWxzZTtcbiAgICBhcnIuZm9yRWFjaChmdW5jdGlvbihsKSB7XG4gICAgICAgIGlmKGxpbmUuZXF1YWxzKGwpKSB7XG4gICAgICAgICAgICBmb3VuZCA9IHRydWU7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHRoaXMucHVzaChmb3VuZCAmJiAgIXRydXRoeSwgZm91bmQsIGxpbmUsIG1lc3NhZ2UpO1xufTtcblxuUVVuaXQubW9kdWxlKFwiT2NlYW5cIik7XG4iXX0=
