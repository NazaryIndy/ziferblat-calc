import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-calc-page',
  templateUrl: './calc-page.component.html',
  styleUrls: ['./calc-page.component.scss']
})
export class CalcPageComponent implements OnInit {

  isMeridian = false;
  showSpinners = false;
  myTime = new Date();

  constructor() { }

  ngOnInit(): void {
  }

  clear(): void {
    this.myTime = void 0;
  }

}
