import {Component, Input, OnInit} from '@angular/core';
import {AddressInterface, AddressService} from '../address.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import {Dates} from '../../common/dates';
import {ModalController} from '@ionic/angular';
import {StateProvider} from '../../common/state.provider';
import {DateTime} from "luxon";
import {EMPTY_LOCATION, LocationInterface} from "../../places/google-places/google-places.component";

@Component({
  selector: 'app-edit-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss']
})
export class EditAddressComponent implements OnInit {
  @Input() address: AddressInterface;
  addressForm: FormGroup;
  filteredOptions: Observable<any[]>;

  // _filter = CitiesService.filterCities;
  location: LocationInterface = EMPTY_LOCATION;

  constructor(public addressService: AddressService,
              private state: StateProvider,
              private fb: FormBuilder,
              public modalController: ModalController,) {
  }

  ngOnInit() {
    console.log(this.address);
    this.createForm();
  }

  onSubmit(value) {
    // const location: LocationInterface = CitiesService.filterLocation(value.locationName);
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
    if (this.address.id === null || this.address.id === undefined) {
      console.log('Saving address', value);
      this.addressService.create(value).then(
        res => {
          this.addressService.refresh();
          this.addressForm.reset();
        }
      );
    } else {
      this.addressService.update(this.address.id, value).then(
        () => {
          this.addressService.refresh();
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

  detail(location: LocationInterface) {
    console.log(location);
    this.location = location;
    this.address.lat = this.location.lat;
    this.address.lng = this.location.lng;
  }

  private createForm() {
    this.addressForm = this.fb.group({
      locationName: [this.address.locationName,],
      start: [this.address.start?.toISOString(), Validators.required],
      end: [this.address.end?.toISOString(),],
    }, {
      validator: Validators.compose([
        Dates.dateLessThanValidator('start', 'end'),
      ])
    });
  }
}
