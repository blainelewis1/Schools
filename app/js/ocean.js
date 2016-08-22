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
