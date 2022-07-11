import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopChComponent  } from './sop-ch.component';
const routes: Routes = [
  {
    path: '',
    component: SopChComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopChRouting { }

