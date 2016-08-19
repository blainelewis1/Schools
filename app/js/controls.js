'use strict';
/*jshint browser : true*/

function Controls() {
    this.load_style();

    this.control_div();
    var canvas = document.getElementsByTagName("canvas")[0];
    this.canvas_div().appendChild(canvas);

    canvas.style.width ='100%';
    canvas.style.height='100%';
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
}

Controls.prototype.control_div = function () {
    this.div = document.createElement("div");
    this.div.setAttribute("class", "controls");
    this.div.style.right = "0";
    this.div.style.width = "19%";
    this.div.style.height = "100%";
    this.div.style.float = "right";
    document.getElementsByTagName("body")[0].appendChild(this.div);
};

Controls.prototype.canvas_div = function () {
    var canvas_div = document.createElement("div");
    canvas_div.setAttribute("class", "canvas-container");
    canvas_div.style.position = "absolute";
    canvas_div.style.width = "80%";
    canvas_div.style.height = "100%";
    canvas_div.style.float = "left";

    document.getElementsByTagName("body")[0].appendChild(canvas_div);

    return canvas_div;
};

Controls.prototype.load_style = function() {
    var link = document.createElement("link");
    link.href = "style/controls.css";
    link.rel = "stylesheet";
    link.type = "text/css";
    document.getElementsByTagName("head")[0].appendChild(link);
};

Controls.prototype.add_control = function(control) {
    this.div.appendChild(control);
};

Controls.prototype.button = function(text, click) {
    var input = document.createElement("input");
    input.type = "button";
    input.value = text;
    input.addEventListener("click", click);

    this.add_control(input);
};

Controls.prototype.slider = function(text, obj, prop, min, max, step) {
    var label = document.createElement("label");
    label.innerHTML = text;

    var input = document.createElement("input");
    input.type = "range";
    input.min = min;
    input.max = max;
    input.step = step;
    input.value = obj[prop];

    input.addEventListener("input", function(e) {
        console.log(e.target.value);
        obj[prop] = e.target.value;
    });

    var div = document.createElement("div");
    div.appendChild(label);
    label.appendChild(input);

    this.add_control(div);
};

Controls.prototype.radio = function(text, obj, prop, values, value) {
    var div = document.createElement("div");

    var label = document.createElement("label");
    label.innerHTML = text;
    div.appendChild(label);

    function update(e) {
        obj[prop] = e.target.value;
        console.log(obj);
    }

    for(var i = 0; i < values.length; i++) {
        document.createElement("label");
        var radioLabel = document.createElement("label");
        radioLabel.innerHTML = values[i];
        div.appendChild(radioLabel);

        var input = document.createElement("input");
        input.type = "radio";
        input.name = prop;
        input.value = values[i];
        input.checked = values[i] === obj[prop];
        input.addEventListener("change", update);

        radioLabel.appendChild(input);
    }


    this.add_control(div);
};


module.exports = Controls;
