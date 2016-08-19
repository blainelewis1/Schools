"use strict";

function School(ocean, target) {
    this.fish = [];
    this.ocean = ocean;
    this.target = target;
}

School.prototype.add_fish = function(fish) {
    this.fish.push(fish);
    fish.set_path(this.ocean.get_path_to(fish.pos, this.target));
};

School.prototype.set_target = function(target) {
    this.target = target;
    for(var i = 0; i < this.fish.length; i++) {
        this.fish[i].set_path(this.ocean.get_path_to(this.fish[i].pos, target));
    }
};

School.prototype.draw = function(context) {
    this.fish.forEach(function(fish) {
        fish.draw(context);
    });

    context.beginPath();
    context.lineWidth = 5;
    context.strokeStyle = "#AA3333";
    context.arc(this.target.x, this.target.y, 15, 0, Math.PI * 2);
    context.stroke();
};

module.exports = School;
