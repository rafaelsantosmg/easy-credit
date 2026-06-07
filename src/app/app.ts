import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { StepperComponent } from './components/stepper/stepper.component';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, StepperComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {}
