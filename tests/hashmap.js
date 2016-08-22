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
