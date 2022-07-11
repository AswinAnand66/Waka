import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderConfirmationRoutingModule } from './order-confirmation-routing.module';
import { OrderConfirmationGridViewComponent, OrderConfirmationCardViewComponent, CustomViewComponent, SaveViewDialog, OrderConfirmationEditComponent, AddTransactionDialogComponent, UploadAttachmentDialog, OrderConfirmationProductView } from './order-confirmation.component';
import { MatStepperModule } from '@angular/material/stepper';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MaterialModule } from '../material';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

@NgModule({
  declarations: [
    OrderConfirmationGridViewComponent,
    OrderConfirmationCardViewComponent,
    CustomViewComponent,
    SaveViewDialog,
    OrderConfirmationEditComponent,
    AddTransactionDialogComponent,
    UploadAttachmentDialog,
    OrderConfirmationProductView
  ],
  imports: [
    CommonModule,
    MatStepperModule,
    MaterialModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    MatDatepickerModule,
    MatNativeDateModule,
    OrderConfirmationRoutingModule
  ]
})
export class OrderConfirmationModule { }
