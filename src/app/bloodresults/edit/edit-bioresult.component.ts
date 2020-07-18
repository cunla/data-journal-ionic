import {Component, Input, OnInit} from '@angular/core';
import {BioResult, BioService} from '../bio.service';
import {StateProvider} from '../../common/state.provider';
import {ModalController} from '@ionic/angular';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import * as moment from 'moment';
import {BioMetadataService} from '../bio-metadata.service';

@Component({
  selector: 'app-edit',
  templateUrl: './edit-bioresult.component.html',
  styleUrls: ['./edit-bioresult.component.scss'],
})
export class EditBioresultComponent implements OnInit {
  @Input() bioresult: BioResult;
  bioresultForm: FormGroup;


  constructor(private state: StateProvider,
              private modalController: ModalController,
              private fb: FormBuilder,
              private bioService: BioService,
              public bioMetadataService: BioMetadataService,
  ) {
  }

  ngOnInit() {
    this.createForm();
  }


  onSubmit(value) {
    value.date = moment(value.date).toDate();
    if (this.bioresult.id === null || this.bioresult.id === undefined) {
      console.log('Saving bioresult', value);
      this.bioService.create(value).then(
        res => {
          this.bioService.refresh();
          this.bioresultForm.reset();
        }
      );
    } else {
      this.bioService.update(this.bioresult.id, value).then(
        () => {
          this.bioService.refresh();
        }
      );
    }
    this.dismissModal();
  }

  public dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    }).then(() => {
      this.state.modalOpen = false;
    });
  }

  private createForm() {
    this.bioresultForm = this.fb.group({
      type: [this.bioresult.type, Validators.required],
      date: [this.bioresult.date, Validators.required],
      value: [this.bioresult.value, Validators.required],
    },);
  }

}
