import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

import { CREDIT_STEPS } from '../../models/credit.models';
import { CreditFlowService } from '../../services/credit-flow.service';

@Component({
  selector: 'app-stepper',
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './stepper.component.html',
  styleUrl: './stepper.component.css',
})
export class StepperComponent {
  protected readonly steps = CREDIT_STEPS;
  protected readonly flow = inject(CreditFlowService);

  onStepClick(event: Event, stepId: (typeof CREDIT_STEPS)[number]['id']): void {
    if (!this.flow.canAccessStep(stepId)) {
      event.preventDefault();
    }
  }
}
