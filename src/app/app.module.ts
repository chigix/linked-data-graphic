import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LinkedDataGraphicModule } from 'linked-data-graphic';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { NavigationComponent } from './modules/navigation/navigation.component';
import { CodeModule } from './modules/code/code.module';
import { LayoutModule } from '@angular/cdk/layout';
import {
  MatToolbarModule,
  MatButtonModule,
  MatSidenavModule,
  MatIconModule,
  MatListModule
} from '@angular/material';

import { HomeComponent } from './pages/home/home.component';
import { DataProtocolComponent } from './pages/data-protocol/data-protocol.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavigationComponent,
    DataProtocolComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    CodeModule,
    LinkedDataGraphicModule,
    LayoutModule,
    MatToolbarModule,
    MatButtonModule,
    MatSidenavModule,
    MatIconModule,
    MatListModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
