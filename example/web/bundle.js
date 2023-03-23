(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
})((function () { 'use strict';

  var domain;

  // This constructor is used to store event handlers. Instantiating this is
  // faster than explicitly calling `Object.create(null)` to get a "clean" empty
  // object (tested with v8 v4.9).
  function EventHandlers() {}
  EventHandlers.prototype = Object.create(null);

  function EventEmitter() {
    EventEmitter.init.call(this);
  }

  // nodejs oddity
  // require('events') === require('events').EventEmitter
  EventEmitter.EventEmitter = EventEmitter;

  EventEmitter.usingDomains = false;

  EventEmitter.prototype.domain = undefined;
  EventEmitter.prototype._events = undefined;
  EventEmitter.prototype._maxListeners = undefined;

  // By default EventEmitters will print a warning if more than 10 listeners are
  // added to it. This is a useful default which helps finding memory leaks.
  EventEmitter.defaultMaxListeners = 10;

  EventEmitter.init = function() {
    this.domain = null;
    if (EventEmitter.usingDomains) {
      // if there is an active domain, then attach to it.
      if (domain.active ) ;
    }

    if (!this._events || this._events === Object.getPrototypeOf(this)._events) {
      this._events = new EventHandlers();
      this._eventsCount = 0;
    }

    this._maxListeners = this._maxListeners || undefined;
  };

  // Obviously not all Emitters should be limited to 10. This function allows
  // that to be increased. Set to zero for unlimited.
  EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
    if (typeof n !== 'number' || n < 0 || isNaN(n))
      throw new TypeError('"n" argument must be a positive number');
    this._maxListeners = n;
    return this;
  };

  function $getMaxListeners(that) {
    if (that._maxListeners === undefined)
      return EventEmitter.defaultMaxListeners;
    return that._maxListeners;
  }

  EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
    return $getMaxListeners(this);
  };

  // These standalone emit* functions are used to optimize calling of event
  // handlers for fast cases because emit() itself often has a variable number of
  // arguments and can be deoptimized because of that. These functions always have
  // the same number of arguments and thus do not get deoptimized, so the code
  // inside them can execute faster.
  function emitNone(handler, isFn, self) {
    if (isFn)
      handler.call(self);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self);
    }
  }
  function emitOne(handler, isFn, self, arg1) {
    if (isFn)
      handler.call(self, arg1);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1);
    }
  }
  function emitTwo(handler, isFn, self, arg1, arg2) {
    if (isFn)
      handler.call(self, arg1, arg2);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2);
    }
  }
  function emitThree(handler, isFn, self, arg1, arg2, arg3) {
    if (isFn)
      handler.call(self, arg1, arg2, arg3);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].call(self, arg1, arg2, arg3);
    }
  }

  function emitMany(handler, isFn, self, args) {
    if (isFn)
      handler.apply(self, args);
    else {
      var len = handler.length;
      var listeners = arrayClone(handler, len);
      for (var i = 0; i < len; ++i)
        listeners[i].apply(self, args);
    }
  }

  EventEmitter.prototype.emit = function emit(type) {
    var er, handler, len, args, i, events, domain;
    var doError = (type === 'error');

    events = this._events;
    if (events)
      doError = (doError && events.error == null);
    else if (!doError)
      return false;

    domain = this.domain;

    // If there is no 'error' event listener then throw.
    if (doError) {
      er = arguments[1];
      if (domain) {
        if (!er)
          er = new Error('Uncaught, unspecified "error" event');
        er.domainEmitter = this;
        er.domain = domain;
        er.domainThrown = false;
        domain.emit('error', er);
      } else if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        // At least give some kind of context to the user
        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
        err.context = er;
        throw err;
      }
      return false;
    }

    handler = events[type];

    if (!handler)
      return false;

    var isFn = typeof handler === 'function';
    len = arguments.length;
    switch (len) {
      // fast cases
      case 1:
        emitNone(handler, isFn, this);
        break;
      case 2:
        emitOne(handler, isFn, this, arguments[1]);
        break;
      case 3:
        emitTwo(handler, isFn, this, arguments[1], arguments[2]);
        break;
      case 4:
        emitThree(handler, isFn, this, arguments[1], arguments[2], arguments[3]);
        break;
      // slower
      default:
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        emitMany(handler, isFn, this, args);
    }

    return true;
  };

  function _addListener(target, type, listener, prepend) {
    var m;
    var events;
    var existing;

    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');

    events = target._events;
    if (!events) {
      events = target._events = new EventHandlers();
      target._eventsCount = 0;
    } else {
      // To avoid recursion in the case that type === "newListener"! Before
      // adding it to the listeners, first emit "newListener".
      if (events.newListener) {
        target.emit('newListener', type,
                    listener.listener ? listener.listener : listener);

        // Re-assign `events` because a newListener handler could have caused the
        // this._events to be assigned to a new object
        events = target._events;
      }
      existing = events[type];
    }

    if (!existing) {
      // Optimize the case of one listener. Don't need the extra array object.
      existing = events[type] = listener;
      ++target._eventsCount;
    } else {
      if (typeof existing === 'function') {
        // Adding the second element, need to change to array.
        existing = events[type] = prepend ? [listener, existing] :
                                            [existing, listener];
      } else {
        // If we've already got an array, just append.
        if (prepend) {
          existing.unshift(listener);
        } else {
          existing.push(listener);
        }
      }

      // Check for listener leak
      if (!existing.warned) {
        m = $getMaxListeners(target);
        if (m && m > 0 && existing.length > m) {
          existing.warned = true;
          var w = new Error('Possible EventEmitter memory leak detected. ' +
                              existing.length + ' ' + type + ' listeners added. ' +
                              'Use emitter.setMaxListeners() to increase limit');
          w.name = 'MaxListenersExceededWarning';
          w.emitter = target;
          w.type = type;
          w.count = existing.length;
          emitWarning(w);
        }
      }
    }

    return target;
  }
  function emitWarning(e) {
    typeof console.warn === 'function' ? console.warn(e) : console.log(e);
  }
  EventEmitter.prototype.addListener = function addListener(type, listener) {
    return _addListener(this, type, listener, false);
  };

  EventEmitter.prototype.on = EventEmitter.prototype.addListener;

  EventEmitter.prototype.prependListener =
      function prependListener(type, listener) {
        return _addListener(this, type, listener, true);
      };

  function _onceWrap(target, type, listener) {
    var fired = false;
    function g() {
      target.removeListener(type, g);
      if (!fired) {
        fired = true;
        listener.apply(target, arguments);
      }
    }
    g.listener = listener;
    return g;
  }

  EventEmitter.prototype.once = function once(type, listener) {
    if (typeof listener !== 'function')
      throw new TypeError('"listener" argument must be a function');
    this.on(type, _onceWrap(this, type, listener));
    return this;
  };

  EventEmitter.prototype.prependOnceListener =
      function prependOnceListener(type, listener) {
        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');
        this.prependListener(type, _onceWrap(this, type, listener));
        return this;
      };

  // emits a 'removeListener' event iff the listener was removed
  EventEmitter.prototype.removeListener =
      function removeListener(type, listener) {
        var list, events, position, i, originalListener;

        if (typeof listener !== 'function')
          throw new TypeError('"listener" argument must be a function');

        events = this._events;
        if (!events)
          return this;

        list = events[type];
        if (!list)
          return this;

        if (list === listener || (list.listener && list.listener === listener)) {
          if (--this._eventsCount === 0)
            this._events = new EventHandlers();
          else {
            delete events[type];
            if (events.removeListener)
              this.emit('removeListener', type, list.listener || listener);
          }
        } else if (typeof list !== 'function') {
          position = -1;

          for (i = list.length; i-- > 0;) {
            if (list[i] === listener ||
                (list[i].listener && list[i].listener === listener)) {
              originalListener = list[i].listener;
              position = i;
              break;
            }
          }

          if (position < 0)
            return this;

          if (list.length === 1) {
            list[0] = undefined;
            if (--this._eventsCount === 0) {
              this._events = new EventHandlers();
              return this;
            } else {
              delete events[type];
            }
          } else {
            spliceOne(list, position);
          }

          if (events.removeListener)
            this.emit('removeListener', type, originalListener || listener);
        }

        return this;
      };
      
  // Alias for removeListener added in NodeJS 10.0
  // https://nodejs.org/api/events.html#events_emitter_off_eventname_listener
  EventEmitter.prototype.off = function(type, listener){
      return this.removeListener(type, listener);
  };

  EventEmitter.prototype.removeAllListeners =
      function removeAllListeners(type) {
        var listeners, events;

        events = this._events;
        if (!events)
          return this;

        // not listening for removeListener, no need to emit
        if (!events.removeListener) {
          if (arguments.length === 0) {
            this._events = new EventHandlers();
            this._eventsCount = 0;
          } else if (events[type]) {
            if (--this._eventsCount === 0)
              this._events = new EventHandlers();
            else
              delete events[type];
          }
          return this;
        }

        // emit removeListener for all listeners on all events
        if (arguments.length === 0) {
          var keys = Object.keys(events);
          for (var i = 0, key; i < keys.length; ++i) {
            key = keys[i];
            if (key === 'removeListener') continue;
            this.removeAllListeners(key);
          }
          this.removeAllListeners('removeListener');
          this._events = new EventHandlers();
          this._eventsCount = 0;
          return this;
        }

        listeners = events[type];

        if (typeof listeners === 'function') {
          this.removeListener(type, listeners);
        } else if (listeners) {
          // LIFO order
          do {
            this.removeListener(type, listeners[listeners.length - 1]);
          } while (listeners[0]);
        }

        return this;
      };

  EventEmitter.prototype.listeners = function listeners(type) {
    var evlistener;
    var ret;
    var events = this._events;

    if (!events)
      ret = [];
    else {
      evlistener = events[type];
      if (!evlistener)
        ret = [];
      else if (typeof evlistener === 'function')
        ret = [evlistener.listener || evlistener];
      else
        ret = unwrapListeners(evlistener);
    }

    return ret;
  };

  EventEmitter.listenerCount = function(emitter, type) {
    if (typeof emitter.listenerCount === 'function') {
      return emitter.listenerCount(type);
    } else {
      return listenerCount.call(emitter, type);
    }
  };

  EventEmitter.prototype.listenerCount = listenerCount;
  function listenerCount(type) {
    var events = this._events;

    if (events) {
      var evlistener = events[type];

      if (typeof evlistener === 'function') {
        return 1;
      } else if (evlistener) {
        return evlistener.length;
      }
    }

    return 0;
  }

  EventEmitter.prototype.eventNames = function eventNames() {
    return this._eventsCount > 0 ? Reflect.ownKeys(this._events) : [];
  };

  // About 1.5x faster than the two-arg version of Array#splice().
  function spliceOne(list, index) {
    for (var i = index, k = i + 1, n = list.length; k < n; i += 1, k += 1)
      list[i] = list[k];
    list.pop();
  }

  function arrayClone(arr, i) {
    var copy = new Array(i);
    while (i--)
      copy[i] = arr[i];
    return copy;
  }

  function unwrapListeners(arr) {
    var ret = new Array(arr.length);
    for (var i = 0; i < ret.length; ++i) {
      ret[i] = arr[i].listener || arr[i];
    }
    return ret;
  }

  /**
   * lodash (Custom Build) <https://lodash.com/>
   * Build: `lodash modularize exports="npm" -o ./`
   * Copyright jQuery Foundation and other contributors <https://jquery.org/>
   * Released under MIT license <https://lodash.com/license>
   * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
   * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
   */

  /** Used as references for various `Number` constants. */
  var INFINITY = 1 / 0,
      MAX_SAFE_INTEGER = 9007199254740991,
      MAX_INTEGER = 1.7976931348623157e+308,
      NAN = 0 / 0;

  /** `Object#toString` result references. */
  var funcTag = '[object Function]',
      genTag = '[object GeneratorFunction]',
      symbolTag = '[object Symbol]';

  /** Used to match leading and trailing whitespace. */
  var reTrim = /^\s+|\s+$/g;

  /** Used to detect bad signed hexadecimal string values. */
  var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

  /** Used to detect binary string values. */
  var reIsBinary = /^0b[01]+$/i;

  /** Used to detect octal string values. */
  var reIsOctal = /^0o[0-7]+$/i;

  /** Used to detect unsigned integer values. */
  var reIsUint = /^(?:0|[1-9]\d*)$/;

  /** Built-in method references without a dependency on `root`. */
  var freeParseInt = parseInt;

  /** Used for built-in method references. */
  var objectProto = Object.prototype;

  /**
   * Used to resolve the
   * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
   * of values.
   */
  var objectToString = objectProto.toString;

  /* Built-in method references for those with the same name as other `lodash` methods. */
  var nativeCeil = Math.ceil,
      nativeMax = Math.max;

  /**
   * The base implementation of `_.slice` without an iteratee call guard.
   *
   * @private
   * @param {Array} array The array to slice.
   * @param {number} [start=0] The start position.
   * @param {number} [end=array.length] The end position.
   * @returns {Array} Returns the slice of `array`.
   */
  function baseSlice(array, start, end) {
    var index = -1,
        length = array.length;

    if (start < 0) {
      start = -start > length ? 0 : (length + start);
    }
    end = end > length ? length : end;
    if (end < 0) {
      end += length;
    }
    length = start > end ? 0 : ((end - start) >>> 0);
    start >>>= 0;

    var result = Array(length);
    while (++index < length) {
      result[index] = array[index + start];
    }
    return result;
  }

  /**
   * Checks if `value` is a valid array-like index.
   *
   * @private
   * @param {*} value The value to check.
   * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
   * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
   */
  function isIndex(value, length) {
    length = length == null ? MAX_SAFE_INTEGER : length;
    return !!length &&
      (typeof value == 'number' || reIsUint.test(value)) &&
      (value > -1 && value % 1 == 0 && value < length);
  }

  /**
   * Checks if the given arguments are from an iteratee call.
   *
   * @private
   * @param {*} value The potential iteratee value argument.
   * @param {*} index The potential iteratee index or key argument.
   * @param {*} object The potential iteratee object argument.
   * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
   *  else `false`.
   */
  function isIterateeCall(value, index, object) {
    if (!isObject(object)) {
      return false;
    }
    var type = typeof index;
    if (type == 'number'
          ? (isArrayLike(object) && isIndex(index, object.length))
          : (type == 'string' && index in object)
        ) {
      return eq(object[index], value);
    }
    return false;
  }

  /**
   * Creates an array of elements split into groups the length of `size`.
   * If `array` can't be split evenly, the final chunk will be the remaining
   * elements.
   *
   * @static
   * @memberOf _
   * @since 3.0.0
   * @category Array
   * @param {Array} array The array to process.
   * @param {number} [size=1] The length of each chunk
   * @param- {Object} [guard] Enables use as an iteratee for methods like `_.map`.
   * @returns {Array} Returns the new array of chunks.
   * @example
   *
   * _.chunk(['a', 'b', 'c', 'd'], 2);
   * // => [['a', 'b'], ['c', 'd']]
   *
   * _.chunk(['a', 'b', 'c', 'd'], 3);
   * // => [['a', 'b', 'c'], ['d']]
   */
  function chunk(array, size, guard) {
    if ((guard ? isIterateeCall(array, size, guard) : size === undefined)) {
      size = 1;
    } else {
      size = nativeMax(toInteger(size), 0);
    }
    var length = array ? array.length : 0;
    if (!length || size < 1) {
      return [];
    }
    var index = 0,
        resIndex = 0,
        result = Array(nativeCeil(length / size));

    while (index < length) {
      result[resIndex++] = baseSlice(array, index, (index += size));
    }
    return result;
  }

  /**
   * Performs a
   * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
   * comparison between two values to determine if they are equivalent.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to compare.
   * @param {*} other The other value to compare.
   * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
   * @example
   *
   * var object = { 'a': 1 };
   * var other = { 'a': 1 };
   *
   * _.eq(object, object);
   * // => true
   *
   * _.eq(object, other);
   * // => false
   *
   * _.eq('a', 'a');
   * // => true
   *
   * _.eq('a', Object('a'));
   * // => false
   *
   * _.eq(NaN, NaN);
   * // => true
   */
  function eq(value, other) {
    return value === other || (value !== value && other !== other);
  }

  /**
   * Checks if `value` is array-like. A value is considered array-like if it's
   * not a function and has a `value.length` that's an integer greater than or
   * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
   * @example
   *
   * _.isArrayLike([1, 2, 3]);
   * // => true
   *
   * _.isArrayLike(document.body.children);
   * // => true
   *
   * _.isArrayLike('abc');
   * // => true
   *
   * _.isArrayLike(_.noop);
   * // => false
   */
  function isArrayLike(value) {
    return value != null && isLength(value.length) && !isFunction(value);
  }

  /**
   * Checks if `value` is classified as a `Function` object.
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a function, else `false`.
   * @example
   *
   * _.isFunction(_);
   * // => true
   *
   * _.isFunction(/abc/);
   * // => false
   */
  function isFunction(value) {
    // The use of `Object#toString` avoids issues with the `typeof` operator
    // in Safari 8-9 which returns 'object' for typed array and other constructors.
    var tag = isObject(value) ? objectToString.call(value) : '';
    return tag == funcTag || tag == genTag;
  }

  /**
   * Checks if `value` is a valid array-like length.
   *
   * **Note:** This method is loosely based on
   * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
   * @example
   *
   * _.isLength(3);
   * // => true
   *
   * _.isLength(Number.MIN_VALUE);
   * // => false
   *
   * _.isLength(Infinity);
   * // => false
   *
   * _.isLength('3');
   * // => false
   */
  function isLength(value) {
    return typeof value == 'number' &&
      value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
  }

  /**
   * Checks if `value` is the
   * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
   * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
   *
   * @static
   * @memberOf _
   * @since 0.1.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is an object, else `false`.
   * @example
   *
   * _.isObject({});
   * // => true
   *
   * _.isObject([1, 2, 3]);
   * // => true
   *
   * _.isObject(_.noop);
   * // => true
   *
   * _.isObject(null);
   * // => false
   */
  function isObject(value) {
    var type = typeof value;
    return !!value && (type == 'object' || type == 'function');
  }

  /**
   * Checks if `value` is object-like. A value is object-like if it's not `null`
   * and has a `typeof` result of "object".
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
   * @example
   *
   * _.isObjectLike({});
   * // => true
   *
   * _.isObjectLike([1, 2, 3]);
   * // => true
   *
   * _.isObjectLike(_.noop);
   * // => false
   *
   * _.isObjectLike(null);
   * // => false
   */
  function isObjectLike(value) {
    return !!value && typeof value == 'object';
  }

  /**
   * Checks if `value` is classified as a `Symbol` primitive or object.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to check.
   * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
   * @example
   *
   * _.isSymbol(Symbol.iterator);
   * // => true
   *
   * _.isSymbol('abc');
   * // => false
   */
  function isSymbol(value) {
    return typeof value == 'symbol' ||
      (isObjectLike(value) && objectToString.call(value) == symbolTag);
  }

  /**
   * Converts `value` to a finite number.
   *
   * @static
   * @memberOf _
   * @since 4.12.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted number.
   * @example
   *
   * _.toFinite(3.2);
   * // => 3.2
   *
   * _.toFinite(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toFinite(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toFinite('3.2');
   * // => 3.2
   */
  function toFinite(value) {
    if (!value) {
      return value === 0 ? value : 0;
    }
    value = toNumber(value);
    if (value === INFINITY || value === -INFINITY) {
      var sign = (value < 0 ? -1 : 1);
      return sign * MAX_INTEGER;
    }
    return value === value ? value : 0;
  }

  /**
   * Converts `value` to an integer.
   *
   * **Note:** This method is loosely based on
   * [`ToInteger`](http://www.ecma-international.org/ecma-262/7.0/#sec-tointeger).
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to convert.
   * @returns {number} Returns the converted integer.
   * @example
   *
   * _.toInteger(3.2);
   * // => 3
   *
   * _.toInteger(Number.MIN_VALUE);
   * // => 0
   *
   * _.toInteger(Infinity);
   * // => 1.7976931348623157e+308
   *
   * _.toInteger('3.2');
   * // => 3
   */
  function toInteger(value) {
    var result = toFinite(value),
        remainder = result % 1;

    return result === result ? (remainder ? result - remainder : result) : 0;
  }

  /**
   * Converts `value` to a number.
   *
   * @static
   * @memberOf _
   * @since 4.0.0
   * @category Lang
   * @param {*} value The value to process.
   * @returns {number} Returns the number.
   * @example
   *
   * _.toNumber(3.2);
   * // => 3.2
   *
   * _.toNumber(Number.MIN_VALUE);
   * // => 5e-324
   *
   * _.toNumber(Infinity);
   * // => Infinity
   *
   * _.toNumber('3.2');
   * // => 3.2
   */
  function toNumber(value) {
    if (typeof value == 'number') {
      return value;
    }
    if (isSymbol(value)) {
      return NAN;
    }
    if (isObject(value)) {
      var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
      value = isObject(other) ? (other + '') : other;
    }
    if (typeof value != 'string') {
      return value === 0 ? value : +value;
    }
    value = value.replace(reTrim, '');
    var isBinary = reIsBinary.test(value);
    return (isBinary || reIsOctal.test(value))
      ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
      : (reIsBadHex.test(value) ? NAN : +value);
  }

  var lodash_chunk = chunk;

  var Action;
  (function (Action) {
      Action["MULTI_SUBSCRIBE"] = "gusher.multi_subscribe";
      Action["SUBSCRIBE"] = "gusher.subscribe";
      Action["UNSUBSCRIBE"] = "gusher.unsubscribe";
  })(Action || (Action = {}));
  var Event;
  (function (Event) {
      Event["MULTI_SUBSCRIBE_SUCCESS"] = "gusher.multi_subscribe_succeeded";
      Event["SUBSCRIBE_SUCCESS"] = "gusher.subscribe_succeeded\"";
  })(Event || (Event = {}));

  class Channel {
      name;
      gusher;
      subscribed;
      emitter;
      constructor(name, gusher) {
          this.name = name;
          this.gusher = gusher;
          this.subscribed = false;
          this.emitter = new EventEmitter();
      }
      trigger(event, data) {
          this.gusher.send(event, data, this.name);
      }
      bind(event, callback) {
          this.emitter.on(event, callback);
          return this;
      }
      unbind(event, callback) {
          this.emitter.removeListener(event, callback);
          return this;
      }
      unsubscribe() {
          this.gusher.send(Action.UNSUBSCRIBE, { channel: this.name });
      }
      handleEvent(event, data) {
          if (event === Event.SUBSCRIBE_SUCCESS ||
              event === Event.MULTI_SUBSCRIBE_SUCCESS) {
              this.subscribed = true;
          }
          this.emitter.emit(event, data);
      }
      subscribe() {
          this.gusher.send(Action.SUBSCRIBE, { channel: this.name });
      }
      disconnect() {
          this.subscribed = true;
      }
  }

  class Channels {
      channels;
      constructor() {
          this.channels = new Map();
      }
      add(name, gusher) {
          let channel = this.channels.get(name);
          if (!channel) {
              channel = new Channel(name, gusher);
              this.channels.set(name, channel);
          }
          return channel;
      }
      all() {
          const keys = [];
          this.channels.forEach((_, name) => {
              keys.push(name);
          });
          return keys;
      }
      find(name) {
          return this.channels.get(name);
      }
      remove(name) {
          const channel = this.channels.get(name);
          this.channels.delete(name);
          return channel;
      }
      disconnect() {
          this.channels.forEach((channel) => channel.disconnect());
      }
  }

  function padLeft(input, totalWidth) {
      const str = input.toString();
      return str.length >= totalWidth ? str : padLeft(`0${str}`, totalWidth);
  }
  function time() {
      let now = new Date();
      const year = now.getFullYear();
      const month = now.getMonth() + 1;
      const date = now.getDate();
      const hour = padLeft(now.getHours(), 2);
      const minute = padLeft(now.getMinutes(), 2);
      const second = padLeft(now.getSeconds(), 2);
      const millisecond = now.getMilliseconds();
      return `${year}-${month}-${date} ${hour}:${minute}:${second}:${millisecond}`;
  }
  function isDebug() {
      if (!localStorage) {
          return false;
      }
      return localStorage.debug === "*" || localStorage.debug === "Gusher";
  }
  class Logger {
      log(...args) {
          if (isDebug()) {
              const params = [];
              params.push(`%cGusher %c${time()}`, "color: red;", "color: #347deb;");
              console.log(...params.concat(args));
          }
      }
  }
  var Logger$1 = new Logger();

  function ab2str(buf) {
      return String.fromCharCode.apply(null, new Uint16Array(buf));
  }
  function str2ab(str) {
      var buf = new ArrayBuffer(str.length * 2);
      var bufView = new Uint16Array(buf);
      for (var i = 0, strLen = str.length; i < strLen; i++) {
          bufView[i] = str.charCodeAt(i);
      }
      return buf;
  }

  var State$1;
  (function (State) {
      State["INIT"] = "initialized";
      State["ERROR"] = "error";
      State["CLOSED"] = "closed";
      State["CONNECTING"] = "connecting";
      State["OPEN"] = "open";
  })(State$1 || (State$1 = {}));
  var EmitterEvent$1;
  (function (EmitterEvent) {
      EmitterEvent["INIT"] = "initialized";
      EmitterEvent["ERROR"] = "error";
      EmitterEvent["CLOSED"] = "closed";
      EmitterEvent["CONNECTING"] = "connecting";
      EmitterEvent["OPEN"] = "open";
      EmitterEvent["MSG"] = "message";
  })(EmitterEvent$1 || (EmitterEvent$1 = {}));
  class Connection {
      state;
      url = "";
      token = "";
      binary = false;
      emitter;
      socket;
      constructor(options) {
          this.url = options.url;
          this.token = options.token;
          this.binary = options.binary || false;
          this.state = State$1.INIT;
          this.emitter = new EventEmitter();
      }
      bind(event, callback) {
          this.emitter.on(event, callback);
          return this;
      }
      unbind(event, callback) {
          this.emitter.removeListener(event, callback);
          return this;
      }
      connect(token) {
          if (this.socket) {
              this.close();
          }
          let url = this.url || "ws://127.0.0.1";
          if (token) {
              url = `${url}?token=${token}`;
          }
          try {
              this.socket = new WebSocket(url);
              this.socket.binaryType = "arraybuffer";
          }
          catch (e) {
              this.onError(e);
              return false;
          }
          this.bindListeners();
          Logger$1.log("Connecting", { url: this.url, token: this.token });
          this.changeState(State$1.CONNECTING);
          return true;
      }
      close() {
          if (this.socket) {
              this.socket.close();
              return true;
          }
          return false;
      }
      changeState(state, params) {
          this.state = state;
          this.emitter.emit(state, params);
      }
      bindListeners() {
          const socket = this.socket;
          socket.onopen = (evt) => {
              this.onOpen(evt);
          };
          socket.onerror = (evt) => {
              this.onError(evt);
          };
          socket.onclose = (evt) => {
              this.onClose(evt);
          };
          socket.onmessage = (message) => {
              this.onMessage(message);
          };
      }
      unbindListeners() {
          if (this.socket) {
              this.socket.onopen = null;
              this.socket.onerror = null;
              this.socket.onclose = null;
              this.socket.onmessage = null;
          }
      }
      onOpen(evt) {
          this.changeState(State$1.OPEN);
          if (this.socket) {
              this.socket.onopen = null;
          }
      }
      onError(error) {
          this.emitter.emit(EmitterEvent$1.ERROR, error);
      }
      onClose(closeEvent) {
          if (closeEvent) {
              this.changeState(State$1.CLOSED, {
                  code: closeEvent.code,
                  reason: closeEvent.reason,
                  wasClean: closeEvent.wasClean,
              });
          }
          else {
              this.changeState(State$1.CLOSED);
          }
          this.unbindListeners();
          this.socket = undefined;
      }
      onMessage(event) {
          let message;
          let content = '';
          if (event.data instanceof Blob) {
              console.error("gusher is not support type Blob");
          }
          if (event.data instanceof ArrayBuffer) {
              content = ab2str(event.data);
          }
          if (typeof event.data === "string") {
              content = event.data;
          }
          try {
              message = JSON.parse(content);
          }
          catch (err) {
              Logger$1.log({ error: err });
              message = {
                  event: "",
                  data: "",
              };
          }
          Logger$1.log("Event recd", message);
          this.emitter.emit(EmitterEvent$1.MSG, message);
      }
      send(event, data, channel) {
          const message = { event, data };
          if (channel) {
              message.channel = channel;
          }
          Logger$1.log("Event sent", message);
          if (this.socket) {
              const text = JSON.stringify(message);
              if (this.binary) {
                  this.socket.send(str2ab(text));
              }
              else {
                  this.socket.send(text);
              }
          }
      }
  }

  var State;
  (function (State) {
      State["INIT"] = "initialized";
      State["CONNECTED"] = "connected";
      State["ERROR"] = "error";
      State["CLOSED"] = "closed";
      State["CONNECTING"] = "connecting";
      State["DISCONNECTED"] = "disconnected";
  })(State || (State = {}));
  var EmitterEvent;
  (function (EmitterEvent) {
      EmitterEvent["INIT"] = "initialized";
      EmitterEvent["CONNECTED"] = "connected";
      EmitterEvent["ERROR"] = "error";
      EmitterEvent["CLOSED"] = "closed";
      EmitterEvent["ATCLOSED"] = "@closed";
      EmitterEvent["CONNECTING"] = "connecting";
      EmitterEvent["DISCONNECTED"] = "disconnected";
      EmitterEvent["MSG"] = "message";
      EmitterEvent["RETRYMAX"] = "retryMax";
      EmitterEvent["RETRY"] = "retry";
  })(EmitterEvent || (EmitterEvent = {}));
  class ConnectionManager {
      key;
      options;
      state;
      url;
      token;
      emitter;
      reconnection;
      reconnectionDelay;
      retryMax;
      skipReconnect;
      retryNum;
      connectionStartTimestamp;
      retryTimer;
      connection;
      constructor(key, options) {
          this.key = key;
          this.options = options;
          this.state = State.INIT;
          this.url = options.url;
          this.token = options.token;
          this.emitter = new EventEmitter();
          this.reconnection = !!options.reconnection;
          this.reconnectionDelay = !options.reconnectionDelay
              ? 3000
              : options.reconnectionDelay;
          this.retryMax =
              options.retryMax === undefined
                  ? Number.MAX_SAFE_INTEGER
                  : options.retryMax;
          this.skipReconnect = false;
          this.retryNum = 0;
          this.connectionStartTimestamp = 0;
          this.retryTimer = null;
          this.connection = new Connection({ url: this.url, token: this.token, binary: this.options.binary });
          this.connection.bind(EmitterEvent$1.OPEN, () => {
              this.connectionStartTimestamp = Date.now();
              if (this.retryTimer) {
                  clearTimeout(this.retryTimer);
                  this.retryNum = 0;
                  this.retryTimer = null;
              }
              this.skipReconnect = false;
              this.updateState(State.CONNECTED);
          });
          this.connection.bind(EmitterEvent$1.MSG, (message) => {
              this.emitter.emit(EmitterEvent.MSG, message);
          });
          this.connection.bind(EmitterEvent$1.ERROR, (err) => {
              this.updateState(State.ERROR, err);
          });
          this.connection.bind(EmitterEvent$1.CLOSED, (evt) => {
              const sessionTime = Date.now() - this.connectionStartTimestamp;
              if (sessionTime > 0 && this.connectionStartTimestamp !== 0) {
                  this.emitter.emit("@closed", Object.assign({}, evt, { session_time: sessionTime }));
                  Logger$1.log(`Session Time: ${sessionTime} ms`);
                  this.connectionStartTimestamp = 0;
              }
              this.updateState(State.CLOSED, evt);
              this.retryIn(this.reconnectionDelay);
          });
      }
      retryIn(delay = 0) {
          if (this.retryNum >= this.retryMax) {
              this.disconnect();
              this.emitter.emit(EmitterEvent.RETRYMAX);
              Logger$1.log("Reconnect Max: ", this.retryNum);
          }
          if (this.reconnection && !this.skipReconnect) {
              this.retryTimer = window.setTimeout(() => {
                  this.retryNum += 1;
                  Logger$1.log("Reconnect attempts: ", this.retryNum);
                  this.connect();
                  this.emitter.emit(EmitterEvent.RETRY, { retry: this.retryNum });
              }, delay);
          }
      }
      bind(event, callback) {
          this.emitter.on(event, callback);
          return this;
      }
      unbind(event, callback) {
          this.emitter.removeListener(event, callback);
          return this;
      }
      unBindAll(...evt) {
          if (evt.length) {
              this.emitter.removeAllListeners(evt);
          }
          else {
              this.emitter.removeAllListeners();
          }
      }
      connect() {
          this.updateState(State.CONNECTING);
          this.connection.connect(this.token);
          Logger$1.log("Auth", {
              token: this.token,
          });
      }
      disconnect() {
          this.skipReconnect = true;
          this.connection.close();
          this.updateState(State.DISCONNECTED);
      }
      updateState(newState, data) {
          const previousState = this.state;
          this.state = newState;
          if (previousState !== newState) {
              Logger$1.log("State changed", `'${previousState}' -> '${newState}'`);
              this.emitter.emit(newState, data);
          }
      }
      send(event, data, channel) {
          if (this.connection) {
              return this.connection.send(event, data, channel);
          }
          return false;
      }
  }

  var GusherEvent;
  (function (GusherEvent) {
      GusherEvent["ALL"] = "*";
      GusherEvent["CONNECTED"] = "connected";
      GusherEvent["DISCONNECTED"] = "disconnected";
      GusherEvent["RETRY"] = "retry";
      GusherEvent["RETRYMAX"] = "retryMax";
      GusherEvent["CLOSED"] = "closed";
      GusherEvent["ATCLOASED"] = "@closed";
      GusherEvent["ERROR"] = "error";
  })(GusherEvent || (GusherEvent = {}));
  class Gusher {
      static Event = GusherEvent;
      key;
      options;
      emitter;
      channels;
      connection;
      constructor(appKey = "", options) {
          this.key = appKey;
          this.options = options;
          this.emitter = new EventEmitter();
          this.channels = new Channels();
          this.connection = this.createConnection();
      }
      unsubscribe(channelName) {
          const channel = this.channels.remove(channelName);
          if (channel && this.connection.state === "connected") {
              channel.unsubscribe();
          }
      }
      getAuthToken() {
          return this.options.token || "";
      }
      setAuthToken(token) {
          if (!token) {
              return;
          }
          this.options.token = token;
          this.connection.unBindAll();
          this.connection.disconnect();
          this.connection = this.createConnection();
      }
      createConnection() {
          const connection = new ConnectionManager(this.key, this.options);
          connection.bind(EmitterEvent.CONNECTED, () => {
              this.subscribeAll();
              this.emitter.emit(GusherEvent.CONNECTED);
          });
          connection.bind(EmitterEvent.MSG, (params) => {
              if (!params) {
                  return;
              }
              if (params.channel) {
                  const channel = this.channels.find(params.channel);
                  if (channel) {
                      channel.handleEvent(params.event, params.data);
                  }
              }
              if (params.data &&
                  params.data.channel &&
                  Array.isArray(params.data.channel)) {
                  params.data.channel.forEach((ch) => {
                      const channel = this.channels.find(ch);
                      if (channel) {
                          channel.handleEvent(params.event, params.data);
                      }
                  });
              }
              this.emitter.emit(params.event, params.data);
              this.emitter.emit(GusherEvent.ALL, params);
          });
          connection.bind(EmitterEvent.DISCONNECTED, () => {
              this.channels.disconnect();
              this.emitter.emit(GusherEvent.DISCONNECTED);
          });
          connection.bind(EmitterEvent.RETRY, (evt) => {
              this.emitter.emit(GusherEvent.RETRY, evt);
          });
          connection.bind(EmitterEvent.RETRYMAX, () => {
              this.emitter.emit(GusherEvent.RETRYMAX);
          });
          connection.bind(EmitterEvent.ATCLOSED, (evt) => {
              this.emitter.emit(GusherEvent.ATCLOASED, evt);
          });
          connection.bind(EmitterEvent.CLOSED, (evt) => {
              this.emitter.emit(GusherEvent.CLOSED, evt);
          });
          connection.bind(EmitterEvent.ERROR, (err) => {
              Logger$1.log("Error", err);
              this.emitter.emit(GusherEvent.ERROR, err);
          });
          return connection;
      }
      channel(name) {
          return this.channels.find(name);
      }
      allChannel() {
          return this.channels.all();
      }
      connect() {
          this.connection.connect();
      }
      disconnect() {
          this.connection.disconnect();
      }
      bind(event, callback) {
          this.emitter.on(event, callback);
          return this;
      }
      unbind(event, callback) {
          this.emitter.removeListener(event, callback);
          return this;
      }
      subscribe(channelName) {
          const channel = this.channels.add(channelName, this);
          if (this.connection.state === "connected") {
              channel.subscribe();
          }
          return channel;
      }
      subscribes(channels) {
          const returnValues = {};
          if (!Array.isArray(channels)) {
              return returnValues;
          }
          channels.forEach((channelName) => {
              returnValues[channelName] = this.channels.add(channelName, this);
          });
          if (this.connection.state === "connected") {
              this.subscribeAll(channels);
          }
          return returnValues;
      }
      subscribeAll(channels) {
          const multiChannel = channels || this.channels.all();
          lodash_chunk(multiChannel, 10).forEach((group) => {
              this.send(Action.MULTI_SUBSCRIBE, { multi_channel: group });
          });
      }
      send(event, data, channel) {
          this.connection.send(event, data, channel);
      }
  }

  console.log(Gusher.Event);
  const gusher = new Gusher('BB', {
      url: 'ws://127.0.0.1:3000',
      token: '99fd0534-1a41-4f39-ad14-c29a89acd3bd',
  });
  gusher.connect();
  gusher.bind("*", (event) => {
      console.log(event);
  });
  gusher.bind(Gusher.Event.ERROR, (event) => {
      console.error(`連線失敗: ${event.currentTarget.url}`);
  });
  gusher.bind(Gusher.Event.ERROR, (event) => {
      console.error(`連線失敗: ${event.currentTarget.url}`);
  });
  gusher.bind(Gusher.Event.CONNECTED, () => {
      console.log('連線成功');
  });
  gusher.bind(Gusher.Event.CLOSED, () => {
      console.log('連線關閉');
  });
  const clock_channel = gusher.subscribe('clock');
  clock_channel.bind('tick', (data) => {
      console.log(data.time);
  });

}));
