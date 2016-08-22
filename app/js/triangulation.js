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
