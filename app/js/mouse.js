"use strict";

var Ocean = require('./ocean.js');
var Point = require('./geometry.js').Point;
var Reef = require('./reef.js');

function Mouse(school, ocean, canvas) {
    this.school = school;
    this.ocean = ocean;
    this.mode = "target";
    this.modes = ["target", "create", "delete"];
    this.p = new Point(0, 0);

    canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var p = new Point(e.clientX - rect.left, e.clientY - rect.top);
        this[this.mode](p);
    }.bind(this), false);

    canvas.addEventListener("mousemove", function(e) {
        var rect = canvas.getBoundingClientRect();
        this.p = new Point(e.clientX - rect.left, e.clientY - rect.top);
    }.bind(this));
}

Mouse.prototype.target = function(p) {
    this.school.set_target(p);
};

Mouse.prototype.delete = function(p) {
    var reef = this.ocean.get_reef_under_point(p);
    if (reef) {
        this.ocean.delete_reef(reef);
    }
};

Mouse.prototype.draw = function(context) {
    if (this.mode === "create" && this.p1) {
        //TODO: Create a function out of this.
        var top_left = new Point(Math.min(this.p1.x, this.p.x), Math.min(this.p1.y, this.p.y));
        var bottom_right = new Point(Math.max(this.p1.x, this.p.x), Math.max(this.p1.y, this.p.y));
        var dimens = bottom_right.subtract(top_left);
        context.fillStyle = 'rgba(100,100,100,0.5)';
        context.fillRect(top_left.x, top_left.y, dimens.x, dimens.y);
    }
};

//TODO: create reverse watchable variables, return a function from controls, when the funciton is called it uses a closure to update the value and gets the value
//TODO: bug where point1 isn't reset on changing modes
Mouse.prototype.create = function(p2) {
    if (!this.p1) {
        this.p1 = p2;
    } else {
        //TODO: either deal with overlapping reefs or don't allow them.
        var top_left = new Point(Math.min(this.p1.x, p2.x), Math.min(this.p1.y, p2.y));
        var bottom_right = new Point(Math.max(this.p1.x, p2.x), Math.max(this.p1.y, p2.y));
        var dimens = bottom_right.subtract(top_left);
        this.ocean.add_reef(new Reef(top_left.x, top_left.y, dimens.x, dimens.y));

        delete this.p1;
    }

};

module.exports = Mouse;
