import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { OrderConfirmationGridViewComponent, OrderConfirmationCardViewComponent, OrderConfirmationEditComponent, OrderConfirmationProductView  } from './order-confirmation.component';

const routes: Routes = [
  {
    path: '',
    component: OrderConfirmationGridViewComponent
  },
  {
    path: 'details',
    component: OrderConfirmationCardViewComponent
  },
  {
    path: 'addTransaction',
    component: OrderConfirmationEditComponent
  },
  {
    path : 'view',
    component: OrderConfirmationProductView
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class OrderConfirmationRoutingModule { }
