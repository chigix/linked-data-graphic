import {
  ElementRef, AfterViewInit, Component,
  Input, Output, EventEmitter, ViewChild,
} from '@angular/core';
import { PrettyPrinterService } from './pretty-printer.service';
import { tap } from 'rxjs/operators';
import { ClipboardService } from 'ngx-clipboard';

/**
 * If linenums is not set, this is the default maximum number of lines that
 * an example can display without line numbers.
 */
const DEFAULT_LINE_NUMBS_COUNT = 10;

/**
 * Formatted Code Block
 *
 * Pretty renders a code block, used in the docs and API reference by the
 * code-example and code-tabs embedded components.
 *
 * It includes a "copy" button that will send the content to the clipboard
 * when clicked.
 */
@Component({
  selector: 'app-code',
  templateUrl: './code.component.html',
  styleUrls: ['./code.component.scss']
})
export class CodeComponent implements AfterViewInit {

  private ariaLabel = '';

  /** The code to be copied when clicking the copy button, this should not be HTML encoded */
  private codeText: string;
  private rawCode: string;
  private rawHeader: string;

  /** Whether the copy button should be shown */
  @Input() hideCopy: boolean;

  /** Language to render the code (e.g. javascript, dart, typescript). */
  @Input() language = 'markdown';

  /** Whether to display line numbers */
  @Input() lineNumbs: boolean | number;

  @Output() codeFormatted = new EventEmitter<void>();

  @ViewChild('codeContainer')
  codeContainer: ElementRef;

  @ViewChild('content')
  content: ElementRef<HTMLDivElement>;

  constructor(
    private pretty: PrettyPrinterService,
    private clipbardService: ClipboardService,
  ) { }

  ngAfterViewInit() {
    const expectingTextNode = this.content.nativeElement.childNodes[0];
    this.code = expectingTextNode ?
      expectingTextNode.nodeValue
      : this.content.nativeElement.innerHTML;
    if (this.code) {
      this.formatDisplayedCode();
    }
  }

  public set code(code: string) {
    this.rawCode = code;
  }

  public get code() {
    return this.rawCode;
  }

  @Input()
  public set header(header: string) {
    this.rawHeader = header;
  }

  public get header(): string {
    return this.rawHeader;
  }

  private formatDisplayedCode() {
    const leftAlignedCode = leftAlign(this.code);
    this.setCodeHtml(leftAlignedCode);
    this.codeText = this.getCodeText();
    this.pretty.formatCode(leftAlignedCode,
      this.language, this.getLineNumbs(leftAlignedCode))
      .pipe(tap(() => this.codeFormatted.emit()))
      .subscribe(c => this.setCodeHtml(c), err => { /* ignore failure to format */ });
  }

  private setCodeHtml(formattedCode: string) {
    this.codeContainer.nativeElement.innerHTML = formattedCode;
  }

  private getCodeText() {
    return this.codeContainer.nativeElement.textContent;
  }

  doCopy() {
    const code = this.codeText;
    const successfullyCopied = this.clipbardService.copyFromContent(code);
  }

  private getLineNumbs(code: string) {
    return isNaN(this.lineNumbs as number) ?
      code.split('\n').length > DEFAULT_LINE_NUMBS_COUNT : this.lineNumbs;
  }

}

function leftAlign(text: string) {
  let indent = Number.MAX_VALUE;
  const lines = text.split('\n');
  lines.forEach(line => {
    const lineIndent = line.search(/\S/);
    if (lineIndent !== -1) {
      indent = Math.min(lineIndent, indent);
    }
  });
  return lines.map(line => line.substr(indent)).join('\n').trim();
}
