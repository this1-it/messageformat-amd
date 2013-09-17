require(['i18n!app/nls/users'], function(usersNls)
{
  /*globals document*/

  'use strict';

  var els = document.querySelectorAll('[data-i18n]');

  for (var i = 0; i < els.length; ++i)
  {
    var el = els[i];
    var key = el.getAttribute('data-i18n');

    if (key === '')
    {
      key = el.innerText.trim();
    }

    el.innerText = usersNls[key]();
  }
});
