import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CodeComponent } from './code.component';
import { PrettyPrinterService } from './pretty-printer.service';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  imports: [CommonModule, ClipboardModule],
  declarations: [CodeComponent],
  entryComponents: [CodeComponent],
  exports: [CodeComponent],
  providers: [PrettyPrinterService],
})
export class CodeModule { }
