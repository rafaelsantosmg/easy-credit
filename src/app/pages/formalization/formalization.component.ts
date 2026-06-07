import { DatePipe, DecimalPipe } from '@angular/common';
import { Component, inject, OnDestroy, signal } from '@angular/core';
import { Router } from '@angular/router';

import { FormalizationResult } from '../../models/credit.models';
import { CreditFlowService } from '../../services/credit-flow.service';
import { CreditService } from '../../services/credit.service';

type BiometryPhase = 'idle' | 'capturing' | 'captured' | 'validating' | 'validated' | 'error';

@Component({
  selector: 'app-formalization',
  imports: [DatePipe, DecimalPipe],
  templateUrl: './formalization.component.html',
  styleUrl: './formalization.component.css',
})
export class FormalizationComponent implements OnDestroy {
  private readonly creditService = inject(CreditService);
  protected readonly flow = inject(CreditFlowService);
  private readonly router = inject(Router);

  protected readonly biometryPhase = signal<BiometryPhase>('idle');
  protected readonly cameraError = signal(false);
  protected readonly streamActive = signal(false);
  protected readonly termsAccepted = signal(false);
  protected readonly formalizing = signal(false);
  protected readonly completed = signal<FormalizationResult | null>(this.flow.formalization());

  private mediaStream: MediaStream | null = null;
  private videoElement: HTMLVideoElement | null = null;

  ngOnDestroy(): void {
    this.stopCamera();
  }

  canFormalize(): boolean {
    return this.biometryPhase() === 'validated' && this.termsAccepted() && !this.formalizing();
  }

  async startCapture(): Promise<void> {
    this.biometryPhase.set('capturing');

    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
        audio: false,
      });

      this.cameraError.set(false);
      this.streamActive.set(true);

      setTimeout(() => {
        const video = document.querySelector('video.camera-feed') as HTMLVideoElement;
        if (video && this.mediaStream) {
          video.srcObject = this.mediaStream;
          this.videoElement = video;
        }
      }, 100);
    } catch {
      this.cameraError.set(true);
      this.streamActive.set(false);
    }
  }

  captureBiometry(): void {
    this.biometryPhase.set('captured');
    this.stopCamera();
  }

  validateBiometry(): void {
    this.biometryPhase.set('validating');

    setTimeout(() => {
      this.biometryPhase.set('validated');
    }, 1800);
  }

  retake(): void {
    this.biometryPhase.set('idle');
    this.startCapture();
  }

  stopCamera(): void {
    this.mediaStream?.getTracks().forEach((track) => track.stop());
    this.mediaStream = null;
    this.streamActive.set(false);
    if (this.videoElement) {
      this.videoElement.srcObject = null;
    }
  }

  toggleTerms(event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    this.termsAccepted.set(checked);
  }

  formalize(): void {
    if (!this.canFormalize()) return;

    this.formalizing.set(true);

    this.creditService.formalize().subscribe({
      next: (result) => {
        this.flow.saveFormalization(result);
        this.completed.set(result);
        this.formalizing.set(false);
      },
      error: () => this.formalizing.set(false),
    });
  }

  restart(): void {
    this.flow.reset();
    this.router.navigate(['/simulacao']);
  }
}
