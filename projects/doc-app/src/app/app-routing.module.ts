import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './pages/home/home.component';
import { DataProtocolComponent } from './pages/data-protocol/data-protocol.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'data-protocol', component: DataProtocolComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
