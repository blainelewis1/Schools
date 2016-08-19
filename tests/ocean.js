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
