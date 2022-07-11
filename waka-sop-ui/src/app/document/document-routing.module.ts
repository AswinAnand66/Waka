import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DocumentComponent, AddEditDocumentComponent } from './document.component';

const routes: Routes = [
  {
    path: '',
    component: DocumentComponent,
  },
  {
    path: 'aedoc/:data',
    component: AddEditDocumentComponent,
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DocumentRoutingModule { }
