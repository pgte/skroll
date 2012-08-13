var fs = require('fs');

module.exports = function(klass) {
  var branding = klass.branding;

  if (! branding) { throw new Error('class does not have .branding'); }

  return fs.readFileSync(__dirname + '/../static/html/' + branding + '.disclaimer.html', 'utf8');
}