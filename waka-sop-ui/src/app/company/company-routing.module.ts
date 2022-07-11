import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CompanyComponent, CompanyAddEdit, InviteCompanyComponent, AddContactCompanyComponent, CompanyCardViewComponent, AssociatedCompanyCardViewComponent } from './company.component';
const routes: Routes = [
  {
    path: '',
    component: CompanyComponent,
  },
  {
    path: 'AddEditCompany',
    component: CompanyAddEdit,
  },
  {
    path: 'InviteCompany',
    component: InviteCompanyComponent,
  },
  {
    path: 'AddCompanyContact',
    component: AddContactCompanyComponent,
  },
  {
    path: 'details',
    component:CompanyCardViewComponent
  },
  {
    path: 'associatedCompanyDetails',
    component:AssociatedCompanyCardViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CompanyRoutingModule { }

