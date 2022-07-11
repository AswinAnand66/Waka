import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopServiceChargeRouting } from './sop-service-charge.routing';
import { SopServiceChargeComponent, CopyData } from './sop-service-charge.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopServiceChargeRouting,
    MaterialModule,
  ],
  declarations: [
    SopServiceChargeComponent,
    CopyData
  ],
  providers: [
  ],
})
export class SopServiceChargeModule { }

