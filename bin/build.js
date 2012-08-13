#!/usr/bin/env node
var fs         = require('fs')
  , exec       = require('child_process').exec
  , path       = require('path')
  , mkdirp     = require('mkdirp')
  , Plates     = require('plates')
  , argv       = require('optimist')
  , cheerio    = require('cheerio')
  , async      = require('async')
  , markdown   = require('./markdown')
  , home       = require('./extractors/home')
  , toc        = require('./extractors/toc')
  , sourcecode = require('./extractors/sourcecode')
  , trainer    = require('./extractors/trainer')
  , schedule   = require('./schedule')
  , disclaimer = require('./disclaimer')
  ;

argv = argv
        .usage('Usage: $0 -c [class-name]')
        .alias('c', 'class')
        .describe('c', 'class to build')
        .demand(['c'])
        .argv
  ;

function stripTags(str) {
  return str.replace(/(<([^>]+)>)/ig,"");
}

var build_dir = path.resolve(__dirname, '..', 'build', argv.c);

var i = 0;

var klass = require('../classes/' + argv.c + '.json');

var units = klass.units;

var layout = fs.readFileSync(__dirname + 
  '/../static/html/layout.html', 'utf8');

var layoutSlides = fs.readFileSync(__dirname +
  '/../static/html/layout-slide.html', 'utf8');

var globalTOC = [];

var titles = {};
var unitLinks = {};

async.forEachSeries(units, function (unit, next) {
  // create class directory
  i++;
  var filename = (i<10 ? '0'+i : i) + '-' + unit + '.html';
  console.log('[html] `' + unit + '`');
  var unit_dir  = path.resolve(__dirname, '..', 'units', unit)
    , src_dir   = path.resolve(unit_dir, 'src')
    , body      = fs.readFileSync(path.resolve(unit_dir, 'index.md'), 'utf-8')
    ;

  console.log('file name:', filename);

  markdown(body, function(err, markup) {
    if (err) { return next(err); }

    mkdirp.sync(build_dir);
    mkdirp.sync(build_dir + '/units');

    // Build pages

    var page = Plates.bind(layoutSlides, {
      toc: home() + toc(markup) + (sourcecode(unit_dir, unit) || ""),
      body: markup
    });

    // correct image references
    page = page.replace('___image_prefix___', '/units/' + unit + '/');

    var $ = cheerio.load(page);

    // Write unit HTML file to build dir
    fs.writeFileSync(path.join(build_dir, filename), page);

    // Add title
    var title = stripTags($('h1').first().html());
    console.log('title:', title);
    titles[unit] = title;
    unitLinks[unit] = '/' + filename;
    globalTOC.push('<li><a href="/' + filename +'">' + (title || unit) +'</a></li>');

    exec('cp -R ' + unit_dir + ' ' + build_dir + '/units', function(err, stdout, stderr) {
      if (err) { return next(err); }

      if (path.existsSync(src_dir)) {
        var cmd = 'cd ' + src_dir + '; tar cvfz ' + build_dir + '/units/' + unit + '/' + unit + '.src.tgz *';

        exec(cmd, function(err, stdout, stderr) {
          if (err) { return next(err); }
          next();
        });

      }
    });


  });


}, function(err) {
  if (err) {
    throw err;
  }

  var disclaimerMarkup = '<section id="disclaimer">' + disclaimer(klass) + '</section>';

  var trainers = klass.trainers.map(function(_trainer) {
    return trainer(_trainer);
  }).join('');

  var tocPage = Plates.bind(layout, {
    body: disclaimerMarkup + '<h1>Hosts</h1>' + trainers + '<h1>Contents</h1><ol>' + globalTOC.join('\n') + '</ol>'
  });
  fs.writeFileSync(path.join(build_dir, 'index.html'), tocPage);

  // Build schedule

  (function() {
    var page = Plates.bind(layout, {
      body: schedule(klass.schedule, titles, unitLinks)
    });
    fs.writeFileSync(path.join(build_dir, 'schedule.html'), page);
  }());

  // Build trainers

  (function() {
    var trainerPath = path.join(build_dir, 'trainers');
    mkdirp.sync(trainerPath);
      klass.trainers.forEach(function(_trainer) {
      var page = Plates.bind(layout, {
        body: trainer(_trainer)
      });
      fs.writeFileSync(path.join(trainerPath, _trainer.twitter + '.html'), page);
    });
  }());


});