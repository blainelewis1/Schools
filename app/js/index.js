/*global DEBUG : true */

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");
DEBUG = 5;

(function() {
    'use strict';
    var Fish = require('./fish.js');
    var Point = require('./geometry.js').Point;
    var School = require('./school.js');
    var Ocean = require('./ocean.js');
    var Reef = require('./reef.js');


    // var canvas = document.getElementById("canvas");
    // var context = canvas.getContext("2d");

    //canvas.width = 900;
    //canvas.height = 800;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;


    var ocean = new Ocean(canvas.width, canvas.height, [new Reef(200, 200, 200, 200),new Reef(800, 200, 200, 200)]);

    //TODO: more intersting spawning.
    //TODO: create your own reefs etc.
    var school = new School(ocean, new Point(500,400));
    // //school.add_fish(new Fish(0, 0, 10, 0.25));
    school.add_fish(new Fish(200, 120, 10, 0.25));
    school.add_fish(new Fish(200, 120, 10, 0.2));
    school.add_fish(new Fish(30, 300, 10, 0.5));
    //
    // //school.add_fish(new Fish(30, 0, 20, 0.1));
    school.add_fish(new Fish(130, 500, 20, 0.05));
    school.add_fish(new Fish(230, 150, 20, 0.1));
    school.add_fish(new Fish(230, 150, 20, 0.15));

    canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var p = new Point(e.clientX - rect.left, e.clientY - rect.top);
        school.set_target(p);
    }, false);

    var previous_time;
    var was_hidden = false;
    var playing = true;

    document.showing = true;

    function step(t) {
        if (playing && document.showing) {
            var time_delta = previous_time === undefined ? 0 : t - previous_time;

            if (was_hidden) {
                time_delta = 0;
                was_hidden = false;
            }

            school.fish.forEach(function(fish) {
                fish.move(time_delta, school.fish);
            });
        }

        context.clearRect(0, 0, canvas.width, canvas.height);
        school.draw(context);
        ocean.draw(context);

        previous_time = t;
        window.requestAnimationFrame(step);
    }

    document.addEventListener("visibilitychange", function(e) {
        if (document.hidden) {
            was_hidden = true;
        }
    });
    document.addEventListener("keypress", function(e) {
        if (e.keyCode === 32) {
            playing = !playing;
            e.preventDefault();
        }
    });
    step();
})();
