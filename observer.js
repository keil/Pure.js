var Observer = Observer || (function() {

  //__ __ ___ _ __ _ _ __ 
  //\ V  V / '_/ _` | '_ \
  // \_/\_/|_| \__,_| .__/
  //                |_|   

  /** 
   * map: target -> proxy
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
     * Avoid re-wrapping of proxies/ targets.
     * Avaid double wrapped obejcts.
     * (works only when unsing transparent proxies)
     **/
    if(proxies.has(target)) {
      return proxies.get(target);
    }

    var handler = new Membrane();
    var proxy = new TransparentProxy(target, handler);

    /**
     * Stores the current proxy
     **/
    proxies.set(target, proxy);

    return proxy;
  }

  // __  __           _                      ___                 
  //|  \/  |___ _ __ | |__ _ _ __ _ _ _  ___| __|_ _ _ _ ___ _ _ 
  //| |\/| / -_) '  \| '_ \ '_/ _` | ' \/ -_) _|| '_| '_/ _ \ '_|
  //|_|  |_\___|_|_|_|_.__/_| \__,_|_||_\___|___|_| |_| \___/_|  

  function MembraneError(message) {
    this.name = 'Membrane Error';
    this.message = message || 'Pure function cannot cause observable effects.';
    this.stack = (new Error()).stack;
  }
  MembraneError.prototype = Object.create(Error.prototype);
  MembraneError.prototype.constructor = MembraneError;

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
      throw new MembraneError();
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
      throw new MembraneError();
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
      throw new MembraneError();
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

      var desc = Object.getOwnPropertyDescriptor(target, name);
      if(desc && desc.get) {
        var getter = wrap(desc.get);
        return getter.apply(this);
      } else {
        return wrap(target[name])
      }
    };

    /** 
     * A trap for setting property values.
     **/
    this.set = function(target, name, value, receiver) {
      throw new MembraneError();
    };

    /**
     * A trap for the delete operator.
     **/
    this.deleteProperty = function(target, name) {
      throw new MembraneError();
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
        throw new MembraneError();
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
        throw new MembraneError();
      }
    }
  }










  // _  _              _ _         
  //| || |__ _ _ _  __| | |___ _ _ 
  //| __ / _` | ' \/ _` | / -_) '_|
  //|_||_\__,_|_||_\__,_|_\___|_|  

  function Handler(handler) {
    if(!(this instanceof Handler)) return new Handler(handler);

    /**
     * A trap for Object.getPrototypeOf.
     **/
    this.getPrototypeOf = function(target) {
      throw new Error("Trap not implemented."); // TODO
      //return wrap(Object.getPrototypeOf(target));
    }

    /**
     * A trap for Object.setPrototypeOf.
     **/
    this.setPrototypeOf = function(target, prototype) {
      throw new Error("Trap not implemented."); // TODO
      //throw new MembraneError();
    }

    /**
     * A trap for Object.isExtensible
     **/
    this.isExtensible = function(target) {
      throw new Error("Trap not implemented."); // TODO
      //return Object.isExtensible(target);
    };

    /** 
     * A trap for Object.preventExtensions.
     **/
    this.preventExtensions = function(target) {
      throw new Error("Trap not implemented."); // TODO
      //throw new MembraneError();
    };

    /** 
     * A trap for Object.getOwnPropertyDescriptor.
     **/
    this.getOwnPropertyDescriptor = function(target, name) {
      throw new Error("Trap not implemented."); // TODO
      //return wrap(Object.getOwnPropertyDescriptor(target, name));
    };

    /** 
     * A trap for Object.defineProperty.
     **/
    this.defineProperty = function(target, name, desc) {
      throw new Error("Trap not implemented."); // TODO
      //throw new MembraneError();
    };

    /** 
     * A trap for the in operator.
     **/
    this.has = function(target, name) {
      throw new Error("Trap not implemented."); // TODO
      //return (name in target);
    };

    /**
     * A trap for getting property values.
     **/
    this.get = function(target, name, receiver) {
    
      // get user specific trap
      var trap = handler.get;

      // call trap to notify the handler 
      // and to receive the continuation function
      var continuation = trap.call(this, wrap(target), wrap(name), wrap(receiver));

      // default operation
      var result = target[name];

      continuation(wrap())


      /** Begin: default behavior
       **/
      var ret = target[name];

      return callTrap('preGet', {return:ret}).return;



      -
        -      var configuration = new Configation.Get(targeet, name, receiver);
      -      
        -      if(var trap = 'preGet' in handler) handler[trap](configuration);
      -
        -
        -      Configation.equals(configuration, )
        -
        -      var {targeet:targeet, name:name, receiver:receiver} = calltrap('get', {targeet:targeet, name:name, receiver:receiver});
      -
        -      var {return:return} = 
        -
        -
        -      if(('preGet') in handler) {
          -        var configuration = {targeet:targeet, name:name, receiver:receiver};
          -        var configurationP = handler['preGet'](configuration);
          +      var desc = Object.getOwnPropertyDescriptor(origin, name);
          +      if(desc && desc.get) {
            +        var getter = wrap(desc.get);
            +        return getter.apply(this);
            +      } else {
              +        return wrap(target[name])
            }
          -
            -      var 
            -

            if()handler


              if(name === Symbol.toPrimitive) return wrap(origin[name]);

          var desc = Object.getOwnPropertyDescriptor(origin, name);
          if(desc && desc.get) {
            var getter = wrap(desc.get);
            return getter.apply(this);
          } else {
            return wrap(target[name])
          }
        };

      /** 
       * A trap for setting property values.
       **/
      this.set = function(target, name, value, receiver) {
        throw new Error("Trap not implemented."); // TODO
        //throw new MembraneError();
      };

      /**
       * A trap for the delete operator.
       **/
      this.deleteProperty = function(target, name) {
        throw new Error("Trap not implemented."); // TODO
        //throw new MembraneError();
      };

      /** 
       * A trap for for...in statements.
       **/
      this.enumerate = function(target) {
        throw new Error("Trap not implemented."); // TODO
        //var properties = new Set();
        //for(var property in target) {
        // properties.add(property);
        //}
        //return Array.from(properties)[Symbol.iterator]();
      };

      /**
       * A trap for Object.getOwnPropertyNames.
       **/
      this.ownKeys = function(target) {
        throw new Error("Trap not implemented."); // TODO
        //return Object.getOwnPropertyNames(target);
      };

      /** 
       * A trap for a function call.
       **/
      this.apply = function(target, thisArg, argumentsList) {
        throw new Error("Trap not implemented."); // TODO
        //if(target instanceof Pure) {
        //  return target.apply(wrap(thisArg), wrap(argumentsList))
        //} else {
        //  throw new MembraneError();
        //}
      };

      /** 
       * A trap for the new operator. 
       **/
      this.construct = function(target, argumentsList) {
        throw new Error("Trap not implemented."); // TODO
        //if(target instanceof Pure) {
        //  var thisArg = Object.create(target.prototype);
        //  var result = target.apply(wrap(thisArg), wrap(argumentsList));
        //  return (result instanceof Object) ? result : wrap(thisArg);
        //} else {
        //  throw new MembraneError();
       // }
      }
    }






    //  ___  _                            
    // / _ \| |__ ___ ___ _ ___ _____ _ _ 
    //| (_) | '_ (_-</ -_) '_\ V / -_) '_|
    // \___/|_.__/__/\___|_|  \_/\___|_|  

    var observers = new WeakSet()

    function Observer(target, handler, keep=true) {

      var ohandler = new ObserverHandler(handler);
      var oproxy = new TransparentProxy(target, handler);
// meta handler


 // checks for pure function
      if(!Pure.isPure(trap)) return new Error("Trap 'get' must be a pure function.");






      if(keep) observers.add(oproxy);

      return oproxy;
    }
    Observer.prototype = {};

    // _       ___ _       _           
    //| |_ ___/ __| |_ _ _(_)_ _  __ _ 
    //|  _/ _ \__ \  _| '_| | ' \/ _` |
    // \__\___/___/\__|_| |_|_||_\__, |
    //                           |___/ 

    Object.defineProperty(Observer.prototype, "toString", {
      get: function() {
        return function() { return "[[Obserber]]"; };
      }
    });

    //                _          
    //__ _____ _ _ __(_)___ _ _  
    //\ V / -_) '_(_-< / _ \ ' \ 
    // \_/\___|_| /__/_\___/_||_|

    Object.defineProperty(Observer, "version", {
      value: "Observer 1.3.3 (PoC)"
    });

    Object.defineProperty(Observer.prototype, "version", {
      value: Sandbox.version
    });

    // _     ___  _                            
    //(_)___/ _ \| |__ ___ ___ _ ___ _____ _ _ 
    //| (_-< (_) | '_ (_-</ -_) '_\ V / -_) '_|
    //|_/__/\___/|_.__/__/\___|_|  \_/\___|_|  

    Object.defineProperty(Observer, "isObserver", {
      value: function(object) {
        return observers.has(object);
      } 
    });



    //         _                 
    // _ _ ___| |_ _  _ _ _ _ _  
    //| '_/ -_)  _| || | '_| ' \ 
    //|_| \___|\__|\_,_|_| |_||_|

    return Observer;

  })();
