import {Component, Input, OnInit} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {IioService, InterviewInterface, InterviewStatus} from '../iio.service';
import {StateProvider} from '../../common/state.provider';
import {ModalController} from '@ionic/angular';

export const INTERVIEW_TYPES = [{
  name: 'Standard coding',
  value: '50',
}, {
  name: 'Company coding',
  value: '115',
}, {
  name: 'Systems Design',
  value: '100',
}, {
  name: 'Company Systems Design',
  value: '150',
}, {
  name: 'Behavioral',
  value: '115',
}, {
  name: 'Company Behavioral',
  value: '150',
},];

@Component({
  selector: 'app-edit-interview',
  templateUrl: './edit-interview.component.html',
  styleUrls: ['./edit-interview.component.scss'],
})
export class EditInterviewComponent implements OnInit {
  @Input() interview: InterviewInterface;
  interviewForm: FormGroup;
  interviewTypes = INTERVIEW_TYPES;
  InterviewStatusTypes = Object.keys(InterviewStatus);

  constructor(public iio: IioService,
              private state: StateProvider,
              private fb: FormBuilder,
              public modalController: ModalController,) {
  }

  ngOnInit() {
    this.createForm();
  }

  onSubmit(value) {
    if (this.interview.id === null || this.interview.id === undefined) {
      console.log('Saving interview', value);
      this.iio.create(value).then(
        () => {
          this.iio.refresh();
          this.interviewForm.reset();
        }
      );
    } else {
      this.iio.update(this.interview.id, value).then(() => {
        this.iio.refresh();
      });
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
    const plannedDate = new Date(this.interview.plannedDate).toISOString();
    const paidDate = this.interview.paidDate ? new Date(this.interview.paidDate).toISOString() : null;
    this.interviewForm = this.fb.group({
      plannedDate: [plannedDate, Validators.required],
      type: [this.interview.type, Validators.required],
      candidateName: [this.interview.candidateName,],
      feedback: [this.interview.feedback,],
      value: [this.interview.value, Validators.required],
      status: [this.interview.status, Validators.required],
      paidDate: [paidDate,],
    }, {});
  }

  interviewTypeChanged($event: any) {
    const interviewTypeValue = $event.detail.value;
    const interviewType = INTERVIEW_TYPES.find(x => x.name === interviewTypeValue);
    if (interviewType) {
      this.interviewForm.get('value').setValue(interviewType.value);
    }
  }
}
