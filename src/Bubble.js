window.Bubble = (function(){
  var _ellipseDiameter = 150;
  var _strokeWeight = 10;
  var _outerDiameter = _ellipseDiameter + _strokeWeight;
  var _bounceSnd;

  function Bubble(img,sounds,strokeColor,vel){
    this.img = img;
    this.snd = new CircularArray(sounds);
    this.pos = createVector(0,0);
    this.vel = vel;
    this.rot = 0;
    this.spinPositive = true;

    var _doneSpinningListeners = [];
    this.onceDoneSpinning = function(callback){
      _doneSpinningListeners = [callback];
    }
    sounds.forEach(s => s.onended(donePlayingSound.bind(this)));

    this.draw = function(){
      push();
      translate(this.pos.x, this.pos.y);
      rotate(this.rot);
      let d = this.snd.getCurrent().isPlaying() 
        ? _ellipseDiameter * 1.5 
        : _ellipseDiameter;
      strokeWeight(_strokeWeight);
      stroke(strokeColor);
      noFill();
      ellipseMode(CENTER);
      ellipse(0, 0, d, d);
      image(this.img, -d/2, -d/2, d, d);
      pop();
    };
    
    let _activate = function(){
      let s = this.snd.getCurrent();
      if(s.isPlaying()){
        return;
      }
      if(keyIsDown(SHIFT)){
        s.reverseBuffer();
        this.spinPositive = !this.spinPositive;
      } 
      if(s.isPlaying()){
        this.rot = 0;
        s.stop();
      }
      s.setVolume(0.7);
      s.play();
    };

    function donePlayingSound(){
      console.log('done playing sound');
      _doneSpinningListeners.forEach(l => l());
      _doneSpinningListeners.splice(0);
      this.snd.next();
    }

    this.touchStarted = _activate.bind(this);
    this.touched = _activate.bind(this);

    this.impactFrom = function(impactPos){
      let funFactor = 20000;
      let impactOffset = p5.Vector.sub(impactPos, this.pos);
      let d = impactOffset.mag();
      let intensity = 1 / (d * d); //Source: https://www.nde-ed.org/EducationResources/CommunityCollege/Radiography/Physics/inversesquare.htm
      let deltaV = impactOffset.normalize().mult(intensity * funFactor);
      let inverse = createVector(-deltaV.x, -deltaV.y);
      this.vel = p5.Vector.add(this.vel, inverse);
    };

    this.containsPoint = function(x,y){
      return dist(this.pos.x, this.pos.y, x, y) <= _ellipseDiameter/2;
    };

    this.update = function(){
      this.updateRotation();
      this.updatePosition();
    };

    this.updateRotation = function(){
      if(keyIsDown(LEFT_ARROW)){
        this.rot -= 5;
      }
      if(keyIsDown(RIGHT_ARROW)){
        this.rot += 5;
      }
      if(this.snd.getCurrent().isPlaying()){
        if(this.spinPositive){
          this.rot += 10;
        } else {
          this.rot -= 10;
        }
        if(this.rot >= 360){
          this.rot = this.rot % 360;
        } else if (this.rot < 0) {
          this.rot += 360;
        }
        if(this.rot == 0){
        }
      }
    };

    function playBounceSound(){
        _bounceSnd.setVolume(0.5);
        _bounceSnd.play();
    }

    this.updatePosition = function(){
      let c = keyIsDown(32 /* SPACE */) ? 0.25 : 1;
      let ow = Bubble.diameter();

      this.pos.x += this.vel.x * c;
      let xOver = this.pos.x + ow/2 - width;
      if(xOver > 0){
        this.vel.x = -this.vel.x;
        this.pos.x -= (xOver + 1);
        playBounceSound()
      } else {
        let xUnder = this.pos.x - ow/2;
        if(xUnder < 0){
          this.vel.x = -this.vel.x;
          this.pos.x -= (xUnder - 1);
          playBounceSound()
        }
      }

      this.pos.y += this.vel.y * c;
      let yOver = this.pos.y + ow/2 - height;
      if(yOver >= 0){
        this.vel.y = -this.vel.y;
        this.pos.y -= (yOver + 1);
        playBounceSound()
      } else {
        let yUnder = this.pos.y - ow/2;
        if(yUnder < 0){
          this.vel.y = -this.vel.y;
          this.pos.y -= (yUnder - 1);
          playBounceSound()
        }
      }
    };
  }

  Bubble.diameter = function(){
    return _outerDiameter;
  };

  Bubble.setup = function(bounceSound){
    _bounceSnd = bounceSound;
  }

  return Bubble;
})();