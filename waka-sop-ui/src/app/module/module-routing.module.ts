import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ModuleComponent,ModuleDetails } from './module.component';

const routes: Routes = [
  {
    path: '',
    component: ModuleComponent
  },{
    path: 'Details',
    component: ModuleDetails,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ModuleRoutingModule { }
