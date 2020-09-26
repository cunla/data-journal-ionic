import {Component, Input, OnInit} from '@angular/core';
import {BioResult, BioService} from '../bio.service';
import {FormArray, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {StateProvider} from '../../common/state.provider';
import {LoadingController, ModalController} from '@ionic/angular';
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
              public loadingController: LoadingController,
  ) {
  }

  ngOnInit() {
    this.createForm();
  }

  async onSubmit(value) {
    const loading = await this.loadingController.create({
      message: 'Adding results',
    });
    await loading.present();
    value.date = moment(value.date).toDate();
    let p = [];
    for (const val of value.values) {
      p.push(this.bioService.create(value.date, val.type, val.value));
    }
    Promise.all(p).then((res) => {
      loading.dismiss();
      this.dismissModal();
    });
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
      date: [this.bioresult.date, Validators.required],
      values: this.fb.array([]),
      type: [this.bioresult.type],
    });
  }


  get bioValues(): FormArray {
    return this.bioresultForm.controls['values'] as FormArray;
  }

  addInput(): void {
    const newType = this.bioresultForm.controls['type'].value;
    this.bioresultForm.controls['type'].setValue('');
    const arrayControl = this.bioValues;
    if (arrayControl.getRawValue().some(x => x.type === newType)) {
      return;
    }
    const newGroup = this.fb.group({
      type: [newType, [Validators.required, Validators.minLength(1)]],
      value: [this.bioresult.value, Validators.required],
    });
    arrayControl.push(newGroup);
  }

}
