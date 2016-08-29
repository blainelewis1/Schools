/*global CONFIG : true */

var canvas = document.getElementsByTagName("canvas")[0];
var context = canvas.getContext("2d");
CONFIG = {};
CONFIG.DEBUG = 3;

(function() {
    'use strict';
    var Fish = require('./fish.js');
    var Point = require('./geometry.js').Point;
    var School = require('./school.js');
    var Ocean = require('./ocean.js');
    var Reef = require('./reef.js');
    var Controls = require('./controls.js');
    var Mouse = require('./mouse.js');

    var controls = new Controls();
    controls.slider("Debug: ", CONFIG, "DEBUG", 0, 10, 1);

    //debugger;
    var ocean = new Ocean(canvas.width, canvas.height, [new Reef(300, 100, 250, 200)]);

    //TODO: controllable spawning

    var school = new School(ocean, new Point(500,500));
    // school.add_fish(new Fish(200, 120, 10, 0.25));
    // school.add_fish(new Fish(200, 120, 10, 0.2));
    // school.add_fish(new Fish(30, 300, 10, 0.5));
    // school.add_fish(new Fish(130, 500, 20, 0.05));
    // school.add_fish(new Fish(230, 150, 20, 0.1));
    // school.add_fish(new Fish(230, 150, 20, 0.15));
    school.add_fish(new Fish(600, 600, 20, 0.2));

    var mouse = new Mouse(school, ocean, canvas);
    controls.radio("Mode: ", mouse, "mode", mouse.modes);

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

        ocean.draw(context);
        school.draw(context);

        mouse.draw(context);

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
