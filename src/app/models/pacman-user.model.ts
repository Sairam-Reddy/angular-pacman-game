import { PACMAN } from '../constants/pacman.constants';
import { PacmanMap } from './pacman-map.model';

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

/* Human readable keyCode index */
const KEY = {
  BACKSPACE: 8,
  TAB: 9,
  NUM_PAD_CLEAR: 12,
  ENTER: 13,
  SHIFT: 16,
  CTRL: 17,
  ALT: 18,
  PAUSE: 19,
  CAPS_LOCK: 20,
  ESCAPE: 27,
  SPACEBAR: 32,
  PAGE_UP: 33,
  PAGE_DOWN: 34,
  END: 35,
  HOME: 36,
  ARROW_LEFT: 37,
  ARROW_UP: 38,
  ARROW_RIGHT: 39,
  ARROW_DOWN: 40,
  PRINT_SCREEN: 44,
  INSERT: 45,
  DELETE: 46,
  SEMICOLON: 59,
  WINDOWS_LEFT: 91,
  WINDOWS_RIGHT: 92,
  SELECT: 93,
  NUM_PAD_ASTERISK: 106,
  NUM_PAD_PLUS_SIGN: 107,
  'NUM_PAD_HYPHEN-MINUS': 109,
  NUM_PAD_FULL_STOP: 110,
  NUM_PAD_SOLIDUS: 111,
  NUM_LOCK: 144,
  SCROLL_LOCK: 145,
  // SEMICOLON: 186,
  EQUALS_SIGN: 187,
  COMMA: 188,
  'HYPHEN-MINUS': 189,
  FULL_STOP: 190,
  SOLIDUS: 191,
  GRAVE_ACCENT: 192,
  LEFT_SQUARE_BRACKET: 219,
  REVERSE_SOLIDUS: 220,
  RIGHT_SQUARE_BRACKET: 221,
  APOSTROPHE: 222,
};

export class PacmanUser {
  public position = null;
  public direction = null;
  public eaten = null;
  public due = null;
  public lives = null;
  public score = 5;
  public keyMap = {};

  public game;
  public map: PacmanMap;

  public constructor(game, map) {
    this.game = game;
    this.map = map;
    this.keyMap[KEY.ARROW_LEFT] = LEFT;
    this.keyMap[KEY.ARROW_UP] = UP;
    this.keyMap[KEY.ARROW_RIGHT] = RIGHT;
    this.keyMap[KEY.ARROW_DOWN] = DOWN;
    this.initUser();
  }

  public addScore(nScore) {
    this.score += nScore;
    if (this.score >= 10000 && this.score - nScore < 10000) {
      this.lives += 1;
    }
  }

  public theScore() {
    return this.score;
  }

  public loseLife() {
    this.lives -= 1;
  }

  public getLives() {
    return this.lives;
  }

  public initUser() {
    this.score = 0;
    this.lives = 3;
    this.newLevel();
  }

  public newLevel() {
    this.resetPosition();
    this.eaten = 0;
  }

  public resetPosition() {
    this.position = { x: 90, y: 120 };
    this.direction = LEFT;
    this.due = LEFT;
  }

  public reset() {
    this.initUser();
    this.resetPosition();
  }

  public keyDown(e) {
    if (typeof this.keyMap[e.keyCode] !== 'undefined') {
      this.due = this.keyMap[e.keyCode];
      e.preventDefault();
      e.stopPropagation();
      return false;
    }
    return true;
  }

  public getNewCoord(dir, current) {
    return {
      x: current.x + ((dir === LEFT && -2) || (dir === RIGHT && 2) || 0),
      y: current.y + ((dir === DOWN && 2) || (dir === UP && -2) || 0),
    };
  }

  public onWholeSquare(x) {
    return x % 10 === 0;
  }

  public pointToCoord(x) {
    return Math.round(x / 10);
  }

  public nextSquare(x, dir) {
    var rem = x % 10;
    if (rem === 0) {
      return x;
    } else if (dir === RIGHT || dir === DOWN) {
      return x + (10 - rem);
    } else {
      return x - rem;
    }
  }

  public next(pos, dir) {
    return {
      y: this.pointToCoord(this.nextSquare(pos.y, dir)),
      x: this.pointToCoord(this.nextSquare(pos.x, dir)),
    };
  }

  public onGridSquare(pos) {
    return this.onWholeSquare(pos.y) && this.onWholeSquare(pos.x);
  }

