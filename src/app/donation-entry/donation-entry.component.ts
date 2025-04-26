/**
 * Donation Entry Component
 *
 * This component handles the creation and editing of donation entries.
 * It provides form validation, real-time feedback, and MongoDB-compatible
 * data formatting with epoch timestamps.
 */
import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { ToastrService } from 'ngx-toastr';

import { Subscription } from 'rxjs';
import { AuthService } from '../services/auth/auth.service';
import { DonationStateService, DonationEntry } from '../services/donation-state/donation-state.service';
import { ThemeService } from '../services/theme/theme.service';

@Component({
  selector: 'app-donation-entry',
  templateUrl: './donation-entry.component.html',
  styleUrls: ['./donation-entry.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
    MatCardModule
  ]
})
export class DonationEntryComponent implements OnInit, OnDestroy {
  /**
   * Component state properties
   */
  donations: DonationEntry[] = [];             // All donation entries
  currentIndex = 0;                           // Current active donation index
  isDarkMode = false;                         // Theme state
  isBrowser: boolean;                         // Platform detection

  /**
   * Form validation properties
   */
  validationErrors: { [key: string]: string } = {};  // Validation error messages by field
  formValid = false;                                // Overall form validity state

  /**
   * Tracks previous validation state of each field to avoid duplicate error toasts
   * when the same error persists during typing
   */
  private previousFieldStates: { [key: string]: boolean } = {
    donorName: true,
    amount: true,
    date: true,
    transactionId: true
  };

  /**
   * Current donation being edited
   * Note: date is stored as epoch timestamp (number)
   */
  currentDonation: DonationEntry = {
    donorName: '',
    amount: 0,
    date: Date.now(),
    transactionId: ''
  };

  /**
   * Date object for the date picker UI
   * Since Angular Material's date picker requires a Date object,
   * we convert between epoch timestamp and Date object
   */
  datePickerDate: Date = new Date();

  /**
   * Collection of active subscriptions for cleanup
   */
  private subscriptions: Subscription[] = [];

