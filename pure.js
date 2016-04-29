var Pure = Pure || (function() {

  //  _____                 _ _               
  // / ____|               | | |              
  //| (___   __ _ _ __   __| | |__   _____  __
  // \___ \ / _` | '_ \ / _` | '_ \ / _ \ \/ /
  // ____) | (_| | | | | (_| | |_) | (_) >  < 
  //|_____/ \__,_|_| |_|\__,_|_.__/ \___/_/\_\

  //  ___                 
  // | __|_ _ _ _ ___ _ _ 
  // | _|| '_| '_/ _ \ '_|
  // |___|_| |_| \___/_|  

  function PureError (message) {
    this.name = 'Pure Error';
    this.message = 'Pure function cannot cause observable effects.' + (message? '\n'+message: '');;
    this.stack = (new Error()).stack;
  }
  PureError.prototype = Object.create(Error.prototype);
  PureError.prototype.constructor = PureError;

  //__ __ ___ _ __ _ _ __ 
  //\ V  V / '_/ _` | '_ \
  // \_/\_/|_| \__,_| .__/
  //                |_|   

  /** 
   * proxies: proxy -> target
   **/
  var proxies = new WeakMap();

  /** 
   * targets: target -> proxy
   **/
  var targets = new WeakMap();

  /** 
   * wrap: target -> proxy
   **/
  function wrap(target) {

    /**
     * If target is a primitive value, return target.
     **/
    if (target !== Object(target)) {
      return target;
    }

    /**
     * Avoid re-wrapping of targets/ proxies
     **/
    if(targets.has(target)) {
      return targets.get(target);
    } else if (proxies.has(target)) {
      return target;
    }

    var handler = new Membrane();
    var proxy = new Proxy(target, handler);

    /**
     * Stores the current proxy
     **/
    targets.set(target, proxy);
    proxies.set(proxy, target);

    return proxy;
  }

  /** 
   * wrap: target -> proxy
   **/
  function unwrap(proxy) {
    if(proxies.has(proxy)) {
      return proxies.get(proxy);
    } else {
      return proxy;
    }
  }

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
      throw new PureError();
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
      throw new PureError();
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
      throw new PureError();
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
      if(name === Symbol.toPrimitive) return wrap(target[name]);
      if(name === Symbol.iterator) return target[name];

      var desc = Object.getOwnPropertyDescriptor(target, name);
      if(desc && desc.get) {
        var getter = wrap(desc.get);
        return getter.apply(this);
      } else {
        return wrap(target[name]);
      }
    };

    /** 
     * A trap for setting property values.
     **/
    this.set = function(target, name, value, receiver) {
      throw new PureError();
    };

    /**
     * A trap for the delete operator.
     **/
    this.deleteProperty = function(target, name) {
      throw new PureError();
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
        throw new PureError();
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
        throw new PureError();
      }
    }
  }

  // _____                  ______                _   _             
  //|  __ \                |  ____|              | | (_)            
  //| |__) |   _ _ __ ___  | |__ _   _ _ __   ___| |_ _  ___  _ __  
  //|  ___/ | | | '__/ _ \ |  __| | | | '_ \ / __| __| |/ _ \| '_ \ 
  //| |   | |_| | | |  __/ | |  | |_| | | | | (__| |_| | (_) | | | |
  //|_|    \__,_|_|  \___| |_|   \__,_|_| |_|\___|\__|_|\___/|_| |_|

  /**
   * Regerence to the global Function constructor.
   **/
  var GlobalFunction = Function;

  /**
   * Cache. Remembers already existing pure function.
   **/
  var cache = new Set();   

  // _ _ ___ __ ___ _ __  _ __(_) |___ 
  //| '_/ -_) _/ _ \ '  \| '_ \ | / -_)
  //|_| \___\__\___/_|_|_| .__/_|_\___|
  //                     |_|           

  function recompile(realm, closure) {
    try {

      /**
       * Scope Proxy.
       * Stopt the traversal of the scope chain lookup.
       **/
      var scope = new Proxy(realm, {
        has: function() {
          return true;
        }
      });

      /**
       * Function Body.
       * Dcompiled function body.
       **/
      var body = "(function() {'use strict'; return " + ("(" +  GlobalFunction.prototype.toString.call(closure) + ")") + "})();";

      /**
       * New Pure Function.
       * Function is nested in the realm.
       **/
      var pure = eval("(function() { with(scope) { return " + body + " }})();");

      /**
       * Application Jandler.
       * Wraps/Uwraps arguments and return of a function call to protect arguments/.
       **/
      var handler = {
        apply: function(target, thisArg, argumentsList) {
          return unwrap(target.apply(wrap(thisArg), wrap(argumentsList)));
        }
      };

      /**
       * Redefines the prototype of the pure function.
       **/
      Object.setPrototypeOf(pure, Pure.prototype);

      /**
       * Return new pure function.
       **/    
      var proxy = new Proxy(pure, handler);
      cache.add(proxy);
      return proxy;

    } catch(error) {
      throw new SyntaxError("Incompatible function object." + error.message);
    } 
  }

  //    _      __ _          
  // __| |___ / _(_)_ _  ___ 
  /// _` / -_)  _| | ' \/ -_)
  //\__,_\___|_| |_|_||_\___|

  function define(scope, parameters) {
    try {

      /**
       * Special Treatment for Function Objects.
       * Calling JavaScrip's global Function constructor creates fresh 
       * functions w.r.t the global scope.
       **/
      return recompile(scope, new Function(...parameters))
    } catch(error) {
      throw new SyntaxError("Incompatible function object." + error.message);
    } 
  }                                                    

  // ___                ___             _   _          
  //| _ \_  _ _ _ ___  | __|  _ _ _  __| |_(_)___ _ _  
  //|  _/ || | '_/ -_) | _| || | ' \/ _|  _| / _ \ ' \ 
  //|_|  \_,_|_| \___| |_| \_,_|_||_\__|\__|_\___/_||_|

  function Pure(realm={}, ...parameters) {
    return define(realm, parameters);
  }

  //              _       _                  
  // _ __ _ _ ___| |_ ___| |_ _  _ _ __  ___ 
  //| '_ \ '_/ _ \  _/ _ \  _| || | '_ \/ -_)
  //| .__/_| \___/\__\___/\__|\_, | .__/\___|
  //|_|                       |__/|_|        

  Object.defineProperty(Pure, "prototype", {
    value: Object.create(Function.prototype)
  });

  //                _               _           
  // __ ___ _ _  __| |_ _ _ _  _ __| |_ ___ _ _ 
  /// _/ _ \ ' \(_-<  _| '_| || / _|  _/ _ \ '_|
  //\__\___/_||_/__/\__|_|  \_,_\__|\__\___/_|  

  Object.defineProperty(Pure.prototype, "constructor", {
    value: Pure
  });

  //  __               
  // / _|_ _ ___ _ __  
  //|  _| '_/ _ \ '  \ 
  //|_| |_| \___/_|_|_|

  Object.defineProperty(Pure, "from", {
    value: function(closure) { // TODO: realm
      return recompile({}, closure);
    }
  });

  // _    ___              
  //(_)__| _ \_  _ _ _ ___ 
  //| (_-<  _/ || | '_/ -_)
  //|_/__/_|  \_,_|_| \___|

  Object.defineProperty(Pure, "isPure", {
    value: function(closure) {
      return cache.has(closure);
    }
  });

  // TODO
  // make also is pure as prototype function

  //                _          
  //__ _____ _ _ __(_)___ _ _  
  //\ V / -_) '_(_-< / _ \ ' \ 
  // \_/\___|_| /__/_\___/_||_|

  Object.defineProperty(Pure, "version", {
    value: "Pure 0.0.1 (PoC)"
  });

  Object.defineProperty(Pure.prototype, "version", {
    value: Pure.version
  });

  // _       ___ _       _           
  //| |_ ___/ __| |_ _ _(_)_ _  __ _ 
  //|  _/ _ \__ \  _| '_| | ' \/ _` |
  // \__\___/___/\__|_| |_|_||_\__, |
  //                           |___/ 

  Object.defineProperty(Pure, "toString", {
    value: function() {
      return "[[Pure]]";
    }
  });

  Object.defineProperty(Pure.prototype, "toString", {
    value: function() {
      return "asdfadsf"; // TODO
    }
  });

  // ___          _       
  //| _ \___ __ _| |_ __  
  //|   / -_) _` | | '  \ 
  //|_|_\___\__,_|_|_|_|_|

  Object.defineProperty(Pure, "Realm", {
    value: {} // TODO
  });

  //                 _       ___          _       
  // __ _ _ ___ __ _| |_ ___| _ \___ __ _| |_ __  
  /// _| '_/ -_) _` |  _/ -_)   / -_) _` | | '  \ 
  //\__|_| \___\__,_|\__\___|_|_\___\__,_|_|_|_|_|

  Object.defineProperty(Pure, "createRealm", {
    value: function() {

      // create new realm
      var realm = {};
      // TODO, create new object rure,realm, with predefined string and prototype

      // return new realm
      return realm;
    }
  });

  //  ___                 
  // | __|_ _ _ _ ___ _ _ 
  // | _|| '_| '_/ _ \ '_|
  // |___|_| |_| \___/_|  

  Object.defineProperty(Pure, "Error", {
    value: PureError
  });

  //         _                 
  // _ _ ___| |_ _  _ _ _ _ _  
  //| '_/ -_)  _| || | '_| ' \ 
  //|_| \___|\__|\_,_|_| |_||_|

  return Pure;

})();
