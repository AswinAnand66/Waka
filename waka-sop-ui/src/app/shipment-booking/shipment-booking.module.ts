import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from './../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ShipmentBookingComponent, ShipmentBookingViewComponent, ShipmentBookingEditContainer, ShipmentBookingAddPO, CustomViewDialog } from './shipment-booking.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatNativeDateModule , MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { ShipmentBookingRoutingModule } from './shipment-booking-routing.module';
import { MomentDateModule } from '@angular/material-moment-adapter';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MM-YYYY',
  },
  display: {
    dateInput: 'DD-MM-YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@NgModule({
  declarations: [
    ShipmentBookingComponent,
    ShipmentBookingViewComponent,
    ShipmentBookingEditContainer,
    ShipmentBookingAddPO,
    CustomViewDialog
  ],
  imports: [
    CommonModule,
    FlexLayoutModule,
    MaterialModule,
    ShipmentBookingRoutingModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MomentDateModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ],
})
export class ShipmentBookingModule { }
