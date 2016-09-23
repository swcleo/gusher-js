(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["Gusher"] = factory();
	else
		root["Gusher"] = factory();
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _events = __webpack_require__(1);

	var _events2 = _interopRequireDefault(_events);

	var _ConnectionManager = __webpack_require__(6);

	var _ConnectionManager2 = _interopRequireDefault(_ConnectionManager);

	var _Channels = __webpack_require__(4);

	var _Channels2 = _interopRequireDefault(_Channels);

	var _Logger = __webpack_require__(2);

	var _Logger2 = _interopRequireDefault(_Logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Gusher = function () {
	  function Gusher() {
	    var _this = this;

	    var appKey = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    _classCallCheck(this, Gusher);

	    this.key = appKey;

	    this.options = options;

	    if (options.level) {
	      _Logger2.default.setLevel(options.level);
	    }

	    this.emitter = new _events2.default();

	    this.channels = new _Channels2.default();

	    this.connection = new _ConnectionManager2.default(this.key, this.options);

	    this.connection.bind('connected', function () {
	      _this.subscribeAll();
	    });

	    this.connection.bind('message', function (params) {
	      if (params.channel) {
	        var channel = _this.channel(params.channel);
	        if (channel) {
	          channel.handleEvent(params.event, params.data);
	        }
	      }

	      _this.emitter.emit(params.event, params.data);

	      _this.emitter.emit('*', params);
	    });

	    this.connection.bind('disconnected', function () {
	      _this.channels.disconnect();
	    });

	    this.connection.bind('error', function (err) {
	      _Logger2.default.error('Error', err);
	    });

	    this.connection.bind('retry', function () {
	      _this.emitter.emit('retry');
	    });
	  }

	  Gusher.prototype.channel = function channel(name) {
	    return this.channels.find(name);
	  };

	  Gusher.prototype.allChannel = function allChannel() {
	    return this.channels.all();
	  };

	  Gusher.prototype.connect = function connect() {
	    this.connection.connect();
	  };

	  Gusher.prototype.disconnect = function disconnect() {
	    this.connection.disconnect();
	  };

	  Gusher.prototype.bind = function bind(event, callback) {
	    this.emitter.on(event, callback);
	    return this;
	  };

	  Gusher.prototype.unbind = function unbind(event, callback) {
	    this.emitter.removeListener(event, callback);
	    return this;
	  };

	  Gusher.prototype.subscribe = function subscribe(channelName) {
	    var channel = this.channels.add(channelName, this);
	    if (this.connection.state === 'connected') {
	      channel.subscribe();
	    }
	    return channel;
	  };

	  Gusher.prototype.subscribeAll = function subscribeAll() {
	    var _this2 = this;

	    this.channels.channels.forEach(function (_, channelName) {
	      _this2.subscribe(channelName);
	    });
	  };

	  Gusher.prototype.unsubscribe = function unsubscribe(channelName) {
	    var channel = this.channels.remove(channelName);
	    if (channel && this.connection.state === 'connected') {
	      channel.unsubscribe();
	    }
	  };

	  Gusher.prototype.send = function send(event, data, channel) {
	    this.connection.send(event, data, channel);
	  };

	  return Gusher;
	}();

	exports.default = Gusher;
	module.exports = exports['default'];

/***/ },
/* 1 */
/***/ function(module, exports) {

	// Copyright Joyent, Inc. and other Node contributors.
	//
	// Permission is hereby granted, free of charge, to any person obtaining a
	// copy of this software and associated documentation files (the
	// "Software"), to deal in the Software without restriction, including
	// without limitation the rights to use, copy, modify, merge, publish,
	// distribute, sublicense, and/or sell copies of the Software, and to permit
	// persons to whom the Software is furnished to do so, subject to the
	// following conditions:
	//
	// The above copyright notice and this permission notice shall be included
	// in all copies or substantial portions of the Software.
	//
	// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
	// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
	// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
	// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
	// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
	// USE OR OTHER DEALINGS IN THE SOFTWARE.

	function EventEmitter() {
	  this._events = this._events || {};
	  this._maxListeners = this._maxListeners || undefined;
	}
	module.exports = EventEmitter;

	// Backwards-compat with node 0.10.x
	EventEmitter.EventEmitter = EventEmitter;

	EventEmitter.prototype._events = undefined;
	EventEmitter.prototype._maxListeners = undefined;

	// By default EventEmitters will print a warning if more than 10 listeners are
	// added to it. This is a useful default which helps finding memory leaks.
	EventEmitter.defaultMaxListeners = 10;

	// Obviously not all Emitters should be limited to 10. This function allows
	// that to be increased. Set to zero for unlimited.
	EventEmitter.prototype.setMaxListeners = function(n) {
	  if (!isNumber(n) || n < 0 || isNaN(n))
	    throw TypeError('n must be a positive number');
	  this._maxListeners = n;
	  return this;
	};

	EventEmitter.prototype.emit = function(type) {
	  var er, handler, len, args, i, listeners;

	  if (!this._events)
	    this._events = {};

	  // If there is no 'error' event listener then throw.
	  if (type === 'error') {
	    if (!this._events.error ||
	        (isObject(this._events.error) && !this._events.error.length)) {
	      er = arguments[1];
	      if (er instanceof Error) {
	        throw er; // Unhandled 'error' event
	      } else {
	        // At least give some kind of context to the user
	        var err = new Error('Uncaught, unspecified "error" event. (' + er + ')');
	        err.context = er;
	        throw err;
	      }
	    }
	  }

	  handler = this._events[type];

	  if (isUndefined(handler))
	    return false;

	  if (isFunction(handler)) {
	    switch (arguments.length) {
	      // fast cases
	      case 1:
	        handler.call(this);
	        break;
	      case 2:
	        handler.call(this, arguments[1]);
	        break;
	      case 3:
	        handler.call(this, arguments[1], arguments[2]);
	        break;
	      // slower
	      default:
	        args = Array.prototype.slice.call(arguments, 1);
	        handler.apply(this, args);
	    }
	  } else if (isObject(handler)) {
	    args = Array.prototype.slice.call(arguments, 1);
	    listeners = handler.slice();
	    len = listeners.length;
	    for (i = 0; i < len; i++)
	      listeners[i].apply(this, args);
	  }

	  return true;
	};

	EventEmitter.prototype.addListener = function(type, listener) {
	  var m;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events)
	    this._events = {};

	  // To avoid recursion in the case that type === "newListener"! Before
	  // adding it to the listeners, first emit "newListener".
	  if (this._events.newListener)
	    this.emit('newListener', type,
	              isFunction(listener.listener) ?
	              listener.listener : listener);

	  if (!this._events[type])
	    // Optimize the case of one listener. Don't need the extra array object.
	    this._events[type] = listener;
	  else if (isObject(this._events[type]))
	    // If we've already got an array, just append.
	    this._events[type].push(listener);
	  else
	    // Adding the second element, need to change to array.
	    this._events[type] = [this._events[type], listener];

	  // Check for listener leak
	  if (isObject(this._events[type]) && !this._events[type].warned) {
	    if (!isUndefined(this._maxListeners)) {
	      m = this._maxListeners;
	    } else {
	      m = EventEmitter.defaultMaxListeners;
	    }

	    if (m && m > 0 && this._events[type].length > m) {
	      this._events[type].warned = true;
	      console.error('(node) warning: possible EventEmitter memory ' +
	                    'leak detected. %d listeners added. ' +
	                    'Use emitter.setMaxListeners() to increase limit.',
	                    this._events[type].length);
	      if (typeof console.trace === 'function') {
	        // not supported in IE 10
	        console.trace();
	      }
	    }
	  }

	  return this;
	};

	EventEmitter.prototype.on = EventEmitter.prototype.addListener;

	EventEmitter.prototype.once = function(type, listener) {
	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  var fired = false;

	  function g() {
	    this.removeListener(type, g);

	    if (!fired) {
	      fired = true;
	      listener.apply(this, arguments);
	    }
	  }

	  g.listener = listener;
	  this.on(type, g);

	  return this;
	};

	// emits a 'removeListener' event iff the listener was removed
	EventEmitter.prototype.removeListener = function(type, listener) {
	  var list, position, length, i;

	  if (!isFunction(listener))
	    throw TypeError('listener must be a function');

	  if (!this._events || !this._events[type])
	    return this;

	  list = this._events[type];
	  length = list.length;
	  position = -1;

	  if (list === listener ||
	      (isFunction(list.listener) && list.listener === listener)) {
	    delete this._events[type];
	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);

	  } else if (isObject(list)) {
	    for (i = length; i-- > 0;) {
	      if (list[i] === listener ||
	          (list[i].listener && list[i].listener === listener)) {
	        position = i;
	        break;
	      }
	    }

	    if (position < 0)
	      return this;

	    if (list.length === 1) {
	      list.length = 0;
	      delete this._events[type];
	    } else {
	      list.splice(position, 1);
	    }

	    if (this._events.removeListener)
	      this.emit('removeListener', type, listener);
	  }

	  return this;
	};

	EventEmitter.prototype.removeAllListeners = function(type) {
	  var key, listeners;

	  if (!this._events)
	    return this;

	  // not listening for removeListener, no need to emit
	  if (!this._events.removeListener) {
	    if (arguments.length === 0)
	      this._events = {};
	    else if (this._events[type])
	      delete this._events[type];
	    return this;
	  }

	  // emit removeListener for all listeners on all events
	  if (arguments.length === 0) {
	    for (key in this._events) {
	      if (key === 'removeListener') continue;
	      this.removeAllListeners(key);
	    }
	    this.removeAllListeners('removeListener');
	    this._events = {};
	    return this;
	  }

	  listeners = this._events[type];

	  if (isFunction(listeners)) {
	    this.removeListener(type, listeners);
	  } else if (listeners) {
	    // LIFO order
	    while (listeners.length)
	      this.removeListener(type, listeners[listeners.length - 1]);
	  }
	  delete this._events[type];

	  return this;
	};

	EventEmitter.prototype.listeners = function(type) {
	  var ret;
	  if (!this._events || !this._events[type])
	    ret = [];
	  else if (isFunction(this._events[type]))
	    ret = [this._events[type]];
	  else
	    ret = this._events[type].slice();
	  return ret;
	};

	EventEmitter.prototype.listenerCount = function(type) {
	  if (this._events) {
	    var evlistener = this._events[type];

	    if (isFunction(evlistener))
	      return 1;
	    else if (evlistener)
	      return evlistener.length;
	  }
	  return 0;
	};

	EventEmitter.listenerCount = function(emitter, type) {
	  return emitter.listenerCount(type);
	};

	function isFunction(arg) {
	  return typeof arg === 'function';
	}

	function isNumber(arg) {
	  return typeof arg === 'number';
	}

	function isObject(arg) {
	  return typeof arg === 'object' && arg !== null;
	}

	function isUndefined(arg) {
	  return arg === void 0;
	}


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _log4jsFree = __webpack_require__(7);

	var _log4jsFree2 = _interopRequireDefault(_log4jsFree);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _log4jsFree2.default.getLogger('Gusher');
	module.exports = exports['default'];

