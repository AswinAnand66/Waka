import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DocumentRoutingModule } from './document-routing.module';
import { DocumentComponent, AddEditDocumentComponent } from './document.component';
import { MaterialModule } from '../material';
import { RouterModule } from '@angular/router';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { LoginHeaderModule } from '../login-header/login-header.module';

@NgModule({
  declarations: [DocumentComponent, AddEditDocumentComponent],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FlexLayoutModule,
    LoginHeaderModule,
    FormsModule, 
    ReactiveFormsModule,
    DocumentRoutingModule
  ]
})
export class DocumentModule { }
