import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SidenavComponent} from './sidenav.component';
import { AuthGuard } from '../_guards/index';

const routes: Routes = [
  {
    path: '',
    component: SidenavComponent,
    children: [
      { 
        path: 'home', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../home/home.module').then(m => m.HomeModule)
      },
      { 
        path: 'changepassword', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../change-password/change-password.module').then(m => m.ChangePasswordModule)
      },
      { 
        path: 'updateprofile', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../update-profile/update-profile.module').then(m => m.UpdateProfileModule)
      },
      {
        path: 'company', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../company/company-module').then(m => m.CompanyModule)
      },
      // { 
      //   path: 'aesop',
      //   canActivate:[AuthGuard],
      //   loadChildren: () => import('../sop-add-edit-old-notinuse/sop-add-edit.module').then(m => m.SopAddEditModule)
      // },
      { 
        path: 'soplanding',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop/sop-landing/sop-landing.module').then(m => m.SopLandingModule)
      },
      {
        path: 'sop', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-grid/sop-grid.module').then(m => m.SopGridModule)
      },
      {
        path: 'contracts', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../contract/contract.module').then(m => m.ContractModule)
      },
      {
        path: 'po_ingestion', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../po-ingestion/po-ingestion.module').then(m => m.PoIngestionModule)
      },
      {
        path: 'admin', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../admin/admin-module').then(m => m.AdminModule)
      },
      {
        path: 'admin/services', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../services/services.module').then(m => m.ServicesModule)
      },
      {
        path: 'admin/map-enabled-services', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../map-services/map-services.module').then(m => m.MapServicesModule)
      },
      {
        path: 'admin/scheduler-status', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../scheduler-status/scheduler-status.module').then(m => m.SchedulerStatusModule)
      },
      {
        path: 'roles', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../role/role-module').then(m => m.RoleModule)
      },  
      {
        path: 'lookup', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../lookup/lookup.module').then(m => m.LookupModule)
      },
      {
        path: 'module', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../module/module.module').then(m => m.ModuleModule)
      },
      {
        path: 'document', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../document/document.module').then(m => m.DocumentModule)
      },
      {
        path: 'license', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../license/license.module').then(m => m.LicenseModule)
      },
      {
        path: 'orderpo', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../order-confirmation/order-confirmation.module').then(m => m.OrderConfirmationModule)
      },
      {
        path: 'shipment_booking', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../shipment-booking/shipment-booking.module').then(m => m.ShipmentBookingModule)
      },
      {
        path: 'acceptdeny', 
        canActivate:[AuthGuard],
        loadChildren: () => import('../accept-deny/accept-deny-module').then(m => m.AcceptDenyModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})

export class SidenavRoutingModule { }

