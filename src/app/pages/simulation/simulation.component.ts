import { CurrencyPipe, DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CreditFlowService } from '../../services/credit-flow.service';
import { CreditService } from '../../services/credit.service';

@Component({
  selector: 'app-simulation',
  imports: [ReactiveFormsModule, CurrencyPipe, DecimalPipe],
  templateUrl: './simulation.component.html',
  styleUrl: './simulation.component.css',
})
export class SimulationComponent {
  private readonly fb = inject(FormBuilder);
  private readonly creditService = inject(CreditService);
  private readonly flow = inject(CreditFlowService);
  private readonly router = inject(Router);

  protected readonly parcelOptions = [12, 24, 36, 48, 60, 72];
  protected readonly loading = signal(false);
  protected readonly result = signal(this.flow.simulationResult());

  protected readonly form = this.fb.nonNullable.group({
    valor: [50000, [Validators.required, Validators.min(1000), Validators.max(500000)]],
    parcelas: [36, Validators.required],
    rendaMensal: [5000, [Validators.required, Validators.min(1000)]],
  });

  simulate(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);

    setTimeout(() => {
      const input = this.form.getRawValue();
      const simulation = this.creditService.simulate(input);
      this.result.set(simulation);
      this.flow.saveSimulation(input, simulation);
      this.loading.set(false);
    }, 600);
  }

  proceed(): void {
    this.router.navigate(['/analise']);
  }
}
