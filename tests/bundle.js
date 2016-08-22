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
    return this.get_center().equals(x.get_center());
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
    if(this.map.get(val)) {
        return val;
    }
};

HashSet.prototype.get = function(val) {
    if(this.map.get(val)) {
        return val;
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
    this.graph = this.build_graph(this.lines, triangulated.edges);

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

    //TODO: Do I need to add the sorrounding to the lines ahead of time.


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

Triangulation.prototype.build_graph = function(lines, connects) {
    var graph = [];

    //lines could be a set, connects a hashmap

    //TODO: instead we can form a multimap, so that each key is a point and the values are the
    // points it connects to
    // initialise with a random edge: A,B.
    // checked = []
    // while there are nodes to check
    //      take a,b = nodes.pop()
    //      set AB as searched.
    //      find points c and d such that a and b share an edge.
    //
    //          if(checked(cd)) then we set them and neighbours, if it's not checked we create a new triangle and set them neighbours.
    //      abc is now a triangle
    //      We now add AC, BC to the search.
    //
    //

    //TODO: in case of disconnected graphs, we remove every line we check
    //Then we can check at the end if there are any lines left in it, if there are then
    // we need to neighborise them.

    lines = new HashSet(lines);

    //connectivity map
    var checked = new HashSet();
    var triangles = new HashSet();
    var triangles_by_edges = new SetMultiMap();
    var to_check = [lines.get_any()];
    //add an edge.
    var context = document.getElementsByTagName("canvas")[0].getContext("2d");

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

        // console.log(shared_points.length);

        var ts = [];

        for (var i = 0; i < shared_points.length; i++) {
            var p3 = shared_points[i];
            var t = new Triangle(checking.p1, checking.p2, p3);
            var p1p2p3 = triangles.get(t);


            if (!p1p2p3) {
                p1p2p3 = t;
                triangles.add(p1p2p3);
                t.fill_triangle(context);
            } else {
                // console.log(p1p2p3.get_center());
                // debugger;
            }

            var p1p3 = new Line(checking.p1, p3);

            triangles_by_edges.put(checking, t);

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

    //TODO: could probably do this inline;
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

        //console.log(triangle.neighbors);
    }

    console.log(triangles.to_array());

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
    var to_test;

    if(Object.prototype.toString.apply(arguments[0]) === "[object Array]") {
        to_test = arguments[0];
    } else {
        to_test = arguments;
    }

    var arr = [];
    for (var i = 0; i < to_test.length; i++) {
        var contained = false;
        for (var j = 0; j < arr.length; j++) {
            if (to_test[i].equals(arr[j])) {
                contained = true;
                break;
            }
        }
        if (!contained) {
            arr.push(to_test[i]);
        }
    }

    return arr;
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhcHAvanMvZ2VvbWV0cnkuanMiLCJhcHAvanMvaGFzaG1hcC5qcyIsImFwcC9qcy9vY2Vhbi5qcyIsImFwcC9qcy9yZWVmLmpzIiwiYXBwL2pzL3N0YXRzLmpzIiwiYXBwL2pzL3RyaWFuZ3VsYXRpb24uanMiLCJ0ZXN0cy9nZW9tZXRyeS5qcyIsInRlc3RzL2hhc2htYXAuanMiLCJ0ZXN0cy9pbmRleC5qcyIsInRlc3RzL29jZWFuLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JQQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvSUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25XQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdExBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDTEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIlwidXNlIHN0cmljdFwiO1xuXG5mdW5jdGlvbiBMaW5lKHAxLCBwMikge1xuICAgIHRoaXMucDEgPSBwMTtcbiAgICB0aGlzLnAyID0gcDI7XG59XG5cbkxpbmUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKGxpbmUpIHtcbiAgICByZXR1cm4gKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpICYmIHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSB8fFxuICAgICAgICAodGhpcy5wMS5lcXVhbHMobGluZS5wMikgJiYgdGhpcy5wMi5lcXVhbHMobGluZS5wMSkpO1xufTtcblxuTGluZS5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQsIGNvbG9yKSB7XG4gICAgY29udGV4dC5zdHJva2VTdHlsZSA9IGNvbG9yIHx8IFwiI0FBQUFBQVwiO1xuICAgIGNvbnRleHQubGluZVdpZHRoID0gMztcblxuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5tb3ZlVG8odGhpcy5wMS54LCB0aGlzLnAxLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMucDIueCwgdGhpcy5wMi55KTtcbiAgICBjb250ZXh0LnN0cm9rZSgpO1xufTtcblxuTGluZS5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wMS50b1N0cmluZygpICsgXCIgPT4gXCIgKyB0aGlzLnAyLnRvU3RyaW5nKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5oYXNoQ29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnAxLmhhc2hDb2RlKCkgKyB0aGlzLnAyLmhhc2hDb2RlKCk7XG59O1xuXG5MaW5lLnByb3RvdHlwZS5pbnRlcnNlY3RzID0gZnVuY3Rpb24obGluZSkge1xuICAgIGlmICh0aGlzLmVxdWFscyhsaW5lKSkge1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9XG5cbiAgICB2YXIgczEgPSB0aGlzLnAyLnN1YnRyYWN0KHRoaXMucDEpO1xuICAgIHZhciBzMiA9IGxpbmUucDIuc3VidHJhY3QobGluZS5wMSk7XG5cbiAgICB2YXIgcyA9ICgtczEueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpICsgczEueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG4gICAgdmFyIHQgPSAoczIueCAqICh0aGlzLnAxLnkgLSBsaW5lLnAxLnkpIC0gczIueSAqICh0aGlzLnAxLnggLSBsaW5lLnAxLngpKSAvICgtczIueCAqIHMxLnkgKyBzMS54ICogczIueSk7XG5cbiAgICBpZiAocyA+PSAwICYmIHMgPD0gMSAmJiB0ID49IDAgJiYgdCA8PSAxKSB7XG4gICAgICAgIGlmICh0aGlzLnAxLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAxKSB8fCB0aGlzLnAxLmVxdWFscyhsaW5lLnAyKSB8fCB0aGlzLnAyLmVxdWFscyhsaW5lLnAyKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH0gZWxzZSBpZiAoaXNOYU4ocykgfHwgaXNOYU4odCkpIHtcbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG5vIHBvaW50cyB0aGV5IGRvbid0IG92ZXJsYXAuXG4gICAgICAgIGlmICghKHRoaXMucDEuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDEpIHx8IHRoaXMucDEuZXF1YWxzKGxpbmUucDIpIHx8IHRoaXMucDIuZXF1YWxzKGxpbmUucDIpKSkge1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuYm91bmRpbmdfY29udGFpbnMobGluZSkgfHwgbGluZS5ib3VuZGluZ19jb250YWlucyh0aGlzKTtcbiAgICAgICAgfVxuICAgICAgICAvL0NvbGluZWFyLCBlaXRoZXIgdGhleSBvdmVybGFwIG9yIHRoZXkgZG9uJ3QuLi5cbiAgICAgICAgLy9JZiB0aGV5IHNoYXJlIG9uZSBwb2ludCwgdGhlbiB0aGV5IG92ZXJsYXAgaWYgYW55IG9mIHRoZSBwb2ludHMgZmFsbHMgd2l0aGluIHRoZSByYW5nZSBvZiB0aGUgbGluZXMuXG4gICAgICAgIC8vSWYgdGhleSBzaGFyZSBib3RoIHRoZXkncmUgZXF1YWwsIHdoaWNoIHdlIGNvdmVyIGFib3ZlXG5cblxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmJvdW5kaW5nX2NvbnRhaW5zID0gZnVuY3Rpb24obGluZSkge1xuICAgIHZhciB0b3BfbGVmdCA9IG5ldyBQb2ludChNYXRoLm1pbih0aGlzLnAxLngsIHRoaXMucDIueCksIE1hdGgubWluKHRoaXMucDEueSwgdGhpcy5wMi55KSk7XG4gICAgdmFyIGJvdHRvbV9yaWdodCA9IG5ldyBQb2ludChNYXRoLm1heCh0aGlzLnAxLngsIHRoaXMucDIueCksIE1hdGgubWF4KHRoaXMucDEueSwgdGhpcy5wMi55KSk7XG5cbiAgICByZXR1cm4gbGluZS5wMS5iZXR3ZWVuKHRvcF9sZWZ0LCBib3R0b21fcmlnaHQpIHx8IGxpbmUucDIuYmV0d2Vlbih0b3BfbGVmdCwgYm90dG9tX3JpZ2h0KTtcbn07XG5cbkxpbmUucHJvdG90eXBlLmludGVyc2VjdHNfYW55ID0gZnVuY3Rpb24obGluZXMpIHtcbiAgICBmb3IgKHZhciBrID0gMDsgayA8IGxpbmVzLmxlbmd0aDsgaysrKSB7XG4gICAgICAgIGlmICh0aGlzLmludGVyc2VjdHMobGluZXNba10pKSB7XG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBmYWxzZTtcbn07XG5cbmZ1bmN0aW9uIFBvaW50KHgsIHkpIHtcbiAgICB0aGlzLnggPSB4O1xuICAgIHRoaXMueSA9IHk7XG59XG5cblBvaW50LnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBcIihcIiArIHRoaXMueCArIFwiLCBcIiArIHRoaXMueSArIFwiKVwiO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgcmV0dXJuIHRoaXMueCA9PT0gcG9pbnQueCAmJiB0aGlzLnkgPT09IHBvaW50Lnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbih2KSB7XG4gICAgcmV0dXJuIG5ldyBQb2ludCh0aGlzLnggLSB2LngsIHRoaXMueSAtIHYueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiBuZXcgUG9pbnQodGhpcy54ICsgdi54LCB0aGlzLnkgKyB2LnkpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLnNjYWxhcl9wcm9kdWN0ID0gZnVuY3Rpb24oYykge1xuICAgIHJldHVybiBuZXcgUG9pbnQoYyAqIHRoaXMueCwgYyAqIHRoaXMueSk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuY3Jvc3NfcHJvZHVjdCA9IGZ1bmN0aW9uKHYpIHtcbiAgICByZXR1cm4gdGhpcy54ICogdi55IC0gdGhpcy55ICogdi54O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRvdF9wcm9kdWN0ID0gZnVuY3Rpb24odikge1xuICAgIHJldHVybiB0aGlzLnggKiB2LnggKyB0aGlzLnkgKiB2Lnk7XG59O1xuXG5Qb2ludC5wcm90b3R5cGUuYmV0d2VlbiA9IGZ1bmN0aW9uKHAxLCBwMikge1xuICAgIHJldHVybiB0aGlzLnggPiBwMS54ICYmIHRoaXMueCA8IHAyLnggJiYgdGhpcy55ID4gcDEueSAmJiB0aGlzLnkgPCBwMi55O1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRpc3RhbmNlID0gZnVuY3Rpb24ocCkge1xuICAgIHJldHVybiBNYXRoLnNxcnQoTWF0aC5wb3codGhpcy54IC0gcC54LCAyKSArIE1hdGgucG93KHRoaXMueSAtIHAueSwgMikpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0LCBjb2xvcikge1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gY29sb3IgfHwgXCIjQUFBQUFBXCI7XG5cbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuYXJjKHRoaXMueCwgdGhpcy55LCAxMCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xufTtcblxuUG9pbnQucHJvdG90eXBlLmhhc2hDb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMueCArIHRoaXMueTtcbn07XG5cbmZ1bmN0aW9uIFRyaWFuZ2xlKHAxLHAyLHAzKSB7XG4gICAgdGhpcy5lZGdlcyA9IFtuZXcgTGluZShwMSxwMiksIG5ldyBMaW5lKHAyLHAzKSwgbmV3IExpbmUocDMscDEpXTtcbiAgICB0aGlzLm5laWdoYm9ycyA9IFtdO1xuICAgIHRoaXMucG9pbnRzID0gW3AxLHAyLHAzXTtcbiAgICB0aGlzLmNvbG9yID0gZ2V0UmFuZG9tQ29sb3IoKTtcbn1cblxuVHJpYW5nbGUucHJvdG90eXBlLmVxdWFscyA9IGZ1bmN0aW9uKHgpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfY2VudGVyKCkuZXF1YWxzKHguZ2V0X2NlbnRlcigpKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5nZXRfY2VudGVyID0gZnVuY3Rpb24oKSB7XG4gICAgLy9DZW50cm9pZDpcbiAgICAvL3JldHVybiBuZXcgUG9pbnQoKHRoaXMucG9pbnRzWzBdLnggKyB0aGlzLnBvaW50c1sxXS54ICsgdGhpcy5wb2ludHNbMl0ueCkgLyAzLCAodGhpcy5wb2ludHNbMF0ueSArIHRoaXMucG9pbnRzWzFdLnkgKyB0aGlzLnBvaW50c1syXS55KSAvIDMpO1xuXG4gICAgdmFyIGEgPSB0aGlzLnBvaW50c1swXS5kaXN0YW5jZSh0aGlzLnBvaW50c1sxXSk7XG4gICAgdmFyIGIgPSB0aGlzLnBvaW50c1swXS5kaXN0YW5jZSh0aGlzLnBvaW50c1syXSk7XG4gICAgdmFyIGMgPSB0aGlzLnBvaW50c1sxXS5kaXN0YW5jZSh0aGlzLnBvaW50c1syXSk7XG4gICAgdmFyIHAgPSBhICsgYiArIGM7XG5cbiAgICByZXR1cm4gbmV3IFBvaW50KChhICogdGhpcy5wb2ludHNbMl0ueCArIGIgKiB0aGlzLnBvaW50c1sxXS54ICsgYyAqIHRoaXMucG9pbnRzWzBdLngpIC8gcCwgKGEgKiB0aGlzLnBvaW50c1syXS55ICsgYiAqIHRoaXMucG9pbnRzWzFdLnkgKyBjICogdGhpcy5wb2ludHNbMF0ueSkgLyBwKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5kaXN0YW5jZSA9IGZ1bmN0aW9uKHQpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfY2VudGVyKCkuZGlzdGFuY2UodC5nZXRfY2VudGVyKCkpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmhhc2hDb2RlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMucG9pbnRzWzBdLmhhc2hDb2RlKCkgKyB0aGlzLnBvaW50c1sxXS5oYXNoQ29kZSgpICsgdGhpcy5wb2ludHNbMl0uaGFzaENvZGUoKTtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHApIHtcbiAgICB2YXIgcDEgPSB0aGlzLnBvaW50c1swXTtcbiAgICB2YXIgcDIgPSB0aGlzLnBvaW50c1sxXTtcbiAgICB2YXIgcDMgPSB0aGlzLnBvaW50c1syXTtcblxuICAgIHZhciBhbHBoYSA9ICgocDIueSAtIHAzLnkpICogKHAueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwLnkgLSBwMy55KSkgL1xuICAgICAgICAoKHAyLnkgLSBwMy55KSAqIChwMS54IC0gcDMueCkgKyAocDMueCAtIHAyLngpICogKHAxLnkgLSBwMy55KSk7XG4gICAgdmFyIGJldGEgPSAoKHAzLnkgLSBwMS55KSAqIChwLnggLSBwMy54KSArIChwMS54IC0gcDMueCkgKiAocC55IC0gcDMueSkpIC9cbiAgICAgICAgKChwMi55IC0gcDMueSkgKiAocDEueCAtIHAzLngpICsgKHAzLnggLSBwMi54KSAqIChwMS55IC0gcDMueSkpO1xuICAgIHZhciBnYW1tYSA9IDEgLSBhbHBoYSAtIGJldGE7XG5cbiAgICByZXR1cm4gYWxwaGEgPiAwICYmIGJldGEgPiAwICYmIGdhbW1hID4gMDtcbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5pc19uZWlnaGJvciA9IGZ1bmN0aW9uKHQpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHRoaXMuZWRnZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCB0LmVkZ2VzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5lZGdlc1tpXS5lcXVhbHModC5lZGdlc1tqXSkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuYWRkX25laWdoYm9yID0gZnVuY3Rpb24odCkge1xuICAgIHRoaXMubmVpZ2hib3JzLnB1c2godCk7XG59O1xuXG5UcmlhbmdsZS5wcm90b3R5cGUuZmlsbF90cmlhbmdsZSA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbFN0eWxlID0gdGhpcy5jb2xvcjtcbiAgICBjb250ZXh0Lm1vdmVUbyh0aGlzLnBvaW50c1swXS54LCB0aGlzLnBvaW50c1swXS55KTtcblxuICAgIGNvbnRleHQubGluZVRvKHRoaXMucG9pbnRzWzFdLngsIHRoaXMucG9pbnRzWzFdLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMucG9pbnRzWzJdLngsIHRoaXMucG9pbnRzWzJdLnkpO1xuICAgIGNvbnRleHQubGluZVRvKHRoaXMucG9pbnRzWzBdLngsIHRoaXMucG9pbnRzWzBdLnkpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xufTtcblxuVHJpYW5nbGUucHJvdG90eXBlLmRyYXdfd2VpZ2h0cyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiIzIyMjIyMlwiO1xuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZCA9IHRoaXMuZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKSk7XG4gICAgICAgIGNvbnRleHQuZmlsbFRleHQoZC50b0ZpeGVkKDApLCAodGhpcy5nZXRfY2VudGVyKCkueCArIHRoaXMubmVpZ2hib3JzW2ldLmdldF9jZW50ZXIoKS54KSAvIDIgKyAxMCwgKHRoaXMuZ2V0X2NlbnRlcigpLnkgKyB0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueSkgLyAyICsgMTApO1xuICAgIH1cbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5kcmF3X2VkZ2VzID0gZnVuY3Rpb24oY29udGV4dCkge1xuICAgIGNvbnRleHQuc3Ryb2tlU3R5bGUgPSBcIiNBQUFBQUFcIjtcbiAgICBjb250ZXh0LmxpbmVXaWR0aCA9IDM7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgICAgIGNvbnRleHQubW92ZVRvKHRoaXMuZ2V0X2NlbnRlcigpLngsIHRoaXMuZ2V0X2NlbnRlcigpLnkpO1xuICAgICAgICBjb250ZXh0LmxpbmVUbyh0aGlzLm5laWdoYm9yc1tpXS5nZXRfY2VudGVyKCkueCwgdGhpcy5uZWlnaGJvcnNbaV0uZ2V0X2NlbnRlcigpLnkpO1xuICAgICAgICBjb250ZXh0LnN0cm9rZSgpO1xuICAgIH1cbn07XG5cblRyaWFuZ2xlLnByb3RvdHlwZS5kcmF3X3ZlcnRleCA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBjb250ZXh0LmZpbGxTdHlsZSA9IFwiIzIyMjIyMlwiO1xuICAgIGNvbnRleHQuYmVnaW5QYXRoKCk7XG4gICAgY29udGV4dC5hcmModGhpcy5nZXRfY2VudGVyKCkueCwgdGhpcy5nZXRfY2VudGVyKCkueSwgOCwgOCwgMCwgTWF0aC5QSSAqIDIpO1xuICAgIGNvbnRleHQuZmlsbCgpO1xufTtcblxuZnVuY3Rpb24gZ2V0UmFuZG9tQ29sb3IoKSB7XG4gICAgdmFyIGxldHRlcnMgPSAnMDEyMzQ1Njc4OUFCQ0RFRic7XG4gICAgdmFyIGNvbG9yID0gJyMnO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgNjsgaSsrKSB7XG4gICAgICAgIGNvbG9yICs9IGxldHRlcnNbTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogMTYpXTtcbiAgICB9XG4gICAgcmV0dXJuIGNvbG9yO1xufVxuXG5cbm1vZHVsZS5leHBvcnRzLlBvaW50ID0gUG9pbnQ7XG5tb2R1bGUuZXhwb3J0cy5MaW5lID0gTGluZTtcbm1vZHVsZS5leHBvcnRzLlRyaWFuZ2xlID0gVHJpYW5nbGU7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxuZnVuY3Rpb24gSGFzaE1hcCgpIHtcbiAgICAvL1RPRE86IHNob3VsZCBiZSBjb25maWd1cmFibGUgKGFuZCBleHBhbmRhYmxlKVxuICAgIHRoaXMubnVtX2J1Y2tldHMgPSAxOTtcbiAgICB0aGlzLmJ1Y2tldHMgPSBbXTtcbn1cblxuSGFzaE1hcC5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgaWYoIWtleSkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIHZhciBidWNrZXQgPSB0aGlzLmJ1Y2tldHNbdGhpcy5oYXNoKGtleSldO1xuXG4gICAgaWYoIWJ1Y2tldCkge1xuICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgIH1cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCBidWNrZXQua2V5cy5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZihidWNrZXQua2V5c1tpXS5lcXVhbHMoa2V5KSkge1xuICAgICAgICAgICAgcmV0dXJuIGJ1Y2tldC52YWx1ZXNbaV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuSGFzaE1hcC5wcm90b3R5cGUucHV0ID0gZnVuY3Rpb24oa2V5LCB2YWx1ZSkge1xuICAgIC8vVE9ETzogcmVzaXplIHRoZSBidWNrZXRzIGlmIG5lZWQgYmUuXG4gICAgdmFyIGJ1Y2tldCA9IHRoaXMuYnVja2V0c1t0aGlzLmhhc2goa2V5KV07XG4gICAgaWYoIWJ1Y2tldCkge1xuICAgICAgICBidWNrZXQgPSB7a2V5cyA6IFtdLCB2YWx1ZXMgOiBbXX07XG4gICAgICAgIHRoaXMuYnVja2V0c1t0aGlzLmhhc2goa2V5KV0gPSBidWNrZXQ7XG4gICAgfVxuXG4gICAgdmFyIGluZGV4ID0gYnVja2V0LmtleXMubGVuZ3RoO1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJ1Y2tldC5rZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKGJ1Y2tldC5rZXlzW2ldLmVxdWFscyhrZXkpKSB7XG4gICAgICAgICAgICBpbmRleCA9IGk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBidWNrZXQua2V5c1tpbmRleF0gPSBrZXk7XG4gICAgYnVja2V0LnZhbHVlc1tpbmRleF0gPSB2YWx1ZTtcbn07XG5cbkhhc2hNYXAucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHZhciBidWNrZXQgPSB0aGlzLmJ1Y2tldHNbdGhpcy5oYXNoKGtleSldO1xuXG4gICAgaWYoIWJ1Y2tldCkge1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGJ1Y2tldC5rZXlzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKGJ1Y2tldC5rZXlzW2ldLmVxdWFscyhrZXkpKSB7XG4gICAgICAgICAgICBidWNrZXQua2V5cy5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICBidWNrZXQudmFsdWVzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIHJldHVybiBidWNrZXQua2V5c1tpXTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cbkhhc2hNYXAucHJvdG90eXBlLmhhc2ggPSBmdW5jdGlvbih2YWwpIHtcbiAgICByZXR1cm4gdmFsLmhhc2hDb2RlKCkgJSB0aGlzLm51bV9idWNrZXRzO1xufTtcblxuZnVuY3Rpb24gSGFzaFNldChhcnIpIHtcbiAgICB0aGlzLm1hcCA9IG5ldyBIYXNoTWFwKCk7XG5cbiAgICB0aGlzLmxlbmd0aCA9IDA7XG5cbiAgICBpZihPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nLmNhbGwoYXJyKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKXtcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5hZGQoYXJyW2ldKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuSGFzaFNldC5wcm90b3R5cGUuYWRkID0gZnVuY3Rpb24odmFsKSB7XG4gICAgdGhpcy5tYXAucHV0KHZhbCwgdHJ1ZSk7XG4gICAgdGhpcy5sZW5ndGgrKztcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLmNvbnRhaW5zID0gZnVuY3Rpb24odmFsKSB7XG4gICAgaWYodGhpcy5tYXAuZ2V0KHZhbCkpIHtcbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbih2YWwpIHtcbiAgICBpZih0aGlzLm1hcC5nZXQodmFsKSkge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnJlbW92ZSA9IGZ1bmN0aW9uKHZhbCkge1xuICAgIHZhciByZW1vdmVkID0gdGhpcy5tYXAucmVtb3ZlKHZhbCk7XG5cbiAgICBpZih0eXBlb2YgcmVtb3ZlZCAhPT0gXCJ1bmRlZmluZWRcIil7XG4gICAgICAgIHRoaXMubGVuZ3RoLS07XG4gICAgfVxuXG4gICAgcmV0dXJuIHJlbW92ZWQ7XG59O1xuXG5IYXNoU2V0LnByb3RvdHlwZS5yZW1vdmVfYWxsID0gZnVuY3Rpb24oYXJyKSB7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkrKykge1xuICAgICAgICB0aGlzLnJlbW92ZShhcnJbaV0pO1xuICAgIH1cbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLnRvX2FycmF5ID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyciA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLm1hcC5idWNrZXRzLmxlbmd0aDsgaSsrKSB7XG5cbiAgICAgICAgaWYoIXRoaXMubWFwLmJ1Y2tldHNbaV0pe1xuICAgICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIga2V5cyA9IHRoaXMubWFwLmJ1Y2tldHNbaV0ua2V5cztcbiAgICAgICAgZm9yKHZhciBqID0gMDsgaiA8IGtleXMubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGFyci5wdXNoKGtleXNbal0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGFycjtcbn07XG5cbkhhc2hTZXQucHJvdG90eXBlLmdldF9hbnkgPSBmdW5jdGlvbigpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgdGhpcy5tYXAuYnVja2V0cy5sZW5ndGg7IGkrKykge1xuXG4gICAgICAgIGlmKCF0aGlzLm1hcC5idWNrZXRzW2ldKXtcbiAgICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGtleXMgPSB0aGlzLm1hcC5idWNrZXRzW2ldLmtleXM7XG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBrZXlzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICByZXR1cm4ga2V5c1tqXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG5mdW5jdGlvbiBTZXRNdWx0aU1hcCgpIHtcbiAgICB0aGlzLm1hcCA9IG5ldyBIYXNoTWFwKCk7XG59XG5cblNldE11bHRpTWFwLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihrZXkpIHtcbiAgICB2YXIgdmFscyA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIGlmKCF2YWxzKSB7XG4gICAgICAgIHRoaXMubWFwLnB1dChrZXksIFtdKTtcbiAgICAgICAgdmFscyA9IHRoaXMubWFwLmdldChrZXkpO1xuICAgIH1cblxuICAgIHJldHVybiB2YWxzO1xufTtcblxuU2V0TXVsdGlNYXAucHJvdG90eXBlLnB1dCA9IGZ1bmN0aW9uKGtleSwgdmFsdWUpIHtcbiAgICB2YXIgdmFscyA9IHRoaXMuZ2V0KGtleSk7XG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHZhbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYoKHZhbHNbaV0uaGFzT3duUHJvcGVydHkoXCJlcXVhbHNcIikgJiYgdmFsc1tpXS5lcXVhbHModmFsdWUpKSB8fCB2YWxzW2ldID09PSB2YWx1ZSkge1xuICAgICAgICAgICAgdmFsc1tpXSA9IHZhbHVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdmFscy5wdXNoKHZhbHVlKTtcbn07XG5cblxubW9kdWxlLmV4cG9ydHMgPSBIYXNoTWFwO1xubW9kdWxlLmV4cG9ydHMuSGFzaFNldCA9IEhhc2hTZXQ7XG5tb2R1bGUuZXhwb3J0cy5TZXRNdWx0aU1hcCA9IFNldE11bHRpTWFwO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgUmVlZiA9IHJlcXVpcmUoJy4vcmVlZi5qcycpO1xudmFyIExpbmUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuTGluZTtcbnZhciBUcmlhbmdsZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5UcmlhbmdsZTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcbnZhciBUcmlhbmd1bGF0aW9uID0gcmVxdWlyZSgnLi90cmlhbmd1bGF0aW9uLmpzJyk7XG52YXIgU3RhdHMgPSByZXF1aXJlKCcuL3N0YXRzLmpzJyk7XG5cbmZ1bmN0aW9uIE9jZWFuKHdpZHRoLCBoZWlnaHQsIHJlZWZzKSB7XG4gICAgdGhpcy53aWR0aCA9IHdpZHRoO1xuICAgIHRoaXMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgIHRoaXMucmVlZnMgPSByZWVmcztcbiAgICB0aGlzLnJldHJpYW5ndWxhdGUoKTtcbn1cblxuLy9UT0RPOiBjcmVhdGUgYSB0cmlhbmd1bGF0aW9uIGZvciBldmVyeSBzaXplIG9mIGZpc2ggKGp1c3QgZXhwYW5kIHRoZSB3aWR0aCxoZWlnaHQgYW5kIHRvcGxlZnQgcG9pbnRzIGJ5IHRoZSByYWRpdXMuKSBQcm9iYWJseSBhIHdheSB3ZSBjYW4gcmV1c2UgbW9zdCBvZiB0aGUgdHJpYW5ndWxhdGlvbi5cbi8vVE9ETzogb3ZlcmxhcHBpbmcgcmVlZnMgY2F1c2UgIGFidWcsIGNvbWJpbmUgdGhlbSBpbnRvIHBvbHlnb25zIHdpdGggY29uc3RyYWludHMgYW5kIHVzZSB0aG9zZSBpbnN0ZWFkXG4vL1RPRE86IGNyZWF0ZSBhIGNvbnZleCBodWxsLCB0aGVuIHJlbW92ZSBwb2ludHMgaW5zaWRlIChnaWZ0IHdyYXBwaW5nIGFsZ28pLCB0aGVuIGRldGVybWluZSBob3cgdG8gY3JlYXRlIGEgY29uc3RyaWFudCBmcm9tIHRoYXQsXG4vL1RPRE86IG1heWJlIGp1c3QgdHJpYW5ndWxhdGUgdGhlIHBvaW50cyBmaXJzdCwgdGhlbiB1c2UgdGhhdCB0cmlhbmd1bGF0aW9uIGFzIHRoZSBjb25zdHJhaW50cy4gR2VuaXVzLlxuXG4vL1RPRE86IHJlbW92ZSBpbm5lciBwb2ludHMgKDMgY2FzZXMsIGFsbCBwb2ludHMsIDIgcG9pbnRzLCAxIHBvaW50KSBhbmQgdGhlbiBhZGQgbmV3IHBvaW50cyBhdCBpbnRlcnNlY3Rpb25zLlxuLy8gVGhlIG9sZCBkaWFnb25hbHMgY2FuIHN0aWxsIGJlIHVzZWQgYXMgY29uc3RyYWludHMgSSB0aGluaywgYnV0IG5ldyBvdXRlciBsaW5lcyBuZWVkIHRvIGJlIG1hZGUgd2hlcmUgdGhlIGludGVyc2VjdGlvbnMgYXJlLlxuXG5PY2Vhbi5wcm90b3R5cGUucmV0cmlhbmd1bGF0ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICBTdGF0cy5zdGFydChcInJldHJpYW5ndWxhdGVcIik7XG4gICAgdGhpcy50cmlhbmd1bGF0aW9uID0gbmV3IFRyaWFuZ3VsYXRpb24odGhpcy5nZXRfcG9pbnRzKCksIHRoaXMuZ2V0X2xpbmVzKCksIHRoaXMuZ2V0X2RpYWdzKCkpO1xuICAgIFN0YXRzLmZpbmlzaChcInJldHJpYW5ndWxhdGVcIik7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUucmVzaXplID0gZnVuY3Rpb24od2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMud2lkdGggPSB3aWR0aDtcbiAgICB0aGlzLmhlaWdodCA9IGhlaWdodDtcblxuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9wYXRoX3RvID0gZnVuY3Rpb24oc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIFN0YXRzLnN0YXJ0KFwiZ2V0X3BhdGhfdG9cIik7XG4gICAgdmFyIHBhdGggPSB0aGlzLnRyaWFuZ3VsYXRpb24uZmluZF9wYXRoKHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpO1xuICAgIFN0YXRzLmZpbmlzaChcImdldF9wYXRoX3RvXCIpO1xuICAgIHJldHVybiBwYXRoO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9yZWVmX3VuZGVyX3BvaW50ID0gZnVuY3Rpb24ocCkge1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmKHRoaXMucmVlZnNbaV0uY29udGFpbnMocCkpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnJlZWZzW2ldO1xuICAgICAgICB9XG4gICAgfVxufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9wb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gbmV3IFJlZWYoMCwgMCwgdGhpcy53aWR0aCwgdGhpcy5oZWlnaHQpLmdldF9wb2ludHMoKTtcblxuICAgIHRoaXMucmVlZnMuZm9yRWFjaChmdW5jdGlvbihyZWVmKSB7XG4gICAgICAgIHZhciBwcyA9IHJlZWYuZ2V0X3BvaW50cygpO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBwb2ludHMucHVzaChwc1tpXSk7XG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIHBvaW50cy5zb3J0KGZ1bmN0aW9uKGEsIGIpIHtcbiAgICAgICAgaWYoYS54ID09IGIueCkge1xuICAgICAgICAgICAgcmV0dXJuIGEueSA+IGIueTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBhLnggPiBiLng7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcG9pbnRzO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9saW5lcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsaW5lcyA9IG5ldyBSZWVmKDAsMCx0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X2xpbmVzKCk7XG5cbiAgICBmdW5jdGlvbiBhZGQobGluZSkge2xpbmVzLnB1c2gobGluZSk7fVxuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IHRoaXMucmVlZnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdGhpcy5yZWVmc1tpXS5nZXRfbGluZXMoKS5mb3JFYWNoKGFkZCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGxpbmVzO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmdldF9saW5lc19vdmVybGFwcyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBsaW5lcyA9IG5ldyBSZWVmKDAsMCx0aGlzLndpZHRoLCB0aGlzLmhlaWdodCkuZ2V0X2xpbmVzKCk7XG4gICAgdmFyIHBvaW50cyA9IG5ldyBSZWVmKDAsIDAsIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KS5nZXRfcG9pbnRzKCk7XG4gICAgdmFyIGNvbnN0cmFpbnRzID0gW107XG5cbiAgICB2YXIgcG9seWdvbnMgPSBbXTtcblxuICAgIC8qXG4gICAgICAgIFdlIGNyZWF0ZSBhIGxpc3Qgb2YgcG9seWdvbnMsIHRoZW4gd2UgdGVzdCBpZiBlYWNoIHJlZWYgaW50ZXJzZWN0cyBhbnkgb2YgdGhvc2UgcG9seWdvbnMsXG4gICAgICAgIGlmIG5vdCB0aGF0IHJlZWYgYmVjb21lcyBhIHBvbHlnb24uIGlmIGl0IGludGVyZXNlY3RzLCB0aGVuIHdlIGZpbmQgdGhlIGludGVyc2VjdGlvbiwgYWRkIHRoZSBsaW5lcyBhbmQgcG9pbnRzXG4gICAgICAgIHRvIHRoZSBwb2x5Z29uLiAoYW5kIHRoZSBjb25zdHJhaW50cyB0byB0aGUgd2hvbGUgdGhpbmcpLlxuXG4gICAgICAgIC8vVE9ETzogd2hhdCBhYm91dCBob2xlcywgb3IgdG90YWwgcG9seWdvbiBlbmNsb3N1cmVcbiAgICAgICAgLy9UT0RPOiB3aGF0IGFib3V0IHJlZWZzIGludGVyc2VjdGluZyB3aXRoIG11bHRpcGxlIHBvbHlnb25zLlxuXG4gICAgICAgIC8vdGhpcyBzZWVtcyBsaWtlIGEgcmVjdXJzaXZlIHNvbHV0aW9uIHdvdWxkIHdvcmsgaGVyZS4uLlxuXG4gICAgKi9cblxuICAgIGZvcih2YXIgaSA9IDA7IGkgPCB0aGlzLnJlZWZzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBpbnRlcnNlY3Rpb25fcG9pbnRzID0gW107XG4gICAgICAgIGZvcih2YXIgaiA9IDA7IGogPCBwb2x5Z29ucy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgaW50ZXJzZWN0aW9uX3BvaW50cyA9IHBvbHlnb25zW2pdLmdldF9pbnRlcnNlY3Rpb25fcG9pbnRzKHRoaXMucmVlZnNbaV0pO1xuICAgICAgICB9XG5cbiAgICB9XG5cbiAgICAgICAgLy9UT0RPOiBnbyB0aHJvdWdoIGFsbCB0aGUgcG9pbnRzLCByZW1vdmUgdGhlIG9uZXMgdGhhdCBmYWxsIGluc2lkZSBhbm90aGVyIHNxdWFyZVxuXG4gICAgICAgIC8vVE9ETzogc29ydCB0aGUgcG9pbnRzLiBzdGFydCBhdCB0b3AgbGVmdCwgdGhlbiBnbyBkb3duLCByZW1vdmluZyB0aGVtIGFzIHlvdSBnby4gVGVuIGdvIGZyb20gcmlnaHQgdG8gbGVmdC5cblxuICAgIHJldHVybiBsaW5lcztcbn07XG5cblxuT2NlYW4ucHJvdG90eXBlLmdldF9kaWFncyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLnJlZWZzLm1hcChmdW5jdGlvbihyKSB7cmV0dXJuIHIuZ2V0X2RpYWdvbmFsKCk7fSk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuYWRkX3JlZWYgPSBmdW5jdGlvbihyZWVmKSB7XG4gICAgdGhpcy5yZWVmcy5wdXNoKHJlZWYpO1xuICAgIHRoaXMucmV0cmlhbmd1bGF0ZSgpO1xufTtcblxuT2NlYW4ucHJvdG90eXBlLmRlbGV0ZV9yZWVmID0gZnVuY3Rpb24ocmVlZikge1xuICAgIHRoaXMucmVlZnMuc3BsaWNlKHRoaXMucmVlZnMuaW5kZXhPZihyZWVmKSwgMSk7XG4gICAgdGhpcy5yZXRyaWFuZ3VsYXRlKCk7XG59O1xuXG5PY2Vhbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICB0aGlzLnJlZWZzLmZvckVhY2goZnVuY3Rpb24ocmVlZikge1xuICAgICAgICByZWVmLmRyYXcoY29udGV4dCk7XG4gICAgfSk7XG5cbiAgICB0aGlzLnRyaWFuZ3VsYXRpb24uZHJhdyhjb250ZXh0KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gT2NlYW47XG4iLCIndXNlIHN0cmljdCc7XG5cbnZhciBnZW9tZXRyeSA9IHJlcXVpcmUoXCIuL2dlb21ldHJ5LmpzXCIpO1xudmFyIFBvaW50ID0gZ2VvbWV0cnkuUG9pbnQ7XG52YXIgTGluZSA9IGdlb21ldHJ5LkxpbmU7XG5cbmZ1bmN0aW9uIFJlZWYoeCwgeSwgd2lkdGgsIGhlaWdodCkge1xuICAgIHRoaXMueCA9IHg7XG4gICAgdGhpcy55ID0geTtcbiAgICB0aGlzLndpZHRoID0gd2lkdGg7XG4gICAgdGhpcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICB0aGlzLnBvaW50cyA9IFtuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkpLCBuZXcgUG9pbnQodGhpcy54LCB0aGlzLnkgKyB0aGlzLmhlaWdodCksIG5ldyBQb2ludCh0aGlzLnggKyB0aGlzLndpZHRoLCB0aGlzLnkgKyB0aGlzLmhlaWdodCksIG5ldyBQb2ludCh0aGlzLnggKyB0aGlzLndpZHRoLCB0aGlzLnkgKyAwKV07XG59XG5cblJlZWYucHJvdG90eXBlLmRyYXcgPSBmdW5jdGlvbihjb250ZXh0KSB7XG4gICAgY29udGV4dC5maWxsU3R5bGUgPSBcIiNBQTU1NTVcIjtcbiAgICBjb250ZXh0LmJlZ2luUGF0aCgpO1xuICAgIGNvbnRleHQuZmlsbFJlY3QodGhpcy54LCB0aGlzLnksIHRoaXMud2lkdGgsIHRoaXMuaGVpZ2h0KTtcbn07XG5cblJlZWYucHJvdG90eXBlLmdldF9wb2ludHMgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5wb2ludHM7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfbGluZXMgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRfcG9pbnRzKCk7XG5cbiAgICByZXR1cm4gW25ldyBMaW5lKHBvaW50c1swXSwgcG9pbnRzWzFdKSwgbmV3IExpbmUocG9pbnRzWzFdLCBwb2ludHNbMl0pLCBuZXcgTGluZShwb2ludHNbMl0sIHBvaW50c1szXSksIG5ldyBMaW5lKHBvaW50c1szXSwgcG9pbnRzWzBdKV07XG59O1xuXG5SZWVmLnByb3RvdHlwZS5nZXRfZGlhZ29uYWwgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgcG9pbnRzID0gdGhpcy5nZXRfcG9pbnRzKCk7XG5cbiAgICByZXR1cm4gbmV3IExpbmUocG9pbnRzWzBdLCBwb2ludHNbMl0pO1xufTtcblxuUmVlZi5wcm90b3R5cGUuZ2V0X2RpYWdvbmFscyA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBwb2ludHMgPSB0aGlzLmdldF9wb2ludHMoKTtcblxuICAgIHJldHVybiBbbmV3IExpbmUocG9pbnRzWzBdLCBwb2ludHNbMl0pLCBuZXcgTGluZSh0aGlzLnBvaW50c1sxXSwgdGhpcy5wb2ludHNbM10pXTtcbn07XG5cblJlZWYucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgdmFyIGRpYWcxID0gbmV3IExpbmUodGhpcy5wb2ludHNbMF0sIHRoaXMucG9pbnRzWzJdKTtcbiAgICB2YXIgZGlhZzIgPSBuZXcgTGluZSh0aGlzLnBvaW50c1sxXSwgdGhpcy5wb2ludHNbM10pO1xuXG4gICAgcmV0dXJuIGRpYWcxLmludGVyc2VjdHMobGluZSkgfHwgIGRpYWcyLmludGVyc2VjdHMobGluZSk7XG59O1xuXG5SZWVmLnByb3RvdHlwZS5jb250YWlucyA9IGZ1bmN0aW9uKHApIHtcbiAgICByZXR1cm4gcC54ID49IHRoaXMueCAmJiBwLnkgPj0gdGhpcy55ICYmIHAueCA8PSB0aGlzLnggKyB0aGlzLndpZHRoICYmIHAueSA8PSB0aGlzLnkgKyB0aGlzLmhlaWdodDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gUmVlZjtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgU3RhdHMgPSB7XG4gICAgc3RhcnQgOiB7fSxcbiAgICB2YWx1ZXMgOiB7fVxufTtcblxuU3RhdHMuc3RhcnQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIHRoaXMuc3RhcnRbbmFtZV0gPSArbmV3IERhdGUoKTtcbn07XG5cblN0YXRzLmZpbmlzaCA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB0aGlzLmFkZF92YWx1ZShuYW1lLCArbmV3IERhdGUoKSAtIHRoaXMuc3RhcnRbbmFtZV0pO1xufTtcblxuU3RhdHMuYWRkX3ZhbHVlID0gZnVuY3Rpb24obmFtZSwgdmFsdWUpIHtcbiAgICBpZighdGhpcy52YWx1ZXMuaGFzT3duUHJvcGVydHkobmFtZSkpIHtcbiAgICAgICAgdGhpcy52YWx1ZXNbbmFtZV0gPSBbXTtcbiAgICB9XG5cbiAgICB0aGlzLnZhbHVlc1tuYW1lXS5wdXNoKHZhbHVlKTtcbn07XG5cblN0YXRzLmdldF92YWx1ZXMgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgcmV0dXJuIHRoaXMudmFsdWVzW25hbWVdO1xufTtcblxuU3RhdHMuYXZlcmFnZSA9IGZ1bmN0aW9uKG5hbWUpIHtcbiAgICByZXR1cm4gdGhpcy5nZXRfdmFsdWVzKG5hbWUpLnJlZHVjZShmdW5jdGlvbihzdW0sIHZhbHVlKSB7cmV0dXJuIHN1bSArIHZhbHVlO30pIC8gdGhpcy5nZXRfdmFsdWVzKG5hbWUpLmxlbmd0aDtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gU3RhdHM7XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIExpbmUgPSByZXF1aXJlKCcuL2dlb21ldHJ5LmpzJykuTGluZTtcbnZhciBUcmlhbmdsZSA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5UcmlhbmdsZTtcbnZhciBQb2ludCA9IHJlcXVpcmUoJy4vZ2VvbWV0cnkuanMnKS5Qb2ludDtcbnZhciBIYXNoTWFwID0gcmVxdWlyZSgnLi9oYXNobWFwLmpzJyk7XG52YXIgU2V0TXVsdGlNYXAgPSByZXF1aXJlKCcuL2hhc2htYXAuanMnKS5TZXRNdWx0aU1hcDtcbnZhciBIYXNoU2V0ID0gcmVxdWlyZSgnLi9oYXNobWFwLmpzJykuSGFzaFNldDtcblxuZnVuY3Rpb24gVHJpYW5ndWxhdGlvbihwb2ludHMsIGNvbnN0cmFpbnRzLCByZW1vdmFibGVfY29uc3RyYWludHMpIHtcbiAgICB0aGlzLnBvaW50cyA9IHBvaW50cztcbiAgICB0aGlzLmNvbnN0cmFpbnRzID0gY29uc3RyYWludHM7XG4gICAgdmFyIHRyaWFuZ3VsYXRlZCA9IHRoaXMudHJpYW5ndWxhdGUocG9pbnRzLCB0aGlzLmNvbnN0cmFpbnRzLCByZW1vdmFibGVfY29uc3RyYWludHMpO1xuXG4gICAgdGhpcy5saW5lcyA9IHRyaWFuZ3VsYXRlZC5saW5lcztcbiAgICB0aGlzLmdyYXBoID0gdGhpcy5idWlsZF9ncmFwaCh0aGlzLmxpbmVzLCB0cmlhbmd1bGF0ZWQuZWRnZXMpO1xuXG59XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLnRyaWFuZ3VsYXRlID0gZnVuY3Rpb24ocG9pbnRzLCBjb25zdHJhaW50cywgcmVtb3ZhYmxlX2NvbnN0cmFpbnRzKSB7XG4gICAgLy9UT0RPOiBtYWtlIHRoZSB0cmlhbmd1bGF0aW9uIGRlbHVhbnVheVxuICAgIHZhciBlZGdlcyA9IG5ldyBTZXRNdWx0aU1hcCgpO1xuXG4gICAgdmFyIGxpbmVzID0gY29uc3RyYWludHMuc2xpY2UoKTtcbiAgICBmb3IodmFyIGsgPSAwOyBrIDwgY29uc3RyYWludHMubGVuZ3RoOyBrKyspIHtcbiAgICAgICAgdmFyIGwgPSBjb25zdHJhaW50c1trXTtcbiAgICAgICAgZWRnZXMucHV0KGwucDEsIGwucDIpO1xuICAgICAgICBlZGdlcy5wdXQobC5wMiwgbC5wMSk7XG4gICAgfVxuXG4gICAgLy9UT0RPOiBEbyBJIG5lZWQgdG8gYWRkIHRoZSBzb3Jyb3VuZGluZyB0byB0aGUgbGluZXMgYWhlYWQgb2YgdGltZS5cblxuXG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBwb2ludHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgZm9yICh2YXIgaiA9IGkgKyAxOyBqIDwgcG9pbnRzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB2YXIgcG9zc2libGVfbGluZSA9IG5ldyBMaW5lKHBvaW50c1tpXSwgcG9pbnRzW2pdKTtcbiAgICAgICAgICAgIHZhciB2YWxpZCA9IHRydWU7XG4gICAgICAgICAgICBpZiAoIXBvc3NpYmxlX2xpbmUuaW50ZXJzZWN0c19hbnkobGluZXMpICYmICFwb3NzaWJsZV9saW5lLmludGVyc2VjdHNfYW55KHJlbW92YWJsZV9jb25zdHJhaW50cykpIHtcbiAgICAgICAgICAgICAgICBsaW5lcy5wdXNoKHBvc3NpYmxlX2xpbmUpO1xuICAgICAgICAgICAgICAgIGVkZ2VzLnB1dChwb2ludHNbaV0sIHBvaW50c1tqXSk7XG4gICAgICAgICAgICAgICAgZWRnZXMucHV0KHBvaW50c1tqXSwgcG9pbnRzW2ldKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB7XG4gICAgICAgIGxpbmVzOiBsaW5lcyxcbiAgICAgICAgZWRnZXM6IGVkZ2VzXG4gICAgfTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmJ1aWxkX2dyYXBoID0gZnVuY3Rpb24obGluZXMsIGNvbm5lY3RzKSB7XG4gICAgdmFyIGdyYXBoID0gW107XG5cbiAgICAvL2xpbmVzIGNvdWxkIGJlIGEgc2V0LCBjb25uZWN0cyBhIGhhc2htYXBcblxuICAgIC8vVE9ETzogaW5zdGVhZCB3ZSBjYW4gZm9ybSBhIG11bHRpbWFwLCBzbyB0aGF0IGVhY2gga2V5IGlzIGEgcG9pbnQgYW5kIHRoZSB2YWx1ZXMgYXJlIHRoZVxuICAgIC8vIHBvaW50cyBpdCBjb25uZWN0cyB0b1xuICAgIC8vIGluaXRpYWxpc2Ugd2l0aCBhIHJhbmRvbSBlZGdlOiBBLEIuXG4gICAgLy8gY2hlY2tlZCA9IFtdXG4gICAgLy8gd2hpbGUgdGhlcmUgYXJlIG5vZGVzIHRvIGNoZWNrXG4gICAgLy8gICAgICB0YWtlIGEsYiA9IG5vZGVzLnBvcCgpXG4gICAgLy8gICAgICBzZXQgQUIgYXMgc2VhcmNoZWQuXG4gICAgLy8gICAgICBmaW5kIHBvaW50cyBjIGFuZCBkIHN1Y2ggdGhhdCBhIGFuZCBiIHNoYXJlIGFuIGVkZ2UuXG4gICAgLy9cbiAgICAvLyAgICAgICAgICBpZihjaGVja2VkKGNkKSkgdGhlbiB3ZSBzZXQgdGhlbSBhbmQgbmVpZ2hib3VycywgaWYgaXQncyBub3QgY2hlY2tlZCB3ZSBjcmVhdGUgYSBuZXcgdHJpYW5nbGUgYW5kIHNldCB0aGVtIG5laWdoYm91cnMuXG4gICAgLy8gICAgICBhYmMgaXMgbm93IGEgdHJpYW5nbGVcbiAgICAvLyAgICAgIFdlIG5vdyBhZGQgQUMsIEJDIHRvIHRoZSBzZWFyY2guXG4gICAgLy9cbiAgICAvL1xuXG4gICAgLy9UT0RPOiBpbiBjYXNlIG9mIGRpc2Nvbm5lY3RlZCBncmFwaHMsIHdlIHJlbW92ZSBldmVyeSBsaW5lIHdlIGNoZWNrXG4gICAgLy9UaGVuIHdlIGNhbiBjaGVjayBhdCB0aGUgZW5kIGlmIHRoZXJlIGFyZSBhbnkgbGluZXMgbGVmdCBpbiBpdCwgaWYgdGhlcmUgYXJlIHRoZW5cbiAgICAvLyB3ZSBuZWVkIHRvIG5laWdoYm9yaXNlIHRoZW0uXG5cbiAgICBsaW5lcyA9IG5ldyBIYXNoU2V0KGxpbmVzKTtcblxuICAgIC8vY29ubmVjdGl2aXR5IG1hcFxuICAgIHZhciBjaGVja2VkID0gbmV3IEhhc2hTZXQoKTtcbiAgICB2YXIgdHJpYW5nbGVzID0gbmV3IEhhc2hTZXQoKTtcbiAgICB2YXIgdHJpYW5nbGVzX2J5X2VkZ2VzID0gbmV3IFNldE11bHRpTWFwKCk7XG4gICAgdmFyIHRvX2NoZWNrID0gW2xpbmVzLmdldF9hbnkoKV07XG4gICAgLy9hZGQgYW4gZWRnZS5cbiAgICB2YXIgY29udGV4dCA9IGRvY3VtZW50LmdldEVsZW1lbnRzQnlUYWdOYW1lKFwiY2FudmFzXCIpWzBdLmdldENvbnRleHQoXCIyZFwiKTtcblxuICAgIHdoaWxlICh0b19jaGVjay5sZW5ndGggfHwgbGluZXMubGVuZ3RoKSB7XG4gICAgICAgIHZhciBjaGVja2luZztcbiAgICAgICAgaWYgKHRvX2NoZWNrLmxlbmd0aCkge1xuICAgICAgICAgICAgY2hlY2tpbmcgPSB0b19jaGVjay5wb3AoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGNoZWNraW5nID0gbGluZXMuZ2V0X2FueSgpO1xuICAgICAgICAgICAgaWYoIWNoZWNraW5nKXtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGNoZWNrZWQuYWRkKGNoZWNraW5nKTtcbiAgICAgICAgbGluZXMucmVtb3ZlKGNoZWNraW5nKTtcblxuICAgICAgICB2YXIgcDFfbmVpZ2hib3JzID0gY29ubmVjdHMuZ2V0KGNoZWNraW5nLnAxKTsgLy9hbGwgbmVpZ2hib3VycyBwMVxuICAgICAgICB2YXIgcDJfbmVpZ2hib3JzID0gY29ubmVjdHMuZ2V0KGNoZWNraW5nLnAyKTtcbiAgICAgICAgdmFyIHNoYXJlZF9wb2ludHMgPSB0aGlzLmR1cGxpY2F0ZWQocDFfbmVpZ2hib3JzLmNvbmNhdChwMl9uZWlnaGJvcnMpKTtcblxuICAgICAgICAvLyBjb25zb2xlLmxvZyhzaGFyZWRfcG9pbnRzLmxlbmd0aCk7XG5cbiAgICAgICAgdmFyIHRzID0gW107XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzaGFyZWRfcG9pbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB2YXIgcDMgPSBzaGFyZWRfcG9pbnRzW2ldO1xuICAgICAgICAgICAgdmFyIHQgPSBuZXcgVHJpYW5nbGUoY2hlY2tpbmcucDEsIGNoZWNraW5nLnAyLCBwMyk7XG4gICAgICAgICAgICB2YXIgcDFwMnAzID0gdHJpYW5nbGVzLmdldCh0KTtcblxuXG4gICAgICAgICAgICBpZiAoIXAxcDJwMykge1xuICAgICAgICAgICAgICAgIHAxcDJwMyA9IHQ7XG4gICAgICAgICAgICAgICAgdHJpYW5nbGVzLmFkZChwMXAycDMpO1xuICAgICAgICAgICAgICAgIHQuZmlsbF90cmlhbmdsZShjb250ZXh0KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2cocDFwMnAzLmdldF9jZW50ZXIoKSk7XG4gICAgICAgICAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwMXAzID0gbmV3IExpbmUoY2hlY2tpbmcucDEsIHAzKTtcblxuICAgICAgICAgICAgdHJpYW5nbGVzX2J5X2VkZ2VzLnB1dChjaGVja2luZywgdCk7XG5cbiAgICAgICAgICAgIGlmICghY2hlY2tlZC5jb250YWlucyhwMXAzKSkge1xuICAgICAgICAgICAgICAgIHRvX2NoZWNrLnB1c2gocDFwMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwMnAzID0gbmV3IExpbmUoY2hlY2tpbmcucDIsIHAzKTtcbiAgICAgICAgICAgIGlmICghY2hlY2tlZC5jb250YWlucyhwMnAzKSkge1xuICAgICAgICAgICAgICAgIHRvX2NoZWNrLnB1c2gocDJwMyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRzLnB1c2gocDFwMnAzKTtcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgLy9UT0RPOiBjb3VsZCBwcm9iYWJseSBkbyB0aGlzIGlubGluZTtcbiAgICB2YXIgdHJpYW5nbGVfYXJyID0gdHJpYW5nbGVzLnRvX2FycmF5KCk7XG4gICAgZm9yKHZhciBqID0gMDsgaiA8IHRyaWFuZ2xlX2Fyci5sZW5ndGg7IGorKykge1xuICAgICAgICB2YXIgdHJpYW5nbGUgPSB0cmlhbmdsZV9hcnJbal07XG4gICAgICAgIHZhciBuZWlnaGJzID0gdHJpYW5nbGVzX2J5X2VkZ2VzLmdldCh0cmlhbmdsZS5lZGdlc1swXSlcbiAgICAgICAgICAgIC5jb25jYXQodHJpYW5nbGVzX2J5X2VkZ2VzLmdldCh0cmlhbmdsZS5lZGdlc1sxXSlcbiAgICAgICAgICAgIC5jb25jYXQodHJpYW5nbGVzX2J5X2VkZ2VzLmdldCh0cmlhbmdsZS5lZGdlc1syXSkpKTtcblxuICAgICAgICBmb3IodmFyIGsgPSAwOyBrIDwgbmVpZ2hicy5sZW5ndGg7IGsrKykge1xuICAgICAgICAgICAgaWYoIW5laWdoYnNba10uZXF1YWxzKHRyaWFuZ2xlKSkge1xuICAgICAgICAgICAgICAgIHRyaWFuZ2xlLmFkZF9uZWlnaGJvcihuZWlnaGJzW2tdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vY29uc29sZS5sb2codHJpYW5nbGUubmVpZ2hib3JzKTtcbiAgICB9XG5cbiAgICBjb25zb2xlLmxvZyh0cmlhbmdsZXMudG9fYXJyYXkoKSk7XG5cbiAgICByZXR1cm4gdHJpYW5nbGVfYXJyO1xufTtcblxuLy8gZm9yICh2YXIgaSA9IDA7IGkgPCBsaW5lcy5sZW5ndGg7IGkrKykge1xuLy8gICAgIGZvciAodmFyIGogPSBpICsgMTsgaiA8IGxpbmVzLmxlbmd0aDsgaisrKSB7XG4vLyAgICAgICAgIGZvciAodmFyIGsgPSBqICsgMTsgayA8IGxpbmVzLmxlbmd0aDsgaysrKSB7XG4vLyAgICAgICAgICAgICB2YXIgcG9pbnRzID0gdGhpcy51bmlxdWUobGluZXNbaV0ucDEsIGxpbmVzW2ldLnAyLCBsaW5lc1tqXS5wMSwgbGluZXNbal0ucDIsIGxpbmVzW2tdLnAxLCBsaW5lc1trXS5wMik7XG4vLyAgICAgICAgICAgICBpZiAocG9pbnRzLmxlbmd0aCA9PT0gMykge1xuLy8gICAgICAgICAgICAgICAgIHZhciB0cmlhbmdsZSA9IG5ldyBUcmlhbmdsZShsaW5lc1tpXSwgbGluZXNbal0sIGxpbmVzW2tdLCBwb2ludHMpO1xuLy9cbi8vICAgICAgICAgICAgICAgICBmb3IgKHZhciBsID0gMDsgbCA8IGdyYXBoLmxlbmd0aDsgbCsrKSB7XG4vLyAgICAgICAgICAgICAgICAgICAgIGlmIChncmFwaFtsXS5pc19uZWlnaGJvcih0cmlhbmdsZSkpIHtcbi8vICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlLmFkZF9uZWlnaGJvcihncmFwaFtsXSk7XG4vLyAgICAgICAgICAgICAgICAgICAgICAgICBncmFwaFtsXS5hZGRfbmVpZ2hib3IodHJpYW5nbGUpO1xuLy8gICAgICAgICAgICAgICAgICAgICB9XG4vLyAgICAgICAgICAgICAgICAgfVxuLy8gICAgICAgICAgICAgICAgIGdyYXBoLnB1c2godHJpYW5nbGUpO1xuLy8gICAgICAgICAgICAgfVxuLy8gICAgICAgICB9XG4vLyAgICAgfVxuLy8gfVxuLy9cbi8vIHJldHVybiBncmFwaDtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUgPSBmdW5jdGlvbihwKSB7XG4gICAgLy9UT0RPOiBJIGNvdWxkIHNvcnQgdGhlIGdyYXBoIGFuZCBtYWtlIHRoaXMgZmFzdGVyLlxuXG4gICAgdmFyIG1pbl9kID0gSW5maW5pdHk7XG4gICAgdmFyIG1pbjtcblxuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGkrKykge1xuICAgICAgICB2YXIgZCA9IHRoaXMuZ3JhcGhbaV0uZ2V0X2NlbnRlcigpLmRpc3RhbmNlKHApO1xuICAgICAgICBpZiAoZCA8IG1pbl9kICYmICF0aGlzLmludGVyc2VjdHMobmV3IExpbmUocCwgdGhpcy5ncmFwaFtpXS5nZXRfY2VudGVyKCkpKSkge1xuICAgICAgICAgICAgbWluX2QgPSBkO1xuICAgICAgICAgICAgbWluID0gdGhpcy5ncmFwaFtpXTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBtaW47XG59O1xuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZmluZF9wYXRoID0gZnVuY3Rpb24oc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIC8vVE9ETzogSXQncyBub3Qgb3B0aW1hbCBiZWNhdXNlIEkgY2FuIHJlZHVjZSBwYXRocyB1c2luZyBteSBhbGdvcml0aG0sIGJ1dCBkamtzdHJhcyBkb2Vzbid0IGRvIHRoYXQuY2FuIEkgYWN0dWFsbHkgcmVkdWNlIHRoZSBncmFwaCBiZWZvcmUgSSBydW4gZGprc3RyYXM/XG4gICAgdmFyIHN0YXJ0ID0gdGhpcy5nZXRfY2xvc2VzdF90cmlhbmdsZShzdGFydF9wb2ludCk7XG4gICAgdmFyIGVuZCA9IHRoaXMuZ2V0X2Nsb3Nlc3RfdHJpYW5nbGUoZW5kX3BvaW50KTtcblxuICAgIGZvciAodmFyIGogPSAwOyBqIDwgdGhpcy5ncmFwaC5sZW5ndGg7IGorKykge1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5kO1xuICAgICAgICBkZWxldGUgdGhpcy5ncmFwaFtqXS5wcmV2O1xuICAgIH1cblxuICAgIGlmICghZW5kKSB7XG4gICAgICAgIHJldHVybiBbXTtcbiAgICB9XG5cbiAgICB2YXIgcXVldWUgPSBbc3RhcnRdO1xuICAgIHN0YXJ0LmQgPSAwO1xuICAgIHN0YXJ0Lm5vZGUgPSB1bmRlZmluZWQ7XG5cbiAgICBmdW5jdGlvbiBkaXN0YW5jZUNvbXBhcmF0b3IoYSwgYikge1xuICAgICAgICByZXR1cm4gYS5kID4gYi5kO1xuICAgIH1cblxuICAgIHdoaWxlIChxdWV1ZS5sZW5ndGgpIHtcbiAgICAgICAgdmFyIGN1cnJlbnQgPSBxdWV1ZS5zaGlmdCgpO1xuXG4gICAgICAgIGlmIChjdXJyZW50ID09PSBlbmQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbnN0cnVjdF9wYXRoKGN1cnJlbnQsIHN0YXJ0X3BvaW50LCBlbmRfcG9pbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBjdXJyZW50Lm5laWdoYm9ycy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIG5ld0QgPSBjdXJyZW50LmQgKyBjdXJyZW50Lm5laWdoYm9yc1tpXS5kaXN0YW5jZShjdXJyZW50KTtcblxuICAgICAgICAgICAgaWYgKHR5cGVvZiBjdXJyZW50Lm5laWdoYm9yc1tpXS5kID09PSAndW5kZWZpbmVkJyB8fCBuZXdEIDwgY3VycmVudC5uZWlnaGJvcnNbaV0uZCkge1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLmQgPSBuZXdEO1xuICAgICAgICAgICAgICAgIGN1cnJlbnQubmVpZ2hib3JzW2ldLnByZXYgPSBjdXJyZW50O1xuICAgICAgICAgICAgICAgIGlmIChxdWV1ZS5pbmRleE9mKGN1cnJlbnQubmVpZ2hib3JzW2ldKSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgcXVldWUucHVzaChjdXJyZW50Lm5laWdoYm9yc1tpXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcXVldWUuc29ydChkaXN0YW5jZUNvbXBhcmF0b3IpO1xuICAgIH1cblxuICAgIHJldHVybiBbXTtcbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmNvbnN0cnVjdF9wYXRoID0gZnVuY3Rpb24obm9kZSwgc3RhcnRfcG9pbnQsIGVuZF9wb2ludCkge1xuICAgIHZhciBwYXRoID0gW107XG4gICAgd2hpbGUgKG5vZGUucHJldikge1xuICAgICAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuICAgICAgICBub2RlID0gbm9kZS5wcmV2O1xuICAgIH1cbiAgICBwYXRoLnB1c2gobm9kZS5nZXRfY2VudGVyKCkpO1xuXG4gICAgcGF0aC5yZXZlcnNlKCk7XG4gICAgcGF0aC5wdXNoKGVuZF9wb2ludCk7XG4gICAgcGF0aC51bnNoaWZ0KHN0YXJ0X3BvaW50KTtcbiAgICB0aGlzLnJlZHVjZV9wYXRoKHBhdGgpO1xuXG4gICAgcmV0dXJuIHBhdGg7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS51bmlxdWUgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9fdGVzdDtcblxuICAgIGlmKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuYXBwbHkoYXJndW1lbnRzWzBdKSA9PT0gXCJbb2JqZWN0IEFycmF5XVwiKSB7XG4gICAgICAgIHRvX3Rlc3QgPSBhcmd1bWVudHNbMF07XG4gICAgfSBlbHNlIHtcbiAgICAgICAgdG9fdGVzdCA9IGFyZ3VtZW50cztcbiAgICB9XG5cbiAgICB2YXIgYXJyID0gW107XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0b190ZXN0Lmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhciBjb250YWluZWQgPSBmYWxzZTtcbiAgICAgICAgZm9yICh2YXIgaiA9IDA7IGogPCBhcnIubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmICh0b190ZXN0W2ldLmVxdWFscyhhcnJbal0pKSB7XG4gICAgICAgICAgICAgICAgY29udGFpbmVkID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoIWNvbnRhaW5lZCkge1xuICAgICAgICAgICAgYXJyLnB1c2godG9fdGVzdFtpXSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gYXJyO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZHVwbGljYXRlZCA9IGZ1bmN0aW9uKGFycikge1xuICAgIGFyci5zb3J0KCk7XG4gICAgdmFyIHZhbHMgPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGFyci5sZW5ndGggLSAxOyBpKyspIHtcbiAgICAgICAgaWYoYXJyW2ldLmVxdWFscyhhcnJbaSsxXSkpIHtcbiAgICAgICAgICAgIHZhbHMucHVzaChhcnJbaV0pO1xuICAgICAgICAgICAgaSsrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIHZhbHM7XG59O1xuXG5Ucmlhbmd1bGF0aW9uLnByb3RvdHlwZS5yZWR1Y2VfcGF0aCA9IGZ1bmN0aW9uKHBhdGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IHBhdGgubGVuZ3RoIC0gMjsgaSsrKSB7XG4gICAgICAgIGlmICghdGhpcy5pbnRlcnNlY3RzKG5ldyBMaW5lKHBhdGhbaV0sIHBhdGhbaSArIDJdKSkpIHtcbiAgICAgICAgICAgIHBhdGguc3BsaWNlKGkgKyAxLCAxKTtcbiAgICAgICAgICAgIGktLTtcbiAgICAgICAgfVxuICAgIH1cbn07XG5cblRyaWFuZ3VsYXRpb24ucHJvdG90eXBlLmludGVyc2VjdHMgPSBmdW5jdGlvbihsaW5lKSB7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCB0aGlzLmNvbnN0cmFpbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmICh0aGlzLmNvbnN0cmFpbnRzW2ldLmludGVyc2VjdHMobGluZSkpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZhbHNlO1xufTtcblxuVHJpYW5ndWxhdGlvbi5wcm90b3R5cGUuZHJhdyA9IGZ1bmN0aW9uKGNvbnRleHQpIHtcbiAgICBpZiAoQ09ORklHLkRFQlVHID4gMykge1xuICAgICAgICB0aGlzLnBvaW50cy5mb3JFYWNoKGZ1bmN0aW9uKHBvaW50KSB7XG4gICAgICAgICAgICBwb2ludC5kcmF3KGNvbnRleHQsIFwiIzU1NTVBQVwiKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5saW5lcy5mb3JFYWNoKGZ1bmN0aW9uKGxpbmUpIHtcbiAgICAgICAgICAgIGxpbmUuZHJhdyhjb250ZXh0LCBcIiM1NTU1QUFcIik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIHRoaXMuZ3JhcGguZm9yRWFjaChmdW5jdGlvbih0cmlhbmdsZSkge1xuICAgICAgICBpZiAoQ09ORklHLkRFQlVHID4gNCkge1xuICAgICAgICAgICAgdHJpYW5nbGUuZmlsbF90cmlhbmdsZShjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiAxKSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5kcmF3X2VkZ2VzKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG4gICAgdGhpcy5ncmFwaC5mb3JFYWNoKGZ1bmN0aW9uKHRyaWFuZ2xlKSB7XG4gICAgICAgIGlmIChDT05GSUcuREVCVUcgPiAwKSB7XG4gICAgICAgICAgICB0cmlhbmdsZS5kcmF3X3ZlcnRleChjb250ZXh0KTtcbiAgICAgICAgfVxuICAgIH0pO1xuICAgIHRoaXMuZ3JhcGguZm9yRWFjaChmdW5jdGlvbih0cmlhbmdsZSkge1xuICAgICAgICBpZiAoQ09ORklHLkRFQlVHID4gMikge1xuICAgICAgICAgICAgdHJpYW5nbGUuZHJhd193ZWlnaHRzKGNvbnRleHQpO1xuICAgICAgICB9XG4gICAgfSk7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRyaWFuZ3VsYXRpb247XG4iLCJcInVzZSBzdHJpY3RcIjtcblxudmFyIGdlb21ldHJ5ID0gcmVxdWlyZShcIi4uL2FwcC9qcy9nZW9tZXRyeS5qc1wiKTtcbnZhciBQb2ludCA9IGdlb21ldHJ5LlBvaW50O1xudmFyIExpbmUgPSBnZW9tZXRyeS5MaW5lO1xuXG5RVW5pdC5hc3NlcnQuaW50ZXJzZWN0cyA9IGZ1bmN0aW9uKGwxLCBsMiwgbWVzc2FnZSkge1xuICAgIHRoaXMucHVzaChsMS5pbnRlcnNlY3RzKGwyKSAmJiBsMi5pbnRlcnNlY3RzKGwxKSwgbDEudG9TdHJpbmcoKSArIFwiLS8tXCIgKyBsMi50b1N0cmluZygpLCB0cnVlLCBtZXNzYWdlKTtcbn07XG5cblFVbml0LmFzc2VydC5ub3RJbnRlcnNlY3RzID0gZnVuY3Rpb24obDEsIGwyLCBtZXNzYWdlKSB7XG4gICAgdGhpcy5wdXNoKCFsMS5pbnRlcnNlY3RzKGwyKSAmJiAhbDIuaW50ZXJzZWN0cyhsMSksIGwxLnRvU3RyaW5nKCkgKyBcIiAtLSAgLyBcIiArIGwyLnRvU3RyaW5nKCksIGZhbHNlLCBtZXNzYWdlKTtcbn07XG5cblFVbml0Lm1vZHVsZShcIlBvaW50XCIpO1xuXG5RVW5pdC50ZXN0KFwiZXF1YWxzXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIGFzc2VydC5vayhuZXcgUG9pbnQoMTAsIDEwKS5lcXVhbHMobmV3IFBvaW50KDEwLCAxMCkpKTtcbiAgICBhc3NlcnQubm90T2sobmV3IFBvaW50KDEwLCAyMCkuZXF1YWxzKG5ldyBQb2ludCgxMCwgMTApKSk7XG4gICAgYXNzZXJ0Lm5vdE9rKG5ldyBQb2ludCgyMCwgMTApLmVxdWFscyhuZXcgUG9pbnQoMTAsIDEwKSkpO1xuICAgIGFzc2VydC5ub3RPayhuZXcgUG9pbnQoMTAsIDEwKS5lcXVhbHMobmV3IFBvaW50KDIwLCAxMCkpKTtcbiAgICBhc3NlcnQubm90T2sobmV3IFBvaW50KDEwLCAxMCkuZXF1YWxzKG5ldyBQb2ludCgxMCwgMjApKSk7XG59KTtcblxuUVVuaXQudGVzdChcInN1YnRyYWN0XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwMCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAgIGFzc2VydC5vayhwMS5zdWJ0cmFjdChwMCkuZXF1YWxzKHAxKSk7XG4gICAgYXNzZXJ0Lm9rKHAxLnN1YnRyYWN0KHAxKS5lcXVhbHMocDApKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiYWRkXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwMCA9IG5ldyBQb2ludCgwLCAwKTtcblxuICAgIGFzc2VydC5vayhwMS5hZGQocDApLmVxdWFscyhwMSkpO1xuICAgIGFzc2VydC5vayhwMC5hZGQocDEpLmVxdWFscyhwMSkpO1xuXG4gICAgYXNzZXJ0Lm9rKHAwLmFkZChwMCkuZXF1YWxzKHAwKSk7XG59KTtcblxuUVVuaXQudGVzdChcImNyb3NzX3Byb2R1Y3RcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDEsIDIpO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCgzLCA0KTtcblxuICAgIGFzc2VydC5lcXVhbChwMS5jcm9zc19wcm9kdWN0KHAyKSwgLTIpO1xufSk7XG5cblFVbml0LnRlc3QoXCJkb3RfcHJvZHVjdFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMSwgMik7XG4gICAgdmFyIHAyID0gbmV3IFBvaW50KDMsIDQpO1xuXG4gICAgYXNzZXJ0LmVxdWFsKHAxLmRvdF9wcm9kdWN0KHAyKSwgMTEpO1xufSk7XG5cblFVbml0LnRlc3QoXCJzY2FsYXJfcHJvZHVjdFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgcDEgPSBuZXcgUG9pbnQoMSwgMik7XG5cbiAgICBhc3NlcnQub2socDEuc2NhbGFyX3Byb2R1Y3QoMikuZXF1YWxzKG5ldyBQb2ludCgyLCA0KSkpO1xufSk7XG5cblFVbml0Lm1vZHVsZShcIkxpbmVcIik7XG5cblFVbml0LnRlc3QoXCJlcXVhbHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCgyMCwgMjApO1xuICAgIHZhciBsMSA9IG5ldyBMaW5lKHAxLCBwMik7XG4gICAgdmFyIGwxMiA9IG5ldyBMaW5lKHAxLCBwMik7XG4gICAgdmFyIGwyID0gbmV3IExpbmUocDEsIHAzKTtcbiAgICB2YXIgbDMgPSBuZXcgTGluZShwMywgcDEpO1xuXG4gICAgYXNzZXJ0Lm9rKGwxLmVxdWFscyhsMSkpO1xuICAgIGFzc2VydC5vayhsMS5lcXVhbHMobDEyKSk7XG4gICAgYXNzZXJ0Lm9rKGwxMi5lcXVhbHMobDEpKTtcblxuICAgIGFzc2VydC5ub3RPayhsMS5lcXVhbHMobDIpKTtcbiAgICBhc3NlcnQubm90T2sobDIuZXF1YWxzKGwxKSk7XG4gICAgYXNzZXJ0Lm5vdE9rKGwxLmVxdWFscyhsMykpO1xufSk7XG5cblFVbml0LnRlc3QoXCJpbnRlcnNlY3RzXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB2YXIgcDIgPSBuZXcgUG9pbnQoMCwgMTApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCgxMCwgMTApO1xuICAgIHZhciBwNCA9IG5ldyBQb2ludCgxMCwgMCk7XG5cbiAgICB2YXIgbDEgPSBuZXcgTGluZShwMSwgcDMpO1xuICAgIHZhciBsMTIgPSBuZXcgTGluZShwMywgcDEpO1xuXG4gICAgdmFyIGwyID0gbmV3IExpbmUocDIsIHA0KTtcbiAgICB2YXIgbDMgPSBuZXcgTGluZShwMSwgcDIpO1xuICAgIHZhciBsNCA9IG5ldyBMaW5lKHA0LCBwMyk7XG5cbiAgICAvL1RPRE86IHRlc3QgbW9yZSBlbmRwb2ludCBpbnRlcnNlY3Rpb25zXG5cblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKGwxLCBsMSk7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEyLCBsMSk7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEsIGwxMik7XG5cbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMSxsMik7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMobDEyLGwyKTtcbiAgICBhc3NlcnQuaW50ZXJzZWN0cyhsMSxsMSk7XG5cbiAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhsMyxsNCk7XG5cbiAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhsMSxsMyk7XG59KTtcblxuUVVuaXQudGVzdChcImludGVyc2VjdHMgcmVhbGlzdGljXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBwMSA9IG5ldyBQb2ludCgwLCAwKTtcbiAgICB2YXIgcDIgPSBuZXcgUG9pbnQoNjAwLCAwKTtcbiAgICB2YXIgcDMgPSBuZXcgUG9pbnQoNjAwLCA2MDApO1xuICAgIHZhciBwNCA9IG5ldyBQb2ludCgwLCA2MDApO1xuXG4gICAgdmFyIHIxID0gbmV3IFBvaW50KDIwMCwgMjAwKTtcbiAgICB2YXIgcjIgPSBuZXcgUG9pbnQoNDAwLCAyMDApO1xuICAgIHZhciByMyA9IG5ldyBQb2ludCg0MDAsIDQwMCk7XG4gICAgdmFyIHI0ID0gbmV3IFBvaW50KDIwMCwgNDAwKTtcblxuICAgIHZhciByMXIzID0gbmV3IExpbmUocjEsIHIzKTtcbiAgICB2YXIgcjJyNCA9IG5ldyBMaW5lKHIyLCByNCk7XG5cbiAgICB2YXIgcjFyMiA9IG5ldyBMaW5lKHIxLCByMik7XG4gICAgdmFyIHIycjMgPSBuZXcgTGluZShyMiwgcjMpO1xuICAgIHZhciByM3I0ID0gbmV3IExpbmUocjMsIHI0KTtcbiAgICB2YXIgcjRyMSA9IG5ldyBMaW5lKHI0LCByMSk7XG5cbiAgICB2YXIgcmVlZnMgPSBbcjFyMywgcjFyMiwgcjJyMywgcjNyNCwgcjRyMV07XG5cbiAgICByZWVmcy5mb3JFYWNoKGZ1bmN0aW9uKGwxKSB7XG4gICAgICAgIHJlZWZzLmZvckVhY2goZnVuY3Rpb24obDIpIHtcbiAgICAgICAgICAgIGlmKCFsMi5lcXVhbHMobDEpKSB7XG4gICAgICAgICAgICAgICAgYXNzZXJ0Lm5vdEludGVyc2VjdHMobDEsbDIpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9KTtcblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKHIxcjMsIHIycjQpO1xufSk7XG5cblFVbml0LnRlc3QoXCJpbnRlcnNlY3RzIHJlZ3Jlc3Npb25cIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHAxID0gbmV3IFBvaW50KDAsIDApO1xuICAgIHZhciBwMiA9IG5ldyBQb2ludCg2MDAsIDApO1xuICAgIHZhciBwMyA9IG5ldyBQb2ludCg2MDAsIDYwMCk7XG4gICAgdmFyIHA0ID0gbmV3IFBvaW50KDAsIDYwMCk7XG5cbiAgICB2YXIgcjEgPSBuZXcgUG9pbnQoMjAwLCAyMDApO1xuICAgIHZhciByMiA9IG5ldyBQb2ludCg0MDAsIDIwMCk7XG4gICAgdmFyIHIzID0gbmV3IFBvaW50KDQwMCwgNDAwKTtcbiAgICB2YXIgcjQgPSBuZXcgUG9pbnQoMjAwLCA0MDApO1xuXG4gICAgdmFyIHIycjEgPSBuZXcgTGluZShyMiwgcjEpO1xuXG4gICAgdmFyIHIxcjIgPSBuZXcgTGluZShyMSwgcjIpO1xuICAgIHZhciByMnIzID0gbmV3IExpbmUocjIsIHIzKTtcbiAgICB2YXIgcjNyNCA9IG5ldyBMaW5lKHIzLCByNCk7XG4gICAgdmFyIHI0cjEgPSBuZXcgTGluZShyNCwgcjEpO1xuXG4gICAgdmFyIHAxcjEgPSBuZXcgTGluZShwMSxyMSk7XG4gICAgdmFyIHIxcjMgPSBuZXcgTGluZShyMSxyMyk7XG5cbiAgICB2YXIgcDFyMiA9IG5ldyBMaW5lKHAxLHIyKTtcbiAgICB2YXIgcDFyMyA9IG5ldyBMaW5lKHAxLHIzKTtcbiAgICB2YXIgcDJyMSA9IG5ldyBMaW5lKHAyLHIxKTtcbiAgICB2YXIgcjNwNCA9IG5ldyBMaW5lKHAyLHIxKTtcblxuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHIxcjIsIHIycjMpO1xuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHIycjMsIHIxcjIpO1xuICAgIGFzc2VydC5pbnRlcnNlY3RzKHIxcjIsIHIycjEpO1xuXG4gICAgLy9kZWJ1Z2dlcjtcbiAgICBhc3NlcnQubm90SW50ZXJzZWN0cyhwMXIxLCByMXIzKTtcblxuICAgIGFzc2VydC5pbnRlcnNlY3RzKHAxcjIsIHAycjEpO1xuICAgIGFzc2VydC5ub3RJbnRlcnNlY3RzKHAxcjEsIHIzcDQpO1xuXG4gICAgLy8gZGVidWdnZXI7XG4gICAgYXNzZXJ0LmludGVyc2VjdHMocDFyMSwgcDFyMyk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgSGFzaE1hcCA9IHJlcXVpcmUoXCIuLi9hcHAvanMvaGFzaG1hcC5qc1wiKTtcbnZhciBIYXNoU2V0ID0gcmVxdWlyZShcIi4uL2FwcC9qcy9oYXNobWFwLmpzXCIpLkhhc2hTZXQ7XG52YXIgU2V0TXVsdGlNYXAgPSByZXF1aXJlKFwiLi4vYXBwL2pzL2hhc2htYXAuanNcIikuU2V0TXVsdGlNYXA7XG5cbmZ1bmN0aW9uIE9iaihpKSB7XG4gICAgdGhpcy5pID0gaTtcbn1cblxuT2JqLnByb3RvdHlwZS5lcXVhbHMgPSBmdW5jdGlvbih4KSB7XG4gICAgcmV0dXJuIHguaSA9PT0gdGhpcy5pO1xufTtcblxuT2JqLnByb3RvdHlwZS5oYXNoQ29kZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLmk7XG59O1xuXG5RVW5pdC5tb2R1bGUoXCJIYXNoTWFwXCIpO1xuXG5cblFVbml0LnRlc3QoXCJnZXRcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIG1hcCA9IG5ldyBIYXNoTWFwKCk7XG5cbiAgICB2YXIgbyA9IG5ldyBPYmooMSk7XG4gICAgYXNzZXJ0Lm5vdE9rKG1hcC5nZXQobykpO1xuICAgIG1hcC5wdXQobywgMTApO1xuICAgIGFzc2VydC5lcXVhbChtYXAuZ2V0KG8pLCAxMCk7XG59KTtcblxuUVVuaXQudGVzdChcInJlbW92ZVwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgbWFwID0gbmV3IEhhc2hNYXAoKTtcblxuICAgIHZhciBvID0gbmV3IE9iaigxKTtcbiAgICB2YXIgbzIgPSBuZXcgT2JqKDIwKTtcbiAgICBtYXAucHV0KG8sIDEwKTtcbiAgICBtYXAucHV0KG8yLCAyMCk7XG4gICAgYXNzZXJ0LmVxdWFsKG1hcC5nZXQobyksIDEwKTtcbiAgICBhc3NlcnQuZXF1YWwobWFwLmdldChvMiksIDIwKTtcblxuICAgIG1hcC5yZW1vdmUobyk7XG5cbiAgICBhc3NlcnQubm90T2sobWFwLmdldChvKSk7XG4gICAgYXNzZXJ0LmVxdWFsKG1hcC5nZXQobzIpLCAyMCk7XG59KTtcblxuUVVuaXQudGVzdChcImdldCBsb3RzXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBtYXAgPSBuZXcgSGFzaE1hcCgpO1xuXG4gICAgZm9yKHZhciBpID0gMDsgaSA8IDEwMDsgaSsrKSB7XG4gICAgICAgIHZhciBvID0gbmV3IE9iaihpKTtcbiAgICAgICAgbWFwLnB1dChvLCBpKTtcbiAgICAgICAgYXNzZXJ0LmVxdWFsKG1hcC5nZXQobyksIGkpO1xuICAgIH1cbn0pO1xuXG5RVW5pdC5tb2R1bGUoXCJIYXNoU2V0XCIpO1xuUVVuaXQudGVzdChcImdldFwiLCBmdW5jdGlvbihhc3NlcnQpIHtcbiAgICB2YXIgc2V0ID0gbmV3IEhhc2hTZXQoKTtcblxuICAgIHZhciBvID0gbmV3IE9iaigxKTtcbiAgICBhc3NlcnQubm90T2soc2V0LmNvbnRhaW5zKG8pKTtcbiAgICBzZXQuYWRkKG8sIDEwKTtcbiAgICBhc3NlcnQub2soc2V0LmNvbnRhaW5zKG8pKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwicmVtb3ZlXCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBzZXQgPSBuZXcgSGFzaFNldCgpO1xuXG4gICAgdmFyIG8gPSBuZXcgT2JqKDEpO1xuICAgIHZhciBvMiA9IG5ldyBPYmooMjApO1xuICAgIHNldC5hZGQobyk7XG4gICAgc2V0LmFkZChvMik7XG4gICAgYXNzZXJ0Lm9rKHNldC5jb250YWlucyhvKSk7XG4gICAgYXNzZXJ0Lm9rKHNldC5jb250YWlucyhvMikpO1xuXG4gICAgc2V0LnJlbW92ZShvKTtcblxuICAgIGFzc2VydC5ub3RPayhzZXQuY29udGFpbnMobykpO1xuICAgIGFzc2VydC5vayhzZXQuY29udGFpbnMobzIpKTtcbn0pO1xuXG5RVW5pdC50ZXN0KFwiZ2V0IGxvdHNcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIHNldCA9IG5ldyBIYXNoU2V0KCk7XG5cbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgMTAwOyBpKyspIHtcbiAgICAgICAgdmFyIG8gPSBuZXcgT2JqKGkpO1xuICAgICAgICBzZXQuYWRkKG8pO1xuICAgICAgICBhc3NlcnQub2soc2V0LmNvbnRhaW5zKG8pKTtcbiAgICB9XG59KTtcblxuUVVuaXQudGVzdChcInRvX2FycmF5XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuICAgIHZhciBzZXQgPSBuZXcgSGFzaFNldCgpO1xuICAgIHZhciB0cnV0aF9hcnIgPSBbXTtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICB2YXIgbyA9IG5ldyBPYmooaSk7XG4gICAgICAgIHRydXRoX2Fyci5wdXNoKG8pO1xuICAgICAgICBzZXQuYWRkKG8pO1xuICAgIH1cblxuICAgIHZhciBhcnIgPSBzZXQudG9fYXJyYXkoKTtcbiAgICBmb3IoaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIGFzc2VydC5vayhhcnIuaW5kZXhPZih0cnV0aF9hcnJbaV0pID4gLTEpO1xuICAgIH1cblxufSk7XG5cblFVbml0LnRlc3QoXCJmcm9tX2FycmF5XCIsIGZ1bmN0aW9uKGFzc2VydCkge1xuXG4gICAgdmFyIHRydXRoX2FyciA9IFtdO1xuICAgIGZvcih2YXIgaSA9IDA7IGkgPCAxMDsgaSsrKSB7XG4gICAgICAgIHZhciBvID0gbmV3IE9iaihpKTtcbiAgICAgICAgdHJ1dGhfYXJyLnB1c2gobyk7XG4gICAgfVxuXG4gICAgdmFyIHNldCA9IG5ldyBIYXNoU2V0KHRydXRoX2Fycik7XG5cbiAgICB2YXIgYXJyID0gc2V0LnRvX2FycmF5KCk7XG4gICAgZm9yKGkgPSAwOyBpIDwgMTA7IGkrKykge1xuICAgICAgICBhc3NlcnQub2soc2V0LmNvbnRhaW5zKHRydXRoX2FycltpXSkpO1xuICAgIH1cbn0pO1xuXG5RVW5pdC5tb2R1bGUoXCJTZXRNdWx0aU1hcFwiKTtcblFVbml0LnRlc3QoXCJnZXRcIiwgZnVuY3Rpb24oYXNzZXJ0KSB7XG4gICAgdmFyIG11bHRpX21hcCA9IG5ldyBTZXRNdWx0aU1hcCgpO1xuXG4gICAgdmFyIG8gPSBuZXcgT2JqKDEpO1xuICAgIG11bHRpX21hcC5wdXQobywgMTApO1xuICAgIG11bHRpX21hcC5wdXQobywgMjApO1xuXG4gICAgdmFyIHZhbHMgPSBtdWx0aV9tYXAuZ2V0KG8pO1xuICAgIGFzc2VydC5lcXVhbCh2YWxzLmxlbmd0aCwgMik7XG4gICAgYXNzZXJ0Lm5vdEVxdWFsKHZhbHMuaW5kZXhPZigxMCksIC0xKTtcbiAgICBhc3NlcnQubm90RXF1YWwodmFscy5pbmRleE9mKDIwKSwgLTEpO1xuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5yZXF1aXJlKFwiLi9nZW9tZXRyeS5qc1wiKTtcbnJlcXVpcmUoXCIuL29jZWFuLmpzXCIpO1xucmVxdWlyZShcIi4vaGFzaG1hcC5qc1wiKTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG52YXIgT2NlYW4gPSByZXF1aXJlKFwiLi4vYXBwL2pzL29jZWFuLmpzXCIpO1xudmFyIFJlZWYgPSByZXF1aXJlKFwiLi4vYXBwL2pzL3JlZWYuanNcIik7XG52YXIgTGluZSA9IHJlcXVpcmUoXCIuLi9hcHAvanMvZ2VvbWV0cnkuanNcIikuTGluZTtcbnZhciBQb2ludCA9IHJlcXVpcmUoXCIuLi9hcHAvanMvZ2VvbWV0cnkuanNcIikuUG9pbnQ7XG5cblFVbml0LmFzc2VydC5jb250YWlucyA9IGZ1bmN0aW9uKGxpbmUsIGFyciwgbWVzc2FnZSwgdHJ1dGh5KSB7XG4gICAgdmFyIGZvdW5kID0gZmFsc2U7XG4gICAgYXJyLmZvckVhY2goZnVuY3Rpb24obCkge1xuICAgICAgICBpZihsaW5lLmVxdWFscyhsKSkge1xuICAgICAgICAgICAgZm91bmQgPSB0cnVlO1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICB0aGlzLnB1c2goZm91bmQgJiYgICF0cnV0aHksIGZvdW5kLCBsaW5lLCBtZXNzYWdlKTtcbn07XG5cblFVbml0Lm1vZHVsZShcIk9jZWFuXCIpO1xuIl19
