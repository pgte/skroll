$(function() {

  var defaultDuration = 200;

  var firstShown;
  var active = false;
  var queued = 0;
  var rushing = false;
  var stack = 0;
  var scrollingOne = false;
  var leftToScroll = 0;
  var showingElement;

  function noop() {}

  var container = $('#body');
  container.css('position', 'absolute');

  function pushState() {
    history.pushState({stack: stack}, 'paragraph ' + stack, '#p' + stack);
  }

  function duration() {
    if (! rushing) { return defaultDuration; }
    return 0;
  }

  function adjustPos(elemHeight, cb) {
    var windowHeight = $(window).height();
    var visibleHeight = $('#body').height() + elemHeight;
    var top = windowHeight - visibleHeight;

    // adjust if element is bigger that window
    if (windowHeight < elemHeight) {
      leftToScroll = elemHeight - windowHeight;
      top += leftToScroll;
      scrollingOne = true;
    }
    var dur = duration();
    if (dur === 0) {
      container.css('top', top);
      if (cb) cb();
    } else {
      container.animate({top: top}, dur, 'swing', cb)
    }
    
  }


  function showOne(cb) {
    var elem = $('#body > *:hidden:first');
    if (! firstShown) {
      firstShown = elem;
    }
    
    showingElement = elem;

    var height = elem.outerHeight(true);

    function callback() {
      if (cb) { cb(scrollingOne ? 0 : 1); }
    }

    adjustPos(height, function() {
      var dur = duration();
      if (! dur) {
        elem.show();
        callback();
      } else {
        elem.fadeIn(dur, callback); 
      }
    });
    
  }

  function keepScrolling(cb) {
    var windowHeight = $(window).height();
    var scroll = Math.min(leftToScroll, windowHeight);
    var visibleHeight = parseInt($('#body').css('top'), 10);
    var top = visibleHeight - scroll;

    var dur = duration();

    function callback() {
      var scrollAmount = 1;
      if (scroll < windowHeight) {
        // finished scrolling
        leftToScroll = 0;
        scrollingOne = false;
        scrollAmount = 0;
      }
      if (cb) { cb(scrollAmount); }
    }

    if (dur === 0) {
      container.css('top', top);
      callback();
    } else {
      container.animate({top: top}, dur, 'swing', callback);
    }
  }

  function hideOne(cb) {
    if (stack <= 0) { return; }
    var elem = $('#body > *:visible:last');
    var height = elem.outerHeight(true);

    function callback() {
      if (cb) { cb(-1); }
    }

    elem.fadeOut(duration(), function() {
      var dur = duration();
      if (dur === 0) {
        elem.hide();
        adjustPos(0, callback);
      } else {
        elem.fadeOut(dur, function() {
          adjustPos(0, callback);
        });
      }
    });
  }

  function move(cb) {

    function goOn(incr) {
      stack += incr;
      queued -= (incr || 1);
      pushState();
      cb();
    } 

    if (queued > 0) {
      if (scrollingOne) {
        keepScrolling(goOn);
      } else {
        showOne(goOn);
      }
    } else if (queued < 0) {
      hideOne(goOn);
    }
  }

  function action(cb) {
    if (! rushing && Math.abs(queued) > 1) { rushing = true; }
    if (active) { return; }
    active = true;
    (function doSomeMoving() {
      move(function() {
        if (queued !== 0) { doSomeMoving(); }
        else {
          rushing = false;
          active = false;
          if (cb) { cb(); }
        }
      });
    }());
  }

  function more() {
    queued ++;
    action();
  }

  function less() {
    queued --;
    action();
  }

  $('#body > *').hide();

  key('space, right', more);

  key('backspace, left', less);

  // $(window).click(more);

  (function parseHash() {
    var loc = document.location.hash;
    if (loc) {
      var recallStack = parseInt(loc.match(/#p(\d+)/)[1], 10);
      if (recallStack) {
        queued = recallStack;
        action(function() {
          stack = recallStack;
        });
      }
    } else {
      showOne();
    }
  }());

  /**** TOC ****/

  $('#toc a').click(function(ev) {
    var anchor = $(this);
    var href = anchor.attr('href');
    var targetP = href.match(/#p(\d+)/)[1];
    if (targetP) {
      ev.preventDefault();
      ev.stopPropagation();
      targetP = parseInt(targetP, 10);
      queued = targetP - stack;
      action(function() {
        stack = targetP;
      });
    }
  });

  /***** Image href fix ****/

  var imagePrefix = $('#image-prefix').attr('value');

  function fixImageURL(url) {
    return imagePrefix + url;
  }

  if (imagePrefix) {
    $('img').each(function(idx, imageEl) {
      imageEl = $(imageEl);
      imageEl.attr('src', fixImageURL(imageEl.attr('src')));
      imageEl.parent('a').each(function(idx, aEl) {
        aEl = $(aEl);
        aEl.attr('href', fixImageURL(aEl.attr('href')));
      });
    });
  }

});