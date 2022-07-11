import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopGridComponent as SopGridComponent } from './sop-grid.component';
import { PrintLayoutComponent } from '../print-layout/print-layout.component';
import { SopTemplateComponent } from '../sop-template/sop-template.component';

const routes: Routes = [
  {
    path: '',
    component: SopGridComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopGridRoutingModule { }

