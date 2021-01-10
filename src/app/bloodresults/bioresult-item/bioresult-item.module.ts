import {NgModule} from '@angular/core';
import {BioresultBarComponent} from "./bioresult-bar/bioresult-bar.component";
import {BioresultItemComponent} from "./bioresult-item.component";
import {IonicModule} from "@ionic/angular";

@NgModule({
  imports: [
    IonicModule
  ],
  declarations: [
    BioresultBarComponent,
    BioresultItemComponent,
  ],
  providers: [],
  exports: [
    BioresultItemComponent,
  ]
})
export class BioresultItemModule {
}
