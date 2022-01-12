export class PacmanAudio {
  public files = [];
  public endEvents = [];
  public progressEvents = [];
  public playing = [];

  public game;

  public constructor(game) {
    this.game = game;
  }

  public load(name, path, cb) {
    var f = (this.files[name] = document.createElement('audio'));

    this.progressEvents[name] = (event) => {
      this.progress(event, name, cb);
    };

    f.addEventListener(
      'canplaythrough',
      this.progressEvents[name].bind(this),
      true
    );
    f.setAttribute('preload', 'true');
    f.setAttribute('autobuffer', 'true');
    f.setAttribute('src', path);
    f.pause();
  }

  public progress(event, name, callback) {
    if (event.loaded === event.total && typeof callback === 'function') {
      callback();
      this.files[name].removeEventListener(
        'canplaythrough',
        this.progressEvents[name],
        true
      );
    }
  }

  public disableSound() {
    for (var i = 0; i < this.playing.length; i++) {
      this.files[this.playing[i]].pause();
      this.files[this.playing[i]].currentTime = 0;
    }
    this.playing = [];
  }

  public ended(name) {
    var i,
      tmp = [],
      found = false;

    this.files[name].removeEventListener('ended', this.endEvents[name], true);

    for (i = 0; i < this.playing.length; i++) {
      if (!found && this.playing[i]) {
        found = true;
      } else {
        tmp.push(this.playing[i]);
      }
    }
    this.playing = tmp;
  }

  public play(name) {
    if (!this.game.soundDisabled()) {
      this.endEvents[name] = () => {
        this.ended(name);
      };
      this.playing.push(name);
      this.files[name].addEventListener(
        'ended',
        this.endEvents[name].bind(this),
        true
      );
      this.files[name].play();
    }
  }

  public pause() {
    for (var i = 0; i < this.playing.length; i++) {
      this.files[this.playing[i]].pause();
    }
  }

  public resume() {
    for (var i = 0; i < this.playing.length; i++) {
      this.files[this.playing[i]].play();
    }
  }
}
