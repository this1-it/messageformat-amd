// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under the MIT License <http://opensource.org/licenses/MIT>.
// Part of the messageformat-amd project <http://lukasz.walukiewicz.eu/p/messageformat-amd>

'use strict';

var path = require('path');

/**
 * @param {string|null} root
 * @param {string} locale
 * @returns {string}
 * @throws {Error}
 */
exports.resolveFile = function(root, locale)
{
  return root === null
    ? require.resolve('messageformat/locale/' + locale)
    : path.join(root, locale + '.js');
};

/**
 * @param {string} localeJs
 * @return {string}
 */
exports.wrap = function(localeJs)
{
  return [
    'define(function() {',
    'var MessageFormat = {locale: {}};',
    'return ' + localeJs,
    '});'
  ].join('\n');
};
