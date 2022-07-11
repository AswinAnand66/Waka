import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopLandingCostRoutingModule } from './sop-landing-cost-routing.module';
import { SopLandingCostComponent } from './sop-landing-cost.component';


@NgModule({
  declarations: [SopLandingCostComponent],
  imports: [
    CommonModule,
    SopLandingCostRoutingModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    MaterialModule,
  ]
})
export class SopLandingCostModule { }
