import { CommonModule } from '@angular/common';
import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LuhnStep {
  index: number;
  digit: number;
  doubled: boolean;
  result: number;
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  rawInput = signal('');

  digits = computed(() => {
    const cleaned = this.rawInput().replace(/\D/g, '');
    return cleaned.split('').map((d) => Number(d));
  });

  formatted = computed(() => {
    const cleaned = this.rawInput().replace(/\D/g, '');
    return cleaned.replace(/(\d{4})(?=\d)/g, '$1 ');
  });

  luhnSteps = computed<LuhnStep[]>(() => {
    const digits = this.digits();
    const steps: LuhnStep[] = [];

    const isEvenLength = digits.length % 2 === 0;
    digits.forEach((digit, idx) => {
      const shouldDouble = isEvenLength ? idx % 2 === 0 : idx % 2 === 1;
      let result = digit;
      if (shouldDouble) {
        result = digit * 2;
        if (result > 9) result -= 9;
      }

      steps.push({
        index: idx,
        digit,
        doubled: shouldDouble,
        result
      });
    });

    return steps;
  });

  total = computed(() => this.luhnSteps().reduce((sum, step) => sum + step.result, 0));

  isValid = computed(() => {
    const digits = this.digits();
    if (digits.length < 12) return false;
    return this.total() % 10 === 0;
  });

  checkDigit = computed(() => {
    const digits = this.digits();
    if (digits.length === 0) return null;

    const withoutLast = digits.slice(0, -1);
    const isEvenLength = withoutLast.length % 2 === 0;
    const sum = withoutLast.reduce((acc, digit, idx) => {
      const shouldDouble = isEvenLength ? idx % 2 === 0 : idx % 2 === 1;
      let result = digit;
      if (shouldDouble) {
        result = digit * 2;
        if (result > 9) result -= 9;
      }
      return acc + result;
    }, 0);

    return (10 - (sum % 10)) % 10;
  });

  exampleNumber = '79927398713';

  setExample(): void {
    this.rawInput.set(this.exampleNumber);
  }

  clear(): void {
    this.rawInput.set('');
  }

  onInputChange(value: string): void {
    this.rawInput.set(value);
  }
}
