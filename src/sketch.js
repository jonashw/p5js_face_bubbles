
/*jshint esversion: 6 */
var bubbles = [];
var backgrounds = [];
var bg;
var playing = false;
var touchColor;
var arrangements = [];
function setup() {
  colorMode(HSL, 255, 255, 255, 100);
  touchColor = color(0,0,0,50);
  bg = new Background((() => {
    var _hues = [];
    for(var h=0;h<256;h++){
      _hues.push(color(h,255,148));
    }
    return _hues;
  })());
  angleMode(DEGREES);
  createCanvas(windowWidth, windowHeight);
  var w = 150;
  var p = 100;
  Bubble.setup();
  var mildVelocity = function(v){
    return v.normalize().mult(0.5);
  };
  bubbles = [
    new Bubble(
      loadImage("../assets/sawyer1.png"),
      [
        loadSound("../assets/sounds/voice-prompts-greetings-greetings-child-boy-hi-human-voice-speaking-2.mp3"),
        loadSound("../assets/sounds/other-human-girl-laughs-4-times-faster-and-higher-nightingale-music-productions-12449.mp3"),
        loadSound("../assets/sounds/voice-prompts-pain-pain-child-girl-ouch-human-voice.mp3")
      ],
      color(170,255,148),
      mildVelocity(createVector(4,0)),
      w),
    new Bubble(loadImage("../assets/mama1.png"),
      [
        //"mama-hello-1.wav",
        //"mama-hello-2.wav",
        "mama-hi-1.wav",
        //"mama-hi-2.wav",
        //"mama-i-love-you.wav",
        "mama-buh-bye.wav"
      ].map(fn => loadSound("../assets/sounds/" + fn)),
      color(238,255,148),
      mildVelocity(createVector(2,2)),
      w),
    new Bubble(loadImage("../assets/papa1.png"),
      [
        "papa-hi-1.wav",
        "papa-buh-bye-1.wav"
      ].map(fn => loadSound("../assets/sounds/" + fn)),
      color(102,55,148),
      mildVelocity(createVector(2,-2)),
      w),
    new Bubble(loadImage("../assets/maizy1.png"),
      [
        loadSound("../assets/sounds/domestic-animals-dog-bark-jackrussel-chihuahua-fienup-008.mp3"),
        //loadSound("../assets/sounds/speech-girl-says-huh-as-if-unsure-higher-nightingale-music-productions-12446.mp3")
      ],
      color(43,255,148),
      mildVelocity(createVector(3,1)),
      w),
    new Bubble(loadImage("../assets/cooper1.png"),
      [loadSound("../assets/sounds/dogs-dog-bark-springer-spaniel-1.mp3")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w),
    new Bubble(loadImage("../assets/fetus1.png"),
      [loadSound("../assets/sounds/fetus-1.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w),
    new Bubble(loadImage("../assets/pasta1.png"),
      [loadSound("../assets/sounds/pasta-1.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w),
    new Bubble(loadImage("../assets/water3.png"),
      [loadSound("../assets/sounds/water-1.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w),
    new Bubble(loadImage("../assets/salsa2.png"),
      [loadSound("../assets/sounds/salsa-1.wav")],
      color(43,255,148),
      mildVelocity(createVector(-1.5,2.5)),
      w)
    ];

  arrangements = [
    (count, size) => {
      var w = width - size;
      var h = height - size;
      return range(1,count).map(n => createVector(
        n*w/count - size/2,
        n*h/count));
    },
    (count,size) => {
      var w = width - size;
      var h = height - size;
      var dy = h/count;
      var xs = range(1,count).map(n => n*w/count - size/2);
      var ys = range(count,1).map(n => n*h/count);
      return zipWith(xs, ys, createVector);
    },
    (count,size) => {
      return chevronArrangement(count,size,true);
    },
    (count,size) => {
      return chevronArrangement(count,size,false);
    },
    (count, size) => {
      var p = 100;
      var px = width / count;
      var py = height / count;
      return [
        //This arrangement assumes count == 5 .
        createVector(width / 2  , height / 2),
        createVector(px         , py),
        createVector(width - px , py),
        createVector(px         , height - py),
        createVector(width - px , height - py)
      ];
    },
  ];

  applyArrangement(arrangements[0]);

  function chevronArrangement(count,size,positive){
    var w = width - size;
    var h = height - size;
    var xs = range(1,count).map(n => n*w/count - size/2);
    var half = Math.floor(count / 2);
    var rows = count % 2 == 0 ? half : half + 1;
    var _ys1 = range(1,half+1).map(n => {
      var yy = n * h / rows - size/2
      return positive ? yy : height - yy;
    });
    var _ys2 = _ys1.slice(0,-1).reverse();
    if(count % 2 == 0){
      _ys1.pop();
    }
    var ys = Array.prototype.concat.call([], _ys1, _ys2);
    return zipWith(xs, ys, createVector);
  }
}

function applyArrangement(arrangement){
  zip(bubbles, arrangement(bubbles.length,150)).forEach(pair => pair[0].pos = pair[1]);
}

function draw() {
  update();
  bg.draw();
  bubbles.forEach(function(b){ b.draw(); });
  touches.forEach(t => {
    noStroke();
    fill(touchColor);
    ellipse(t.x, t.y, 200, 200);
  });
}

function update(){
  bg.update();
  bubbles.forEach(function(b){ b.updateRotation(); });
  if(!playing){
    return;
  }
  bubbles.forEach(function(b){ b.updatePosition(); });
}

function touchStarted(){
  var lastTouch = touches.slice().pop();
  handlePointAction(createVector(lastTouch.x, lastTouch.y));
  return false; // This is to prevent pinch-zooming on touch devices.
}

function mousePressed(){
  handlePointAction(createVector(mouseX,mouseY));
  return false;
}

function handlePointAction(point){
  let touchedBubble = bubbles.filter(b => b.containsPoint(point.x,point.y)).reverse()[0];
  if(!!touchedBubble)
  {
    touchedBubble.touched();
    var index = bubbles.indexOf(touchedBubble);
    bubbles.splice(index,1);
    bubbles.push(touchedBubble);
    touchedBubble.onceDoneSpinning(() => {
      //Early-drawn bubbles may be covered up partially by later-drawn bubbles.
      //When a bubble is touched it should move down to "z-index" 0, so to speak, so other bubbles may be better exposed to touch
      var index = bubbles.indexOf(touchedBubble);
      bubbles.splice(index,1);
      bubbles.unshift(touchedBubble);
    });
  } else {
    bubbles.forEach(b => b.impactFrom(point))
  }
}

function keyPressed(){
  if(49 <= keyCode && keyCode <= (49 + 9)){
    var index = keyCode - 49;
    if(index < arrangements.length){
      applyArrangement(arrangements[index]);
    }
  }
  if(keyCode == 78 /* N */){
    bubbles.forEach(b => b.vel = b.vel.normalize());
  }
  let boostFactor = 1.25;
  if(keyCode == ESCAPE){
    playing = !playing;
  }
  if(keyCode == ENTER){
    fullscreen(!fullscreen());
  }
  if(keyCode == UP_ARROW){
    bubbles.forEach(function(b){ b.vel = b.vel.mult(boostFactor); })
  }
  if(keyCode == DOWN_ARROW){
    bubbles.forEach(function(b){ b.vel = b.vel.div(boostFactor); })
  }
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}