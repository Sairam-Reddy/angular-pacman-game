const NONE = 4;
const UP = 3;
const LEFT = 2;
const DOWN = 1;
const RIGHT = 11;
const WAITING = 5;
const PAUSE = 6;
const PLAYING = 7;
const COUNTDOWN = 8;
const EATEN_PAUSE = 9;
const DYING = 10;

export class Pacman {
  // public FPS;
  // public Ghost;

  public state = WAITING;
  public audio = null;
  public ghosts = [];
  public ghostSpecs = ['#00FFDE', '#FF0000', '#FFB8DE', '#FFB847'];
  public eatenCount = 0;
  public level = 0;
  public tick = 0;
  public ghostPos;
  public userPos;
  public stateChanged = true;
  public timerStart = null;
  public lastTime = 0;
  public ctx = null;
  public timer = null;
  public map = null;
  public user = null;
  public stored = null;

  public constructor() {}

  public getTick() {
    return this.tick;
  }

  public drawScore(text, position) {
    this.ctx.fillStyle = '#FFFFFF';
    this.ctx.font = '12px BDCartoonShoutRegular';
    this.ctx.fillText(
      text,
      (position['new']['x'] / 10) * this.map.blockSize,
      ((position['new']['y'] + 5) / 10) * this.map.blockSize
    );
  }

  public dialog(text) {
    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '18px Calibri';
    var width = this.ctx.measureText(text).width,
      x = (this.map.width * this.map.blockSize - width) / 2;
    this.ctx.fillText(text, x, this.map.height * 10 + 8);
  }

  public soundDisabled() {
    return localStorage['soundDisabled'] === 'true';
  }

  public startLevel() {
    this.user.resetPosition();
    for (var i = 0; i < this.ghosts.length; i += 1) {
      this.ghosts[i].reset();
    }
    this.audio.play('start');
    this.timerStart = this.tick;
    this.setState(COUNTDOWN);
  }

  public startNewGame() {
    this.setState(WAITING);
    this.level = 1;
    this.user.reset();
    this.map.reset();
    this.map.draw(this.ctx);
    this.startLevel();
  }

  public keyDown(e) {
    if (e.keyCode === KEY.N) {
      this.startNewGame();
    } else if (e.keyCode === KEY.S) {
      this.audio.disableSound();
      localStorage['soundDisabled'] = !this.soundDisabled();
    } else if (e.keyCode === KEY.P && this.state === PAUSE) {
      this.audio.resume();
      this.map.draw(this.ctx);
      this.setState(this.stored);
    } else if (e.keyCode === KEY.P) {
      this.stored = this.state;
      this.setState(PAUSE);
      this.audio.pause();
      this.map.draw(ctx);
      this.dialog('Paused');
    } else if (this.state !== PAUSE) {
      return this.user.keyDown(e);
    }
    return true;
  }

  public loseLife() {
    this.setState(WAITING);
    this.user.loseLife();
    if (this.user.getLives() > 0) {
      this.startLevel();
    }
  }

  public setState(nState) {
    this.state = nState;
    this.stateChanged = true;
  }

  public collided(user, ghost) {
    return (
      Math.sqrt(Math.pow(ghost.x - user.x, 2) + Math.pow(ghost.y - user.y, 2)) <
      10
    );
  }

  public drawFooter() {
    var topLeft = this.map.height * this.map.blockSize,
      textBase = topLeft + 17;

    this.ctx.fillStyle = '#000000';
    this.ctx.fillRect(0, topLeft, this.map.width * this.map.blockSize, 30);

    this.ctx.fillStyle = '#FFFF00';

    for (var i = 0, len = this.user.getLives(); i < len; i++) {
      this.ctx.fillStyle = '#FFFF00';
      this.ctx.beginPath();
      this.ctx.moveTo(
        150 + 25 * i + this.map.blockSize / 2,
        topLeft + 1 + this.map.blockSize / 2
      );

      this.ctx.arc(
        150 + 25 * i + this.map.blockSize / 2,
        topLeft + 1 + this.map.blockSize / 2,
        this.map.blockSize / 2,
        Math.PI * 0.25,
        Math.PI * 1.75,
        false
      );
      this.ctx.fill();
    }

    this.ctx.fillStyle = !this.soundDisabled() ? '#00FF00' : '#FF0000';
    this.ctx.font = 'bold 16px sans-serif';
    //ctx.fillText("♪", 10, textBase);
    this.ctx.fillText('s', 10, textBase);

    this.ctx.fillStyle = '#FFFF00';
    this.ctx.font = '14px Calibri';
    this.ctx.fillText('Score: ' + this.user.theScore(), 30, textBase);
    this.ctx.fillText('Level: ' + this.level, 260, textBase);
  }

  public redrawBlock(pos) {
    this.map.drawBlock(
      Math.floor(pos.y / 10),
      Math.floor(pos.x / 10),
      this.ctx
    );
    this.map.drawBlock(Math.ceil(pos.y / 10), Math.ceil(pos.x / 10), this.ctx);
  }

