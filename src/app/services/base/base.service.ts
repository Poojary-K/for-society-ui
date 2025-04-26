import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BaseService {
  /**
   * Base service to provide common functionality for all services
   */

  constructor() {}

  /**
   * Creates a new BehaviorSubject and corresponding Observable
   * @param initialValue Initial value for the BehaviorSubject
   * @returns Object containing subject, observable, and helper methods
   */
  protected createState<T>(initialValue: T): {
    subject: BehaviorSubject<T>;
    observable: Observable<T>;
    getValue: () => T;
    setValue: (value: T) => void;
  } {
    const subject = new BehaviorSubject<T>(initialValue);
    const observable = subject.asObservable();

    return {
      subject,
      observable,
      getValue: () => subject.value,
      setValue: (value: T) => subject.next(value)
    };
  }
}
