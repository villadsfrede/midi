(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],2:[function(require,module,exports){
var parse = require('midi-json-parser')
var midi = require("midi-player")

const reader = new FileReader();

//const midiAccess = await navigator.requestMIDIAccess();
//const midiOutput = Array.from(midiAccess.outputs)[0];

let fileUpload = document.getElementById("input")

fileUpload.onchange = function() {
    reader.readAsArrayBuffer(this.files[0])

    reader.onload = function() {
        console.log(reader.result)
        parse.parseArrayBuffer(reader.result).then((json) =>{
            console.log(json)
            play(json)
        })
    }
}


async function play(json) {
    const midiAccess = await navigator.requestMIDIAccess();
    console.log(midiAccess.outputs)
    const midiOutput = Array.from(midiAccess.outputs)[0];

    const midiPlayer = midi.create({json, midiOutput})
    await midiPlayer.play();
}

},{"midi-json-parser":21,"midi-player":22}],3:[function(require,module,exports){
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) {
    arr2[i] = arr[i];
  }
  return arr2;
}
module.exports = _arrayLikeToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],4:[function(require,module,exports){
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
module.exports = _arrayWithHoles, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],5:[function(require,module,exports){
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
module.exports = _asyncToGenerator, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],6:[function(require,module,exports){
function _classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
module.exports = _classCallCheck, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],7:[function(require,module,exports){
function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, descriptor.key, descriptor);
  }
}
function _createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
module.exports = _createClass, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],8:[function(require,module,exports){
function _defineProperty(obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
module.exports = _defineProperty, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],9:[function(require,module,exports){
function _iterableToArrayLimit(arr, i) {
  var _i = arr == null ? null : typeof Symbol !== "undefined" && arr[Symbol.iterator] || arr["@@iterator"];
  if (_i == null) return;
  var _arr = [];
  var _n = true;
  var _d = false;
  var _s, _e;
  try {
    for (_i = _i.call(arr); !(_n = (_s = _i.next()).done); _n = true) {
      _arr.push(_s.value);
      if (i && _arr.length === i) break;
    }
  } catch (err) {
    _d = true;
    _e = err;
  } finally {
    try {
      if (!_n && _i["return"] != null) _i["return"]();
    } finally {
      if (_d) throw _e;
    }
  }
  return _arr;
}
module.exports = _iterableToArrayLimit, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],10:[function(require,module,exports){
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
module.exports = _nonIterableRest, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],11:[function(require,module,exports){
var _typeof = require("./typeof.js")["default"];
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return exports;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var exports = {},
    Op = Object.prototype,
    hasOwn = Op.hasOwnProperty,
    defineProperty = Object.defineProperty || function (obj, key, desc) {
      obj[key] = desc.value;
    },
    $Symbol = "function" == typeof Symbol ? Symbol : {},
    iteratorSymbol = $Symbol.iterator || "@@iterator",
    asyncIteratorSymbol = $Symbol.asyncIterator || "@@asyncIterator",
    toStringTagSymbol = $Symbol.toStringTag || "@@toStringTag";
  function define(obj, key, value) {
    return Object.defineProperty(obj, key, {
      value: value,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), obj[key];
  }
  try {
    define({}, "");
  } catch (err) {
    define = function define(obj, key, value) {
      return obj[key] = value;
    };
  }
  function wrap(innerFn, outerFn, self, tryLocsList) {
    var protoGenerator = outerFn && outerFn.prototype instanceof Generator ? outerFn : Generator,
      generator = Object.create(protoGenerator.prototype),
      context = new Context(tryLocsList || []);
    return defineProperty(generator, "_invoke", {
      value: makeInvokeMethod(innerFn, self, context)
    }), generator;
  }
  function tryCatch(fn, obj, arg) {
    try {
      return {
        type: "normal",
        arg: fn.call(obj, arg)
      };
    } catch (err) {
      return {
        type: "throw",
        arg: err
      };
    }
  }
  exports.wrap = wrap;
  var ContinueSentinel = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var IteratorPrototype = {};
  define(IteratorPrototype, iteratorSymbol, function () {
    return this;
  });
  var getProto = Object.getPrototypeOf,
    NativeIteratorPrototype = getProto && getProto(getProto(values([])));
  NativeIteratorPrototype && NativeIteratorPrototype !== Op && hasOwn.call(NativeIteratorPrototype, iteratorSymbol) && (IteratorPrototype = NativeIteratorPrototype);
  var Gp = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(IteratorPrototype);
  function defineIteratorMethods(prototype) {
    ["next", "throw", "return"].forEach(function (method) {
      define(prototype, method, function (arg) {
        return this._invoke(method, arg);
      });
    });
  }
  function AsyncIterator(generator, PromiseImpl) {
    function invoke(method, arg, resolve, reject) {
      var record = tryCatch(generator[method], generator, arg);
      if ("throw" !== record.type) {
        var result = record.arg,
          value = result.value;
        return value && "object" == _typeof(value) && hasOwn.call(value, "__await") ? PromiseImpl.resolve(value.__await).then(function (value) {
          invoke("next", value, resolve, reject);
        }, function (err) {
          invoke("throw", err, resolve, reject);
        }) : PromiseImpl.resolve(value).then(function (unwrapped) {
          result.value = unwrapped, resolve(result);
        }, function (error) {
          return invoke("throw", error, resolve, reject);
        });
      }
      reject(record.arg);
    }
    var previousPromise;
    defineProperty(this, "_invoke", {
      value: function value(method, arg) {
        function callInvokeWithMethodAndArg() {
          return new PromiseImpl(function (resolve, reject) {
            invoke(method, arg, resolve, reject);
          });
        }
        return previousPromise = previousPromise ? previousPromise.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(innerFn, self, context) {
    var state = "suspendedStart";
    return function (method, arg) {
      if ("executing" === state) throw new Error("Generator is already running");
      if ("completed" === state) {
        if ("throw" === method) throw arg;
        return doneResult();
      }
      for (context.method = method, context.arg = arg;;) {
        var delegate = context.delegate;
        if (delegate) {
          var delegateResult = maybeInvokeDelegate(delegate, context);
          if (delegateResult) {
            if (delegateResult === ContinueSentinel) continue;
            return delegateResult;
          }
        }
        if ("next" === context.method) context.sent = context._sent = context.arg;else if ("throw" === context.method) {
          if ("suspendedStart" === state) throw state = "completed", context.arg;
          context.dispatchException(context.arg);
        } else "return" === context.method && context.abrupt("return", context.arg);
        state = "executing";
        var record = tryCatch(innerFn, self, context);
        if ("normal" === record.type) {
          if (state = context.done ? "completed" : "suspendedYield", record.arg === ContinueSentinel) continue;
          return {
            value: record.arg,
            done: context.done
          };
        }
        "throw" === record.type && (state = "completed", context.method = "throw", context.arg = record.arg);
      }
    };
  }
  function maybeInvokeDelegate(delegate, context) {
    var method = delegate.iterator[context.method];
    if (undefined === method) {
      if (context.delegate = null, "throw" === context.method) {
        if (delegate.iterator["return"] && (context.method = "return", context.arg = undefined, maybeInvokeDelegate(delegate, context), "throw" === context.method)) return ContinueSentinel;
        context.method = "throw", context.arg = new TypeError("The iterator does not provide a 'throw' method");
      }
      return ContinueSentinel;
    }
    var record = tryCatch(method, delegate.iterator, context.arg);
    if ("throw" === record.type) return context.method = "throw", context.arg = record.arg, context.delegate = null, ContinueSentinel;
    var info = record.arg;
    return info ? info.done ? (context[delegate.resultName] = info.value, context.next = delegate.nextLoc, "return" !== context.method && (context.method = "next", context.arg = undefined), context.delegate = null, ContinueSentinel) : info : (context.method = "throw", context.arg = new TypeError("iterator result is not an object"), context.delegate = null, ContinueSentinel);
  }
  function pushTryEntry(locs) {
    var entry = {
      tryLoc: locs[0]
    };
    1 in locs && (entry.catchLoc = locs[1]), 2 in locs && (entry.finallyLoc = locs[2], entry.afterLoc = locs[3]), this.tryEntries.push(entry);
  }
  function resetTryEntry(entry) {
    var record = entry.completion || {};
    record.type = "normal", delete record.arg, entry.completion = record;
  }
  function Context(tryLocsList) {
    this.tryEntries = [{
      tryLoc: "root"
    }], tryLocsList.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(iterable) {
    if (iterable) {
      var iteratorMethod = iterable[iteratorSymbol];
      if (iteratorMethod) return iteratorMethod.call(iterable);
      if ("function" == typeof iterable.next) return iterable;
      if (!isNaN(iterable.length)) {
        var i = -1,
          next = function next() {
            for (; ++i < iterable.length;) {
              if (hasOwn.call(iterable, i)) return next.value = iterable[i], next.done = !1, next;
            }
            return next.value = undefined, next.done = !0, next;
          };
        return next.next = next;
      }
    }
    return {
      next: doneResult
    };
  }
  function doneResult() {
    return {
      value: undefined,
      done: !0
    };
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, defineProperty(Gp, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), defineProperty(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, toStringTagSymbol, "GeneratorFunction"), exports.isGeneratorFunction = function (genFun) {
    var ctor = "function" == typeof genFun && genFun.constructor;
    return !!ctor && (ctor === GeneratorFunction || "GeneratorFunction" === (ctor.displayName || ctor.name));
  }, exports.mark = function (genFun) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(genFun, GeneratorFunctionPrototype) : (genFun.__proto__ = GeneratorFunctionPrototype, define(genFun, toStringTagSymbol, "GeneratorFunction")), genFun.prototype = Object.create(Gp), genFun;
  }, exports.awrap = function (arg) {
    return {
      __await: arg
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, asyncIteratorSymbol, function () {
    return this;
  }), exports.AsyncIterator = AsyncIterator, exports.async = function (innerFn, outerFn, self, tryLocsList, PromiseImpl) {
    void 0 === PromiseImpl && (PromiseImpl = Promise);
    var iter = new AsyncIterator(wrap(innerFn, outerFn, self, tryLocsList), PromiseImpl);
    return exports.isGeneratorFunction(outerFn) ? iter : iter.next().then(function (result) {
      return result.done ? result.value : iter.next();
    });
  }, defineIteratorMethods(Gp), define(Gp, toStringTagSymbol, "Generator"), define(Gp, iteratorSymbol, function () {
    return this;
  }), define(Gp, "toString", function () {
    return "[object Generator]";
  }), exports.keys = function (val) {
    var object = Object(val),
      keys = [];
    for (var key in object) {
      keys.push(key);
    }
    return keys.reverse(), function next() {
      for (; keys.length;) {
        var key = keys.pop();
        if (key in object) return next.value = key, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, exports.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(skipTempReset) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = undefined, this.done = !1, this.delegate = null, this.method = "next", this.arg = undefined, this.tryEntries.forEach(resetTryEntry), !skipTempReset) for (var name in this) {
        "t" === name.charAt(0) && hasOwn.call(this, name) && !isNaN(+name.slice(1)) && (this[name] = undefined);
      }
    },
    stop: function stop() {
      this.done = !0;
      var rootRecord = this.tryEntries[0].completion;
      if ("throw" === rootRecord.type) throw rootRecord.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(exception) {
      if (this.done) throw exception;
      var context = this;
      function handle(loc, caught) {
        return record.type = "throw", record.arg = exception, context.next = loc, caught && (context.method = "next", context.arg = undefined), !!caught;
      }
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i],
          record = entry.completion;
        if ("root" === entry.tryLoc) return handle("end");
        if (entry.tryLoc <= this.prev) {
          var hasCatch = hasOwn.call(entry, "catchLoc"),
            hasFinally = hasOwn.call(entry, "finallyLoc");
          if (hasCatch && hasFinally) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          } else if (hasCatch) {
            if (this.prev < entry.catchLoc) return handle(entry.catchLoc, !0);
          } else {
            if (!hasFinally) throw new Error("try statement without catch or finally");
            if (this.prev < entry.finallyLoc) return handle(entry.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(type, arg) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc <= this.prev && hasOwn.call(entry, "finallyLoc") && this.prev < entry.finallyLoc) {
          var finallyEntry = entry;
          break;
        }
      }
      finallyEntry && ("break" === type || "continue" === type) && finallyEntry.tryLoc <= arg && arg <= finallyEntry.finallyLoc && (finallyEntry = null);
      var record = finallyEntry ? finallyEntry.completion : {};
      return record.type = type, record.arg = arg, finallyEntry ? (this.method = "next", this.next = finallyEntry.finallyLoc, ContinueSentinel) : this.complete(record);
    },
    complete: function complete(record, afterLoc) {
      if ("throw" === record.type) throw record.arg;
      return "break" === record.type || "continue" === record.type ? this.next = record.arg : "return" === record.type ? (this.rval = this.arg = record.arg, this.method = "return", this.next = "end") : "normal" === record.type && afterLoc && (this.next = afterLoc), ContinueSentinel;
    },
    finish: function finish(finallyLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.finallyLoc === finallyLoc) return this.complete(entry.completion, entry.afterLoc), resetTryEntry(entry), ContinueSentinel;
      }
    },
    "catch": function _catch(tryLoc) {
      for (var i = this.tryEntries.length - 1; i >= 0; --i) {
        var entry = this.tryEntries[i];
        if (entry.tryLoc === tryLoc) {
          var record = entry.completion;
          if ("throw" === record.type) {
            var thrown = record.arg;
            resetTryEntry(entry);
          }
          return thrown;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(iterable, resultName, nextLoc) {
      return this.delegate = {
        iterator: values(iterable),
        resultName: resultName,
        nextLoc: nextLoc
      }, "next" === this.method && (this.arg = undefined), ContinueSentinel;
    }
  }, exports;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{"./typeof.js":13}],12:[function(require,module,exports){
var arrayWithHoles = require("./arrayWithHoles.js");
var iterableToArrayLimit = require("./iterableToArrayLimit.js");
var unsupportedIterableToArray = require("./unsupportedIterableToArray.js");
var nonIterableRest = require("./nonIterableRest.js");
function _slicedToArray(arr, i) {
  return arrayWithHoles(arr) || iterableToArrayLimit(arr, i) || unsupportedIterableToArray(arr, i) || nonIterableRest();
}
module.exports = _slicedToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{"./arrayWithHoles.js":4,"./iterableToArrayLimit.js":9,"./nonIterableRest.js":10,"./unsupportedIterableToArray.js":14}],13:[function(require,module,exports){
function _typeof(obj) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && "function" == typeof Symbol && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(obj);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{}],14:[function(require,module,exports){
var arrayLikeToArray = require("./arrayLikeToArray.js");
function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return arrayLikeToArray(o, minLen);
}
module.exports = _unsupportedIterableToArray, module.exports.__esModule = true, module.exports["default"] = module.exports;
},{"./arrayLikeToArray.js":3}],15:[function(require,module,exports){
// TODO(Babel 8): Remove this file.

var runtime = require("../helpers/regeneratorRuntime")();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}

},{"../helpers/regeneratorRuntime":11}],16:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime/helpers/defineProperty'), require('@babel/runtime/helpers/slicedToArray'), require('fast-unique-numbers'), require('@babel/runtime/helpers/asyncToGenerator'), require('@babel/runtime/regenerator')) :
    typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime/helpers/defineProperty', '@babel/runtime/helpers/slicedToArray', 'fast-unique-numbers', '@babel/runtime/helpers/asyncToGenerator', '@babel/runtime/regenerator'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.brokerFactory = {}, global._defineProperty, global._slicedToArray, global.fastUniqueNumbers, global._asyncToGenerator, global._regeneratorRuntime));
})(this, (function (exports, _defineProperty, _slicedToArray, fastUniqueNumbers, _asyncToGenerator, _regeneratorRuntime) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
    var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);
    var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
    var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

    var isMessagePort = function isMessagePort(sender) {
      return typeof sender.start === 'function';
    };

    var PORT_MAP = new WeakMap();

    function ownKeys$1(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
    function _objectSpread$1(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys$1(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys$1(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
    var extendBrokerImplementation = function extendBrokerImplementation(partialBrokerImplementation) {
      return _objectSpread$1(_objectSpread$1({}, partialBrokerImplementation), {}, {
        connect: function connect(_ref) {
          var call = _ref.call;
          return /*#__PURE__*/_asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee() {
            var _MessageChannel, port1, port2, portId;
            return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    _MessageChannel = new MessageChannel(), port1 = _MessageChannel.port1, port2 = _MessageChannel.port2;
                    _context.next = 3;
                    return call('connect', {
                      port: port1
                    }, [port1]);
                  case 3:
                    portId = _context.sent;
                    PORT_MAP.set(port2, portId);
                    return _context.abrupt("return", port2);
                  case 6:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));
        },
        disconnect: function disconnect(_ref3) {
          var call = _ref3.call;
          return /*#__PURE__*/function () {
            var _ref4 = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee2(port) {
              var portId;
              return _regeneratorRuntime__default["default"].wrap(function _callee2$(_context2) {
                while (1) {
                  switch (_context2.prev = _context2.next) {
                    case 0:
                      portId = PORT_MAP.get(port);
                      if (!(portId === undefined)) {
                        _context2.next = 3;
                        break;
                      }
                      throw new Error('The given port is not connected.');
                    case 3:
                      _context2.next = 5;
                      return call('disconnect', {
                        portId: portId
                      });
                    case 5:
                    case "end":
                      return _context2.stop();
                  }
                }
              }, _callee2);
            }));
            return function (_x) {
              return _ref4.apply(this, arguments);
            };
          }();
        },
        isSupported: function isSupported(_ref5) {
          var call = _ref5.call;
          return function () {
            return call('isSupported');
          };
        }
      });
    };

    function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
    function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
    var ONGOING_REQUESTS = new WeakMap();
    var createOrGetOngoingRequests = function createOrGetOngoingRequests(sender) {
      if (ONGOING_REQUESTS.has(sender)) {
        // @todo TypeScript needs to be convinced that has() works as expected.
        return ONGOING_REQUESTS.get(sender);
      }
      var ongoingRequests = new Map();
      ONGOING_REQUESTS.set(sender, ongoingRequests);
      return ongoingRequests;
    };
    var createBroker = function createBroker(brokerImplementation) {
      var fullBrokerImplementation = extendBrokerImplementation(brokerImplementation);
      return function (sender) {
        var ongoingRequests = createOrGetOngoingRequests(sender);
        sender.addEventListener('message', function (_ref) {
          var message = _ref.data;
          var id = message.id;
          if (id !== null && ongoingRequests.has(id)) {
            var _ongoingRequests$get = ongoingRequests.get(id),
              reject = _ongoingRequests$get.reject,
              resolve = _ongoingRequests$get.resolve;
            ongoingRequests["delete"](id);
            if (message.error === undefined) {
              resolve(message.result);
            } else {
              reject(new Error(message.error.message));
            }
          }
        });
        if (isMessagePort(sender)) {
          sender.start();
        }
        var call = function call(method) {
          var params = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
          var transferables = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
          return new Promise(function (resolve, reject) {
            var id = fastUniqueNumbers.generateUniqueNumber(ongoingRequests);
            ongoingRequests.set(id, {
              reject: reject,
              resolve: resolve
            });
            if (params === null) {
              sender.postMessage({
                id: id,
                method: method
              }, transferables);
            } else {
              sender.postMessage({
                id: id,
                method: method,
                params: params
              }, transferables);
            }
          });
        };
        var notify = function notify(method, params) {
          var transferables = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];
          sender.postMessage({
            id: null,
            method: method,
            params: params
          }, transferables);
        };
        var functions = {};
        for (var _i = 0, _Object$entries = Object.entries(fullBrokerImplementation); _i < _Object$entries.length; _i++) {
          var _Object$entries$_i = _slicedToArray__default["default"](_Object$entries[_i], 2),
            key = _Object$entries$_i[0],
            handler = _Object$entries$_i[1];
          functions = _objectSpread(_objectSpread({}, functions), {}, _defineProperty__default["default"]({}, key, handler({
            call: call,
            notify: notify
          })));
        }
        return _objectSpread({}, functions);
      };
    };

    exports.createBroker = createBroker;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"@babel/runtime/helpers/asyncToGenerator":5,"@babel/runtime/helpers/defineProperty":8,"@babel/runtime/helpers/slicedToArray":12,"@babel/runtime/regenerator":15,"fast-unique-numbers":17}],17:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.fastUniqueNumbers = {}));
})(this, (function (exports) { 'use strict';

    var createAddUniqueNumber = function createAddUniqueNumber(generateUniqueNumber) {
      return function (set) {
        var number = generateUniqueNumber(set);
        set.add(number);
        return number;
      };
    };

    var createCache = function createCache(lastNumberWeakMap) {
      return function (collection, nextNumber) {
        lastNumberWeakMap.set(collection, nextNumber);
        return nextNumber;
      };
    };

    /*
     * The value of the constant Number.MAX_SAFE_INTEGER equals (2 ** 53 - 1) but it
     * is fairly new.
     */
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER === undefined ? 9007199254740991 : Number.MAX_SAFE_INTEGER;
    var TWO_TO_THE_POWER_OF_TWENTY_NINE = 536870912;
    var TWO_TO_THE_POWER_OF_THIRTY = TWO_TO_THE_POWER_OF_TWENTY_NINE * 2;
    var createGenerateUniqueNumber = function createGenerateUniqueNumber(cache, lastNumberWeakMap) {
      return function (collection) {
        var lastNumber = lastNumberWeakMap.get(collection);
        /*
         * Let's try the cheapest algorithm first. It might fail to produce a new
         * number, but it is so cheap that it is okay to take the risk. Just
         * increase the last number by one or reset it to 0 if we reached the upper
         * bound of SMIs (which stands for small integers). When the last number is
         * unknown it is assumed that the collection contains zero based consecutive
         * numbers.
         */
        var nextNumber = lastNumber === undefined ? collection.size : lastNumber < TWO_TO_THE_POWER_OF_THIRTY ? lastNumber + 1 : 0;
        if (!collection.has(nextNumber)) {
          return cache(collection, nextNumber);
        }
        /*
         * If there are less than half of 2 ** 30 numbers stored in the collection,
         * the chance to generate a new random number in the range from 0 to 2 ** 30
         * is at least 50%. It's benifitial to use only SMIs because they perform
         * much better in any environment based on V8.
         */
        if (collection.size < TWO_TO_THE_POWER_OF_TWENTY_NINE) {
          while (collection.has(nextNumber)) {
            nextNumber = Math.floor(Math.random() * TWO_TO_THE_POWER_OF_THIRTY);
          }
          return cache(collection, nextNumber);
        }
        // Quickly check if there is a theoretical chance to generate a new number.
        if (collection.size > MAX_SAFE_INTEGER) {
          throw new Error('Congratulations, you created a collection of unique numbers which uses all available integers!');
        }
        // Otherwise use the full scale of safely usable integers.
        while (collection.has(nextNumber)) {
          nextNumber = Math.floor(Math.random() * MAX_SAFE_INTEGER);
        }
        return cache(collection, nextNumber);
      };
    };

    var LAST_NUMBER_WEAK_MAP = new WeakMap();
    var cache = createCache(LAST_NUMBER_WEAK_MAP);
    var generateUniqueNumber = createGenerateUniqueNumber(cache, LAST_NUMBER_WEAK_MAP);
    var addUniqueNumber = createAddUniqueNumber(generateUniqueNumber);

    exports.addUniqueNumber = addUniqueNumber;
    exports.generateUniqueNumber = generateUniqueNumber;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{}],18:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime/helpers/slicedToArray')) :
    typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime/helpers/slicedToArray'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.jsonMidiMessageEncoder = {}, global._slicedToArray));
})(this, (function (exports, _slicedToArray) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var _slicedToArray__default = /*#__PURE__*/_interopDefaultLegacy(_slicedToArray);

    var isMidiChannelPrefixEvent = function isMidiChannelPrefixEvent(event) {
      return event.channelPrefix !== undefined;
    };

    var isMidiChannelPressureEvent = function isMidiChannelPressureEvent(event) {
      return event.channelPressure !== undefined;
    };

    var isMidiControlChangeEvent = function isMidiControlChangeEvent(event) {
      return event.controlChange !== undefined;
    };

    var isMidiCopyrightNoticeEvent = function isMidiCopyrightNoticeEvent(event) {
      return event.copyrightNotice !== undefined;
    };

    var isMidiCuePointEvent = function isMidiCuePointEvent(event) {
      return event.cuePoint !== undefined && event.metaTypeByte === undefined;
    };

    var isMidiDeviceNameEvent = function isMidiDeviceNameEvent(event) {
      return event.deviceName !== undefined;
    };

    var isMidiEndOfTrackEvent = function isMidiEndOfTrackEvent(event) {
      return event.endOfTrack !== undefined;
    };

    var isMidiInstrumentNameEvent = function isMidiInstrumentNameEvent(event) {
      return event.instrumentName !== undefined;
    };

    var isMidiKeyPressureEvent = function isMidiKeyPressureEvent(event) {
      return event.keyPressure !== undefined;
    };

    var isMidiKeySignatureEvent = function isMidiKeySignatureEvent(event) {
      return event.keySignature !== undefined;
    };

    var isMidiLyricEvent = function isMidiLyricEvent(event) {
      return event.lyric !== undefined;
    };

    var isMidiMarkerEvent = function isMidiMarkerEvent(event) {
      return event.marker !== undefined;
    };

    var isMidiMidiPortEvent = function isMidiMidiPortEvent(event) {
      return event.midiPort !== undefined;
    };

    var isMidiNoteOffEvent = function isMidiNoteOffEvent(event) {
      return event.noteOff !== undefined;
    };

    var isMidiNoteOnEvent = function isMidiNoteOnEvent(event) {
      return event.noteOn !== undefined;
    };

    var isMidiPitchBendEvent = function isMidiPitchBendEvent(event) {
      return event.pitchBend !== undefined;
    };

    var isMidiProgramChangeEvent = function isMidiProgramChangeEvent(event) {
      return event.programChange !== undefined;
    };

    var isMidiProgramNameEvent = function isMidiProgramNameEvent(event) {
      return event.programName !== undefined;
    };

    var isMidiSequencerSpecificEvent = function isMidiSequencerSpecificEvent(event) {
      return event.sequencerSpecificData !== undefined;
    };

    var isMidiSetTempoEvent = function isMidiSetTempoEvent(event) {
      return event.setTempo !== undefined;
    };

    var isMidiSmpteOffsetEvent = function isMidiSmpteOffsetEvent(event) {
      return event.smpteOffset !== undefined;
    };

    var isMidiSysexEvent = function isMidiSysexEvent(event) {
      return event.sysex !== undefined;
    };

    var isMidiTextEvent = function isMidiTextEvent(event) {
      return event.text !== undefined && event.metaTypeByte === undefined;
    };

    var isMidiTimeSignatureEvent = function isMidiTimeSignatureEvent(event) {
      return event.timeSignature !== undefined;
    };

    var isMidiTrackNameEvent = function isMidiTrackNameEvent(event) {
      return event.trackName !== undefined;
    };

    var isMidiUnknownTextEvent = function isMidiUnknownTextEvent(event) {
      return event.metaTypeByte !== undefined;
    };

    var createEncodeMidiEvent = function createEncodeMidiEvent(createArrayBufferWithDataView, encodeMidiMetaEventWithText, joinArrayBuffers, writeVariableLengthQuantity) {
      return function (event) {
        if (isMidiChannelPrefixEvent(event)) {
          var _createArrayBufferWit = createArrayBufferWithDataView(4),
            arrayBuffer = _createArrayBufferWit.arrayBuffer,
            dataView = _createArrayBufferWit.dataView;
          // Write an eventTypeByte with a value of 0xFF.
          dataView.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x20.
          dataView.setUint8(1, 0x20);
          dataView.setUint8(2, 1);
          dataView.setUint8(3, event.channelPrefix);
          return arrayBuffer;
        }
        if (isMidiChannelPressureEvent(event)) {
          var _createArrayBufferWit2 = createArrayBufferWithDataView(2),
            _arrayBuffer = _createArrayBufferWit2.arrayBuffer,
            _dataView = _createArrayBufferWit2.dataView;
          _dataView.setUint8(0, 0x0d | event.channel & 0xf); // tslint:disable-line:no-bitwise
          _dataView.setUint8(1, event.channelPressure.pressure);
          return _arrayBuffer;
        }
        if (isMidiControlChangeEvent(event)) {
          var _createArrayBufferWit3 = createArrayBufferWithDataView(3),
            _arrayBuffer2 = _createArrayBufferWit3.arrayBuffer,
            _dataView2 = _createArrayBufferWit3.dataView;
          _dataView2.setUint8(0, 0xb0 | event.channel & 0xf); // tslint:disable-line:no-bitwise
          _dataView2.setUint8(1, event.controlChange.type);
          _dataView2.setUint8(2, event.controlChange.value);
          return _arrayBuffer2;
        }
        if (isMidiCopyrightNoticeEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x02, 'copyrightNotice');
        }
        if (isMidiCuePointEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x07, 'cuePoint');
        }
        if (isMidiDeviceNameEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x09, 'deviceName');
        }
        if (isMidiEndOfTrackEvent(event)) {
          var _createArrayBufferWit4 = createArrayBufferWithDataView(3),
            _arrayBuffer3 = _createArrayBufferWit4.arrayBuffer,
            _dataView3 = _createArrayBufferWit4.dataView;
          // Write an eventTypeByte with a value of 0xFF.
          _dataView3.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x2F.
          _dataView3.setUint8(1, 0x2f);
          _dataView3.setUint8(2, 0);
          return _arrayBuffer3;
        }
        if (isMidiInstrumentNameEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x04, 'instrumentName');
        }
        if (isMidiKeyPressureEvent(event)) {
          var _createArrayBufferWit5 = createArrayBufferWithDataView(3),
            _arrayBuffer4 = _createArrayBufferWit5.arrayBuffer,
            _dataView4 = _createArrayBufferWit5.dataView;
          _dataView4.setUint8(0, 0x0a | event.channel & 0xf); // tslint:disable-line:no-bitwise
          _dataView4.setUint8(1, event.keyPressure.noteNumber);
          _dataView4.setUint8(2, event.keyPressure.pressure);
          return _arrayBuffer4;
        }
        if (isMidiKeySignatureEvent(event)) {
          var _createArrayBufferWit6 = createArrayBufferWithDataView(5),
            _arrayBuffer5 = _createArrayBufferWit6.arrayBuffer,
            _dataView5 = _createArrayBufferWit6.dataView;
          // Write an eventTypeByte with a value of 0xFF.
          _dataView5.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x59.
          _dataView5.setUint8(1, 0x59);
          _dataView5.setUint8(2, 2);
          _dataView5.setUint8(3, event.keySignature.key);
          _dataView5.setUint8(4, event.keySignature.scale);
          return _arrayBuffer5;
        }
        if (isMidiLyricEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x05, 'lyric');
        }
        if (isMidiMarkerEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x06, 'marker');
        }
        if (isMidiMidiPortEvent(event)) {
          var _createArrayBufferWit7 = createArrayBufferWithDataView(4),
            _arrayBuffer6 = _createArrayBufferWit7.arrayBuffer,
            _dataView6 = _createArrayBufferWit7.dataView;
          // Write an eventTypeByte with a value of 0xFF.
          _dataView6.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x21.
          _dataView6.setUint8(1, 0x21);
          _dataView6.setUint8(2, 1);
          _dataView6.setUint8(3, event.midiPort);
          return _arrayBuffer6;
        }
        if (isMidiNoteOffEvent(event)) {
          var _createArrayBufferWit8 = createArrayBufferWithDataView(3),
            _arrayBuffer7 = _createArrayBufferWit8.arrayBuffer,
            _dataView7 = _createArrayBufferWit8.dataView;
          _dataView7.setUint8(0, 0x80 | event.channel & 0xf); // tslint:disable-line:no-bitwise
          _dataView7.setUint8(1, event.noteOff.noteNumber);
          _dataView7.setUint8(2, event.noteOff.velocity);
          return _arrayBuffer7;
        }
        if (isMidiNoteOnEvent(event)) {
          var _createArrayBufferWit9 = createArrayBufferWithDataView(3),
            _arrayBuffer8 = _createArrayBufferWit9.arrayBuffer,
            _dataView8 = _createArrayBufferWit9.dataView;
          _dataView8.setUint8(0, 0x90 | event.channel & 0xf); // tslint:disable-line:no-bitwise
          _dataView8.setUint8(1, event.noteOn.noteNumber);
          _dataView8.setUint8(2, event.noteOn.velocity);
          return _arrayBuffer8;
        }
        if (isMidiPitchBendEvent(event)) {
          var _createArrayBufferWit10 = createArrayBufferWithDataView(3),
            _arrayBuffer9 = _createArrayBufferWit10.arrayBuffer,
            _dataView9 = _createArrayBufferWit10.dataView;
          _dataView9.setUint8(0, 0xe0 | event.channel & 0xf); // tslint:disable-line:no-bitwise
          _dataView9.setUint8(1, event.pitchBend & 0x7f); // tslint:disable-line:no-bitwise
          _dataView9.setUint8(2, event.pitchBend >> 7); // tslint:disable-line:no-bitwise
          return _arrayBuffer9;
        }
        if (isMidiProgramChangeEvent(event)) {
          var _createArrayBufferWit11 = createArrayBufferWithDataView(2),
            _arrayBuffer10 = _createArrayBufferWit11.arrayBuffer,
            _dataView10 = _createArrayBufferWit11.dataView;
          _dataView10.setUint8(0, 0xc0 | event.channel & 0xf); // tslint:disable-line:no-bitwise
          _dataView10.setUint8(1, event.programChange.programNumber);
          return _arrayBuffer10;
        }
        if (isMidiProgramNameEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x08, 'programName');
        }
        if (isMidiSequencerSpecificEvent(event)) {
          var _createArrayBufferWit12 = createArrayBufferWithDataView(2),
            _arrayBuffer11 = _createArrayBufferWit12.arrayBuffer,
            _dataView11 = _createArrayBufferWit12.dataView;
          // Write an eventTypeByte with a value of 0xFF.
          _dataView11.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x7F.
          _dataView11.setUint8(1, 0x7f);
          var sequencerSpecificDataLength = event.sequencerSpecificData.length / 2;
          var sequencerSpecificDataLengthArrayBuffer = writeVariableLengthQuantity(sequencerSpecificDataLength);
          var _createArrayBufferWit13 = createArrayBufferWithDataView(sequencerSpecificDataLength),
            sequencerSpecificDataArrayBuffer = _createArrayBufferWit13.arrayBuffer,
            sequencerSpecificDataDataView = _createArrayBufferWit13.dataView;
          for (var i = 0; i < event.sequencerSpecificData.length; i += 2) {
            sequencerSpecificDataDataView.setUint8(i / 2, parseInt(event.sequencerSpecificData.slice(i, i + 2), 16));
          }
          return joinArrayBuffers([_arrayBuffer11, sequencerSpecificDataLengthArrayBuffer, sequencerSpecificDataArrayBuffer]);
        }
        if (isMidiSetTempoEvent(event)) {
          var _createArrayBufferWit14 = createArrayBufferWithDataView(6),
            _arrayBuffer12 = _createArrayBufferWit14.arrayBuffer,
            _dataView12 = _createArrayBufferWit14.dataView;
          // Write an eventTypeByte with a value of 0xFF.
          _dataView12.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x51.
          _dataView12.setUint8(1, 0x51);
          _dataView12.setUint8(2, 3);
          _dataView12.setUint8(3, event.setTempo.microsecondsPerQuarter >> 16); // tslint:disable-line:no-bitwise
          _dataView12.setUint8(4, event.setTempo.microsecondsPerQuarter >> 8); // tslint:disable-line:no-bitwise
          _dataView12.setUint8(5, event.setTempo.microsecondsPerQuarter);
          return _arrayBuffer12;
        }
        if (isMidiSmpteOffsetEvent(event)) {
          var _createArrayBufferWit15 = createArrayBufferWithDataView(8),
            _arrayBuffer13 = _createArrayBufferWit15.arrayBuffer,
            _dataView13 = _createArrayBufferWit15.dataView;
          var frameRateByte;
          if (event.smpteOffset.frameRate === 24) {
            frameRateByte = 0x00;
          } else if (event.smpteOffset.frameRate === 25) {
            frameRateByte = 0x20;
          } else if (event.smpteOffset.frameRate === 29) {
            frameRateByte = 0x40;
          } else if (event.smpteOffset.frameRate === 30) {
            frameRateByte = 0x60;
          } else {
            throw new Error(); // @todo
          }
          // Write an eventTypeByte with a value of 0xFF.
          _dataView13.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x54.
          _dataView13.setUint8(1, 0x54);
          _dataView13.setUint8(2, 5);
          _dataView13.setUint8(3, event.smpteOffset.hour | frameRateByte); // tslint:disable-line:no-bitwise
          _dataView13.setUint8(4, event.smpteOffset.minutes);
          _dataView13.setUint8(5, event.smpteOffset.seconds);
          _dataView13.setUint8(6, event.smpteOffset.frame);
          _dataView13.setUint8(7, event.smpteOffset.subFrame);
          return _arrayBuffer13;
        }
        if (isMidiSysexEvent(event)) {
          var _createArrayBufferWit16 = createArrayBufferWithDataView(1),
            _arrayBuffer14 = _createArrayBufferWit16.arrayBuffer,
            _dataView14 = _createArrayBufferWit16.dataView;
          // Write an eventTypeByte with a value of 0xF0.
          _dataView14.setUint8(0, 0xf0);
          var sysexLength = event.sysex.length / 2;
          var sysexLengthArrayBuffer = writeVariableLengthQuantity(sysexLength);
          var _createArrayBufferWit17 = createArrayBufferWithDataView(sysexLength),
            sysexArrayBuffer = _createArrayBufferWit17.arrayBuffer,
            sysexDataView = _createArrayBufferWit17.dataView;
          for (var _i = 0; _i < event.sysex.length; _i += 2) {
            sysexDataView.setUint8(_i / 2, parseInt(event.sysex.slice(_i, _i + 2), 16));
          }
          return joinArrayBuffers([_arrayBuffer14, sysexLengthArrayBuffer, sysexArrayBuffer]);
        }
        if (isMidiTimeSignatureEvent(event)) {
          var _createArrayBufferWit18 = createArrayBufferWithDataView(7),
            _arrayBuffer15 = _createArrayBufferWit18.arrayBuffer,
            _dataView15 = _createArrayBufferWit18.dataView;
          var denominator = event.timeSignature.denominator;
          var counter = 0;
          while (denominator > 1) {
            denominator /= 2;
            counter += 1;
          }
          // Write an eventTypeByte with a value of 0xFF.
          _dataView15.setUint8(0, 0xff);
          // Write a metaTypeByte with a value of 0x58.
          _dataView15.setUint8(1, 0x58);
          _dataView15.setUint8(2, 4);
          _dataView15.setUint8(3, event.timeSignature.numerator);
          _dataView15.setUint8(4, counter);
          _dataView15.setUint8(5, event.timeSignature.metronome);
          _dataView15.setUint8(6, event.timeSignature.thirtyseconds);
          return _arrayBuffer15;
        }
        /*
         * @todo This needs to be before isMidiTextEvent() because otherwise TypeScript gets confused to believe that isMidiTextEvent()
         * will handle unknown text events as well.
         */
        if (isMidiUnknownTextEvent(event)) {
          return encodeMidiMetaEventWithText(event, parseInt(event.metaTypeByte, 16), 'text');
        }
        if (isMidiTextEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x01, 'text');
        }
        if (isMidiTrackNameEvent(event)) {
          return encodeMidiMetaEventWithText(event, 0x03, 'trackName');
        }
        throw new Error("Unencodable event with a delta of \"".concat(event.delta, "\"."));
      };
    };

    var createEncodeMidiMetaEventWithText = function createEncodeMidiMetaEventWithText(createArrayBufferWithDataView, joinArrayBuffers, textEncoder, writeVariableLengthQuantity) {
      return function (event, metaTypeByte, key) {
        var _createArrayBufferWit = createArrayBufferWithDataView(2),
          arrayBuffer = _createArrayBufferWit.arrayBuffer,
          dataView = _createArrayBufferWit.dataView;
        // Write an eventTypeByte with a value of 0xFF.
        dataView.setUint8(0, 0xff);
        // Write a metaTypeByte with the given value.
        dataView.setUint8(1, metaTypeByte);
        var textArrayBuffer = textEncoder.encode(event[key]).buffer;
        var textLengthArrayBuffer = writeVariableLengthQuantity(textArrayBuffer.byteLength);
        return joinArrayBuffers([arrayBuffer, textLengthArrayBuffer, textArrayBuffer]);
      };
    };

    var createWriteVariableLengthQuantity = function createWriteVariableLengthQuantity(createArrayBufferWithDataView) {
      return function (value) {
        var numberOfBytes = Math.max(1, Math.floor(Math.log(value) / Math.log(2) / 7) + 1);
        var _createArrayBufferWit = createArrayBufferWithDataView(numberOfBytes),
          arrayBuffer = _createArrayBufferWit.arrayBuffer,
          dataView = _createArrayBufferWit.dataView;
        for (var i = 1; i < numberOfBytes; i += 1) {
          dataView.setUint8(numberOfBytes - 1 - i, value >> i * 7 & 0x7f | 0x80); // tslint:disable-line:no-bitwise
        }

        dataView.setUint8(numberOfBytes - 1, value & 0x7f); // tslint:disable-line:no-bitwise
        return arrayBuffer;
      };
    };

    var createArrayBufferWithDataView = function createArrayBufferWithDataView(length) {
      var arrayBuffer = new ArrayBuffer(length);
      var dataView = new DataView(arrayBuffer);
      return {
        arrayBuffer: arrayBuffer,
        dataView: dataView
      };
    };

    var joinArrayBuffers = function joinArrayBuffers(arrayBuffers) {
      var byteLength = arrayBuffers.reduce(function (bytLngth, arrayBuffer) {
        return bytLngth + arrayBuffer.byteLength;
      }, 0);
      var _arrayBuffers$reduce = arrayBuffers.reduce(function (_ref, arrayBuffer) {
          var _ref2 = _slicedToArray__default["default"](_ref, 2),
            offset = _ref2[0],
            nt8Rry = _ref2[1];
          nt8Rry.set(new Uint8Array(arrayBuffer), offset);
          return [offset + arrayBuffer.byteLength, nt8Rry];
        }, [0, new Uint8Array(byteLength)]),
        _arrayBuffers$reduce2 = _slicedToArray__default["default"](_arrayBuffers$reduce, 2),
        uint8Array = _arrayBuffers$reduce2[1];
      return uint8Array.buffer;
    };

    var writeVariableLengthQuantity = createWriteVariableLengthQuantity(createArrayBufferWithDataView);
    var encodeMidiEvent = createEncodeMidiEvent(createArrayBufferWithDataView, createEncodeMidiMetaEventWithText(createArrayBufferWithDataView, joinArrayBuffers, new TextEncoder(), writeVariableLengthQuantity), joinArrayBuffers, writeVariableLengthQuantity);

    exports.encode = encodeMidiEvent;
    exports.writeVariableLengthQuantity = writeVariableLengthQuantity;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"@babel/runtime/helpers/slicedToArray":12}],19:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime/helpers/classCallCheck'), require('@babel/runtime/helpers/createClass')) :
    typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime/helpers/classCallCheck', '@babel/runtime/helpers/createClass'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.midiFileSlicer = {}, global._classCallCheck, global._createClass));
})(this, (function (exports, _classCallCheck, _createClass) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
    var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

    var isIMidiSetTempoEvent = function isIMidiSetTempoEvent(event) {
      return event.setTempo !== undefined;
    };

    var MidiFileSlicer = /*#__PURE__*/function () {
      function MidiFileSlicer(_ref) {
        var json = _ref.json;
        _classCallCheck__default["default"](this, MidiFileSlicer);
        this._json = json;
        this._microsecondsPerQuarter = 500000;
        this._gatherMicrosecondsPerQuarter();
      }
      _createClass__default["default"](MidiFileSlicer, [{
        key: "slice",
        value: function slice(start, end) {
          var events = [];
          var endInTicks = end / (this._microsecondsPerQuarter / this._json.division / 1000);
          var startInTicks = start / (this._microsecondsPerQuarter / this._json.division / 1000);
          var tracks = this._json.tracks;
          var length = tracks.length;
          for (var i = 0; i < length; i += 1) {
            var offset = 0;
            var track = tracks[i];
            var lngth = track.length;
            for (var j = 0; j < lngth; j += 1) {
              var event = track[j];
              offset += event.delta;
              if (offset >= startInTicks && offset < endInTicks) {
                events.push({
                  event: event,
                  time: (offset - startInTicks) * (this._microsecondsPerQuarter / this._json.division / 1000)
                });
              }
              if (offset >= endInTicks) {
                break;
              }
            }
          }
          return events;
        }
      }, {
        key: "_gatherMicrosecondsPerQuarter",
        value: function _gatherMicrosecondsPerQuarter() {
          var tracks = this._json.tracks;
          var length = tracks.length;
          tracks: for (var i = 0; i < length; i += 1) {
            var track = tracks[i];
            var lngth = track.length;
            for (var j = 0; j < lngth; j += 1) {
              var event = track[j];
              if (isIMidiSetTempoEvent(event)) {
                this._microsecondsPerQuarter = event.setTempo.microsecondsPerQuarter;
                break tracks;
              }
            }
          }
        }
      }]);
      return MidiFileSlicer;
    }();

    exports.MidiFileSlicer = MidiFileSlicer;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7}],20:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@babel/runtime/helpers/asyncToGenerator'), require('@babel/runtime/regenerator'), require('broker-factory')) :
    typeof define === 'function' && define.amd ? define(['exports', '@babel/runtime/helpers/asyncToGenerator', '@babel/runtime/regenerator', 'broker-factory'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.midiJsonParserBroker = {}, global._asyncToGenerator, global._regeneratorRuntime, global.brokerFactory));
})(this, (function (exports, _asyncToGenerator, _regeneratorRuntime, brokerFactory) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var _asyncToGenerator__default = /*#__PURE__*/_interopDefaultLegacy(_asyncToGenerator);
    var _regeneratorRuntime__default = /*#__PURE__*/_interopDefaultLegacy(_regeneratorRuntime);

    var wrap = brokerFactory.createBroker({
      parseArrayBuffer: function parseArrayBuffer(_ref) {
        var call = _ref.call;
        return /*#__PURE__*/function () {
          var _ref2 = _asyncToGenerator__default["default"]( /*#__PURE__*/_regeneratorRuntime__default["default"].mark(function _callee(arrayBuffer) {
            return _regeneratorRuntime__default["default"].wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    return _context.abrupt("return", call('parse', {
                      arrayBuffer: arrayBuffer
                    }, [arrayBuffer]));
                  case 1:
                  case "end":
                    return _context.stop();
                }
              }
            }, _callee);
          }));
          return function (_x) {
            return _ref2.apply(this, arguments);
          };
        }();
      }
    });
    var load = function load(url) {
      var worker = new Worker(url);
      return wrap(worker);
    };

    exports.load = load;
    exports.wrap = wrap;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"@babel/runtime/helpers/asyncToGenerator":5,"@babel/runtime/regenerator":15,"broker-factory":16}],21:[function(require,module,exports){
(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('midi-json-parser-broker')) :
	typeof define === 'function' && define.amd ? define(['exports', 'midi-json-parser-broker'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.midiJsonParser = {}, global.midiJsonParserBroker));
})(this, (function (exports, midiJsonParserBroker) { 'use strict';

	// This is the minified and stringified code of the midi-json-parser-worker package.
	var worker = "(()=>{var e={881:e=>{\"use strict\";e.exports=function(e,t){if(\"string\"!=typeof e)throw new TypeError(\"expected a string\");return e.trim().replace(/([a-z])([A-Z])/g,\"$1-$2\").replace(/\\W/g,(function(e){return/[\xC0-\u017E]/.test(e)?e:\"-\"})).replace(/^-+|-+$/g,\"\").replace(/-{2,}/g,(function(e){return t&&t.condense?\"-\":e})).toLowerCase()}},404:function(e,t,r){!function(e,t,r,n){\"use strict\";function o(e){return e&&\"object\"==typeof e&&\"default\"in e?e:{default:e}}var i=o(t),a=o(r),u=o(n),c=function(e,t){return void 0===t?e:t.reduce((function(e,t){if(\"capitalize\"===t){var r=e.charAt(0).toUpperCase(),n=e.slice(1);return\"\".concat(r).concat(n)}return\"dashify\"===t?a.default(e):\"prependIndefiniteArticle\"===t?\"\".concat(u.default(e),\" \").concat(e):e}),e)},s=function(e){var t=e.name+e.modifiers.map((function(e){return\"\\\\.\".concat(e,\"\\\\(\\\\)\")})).join(\"\");return new RegExp(\"\\\\$\\\\{\".concat(t,\"}\"),\"g\")},f=function(e,t){for(var r=/\\${([^.}]+)((\\.[^(]+\\(\\))*)}/g,n=[],o=r.exec(e);null!==o;){var a={modifiers:[],name:o[1]};if(void 0!==o[3])for(var u=/\\.[^(]+\\(\\)/g,f=u.exec(o[2]);null!==f;)a.modifiers.push(f[0].slice(1,-2)),f=u.exec(o[2]);n.push(a),o=r.exec(e)}var l=n.reduce((function(e,r){return e.map((function(e){return\"string\"==typeof e?e.split(s(r)).reduce((function(e,n,o){return 0===o?[n]:r.name in t?[].concat(i.default(e),[c(t[r.name],r.modifiers),n]):[].concat(i.default(e),[function(e){return c(e[r.name],r.modifiers)},n])}),[]):[e]})).reduce((function(e,t){return[].concat(i.default(e),i.default(t))}),[])}),[e]);return function(e){return l.reduce((function(t,r){return[].concat(i.default(t),\"string\"==typeof r?[r]:[r(e)])}),[]).join(\"\")}},l=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},r=void 0===e.code?void 0:f(e.code,t),n=void 0===e.message?void 0:f(e.message,t);function o(){var t=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{},o=arguments.length>1?arguments[1]:void 0,i=void 0===o&&(t instanceof Error||void 0!==t.code&&\"Exception\"===t.code.slice(-9))?{cause:t,missingParameters:{}}:{cause:o,missingParameters:t},a=i.cause,u=i.missingParameters,c=void 0===n?new Error:new Error(n(u));return null!==a&&(c.cause=a),void 0!==r&&(c.code=r(u)),void 0!==e.status&&(c.status=e.status),c}return o};e.compile=l,Object.defineProperty(e,\"__esModule\",{value:!0})}(t,r(861),r(881),r(932))},650:function(e,t){!function(e){\"use strict\";var t=function(e){return function(t){var r=e(t);return t.add(r),r}},r=function(e){return function(t,r){return e.set(t,r),r}},n=void 0===Number.MAX_SAFE_INTEGER?9007199254740991:Number.MAX_SAFE_INTEGER,o=536870912,i=2*o,a=function(e,t){return function(r){var a=t.get(r),u=void 0===a?r.size:a<i?a+1:0;if(!r.has(u))return e(r,u);if(r.size<o){for(;r.has(u);)u=Math.floor(Math.random()*i);return e(r,u)}if(r.size>n)throw new Error(\"Congratulations, you created a collection of unique numbers which uses all available integers!\");for(;r.has(u);)u=Math.floor(Math.random()*n);return e(r,u)}},u=new WeakMap,c=r(u),s=a(c,u),f=t(s);e.addUniqueNumber=f,e.generateUniqueNumber=s,Object.defineProperty(e,\"__esModule\",{value:!0})}(t)},932:e=>{var t=function(e){var t,r,n=/\\w+/.exec(e);if(!n)return\"an\";var o=(r=n[0]).toLowerCase(),i=[\"honest\",\"hour\",\"hono\"];for(t in i)if(0==o.indexOf(i[t]))return\"an\";if(1==o.length)return\"aedhilmnorsx\".indexOf(o)>=0?\"an\":\"a\";if(r.match(/(?!FJO|[HLMNS]Y.|RY[EO]|SQU|(F[LR]?|[HL]|MN?|N|RH?|S[CHKLMNPTVW]?|X(YL)?)[AEIOU])[FHLMNRSX][A-Z]/))return\"an\";var a=[/^e[uw]/,/^onc?e\\b/,/^uni([^nmd]|mo)/,/^u[bcfhjkqrst][aeiou]/];for(t=0;t<a.length;t++)if(o.match(a[t]))return\"a\";return r.match(/^U[NK][AIEO]/)?\"a\":r==r.toUpperCase()?\"aedhilmnorsx\".indexOf(o[0])>=0?\"an\":\"a\":\"aeiou\".indexOf(o[0])>=0||o.match(/^y(b[lor]|cl[ea]|fere|gg|p[ios]|rou|tt)/)?\"an\":\"a\"};void 0!==e.exports?e.exports=t:window.indefiniteArticle=t},977:function(e,t,r){!function(e,t){\"use strict\";function r(e){return e&&\"object\"==typeof e&&\"default\"in e?e:{default:e}}var n=r(t),o=function(e){return void 0!==e.channel},i=function(e){return e.toString(16).toUpperCase().padStart(2,\"0\")},a=function(e){for(var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.byteLength-(t-e.byteOffset),n=t+e.byteOffset,o=[],a=new Uint8Array(e.buffer,n,r),u=0;u<r;u+=1)o[u]=i(a[u]);return o.join(\"\")},u=function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:0,r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:e.byteLength-(t-e.byteOffset),n=t+e.byteOffset,o=new Uint8Array(e.buffer,n,r);return String.fromCharCode.apply(null,o)};function c(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function s(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?c(Object(r),!0).forEach((function(t){n.default(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):c(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var f=function(e){for(var t=new DataView(e),r=p(t),n=14,o=[],i=0,a=r.numberOfTracks;i<a;i+=1){var u=void 0,c=g(t,n);n=c.offset,u=c.track,o.push(u)}return{division:r.division,format:r.format,tracks:o}},l=function(e,t,r){var n,o=m(e,t),i=o.offset,a=o.value,u=e.getUint8(i);return s(s({},n=240===u?v(e,i+1):255===u?d(e,i+1):h(u,e,i+1,r)),{},{event:s(s({},n.event),{},{delta:a}),eventTypeByte:u})},p=function(e){if(e.byteLength<14)throw new Error(\"Expected at least 14 bytes instead of \".concat(e.byteLength));if(\"MThd\"!==u(e,0,4))throw new Error('Unexpected characters \"'.concat(u(e,0,4),'\" found instead of \"MThd\"'));if(6!==e.getUint32(4))throw new Error(\"The header has an unexpected length of \".concat(e.getUint32(4),\" instead of 6\"));var t=e.getUint16(8),r=e.getUint16(10);return{division:e.getUint16(12),format:t,numberOfTracks:r}},d=function(e,t){var r,n=e.getUint8(t),o=m(e,t+1),c=o.offset,s=o.value;if(1===n)r={text:u(e,c,s)};else if(2===n)r={copyrightNotice:u(e,c,s)};else if(3===n)r={trackName:u(e,c,s)};else if(4===n)r={instrumentName:u(e,c,s)};else if(5===n)r={lyric:u(e,c,s)};else if(6===n)r={marker:u(e,c,s)};else if(7===n)r={cuePoint:u(e,c,s)};else if(8===n)r={programName:u(e,c,s)};else if(9===n)r={deviceName:u(e,c,s)};else if(10===n||11===n||12===n||13===n||14===n||15===n)r={metaTypeByte:i(n),text:u(e,c,s)};else if(32===n)r={channelPrefix:e.getUint8(c)};else if(33===n)r={midiPort:e.getUint8(c)};else if(47===n)r={endOfTrack:!0};else if(81===n)r={setTempo:{microsecondsPerQuarter:(e.getUint8(c)<<16)+(e.getUint8(c+1)<<8)+e.getUint8(c+2)}};else if(84===n){var f,l=e.getUint8(c);0==(96&l)?f=24:32==(96&l)?f=25:64==(96&l)?f=29:96==(96&l)&&(f=30),r={smpteOffset:{frame:e.getUint8(c+3),frameRate:f,hour:31&l,minutes:e.getUint8(c+1),seconds:e.getUint8(c+2),subFrame:e.getUint8(c+4)}}}else if(88===n)r={timeSignature:{denominator:Math.pow(2,e.getUint8(c+1)),metronome:e.getUint8(c+2),numerator:e.getUint8(c),thirtyseconds:e.getUint8(c+3)}};else if(89===n)r={keySignature:{key:e.getInt8(c),scale:e.getInt8(c+1)}};else{if(127!==n)throw new Error('Cannot parse a meta event with a type of \"'.concat(i(n),'\"'));r={sequencerSpecificData:a(e,c,s)}}return{event:r,offset:c+s}},h=function(e,t,r,n){var o,a=0==(128&e)?n:null,u=(null===a?e:a)>>4,c=null===a?r:r-1;if(8===u)o={noteOff:{noteNumber:t.getUint8(c),velocity:t.getUint8(c+1)}},c+=2;else if(9===u){var s=t.getUint8(c),f=t.getUint8(c+1);o=0===f?{noteOff:{noteNumber:s,velocity:f}}:{noteOn:{noteNumber:s,velocity:f}},c+=2}else if(10===u)o={keyPressure:{noteNumber:t.getUint8(c),pressure:t.getUint8(c+1)}},c+=2;else if(11===u)o={controlChange:{type:t.getUint8(c),value:t.getUint8(c+1)}},c+=2;else if(12===u)o={programChange:{programNumber:t.getUint8(c)}},c+=1;else if(13===u)o={channelPressure:{pressure:t.getUint8(c)}},c+=1;else{if(14!==u)throw new Error('Cannot parse a midi event with a type of \"'.concat(i(u),'\"'));o={pitchBend:t.getUint8(c)|t.getUint8(c+1)<<7},c+=2}return o.channel=15&(null===a?e:a),{event:o,offset:c}},v=function(e,t){var r=m(e,t),n=r.offset,o=r.value;return{event:{sysex:a(e,n,o)},offset:n+o}},g=function(e,t){if(\"MTrk\"!==u(e,t,4))throw new Error('Unexpected characters \"'.concat(u(e,t,4),'\" found instead of \"MTrk\"'));for(var r=[],n=e.getUint32(t+4)+t+8,i=null,a=t+8;a<n;){var c=l(e,a,i),s=c.event,f=c.eventTypeByte;r.push(s),a=c.offset,o(s)&&(128&f)>0&&(i=f)}return{offset:a,track:r}},m=function(e,t){for(var r=t,n=0;;){var o=e.getUint8(r);if(r+=1,!(o>127))return{offset:r,value:n+=o};n+=127&o,n<<=7}};e.createWorker(self,{parse:function(e){var t=e.arrayBuffer;return{result:f(t)}}})}(r(868),r(416))},868:function(e,t,r){!function(e,t,r,n,o,i){\"use strict\";function a(e){return e&&\"object\"==typeof e&&\"default\"in e?e:{default:e}}var u=a(t),c=a(r),s=a(o),f={INTERNAL_ERROR:-32603,INVALID_PARAMS:-32602,METHOD_NOT_FOUND:-32601},l=n.compile({message:'The requested method called \"${method}\" is not supported.',status:f.METHOD_NOT_FOUND}),p=n.compile({message:'The handler of the method called \"${method}\" returned no required result.',status:f.INTERNAL_ERROR}),d=n.compile({message:'The handler of the method called \"${method}\" returned an unexpected result.',status:f.INTERNAL_ERROR}),h=n.compile({message:'The specified parameter called \"portId\" with the given value \"${portId}\" does not identify a port connected to this worker.',status:f.INVALID_PARAMS}),v=function(e,t){return function(){var r=u.default(c.default.mark((function r(n){var o,i,a,u,s,f,h,v,g,m,y,b,x;return c.default.wrap((function(r){for(;;)switch(r.prev=r.next){case 0:if(o=n.data,i=o.id,a=o.method,u=o.params,s=t[a],r.prev=2,void 0!==s){r.next=5;break}throw l({method:a});case 5:if(void 0!==(f=void 0===u?s():s(u))){r.next=8;break}throw p({method:a});case 8:if(!(f instanceof Promise)){r.next=14;break}return r.next=11,f;case 11:r.t0=r.sent,r.next=15;break;case 14:r.t0=f;case 15:if(h=r.t0,null!==i){r.next=21;break}if(void 0===h.result){r.next=19;break}throw d({method:a});case 19:r.next=25;break;case 21:if(void 0!==h.result){r.next=23;break}throw d({method:a});case 23:v=h.result,g=h.transferables,m=void 0===g?[]:g,e.postMessage({id:i,result:v},m);case 25:r.next=31;break;case 27:r.prev=27,r.t1=r.catch(2),y=r.t1.message,b=r.t1.status,x=void 0===b?-32603:b,e.postMessage({error:{code:x,message:y},id:i});case 31:case\"end\":return r.stop()}}),r,null,[[2,27]])})));return function(e){return r.apply(this,arguments)}}()},g=function(){return new Promise((function(e){var t=new ArrayBuffer(0),r=new MessageChannel,n=r.port1,o=r.port2;n.onmessage=function(t){var r=t.data;return e(null!==r)},o.postMessage(t,[t])}))};function m(e,t){var r=Object.keys(e);if(Object.getOwnPropertySymbols){var n=Object.getOwnPropertySymbols(e);t&&(n=n.filter((function(t){return Object.getOwnPropertyDescriptor(e,t).enumerable}))),r.push.apply(r,n)}return r}function y(e){for(var t=1;t<arguments.length;t++){var r=null!=arguments[t]?arguments[t]:{};t%2?m(Object(r),!0).forEach((function(t){s.default(e,t,r[t])})):Object.getOwnPropertyDescriptors?Object.defineProperties(e,Object.getOwnPropertyDescriptors(r)):m(Object(r)).forEach((function(t){Object.defineProperty(e,t,Object.getOwnPropertyDescriptor(r,t))}))}return e}var b=new Map,x=function(e,t,r){return y(y({},t),{},{connect:function(r){var n=r.port;n.start();var o=e(n,t),a=i.generateUniqueNumber(b);return b.set(a,(function(){o(),n.close(),b.delete(a)})),{result:a}},disconnect:function(e){var t=e.portId,r=b.get(t);if(void 0===r)throw h({portId:t.toString()});return r(),{result:null}},isSupported:function(){var e=u.default(c.default.mark((function e(){var t,n;return c.default.wrap((function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,g();case 2:if(!e.sent){e.next=14;break}if(!((t=r())instanceof Promise)){e.next=11;break}return e.next=8,t;case 8:e.t0=e.sent,e.next=12;break;case 11:e.t0=t;case 12:return n=e.t0,e.abrupt(\"return\",{result:n});case 14:return e.abrupt(\"return\",{result:!1});case 15:case\"end\":return e.stop()}}),e)})));function t(){return e.apply(this,arguments)}return t}()})},w=function e(t,r){var n=x(e,r,arguments.length>2&&void 0!==arguments[2]?arguments[2]:function(){return!0}),o=v(t,n);return t.addEventListener(\"message\",o),function(){return t.removeEventListener(\"message\",o)}};e.createWorker=w,e.isSupported=g,Object.defineProperty(e,\"__esModule\",{value:!0})}(t,r(156),r(687),r(404),r(416),r(650))},897:e=>{e.exports=function(e,t){(null==t||t>e.length)&&(t=e.length);for(var r=0,n=new Array(t);r<t;r++)n[r]=e[r];return n},e.exports.__esModule=!0,e.exports.default=e.exports},405:(e,t,r)=>{var n=r(897);e.exports=function(e){if(Array.isArray(e))return n(e)},e.exports.__esModule=!0,e.exports.default=e.exports},156:e=>{function t(e,t,r,n,o,i,a){try{var u=e[i](a),c=u.value}catch(e){return void r(e)}u.done?t(c):Promise.resolve(c).then(n,o)}e.exports=function(e){return function(){var r=this,n=arguments;return new Promise((function(o,i){var a=e.apply(r,n);function u(e){t(a,o,i,u,c,\"next\",e)}function c(e){t(a,o,i,u,c,\"throw\",e)}u(void 0)}))}},e.exports.__esModule=!0,e.exports.default=e.exports},416:e=>{e.exports=function(e,t,r){return t in e?Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}):e[t]=r,e},e.exports.__esModule=!0,e.exports.default=e.exports},498:e=>{e.exports=function(e){if(\"undefined\"!=typeof Symbol&&null!=e[Symbol.iterator]||null!=e[\"@@iterator\"])return Array.from(e)},e.exports.__esModule=!0,e.exports.default=e.exports},281:e=>{e.exports=function(){throw new TypeError(\"Invalid attempt to spread non-iterable instance.\\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.\")},e.exports.__esModule=!0,e.exports.default=e.exports},61:(e,t,r)=>{var n=r(698).default;function o(){\"use strict\";e.exports=o=function(){return t},e.exports.__esModule=!0,e.exports.default=e.exports;var t={},r=Object.prototype,i=r.hasOwnProperty,a=\"function\"==typeof Symbol?Symbol:{},u=a.iterator||\"@@iterator\",c=a.asyncIterator||\"@@asyncIterator\",s=a.toStringTag||\"@@toStringTag\";function f(e,t,r){return Object.defineProperty(e,t,{value:r,enumerable:!0,configurable:!0,writable:!0}),e[t]}try{f({},\"\")}catch(e){f=function(e,t,r){return e[t]=r}}function l(e,t,r,n){var o=t&&t.prototype instanceof h?t:h,i=Object.create(o.prototype),a=new j(n||[]);return i._invoke=function(e,t,r){var n=\"suspendedStart\";return function(o,i){if(\"executing\"===n)throw new Error(\"Generator is already running\");if(\"completed\"===n){if(\"throw\"===o)throw i;return P()}for(r.method=o,r.arg=i;;){var a=r.delegate;if(a){var u=E(a,r);if(u){if(u===d)continue;return u}}if(\"next\"===r.method)r.sent=r._sent=r.arg;else if(\"throw\"===r.method){if(\"suspendedStart\"===n)throw n=\"completed\",r.arg;r.dispatchException(r.arg)}else\"return\"===r.method&&r.abrupt(\"return\",r.arg);n=\"executing\";var c=p(e,t,r);if(\"normal\"===c.type){if(n=r.done?\"completed\":\"suspendedYield\",c.arg===d)continue;return{value:c.arg,done:r.done}}\"throw\"===c.type&&(n=\"completed\",r.method=\"throw\",r.arg=c.arg)}}}(e,r,a),i}function p(e,t,r){try{return{type:\"normal\",arg:e.call(t,r)}}catch(e){return{type:\"throw\",arg:e}}}t.wrap=l;var d={};function h(){}function v(){}function g(){}var m={};f(m,u,(function(){return this}));var y=Object.getPrototypeOf,b=y&&y(y(L([])));b&&b!==r&&i.call(b,u)&&(m=b);var x=g.prototype=h.prototype=Object.create(m);function w(e){[\"next\",\"throw\",\"return\"].forEach((function(t){f(e,t,(function(e){return this._invoke(t,e)}))}))}function O(e,t){function r(o,a,u,c){var s=p(e[o],e,a);if(\"throw\"!==s.type){var f=s.arg,l=f.value;return l&&\"object\"==n(l)&&i.call(l,\"__await\")?t.resolve(l.__await).then((function(e){r(\"next\",e,u,c)}),(function(e){r(\"throw\",e,u,c)})):t.resolve(l).then((function(e){f.value=e,u(f)}),(function(e){return r(\"throw\",e,u,c)}))}c(s.arg)}var o;this._invoke=function(e,n){function i(){return new t((function(t,o){r(e,n,t,o)}))}return o=o?o.then(i,i):i()}}function E(e,t){var r=e.iterator[t.method];if(void 0===r){if(t.delegate=null,\"throw\"===t.method){if(e.iterator.return&&(t.method=\"return\",t.arg=void 0,E(e,t),\"throw\"===t.method))return d;t.method=\"throw\",t.arg=new TypeError(\"The iterator does not provide a 'throw' method\")}return d}var n=p(r,e.iterator,t.arg);if(\"throw\"===n.type)return t.method=\"throw\",t.arg=n.arg,t.delegate=null,d;var o=n.arg;return o?o.done?(t[e.resultName]=o.value,t.next=e.nextLoc,\"return\"!==t.method&&(t.method=\"next\",t.arg=void 0),t.delegate=null,d):o:(t.method=\"throw\",t.arg=new TypeError(\"iterator result is not an object\"),t.delegate=null,d)}function _(e){var t={tryLoc:e[0]};1 in e&&(t.catchLoc=e[1]),2 in e&&(t.finallyLoc=e[2],t.afterLoc=e[3]),this.tryEntries.push(t)}function U(e){var t=e.completion||{};t.type=\"normal\",delete t.arg,e.completion=t}function j(e){this.tryEntries=[{tryLoc:\"root\"}],e.forEach(_,this),this.reset(!0)}function L(e){if(e){var t=e[u];if(t)return t.call(e);if(\"function\"==typeof e.next)return e;if(!isNaN(e.length)){var r=-1,n=function t(){for(;++r<e.length;)if(i.call(e,r))return t.value=e[r],t.done=!1,t;return t.value=void 0,t.done=!0,t};return n.next=n}}return{next:P}}function P(){return{value:void 0,done:!0}}return v.prototype=g,f(x,\"constructor\",g),f(g,\"constructor\",v),v.displayName=f(g,s,\"GeneratorFunction\"),t.isGeneratorFunction=function(e){var t=\"function\"==typeof e&&e.constructor;return!!t&&(t===v||\"GeneratorFunction\"===(t.displayName||t.name))},t.mark=function(e){return Object.setPrototypeOf?Object.setPrototypeOf(e,g):(e.__proto__=g,f(e,s,\"GeneratorFunction\")),e.prototype=Object.create(x),e},t.awrap=function(e){return{__await:e}},w(O.prototype),f(O.prototype,c,(function(){return this})),t.AsyncIterator=O,t.async=function(e,r,n,o,i){void 0===i&&(i=Promise);var a=new O(l(e,r,n,o),i);return t.isGeneratorFunction(r)?a:a.next().then((function(e){return e.done?e.value:a.next()}))},w(x),f(x,s,\"Generator\"),f(x,u,(function(){return this})),f(x,\"toString\",(function(){return\"[object Generator]\"})),t.keys=function(e){var t=[];for(var r in e)t.push(r);return t.reverse(),function r(){for(;t.length;){var n=t.pop();if(n in e)return r.value=n,r.done=!1,r}return r.done=!0,r}},t.values=L,j.prototype={constructor:j,reset:function(e){if(this.prev=0,this.next=0,this.sent=this._sent=void 0,this.done=!1,this.delegate=null,this.method=\"next\",this.arg=void 0,this.tryEntries.forEach(U),!e)for(var t in this)\"t\"===t.charAt(0)&&i.call(this,t)&&!isNaN(+t.slice(1))&&(this[t]=void 0)},stop:function(){this.done=!0;var e=this.tryEntries[0].completion;if(\"throw\"===e.type)throw e.arg;return this.rval},dispatchException:function(e){if(this.done)throw e;var t=this;function r(r,n){return a.type=\"throw\",a.arg=e,t.next=r,n&&(t.method=\"next\",t.arg=void 0),!!n}for(var n=this.tryEntries.length-1;n>=0;--n){var o=this.tryEntries[n],a=o.completion;if(\"root\"===o.tryLoc)return r(\"end\");if(o.tryLoc<=this.prev){var u=i.call(o,\"catchLoc\"),c=i.call(o,\"finallyLoc\");if(u&&c){if(this.prev<o.catchLoc)return r(o.catchLoc,!0);if(this.prev<o.finallyLoc)return r(o.finallyLoc)}else if(u){if(this.prev<o.catchLoc)return r(o.catchLoc,!0)}else{if(!c)throw new Error(\"try statement without catch or finally\");if(this.prev<o.finallyLoc)return r(o.finallyLoc)}}}},abrupt:function(e,t){for(var r=this.tryEntries.length-1;r>=0;--r){var n=this.tryEntries[r];if(n.tryLoc<=this.prev&&i.call(n,\"finallyLoc\")&&this.prev<n.finallyLoc){var o=n;break}}o&&(\"break\"===e||\"continue\"===e)&&o.tryLoc<=t&&t<=o.finallyLoc&&(o=null);var a=o?o.completion:{};return a.type=e,a.arg=t,o?(this.method=\"next\",this.next=o.finallyLoc,d):this.complete(a)},complete:function(e,t){if(\"throw\"===e.type)throw e.arg;return\"break\"===e.type||\"continue\"===e.type?this.next=e.arg:\"return\"===e.type?(this.rval=this.arg=e.arg,this.method=\"return\",this.next=\"end\"):\"normal\"===e.type&&t&&(this.next=t),d},finish:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.finallyLoc===e)return this.complete(r.completion,r.afterLoc),U(r),d}},catch:function(e){for(var t=this.tryEntries.length-1;t>=0;--t){var r=this.tryEntries[t];if(r.tryLoc===e){var n=r.completion;if(\"throw\"===n.type){var o=n.arg;U(r)}return o}}throw new Error(\"illegal catch attempt\")},delegateYield:function(e,t,r){return this.delegate={iterator:L(e),resultName:t,nextLoc:r},\"next\"===this.method&&(this.arg=void 0),d}},t}e.exports=o,e.exports.__esModule=!0,e.exports.default=e.exports},861:(e,t,r)=>{var n=r(405),o=r(498),i=r(116),a=r(281);e.exports=function(e){return n(e)||o(e)||i(e)||a()},e.exports.__esModule=!0,e.exports.default=e.exports},698:e=>{function t(r){return e.exports=t=\"function\"==typeof Symbol&&\"symbol\"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&\"function\"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?\"symbol\":typeof e},e.exports.__esModule=!0,e.exports.default=e.exports,t(r)}e.exports=t,e.exports.__esModule=!0,e.exports.default=e.exports},116:(e,t,r)=>{var n=r(897);e.exports=function(e,t){if(e){if(\"string\"==typeof e)return n(e,t);var r=Object.prototype.toString.call(e).slice(8,-1);return\"Object\"===r&&e.constructor&&(r=e.constructor.name),\"Map\"===r||\"Set\"===r?Array.from(e):\"Arguments\"===r||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(r)?n(e,t):void 0}},e.exports.__esModule=!0,e.exports.default=e.exports},687:(e,t,r)=>{var n=r(61)();e.exports=n;try{regeneratorRuntime=n}catch(e){\"object\"==typeof globalThis?globalThis.regeneratorRuntime=n:Function(\"r\",\"regeneratorRuntime = r\")(n)}}},t={};function r(n){var o=t[n];if(void 0!==o)return o.exports;var i=t[n]={exports:{}};return e[n].call(i.exports,i,i.exports,r),i.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var n in t)r.o(t,n)&&!r.o(e,n)&&Object.defineProperty(e,n,{enumerable:!0,get:t[n]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{\"use strict\";r(977)})()})();"; // tslint:disable-line:max-line-length

	var blob = new Blob([worker], {
	  type: 'application/javascript; charset=utf-8'
	});
	var url = URL.createObjectURL(blob);
	var midiJsonParser = midiJsonParserBroker.load(url);
	var connect = midiJsonParser.connect;
	var disconnect = midiJsonParser.disconnect;
	var isSupported = midiJsonParser.isSupported;
	// @todo Remove type annotation when possible.
	var parseArrayBuffer = midiJsonParser.parseArrayBuffer;
	URL.revokeObjectURL(url);

	exports.connect = connect;
	exports.disconnect = disconnect;
	exports.isSupported = isSupported;
	exports.parseArrayBuffer = parseArrayBuffer;

	Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"midi-json-parser-broker":20}],22:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('worker-timers'), require('midi-file-slicer'), require('@babel/runtime/helpers/defineProperty'), require('json-midi-message-encoder'), require('@babel/runtime/helpers/classCallCheck'), require('@babel/runtime/helpers/createClass'), require('rxjs')) :
    typeof define === 'function' && define.amd ? define(['exports', 'worker-timers', 'midi-file-slicer', '@babel/runtime/helpers/defineProperty', 'json-midi-message-encoder', '@babel/runtime/helpers/classCallCheck', '@babel/runtime/helpers/createClass', 'rxjs'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.midiPlayer = {}, global.workerTimers, global.midiFileSlicer, global._defineProperty, global.jsonMidiMessageEncoder, global._classCallCheck, global._createClass, global.rxjs));
})(this, (function (exports, workerTimers, midiFileSlicer, _defineProperty, jsonMidiMessageEncoder, _classCallCheck, _createClass, rxjs) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var _defineProperty__default = /*#__PURE__*/_interopDefaultLegacy(_defineProperty);
    var _classCallCheck__default = /*#__PURE__*/_interopDefaultLegacy(_classCallCheck);
    var _createClass__default = /*#__PURE__*/_interopDefaultLegacy(_createClass);

    var createMidiFileSlicer = function createMidiFileSlicer(json) {
      return new midiFileSlicer.MidiFileSlicer({
        json: json
      });
    };

    var encodeMidiMessage = function encodeMidiMessage(event) {
      return new Uint8Array(jsonMidiMessageEncoder.encode(event));
    };

    var MidiPlayer = /*#__PURE__*/function () {
      function MidiPlayer(_ref) {
        var encodeMidiMessage = _ref.encodeMidiMessage,
          json = _ref.json,
          midiFileSlicer = _ref.midiFileSlicer,
          midiOutput = _ref.midiOutput,
          scheduler = _ref.scheduler;
        _classCallCheck__default["default"](this, MidiPlayer);
        this._encodeMidiMessage = encodeMidiMessage;
        this._endedTracks = null;
        this._json = json;
        this._midiFileSlicer = midiFileSlicer;
        this._midiOutput = midiOutput;
        this._offset = null;
        this._resolve = null;
        this._scheduler = scheduler;
        this._schedulerSubscription = null;
      }
      _createClass__default["default"](MidiPlayer, [{
        key: "play",
        value: function play() {
          var _this = this;
          if (this._schedulerSubscription !== null || this._endedTracks !== null) {
            throw new Error('The player is currently playing.');
          }
          this._endedTracks = 0;
          return new Promise(function (resolve, reject) {
            _this._resolve = resolve;
            _this._schedulerSubscription = _this._scheduler.subscribe({
              error: function error(err) {
                return reject(err);
              },
              next: function next(_ref2) {
                var end = _ref2.end,
                  start = _ref2.start;
                if (_this._offset === null) {
                  _this._offset = start;
                }
                _this._schedule(start, end);
              }
            });
            if (_this._resolve === null) {
              _this._schedulerSubscription.unsubscribe();
            }
          });
        }
      }, {
        key: "_schedule",
        value: function _schedule(start, end) {
          var _this2 = this;
          if (this._endedTracks === null || this._offset === null || this._resolve === null) {
            throw new Error(); // @todo
          }

          var events = this._midiFileSlicer.slice(start - this._offset, end - this._offset);
          events.filter(function (_ref3) {
            var event = _ref3.event;
            return MidiPlayer._isSendableEvent(event);
          }).forEach(function (_ref4) {
            var event = _ref4.event,
              time = _ref4.time;
            return _this2._midiOutput.send(_this2._encodeMidiMessage(event), start + time);
          });
          var endedTracks = events.filter(function (_ref5) {
            var event = _ref5.event;
            return MidiPlayer._isEndOfTrack(event);
          }).length;
          this._endedTracks += endedTracks;
          if (this._endedTracks === this._json.tracks.length) {
            if (this._schedulerSubscription !== null) {
              this._schedulerSubscription.unsubscribe();
            }
            this._schedulerSubscription = null;
            this._endedTracks = null;
            this._resolve();
            this._resolve = null;
          }
        }
      }], [{
        key: "_isEndOfTrack",
        value: function _isEndOfTrack(event) {
          return 'endOfTrack' in event;
        }
      }, {
        key: "_isSendableEvent",
        value: function _isSendableEvent(event) {
          return 'controlChange' in event || 'noteOff' in event || 'noteOn' in event || 'programChange' in event;
        }
      }]);
      return MidiPlayer;
    }();

    function ownKeys(object, enumerableOnly) { var keys = Object.keys(object); if (Object.getOwnPropertySymbols) { var symbols = Object.getOwnPropertySymbols(object); enumerableOnly && (symbols = symbols.filter(function (sym) { return Object.getOwnPropertyDescriptor(object, sym).enumerable; })), keys.push.apply(keys, symbols); } return keys; }
    function _objectSpread(target) { for (var i = 1; i < arguments.length; i++) { var source = null != arguments[i] ? arguments[i] : {}; i % 2 ? ownKeys(Object(source), !0).forEach(function (key) { _defineProperty__default["default"](target, key, source[key]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function (key) { Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key)); }); } return target; }
    var createMidiPlayerFactory = function createMidiPlayerFactory(createMidiFileSlicer, scheduler) {
      return function (options) {
        var midiFileSlicer = createMidiFileSlicer(options.json);
        return new MidiPlayer(_objectSpread(_objectSpread({}, options), {}, {
          encodeMidiMessage: encodeMidiMessage,
          midiFileSlicer: midiFileSlicer,
          scheduler: scheduler
        }));
      };
    };

    var INTERVAL = 500;
    var Scheduler = /*#__PURE__*/function () {
      function Scheduler(_clearInterval, _performance, _setInterval) {
        _classCallCheck__default["default"](this, Scheduler);
        this._clearInterval = _clearInterval;
        this._performance = _performance;
        this._setInterval = _setInterval;
        this._intervalId = null;
        this._nextTick = 0;
        this._numberOfSubscribers = 0;
        this._subject = new rxjs.Subject();
      }
      _createClass__default["default"](Scheduler, [{
        key: "subscribe",
        value: function subscribe(observer) {
          var _this = this;
          this._numberOfSubscribers += 1;
          var currentTime = this._performance.now();
          if (this._numberOfSubscribers === 1) {
            this._start(currentTime);
          }
          // tslint:disable-next-line:deprecation
          var subscription = rxjs.merge(rxjs.of({
            end: this._nextTick + INTERVAL,
            start: currentTime
          }), this._subject).subscribe(observer);
          var unsubscribe = function unsubscribe() {
            _this._numberOfSubscribers -= 1;
            if (_this._numberOfSubscribers === 0) {
              _this._stop();
            }
            return subscription.unsubscribe();
          };
          return {
            unsubscribe: unsubscribe
          };
        }
      }, {
        key: "_start",
        value: function _start(currentTime) {
          var _this2 = this;
          this._nextTick = currentTime + INTERVAL;
          this._intervalId = this._setInterval(function () {
            if (_this2._performance.now() >= _this2._nextTick) {
              _this2._nextTick += INTERVAL;
              _this2._subject.next({
                end: _this2._nextTick + INTERVAL,
                start: _this2._nextTick
              });
            }
          }, INTERVAL / 10);
        }
      }, {
        key: "_stop",
        value: function _stop() {
          if (this._intervalId !== null) {
            this._clearInterval(this._intervalId);
          }
          this._intervalId = null;
        }
      }]);
      return Scheduler;
    }();

    var scheduler = new Scheduler(workerTimers.clearInterval, performance, workerTimers.setInterval);
    var createMidiPlayer = createMidiPlayerFactory(createMidiFileSlicer, scheduler);
    var create = function create(options) {
      return createMidiPlayer(options);
    };

    exports.create = create;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"@babel/runtime/helpers/classCallCheck":6,"@babel/runtime/helpers/createClass":7,"@babel/runtime/helpers/defineProperty":8,"json-midi-message-encoder":18,"midi-file-slicer":19,"rxjs":23,"worker-timers":247}],23:[function(require,module,exports){
"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.interval = exports.iif = exports.generate = exports.fromEventPattern = exports.fromEvent = exports.from = exports.forkJoin = exports.empty = exports.defer = exports.connectable = exports.concat = exports.combineLatest = exports.bindNodeCallback = exports.bindCallback = exports.UnsubscriptionError = exports.TimeoutError = exports.SequenceError = exports.ObjectUnsubscribedError = exports.NotFoundError = exports.EmptyError = exports.ArgumentOutOfRangeError = exports.firstValueFrom = exports.lastValueFrom = exports.isObservable = exports.identity = exports.noop = exports.pipe = exports.NotificationKind = exports.Notification = exports.Subscriber = exports.Subscription = exports.Scheduler = exports.VirtualAction = exports.VirtualTimeScheduler = exports.animationFrameScheduler = exports.animationFrame = exports.queueScheduler = exports.queue = exports.asyncScheduler = exports.async = exports.asapScheduler = exports.asap = exports.AsyncSubject = exports.ReplaySubject = exports.BehaviorSubject = exports.Subject = exports.animationFrames = exports.observable = exports.ConnectableObservable = exports.Observable = void 0;
exports.filter = exports.expand = exports.exhaustMap = exports.exhaustAll = exports.exhaust = exports.every = exports.endWith = exports.elementAt = exports.distinctUntilKeyChanged = exports.distinctUntilChanged = exports.distinct = exports.dematerialize = exports.delayWhen = exports.delay = exports.defaultIfEmpty = exports.debounceTime = exports.debounce = exports.count = exports.connect = exports.concatWith = exports.concatMapTo = exports.concatMap = exports.concatAll = exports.combineLatestWith = exports.combineLatestAll = exports.combineAll = exports.catchError = exports.bufferWhen = exports.bufferToggle = exports.bufferTime = exports.bufferCount = exports.buffer = exports.auditTime = exports.audit = exports.config = exports.NEVER = exports.EMPTY = exports.scheduled = exports.zip = exports.using = exports.timer = exports.throwError = exports.range = exports.race = exports.partition = exports.pairs = exports.onErrorResumeNext = exports.of = exports.never = exports.merge = void 0;
exports.switchMapTo = exports.switchMap = exports.switchAll = exports.subscribeOn = exports.startWith = exports.skipWhile = exports.skipUntil = exports.skipLast = exports.skip = exports.single = exports.shareReplay = exports.share = exports.sequenceEqual = exports.scan = exports.sampleTime = exports.sample = exports.refCount = exports.retryWhen = exports.retry = exports.repeatWhen = exports.repeat = exports.reduce = exports.raceWith = exports.publishReplay = exports.publishLast = exports.publishBehavior = exports.publish = exports.pluck = exports.pairwise = exports.observeOn = exports.multicast = exports.min = exports.mergeWith = exports.mergeScan = exports.mergeMapTo = exports.mergeMap = exports.flatMap = exports.mergeAll = exports.max = exports.materialize = exports.mapTo = exports.map = exports.last = exports.isEmpty = exports.ignoreElements = exports.groupBy = exports.first = exports.findIndex = exports.find = exports.finalize = void 0;
exports.zipWith = exports.zipAll = exports.withLatestFrom = exports.windowWhen = exports.windowToggle = exports.windowTime = exports.windowCount = exports.window = exports.toArray = exports.timestamp = exports.timeoutWith = exports.timeout = exports.timeInterval = exports.throwIfEmpty = exports.throttleTime = exports.throttle = exports.tap = exports.takeWhile = exports.takeUntil = exports.takeLast = exports.take = exports.switchScan = void 0;
var Observable_1 = require("./internal/Observable");
Object.defineProperty(exports, "Observable", { enumerable: true, get: function () { return Observable_1.Observable; } });
var ConnectableObservable_1 = require("./internal/observable/ConnectableObservable");
Object.defineProperty(exports, "ConnectableObservable", { enumerable: true, get: function () { return ConnectableObservable_1.ConnectableObservable; } });
var observable_1 = require("./internal/symbol/observable");
Object.defineProperty(exports, "observable", { enumerable: true, get: function () { return observable_1.observable; } });
var animationFrames_1 = require("./internal/observable/dom/animationFrames");
Object.defineProperty(exports, "animationFrames", { enumerable: true, get: function () { return animationFrames_1.animationFrames; } });
var Subject_1 = require("./internal/Subject");
Object.defineProperty(exports, "Subject", { enumerable: true, get: function () { return Subject_1.Subject; } });
var BehaviorSubject_1 = require("./internal/BehaviorSubject");
Object.defineProperty(exports, "BehaviorSubject", { enumerable: true, get: function () { return BehaviorSubject_1.BehaviorSubject; } });
var ReplaySubject_1 = require("./internal/ReplaySubject");
Object.defineProperty(exports, "ReplaySubject", { enumerable: true, get: function () { return ReplaySubject_1.ReplaySubject; } });
var AsyncSubject_1 = require("./internal/AsyncSubject");
Object.defineProperty(exports, "AsyncSubject", { enumerable: true, get: function () { return AsyncSubject_1.AsyncSubject; } });
var asap_1 = require("./internal/scheduler/asap");
Object.defineProperty(exports, "asap", { enumerable: true, get: function () { return asap_1.asap; } });
Object.defineProperty(exports, "asapScheduler", { enumerable: true, get: function () { return asap_1.asapScheduler; } });
var async_1 = require("./internal/scheduler/async");
Object.defineProperty(exports, "async", { enumerable: true, get: function () { return async_1.async; } });
Object.defineProperty(exports, "asyncScheduler", { enumerable: true, get: function () { return async_1.asyncScheduler; } });
var queue_1 = require("./internal/scheduler/queue");
Object.defineProperty(exports, "queue", { enumerable: true, get: function () { return queue_1.queue; } });
Object.defineProperty(exports, "queueScheduler", { enumerable: true, get: function () { return queue_1.queueScheduler; } });
var animationFrame_1 = require("./internal/scheduler/animationFrame");
Object.defineProperty(exports, "animationFrame", { enumerable: true, get: function () { return animationFrame_1.animationFrame; } });
Object.defineProperty(exports, "animationFrameScheduler", { enumerable: true, get: function () { return animationFrame_1.animationFrameScheduler; } });
var VirtualTimeScheduler_1 = require("./internal/scheduler/VirtualTimeScheduler");
Object.defineProperty(exports, "VirtualTimeScheduler", { enumerable: true, get: function () { return VirtualTimeScheduler_1.VirtualTimeScheduler; } });
Object.defineProperty(exports, "VirtualAction", { enumerable: true, get: function () { return VirtualTimeScheduler_1.VirtualAction; } });
var Scheduler_1 = require("./internal/Scheduler");
Object.defineProperty(exports, "Scheduler", { enumerable: true, get: function () { return Scheduler_1.Scheduler; } });
var Subscription_1 = require("./internal/Subscription");
Object.defineProperty(exports, "Subscription", { enumerable: true, get: function () { return Subscription_1.Subscription; } });
var Subscriber_1 = require("./internal/Subscriber");
Object.defineProperty(exports, "Subscriber", { enumerable: true, get: function () { return Subscriber_1.Subscriber; } });
var Notification_1 = require("./internal/Notification");
Object.defineProperty(exports, "Notification", { enumerable: true, get: function () { return Notification_1.Notification; } });
Object.defineProperty(exports, "NotificationKind", { enumerable: true, get: function () { return Notification_1.NotificationKind; } });
var pipe_1 = require("./internal/util/pipe");
Object.defineProperty(exports, "pipe", { enumerable: true, get: function () { return pipe_1.pipe; } });
var noop_1 = require("./internal/util/noop");
Object.defineProperty(exports, "noop", { enumerable: true, get: function () { return noop_1.noop; } });
var identity_1 = require("./internal/util/identity");
Object.defineProperty(exports, "identity", { enumerable: true, get: function () { return identity_1.identity; } });
var isObservable_1 = require("./internal/util/isObservable");
Object.defineProperty(exports, "isObservable", { enumerable: true, get: function () { return isObservable_1.isObservable; } });
var lastValueFrom_1 = require("./internal/lastValueFrom");
Object.defineProperty(exports, "lastValueFrom", { enumerable: true, get: function () { return lastValueFrom_1.lastValueFrom; } });
var firstValueFrom_1 = require("./internal/firstValueFrom");
Object.defineProperty(exports, "firstValueFrom", { enumerable: true, get: function () { return firstValueFrom_1.firstValueFrom; } });
var ArgumentOutOfRangeError_1 = require("./internal/util/ArgumentOutOfRangeError");
Object.defineProperty(exports, "ArgumentOutOfRangeError", { enumerable: true, get: function () { return ArgumentOutOfRangeError_1.ArgumentOutOfRangeError; } });
var EmptyError_1 = require("./internal/util/EmptyError");
Object.defineProperty(exports, "EmptyError", { enumerable: true, get: function () { return EmptyError_1.EmptyError; } });
var NotFoundError_1 = require("./internal/util/NotFoundError");
Object.defineProperty(exports, "NotFoundError", { enumerable: true, get: function () { return NotFoundError_1.NotFoundError; } });
var ObjectUnsubscribedError_1 = require("./internal/util/ObjectUnsubscribedError");
Object.defineProperty(exports, "ObjectUnsubscribedError", { enumerable: true, get: function () { return ObjectUnsubscribedError_1.ObjectUnsubscribedError; } });
var SequenceError_1 = require("./internal/util/SequenceError");
Object.defineProperty(exports, "SequenceError", { enumerable: true, get: function () { return SequenceError_1.SequenceError; } });
var timeout_1 = require("./internal/operators/timeout");
Object.defineProperty(exports, "TimeoutError", { enumerable: true, get: function () { return timeout_1.TimeoutError; } });
var UnsubscriptionError_1 = require("./internal/util/UnsubscriptionError");
Object.defineProperty(exports, "UnsubscriptionError", { enumerable: true, get: function () { return UnsubscriptionError_1.UnsubscriptionError; } });
var bindCallback_1 = require("./internal/observable/bindCallback");
Object.defineProperty(exports, "bindCallback", { enumerable: true, get: function () { return bindCallback_1.bindCallback; } });
var bindNodeCallback_1 = require("./internal/observable/bindNodeCallback");
Object.defineProperty(exports, "bindNodeCallback", { enumerable: true, get: function () { return bindNodeCallback_1.bindNodeCallback; } });
var combineLatest_1 = require("./internal/observable/combineLatest");
Object.defineProperty(exports, "combineLatest", { enumerable: true, get: function () { return combineLatest_1.combineLatest; } });
var concat_1 = require("./internal/observable/concat");
Object.defineProperty(exports, "concat", { enumerable: true, get: function () { return concat_1.concat; } });
var connectable_1 = require("./internal/observable/connectable");
Object.defineProperty(exports, "connectable", { enumerable: true, get: function () { return connectable_1.connectable; } });
var defer_1 = require("./internal/observable/defer");
Object.defineProperty(exports, "defer", { enumerable: true, get: function () { return defer_1.defer; } });
var empty_1 = require("./internal/observable/empty");
Object.defineProperty(exports, "empty", { enumerable: true, get: function () { return empty_1.empty; } });
var forkJoin_1 = require("./internal/observable/forkJoin");
Object.defineProperty(exports, "forkJoin", { enumerable: true, get: function () { return forkJoin_1.forkJoin; } });
var from_1 = require("./internal/observable/from");
Object.defineProperty(exports, "from", { enumerable: true, get: function () { return from_1.from; } });
var fromEvent_1 = require("./internal/observable/fromEvent");
Object.defineProperty(exports, "fromEvent", { enumerable: true, get: function () { return fromEvent_1.fromEvent; } });
var fromEventPattern_1 = require("./internal/observable/fromEventPattern");
Object.defineProperty(exports, "fromEventPattern", { enumerable: true, get: function () { return fromEventPattern_1.fromEventPattern; } });
var generate_1 = require("./internal/observable/generate");
Object.defineProperty(exports, "generate", { enumerable: true, get: function () { return generate_1.generate; } });
var iif_1 = require("./internal/observable/iif");
Object.defineProperty(exports, "iif", { enumerable: true, get: function () { return iif_1.iif; } });
var interval_1 = require("./internal/observable/interval");
Object.defineProperty(exports, "interval", { enumerable: true, get: function () { return interval_1.interval; } });
var merge_1 = require("./internal/observable/merge");
Object.defineProperty(exports, "merge", { enumerable: true, get: function () { return merge_1.merge; } });
var never_1 = require("./internal/observable/never");
Object.defineProperty(exports, "never", { enumerable: true, get: function () { return never_1.never; } });
var of_1 = require("./internal/observable/of");
Object.defineProperty(exports, "of", { enumerable: true, get: function () { return of_1.of; } });
var onErrorResumeNext_1 = require("./internal/observable/onErrorResumeNext");
Object.defineProperty(exports, "onErrorResumeNext", { enumerable: true, get: function () { return onErrorResumeNext_1.onErrorResumeNext; } });
var pairs_1 = require("./internal/observable/pairs");
Object.defineProperty(exports, "pairs", { enumerable: true, get: function () { return pairs_1.pairs; } });
var partition_1 = require("./internal/observable/partition");
Object.defineProperty(exports, "partition", { enumerable: true, get: function () { return partition_1.partition; } });
var race_1 = require("./internal/observable/race");
Object.defineProperty(exports, "race", { enumerable: true, get: function () { return race_1.race; } });
var range_1 = require("./internal/observable/range");
Object.defineProperty(exports, "range", { enumerable: true, get: function () { return range_1.range; } });
var throwError_1 = require("./internal/observable/throwError");
Object.defineProperty(exports, "throwError", { enumerable: true, get: function () { return throwError_1.throwError; } });
var timer_1 = require("./internal/observable/timer");
Object.defineProperty(exports, "timer", { enumerable: true, get: function () { return timer_1.timer; } });
var using_1 = require("./internal/observable/using");
Object.defineProperty(exports, "using", { enumerable: true, get: function () { return using_1.using; } });
var zip_1 = require("./internal/observable/zip");
Object.defineProperty(exports, "zip", { enumerable: true, get: function () { return zip_1.zip; } });
var scheduled_1 = require("./internal/scheduled/scheduled");
Object.defineProperty(exports, "scheduled", { enumerable: true, get: function () { return scheduled_1.scheduled; } });
var empty_2 = require("./internal/observable/empty");
Object.defineProperty(exports, "EMPTY", { enumerable: true, get: function () { return empty_2.EMPTY; } });
var never_2 = require("./internal/observable/never");
Object.defineProperty(exports, "NEVER", { enumerable: true, get: function () { return never_2.NEVER; } });
__exportStar(require("./internal/types"), exports);
var config_1 = require("./internal/config");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return config_1.config; } });
var audit_1 = require("./internal/operators/audit");
Object.defineProperty(exports, "audit", { enumerable: true, get: function () { return audit_1.audit; } });
var auditTime_1 = require("./internal/operators/auditTime");
Object.defineProperty(exports, "auditTime", { enumerable: true, get: function () { return auditTime_1.auditTime; } });
var buffer_1 = require("./internal/operators/buffer");
Object.defineProperty(exports, "buffer", { enumerable: true, get: function () { return buffer_1.buffer; } });
var bufferCount_1 = require("./internal/operators/bufferCount");
Object.defineProperty(exports, "bufferCount", { enumerable: true, get: function () { return bufferCount_1.bufferCount; } });
var bufferTime_1 = require("./internal/operators/bufferTime");
Object.defineProperty(exports, "bufferTime", { enumerable: true, get: function () { return bufferTime_1.bufferTime; } });
var bufferToggle_1 = require("./internal/operators/bufferToggle");
Object.defineProperty(exports, "bufferToggle", { enumerable: true, get: function () { return bufferToggle_1.bufferToggle; } });
var bufferWhen_1 = require("./internal/operators/bufferWhen");
Object.defineProperty(exports, "bufferWhen", { enumerable: true, get: function () { return bufferWhen_1.bufferWhen; } });
var catchError_1 = require("./internal/operators/catchError");
Object.defineProperty(exports, "catchError", { enumerable: true, get: function () { return catchError_1.catchError; } });
var combineAll_1 = require("./internal/operators/combineAll");
Object.defineProperty(exports, "combineAll", { enumerable: true, get: function () { return combineAll_1.combineAll; } });
var combineLatestAll_1 = require("./internal/operators/combineLatestAll");
Object.defineProperty(exports, "combineLatestAll", { enumerable: true, get: function () { return combineLatestAll_1.combineLatestAll; } });
var combineLatestWith_1 = require("./internal/operators/combineLatestWith");
Object.defineProperty(exports, "combineLatestWith", { enumerable: true, get: function () { return combineLatestWith_1.combineLatestWith; } });
var concatAll_1 = require("./internal/operators/concatAll");
Object.defineProperty(exports, "concatAll", { enumerable: true, get: function () { return concatAll_1.concatAll; } });
var concatMap_1 = require("./internal/operators/concatMap");
Object.defineProperty(exports, "concatMap", { enumerable: true, get: function () { return concatMap_1.concatMap; } });
var concatMapTo_1 = require("./internal/operators/concatMapTo");
Object.defineProperty(exports, "concatMapTo", { enumerable: true, get: function () { return concatMapTo_1.concatMapTo; } });
var concatWith_1 = require("./internal/operators/concatWith");
Object.defineProperty(exports, "concatWith", { enumerable: true, get: function () { return concatWith_1.concatWith; } });
var connect_1 = require("./internal/operators/connect");
Object.defineProperty(exports, "connect", { enumerable: true, get: function () { return connect_1.connect; } });
var count_1 = require("./internal/operators/count");
Object.defineProperty(exports, "count", { enumerable: true, get: function () { return count_1.count; } });
var debounce_1 = require("./internal/operators/debounce");
Object.defineProperty(exports, "debounce", { enumerable: true, get: function () { return debounce_1.debounce; } });
var debounceTime_1 = require("./internal/operators/debounceTime");
Object.defineProperty(exports, "debounceTime", { enumerable: true, get: function () { return debounceTime_1.debounceTime; } });
var defaultIfEmpty_1 = require("./internal/operators/defaultIfEmpty");
Object.defineProperty(exports, "defaultIfEmpty", { enumerable: true, get: function () { return defaultIfEmpty_1.defaultIfEmpty; } });
var delay_1 = require("./internal/operators/delay");
Object.defineProperty(exports, "delay", { enumerable: true, get: function () { return delay_1.delay; } });
var delayWhen_1 = require("./internal/operators/delayWhen");
Object.defineProperty(exports, "delayWhen", { enumerable: true, get: function () { return delayWhen_1.delayWhen; } });
var dematerialize_1 = require("./internal/operators/dematerialize");
Object.defineProperty(exports, "dematerialize", { enumerable: true, get: function () { return dematerialize_1.dematerialize; } });
var distinct_1 = require("./internal/operators/distinct");
Object.defineProperty(exports, "distinct", { enumerable: true, get: function () { return distinct_1.distinct; } });
var distinctUntilChanged_1 = require("./internal/operators/distinctUntilChanged");
Object.defineProperty(exports, "distinctUntilChanged", { enumerable: true, get: function () { return distinctUntilChanged_1.distinctUntilChanged; } });
var distinctUntilKeyChanged_1 = require("./internal/operators/distinctUntilKeyChanged");
Object.defineProperty(exports, "distinctUntilKeyChanged", { enumerable: true, get: function () { return distinctUntilKeyChanged_1.distinctUntilKeyChanged; } });
var elementAt_1 = require("./internal/operators/elementAt");
Object.defineProperty(exports, "elementAt", { enumerable: true, get: function () { return elementAt_1.elementAt; } });
var endWith_1 = require("./internal/operators/endWith");
Object.defineProperty(exports, "endWith", { enumerable: true, get: function () { return endWith_1.endWith; } });
var every_1 = require("./internal/operators/every");
Object.defineProperty(exports, "every", { enumerable: true, get: function () { return every_1.every; } });
var exhaust_1 = require("./internal/operators/exhaust");
Object.defineProperty(exports, "exhaust", { enumerable: true, get: function () { return exhaust_1.exhaust; } });
var exhaustAll_1 = require("./internal/operators/exhaustAll");
Object.defineProperty(exports, "exhaustAll", { enumerable: true, get: function () { return exhaustAll_1.exhaustAll; } });
var exhaustMap_1 = require("./internal/operators/exhaustMap");
Object.defineProperty(exports, "exhaustMap", { enumerable: true, get: function () { return exhaustMap_1.exhaustMap; } });
var expand_1 = require("./internal/operators/expand");
Object.defineProperty(exports, "expand", { enumerable: true, get: function () { return expand_1.expand; } });
var filter_1 = require("./internal/operators/filter");
Object.defineProperty(exports, "filter", { enumerable: true, get: function () { return filter_1.filter; } });
var finalize_1 = require("./internal/operators/finalize");
Object.defineProperty(exports, "finalize", { enumerable: true, get: function () { return finalize_1.finalize; } });
var find_1 = require("./internal/operators/find");
Object.defineProperty(exports, "find", { enumerable: true, get: function () { return find_1.find; } });
var findIndex_1 = require("./internal/operators/findIndex");
Object.defineProperty(exports, "findIndex", { enumerable: true, get: function () { return findIndex_1.findIndex; } });
var first_1 = require("./internal/operators/first");
Object.defineProperty(exports, "first", { enumerable: true, get: function () { return first_1.first; } });
var groupBy_1 = require("./internal/operators/groupBy");
Object.defineProperty(exports, "groupBy", { enumerable: true, get: function () { return groupBy_1.groupBy; } });
var ignoreElements_1 = require("./internal/operators/ignoreElements");
Object.defineProperty(exports, "ignoreElements", { enumerable: true, get: function () { return ignoreElements_1.ignoreElements; } });
var isEmpty_1 = require("./internal/operators/isEmpty");
Object.defineProperty(exports, "isEmpty", { enumerable: true, get: function () { return isEmpty_1.isEmpty; } });
var last_1 = require("./internal/operators/last");
Object.defineProperty(exports, "last", { enumerable: true, get: function () { return last_1.last; } });
var map_1 = require("./internal/operators/map");
Object.defineProperty(exports, "map", { enumerable: true, get: function () { return map_1.map; } });
var mapTo_1 = require("./internal/operators/mapTo");
Object.defineProperty(exports, "mapTo", { enumerable: true, get: function () { return mapTo_1.mapTo; } });
var materialize_1 = require("./internal/operators/materialize");
Object.defineProperty(exports, "materialize", { enumerable: true, get: function () { return materialize_1.materialize; } });
var max_1 = require("./internal/operators/max");
Object.defineProperty(exports, "max", { enumerable: true, get: function () { return max_1.max; } });
var mergeAll_1 = require("./internal/operators/mergeAll");
Object.defineProperty(exports, "mergeAll", { enumerable: true, get: function () { return mergeAll_1.mergeAll; } });
var flatMap_1 = require("./internal/operators/flatMap");
Object.defineProperty(exports, "flatMap", { enumerable: true, get: function () { return flatMap_1.flatMap; } });
var mergeMap_1 = require("./internal/operators/mergeMap");
Object.defineProperty(exports, "mergeMap", { enumerable: true, get: function () { return mergeMap_1.mergeMap; } });
var mergeMapTo_1 = require("./internal/operators/mergeMapTo");
Object.defineProperty(exports, "mergeMapTo", { enumerable: true, get: function () { return mergeMapTo_1.mergeMapTo; } });
var mergeScan_1 = require("./internal/operators/mergeScan");
Object.defineProperty(exports, "mergeScan", { enumerable: true, get: function () { return mergeScan_1.mergeScan; } });
var mergeWith_1 = require("./internal/operators/mergeWith");
Object.defineProperty(exports, "mergeWith", { enumerable: true, get: function () { return mergeWith_1.mergeWith; } });
var min_1 = require("./internal/operators/min");
Object.defineProperty(exports, "min", { enumerable: true, get: function () { return min_1.min; } });
var multicast_1 = require("./internal/operators/multicast");
Object.defineProperty(exports, "multicast", { enumerable: true, get: function () { return multicast_1.multicast; } });
var observeOn_1 = require("./internal/operators/observeOn");
Object.defineProperty(exports, "observeOn", { enumerable: true, get: function () { return observeOn_1.observeOn; } });
var pairwise_1 = require("./internal/operators/pairwise");
Object.defineProperty(exports, "pairwise", { enumerable: true, get: function () { return pairwise_1.pairwise; } });
var pluck_1 = require("./internal/operators/pluck");
Object.defineProperty(exports, "pluck", { enumerable: true, get: function () { return pluck_1.pluck; } });
var publish_1 = require("./internal/operators/publish");
Object.defineProperty(exports, "publish", { enumerable: true, get: function () { return publish_1.publish; } });
var publishBehavior_1 = require("./internal/operators/publishBehavior");
Object.defineProperty(exports, "publishBehavior", { enumerable: true, get: function () { return publishBehavior_1.publishBehavior; } });
var publishLast_1 = require("./internal/operators/publishLast");
Object.defineProperty(exports, "publishLast", { enumerable: true, get: function () { return publishLast_1.publishLast; } });
var publishReplay_1 = require("./internal/operators/publishReplay");
Object.defineProperty(exports, "publishReplay", { enumerable: true, get: function () { return publishReplay_1.publishReplay; } });
var raceWith_1 = require("./internal/operators/raceWith");
Object.defineProperty(exports, "raceWith", { enumerable: true, get: function () { return raceWith_1.raceWith; } });
var reduce_1 = require("./internal/operators/reduce");
Object.defineProperty(exports, "reduce", { enumerable: true, get: function () { return reduce_1.reduce; } });
var repeat_1 = require("./internal/operators/repeat");
Object.defineProperty(exports, "repeat", { enumerable: true, get: function () { return repeat_1.repeat; } });
var repeatWhen_1 = require("./internal/operators/repeatWhen");
Object.defineProperty(exports, "repeatWhen", { enumerable: true, get: function () { return repeatWhen_1.repeatWhen; } });
var retry_1 = require("./internal/operators/retry");
Object.defineProperty(exports, "retry", { enumerable: true, get: function () { return retry_1.retry; } });
var retryWhen_1 = require("./internal/operators/retryWhen");
Object.defineProperty(exports, "retryWhen", { enumerable: true, get: function () { return retryWhen_1.retryWhen; } });
var refCount_1 = require("./internal/operators/refCount");
Object.defineProperty(exports, "refCount", { enumerable: true, get: function () { return refCount_1.refCount; } });
var sample_1 = require("./internal/operators/sample");
Object.defineProperty(exports, "sample", { enumerable: true, get: function () { return sample_1.sample; } });
var sampleTime_1 = require("./internal/operators/sampleTime");
Object.defineProperty(exports, "sampleTime", { enumerable: true, get: function () { return sampleTime_1.sampleTime; } });
var scan_1 = require("./internal/operators/scan");
Object.defineProperty(exports, "scan", { enumerable: true, get: function () { return scan_1.scan; } });
var sequenceEqual_1 = require("./internal/operators/sequenceEqual");
Object.defineProperty(exports, "sequenceEqual", { enumerable: true, get: function () { return sequenceEqual_1.sequenceEqual; } });
var share_1 = require("./internal/operators/share");
Object.defineProperty(exports, "share", { enumerable: true, get: function () { return share_1.share; } });
var shareReplay_1 = require("./internal/operators/shareReplay");
Object.defineProperty(exports, "shareReplay", { enumerable: true, get: function () { return shareReplay_1.shareReplay; } });
var single_1 = require("./internal/operators/single");
Object.defineProperty(exports, "single", { enumerable: true, get: function () { return single_1.single; } });
var skip_1 = require("./internal/operators/skip");
Object.defineProperty(exports, "skip", { enumerable: true, get: function () { return skip_1.skip; } });
var skipLast_1 = require("./internal/operators/skipLast");
Object.defineProperty(exports, "skipLast", { enumerable: true, get: function () { return skipLast_1.skipLast; } });
var skipUntil_1 = require("./internal/operators/skipUntil");
Object.defineProperty(exports, "skipUntil", { enumerable: true, get: function () { return skipUntil_1.skipUntil; } });
var skipWhile_1 = require("./internal/operators/skipWhile");
Object.defineProperty(exports, "skipWhile", { enumerable: true, get: function () { return skipWhile_1.skipWhile; } });
var startWith_1 = require("./internal/operators/startWith");
Object.defineProperty(exports, "startWith", { enumerable: true, get: function () { return startWith_1.startWith; } });
var subscribeOn_1 = require("./internal/operators/subscribeOn");
Object.defineProperty(exports, "subscribeOn", { enumerable: true, get: function () { return subscribeOn_1.subscribeOn; } });
var switchAll_1 = require("./internal/operators/switchAll");
Object.defineProperty(exports, "switchAll", { enumerable: true, get: function () { return switchAll_1.switchAll; } });
var switchMap_1 = require("./internal/operators/switchMap");
Object.defineProperty(exports, "switchMap", { enumerable: true, get: function () { return switchMap_1.switchMap; } });
var switchMapTo_1 = require("./internal/operators/switchMapTo");
Object.defineProperty(exports, "switchMapTo", { enumerable: true, get: function () { return switchMapTo_1.switchMapTo; } });
var switchScan_1 = require("./internal/operators/switchScan");
Object.defineProperty(exports, "switchScan", { enumerable: true, get: function () { return switchScan_1.switchScan; } });
var take_1 = require("./internal/operators/take");
Object.defineProperty(exports, "take", { enumerable: true, get: function () { return take_1.take; } });
var takeLast_1 = require("./internal/operators/takeLast");
Object.defineProperty(exports, "takeLast", { enumerable: true, get: function () { return takeLast_1.takeLast; } });
var takeUntil_1 = require("./internal/operators/takeUntil");
Object.defineProperty(exports, "takeUntil", { enumerable: true, get: function () { return takeUntil_1.takeUntil; } });
var takeWhile_1 = require("./internal/operators/takeWhile");
Object.defineProperty(exports, "takeWhile", { enumerable: true, get: function () { return takeWhile_1.takeWhile; } });
var tap_1 = require("./internal/operators/tap");
Object.defineProperty(exports, "tap", { enumerable: true, get: function () { return tap_1.tap; } });
var throttle_1 = require("./internal/operators/throttle");
Object.defineProperty(exports, "throttle", { enumerable: true, get: function () { return throttle_1.throttle; } });
var throttleTime_1 = require("./internal/operators/throttleTime");
Object.defineProperty(exports, "throttleTime", { enumerable: true, get: function () { return throttleTime_1.throttleTime; } });
var throwIfEmpty_1 = require("./internal/operators/throwIfEmpty");
Object.defineProperty(exports, "throwIfEmpty", { enumerable: true, get: function () { return throwIfEmpty_1.throwIfEmpty; } });
var timeInterval_1 = require("./internal/operators/timeInterval");
Object.defineProperty(exports, "timeInterval", { enumerable: true, get: function () { return timeInterval_1.timeInterval; } });
var timeout_2 = require("./internal/operators/timeout");
Object.defineProperty(exports, "timeout", { enumerable: true, get: function () { return timeout_2.timeout; } });
var timeoutWith_1 = require("./internal/operators/timeoutWith");
Object.defineProperty(exports, "timeoutWith", { enumerable: true, get: function () { return timeoutWith_1.timeoutWith; } });
var timestamp_1 = require("./internal/operators/timestamp");
Object.defineProperty(exports, "timestamp", { enumerable: true, get: function () { return timestamp_1.timestamp; } });
var toArray_1 = require("./internal/operators/toArray");
Object.defineProperty(exports, "toArray", { enumerable: true, get: function () { return toArray_1.toArray; } });
var window_1 = require("./internal/operators/window");
Object.defineProperty(exports, "window", { enumerable: true, get: function () { return window_1.window; } });
var windowCount_1 = require("./internal/operators/windowCount");
Object.defineProperty(exports, "windowCount", { enumerable: true, get: function () { return windowCount_1.windowCount; } });
var windowTime_1 = require("./internal/operators/windowTime");
Object.defineProperty(exports, "windowTime", { enumerable: true, get: function () { return windowTime_1.windowTime; } });
var windowToggle_1 = require("./internal/operators/windowToggle");
Object.defineProperty(exports, "windowToggle", { enumerable: true, get: function () { return windowToggle_1.windowToggle; } });
var windowWhen_1 = require("./internal/operators/windowWhen");
Object.defineProperty(exports, "windowWhen", { enumerable: true, get: function () { return windowWhen_1.windowWhen; } });
var withLatestFrom_1 = require("./internal/operators/withLatestFrom");
Object.defineProperty(exports, "withLatestFrom", { enumerable: true, get: function () { return withLatestFrom_1.withLatestFrom; } });
var zipAll_1 = require("./internal/operators/zipAll");
Object.defineProperty(exports, "zipAll", { enumerable: true, get: function () { return zipAll_1.zipAll; } });
var zipWith_1 = require("./internal/operators/zipWith");
Object.defineProperty(exports, "zipWith", { enumerable: true, get: function () { return zipWith_1.zipWith; } });

},{"./internal/AsyncSubject":24,"./internal/BehaviorSubject":25,"./internal/Notification":26,"./internal/Observable":28,"./internal/ReplaySubject":29,"./internal/Scheduler":30,"./internal/Subject":31,"./internal/Subscriber":32,"./internal/Subscription":33,"./internal/config":34,"./internal/firstValueFrom":35,"./internal/lastValueFrom":36,"./internal/observable/ConnectableObservable":37,"./internal/observable/bindCallback":38,"./internal/observable/bindNodeCallback":40,"./internal/observable/combineLatest":41,"./internal/observable/concat":42,"./internal/observable/connectable":43,"./internal/observable/defer":44,"./internal/observable/dom/animationFrames":45,"./internal/observable/empty":46,"./internal/observable/forkJoin":47,"./internal/observable/from":48,"./internal/observable/fromEvent":49,"./internal/observable/fromEventPattern":50,"./internal/observable/generate":52,"./internal/observable/iif":53,"./internal/observable/interval":55,"./internal/observable/merge":56,"./internal/observable/never":57,"./internal/observable/of":58,"./internal/observable/onErrorResumeNext":59,"./internal/observable/pairs":60,"./internal/observable/partition":61,"./internal/observable/race":62,"./internal/observable/range":63,"./internal/observable/throwError":64,"./internal/observable/timer":65,"./internal/observable/using":66,"./internal/observable/zip":67,"./internal/operators/audit":69,"./internal/operators/auditTime":70,"./internal/operators/buffer":71,"./internal/operators/bufferCount":72,"./internal/operators/bufferTime":73,"./internal/operators/bufferToggle":74,"./internal/operators/bufferWhen":75,"./internal/operators/catchError":76,"./internal/operators/combineAll":77,"./internal/operators/combineLatestAll":79,"./internal/operators/combineLatestWith":80,"./internal/operators/concatAll":82,"./internal/operators/concatMap":83,"./internal/operators/concatMapTo":84,"./internal/operators/concatWith":85,"./internal/operators/connect":86,"./internal/operators/count":87,"./internal/operators/debounce":88,"./internal/operators/debounceTime":89,"./internal/operators/defaultIfEmpty":90,"./internal/operators/delay":91,"./internal/operators/delayWhen":92,"./internal/operators/dematerialize":93,"./internal/operators/distinct":94,"./internal/operators/distinctUntilChanged":95,"./internal/operators/distinctUntilKeyChanged":96,"./internal/operators/elementAt":97,"./internal/operators/endWith":98,"./internal/operators/every":99,"./internal/operators/exhaust":100,"./internal/operators/exhaustAll":101,"./internal/operators/exhaustMap":102,"./internal/operators/expand":103,"./internal/operators/filter":104,"./internal/operators/finalize":105,"./internal/operators/find":106,"./internal/operators/findIndex":107,"./internal/operators/first":108,"./internal/operators/flatMap":109,"./internal/operators/groupBy":110,"./internal/operators/ignoreElements":111,"./internal/operators/isEmpty":112,"./internal/operators/last":114,"./internal/operators/map":115,"./internal/operators/mapTo":116,"./internal/operators/materialize":117,"./internal/operators/max":118,"./internal/operators/mergeAll":120,"./internal/operators/mergeMap":122,"./internal/operators/mergeMapTo":123,"./internal/operators/mergeScan":124,"./internal/operators/mergeWith":125,"./internal/operators/min":126,"./internal/operators/multicast":127,"./internal/operators/observeOn":128,"./internal/operators/pairwise":130,"./internal/operators/pluck":131,"./internal/operators/publish":132,"./internal/operators/publishBehavior":133,"./internal/operators/publishLast":134,"./internal/operators/publishReplay":135,"./internal/operators/raceWith":136,"./internal/operators/reduce":137,"./internal/operators/refCount":138,"./internal/operators/repeat":139,"./internal/operators/repeatWhen":140,"./internal/operators/retry":141,"./internal/operators/retryWhen":142,"./internal/operators/sample":143,"./internal/operators/sampleTime":144,"./internal/operators/scan":145,"./internal/operators/sequenceEqual":147,"./internal/operators/share":148,"./internal/operators/shareReplay":149,"./internal/operators/single":150,"./internal/operators/skip":151,"./internal/operators/skipLast":152,"./internal/operators/skipUntil":153,"./internal/operators/skipWhile":154,"./internal/operators/startWith":155,"./internal/operators/subscribeOn":156,"./internal/operators/switchAll":157,"./internal/operators/switchMap":158,"./internal/operators/switchMapTo":159,"./internal/operators/switchScan":160,"./internal/operators/take":161,"./internal/operators/takeLast":162,"./internal/operators/takeUntil":163,"./internal/operators/takeWhile":164,"./internal/operators/tap":165,"./internal/operators/throttle":166,"./internal/operators/throttleTime":167,"./internal/operators/throwIfEmpty":168,"./internal/operators/timeInterval":169,"./internal/operators/timeout":170,"./internal/operators/timeoutWith":171,"./internal/operators/timestamp":172,"./internal/operators/toArray":173,"./internal/operators/window":174,"./internal/operators/windowCount":175,"./internal/operators/windowTime":176,"./internal/operators/windowToggle":177,"./internal/operators/windowWhen":178,"./internal/operators/withLatestFrom":179,"./internal/operators/zipAll":181,"./internal/operators/zipWith":182,"./internal/scheduled/scheduled":189,"./internal/scheduler/VirtualTimeScheduler":199,"./internal/scheduler/animationFrame":200,"./internal/scheduler/asap":202,"./internal/scheduler/async":203,"./internal/scheduler/queue":208,"./internal/symbol/observable":211,"./internal/types":212,"./internal/util/ArgumentOutOfRangeError":213,"./internal/util/EmptyError":214,"./internal/util/NotFoundError":216,"./internal/util/ObjectUnsubscribedError":217,"./internal/util/SequenceError":218,"./internal/util/UnsubscriptionError":219,"./internal/util/identity":228,"./internal/util/isObservable":235,"./internal/util/noop":241,"./internal/util/pipe":243}],24:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncSubject = void 0;
var Subject_1 = require("./Subject");
var AsyncSubject = (function (_super) {
    __extends(AsyncSubject, _super);
    function AsyncSubject() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this._value = null;
        _this._hasValue = false;
        _this._isComplete = false;
        return _this;
    }
    AsyncSubject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, _hasValue = _a._hasValue, _value = _a._value, thrownError = _a.thrownError, isStopped = _a.isStopped, _isComplete = _a._isComplete;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped || _isComplete) {
            _hasValue && subscriber.next(_value);
            subscriber.complete();
        }
    };
    AsyncSubject.prototype.next = function (value) {
        if (!this.isStopped) {
            this._value = value;
            this._hasValue = true;
        }
    };
    AsyncSubject.prototype.complete = function () {
        var _a = this, _hasValue = _a._hasValue, _value = _a._value, _isComplete = _a._isComplete;
        if (!_isComplete) {
            this._isComplete = true;
            _hasValue && _super.prototype.next.call(this, _value);
            _super.prototype.complete.call(this);
        }
    };
    return AsyncSubject;
}(Subject_1.Subject));
exports.AsyncSubject = AsyncSubject;

},{"./Subject":31}],25:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.BehaviorSubject = void 0;
var Subject_1 = require("./Subject");
var BehaviorSubject = (function (_super) {
    __extends(BehaviorSubject, _super);
    function BehaviorSubject(_value) {
        var _this = _super.call(this) || this;
        _this._value = _value;
        return _this;
    }
    Object.defineProperty(BehaviorSubject.prototype, "value", {
        get: function () {
            return this.getValue();
        },
        enumerable: false,
        configurable: true
    });
    BehaviorSubject.prototype._subscribe = function (subscriber) {
        var subscription = _super.prototype._subscribe.call(this, subscriber);
        !subscription.closed && subscriber.next(this._value);
        return subscription;
    };
    BehaviorSubject.prototype.getValue = function () {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, _value = _a._value;
        if (hasError) {
            throw thrownError;
        }
        this._throwIfClosed();
        return _value;
    };
    BehaviorSubject.prototype.next = function (value) {
        _super.prototype.next.call(this, (this._value = value));
    };
    return BehaviorSubject;
}(Subject_1.Subject));
exports.BehaviorSubject = BehaviorSubject;

},{"./Subject":31}],26:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeNotification = exports.Notification = exports.NotificationKind = void 0;
var empty_1 = require("./observable/empty");
var of_1 = require("./observable/of");
var throwError_1 = require("./observable/throwError");
var isFunction_1 = require("./util/isFunction");
var NotificationKind;
(function (NotificationKind) {
    NotificationKind["NEXT"] = "N";
    NotificationKind["ERROR"] = "E";
    NotificationKind["COMPLETE"] = "C";
})(NotificationKind = exports.NotificationKind || (exports.NotificationKind = {}));
var Notification = (function () {
    function Notification(kind, value, error) {
        this.kind = kind;
        this.value = value;
        this.error = error;
        this.hasValue = kind === 'N';
    }
    Notification.prototype.observe = function (observer) {
        return observeNotification(this, observer);
    };
    Notification.prototype.do = function (nextHandler, errorHandler, completeHandler) {
        var _a = this, kind = _a.kind, value = _a.value, error = _a.error;
        return kind === 'N' ? nextHandler === null || nextHandler === void 0 ? void 0 : nextHandler(value) : kind === 'E' ? errorHandler === null || errorHandler === void 0 ? void 0 : errorHandler(error) : completeHandler === null || completeHandler === void 0 ? void 0 : completeHandler();
    };
    Notification.prototype.accept = function (nextOrObserver, error, complete) {
        var _a;
        return isFunction_1.isFunction((_a = nextOrObserver) === null || _a === void 0 ? void 0 : _a.next)
            ? this.observe(nextOrObserver)
            : this.do(nextOrObserver, error, complete);
    };
    Notification.prototype.toObservable = function () {
        var _a = this, kind = _a.kind, value = _a.value, error = _a.error;
        var result = kind === 'N'
            ?
                of_1.of(value)
            :
                kind === 'E'
                    ?
                        throwError_1.throwError(function () { return error; })
                    :
                        kind === 'C'
                            ?
                                empty_1.EMPTY
                            :
                                0;
        if (!result) {
            throw new TypeError("Unexpected notification kind " + kind);
        }
        return result;
    };
    Notification.createNext = function (value) {
        return new Notification('N', value);
    };
    Notification.createError = function (err) {
        return new Notification('E', undefined, err);
    };
    Notification.createComplete = function () {
        return Notification.completeNotification;
    };
    Notification.completeNotification = new Notification('C');
    return Notification;
}());
exports.Notification = Notification;
function observeNotification(notification, observer) {
    var _a, _b, _c;
    var _d = notification, kind = _d.kind, value = _d.value, error = _d.error;
    if (typeof kind !== 'string') {
        throw new TypeError('Invalid notification, missing "kind"');
    }
    kind === 'N' ? (_a = observer.next) === null || _a === void 0 ? void 0 : _a.call(observer, value) : kind === 'E' ? (_b = observer.error) === null || _b === void 0 ? void 0 : _b.call(observer, error) : (_c = observer.complete) === null || _c === void 0 ? void 0 : _c.call(observer);
}
exports.observeNotification = observeNotification;

},{"./observable/empty":46,"./observable/of":58,"./observable/throwError":64,"./util/isFunction":232}],27:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createNotification = exports.nextNotification = exports.errorNotification = exports.COMPLETE_NOTIFICATION = void 0;
exports.COMPLETE_NOTIFICATION = (function () { return createNotification('C', undefined, undefined); })();
function errorNotification(error) {
    return createNotification('E', undefined, error);
}
exports.errorNotification = errorNotification;
function nextNotification(value) {
    return createNotification('N', value, undefined);
}
exports.nextNotification = nextNotification;
function createNotification(kind, value, error) {
    return {
        kind: kind,
        value: value,
        error: error,
    };
}
exports.createNotification = createNotification;

},{}],28:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Observable = void 0;
var Subscriber_1 = require("./Subscriber");
var Subscription_1 = require("./Subscription");
var observable_1 = require("./symbol/observable");
var pipe_1 = require("./util/pipe");
var config_1 = require("./config");
var isFunction_1 = require("./util/isFunction");
var errorContext_1 = require("./util/errorContext");
var Observable = (function () {
    function Observable(subscribe) {
        if (subscribe) {
            this._subscribe = subscribe;
        }
    }
    Observable.prototype.lift = function (operator) {
        var observable = new Observable();
        observable.source = this;
        observable.operator = operator;
        return observable;
    };
    Observable.prototype.subscribe = function (observerOrNext, error, complete) {
        var _this = this;
        var subscriber = isSubscriber(observerOrNext) ? observerOrNext : new Subscriber_1.SafeSubscriber(observerOrNext, error, complete);
        errorContext_1.errorContext(function () {
            var _a = _this, operator = _a.operator, source = _a.source;
            subscriber.add(operator
                ?
                    operator.call(subscriber, source)
                : source
                    ?
                        _this._subscribe(subscriber)
                    :
                        _this._trySubscribe(subscriber));
        });
        return subscriber;
    };
    Observable.prototype._trySubscribe = function (sink) {
        try {
            return this._subscribe(sink);
        }
        catch (err) {
            sink.error(err);
        }
    };
    Observable.prototype.forEach = function (next, promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var subscriber = new Subscriber_1.SafeSubscriber({
                next: function (value) {
                    try {
                        next(value);
                    }
                    catch (err) {
                        reject(err);
                        subscriber.unsubscribe();
                    }
                },
                error: reject,
                complete: resolve,
            });
            _this.subscribe(subscriber);
        });
    };
    Observable.prototype._subscribe = function (subscriber) {
        var _a;
        return (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber);
    };
    Observable.prototype[observable_1.observable] = function () {
        return this;
    };
    Observable.prototype.pipe = function () {
        var operations = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            operations[_i] = arguments[_i];
        }
        return pipe_1.pipeFromArray(operations)(this);
    };
    Observable.prototype.toPromise = function (promiseCtor) {
        var _this = this;
        promiseCtor = getPromiseCtor(promiseCtor);
        return new promiseCtor(function (resolve, reject) {
            var value;
            _this.subscribe(function (x) { return (value = x); }, function (err) { return reject(err); }, function () { return resolve(value); });
        });
    };
    Observable.create = function (subscribe) {
        return new Observable(subscribe);
    };
    return Observable;
}());
exports.Observable = Observable;
function getPromiseCtor(promiseCtor) {
    var _a;
    return (_a = promiseCtor !== null && promiseCtor !== void 0 ? promiseCtor : config_1.config.Promise) !== null && _a !== void 0 ? _a : Promise;
}
function isObserver(value) {
    return value && isFunction_1.isFunction(value.next) && isFunction_1.isFunction(value.error) && isFunction_1.isFunction(value.complete);
}
function isSubscriber(value) {
    return (value && value instanceof Subscriber_1.Subscriber) || (isObserver(value) && Subscription_1.isSubscription(value));
}

},{"./Subscriber":32,"./Subscription":33,"./config":34,"./symbol/observable":211,"./util/errorContext":226,"./util/isFunction":232,"./util/pipe":243}],29:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReplaySubject = void 0;
var Subject_1 = require("./Subject");
var dateTimestampProvider_1 = require("./scheduler/dateTimestampProvider");
var ReplaySubject = (function (_super) {
    __extends(ReplaySubject, _super);
    function ReplaySubject(_bufferSize, _windowTime, _timestampProvider) {
        if (_bufferSize === void 0) { _bufferSize = Infinity; }
        if (_windowTime === void 0) { _windowTime = Infinity; }
        if (_timestampProvider === void 0) { _timestampProvider = dateTimestampProvider_1.dateTimestampProvider; }
        var _this = _super.call(this) || this;
        _this._bufferSize = _bufferSize;
        _this._windowTime = _windowTime;
        _this._timestampProvider = _timestampProvider;
        _this._buffer = [];
        _this._infiniteTimeWindow = true;
        _this._infiniteTimeWindow = _windowTime === Infinity;
        _this._bufferSize = Math.max(1, _bufferSize);
        _this._windowTime = Math.max(1, _windowTime);
        return _this;
    }
    ReplaySubject.prototype.next = function (value) {
        var _a = this, isStopped = _a.isStopped, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow, _timestampProvider = _a._timestampProvider, _windowTime = _a._windowTime;
        if (!isStopped) {
            _buffer.push(value);
            !_infiniteTimeWindow && _buffer.push(_timestampProvider.now() + _windowTime);
        }
        this._trimBuffer();
        _super.prototype.next.call(this, value);
    };
    ReplaySubject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._trimBuffer();
        var subscription = this._innerSubscribe(subscriber);
        var _a = this, _infiniteTimeWindow = _a._infiniteTimeWindow, _buffer = _a._buffer;
        var copy = _buffer.slice();
        for (var i = 0; i < copy.length && !subscriber.closed; i += _infiniteTimeWindow ? 1 : 2) {
            subscriber.next(copy[i]);
        }
        this._checkFinalizedStatuses(subscriber);
        return subscription;
    };
    ReplaySubject.prototype._trimBuffer = function () {
        var _a = this, _bufferSize = _a._bufferSize, _timestampProvider = _a._timestampProvider, _buffer = _a._buffer, _infiniteTimeWindow = _a._infiniteTimeWindow;
        var adjustedBufferSize = (_infiniteTimeWindow ? 1 : 2) * _bufferSize;
        _bufferSize < Infinity && adjustedBufferSize < _buffer.length && _buffer.splice(0, _buffer.length - adjustedBufferSize);
        if (!_infiniteTimeWindow) {
            var now = _timestampProvider.now();
            var last = 0;
            for (var i = 1; i < _buffer.length && _buffer[i] <= now; i += 2) {
                last = i;
            }
            last && _buffer.splice(0, last + 1);
        }
    };
    return ReplaySubject;
}(Subject_1.Subject));
exports.ReplaySubject = ReplaySubject;

},{"./Subject":31,"./scheduler/dateTimestampProvider":204}],30:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Scheduler = void 0;
var dateTimestampProvider_1 = require("./scheduler/dateTimestampProvider");
var Scheduler = (function () {
    function Scheduler(schedulerActionCtor, now) {
        if (now === void 0) { now = Scheduler.now; }
        this.schedulerActionCtor = schedulerActionCtor;
        this.now = now;
    }
    Scheduler.prototype.schedule = function (work, delay, state) {
        if (delay === void 0) { delay = 0; }
        return new this.schedulerActionCtor(this, work).schedule(state, delay);
    };
    Scheduler.now = dateTimestampProvider_1.dateTimestampProvider.now;
    return Scheduler;
}());
exports.Scheduler = Scheduler;

},{"./scheduler/dateTimestampProvider":204}],31:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnonymousSubject = exports.Subject = void 0;
var Observable_1 = require("./Observable");
var Subscription_1 = require("./Subscription");
var ObjectUnsubscribedError_1 = require("./util/ObjectUnsubscribedError");
var arrRemove_1 = require("./util/arrRemove");
var errorContext_1 = require("./util/errorContext");
var Subject = (function (_super) {
    __extends(Subject, _super);
    function Subject() {
        var _this = _super.call(this) || this;
        _this.closed = false;
        _this.currentObservers = null;
        _this.observers = [];
        _this.isStopped = false;
        _this.hasError = false;
        _this.thrownError = null;
        return _this;
    }
    Subject.prototype.lift = function (operator) {
        var subject = new AnonymousSubject(this, this);
        subject.operator = operator;
        return subject;
    };
    Subject.prototype._throwIfClosed = function () {
        if (this.closed) {
            throw new ObjectUnsubscribedError_1.ObjectUnsubscribedError();
        }
    };
    Subject.prototype.next = function (value) {
        var _this = this;
        errorContext_1.errorContext(function () {
            var e_1, _a;
            _this._throwIfClosed();
            if (!_this.isStopped) {
                if (!_this.currentObservers) {
                    _this.currentObservers = Array.from(_this.observers);
                }
                try {
                    for (var _b = __values(_this.currentObservers), _c = _b.next(); !_c.done; _c = _b.next()) {
                        var observer = _c.value;
                        observer.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
            }
        });
    };
    Subject.prototype.error = function (err) {
        var _this = this;
        errorContext_1.errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.hasError = _this.isStopped = true;
                _this.thrownError = err;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().error(err);
                }
            }
        });
    };
    Subject.prototype.complete = function () {
        var _this = this;
        errorContext_1.errorContext(function () {
            _this._throwIfClosed();
            if (!_this.isStopped) {
                _this.isStopped = true;
                var observers = _this.observers;
                while (observers.length) {
                    observers.shift().complete();
                }
            }
        });
    };
    Subject.prototype.unsubscribe = function () {
        this.isStopped = this.closed = true;
        this.observers = this.currentObservers = null;
    };
    Object.defineProperty(Subject.prototype, "observed", {
        get: function () {
            var _a;
            return ((_a = this.observers) === null || _a === void 0 ? void 0 : _a.length) > 0;
        },
        enumerable: false,
        configurable: true
    });
    Subject.prototype._trySubscribe = function (subscriber) {
        this._throwIfClosed();
        return _super.prototype._trySubscribe.call(this, subscriber);
    };
    Subject.prototype._subscribe = function (subscriber) {
        this._throwIfClosed();
        this._checkFinalizedStatuses(subscriber);
        return this._innerSubscribe(subscriber);
    };
    Subject.prototype._innerSubscribe = function (subscriber) {
        var _this = this;
        var _a = this, hasError = _a.hasError, isStopped = _a.isStopped, observers = _a.observers;
        if (hasError || isStopped) {
            return Subscription_1.EMPTY_SUBSCRIPTION;
        }
        this.currentObservers = null;
        observers.push(subscriber);
        return new Subscription_1.Subscription(function () {
            _this.currentObservers = null;
            arrRemove_1.arrRemove(observers, subscriber);
        });
    };
    Subject.prototype._checkFinalizedStatuses = function (subscriber) {
        var _a = this, hasError = _a.hasError, thrownError = _a.thrownError, isStopped = _a.isStopped;
        if (hasError) {
            subscriber.error(thrownError);
        }
        else if (isStopped) {
            subscriber.complete();
        }
    };
    Subject.prototype.asObservable = function () {
        var observable = new Observable_1.Observable();
        observable.source = this;
        return observable;
    };
    Subject.create = function (destination, source) {
        return new AnonymousSubject(destination, source);
    };
    return Subject;
}(Observable_1.Observable));
exports.Subject = Subject;
var AnonymousSubject = (function (_super) {
    __extends(AnonymousSubject, _super);
    function AnonymousSubject(destination, source) {
        var _this = _super.call(this) || this;
        _this.destination = destination;
        _this.source = source;
        return _this;
    }
    AnonymousSubject.prototype.next = function (value) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.next) === null || _b === void 0 ? void 0 : _b.call(_a, value);
    };
    AnonymousSubject.prototype.error = function (err) {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.error) === null || _b === void 0 ? void 0 : _b.call(_a, err);
    };
    AnonymousSubject.prototype.complete = function () {
        var _a, _b;
        (_b = (_a = this.destination) === null || _a === void 0 ? void 0 : _a.complete) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    AnonymousSubject.prototype._subscribe = function (subscriber) {
        var _a, _b;
        return (_b = (_a = this.source) === null || _a === void 0 ? void 0 : _a.subscribe(subscriber)) !== null && _b !== void 0 ? _b : Subscription_1.EMPTY_SUBSCRIPTION;
    };
    return AnonymousSubject;
}(Subject));
exports.AnonymousSubject = AnonymousSubject;

},{"./Observable":28,"./Subscription":33,"./util/ObjectUnsubscribedError":217,"./util/arrRemove":223,"./util/errorContext":226}],32:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMPTY_OBSERVER = exports.SafeSubscriber = exports.Subscriber = void 0;
var isFunction_1 = require("./util/isFunction");
var Subscription_1 = require("./Subscription");
var config_1 = require("./config");
var reportUnhandledError_1 = require("./util/reportUnhandledError");
var noop_1 = require("./util/noop");
var NotificationFactories_1 = require("./NotificationFactories");
var timeoutProvider_1 = require("./scheduler/timeoutProvider");
var errorContext_1 = require("./util/errorContext");
var Subscriber = (function (_super) {
    __extends(Subscriber, _super);
    function Subscriber(destination) {
        var _this = _super.call(this) || this;
        _this.isStopped = false;
        if (destination) {
            _this.destination = destination;
            if (Subscription_1.isSubscription(destination)) {
                destination.add(_this);
            }
        }
        else {
            _this.destination = exports.EMPTY_OBSERVER;
        }
        return _this;
    }
    Subscriber.create = function (next, error, complete) {
        return new SafeSubscriber(next, error, complete);
    };
    Subscriber.prototype.next = function (value) {
        if (this.isStopped) {
            handleStoppedNotification(NotificationFactories_1.nextNotification(value), this);
        }
        else {
            this._next(value);
        }
    };
    Subscriber.prototype.error = function (err) {
        if (this.isStopped) {
            handleStoppedNotification(NotificationFactories_1.errorNotification(err), this);
        }
        else {
            this.isStopped = true;
            this._error(err);
        }
    };
    Subscriber.prototype.complete = function () {
        if (this.isStopped) {
            handleStoppedNotification(NotificationFactories_1.COMPLETE_NOTIFICATION, this);
        }
        else {
            this.isStopped = true;
            this._complete();
        }
    };
    Subscriber.prototype.unsubscribe = function () {
        if (!this.closed) {
            this.isStopped = true;
            _super.prototype.unsubscribe.call(this);
            this.destination = null;
        }
    };
    Subscriber.prototype._next = function (value) {
        this.destination.next(value);
    };
    Subscriber.prototype._error = function (err) {
        try {
            this.destination.error(err);
        }
        finally {
            this.unsubscribe();
        }
    };
    Subscriber.prototype._complete = function () {
        try {
            this.destination.complete();
        }
        finally {
            this.unsubscribe();
        }
    };
    return Subscriber;
}(Subscription_1.Subscription));
exports.Subscriber = Subscriber;
var _bind = Function.prototype.bind;
function bind(fn, thisArg) {
    return _bind.call(fn, thisArg);
}
var ConsumerObserver = (function () {
    function ConsumerObserver(partialObserver) {
        this.partialObserver = partialObserver;
    }
    ConsumerObserver.prototype.next = function (value) {
        var partialObserver = this.partialObserver;
        if (partialObserver.next) {
            try {
                partialObserver.next(value);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    ConsumerObserver.prototype.error = function (err) {
        var partialObserver = this.partialObserver;
        if (partialObserver.error) {
            try {
                partialObserver.error(err);
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
        else {
            handleUnhandledError(err);
        }
    };
    ConsumerObserver.prototype.complete = function () {
        var partialObserver = this.partialObserver;
        if (partialObserver.complete) {
            try {
                partialObserver.complete();
            }
            catch (error) {
                handleUnhandledError(error);
            }
        }
    };
    return ConsumerObserver;
}());
var SafeSubscriber = (function (_super) {
    __extends(SafeSubscriber, _super);
    function SafeSubscriber(observerOrNext, error, complete) {
        var _this = _super.call(this) || this;
        var partialObserver;
        if (isFunction_1.isFunction(observerOrNext) || !observerOrNext) {
            partialObserver = {
                next: (observerOrNext !== null && observerOrNext !== void 0 ? observerOrNext : undefined),
                error: error !== null && error !== void 0 ? error : undefined,
                complete: complete !== null && complete !== void 0 ? complete : undefined,
            };
        }
        else {
            var context_1;
            if (_this && config_1.config.useDeprecatedNextContext) {
                context_1 = Object.create(observerOrNext);
                context_1.unsubscribe = function () { return _this.unsubscribe(); };
                partialObserver = {
                    next: observerOrNext.next && bind(observerOrNext.next, context_1),
                    error: observerOrNext.error && bind(observerOrNext.error, context_1),
                    complete: observerOrNext.complete && bind(observerOrNext.complete, context_1),
                };
            }
            else {
                partialObserver = observerOrNext;
            }
        }
        _this.destination = new ConsumerObserver(partialObserver);
        return _this;
    }
    return SafeSubscriber;
}(Subscriber));
exports.SafeSubscriber = SafeSubscriber;
function handleUnhandledError(error) {
    if (config_1.config.useDeprecatedSynchronousErrorHandling) {
        errorContext_1.captureError(error);
    }
    else {
        reportUnhandledError_1.reportUnhandledError(error);
    }
}
function defaultErrorHandler(err) {
    throw err;
}
function handleStoppedNotification(notification, subscriber) {
    var onStoppedNotification = config_1.config.onStoppedNotification;
    onStoppedNotification && timeoutProvider_1.timeoutProvider.setTimeout(function () { return onStoppedNotification(notification, subscriber); });
}
exports.EMPTY_OBSERVER = {
    closed: true,
    next: noop_1.noop,
    error: defaultErrorHandler,
    complete: noop_1.noop,
};

},{"./NotificationFactories":27,"./Subscription":33,"./config":34,"./scheduler/timeoutProvider":209,"./util/errorContext":226,"./util/isFunction":232,"./util/noop":241,"./util/reportUnhandledError":244}],33:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isSubscription = exports.EMPTY_SUBSCRIPTION = exports.Subscription = void 0;
var isFunction_1 = require("./util/isFunction");
var UnsubscriptionError_1 = require("./util/UnsubscriptionError");
var arrRemove_1 = require("./util/arrRemove");
var Subscription = (function () {
    function Subscription(initialTeardown) {
        this.initialTeardown = initialTeardown;
        this.closed = false;
        this._parentage = null;
        this._finalizers = null;
    }
    Subscription.prototype.unsubscribe = function () {
        var e_1, _a, e_2, _b;
        var errors;
        if (!this.closed) {
            this.closed = true;
            var _parentage = this._parentage;
            if (_parentage) {
                this._parentage = null;
                if (Array.isArray(_parentage)) {
                    try {
                        for (var _parentage_1 = __values(_parentage), _parentage_1_1 = _parentage_1.next(); !_parentage_1_1.done; _parentage_1_1 = _parentage_1.next()) {
                            var parent_1 = _parentage_1_1.value;
                            parent_1.remove(this);
                        }
                    }
                    catch (e_1_1) { e_1 = { error: e_1_1 }; }
                    finally {
                        try {
                            if (_parentage_1_1 && !_parentage_1_1.done && (_a = _parentage_1.return)) _a.call(_parentage_1);
                        }
                        finally { if (e_1) throw e_1.error; }
                    }
                }
                else {
                    _parentage.remove(this);
                }
            }
            var initialFinalizer = this.initialTeardown;
            if (isFunction_1.isFunction(initialFinalizer)) {
                try {
                    initialFinalizer();
                }
                catch (e) {
                    errors = e instanceof UnsubscriptionError_1.UnsubscriptionError ? e.errors : [e];
                }
            }
            var _finalizers = this._finalizers;
            if (_finalizers) {
                this._finalizers = null;
                try {
                    for (var _finalizers_1 = __values(_finalizers), _finalizers_1_1 = _finalizers_1.next(); !_finalizers_1_1.done; _finalizers_1_1 = _finalizers_1.next()) {
                        var finalizer = _finalizers_1_1.value;
                        try {
                            execFinalizer(finalizer);
                        }
                        catch (err) {
                            errors = errors !== null && errors !== void 0 ? errors : [];
                            if (err instanceof UnsubscriptionError_1.UnsubscriptionError) {
                                errors = __spreadArray(__spreadArray([], __read(errors)), __read(err.errors));
                            }
                            else {
                                errors.push(err);
                            }
                        }
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (_finalizers_1_1 && !_finalizers_1_1.done && (_b = _finalizers_1.return)) _b.call(_finalizers_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
            if (errors) {
                throw new UnsubscriptionError_1.UnsubscriptionError(errors);
            }
        }
    };
    Subscription.prototype.add = function (teardown) {
        var _a;
        if (teardown && teardown !== this) {
            if (this.closed) {
                execFinalizer(teardown);
            }
            else {
                if (teardown instanceof Subscription) {
                    if (teardown.closed || teardown._hasParent(this)) {
                        return;
                    }
                    teardown._addParent(this);
                }
                (this._finalizers = (_a = this._finalizers) !== null && _a !== void 0 ? _a : []).push(teardown);
            }
        }
    };
    Subscription.prototype._hasParent = function (parent) {
        var _parentage = this._parentage;
        return _parentage === parent || (Array.isArray(_parentage) && _parentage.includes(parent));
    };
    Subscription.prototype._addParent = function (parent) {
        var _parentage = this._parentage;
        this._parentage = Array.isArray(_parentage) ? (_parentage.push(parent), _parentage) : _parentage ? [_parentage, parent] : parent;
    };
    Subscription.prototype._removeParent = function (parent) {
        var _parentage = this._parentage;
        if (_parentage === parent) {
            this._parentage = null;
        }
        else if (Array.isArray(_parentage)) {
            arrRemove_1.arrRemove(_parentage, parent);
        }
    };
    Subscription.prototype.remove = function (teardown) {
        var _finalizers = this._finalizers;
        _finalizers && arrRemove_1.arrRemove(_finalizers, teardown);
        if (teardown instanceof Subscription) {
            teardown._removeParent(this);
        }
    };
    Subscription.EMPTY = (function () {
        var empty = new Subscription();
        empty.closed = true;
        return empty;
    })();
    return Subscription;
}());
exports.Subscription = Subscription;
exports.EMPTY_SUBSCRIPTION = Subscription.EMPTY;
function isSubscription(value) {
    return (value instanceof Subscription ||
        (value && 'closed' in value && isFunction_1.isFunction(value.remove) && isFunction_1.isFunction(value.add) && isFunction_1.isFunction(value.unsubscribe)));
}
exports.isSubscription = isSubscription;
function execFinalizer(finalizer) {
    if (isFunction_1.isFunction(finalizer)) {
        finalizer();
    }
    else {
        finalizer.unsubscribe();
    }
}

},{"./util/UnsubscriptionError":219,"./util/arrRemove":223,"./util/isFunction":232}],34:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.config = {
    onUnhandledError: null,
    onStoppedNotification: null,
    Promise: undefined,
    useDeprecatedSynchronousErrorHandling: false,
    useDeprecatedNextContext: false,
};

},{}],35:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.firstValueFrom = void 0;
var EmptyError_1 = require("./util/EmptyError");
var Subscriber_1 = require("./Subscriber");
function firstValueFrom(source, config) {
    var hasConfig = typeof config === 'object';
    return new Promise(function (resolve, reject) {
        var subscriber = new Subscriber_1.SafeSubscriber({
            next: function (value) {
                resolve(value);
                subscriber.unsubscribe();
            },
            error: reject,
            complete: function () {
                if (hasConfig) {
                    resolve(config.defaultValue);
                }
                else {
                    reject(new EmptyError_1.EmptyError());
                }
            },
        });
        source.subscribe(subscriber);
    });
}
exports.firstValueFrom = firstValueFrom;

},{"./Subscriber":32,"./util/EmptyError":214}],36:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lastValueFrom = void 0;
var EmptyError_1 = require("./util/EmptyError");
function lastValueFrom(source, config) {
    var hasConfig = typeof config === 'object';
    return new Promise(function (resolve, reject) {
        var _hasValue = false;
        var _value;
        source.subscribe({
            next: function (value) {
                _value = value;
                _hasValue = true;
            },
            error: reject,
            complete: function () {
                if (_hasValue) {
                    resolve(_value);
                }
                else if (hasConfig) {
                    resolve(config.defaultValue);
                }
                else {
                    reject(new EmptyError_1.EmptyError());
                }
            },
        });
    });
}
exports.lastValueFrom = lastValueFrom;

},{"./util/EmptyError":214}],37:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectableObservable = void 0;
var Observable_1 = require("../Observable");
var Subscription_1 = require("../Subscription");
var refCount_1 = require("../operators/refCount");
var OperatorSubscriber_1 = require("../operators/OperatorSubscriber");
var lift_1 = require("../util/lift");
var ConnectableObservable = (function (_super) {
    __extends(ConnectableObservable, _super);
    function ConnectableObservable(source, subjectFactory) {
        var _this = _super.call(this) || this;
        _this.source = source;
        _this.subjectFactory = subjectFactory;
        _this._subject = null;
        _this._refCount = 0;
        _this._connection = null;
        if (lift_1.hasLift(source)) {
            _this.lift = source.lift;
        }
        return _this;
    }
    ConnectableObservable.prototype._subscribe = function (subscriber) {
        return this.getSubject().subscribe(subscriber);
    };
    ConnectableObservable.prototype.getSubject = function () {
        var subject = this._subject;
        if (!subject || subject.isStopped) {
            this._subject = this.subjectFactory();
        }
        return this._subject;
    };
    ConnectableObservable.prototype._teardown = function () {
        this._refCount = 0;
        var _connection = this._connection;
        this._subject = this._connection = null;
        _connection === null || _connection === void 0 ? void 0 : _connection.unsubscribe();
    };
    ConnectableObservable.prototype.connect = function () {
        var _this = this;
        var connection = this._connection;
        if (!connection) {
            connection = this._connection = new Subscription_1.Subscription();
            var subject_1 = this.getSubject();
            connection.add(this.source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subject_1, undefined, function () {
                _this._teardown();
                subject_1.complete();
            }, function (err) {
                _this._teardown();
                subject_1.error(err);
            }, function () { return _this._teardown(); })));
            if (connection.closed) {
                this._connection = null;
                connection = Subscription_1.Subscription.EMPTY;
            }
        }
        return connection;
    };
    ConnectableObservable.prototype.refCount = function () {
        return refCount_1.refCount()(this);
    };
    return ConnectableObservable;
}(Observable_1.Observable));
exports.ConnectableObservable = ConnectableObservable;

},{"../Observable":28,"../Subscription":33,"../operators/OperatorSubscriber":68,"../operators/refCount":138,"../util/lift":239}],38:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCallback = void 0;
var bindCallbackInternals_1 = require("./bindCallbackInternals");
function bindCallback(callbackFunc, resultSelector, scheduler) {
    return bindCallbackInternals_1.bindCallbackInternals(false, callbackFunc, resultSelector, scheduler);
}
exports.bindCallback = bindCallback;

},{"./bindCallbackInternals":39}],39:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindCallbackInternals = void 0;
var isScheduler_1 = require("../util/isScheduler");
var Observable_1 = require("../Observable");
var subscribeOn_1 = require("../operators/subscribeOn");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
var observeOn_1 = require("../operators/observeOn");
var AsyncSubject_1 = require("../AsyncSubject");
function bindCallbackInternals(isNodeStyle, callbackFunc, resultSelector, scheduler) {
    if (resultSelector) {
        if (isScheduler_1.isScheduler(resultSelector)) {
            scheduler = resultSelector;
        }
        else {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return bindCallbackInternals(isNodeStyle, callbackFunc, scheduler)
                    .apply(this, args)
                    .pipe(mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector));
            };
        }
    }
    if (scheduler) {
        return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return bindCallbackInternals(isNodeStyle, callbackFunc)
                .apply(this, args)
                .pipe(subscribeOn_1.subscribeOn(scheduler), observeOn_1.observeOn(scheduler));
        };
    }
    return function () {
        var _this = this;
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var subject = new AsyncSubject_1.AsyncSubject();
        var uninitialized = true;
        return new Observable_1.Observable(function (subscriber) {
            var subs = subject.subscribe(subscriber);
            if (uninitialized) {
                uninitialized = false;
                var isAsync_1 = false;
                var isComplete_1 = false;
                callbackFunc.apply(_this, __spreadArray(__spreadArray([], __read(args)), [
                    function () {
                        var results = [];
                        for (var _i = 0; _i < arguments.length; _i++) {
                            results[_i] = arguments[_i];
                        }
                        if (isNodeStyle) {
                            var err = results.shift();
                            if (err != null) {
                                subject.error(err);
                                return;
                            }
                        }
                        subject.next(1 < results.length ? results : results[0]);
                        isComplete_1 = true;
                        if (isAsync_1) {
                            subject.complete();
                        }
                    },
                ]));
                if (isComplete_1) {
                    subject.complete();
                }
                isAsync_1 = true;
            }
            return subs;
        });
    };
}
exports.bindCallbackInternals = bindCallbackInternals;

},{"../AsyncSubject":24,"../Observable":28,"../operators/observeOn":128,"../operators/subscribeOn":156,"../util/isScheduler":238,"../util/mapOneOrManyArgs":240}],40:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bindNodeCallback = void 0;
var bindCallbackInternals_1 = require("./bindCallbackInternals");
function bindNodeCallback(callbackFunc, resultSelector, scheduler) {
    return bindCallbackInternals_1.bindCallbackInternals(true, callbackFunc, resultSelector, scheduler);
}
exports.bindNodeCallback = bindNodeCallback;

},{"./bindCallbackInternals":39}],41:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineLatestInit = exports.combineLatest = void 0;
var Observable_1 = require("../Observable");
var argsArgArrayOrObject_1 = require("../util/argsArgArrayOrObject");
var from_1 = require("./from");
var identity_1 = require("../util/identity");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
var args_1 = require("../util/args");
var createObject_1 = require("../util/createObject");
var OperatorSubscriber_1 = require("../operators/OperatorSubscriber");
var executeSchedule_1 = require("../util/executeSchedule");
function combineLatest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    var resultSelector = args_1.popResultSelector(args);
    var _a = argsArgArrayOrObject_1.argsArgArrayOrObject(args), observables = _a.args, keys = _a.keys;
    if (observables.length === 0) {
        return from_1.from([], scheduler);
    }
    var result = new Observable_1.Observable(combineLatestInit(observables, scheduler, keys
        ?
            function (values) { return createObject_1.createObject(keys, values); }
        :
            identity_1.identity));
    return resultSelector ? result.pipe(mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector)) : result;
}
exports.combineLatest = combineLatest;
function combineLatestInit(observables, scheduler, valueTransform) {
    if (valueTransform === void 0) { valueTransform = identity_1.identity; }
    return function (subscriber) {
        maybeSchedule(scheduler, function () {
            var length = observables.length;
            var values = new Array(length);
            var active = length;
            var remainingFirstValues = length;
            var _loop_1 = function (i) {
                maybeSchedule(scheduler, function () {
                    var source = from_1.from(observables[i], scheduler);
                    var hasFirstValue = false;
                    source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                        values[i] = value;
                        if (!hasFirstValue) {
                            hasFirstValue = true;
                            remainingFirstValues--;
                        }
                        if (!remainingFirstValues) {
                            subscriber.next(valueTransform(values.slice()));
                        }
                    }, function () {
                        if (!--active) {
                            subscriber.complete();
                        }
                    }));
                }, subscriber);
            };
            for (var i = 0; i < length; i++) {
                _loop_1(i);
            }
        }, subscriber);
    };
}
exports.combineLatestInit = combineLatestInit;
function maybeSchedule(scheduler, execute, subscription) {
    if (scheduler) {
        executeSchedule_1.executeSchedule(subscription, scheduler, execute);
    }
    else {
        execute();
    }
}

},{"../Observable":28,"../operators/OperatorSubscriber":68,"../util/args":220,"../util/argsArgArrayOrObject":221,"../util/createObject":225,"../util/executeSchedule":227,"../util/identity":228,"../util/mapOneOrManyArgs":240,"./from":48}],42:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = void 0;
var concatAll_1 = require("../operators/concatAll");
var args_1 = require("../util/args");
var from_1 = require("./from");
function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return concatAll_1.concatAll()(from_1.from(args, args_1.popScheduler(args)));
}
exports.concat = concat;

},{"../operators/concatAll":82,"../util/args":220,"./from":48}],43:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connectable = void 0;
var Subject_1 = require("../Subject");
var Observable_1 = require("../Observable");
var defer_1 = require("./defer");
var DEFAULT_CONFIG = {
    connector: function () { return new Subject_1.Subject(); },
    resetOnDisconnect: true,
};
function connectable(source, config) {
    if (config === void 0) { config = DEFAULT_CONFIG; }
    var connection = null;
    var connector = config.connector, _a = config.resetOnDisconnect, resetOnDisconnect = _a === void 0 ? true : _a;
    var subject = connector();
    var result = new Observable_1.Observable(function (subscriber) {
        return subject.subscribe(subscriber);
    });
    result.connect = function () {
        if (!connection || connection.closed) {
            connection = defer_1.defer(function () { return source; }).subscribe(subject);
            if (resetOnDisconnect) {
                connection.add(function () { return (subject = connector()); });
            }
        }
        return connection;
    };
    return result;
}
exports.connectable = connectable;

},{"../Observable":28,"../Subject":31,"./defer":44}],44:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defer = void 0;
var Observable_1 = require("../Observable");
var innerFrom_1 = require("./innerFrom");
function defer(observableFactory) {
    return new Observable_1.Observable(function (subscriber) {
        innerFrom_1.innerFrom(observableFactory()).subscribe(subscriber);
    });
}
exports.defer = defer;

},{"../Observable":28,"./innerFrom":54}],45:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animationFrames = void 0;
var Observable_1 = require("../../Observable");
var performanceTimestampProvider_1 = require("../../scheduler/performanceTimestampProvider");
var animationFrameProvider_1 = require("../../scheduler/animationFrameProvider");
function animationFrames(timestampProvider) {
    return timestampProvider ? animationFramesFactory(timestampProvider) : DEFAULT_ANIMATION_FRAMES;
}
exports.animationFrames = animationFrames;
function animationFramesFactory(timestampProvider) {
    return new Observable_1.Observable(function (subscriber) {
        var provider = timestampProvider || performanceTimestampProvider_1.performanceTimestampProvider;
        var start = provider.now();
        var id = 0;
        var run = function () {
            if (!subscriber.closed) {
                id = animationFrameProvider_1.animationFrameProvider.requestAnimationFrame(function (timestamp) {
                    id = 0;
                    var now = provider.now();
                    subscriber.next({
                        timestamp: timestampProvider ? now : timestamp,
                        elapsed: now - start,
                    });
                    run();
                });
            }
        };
        run();
        return function () {
            if (id) {
                animationFrameProvider_1.animationFrameProvider.cancelAnimationFrame(id);
            }
        };
    });
}
var DEFAULT_ANIMATION_FRAMES = animationFramesFactory();

},{"../../Observable":28,"../../scheduler/animationFrameProvider":201,"../../scheduler/performanceTimestampProvider":207}],46:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.empty = exports.EMPTY = void 0;
var Observable_1 = require("../Observable");
exports.EMPTY = new Observable_1.Observable(function (subscriber) { return subscriber.complete(); });
function empty(scheduler) {
    return scheduler ? emptyScheduled(scheduler) : exports.EMPTY;
}
exports.empty = empty;
function emptyScheduled(scheduler) {
    return new Observable_1.Observable(function (subscriber) { return scheduler.schedule(function () { return subscriber.complete(); }); });
}

},{"../Observable":28}],47:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.forkJoin = void 0;
var Observable_1 = require("../Observable");
var argsArgArrayOrObject_1 = require("../util/argsArgArrayOrObject");
var innerFrom_1 = require("./innerFrom");
var args_1 = require("../util/args");
var OperatorSubscriber_1 = require("../operators/OperatorSubscriber");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
var createObject_1 = require("../util/createObject");
function forkJoin() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = args_1.popResultSelector(args);
    var _a = argsArgArrayOrObject_1.argsArgArrayOrObject(args), sources = _a.args, keys = _a.keys;
    var result = new Observable_1.Observable(function (subscriber) {
        var length = sources.length;
        if (!length) {
            subscriber.complete();
            return;
        }
        var values = new Array(length);
        var remainingCompletions = length;
        var remainingEmissions = length;
        var _loop_1 = function (sourceIndex) {
            var hasValue = false;
            innerFrom_1.innerFrom(sources[sourceIndex]).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                if (!hasValue) {
                    hasValue = true;
                    remainingEmissions--;
                }
                values[sourceIndex] = value;
            }, function () { return remainingCompletions--; }, undefined, function () {
                if (!remainingCompletions || !hasValue) {
                    if (!remainingEmissions) {
                        subscriber.next(keys ? createObject_1.createObject(keys, values) : values);
                    }
                    subscriber.complete();
                }
            }));
        };
        for (var sourceIndex = 0; sourceIndex < length; sourceIndex++) {
            _loop_1(sourceIndex);
        }
    });
    return resultSelector ? result.pipe(mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector)) : result;
}
exports.forkJoin = forkJoin;

},{"../Observable":28,"../operators/OperatorSubscriber":68,"../util/args":220,"../util/argsArgArrayOrObject":221,"../util/createObject":225,"../util/mapOneOrManyArgs":240,"./innerFrom":54}],48:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.from = void 0;
var scheduled_1 = require("../scheduled/scheduled");
var innerFrom_1 = require("./innerFrom");
function from(input, scheduler) {
    return scheduler ? scheduled_1.scheduled(input, scheduler) : innerFrom_1.innerFrom(input);
}
exports.from = from;

},{"../scheduled/scheduled":189,"./innerFrom":54}],49:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromEvent = void 0;
var innerFrom_1 = require("../observable/innerFrom");
var Observable_1 = require("../Observable");
var mergeMap_1 = require("../operators/mergeMap");
var isArrayLike_1 = require("../util/isArrayLike");
var isFunction_1 = require("../util/isFunction");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
var nodeEventEmitterMethods = ['addListener', 'removeListener'];
var eventTargetMethods = ['addEventListener', 'removeEventListener'];
var jqueryMethods = ['on', 'off'];
function fromEvent(target, eventName, options, resultSelector) {
    if (isFunction_1.isFunction(options)) {
        resultSelector = options;
        options = undefined;
    }
    if (resultSelector) {
        return fromEvent(target, eventName, options).pipe(mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector));
    }
    var _a = __read(isEventTarget(target)
        ? eventTargetMethods.map(function (methodName) { return function (handler) { return target[methodName](eventName, handler, options); }; })
        :
            isNodeStyleEventEmitter(target)
                ? nodeEventEmitterMethods.map(toCommonHandlerRegistry(target, eventName))
                : isJQueryStyleEventEmitter(target)
                    ? jqueryMethods.map(toCommonHandlerRegistry(target, eventName))
                    : [], 2), add = _a[0], remove = _a[1];
    if (!add) {
        if (isArrayLike_1.isArrayLike(target)) {
            return mergeMap_1.mergeMap(function (subTarget) { return fromEvent(subTarget, eventName, options); })(innerFrom_1.innerFrom(target));
        }
    }
    if (!add) {
        throw new TypeError('Invalid event target');
    }
    return new Observable_1.Observable(function (subscriber) {
        var handler = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return subscriber.next(1 < args.length ? args : args[0]);
        };
        add(handler);
        return function () { return remove(handler); };
    });
}
exports.fromEvent = fromEvent;
function toCommonHandlerRegistry(target, eventName) {
    return function (methodName) { return function (handler) { return target[methodName](eventName, handler); }; };
}
function isNodeStyleEventEmitter(target) {
    return isFunction_1.isFunction(target.addListener) && isFunction_1.isFunction(target.removeListener);
}
function isJQueryStyleEventEmitter(target) {
    return isFunction_1.isFunction(target.on) && isFunction_1.isFunction(target.off);
}
function isEventTarget(target) {
    return isFunction_1.isFunction(target.addEventListener) && isFunction_1.isFunction(target.removeEventListener);
}

},{"../Observable":28,"../observable/innerFrom":54,"../operators/mergeMap":122,"../util/isArrayLike":229,"../util/isFunction":232,"../util/mapOneOrManyArgs":240}],50:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromEventPattern = void 0;
var Observable_1 = require("../Observable");
var isFunction_1 = require("../util/isFunction");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
function fromEventPattern(addHandler, removeHandler, resultSelector) {
    if (resultSelector) {
        return fromEventPattern(addHandler, removeHandler).pipe(mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector));
    }
    return new Observable_1.Observable(function (subscriber) {
        var handler = function () {
            var e = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                e[_i] = arguments[_i];
            }
            return subscriber.next(e.length === 1 ? e[0] : e);
        };
        var retValue = addHandler(handler);
        return isFunction_1.isFunction(removeHandler) ? function () { return removeHandler(handler, retValue); } : undefined;
    });
}
exports.fromEventPattern = fromEventPattern;

},{"../Observable":28,"../util/isFunction":232,"../util/mapOneOrManyArgs":240}],51:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromSubscribable = void 0;
var Observable_1 = require("../Observable");
function fromSubscribable(subscribable) {
    return new Observable_1.Observable(function (subscriber) { return subscribable.subscribe(subscriber); });
}
exports.fromSubscribable = fromSubscribable;

},{"../Observable":28}],52:[function(require,module,exports){
"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
var identity_1 = require("../util/identity");
var isScheduler_1 = require("../util/isScheduler");
var defer_1 = require("./defer");
var scheduleIterable_1 = require("../scheduled/scheduleIterable");
function generate(initialStateOrOptions, condition, iterate, resultSelectorOrScheduler, scheduler) {
    var _a, _b;
    var resultSelector;
    var initialState;
    if (arguments.length === 1) {
        (_a = initialStateOrOptions, initialState = _a.initialState, condition = _a.condition, iterate = _a.iterate, _b = _a.resultSelector, resultSelector = _b === void 0 ? identity_1.identity : _b, scheduler = _a.scheduler);
    }
    else {
        initialState = initialStateOrOptions;
        if (!resultSelectorOrScheduler || isScheduler_1.isScheduler(resultSelectorOrScheduler)) {
            resultSelector = identity_1.identity;
            scheduler = resultSelectorOrScheduler;
        }
        else {
            resultSelector = resultSelectorOrScheduler;
        }
    }
    function gen() {
        var state;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    state = initialState;
                    _a.label = 1;
                case 1:
                    if (!(!condition || condition(state))) return [3, 4];
                    return [4, resultSelector(state)];
                case 2:
                    _a.sent();
                    _a.label = 3;
                case 3:
                    state = iterate(state);
                    return [3, 1];
                case 4: return [2];
            }
        });
    }
    return defer_1.defer((scheduler
        ?
            function () { return scheduleIterable_1.scheduleIterable(gen(), scheduler); }
        :
            gen));
}
exports.generate = generate;

},{"../scheduled/scheduleIterable":185,"../util/identity":228,"../util/isScheduler":238,"./defer":44}],53:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iif = void 0;
var defer_1 = require("./defer");
function iif(condition, trueResult, falseResult) {
    return defer_1.defer(function () { return (condition() ? trueResult : falseResult); });
}
exports.iif = iif;

},{"./defer":44}],54:[function(require,module,exports){
(function (process){(function (){
"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromReadableStreamLike = exports.fromAsyncIterable = exports.fromIterable = exports.fromPromise = exports.fromArrayLike = exports.fromInteropObservable = exports.innerFrom = void 0;
var isArrayLike_1 = require("../util/isArrayLike");
var isPromise_1 = require("../util/isPromise");
var Observable_1 = require("../Observable");
var isInteropObservable_1 = require("../util/isInteropObservable");
var isAsyncIterable_1 = require("../util/isAsyncIterable");
var throwUnobservableError_1 = require("../util/throwUnobservableError");
var isIterable_1 = require("../util/isIterable");
var isReadableStreamLike_1 = require("../util/isReadableStreamLike");
var isFunction_1 = require("../util/isFunction");
var reportUnhandledError_1 = require("../util/reportUnhandledError");
var observable_1 = require("../symbol/observable");
function innerFrom(input) {
    if (input instanceof Observable_1.Observable) {
        return input;
    }
    if (input != null) {
        if (isInteropObservable_1.isInteropObservable(input)) {
            return fromInteropObservable(input);
        }
        if (isArrayLike_1.isArrayLike(input)) {
            return fromArrayLike(input);
        }
        if (isPromise_1.isPromise(input)) {
            return fromPromise(input);
        }
        if (isAsyncIterable_1.isAsyncIterable(input)) {
            return fromAsyncIterable(input);
        }
        if (isIterable_1.isIterable(input)) {
            return fromIterable(input);
        }
        if (isReadableStreamLike_1.isReadableStreamLike(input)) {
            return fromReadableStreamLike(input);
        }
    }
    throw throwUnobservableError_1.createInvalidObservableTypeError(input);
}
exports.innerFrom = innerFrom;
function fromInteropObservable(obj) {
    return new Observable_1.Observable(function (subscriber) {
        var obs = obj[observable_1.observable]();
        if (isFunction_1.isFunction(obs.subscribe)) {
            return obs.subscribe(subscriber);
        }
        throw new TypeError('Provided object does not correctly implement Symbol.observable');
    });
}
exports.fromInteropObservable = fromInteropObservable;
function fromArrayLike(array) {
    return new Observable_1.Observable(function (subscriber) {
        for (var i = 0; i < array.length && !subscriber.closed; i++) {
            subscriber.next(array[i]);
        }
        subscriber.complete();
    });
}
exports.fromArrayLike = fromArrayLike;
function fromPromise(promise) {
    return new Observable_1.Observable(function (subscriber) {
        promise
            .then(function (value) {
            if (!subscriber.closed) {
                subscriber.next(value);
                subscriber.complete();
            }
        }, function (err) { return subscriber.error(err); })
            .then(null, reportUnhandledError_1.reportUnhandledError);
    });
}
exports.fromPromise = fromPromise;
function fromIterable(iterable) {
    return new Observable_1.Observable(function (subscriber) {
        var e_1, _a;
        try {
            for (var iterable_1 = __values(iterable), iterable_1_1 = iterable_1.next(); !iterable_1_1.done; iterable_1_1 = iterable_1.next()) {
                var value = iterable_1_1.value;
                subscriber.next(value);
                if (subscriber.closed) {
                    return;
                }
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (iterable_1_1 && !iterable_1_1.done && (_a = iterable_1.return)) _a.call(iterable_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        subscriber.complete();
    });
}
exports.fromIterable = fromIterable;
function fromAsyncIterable(asyncIterable) {
    return new Observable_1.Observable(function (subscriber) {
        process(asyncIterable, subscriber).catch(function (err) { return subscriber.error(err); });
    });
}
exports.fromAsyncIterable = fromAsyncIterable;
function fromReadableStreamLike(readableStream) {
    return fromAsyncIterable(isReadableStreamLike_1.readableStreamLikeToAsyncGenerator(readableStream));
}
exports.fromReadableStreamLike = fromReadableStreamLike;
function process(asyncIterable, subscriber) {
    var asyncIterable_1, asyncIterable_1_1;
    var e_2, _a;
    return __awaiter(this, void 0, void 0, function () {
        var value, e_2_1;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    _b.trys.push([0, 5, 6, 11]);
                    asyncIterable_1 = __asyncValues(asyncIterable);
                    _b.label = 1;
                case 1: return [4, asyncIterable_1.next()];
                case 2:
                    if (!(asyncIterable_1_1 = _b.sent(), !asyncIterable_1_1.done)) return [3, 4];
                    value = asyncIterable_1_1.value;
                    subscriber.next(value);
                    if (subscriber.closed) {
                        return [2];
                    }
                    _b.label = 3;
                case 3: return [3, 1];
                case 4: return [3, 11];
                case 5:
                    e_2_1 = _b.sent();
                    e_2 = { error: e_2_1 };
                    return [3, 11];
                case 6:
                    _b.trys.push([6, , 9, 10]);
                    if (!(asyncIterable_1_1 && !asyncIterable_1_1.done && (_a = asyncIterable_1.return))) return [3, 8];
                    return [4, _a.call(asyncIterable_1)];
                case 7:
                    _b.sent();
                    _b.label = 8;
                case 8: return [3, 10];
                case 9:
                    if (e_2) throw e_2.error;
                    return [7];
                case 10: return [7];
                case 11:
                    subscriber.complete();
                    return [2];
            }
        });
    });
}

}).call(this)}).call(this,require('_process'))
},{"../Observable":28,"../symbol/observable":211,"../util/isArrayLike":229,"../util/isAsyncIterable":230,"../util/isFunction":232,"../util/isInteropObservable":233,"../util/isIterable":234,"../util/isPromise":236,"../util/isReadableStreamLike":237,"../util/reportUnhandledError":244,"../util/throwUnobservableError":245,"_process":1}],55:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.interval = void 0;
var async_1 = require("../scheduler/async");
var timer_1 = require("./timer");
function interval(period, scheduler) {
    if (period === void 0) { period = 0; }
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    if (period < 0) {
        period = 0;
    }
    return timer_1.timer(period, period, scheduler);
}
exports.interval = interval;

},{"../scheduler/async":203,"./timer":65}],56:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = void 0;
var mergeAll_1 = require("../operators/mergeAll");
var innerFrom_1 = require("./innerFrom");
var empty_1 = require("./empty");
var args_1 = require("../util/args");
var from_1 = require("./from");
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    var concurrent = args_1.popNumber(args, Infinity);
    var sources = args;
    return !sources.length
        ?
            empty_1.EMPTY
        : sources.length === 1
            ?
                innerFrom_1.innerFrom(sources[0])
            :
                mergeAll_1.mergeAll(concurrent)(from_1.from(sources, scheduler));
}
exports.merge = merge;

},{"../operators/mergeAll":120,"../util/args":220,"./empty":46,"./from":48,"./innerFrom":54}],57:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.never = exports.NEVER = void 0;
var Observable_1 = require("../Observable");
var noop_1 = require("../util/noop");
exports.NEVER = new Observable_1.Observable(noop_1.noop);
function never() {
    return exports.NEVER;
}
exports.never = never;

},{"../Observable":28,"../util/noop":241}],58:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.of = void 0;
var args_1 = require("../util/args");
var from_1 = require("./from");
function of() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    return from_1.from(args, scheduler);
}
exports.of = of;

},{"../util/args":220,"./from":48}],59:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorResumeNext = void 0;
var empty_1 = require("./empty");
var onErrorResumeNext_1 = require("../operators/onErrorResumeNext");
var argsOrArgArray_1 = require("../util/argsOrArgArray");
function onErrorResumeNext() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return onErrorResumeNext_1.onErrorResumeNext(argsOrArgArray_1.argsOrArgArray(sources))(empty_1.EMPTY);
}
exports.onErrorResumeNext = onErrorResumeNext;

},{"../operators/onErrorResumeNext":129,"../util/argsOrArgArray":222,"./empty":46}],60:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pairs = void 0;
var from_1 = require("./from");
function pairs(obj, scheduler) {
    return from_1.from(Object.entries(obj), scheduler);
}
exports.pairs = pairs;

},{"./from":48}],61:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.partition = void 0;
var not_1 = require("../util/not");
var filter_1 = require("../operators/filter");
var innerFrom_1 = require("./innerFrom");
function partition(source, predicate, thisArg) {
    return [filter_1.filter(predicate, thisArg)(innerFrom_1.innerFrom(source)), filter_1.filter(not_1.not(predicate, thisArg))(innerFrom_1.innerFrom(source))];
}
exports.partition = partition;

},{"../operators/filter":104,"../util/not":242,"./innerFrom":54}],62:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.raceInit = exports.race = void 0;
var Observable_1 = require("../Observable");
var innerFrom_1 = require("./innerFrom");
var argsOrArgArray_1 = require("../util/argsOrArgArray");
var OperatorSubscriber_1 = require("../operators/OperatorSubscriber");
function race() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    sources = argsOrArgArray_1.argsOrArgArray(sources);
    return sources.length === 1 ? innerFrom_1.innerFrom(sources[0]) : new Observable_1.Observable(raceInit(sources));
}
exports.race = race;
function raceInit(sources) {
    return function (subscriber) {
        var subscriptions = [];
        var _loop_1 = function (i) {
            subscriptions.push(innerFrom_1.innerFrom(sources[i]).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                if (subscriptions) {
                    for (var s = 0; s < subscriptions.length; s++) {
                        s !== i && subscriptions[s].unsubscribe();
                    }
                    subscriptions = null;
                }
                subscriber.next(value);
            })));
        };
        for (var i = 0; subscriptions && !subscriber.closed && i < sources.length; i++) {
            _loop_1(i);
        }
    };
}
exports.raceInit = raceInit;

},{"../Observable":28,"../operators/OperatorSubscriber":68,"../util/argsOrArgArray":222,"./innerFrom":54}],63:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.range = void 0;
var Observable_1 = require("../Observable");
var empty_1 = require("./empty");
function range(start, count, scheduler) {
    if (count == null) {
        count = start;
        start = 0;
    }
    if (count <= 0) {
        return empty_1.EMPTY;
    }
    var end = count + start;
    return new Observable_1.Observable(scheduler
        ?
            function (subscriber) {
                var n = start;
                return scheduler.schedule(function () {
                    if (n < end) {
                        subscriber.next(n++);
                        this.schedule();
                    }
                    else {
                        subscriber.complete();
                    }
                });
            }
        :
            function (subscriber) {
                var n = start;
                while (n < end && !subscriber.closed) {
                    subscriber.next(n++);
                }
                subscriber.complete();
            });
}
exports.range = range;

},{"../Observable":28,"./empty":46}],64:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwError = void 0;
var Observable_1 = require("../Observable");
var isFunction_1 = require("../util/isFunction");
function throwError(errorOrErrorFactory, scheduler) {
    var errorFactory = isFunction_1.isFunction(errorOrErrorFactory) ? errorOrErrorFactory : function () { return errorOrErrorFactory; };
    var init = function (subscriber) { return subscriber.error(errorFactory()); };
    return new Observable_1.Observable(scheduler ? function (subscriber) { return scheduler.schedule(init, 0, subscriber); } : init);
}
exports.throwError = throwError;

},{"../Observable":28,"../util/isFunction":232}],65:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timer = void 0;
var Observable_1 = require("../Observable");
var async_1 = require("../scheduler/async");
var isScheduler_1 = require("../util/isScheduler");
var isDate_1 = require("../util/isDate");
function timer(dueTime, intervalOrScheduler, scheduler) {
    if (dueTime === void 0) { dueTime = 0; }
    if (scheduler === void 0) { scheduler = async_1.async; }
    var intervalDuration = -1;
    if (intervalOrScheduler != null) {
        if (isScheduler_1.isScheduler(intervalOrScheduler)) {
            scheduler = intervalOrScheduler;
        }
        else {
            intervalDuration = intervalOrScheduler;
        }
    }
    return new Observable_1.Observable(function (subscriber) {
        var due = isDate_1.isValidDate(dueTime) ? +dueTime - scheduler.now() : dueTime;
        if (due < 0) {
            due = 0;
        }
        var n = 0;
        return scheduler.schedule(function () {
            if (!subscriber.closed) {
                subscriber.next(n++);
                if (0 <= intervalDuration) {
                    this.schedule(undefined, intervalDuration);
                }
                else {
                    subscriber.complete();
                }
            }
        }, due);
    });
}
exports.timer = timer;

},{"../Observable":28,"../scheduler/async":203,"../util/isDate":231,"../util/isScheduler":238}],66:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.using = void 0;
var Observable_1 = require("../Observable");
var innerFrom_1 = require("./innerFrom");
var empty_1 = require("./empty");
function using(resourceFactory, observableFactory) {
    return new Observable_1.Observable(function (subscriber) {
        var resource = resourceFactory();
        var result = observableFactory(resource);
        var source = result ? innerFrom_1.innerFrom(result) : empty_1.EMPTY;
        source.subscribe(subscriber);
        return function () {
            if (resource) {
                resource.unsubscribe();
            }
        };
    });
}
exports.using = using;

},{"../Observable":28,"./empty":46,"./innerFrom":54}],67:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
var Observable_1 = require("../Observable");
var innerFrom_1 = require("./innerFrom");
var argsOrArgArray_1 = require("../util/argsOrArgArray");
var empty_1 = require("./empty");
var OperatorSubscriber_1 = require("../operators/OperatorSubscriber");
var args_1 = require("../util/args");
function zip() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = args_1.popResultSelector(args);
    var sources = argsOrArgArray_1.argsOrArgArray(args);
    return sources.length
        ? new Observable_1.Observable(function (subscriber) {
            var buffers = sources.map(function () { return []; });
            var completed = sources.map(function () { return false; });
            subscriber.add(function () {
                buffers = completed = null;
            });
            var _loop_1 = function (sourceIndex) {
                innerFrom_1.innerFrom(sources[sourceIndex]).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                    buffers[sourceIndex].push(value);
                    if (buffers.every(function (buffer) { return buffer.length; })) {
                        var result = buffers.map(function (buffer) { return buffer.shift(); });
                        subscriber.next(resultSelector ? resultSelector.apply(void 0, __spreadArray([], __read(result))) : result);
                        if (buffers.some(function (buffer, i) { return !buffer.length && completed[i]; })) {
                            subscriber.complete();
                        }
                    }
                }, function () {
                    completed[sourceIndex] = true;
                    !buffers[sourceIndex].length && subscriber.complete();
                }));
            };
            for (var sourceIndex = 0; !subscriber.closed && sourceIndex < sources.length; sourceIndex++) {
                _loop_1(sourceIndex);
            }
            return function () {
                buffers = completed = null;
            };
        })
        : empty_1.EMPTY;
}
exports.zip = zip;

},{"../Observable":28,"../operators/OperatorSubscriber":68,"../util/args":220,"../util/argsOrArgArray":222,"./empty":46,"./innerFrom":54}],68:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.OperatorSubscriber = exports.createOperatorSubscriber = void 0;
var Subscriber_1 = require("../Subscriber");
function createOperatorSubscriber(destination, onNext, onComplete, onError, onFinalize) {
    return new OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize);
}
exports.createOperatorSubscriber = createOperatorSubscriber;
var OperatorSubscriber = (function (_super) {
    __extends(OperatorSubscriber, _super);
    function OperatorSubscriber(destination, onNext, onComplete, onError, onFinalize, shouldUnsubscribe) {
        var _this = _super.call(this, destination) || this;
        _this.onFinalize = onFinalize;
        _this.shouldUnsubscribe = shouldUnsubscribe;
        _this._next = onNext
            ? function (value) {
                try {
                    onNext(value);
                }
                catch (err) {
                    destination.error(err);
                }
            }
            : _super.prototype._next;
        _this._error = onError
            ? function (err) {
                try {
                    onError(err);
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._error;
        _this._complete = onComplete
            ? function () {
                try {
                    onComplete();
                }
                catch (err) {
                    destination.error(err);
                }
                finally {
                    this.unsubscribe();
                }
            }
            : _super.prototype._complete;
        return _this;
    }
    OperatorSubscriber.prototype.unsubscribe = function () {
        var _a;
        if (!this.shouldUnsubscribe || this.shouldUnsubscribe()) {
            var closed_1 = this.closed;
            _super.prototype.unsubscribe.call(this);
            !closed_1 && ((_a = this.onFinalize) === null || _a === void 0 ? void 0 : _a.call(this));
        }
    };
    return OperatorSubscriber;
}(Subscriber_1.Subscriber));
exports.OperatorSubscriber = OperatorSubscriber;

},{"../Subscriber":32}],69:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.audit = void 0;
var lift_1 = require("../util/lift");
var innerFrom_1 = require("../observable/innerFrom");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function audit(durationSelector) {
    return lift_1.operate(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        var durationSubscriber = null;
        var isComplete = false;
        var endDuration = function () {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            durationSubscriber = null;
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
            isComplete && subscriber.complete();
        };
        var cleanupDuration = function () {
            durationSubscriber = null;
            isComplete && subscriber.complete();
        };
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            lastValue = value;
            if (!durationSubscriber) {
                innerFrom_1.innerFrom(durationSelector(value)).subscribe((durationSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, endDuration, cleanupDuration)));
            }
        }, function () {
            isComplete = true;
            (!hasValue || !durationSubscriber || durationSubscriber.closed) && subscriber.complete();
        }));
    });
}
exports.audit = audit;

},{"../observable/innerFrom":54,"../util/lift":239,"./OperatorSubscriber":68}],70:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditTime = void 0;
var async_1 = require("../scheduler/async");
var audit_1 = require("./audit");
var timer_1 = require("../observable/timer");
function auditTime(duration, scheduler) {
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    return audit_1.audit(function () { return timer_1.timer(duration, scheduler); });
}
exports.auditTime = auditTime;

},{"../observable/timer":65,"../scheduler/async":203,"./audit":69}],71:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buffer = void 0;
var lift_1 = require("../util/lift");
var noop_1 = require("../util/noop");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function buffer(closingNotifier) {
    return lift_1.operate(function (source, subscriber) {
        var currentBuffer = [];
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return currentBuffer.push(value); }, function () {
            subscriber.next(currentBuffer);
            subscriber.complete();
        }));
        closingNotifier.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
            var b = currentBuffer;
            currentBuffer = [];
            subscriber.next(b);
        }, noop_1.noop));
        return function () {
            currentBuffer = null;
        };
    });
}
exports.buffer = buffer;

},{"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],72:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferCount = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var arrRemove_1 = require("../util/arrRemove");
function bufferCount(bufferSize, startBufferEvery) {
    if (startBufferEvery === void 0) { startBufferEvery = null; }
    startBufferEvery = startBufferEvery !== null && startBufferEvery !== void 0 ? startBufferEvery : bufferSize;
    return lift_1.operate(function (source, subscriber) {
        var buffers = [];
        var count = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a, e_2, _b;
            var toEmit = null;
            if (count++ % startBufferEvery === 0) {
                buffers.push([]);
            }
            try {
                for (var buffers_1 = __values(buffers), buffers_1_1 = buffers_1.next(); !buffers_1_1.done; buffers_1_1 = buffers_1.next()) {
                    var buffer = buffers_1_1.value;
                    buffer.push(value);
                    if (bufferSize <= buffer.length) {
                        toEmit = toEmit !== null && toEmit !== void 0 ? toEmit : [];
                        toEmit.push(buffer);
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            if (toEmit) {
                try {
                    for (var toEmit_1 = __values(toEmit), toEmit_1_1 = toEmit_1.next(); !toEmit_1_1.done; toEmit_1_1 = toEmit_1.next()) {
                        var buffer = toEmit_1_1.value;
                        arrRemove_1.arrRemove(buffers, buffer);
                        subscriber.next(buffer);
                    }
                }
                catch (e_2_1) { e_2 = { error: e_2_1 }; }
                finally {
                    try {
                        if (toEmit_1_1 && !toEmit_1_1.done && (_b = toEmit_1.return)) _b.call(toEmit_1);
                    }
                    finally { if (e_2) throw e_2.error; }
                }
            }
        }, function () {
            var e_3, _a;
            try {
                for (var buffers_2 = __values(buffers), buffers_2_1 = buffers_2.next(); !buffers_2_1.done; buffers_2_1 = buffers_2.next()) {
                    var buffer = buffers_2_1.value;
                    subscriber.next(buffer);
                }
            }
            catch (e_3_1) { e_3 = { error: e_3_1 }; }
            finally {
                try {
                    if (buffers_2_1 && !buffers_2_1.done && (_a = buffers_2.return)) _a.call(buffers_2);
                }
                finally { if (e_3) throw e_3.error; }
            }
            subscriber.complete();
        }, undefined, function () {
            buffers = null;
        }));
    });
}
exports.bufferCount = bufferCount;

},{"../util/arrRemove":223,"../util/lift":239,"./OperatorSubscriber":68}],73:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferTime = void 0;
var Subscription_1 = require("../Subscription");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var arrRemove_1 = require("../util/arrRemove");
var async_1 = require("../scheduler/async");
var args_1 = require("../util/args");
var executeSchedule_1 = require("../util/executeSchedule");
function bufferTime(bufferTimeSpan) {
    var _a, _b;
    var otherArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherArgs[_i - 1] = arguments[_i];
    }
    var scheduler = (_a = args_1.popScheduler(otherArgs)) !== null && _a !== void 0 ? _a : async_1.asyncScheduler;
    var bufferCreationInterval = (_b = otherArgs[0]) !== null && _b !== void 0 ? _b : null;
    var maxBufferSize = otherArgs[1] || Infinity;
    return lift_1.operate(function (source, subscriber) {
        var bufferRecords = [];
        var restartOnEmit = false;
        var emit = function (record) {
            var buffer = record.buffer, subs = record.subs;
            subs.unsubscribe();
            arrRemove_1.arrRemove(bufferRecords, record);
            subscriber.next(buffer);
            restartOnEmit && startBuffer();
        };
        var startBuffer = function () {
            if (bufferRecords) {
                var subs = new Subscription_1.Subscription();
                subscriber.add(subs);
                var buffer = [];
                var record_1 = {
                    buffer: buffer,
                    subs: subs,
                };
                bufferRecords.push(record_1);
                executeSchedule_1.executeSchedule(subs, scheduler, function () { return emit(record_1); }, bufferTimeSpan);
            }
        };
        if (bufferCreationInterval !== null && bufferCreationInterval >= 0) {
            executeSchedule_1.executeSchedule(subscriber, scheduler, startBuffer, bufferCreationInterval, true);
        }
        else {
            restartOnEmit = true;
        }
        startBuffer();
        var bufferTimeSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            var recordsCopy = bufferRecords.slice();
            try {
                for (var recordsCopy_1 = __values(recordsCopy), recordsCopy_1_1 = recordsCopy_1.next(); !recordsCopy_1_1.done; recordsCopy_1_1 = recordsCopy_1.next()) {
                    var record = recordsCopy_1_1.value;
                    var buffer = record.buffer;
                    buffer.push(value);
                    maxBufferSize <= buffer.length && emit(record);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (recordsCopy_1_1 && !recordsCopy_1_1.done && (_a = recordsCopy_1.return)) _a.call(recordsCopy_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (bufferRecords === null || bufferRecords === void 0 ? void 0 : bufferRecords.length) {
                subscriber.next(bufferRecords.shift().buffer);
            }
            bufferTimeSubscriber === null || bufferTimeSubscriber === void 0 ? void 0 : bufferTimeSubscriber.unsubscribe();
            subscriber.complete();
            subscriber.unsubscribe();
        }, undefined, function () { return (bufferRecords = null); });
        source.subscribe(bufferTimeSubscriber);
    });
}
exports.bufferTime = bufferTime;

},{"../Subscription":33,"../scheduler/async":203,"../util/args":220,"../util/arrRemove":223,"../util/executeSchedule":227,"../util/lift":239,"./OperatorSubscriber":68}],74:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferToggle = void 0;
var Subscription_1 = require("../Subscription");
var lift_1 = require("../util/lift");
var innerFrom_1 = require("../observable/innerFrom");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var noop_1 = require("../util/noop");
var arrRemove_1 = require("../util/arrRemove");
function bufferToggle(openings, closingSelector) {
    return lift_1.operate(function (source, subscriber) {
        var buffers = [];
        innerFrom_1.innerFrom(openings).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (openValue) {
            var buffer = [];
            buffers.push(buffer);
            var closingSubscription = new Subscription_1.Subscription();
            var emitBuffer = function () {
                arrRemove_1.arrRemove(buffers, buffer);
                subscriber.next(buffer);
                closingSubscription.unsubscribe();
            };
            closingSubscription.add(innerFrom_1.innerFrom(closingSelector(openValue)).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, emitBuffer, noop_1.noop)));
        }, noop_1.noop));
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            try {
                for (var buffers_1 = __values(buffers), buffers_1_1 = buffers_1.next(); !buffers_1_1.done; buffers_1_1 = buffers_1.next()) {
                    var buffer = buffers_1_1.value;
                    buffer.push(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (buffers_1_1 && !buffers_1_1.done && (_a = buffers_1.return)) _a.call(buffers_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (buffers.length > 0) {
                subscriber.next(buffers.shift());
            }
            subscriber.complete();
        }));
    });
}
exports.bufferToggle = bufferToggle;

},{"../Subscription":33,"../observable/innerFrom":54,"../util/arrRemove":223,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],75:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bufferWhen = void 0;
var lift_1 = require("../util/lift");
var noop_1 = require("../util/noop");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
function bufferWhen(closingSelector) {
    return lift_1.operate(function (source, subscriber) {
        var buffer = null;
        var closingSubscriber = null;
        var openBuffer = function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            var b = buffer;
            buffer = [];
            b && subscriber.next(b);
            innerFrom_1.innerFrom(closingSelector()).subscribe((closingSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, openBuffer, noop_1.noop)));
        };
        openBuffer();
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return buffer === null || buffer === void 0 ? void 0 : buffer.push(value); }, function () {
            buffer && subscriber.next(buffer);
            subscriber.complete();
        }, undefined, function () { return (buffer = closingSubscriber = null); }));
    });
}
exports.bufferWhen = bufferWhen;

},{"../observable/innerFrom":54,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],76:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.catchError = void 0;
var innerFrom_1 = require("../observable/innerFrom");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var lift_1 = require("../util/lift");
function catchError(selector) {
    return lift_1.operate(function (source, subscriber) {
        var innerSub = null;
        var syncUnsub = false;
        var handledResult;
        innerSub = source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, undefined, undefined, function (err) {
            handledResult = innerFrom_1.innerFrom(selector(err, catchError(selector)(source)));
            if (innerSub) {
                innerSub.unsubscribe();
                innerSub = null;
                handledResult.subscribe(subscriber);
            }
            else {
                syncUnsub = true;
            }
        }));
        if (syncUnsub) {
            innerSub.unsubscribe();
            innerSub = null;
            handledResult.subscribe(subscriber);
        }
    });
}
exports.catchError = catchError;

},{"../observable/innerFrom":54,"../util/lift":239,"./OperatorSubscriber":68}],77:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineAll = void 0;
var combineLatestAll_1 = require("./combineLatestAll");
exports.combineAll = combineLatestAll_1.combineLatestAll;

},{"./combineLatestAll":79}],78:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineLatest = void 0;
var combineLatest_1 = require("../observable/combineLatest");
var lift_1 = require("../util/lift");
var argsOrArgArray_1 = require("../util/argsOrArgArray");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
var pipe_1 = require("../util/pipe");
var args_1 = require("../util/args");
function combineLatest() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var resultSelector = args_1.popResultSelector(args);
    return resultSelector
        ? pipe_1.pipe(combineLatest.apply(void 0, __spreadArray([], __read(args))), mapOneOrManyArgs_1.mapOneOrManyArgs(resultSelector))
        : lift_1.operate(function (source, subscriber) {
            combineLatest_1.combineLatestInit(__spreadArray([source], __read(argsOrArgArray_1.argsOrArgArray(args))))(subscriber);
        });
}
exports.combineLatest = combineLatest;

},{"../observable/combineLatest":41,"../util/args":220,"../util/argsOrArgArray":222,"../util/lift":239,"../util/mapOneOrManyArgs":240,"../util/pipe":243}],79:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineLatestAll = void 0;
var combineLatest_1 = require("../observable/combineLatest");
var joinAllInternals_1 = require("./joinAllInternals");
function combineLatestAll(project) {
    return joinAllInternals_1.joinAllInternals(combineLatest_1.combineLatest, project);
}
exports.combineLatestAll = combineLatestAll;

},{"../observable/combineLatest":41,"./joinAllInternals":113}],80:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.combineLatestWith = void 0;
var combineLatest_1 = require("./combineLatest");
function combineLatestWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return combineLatest_1.combineLatest.apply(void 0, __spreadArray([], __read(otherSources)));
}
exports.combineLatestWith = combineLatestWith;

},{"./combineLatest":78}],81:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = void 0;
var lift_1 = require("../util/lift");
var concatAll_1 = require("./concatAll");
var args_1 = require("../util/args");
var from_1 = require("../observable/from");
function concat() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    return lift_1.operate(function (source, subscriber) {
        concatAll_1.concatAll()(from_1.from(__spreadArray([source], __read(args)), scheduler)).subscribe(subscriber);
    });
}
exports.concat = concat;

},{"../observable/from":48,"../util/args":220,"../util/lift":239,"./concatAll":82}],82:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatAll = void 0;
var mergeAll_1 = require("./mergeAll");
function concatAll() {
    return mergeAll_1.mergeAll(1);
}
exports.concatAll = concatAll;

},{"./mergeAll":120}],83:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatMap = void 0;
var mergeMap_1 = require("./mergeMap");
var isFunction_1 = require("../util/isFunction");
function concatMap(project, resultSelector) {
    return isFunction_1.isFunction(resultSelector) ? mergeMap_1.mergeMap(project, resultSelector, 1) : mergeMap_1.mergeMap(project, 1);
}
exports.concatMap = concatMap;

},{"../util/isFunction":232,"./mergeMap":122}],84:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatMapTo = void 0;
var concatMap_1 = require("./concatMap");
var isFunction_1 = require("../util/isFunction");
function concatMapTo(innerObservable, resultSelector) {
    return isFunction_1.isFunction(resultSelector) ? concatMap_1.concatMap(function () { return innerObservable; }, resultSelector) : concatMap_1.concatMap(function () { return innerObservable; });
}
exports.concatMapTo = concatMapTo;

},{"../util/isFunction":232,"./concatMap":83}],85:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.concatWith = void 0;
var concat_1 = require("./concat");
function concatWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return concat_1.concat.apply(void 0, __spreadArray([], __read(otherSources)));
}
exports.concatWith = concatWith;

},{"./concat":81}],86:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = void 0;
var Subject_1 = require("../Subject");
var innerFrom_1 = require("../observable/innerFrom");
var lift_1 = require("../util/lift");
var fromSubscribable_1 = require("../observable/fromSubscribable");
var DEFAULT_CONFIG = {
    connector: function () { return new Subject_1.Subject(); },
};
function connect(selector, config) {
    if (config === void 0) { config = DEFAULT_CONFIG; }
    var connector = config.connector;
    return lift_1.operate(function (source, subscriber) {
        var subject = connector();
        innerFrom_1.innerFrom(selector(fromSubscribable_1.fromSubscribable(subject))).subscribe(subscriber);
        subscriber.add(source.subscribe(subject));
    });
}
exports.connect = connect;

},{"../Subject":31,"../observable/fromSubscribable":51,"../observable/innerFrom":54,"../util/lift":239}],87:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.count = void 0;
var reduce_1 = require("./reduce");
function count(predicate) {
    return reduce_1.reduce(function (total, value, i) { return (!predicate || predicate(value, i) ? total + 1 : total); }, 0);
}
exports.count = count;

},{"./reduce":137}],88:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounce = void 0;
var lift_1 = require("../util/lift");
var noop_1 = require("../util/noop");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
function debounce(durationSelector) {
    return lift_1.operate(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        var durationSubscriber = null;
        var emit = function () {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            durationSubscriber = null;
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            durationSubscriber === null || durationSubscriber === void 0 ? void 0 : durationSubscriber.unsubscribe();
            hasValue = true;
            lastValue = value;
            durationSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, emit, noop_1.noop);
            innerFrom_1.innerFrom(durationSelector(value)).subscribe(durationSubscriber);
        }, function () {
            emit();
            subscriber.complete();
        }, undefined, function () {
            lastValue = durationSubscriber = null;
        }));
    });
}
exports.debounce = debounce;

},{"../observable/innerFrom":54,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],89:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.debounceTime = void 0;
var async_1 = require("../scheduler/async");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function debounceTime(dueTime, scheduler) {
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    return lift_1.operate(function (source, subscriber) {
        var activeTask = null;
        var lastValue = null;
        var lastTime = null;
        var emit = function () {
            if (activeTask) {
                activeTask.unsubscribe();
                activeTask = null;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        };
        function emitWhenIdle() {
            var targetTime = lastTime + dueTime;
            var now = scheduler.now();
            if (now < targetTime) {
                activeTask = this.schedule(undefined, targetTime - now);
                subscriber.add(activeTask);
                return;
            }
            emit();
        }
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            lastValue = value;
            lastTime = scheduler.now();
            if (!activeTask) {
                activeTask = scheduler.schedule(emitWhenIdle, dueTime);
                subscriber.add(activeTask);
            }
        }, function () {
            emit();
            subscriber.complete();
        }, undefined, function () {
            lastValue = activeTask = null;
        }));
    });
}
exports.debounceTime = debounceTime;

},{"../scheduler/async":203,"../util/lift":239,"./OperatorSubscriber":68}],90:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defaultIfEmpty = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function defaultIfEmpty(defaultValue) {
    return lift_1.operate(function (source, subscriber) {
        var hasValue = false;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            subscriber.next(value);
        }, function () {
            if (!hasValue) {
                subscriber.next(defaultValue);
            }
            subscriber.complete();
        }));
    });
}
exports.defaultIfEmpty = defaultIfEmpty;

},{"../util/lift":239,"./OperatorSubscriber":68}],91:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delay = void 0;
var async_1 = require("../scheduler/async");
var delayWhen_1 = require("./delayWhen");
var timer_1 = require("../observable/timer");
function delay(due, scheduler) {
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    var duration = timer_1.timer(due, scheduler);
    return delayWhen_1.delayWhen(function () { return duration; });
}
exports.delay = delay;

},{"../observable/timer":65,"../scheduler/async":203,"./delayWhen":92}],92:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.delayWhen = void 0;
var concat_1 = require("../observable/concat");
var take_1 = require("./take");
var ignoreElements_1 = require("./ignoreElements");
var mapTo_1 = require("./mapTo");
var mergeMap_1 = require("./mergeMap");
function delayWhen(delayDurationSelector, subscriptionDelay) {
    if (subscriptionDelay) {
        return function (source) {
            return concat_1.concat(subscriptionDelay.pipe(take_1.take(1), ignoreElements_1.ignoreElements()), source.pipe(delayWhen(delayDurationSelector)));
        };
    }
    return mergeMap_1.mergeMap(function (value, index) { return delayDurationSelector(value, index).pipe(take_1.take(1), mapTo_1.mapTo(value)); });
}
exports.delayWhen = delayWhen;

},{"../observable/concat":42,"./ignoreElements":111,"./mapTo":116,"./mergeMap":122,"./take":161}],93:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dematerialize = void 0;
var Notification_1 = require("../Notification");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function dematerialize() {
    return lift_1.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (notification) { return Notification_1.observeNotification(notification, subscriber); }));
    });
}
exports.dematerialize = dematerialize;

},{"../Notification":26,"../util/lift":239,"./OperatorSubscriber":68}],94:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinct = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var noop_1 = require("../util/noop");
function distinct(keySelector, flushes) {
    return lift_1.operate(function (source, subscriber) {
        var distinctKeys = new Set();
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var key = keySelector ? keySelector(value) : value;
            if (!distinctKeys.has(key)) {
                distinctKeys.add(key);
                subscriber.next(value);
            }
        }));
        flushes === null || flushes === void 0 ? void 0 : flushes.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () { return distinctKeys.clear(); }, noop_1.noop));
    });
}
exports.distinct = distinct;

},{"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],95:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinctUntilChanged = void 0;
var identity_1 = require("../util/identity");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function distinctUntilChanged(comparator, keySelector) {
    if (keySelector === void 0) { keySelector = identity_1.identity; }
    comparator = comparator !== null && comparator !== void 0 ? comparator : defaultCompare;
    return lift_1.operate(function (source, subscriber) {
        var previousKey;
        var first = true;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var currentKey = keySelector(value);
            if (first || !comparator(previousKey, currentKey)) {
                first = false;
                previousKey = currentKey;
                subscriber.next(value);
            }
        }));
    });
}
exports.distinctUntilChanged = distinctUntilChanged;
function defaultCompare(a, b) {
    return a === b;
}

},{"../util/identity":228,"../util/lift":239,"./OperatorSubscriber":68}],96:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.distinctUntilKeyChanged = void 0;
var distinctUntilChanged_1 = require("./distinctUntilChanged");
function distinctUntilKeyChanged(key, compare) {
    return distinctUntilChanged_1.distinctUntilChanged(function (x, y) { return compare ? compare(x[key], y[key]) : x[key] === y[key]; });
}
exports.distinctUntilKeyChanged = distinctUntilKeyChanged;

},{"./distinctUntilChanged":95}],97:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.elementAt = void 0;
var ArgumentOutOfRangeError_1 = require("../util/ArgumentOutOfRangeError");
var filter_1 = require("./filter");
var throwIfEmpty_1 = require("./throwIfEmpty");
var defaultIfEmpty_1 = require("./defaultIfEmpty");
var take_1 = require("./take");
function elementAt(index, defaultValue) {
    if (index < 0) {
        throw new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError();
    }
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(filter_1.filter(function (v, i) { return i === index; }), take_1.take(1), hasDefaultValue ? defaultIfEmpty_1.defaultIfEmpty(defaultValue) : throwIfEmpty_1.throwIfEmpty(function () { return new ArgumentOutOfRangeError_1.ArgumentOutOfRangeError(); }));
    };
}
exports.elementAt = elementAt;

},{"../util/ArgumentOutOfRangeError":213,"./defaultIfEmpty":90,"./filter":104,"./take":161,"./throwIfEmpty":168}],98:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.endWith = void 0;
var concat_1 = require("../observable/concat");
var of_1 = require("../observable/of");
function endWith() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    return function (source) { return concat_1.concat(source, of_1.of.apply(void 0, __spreadArray([], __read(values)))); };
}
exports.endWith = endWith;

},{"../observable/concat":42,"../observable/of":58}],99:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.every = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function every(predicate, thisArg) {
    return lift_1.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            if (!predicate.call(thisArg, value, index++, source)) {
                subscriber.next(false);
                subscriber.complete();
            }
        }, function () {
            subscriber.next(true);
            subscriber.complete();
        }));
    });
}
exports.every = every;

},{"../util/lift":239,"./OperatorSubscriber":68}],100:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exhaust = void 0;
var exhaustAll_1 = require("./exhaustAll");
exports.exhaust = exhaustAll_1.exhaustAll;

},{"./exhaustAll":101}],101:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exhaustAll = void 0;
var exhaustMap_1 = require("./exhaustMap");
var identity_1 = require("../util/identity");
function exhaustAll() {
    return exhaustMap_1.exhaustMap(identity_1.identity);
}
exports.exhaustAll = exhaustAll;

},{"../util/identity":228,"./exhaustMap":102}],102:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.exhaustMap = void 0;
var map_1 = require("./map");
var innerFrom_1 = require("../observable/innerFrom");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function exhaustMap(project, resultSelector) {
    if (resultSelector) {
        return function (source) {
            return source.pipe(exhaustMap(function (a, i) { return innerFrom_1.innerFrom(project(a, i)).pipe(map_1.map(function (b, ii) { return resultSelector(a, b, i, ii); })); }));
        };
    }
    return lift_1.operate(function (source, subscriber) {
        var index = 0;
        var innerSub = null;
        var isComplete = false;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (outerValue) {
            if (!innerSub) {
                innerSub = OperatorSubscriber_1.createOperatorSubscriber(subscriber, undefined, function () {
                    innerSub = null;
                    isComplete && subscriber.complete();
                });
                innerFrom_1.innerFrom(project(outerValue, index++)).subscribe(innerSub);
            }
        }, function () {
            isComplete = true;
            !innerSub && subscriber.complete();
        }));
    });
}
exports.exhaustMap = exhaustMap;

},{"../observable/innerFrom":54,"../util/lift":239,"./OperatorSubscriber":68,"./map":115}],103:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.expand = void 0;
var lift_1 = require("../util/lift");
var mergeInternals_1 = require("./mergeInternals");
function expand(project, concurrent, scheduler) {
    if (concurrent === void 0) { concurrent = Infinity; }
    concurrent = (concurrent || 0) < 1 ? Infinity : concurrent;
    return lift_1.operate(function (source, subscriber) {
        return mergeInternals_1.mergeInternals(source, subscriber, project, concurrent, undefined, true, scheduler);
    });
}
exports.expand = expand;

},{"../util/lift":239,"./mergeInternals":121}],104:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.filter = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function filter(predicate, thisArg) {
    return lift_1.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return predicate.call(thisArg, value, index++) && subscriber.next(value); }));
    });
}
exports.filter = filter;

},{"../util/lift":239,"./OperatorSubscriber":68}],105:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finalize = void 0;
var lift_1 = require("../util/lift");
function finalize(callback) {
    return lift_1.operate(function (source, subscriber) {
        try {
            source.subscribe(subscriber);
        }
        finally {
            subscriber.add(callback);
        }
    });
}
exports.finalize = finalize;

},{"../util/lift":239}],106:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFind = exports.find = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function find(predicate, thisArg) {
    return lift_1.operate(createFind(predicate, thisArg, 'value'));
}
exports.find = find;
function createFind(predicate, thisArg, emit) {
    var findIndex = emit === 'index';
    return function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var i = index++;
            if (predicate.call(thisArg, value, i, source)) {
                subscriber.next(findIndex ? i : value);
                subscriber.complete();
            }
        }, function () {
            subscriber.next(findIndex ? -1 : undefined);
            subscriber.complete();
        }));
    };
}
exports.createFind = createFind;

},{"../util/lift":239,"./OperatorSubscriber":68}],107:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findIndex = void 0;
var lift_1 = require("../util/lift");
var find_1 = require("./find");
function findIndex(predicate, thisArg) {
    return lift_1.operate(find_1.createFind(predicate, thisArg, 'index'));
}
exports.findIndex = findIndex;

},{"../util/lift":239,"./find":106}],108:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.first = void 0;
var EmptyError_1 = require("../util/EmptyError");
var filter_1 = require("./filter");
var take_1 = require("./take");
var defaultIfEmpty_1 = require("./defaultIfEmpty");
var throwIfEmpty_1 = require("./throwIfEmpty");
var identity_1 = require("../util/identity");
function first(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(predicate ? filter_1.filter(function (v, i) { return predicate(v, i, source); }) : identity_1.identity, take_1.take(1), hasDefaultValue ? defaultIfEmpty_1.defaultIfEmpty(defaultValue) : throwIfEmpty_1.throwIfEmpty(function () { return new EmptyError_1.EmptyError(); }));
    };
}
exports.first = first;

},{"../util/EmptyError":214,"../util/identity":228,"./defaultIfEmpty":90,"./filter":104,"./take":161,"./throwIfEmpty":168}],109:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.flatMap = void 0;
var mergeMap_1 = require("./mergeMap");
exports.flatMap = mergeMap_1.mergeMap;

},{"./mergeMap":122}],110:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.groupBy = void 0;
var Observable_1 = require("../Observable");
var innerFrom_1 = require("../observable/innerFrom");
var Subject_1 = require("../Subject");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function groupBy(keySelector, elementOrOptions, duration, connector) {
    return lift_1.operate(function (source, subscriber) {
        var element;
        if (!elementOrOptions || typeof elementOrOptions === 'function') {
            element = elementOrOptions;
        }
        else {
            (duration = elementOrOptions.duration, element = elementOrOptions.element, connector = elementOrOptions.connector);
        }
        var groups = new Map();
        var notify = function (cb) {
            groups.forEach(cb);
            cb(subscriber);
        };
        var handleError = function (err) { return notify(function (consumer) { return consumer.error(err); }); };
        var activeGroups = 0;
        var teardownAttempted = false;
        var groupBySourceSubscriber = new OperatorSubscriber_1.OperatorSubscriber(subscriber, function (value) {
            try {
                var key_1 = keySelector(value);
                var group_1 = groups.get(key_1);
                if (!group_1) {
                    groups.set(key_1, (group_1 = connector ? connector() : new Subject_1.Subject()));
                    var grouped = createGroupedObservable(key_1, group_1);
                    subscriber.next(grouped);
                    if (duration) {
                        var durationSubscriber_1 = OperatorSubscriber_1.createOperatorSubscriber(group_1, function () {
                            group_1.complete();
                            durationSubscriber_1 === null || durationSubscriber_1 === void 0 ? void 0 : durationSubscriber_1.unsubscribe();
                        }, undefined, undefined, function () { return groups.delete(key_1); });
                        groupBySourceSubscriber.add(innerFrom_1.innerFrom(duration(grouped)).subscribe(durationSubscriber_1));
                    }
                }
                group_1.next(element ? element(value) : value);
            }
            catch (err) {
                handleError(err);
            }
        }, function () { return notify(function (consumer) { return consumer.complete(); }); }, handleError, function () { return groups.clear(); }, function () {
            teardownAttempted = true;
            return activeGroups === 0;
        });
        source.subscribe(groupBySourceSubscriber);
        function createGroupedObservable(key, groupSubject) {
            var result = new Observable_1.Observable(function (groupSubscriber) {
                activeGroups++;
                var innerSub = groupSubject.subscribe(groupSubscriber);
                return function () {
                    innerSub.unsubscribe();
                    --activeGroups === 0 && teardownAttempted && groupBySourceSubscriber.unsubscribe();
                };
            });
            result.key = key;
            return result;
        }
    });
}
exports.groupBy = groupBy;

},{"../Observable":28,"../Subject":31,"../observable/innerFrom":54,"../util/lift":239,"./OperatorSubscriber":68}],111:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ignoreElements = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var noop_1 = require("../util/noop");
function ignoreElements() {
    return lift_1.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, noop_1.noop));
    });
}
exports.ignoreElements = ignoreElements;

},{"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],112:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isEmpty = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function isEmpty() {
    return lift_1.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
            subscriber.next(false);
            subscriber.complete();
        }, function () {
            subscriber.next(true);
            subscriber.complete();
        }));
    });
}
exports.isEmpty = isEmpty;

},{"../util/lift":239,"./OperatorSubscriber":68}],113:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.joinAllInternals = void 0;
var identity_1 = require("../util/identity");
var mapOneOrManyArgs_1 = require("../util/mapOneOrManyArgs");
var pipe_1 = require("../util/pipe");
var mergeMap_1 = require("./mergeMap");
var toArray_1 = require("./toArray");
function joinAllInternals(joinFn, project) {
    return pipe_1.pipe(toArray_1.toArray(), mergeMap_1.mergeMap(function (sources) { return joinFn(sources); }), project ? mapOneOrManyArgs_1.mapOneOrManyArgs(project) : identity_1.identity);
}
exports.joinAllInternals = joinAllInternals;

},{"../util/identity":228,"../util/mapOneOrManyArgs":240,"../util/pipe":243,"./mergeMap":122,"./toArray":173}],114:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.last = void 0;
var EmptyError_1 = require("../util/EmptyError");
var filter_1 = require("./filter");
var takeLast_1 = require("./takeLast");
var throwIfEmpty_1 = require("./throwIfEmpty");
var defaultIfEmpty_1 = require("./defaultIfEmpty");
var identity_1 = require("../util/identity");
function last(predicate, defaultValue) {
    var hasDefaultValue = arguments.length >= 2;
    return function (source) {
        return source.pipe(predicate ? filter_1.filter(function (v, i) { return predicate(v, i, source); }) : identity_1.identity, takeLast_1.takeLast(1), hasDefaultValue ? defaultIfEmpty_1.defaultIfEmpty(defaultValue) : throwIfEmpty_1.throwIfEmpty(function () { return new EmptyError_1.EmptyError(); }));
    };
}
exports.last = last;

},{"../util/EmptyError":214,"../util/identity":228,"./defaultIfEmpty":90,"./filter":104,"./takeLast":162,"./throwIfEmpty":168}],115:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.map = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function map(project, thisArg) {
    return lift_1.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            subscriber.next(project.call(thisArg, value, index++));
        }));
    });
}
exports.map = map;

},{"../util/lift":239,"./OperatorSubscriber":68}],116:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapTo = void 0;
var map_1 = require("./map");
function mapTo(value) {
    return map_1.map(function () { return value; });
}
exports.mapTo = mapTo;

},{"./map":115}],117:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.materialize = void 0;
var Notification_1 = require("../Notification");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function materialize() {
    return lift_1.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            subscriber.next(Notification_1.Notification.createNext(value));
        }, function () {
            subscriber.next(Notification_1.Notification.createComplete());
            subscriber.complete();
        }, function (err) {
            subscriber.next(Notification_1.Notification.createError(err));
            subscriber.complete();
        }));
    });
}
exports.materialize = materialize;

},{"../Notification":26,"../util/lift":239,"./OperatorSubscriber":68}],118:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.max = void 0;
var reduce_1 = require("./reduce");
var isFunction_1 = require("../util/isFunction");
function max(comparer) {
    return reduce_1.reduce(isFunction_1.isFunction(comparer) ? function (x, y) { return (comparer(x, y) > 0 ? x : y); } : function (x, y) { return (x > y ? x : y); });
}
exports.max = max;

},{"../util/isFunction":232,"./reduce":137}],119:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.merge = void 0;
var lift_1 = require("../util/lift");
var argsOrArgArray_1 = require("../util/argsOrArgArray");
var mergeAll_1 = require("./mergeAll");
var args_1 = require("../util/args");
var from_1 = require("../observable/from");
function merge() {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(args);
    var concurrent = args_1.popNumber(args, Infinity);
    args = argsOrArgArray_1.argsOrArgArray(args);
    return lift_1.operate(function (source, subscriber) {
        mergeAll_1.mergeAll(concurrent)(from_1.from(__spreadArray([source], __read(args)), scheduler)).subscribe(subscriber);
    });
}
exports.merge = merge;

},{"../observable/from":48,"../util/args":220,"../util/argsOrArgArray":222,"../util/lift":239,"./mergeAll":120}],120:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeAll = void 0;
var mergeMap_1 = require("./mergeMap");
var identity_1 = require("../util/identity");
function mergeAll(concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    return mergeMap_1.mergeMap(identity_1.identity, concurrent);
}
exports.mergeAll = mergeAll;

},{"../util/identity":228,"./mergeMap":122}],121:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeInternals = void 0;
var innerFrom_1 = require("../observable/innerFrom");
var executeSchedule_1 = require("../util/executeSchedule");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function mergeInternals(source, subscriber, project, concurrent, onBeforeNext, expand, innerSubScheduler, additionalFinalizer) {
    var buffer = [];
    var active = 0;
    var index = 0;
    var isComplete = false;
    var checkComplete = function () {
        if (isComplete && !buffer.length && !active) {
            subscriber.complete();
        }
    };
    var outerNext = function (value) { return (active < concurrent ? doInnerSub(value) : buffer.push(value)); };
    var doInnerSub = function (value) {
        expand && subscriber.next(value);
        active++;
        var innerComplete = false;
        innerFrom_1.innerFrom(project(value, index++)).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (innerValue) {
            onBeforeNext === null || onBeforeNext === void 0 ? void 0 : onBeforeNext(innerValue);
            if (expand) {
                outerNext(innerValue);
            }
            else {
                subscriber.next(innerValue);
            }
        }, function () {
            innerComplete = true;
        }, undefined, function () {
            if (innerComplete) {
                try {
                    active--;
                    var _loop_1 = function () {
                        var bufferedValue = buffer.shift();
                        if (innerSubScheduler) {
                            executeSchedule_1.executeSchedule(subscriber, innerSubScheduler, function () { return doInnerSub(bufferedValue); });
                        }
                        else {
                            doInnerSub(bufferedValue);
                        }
                    };
                    while (buffer.length && active < concurrent) {
                        _loop_1();
                    }
                    checkComplete();
                }
                catch (err) {
                    subscriber.error(err);
                }
            }
        }));
    };
    source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, outerNext, function () {
        isComplete = true;
        checkComplete();
    }));
    return function () {
        additionalFinalizer === null || additionalFinalizer === void 0 ? void 0 : additionalFinalizer();
    };
}
exports.mergeInternals = mergeInternals;

},{"../observable/innerFrom":54,"../util/executeSchedule":227,"./OperatorSubscriber":68}],122:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeMap = void 0;
var map_1 = require("./map");
var innerFrom_1 = require("../observable/innerFrom");
var lift_1 = require("../util/lift");
var mergeInternals_1 = require("./mergeInternals");
var isFunction_1 = require("../util/isFunction");
function mergeMap(project, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    if (isFunction_1.isFunction(resultSelector)) {
        return mergeMap(function (a, i) { return map_1.map(function (b, ii) { return resultSelector(a, b, i, ii); })(innerFrom_1.innerFrom(project(a, i))); }, concurrent);
    }
    else if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return lift_1.operate(function (source, subscriber) { return mergeInternals_1.mergeInternals(source, subscriber, project, concurrent); });
}
exports.mergeMap = mergeMap;

},{"../observable/innerFrom":54,"../util/isFunction":232,"../util/lift":239,"./map":115,"./mergeInternals":121}],123:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeMapTo = void 0;
var mergeMap_1 = require("./mergeMap");
var isFunction_1 = require("../util/isFunction");
function mergeMapTo(innerObservable, resultSelector, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    if (isFunction_1.isFunction(resultSelector)) {
        return mergeMap_1.mergeMap(function () { return innerObservable; }, resultSelector, concurrent);
    }
    if (typeof resultSelector === 'number') {
        concurrent = resultSelector;
    }
    return mergeMap_1.mergeMap(function () { return innerObservable; }, concurrent);
}
exports.mergeMapTo = mergeMapTo;

},{"../util/isFunction":232,"./mergeMap":122}],124:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeScan = void 0;
var lift_1 = require("../util/lift");
var mergeInternals_1 = require("./mergeInternals");
function mergeScan(accumulator, seed, concurrent) {
    if (concurrent === void 0) { concurrent = Infinity; }
    return lift_1.operate(function (source, subscriber) {
        var state = seed;
        return mergeInternals_1.mergeInternals(source, subscriber, function (value, index) { return accumulator(state, value, index); }, concurrent, function (value) {
            state = value;
        }, false, undefined, function () { return (state = null); });
    });
}
exports.mergeScan = mergeScan;

},{"../util/lift":239,"./mergeInternals":121}],125:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeWith = void 0;
var merge_1 = require("./merge");
function mergeWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return merge_1.merge.apply(void 0, __spreadArray([], __read(otherSources)));
}
exports.mergeWith = mergeWith;

},{"./merge":119}],126:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.min = void 0;
var reduce_1 = require("./reduce");
var isFunction_1 = require("../util/isFunction");
function min(comparer) {
    return reduce_1.reduce(isFunction_1.isFunction(comparer) ? function (x, y) { return (comparer(x, y) < 0 ? x : y); } : function (x, y) { return (x < y ? x : y); });
}
exports.min = min;

},{"../util/isFunction":232,"./reduce":137}],127:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.multicast = void 0;
var ConnectableObservable_1 = require("../observable/ConnectableObservable");
var isFunction_1 = require("../util/isFunction");
var connect_1 = require("./connect");
function multicast(subjectOrSubjectFactory, selector) {
    var subjectFactory = isFunction_1.isFunction(subjectOrSubjectFactory) ? subjectOrSubjectFactory : function () { return subjectOrSubjectFactory; };
    if (isFunction_1.isFunction(selector)) {
        return connect_1.connect(selector, {
            connector: subjectFactory,
        });
    }
    return function (source) { return new ConnectableObservable_1.ConnectableObservable(source, subjectFactory); };
}
exports.multicast = multicast;

},{"../observable/ConnectableObservable":37,"../util/isFunction":232,"./connect":86}],128:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observeOn = void 0;
var executeSchedule_1 = require("../util/executeSchedule");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function observeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return lift_1.operate(function (source, subscriber) {
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return executeSchedule_1.executeSchedule(subscriber, scheduler, function () { return subscriber.next(value); }, delay); }, function () { return executeSchedule_1.executeSchedule(subscriber, scheduler, function () { return subscriber.complete(); }, delay); }, function (err) { return executeSchedule_1.executeSchedule(subscriber, scheduler, function () { return subscriber.error(err); }, delay); }));
    });
}
exports.observeOn = observeOn;

},{"../util/executeSchedule":227,"../util/lift":239,"./OperatorSubscriber":68}],129:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onErrorResumeNext = void 0;
var lift_1 = require("../util/lift");
var innerFrom_1 = require("../observable/innerFrom");
var argsOrArgArray_1 = require("../util/argsOrArgArray");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var noop_1 = require("../util/noop");
function onErrorResumeNext() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    var nextSources = argsOrArgArray_1.argsOrArgArray(sources);
    return lift_1.operate(function (source, subscriber) {
        var remaining = __spreadArray([source], __read(nextSources));
        var subscribeNext = function () {
            if (!subscriber.closed) {
                if (remaining.length > 0) {
                    var nextSource = void 0;
                    try {
                        nextSource = innerFrom_1.innerFrom(remaining.shift());
                    }
                    catch (err) {
                        subscribeNext();
                        return;
                    }
                    var innerSub = OperatorSubscriber_1.createOperatorSubscriber(subscriber, undefined, noop_1.noop, noop_1.noop);
                    nextSource.subscribe(innerSub);
                    innerSub.add(subscribeNext);
                }
                else {
                    subscriber.complete();
                }
            }
        };
        subscribeNext();
    });
}
exports.onErrorResumeNext = onErrorResumeNext;

},{"../observable/innerFrom":54,"../util/argsOrArgArray":222,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],130:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pairwise = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function pairwise() {
    return lift_1.operate(function (source, subscriber) {
        var prev;
        var hasPrev = false;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var p = prev;
            prev = value;
            hasPrev && subscriber.next([p, value]);
            hasPrev = true;
        }));
    });
}
exports.pairwise = pairwise;

},{"../util/lift":239,"./OperatorSubscriber":68}],131:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pluck = void 0;
var map_1 = require("./map");
function pluck() {
    var properties = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        properties[_i] = arguments[_i];
    }
    var length = properties.length;
    if (length === 0) {
        throw new Error('list of properties cannot be empty.');
    }
    return map_1.map(function (x) {
        var currentProp = x;
        for (var i = 0; i < length; i++) {
            var p = currentProp === null || currentProp === void 0 ? void 0 : currentProp[properties[i]];
            if (typeof p !== 'undefined') {
                currentProp = p;
            }
            else {
                return undefined;
            }
        }
        return currentProp;
    });
}
exports.pluck = pluck;

},{"./map":115}],132:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publish = void 0;
var Subject_1 = require("../Subject");
var multicast_1 = require("./multicast");
var connect_1 = require("./connect");
function publish(selector) {
    return selector ? function (source) { return connect_1.connect(selector)(source); } : function (source) { return multicast_1.multicast(new Subject_1.Subject())(source); };
}
exports.publish = publish;

},{"../Subject":31,"./connect":86,"./multicast":127}],133:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishBehavior = void 0;
var BehaviorSubject_1 = require("../BehaviorSubject");
var ConnectableObservable_1 = require("../observable/ConnectableObservable");
function publishBehavior(initialValue) {
    return function (source) {
        var subject = new BehaviorSubject_1.BehaviorSubject(initialValue);
        return new ConnectableObservable_1.ConnectableObservable(source, function () { return subject; });
    };
}
exports.publishBehavior = publishBehavior;

},{"../BehaviorSubject":25,"../observable/ConnectableObservable":37}],134:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishLast = void 0;
var AsyncSubject_1 = require("../AsyncSubject");
var ConnectableObservable_1 = require("../observable/ConnectableObservable");
function publishLast() {
    return function (source) {
        var subject = new AsyncSubject_1.AsyncSubject();
        return new ConnectableObservable_1.ConnectableObservable(source, function () { return subject; });
    };
}
exports.publishLast = publishLast;

},{"../AsyncSubject":24,"../observable/ConnectableObservable":37}],135:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publishReplay = void 0;
var ReplaySubject_1 = require("../ReplaySubject");
var multicast_1 = require("./multicast");
var isFunction_1 = require("../util/isFunction");
function publishReplay(bufferSize, windowTime, selectorOrScheduler, timestampProvider) {
    if (selectorOrScheduler && !isFunction_1.isFunction(selectorOrScheduler)) {
        timestampProvider = selectorOrScheduler;
    }
    var selector = isFunction_1.isFunction(selectorOrScheduler) ? selectorOrScheduler : undefined;
    return function (source) { return multicast_1.multicast(new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, timestampProvider), selector)(source); };
}
exports.publishReplay = publishReplay;

},{"../ReplaySubject":29,"../util/isFunction":232,"./multicast":127}],136:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.raceWith = void 0;
var race_1 = require("../observable/race");
var lift_1 = require("../util/lift");
var identity_1 = require("../util/identity");
function raceWith() {
    var otherSources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherSources[_i] = arguments[_i];
    }
    return !otherSources.length
        ? identity_1.identity
        : lift_1.operate(function (source, subscriber) {
            race_1.raceInit(__spreadArray([source], __read(otherSources)))(subscriber);
        });
}
exports.raceWith = raceWith;

},{"../observable/race":62,"../util/identity":228,"../util/lift":239}],137:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduce = void 0;
var scanInternals_1 = require("./scanInternals");
var lift_1 = require("../util/lift");
function reduce(accumulator, seed) {
    return lift_1.operate(scanInternals_1.scanInternals(accumulator, seed, arguments.length >= 2, false, true));
}
exports.reduce = reduce;

},{"../util/lift":239,"./scanInternals":146}],138:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.refCount = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function refCount() {
    return lift_1.operate(function (source, subscriber) {
        var connection = null;
        source._refCount++;
        var refCounter = OperatorSubscriber_1.createOperatorSubscriber(subscriber, undefined, undefined, undefined, function () {
            if (!source || source._refCount <= 0 || 0 < --source._refCount) {
                connection = null;
                return;
            }
            var sharedConnection = source._connection;
            var conn = connection;
            connection = null;
            if (sharedConnection && (!conn || sharedConnection === conn)) {
                sharedConnection.unsubscribe();
            }
            subscriber.unsubscribe();
        });
        source.subscribe(refCounter);
        if (!refCounter.closed) {
            connection = source.connect();
        }
    });
}
exports.refCount = refCount;

},{"../util/lift":239,"./OperatorSubscriber":68}],139:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repeat = void 0;
var empty_1 = require("../observable/empty");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
var timer_1 = require("../observable/timer");
function repeat(countOrConfig) {
    var _a;
    var count = Infinity;
    var delay;
    if (countOrConfig != null) {
        if (typeof countOrConfig === 'object') {
            (_a = countOrConfig.count, count = _a === void 0 ? Infinity : _a, delay = countOrConfig.delay);
        }
        else {
            count = countOrConfig;
        }
    }
    return count <= 0
        ? function () { return empty_1.EMPTY; }
        : lift_1.operate(function (source, subscriber) {
            var soFar = 0;
            var sourceSub;
            var resubscribe = function () {
                sourceSub === null || sourceSub === void 0 ? void 0 : sourceSub.unsubscribe();
                sourceSub = null;
                if (delay != null) {
                    var notifier = typeof delay === 'number' ? timer_1.timer(delay) : innerFrom_1.innerFrom(delay(soFar));
                    var notifierSubscriber_1 = OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
                        notifierSubscriber_1.unsubscribe();
                        subscribeToSource();
                    });
                    notifier.subscribe(notifierSubscriber_1);
                }
                else {
                    subscribeToSource();
                }
            };
            var subscribeToSource = function () {
                var syncUnsub = false;
                sourceSub = source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, undefined, function () {
                    if (++soFar < count) {
                        if (sourceSub) {
                            resubscribe();
                        }
                        else {
                            syncUnsub = true;
                        }
                    }
                    else {
                        subscriber.complete();
                    }
                }));
                if (syncUnsub) {
                    resubscribe();
                }
            };
            subscribeToSource();
        });
}
exports.repeat = repeat;

},{"../observable/empty":46,"../observable/innerFrom":54,"../observable/timer":65,"../util/lift":239,"./OperatorSubscriber":68}],140:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.repeatWhen = void 0;
var Subject_1 = require("../Subject");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function repeatWhen(notifier) {
    return lift_1.operate(function (source, subscriber) {
        var innerSub;
        var syncResub = false;
        var completions$;
        var isNotifierComplete = false;
        var isMainComplete = false;
        var checkComplete = function () { return isMainComplete && isNotifierComplete && (subscriber.complete(), true); };
        var getCompletionSubject = function () {
            if (!completions$) {
                completions$ = new Subject_1.Subject();
                notifier(completions$).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
                    if (innerSub) {
                        subscribeForRepeatWhen();
                    }
                    else {
                        syncResub = true;
                    }
                }, function () {
                    isNotifierComplete = true;
                    checkComplete();
                }));
            }
            return completions$;
        };
        var subscribeForRepeatWhen = function () {
            isMainComplete = false;
            innerSub = source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, undefined, function () {
                isMainComplete = true;
                !checkComplete() && getCompletionSubject().next();
            }));
            if (syncResub) {
                innerSub.unsubscribe();
                innerSub = null;
                syncResub = false;
                subscribeForRepeatWhen();
            }
        };
        subscribeForRepeatWhen();
    });
}
exports.repeatWhen = repeatWhen;

},{"../Subject":31,"../util/lift":239,"./OperatorSubscriber":68}],141:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var identity_1 = require("../util/identity");
var timer_1 = require("../observable/timer");
var innerFrom_1 = require("../observable/innerFrom");
function retry(configOrCount) {
    if (configOrCount === void 0) { configOrCount = Infinity; }
    var config;
    if (configOrCount && typeof configOrCount === 'object') {
        config = configOrCount;
    }
    else {
        config = {
            count: configOrCount,
        };
    }
    var _a = config.count, count = _a === void 0 ? Infinity : _a, delay = config.delay, _b = config.resetOnSuccess, resetOnSuccess = _b === void 0 ? false : _b;
    return count <= 0
        ? identity_1.identity
        : lift_1.operate(function (source, subscriber) {
            var soFar = 0;
            var innerSub;
            var subscribeForRetry = function () {
                var syncUnsub = false;
                innerSub = source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                    if (resetOnSuccess) {
                        soFar = 0;
                    }
                    subscriber.next(value);
                }, undefined, function (err) {
                    if (soFar++ < count) {
                        var resub_1 = function () {
                            if (innerSub) {
                                innerSub.unsubscribe();
                                innerSub = null;
                                subscribeForRetry();
                            }
                            else {
                                syncUnsub = true;
                            }
                        };
                        if (delay != null) {
                            var notifier = typeof delay === 'number' ? timer_1.timer(delay) : innerFrom_1.innerFrom(delay(err, soFar));
                            var notifierSubscriber_1 = OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
                                notifierSubscriber_1.unsubscribe();
                                resub_1();
                            }, function () {
                                subscriber.complete();
                            });
                            notifier.subscribe(notifierSubscriber_1);
                        }
                        else {
                            resub_1();
                        }
                    }
                    else {
                        subscriber.error(err);
                    }
                }));
                if (syncUnsub) {
                    innerSub.unsubscribe();
                    innerSub = null;
                    subscribeForRetry();
                }
            };
            subscribeForRetry();
        });
}
exports.retry = retry;

},{"../observable/innerFrom":54,"../observable/timer":65,"../util/identity":228,"../util/lift":239,"./OperatorSubscriber":68}],142:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retryWhen = void 0;
var Subject_1 = require("../Subject");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function retryWhen(notifier) {
    return lift_1.operate(function (source, subscriber) {
        var innerSub;
        var syncResub = false;
        var errors$;
        var subscribeForRetryWhen = function () {
            innerSub = source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, undefined, undefined, function (err) {
                if (!errors$) {
                    errors$ = new Subject_1.Subject();
                    notifier(errors$).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
                        return innerSub ? subscribeForRetryWhen() : (syncResub = true);
                    }));
                }
                if (errors$) {
                    errors$.next(err);
                }
            }));
            if (syncResub) {
                innerSub.unsubscribe();
                innerSub = null;
                syncResub = false;
                subscribeForRetryWhen();
            }
        };
        subscribeForRetryWhen();
    });
}
exports.retryWhen = retryWhen;

},{"../Subject":31,"../util/lift":239,"./OperatorSubscriber":68}],143:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sample = void 0;
var lift_1 = require("../util/lift");
var noop_1 = require("../util/noop");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function sample(notifier) {
    return lift_1.operate(function (source, subscriber) {
        var hasValue = false;
        var lastValue = null;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            lastValue = value;
        }));
        notifier.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
            if (hasValue) {
                hasValue = false;
                var value = lastValue;
                lastValue = null;
                subscriber.next(value);
            }
        }, noop_1.noop));
    });
}
exports.sample = sample;

},{"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],144:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sampleTime = void 0;
var async_1 = require("../scheduler/async");
var sample_1 = require("./sample");
var interval_1 = require("../observable/interval");
function sampleTime(period, scheduler) {
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    return sample_1.sample(interval_1.interval(period, scheduler));
}
exports.sampleTime = sampleTime;

},{"../observable/interval":55,"../scheduler/async":203,"./sample":143}],145:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scan = void 0;
var lift_1 = require("../util/lift");
var scanInternals_1 = require("./scanInternals");
function scan(accumulator, seed) {
    return lift_1.operate(scanInternals_1.scanInternals(accumulator, seed, arguments.length >= 2, true));
}
exports.scan = scan;

},{"../util/lift":239,"./scanInternals":146}],146:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scanInternals = void 0;
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function scanInternals(accumulator, seed, hasSeed, emitOnNext, emitBeforeComplete) {
    return function (source, subscriber) {
        var hasState = hasSeed;
        var state = seed;
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var i = index++;
            state = hasState
                ?
                    accumulator(state, value, i)
                :
                    ((hasState = true), value);
            emitOnNext && subscriber.next(state);
        }, emitBeforeComplete &&
            (function () {
                hasState && subscriber.next(state);
                subscriber.complete();
            })));
    };
}
exports.scanInternals = scanInternals;

},{"./OperatorSubscriber":68}],147:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sequenceEqual = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function sequenceEqual(compareTo, comparator) {
    if (comparator === void 0) { comparator = function (a, b) { return a === b; }; }
    return lift_1.operate(function (source, subscriber) {
        var aState = createState();
        var bState = createState();
        var emit = function (isEqual) {
            subscriber.next(isEqual);
            subscriber.complete();
        };
        var createSubscriber = function (selfState, otherState) {
            var sequenceEqualSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (a) {
                var buffer = otherState.buffer, complete = otherState.complete;
                if (buffer.length === 0) {
                    complete ? emit(false) : selfState.buffer.push(a);
                }
                else {
                    !comparator(a, buffer.shift()) && emit(false);
                }
            }, function () {
                selfState.complete = true;
                var complete = otherState.complete, buffer = otherState.buffer;
                complete && emit(buffer.length === 0);
                sequenceEqualSubscriber === null || sequenceEqualSubscriber === void 0 ? void 0 : sequenceEqualSubscriber.unsubscribe();
            });
            return sequenceEqualSubscriber;
        };
        source.subscribe(createSubscriber(aState, bState));
        compareTo.subscribe(createSubscriber(bState, aState));
    });
}
exports.sequenceEqual = sequenceEqual;
function createState() {
    return {
        buffer: [],
        complete: false,
    };
}

},{"../util/lift":239,"./OperatorSubscriber":68}],148:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.share = void 0;
var innerFrom_1 = require("../observable/innerFrom");
var Subject_1 = require("../Subject");
var Subscriber_1 = require("../Subscriber");
var lift_1 = require("../util/lift");
function share(options) {
    if (options === void 0) { options = {}; }
    var _a = options.connector, connector = _a === void 0 ? function () { return new Subject_1.Subject(); } : _a, _b = options.resetOnError, resetOnError = _b === void 0 ? true : _b, _c = options.resetOnComplete, resetOnComplete = _c === void 0 ? true : _c, _d = options.resetOnRefCountZero, resetOnRefCountZero = _d === void 0 ? true : _d;
    return function (wrapperSource) {
        var connection;
        var resetConnection;
        var subject;
        var refCount = 0;
        var hasCompleted = false;
        var hasErrored = false;
        var cancelReset = function () {
            resetConnection === null || resetConnection === void 0 ? void 0 : resetConnection.unsubscribe();
            resetConnection = undefined;
        };
        var reset = function () {
            cancelReset();
            connection = subject = undefined;
            hasCompleted = hasErrored = false;
        };
        var resetAndUnsubscribe = function () {
            var conn = connection;
            reset();
            conn === null || conn === void 0 ? void 0 : conn.unsubscribe();
        };
        return lift_1.operate(function (source, subscriber) {
            refCount++;
            if (!hasErrored && !hasCompleted) {
                cancelReset();
            }
            var dest = (subject = subject !== null && subject !== void 0 ? subject : connector());
            subscriber.add(function () {
                refCount--;
                if (refCount === 0 && !hasErrored && !hasCompleted) {
                    resetConnection = handleReset(resetAndUnsubscribe, resetOnRefCountZero);
                }
            });
            dest.subscribe(subscriber);
            if (!connection &&
                refCount > 0) {
                connection = new Subscriber_1.SafeSubscriber({
                    next: function (value) { return dest.next(value); },
                    error: function (err) {
                        hasErrored = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnError, err);
                        dest.error(err);
                    },
                    complete: function () {
                        hasCompleted = true;
                        cancelReset();
                        resetConnection = handleReset(reset, resetOnComplete);
                        dest.complete();
                    },
                });
                innerFrom_1.innerFrom(source).subscribe(connection);
            }
        })(wrapperSource);
    };
}
exports.share = share;
function handleReset(reset, on) {
    var args = [];
    for (var _i = 2; _i < arguments.length; _i++) {
        args[_i - 2] = arguments[_i];
    }
    if (on === true) {
        reset();
        return;
    }
    if (on === false) {
        return;
    }
    var onSubscriber = new Subscriber_1.SafeSubscriber({
        next: function () {
            onSubscriber.unsubscribe();
            reset();
        },
    });
    return on.apply(void 0, __spreadArray([], __read(args))).subscribe(onSubscriber);
}

},{"../Subject":31,"../Subscriber":32,"../observable/innerFrom":54,"../util/lift":239}],149:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shareReplay = void 0;
var ReplaySubject_1 = require("../ReplaySubject");
var share_1 = require("./share");
function shareReplay(configOrBufferSize, windowTime, scheduler) {
    var _a, _b, _c;
    var bufferSize;
    var refCount = false;
    if (configOrBufferSize && typeof configOrBufferSize === 'object') {
        (_a = configOrBufferSize.bufferSize, bufferSize = _a === void 0 ? Infinity : _a, _b = configOrBufferSize.windowTime, windowTime = _b === void 0 ? Infinity : _b, _c = configOrBufferSize.refCount, refCount = _c === void 0 ? false : _c, scheduler = configOrBufferSize.scheduler);
    }
    else {
        bufferSize = (configOrBufferSize !== null && configOrBufferSize !== void 0 ? configOrBufferSize : Infinity);
    }
    return share_1.share({
        connector: function () { return new ReplaySubject_1.ReplaySubject(bufferSize, windowTime, scheduler); },
        resetOnError: true,
        resetOnComplete: false,
        resetOnRefCountZero: refCount,
    });
}
exports.shareReplay = shareReplay;

},{"../ReplaySubject":29,"./share":148}],150:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.single = void 0;
var EmptyError_1 = require("../util/EmptyError");
var SequenceError_1 = require("../util/SequenceError");
var NotFoundError_1 = require("../util/NotFoundError");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function single(predicate) {
    return lift_1.operate(function (source, subscriber) {
        var hasValue = false;
        var singleValue;
        var seenValue = false;
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            seenValue = true;
            if (!predicate || predicate(value, index++, source)) {
                hasValue && subscriber.error(new SequenceError_1.SequenceError('Too many matching values'));
                hasValue = true;
                singleValue = value;
            }
        }, function () {
            if (hasValue) {
                subscriber.next(singleValue);
                subscriber.complete();
            }
            else {
                subscriber.error(seenValue ? new NotFoundError_1.NotFoundError('No matching values') : new EmptyError_1.EmptyError());
            }
        }));
    });
}
exports.single = single;

},{"../util/EmptyError":214,"../util/NotFoundError":216,"../util/SequenceError":218,"../util/lift":239,"./OperatorSubscriber":68}],151:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skip = void 0;
var filter_1 = require("./filter");
function skip(count) {
    return filter_1.filter(function (_, index) { return count <= index; });
}
exports.skip = skip;

},{"./filter":104}],152:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipLast = void 0;
var identity_1 = require("../util/identity");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function skipLast(skipCount) {
    return skipCount <= 0
        ?
            identity_1.identity
        : lift_1.operate(function (source, subscriber) {
            var ring = new Array(skipCount);
            var seen = 0;
            source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                var valueIndex = seen++;
                if (valueIndex < skipCount) {
                    ring[valueIndex] = value;
                }
                else {
                    var index = valueIndex % skipCount;
                    var oldValue = ring[index];
                    ring[index] = value;
                    subscriber.next(oldValue);
                }
            }));
            return function () {
                ring = null;
            };
        });
}
exports.skipLast = skipLast;

},{"../util/identity":228,"../util/lift":239,"./OperatorSubscriber":68}],153:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipUntil = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
var noop_1 = require("../util/noop");
function skipUntil(notifier) {
    return lift_1.operate(function (source, subscriber) {
        var taking = false;
        var skipSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
            skipSubscriber === null || skipSubscriber === void 0 ? void 0 : skipSubscriber.unsubscribe();
            taking = true;
        }, noop_1.noop);
        innerFrom_1.innerFrom(notifier).subscribe(skipSubscriber);
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return taking && subscriber.next(value); }));
    });
}
exports.skipUntil = skipUntil;

},{"../observable/innerFrom":54,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],154:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.skipWhile = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function skipWhile(predicate) {
    return lift_1.operate(function (source, subscriber) {
        var taking = false;
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return (taking || (taking = !predicate(value, index++))) && subscriber.next(value); }));
    });
}
exports.skipWhile = skipWhile;

},{"../util/lift":239,"./OperatorSubscriber":68}],155:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startWith = void 0;
var concat_1 = require("../observable/concat");
var args_1 = require("../util/args");
var lift_1 = require("../util/lift");
function startWith() {
    var values = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        values[_i] = arguments[_i];
    }
    var scheduler = args_1.popScheduler(values);
    return lift_1.operate(function (source, subscriber) {
        (scheduler ? concat_1.concat(values, source, scheduler) : concat_1.concat(values, source)).subscribe(subscriber);
    });
}
exports.startWith = startWith;

},{"../observable/concat":42,"../util/args":220,"../util/lift":239}],156:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.subscribeOn = void 0;
var lift_1 = require("../util/lift");
function subscribeOn(scheduler, delay) {
    if (delay === void 0) { delay = 0; }
    return lift_1.operate(function (source, subscriber) {
        subscriber.add(scheduler.schedule(function () { return source.subscribe(subscriber); }, delay));
    });
}
exports.subscribeOn = subscribeOn;

},{"../util/lift":239}],157:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchAll = void 0;
var switchMap_1 = require("./switchMap");
var identity_1 = require("../util/identity");
function switchAll() {
    return switchMap_1.switchMap(identity_1.identity);
}
exports.switchAll = switchAll;

},{"../util/identity":228,"./switchMap":158}],158:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchMap = void 0;
var innerFrom_1 = require("../observable/innerFrom");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function switchMap(project, resultSelector) {
    return lift_1.operate(function (source, subscriber) {
        var innerSubscriber = null;
        var index = 0;
        var isComplete = false;
        var checkComplete = function () { return isComplete && !innerSubscriber && subscriber.complete(); };
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            innerSubscriber === null || innerSubscriber === void 0 ? void 0 : innerSubscriber.unsubscribe();
            var innerIndex = 0;
            var outerIndex = index++;
            innerFrom_1.innerFrom(project(value, outerIndex)).subscribe((innerSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (innerValue) { return subscriber.next(resultSelector ? resultSelector(value, innerValue, outerIndex, innerIndex++) : innerValue); }, function () {
                innerSubscriber = null;
                checkComplete();
            })));
        }, function () {
            isComplete = true;
            checkComplete();
        }));
    });
}
exports.switchMap = switchMap;

},{"../observable/innerFrom":54,"../util/lift":239,"./OperatorSubscriber":68}],159:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchMapTo = void 0;
var switchMap_1 = require("./switchMap");
var isFunction_1 = require("../util/isFunction");
function switchMapTo(innerObservable, resultSelector) {
    return isFunction_1.isFunction(resultSelector) ? switchMap_1.switchMap(function () { return innerObservable; }, resultSelector) : switchMap_1.switchMap(function () { return innerObservable; });
}
exports.switchMapTo = switchMapTo;

},{"../util/isFunction":232,"./switchMap":158}],160:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.switchScan = void 0;
var switchMap_1 = require("./switchMap");
var lift_1 = require("../util/lift");
function switchScan(accumulator, seed) {
    return lift_1.operate(function (source, subscriber) {
        var state = seed;
        switchMap_1.switchMap(function (value, index) { return accumulator(state, value, index); }, function (_, innerValue) { return ((state = innerValue), innerValue); })(source).subscribe(subscriber);
        return function () {
            state = null;
        };
    });
}
exports.switchScan = switchScan;

},{"../util/lift":239,"./switchMap":158}],161:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.take = void 0;
var empty_1 = require("../observable/empty");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function take(count) {
    return count <= 0
        ?
            function () { return empty_1.EMPTY; }
        : lift_1.operate(function (source, subscriber) {
            var seen = 0;
            source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                if (++seen <= count) {
                    subscriber.next(value);
                    if (count <= seen) {
                        subscriber.complete();
                    }
                }
            }));
        });
}
exports.take = take;

},{"../observable/empty":46,"../util/lift":239,"./OperatorSubscriber":68}],162:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeLast = void 0;
var empty_1 = require("../observable/empty");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function takeLast(count) {
    return count <= 0
        ? function () { return empty_1.EMPTY; }
        : lift_1.operate(function (source, subscriber) {
            var buffer = [];
            source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                buffer.push(value);
                count < buffer.length && buffer.shift();
            }, function () {
                var e_1, _a;
                try {
                    for (var buffer_1 = __values(buffer), buffer_1_1 = buffer_1.next(); !buffer_1_1.done; buffer_1_1 = buffer_1.next()) {
                        var value = buffer_1_1.value;
                        subscriber.next(value);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (buffer_1_1 && !buffer_1_1.done && (_a = buffer_1.return)) _a.call(buffer_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                subscriber.complete();
            }, undefined, function () {
                buffer = null;
            }));
        });
}
exports.takeLast = takeLast;

},{"../observable/empty":46,"../util/lift":239,"./OperatorSubscriber":68}],163:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeUntil = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
var noop_1 = require("../util/noop");
function takeUntil(notifier) {
    return lift_1.operate(function (source, subscriber) {
        innerFrom_1.innerFrom(notifier).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () { return subscriber.complete(); }, noop_1.noop));
        !subscriber.closed && source.subscribe(subscriber);
    });
}
exports.takeUntil = takeUntil;

},{"../observable/innerFrom":54,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],164:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.takeWhile = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function takeWhile(predicate, inclusive) {
    if (inclusive === void 0) { inclusive = false; }
    return lift_1.operate(function (source, subscriber) {
        var index = 0;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var result = predicate(value, index++);
            (result || inclusive) && subscriber.next(value);
            !result && subscriber.complete();
        }));
    });
}
exports.takeWhile = takeWhile;

},{"../util/lift":239,"./OperatorSubscriber":68}],165:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tap = void 0;
var isFunction_1 = require("../util/isFunction");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var identity_1 = require("../util/identity");
function tap(observerOrNext, error, complete) {
    var tapObserver = isFunction_1.isFunction(observerOrNext) || error || complete
        ?
            { next: observerOrNext, error: error, complete: complete }
        : observerOrNext;
    return tapObserver
        ? lift_1.operate(function (source, subscriber) {
            var _a;
            (_a = tapObserver.subscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
            var isUnsub = true;
            source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                var _a;
                (_a = tapObserver.next) === null || _a === void 0 ? void 0 : _a.call(tapObserver, value);
                subscriber.next(value);
            }, function () {
                var _a;
                isUnsub = false;
                (_a = tapObserver.complete) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                subscriber.complete();
            }, function (err) {
                var _a;
                isUnsub = false;
                (_a = tapObserver.error) === null || _a === void 0 ? void 0 : _a.call(tapObserver, err);
                subscriber.error(err);
            }, function () {
                var _a, _b;
                if (isUnsub) {
                    (_a = tapObserver.unsubscribe) === null || _a === void 0 ? void 0 : _a.call(tapObserver);
                }
                (_b = tapObserver.finalize) === null || _b === void 0 ? void 0 : _b.call(tapObserver);
            }));
        })
        :
            identity_1.identity;
}
exports.tap = tap;

},{"../util/identity":228,"../util/isFunction":232,"../util/lift":239,"./OperatorSubscriber":68}],166:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttle = exports.defaultThrottleConfig = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
exports.defaultThrottleConfig = {
    leading: true,
    trailing: false,
};
function throttle(durationSelector, config) {
    if (config === void 0) { config = exports.defaultThrottleConfig; }
    return lift_1.operate(function (source, subscriber) {
        var leading = config.leading, trailing = config.trailing;
        var hasValue = false;
        var sendValue = null;
        var throttled = null;
        var isComplete = false;
        var endThrottling = function () {
            throttled === null || throttled === void 0 ? void 0 : throttled.unsubscribe();
            throttled = null;
            if (trailing) {
                send();
                isComplete && subscriber.complete();
            }
        };
        var cleanupThrottling = function () {
            throttled = null;
            isComplete && subscriber.complete();
        };
        var startThrottle = function (value) {
            return (throttled = innerFrom_1.innerFrom(durationSelector(value)).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, endThrottling, cleanupThrottling)));
        };
        var send = function () {
            if (hasValue) {
                hasValue = false;
                var value = sendValue;
                sendValue = null;
                subscriber.next(value);
                !isComplete && startThrottle(value);
            }
        };
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            sendValue = value;
            !(throttled && !throttled.closed) && (leading ? send() : startThrottle(value));
        }, function () {
            isComplete = true;
            !(trailing && hasValue && throttled && !throttled.closed) && subscriber.complete();
        }));
    });
}
exports.throttle = throttle;

},{"../observable/innerFrom":54,"../util/lift":239,"./OperatorSubscriber":68}],167:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throttleTime = void 0;
var async_1 = require("../scheduler/async");
var throttle_1 = require("./throttle");
var timer_1 = require("../observable/timer");
function throttleTime(duration, scheduler, config) {
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    if (config === void 0) { config = throttle_1.defaultThrottleConfig; }
    var duration$ = timer_1.timer(duration, scheduler);
    return throttle_1.throttle(function () { return duration$; }, config);
}
exports.throttleTime = throttleTime;

},{"../observable/timer":65,"../scheduler/async":203,"./throttle":166}],168:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.throwIfEmpty = void 0;
var EmptyError_1 = require("../util/EmptyError");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function throwIfEmpty(errorFactory) {
    if (errorFactory === void 0) { errorFactory = defaultErrorFactory; }
    return lift_1.operate(function (source, subscriber) {
        var hasValue = false;
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            hasValue = true;
            subscriber.next(value);
        }, function () { return (hasValue ? subscriber.complete() : subscriber.error(errorFactory())); }));
    });
}
exports.throwIfEmpty = throwIfEmpty;
function defaultErrorFactory() {
    return new EmptyError_1.EmptyError();
}

},{"../util/EmptyError":214,"../util/lift":239,"./OperatorSubscriber":68}],169:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeInterval = exports.timeInterval = void 0;
var async_1 = require("../scheduler/async");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function timeInterval(scheduler) {
    if (scheduler === void 0) { scheduler = async_1.asyncScheduler; }
    return lift_1.operate(function (source, subscriber) {
        var last = scheduler.now();
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var now = scheduler.now();
            var interval = now - last;
            last = now;
            subscriber.next(new TimeInterval(value, interval));
        }));
    });
}
exports.timeInterval = timeInterval;
var TimeInterval = (function () {
    function TimeInterval(value, interval) {
        this.value = value;
        this.interval = interval;
    }
    return TimeInterval;
}());
exports.TimeInterval = TimeInterval;

},{"../scheduler/async":203,"../util/lift":239,"./OperatorSubscriber":68}],170:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeout = exports.TimeoutError = void 0;
var async_1 = require("../scheduler/async");
var isDate_1 = require("../util/isDate");
var lift_1 = require("../util/lift");
var innerFrom_1 = require("../observable/innerFrom");
var createErrorClass_1 = require("../util/createErrorClass");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var executeSchedule_1 = require("../util/executeSchedule");
exports.TimeoutError = createErrorClass_1.createErrorClass(function (_super) {
    return function TimeoutErrorImpl(info) {
        if (info === void 0) { info = null; }
        _super(this);
        this.message = 'Timeout has occurred';
        this.name = 'TimeoutError';
        this.info = info;
    };
});
function timeout(config, schedulerArg) {
    var _a = (isDate_1.isValidDate(config) ? { first: config } : typeof config === 'number' ? { each: config } : config), first = _a.first, each = _a.each, _b = _a.with, _with = _b === void 0 ? timeoutErrorFactory : _b, _c = _a.scheduler, scheduler = _c === void 0 ? schedulerArg !== null && schedulerArg !== void 0 ? schedulerArg : async_1.asyncScheduler : _c, _d = _a.meta, meta = _d === void 0 ? null : _d;
    if (first == null && each == null) {
        throw new TypeError('No timeout provided.');
    }
    return lift_1.operate(function (source, subscriber) {
        var originalSourceSubscription;
        var timerSubscription;
        var lastValue = null;
        var seen = 0;
        var startTimer = function (delay) {
            timerSubscription = executeSchedule_1.executeSchedule(subscriber, scheduler, function () {
                try {
                    originalSourceSubscription.unsubscribe();
                    innerFrom_1.innerFrom(_with({
                        meta: meta,
                        lastValue: lastValue,
                        seen: seen,
                    })).subscribe(subscriber);
                }
                catch (err) {
                    subscriber.error(err);
                }
            }, delay);
        };
        originalSourceSubscription = source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
            seen++;
            subscriber.next((lastValue = value));
            each > 0 && startTimer(each);
        }, undefined, undefined, function () {
            if (!(timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.closed)) {
                timerSubscription === null || timerSubscription === void 0 ? void 0 : timerSubscription.unsubscribe();
            }
            lastValue = null;
        }));
        !seen && startTimer(first != null ? (typeof first === 'number' ? first : +first - scheduler.now()) : each);
    });
}
exports.timeout = timeout;
function timeoutErrorFactory(info) {
    throw new exports.TimeoutError(info);
}

},{"../observable/innerFrom":54,"../scheduler/async":203,"../util/createErrorClass":224,"../util/executeSchedule":227,"../util/isDate":231,"../util/lift":239,"./OperatorSubscriber":68}],171:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutWith = void 0;
var async_1 = require("../scheduler/async");
var isDate_1 = require("../util/isDate");
var timeout_1 = require("./timeout");
function timeoutWith(due, withObservable, scheduler) {
    var first;
    var each;
    var _with;
    scheduler = scheduler !== null && scheduler !== void 0 ? scheduler : async_1.async;
    if (isDate_1.isValidDate(due)) {
        first = due;
    }
    else if (typeof due === 'number') {
        each = due;
    }
    if (withObservable) {
        _with = function () { return withObservable; };
    }
    else {
        throw new TypeError('No observable provided to switch to');
    }
    if (first == null && each == null) {
        throw new TypeError('No timeout provided.');
    }
    return timeout_1.timeout({
        first: first,
        each: each,
        scheduler: scheduler,
        with: _with,
    });
}
exports.timeoutWith = timeoutWith;

},{"../scheduler/async":203,"../util/isDate":231,"./timeout":170}],172:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.timestamp = void 0;
var dateTimestampProvider_1 = require("../scheduler/dateTimestampProvider");
var map_1 = require("./map");
function timestamp(timestampProvider) {
    if (timestampProvider === void 0) { timestampProvider = dateTimestampProvider_1.dateTimestampProvider; }
    return map_1.map(function (value) { return ({ value: value, timestamp: timestampProvider.now() }); });
}
exports.timestamp = timestamp;

},{"../scheduler/dateTimestampProvider":204,"./map":115}],173:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toArray = void 0;
var reduce_1 = require("./reduce");
var lift_1 = require("../util/lift");
var arrReducer = function (arr, value) { return (arr.push(value), arr); };
function toArray() {
    return lift_1.operate(function (source, subscriber) {
        reduce_1.reduce(arrReducer, [])(source).subscribe(subscriber);
    });
}
exports.toArray = toArray;

},{"../util/lift":239,"./reduce":137}],174:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.window = void 0;
var Subject_1 = require("../Subject");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var noop_1 = require("../util/noop");
function window(windowBoundaries) {
    return lift_1.operate(function (source, subscriber) {
        var windowSubject = new Subject_1.Subject();
        subscriber.next(windowSubject.asObservable());
        var errorHandler = function (err) {
            windowSubject.error(err);
            subscriber.error(err);
        };
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return windowSubject === null || windowSubject === void 0 ? void 0 : windowSubject.next(value); }, function () {
            windowSubject.complete();
            subscriber.complete();
        }, errorHandler));
        windowBoundaries.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function () {
            windowSubject.complete();
            subscriber.next((windowSubject = new Subject_1.Subject()));
        }, noop_1.noop, errorHandler));
        return function () {
            windowSubject === null || windowSubject === void 0 ? void 0 : windowSubject.unsubscribe();
            windowSubject = null;
        };
    });
}
exports.window = window;

},{"../Subject":31,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],175:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowCount = void 0;
var Subject_1 = require("../Subject");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
function windowCount(windowSize, startWindowEvery) {
    if (startWindowEvery === void 0) { startWindowEvery = 0; }
    var startEvery = startWindowEvery > 0 ? startWindowEvery : windowSize;
    return lift_1.operate(function (source, subscriber) {
        var windows = [new Subject_1.Subject()];
        var starts = [];
        var count = 0;
        subscriber.next(windows[0].asObservable());
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            try {
                for (var windows_1 = __values(windows), windows_1_1 = windows_1.next(); !windows_1_1.done; windows_1_1 = windows_1.next()) {
                    var window_1 = windows_1_1.value;
                    window_1.next(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (windows_1_1 && !windows_1_1.done && (_a = windows_1.return)) _a.call(windows_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
            var c = count - windowSize + 1;
            if (c >= 0 && c % startEvery === 0) {
                windows.shift().complete();
            }
            if (++count % startEvery === 0) {
                var window_2 = new Subject_1.Subject();
                windows.push(window_2);
                subscriber.next(window_2.asObservable());
            }
        }, function () {
            while (windows.length > 0) {
                windows.shift().complete();
            }
            subscriber.complete();
        }, function (err) {
            while (windows.length > 0) {
                windows.shift().error(err);
            }
            subscriber.error(err);
        }, function () {
            starts = null;
            windows = null;
        }));
    });
}
exports.windowCount = windowCount;

},{"../Subject":31,"../util/lift":239,"./OperatorSubscriber":68}],176:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowTime = void 0;
var Subject_1 = require("../Subject");
var async_1 = require("../scheduler/async");
var Subscription_1 = require("../Subscription");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var arrRemove_1 = require("../util/arrRemove");
var args_1 = require("../util/args");
var executeSchedule_1 = require("../util/executeSchedule");
function windowTime(windowTimeSpan) {
    var _a, _b;
    var otherArgs = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        otherArgs[_i - 1] = arguments[_i];
    }
    var scheduler = (_a = args_1.popScheduler(otherArgs)) !== null && _a !== void 0 ? _a : async_1.asyncScheduler;
    var windowCreationInterval = (_b = otherArgs[0]) !== null && _b !== void 0 ? _b : null;
    var maxWindowSize = otherArgs[1] || Infinity;
    return lift_1.operate(function (source, subscriber) {
        var windowRecords = [];
        var restartOnClose = false;
        var closeWindow = function (record) {
            var window = record.window, subs = record.subs;
            window.complete();
            subs.unsubscribe();
            arrRemove_1.arrRemove(windowRecords, record);
            restartOnClose && startWindow();
        };
        var startWindow = function () {
            if (windowRecords) {
                var subs = new Subscription_1.Subscription();
                subscriber.add(subs);
                var window_1 = new Subject_1.Subject();
                var record_1 = {
                    window: window_1,
                    subs: subs,
                    seen: 0,
                };
                windowRecords.push(record_1);
                subscriber.next(window_1.asObservable());
                executeSchedule_1.executeSchedule(subs, scheduler, function () { return closeWindow(record_1); }, windowTimeSpan);
            }
        };
        if (windowCreationInterval !== null && windowCreationInterval >= 0) {
            executeSchedule_1.executeSchedule(subscriber, scheduler, startWindow, windowCreationInterval, true);
        }
        else {
            restartOnClose = true;
        }
        startWindow();
        var loop = function (cb) { return windowRecords.slice().forEach(cb); };
        var terminate = function (cb) {
            loop(function (_a) {
                var window = _a.window;
                return cb(window);
            });
            cb(subscriber);
            subscriber.unsubscribe();
        };
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            loop(function (record) {
                record.window.next(value);
                maxWindowSize <= ++record.seen && closeWindow(record);
            });
        }, function () { return terminate(function (consumer) { return consumer.complete(); }); }, function (err) { return terminate(function (consumer) { return consumer.error(err); }); }));
        return function () {
            windowRecords = null;
        };
    });
}
exports.windowTime = windowTime;

},{"../Subject":31,"../Subscription":33,"../scheduler/async":203,"../util/args":220,"../util/arrRemove":223,"../util/executeSchedule":227,"../util/lift":239,"./OperatorSubscriber":68}],177:[function(require,module,exports){
"use strict";
var __values = (this && this.__values) || function(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowToggle = void 0;
var Subject_1 = require("../Subject");
var Subscription_1 = require("../Subscription");
var lift_1 = require("../util/lift");
var innerFrom_1 = require("../observable/innerFrom");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var noop_1 = require("../util/noop");
var arrRemove_1 = require("../util/arrRemove");
function windowToggle(openings, closingSelector) {
    return lift_1.operate(function (source, subscriber) {
        var windows = [];
        var handleError = function (err) {
            while (0 < windows.length) {
                windows.shift().error(err);
            }
            subscriber.error(err);
        };
        innerFrom_1.innerFrom(openings).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (openValue) {
            var window = new Subject_1.Subject();
            windows.push(window);
            var closingSubscription = new Subscription_1.Subscription();
            var closeWindow = function () {
                arrRemove_1.arrRemove(windows, window);
                window.complete();
                closingSubscription.unsubscribe();
            };
            var closingNotifier;
            try {
                closingNotifier = innerFrom_1.innerFrom(closingSelector(openValue));
            }
            catch (err) {
                handleError(err);
                return;
            }
            subscriber.next(window.asObservable());
            closingSubscription.add(closingNotifier.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, closeWindow, noop_1.noop, handleError)));
        }, noop_1.noop));
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            var e_1, _a;
            var windowsCopy = windows.slice();
            try {
                for (var windowsCopy_1 = __values(windowsCopy), windowsCopy_1_1 = windowsCopy_1.next(); !windowsCopy_1_1.done; windowsCopy_1_1 = windowsCopy_1.next()) {
                    var window_1 = windowsCopy_1_1.value;
                    window_1.next(value);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (windowsCopy_1_1 && !windowsCopy_1_1.done && (_a = windowsCopy_1.return)) _a.call(windowsCopy_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }, function () {
            while (0 < windows.length) {
                windows.shift().complete();
            }
            subscriber.complete();
        }, handleError, function () {
            while (0 < windows.length) {
                windows.shift().unsubscribe();
            }
        }));
    });
}
exports.windowToggle = windowToggle;

},{"../Subject":31,"../Subscription":33,"../observable/innerFrom":54,"../util/arrRemove":223,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],178:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.windowWhen = void 0;
var Subject_1 = require("../Subject");
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
function windowWhen(closingSelector) {
    return lift_1.operate(function (source, subscriber) {
        var window;
        var closingSubscriber;
        var handleError = function (err) {
            window.error(err);
            subscriber.error(err);
        };
        var openWindow = function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            window === null || window === void 0 ? void 0 : window.complete();
            window = new Subject_1.Subject();
            subscriber.next(window.asObservable());
            var closingNotifier;
            try {
                closingNotifier = innerFrom_1.innerFrom(closingSelector());
            }
            catch (err) {
                handleError(err);
                return;
            }
            closingNotifier.subscribe((closingSubscriber = OperatorSubscriber_1.createOperatorSubscriber(subscriber, openWindow, openWindow, handleError)));
        };
        openWindow();
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) { return window.next(value); }, function () {
            window.complete();
            subscriber.complete();
        }, handleError, function () {
            closingSubscriber === null || closingSubscriber === void 0 ? void 0 : closingSubscriber.unsubscribe();
            window = null;
        }));
    });
}
exports.windowWhen = windowWhen;

},{"../Subject":31,"../observable/innerFrom":54,"../util/lift":239,"./OperatorSubscriber":68}],179:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.withLatestFrom = void 0;
var lift_1 = require("../util/lift");
var OperatorSubscriber_1 = require("./OperatorSubscriber");
var innerFrom_1 = require("../observable/innerFrom");
var identity_1 = require("../util/identity");
var noop_1 = require("../util/noop");
var args_1 = require("../util/args");
function withLatestFrom() {
    var inputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        inputs[_i] = arguments[_i];
    }
    var project = args_1.popResultSelector(inputs);
    return lift_1.operate(function (source, subscriber) {
        var len = inputs.length;
        var otherValues = new Array(len);
        var hasValue = inputs.map(function () { return false; });
        var ready = false;
        var _loop_1 = function (i) {
            innerFrom_1.innerFrom(inputs[i]).subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
                otherValues[i] = value;
                if (!ready && !hasValue[i]) {
                    hasValue[i] = true;
                    (ready = hasValue.every(identity_1.identity)) && (hasValue = null);
                }
            }, noop_1.noop));
        };
        for (var i = 0; i < len; i++) {
            _loop_1(i);
        }
        source.subscribe(OperatorSubscriber_1.createOperatorSubscriber(subscriber, function (value) {
            if (ready) {
                var values = __spreadArray([value], __read(otherValues));
                subscriber.next(project ? project.apply(void 0, __spreadArray([], __read(values))) : values);
            }
        }));
    });
}
exports.withLatestFrom = withLatestFrom;

},{"../observable/innerFrom":54,"../util/args":220,"../util/identity":228,"../util/lift":239,"../util/noop":241,"./OperatorSubscriber":68}],180:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zip = void 0;
var zip_1 = require("../observable/zip");
var lift_1 = require("../util/lift");
function zip() {
    var sources = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        sources[_i] = arguments[_i];
    }
    return lift_1.operate(function (source, subscriber) {
        zip_1.zip.apply(void 0, __spreadArray([source], __read(sources))).subscribe(subscriber);
    });
}
exports.zip = zip;

},{"../observable/zip":67,"../util/lift":239}],181:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipAll = void 0;
var zip_1 = require("../observable/zip");
var joinAllInternals_1 = require("./joinAllInternals");
function zipAll(project) {
    return joinAllInternals_1.joinAllInternals(zip_1.zip, project);
}
exports.zipAll = zipAll;

},{"../observable/zip":67,"./joinAllInternals":113}],182:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.zipWith = void 0;
var zip_1 = require("./zip");
function zipWith() {
    var otherInputs = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        otherInputs[_i] = arguments[_i];
    }
    return zip_1.zip.apply(void 0, __spreadArray([], __read(otherInputs)));
}
exports.zipWith = zipWith;

},{"./zip":180}],183:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleArray = void 0;
var Observable_1 = require("../Observable");
function scheduleArray(input, scheduler) {
    return new Observable_1.Observable(function (subscriber) {
        var i = 0;
        return scheduler.schedule(function () {
            if (i === input.length) {
                subscriber.complete();
            }
            else {
                subscriber.next(input[i++]);
                if (!subscriber.closed) {
                    this.schedule();
                }
            }
        });
    });
}
exports.scheduleArray = scheduleArray;

},{"../Observable":28}],184:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleAsyncIterable = void 0;
var Observable_1 = require("../Observable");
var executeSchedule_1 = require("../util/executeSchedule");
function scheduleAsyncIterable(input, scheduler) {
    if (!input) {
        throw new Error('Iterable cannot be null');
    }
    return new Observable_1.Observable(function (subscriber) {
        executeSchedule_1.executeSchedule(subscriber, scheduler, function () {
            var iterator = input[Symbol.asyncIterator]();
            executeSchedule_1.executeSchedule(subscriber, scheduler, function () {
                iterator.next().then(function (result) {
                    if (result.done) {
                        subscriber.complete();
                    }
                    else {
                        subscriber.next(result.value);
                    }
                });
            }, 0, true);
        });
    });
}
exports.scheduleAsyncIterable = scheduleAsyncIterable;

},{"../Observable":28,"../util/executeSchedule":227}],185:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleIterable = void 0;
var Observable_1 = require("../Observable");
var iterator_1 = require("../symbol/iterator");
var isFunction_1 = require("../util/isFunction");
var executeSchedule_1 = require("../util/executeSchedule");
function scheduleIterable(input, scheduler) {
    return new Observable_1.Observable(function (subscriber) {
        var iterator;
        executeSchedule_1.executeSchedule(subscriber, scheduler, function () {
            iterator = input[iterator_1.iterator]();
            executeSchedule_1.executeSchedule(subscriber, scheduler, function () {
                var _a;
                var value;
                var done;
                try {
                    (_a = iterator.next(), value = _a.value, done = _a.done);
                }
                catch (err) {
                    subscriber.error(err);
                    return;
                }
                if (done) {
                    subscriber.complete();
                }
                else {
                    subscriber.next(value);
                }
            }, 0, true);
        });
        return function () { return isFunction_1.isFunction(iterator === null || iterator === void 0 ? void 0 : iterator.return) && iterator.return(); };
    });
}
exports.scheduleIterable = scheduleIterable;

},{"../Observable":28,"../symbol/iterator":210,"../util/executeSchedule":227,"../util/isFunction":232}],186:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleObservable = void 0;
var innerFrom_1 = require("../observable/innerFrom");
var observeOn_1 = require("../operators/observeOn");
var subscribeOn_1 = require("../operators/subscribeOn");
function scheduleObservable(input, scheduler) {
    return innerFrom_1.innerFrom(input).pipe(subscribeOn_1.subscribeOn(scheduler), observeOn_1.observeOn(scheduler));
}
exports.scheduleObservable = scheduleObservable;

},{"../observable/innerFrom":54,"../operators/observeOn":128,"../operators/subscribeOn":156}],187:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulePromise = void 0;
var innerFrom_1 = require("../observable/innerFrom");
var observeOn_1 = require("../operators/observeOn");
var subscribeOn_1 = require("../operators/subscribeOn");
function schedulePromise(input, scheduler) {
    return innerFrom_1.innerFrom(input).pipe(subscribeOn_1.subscribeOn(scheduler), observeOn_1.observeOn(scheduler));
}
exports.schedulePromise = schedulePromise;

},{"../observable/innerFrom":54,"../operators/observeOn":128,"../operators/subscribeOn":156}],188:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduleReadableStreamLike = void 0;
var scheduleAsyncIterable_1 = require("./scheduleAsyncIterable");
var isReadableStreamLike_1 = require("../util/isReadableStreamLike");
function scheduleReadableStreamLike(input, scheduler) {
    return scheduleAsyncIterable_1.scheduleAsyncIterable(isReadableStreamLike_1.readableStreamLikeToAsyncGenerator(input), scheduler);
}
exports.scheduleReadableStreamLike = scheduleReadableStreamLike;

},{"../util/isReadableStreamLike":237,"./scheduleAsyncIterable":184}],189:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scheduled = void 0;
var scheduleObservable_1 = require("./scheduleObservable");
var schedulePromise_1 = require("./schedulePromise");
var scheduleArray_1 = require("./scheduleArray");
var scheduleIterable_1 = require("./scheduleIterable");
var scheduleAsyncIterable_1 = require("./scheduleAsyncIterable");
var isInteropObservable_1 = require("../util/isInteropObservable");
var isPromise_1 = require("../util/isPromise");
var isArrayLike_1 = require("../util/isArrayLike");
var isIterable_1 = require("../util/isIterable");
var isAsyncIterable_1 = require("../util/isAsyncIterable");
var throwUnobservableError_1 = require("../util/throwUnobservableError");
var isReadableStreamLike_1 = require("../util/isReadableStreamLike");
var scheduleReadableStreamLike_1 = require("./scheduleReadableStreamLike");
function scheduled(input, scheduler) {
    if (input != null) {
        if (isInteropObservable_1.isInteropObservable(input)) {
            return scheduleObservable_1.scheduleObservable(input, scheduler);
        }
        if (isArrayLike_1.isArrayLike(input)) {
            return scheduleArray_1.scheduleArray(input, scheduler);
        }
        if (isPromise_1.isPromise(input)) {
            return schedulePromise_1.schedulePromise(input, scheduler);
        }
        if (isAsyncIterable_1.isAsyncIterable(input)) {
            return scheduleAsyncIterable_1.scheduleAsyncIterable(input, scheduler);
        }
        if (isIterable_1.isIterable(input)) {
            return scheduleIterable_1.scheduleIterable(input, scheduler);
        }
        if (isReadableStreamLike_1.isReadableStreamLike(input)) {
            return scheduleReadableStreamLike_1.scheduleReadableStreamLike(input, scheduler);
        }
    }
    throw throwUnobservableError_1.createInvalidObservableTypeError(input);
}
exports.scheduled = scheduled;

},{"../util/isArrayLike":229,"../util/isAsyncIterable":230,"../util/isInteropObservable":233,"../util/isIterable":234,"../util/isPromise":236,"../util/isReadableStreamLike":237,"../util/throwUnobservableError":245,"./scheduleArray":183,"./scheduleAsyncIterable":184,"./scheduleIterable":185,"./scheduleObservable":186,"./schedulePromise":187,"./scheduleReadableStreamLike":188}],190:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Action = void 0;
var Subscription_1 = require("../Subscription");
var Action = (function (_super) {
    __extends(Action, _super);
    function Action(scheduler, work) {
        return _super.call(this) || this;
    }
    Action.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        return this;
    };
    return Action;
}(Subscription_1.Subscription));
exports.Action = Action;

},{"../Subscription":33}],191:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationFrameAction = void 0;
var AsyncAction_1 = require("./AsyncAction");
var animationFrameProvider_1 = require("./animationFrameProvider");
var AnimationFrameAction = (function (_super) {
    __extends(AnimationFrameAction, _super);
    function AnimationFrameAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AnimationFrameAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler._scheduled || (scheduler._scheduled = animationFrameProvider_1.animationFrameProvider.requestAnimationFrame(function () { return scheduler.flush(undefined); }));
    };
    AnimationFrameAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        var _a;
        if (delay === void 0) { delay = 0; }
        if (delay != null ? delay > 0 : this.delay > 0) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        var actions = scheduler.actions;
        if (id != null && ((_a = actions[actions.length - 1]) === null || _a === void 0 ? void 0 : _a.id) !== id) {
            animationFrameProvider_1.animationFrameProvider.cancelAnimationFrame(id);
            scheduler._scheduled = undefined;
        }
        return undefined;
    };
    return AnimationFrameAction;
}(AsyncAction_1.AsyncAction));
exports.AnimationFrameAction = AnimationFrameAction;

},{"./AsyncAction":195,"./animationFrameProvider":201}],192:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnimationFrameScheduler = void 0;
var AsyncScheduler_1 = require("./AsyncScheduler");
var AnimationFrameScheduler = (function (_super) {
    __extends(AnimationFrameScheduler, _super);
    function AnimationFrameScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AnimationFrameScheduler.prototype.flush = function (action) {
        this._active = true;
        var flushId = this._scheduled;
        this._scheduled = undefined;
        var actions = this.actions;
        var error;
        action = action || actions.shift();
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions[0]) && action.id === flushId && actions.shift());
        this._active = false;
        if (error) {
            while ((action = actions[0]) && action.id === flushId && actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AnimationFrameScheduler;
}(AsyncScheduler_1.AsyncScheduler));
exports.AnimationFrameScheduler = AnimationFrameScheduler;

},{"./AsyncScheduler":196}],193:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsapAction = void 0;
var AsyncAction_1 = require("./AsyncAction");
var immediateProvider_1 = require("./immediateProvider");
var AsapAction = (function (_super) {
    __extends(AsapAction, _super);
    function AsapAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    AsapAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay !== null && delay > 0) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.actions.push(this);
        return scheduler._scheduled || (scheduler._scheduled = immediateProvider_1.immediateProvider.setImmediate(scheduler.flush.bind(scheduler, undefined)));
    };
    AsapAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        var _a;
        if (delay === void 0) { delay = 0; }
        if (delay != null ? delay > 0 : this.delay > 0) {
            return _super.prototype.recycleAsyncId.call(this, scheduler, id, delay);
        }
        var actions = scheduler.actions;
        if (id != null && ((_a = actions[actions.length - 1]) === null || _a === void 0 ? void 0 : _a.id) !== id) {
            immediateProvider_1.immediateProvider.clearImmediate(id);
            scheduler._scheduled = undefined;
        }
        return undefined;
    };
    return AsapAction;
}(AsyncAction_1.AsyncAction));
exports.AsapAction = AsapAction;

},{"./AsyncAction":195,"./immediateProvider":205}],194:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsapScheduler = void 0;
var AsyncScheduler_1 = require("./AsyncScheduler");
var AsapScheduler = (function (_super) {
    __extends(AsapScheduler, _super);
    function AsapScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AsapScheduler.prototype.flush = function (action) {
        this._active = true;
        var flushId = this._scheduled;
        this._scheduled = undefined;
        var actions = this.actions;
        var error;
        action = action || actions.shift();
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions[0]) && action.id === flushId && actions.shift());
        this._active = false;
        if (error) {
            while ((action = actions[0]) && action.id === flushId && actions.shift()) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsapScheduler;
}(AsyncScheduler_1.AsyncScheduler));
exports.AsapScheduler = AsapScheduler;

},{"./AsyncScheduler":196}],195:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncAction = void 0;
var Action_1 = require("./Action");
var intervalProvider_1 = require("./intervalProvider");
var arrRemove_1 = require("../util/arrRemove");
var AsyncAction = (function (_super) {
    __extends(AsyncAction, _super);
    function AsyncAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.pending = false;
        return _this;
    }
    AsyncAction.prototype.schedule = function (state, delay) {
        var _a;
        if (delay === void 0) { delay = 0; }
        if (this.closed) {
            return this;
        }
        this.state = state;
        var id = this.id;
        var scheduler = this.scheduler;
        if (id != null) {
            this.id = this.recycleAsyncId(scheduler, id, delay);
        }
        this.pending = true;
        this.delay = delay;
        this.id = (_a = this.id) !== null && _a !== void 0 ? _a : this.requestAsyncId(scheduler, this.id, delay);
        return this;
    };
    AsyncAction.prototype.requestAsyncId = function (scheduler, _id, delay) {
        if (delay === void 0) { delay = 0; }
        return intervalProvider_1.intervalProvider.setInterval(scheduler.flush.bind(scheduler, this), delay);
    };
    AsyncAction.prototype.recycleAsyncId = function (_scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay != null && this.delay === delay && this.pending === false) {
            return id;
        }
        if (id != null) {
            intervalProvider_1.intervalProvider.clearInterval(id);
        }
        return undefined;
    };
    AsyncAction.prototype.execute = function (state, delay) {
        if (this.closed) {
            return new Error('executing a cancelled action');
        }
        this.pending = false;
        var error = this._execute(state, delay);
        if (error) {
            return error;
        }
        else if (this.pending === false && this.id != null) {
            this.id = this.recycleAsyncId(this.scheduler, this.id, null);
        }
    };
    AsyncAction.prototype._execute = function (state, _delay) {
        var errored = false;
        var errorValue;
        try {
            this.work(state);
        }
        catch (e) {
            errored = true;
            errorValue = e ? e : new Error('Scheduled action threw falsy error');
        }
        if (errored) {
            this.unsubscribe();
            return errorValue;
        }
    };
    AsyncAction.prototype.unsubscribe = function () {
        if (!this.closed) {
            var _a = this, id = _a.id, scheduler = _a.scheduler;
            var actions = scheduler.actions;
            this.work = this.state = this.scheduler = null;
            this.pending = false;
            arrRemove_1.arrRemove(actions, this);
            if (id != null) {
                this.id = this.recycleAsyncId(scheduler, id, null);
            }
            this.delay = null;
            _super.prototype.unsubscribe.call(this);
        }
    };
    return AsyncAction;
}(Action_1.Action));
exports.AsyncAction = AsyncAction;

},{"../util/arrRemove":223,"./Action":190,"./intervalProvider":206}],196:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AsyncScheduler = void 0;
var Scheduler_1 = require("../Scheduler");
var AsyncScheduler = (function (_super) {
    __extends(AsyncScheduler, _super);
    function AsyncScheduler(SchedulerAction, now) {
        if (now === void 0) { now = Scheduler_1.Scheduler.now; }
        var _this = _super.call(this, SchedulerAction, now) || this;
        _this.actions = [];
        _this._active = false;
        return _this;
    }
    AsyncScheduler.prototype.flush = function (action) {
        var actions = this.actions;
        if (this._active) {
            actions.push(action);
            return;
        }
        var error;
        this._active = true;
        do {
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        } while ((action = actions.shift()));
        this._active = false;
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    return AsyncScheduler;
}(Scheduler_1.Scheduler));
exports.AsyncScheduler = AsyncScheduler;

},{"../Scheduler":30}],197:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueAction = void 0;
var AsyncAction_1 = require("./AsyncAction");
var QueueAction = (function (_super) {
    __extends(QueueAction, _super);
    function QueueAction(scheduler, work) {
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        return _this;
    }
    QueueAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (delay > 0) {
            return _super.prototype.schedule.call(this, state, delay);
        }
        this.delay = delay;
        this.state = state;
        this.scheduler.flush(this);
        return this;
    };
    QueueAction.prototype.execute = function (state, delay) {
        return delay > 0 || this.closed ? _super.prototype.execute.call(this, state, delay) : this._execute(state, delay);
    };
    QueueAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        if ((delay != null && delay > 0) || (delay == null && this.delay > 0)) {
            return _super.prototype.requestAsyncId.call(this, scheduler, id, delay);
        }
        scheduler.flush(this);
        return 0;
    };
    return QueueAction;
}(AsyncAction_1.AsyncAction));
exports.QueueAction = QueueAction;

},{"./AsyncAction":195}],198:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.QueueScheduler = void 0;
var AsyncScheduler_1 = require("./AsyncScheduler");
var QueueScheduler = (function (_super) {
    __extends(QueueScheduler, _super);
    function QueueScheduler() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    return QueueScheduler;
}(AsyncScheduler_1.AsyncScheduler));
exports.QueueScheduler = QueueScheduler;

},{"./AsyncScheduler":196}],199:[function(require,module,exports){
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualAction = exports.VirtualTimeScheduler = void 0;
var AsyncAction_1 = require("./AsyncAction");
var Subscription_1 = require("../Subscription");
var AsyncScheduler_1 = require("./AsyncScheduler");
var VirtualTimeScheduler = (function (_super) {
    __extends(VirtualTimeScheduler, _super);
    function VirtualTimeScheduler(schedulerActionCtor, maxFrames) {
        if (schedulerActionCtor === void 0) { schedulerActionCtor = VirtualAction; }
        if (maxFrames === void 0) { maxFrames = Infinity; }
        var _this = _super.call(this, schedulerActionCtor, function () { return _this.frame; }) || this;
        _this.maxFrames = maxFrames;
        _this.frame = 0;
        _this.index = -1;
        return _this;
    }
    VirtualTimeScheduler.prototype.flush = function () {
        var _a = this, actions = _a.actions, maxFrames = _a.maxFrames;
        var error;
        var action;
        while ((action = actions[0]) && action.delay <= maxFrames) {
            actions.shift();
            this.frame = action.delay;
            if ((error = action.execute(action.state, action.delay))) {
                break;
            }
        }
        if (error) {
            while ((action = actions.shift())) {
                action.unsubscribe();
            }
            throw error;
        }
    };
    VirtualTimeScheduler.frameTimeFactor = 10;
    return VirtualTimeScheduler;
}(AsyncScheduler_1.AsyncScheduler));
exports.VirtualTimeScheduler = VirtualTimeScheduler;
var VirtualAction = (function (_super) {
    __extends(VirtualAction, _super);
    function VirtualAction(scheduler, work, index) {
        if (index === void 0) { index = (scheduler.index += 1); }
        var _this = _super.call(this, scheduler, work) || this;
        _this.scheduler = scheduler;
        _this.work = work;
        _this.index = index;
        _this.active = true;
        _this.index = scheduler.index = index;
        return _this;
    }
    VirtualAction.prototype.schedule = function (state, delay) {
        if (delay === void 0) { delay = 0; }
        if (Number.isFinite(delay)) {
            if (!this.id) {
                return _super.prototype.schedule.call(this, state, delay);
            }
            this.active = false;
            var action = new VirtualAction(this.scheduler, this.work);
            this.add(action);
            return action.schedule(state, delay);
        }
        else {
            return Subscription_1.Subscription.EMPTY;
        }
    };
    VirtualAction.prototype.requestAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        this.delay = scheduler.frame + delay;
        var actions = scheduler.actions;
        actions.push(this);
        actions.sort(VirtualAction.sortActions);
        return 1;
    };
    VirtualAction.prototype.recycleAsyncId = function (scheduler, id, delay) {
        if (delay === void 0) { delay = 0; }
        return undefined;
    };
    VirtualAction.prototype._execute = function (state, delay) {
        if (this.active === true) {
            return _super.prototype._execute.call(this, state, delay);
        }
    };
    VirtualAction.sortActions = function (a, b) {
        if (a.delay === b.delay) {
            if (a.index === b.index) {
                return 0;
            }
            else if (a.index > b.index) {
                return 1;
            }
            else {
                return -1;
            }
        }
        else if (a.delay > b.delay) {
            return 1;
        }
        else {
            return -1;
        }
    };
    return VirtualAction;
}(AsyncAction_1.AsyncAction));
exports.VirtualAction = VirtualAction;

},{"../Subscription":33,"./AsyncAction":195,"./AsyncScheduler":196}],200:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.animationFrame = exports.animationFrameScheduler = void 0;
var AnimationFrameAction_1 = require("./AnimationFrameAction");
var AnimationFrameScheduler_1 = require("./AnimationFrameScheduler");
exports.animationFrameScheduler = new AnimationFrameScheduler_1.AnimationFrameScheduler(AnimationFrameAction_1.AnimationFrameAction);
exports.animationFrame = exports.animationFrameScheduler;

},{"./AnimationFrameAction":191,"./AnimationFrameScheduler":192}],201:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.animationFrameProvider = void 0;
var Subscription_1 = require("../Subscription");
exports.animationFrameProvider = {
    schedule: function (callback) {
        var request = requestAnimationFrame;
        var cancel = cancelAnimationFrame;
        var delegate = exports.animationFrameProvider.delegate;
        if (delegate) {
            request = delegate.requestAnimationFrame;
            cancel = delegate.cancelAnimationFrame;
        }
        var handle = request(function (timestamp) {
            cancel = undefined;
            callback(timestamp);
        });
        return new Subscription_1.Subscription(function () { return cancel === null || cancel === void 0 ? void 0 : cancel(handle); });
    },
    requestAnimationFrame: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = exports.animationFrameProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.requestAnimationFrame) || requestAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
    },
    cancelAnimationFrame: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = exports.animationFrameProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.cancelAnimationFrame) || cancelAnimationFrame).apply(void 0, __spreadArray([], __read(args)));
    },
    delegate: undefined,
};

},{"../Subscription":33}],202:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asap = exports.asapScheduler = void 0;
var AsapAction_1 = require("./AsapAction");
var AsapScheduler_1 = require("./AsapScheduler");
exports.asapScheduler = new AsapScheduler_1.AsapScheduler(AsapAction_1.AsapAction);
exports.asap = exports.asapScheduler;

},{"./AsapAction":193,"./AsapScheduler":194}],203:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.async = exports.asyncScheduler = void 0;
var AsyncAction_1 = require("./AsyncAction");
var AsyncScheduler_1 = require("./AsyncScheduler");
exports.asyncScheduler = new AsyncScheduler_1.AsyncScheduler(AsyncAction_1.AsyncAction);
exports.async = exports.asyncScheduler;

},{"./AsyncAction":195,"./AsyncScheduler":196}],204:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dateTimestampProvider = void 0;
exports.dateTimestampProvider = {
    now: function () {
        return (exports.dateTimestampProvider.delegate || Date).now();
    },
    delegate: undefined,
};

},{}],205:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.immediateProvider = void 0;
var Immediate_1 = require("../util/Immediate");
var setImmediate = Immediate_1.Immediate.setImmediate, clearImmediate = Immediate_1.Immediate.clearImmediate;
exports.immediateProvider = {
    setImmediate: function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var delegate = exports.immediateProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.setImmediate) || setImmediate).apply(void 0, __spreadArray([], __read(args)));
    },
    clearImmediate: function (handle) {
        var delegate = exports.immediateProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearImmediate) || clearImmediate)(handle);
    },
    delegate: undefined,
};

},{"../util/Immediate":215}],206:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.intervalProvider = void 0;
exports.intervalProvider = {
    setInterval: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = exports.intervalProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setInterval) {
            return delegate.setInterval.apply(delegate, __spreadArray([handler, timeout], __read(args)));
        }
        return setInterval.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearInterval: function (handle) {
        var delegate = exports.intervalProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearInterval) || clearInterval)(handle);
    },
    delegate: undefined,
};

},{}],207:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performanceTimestampProvider = void 0;
exports.performanceTimestampProvider = {
    now: function () {
        return (exports.performanceTimestampProvider.delegate || performance).now();
    },
    delegate: undefined,
};

},{}],208:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.queue = exports.queueScheduler = void 0;
var QueueAction_1 = require("./QueueAction");
var QueueScheduler_1 = require("./QueueScheduler");
exports.queueScheduler = new QueueScheduler_1.QueueScheduler(QueueAction_1.QueueAction);
exports.queue = exports.queueScheduler;

},{"./QueueAction":197,"./QueueScheduler":198}],209:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeoutProvider = void 0;
exports.timeoutProvider = {
    setTimeout: function (handler, timeout) {
        var args = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
        }
        var delegate = exports.timeoutProvider.delegate;
        if (delegate === null || delegate === void 0 ? void 0 : delegate.setTimeout) {
            return delegate.setTimeout.apply(delegate, __spreadArray([handler, timeout], __read(args)));
        }
        return setTimeout.apply(void 0, __spreadArray([handler, timeout], __read(args)));
    },
    clearTimeout: function (handle) {
        var delegate = exports.timeoutProvider.delegate;
        return ((delegate === null || delegate === void 0 ? void 0 : delegate.clearTimeout) || clearTimeout)(handle);
    },
    delegate: undefined,
};

},{}],210:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.iterator = exports.getSymbolIterator = void 0;
function getSymbolIterator() {
    if (typeof Symbol !== 'function' || !Symbol.iterator) {
        return '@@iterator';
    }
    return Symbol.iterator;
}
exports.getSymbolIterator = getSymbolIterator;
exports.iterator = getSymbolIterator();

},{}],211:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.observable = void 0;
exports.observable = (function () { return (typeof Symbol === 'function' && Symbol.observable) || '@@observable'; })();

},{}],212:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });

},{}],213:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ArgumentOutOfRangeError = void 0;
var createErrorClass_1 = require("./createErrorClass");
exports.ArgumentOutOfRangeError = createErrorClass_1.createErrorClass(function (_super) {
    return function ArgumentOutOfRangeErrorImpl() {
        _super(this);
        this.name = 'ArgumentOutOfRangeError';
        this.message = 'argument out of range';
    };
});

},{"./createErrorClass":224}],214:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EmptyError = void 0;
var createErrorClass_1 = require("./createErrorClass");
exports.EmptyError = createErrorClass_1.createErrorClass(function (_super) { return function EmptyErrorImpl() {
    _super(this);
    this.name = 'EmptyError';
    this.message = 'no elements in sequence';
}; });

},{"./createErrorClass":224}],215:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestTools = exports.Immediate = void 0;
var nextHandle = 1;
var resolved;
var activeHandles = {};
function findAndClearHandle(handle) {
    if (handle in activeHandles) {
        delete activeHandles[handle];
        return true;
    }
    return false;
}
exports.Immediate = {
    setImmediate: function (cb) {
        var handle = nextHandle++;
        activeHandles[handle] = true;
        if (!resolved) {
            resolved = Promise.resolve();
        }
        resolved.then(function () { return findAndClearHandle(handle) && cb(); });
        return handle;
    },
    clearImmediate: function (handle) {
        findAndClearHandle(handle);
    },
};
exports.TestTools = {
    pending: function () {
        return Object.keys(activeHandles).length;
    }
};

},{}],216:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
var createErrorClass_1 = require("./createErrorClass");
exports.NotFoundError = createErrorClass_1.createErrorClass(function (_super) {
    return function NotFoundErrorImpl(message) {
        _super(this);
        this.name = 'NotFoundError';
        this.message = message;
    };
});

},{"./createErrorClass":224}],217:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObjectUnsubscribedError = void 0;
var createErrorClass_1 = require("./createErrorClass");
exports.ObjectUnsubscribedError = createErrorClass_1.createErrorClass(function (_super) {
    return function ObjectUnsubscribedErrorImpl() {
        _super(this);
        this.name = 'ObjectUnsubscribedError';
        this.message = 'object unsubscribed';
    };
});

},{"./createErrorClass":224}],218:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequenceError = void 0;
var createErrorClass_1 = require("./createErrorClass");
exports.SequenceError = createErrorClass_1.createErrorClass(function (_super) {
    return function SequenceErrorImpl(message) {
        _super(this);
        this.name = 'SequenceError';
        this.message = message;
    };
});

},{"./createErrorClass":224}],219:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsubscriptionError = void 0;
var createErrorClass_1 = require("./createErrorClass");
exports.UnsubscriptionError = createErrorClass_1.createErrorClass(function (_super) {
    return function UnsubscriptionErrorImpl(errors) {
        _super(this);
        this.message = errors
            ? errors.length + " errors occurred during unsubscription:\n" + errors.map(function (err, i) { return i + 1 + ") " + err.toString(); }).join('\n  ')
            : '';
        this.name = 'UnsubscriptionError';
        this.errors = errors;
    };
});

},{"./createErrorClass":224}],220:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.popNumber = exports.popScheduler = exports.popResultSelector = void 0;
var isFunction_1 = require("./isFunction");
var isScheduler_1 = require("./isScheduler");
function last(arr) {
    return arr[arr.length - 1];
}
function popResultSelector(args) {
    return isFunction_1.isFunction(last(args)) ? args.pop() : undefined;
}
exports.popResultSelector = popResultSelector;
function popScheduler(args) {
    return isScheduler_1.isScheduler(last(args)) ? args.pop() : undefined;
}
exports.popScheduler = popScheduler;
function popNumber(args, defaultValue) {
    return typeof last(args) === 'number' ? args.pop() : defaultValue;
}
exports.popNumber = popNumber;

},{"./isFunction":232,"./isScheduler":238}],221:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.argsArgArrayOrObject = void 0;
var isArray = Array.isArray;
var getPrototypeOf = Object.getPrototypeOf, objectProto = Object.prototype, getKeys = Object.keys;
function argsArgArrayOrObject(args) {
    if (args.length === 1) {
        var first_1 = args[0];
        if (isArray(first_1)) {
            return { args: first_1, keys: null };
        }
        if (isPOJO(first_1)) {
            var keys = getKeys(first_1);
            return {
                args: keys.map(function (key) { return first_1[key]; }),
                keys: keys,
            };
        }
    }
    return { args: args, keys: null };
}
exports.argsArgArrayOrObject = argsArgArrayOrObject;
function isPOJO(obj) {
    return obj && typeof obj === 'object' && getPrototypeOf(obj) === objectProto;
}

},{}],222:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.argsOrArgArray = void 0;
var isArray = Array.isArray;
function argsOrArgArray(args) {
    return args.length === 1 && isArray(args[0]) ? args[0] : args;
}
exports.argsOrArgArray = argsOrArgArray;

},{}],223:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.arrRemove = void 0;
function arrRemove(arr, item) {
    if (arr) {
        var index = arr.indexOf(item);
        0 <= index && arr.splice(index, 1);
    }
}
exports.arrRemove = arrRemove;

},{}],224:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createErrorClass = void 0;
function createErrorClass(createImpl) {
    var _super = function (instance) {
        Error.call(instance);
        instance.stack = new Error().stack;
    };
    var ctorFunc = createImpl(_super);
    ctorFunc.prototype = Object.create(Error.prototype);
    ctorFunc.prototype.constructor = ctorFunc;
    return ctorFunc;
}
exports.createErrorClass = createErrorClass;

},{}],225:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createObject = void 0;
function createObject(keys, values) {
    return keys.reduce(function (result, key, i) { return ((result[key] = values[i]), result); }, {});
}
exports.createObject = createObject;

},{}],226:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.captureError = exports.errorContext = void 0;
var config_1 = require("../config");
var context = null;
function errorContext(cb) {
    if (config_1.config.useDeprecatedSynchronousErrorHandling) {
        var isRoot = !context;
        if (isRoot) {
            context = { errorThrown: false, error: null };
        }
        cb();
        if (isRoot) {
            var _a = context, errorThrown = _a.errorThrown, error = _a.error;
            context = null;
            if (errorThrown) {
                throw error;
            }
        }
    }
    else {
        cb();
    }
}
exports.errorContext = errorContext;
function captureError(err) {
    if (config_1.config.useDeprecatedSynchronousErrorHandling && context) {
        context.errorThrown = true;
        context.error = err;
    }
}
exports.captureError = captureError;

},{"../config":34}],227:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.executeSchedule = void 0;
function executeSchedule(parentSubscription, scheduler, work, delay, repeat) {
    if (delay === void 0) { delay = 0; }
    if (repeat === void 0) { repeat = false; }
    var scheduleSubscription = scheduler.schedule(function () {
        work();
        if (repeat) {
            parentSubscription.add(this.schedule(null, delay));
        }
        else {
            this.unsubscribe();
        }
    }, delay);
    parentSubscription.add(scheduleSubscription);
    if (!repeat) {
        return scheduleSubscription;
    }
}
exports.executeSchedule = executeSchedule;

},{}],228:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identity = void 0;
function identity(x) {
    return x;
}
exports.identity = identity;

},{}],229:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isArrayLike = void 0;
exports.isArrayLike = (function (x) { return x && typeof x.length === 'number' && typeof x !== 'function'; });

},{}],230:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isAsyncIterable = void 0;
var isFunction_1 = require("./isFunction");
function isAsyncIterable(obj) {
    return Symbol.asyncIterator && isFunction_1.isFunction(obj === null || obj === void 0 ? void 0 : obj[Symbol.asyncIterator]);
}
exports.isAsyncIterable = isAsyncIterable;

},{"./isFunction":232}],231:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isValidDate = void 0;
function isValidDate(value) {
    return value instanceof Date && !isNaN(value);
}
exports.isValidDate = isValidDate;

},{}],232:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isFunction = void 0;
function isFunction(value) {
    return typeof value === 'function';
}
exports.isFunction = isFunction;

},{}],233:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isInteropObservable = void 0;
var observable_1 = require("../symbol/observable");
var isFunction_1 = require("./isFunction");
function isInteropObservable(input) {
    return isFunction_1.isFunction(input[observable_1.observable]);
}
exports.isInteropObservable = isInteropObservable;

},{"../symbol/observable":211,"./isFunction":232}],234:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isIterable = void 0;
var iterator_1 = require("../symbol/iterator");
var isFunction_1 = require("./isFunction");
function isIterable(input) {
    return isFunction_1.isFunction(input === null || input === void 0 ? void 0 : input[iterator_1.iterator]);
}
exports.isIterable = isIterable;

},{"../symbol/iterator":210,"./isFunction":232}],235:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isObservable = void 0;
var Observable_1 = require("../Observable");
var isFunction_1 = require("./isFunction");
function isObservable(obj) {
    return !!obj && (obj instanceof Observable_1.Observable || (isFunction_1.isFunction(obj.lift) && isFunction_1.isFunction(obj.subscribe)));
}
exports.isObservable = isObservable;

},{"../Observable":28,"./isFunction":232}],236:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isPromise = void 0;
var isFunction_1 = require("./isFunction");
function isPromise(value) {
    return isFunction_1.isFunction(value === null || value === void 0 ? void 0 : value.then);
}
exports.isPromise = isPromise;

},{"./isFunction":232}],237:[function(require,module,exports){
"use strict";
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __await = (this && this.__await) || function (v) { return this instanceof __await ? (this.v = v, this) : new __await(v); }
var __asyncGenerator = (this && this.__asyncGenerator) || function (thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i;
    function verb(n) { if (g[n]) i[n] = function (v) { return new Promise(function (a, b) { q.push([n, v, a, b]) > 1 || resume(n, v); }); }; }
    function resume(n, v) { try { step(g[n](v)); } catch (e) { settle(q[0][3], e); } }
    function step(r) { r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r); }
    function fulfill(value) { resume("next", value); }
    function reject(value) { resume("throw", value); }
    function settle(f, v) { if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.isReadableStreamLike = exports.readableStreamLikeToAsyncGenerator = void 0;
var isFunction_1 = require("./isFunction");
function readableStreamLikeToAsyncGenerator(readableStream) {
    return __asyncGenerator(this, arguments, function readableStreamLikeToAsyncGenerator_1() {
        var reader, _a, value, done;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    reader = readableStream.getReader();
                    _b.label = 1;
                case 1:
                    _b.trys.push([1, , 9, 10]);
                    _b.label = 2;
                case 2:
                    if (!true) return [3, 8];
                    return [4, __await(reader.read())];
                case 3:
                    _a = _b.sent(), value = _a.value, done = _a.done;
                    if (!done) return [3, 5];
                    return [4, __await(void 0)];
                case 4: return [2, _b.sent()];
                case 5: return [4, __await(value)];
                case 6: return [4, _b.sent()];
                case 7:
                    _b.sent();
                    return [3, 2];
                case 8: return [3, 10];
                case 9:
                    reader.releaseLock();
                    return [7];
                case 10: return [2];
            }
        });
    });
}
exports.readableStreamLikeToAsyncGenerator = readableStreamLikeToAsyncGenerator;
function isReadableStreamLike(obj) {
    return isFunction_1.isFunction(obj === null || obj === void 0 ? void 0 : obj.getReader);
}
exports.isReadableStreamLike = isReadableStreamLike;

},{"./isFunction":232}],238:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isScheduler = void 0;
var isFunction_1 = require("./isFunction");
function isScheduler(value) {
    return value && isFunction_1.isFunction(value.schedule);
}
exports.isScheduler = isScheduler;

},{"./isFunction":232}],239:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.operate = exports.hasLift = void 0;
var isFunction_1 = require("./isFunction");
function hasLift(source) {
    return isFunction_1.isFunction(source === null || source === void 0 ? void 0 : source.lift);
}
exports.hasLift = hasLift;
function operate(init) {
    return function (source) {
        if (hasLift(source)) {
            return source.lift(function (liftedSource) {
                try {
                    return init(liftedSource, this);
                }
                catch (err) {
                    this.error(err);
                }
            });
        }
        throw new TypeError('Unable to lift unknown Observable type');
    };
}
exports.operate = operate;

},{"./isFunction":232}],240:[function(require,module,exports){
"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spreadArray = (this && this.__spreadArray) || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++)
        to[j] = from[i];
    return to;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapOneOrManyArgs = void 0;
var map_1 = require("../operators/map");
var isArray = Array.isArray;
function callOrApply(fn, args) {
    return isArray(args) ? fn.apply(void 0, __spreadArray([], __read(args))) : fn(args);
}
function mapOneOrManyArgs(fn) {
    return map_1.map(function (args) { return callOrApply(fn, args); });
}
exports.mapOneOrManyArgs = mapOneOrManyArgs;

},{"../operators/map":115}],241:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.noop = void 0;
function noop() { }
exports.noop = noop;

},{}],242:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.not = void 0;
function not(pred, thisArg) {
    return function (value, index) { return !pred.call(thisArg, value, index); };
}
exports.not = not;

},{}],243:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pipeFromArray = exports.pipe = void 0;
var identity_1 = require("./identity");
function pipe() {
    var fns = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        fns[_i] = arguments[_i];
    }
    return pipeFromArray(fns);
}
exports.pipe = pipe;
function pipeFromArray(fns) {
    if (fns.length === 0) {
        return identity_1.identity;
    }
    if (fns.length === 1) {
        return fns[0];
    }
    return function piped(input) {
        return fns.reduce(function (prev, fn) { return fn(prev); }, input);
    };
}
exports.pipeFromArray = pipeFromArray;

},{"./identity":228}],244:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reportUnhandledError = void 0;
var config_1 = require("../config");
var timeoutProvider_1 = require("../scheduler/timeoutProvider");
function reportUnhandledError(err) {
    timeoutProvider_1.timeoutProvider.setTimeout(function () {
        var onUnhandledError = config_1.config.onUnhandledError;
        if (onUnhandledError) {
            onUnhandledError(err);
        }
        else {
            throw err;
        }
    });
}
exports.reportUnhandledError = reportUnhandledError;

},{"../config":34,"../scheduler/timeoutProvider":209}],245:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createInvalidObservableTypeError = void 0;
function createInvalidObservableTypeError(input) {
    return new TypeError("You provided " + (input !== null && typeof input === 'object' ? 'an invalid object' : "'" + input + "'") + " where a stream was expected. You can provide an Observable, Promise, ReadableStream, Array, AsyncIterable, or Iterable.");
}
exports.createInvalidObservableTypeError = createInvalidObservableTypeError;

},{}],246:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('fast-unique-numbers')) :
    typeof define === 'function' && define.amd ? define(['exports', 'fast-unique-numbers'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.workerTimersBroker = {}, global.fastUniqueNumbers));
})(this, (function (exports, fastUniqueNumbers) { 'use strict';

    var isCallNotification = function isCallNotification(message) {
      return message.method !== undefined && message.method === 'call';
    };

    var isClearResponse = function isClearResponse(message) {
      return message.error === null && typeof message.id === 'number';
    };

    var load = function load(url) {
      // Prefilling the Maps with a function indexed by zero is necessary to be compliant with the specification.
      var scheduledIntervalFunctions = new Map([[0, function () {}]]); // tslint:disable-line no-empty
      var scheduledTimeoutFunctions = new Map([[0, function () {}]]); // tslint:disable-line no-empty
      var unrespondedRequests = new Map();
      var worker = new Worker(url);
      worker.addEventListener('message', function (_ref) {
        var data = _ref.data;
        if (isCallNotification(data)) {
          var _data$params = data.params,
            timerId = _data$params.timerId,
            timerType = _data$params.timerType;
          if (timerType === 'interval') {
            var idOrFunc = scheduledIntervalFunctions.get(timerId);
            if (typeof idOrFunc === 'number') {
              var timerIdAndTimerType = unrespondedRequests.get(idOrFunc);
              if (timerIdAndTimerType === undefined || timerIdAndTimerType.timerId !== timerId || timerIdAndTimerType.timerType !== timerType) {
                throw new Error('The timer is in an undefined state.');
              }
            } else if (typeof idOrFunc !== 'undefined') {
              idOrFunc();
            } else {
              throw new Error('The timer is in an undefined state.');
            }
          } else if (timerType === 'timeout') {
            var _idOrFunc = scheduledTimeoutFunctions.get(timerId);
            if (typeof _idOrFunc === 'number') {
              var _timerIdAndTimerType = unrespondedRequests.get(_idOrFunc);
              if (_timerIdAndTimerType === undefined || _timerIdAndTimerType.timerId !== timerId || _timerIdAndTimerType.timerType !== timerType) {
                throw new Error('The timer is in an undefined state.');
              }
            } else if (typeof _idOrFunc !== 'undefined') {
              _idOrFunc();
              // A timeout can be savely deleted because it is only called once.
              scheduledTimeoutFunctions["delete"](timerId);
            } else {
              throw new Error('The timer is in an undefined state.');
            }
          }
        } else if (isClearResponse(data)) {
          var id = data.id;
          var _timerIdAndTimerType2 = unrespondedRequests.get(id);
          if (_timerIdAndTimerType2 === undefined) {
            throw new Error('The timer is in an undefined state.');
          }
          var _timerId = _timerIdAndTimerType2.timerId,
            _timerType = _timerIdAndTimerType2.timerType;
          unrespondedRequests["delete"](id);
          if (_timerType === 'interval') {
            scheduledIntervalFunctions["delete"](_timerId);
          } else {
            scheduledTimeoutFunctions["delete"](_timerId);
          }
        } else {
          var message = data.error.message;
          throw new Error(message);
        }
      });
      var clearInterval = function clearInterval(timerId) {
        var id = fastUniqueNumbers.generateUniqueNumber(unrespondedRequests);
        unrespondedRequests.set(id, {
          timerId: timerId,
          timerType: 'interval'
        });
        scheduledIntervalFunctions.set(timerId, id);
        worker.postMessage({
          id: id,
          method: 'clear',
          params: {
            timerId: timerId,
            timerType: 'interval'
          }
        });
      };
      var clearTimeout = function clearTimeout(timerId) {
        var id = fastUniqueNumbers.generateUniqueNumber(unrespondedRequests);
        unrespondedRequests.set(id, {
          timerId: timerId,
          timerType: 'timeout'
        });
        scheduledTimeoutFunctions.set(timerId, id);
        worker.postMessage({
          id: id,
          method: 'clear',
          params: {
            timerId: timerId,
            timerType: 'timeout'
          }
        });
      };
      var setInterval = function setInterval(func, delay) {
        var timerId = fastUniqueNumbers.generateUniqueNumber(scheduledIntervalFunctions);
        scheduledIntervalFunctions.set(timerId, function () {
          func();
          // Doublecheck if the interval should still be rescheduled because it could have been cleared inside of func().
          if (typeof scheduledIntervalFunctions.get(timerId) === 'function') {
            worker.postMessage({
              id: null,
              method: 'set',
              params: {
                delay: delay,
                now: performance.now(),
                timerId: timerId,
                timerType: 'interval'
              }
            });
          }
        });
        worker.postMessage({
          id: null,
          method: 'set',
          params: {
            delay: delay,
            now: performance.now(),
            timerId: timerId,
            timerType: 'interval'
          }
        });
        return timerId;
      };
      var setTimeout = function setTimeout(func, delay) {
        var timerId = fastUniqueNumbers.generateUniqueNumber(scheduledTimeoutFunctions);
        scheduledTimeoutFunctions.set(timerId, func);
        worker.postMessage({
          id: null,
          method: 'set',
          params: {
            delay: delay,
            now: performance.now(),
            timerId: timerId,
            timerType: 'timeout'
          }
        });
        return timerId;
      };
      return {
        clearInterval: clearInterval,
        clearTimeout: clearTimeout,
        setInterval: setInterval,
        setTimeout: setTimeout
      };
    };

    exports.load = load;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"fast-unique-numbers":17}],247:[function(require,module,exports){
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('worker-timers-broker')) :
    typeof define === 'function' && define.amd ? define(['exports', 'worker-timers-broker'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.workerTimers = {}, global.workerTimersBroker));
})(this, (function (exports, workerTimersBroker) { 'use strict';

    var createLoadOrReturnBroker = function createLoadOrReturnBroker(loadBroker, worker) {
      var broker = null;
      return function () {
        if (broker !== null) {
          return broker;
        }
        var blob = new Blob([worker], {
          type: 'application/javascript; charset=utf-8'
        });
        var url = URL.createObjectURL(blob);
        broker = loadBroker(url);
        // Bug #1: Edge up until v18 didn't like the URL to be revoked directly.
        setTimeout(function () {
          return URL.revokeObjectURL(url);
        });
        return broker;
      };
    };

    // This is the minified and stringified code of the worker-timers-worker package.
    var worker = "(()=>{var e={67:(e,t,r)=>{var o,i;void 0===(i=\"function\"==typeof(o=function(){\"use strict\";var e=new Map,t=new Map,r=function(t){var r=e.get(t);if(void 0===r)throw new Error('There is no interval scheduled with the given id \"'.concat(t,'\".'));clearTimeout(r),e.delete(t)},o=function(e){var r=t.get(e);if(void 0===r)throw new Error('There is no timeout scheduled with the given id \"'.concat(e,'\".'));clearTimeout(r),t.delete(e)},i=function(e,t){var r,o=performance.now();return{expected:o+(r=e-Math.max(0,o-t)),remainingDelay:r}},n=function e(t,r,o,i){var n=performance.now();n>o?postMessage({id:null,method:\"call\",params:{timerId:r,timerType:i}}):t.set(r,setTimeout(e,o-n,t,r,o,i))},a=function(t,r,o){var a=i(t,o),s=a.expected,d=a.remainingDelay;e.set(r,setTimeout(n,d,e,r,s,\"interval\"))},s=function(e,r,o){var a=i(e,o),s=a.expected,d=a.remainingDelay;t.set(r,setTimeout(n,d,t,r,s,\"timeout\"))};addEventListener(\"message\",(function(e){var t=e.data;try{if(\"clear\"===t.method){var i=t.id,n=t.params,d=n.timerId,c=n.timerType;if(\"interval\"===c)r(d),postMessage({error:null,id:i});else{if(\"timeout\"!==c)throw new Error('The given type \"'.concat(c,'\" is not supported'));o(d),postMessage({error:null,id:i})}}else{if(\"set\"!==t.method)throw new Error('The given method \"'.concat(t.method,'\" is not supported'));var u=t.params,l=u.delay,p=u.now,m=u.timerId,v=u.timerType;if(\"interval\"===v)a(l,m,p);else{if(\"timeout\"!==v)throw new Error('The given type \"'.concat(v,'\" is not supported'));s(l,m,p)}}}catch(e){postMessage({error:{message:e.message},id:t.id,result:null})}}))})?o.call(t,r,t,e):o)||(e.exports=i)}},t={};function r(o){var i=t[o];if(void 0!==i)return i.exports;var n=t[o]={exports:{}};return e[o](n,n.exports,r),n.exports}r.n=e=>{var t=e&&e.__esModule?()=>e.default:()=>e;return r.d(t,{a:t}),t},r.d=(e,t)=>{for(var o in t)r.o(t,o)&&!r.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:t[o]})},r.o=(e,t)=>Object.prototype.hasOwnProperty.call(e,t),(()=>{\"use strict\";r(67)})()})();"; // tslint:disable-line:max-line-length

    var loadOrReturnBroker = createLoadOrReturnBroker(workerTimersBroker.load, worker);
    var clearInterval = function clearInterval(timerId) {
      return loadOrReturnBroker().clearInterval(timerId);
    };
    var clearTimeout = function clearTimeout(timerId) {
      return loadOrReturnBroker().clearTimeout(timerId);
    };
    var setInterval = function setInterval(func, delay) {
      return loadOrReturnBroker().setInterval(func, delay);
    };
    var setTimeout$1 = function setTimeout(func, delay) {
      return loadOrReturnBroker().setTimeout(func, delay);
    };

    exports.clearInterval = clearInterval;
    exports.clearTimeout = clearTimeout;
    exports.setInterval = setInterval;
    exports.setTimeout = setTimeout$1;

    Object.defineProperty(exports, '__esModule', { value: true });

}));

},{"worker-timers-broker":246}]},{},[2]);
