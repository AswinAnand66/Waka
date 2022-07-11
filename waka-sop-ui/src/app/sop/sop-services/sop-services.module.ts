import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopServicesRouting } from './sop-services.routing';
import { SopServicesComponent } from './sop-services.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopServicesRouting,
    MaterialModule,
  ],
  declarations: [
    SopServicesComponent,
  ],
  providers: [
  ],
})
export class SopServicesModule { }

