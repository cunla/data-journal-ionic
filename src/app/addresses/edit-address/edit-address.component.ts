import {Component, Input, OnInit} from '@angular/core';
import {AddressInterface, AddressService} from '../address.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Observable} from 'rxjs';
import * as moment from 'moment';
import {Dates} from '../../common/dates';
import {CitiesService, LocationInterface} from '../../common/cities.service';
import {ModalController} from '@ionic/angular';

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

  constructor(public addressService: AddressService,
              private fb: FormBuilder,
              public citiesService: CitiesService,
              public modalController: ModalController,) {
  }

  ngOnInit() {
    console.log(this.address);
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
    value.start = moment(value.start).toDate();
    value.end = value.end ? moment(value.end).toDate() : value.end;
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
          this.address.editMode = false;
          this.addressService.refresh();
        }
      );
    }
    this.dismissModal();
  }

  private createForm() {
    this.addressForm = this.fb.group({
      locationName: [this.address.locationName, Validators.required],
      start: [this.address.start?.toISOString(), Validators.required],
      end: [this.address.end?.toISOString(),],
    }, {
      validator: Validators.compose([
        Dates.dateLessThanValidator('start', 'end'),
      ])
    });
  }

  public dismissModal() {
    this.modalController.dismiss({
      dismissed: true
    }).then();
  }
}
