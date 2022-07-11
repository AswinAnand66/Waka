import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { ContractRoutingModule } from './contract-routing.module';
import { ContractComponent, ContractAddDialog } from './contract.component';
import { LoginHeaderModule } from '../login-header/login-header.module';
import { MatNativeDateModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateModule } from '@angular/material-moment-adapter';

export const MY_DATE_FORMATS = {
  parse: {
    dateInput: 'DD-MMM-YYYY',
  },
  display: {
    dateInput: 'DD-MMM-YYYY',
    monthYearLabel: 'MMMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY'
  },
};

@NgModule({
  declarations: [ContractComponent, ContractAddDialog],
    imports: [
      CommonModule,
      FormsModule, 
      ReactiveFormsModule,
      FlexLayoutModule,
      ContractRoutingModule,
      MaterialModule,
      LoginHeaderModule,
      MatDatepickerModule,
      MatNativeDateModule,
      MomentDateModule
    ],
    providers: [
      {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
    ],
})
export class ContractModule { }
