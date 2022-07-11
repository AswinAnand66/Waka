import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AcceptDenyComponent} from './accept-deny.component';
const routes: Routes = [
  {
    path: '',
    component: AcceptDenyComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AcceptDenyRoutingModule { }

