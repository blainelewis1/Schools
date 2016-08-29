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
