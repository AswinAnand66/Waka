import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopServiceChargeComponent  } from './sop-service-charge.component';
const routes: Routes = [
  {
    path: '',
    component: SopServiceChargeComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopServiceChargeRouting { }

