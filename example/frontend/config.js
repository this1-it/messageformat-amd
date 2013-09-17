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
