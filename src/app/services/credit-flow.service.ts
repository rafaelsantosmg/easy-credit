import { Injectable, computed, signal } from '@angular/core';

import {
  CreditAnalysis,
  CreditStep,
  CREDIT_STEPS,
  CustomerData,
  FormalizationResult,
  SimulationInput,
  SimulationResult,
} from '../models/credit.models';

@Injectable({ providedIn: 'root' })
export class CreditFlowService {
  private readonly completedSteps = signal<Set<CreditStep>>(new Set());

  readonly simulationInput = signal<SimulationInput | null>(null);
  readonly simulationResult = signal<SimulationResult | null>(null);
  readonly customer = signal<CustomerData | null>(null);
  readonly analysis = signal<CreditAnalysis | null>(null);
  readonly formalization = signal<FormalizationResult | null>(null);

  readonly currentStepIndex = computed(() => {
    const completed = this.completedSteps().size;
    return Math.min(completed, CREDIT_STEPS.length - 1);
  });

  isStepCompleted(step: CreditStep): boolean {
    return this.completedSteps().has(step);
  }

  canAccessStep(step: CreditStep): boolean {
    const stepIndex = CREDIT_STEPS.findIndex((s) => s.id === step);
    if (stepIndex <= 0) return true;

    const previousStep = CREDIT_STEPS[stepIndex - 1].id;
    return this.isStepCompleted(previousStep);
  }

  saveSimulation(input: SimulationInput, result: SimulationResult): void {
    this.simulationInput.set(input);
    this.simulationResult.set(result);
    this.markCompleted('simulacao');
  }

  saveAnalysis(analysis: CreditAnalysis): void {
    this.analysis.set(analysis);
    if (analysis.status === 'approved') {
      this.markCompleted('analise');
    }
  }

  saveCustomer(customer: CustomerData): void {
    this.customer.set(customer);
    this.markCompleted('cadastro');
  }

  saveFormalization(result: FormalizationResult): void {
    this.formalization.set(result);
    this.markCompleted('formalizacao');
  }

  reset(): void {
    this.completedSteps.set(new Set());
    this.simulationInput.set(null);
    this.simulationResult.set(null);
    this.customer.set(null);
    this.analysis.set(null);
    this.formalization.set(null);
  }

  private markCompleted(step: CreditStep): void {
    const updated = new Set(this.completedSteps());
    updated.add(step);
    this.completedSteps.set(updated);
  }
}
