var Plates = require('plates')
  , fs = require('fs')
  ;

module.exports = function(trainer) {
  var template = fs.readFileSync(__dirname + '/../../static/html/trainer.html', 'utf8');

  var map = new Plates.Map();
  map.class('name').use('name');
  map.class('bio').use('bio');
  map.class('twitter').use('twitter');
  map.class('twitter').use('twitter_url').as('href');
  map.class('github').use('github');
  map.class('github').use('github_url').as('href');
  map.class('blog').use('blog');
  map.class('blog').use('blog').as('href');
  map.class('mugshot').use('mugshot').as('src');

  var data = {
    name: trainer.name,
    bio: trainer.bio,
    twitter_url: 'https://twitter.com/' + trainer.twitter,
    twitter: "@" + trainer.twitter,
    github_url: 'https://github.com/' + trainer.github,
    github: trainer.github,
    blog: trainer.blog,
    mugshot: '/img/trainers/' + trainer.mugshot
  };

  return Plates.bind(template, data, map);
}