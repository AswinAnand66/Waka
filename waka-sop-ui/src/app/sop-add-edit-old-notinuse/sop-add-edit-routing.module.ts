import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopAddEditComponent } from './sop-add-edit.component';
const routes: Routes = [
  {
    path: '',
    component: SopAddEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopAddEditRoutingModule { }

