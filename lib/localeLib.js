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
