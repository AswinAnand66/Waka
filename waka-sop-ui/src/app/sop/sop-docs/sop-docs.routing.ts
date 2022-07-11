import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopDocsComponent  } from './sop-docs.component';
const routes: Routes = [
  {
    path: '',
    component: SopDocsComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopDocsRouting { }

