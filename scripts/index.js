function Fish(x, y, radius, speed) {
  this.x = x;
  this.y = y;
  this.rotation = Math.PI / 2;
  this.speed = speed;
  this.rotation_speed = speed / 100; //TODO: small ones shoud be able to turn wayyy faster.
  this.radius = radius;
  this.colliding = false;
}

Fish.prototype.set_target = function(target) {
  this.target = target;
};

Fish.prototype.distance_between_fish = function(fish) {
  return Math.sqrt((fish.x - this.x) * (fish.x - this.x) + (fish.y - this.y) * (fish.y - this.y)) - this.radius - fish.radius;
};

Fish.prototype.move = function(delta_time, collidables) {
  if(this.target === undefined) {
    return;
  }

  var delta_velocity = this.speed * delta_time;

  //rotate towards target, then move towards it.
  this.x += Math.cos(this.rotation) * delta_velocity;
  this.y += Math.sin(this.rotation) * delta_velocity;

  //Trace a ray to each and test if we'd be touching any of them after moving.

  collidables.forEach(function (collidable) {
      this.colliding = collidable.distance_between_fish(this) <= 0 && collidable !== this;
  }.bind(this));


  var desired_angle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

  var cw_dist = (((desired_angle - this.rotation) % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
  var ccw_dist = (((this.rotation - desired_angle) % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

  var delta_rotation = this.rotation_speed * delta_time;

  if(cw_dist < delta_rotation || ccw_dist < delta_rotation) {
    this.rotation = desired_angle;
  } else if(cw_dist > ccw_dist) {
    this.rotation -= delta_rotation;
  } else {
    this.rotation += delta_rotation;
  }

  this.rotation %= Math.PI * 2;
};

Fish.prototype.draw = function(context) {
  context.lineWidth = 2;
  context.strokeStyle = "#000000";
  context.fillStyle = this.colliding ? "#AA7777" : "#AAAAAA";

  context.beginPath();
  context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
  context.fill();

  context.beginPath();
  context.moveTo(this.x, this.y);
  context.lineTo(this.x + Math.cos(this.rotation) * this.radius * 1.5, this.y + Math.sin(this.rotation) * this.radius * 1.5);
  context.stroke();
};

function School() {
  this.fish = [];
  this.target = {x : 0, y : 0};
}

School.prototype.add_fish = function(fish) {
  this.fish.push(fish);
  fish.set_target(this.target);
};

School.prototype.set_target = function(target) {
  this.target = target;
  this.fish.forEach(function(fish) {
    fish.set_target(target);
  });
};

School.prototype.draw = function(context) {
  this.fish.forEach(function(fish) {
    fish.draw(context);
  });

  context.beginPath();
  context.lineWidth = 5;
  context.strokeStyle = "#AA3333";
  context.arc(this.target.x, this.target.y, 15, 0, Math.PI*2);
  context.stroke();
};

function Ocean(width, height) {
  this.reefs = [];
  this.width = width;
  this.height = height;
}

function contains(arr, func) {
  for(var i = 0; i < arr.length; i++){
    if(func(arr[i])){
      return true;
    }
  }

  return false;
}

Ocean.prototype.triangulate = function() {
  //get the initial lines. then loop through the points and attempt to add a line until we've tried all of them.
  //Could we use sortedness? Then we only add points in a clockwise order.
  var lines = this.get_lines();

  this.get_points().forEach(function(p) {
    this.get_points().forEach(function(p2) {
      if(!p.equals(p2)) {
        var l = new Line(p, p2);
        var valid = true;
        for(var i = 0; i < lines.length; i++) {
          if(l.equals_or_intersects(lines[i])) {
            valid = false;
            break;
          }
        }

        if(valid) {
          lines.push(l);
        }
      }
    });
  }.bind(this));
  this.lines = lines;
};

Ocean.prototype.get_points = function() {
  var points = new Reef(0, 0, this.width, this.height).get_points();

  this.reefs.forEach(function(reef) {
    var ps = reef.get_points();
    for(var i = 0; i < ps.length; i++) {
        points.push(ps[i]);
    }
  });

  return points;
};

Ocean.prototype.get_lines = function() {
  var lines = new Reef(0, 0, this.width, this.height).get_lines();

  this.reefs.forEach(function(reef) {
    var ls = reef.get_lines();
    for(var i = 0; i < ls.length; i++) {
        lines.push(ls[i]);
    }
    lines.push(reef.get_diagonal());
  });

  return lines;
};

Ocean.prototype.add_reef = function(reef) {
  this.reefs.push(reef);
};

Ocean.prototype.draw = function(context) {
  this.reefs.forEach(function(reef) {
    reef.draw(context);
  });

  this.get_points().forEach(function(point) {
    point.draw(context, "#5555AA");
  });

  this.lines.forEach(function(line) {
    line.draw(context, "#5555AA");
  });
};

function Reef(x, y, width, height) {
  this.x = x;
  this.y = y;
  this.width = width;
  this.height = height;
}

Reef.prototype.draw = function(context) {
  context.fillStyle = "#AA5555";
  context.beginPath();
  context.fillRect(this.x, this.y, this.width, this.height);
};

Reef.prototype.get_points = function() {
  return [new Point(this.x, this.y),  new Point(this.x, this.y + this.height), new Point(this.x + this.width, this.y + this.height), new Point(this.x + this.width, this.y + 0)];
};

Reef.prototype.get_lines = function() {
  var points = this.get_points();

  return [new Line(points[0], points[1]), new Line(points[1], points[2]), new Line(points[2], points[3]), new Line(points[3], points[0])];
};

Reef.prototype.get_diagonal = function() {
  var points = this.get_points();

  return new Line(points[0], points[2]);
};

//Goal, create fish that swim together towards a random point.
//fish can move and rotate at a certain rate etc.
//Fish cannot collide with one another.

//TODO: more intersting spawning.

var school = new School();
school.add_fish(new Fish(0, 0, 10, 0.25));
school.add_fish(new Fish(200, 120, 10, 0.25));
school.add_fish(new Fish(30, 300, 10, 0.25));

school.add_fish(new Fish(30, 0, 20, 0.1));
school.add_fish(new Fish(130, 500, 20, 0.1));
school.add_fish(new Fish(230, 150, 20, 0.1));

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

var ocean = new Ocean(canvas.width, canvas.height);
ocean.add_reef(new Reef(200, 200, 200, 200));
//ocean.lines = ocean.get_lines();
//ocean.triangulate();

canvas.addEventListener('click', function(e) {
  var rect = canvas.getBoundingClientRect();

  school.set_target({
      x : e.clientX - rect.left,
      y : e.clientY - rect.top})
  ;
 }, false);

school.set_target({x : 600, y : 600});

var previous_time;
var playing = true;

function step(t) {
  if(playing) {
    var time_delta = previous_time === undefined ? 0 : t - previous_time;

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

document.addEventListener("keypress", function(e) {
  if(e.keyCode === 32) {
    playing = !playing;
    e.preventDefault();
  }
});
//step();


lb = new Line(new Point(400,400), new Point(400,200));
l = new Line(new Point(200,200), new Point(1280, 381));
l.draw(context);
lb.draw(context);
//console.log(l.equals_or_intersects(lb));
l.equals_or_intersects(lb).draw(context);
