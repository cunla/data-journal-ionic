import {Component, Input, OnInit} from '@angular/core';
import {TripInterface, TripsService} from '../trips.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Dates} from '../../common/dates';
import {CitiesService, LocationInterface} from '../../common/cities.service';
import {ModalController} from '@ionic/angular';
import {StateProvider} from '../../common/state.provider';
import {DateTime} from "luxon";

@Component({
  selector: 'app-edit-trip',
  templateUrl: './edit-trip.component.html',
  styleUrls: ['./edit-trip.component.scss']
})
export class EditTripComponent implements OnInit {
  @Input() trip: TripInterface;
  tripForm: FormGroup;

  constructor(public trips: TripsService,
              private state: StateProvider,
              private fb: FormBuilder,
              public citiesService: CitiesService,
              public modalController: ModalController,) {
  }

  ngOnInit() {
    this.createForm();
  }

  onSubmit(value) {
    const location: LocationInterface = CitiesService.filterLocation(value.locationName);
    value.city = location.city;
    value.state = location.state;
    value.country = location.country;
    value.countryCode = location.iso2;
    value.lat = location.lat;
    value.lng = location.lng;
    value.start = DateTime.fromISO(value.start).toJSDate();
    value.end = value.end ? DateTime.fromISO(value.end).toJSDate() : value.end;
    if (this.trip.id === null || this.trip.id === undefined) {
      console.log('Saving trip', value);
      this.trips.create(value).then(
        () => {
          this.trips.refresh();
          this.tripForm.reset();
        }
      );
    } else {
      this.trips.update(this.trip.id, value).then(
        () => {
          this.trips.refresh();
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

  locationChanged(location: TripInterface) {
    this.trip.lat = location.lat;
    this.trip.lng = location.lng;
  }

  resetLocation($event: any) {
    this.tripForm.get('locationName').reset();
  }

  private createForm() {
    this.tripForm = this.fb.group({
      locationName: [this.trip.locationName, Validators.required],
      purpose: [this.trip.purpose, Validators.required],
      start: [this.trip.start?.toISOString(), Validators.required],
      end: [this.trip.end?.toISOString(),],
    }, {
      validator: Validators.compose([
        Dates.dateLessThanValidator('start', 'end'),
      ])
    });
  }
}
