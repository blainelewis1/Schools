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
