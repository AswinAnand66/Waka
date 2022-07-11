import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopStakeholderRouting } from './sop-stakeholder.routing';
import { SopStakeholderComponent } from './sop-stakeholder.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopStakeholderRouting,
    MaterialModule,
  ],
  declarations: [
    SopStakeholderComponent,
  ],
  providers: [
  ],
})
export class SopStakeholderModule { }

