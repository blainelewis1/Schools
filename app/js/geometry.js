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
