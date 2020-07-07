import { Component, OnInit, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss']
})
export class TimepickerComponent implements OnInit {

  @ViewChild('hours') hoursInput: ElementRef;
  @ViewChild('minutes') minutesInput: ElementRef;

  @Output() public changed = new EventEmitter<any>();

  public form: FormGroup;
  public control: FormControl;

  constructor(private fb: FormBuilder) {}

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.hoursInput.nativeElement.focus();
      this.hoursInput.nativeElement.setSelectionRange(0, 0);
    }, 0);
  }

  public buildForm(): void {
    this.form = this.fb.group({
      hours: [''],
      minutes: ['']
    });
  }

  public checkInputHours(control: AbstractControl): void {
    if (control.value.length === 2) {
      this.minutesInput.nativeElement.setSelectionRange(0, 0);
      this.minutesInput.nativeElement.focus();
    }
    if (control.value >= 24) {
      control.setValue(24);
    }
    this.changed.emit(this.form.value);
  }

  public checkOnEmptyValue(control: AbstractControl): void {
    if (control.value === '') {
      control.setValue('');
    } else {
      if (control.value < 10) {
        control.setValue(`0${parseInt(control.value, 10)}`);
      }
    }
  }

  public checkInputMinutes(control: AbstractControl, event: KeyboardEvent): void {
    if (control.value > 59) {
      control.patchValue(59);
    } else {
      if (this.form.get('hours').value === 24) {
        control.setValue('00');
      }
    }
    this.changed.emit(this.form.value);

    if (event.keyCode === 8 && this.form.get('minutes').value.length === 0) {
      this.hoursInput.nativeElement.focus();
    }
  }

}
