function Line(p1, p2) {
  this.p1 = p1;
  this.p2 = p2;
}

Line.prototype.equals = function(line) {
  return (this.p1.equals(line.p1) && this.p2.equals(line.p2)) ||
         (this.p1.equals(line.p2) && this.p2.equals(line.p1));
};

Line.prototype.equals_or_intersects = function(line) {
  return this.equals(line) || this.intersects(line);
};

Line.prototype.draw = function(context, color) {
  context.strokeStyle = color || "#AAAAAA";
  context.lineWidth = 3;

  context.beginPath();
  context.moveTo(this.p1.x, this.p1.y);
  context.lineTo(this.p2.x, this.p2.y);
  context.stroke();
};

Line.prototype.toString = function() {
  return this.p1.toString() + " => " + this.p2.toString();
};

function Point(x,y) {
  this.x = x;
  this.y = y;
}

Point.prototype.toString = function() {
  return "(" + this.x + ", " + this.y + ")";
};

Point.prototype.equals = function(point) {
  return this.x === point.x && this.y === point.y;
};

Point.prototype.cross_product = function(v) {
  return this.x * v.y - this.y * v.x;
};

Point.prototype.subtract = function(v) {
  return  new Point(this.x - v.x, this.y - v.y);
};

Point.prototype.add = function(v) {
  return new Point(this.x + v.x, this.y + v.y);
};

Point.prototype.scalar_product = function(c) {
  return new Point(c * this.x, c * this.y);
};

//l1, l2
//p,r is this,

Line.prototype.intersects = function(line) {
  var p = this.p1;
  var r = this.p2;

  var q = line.p1;
  var s = line.p2;

  var q_minus_p = q.subtract(p);

  var q_minus_p_cross_s = q_minus_p.cross_product(s);
  var q_minus_p_cross_r = q_minus_p.cross_product(r);

  var r_cross_s = r.cross_product(s);

  var t = q_minus_p_cross_s / r_cross_s;
  var u = q_minus_p_cross_r / r_cross_s;

  if(r_cross_s === 0) {
    if (q_minus_p_cross_r === 0) {
    //TODO: handle rcrosss == 0 (colinear case)
      return false;
    } else {
      return false;
    }
  } else {
    if(t > 0 && t <= 1 && u > 0 && u <= 1) {
      // return p.add(r.scalar_product(t));
      return true;
    }
  }

  return false;
};

Point.prototype.draw = function(context, color) {
  context.fillStyle = color || "#AAAAAA";

  context.beginPath();
  context.arc(this.x, this.y, 10, 0, Math.PI * 2);
  context.fill();
};