/***/ },
/* 3 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _events = __webpack_require__(1);

	var _events2 = _interopRequireDefault(_events);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Channel = function () {
	  function Channel(name, gusher) {
	    _classCallCheck(this, Channel);

	    this.name = name;
	    this.gusher = gusher;
	    this.subscribed = false;
	    this.emitter = new _events2.default();
	  }

	  Channel.prototype.trigger = function trigger(event, data) {
	    return this.gusher.send(event, data, this.name);
	  };

	  Channel.prototype.disconnect = function disconnect() {
	    this.subscribed = true;
	  };

	  Channel.prototype.bind = function bind(event, callback) {
	    this.emitter.on(event, callback);
	    return this;
	  };

	  Channel.prototype.unbind = function unbind(event, callback) {
	    this.emitter.removeListener(event, callback);
	    return this;
	  };

	  Channel.prototype.handleEvent = function handleEvent(event, data) {
	    if (event === "subscribe_succeeded") {
	      this.subscribed = true;
	    }

	    this.emitter.emit(event, data);
	  };

	  Channel.prototype.subscribe = function subscribe() {
	    this.gusher.send('gusher.subscribe', { id: 'todo', channel: this.name });
	  };

	  Channel.prototype.unsubscribe = function unsubscribe() {
	    this.gusher.send('gusher.unsubscribe', { id: 'todo', channel: this.name });
	  };

	  return Channel;
	}();

	exports.default = Channel;
	module.exports = exports['default'];

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _Channel = __webpack_require__(3);

	var _Channel2 = _interopRequireDefault(_Channel);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Channels = function () {
	  function Channels() {
	    _classCallCheck(this, Channels);

	    this.channels = new Map();
	  }

	  Channels.prototype.add = function add(name, gusher) {
	    var channel = this.channels.get(name);
	    if (!channel) {
	      channel = new _Channel2.default(name, gusher);
	      this.channels.set(name, channel);
	    }
	    return channel;
	  };

	  Channels.prototype.find = function find(name) {
	    return this.channels.get(name);
	  };

	  Channels.prototype.remove = function remove(name) {
	    var channel = this.channels.get(name);
	    this.channels.delete(name);
	    return channel;
	  };

	  Channels.prototype.all = function all() {
	    var keys = [];
	    for (var _iterator = this.channels.keys(), _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
	      var _ref;

	      if (_isArray) {
	        if (_i >= _iterator.length) break;
	        _ref = _iterator[_i++];
	      } else {
	        _i = _iterator.next();
	        if (_i.done) break;
	        _ref = _i.value;
	      }

	      var key = _ref;

	      keys.push(key);
	    }
	    return keys;
	  };

	  Channels.prototype.disconnect = function disconnect() {
	    this.channels.forEach(function (channel) {
	      return channel.disconnect();
	    });
	  };

	  return Channels;
	}();

	exports.default = Channels;
	module.exports = exports['default'];

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _events = __webpack_require__(1);

	var _events2 = _interopRequireDefault(_events);

	var _Logger = __webpack_require__(2);

	var _Logger2 = _interopRequireDefault(_Logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * state:
	 *  connecting
	 *  open
	 *  closing
	 *  closed
	 */
	var Connection = function () {
	  function Connection() {
	    var options = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

	    _classCallCheck(this, Connection);

	    this.options = options || {};
	    this.url = options.url || '';
	    this.state = 'initialized';
	    this.emitter = new _events2.default();
	  }

	  Connection.prototype.bind = function bind(event, callback) {
	    this.emitter.on(event, callback);
	    return this;
	  };

	  Connection.prototype.unbind = function unbind(event, callback) {
	    this.emitter.removeListener(event, callback);
	    return this;
	  };

	  Connection.prototype.connect = function connect() {
	    if (this.socket) {
	      return false;
	    }

	    try {
	      this.socket = new WebSocket(this.url);
	    } catch (e) {
	      return false;
	    }

	    this.bindListeners();

	    _Logger2.default.debug('Connecting', { url: this.url });
	    this.changeState('connecting');
	    return true;
	  };

	  Connection.prototype.close = function close() {
	    if (this.socket) {
	      this.socket.close();
	      return true;
	    }

	    return false;
	  };

	  Connection.prototype.changeState = function changeState(state, params) {
	    this.state = state;
	    this.emitter.emit(state, params);
	  };

	  Connection.prototype.bindListeners = function bindListeners() {
	    var _this = this;

	    this.socket.onopen = function () {
	      _this.onOpen();
	    };

	    this.socket.onerror = function (error) {
	      _this.onError(error);
	    };

	    this.socket.onclose = function (closeEvent) {
	      _this.onClose(closeEvent);
	    };

	    this.socket.onmessage = function (message) {
	      _this.onMessage(message);
	    };
	  };

	  Connection.prototype.unbindListeners = function unbindListeners() {
	    if (this.socket) {
	      this.socket.onopen = null;
	      this.socket.onerror = null;
	      this.socket.onclose = null;
	      this.socket.onmessage = null;
	    }
	  };

	  Connection.prototype.onOpen = function onOpen() {
	    this.changeState('open');
	    this.socket.onopen = null;
	  };

	  Connection.prototype.onError = function onError(error) {
	    this.emitter.emit('error', error);
	  };

	  Connection.prototype.onClose = function onClose(closeEvent) {
	    if (closeEvent) {
	      this.changeState('closed', {
	        code: closeEvent.code,
	        reason: closeEvent.reason,
	        wasClean: closeEvent.wasClean
	      });
	    } else {
	      this.changeState('closed');
	    }

	    this.unbindListeners();
	    this.socket = null;
	  };

	  Connection.prototype.onMessage = function onMessage(event) {
	    var message = void 0;
	    try {
	      message = JSON.parse(event.data);
	    } catch (e) {
	      _Logger2.default.error({ error: e });
	      this.emitter('error', { error: e });
	      return;
	    }

	    if (message) {
	      _Logger2.default.debug('Event recd', message);
	      this.emitter.emit('message', message);
	    }
	  };

	  Connection.prototype.send = function send(event, data, channel) {
	    var message = { event: event, data: data };

	    if (this.channel) {
	      message.channel = channel;
	    }

	    console.log(JSON.stringify(message));

	    _Logger2.default.debug('Event sent', message);
	    this.socket.send(JSON.stringify(message));
	  };

	  return Connection;
	}();

	exports.default = Connection;
	module.exports = exports['default'];

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	exports.__esModule = true;

	var _events = __webpack_require__(1);

	var _events2 = _interopRequireDefault(_events);

	var _Connection = __webpack_require__(5);

	var _Connection2 = _interopRequireDefault(_Connection);

	var _Logger = __webpack_require__(2);

	var _Logger2 = _interopRequireDefault(_Logger);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	/**
	 * ConnectionManager states:
	 *  initialized
	 *  connecting
	 *  connected
	 *  disconnected
	 *  failed
	 */
	var ConnectionManager = function () {
	  function ConnectionManager() {
	    var _this = this;

	    var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
	    var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

	    _classCallCheck(this, ConnectionManager);

	    this.key = key;

	    this.options = options;

	    this.state = 'initialized';

	    this.emitter = new _events2.default();

	    this.reconnection = options.reconnection || true;

	    this.reconnectionDelay = options.reconnectionDelay || 1000;

	    this.skipReconnect = false;

	    this.retryNum = 0;

	    this.retryTimer = null;

	    this.connection = new _Connection2.default(this.options);

	    this.connection.bind('open', function () {
	      if (_this.retryTimer) {
	        clearTimeout(_this.retryTimer);
	        _this.retryNum = 0;
	        _this.retryTimer = null;
	      }
	      _this.skipReconnect = false;
	      if (_this.options && _this.options.token) {
	        _this.send('gusher.login', {
	          jwt: _this.options.token
	        });
	      }
	      _this.updateState('connected');
	    });

	    this.connection.bind('message', function (message) {
	      _this.emitter.emit('message', message);
	    });

	    this.connection.bind('error', function (err) {
	      _this.updateState('error', err);
	    });

	    this.connection.bind('closed', function (evt) {
	      _this.updateState('closed', evt);
	      _this.retryIn(_this.reconnectionDelay);
	    });
	  }

	  ConnectionManager.prototype.retryIn = function retryIn() {
	    var _this2 = this;

	    var delay = arguments.length <= 0 || arguments[0] === undefined ? 0 : arguments[0];

	    if (this.reconnection && !this.skipReconnect) {
	      this.retryTimer = setTimeout(function () {
	        _this2.retryNum++;
	        _Logger2.default.debug('Reconnect attempts: ', _this2.retryNum);
	        _this2.connect();
	        _this2.emitter.emit('retry');
	      }, delay);
	    }
	  };

	  ConnectionManager.prototype.bind = function bind(event, callback) {
	    this.emitter.on(event, callback);
	    return this;
	  };

	  ConnectionManager.prototype.unbind = function unbind(event, callback) {
	    this.emitter.removeListener(event, callback);
	    return this;
	  };

	  ConnectionManager.prototype.connect = function connect() {
	    this.updateState('connecting');
	    this.connection.connect();
	  };

	  ConnectionManager.prototype.disconnect = function disconnect() {
	    this.skipReconnect = true;
	    this.connection.close();
	    this.updateState('disconnected');
	  };

	  ConnectionManager.prototype.updateState = function updateState(newState, data) {
	    var previousState = this.state;
	    this.state = newState;
	    if (previousState !== newState) {
	      _Logger2.default.debug('State changed', previousState + ' -> ' + newState);
	      this.emitter.emit('state_change', {
	        previous: previousState,
	        current: newState
	      });
	      this.emitter.emit(newState, data);
	    }
	  };

	  ConnectionManager.prototype.send = function send(event, data, channel) {
	    if (this.connection) {
	      return this.connection.send(event, data, channel);
	    } else {
	      return false;
	    }
	  };

	  return ConnectionManager;
	}();

	exports.default = ConnectionManager;
	module.exports = exports['default'];

