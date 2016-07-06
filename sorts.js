algoSteps = {
  bogo : function(list, step) {
    for(var i = 0; i < list.length; i++) {
      var randIndex = Math.floor(Math.random() * list.length);
      var temp = list[i];
      list[i] = list[randIndex];
      list[randIndex] = temp;
    }

    for(var i = 1; i < list.length; i++) {
      if(list[i] < list[i - 1]) {
          return false;
      }
    }

    return true;
  }
};


function getRandomList(n){
  var arr = []
  for(var i = 0; i < n; i++){
      arr.push(i);
  }

  for(var i = 0; i < arr.length; i++) {
    var randIndex = Math.floor(Math.random() * arr.length);
    var temp = arr[i];
    arr[i] = arr[randIndex];
    arr[randIndex] = temp;
  }

  return arr;
}

function displayNumbers(numbers, context) {
  context.clearRect(0, 0, 400, 200);
  context.font = "30px Arial";
  context.fillStyle = "#1111AA";
  context.fillText(numbers.join(" "),0,100);
}

function main() {
  var context = document.getElementById("canvas").getContext("2d");
  document.getElementById("canvas").width = 400;
  document.getElementById("canvas").height = 200;

  var currentAlgo = algoSteps.bogo;
  var list = getRandomList(5);

  displayNumbers(list, context);
  step(currentAlgo, list, context);
}

function step(currentAlgo, list, context) {

    if(!currentAlgo(list)) {
      setTimeout(step, 100, currentAlgo, list, context)
    }
    displayNumbers(list, context);
}


main();
