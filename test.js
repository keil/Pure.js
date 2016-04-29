/*
 * Pure Function 
 * http://proglang.informatik.uni-freiburg.de/sandbox/
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



/******************************
 * Part I
 ******************************/

/**
 * Unpure function.
 **/
var plus = function (x, y) {
  return x+y;
}

/**
 * Create new pure from.
 **/
var plus1 = new Pure("x", "y", "return x+y");

print(plus1 instanceof Function); // true
print(plus1 instanceof Pure); // true
print(typeof plus1); // function

/**
 * Create new pure from an existing closure.
 **/
var plus2 = Pure.from(function(x, y) {
  return x+y;
})

print(plus2 instanceof Function); // true
print(plus2 instanceof Pure); // true
print(typeof plus2); // function

print(Pure.isPure(plus)); // false
print(Pure.isPure(plus1)); // true
print(plus1.isPure()); // true



/******************************
 * Part II
 ******************************/

/**
 * Reference plus is not available because it is not in the scope the pure function.
 **/
// var addOne1 = Pure.from(function (x) {
//   return plus(x, 1);
// });

var addOne1 = Pure.from(function (plus, x) {
  return plus(x, 1);
});

/**
 * Throws an error because pure functions are not allowed to call non-pure functions.
 **/
// print(addOne(plus, 1)); 


print(addOne1(plus1, 1)); // 2



/******************************
 * Part III
 ******************************/

/**
 * Creates a new realm with references that can safely be used in the pure function.
 **/
var realm = Pure.createRealm({plus:plus});

var addOne2 = realm.Pure.from(function (x) {
  return plus(x, 1);
});

print(addOne2(1)); // 2

print(plus2 instanceof Pure); // true
print(plus2 instanceof realm.Pure); // false

print(addOne2 instanceof Pure); // false
print(addOne2 instanceof realm.Pure); // true

print(plus1.toString());
//print(plus1.toString());
//print(Pure.prototype.toString.call(plus1));
//print(Function.prototype.toString.call(addOne1));

