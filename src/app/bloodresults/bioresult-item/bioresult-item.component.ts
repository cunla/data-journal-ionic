import {Component, EventEmitter, Input, Output} from '@angular/core';
import {BioService} from "../bio.service";
import {ModalController} from "@ionic/angular";
import {StateProvider} from "../../common/state.provider";

@Component({
    selector: 'app-bioresult-item',
    templateUrl: './bioresult-item.component.html',
    styleUrls: ['./bioresult-item.component.scss'],
    standalone: false
})
export class BioresultItemComponent {
  @Input() label: string;
  @Input() low: number;
  @Input() high: number;
  @Input() value: number;
  @Input() units: number;
  @Output() editClicked = new EventEmitter();
  @Output() deleteClicked = new EventEmitter();

  constructor(private modalController: ModalController,
              private state: StateProvider,
              private bioService: BioService) {
  }

  itemBadgeColor() {
    return (this.value < this.low || this.value > this.high) ? 'danger' : 'success';
  }
}
