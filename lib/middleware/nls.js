/*jshint maxparams:5*/

'use strict';

var readFile = require('fs').readFile;
var nlsLib = require('../nlsLib');

module.exports = createNlsMiddleware;

/**
 * @param {object} [options]
 * @param {string} [options.root]
 * @param {string} [options.localeModulePrefix]
 * @param {function(string): string} [options.wrap]
 * @return {function}
 */
function createNlsMiddleware(options)
{
  options = setUpOptions(options);

  return function nlsMiddleware(req, res, next)
  {
    var matches = req.url.match(/^(?:\/[a-z0-9\-]+)?\/([a-z0-9-_]+)\.js$/);

    if (matches === null)
    {
      return next();
    }

    var locale = options.defaultLocale;
    var dashPos = req.url.indexOf('/', 1);

    if (dashPos !== -1)
    {
      locale = req.url.substring(1, dashPos);
    }

    var jsonFile;

    if (typeof options.jsonPath === 'function')
    {
      var nlsFile =
        dashPos === -1 ? req.url.substr(1) : req.url.substr(dashPos + 1);

      jsonFile = options.jsonPath(
        locale === options.defaultLocale ? null : locale,
        nlsFile.replace(/\.js$/, '')
      );
    }
    else
    {
      jsonFile = options.jsonPath + req.url + 'on';
    }

    return compileJsonFile(jsonFile, locale, options, res, next);
  };
}

/**
 * @private
 * @param {object} [userOptions]
 * @param {function|string} [userOptions.jsonPath]
 * @param {string} [userOptions.defaultLocale]
 * @param {string} [userOptions.localeModulePrefix]
 * @param {function} [userOptions.wrap]
 * @return {object}
 */
function setUpOptions(userOptions)
{
  var options = {};

  if (!userOptions)
  {
    userOptions = {};
  }

  var jsonPath = userOptions.jsonPath;

  if (typeof jsonPath !== 'function')
  {
    if (typeof jsonPath === 'string')
    {
      var lastChar = jsonPath.charAt(jsonPath.length - 1);

      if (lastChar === '/' || lastChar === '\\')
      {
        jsonPath = jsonPath.substr(0, jsonPath.length - 1);
      }
    }
    else
    {
      jsonPath = 'nls';
    }
  }

  options.jsonPath = jsonPath;

  options.defaultLocale = typeof userOptions.defaultLocale === 'string'
    ? userOptions.defaultLocale
    : 'en';

  options.localeModulePrefix =
    typeof userOptions.localeModulePrefix === 'string'
      ? userOptions.localeModulePrefix
      : 'nls/locale/';

  options.wrap = typeof userOptions.wrap === 'function'
    ? userOptions.wrap
    : nlsLib.wrap;

  return options;
}

/**
 * @private
 * @param {string} jsonFile
 * @param {string} locale
 * @param {object} options
 * @param {http.ServerResponse} res
 * @param {function} next
 */
function compileJsonFile(jsonFile, locale, options, res, next)
{
  readFile(jsonFile, 'utf8', function(err, contents)
  {
    if (err)
    {
      return next();
    }

    var messageFormatJs;

    try
    {
      messageFormatJs = nlsLib.compileObject(locale, JSON.parse(contents));
    }
    catch (err)
    {
      return next(err);
    }

    res.setHeader('content-type', 'application/javascript');
    res.end(options.wrap(options.localeModulePrefix, locale, messageFormatJs));
  });
}
