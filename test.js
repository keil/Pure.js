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

var plus = Pure.from(function (x, y) {
  return (x+y);
});

print(plus instanceof Function); // true
print(plus instanceof Pure); // true
print(typeof plus); // function

print(plus(1,2)); // 3
print(Pure.isPure(plus));

//print(Object.prototype.toString(plus));
//print(Function.prototype.toString.call(plus));
//print(plus.toString());