  public mainDraw() {
    var diff, u, i, len, nScore;

    this.ghostPos = [];

    for (i = 0, len = this.ghosts.length; i < len; i += 1) {
      this.ghostPos.push(this.ghosts[i].move(this.ctx));
    }
    u = this.user.move(this.ctx);

    for (i = 0, len = this.ghosts.length; i < len; i += 1) {
      this.redrawBlock(this.ghostPos[i].old);
    }
    this.redrawBlock(u.old);

    for (i = 0, len = this.ghosts.length; i < len; i += 1) {
      this.ghosts[i].draw(this.ctx);
    }
    this.user.draw(this.ctx);

    this.userPos = u['new'];

    for (i = 0, len = this.ghosts.length; i < len; i += 1) {
      if (this.collided(this.userPos, this.ghostPos[i]['new'])) {
        if (this.ghosts[i].isVunerable()) {
          this.audio.play('eatghost');
          this.ghosts[i].eat();
          this.eatenCount += 1;
          nScore = this.eatenCount * 50;
          this.drawScore(nScore, this.ghostPos[i]);
          this.user.addScore(nScore);
          this.setState(EATEN_PAUSE);
          this.timerStart = this.tick;
        } else if (this.ghosts[i].isDangerous()) {
          this.audio.play('die');
          this.setState(DYING);
          this.timerStart = this.tick;
        }
      }
    }
  }

  public mainLoop() {
    var diff;

    if (this.state !== PAUSE) {
      ++this.tick;
    }

    this.map.drawPills(this.ctx);

    if (this.state === PLAYING) {
      this.mainDraw();
    } else if (this.state === WAITING && this.stateChanged) {
      this.stateChanged = false;
      this.map.draw(this.ctx);
      this.dialog('Press N to start a New game');
    } else if (
      this.state === EATEN_PAUSE &&
      this.tick - this.timerStart > Pacman.FPS / 3
    ) {
      this.map.draw(this.ctx);
      this.setState(PLAYING);
    } else if (this.state === DYING) {
      if (this.tick - this.timerStart > Pacman.FPS * 2) {
        this.loseLife();
      } else {
        this.redrawBlock(this.userPos);
        for (let i = 0, len = this.ghosts.length; i < len; i += 1) {
          this.redrawBlock(this.ghostPos[i].old);
          this.ghostPos.push(this.ghosts[i].draw(this.ctx));
        }
        this.user.drawDead(
          this.ctx,
          (this.tick - this.timerStart) / (Pacman.FPS * 2)
        );
      }
    } else if (this.state === COUNTDOWN) {
      diff = 5 + Math.floor((this.timerStart - this.tick) / Pacman.FPS);

      if (diff === 0) {
        this.map.draw(this.ctx);
        this.setState(PLAYING);
      } else {
        if (diff !== this.lastTime) {
          this.lastTime = diff;
          this.map.draw(this.ctx);
          this.dialog('Starting in: ' + diff);
        }
      }
    }

    this.drawFooter();
  }

  public eatenPill() {
    this.audio.play('eatpill');
    this.timerStart = this.tick;
    this.eatenCount = 0;
    for (let i = 0; i < this.ghosts.length; i += 1) {
      this.ghosts[i].makeEatable(this.ctx);
    }
  }

  public completedLevel() {
    this.setState(WAITING);
    this.level += 1;
    this.map.reset();
    this.user.newLevel();
    this.startLevel();
  }

  public keyPress(e) {
    if (this.state !== WAITING && this.state !== PAUSE) {
      e.preventDefault();
      e.stopPropagation();
    }
  }

  public init(wrapper, root) {
    var i,
      len,
      ghost,
      blockSize = wrapper.offsetWidth / 19,
      canvas = document.createElement('canvas');

    canvas.setAttribute('width', blockSize * 19 + 'px');
    canvas.setAttribute('height', blockSize * 22 + 30 + 'px');

    wrapper.appendChild(canvas);

    this.ctx = canvas.getContext('2d');

    this.audio = new Pacman.Audio({ soundDisabled: this.soundDisabled });
    this.map = new Pacman.Map(blockSize);
    this.user = new Pacman.User(
      {
        completedLevel: this.completedLevel,
        eatenPill: this.eatenPill,
      },
      this.map
    );

    for (let i = 0, len = this.ghostSpecs.length; i < len; i += 1) {
      ghost = new Pacman.Ghost(
        { getTick: this.getTick },
        this.map,
        this.ghostSpecs[i]
      );
      this.ghosts.push(ghost);
    }

    this.map.draw(this.ctx);
    this.dialog('Loading ...');

    var extension = Modernizr.audio.ogg ? 'ogg' : 'mp3';

    var audio_files = [
      ['start', root + 'audio/opening_song.' + extension],
      ['die', root + 'audio/die.' + extension],
      ['eatghost', root + 'audio/eatghost.' + extension],
      ['eatpill', root + 'audio/eatpill.' + extension],
      ['eating', root + 'audio/eating.short.' + extension],
      ['eating2', root + 'audio/eating.short.' + extension],
    ];

    this.load(audio_files, function () {
      this.loaded();
    });
  }

  public load(arr, callback) {
    if (arr.length === 0) {
      callback();
    } else {
      var x = arr.pop();
      this.audio.load(x[0], x[1], function () {
        this.load(arr, callback);
      });
    }
  }

  public loaded() {
    this.dialog('Press N to Start');

    document.addEventListener('keydown', this.keyDown, true);
    document.addEventListener('keypress', this.keyPress, true);

    this.timer = window.setInterval(this.mainLoop, 1000 / Pacman.FPS);
  }
}

// var PACMAN = (function () {
//   return {
//     init: init,
//   };
// })();
