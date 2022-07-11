import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopServicesComponent  } from './sop-services.component';
const routes: Routes = [
  {
    path: '',
    component: SopServicesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopServicesRouting { }

