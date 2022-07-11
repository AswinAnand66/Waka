import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopGridRoutingModule } from './sop-grid-routing.module';
import { SopGridComponent,ValidateSopDialog } from './sop-grid.component';
import { LoginHeaderModule } from '../login-header/login-header.module';
import { MatNativeDateModule, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MomentDateModule } from '@angular/material-moment-adapter';
// import { PrintLayoutComponent } from '../print-layout/print-layout.component';
// import { SopTemplateComponent } from '../sop-template/sop-template.component';

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
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopGridRoutingModule,
    MaterialModule,
    LoginHeaderModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MomentDateModule
  ],
  declarations: [
    SopGridComponent,
    ValidateSopDialog
    // PrintLayoutComponent,
    // SopTemplateComponent
  ],
  providers: [
    {provide: MAT_DATE_FORMATS, useValue: MY_DATE_FORMATS}
  ],
})
export class SopGridModule { }

