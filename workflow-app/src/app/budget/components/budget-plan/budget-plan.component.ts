// budget-plan.component.ts
import { DecimalPipe } from '@angular/common';
import { Component, inject, Input } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { startWith } from 'rxjs';
import { BudgetPlanService } from '../../budget-plan.service';

@Component({
  selector: 'app-budget-plan',
  standalone: true,
  imports: [DecimalPipe, ReactiveFormsModule],
  templateUrl: './budget-plan.component.html',
  styleUrl: './budget-plan.component.scss'
})
export class BudgetPlanComponent {
  @Input()
  editable = false;

  budgetPlanService = inject(BudgetPlanService);
  // budgetPlan = this.budgetPlanService.budgetPlan;
  budgetPlanState = this.budgetPlanService.budgetPlanState;
  // balance = this.budgetPlanService.balance;
  balanceState = this.budgetPlanService.balanceState;

  availablePercent = new FormControl<number>(this.budgetPlanService.DEFAULT_AVAILABLE_PERCENT, {
    nonNullable: true
  });

  constructor() {
    this.availablePercent.valueChanges
      .pipe(startWith(this.availablePercent.value))
      .subscribe((percent) => {
        this.budgetPlanService.updateAvailable(percent);
      });
  }
}
