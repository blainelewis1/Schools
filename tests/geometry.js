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
