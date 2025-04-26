/**
 * Donation State Service
 *
 * This service manages the state of donation entries throughout the application.
 * It uses BehaviorSubject to maintain a reactive state that components can subscribe to.
 * All donation dates are stored as epoch timestamps (milliseconds since Jan 1, 1970)
 * for compatibility with MongoDB and other database systems.
 */
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

/**
 * DonationEntry Interface
 *
 * Defines the structure of a donation entry in the system.
 * Note: date is stored as an epoch timestamp (number) rather than a Date object
 * for consistency and database compatibility.
 */
export interface DonationEntry {
  /** Full name of the donor (alphabetic characters only) */
  donorName: string;

  /** Donation amount in dollars (positive number) */
  amount: number;

  /** Date of donation as epoch timestamp (milliseconds since Jan 1, 1970) */
  date: number;

  /** Unique transaction identifier (alphanumeric with hyphens) */
  transactionId: string;
}

@Injectable({
  providedIn: 'root'
})
export class DonationStateService {
  /**
   * Private state subjects
   * These BehaviorSubjects maintain the internal state of the service
   */
  private donationsSubject = new BehaviorSubject<DonationEntry[]>([]);
  private currentIndexSubject = new BehaviorSubject<number>(0);

  /**
   * Public observables
   * Components can subscribe to these to react to state changes
   */
  public donations$: Observable<DonationEntry[]> = this.donationsSubject.asObservable();
  public currentIndex$: Observable<number> = this.currentIndexSubject.asObservable();

  /**
   * Constructor initializes the service with an empty donation entry
   */
  constructor() {
    this.donationsSubject.next([this.createEmptyDonation()]);
  }

  /**
   * Get all donations currently stored in state
   * @returns Array of DonationEntry objects
   */
  getAll(): DonationEntry[] {
    return this.donationsSubject.value;
  }

  /**
   * Add a new empty donation to the collection and set it as current
   */
  add(): void {
    const donations = [...this.donationsSubject.value];
    donations.push(this.createEmptyDonation());
    this.donationsSubject.next(donations);

    // Set current index to the newly added donation
    this.setCurrentIndex(donations.length - 1);
  }

  /**
   * Remove a donation at the specified index
   * @param index Index of the donation to remove
   */
  remove(index: number): void {
    const donations = [...this.donationsSubject.value];

    if (index >= 0 && index < donations.length) {
      donations.splice(index, 1);
      this.donationsSubject.next(donations);

      // Handle index adjustment after removal
      const currentIndex = this.currentIndexSubject.value;
      if (currentIndex >= donations.length && donations.length > 0) {
        // If current index is now out of bounds, move to last item
        this.setCurrentIndex(donations.length - 1);
      } else if (donations.length === 0) {
        // If no donations left, add a new empty one
        this.add();
      }
    }
  }

  /**
   * Set the current index for active donation editing
   * @param index Index to set as current
   */
  setCurrentIndex(index: number): void {
    const donations = this.donationsSubject.value;
    if (index >= 0 && index < donations.length) {
      this.currentIndexSubject.next(index);
    }
  }

  /**
   * Get the current index value
   * @returns Current index number
   */
  getCurrentIndex(): number {
    return this.currentIndexSubject.value;
  }

  /**
   * Update a donation entry at the specified index
   * @param index Index of the donation to update
   * @param donation New donation data to apply
   */
  updateDonation(index: number, donation: DonationEntry): void {
    const donations = [...this.donationsSubject.value];
    if (index >= 0 && index < donations.length) {
      donations[index] = donation;
      this.donationsSubject.next(donations);
    }
  }

  /**
   * Create an empty donation entry with defaults
   * @returns A new DonationEntry object with default values
   */
  private createEmptyDonation(): DonationEntry {
    return {
      donorName: '',
      amount: 0,
      date: Date.now(), // Current time as epoch timestamp
      transactionId: ''
    };
  }
}
