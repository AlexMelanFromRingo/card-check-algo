import { CommonModule } from '@angular/common';
import { Component, computed, effect, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface LuhnStep {
  index: number;
  digit: number;
  doubled: boolean;
  result: number;
  positionFromLeft: number;
  positionFromRight: number;
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
  mode = signal<'rtl' | 'ltr'>('rtl');
  tutorialIndex = signal(0);
  theme = signal<'light' | 'dark'>('light');
  hoveredIndex = signal<number | null>(null);

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
        result,
        positionFromLeft: idx + 1,
        positionFromRight: digits.length - idx
      });
    });

    return steps;
  });

  displaySteps = computed(() => {
    const steps = this.luhnSteps();
    return this.mode() === 'rtl' ? [...steps].reverse() : steps;
  });

  sumExpression = computed(() => this.luhnSteps().map((step) => step.result));

  sumRemainder = computed(() => this.total() % 10);

  tutorialSteps = [
    {
      title: 'Шаг 1 — смотрим справа налево',
      body: 'Последняя цифра — контрольная, но она тоже участвует в сумме.'
    },
    {
      title: 'Шаг 2 — удваиваем через одну',
      body: 'Каждую вторую цифру, считая справа, умножаем на 2.'
    },
    {
      title: 'Шаг 3 — корректируем больше 9',
      body: 'Если получилось 10–18, вычитаем 9 (это эквивалентно сумме цифр).'
    },
    {
      title: 'Шаг 4 — складываем и делим на 10',
      body: 'Складываем все результаты и проверяем, что сумма кратна 10.'
    }
  ];

  currentTutorial = computed(() => this.tutorialSteps[this.tutorialIndex()]);

  total = computed(() => this.luhnSteps().reduce((sum, step) => sum + step.result, 0));

  isValid = computed(() => {
    const digits = this.digits();
    if (digits.length < 12 || digits.length > 19) return false;
    return this.total() % 10 === 0;
  });

  lengthStatus = computed(() => {
    const len = this.digits().length;
    if (len === 0) return 'Нет цифр';
    if (len < 12) return 'Слишком короткий';
    if (len > 19) return 'Слишком длинный';
    return 'Длина допустима';
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

  setMode(next: 'rtl' | 'ltr'): void {
    this.mode.set(next);
  }

  toggleTheme(): void {
    this.theme.set(this.theme() === 'light' ? 'dark' : 'light');
  }

  setHovered(index: number | null): void {
    this.hoveredIndex.set(index);
  }

  prevTutorial(): void {
    this.tutorialIndex.set(Math.max(0, this.tutorialIndex() - 1));
  }

  nextTutorial(): void {
    this.tutorialIndex.set(Math.min(this.tutorialSteps.length - 1, this.tutorialIndex() + 1));
  }

  constructor() {
    effect(() => {
      const isDark = this.theme() === 'dark';
      document.documentElement.classList.toggle('theme-dark', isDark);
    });
  }
}
