var Pure = Pure || (function() {

  //__ __ ___ _ __ _ _ __ 
  //\ V  V / '_/ _` | '_ \
  // \_/\_/|_| \__,_| .__/
  //                |_|   

  /** 
   * maps: target -> proxy
   **/
  var proxies = new WeakMap();

  /** 
   * wrap: target -> proxy
   **/
  function wrap(target) {

    /**
     * If target is a primitive value, then return target
     **/
    if (target !== Object(target)) {
      return target;
    }

    /**
     * Avoid re-wrapping of proxies/ targets
     **/
    if(proxies.has(target)) {
      return proxies.get(target);
    }

    var handler = new Membrane();
    var proxy = new Proxy(target, handler);

    /**
     * Stores the current proxy
     **/
    proxies.set(target, proxy);

    return proxy;
  }

  // ___          _ _          ___                 
  //| _ \_  _ _ _(_) |_ _  _  | __|_ _ _ _ ___ _ _ 
  //|  _/ || | '_| |  _| || | | _|| '_| '_/ _ \ '_|
  //|_|  \_,_|_| |_|\__|\_, | |___|_| |_| \___/_|  
  //                    |__/                       

  function PurityError(message) {
    this.name = 'PurityError';
    this.message = message || 'Pure function cannot cause any observable side effects.';
    this.stack = (new Error()).stack;
  }
  PurityError.prototype = Object.create(Error.prototype);
  PurityError.prototype.constructor = PurityError;

  // __  __           _                      
  //|  \/  |___ _ __ | |__ _ _ __ _ _ _  ___ 
  //| |\/| / -_) '  \| '_ \ '_/ _` | ' \/ -_)
  //|_|  |_\___|_|_|_|_.__/_| \__,_|_||_\___|

  function Membrane() {
    if(!(this instanceof Membrane)) return new Membrane();

    /**
     * A trap for Object.getPrototypeOf.
     **/
    this.getPrototypeOf = function(target) {
      return wrap(Object.getPrototypeOf(target));
    }

    /**
     * A trap for Object.setPrototypeOf.
     **/
    this.setPrototypeOf = function(target, prototype) {
      throw new PurityError();
    }

    /**
     * A trap for Object.isExtensible
     **/
    this.isExtensible = function(target) {
      return Object.isExtensible(target);
    };

    /** 
     * A trap for Object.preventExtensions.
     **/
    this.preventExtensions = function(target) {
      throw new PurityError();
    };

    /** 
     * A trap for Object.getOwnPropertyDescriptor.
     **/
    this.getOwnPropertyDescriptor = function(target, name) {
      return wrap(Object.getOwnPropertyDescriptor(target, name));
    };

    /** 
     * A trap for Object.defineProperty.
     **/
    this.defineProperty = function(target, name, desc) {
      throw new PurityError();
    };

    /** 
     * A trap for the in operator.
     **/
    this.has = function(target, name) {
      return (name in target);
    };

    /**
     * A trap for getting property values.
     **/
    this.get = function(target, name, receiver) {
      // TODO, check for getter ?
      return wrap(target[name]);
    };

    /** 
     * A trap for setting property values.
     **/
    this.set = function(target, name, value, receiver) {
      throw new PurityError();
    };

    /**
     * A trap for the delete operator.
     **/
    this.deleteProperty = function(target, name) {
      throw new PurityError();
    };

    /** 
     * A trap for for...in statements.
     **/
    this.enumerate = function(target) {
      var properties = new Set();
      for(var property in target) {
        properties.add(property);
      }
      return Array.from(properties)[Symbol.iterator]();
    };

    /**
     * A trap for Object.getOwnPropertyNames.
     **/
    this.ownKeys = function(target) {
      return Object.getOwnPropertyNames(target);
    };

    /** 
     * A trap for a function call.
     **/
    this.apply = function(target, thisArg, argumentsList) {
      if(target instanceof Pure) {
        return target.apply(wrap(thisArg), wrap(argumentsList))
      } else {
        throw new PurityError();
      }
    };

    /** 
     * A trap for the new operator. 
     **/
    this.construct = function(target, argumentsList) {
      if(target instanceof Pure) {
        var thisArg = Object.create(target.prototype);
        var result = target.apply(wrap(thisArg), wrap(argumentsList));
        return (result instanceof Object) ? result : wrap(thisArg);
      } else {
        throw new PurityError();
      }
    }
  }

  // _ _ ___ __ ___ _ __  _ __(_) |___ 
  //| '_/ -_) _/ _ \ '  \| '_ \ | / -_)
  //|_| \___\__\___/_|_|_| .__/_|_\___|
  //                     |_|           

  function recompile(closure, environment) {
    try {
      var scope = new Proxy(environment, {has:function() {return true;}});
      var body = "(function() {'use strict'; return " + ("(" + closure.toString() + ")") + "})();";
      var pure = eval("(function() { with(scope) { return " + body + " }})();");
      
      var handler = {
        apply: function(target, thisArg, argumentsArg) {
          return target.apply(wrap(thisArg), wrap(argumentsArg));
        }
      };
      Object.setPrototypeOf(pure, Pure.prototype);
  
      return new Proxy(pure, handler);

      
      
      Object.setPrototypeOf(pure, Pure.prototype);
      return pure;
//      return wrap(pure);
    } catch(error) {
      print(error);
      throw new SyntaxError("Incompatible function object.");
    } 
  }

  function define(parameters, environment) {
    try {
      var scope = new Proxy(environment, {has:function() {return true;}});
      var body = "(function() {'use strict'; return new Function(...parameters)})()";
      var pure = eval("(function() { with(scope) { return " + body + " }})();");
      
      var handler = {
        apply: function(target, thisArg, argumentsArg) {
          return target.apply(wrap(thisArg), wrap(argumentsArg));
        }
      };
      Object.setPrototypeOf(pure, Pure.prototype);
  
      return new Proxy(pure, handler);

      return pure;
//      return wrap(pure);
    } catch(error) {
      throw error;
      throw new SyntaxError("Incompatible function object.");
    } 
  }

  // ___                ___             _   _          
  //| _ \_  _ _ _ ___  | __|  _ _ _  __| |_(_)___ _ _  
  //|  _/ || | '_/ -_) | _| || | ' \/ _|  _| / _ \ ' \ 
  //|_|  \_,_|_| \___| |_| \_,_|_||_\__|\__|_\___/_||_|

  function Pure(scope={}, ...parameters) {
    //if(!(this instanceof Pure)) return new Pure(scope={}, ...parameters);
    //else with(new Proxy(scope, {has:function() {return true;}})) return Function.call(this, ...parameters);
    return define(parameters, scope);
  }
  Pure.prototype = Object.create(Function.prototype);
  Pure.prototype.constructor = Pure;

  Pure.from = function from(closure) {
    return recompile(closure, {});
  }

  return Pure;

})();
