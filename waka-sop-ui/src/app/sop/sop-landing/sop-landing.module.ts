import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopLandingRouting } from './sop-landing.routing';
import { SopLandingComponent } from './sop-landing.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopLandingRouting,
    MaterialModule,
  ],
  declarations: [
    SopLandingComponent,
  ],
  providers: [
  ],
})
export class SopLandingModule { }

