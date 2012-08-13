#!/usr/bin/env node

var argv    = require('optimist')
  , cheerio = require('cheerio')
  ;

argv = argv
        .usage('Usage: $0 -c [class-name] -p [port]')
        .alias('c', 'class')
        .describe('c', 'class to start')
        .demand('c')
        .alias('p', 'port')
        .argv
  ;

var static = require('node-static'),
    file = new static.Server(__dirname + '/../build/' + argv.c),
    globalFile = new static.Server(__dirname + '/../static');

require('http').createServer(function(req, res) {
    globalFile.serve(req, res, function(e) {
      if (e && e.status === 404) {
        file.serve(req, res);
      }
    });
}).listen(argv.p && parseInt(argv.p, 10)|| 8080, function() {
  console.log('Listening');
});