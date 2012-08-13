var fs   = require('fs')
  , path = require('path')
  ;

module.exports = function(unitPath, unit) {
  try {
    fs.statSync(path.join(unitPath, 'src'));
    return '<a href="/units/' + unit + '/' + unit + '.src.tgz">Download source code</a>';
  } catch(err) {

  }
  
}