// confirm-modal.component.ts
import { Component } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [],
  templateUrl: './confirm-modal.component.html',
  styleUrl: './confirm-modal.component.scss'
})
export class ConfirmModalComponent {
  title = 'Do you want to confirm?';
  confirmed = false;

  constructor(public bsModalRef: BsModalRef) {}

  confirm(): void {
    this.confirmed = true;
    this.bsModalRef?.hide();
  }

  decline(): void {
    this.confirmed = false;
    this.bsModalRef?.hide();
  }
}
