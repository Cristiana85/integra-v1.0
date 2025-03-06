import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

bootstrapApplication(AppComponent, appConfig);

import('./assets/wasm/solvers/sp')
  .then(wasm => {
    console.log("WASM Loaded", wasm);
    (window as any).wasm = wasm;
  })
  .catch(console.error);
