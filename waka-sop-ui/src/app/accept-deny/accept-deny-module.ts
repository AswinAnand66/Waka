import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { AcceptDenyRoutingModule } from './accept-deny-routing.module';
import { LoginHeaderModule } from '../login-header/login-header.module';
import { MatStepperModule } from '@angular/material/stepper';
import { AcceptDenyComponent } from './accept-deny.component';

@NgModule({
    imports: [
      CommonModule,
      FlexLayoutModule,
      MaterialModule,
      AcceptDenyRoutingModule,
      FormsModule,
      LoginHeaderModule,
      ReactiveFormsModule,
      MatStepperModule,
    ],
    declarations: [
        AcceptDenyComponent,
    ],
    providers: [
    ],
})

export class AcceptDenyModule { }
  
  