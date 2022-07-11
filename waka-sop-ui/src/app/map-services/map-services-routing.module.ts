import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MapServicesComponent, ServicesMapping } from './map-services.component';

const routes: Routes = [
  {
    path: '',
    component: MapServicesComponent
  },
  {
    path: 'mapping',
    component: ServicesMapping
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MapServicesRoutingModule { }
