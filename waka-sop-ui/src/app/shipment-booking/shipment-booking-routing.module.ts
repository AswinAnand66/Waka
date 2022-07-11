import { ShipmentBookingComponent, ShipmentBookingViewComponent, ShipmentBookingEditContainer, ShipmentBookingAddPO } from './shipment-booking.component';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    component: ShipmentBookingComponent,
  },
  {
    path: 'view',
    component: ShipmentBookingViewComponent,
  },
  {
    path: 'view/container_selection',
    component: ShipmentBookingEditContainer,
  },
  {
    path: 'view/add_po',
    component: ShipmentBookingAddPO,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ShipmentBookingRoutingModule { }
