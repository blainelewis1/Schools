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
