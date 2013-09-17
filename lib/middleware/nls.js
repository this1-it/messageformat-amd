/*jshint maxparams:5*/

'use strict';

var readFile = require('fs').readFile;
var MessageFormat = require('messageformat');

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
    : wrapMessageFormatJs;

  return options;
}

/**
 * @private
 * @param {string} localeModulePrefix
 * @param {string} locale
 * @param {string} messageFormatJs
 * @return {string}
 */
function wrapMessageFormatJs(localeModulePrefix, locale, messageFormatJs)
{
  return [
    'define(["' + localeModulePrefix + locale + '"], function(nls, locale) {',
    'var MessageFormat = {locale: {}};',
    'MessageFormat.locale["' + locale + '"] = locale;',
    'return ' + messageFormatJs + ';',
    '});'
  ].join('\n');
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

    var mf = new MessageFormat(locale, function() {});
    var json;

    try
    {
      json = JSON.parse(contents);
    }
    catch (err)
    {
      return next(err);
    }

    var js = compileObject(mf, json);

    res.setHeader('content-type', 'application/javascript');
    res.end(options.wrap(options.localeModulePrefix, locale, js));
  });
}

/**
 * @private
 * @param {MessageFormat} mf
 * @param {object} obj
 * @returns {string}
 */
function compileObject(mf, obj)
{
  var js = '{\n';
  var keys = Object.keys(obj);
  var keysLength = keys.length;
  var lastKeyIndex = keysLength - 1;

  for (var i = 0; i < keysLength; ++i)
  {
    var key = keys[i];
    var value = obj[key];
    var valueType = typeof value;

    js += JSON.stringify(key) + ': ';

    if (value === null)
    {
      js += 'null';
    }
    else if (valueType === 'boolean')
    {
      js += value ? 'true' : 'false';
    }
    else if (valueType === 'object')
    {
      js += compileObject(mf, value);
    }
    else
    {
      js += mf.precompile(mf.parse(String(value)));
    }

    if (i !== lastKeyIndex)
    {
      js += ',';
    }

    js += '\n';
  }

  return js + '}';
}
