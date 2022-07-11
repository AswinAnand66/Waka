import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopLandingComponent  } from './sop-landing.component';
import { AuthGuard } from '../../_guards/index';

const routes: Routes = [
  {
    path: '',
    component: SopLandingComponent,
    children: [
      { 
        path: 'sopstakeholder',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-stakeholder/sop-stakeholder.module').then(m => m.SopStakeholderModule)
      },
      { 
        path: 'sopservices',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-services/sop-services.module').then(m => m.SopServicesModule)
      },
      { 
        path: 'soppobooking',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-pobooking/sop-pobooking.module').then(m => m.SopPobookingModule)
      },
      { 
        path: 'sopdocs',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-docs/sop-docs.module').then(m => m.SopDocsModule)
      },
      { 
        path: 'sopch',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-ch/sop-ch.module').then(m => m.SopChModule)
      },
      { 
        path: 'sopcarrier',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-carrier/sop-carrier.module').then(m => m.SopCarrierModule)
      },
      { 
        path: 'ssc',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-service-charge/sop-service-charge.module').then(m => m.SopServiceChargeModule)
      },
      { 
        path: 'lc',
        canActivate:[AuthGuard],
        loadChildren: () => import('../sop-landing-cost/sop-landing-cost.module').then(m => m.SopLandingCostModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopLandingRouting { }

