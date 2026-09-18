import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Api } from '../../../core/services/api';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IAddress } from '../../../core/models/address';

@Component({
  selector: 'app-addresses',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, ButtonModule, InputTextModule],
  templateUrl: './addresses.html',
  styleUrl: './addresses.scss',
})
export class Addresses implements OnInit {
  addresses: IAddress[] = [];
  isLoading = true;
  showForm = false;
  editingId: string | null = null;
  isSaving = false;

  addressForm: FormGroup;

  constructor(private api: Api, private cdr: ChangeDetectorRef, private fb: FormBuilder) {
    this.addressForm = this.fb.group({
      label: ['Home', Validators.required],
      addressText: ['', Validators.required],
      isDefault: [false]
    });
  }

  ngOnInit() { this.loadAddresses(); }

  loadAddresses() {
    this.isLoading = true;
    this.api.get<{ data: { addresses: IAddress[] } }>('address').subscribe({
      next: (res) => {
        this.addresses = res.data.addresses.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0));
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => { this.isLoading = false; this.cdr.detectChanges(); }
    });
  }

  openAddForm() {
    this.editingId = null;
    this.addressForm.reset({
      label: 'Home',
      addressText: '',
      isDefault: this.addresses.length === 0
    });
    this.showForm = true;
  }

  openEditForm(addr: IAddress) {
    this.editingId = addr._id;
    this.addressForm.patchValue({
      label: addr.label || 'Home',
      addressText: addr.addressText || '',
      isDefault: addr.isDefault || false
    });
    this.showForm = true;
  }

  cancelForm() {
    this.showForm = false;
    this.editingId = null;
  }

  saveAddress() {
    if (this.addressForm.invalid) {
      this.addressForm.markAllAsTouched();
      return;
    }
    this.isSaving = true;
    const body = this.addressForm.value;
    const req = this.editingId
      ? this.api.patch(`address/${this.editingId}`, body)
      : this.api.post('address', body);

    req.subscribe({
      next: () => {
        this.isSaving = false;
        this.showForm = false;
        this.editingId = null;
        this.loadAddresses();
      },
      error: () => { this.isSaving = false; this.cdr.detectChanges(); }
    });
  }

  deleteAddress(id: string) {
    this.api.delete(`address/${id}`).subscribe({ next: () => this.loadAddresses() });
  }

  setDefault(id: string) {
    this.api.patch(`address/${id}`, { isDefault: true }).subscribe({ next: () => this.loadAddresses() });
  }
}