  /**
   * Component constructor
   */
  constructor(
    public authService: AuthService,
    private donationStateService: DonationStateService,
    private themeService: ThemeService,
    private toastr: ToastrService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Initialize the component and set up subscriptions
   */
  ngOnInit(): void {
    // Subscribe to theme changes
    const themeSub = this.themeService.isDarkMode$.subscribe(isDark => {
      this.isDarkMode = isDark;
    });

    // Initialize theme
    this.isDarkMode = this.themeService.isDarkMode();

    // Subscribe to donations data changes
    const donationsSub = this.donationStateService.donations$.subscribe(donations => {
      this.donations = donations;
      this.updateCurrentDonation();
      this.validateFormWithoutNotifications();
    });

    // Subscribe to current index changes
    const indexSub = this.donationStateService.currentIndex$.subscribe(index => {
      this.currentIndex = index;
      this.updateCurrentDonation();
      this.validateFormWithoutNotifications();
      this.resetPreviousFieldStates();
    });

    // Store subscriptions for cleanup
    this.subscriptions.push(donationsSub, indexSub, themeSub);
  }

  /**
   * Clean up subscriptions when component is destroyed
   */
  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  /**
   * Add a new donation entry
   * Validates the current entry before allowing a new one
   */
  addEntry(): void {
    if (this.validateForm() && this.formValid) {
      this.saveCurrentDonation();
      this.donationStateService.add();
      this.toastr.success('New donation entry added', 'Success');
      this.resetPreviousFieldStates();
    } else {
      this.showValidationErrorsToast();
    }
  }

  /**
   * Remove the current donation entry
   */
  removeEntry(): void {
    this.donationStateService.remove(this.currentIndex);
    this.toastr.info('Donation entry removed', 'Removed');
  }

  /**
   * Navigate to the previous donation entry
   */
  previousEntry(): void {
    if (this.currentIndex > 0) {
      this.saveCurrentDonation();
      this.donationStateService.setCurrentIndex(this.currentIndex - 1);
    }
  }

  /**
   * Navigate to the next donation entry
   */
  nextEntry(): void {
    if (this.currentIndex < this.donations.length - 1) {
      this.saveCurrentDonation();
      this.donationStateService.setCurrentIndex(this.currentIndex + 1);
    }
  }

  /**
   * Reset the tracking of previous field validation states
   * Used when switching between donations to ensure proper toast behavior
   */
  resetPreviousFieldStates(): void {
    this.previousFieldStates = {
      donorName: true,
      amount: true,
      date: true,
      transactionId: true
    };
  }

  /**
   * Handle input changes with real-time validation
   * @param field The name of the field being changed
   */
  onInputChange(field?: string): void {
    // Validate the form
    this.validateForm();

    // If the date was changed via date picker, update epoch timestamp
    if (field === 'date') {
      this.currentDonation.date = this.datePickerDate.getTime();
    }

    // Show toast for field-specific errors (only once per error state)
    if (field && this.validationErrors[field]) {
      if (this.previousFieldStates[field]) {
        this.toastr.warning(this.validationErrors[field], 'Validation Error');
        this.previousFieldStates[field] = false;
      }
    } else if (field) {
      // Field is now valid, update its state
      this.previousFieldStates[field] = true;
    }

    // Save changes
    this.saveCurrentDonation();
  }

  /**
   * Save the current donation to the state service
   */
  saveCurrentDonation(): void {
    if (this.currentIndex >= 0 && this.currentIndex < this.donations.length) {
      this.donationStateService.updateDonation(this.currentIndex, { ...this.currentDonation });
    }
  }

  /**
   * Validate form without showing notifications
   * Used during initialization and navigation between donations
   */
  validateFormWithoutNotifications(): boolean {
    return this.validateFormBase(false);
  }

  /**
   * Validate form fields and optionally show toasts
   */
  validateForm(): boolean {
    return this.validateFormBase(true);
  }

  /**
   * Base validation logic - validates all fields and collects errors
   * @param enableToasts Whether to enable toast notifications
   * @returns Whether the form is valid
   */
  private validateFormBase(enableToasts: boolean): boolean {
    this.validationErrors = {};
    let isValid = true;

    // Validate donor name (only alphabetic characters and spaces)
    if (!this.currentDonation.donorName || this.currentDonation.donorName.trim() === '') {
      this.validationErrors['donorName'] = 'Donor name is required';
      isValid = false;
    } else if (!/^[A-Za-z\s]+$/.test(this.currentDonation.donorName)) {
      this.validationErrors['donorName'] = 'Donor name should contain only alphabetic characters and spaces';
      isValid = false;
    }

    // Validate amount (must be a positive number)
    if (!this.currentDonation.amount) {
      this.validationErrors['amount'] = 'Amount is required';
      isValid = false;
    } else if (this.currentDonation.amount <= 0) {
      this.validationErrors['amount'] = 'Amount must be greater than zero';
      isValid = false;
    }

    // Validate date
    if (!this.currentDonation.date) {
      this.validationErrors['date'] = 'Date is required';
      isValid = false;
    }

    // Validate transaction ID (alphanumeric)
    if (!this.currentDonation.transactionId || this.currentDonation.transactionId.trim() === '') {
      this.validationErrors['transactionId'] = 'Transaction ID is required';
      isValid = false;
    } else if (!/^[A-Za-z0-9-]+$/.test(this.currentDonation.transactionId)) {
      this.validationErrors['transactionId'] = 'Transaction ID should contain only alphanumeric characters and hyphens';
      isValid = false;
    }

    this.formValid = isValid;
    return isValid;
  }

  /**
   * Show validation errors using toastr
   * Shows the first error as a primary toast and counts additional errors
   */
  showValidationErrorsToast(): void {
    const errorMessages = Object.values(this.validationErrors);
    if (errorMessages.length > 0) {
      // Show a summary toast with the first error
      this.toastr.error(errorMessages[0], 'Validation Error');

      // If there are more errors, show them as info toasts
      if (errorMessages.length > 1) {
        this.toastr.info(`Plus ${errorMessages.length - 1} more errors`, 'Additional Errors');
      }
    }
  }

  /**
   * Get error message for a specific field
   * @param fieldName Name of the field
   * @returns Error message or empty string
   */
  getErrorMessage(fieldName: string): string {
    return this.validationErrors[fieldName] || '';
  }

  /**
   * Check if a field has errors
   * @param fieldName Name of the field
   * @returns Whether field has errors
   */
  hasError(fieldName: string): boolean {
    return !!this.validationErrors[fieldName];
  }

  /**
   * Date utility methods for working with epoch timestamps
   */

  /**
   * Get current donation's date as epoch timestamp
   */
  getEpochTimestamp(): number {
    return this.currentDonation.date;
  }

  /**
   * Convert any JS Date to epoch timestamp
   * @param date Date object or string to convert
   */
  dateToEpoch(date: Date | string): number {
    return date instanceof Date ? date.getTime() : new Date(date).getTime();
  }

  /**
   * Convert epoch timestamp to Date object for datepicker
   * @param epoch Epoch timestamp in milliseconds
   */
  epochToDate(epoch: number): Date {
    return new Date(epoch);
  }

  /**
   * Convert epoch timestamp to readable date string
   * @param epoch Epoch timestamp in milliseconds
   */
  epochToReadableDate(epoch: number): string {
    const date = new Date(epoch);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }

  /**
   * Convert epoch timestamp to ISO string
   * @param epoch Epoch timestamp in milliseconds
   */
  epochToISOString(epoch: number): string {
    return new Date(epoch).toISOString();
  }

  /**
   * MongoDB data preparation methods
   */

  /**
   * Get current donation ready for MongoDB storage
   * Adds additional metadata fields and date formats
   */
  getDonationForMongo(): any {
    const now = Date.now();
    const donationDate = this.getEpochTimestamp();

    return {
      ...this.currentDonation,
      dateEpoch: donationDate,
      dateISO: this.epochToISOString(donationDate),
      createdAt: now,
      createdAtISO: this.epochToISOString(now),
      metadata: {
        formattedDate: this.epochToReadableDate(donationDate),
        year: new Date(donationDate).getFullYear(),
        month: new Date(donationDate).getMonth() + 1, // MongoDB queries by month (1-12)
        day: new Date(donationDate).getDate(),
        updateHistory: [] // For future tracking of donation updates
      }
    };
  }

  /**
   * Format all donations for MongoDB batch export
   * Similar to getDonationForMongo but applies to all donations
   */
  prepareDonationsForMongoExport(): any[] {
    return this.donations.map(donation => {
      const donationDate = donation.date;
      const now = Date.now();

      return {
        ...donation,
        dateEpoch: donationDate,
        dateISO: this.epochToISOString(donationDate),
        createdAt: now,
        createdAtISO: this.epochToISOString(now),
        metadata: {
          formattedDate: this.epochToReadableDate(donationDate),
          year: new Date(donationDate).getFullYear(),
          month: new Date(donationDate).getMonth() + 1,
          day: new Date(donationDate).getDate()
        }
      };
    });
  }

  /**
   * Submit the current donation
   * Performs validation, prepares data for MongoDB, and provides user feedback
   */
  submitDonation(): void {
    // First save any pending changes
    this.saveCurrentDonation();

    // Validate before submission
    if (!this.validateForm() || !this.formValid) {
      this.showValidationErrorsToast();
      return;
    }

    // Get donation with epoch timestamp for MongoDB
    const donationForMongo = this.getDonationForMongo();

    // Log the donation data to console for now
    console.log('Submitting donation:', this.currentDonation);
    console.log('All donations:', this.donations);
    console.log('Donation with epoch for MongoDB:', donationForMongo);

    // Here you would typically send the data to a backend service
    this.toastr.success('Donation submitted successfully!', 'Success');
  }

  /**
   * Calculate total donations amount
   * @returns Formatted total amount string
   */
  getTotalDonations(): string {
    const total = this.donations.reduce((sum, donation) => sum + (donation.amount || 0), 0);
    return total.toFixed(2);
  }

  /**
   * Update the current donation from the state service
   * Also updates the datePickerDate for the UI
   */
  private updateCurrentDonation(): void {
    if (this.donations.length === 0) {
      // If no donations exist, create a new empty one
      this.currentDonation = {
        donorName: '',
        amount: 0,
        date: Date.now(),
        transactionId: ''
      };
      this.datePickerDate = new Date();
    } else if (this.currentIndex >= 0 && this.currentIndex < this.donations.length) {
      // Create a copy to avoid direct reference modification
      this.currentDonation = { ...this.donations[this.currentIndex] };

      // Update the date picker display with the current epoch date
      this.datePickerDate = new Date(this.currentDonation.date);
    }
  }
}
