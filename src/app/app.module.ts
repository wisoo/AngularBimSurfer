import { BrowserModule } from '@angular/platform-browser';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatInputModule } from '@angular/material/input';
import { AppComponent } from './app.component';
import { BimMeasureUnitHelper } from './bim-measure-unit.helper';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatCardModule } from '@angular/material/card';
import { DataService } from './bim-property-list/ifcObject-data.service';
import { BimPropertyListService } from './bim-property-list.service';
import { HttpClientModule } from '@angular/common/http';
import { BimPropertyListComponent } from './bim-property-list/bim-property-list.component';
import { DataResource } from './resources/ifc-object-resource';
import { LayersSelectorComponent } from './layers-selector/layers-selector.component';
import {MatCheckboxModule, MatFormFieldModule, MatRippleModule, MatTabsModule} from '@angular/material';
import { LoginComponent } from './login/login.component';
import { AppRoutingModule } from './app-routing.module';
import { MAT_LABEL_GLOBAL_OPTIONS } from '@angular/material/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import {BimServerClientService} from './bim-server-client.service';


@NgModule({
  declarations: [
    AppComponent,
    BimPropertyListComponent,
    LayersSelectorComponent,
    LoginComponent,
  ],
  imports: [
    FlexLayoutModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserModule,
    FormsModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatSelectModule,
    MatInputModule,
    MatFormFieldModule,
    MatTableModule,
    MatTreeModule,
    MatIconModule,
    MatButtonModule,
    MatTabsModule,
    MatCheckboxModule,
    MatRippleModule,
    MatDividerModule,
    MatCardModule
  ],
  exports: [
    MatIconModule,
    MatTreeModule,
    MatTableModule,
    MatCheckboxModule,
    MatInputModule,
    ReactiveFormsModule
  ],
  providers: [
    BimServerClientService,
    BimPropertyListService,
    DataService,
    BimMeasureUnitHelper,
    DataResource,
    {provide: MAT_LABEL_GLOBAL_OPTIONS, useValue: {float: 'auto'}}
    ],
  bootstrap: [AppComponent]
})
export class AppModule { }
