import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login.component';
import { PrintLayoutComponent } from '../print-layout/print-layout.component';
import { SopTemplateComponent } from '../sop-template/sop-template.component';
import { AuthGuard } from '../_guards/index';

const routes: Routes = [
  {
    path: '',
    component: LoginComponent,
  },
  {
    path: 'login',
    component: LoginComponent
  },
  { 
    path: 'signup', 
    loadChildren: () => import('../signup/signup.module').then(m => m.SignupModule)
  },
  { 
    path: 'forgotpassword', 
    loadChildren: () => import('../forgot-password/forgot-password.module').then(m => m.ForgotPasswordModule)
  },
  // { 
  //   path: 'changepassword', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../change-password/change-password.module').then(m => m.ChangePasswordModule)
  // },
  // { 
  //   path: 'updateprofile', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../update-profile/update-profile.module').then(m => m.UpdateProfileModule)
  // },
  { 
    path: 'nav', 
    canActivate:[AuthGuard],
    loadChildren: () => import('../sidenav/sidenav.module').then(m => m.SidenavModule)
  },
  // { 
  //   path: 'home', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../home/home.module').then(m => m.HomeModule)
  // },
  // { 
  //   path: 'aesop',
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../sop-add-edit/sop-add-edit.module').then(m => m.SopAddEditModule)
  // },
  // {
  //   path: 'sop', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../sop-grid/sop-grid.module').then(m => m.SopGridModule)
  // },
  // {
  //   path: 'admin', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../admin/admin-module').then(m => m.AdminModule)
  // },
  {
    path: 'register', 
    canActivate:[AuthGuard],
    loadChildren: () => import('../register/register-module').then(m => m.RegisterModule)
  },
  // {
  //   path: 'role', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../role/role-module').then(m => m.RoleModule)
  // },  
  // {
  //   path: 'lookup', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../lookup/lookup.module').then(m => m.LookupModule)
  // },
  // {
  //   path: 'module', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../module/module.module').then(m => m.ModuleModule)
  // },
  // {
  //   path: 'document', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../document/document.module').then(m => m.DocumentModule)
  // },
  // {
  //   path: 'company', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../company/company-module').then(m => m.CompanyModule)
  // },
  // {
  //   path: 'license', 
  //   canActivate:[AuthGuard],
  //   loadChildren: () => import('../license/license.module').then(m => m.LicenseModule)
  // },
  { 
    path: 'print',
    canActivate:[AuthGuard],
    component: PrintLayoutComponent,
    children: [
      { path: 'soptemplate', component: SopTemplateComponent }
    ]
    // children:[
    //   {
    //     path: 'soptemplate',
    //     loadChildren: () => import('../sop-template/sop-template.module').then(m => m.SopTemplateModule)
    //   }
    // ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LoginRoutingModule { }

