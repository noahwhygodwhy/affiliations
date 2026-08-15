import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Appcol } from './appcol/appcol';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Appcol],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('affiliations');
}
