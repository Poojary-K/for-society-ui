import { Routes } from '@angular/router';
import { HomeComponent } from './main-content/home/home.component';
import { DonationsComponent } from './main-content/donations/donations.component';
import { ContributionsComponent } from './main-content/contributions/contributions.component';

export const routes: Routes = [
  {
    path: '',
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'donations', component: DonationsComponent },
      { path: 'contributions', component: ContributionsComponent }
    ]
  }
];
