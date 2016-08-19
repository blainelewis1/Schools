/*global CONFIG : true */

var canvas = document.getElementsByTagName("canvas")[0];
var context = canvas.getContext("2d");
CONFIG = {};
CONFIG.DEBUG = 5;

(function() {
    'use strict';
    var Fish = require('./fish.js');
    var Point = require('./geometry.js').Point;
    var School = require('./school.js');
    var Ocean = require('./ocean.js');
    var Reef = require('./reef.js');
    var Controls = require('./controls.js');

    var mouse = {mode : "target",
                 modes : ["target", "create", "delete"]};

    var controls = new Controls();
    controls.slider("Debug: ", CONFIG, "DEBUG", 0, 10, 1);
    controls.radio("Mode: ", mouse, "mode", mouse.modes);

    var ocean = new Ocean(canvas.width, canvas.height, [new Reef(200, 200, 200, 200),new Reef(800, 200, 200, 200)]);

    //TODO: controllable spawning
    //TODO: animation while drawing a rectagle

    var school = new School(ocean, new Point(500,400));
    school.add_fish(new Fish(200, 120, 10, 0.25));
    school.add_fish(new Fish(200, 120, 10, 0.2));
    school.add_fish(new Fish(30, 300, 10, 0.5));
    school.add_fish(new Fish(130, 500, 20, 0.05));
    school.add_fish(new Fish(230, 150, 20, 0.1));
    school.add_fish(new Fish(230, 150, 20, 0.15));

    mouse.target = function(p) {
        school.set_target(p);
    };

    mouse.delete = function(p) {
        //TODO: find if the click is inside a reef, delete and retriangulate if so.
        var reef = ocean.get_reef_under_point(p);
        if(reef) {
            ocean.delete_reef(reef);
        }
    };

    //TODO: time things (then use reverse watchables to display the times.)
    //TODO: create reverse watchable variables, return a function from controls, when the funciton is called it uses a closure to update the value and gets the value
    //TODO: bug where point1 isn't reset on changing modes
    mouse.create = function(p2) {
        if(!mouse.p1) {
            mouse.p1 = p2;
        } else {
            //TODO: either deal with overlapping reefs or don't allow them.
            var top_left = new Point(Math.min(mouse.p1.x, p2.x), Math.min(mouse.p1.y, p2.y));
            var bottom_right = new Point(Math.max(mouse.p1.x, p2.x), Math.max(mouse.p1.y, p2.y));
            var dimens = bottom_right.subtract(top_left);
            ocean.add_reef(new Reef(top_left.x, top_left.y, dimens.x, dimens.y));

            delete mouse.p1;
        }

    };

    canvas.addEventListener('click', function(e) {
        var rect = canvas.getBoundingClientRect();
        var p = new Point(e.clientX - rect.left, e.clientY - rect.top);
        mouse[mouse.mode](p);
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
    
        ocean.draw(context);
        school.draw(context);

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
