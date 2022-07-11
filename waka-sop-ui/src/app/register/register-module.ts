import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent, UserAddEditDialog,MapUserCompanyDialog } from './register.component';

@NgModule({
    imports: [
      CommonModule,
      FlexLayoutModule,
      MaterialModule,
      RegisterRoutingModule,
      FormsModule,
      ReactiveFormsModule
    ],
    declarations: [
        RegisterComponent,
        UserAddEditDialog,
        MapUserCompanyDialog
    ],
    providers: [
    ],
})

export class RegisterModule { }
  
  