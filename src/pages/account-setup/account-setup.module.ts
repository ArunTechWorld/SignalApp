import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { IonicPageModule } from 'ionic-angular';
import { AccountSetupComponent } from './account-setup';
import { AccSetupProvider } from '../account-setup/components/acc-setup-steps/acc-setup-provider';
import { SharedAPIProvider } from '../../providers/shared/sharedAPI';
@NgModule({
  declarations: [
    AccountSetupComponent,
  ],
  imports: [
    IonicPageModule.forChild(AccountSetupComponent),
  ],
  providers: [
    AccSetupProvider,
    SharedAPIProvider,
  ],
  schemas: [
    CUSTOM_ELEMENTS_SCHEMA,
  ],
  entryComponents: [
    AccountSetupComponent,
  ],
})
export class AccountSetupModule { }
