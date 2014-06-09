/* jshint node: true */
/* jshint sub: true */
/* global window, $,alert,history */
'use strict';

var log = function(msg)
{
  console.log('CORE:', msg);
};
log('init5');


Object.defineProperty(Object.prototype, 'map',
{
  value: function(f, ctx)
  {
    ctx = ctx || this;
    var self = this,
      result = {};
    Object.keys(self).forEach(function(v)
    {
      result[v] = f.call(ctx, self[v], v, self);
    });
    return result;
  }
});


var g = window;

g.io = {};

require('watchjs');

$('document').ready(function()
{
  //===Key Handler==========================
  g.io.path = decodeURIComponent(window.location.pathname);

  $(window).on('popstate', function(_event)
  {
    // alert('popstate');

    g.io.path = decodeURIComponent(window.location.pathname);
  });

  g.io.pathpush = function(path)
  {
    history.pushState(null, null, path);
    g.io.path = decodeURIComponent(window.location.pathname);

    $('html,body').animate(
    {
      scrollTop: 0
    }, 'fast');

  };
  /*
  $('a')
    .on('click', function(event)
    {
      event.preventDefault();


      var link = $(this)
        .attr("href");
      // alert(link);
      //   window.open(link);
      ref =
        window.open(link, '_blank', 'location=yes,hidden=no,EnableViewPortScale=yes,closebuttoncaption=閉じてアプリに戻る');
      ref.addEventListener('exit', prepareAd);

    });
*/
  $('div.link')
    .on('click', function()
    {
      g.io.pathpush(this.attr('target'));

    });

  //===Modules==========================
  var modules = [];

  // add modules here manually ================
  modules['areacontrol'] = require('../modules/areacontrol/client/client_module.js');
  modules['categorycontrol'] = require('../modules/categorycontrol/client/client_module.js');
  modules['list_thread'] = require('../modules/list_thread/client/client_module.js');
  //===Socket==========================
  var socketio = require('socket.io-client');
  g.io.socket = socketio.connect(window.location.hostname,
  {
    'reconnect': true,
    'reconnection delay': 500,
    'max reconnection attempts': 10
  });

  g.io.socket
    .on('connect', function()
    {
      log('socket connected');

      g.io.socket
        .emit('msg',
          {
            cmd: 'socketid',
            sub: null,
            data: null
          },
          function(socketid)
          {
            log(socketid);
          }
      )
        .emit('msg',
          {
            cmd: 'modulecount',
            sub: null,
            data: null
          },
          function(n)
          {
            log(n);
            if (Object.keys(modules).length !== n)
            {
              alert('module load mismatch!!');
            }
          }
      )
        .emit('msg',
          {
            cmd: 'bbnamecategory',
            sub: null,
            data: null
          },
          function(data)
          {
            log('@@@@@@@@@@@@@@');
            log(data.bbname);
            log(data.categories);
            g.io.bbname = data.bbname;
            g.io.categories = data.categories;

            //======emit ready  <1>  and  to initiate module load on server<2>
            g.io.socket
              .emit('msg',
                {
                  cmd: 'readyformodules',
                  sub: null,
                  data: null
                },
                function()
                {
                  log();
                }
            );


            //=============

          }
      );

    })
    .on('reconnect', function()
    {
      log('socket reconnected');

    })
    .on('msg', function(msg, f)
    {
      log(msg);

      if (msg.cmd === 'module') //    <3>
      {
        log('loading module @' + msg.data); //modeleready onserver
        modules[msg.data].start();
      }

    });





});
