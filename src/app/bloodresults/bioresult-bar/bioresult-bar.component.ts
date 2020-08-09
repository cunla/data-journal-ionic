import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-bioresultbar',
  templateUrl: './bioresult-bar.component.html',
  styleUrls: ['./bioresult-bar.component.scss'],
})
export class BioresultBarComponent implements OnInit {

  @Input() low: number;
  @Input() high: number;
  @Input() value: number;
  @Input() colorLow: string = "red";
  @Input() colorHigh: string = "red";
  @Input() colorNormal: string = "green";
  showString: string;
  color: string;

  constructor() {
  }

  ngOnInit() {
    if (this.value < this.low) {
      this.showString = "*[.....].";
      this.color = this.colorLow;
    } else if (this.value > this.high) {
      this.showString = ".[.....]*";
      this.color = this.colorHigh;
    } else { // this.low <= this.value <= this.high
      const result = ".....";
      const index = Math.floor(Math.abs(this.value - this.low-1) / (this.high - this.low) * 5);
      this.showString = ".["+result.substr(0, index) + "*" + result.substr(index + 1)+"].";
      this.color = this.colorNormal;
    }
  }

}
