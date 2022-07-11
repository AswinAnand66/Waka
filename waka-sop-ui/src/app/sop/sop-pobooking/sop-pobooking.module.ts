import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopPobookingRouting } from './sop-pobooking.routing';
import { SopPobookingComponent, POBSopEditDialog } from './sop-pobooking.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopPobookingRouting,
    MaterialModule,
  ],
  declarations: [
    SopPobookingComponent,
    POBSopEditDialog
  ],
  providers: [
  ],
})
export class SopPobookingModule { }

