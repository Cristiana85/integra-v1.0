import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TooltipModule } from 'primeng/tooltip';
import { DividerModule } from 'primeng/divider';
import { AppCodeModule } from '../app.code.component';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    AppCodeModule,
    DividerModule,
    TooltipModule
  ],
  exports: [
    AppCodeModule,
    TooltipModule,
    DividerModule,
  ]
})
export class PrimeblocksModule { }
