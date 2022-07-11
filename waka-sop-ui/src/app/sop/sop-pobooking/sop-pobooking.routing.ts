import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SopPobookingComponent  } from './sop-pobooking.component';
const routes: Routes = [
  {
    path: '',
    component: SopPobookingComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SopPobookingRouting { }

