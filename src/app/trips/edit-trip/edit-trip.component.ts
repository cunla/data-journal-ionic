import {Component, Input, OnInit} from '@angular/core';
import {TripInterface, TripsService} from '../trips.service';
import {AbstractControlOptions, FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Dates} from '../../common/dates';
import {ModalController} from '@ionic/angular/lazy';
import {DateTime} from "luxon";
import {EMPTY_LOCATION, LocationInterface, toLocation} from "../../places/google-places/google-places.component";
import {environment} from '../../../environments/environment';


@Component({
    selector: 'app-edit-trip',
    templateUrl: './edit-trip.component.html',
    styleUrls: ['./edit-trip.component.scss'],
    standalone: false
})
export class EditTripComponent implements OnInit {
  @Input() trip: TripInterface;
  tripForm: FormGroup;
  location: LocationInterface = {...EMPTY_LOCATION};
  readonly mapOptions = {maxZoom: 8, minZoom: 5, mapId: environment.mapsMapId};

  constructor(public trips: TripsService,
              private fb: FormBuilder,
              public modalController: ModalController,) {
  }

  ngOnInit() {
    // Start from the record's own location so editing other fields keeps it
    this.location = toLocation(this.trip);
    this.createForm();
  }

  onSubmit(value) {
    const location = this.location;
    value.locationName = location.locationName;
    value.city = location.city;
    value.state = location.state;
    value.country = location.country;
    value.countryCode = location.iso2;
    value.lat = location.lat;
    value.lng = location.lng;
    value.start = DateTime.fromISO(value.start).toJSDate();
    value.end = value.end ? DateTime.fromISO(value.end).toJSDate() : value.end;
    if (this.trip.id === null || this.trip.id === undefined) {
      this.trips.create(value).then(
        () => this.tripForm.reset(),
        (err) => console.error('Failed to create trip', err),
      );
    } else {
      this.trips.update(this.trip.id, value)
        .catch((err) => console.error('Failed to update trip', err));
    }
    this.dismissModal();
  }

  public dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    });
  }


  detail(location: LocationInterface) {
    // Only the local copy moves; the trip itself changes on save
    this.location = location;
  }

  private createForm() {
    const controlOptions: AbstractControlOptions = {
      validators: Validators.compose([
        Dates.dateLessThanValidator('start', 'end'),
      ])
    };
    this.tripForm = this.fb.group({
      locationName: [this.trip.locationName,],
      purpose: [this.trip.purpose, Validators.required],
      start: [this.trip.start?.toISOString(), Validators.required],
      end: [this.trip.end?.toISOString(),],
    }, controlOptions);
  }

}
