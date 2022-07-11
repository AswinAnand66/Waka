import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopStakeholderComponent  } from './sop-stakeholder.component';
const routes: Routes = [
  {
    path: '',
    component: SopStakeholderComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopStakeholderRouting { }

