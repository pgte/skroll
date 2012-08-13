var request = require('request');

var GITHUB_BASE_URL = 'https://api.github.com';

function githubRepoActionURL(pathComponents) {
  var url = GITHUB_BASE_URL + '/';
  url += pathComponents.map(function(pathComponent) {
    return escape(pathComponent);
  }).join('/');

  return url;
}


function handleResponse(expectedStatusCode, dontParse, callback) {
  if ('function' === typeof dontParse) {
    callback = dontParse;
    dontParse = false;
  }
  return function(err, resp, body) {
    if (err) {
      console.error(err);
      return callback(err);
    }
    if (resp.statusCode !== expectedStatusCode) {
      try { body = JSON.parse(body); }
      catch(error) {  }
      err = new Error('Github expected response status code is ' + resp.statusCode + 'URL: ' + resp.request.href + ',  body:' + (body && (body.message || body) || ''));
      return callback(err);
    }
    if (typeof body === 'string' && ! dontParse) {
      try { body = JSON.parse(body); }
      catch(error) { err = error; }
    }
    return callback(err, body);
  };
}

//
// Convert Markdown to HTML Markup
//
function markdownToMarkup(markdown, callback) {
  var url = githubRepoActionURL(['markdown']) + '?mode=gfm';
  request.post({
    url: url,
    json: {
      text: markdown
    }
  }, handleResponse(200, true, function(err, markup) {
    if (err) { return callback(err); }
    callback(null, markup);
  }));
}

module.exports = markdownToMarkup;