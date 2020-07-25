import {Component, Input, OnInit} from '@angular/core';
import {BioResult, BioService} from '../bio.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {StateProvider} from '../../common/state.provider';
import {AlertController, ModalController} from '@ionic/angular';
import {BioMetadataService} from '../bio-metadata.service';
import * as moment from 'moment';

@Component({
  selector: 'app-add-bioresult',
  templateUrl: './add-bioresult.component.html',
  styleUrls: ['./add-bioresult.component.scss'],
})
export class AddBioresultComponent implements OnInit {
  @Input() bioresult: BioResult;
  bioresultForm: FormGroup;


  constructor(private state: StateProvider,
              private modalController: ModalController,
              private fb: FormBuilder,
              private bioService: BioService,
              public bioMetadataService: BioMetadataService,
              private alertController: AlertController,
  ) {
  }

  ngOnInit() {
    this.createForm();
  }


  async onSubmit(value) {
    const previousDate = value.date;
    value.date = moment(value.date).toDate();
    console.log('Saving new bioresult', value);
    this.bioService.create(value).then(
      (res) => {
        this.bioService.refresh();
      }
    );
    const alert = await this.alertController.create({
      header: 'Additional result',
      message: 'Would you like to add an additional result with this date?',
      buttons: [
        {
          text: 'No',
          handler: () => {
            console.log('User chose not to add additional result, closing modal');
            this.dismissModal();
          }
        }, {
          text: 'Yes',
          handler: () => {
            this.bioresultForm.reset();
            this.bioresultForm.setValue({
              type: '',
              value: null,
              date: previousDate,
            });
          }
        }
      ]
    });
    await alert.present();
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