/***/ },
/* 7 */
/***/ function(module, exports, __webpack_require__) {

	!function(t,e){ true?module.exports=e():"function"==typeof define&&define.amd?define([],e):"object"==typeof exports?exports.Log4js=e():t.Log4js=e()}(this,function(){return function(t){function e(n){if(o[n])return o[n].exports;var r=o[n]={exports:{},id:n,loaded:!1};return t[n].call(r.exports,r,r.exports,e),r.loaded=!0,r.exports}var o={};return e.m=t,e.c=o,e.p="",e(0)}([function(t,e,o){"use strict";function n(t){return t&&t.__esModule?t:{"default":t}}function r(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}e.__esModule=!0;var i=o(1),f=n(i),a=function(){function t(){r(this,t)}return t.prototype.getLogger=function(t){var e=new f["default"](t);return e},t}();e["default"]=new a,t.exports=e["default"]},function(t,e){"use strict";function o(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function n(t){return"string"==typeof t}function r(t,e){var o=""+t;return o.length>=e?o:r("0"+o,e)}function i(){var t=new Date;return t.getFullYear()+"-"+(t.getMonth()+1)+"-"+t.getDate()+" "+r(t.getHours(),2)+":"+r(t.getMinutes(),2)+":"+r(t.getSeconds(),2)+":"+t.getMilliseconds()}e.__esModule=!0;var f=e.LEVEL_MAP={DEBUG:1,INFO:2,WARN:3,ERROR:4,FATAL:5},a=e.LEVEL_KEY={1:"DEBUG",2:"INFO",3:"WARN",4:"ERROR",5:"FATAL"},u=function(){function t(){var e=arguments.length<=0||void 0===arguments[0]?"LOG":arguments[0],n=arguments.length<=1||void 0===arguments[1]?{}:arguments[1];o(this,t),this.name=e,this.level=f[n.level]||f.INFO}return t.prototype.setLevel=function(t){f[t]&&(this.level=f[t])},t.prototype.debug=function(t){if(n(t)){for(var e=arguments.length,o=Array(e>1?e-1:0),r=1;r<e;r++)o[r-1]=arguments[r];this.write(f.DEBUG,t,o)}},t.prototype.info=function(t){if(n(t)){for(var e=arguments.length,o=Array(e>1?e-1:0),r=1;r<e;r++)o[r-1]=arguments[r];this.write(f.INFO,t,o)}},t.prototype.warn=function(t){if(n(t)){for(var e=arguments.length,o=Array(e>1?e-1:0),r=1;r<e;r++)o[r-1]=arguments[r];this.write(f.WARN,t,o)}},t.prototype.error=function(t){if(n(t)){for(var e=arguments.length,o=Array(e>1?e-1:0),r=1;r<e;r++)o[r-1]=arguments[r];this.write(f.ERROR,t,o)}},t.prototype.fatal=function(t){if(n(t)){for(var e=arguments.length,o=Array(e>1?e-1:0),r=1;r<e;r++)o[r-1]=arguments[r];this.write(f.FATAL,t,o)}},t.prototype.write=function(t,e,o){if(t>=this.level&&n(e)){var r=console[a[t].toLowerCase()]?console[a[t].toLowerCase()]:console.log;r.apply(void 0,["["+i()+"] ["+a[t]+"] "+this.name+" - "+e].concat(o))}},t}();e["default"]=u}])});

/***/ }
/******/ ])
});
;