import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopChRouting } from './sop-ch.routing';
import { SopChComponent, ChSopEditDialog } from './sop-ch.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopChRouting,
    MaterialModule,
  ],
  declarations: [
    SopChComponent,
    ChSopEditDialog
  ],
  providers: [
  ],
})
export class SopChModule { }

