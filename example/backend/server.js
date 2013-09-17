'use strict';

var http = require('http');
var path = require('path');
var connect = require('connect');
var messageFormatAmd = require('../../lib');

var STATIC_PATH = path.join(__dirname, '..', 'frontend');

var app = connect();

app.use(connect.logger('dev'));

app.use('/app/nls/locale', messageFormatAmd.localeMiddleware());
app.use('/app/nls/', messageFormatAmd.nlsMiddleware({
  localeModulePrefix: 'app/nls/locale/',
  jsonPath: function(locale, nlsName)
  {
    var jsonFile = (locale === null ? 'root' : locale) + '.json';

    return path.join(STATIC_PATH, 'app', nlsName, 'nls', jsonFile);
  }
}));

app.use(connect.static(STATIC_PATH));
app.use(connect.errorHandler());

http.createServer(app).listen(3000);
