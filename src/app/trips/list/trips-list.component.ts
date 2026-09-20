import {Component, OnInit} from '@angular/core';
import {take} from 'rxjs/operators';
import {EMPTY_TRIP, TripInterface, TripsService} from '../trips.service';
import {CsvTools} from '../../common/csvtools.service';
import {saveAs} from 'file-saver';
import {AlertController, LoadingController, ModalController, RefresherCustomEvent} from '@ionic/angular/lazy';
import {EditTripComponent} from '../edit-trip/edit-trip.component';
import {StateProvider} from '../../common/state.provider';
import {parseTripsCsv} from '../import-trips';

@Component({
    selector: 'app-trips',
    templateUrl: './trips-list.component.html',
    styleUrls: ['./trips-list.component.scss'],
    standalone: false
})
export class TripsListComponent implements OnInit {
  // A fresh copy per click; EMPTY_TRIP is shared and must stay untouched
  get newTrip(): TripInterface {
    return {...EMPTY_TRIP};
  }

  constructor(public trips: TripsService,
              private state: StateProvider,
              private alertController: AlertController,
              private loadingController: LoadingController,
              private modalController: ModalController,
  ) {
  }

  // Reads a CSV the user picked, shows what it found, and saves on confirmation
  async importCsv(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';   // so picking the same file again still fires a change
    if (!file) {
      return;
    }
    const {trips, skipped} = parseTripsCsv(await file.text());
    if (!trips.length) {
      await this.tellUser('Nothing to import', skipped.join('<br>') || 'No trips found in that file.');
      return;
    }
    const confirmed = await this.confirmImport(trips.length, skipped);
    if (!confirmed) {
      return;
    }
    const loading = await this.loadingController.create({message: `Importing ${trips.length} trips`});
    await loading.present();
    try {
      for (const trip of trips) {
        await this.trips.create(trip);
      }
      await loading.dismiss();
      await this.tellUser('Import complete', `Added ${trips.length} trips.`);
    } catch (err) {
      console.error('Failed to import trips', err);
      await loading.dismiss();
      await this.tellUser('Import failed',
        'Some trips may not have been saved. Check your connection and try again.');
    }
  }

  private async confirmImport(count: number, skipped: string[]): Promise<boolean> {
    const detail = skipped.length
      ? `<br><br>${skipped.length} row(s) will be skipped:<br>${skipped.slice(0, 5).join('<br>')}`
      : '';
    return new Promise(resolve => {
      this.alertController.create({
        header: 'Import trips',
        message: `Add ${count} trips to your journal?${detail}`,
        buttons: [
          {text: 'Cancel', role: 'cancel', handler: () => resolve(false)},
          {text: 'Import', handler: () => resolve(true)},
        ],
      }).then(alert => alert.present());
    });
  }

  private async tellUser(header: string, message: string) {
    const alert = await this.alertController.create({header, message, buttons: ['OK']});
    await alert.present();
  }

  async presentModal(trip: TripInterface) {
    if (this.state.modalOpen) {
      return;
    }
    this.state.modalOpen = true;
    const modal = await this.modalController.create({
      component: EditTripComponent,
      componentProps: {trip,}
    });
    // Clear the flag however the modal is closed, including backdrop/Esc/back
    modal.onDidDismiss().then(() => this.state.modalOpen = false);
    return await modal.present();
  }

  ngOnInit() {
    this.trips.refresh();
  }

  searchByName(event) {
    this.trips.search(event.target.value?.toLowerCase());
  }

  exportCsv() {
    this.trips.data.pipe(take(1)).subscribe(res => {
      const tripsCsv = CsvTools.convertToCsv(res,
        ['start', 'end', 'locationName', 'purpose']);
      const blob = new Blob([tripsCsv], {type: 'text/csv;charset=utf-8'});
      saveAs(blob, 'trips.csv');
    });
  }


  doRefresh(event: RefresherCustomEvent) {
    this.trips.refresh();
    event?.target.complete().then();
  }
}
