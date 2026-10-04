/* Leonardo Carvalho · v3 poster edition · the project files.
   The files read, navigate and print without this script. It does two small things:
   - the hockey file's "Print the one-pager" button opens the browser's print dialog (the button is hidden
     without the script);
   - before printing, figures that are still waiting to lazy-load are asked to load, so a file printed
     before it was scrolled through still prints its figures. */
(function () {
  'use strict';
  var buttons = document.querySelectorAll('[data-print]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].addEventListener('click', function () { window.print(); });
  }
  window.addEventListener('beforeprint', function () {
    var lazy = document.querySelectorAll('img[loading="lazy"]');
    for (var j = 0; j < lazy.length; j++) lazy[j].loading = 'eager';
  });
})();
