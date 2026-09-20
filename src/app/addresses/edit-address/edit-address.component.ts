import {Component, Input, OnInit} from '@angular/core';
import {AddressInterface, AddressService} from '../address.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Dates} from '../../common/dates';
import {ModalController} from '@ionic/angular/lazy';
import {DateTime} from "luxon";
import {EMPTY_LOCATION, LocationInterface, toLocation} from "../../places/google-places/google-places.component";

@Component({
    selector: 'app-edit-address',
    templateUrl: './edit-address.component.html',
    styleUrls: ['./edit-address.component.scss'],
    standalone: false
})
export class EditAddressComponent implements OnInit {
  @Input() address: AddressInterface;
  addressForm: FormGroup;
  location: LocationInterface = {...EMPTY_LOCATION};

  constructor(public addressService: AddressService,
              private fb: FormBuilder,
              public modalController: ModalController,) {
  }

  ngOnInit() {
    // Start from the record's own location so editing other fields keeps it
    this.location = toLocation(this.address);
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
    if (this.address.id === null || this.address.id === undefined) {
      console.log('Saving address', value);
      this.addressService.create(value).then(
        () => {
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
    });
  }

  detail(location: LocationInterface) {
    // Only the local copy moves; the address itself changes on save
    this.location = location;
  }

  private createForm() {
    this.addressForm = this.fb.group({
      locationName: [this.address.locationName,],
      start: [this.address.start?.toISOString(), Validators.required],
      end: [this.address.end?.toISOString(),],
    }, {
      validators: Validators.compose([
        Dates.dateLessThanValidator('start', 'end'),
      ])
    });
  }
}
