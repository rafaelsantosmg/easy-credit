import { CurrencyPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CreditAnalysis } from '../../models/credit.models';
import { CreditFlowService } from '../../services/credit-flow.service';
import { CreditService } from '../../services/credit.service';

@Component({
  selector: 'app-analysis',
  imports: [CurrencyPipe, RouterLink],
  templateUrl: './analysis.component.html',
  styleUrl: './analysis.component.css',
})
export class AnalysisComponent implements OnInit {
  private readonly creditService = inject(CreditService);
  protected readonly flow = inject(CreditFlowService);
  private readonly router = inject(Router);

  protected readonly analyzing = signal(false);
  protected readonly analysis = signal<CreditAnalysis | null>(this.flow.analysis());
  protected readonly checkStep = signal(0);

  ngOnInit(): void {
    if (this.flow.analysis()) {
      return;
    }

    if (this.flow.canAccessStep('analise') && this.flow.simulationResult()) {
      // Auto-run if coming from simulation with saved result but no analysis yet
    }
  }

  runAnalysis(): void {
    const input = this.flow.simulationInput();
    const result = this.flow.simulationResult();

    if (!input || !result) return;

    this.analyzing.set(true);
    this.checkStep.set(0);

    const interval = setInterval(() => {
      this.checkStep.update((s) => Math.min(s + 1, 3));
    }, 700);

    this.creditService.analyze(input, result, this.flow.customer() ?? undefined).subscribe({
      next: (analysis) => {
        clearInterval(interval);
        this.analyzing.set(false);
        this.analysis.set(analysis);
        this.flow.saveAnalysis(analysis);
      },
      error: () => {
        clearInterval(interval);
        this.analyzing.set(false);
      },
    });
  }

  proceed(): void {
    this.router.navigate(['/cadastro']);
  }

  retry(): void {
    this.flow.reset();
    this.router.navigate(['/simulacao']);
  }
}
