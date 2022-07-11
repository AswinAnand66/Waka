import { MatNativeDateModule , MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopCarrierRouting } from './sop-carrier.routing';
import { SopCarrierComponent,CarrierPrefAddEditDialog, CarrierAddEditDialog } from './sop-carrier.component';
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
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopCarrierRouting,
    MatDatepickerModule,
    MatNativeDateModule,
    MaterialModule,
    MomentDateModule
  ],
  declarations: [
    SopCarrierComponent,
    CarrierPrefAddEditDialog,
    CarrierAddEditDialog
  ],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ],
})
export class SopCarrierModule { }

