import { Component, forwardRef, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

/**
 * Reusable CKEditor 5 rich-text field usable inside reactive forms — mirrors
 * the original's use of CKEditor for order instructions and product
 * descriptions.
 */
@Component({
  selector: 'wd-rich-text-editor',
  standalone: true,
  imports: [CommonModule, CKEditorModule],
  template: `
    <ckeditor
      [editor]="Editor"
      [data]="value"
      [config]="config"
      [disabled]="disabled"
      (change)="onEditorChange($event)"
    ></ckeditor>
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => RichTextEditorComponent),
      multi: true,
    },
  ],
})
export class RichTextEditorComponent implements ControlValueAccessor {
  @Input() placeholder = '';

  readonly Editor: any = ClassicEditor;
  value = '';
  disabled = false;

  get config() {
    return {
      placeholder: this.placeholder,
      toolbar: [
        'heading',
        '|',
        'bold',
        'italic',
        'link',
        'bulletedList',
        'numberedList',
        '|',
        'blockQuote',
        'insertTable',
        '|',
        'undo',
        'redo',
      ],
    };
  }

  private onChange: (v: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(value: string): void {
    this.value = value ?? '';
  }
  registerOnChange(fn: (v: string) => void): void {
    this.onChange = fn;
  }
  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }
  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onEditorChange({ editor }: { editor: { getData(): string } }): void {
    this.value = editor.getData();
    this.onChange(this.value);
    this.onTouched();
  }
}
