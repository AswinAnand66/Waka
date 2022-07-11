import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RoleComponent, AddEditRoleComponent } from './role.component';

const routes: Routes = [
  {
    path: '',
    component: RoleComponent,
  },
  {
    path:'AddEditRole',
    component: AddEditRoleComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RoleRoutingModule { }

