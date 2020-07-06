import { Component, OnInit, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-timepicker',
  templateUrl: './timepicker.component.html',
  styleUrls: ['./timepicker.component.scss']
})
export class TimepickerComponent implements OnInit {

  @ViewChild('hours') hoursInput: ElementRef;
  @ViewChild('minutes') minutesInput: ElementRef;

  @Input() public set controlInput(control: FormControl) {
    this.control = control;
    this.buildForm();
  }

  @Output() public changed = new EventEmitter<any>();

  public form: FormGroup;
  public control: FormControl;

  constructor(private fb: FormBuilder) { }

  ngOnInit() {
    this.buildForm();
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.hoursInput.nativeElement.focus();
      this.hoursInput.nativeElement.setSelectionRange(0, 0);
    }, 0);
  }

  private buildForm(): void {
    this.form = this.fb.group({
      hours: [this.getHours(this.control.value) || '00'],
      minutes: [this.getMinutes(this.control.value) || '00']
    });
    this.form.valueChanges.subscribe(() => this.setControlValue());
  }

  private sendData(): void {
    this.changed.emit(this.form.value);
  }

  public checkInputHours(control: AbstractControl): void {
    if (control.value.length === 2 && control.value !== '00') {
      this.minutesInput.nativeElement.setSelectionRange(0, 0);
      this.minutesInput.nativeElement.focus();
    }
    if (control.value >= 24) {
      control.setValue(24);
      this.form.get('minutes').setValue('00');
    }
    this.sendData();
  }

  public checkOnEmptyValue(control: AbstractControl): void {
    if (control.value === '') {
      control.setValue('00');
    } else {
      if (control.value < 10) {
        control.setValue(`0${parseInt(control.value, 10)}`);
      }
    }
  }

  public checkInputMinutes(control: AbstractControl): void {
    if (control.value > 59) {
      control.patchValue(59);
    } else {
      if (this.form.get('hours').value === 24) {
        control.setValue('00');
      }
    }
    this.sendData();
  }

  public setControlValue(): void {
    const time = this.form.get('hours').value * 3600 + this.form.get('minutes').value * 60;
    this.control.setValue(time);
  }

  private getHours(time: number): number|string {
    const hours = Math.floor(time / 3600);
    return hours >= 10 ? hours : `0${hours}`;
  }

  private getMinutes(time: number): number|string {
    const minutes = time % 3600 / 60;
    return minutes >= 10 ? minutes : `0${minutes}`;
  }

}
