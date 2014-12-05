// Copyright (c) 2014, Łukasz Walukiewicz <lukasz@walukiewicz.eu>. Some Rights Reserved.
// Licensed under the MIT License <http://opensource.org/licenses/MIT>.
// Part of the messageformat-amd project <http://lukasz.walukiewicz.eu/p/messageformat-amd>

require(['i18n!app/nls/users'], function(usersNls)
{
  /*globals document*/

  'use strict';

  var els = document.querySelectorAll('[data-i18n]');

  for (var i = 0; i < els.length; ++i)
  {
    var el = els[i];
    var key = el.dataset.i18n;

    if (key === '')
    {
      key = el.innerText.trim();
    }

    if (!usersNls[key])
    {
      continue;
    }

    var data = {};
    var keys = Object.keys(el.dataset);

    for (var ii = 0, ll = keys.length; ii < ll; ++ii)
    {
      var val = el.dataset[keys[ii]];

      data[keys[ii]] = /^[0-9]+$/.test(val) ? parseInt(val, 10) : val;
    }

    el.innerText = usersNls[key](data);
  }
});
