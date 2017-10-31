import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';

import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MdButtonModule,
         MdCardModule,
         MdFormFieldModule,
         MdInputModule,
         MdSelectModule,
         MdProgressSpinnerModule,
         MdDialogModule } from '@angular/material';
import { BarChartComponent } from './bar-chart/bar-chart.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpService } from './http.service';
import { ErrorDialogComponent } from './error-dialog/error-dialog.component';

@NgModule({
  declarations: [
    AppComponent,
    BarChartComponent,
    ErrorDialogComponent
  ],
  entryComponents: [
    ErrorDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MdCardModule,
    MdSelectModule,
    MdFormFieldModule,
    MdInputModule,
    MdButtonModule,
    MdProgressSpinnerModule,
    MdDialogModule
  ],
  providers: [HttpService],
  bootstrap: [AppComponent]
})
export class AppModule { }
