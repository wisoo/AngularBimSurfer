import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { AppRoutingModule } from './app-routing.module';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import { ViewerComponent } from './viewer.component';
import {UserLoginService} from '../user-login/user-login.service';

@NgModule({
  declarations: [
    ViewerComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    MatSelectModule,
    BrowserAnimationsModule
  ],
  providers: [
    UserLoginService
  ],
  exports: [
    ViewerComponent
  ],
  bootstrap: [ViewerComponent]
})
export class ViewerModule { }
