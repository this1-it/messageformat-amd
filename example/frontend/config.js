// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under the MIT License <http://opensource.org/licenses/MIT>.
// Part of the messageformat-amd project <http://lukasz.walukiewicz.eu/p/messageformat-amd>

/*globals window:true,require:true*/

require = {
  baseUrl: '/',
  paths: {
    'i18n': 'vendor/require/i18n'
  },
  config: {
    i18n: {
      locale: window.location.search.length < 3
        ? 'en'
        : window.location.search.substr(1)
    }
  }
};
