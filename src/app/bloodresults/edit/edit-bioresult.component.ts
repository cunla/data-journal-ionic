import {Component, Input, OnInit} from '@angular/core';
import {BioResult, BioService} from '../bio.service';
import {ModalController} from '@ionic/angular/lazy';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {BioMetadataService} from '../bio-metadata.service';
import {DateTime} from "luxon";

@Component({
    selector: 'app-edit',
    templateUrl: './edit-bioresult.component.html',
    styleUrls: ['./edit-bioresult.component.scss'],
    standalone: false
})
export class EditBioresultComponent implements OnInit {
  @Input() bioresult: BioResult;
  bioresultForm: FormGroup;


  constructor(private modalController: ModalController,
              private fb: FormBuilder,
              private bioService: BioService,
              public bioMetadataService: BioMetadataService,
  ) {
  }

  ngOnInit() {
    this.createForm();
  }


  onSubmit(value) {
    value.date = DateTime.fromISO(value.date).toJSDate();
    this.bioService.update(this.bioresult.id, value).then(() => {
        this.bioService.refresh();
        this.dismissModal();
      }
    );

  }

  public dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }

  private createForm() {
    const date = DateTime.fromJSDate(this.bioresult.date || null).toISODate();
    this.bioresultForm = this.fb.group({
      type: [this.bioresult.type, Validators.required],
      date: [date, Validators.required],
      value: [this.bioresult.value, Validators.required],
    },);
  }

}
