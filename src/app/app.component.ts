import {
  AfterViewInit,
  Component,
  ElementRef,
  VERSION,
  ViewChild,
} from '@angular/core';
import { Pacman } from './models/pacman.model';

@Component({
  selector: 'my-app',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewInit {
  @ViewChild('pacmanElement') pacmanElement: ElementRef;
  /*
   * fix looped audio
   * add fruits + levels
   * fix what happens when a ghost is eaten (should go back to base)
   * do proper ghost mechanics (blinky/wimpy etc)
   */

  public Pacman;

  ngAfterViewInit(): void {
    this.Pacman = new Pacman();
    this.Pacman.init(this.pacmanElement.nativeElement, '');
  }
}
