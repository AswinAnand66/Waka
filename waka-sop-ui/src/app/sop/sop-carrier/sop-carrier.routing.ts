import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopCarrierComponent  } from './sop-carrier.component';
const routes: Routes = [
  {
    path: '',
    component: SopCarrierComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopCarrierRouting { }

