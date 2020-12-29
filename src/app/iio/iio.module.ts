import {NgModule} from '@angular/core';
import {CommonModule} from '@angular/common';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';

import {IonicModule} from '@ionic/angular';

import {IioPage} from './list/iio.page';
import {InterviewComponent} from './interview/interview.component';
import {EditInterviewComponent} from './edit-interview/edit-interview.component';
import {RouterModule, Routes} from '@angular/router';
import {GroupByMonthPipe} from './list/groupby.pipe';

const routes: Routes = [
  {
    path: '',
    component: IioPage
  }
];

@NgModule({
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    IioPage,
    InterviewComponent,
    EditInterviewComponent,
    GroupByMonthPipe,
  ]
})
export class IioPageModule {
}
