/*
 * Native Components v0.0.1
 * (c) 2019  Tolu Oluwagbemi<tulburg2@gmail.com>
 * Released under the MIT License.
 */

import Router from './router';
new Router();

if(module.hot) {
  module.hot.accept('./router', () => {
    // Do some clean up
    const highestTimeoutId = setTimeout(';');
    for (let i = 0 ; i < highestTimeoutId ; i++) {
      clearTimeout(i);
    }
    Bus.events = [];
    // -------------
    new Router();
    document.dispatchEvent(new Event('DOMContentLoaded'));
    window.dispatchEvent(new Event('load'));
  });
}
