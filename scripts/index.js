Fish = function(x, y, radius, speed) {
  this.x = x;
  this.y = y;
  this.rotation = Math.PI / 2;
  this.speed = speed;
  this.rotationSpeed = speed / 100; //TODO: small ones shoud be able to turn wayyy faster.
  this.radius = radius;
};

Fish.prototype.setTarget = function(target) {
  this.target = target;
};

Fish.prototype.distanceBetweenFish = function(fish) {
  return Math.sqrt((fish.x - this.x) * (fish.x - this.x) + (fish.y - this.y) * (fish.y - this.y)) - this.radius - fish.radius;
};

Fish.prototype.move = function(deltaTime, collidables) {
  if(this.target === undefined) {
    return;
  }

  var maxDeltaVelocity;
  //Test all collisions. then set our maxDeltaVelocity to the minimum distance between two fish, then take the smaller one of the two.
  collidables.forEach(function(collidable) {
    var dist = collidable.distanceBetweenFish(this);
    console.log(dist);
    if(dist !== 0 || !maxDeltaVelocity) {
      maxDeltaVelocity = Math.min(dist, maxDeltaVelocity);
    }
  }.bind(this));

  console.log(maxDeltaVelocity);

  var deltaVelocity = Math.min(this.speed * deltaTime, maxDeltaVelocity);

  //rotate towards target, then move towards it.
  this.x += Math.cos(this.rotation) * deltaVelocity;
  this.y += Math.sin(this.rotation) * deltaVelocity;

  var desiredAngle = Math.atan2(this.target.y - this.y, this.target.x - this.x);

  var CWdist = (((desiredAngle - this.rotation) % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);
  var CCWdist = (((this.rotation - desiredAngle) % (Math.PI * 2)) + (Math.PI * 2)) % (Math.PI * 2);

  var deltaRotation = this.rotationSpeed * deltaTime;

  if(CWdist < deltaRotation || CCWdist < deltaRotation) {
    this.rotation = desiredAngle;
  } else if(CWdist > CCWdist) {
    this.rotation -= deltaRotation;
  } else {
    this.rotation += deltaRotation;
  }

  this.rotation %= Math.PI * 2;
};

Fish.prototype.draw = function(context) {
  context.lineWidth = 2;
  context.strokeStyle = "#000000";

  context.beginPath();
  context.arc(this.x, this.y, this.radius, 0, Math.PI*2);
  context.fill();

  context.beginPath();
  context.moveTo(this.x, this.y);
  context.lineTo(this.x + Math.cos(this.rotation) * this.radius * 1.5, this.y + Math.sin(this.rotation) * this.radius * 1.5);
  context.stroke();
};

School = function() {
  this.fish = [];
  this.target = {x : 0, y : 0};
};

School.prototype.addFish = function(fish) {
  this.fish.push(fish);
  console.log(this.fish);
  fish.setTarget(this.target);
};

School.prototype.setTarget = function(target) {
  this.target = target;
  this.fish.forEach(function(fish) {
    fish.setTarget(target);
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

//Goal, create fish that swim together towards a random point.
//fish can move and rotate at a certain rate etc.
//Fish cannot collide with one another.

//TODO: more intersting spawning.

var school = new School();
school.addFish(new Fish(0, 0, 10, 1.5));
school.addFish(new Fish(25, 10, 20, 1));
//school.addFish(new Fish(40, 10, 5, 1.75));

var canvas = document.getElementById("canvas");
var context = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

canvas.addEventListener('click', function(e) {
  var rect = canvas.getBoundingClientRect();

  school.setTarget({
      x : e.clientX - rect.left,
      y : e.clientY - rect.top})
  ;
 }, false);

school.setTarget({x : 600, y : 600});

var previousTime;
var playing = false;

function step(t) {
  if(playing) {
    var timeDelta = previousTime === undefined ? 0 : t - previousTime;

    school.fish.forEach(function(fish) {
      fish.move(timeDelta, school.fish);
    });
  }

  context.clearRect(0, 0, canvas.width, canvas.height);
  school.draw(context);

  previousTime = t;
  window.requestAnimationFrame(step);
}

document.addEventListener("keypress", function(e) {
  if(e.keyCode === 32) {
    playing = !playing;
    e.preventDefault();
  }
},false);
step();
