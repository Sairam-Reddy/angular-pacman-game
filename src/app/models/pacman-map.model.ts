import { PACMAN } from '../constants/pacman.constants';

export class PacmanMap {
  public height = null;
  public width = null;
  public blockSize = null;
  public pillSize = 0;
  public map = null;

  public constructor(size) {
    this.blockSize = size;
    this.reset();
  }

  public withinBounds(y, x) {
    return y >= 0 && y < this.height && x >= 0 && x < this.width;
  }

  public isWall(pos) {
    return (
      this.withinBounds(pos.y, pos.x) && this.map[pos.y][pos.x] === PACMAN.WALL
    );
  }

  public isFloorSpace(pos) {
    if (!this.withinBounds(pos.y, pos.x)) {
      return false;
    }
    var peice = this.map[pos.y][pos.x];
    return (
      peice === PACMAN.EMPTY ||
      peice === PACMAN.BISCUIT ||
      peice === PACMAN.PILL
    );
  }

  public drawWall(ctx) {
    var i, j, p, line;

    ctx.strokeStyle = '#0000FF';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';

    for (i = 0; i < PACMAN.WALLS.length; i += 1) {
      line = PACMAN.WALLS[i];
      ctx.beginPath();

      for (j = 0; j < line.length; j += 1) {
        p = line[j];

        if (p.move) {
          ctx.moveTo(p.move[0] * this.blockSize, p.move[1] * this.blockSize);
        } else if (p.line) {
          ctx.lineTo(p.line[0] * this.blockSize, p.line[1] * this.blockSize);
        } else if (p.curve) {
          ctx.quadraticCurveTo(
            p.curve[0] * this.blockSize,
            p.curve[1] * this.blockSize,
            p.curve[2] * this.blockSize,
            p.curve[3] * this.blockSize
          );
        }
      }
      ctx.stroke();
    }
  }

  public reset() {
    this.map = this.clone(PACMAN.MAP);
    this.height = this.map.length;
    this.width = this.map[0].length;
  }

  public clone(obj) {
    var i,
      newObj = obj instanceof Array ? [] : {};
    for (i in obj) {
      if (i === 'clone') {
        continue;
      }
      if (obj[i] && typeof obj[i] === 'object') {
        newObj[i] = this.clone(obj[i]);
      } else {
        newObj[i] = obj[i];
      }
    }
    return newObj;
  }

  public block(pos) {
    return this.map[pos.y][pos.x];
  }

  public setBlock(pos, type) {
    this.map[pos.y][pos.x] = type;
  }

  public drawPills(ctx) {
    if (++this.pillSize > 30) {
      this.pillSize = 0;
    }

    for (let i = 0; i < this.height; i += 1) {
      for (let j = 0; j < this.width; j += 1) {
        if (this.map[i][j] === PACMAN.PILL) {
          ctx.beginPath();

          ctx.fillStyle = '#000';
          ctx.fillRect(
            j * this.blockSize,
            i * this.blockSize,
            this.blockSize,
            this.blockSize
          );

          ctx.fillStyle = '#FFF';
          ctx.arc(
            j * this.blockSize + this.blockSize / 2,
            i * this.blockSize + this.blockSize / 2,
            Math.abs(5 - this.pillSize / 3),
            0,
            Math.PI * 2,
            false
          );
          ctx.fill();
          ctx.closePath();
        }
      }
    }
  }

  public draw(ctx) {
    var i,
      j,
      size = this.blockSize;

    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, this.width * size, this.height * size);

    this.drawWall(ctx);

    for (i = 0; i < this.height; i += 1) {
      for (j = 0; j < this.width; j += 1) {
        this.drawBlock(i, j, ctx);
      }
    }
  }

  public drawBlock(y, x, ctx) {
    var layout = this.map[y][x];

    if (layout === PACMAN.PILL) {
      return;
    }

    ctx.beginPath();

    if (
      layout === PACMAN.EMPTY ||
      layout === PACMAN.BLOCK ||
      layout === PACMAN.BISCUIT
    ) {
      ctx.fillStyle = '#000';
      ctx.fillRect(
        x * this.blockSize,
        y * this.blockSize,
        this.blockSize,
        this.blockSize
      );

      if (layout === PACMAN.BISCUIT) {
        ctx.fillStyle = '#FFF';
        ctx.fillRect(
          x * this.blockSize + this.blockSize / 2.5,
          y * this.blockSize + this.blockSize / 2.5,
          this.blockSize / 6,
          this.blockSize / 6
        );
      }
    }
    ctx.closePath();
  }
}
