var cheerio = require('cheerio')
;

function stripTags(str) {
  return str.replace(/(<([^>]+)>)/ig,"");
}

module.exports = function(html) {
  var $ = cheerio.load(html);

  var toc = [];
  var index = 0;

  $('*').each(function(idx, tag) {
    tag.children.forEach(function(tag) {
      index += 1;
      if (tag.name === 'h2') {
        tag = $(tag);
        tag.attr('id', index);
        toc.push('<a href="#p' + index +'">' + stripTags(tag.html()) + '</a>');
      }
    });
  });

  var html = '';

  html += ' [ <a href="/schedule.html">Schedule</a> ]<p></p>';

  html += '<ol>';
  toc.forEach(function(entry) {
    html += '<li>';
    html += entry;
    html += '</li>';
  });
  html += '</ol>';

  return html;
}