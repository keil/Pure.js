/*
 * Observer Proxy 
 * http://proglang.informatik.uni-freiburg.de/proxy/
 *
 * Copyright (c) 2016, Proglang, University of Freiburg.
 * http://proglang.informatik.uni-freiburg.de/
 * All rights reserved.
 *
 * Released under the MIT license
 * http://proglang.informatik.uni-freiburg.de/treatjs/license
 *
 * Author Matthias Keil
 * http://www.informatik.uni-freiburg.de/~keilr/
 */

// Example implementation of an observer membrabe.
// (The implementation requires transparent Obejct-Proxies.)


// Target obejct
var target = {
  a: 1,
  b: 2,
  c: 3
}

// Function wrap implementating a simple contract system.
function wrap(target) {

  var handler {
    get: function(target, name, handler) {
      return target[name];
    
    }
  }

}










var obj = {i:0};

function f (arg) {
  return arg.i++;
}

//var p = new Pure({}, "arg", "return obj.i");
var p = Pure.from(f);

//print(p);
print(typeof p, p instanceof Function, p instanceof Pure)
print(p(obj));
print(p(obj));

p.apply(undefined, [obj]);

// TODO
// Test id the prototype works

quit();

function Observer(target, handler) {
  // TODO, needs to be constructor

  var pre  = 'pre_';
  var post = 'post_';

  var noophandler

  var metahandler = {
    get: function(target, name, receiver) {
      print(`@ ${name}`);

      if(name in handler) return handler[name];

    }

  }


  return new Proxy(target, new Proxy(handler, metahandler));


}



// XXX USER CODE

var handler = {
  pre_get: function(target, name, receiver) {
    print('# get', `request ${name}`);
    return 2;
  },

  post_get: function(target, name, receiver) {
    print('# get', `request ${name}`);
    return 2;
  }

}
var target = {}

var proxy = new Observer(target, handler);

var i=0;
print(i+++' --> ', proxy.x);
print(i+++' --> ', proxy.x = 1);
print(i+++' --> ', proxy.x);







quit();


// handler did not implement  membrane
//
var handler = {

  preGet: function(configuration) {
    return configuration;
  },

  postGet: function(configuration) {
    return configuration;
  },

  preSet: function(configuration) {
    return configuration;
  },
  postSet: function(configuration) {
    return configuration;
  },

  preApply: function(configuration) {
    return configuration;
  },

  postApply: function(configuration) {
    return configuration;
  },

}



