import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { share, map, first } from 'rxjs/operators';
import * as prismjs from 'prismjs';

@Injectable()
export class PrettyPrinterService {

  private printer: Observable<typeof prismjs>;

  constructor() {
    // TODO: Refactor needed
    this.printer = from(import('prismjs')).pipe(share());
  }

  formatCode(code: string, language: string, linenums?: number | boolean) {
    return this.printer.pipe(
      map(printer => printer.highlight(code, printer.languages[language], language)),
      first(),
    );
  }
}
