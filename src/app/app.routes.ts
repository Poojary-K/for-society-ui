import { Routes } from '@angular/router';
import { HomeComponent } from './main-content/home/home.component';
import { DonationsComponent } from './main-content/donations/donations.component';
import { ContributionsComponent } from './main-content/contributions/contributions.component';
import { MainContentComponent } from './main-content/main-content.component';
import { LandingComponent } from './landing/landing.component';

export const routes: Routes = [
  { path: '', component: LandingComponent, pathMatch: 'full' },
  {
    path: 'main',
    component: MainContentComponent,
    children: [
      { path: '', redirectTo: 'home', pathMatch: 'full' },
      { path: 'home', component: HomeComponent },
      { path: 'donations', component: DonationsComponent },
      { path: 'contributions', component: ContributionsComponent }
    ]
  },
  { path: '**', redirectTo: '' }
];
