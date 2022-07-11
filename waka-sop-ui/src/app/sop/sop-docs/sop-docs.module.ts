import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule} from '@angular/forms';
import { MaterialModule } from '../../material';
import { FlexLayoutModule } from '@angular/flex-layout';
import { SopDocsRouting } from './sop-docs.routing';
import { SopDocsComponent, DocAddEditDialog } from './sop-docs.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule, 
    ReactiveFormsModule,
    FlexLayoutModule,
    SopDocsRouting,
    MaterialModule,
  ],
  declarations: [
    SopDocsComponent,
    DocAddEditDialog
  ],
  providers: [
  ],
})
export class SopDocsModule { }

