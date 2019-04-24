import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { share, map, first } from 'rxjs/operators';
import { PrismJs } from './types';

@Injectable()
export class PrettyPrinterService {

  private printer: Observable<PrismJs>;

  constructor() {
    this.printer = from(import('prismjs')).pipe(share());
  }

  formatCode(code: string, language: string, linenums?: number | boolean) {
    return this.printer.pipe(
      map(printer => printer.highlight(code, printer.languages[language], language)),
      first(),
    );
  }
}
