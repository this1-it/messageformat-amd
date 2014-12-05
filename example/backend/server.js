// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under the MIT License <http://opensource.org/licenses/MIT>.
// Part of the messageformat-amd project <http://lukasz.walukiewicz.eu/p/messageformat-amd>

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
