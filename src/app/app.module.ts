import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms';
import { NgModule } from '@angular/core';
import { MatSelectModule } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppComponent } from './app.component';
import { BimMeasureUnitHelper } from './bim-measure-unit.helper';
import { MatTableModule } from '@angular/material/table';
import { MatTreeModule } from '@angular/material/tree';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import {DataService} from './bim-property-list/ifcObject-data.service';
import { BimPropertyListService } from './bim-property-list.service';
import {HttpClientModule} from '@angular/common/http';
import { BimPropertyListComponent } from './bim-property-list/bim-property-list.component';
import {Data} from '@angular/router';
import {DataResource} from './resources/ifc-object-resource';

@NgModule({
    declarations: [
        AppComponent,
        BimPropertyListComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        MatSelectModule,
        BrowserAnimationsModule,
        MatTableModule,
        MatTreeModule,
        MatIconModule,
        MatButtonModule,
        HttpClientModule
    ],
    exports: [
        MatIconModule,
        MatTreeModule,
        MatTableModule,

    ],
    providers: [BimPropertyListService, DataService, BimMeasureUnitHelper, DataResource],
    bootstrap: [AppComponent]
})
export class AppModule { }
