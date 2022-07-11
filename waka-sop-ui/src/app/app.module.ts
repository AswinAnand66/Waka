import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatIconModule } from '@angular/material/icon';
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';
import { ReusableComponent, ConfirmDialog } from './reusable/reusable.component';
import { AlertComponent } from './_directives';
import { AuthenticationService, PrintService } from './_services/index';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientModule } from '@angular/common/http';
import { AuthInterceptor} from  './_services/auth.interceptor';
import { AuthGuard } from './_guards/index';
import { FlexLayoutModule } from '@angular/flex-layout';

@NgModule({
  declarations: [
    AppComponent,
    ReusableComponent,
    ConfirmDialog,
    AlertComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    MatSnackBarModule,
    MatIconModule,
    FlexLayoutModule,
    HttpClientModule
  ],
  providers: [
    AuthGuard,
    AuthenticationService,
    PrintService,
    ReusableComponent,
    {provide: MAT_SNACK_BAR_DEFAULT_OPTIONS, useValue: {duration: 5000,panelClass:['snackbar']}},
    {provide: HTTP_INTERCEPTORS, useClass:AuthInterceptor, multi:true},
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