  public isOnSamePlane(due, dir) {
    return (
      ((due === LEFT || due === RIGHT) && (dir === LEFT || dir === RIGHT)) ||
      ((due === UP || due === DOWN) && (dir === UP || dir === DOWN))
    );
  }

  public move(ctx) {
    var npos = null,
      nextWhole = null,
      oldPosition = this.position,
      block = null;

    if (this.due !== this.direction) {
      npos = this.getNewCoord(this.due, this.position);

      if (
        this.isOnSamePlane(this.due, this.direction) ||
        (this.onGridSquare(this.position) &&
          this.map.isFloorSpace(this.next(npos, this.due)))
      ) {
        this.direction = this.due;
      } else {
        npos = null;
      }
    }

    if (npos === null) {
      npos = this.getNewCoord(this.direction, this.position);
    }

    if (
      this.onGridSquare(this.position) &&
      this.map.isWall(this.next(npos, this.direction))
    ) {
      this.direction = NONE;
    }

    if (this.direction === NONE) {
      return { new: this.position, old: this.position };
    }

    if (npos.y === 100 && npos.x >= 190 && this.direction === RIGHT) {
      npos = { y: 100, x: -10 };
    }

    if (npos.y === 100 && npos.x <= -12 && this.direction === LEFT) {
      npos = { y: 100, x: 190 };
    }

    this.position = npos;
    nextWhole = this.next(this.position, this.direction);

    block = this.map.block(nextWhole);

    if (
      ((this.isMidSquare(this.position.y) ||
        this.isMidSquare(this.position.x)) &&
        block === PACMAN.BISCUIT) ||
      block === PACMAN.PILL
    ) {
      this.map.setBlock(nextWhole, PACMAN.EMPTY);
      this.addScore(block === PACMAN.BISCUIT ? 10 : 50);
      this.eaten += 1;

      if (this.eaten === 182) {
        this.game.completedLevel();
      }

      if (block === PACMAN.PILL) {
        this.game.eatenPill();
      }
    }

    return {
      new: this.position,
      old: oldPosition,
    };
  }

  public isMidSquare(x) {
    var rem = x % 10;
    return rem > 3 || rem < 7;
  }

  public calcAngle(dir, pos) {
    if (dir == RIGHT && pos.x % 10 < 5) {
      return { start: 0.25, end: 1.75, direction: false };
    } else if (dir === DOWN && pos.y % 10 < 5) {
      return { start: 0.75, end: 2.25, direction: false };
    } else if (dir === UP && pos.y % 10 < 5) {
      return { start: 1.25, end: 1.75, direction: true };
    } else if (dir === LEFT && pos.x % 10 < 5) {
      return { start: 0.75, end: 1.25, direction: true };
    }
    return { start: 0, end: 2, direction: false };
  }

  public drawDead(ctx, amount) {
    var size = this.map.blockSize,
      half = size / 2;

    if (amount >= 1) {
      return;
    }

    ctx.fillStyle = '#FFFF00';
    ctx.beginPath();
    ctx.moveTo(
      (this.position.x / 10) * size + half,
      (this.position.y / 10) * size + half
    );

    ctx.arc(
      (this.position.x / 10) * size + half,
      (this.position.y / 10) * size + half,
      half,
      0,
      Math.PI * 2 * amount,
      true
    );

    ctx.fill();
  }

  public draw(ctx) {
    var s = this.map.blockSize,
      angle = this.calcAngle(this.direction, this.position);

    ctx.fillStyle = '#FFFF00';

    ctx.beginPath();

    ctx.moveTo(
      (this.position.x / 10) * s + s / 2,
      (this.position.y / 10) * s + s / 2
    );

    ctx.arc(
      (this.position.x / 10) * s + s / 2,
      (this.position.y / 10) * s + s / 2,
      s / 2,
      Math.PI * angle.start,
      Math.PI * angle.end,
      angle.direction
    );

    ctx.fill();
  }
}

// Pacman.User = function (game, map) {
//   return {
//     draw: draw,
//     drawDead: drawDead,
//     loseLife: loseLife,
//     getLives: getLives,
//     score: score,
//     addScore: addScore,
//     theScore: theScore,
//     keyDown: keyDown,
//     move: move,
//     newLevel: newLevel,
//     reset: reset,
//     resetPosition: resetPosition,
//   };
// };
