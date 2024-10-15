import {
  require_react_dom
} from "/build/_shared/chunk-56LDNGDG.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-PMI65YMG.js";
import {
  createHotContext
} from "/build/_shared/chunk-SCUC3Y5X.js";
import {
  require_react
} from "/build/_shared/chunk-2Q7FBYOG.js";
import {
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js
var require_classnames = __commonJS({
  "node_modules/.pnpm/classnames@2.5.1/node_modules/classnames/index.js"(exports, module) {
    (function() {
      "use strict";
      var hasOwn = {}.hasOwnProperty;
      function classNames6() {
        var classes = "";
        for (var i = 0; i < arguments.length; i++) {
          var arg = arguments[i];
          if (arg) {
            classes = appendClass(classes, parseValue(arg));
          }
        }
        return classes;
      }
      function parseValue(arg) {
        if (typeof arg === "string" || typeof arg === "number") {
          return arg;
        }
        if (typeof arg !== "object") {
          return "";
        }
        if (Array.isArray(arg)) {
          return classNames6.apply(null, arg);
        }
        if (arg.toString !== Object.prototype.toString && !arg.toString.toString().includes("[native code]")) {
          return arg.toString();
        }
        var classes = "";
        for (var key in arg) {
          if (hasOwn.call(arg, key) && arg[key]) {
            classes = appendClass(classes, key);
          }
        }
        return classes;
      }
      function appendClass(value, newClass) {
        if (!newClass) {
          return value;
        }
        if (value) {
          return value + " " + newClass;
        }
        return value + newClass;
      }
      if (typeof module !== "undefined" && module.exports) {
        classNames6.default = classNames6;
        module.exports = classNames6;
      } else if (typeof define === "function" && typeof define.amd === "object" && define.amd) {
        define("classnames", [], function() {
          return classNames6;
        });
      } else {
        window.classNames = classNames6;
      }
    })();
  }
});

// node_modules/.pnpm/react-is@16.13.1/node_modules/react-is/cjs/react-is.development.js
var require_react_is_development = __commonJS({
  "node_modules/.pnpm/react-is@16.13.1/node_modules/react-is/cjs/react-is.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        var hasSymbol = typeof Symbol === "function" && Symbol.for;
        var REACT_ELEMENT_TYPE = hasSymbol ? Symbol.for("react.element") : 60103;
        var REACT_PORTAL_TYPE = hasSymbol ? Symbol.for("react.portal") : 60106;
        var REACT_FRAGMENT_TYPE2 = hasSymbol ? Symbol.for("react.fragment") : 60107;
        var REACT_STRICT_MODE_TYPE = hasSymbol ? Symbol.for("react.strict_mode") : 60108;
        var REACT_PROFILER_TYPE = hasSymbol ? Symbol.for("react.profiler") : 60114;
        var REACT_PROVIDER_TYPE = hasSymbol ? Symbol.for("react.provider") : 60109;
        var REACT_CONTEXT_TYPE = hasSymbol ? Symbol.for("react.context") : 60110;
        var REACT_ASYNC_MODE_TYPE = hasSymbol ? Symbol.for("react.async_mode") : 60111;
        var REACT_CONCURRENT_MODE_TYPE = hasSymbol ? Symbol.for("react.concurrent_mode") : 60111;
        var REACT_FORWARD_REF_TYPE = hasSymbol ? Symbol.for("react.forward_ref") : 60112;
        var REACT_SUSPENSE_TYPE = hasSymbol ? Symbol.for("react.suspense") : 60113;
        var REACT_SUSPENSE_LIST_TYPE = hasSymbol ? Symbol.for("react.suspense_list") : 60120;
        var REACT_MEMO_TYPE = hasSymbol ? Symbol.for("react.memo") : 60115;
        var REACT_LAZY_TYPE = hasSymbol ? Symbol.for("react.lazy") : 60116;
        var REACT_BLOCK_TYPE = hasSymbol ? Symbol.for("react.block") : 60121;
        var REACT_FUNDAMENTAL_TYPE = hasSymbol ? Symbol.for("react.fundamental") : 60117;
        var REACT_RESPONDER_TYPE = hasSymbol ? Symbol.for("react.responder") : 60118;
        var REACT_SCOPE_TYPE = hasSymbol ? Symbol.for("react.scope") : 60119;
        function isValidElementType(type) {
          return typeof type === "string" || typeof type === "function" || // Note: its typeof might be other than 'symbol' or 'number' if it's a polyfill.
          type === REACT_FRAGMENT_TYPE2 || type === REACT_CONCURRENT_MODE_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_PROVIDER_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_FUNDAMENTAL_TYPE || type.$$typeof === REACT_RESPONDER_TYPE || type.$$typeof === REACT_SCOPE_TYPE || type.$$typeof === REACT_BLOCK_TYPE);
        }
        function typeOf(object) {
          if (typeof object === "object" && object !== null) {
            var $$typeof = object.$$typeof;
            switch ($$typeof) {
              case REACT_ELEMENT_TYPE:
                var type = object.type;
                switch (type) {
                  case REACT_ASYNC_MODE_TYPE:
                  case REACT_CONCURRENT_MODE_TYPE:
                  case REACT_FRAGMENT_TYPE2:
                  case REACT_PROFILER_TYPE:
                  case REACT_STRICT_MODE_TYPE:
                  case REACT_SUSPENSE_TYPE:
                    return type;
                  default:
                    var $$typeofType = type && type.$$typeof;
                    switch ($$typeofType) {
                      case REACT_CONTEXT_TYPE:
                      case REACT_FORWARD_REF_TYPE:
                      case REACT_LAZY_TYPE:
                      case REACT_MEMO_TYPE:
                      case REACT_PROVIDER_TYPE:
                        return $$typeofType;
                      default:
                        return $$typeof;
                    }
                }
              case REACT_PORTAL_TYPE:
                return $$typeof;
            }
          }
          return void 0;
        }
        var AsyncMode = REACT_ASYNC_MODE_TYPE;
        var ConcurrentMode = REACT_CONCURRENT_MODE_TYPE;
        var ContextConsumer = REACT_CONTEXT_TYPE;
        var ContextProvider = REACT_PROVIDER_TYPE;
        var Element2 = REACT_ELEMENT_TYPE;
        var ForwardRef = REACT_FORWARD_REF_TYPE;
        var Fragment2 = REACT_FRAGMENT_TYPE2;
        var Lazy = REACT_LAZY_TYPE;
        var Memo = REACT_MEMO_TYPE;
        var Portal2 = REACT_PORTAL_TYPE;
        var Profiler = REACT_PROFILER_TYPE;
        var StrictMode = REACT_STRICT_MODE_TYPE;
        var Suspense = REACT_SUSPENSE_TYPE;
        var hasWarnedAboutDeprecatedIsAsyncMode = false;
        function isAsyncMode(object) {
          {
            if (!hasWarnedAboutDeprecatedIsAsyncMode) {
              hasWarnedAboutDeprecatedIsAsyncMode = true;
              console["warn"]("The ReactIs.isAsyncMode() alias has been deprecated, and will be removed in React 17+. Update your code to use ReactIs.isConcurrentMode() instead. It has the exact same API.");
            }
          }
          return isConcurrentMode(object) || typeOf(object) === REACT_ASYNC_MODE_TYPE;
        }
        function isConcurrentMode(object) {
          return typeOf(object) === REACT_CONCURRENT_MODE_TYPE;
        }
        function isContextConsumer(object) {
          return typeOf(object) === REACT_CONTEXT_TYPE;
        }
        function isContextProvider(object) {
          return typeOf(object) === REACT_PROVIDER_TYPE;
        }
        function isElement2(object) {
          return typeof object === "object" && object !== null && object.$$typeof === REACT_ELEMENT_TYPE;
        }
        function isForwardRef(object) {
          return typeOf(object) === REACT_FORWARD_REF_TYPE;
        }
        function isFragment(object) {
          return typeOf(object) === REACT_FRAGMENT_TYPE2;
        }
        function isLazy(object) {
          return typeOf(object) === REACT_LAZY_TYPE;
        }
        function isMemo(object) {
          return typeOf(object) === REACT_MEMO_TYPE;
        }
        function isPortal(object) {
          return typeOf(object) === REACT_PORTAL_TYPE;
        }
        function isProfiler(object) {
          return typeOf(object) === REACT_PROFILER_TYPE;
        }
        function isStrictMode(object) {
          return typeOf(object) === REACT_STRICT_MODE_TYPE;
        }
        function isSuspense(object) {
          return typeOf(object) === REACT_SUSPENSE_TYPE;
        }
        exports.AsyncMode = AsyncMode;
        exports.ConcurrentMode = ConcurrentMode;
        exports.ContextConsumer = ContextConsumer;
        exports.ContextProvider = ContextProvider;
        exports.Element = Element2;
        exports.ForwardRef = ForwardRef;
        exports.Fragment = Fragment2;
        exports.Lazy = Lazy;
        exports.Memo = Memo;
        exports.Portal = Portal2;
        exports.Profiler = Profiler;
        exports.StrictMode = StrictMode;
        exports.Suspense = Suspense;
        exports.isAsyncMode = isAsyncMode;
        exports.isConcurrentMode = isConcurrentMode;
        exports.isContextConsumer = isContextConsumer;
        exports.isContextProvider = isContextProvider;
        exports.isElement = isElement2;
        exports.isForwardRef = isForwardRef;
        exports.isFragment = isFragment;
        exports.isLazy = isLazy;
        exports.isMemo = isMemo;
        exports.isPortal = isPortal;
        exports.isProfiler = isProfiler;
        exports.isStrictMode = isStrictMode;
        exports.isSuspense = isSuspense;
        exports.isValidElementType = isValidElementType;
        exports.typeOf = typeOf;
      })();
    }
  }
});

// node_modules/.pnpm/react-is@16.13.1/node_modules/react-is/index.js
var require_react_is = __commonJS({
  "node_modules/.pnpm/react-is@16.13.1/node_modules/react-is/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_react_is_development();
    }
  }
});

// node_modules/.pnpm/object-assign@4.1.1/node_modules/object-assign/index.js
var require_object_assign = __commonJS({
  "node_modules/.pnpm/object-assign@4.1.1/node_modules/object-assign/index.js"(exports, module) {
    "use strict";
    var getOwnPropertySymbols = Object.getOwnPropertySymbols;
    var hasOwnProperty3 = Object.prototype.hasOwnProperty;
    var propIsEnumerable = Object.prototype.propertyIsEnumerable;
    function toObject(val) {
      if (val === null || val === void 0) {
        throw new TypeError("Object.assign cannot be called with null or undefined");
      }
      return Object(val);
    }
    function shouldUseNative() {
      try {
        if (!Object.assign) {
          return false;
        }
        var test1 = new String("abc");
        test1[5] = "de";
        if (Object.getOwnPropertyNames(test1)[0] === "5") {
          return false;
        }
        var test2 = {};
        for (var i = 0; i < 10; i++) {
          test2["_" + String.fromCharCode(i)] = i;
        }
        var order2 = Object.getOwnPropertyNames(test2).map(function(n) {
          return test2[n];
        });
        if (order2.join("") !== "0123456789") {
          return false;
        }
        var test3 = {};
        "abcdefghijklmnopqrst".split("").forEach(function(letter) {
          test3[letter] = letter;
        });
        if (Object.keys(Object.assign({}, test3)).join("") !== "abcdefghijklmnopqrst") {
          return false;
        }
        return true;
      } catch (err) {
        return false;
      }
    }
    module.exports = shouldUseNative() ? Object.assign : function(target, source) {
      var from;
      var to = toObject(target);
      var symbols;
      for (var s = 1; s < arguments.length; s++) {
        from = Object(arguments[s]);
        for (var key in from) {
          if (hasOwnProperty3.call(from, key)) {
            to[key] = from[key];
          }
        }
        if (getOwnPropertySymbols) {
          symbols = getOwnPropertySymbols(from);
          for (var i = 0; i < symbols.length; i++) {
            if (propIsEnumerable.call(from, symbols[i])) {
              to[symbols[i]] = from[symbols[i]];
            }
          }
        }
      }
      return to;
    };
  }
});

// node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/lib/ReactPropTypesSecret.js
var require_ReactPropTypesSecret = __commonJS({
  "node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/lib/ReactPropTypesSecret.js"(exports, module) {
    "use strict";
    var ReactPropTypesSecret = "SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED";
    module.exports = ReactPropTypesSecret;
  }
});

// node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/lib/has.js
var require_has = __commonJS({
  "node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/lib/has.js"(exports, module) {
    module.exports = Function.call.bind(Object.prototype.hasOwnProperty);
  }
});

// node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/checkPropTypes.js
var require_checkPropTypes = __commonJS({
  "node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/checkPropTypes.js"(exports, module) {
    "use strict";
    var printWarning = function() {
    };
    if (true) {
      ReactPropTypesSecret = require_ReactPropTypesSecret();
      loggedTypeFailures = {};
      has = require_has();
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    var ReactPropTypesSecret;
    var loggedTypeFailures;
    var has;
    function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
      if (true) {
        for (var typeSpecName in typeSpecs) {
          if (has(typeSpecs, typeSpecName)) {
            var error;
            try {
              if (typeof typeSpecs[typeSpecName] !== "function") {
                var err = Error(
                  (componentName || "React class") + ": " + location + " type `" + typeSpecName + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + typeof typeSpecs[typeSpecName] + "`.This often happens because of typos such as `PropTypes.function` instead of `PropTypes.func`."
                );
                err.name = "Invariant Violation";
                throw err;
              }
              error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
            } catch (ex) {
              error = ex;
            }
            if (error && !(error instanceof Error)) {
              printWarning(
                (componentName || "React class") + ": type specification of " + location + " `" + typeSpecName + "` is invalid; the type checker function must return `null` or an `Error` but returned a " + typeof error + ". You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument)."
              );
            }
            if (error instanceof Error && !(error.message in loggedTypeFailures)) {
              loggedTypeFailures[error.message] = true;
              var stack = getStack ? getStack() : "";
              printWarning(
                "Failed " + location + " type: " + error.message + (stack != null ? stack : "")
              );
            }
          }
        }
      }
    }
    checkPropTypes.resetWarningCache = function() {
      if (true) {
        loggedTypeFailures = {};
      }
    };
    module.exports = checkPropTypes;
  }
});

// node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/factoryWithTypeCheckers.js
var require_factoryWithTypeCheckers = __commonJS({
  "node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/factoryWithTypeCheckers.js"(exports, module) {
    "use strict";
    var ReactIs = require_react_is();
    var assign = require_object_assign();
    var ReactPropTypesSecret = require_ReactPropTypesSecret();
    var has = require_has();
    var checkPropTypes = require_checkPropTypes();
    var printWarning = function() {
    };
    if (true) {
      printWarning = function(text) {
        var message = "Warning: " + text;
        if (typeof console !== "undefined") {
          console.error(message);
        }
        try {
          throw new Error(message);
        } catch (x) {
        }
      };
    }
    function emptyFunctionThatReturnsNull() {
      return null;
    }
    module.exports = function(isValidElement4, throwOnDirectAccess) {
      var ITERATOR_SYMBOL = typeof Symbol === "function" && Symbol.iterator;
      var FAUX_ITERATOR_SYMBOL = "@@iterator";
      function getIteratorFn(maybeIterable) {
        var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
        if (typeof iteratorFn === "function") {
          return iteratorFn;
        }
      }
      var ANONYMOUS = "<<anonymous>>";
      var ReactPropTypes = {
        array: createPrimitiveTypeChecker("array"),
        bigint: createPrimitiveTypeChecker("bigint"),
        bool: createPrimitiveTypeChecker("boolean"),
        func: createPrimitiveTypeChecker("function"),
        number: createPrimitiveTypeChecker("number"),
        object: createPrimitiveTypeChecker("object"),
        string: createPrimitiveTypeChecker("string"),
        symbol: createPrimitiveTypeChecker("symbol"),
        any: createAnyTypeChecker(),
        arrayOf: createArrayOfTypeChecker,
        element: createElementTypeChecker(),
        elementType: createElementTypeTypeChecker(),
        instanceOf: createInstanceTypeChecker,
        node: createNodeChecker(),
        objectOf: createObjectOfTypeChecker,
        oneOf: createEnumTypeChecker,
        oneOfType: createUnionTypeChecker,
        shape: createShapeTypeChecker,
        exact: createStrictShapeTypeChecker
      };
      function is(x, y) {
        if (x === y) {
          return x !== 0 || 1 / x === 1 / y;
        } else {
          return x !== x && y !== y;
        }
      }
      function PropTypeError(message, data) {
        this.message = message;
        this.data = data && typeof data === "object" ? data : {};
        this.stack = "";
      }
      PropTypeError.prototype = Error.prototype;
      function createChainableTypeChecker(validate) {
        if (true) {
          var manualPropTypeCallCache = {};
          var manualPropTypeWarningCount = 0;
        }
        function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
          componentName = componentName || ANONYMOUS;
          propFullName = propFullName || propName;
          if (secret !== ReactPropTypesSecret) {
            if (throwOnDirectAccess) {
              var err = new Error(
                "Calling PropTypes validators directly is not supported by the `prop-types` package. Use `PropTypes.checkPropTypes()` to call them. Read more at http://fb.me/use-check-prop-types"
              );
              err.name = "Invariant Violation";
              throw err;
            } else if (typeof console !== "undefined") {
              var cacheKey = componentName + ":" + propName;
              if (!manualPropTypeCallCache[cacheKey] && // Avoid spamming the console because they are often not actionable except for lib authors
              manualPropTypeWarningCount < 3) {
                printWarning(
                  "You are manually calling a React.PropTypes validation function for the `" + propFullName + "` prop on `" + componentName + "`. This is deprecated and will throw in the standalone `prop-types` package. You may be seeing this warning due to a third-party PropTypes library. See https://fb.me/react-warning-dont-call-proptypes for details."
                );
                manualPropTypeCallCache[cacheKey] = true;
                manualPropTypeWarningCount++;
              }
            }
          }
          if (props[propName] == null) {
            if (isRequired) {
              if (props[propName] === null) {
                return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required " + ("in `" + componentName + "`, but its value is `null`."));
              }
              return new PropTypeError("The " + location + " `" + propFullName + "` is marked as required in " + ("`" + componentName + "`, but its value is `undefined`."));
            }
            return null;
          } else {
            return validate(props, propName, componentName, location, propFullName);
          }
        }
        var chainedCheckType = checkType.bind(null, false);
        chainedCheckType.isRequired = checkType.bind(null, true);
        return chainedCheckType;
      }
      function createPrimitiveTypeChecker(expectedType) {
        function validate(props, propName, componentName, location, propFullName, secret) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== expectedType) {
            var preciseType = getPreciseType(propValue);
            return new PropTypeError(
              "Invalid " + location + " `" + propFullName + "` of type " + ("`" + preciseType + "` supplied to `" + componentName + "`, expected ") + ("`" + expectedType + "`."),
              { expectedType }
            );
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createAnyTypeChecker() {
        return createChainableTypeChecker(emptyFunctionThatReturnsNull);
      }
      function createArrayOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside arrayOf.");
          }
          var propValue = props[propName];
          if (!Array.isArray(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an array."));
          }
          for (var i = 0; i < propValue.length; i++) {
            var error = typeChecker(propValue, i, componentName, location, propFullName + "[" + i + "]", ReactPropTypesSecret);
            if (error instanceof Error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!isValidElement4(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createElementTypeTypeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          if (!ReactIs.isValidElementType(propValue)) {
            var propType = getPropType(propValue);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected a single ReactElement type."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createInstanceTypeChecker(expectedClass) {
        function validate(props, propName, componentName, location, propFullName) {
          if (!(props[propName] instanceof expectedClass)) {
            var expectedClassName = expectedClass.name || ANONYMOUS;
            var actualClassName = getClassName(props[propName]);
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + actualClassName + "` supplied to `" + componentName + "`, expected ") + ("instance of `" + expectedClassName + "`."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createEnumTypeChecker(expectedValues) {
        if (!Array.isArray(expectedValues)) {
          if (true) {
            if (arguments.length > 1) {
              printWarning(
                "Invalid arguments supplied to oneOf, expected an array, got " + arguments.length + " arguments. A common mistake is to write oneOf(x, y, z) instead of oneOf([x, y, z])."
              );
            } else {
              printWarning("Invalid argument supplied to oneOf, expected an array.");
            }
          }
          return emptyFunctionThatReturnsNull;
        }
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          for (var i = 0; i < expectedValues.length; i++) {
            if (is(propValue, expectedValues[i])) {
              return null;
            }
          }
          var valuesString = JSON.stringify(expectedValues, function replacer(key, value) {
            var type = getPreciseType(value);
            if (type === "symbol") {
              return String(value);
            }
            return value;
          });
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` of value `" + String(propValue) + "` " + ("supplied to `" + componentName + "`, expected one of " + valuesString + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createObjectOfTypeChecker(typeChecker) {
        function validate(props, propName, componentName, location, propFullName) {
          if (typeof typeChecker !== "function") {
            return new PropTypeError("Property `" + propFullName + "` of component `" + componentName + "` has invalid PropType notation inside objectOf.");
          }
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type " + ("`" + propType + "` supplied to `" + componentName + "`, expected an object."));
          }
          for (var key in propValue) {
            if (has(propValue, key)) {
              var error = typeChecker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
              if (error instanceof Error) {
                return error;
              }
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createUnionTypeChecker(arrayOfTypeCheckers) {
        if (!Array.isArray(arrayOfTypeCheckers)) {
          true ? printWarning("Invalid argument supplied to oneOfType, expected an instance of array.") : void 0;
          return emptyFunctionThatReturnsNull;
        }
        for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
          var checker = arrayOfTypeCheckers[i];
          if (typeof checker !== "function") {
            printWarning(
              "Invalid argument supplied to oneOfType. Expected an array of check functions, but received " + getPostfixForTypeWarning(checker) + " at index " + i + "."
            );
            return emptyFunctionThatReturnsNull;
          }
        }
        function validate(props, propName, componentName, location, propFullName) {
          var expectedTypes = [];
          for (var i2 = 0; i2 < arrayOfTypeCheckers.length; i2++) {
            var checker2 = arrayOfTypeCheckers[i2];
            var checkerResult = checker2(props, propName, componentName, location, propFullName, ReactPropTypesSecret);
            if (checkerResult == null) {
              return null;
            }
            if (checkerResult.data && has(checkerResult.data, "expectedType")) {
              expectedTypes.push(checkerResult.data.expectedType);
            }
          }
          var expectedTypesMessage = expectedTypes.length > 0 ? ", expected one of type [" + expectedTypes.join(", ") + "]" : "";
          return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`" + expectedTypesMessage + "."));
        }
        return createChainableTypeChecker(validate);
      }
      function createNodeChecker() {
        function validate(props, propName, componentName, location, propFullName) {
          if (!isNode(props[propName])) {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` supplied to " + ("`" + componentName + "`, expected a ReactNode."));
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function invalidValidatorError(componentName, location, propFullName, key, type) {
        return new PropTypeError(
          (componentName || "React class") + ": " + location + " type `" + propFullName + "." + key + "` is invalid; it must be a function, usually from the `prop-types` package, but received `" + type + "`."
        );
      }
      function createShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          for (var key in shapeTypes) {
            var checker = shapeTypes[key];
            if (typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function createStrictShapeTypeChecker(shapeTypes) {
        function validate(props, propName, componentName, location, propFullName) {
          var propValue = props[propName];
          var propType = getPropType(propValue);
          if (propType !== "object") {
            return new PropTypeError("Invalid " + location + " `" + propFullName + "` of type `" + propType + "` " + ("supplied to `" + componentName + "`, expected `object`."));
          }
          var allKeys = assign({}, props[propName], shapeTypes);
          for (var key in allKeys) {
            var checker = shapeTypes[key];
            if (has(shapeTypes, key) && typeof checker !== "function") {
              return invalidValidatorError(componentName, location, propFullName, key, getPreciseType(checker));
            }
            if (!checker) {
              return new PropTypeError(
                "Invalid " + location + " `" + propFullName + "` key `" + key + "` supplied to `" + componentName + "`.\nBad object: " + JSON.stringify(props[propName], null, "  ") + "\nValid keys: " + JSON.stringify(Object.keys(shapeTypes), null, "  ")
              );
            }
            var error = checker(propValue, key, componentName, location, propFullName + "." + key, ReactPropTypesSecret);
            if (error) {
              return error;
            }
          }
          return null;
        }
        return createChainableTypeChecker(validate);
      }
      function isNode(propValue) {
        switch (typeof propValue) {
          case "number":
          case "string":
          case "undefined":
            return true;
          case "boolean":
            return !propValue;
          case "object":
            if (Array.isArray(propValue)) {
              return propValue.every(isNode);
            }
            if (propValue === null || isValidElement4(propValue)) {
              return true;
            }
            var iteratorFn = getIteratorFn(propValue);
            if (iteratorFn) {
              var iterator = iteratorFn.call(propValue);
              var step;
              if (iteratorFn !== propValue.entries) {
                while (!(step = iterator.next()).done) {
                  if (!isNode(step.value)) {
                    return false;
                  }
                }
              } else {
                while (!(step = iterator.next()).done) {
                  var entry = step.value;
                  if (entry) {
                    if (!isNode(entry[1])) {
                      return false;
                    }
                  }
                }
              }
            } else {
              return false;
            }
            return true;
          default:
            return false;
        }
      }
      function isSymbol(propType, propValue) {
        if (propType === "symbol") {
          return true;
        }
        if (!propValue) {
          return false;
        }
        if (propValue["@@toStringTag"] === "Symbol") {
          return true;
        }
        if (typeof Symbol === "function" && propValue instanceof Symbol) {
          return true;
        }
        return false;
      }
      function getPropType(propValue) {
        var propType = typeof propValue;
        if (Array.isArray(propValue)) {
          return "array";
        }
        if (propValue instanceof RegExp) {
          return "object";
        }
        if (isSymbol(propType, propValue)) {
          return "symbol";
        }
        return propType;
      }
      function getPreciseType(propValue) {
        if (typeof propValue === "undefined" || propValue === null) {
          return "" + propValue;
        }
        var propType = getPropType(propValue);
        if (propType === "object") {
          if (propValue instanceof Date) {
            return "date";
          } else if (propValue instanceof RegExp) {
            return "regexp";
          }
        }
        return propType;
      }
      function getPostfixForTypeWarning(value) {
        var type = getPreciseType(value);
        switch (type) {
          case "array":
          case "object":
            return "an " + type;
          case "boolean":
          case "date":
          case "regexp":
            return "a " + type;
          default:
            return type;
        }
      }
      function getClassName(propValue) {
        if (!propValue.constructor || !propValue.constructor.name) {
          return ANONYMOUS;
        }
        return propValue.constructor.name;
      }
      ReactPropTypes.checkPropTypes = checkPropTypes;
      ReactPropTypes.resetWarningCache = checkPropTypes.resetWarningCache;
      ReactPropTypes.PropTypes = ReactPropTypes;
      return ReactPropTypes;
    };
  }
});

// node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js
var require_prop_types = __commonJS({
  "node_modules/.pnpm/prop-types@15.8.1/node_modules/prop-types/index.js"(exports, module) {
    if (true) {
      ReactIs = require_react_is();
      throwOnDirectAccess = true;
      module.exports = require_factoryWithTypeCheckers()(ReactIs.isElement, throwOnDirectAccess);
    } else {
      module.exports = null();
    }
    var ReactIs;
    var throwOnDirectAccess;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_freeGlobal.js
var require_freeGlobal = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_freeGlobal.js"(exports, module) {
    var freeGlobal = typeof globalThis == "object" && globalThis && globalThis.Object === Object && globalThis;
    module.exports = freeGlobal;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_root.js
var require_root = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_root.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    module.exports = root;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Symbol.js
var require_Symbol = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Symbol.js"(exports, module) {
    var root = require_root();
    var Symbol2 = root.Symbol;
    module.exports = Symbol2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getRawTag.js
var require_getRawTag = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getRawTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    var nativeObjectToString = objectProto.toString;
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function getRawTag(value) {
      var isOwn = hasOwnProperty3.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    module.exports = getRawTag;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_objectToString.js
var require_objectToString = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_objectToString.js"(exports, module) {
    var objectProto = Object.prototype;
    var nativeObjectToString = objectProto.toString;
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    module.exports = objectToString;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetTag.js
var require_baseGetTag = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var getRawTag = require_getRawTag();
    var objectToString = require_objectToString();
    var nullTag = "[object Null]";
    var undefinedTag = "[object Undefined]";
    var symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    module.exports = baseGetTag;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObject.js
var require_isObject = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObject.js"(exports, module) {
    function isObject2(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    module.exports = isObject2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isFunction.js
var require_isFunction = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isFunction.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObject2 = require_isObject();
    var asyncTag = "[object AsyncFunction]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var proxyTag = "[object Proxy]";
    function isFunction(value) {
      if (!isObject2(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    module.exports = isFunction;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isNull.js
var require_isNull = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isNull.js"(exports, module) {
    function isNull(value) {
      return value === null;
    }
    module.exports = isNull;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArray.js
var require_isArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArray.js"(exports, module) {
    var isArray = Array.isArray;
    module.exports = isArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObjectLike.js
var require_isObjectLike = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isObjectLike.js"(exports, module) {
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    module.exports = isObjectLike;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isString.js
var require_isString = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isString.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isArray = require_isArray();
    var isObjectLike = require_isObjectLike();
    var stringTag = "[object String]";
    function isString(value) {
      return typeof value == "string" || !isArray(value) && isObjectLike(value) && baseGetTag(value) == stringTag;
    }
    module.exports = isString;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheClear.js
var require_listCacheClear = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheClear.js"(exports, module) {
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    module.exports = listCacheClear;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/eq.js
var require_eq = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/eq.js"(exports, module) {
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    module.exports = eq;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assocIndexOf.js
var require_assocIndexOf = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assocIndexOf.js"(exports, module) {
    var eq = require_eq();
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    module.exports = assocIndexOf;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheDelete.js
var require_listCacheDelete = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheDelete.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    var arrayProto = Array.prototype;
    var splice = arrayProto.splice;
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    module.exports = listCacheDelete;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheGet.js
var require_listCacheGet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheGet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    module.exports = listCacheGet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheHas.js
var require_listCacheHas = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheHas.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    module.exports = listCacheHas;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheSet.js
var require_listCacheSet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_listCacheSet.js"(exports, module) {
    var assocIndexOf = require_assocIndexOf();
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    module.exports = listCacheSet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_ListCache.js
var require_ListCache = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_ListCache.js"(exports, module) {
    var listCacheClear = require_listCacheClear();
    var listCacheDelete = require_listCacheDelete();
    var listCacheGet = require_listCacheGet();
    var listCacheHas = require_listCacheHas();
    var listCacheSet = require_listCacheSet();
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    module.exports = ListCache;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackClear.js
var require_stackClear = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackClear.js"(exports, module) {
    var ListCache = require_ListCache();
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    module.exports = stackClear;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackDelete.js
var require_stackDelete = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackDelete.js"(exports, module) {
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    module.exports = stackDelete;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackGet.js
var require_stackGet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackGet.js"(exports, module) {
    function stackGet(key) {
      return this.__data__.get(key);
    }
    module.exports = stackGet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackHas.js
var require_stackHas = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackHas.js"(exports, module) {
    function stackHas(key) {
      return this.__data__.has(key);
    }
    module.exports = stackHas;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_coreJsData.js
var require_coreJsData = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_coreJsData.js"(exports, module) {
    var root = require_root();
    var coreJsData = root["__core-js_shared__"];
    module.exports = coreJsData;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isMasked.js
var require_isMasked = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isMasked.js"(exports, module) {
    var coreJsData = require_coreJsData();
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    module.exports = isMasked;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toSource.js
var require_toSource = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toSource.js"(exports, module) {
    var funcProto = Function.prototype;
    var funcToString = funcProto.toString;
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    module.exports = toSource;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsNative.js
var require_baseIsNative = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsNative.js"(exports, module) {
    var isFunction = require_isFunction();
    var isMasked = require_isMasked();
    var isObject2 = require_isObject();
    var toSource = require_toSource();
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty3).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    function baseIsNative(value) {
      if (!isObject2(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    module.exports = baseIsNative;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getValue.js
var require_getValue = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getValue.js"(exports, module) {
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    module.exports = getValue;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getNative.js
var require_getNative = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getNative.js"(exports, module) {
    var baseIsNative = require_baseIsNative();
    var getValue = require_getValue();
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    module.exports = getNative;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Map.js
var require_Map = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Map.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Map2 = getNative(root, "Map");
    module.exports = Map2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeCreate.js
var require_nativeCreate = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeCreate.js"(exports, module) {
    var getNative = require_getNative();
    var nativeCreate = getNative(Object, "create");
    module.exports = nativeCreate;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashClear.js
var require_hashClear = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashClear.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    module.exports = hashClear;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashDelete.js
var require_hashDelete = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashDelete.js"(exports, module) {
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = hashDelete;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashGet.js
var require_hashGet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashGet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty3.call(data, key) ? data[key] : void 0;
    }
    module.exports = hashGet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashHas.js
var require_hashHas = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashHas.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty3.call(data, key);
    }
    module.exports = hashHas;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashSet.js
var require_hashSet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_hashSet.js"(exports, module) {
    var nativeCreate = require_nativeCreate();
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    module.exports = hashSet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Hash.js
var require_Hash = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Hash.js"(exports, module) {
    var hashClear = require_hashClear();
    var hashDelete = require_hashDelete();
    var hashGet = require_hashGet();
    var hashHas = require_hashHas();
    var hashSet = require_hashSet();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    module.exports = Hash;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheClear.js
var require_mapCacheClear = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheClear.js"(exports, module) {
    var Hash = require_Hash();
    var ListCache = require_ListCache();
    var Map2 = require_Map();
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    module.exports = mapCacheClear;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKeyable.js
var require_isKeyable = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKeyable.js"(exports, module) {
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    module.exports = isKeyable;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getMapData.js
var require_getMapData = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getMapData.js"(exports, module) {
    var isKeyable = require_isKeyable();
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    module.exports = getMapData;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheDelete.js
var require_mapCacheDelete = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheDelete.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    module.exports = mapCacheDelete;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheGet.js
var require_mapCacheGet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheGet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    module.exports = mapCacheGet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheHas.js
var require_mapCacheHas = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheHas.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    module.exports = mapCacheHas;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheSet.js
var require_mapCacheSet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapCacheSet.js"(exports, module) {
    var getMapData = require_getMapData();
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size = data.size;
      data.set(key, value);
      this.size += data.size == size ? 0 : 1;
      return this;
    }
    module.exports = mapCacheSet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_MapCache.js
var require_MapCache = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_MapCache.js"(exports, module) {
    var mapCacheClear = require_mapCacheClear();
    var mapCacheDelete = require_mapCacheDelete();
    var mapCacheGet = require_mapCacheGet();
    var mapCacheHas = require_mapCacheHas();
    var mapCacheSet = require_mapCacheSet();
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    module.exports = MapCache;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackSet.js
var require_stackSet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stackSet.js"(exports, module) {
    var ListCache = require_ListCache();
    var Map2 = require_Map();
    var MapCache = require_MapCache();
    var LARGE_ARRAY_SIZE = 200;
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    module.exports = stackSet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Stack.js
var require_Stack = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Stack.js"(exports, module) {
    var ListCache = require_ListCache();
    var stackClear = require_stackClear();
    var stackDelete = require_stackDelete();
    var stackGet = require_stackGet();
    var stackHas = require_stackHas();
    var stackSet = require_stackSet();
    function Stack(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    Stack.prototype.clear = stackClear;
    Stack.prototype["delete"] = stackDelete;
    Stack.prototype.get = stackGet;
    Stack.prototype.has = stackHas;
    Stack.prototype.set = stackSet;
    module.exports = Stack;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_defineProperty.js
var require_defineProperty = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_defineProperty.js"(exports, module) {
    var getNative = require_getNative();
    var defineProperty = function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    }();
    module.exports = defineProperty;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignValue.js
var require_baseAssignValue = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignValue.js"(exports, module) {
    var defineProperty = require_defineProperty();
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    module.exports = baseAssignValue;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assignMergeValue.js
var require_assignMergeValue = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assignMergeValue.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var eq = require_eq();
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    module.exports = assignMergeValue;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseFor.js
var require_createBaseFor = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseFor.js"(exports, module) {
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    module.exports = createBaseFor;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFor.js
var require_baseFor = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFor.js"(exports, module) {
    var createBaseFor = require_createBaseFor();
    var baseFor = createBaseFor();
    module.exports = baseFor;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneBuffer.js
var require_cloneBuffer = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneBuffer.js"(exports, module) {
    var root = require_root();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0;
    var allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0;
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    module.exports = cloneBuffer;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Uint8Array.js
var require_Uint8Array = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Uint8Array.js"(exports, module) {
    var root = require_root();
    var Uint8Array2 = root.Uint8Array;
    module.exports = Uint8Array2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneArrayBuffer.js
var require_cloneArrayBuffer = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneArrayBuffer.js"(exports, module) {
    var Uint8Array2 = require_Uint8Array();
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array2(result).set(new Uint8Array2(arrayBuffer));
      return result;
    }
    module.exports = cloneArrayBuffer;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneTypedArray.js
var require_cloneTypedArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneTypedArray.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    module.exports = cloneTypedArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyArray.js
var require_copyArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyArray.js"(exports, module) {
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    module.exports = copyArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseCreate.js
var require_baseCreate = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseCreate.js"(exports, module) {
    var isObject2 = require_isObject();
    var objectCreate = Object.create;
    var baseCreate = function() {
      function object() {
      }
      return function(proto) {
        if (!isObject2(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    }();
    module.exports = baseCreate;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overArg.js
var require_overArg = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overArg.js"(exports, module) {
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    module.exports = overArg;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getPrototype.js
var require_getPrototype = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getPrototype.js"(exports, module) {
    var overArg = require_overArg();
    var getPrototype = overArg(Object.getPrototypeOf, Object);
    module.exports = getPrototype;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isPrototype.js
var require_isPrototype = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isPrototype.js"(exports, module) {
    var objectProto = Object.prototype;
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    module.exports = isPrototype;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneObject.js
var require_initCloneObject = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneObject.js"(exports, module) {
    var baseCreate = require_baseCreate();
    var getPrototype = require_getPrototype();
    var isPrototype = require_isPrototype();
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    module.exports = initCloneObject;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsArguments.js
var require_baseIsArguments = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsArguments.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    module.exports = baseIsArguments;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArguments.js
var require_isArguments = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArguments.js"(exports, module) {
    var baseIsArguments = require_baseIsArguments();
    var isObjectLike = require_isObjectLike();
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var isArguments = baseIsArguments(function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty3.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    module.exports = isArguments;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isLength.js
var require_isLength = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isLength.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    module.exports = isLength;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLike.js
var require_isArrayLike = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLike.js"(exports, module) {
    var isFunction = require_isFunction();
    var isLength = require_isLength();
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction(value);
    }
    module.exports = isArrayLike;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLikeObject.js
var require_isArrayLikeObject = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isArrayLikeObject.js"(exports, module) {
    var isArrayLike = require_isArrayLike();
    var isObjectLike = require_isObjectLike();
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    module.exports = isArrayLikeObject;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubFalse.js
var require_stubFalse = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubFalse.js"(exports, module) {
    function stubFalse() {
      return false;
    }
    module.exports = stubFalse;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isBuffer.js
var require_isBuffer = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isBuffer.js"(exports, module) {
    var root = require_root();
    var stubFalse = require_stubFalse();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var Buffer = moduleExports ? root.Buffer : void 0;
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0;
    var isBuffer = nativeIsBuffer || stubFalse;
    module.exports = isBuffer;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isPlainObject.js
var require_isPlainObject = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isPlainObject.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var getPrototype = require_getPrototype();
    var isObjectLike = require_isObjectLike();
    var objectTag = "[object Object]";
    var funcProto = Function.prototype;
    var objectProto = Object.prototype;
    var funcToString = funcProto.toString;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    var objectCtorString = funcToString.call(Object);
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty3.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    module.exports = isPlainObject;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsTypedArray.js
var require_baseIsTypedArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsTypedArray.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isLength = require_isLength();
    var isObjectLike = require_isObjectLike();
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    module.exports = baseIsTypedArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUnary.js
var require_baseUnary = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUnary.js"(exports, module) {
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    module.exports = baseUnary;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nodeUtil.js
var require_nodeUtil = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nodeUtil.js"(exports, module) {
    var freeGlobal = require_freeGlobal();
    var freeExports = typeof exports == "object" && exports && !exports.nodeType && exports;
    var freeModule = freeExports && typeof module == "object" && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types2 = freeModule && freeModule.require && freeModule.require("util").types;
        if (types2) {
          return types2;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    module.exports = nodeUtil;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isTypedArray.js
var require_isTypedArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isTypedArray.js"(exports, module) {
    var baseIsTypedArray = require_baseIsTypedArray();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    module.exports = isTypedArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_safeGet.js
var require_safeGet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_safeGet.js"(exports, module) {
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    module.exports = safeGet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assignValue.js
var require_assignValue = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_assignValue.js"(exports, module) {
    var baseAssignValue = require_baseAssignValue();
    var eq = require_eq();
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty3.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    module.exports = assignValue;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyObject.js
var require_copyObject = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copyObject.js"(exports, module) {
    var assignValue = require_assignValue();
    var baseAssignValue = require_baseAssignValue();
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    module.exports = copyObject;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTimes.js
var require_baseTimes = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTimes.js"(exports, module) {
    function baseTimes(n, iteratee) {
      var index = -1, result = Array(n);
      while (++index < n) {
        result[index] = iteratee(index);
      }
      return result;
    }
    module.exports = baseTimes;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIndex.js
var require_isIndex = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIndex.js"(exports, module) {
    var MAX_SAFE_INTEGER = 9007199254740991;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    module.exports = isIndex;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayLikeKeys.js
var require_arrayLikeKeys = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayLikeKeys.js"(exports, module) {
    var baseTimes = require_baseTimes();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isIndex = require_isIndex();
    var isTypedArray = require_isTypedArray();
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty3.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = arrayLikeKeys;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeysIn.js
var require_nativeKeysIn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeysIn.js"(exports, module) {
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = nativeKeysIn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeysIn.js
var require_baseKeysIn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeysIn.js"(exports, module) {
    var isObject2 = require_isObject();
    var isPrototype = require_isPrototype();
    var nativeKeysIn = require_nativeKeysIn();
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function baseKeysIn(object) {
      if (!isObject2(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty3.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeysIn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keysIn.js
var require_keysIn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keysIn.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeysIn = require_baseKeysIn();
    var isArrayLike = require_isArrayLike();
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    module.exports = keysIn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toPlainObject.js
var require_toPlainObject = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toPlainObject.js"(exports, module) {
    var copyObject = require_copyObject();
    var keysIn = require_keysIn();
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    module.exports = toPlainObject;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMergeDeep.js
var require_baseMergeDeep = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMergeDeep.js"(exports, module) {
    var assignMergeValue = require_assignMergeValue();
    var cloneBuffer = require_cloneBuffer();
    var cloneTypedArray = require_cloneTypedArray();
    var copyArray = require_copyArray();
    var initCloneObject = require_initCloneObject();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isArrayLikeObject = require_isArrayLikeObject();
    var isBuffer = require_isBuffer();
    var isFunction = require_isFunction();
    var isObject2 = require_isObject();
    var isPlainObject = require_isPlainObject();
    var isTypedArray = require_isTypedArray();
    var safeGet = require_safeGet();
    var toPlainObject = require_toPlainObject();
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject2(objValue) || isFunction(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    module.exports = baseMergeDeep;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMerge.js
var require_baseMerge = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseMerge.js"(exports, module) {
    var Stack = require_Stack();
    var assignMergeValue = require_assignMergeValue();
    var baseFor = require_baseFor();
    var baseMergeDeep = require_baseMergeDeep();
    var isObject2 = require_isObject();
    var keysIn = require_keysIn();
    var safeGet = require_safeGet();
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack());
        if (isObject2(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    module.exports = baseMerge;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/identity.js
var require_identity = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/identity.js"(exports, module) {
    function identity(value) {
      return value;
    }
    module.exports = identity;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_apply.js
var require_apply = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_apply.js"(exports, module) {
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    module.exports = apply;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overRest.js
var require_overRest = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_overRest.js"(exports, module) {
    var apply = require_apply();
    var nativeMax = Math.max;
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    module.exports = overRest;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/constant.js
var require_constant = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/constant.js"(exports, module) {
    function constant(value) {
      return function() {
        return value;
      };
    }
    module.exports = constant;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSetToString.js
var require_baseSetToString = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSetToString.js"(exports, module) {
    var constant = require_constant();
    var defineProperty = require_defineProperty();
    var identity = require_identity();
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
      });
    };
    module.exports = baseSetToString;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_shortOut.js
var require_shortOut = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_shortOut.js"(exports, module) {
    var HOT_COUNT = 800;
    var HOT_SPAN = 16;
    var nativeNow = Date.now;
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    module.exports = shortOut;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToString.js
var require_setToString = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToString.js"(exports, module) {
    var baseSetToString = require_baseSetToString();
    var shortOut = require_shortOut();
    var setToString = shortOut(baseSetToString);
    module.exports = setToString;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseRest.js
var require_baseRest = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseRest.js"(exports, module) {
    var identity = require_identity();
    var overRest = require_overRest();
    var setToString = require_setToString();
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    module.exports = baseRest;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIterateeCall.js
var require_isIterateeCall = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isIterateeCall.js"(exports, module) {
    var eq = require_eq();
    var isArrayLike = require_isArrayLike();
    var isIndex = require_isIndex();
    var isObject2 = require_isObject();
    function isIterateeCall(value, index, object) {
      if (!isObject2(object)) {
        return false;
      }
      var type = typeof index;
      if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
        return eq(object[index], value);
      }
      return false;
    }
    module.exports = isIterateeCall;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createAssigner.js
var require_createAssigner = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createAssigner.js"(exports, module) {
    var baseRest = require_baseRest();
    var isIterateeCall = require_isIterateeCall();
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    module.exports = createAssigner;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/merge.js
var require_merge = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/merge.js"(exports, module) {
    var baseMerge = require_baseMerge();
    var createAssigner = require_createAssigner();
    var merge = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    module.exports = merge;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayMap.js
var require_arrayMap = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayMap.js"(exports, module) {
    function arrayMap(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length, result = Array(length);
      while (++index < length) {
        result[index] = iteratee(array[index], index, array);
      }
      return result;
    }
    module.exports = arrayMap;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayEach.js
var require_arrayEach = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayEach.js"(exports, module) {
    function arrayEach(array, iteratee) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (iteratee(array[index], index, array) === false) {
          break;
        }
      }
      return array;
    }
    module.exports = arrayEach;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeys.js
var require_nativeKeys = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_nativeKeys.js"(exports, module) {
    var overArg = require_overArg();
    var nativeKeys = overArg(Object.keys, Object);
    module.exports = nativeKeys;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeys.js
var require_baseKeys = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseKeys.js"(exports, module) {
    var isPrototype = require_isPrototype();
    var nativeKeys = require_nativeKeys();
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function baseKeys(object) {
      if (!isPrototype(object)) {
        return nativeKeys(object);
      }
      var result = [];
      for (var key in Object(object)) {
        if (hasOwnProperty3.call(object, key) && key != "constructor") {
          result.push(key);
        }
      }
      return result;
    }
    module.exports = baseKeys;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keys.js
var require_keys = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/keys.js"(exports, module) {
    var arrayLikeKeys = require_arrayLikeKeys();
    var baseKeys = require_baseKeys();
    var isArrayLike = require_isArrayLike();
    function keys(object) {
      return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
    }
    module.exports = keys;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssign.js
var require_baseAssign = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssign.js"(exports, module) {
    var copyObject = require_copyObject();
    var keys = require_keys();
    function baseAssign(object, source) {
      return object && copyObject(source, keys(source), object);
    }
    module.exports = baseAssign;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignIn.js
var require_baseAssignIn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseAssignIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var keysIn = require_keysIn();
    function baseAssignIn(object, source) {
      return object && copyObject(source, keysIn(source), object);
    }
    module.exports = baseAssignIn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayFilter.js
var require_arrayFilter = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayFilter.js"(exports, module) {
    function arrayFilter(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length, resIndex = 0, result = [];
      while (++index < length) {
        var value = array[index];
        if (predicate(value, index, array)) {
          result[resIndex++] = value;
        }
      }
      return result;
    }
    module.exports = arrayFilter;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubArray.js
var require_stubArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/stubArray.js"(exports, module) {
    function stubArray() {
      return [];
    }
    module.exports = stubArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbols.js
var require_getSymbols = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbols.js"(exports, module) {
    var arrayFilter = require_arrayFilter();
    var stubArray = require_stubArray();
    var objectProto = Object.prototype;
    var propertyIsEnumerable = objectProto.propertyIsEnumerable;
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbols = !nativeGetSymbols ? stubArray : function(object) {
      if (object == null) {
        return [];
      }
      object = Object(object);
      return arrayFilter(nativeGetSymbols(object), function(symbol) {
        return propertyIsEnumerable.call(object, symbol);
      });
    };
    module.exports = getSymbols;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbols.js
var require_copySymbols = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbols.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbols = require_getSymbols();
    function copySymbols(source, object) {
      return copyObject(source, getSymbols(source), object);
    }
    module.exports = copySymbols;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayPush.js
var require_arrayPush = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arrayPush.js"(exports, module) {
    function arrayPush(array, values) {
      var index = -1, length = values.length, offset = array.length;
      while (++index < length) {
        array[offset + index] = values[index];
      }
      return array;
    }
    module.exports = arrayPush;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbolsIn.js
var require_getSymbolsIn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getSymbolsIn.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var getPrototype = require_getPrototype();
    var getSymbols = require_getSymbols();
    var stubArray = require_stubArray();
    var nativeGetSymbols = Object.getOwnPropertySymbols;
    var getSymbolsIn = !nativeGetSymbols ? stubArray : function(object) {
      var result = [];
      while (object) {
        arrayPush(result, getSymbols(object));
        object = getPrototype(object);
      }
      return result;
    };
    module.exports = getSymbolsIn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbolsIn.js
var require_copySymbolsIn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_copySymbolsIn.js"(exports, module) {
    var copyObject = require_copyObject();
    var getSymbolsIn = require_getSymbolsIn();
    function copySymbolsIn(source, object) {
      return copyObject(source, getSymbolsIn(source), object);
    }
    module.exports = copySymbolsIn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetAllKeys.js
var require_baseGetAllKeys = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGetAllKeys.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var isArray = require_isArray();
    function baseGetAllKeys(object, keysFunc, symbolsFunc) {
      var result = keysFunc(object);
      return isArray(object) ? result : arrayPush(result, symbolsFunc(object));
    }
    module.exports = baseGetAllKeys;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeys.js
var require_getAllKeys = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeys.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbols = require_getSymbols();
    var keys = require_keys();
    function getAllKeys(object) {
      return baseGetAllKeys(object, keys, getSymbols);
    }
    module.exports = getAllKeys;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeysIn.js
var require_getAllKeysIn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getAllKeysIn.js"(exports, module) {
    var baseGetAllKeys = require_baseGetAllKeys();
    var getSymbolsIn = require_getSymbolsIn();
    var keysIn = require_keysIn();
    function getAllKeysIn(object) {
      return baseGetAllKeys(object, keysIn, getSymbolsIn);
    }
    module.exports = getAllKeysIn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_DataView.js
var require_DataView = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_DataView.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var DataView = getNative(root, "DataView");
    module.exports = DataView;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Promise.js
var require_Promise = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Promise.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Promise2 = getNative(root, "Promise");
    module.exports = Promise2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Set.js
var require_Set = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_Set.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var Set2 = getNative(root, "Set");
    module.exports = Set2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_WeakMap.js
var require_WeakMap = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_WeakMap.js"(exports, module) {
    var getNative = require_getNative();
    var root = require_root();
    var WeakMap = getNative(root, "WeakMap");
    module.exports = WeakMap;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getTag.js
var require_getTag = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_getTag.js"(exports, module) {
    var DataView = require_DataView();
    var Map2 = require_Map();
    var Promise2 = require_Promise();
    var Set2 = require_Set();
    var WeakMap = require_WeakMap();
    var baseGetTag = require_baseGetTag();
    var toSource = require_toSource();
    var mapTag = "[object Map]";
    var objectTag = "[object Object]";
    var promiseTag = "[object Promise]";
    var setTag = "[object Set]";
    var weakMapTag = "[object WeakMap]";
    var dataViewTag = "[object DataView]";
    var dataViewCtorString = toSource(DataView);
    var mapCtorString = toSource(Map2);
    var promiseCtorString = toSource(Promise2);
    var setCtorString = toSource(Set2);
    var weakMapCtorString = toSource(WeakMap);
    var getTag = baseGetTag;
    if (DataView && getTag(new DataView(new ArrayBuffer(1))) != dataViewTag || Map2 && getTag(new Map2()) != mapTag || Promise2 && getTag(Promise2.resolve()) != promiseTag || Set2 && getTag(new Set2()) != setTag || WeakMap && getTag(new WeakMap()) != weakMapTag) {
      getTag = function(value) {
        var result = baseGetTag(value), Ctor = result == objectTag ? value.constructor : void 0, ctorString = Ctor ? toSource(Ctor) : "";
        if (ctorString) {
          switch (ctorString) {
            case dataViewCtorString:
              return dataViewTag;
            case mapCtorString:
              return mapTag;
            case promiseCtorString:
              return promiseTag;
            case setCtorString:
              return setTag;
            case weakMapCtorString:
              return weakMapTag;
          }
        }
        return result;
      };
    }
    module.exports = getTag;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneArray.js
var require_initCloneArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneArray.js"(exports, module) {
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function initCloneArray(array) {
      var length = array.length, result = new array.constructor(length);
      if (length && typeof array[0] == "string" && hasOwnProperty3.call(array, "index")) {
        result.index = array.index;
        result.input = array.input;
      }
      return result;
    }
    module.exports = initCloneArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneDataView.js
var require_cloneDataView = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneDataView.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    function cloneDataView(dataView, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(dataView.buffer) : dataView.buffer;
      return new dataView.constructor(buffer, dataView.byteOffset, dataView.byteLength);
    }
    module.exports = cloneDataView;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneRegExp.js
var require_cloneRegExp = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneRegExp.js"(exports, module) {
    var reFlags = /\w*$/;
    function cloneRegExp(regexp) {
      var result = new regexp.constructor(regexp.source, reFlags.exec(regexp));
      result.lastIndex = regexp.lastIndex;
      return result;
    }
    module.exports = cloneRegExp;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneSymbol.js
var require_cloneSymbol = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cloneSymbol.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function cloneSymbol(symbol) {
      return symbolValueOf ? Object(symbolValueOf.call(symbol)) : {};
    }
    module.exports = cloneSymbol;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneByTag.js
var require_initCloneByTag = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_initCloneByTag.js"(exports, module) {
    var cloneArrayBuffer = require_cloneArrayBuffer();
    var cloneDataView = require_cloneDataView();
    var cloneRegExp = require_cloneRegExp();
    var cloneSymbol = require_cloneSymbol();
    var cloneTypedArray = require_cloneTypedArray();
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    function initCloneByTag(object, tag, isDeep) {
      var Ctor = object.constructor;
      switch (tag) {
        case arrayBufferTag:
          return cloneArrayBuffer(object);
        case boolTag:
        case dateTag:
          return new Ctor(+object);
        case dataViewTag:
          return cloneDataView(object, isDeep);
        case float32Tag:
        case float64Tag:
        case int8Tag:
        case int16Tag:
        case int32Tag:
        case uint8Tag:
        case uint8ClampedTag:
        case uint16Tag:
        case uint32Tag:
          return cloneTypedArray(object, isDeep);
        case mapTag:
          return new Ctor();
        case numberTag:
        case stringTag:
          return new Ctor(object);
        case regexpTag:
          return cloneRegExp(object);
        case setTag:
          return new Ctor();
        case symbolTag:
          return cloneSymbol(object);
      }
    }
    module.exports = initCloneByTag;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsMap.js
var require_baseIsMap = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsMap.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var mapTag = "[object Map]";
    function baseIsMap(value) {
      return isObjectLike(value) && getTag(value) == mapTag;
    }
    module.exports = baseIsMap;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isMap.js
var require_isMap = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isMap.js"(exports, module) {
    var baseIsMap = require_baseIsMap();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsMap = nodeUtil && nodeUtil.isMap;
    var isMap = nodeIsMap ? baseUnary(nodeIsMap) : baseIsMap;
    module.exports = isMap;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsSet.js
var require_baseIsSet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsSet.js"(exports, module) {
    var getTag = require_getTag();
    var isObjectLike = require_isObjectLike();
    var setTag = "[object Set]";
    function baseIsSet(value) {
      return isObjectLike(value) && getTag(value) == setTag;
    }
    module.exports = baseIsSet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSet.js
var require_isSet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSet.js"(exports, module) {
    var baseIsSet = require_baseIsSet();
    var baseUnary = require_baseUnary();
    var nodeUtil = require_nodeUtil();
    var nodeIsSet = nodeUtil && nodeUtil.isSet;
    var isSet = nodeIsSet ? baseUnary(nodeIsSet) : baseIsSet;
    module.exports = isSet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseClone.js
var require_baseClone = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseClone.js"(exports, module) {
    var Stack = require_Stack();
    var arrayEach = require_arrayEach();
    var assignValue = require_assignValue();
    var baseAssign = require_baseAssign();
    var baseAssignIn = require_baseAssignIn();
    var cloneBuffer = require_cloneBuffer();
    var copyArray = require_copyArray();
    var copySymbols = require_copySymbols();
    var copySymbolsIn = require_copySymbolsIn();
    var getAllKeys = require_getAllKeys();
    var getAllKeysIn = require_getAllKeysIn();
    var getTag = require_getTag();
    var initCloneArray = require_initCloneArray();
    var initCloneByTag = require_initCloneByTag();
    var initCloneObject = require_initCloneObject();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isMap = require_isMap();
    var isObject2 = require_isObject();
    var isSet = require_isSet();
    var keys = require_keys();
    var keysIn = require_keysIn();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_FLAT_FLAG = 2;
    var CLONE_SYMBOLS_FLAG = 4;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var funcTag = "[object Function]";
    var genTag = "[object GeneratorFunction]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var objectTag = "[object Object]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var float32Tag = "[object Float32Array]";
    var float64Tag = "[object Float64Array]";
    var int8Tag = "[object Int8Array]";
    var int16Tag = "[object Int16Array]";
    var int32Tag = "[object Int32Array]";
    var uint8Tag = "[object Uint8Array]";
    var uint8ClampedTag = "[object Uint8ClampedArray]";
    var uint16Tag = "[object Uint16Array]";
    var uint32Tag = "[object Uint32Array]";
    var cloneableTags = {};
    cloneableTags[argsTag] = cloneableTags[arrayTag] = cloneableTags[arrayBufferTag] = cloneableTags[dataViewTag] = cloneableTags[boolTag] = cloneableTags[dateTag] = cloneableTags[float32Tag] = cloneableTags[float64Tag] = cloneableTags[int8Tag] = cloneableTags[int16Tag] = cloneableTags[int32Tag] = cloneableTags[mapTag] = cloneableTags[numberTag] = cloneableTags[objectTag] = cloneableTags[regexpTag] = cloneableTags[setTag] = cloneableTags[stringTag] = cloneableTags[symbolTag] = cloneableTags[uint8Tag] = cloneableTags[uint8ClampedTag] = cloneableTags[uint16Tag] = cloneableTags[uint32Tag] = true;
    cloneableTags[errorTag] = cloneableTags[funcTag] = cloneableTags[weakMapTag] = false;
    function baseClone(value, bitmask, customizer, key, object, stack) {
      var result, isDeep = bitmask & CLONE_DEEP_FLAG, isFlat = bitmask & CLONE_FLAT_FLAG, isFull = bitmask & CLONE_SYMBOLS_FLAG;
      if (customizer) {
        result = object ? customizer(value, key, object, stack) : customizer(value);
      }
      if (result !== void 0) {
        return result;
      }
      if (!isObject2(value)) {
        return value;
      }
      var isArr = isArray(value);
      if (isArr) {
        result = initCloneArray(value);
        if (!isDeep) {
          return copyArray(value, result);
        }
      } else {
        var tag = getTag(value), isFunc = tag == funcTag || tag == genTag;
        if (isBuffer(value)) {
          return cloneBuffer(value, isDeep);
        }
        if (tag == objectTag || tag == argsTag || isFunc && !object) {
          result = isFlat || isFunc ? {} : initCloneObject(value);
          if (!isDeep) {
            return isFlat ? copySymbolsIn(value, baseAssignIn(result, value)) : copySymbols(value, baseAssign(result, value));
          }
        } else {
          if (!cloneableTags[tag]) {
            return object ? value : {};
          }
          result = initCloneByTag(value, tag, isDeep);
        }
      }
      stack || (stack = new Stack());
      var stacked = stack.get(value);
      if (stacked) {
        return stacked;
      }
      stack.set(value, result);
      if (isSet(value)) {
        value.forEach(function(subValue) {
          result.add(baseClone(subValue, bitmask, customizer, subValue, value, stack));
        });
      } else if (isMap(value)) {
        value.forEach(function(subValue, key2) {
          result.set(key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
        });
      }
      var keysFunc = isFull ? isFlat ? getAllKeysIn : getAllKeys : isFlat ? keysIn : keys;
      var props = isArr ? void 0 : keysFunc(value);
      arrayEach(props || value, function(subValue, key2) {
        if (props) {
          key2 = subValue;
          subValue = value[key2];
        }
        assignValue(result, key2, baseClone(subValue, bitmask, customizer, key2, value, stack));
      });
      return result;
    }
    module.exports = baseClone;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSymbol.js
var require_isSymbol = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isSymbol.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var symbolTag = "[object Symbol]";
    function isSymbol(value) {
      return typeof value == "symbol" || isObjectLike(value) && baseGetTag(value) == symbolTag;
    }
    module.exports = isSymbol;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKey.js
var require_isKey = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isKey.js"(exports, module) {
    var isArray = require_isArray();
    var isSymbol = require_isSymbol();
    var reIsDeepProp = /\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/;
    var reIsPlainProp = /^\w*$/;
    function isKey(value, object) {
      if (isArray(value)) {
        return false;
      }
      var type = typeof value;
      if (type == "number" || type == "symbol" || type == "boolean" || value == null || isSymbol(value)) {
        return true;
      }
      return reIsPlainProp.test(value) || !reIsDeepProp.test(value) || object != null && value in Object(object);
    }
    module.exports = isKey;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/memoize.js
var require_memoize = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/memoize.js"(exports, module) {
    var MapCache = require_MapCache();
    var FUNC_ERROR_TEXT = "Expected a function";
    function memoize(func, resolver) {
      if (typeof func != "function" || resolver != null && typeof resolver != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      var memoized = function() {
        var args = arguments, key = resolver ? resolver.apply(this, args) : args[0], cache = memoized.cache;
        if (cache.has(key)) {
          return cache.get(key);
        }
        var result = func.apply(this, args);
        memoized.cache = cache.set(key, result) || cache;
        return result;
      };
      memoized.cache = new (memoize.Cache || MapCache)();
      return memoized;
    }
    memoize.Cache = MapCache;
    module.exports = memoize;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_memoizeCapped.js
var require_memoizeCapped = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_memoizeCapped.js"(exports, module) {
    var memoize = require_memoize();
    var MAX_MEMOIZE_SIZE = 500;
    function memoizeCapped(func) {
      var result = memoize(func, function(key) {
        if (cache.size === MAX_MEMOIZE_SIZE) {
          cache.clear();
        }
        return key;
      });
      var cache = result.cache;
      return result;
    }
    module.exports = memoizeCapped;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stringToPath.js
var require_stringToPath = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_stringToPath.js"(exports, module) {
    var memoizeCapped = require_memoizeCapped();
    var rePropName = /[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g;
    var reEscapeChar = /\\(\\)?/g;
    var stringToPath = memoizeCapped(function(string) {
      var result = [];
      if (string.charCodeAt(0) === 46) {
        result.push("");
      }
      string.replace(rePropName, function(match2, number, quote, subString) {
        result.push(quote ? subString.replace(reEscapeChar, "$1") : number || match2);
      });
      return result;
    });
    module.exports = stringToPath;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseToString.js
var require_baseToString = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseToString.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var arrayMap = require_arrayMap();
    var isArray = require_isArray();
    var isSymbol = require_isSymbol();
    var INFINITY = 1 / 0;
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolToString = symbolProto ? symbolProto.toString : void 0;
    function baseToString(value) {
      if (typeof value == "string") {
        return value;
      }
      if (isArray(value)) {
        return arrayMap(value, baseToString) + "";
      }
      if (isSymbol(value)) {
        return symbolToString ? symbolToString.call(value) : "";
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    module.exports = baseToString;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toString.js
var require_toString = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toString.js"(exports, module) {
    var baseToString = require_baseToString();
    function toString(value) {
      return value == null ? "" : baseToString(value);
    }
    module.exports = toString;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_castPath.js
var require_castPath = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_castPath.js"(exports, module) {
    var isArray = require_isArray();
    var isKey = require_isKey();
    var stringToPath = require_stringToPath();
    var toString = require_toString();
    function castPath(value, object) {
      if (isArray(value)) {
        return value;
      }
      return isKey(value, object) ? [value] : stringToPath(toString(value));
    }
    module.exports = castPath;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/last.js
var require_last = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/last.js"(exports, module) {
    function last(array) {
      var length = array == null ? 0 : array.length;
      return length ? array[length - 1] : void 0;
    }
    module.exports = last;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toKey.js
var require_toKey = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_toKey.js"(exports, module) {
    var isSymbol = require_isSymbol();
    var INFINITY = 1 / 0;
    function toKey(value) {
      if (typeof value == "string" || isSymbol(value)) {
        return value;
      }
      var result = value + "";
      return result == "0" && 1 / value == -INFINITY ? "-0" : result;
    }
    module.exports = toKey;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGet.js
var require_baseGet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseGet.js"(exports, module) {
    var castPath = require_castPath();
    var toKey = require_toKey();
    function baseGet(object, path) {
      path = castPath(path, object);
      var index = 0, length = path.length;
      while (object != null && index < length) {
        object = object[toKey(path[index++])];
      }
      return index && index == length ? object : void 0;
    }
    module.exports = baseGet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSlice.js
var require_baseSlice = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSlice.js"(exports, module) {
    function baseSlice(array, start, end) {
      var index = -1, length = array.length;
      if (start < 0) {
        start = -start > length ? 0 : length + start;
      }
      end = end > length ? length : end;
      if (end < 0) {
        end += length;
      }
      length = start > end ? 0 : end - start >>> 0;
      start >>>= 0;
      var result = Array(length);
      while (++index < length) {
        result[index] = array[index + start];
      }
      return result;
    }
    module.exports = baseSlice;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_parent.js
var require_parent = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_parent.js"(exports, module) {
    var baseGet = require_baseGet();
    var baseSlice = require_baseSlice();
    function parent(object, path) {
      return path.length < 2 ? object : baseGet(object, baseSlice(path, 0, -1));
    }
    module.exports = parent;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUnset.js
var require_baseUnset = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseUnset.js"(exports, module) {
    var castPath = require_castPath();
    var last = require_last();
    var parent = require_parent();
    var toKey = require_toKey();
    function baseUnset(object, path) {
      path = castPath(path, object);
      object = parent(object, path);
      return object == null || delete object[toKey(last(path))];
    }
    module.exports = baseUnset;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_customOmitClone.js
var require_customOmitClone = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_customOmitClone.js"(exports, module) {
    var isPlainObject = require_isPlainObject();
    function customOmitClone(value) {
      return isPlainObject(value) ? void 0 : value;
    }
    module.exports = customOmitClone;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isFlattenable.js
var require_isFlattenable = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_isFlattenable.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var spreadableSymbol = Symbol2 ? Symbol2.isConcatSpreadable : void 0;
    function isFlattenable(value) {
      return isArray(value) || isArguments(value) || !!(spreadableSymbol && value && value[spreadableSymbol]);
    }
    module.exports = isFlattenable;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFlatten.js
var require_baseFlatten = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseFlatten.js"(exports, module) {
    var arrayPush = require_arrayPush();
    var isFlattenable = require_isFlattenable();
    function baseFlatten(array, depth, predicate, isStrict, result) {
      var index = -1, length = array.length;
      predicate || (predicate = isFlattenable);
      result || (result = []);
      while (++index < length) {
        var value = array[index];
        if (depth > 0 && predicate(value)) {
          if (depth > 1) {
            baseFlatten(value, depth - 1, predicate, isStrict, result);
          } else {
            arrayPush(result, value);
          }
        } else if (!isStrict) {
          result[result.length] = value;
        }
      }
      return result;
    }
    module.exports = baseFlatten;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/flatten.js
var require_flatten = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/flatten.js"(exports, module) {
    var baseFlatten = require_baseFlatten();
    function flatten2(array) {
      var length = array == null ? 0 : array.length;
      return length ? baseFlatten(array, 1) : [];
    }
    module.exports = flatten2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_flatRest.js
var require_flatRest = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_flatRest.js"(exports, module) {
    var flatten2 = require_flatten();
    var overRest = require_overRest();
    var setToString = require_setToString();
    function flatRest(func) {
      return setToString(overRest(func, void 0, flatten2), func + "");
    }
    module.exports = flatRest;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/omit.js
var require_omit = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/omit.js"(exports, module) {
    var arrayMap = require_arrayMap();
    var baseClone = require_baseClone();
    var baseUnset = require_baseUnset();
    var castPath = require_castPath();
    var copyObject = require_copyObject();
    var customOmitClone = require_customOmitClone();
    var flatRest = require_flatRest();
    var getAllKeysIn = require_getAllKeysIn();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_FLAT_FLAG = 2;
    var CLONE_SYMBOLS_FLAG = 4;
    var omit = flatRest(function(object, paths) {
      var result = {};
      if (object == null) {
        return result;
      }
      var isDeep = false;
      paths = arrayMap(paths, function(path) {
        path = castPath(path, object);
        isDeep || (isDeep = path.length > 1);
        return path;
      });
      copyObject(object, getAllKeysIn(object), result);
      if (isDeep) {
        result = baseClone(result, CLONE_DEEP_FLAG | CLONE_FLAT_FLAG | CLONE_SYMBOLS_FLAG, customOmitClone);
      }
      var length = paths.length;
      while (length--) {
        baseUnset(result, paths[length]);
      }
      return result;
    });
    module.exports = omit;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isUndefined.js
var require_isUndefined = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isUndefined.js"(exports, module) {
    function isUndefined(value) {
      return value === void 0;
    }
    module.exports = isUndefined;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheAdd.js
var require_setCacheAdd = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheAdd.js"(exports, module) {
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    function setCacheAdd(value) {
      this.__data__.set(value, HASH_UNDEFINED);
      return this;
    }
    module.exports = setCacheAdd;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheHas.js
var require_setCacheHas = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setCacheHas.js"(exports, module) {
    function setCacheHas(value) {
      return this.__data__.has(value);
    }
    module.exports = setCacheHas;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_SetCache.js
var require_SetCache = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_SetCache.js"(exports, module) {
    var MapCache = require_MapCache();
    var setCacheAdd = require_setCacheAdd();
    var setCacheHas = require_setCacheHas();
    function SetCache(values) {
      var index = -1, length = values == null ? 0 : values.length;
      this.__data__ = new MapCache();
      while (++index < length) {
        this.add(values[index]);
      }
    }
    SetCache.prototype.add = SetCache.prototype.push = setCacheAdd;
    SetCache.prototype.has = setCacheHas;
    module.exports = SetCache;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arraySome.js
var require_arraySome = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_arraySome.js"(exports, module) {
    function arraySome(array, predicate) {
      var index = -1, length = array == null ? 0 : array.length;
      while (++index < length) {
        if (predicate(array[index], index, array)) {
          return true;
        }
      }
      return false;
    }
    module.exports = arraySome;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cacheHas.js
var require_cacheHas = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_cacheHas.js"(exports, module) {
    function cacheHas(cache, key) {
      return cache.has(key);
    }
    module.exports = cacheHas;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalArrays.js
var require_equalArrays = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalArrays.js"(exports, module) {
    var SetCache = require_SetCache();
    var arraySome = require_arraySome();
    var cacheHas = require_cacheHas();
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    function equalArrays(array, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, arrLength = array.length, othLength = other.length;
      if (arrLength != othLength && !(isPartial && othLength > arrLength)) {
        return false;
      }
      var arrStacked = stack.get(array);
      var othStacked = stack.get(other);
      if (arrStacked && othStacked) {
        return arrStacked == other && othStacked == array;
      }
      var index = -1, result = true, seen = bitmask & COMPARE_UNORDERED_FLAG ? new SetCache() : void 0;
      stack.set(array, other);
      stack.set(other, array);
      while (++index < arrLength) {
        var arrValue = array[index], othValue = other[index];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, arrValue, index, other, array, stack) : customizer(arrValue, othValue, index, array, other, stack);
        }
        if (compared !== void 0) {
          if (compared) {
            continue;
          }
          result = false;
          break;
        }
        if (seen) {
          if (!arraySome(other, function(othValue2, othIndex) {
            if (!cacheHas(seen, othIndex) && (arrValue === othValue2 || equalFunc(arrValue, othValue2, bitmask, customizer, stack))) {
              return seen.push(othIndex);
            }
          })) {
            result = false;
            break;
          }
        } else if (!(arrValue === othValue || equalFunc(arrValue, othValue, bitmask, customizer, stack))) {
          result = false;
          break;
        }
      }
      stack["delete"](array);
      stack["delete"](other);
      return result;
    }
    module.exports = equalArrays;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapToArray.js
var require_mapToArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_mapToArray.js"(exports, module) {
    function mapToArray(map) {
      var index = -1, result = Array(map.size);
      map.forEach(function(value, key) {
        result[++index] = [key, value];
      });
      return result;
    }
    module.exports = mapToArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToArray.js
var require_setToArray = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_setToArray.js"(exports, module) {
    function setToArray(set) {
      var index = -1, result = Array(set.size);
      set.forEach(function(value) {
        result[++index] = value;
      });
      return result;
    }
    module.exports = setToArray;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalByTag.js
var require_equalByTag = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalByTag.js"(exports, module) {
    var Symbol2 = require_Symbol();
    var Uint8Array2 = require_Uint8Array();
    var eq = require_eq();
    var equalArrays = require_equalArrays();
    var mapToArray = require_mapToArray();
    var setToArray = require_setToArray();
    var COMPARE_PARTIAL_FLAG = 1;
    var COMPARE_UNORDERED_FLAG = 2;
    var boolTag = "[object Boolean]";
    var dateTag = "[object Date]";
    var errorTag = "[object Error]";
    var mapTag = "[object Map]";
    var numberTag = "[object Number]";
    var regexpTag = "[object RegExp]";
    var setTag = "[object Set]";
    var stringTag = "[object String]";
    var symbolTag = "[object Symbol]";
    var arrayBufferTag = "[object ArrayBuffer]";
    var dataViewTag = "[object DataView]";
    var symbolProto = Symbol2 ? Symbol2.prototype : void 0;
    var symbolValueOf = symbolProto ? symbolProto.valueOf : void 0;
    function equalByTag(object, other, tag, bitmask, customizer, equalFunc, stack) {
      switch (tag) {
        case dataViewTag:
          if (object.byteLength != other.byteLength || object.byteOffset != other.byteOffset) {
            return false;
          }
          object = object.buffer;
          other = other.buffer;
        case arrayBufferTag:
          if (object.byteLength != other.byteLength || !equalFunc(new Uint8Array2(object), new Uint8Array2(other))) {
            return false;
          }
          return true;
        case boolTag:
        case dateTag:
        case numberTag:
          return eq(+object, +other);
        case errorTag:
          return object.name == other.name && object.message == other.message;
        case regexpTag:
        case stringTag:
          return object == other + "";
        case mapTag:
          var convert = mapToArray;
        case setTag:
          var isPartial = bitmask & COMPARE_PARTIAL_FLAG;
          convert || (convert = setToArray);
          if (object.size != other.size && !isPartial) {
            return false;
          }
          var stacked = stack.get(object);
          if (stacked) {
            return stacked == other;
          }
          bitmask |= COMPARE_UNORDERED_FLAG;
          stack.set(object, other);
          var result = equalArrays(convert(object), convert(other), bitmask, customizer, equalFunc, stack);
          stack["delete"](object);
          return result;
        case symbolTag:
          if (symbolValueOf) {
            return symbolValueOf.call(object) == symbolValueOf.call(other);
          }
      }
      return false;
    }
    module.exports = equalByTag;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalObjects.js
var require_equalObjects = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_equalObjects.js"(exports, module) {
    var getAllKeys = require_getAllKeys();
    var COMPARE_PARTIAL_FLAG = 1;
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function equalObjects(object, other, bitmask, customizer, equalFunc, stack) {
      var isPartial = bitmask & COMPARE_PARTIAL_FLAG, objProps = getAllKeys(object), objLength = objProps.length, othProps = getAllKeys(other), othLength = othProps.length;
      if (objLength != othLength && !isPartial) {
        return false;
      }
      var index = objLength;
      while (index--) {
        var key = objProps[index];
        if (!(isPartial ? key in other : hasOwnProperty3.call(other, key))) {
          return false;
        }
      }
      var objStacked = stack.get(object);
      var othStacked = stack.get(other);
      if (objStacked && othStacked) {
        return objStacked == other && othStacked == object;
      }
      var result = true;
      stack.set(object, other);
      stack.set(other, object);
      var skipCtor = isPartial;
      while (++index < objLength) {
        key = objProps[index];
        var objValue = object[key], othValue = other[key];
        if (customizer) {
          var compared = isPartial ? customizer(othValue, objValue, key, other, object, stack) : customizer(objValue, othValue, key, object, other, stack);
        }
        if (!(compared === void 0 ? objValue === othValue || equalFunc(objValue, othValue, bitmask, customizer, stack) : compared)) {
          result = false;
          break;
        }
        skipCtor || (skipCtor = key == "constructor");
      }
      if (result && !skipCtor) {
        var objCtor = object.constructor, othCtor = other.constructor;
        if (objCtor != othCtor && ("constructor" in object && "constructor" in other) && !(typeof objCtor == "function" && objCtor instanceof objCtor && typeof othCtor == "function" && othCtor instanceof othCtor)) {
          result = false;
        }
      }
      stack["delete"](object);
      stack["delete"](other);
      return result;
    }
    module.exports = equalObjects;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqualDeep.js
var require_baseIsEqualDeep = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqualDeep.js"(exports, module) {
    var Stack = require_Stack();
    var equalArrays = require_equalArrays();
    var equalByTag = require_equalByTag();
    var equalObjects = require_equalObjects();
    var getTag = require_getTag();
    var isArray = require_isArray();
    var isBuffer = require_isBuffer();
    var isTypedArray = require_isTypedArray();
    var COMPARE_PARTIAL_FLAG = 1;
    var argsTag = "[object Arguments]";
    var arrayTag = "[object Array]";
    var objectTag = "[object Object]";
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function baseIsEqualDeep(object, other, bitmask, customizer, equalFunc, stack) {
      var objIsArr = isArray(object), othIsArr = isArray(other), objTag = objIsArr ? arrayTag : getTag(object), othTag = othIsArr ? arrayTag : getTag(other);
      objTag = objTag == argsTag ? objectTag : objTag;
      othTag = othTag == argsTag ? objectTag : othTag;
      var objIsObj = objTag == objectTag, othIsObj = othTag == objectTag, isSameTag = objTag == othTag;
      if (isSameTag && isBuffer(object)) {
        if (!isBuffer(other)) {
          return false;
        }
        objIsArr = true;
        objIsObj = false;
      }
      if (isSameTag && !objIsObj) {
        stack || (stack = new Stack());
        return objIsArr || isTypedArray(object) ? equalArrays(object, other, bitmask, customizer, equalFunc, stack) : equalByTag(object, other, objTag, bitmask, customizer, equalFunc, stack);
      }
      if (!(bitmask & COMPARE_PARTIAL_FLAG)) {
        var objIsWrapped = objIsObj && hasOwnProperty3.call(object, "__wrapped__"), othIsWrapped = othIsObj && hasOwnProperty3.call(other, "__wrapped__");
        if (objIsWrapped || othIsWrapped) {
          var objUnwrapped = objIsWrapped ? object.value() : object, othUnwrapped = othIsWrapped ? other.value() : other;
          stack || (stack = new Stack());
          return equalFunc(objUnwrapped, othUnwrapped, bitmask, customizer, stack);
        }
      }
      if (!isSameTag) {
        return false;
      }
      stack || (stack = new Stack());
      return equalObjects(object, other, bitmask, customizer, equalFunc, stack);
    }
    module.exports = baseIsEqualDeep;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqual.js
var require_baseIsEqual = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseIsEqual.js"(exports, module) {
    var baseIsEqualDeep = require_baseIsEqualDeep();
    var isObjectLike = require_isObjectLike();
    function baseIsEqual(value, other, bitmask, customizer, stack) {
      if (value === other) {
        return true;
      }
      if (value == null || other == null || !isObjectLike(value) && !isObjectLike(other)) {
        return value !== value && other !== other;
      }
      return baseIsEqualDeep(value, other, bitmask, customizer, baseIsEqual, stack);
    }
    module.exports = baseIsEqual;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEqual.js
var require_isEqual = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEqual.js"(exports, module) {
    var baseIsEqual = require_baseIsEqual();
    function isEqual(value, other) {
      return baseIsEqual(value, other);
    }
    module.exports = isEqual;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEmpty.js
var require_isEmpty = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isEmpty.js"(exports, module) {
    var baseKeys = require_baseKeys();
    var getTag = require_getTag();
    var isArguments = require_isArguments();
    var isArray = require_isArray();
    var isArrayLike = require_isArrayLike();
    var isBuffer = require_isBuffer();
    var isPrototype = require_isPrototype();
    var isTypedArray = require_isTypedArray();
    var mapTag = "[object Map]";
    var setTag = "[object Set]";
    var objectProto = Object.prototype;
    var hasOwnProperty3 = objectProto.hasOwnProperty;
    function isEmpty(value) {
      if (value == null) {
        return true;
      }
      if (isArrayLike(value) && (isArray(value) || typeof value == "string" || typeof value.splice == "function" || isBuffer(value) || isTypedArray(value) || isArguments(value))) {
        return !value.length;
      }
      var tag = getTag(value);
      if (tag == mapTag || tag == setTag) {
        return !value.size;
      }
      if (isPrototype(value)) {
        return !baseKeys(value).length;
      }
      for (var key in value) {
        if (hasOwnProperty3.call(value, key)) {
          return false;
        }
      }
      return true;
    }
    module.exports = isEmpty;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseForOwn.js
var require_baseForOwn = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseForOwn.js"(exports, module) {
    var baseFor = require_baseFor();
    var keys = require_keys();
    function baseForOwn(object, iteratee) {
      return object && baseFor(object, iteratee, keys);
    }
    module.exports = baseForOwn;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseEach.js
var require_createBaseEach = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_createBaseEach.js"(exports, module) {
    var isArrayLike = require_isArrayLike();
    function createBaseEach(eachFunc, fromRight) {
      return function(collection, iteratee) {
        if (collection == null) {
          return collection;
        }
        if (!isArrayLike(collection)) {
          return eachFunc(collection, iteratee);
        }
        var length = collection.length, index = fromRight ? length : -1, iterable = Object(collection);
        while (fromRight ? index-- : ++index < length) {
          if (iteratee(iterable[index], index, iterable) === false) {
            break;
          }
        }
        return collection;
      };
    }
    module.exports = createBaseEach;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseEach.js
var require_baseEach = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseEach.js"(exports, module) {
    var baseForOwn = require_baseForOwn();
    var createBaseEach = require_createBaseEach();
    var baseEach = createBaseEach(baseForOwn);
    module.exports = baseEach;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_castFunction.js
var require_castFunction = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_castFunction.js"(exports, module) {
    var identity = require_identity();
    function castFunction(value) {
      return typeof value == "function" ? value : identity;
    }
    module.exports = castFunction;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/forEach.js
var require_forEach = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/forEach.js"(exports, module) {
    var arrayEach = require_arrayEach();
    var baseEach = require_baseEach();
    var castFunction = require_castFunction();
    var isArray = require_isArray();
    function forEach(collection, iteratee) {
      var func = isArray(collection) ? arrayEach : baseEach;
      return func(collection, castFunction(iteratee));
    }
    module.exports = forEach;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/each.js
var require_each = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/each.js"(exports, module) {
    module.exports = require_forEach();
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/get.js
var require_get = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/get.js"(exports, module) {
    var baseGet = require_baseGet();
    function get(object, path, defaultValue) {
      var result = object == null ? void 0 : baseGet(object, path);
      return result === void 0 ? defaultValue : result;
    }
    module.exports = get;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/noop.js
var require_noop = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/noop.js"(exports, module) {
    function noop2() {
    }
    module.exports = noop2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/now.js
var require_now = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/now.js"(exports, module) {
    var root = require_root();
    var now = function() {
      return root.Date.now();
    };
    module.exports = now;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_trimmedEndIndex.js
var require_trimmedEndIndex = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_trimmedEndIndex.js"(exports, module) {
    var reWhitespace = /\s/;
    function trimmedEndIndex(string) {
      var index = string.length;
      while (index-- && reWhitespace.test(string.charAt(index))) {
      }
      return index;
    }
    module.exports = trimmedEndIndex;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTrim.js
var require_baseTrim = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseTrim.js"(exports, module) {
    var trimmedEndIndex = require_trimmedEndIndex();
    var reTrimStart = /^\s+/;
    function baseTrim(string) {
      return string ? string.slice(0, trimmedEndIndex(string) + 1).replace(reTrimStart, "") : string;
    }
    module.exports = baseTrim;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toNumber.js
var require_toNumber = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toNumber.js"(exports, module) {
    var baseTrim = require_baseTrim();
    var isObject2 = require_isObject();
    var isSymbol = require_isSymbol();
    var NAN = 0 / 0;
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;
    var reIsBinary = /^0b[01]+$/i;
    var reIsOctal = /^0o[0-7]+$/i;
    var freeParseInt = parseInt;
    function toNumber(value) {
      if (typeof value == "number") {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject2(value)) {
        var other = typeof value.valueOf == "function" ? value.valueOf() : value;
        value = isObject2(other) ? other + "" : other;
      }
      if (typeof value != "string") {
        return value === 0 ? value : +value;
      }
      value = baseTrim(value);
      var isBinary = reIsBinary.test(value);
      return isBinary || reIsOctal.test(value) ? freeParseInt(value.slice(2), isBinary ? 2 : 8) : reIsBadHex.test(value) ? NAN : +value;
    }
    module.exports = toNumber;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/debounce.js
var require_debounce = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/debounce.js"(exports, module) {
    var isObject2 = require_isObject();
    var now = require_now();
    var toNumber = require_toNumber();
    var FUNC_ERROR_TEXT = "Expected a function";
    var nativeMax = Math.max;
    var nativeMin = Math.min;
    function debounce(func, wait, options) {
      var lastArgs, lastThis, maxWait, result, timerId, lastCallTime, lastInvokeTime = 0, leading = false, maxing = false, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject2(options)) {
        leading = !!options.leading;
        maxing = "maxWait" in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      function invokeFunc(time) {
        var args = lastArgs, thisArg = lastThis;
        lastArgs = lastThis = void 0;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }
      function leadingEdge(time) {
        lastInvokeTime = time;
        timerId = setTimeout(timerExpired, wait);
        return leading ? invokeFunc(time) : result;
      }
      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime, timeWaiting = wait - timeSinceLastCall;
        return maxing ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke) : timeWaiting;
      }
      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime, timeSinceLastInvoke = time - lastInvokeTime;
        return lastCallTime === void 0 || timeSinceLastCall >= wait || timeSinceLastCall < 0 || maxing && timeSinceLastInvoke >= maxWait;
      }
      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        timerId = setTimeout(timerExpired, remainingWait(time));
      }
      function trailingEdge(time) {
        timerId = void 0;
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = void 0;
        return result;
      }
      function cancel() {
        if (timerId !== void 0) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = void 0;
      }
      function flush() {
        return timerId === void 0 ? result : trailingEdge(now());
      }
      function debounced() {
        var time = now(), isInvoking = shouldInvoke(time);
        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;
        if (isInvoking) {
          if (timerId === void 0) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            clearTimeout(timerId);
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === void 0) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }
    module.exports = debounce;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/throttle.js
var require_throttle = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/throttle.js"(exports, module) {
    var debounce = require_debounce();
    var isObject2 = require_isObject();
    var FUNC_ERROR_TEXT = "Expected a function";
    function throttle(func, wait, options) {
      var leading = true, trailing = true;
      if (typeof func != "function") {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      if (isObject2(options)) {
        leading = "leading" in options ? !!options.leading : leading;
        trailing = "trailing" in options ? !!options.trailing : trailing;
      }
      return debounce(func, wait, {
        "leading": leading,
        "maxWait": wait,
        "trailing": trailing
      });
    }
    module.exports = throttle;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSet.js
var require_baseSet = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/_baseSet.js"(exports, module) {
    var assignValue = require_assignValue();
    var castPath = require_castPath();
    var isIndex = require_isIndex();
    var isObject2 = require_isObject();
    var toKey = require_toKey();
    function baseSet(object, path, value, customizer) {
      if (!isObject2(object)) {
        return object;
      }
      path = castPath(path, object);
      var index = -1, length = path.length, lastIndex = length - 1, nested = object;
      while (nested != null && ++index < length) {
        var key = toKey(path[index]), newValue = value;
        if (key === "__proto__" || key === "constructor" || key === "prototype") {
          return object;
        }
        if (index != lastIndex) {
          var objValue = nested[key];
          newValue = customizer ? customizer(objValue, key, nested) : void 0;
          if (newValue === void 0) {
            newValue = isObject2(objValue) ? objValue : isIndex(path[index + 1]) ? [] : {};
          }
        }
        assignValue(nested, key, newValue);
        nested = nested[key];
      }
      return object;
    }
    module.exports = baseSet;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/set.js
var require_set = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/set.js"(exports, module) {
    var baseSet = require_baseSet();
    function set(object, path, value) {
      return object == null ? object : baseSet(object, path, value);
    }
    module.exports = set;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/cloneDeepWith.js
var require_cloneDeepWith = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/cloneDeepWith.js"(exports, module) {
    var baseClone = require_baseClone();
    var CLONE_DEEP_FLAG = 1;
    var CLONE_SYMBOLS_FLAG = 4;
    function cloneDeepWith(value, customizer) {
      customizer = typeof customizer == "function" ? customizer : void 0;
      return baseClone(value, CLONE_DEEP_FLAG | CLONE_SYMBOLS_FLAG, customizer);
    }
    module.exports = cloneDeepWith;
  }
});

// node_modules/.pnpm/copy-text-to-clipboard@2.2.0/node_modules/copy-text-to-clipboard/index.js
var require_copy_text_to_clipboard = __commonJS({
  "node_modules/.pnpm/copy-text-to-clipboard@2.2.0/node_modules/copy-text-to-clipboard/index.js"(exports, module) {
    "use strict";
    var copyTextToClipboard = (input, { target = document.body } = {}) => {
      const element = document.createElement("textarea");
      const previouslyFocusedElement = document.activeElement;
      element.value = input;
      element.setAttribute("readonly", "");
      element.style.contain = "strict";
      element.style.position = "absolute";
      element.style.left = "-9999px";
      element.style.fontSize = "12pt";
      const selection = document.getSelection();
      let originalRange = false;
      if (selection.rangeCount > 0) {
        originalRange = selection.getRangeAt(0);
      }
      target.append(element);
      element.select();
      element.selectionStart = 0;
      element.selectionEnd = input.length;
      let isSuccess = false;
      try {
        isSuccess = document.execCommand("copy");
      } catch (_) {
      }
      element.remove();
      if (originalRange) {
        selection.removeAllRanges();
        selection.addRange(originalRange);
      }
      if (previouslyFocusedElement) {
        previouslyFocusedElement.focus();
      }
      return isSuccess;
    };
    module.exports = copyTextToClipboard;
    module.exports.default = copyTextToClipboard;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isNumber.js
var require_isNumber = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/isNumber.js"(exports, module) {
    var baseGetTag = require_baseGetTag();
    var isObjectLike = require_isObjectLike();
    var numberTag = "[object Number]";
    function isNumber(value) {
      return typeof value == "number" || isObjectLike(value) && baseGetTag(value) == numberTag;
    }
    module.exports = isNumber;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toFinite.js
var require_toFinite = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toFinite.js"(exports, module) {
    var toNumber = require_toNumber();
    var INFINITY = 1 / 0;
    var MAX_INTEGER = 17976931348623157e292;
    function toFinite(value) {
      if (!value) {
        return value === 0 ? value : 0;
      }
      value = toNumber(value);
      if (value === INFINITY || value === -INFINITY) {
        var sign = value < 0 ? -1 : 1;
        return sign * MAX_INTEGER;
      }
      return value === value ? value : 0;
    }
    module.exports = toFinite;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toInteger.js
var require_toInteger = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/toInteger.js"(exports, module) {
    var toFinite = require_toFinite();
    function toInteger2(value) {
      var result = toFinite(value), remainder = result % 1;
      return result === result ? remainder ? result - remainder : result : 0;
    }
    module.exports = toInteger2;
  }
});

// node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/times.js
var require_times = __commonJS({
  "node_modules/.pnpm/lodash@4.17.21/node_modules/lodash/times.js"(exports, module) {
    var baseTimes = require_baseTimes();
    var castFunction = require_castFunction();
    var toInteger2 = require_toInteger();
    var MAX_SAFE_INTEGER = 9007199254740991;
    var MAX_ARRAY_LENGTH = 4294967295;
    var nativeMin = Math.min;
    function times(n, iteratee) {
      n = toInteger2(n);
      if (n < 1 || n > MAX_SAFE_INTEGER) {
        return [];
      }
      var index = MAX_ARRAY_LENGTH, length = nativeMin(n, MAX_ARRAY_LENGTH);
      iteratee = castFunction(iteratee);
      n -= MAX_ARRAY_LENGTH;
      var result = baseTimes(length, iteratee);
      while (++index < n) {
        iteratee(index);
      }
      return result;
    }
    module.exports = times;
  }
});

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconActivity.js
var React2 = __toESM(require_react());

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/components/Icon.js
var import_react = __toESM(require_react());

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/env.js
var BASE_CLASS_PREFIX = "semi";

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/components/Icon.js
var import_classnames = __toESM(require_classnames());
var __rest = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var Icon = /* @__PURE__ */ import_react.default.forwardRef((props, ref2) => {
  const {
    svg,
    spin = false,
    rotate,
    style,
    className,
    prefixCls: prefixCls17 = BASE_CLASS_PREFIX,
    type,
    size = "default"
  } = props, restProps = __rest(props, ["svg", "spin", "rotate", "style", "className", "prefixCls", "type", "size"]);
  const classes = (0, import_classnames.default)(`${prefixCls17}-icon`, {
    [`${prefixCls17}-icon-extra-small`]: size === "extra-small",
    [`${prefixCls17}-icon-small`]: size === "small",
    [`${prefixCls17}-icon-default`]: size === "default",
    [`${prefixCls17}-icon-large`]: size === "large",
    [`${prefixCls17}-icon-extra-large`]: size === "extra-large",
    [`${prefixCls17}-icon-spinning`]: spin === true,
    [`${prefixCls17}-icon-${type}`]: Boolean(type)
  }, className);
  const outerStyle = {};
  if (Number.isSafeInteger(rotate)) {
    outerStyle.transform = `rotate(${rotate}deg)`;
  }
  Object.assign(outerStyle, style);
  return /* @__PURE__ */ import_react.default.createElement("span", Object.assign({
    role: "img",
    ref: ref2,
    "aria-label": type,
    className: classes,
    style: outerStyle
  }, restProps), svg);
});
Icon.elementType = "Icon";
var convertIcon = (Svg, iconType) => {
  const InnerIcon = /* @__PURE__ */ import_react.default.forwardRef((props, ref2) => /* @__PURE__ */ import_react.default.createElement(Icon, Object.assign({
    svg: /* @__PURE__ */ import_react.default.createElement(Svg),
    type: iconType,
    ref: ref2
  }, props)));
  InnerIcon.elementType = "Icon";
  return InnerIcon;
};

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconActivity.js
function SvgComponent(props) {
  return /* @__PURE__ */ React2.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React2.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M11.9999 1C11.1715 1 10.4999 1.67157 10.4999 2.5C10.4999 3.32843 11.1715 4 11.9999 4C16.4182 4 19.9999 7.58172 19.9999 12C19.9999 16.4183 16.4182 20 11.9999 20C10.2181 20 8.57637 19.4193 7.24767 18.4363C6.58168 17.9436 5.64238 18.0841 5.14969 18.7501C4.65699 19.4161 4.79747 20.3554 5.46346 20.8481C7.29098 22.2001 9.5542 23 11.9999 23C18.075 23 22.9999 18.0751 22.9999 12C22.9999 5.92487 18.075 1 11.9999 1ZM7.5 5.2C8.32843 5.2 9 4.52843 9 3.7C9 2.87157 8.32843 2.2 7.5 2.2C6.67157 2.2 6 2.87157 6 3.7C6 4.52843 6.67157 5.2 7.5 5.2ZM5.5 7C5.5 7.82843 4.82843 8.5 4 8.5C3.17157 8.5 2.5 7.82843 2.5 7C2.5 6.17157 3.17157 5.5 4 5.5C4.82843 5.5 5.5 6.17157 5.5 7ZM2.5 13C3.32843 13 4 12.3284 4 11.5C4 10.6716 3.32843 10 2.5 10C1.67157 10 1 10.6716 1 11.5C1 12.3284 1.67157 13 2.5 13ZM5 16.5C5 17.3284 4.32843 18 3.5 18C2.67157 18 2 17.3284 2 16.5C2 15.6716 2.67157 15 3.5 15C4.32843 15 5 15.6716 5 16.5ZM13.5 7.5C13.5 6.67157 12.8284 6 12 6C11.1716 6 10.5 6.67157 10.5 7.5V12C10.5 12.3978 10.658 12.7794 10.9393 13.0607L13.9393 16.0607C14.5251 16.6464 15.4749 16.6464 16.0607 16.0607C16.6464 15.4749 16.6464 14.5251 16.0607 13.9393L13.5 11.3787V7.5Z",
    fill: "currentColor"
  }));
}
var IconComponent = convertIcon(SvgComponent, "activity");
var IconActivity_default = IconComponent;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconBell.js
var React3 = __toESM(require_react());
function SvgComponent2(props) {
  return /* @__PURE__ */ React3.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React3.createElement("path", {
    d: "M17.9999 9C17.9999 6.77641 16.7904 4.83534 14.9933 3.79886C14.8898 2.23579 13.5892 1 11.9999 1C10.4107 1 9.11006 2.23579 9.00658 3.79886C7.20952 4.83534 5.99995 6.77641 5.99995 9C5.99995 9 5.99995 11 5.49995 13C5.21672 14.1329 3.81039 15.9076 2.64425 17.2335C2.05586 17.9024 2.52326 19 3.41416 19H20.5857C21.4766 19 21.944 17.9024 21.3556 17.2335C20.1895 15.9076 18.7832 14.1329 18.4999 13C17.9999 11 17.9999 9 17.9999 9Z",
    fill: "currentColor"
  }), /* @__PURE__ */ React3.createElement("path", {
    d: "M15 20C15 21.6569 13.6569 23 12 23C10.3431 23 9 21.6569 9 20H15Z",
    fill: "currentColor"
  }));
}
var IconComponent2 = convertIcon(SvgComponent2, "bell");
var IconBell_default = IconComponent2;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconDownload.js
var React4 = __toESM(require_react());
function SvgComponent3(props) {
  return /* @__PURE__ */ React4.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React4.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M17.8395 8.05827C17.1837 5.16226 14.5944 3 11.5 3C7.91015 3 5 5.91015 5 9.5C5 10.0204 5.06115 10.5264 5.17665 11.0114C2.84229 11.1772 1 13.1234 1 15.5C1 17.9853 3.01469 20 5.49995 20H17C20.3137 20 23 17.3137 23 14C23 10.9712 20.7558 8.46659 17.8395 8.05827ZM11.6799 17.7333C11.8653 17.8878 12.1347 17.8878 12.3201 17.7333L17.4695 13.4421C17.6492 13.2924 17.5433 13 17.3095 13H14V9.5C14 9.22386 13.7761 9 13.5 9H10.5C10.2239 9 10 9.22386 10 9.5V13H6.69051C6.45669 13 6.35084 13.2924 6.53047 13.4421L11.6799 17.7333Z",
    fill: "currentColor"
  }));
}
var IconComponent3 = convertIcon(SvgComponent3, "download");
var IconDownload_default = IconComponent3;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconFavoriteList.js
var React5 = __toESM(require_react());
function SvgComponent4(props) {
  return /* @__PURE__ */ React5.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React5.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M13.248 1.90398C12.854 0.699977 11.145 0.699977 10.753 1.90398L8.76003 8.01998H2.31403C1.04403 8.01998 0.515034 9.64198 1.54403 10.387L6.75803 14.167L4.76603 20.282C4.37403 21.488 5.75603 22.49 6.78503 21.745L12 17.964V13C12 12.7348 12.1054 12.4804 12.2929 12.2929C12.4805 12.1053 12.7348 12 13 12H20.23L22.457 10.386C23.485 9.64098 22.957 8.01898 21.686 8.01898H15.239L13.247 1.90398H13.248Z",
    fill: "currentColor"
  }), /* @__PURE__ */ React5.createElement("path", {
    d: "M14 14.5C14 14.3674 14.0527 14.2402 14.1464 14.1464C14.2402 14.0527 14.3674 14 14.5 14H22.5C22.6326 14 22.7598 14.0527 22.8536 14.1464C22.9473 14.2402 23 14.3674 23 14.5V16.5C23 16.6326 22.9473 16.7598 22.8536 16.8536C22.7598 16.9473 22.6326 17 22.5 17H14.5C14.3674 17 14.2402 16.9473 14.1464 16.8536C14.0527 16.7598 14 16.6326 14 16.5V14.5ZM14 19.5C14 19.3674 14.0527 19.2402 14.1464 19.1464C14.2402 19.0527 14.3674 19 14.5 19H22.5C22.6326 19 22.7598 19.0527 22.8536 19.1464C22.9473 19.2402 23 19.3674 23 19.5V21.5C23 21.6326 22.9473 21.7598 22.8536 21.8536C22.7598 21.9473 22.6326 22 22.5 22H14.5C14.3674 22 14.2402 21.9473 14.1464 21.8536C14.0527 21.7598 14 21.6326 14 21.5V19.5Z",
    fill: "currentColor"
  }));
}
var IconComponent4 = convertIcon(SvgComponent4, "favorite_list");
var IconFavoriteList_default = IconComponent4;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconGithubLogo.js
var React6 = __toESM(require_react());
function SvgComponent5(props) {
  return /* @__PURE__ */ React6.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React6.createElement("path", {
    d: "M12.0101 1C5.92171 1 1 5.92171 1 12.0101C1 16.8771 4.15354 20.9967 8.5284 22.455C9.07526 22.5644 9.27577 22.218 9.27577 21.9264C9.27577 21.6712 9.25754 20.7962 9.25754 19.8848C6.19514 20.541 5.55714 18.5723 5.55714 18.5723C5.06497 17.2963 4.33583 16.9682 4.33583 16.9682C3.33326 16.2938 4.40874 16.2938 4.40874 16.2938C5.52069 16.3667 6.104 17.4239 6.104 17.4239C7.08834 19.101 8.67423 18.627 9.31223 18.3354C9.40337 17.6245 9.69503 17.1323 10.0049 16.8589C7.56229 16.6037 4.99206 15.6558 4.99206 11.4267C4.99206 10.2237 5.42954 9.23931 6.12223 8.47371C6.01286 8.20028 5.63006 7.07011 6.2316 5.55714C6.2316 5.55714 7.16126 5.26548 9.25754 6.68731C10.1325 6.45034 11.0804 6.32274 12.0101 6.32274C12.9397 6.32274 13.8876 6.45034 14.7626 6.68731C16.8589 5.26548 17.7885 5.55714 17.7885 5.55714C18.3901 7.07011 18.0073 8.20028 17.8979 8.47371C18.6088 9.23931 19.0281 10.2237 19.0281 11.4267C19.0281 15.6558 16.4578 16.5854 13.997 16.8589C14.398 17.2052 14.7443 17.8614 14.7443 18.9004C14.7443 20.377 14.7261 21.5618 14.7261 21.9264C14.7261 22.218 14.9266 22.5644 15.4735 22.455C19.8483 20.9967 23.0019 16.8771 23.0019 12.0101C23.0201 5.92171 18.0802 1 12.0101 1Z",
    fill: "currentColor"
  }), /* @__PURE__ */ React6.createElement("path", {
    d: "M5.17419 16.8042C5.15596 16.8589 5.06482 16.8771 4.99191 16.8406C4.91899 16.8042 4.86431 16.7313 4.90076 16.6766C4.91899 16.6219 5.01014 16.6037 5.08305 16.6401C5.15596 16.6766 5.19242 16.7495 5.17419 16.8042ZM5.61168 17.2964C5.55699 17.351 5.44762 17.3146 5.39294 17.2417C5.32002 17.1688 5.30179 17.0594 5.35648 17.0047C5.41116 16.95 5.50231 16.9865 5.57522 17.0594C5.64814 17.1505 5.66636 17.2599 5.61168 17.2964ZM6.04916 17.9344C5.97625 17.989 5.86688 17.9344 5.81219 17.8432C5.73928 17.7521 5.73928 17.6245 5.81219 17.588C5.88511 17.5333 5.99448 17.588 6.04916 17.6792C6.12208 17.7703 6.12208 17.8797 6.04916 17.9344ZM6.65071 18.5541C6.59602 18.627 6.46842 18.6088 6.35905 18.5177C6.26791 18.4265 6.23145 18.2989 6.30436 18.2442C6.35905 18.1713 6.48665 18.1896 6.59602 18.2807C6.68716 18.3536 6.70539 18.4812 6.65071 18.5541ZM7.47099 18.9005C7.45276 18.9916 7.32516 19.0281 7.19756 18.9916C7.06996 18.9552 6.99705 18.8458 7.01528 18.7729C7.03351 18.6817 7.16111 18.6453 7.28871 18.6817C7.41631 18.7182 7.48922 18.8093 7.47099 18.9005ZM8.36419 18.9734C8.36419 19.0645 8.25482 19.1374 8.12722 19.1374C7.99962 19.1374 7.89025 19.0645 7.89025 18.9734C7.89025 18.8822 7.99962 18.8093 8.12722 18.8093C8.25482 18.8093 8.36419 18.8822 8.36419 18.9734ZM9.20271 18.8276C9.22093 18.9187 9.12979 19.0098 9.00219 19.0281C8.87459 19.0463 8.76522 18.9916 8.74699 18.9005C8.72876 18.8093 8.81991 18.7182 8.94751 18.7C9.07511 18.6817 9.18448 18.7364 9.20271 18.8276Z",
    fill: "currentColor"
  }));
}
var IconComponent5 = convertIcon(SvgComponent5, "github_logo");
var IconGithubLogo_default = IconComponent5;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconHome.js
var React7 = __toESM(require_react());
function SvgComponent6(props) {
  return /* @__PURE__ */ React7.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React7.createElement("path", {
    d: "M2 11.4454C2 11.1619 2.12032 10.8917 2.33104 10.7021L11.331 2.60207C11.7113 2.2598 12.2887 2.2598 12.669 2.60207L21.669 10.7021C21.8797 10.8917 22 11.1619 22 11.4454V20C22 21.1046 21.1046 22 20 22H16C15.4477 22 15 21.5523 15 21V17C15 15.3432 13.6569 14 12 14C10.3431 14 9 15.3432 9 17V21C9 21.5523 8.55228 22 8 22H4C2.89543 22 2 21.1046 2 20V11.4454Z",
    fill: "currentColor"
  }));
}
var IconComponent6 = convertIcon(SvgComponent6, "home");
var IconHome_default = IconComponent6;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconPlus.js
var React8 = __toESM(require_react());
function SvgComponent7(props) {
  return /* @__PURE__ */ React8.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React8.createElement("path", {
    d: "M20.5 13.5C21.3284 13.5 22 12.8284 22 12C22 11.1716 21.3284 10.5 20.5 10.5L13.5 10.5L13.5 3.5C13.5 2.67157 12.8284 2 12 2C11.1716 2 10.5 2.67157 10.5 3.5L10.5 10.5L3.5 10.5C2.67157 10.5 2 11.1716 2 12C2 12.8284 2.67157 13.5 3.5 13.5L10.5 13.5V20.5C10.5 21.3284 11.1716 22 12 22C12.8284 22 13.5 21.3284 13.5 20.5V13.5L20.5 13.5Z",
    fill: "currentColor"
  }));
}
var IconComponent7 = convertIcon(SvgComponent7, "plus");
var IconPlus_default = IconComponent7;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconAlertCircle.js
var React9 = __toESM(require_react());
function SvgComponent8(props) {
  return /* @__PURE__ */ React9.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React9.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1C18.0751 1 23 5.92487 23 12ZM13.5 17.5C13.5 16.6716 12.8284 16 12 16C11.1716 16 10.5 16.6716 10.5 17.5C10.5 18.3284 11.1716 19 12 19C12.8284 19 13.5 18.3284 13.5 17.5ZM12 5C10.9138 5 10.0507 5.91244 10.1109 6.99692L10.4168 12.5023C10.4635 13.3426 11.1584 14 12 14C12.8416 14 13.5365 13.3426 13.5832 12.5023L13.8891 6.99692C13.9493 5.91244 13.0862 5 12 5Z",
    fill: "currentColor"
  }));
}
var IconComponent8 = convertIcon(SvgComponent8, "alert_circle");
var IconAlertCircle_default = IconComponent8;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconAlertTriangle.js
var React10 = __toESM(require_react());
function SvgComponent9(props) {
  return /* @__PURE__ */ React10.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React10.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M10.2268 2.3986L1.52616 19.0749C0.831449 20.4064 1.79747 22 3.29933 22H20.7007C22.2025 22 23.1686 20.4064 22.4739 19.0749L13.7732 2.3986C13.0254 0.965441 10.9746 0.965442 10.2268 2.3986ZM13.1415 14.0101C13.0603 14.5781 12.5739 15 12.0001 15C11.4263 15 10.9398 14.5781 10.8586 14.0101L10.2829 9.97992C10.1336 8.93495 10.9445 8.00002 12.0001 8.00002C13.0556 8.00002 13.8665 8.93495 13.7172 9.97992L13.1415 14.0101ZM13.5001 18.5C13.5001 19.3284 12.8285 20 12.0001 20C11.1716 20 10.5001 19.3284 10.5001 18.5C10.5001 17.6716 11.1716 17 12.0001 17C12.8285 17 13.5001 17.6716 13.5001 18.5Z",
    fill: "currentColor"
  }));
}
var IconComponent9 = convertIcon(SvgComponent9, "alert_triangle");
var IconAlertTriangle_default = IconComponent9;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconCheckboxTick.js
var React11 = __toESM(require_react());
function SvgComponent10(props) {
  return /* @__PURE__ */ React11.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React11.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M17.4111 7.30848C18.0692 7.81171 18.1947 8.75312 17.6915 9.41119L11.1915 17.9112C10.909 18.2806 10.4711 18.4981 10.0061 18.5C9.54105 18.5019 9.10143 18.288 8.81592 17.9209L5.31592 13.4209C4.80731 12.767 4.92512 11.8246 5.57904 11.316C6.23296 10.8074 7.17537 10.9252 7.68398 11.5791L9.98988 14.5438L15.3084 7.58884C15.8116 6.93077 16.7531 6.80525 17.4111 7.30848Z",
    fill: "currentColor"
  }));
}
var IconComponent10 = convertIcon(SvgComponent10, "checkbox_tick");
var IconCheckboxTick_default = IconComponent10;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconChevronDown.js
var React12 = __toESM(require_react());
function SvgComponent11(props) {
  return /* @__PURE__ */ React12.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React12.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M4.08045 7.59809C4.66624 7.01231 5.61599 7.01231 6.20177 7.59809L11.8586 13.2549L17.5155 7.59809C18.1013 7.01231 19.051 7.01231 19.6368 7.59809C20.2226 8.18388 20.2226 9.13363 19.6368 9.71941L12.9193 16.4369C12.3335 17.0227 11.3838 17.0227 10.798 16.4369L4.08045 9.71941C3.49467 9.13363 3.49467 8.18388 4.08045 7.59809Z",
    fill: "currentColor"
  }));
}
var IconComponent11 = convertIcon(SvgComponent11, "chevron_down");
var IconChevronDown_default = IconComponent11;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconChevronRight.js
var React13 = __toESM(require_react());
function SvgComponent12(props) {
  return /* @__PURE__ */ React13.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React13.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M7.43934 19.7957C6.85355 19.2099 6.85355 18.2601 7.43934 17.6744L13.0962 12.0175L7.43934 6.36065C6.85355 5.77486 6.85355 4.82511 7.43934 4.23933C8.02513 3.65354 8.97487 3.65354 9.56066 4.23933L16.2782 10.9568C16.864 11.5426 16.864 12.4924 16.2782 13.0782L9.56066 19.7957C8.97487 20.3815 8.02513 20.3815 7.43934 19.7957Z",
    fill: "currentColor"
  }));
}
var IconComponent12 = convertIcon(SvgComponent12, "chevron_right");
var IconChevronRight_default = IconComponent12;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconClose.js
var React14 = __toESM(require_react());
function SvgComponent13(props) {
  return /* @__PURE__ */ React14.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React14.createElement("path", {
    d: "M17.6568 19.7782C18.2426 20.3639 19.1924 20.3639 19.7782 19.7782C20.3639 19.1924 20.3639 18.2426 19.7782 17.6568L14.1213 12L19.7782 6.34313C20.3639 5.75734 20.3639 4.8076 19.7782 4.22181C19.1924 3.63602 18.2426 3.63602 17.6568 4.22181L12 9.87866L6.34313 4.22181C5.75734 3.63602 4.8076 3.63602 4.22181 4.22181C3.63602 4.8076 3.63602 5.75734 4.22181 6.34313L9.87866 12L4.22181 17.6568C3.63602 18.2426 3.63602 19.1924 4.22181 19.7782C4.8076 20.3639 5.75734 20.3639 6.34313 19.7782L12 14.1213L17.6568 19.7782Z",
    fill: "currentColor"
  }));
}
var IconComponent13 = convertIcon(SvgComponent13, "close");
var IconClose_default = IconComponent13;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconCopy.js
var React15 = __toESM(require_react());
function SvgComponent14(props) {
  return /* @__PURE__ */ React15.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React15.createElement("path", {
    d: "M7 4C7 2.89543 7.89543 2 9 2H20C21.1046 2 22 2.89543 22 4V15C22 16.1046 21.1046 17 20 17H19V8C19 6 18 5 16 5H7V4Z",
    fill: "currentColor"
  }), /* @__PURE__ */ React15.createElement("path", {
    d: "M5 7C3.89543 7 3 7.89543 3 9V19C3 20.1046 3.89543 21 5 21H15C16.1046 21 17 20.1046 17 19V9C17 7.89543 16.1046 7 15 7H5Z",
    fill: "currentColor"
  }));
}
var IconComponent14 = convertIcon(SvgComponent14, "copy");
var IconCopy_default = IconComponent14;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconDelete.js
var React16 = __toESM(require_react());
function SvgComponent15(props) {
  return /* @__PURE__ */ React16.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React16.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M9.38055 2C9.00251 2 8.65678 2.21319 8.48703 2.55098L7.00505 5.5H3C2.44772 5.5 2 5.94772 2 6.5V7.5C2 8.05228 2.44772 8.5 3 8.5H21C21.5523 8.5 22 8.05228 22 7.5V6.5C22 5.94772 21.5523 5.5 21 5.5H16.9949L15.5129 2.55098C15.3432 2.21319 14.9975 2 14.6194 2H9.38055ZM14.8571 5.5L14.1439 4.25193C14.0549 4.09614 13.8893 4 13.7098 4H10.2901C10.1107 4 9.94505 4.09614 9.85602 4.25193L9.14284 5.5H14.8571ZM18.7192 10H5.28078C4.6302 10 4.15285 10.6114 4.31063 11.2425L6.4319 19.7276C6.76578 21.0631 7.96573 22 9.34233 22H14.6577C16.0343 22 17.2342 21.0631 17.5681 19.7276L19.6894 11.2425C19.8472 10.6114 19.3698 10 18.7192 10Z",
    fill: "currentColor"
  }));
}
var IconComponent15 = convertIcon(SvgComponent15, "delete");
var IconDelete_default = IconComponent15;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconEdit.js
var React17 = __toESM(require_react());
function SvgComponent16(props) {
  return /* @__PURE__ */ React17.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React17.createElement("path", {
    d: "M14.4999 4.49994L19.4999 9.49994L21.5857 7.41416C22.3667 6.63311 22.3667 5.36678 21.5857 4.58573L19.4141 2.41415C18.6331 1.63311 17.3667 1.63311 16.5857 2.41416L14.4999 4.49994Z",
    fill: "currentColor"
  }), /* @__PURE__ */ React17.createElement("path", {
    d: "M2.24715 21.1346L3.92871 15.2491C3.9754 15.0857 4.06296 14.9369 4.18313 14.8167L12.9999 5.99994L17.9999 10.9999L9.18313 19.8167C9.06296 19.9369 8.91415 20.0244 8.75074 20.0711L2.86527 21.7527C2.48809 21.8605 2.13938 21.5117 2.24715 21.1346Z",
    fill: "currentColor"
  }));
}
var IconComponent16 = convertIcon(SvgComponent16, "edit");
var IconEdit_default = IconComponent16;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconInfoCircle.js
var React18 = __toESM(require_react());
function SvgComponent17(props) {
  return /* @__PURE__ */ React18.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React18.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM14 7C14 8.10457 13.1046 9 12 9C10.8954 9 10 8.10457 10 7C10 5.89543 10.8954 5 12 5C13.1046 5 14 5.89543 14 7ZM9 10.75C9 10.3358 9.33579 10 9.75 10H12.5C13.0523 10 13.5 10.4477 13.5 11V16.5H14.25C14.6642 16.5 15 16.8358 15 17.25C15 17.6642 14.6642 18 14.25 18H9.75C9.33579 18 9 17.6642 9 17.25C9 16.8358 9.33579 16.5 9.75 16.5H10.5V11.5H9.75C9.33579 11.5 9 11.1642 9 10.75Z",
    fill: "currentColor"
  }));
}
var IconComponent17 = convertIcon(SvgComponent17, "info_circle");
var IconInfoCircle_default = IconComponent17;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconMore.js
var React19 = __toESM(require_react());
function SvgComponent18(props) {
  return /* @__PURE__ */ React19.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React19.createElement("path", {
    d: "M7 12C7 13.3807 5.88071 14.5 4.5 14.5C3.11929 14.5 2 13.3807 2 12C2 10.6193 3.11929 9.5 4.5 9.5C5.88071 9.5 7 10.6193 7 12Z",
    fill: "currentColor"
  }), /* @__PURE__ */ React19.createElement("path", {
    d: "M14.5 12C14.5 13.3807 13.3807 14.5 12 14.5C10.6193 14.5 9.5 13.3807 9.5 12C9.5 10.6193 10.6193 9.5 12 9.5C13.3807 9.5 14.5 10.6193 14.5 12Z",
    fill: "currentColor"
  }), /* @__PURE__ */ React19.createElement("path", {
    d: "M19.5 14.5C20.8807 14.5 22 13.3807 22 12C22 10.6193 20.8807 9.5 19.5 9.5C18.1193 9.5 17 10.6193 17 12C17 13.3807 18.1193 14.5 19.5 14.5Z",
    fill: "currentColor"
  }));
}
var IconComponent18 = convertIcon(SvgComponent18, "more");
var IconMore_default = IconComponent18;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconSidebar.js
var React20 = __toESM(require_react());
function SvgComponent19(props) {
  return /* @__PURE__ */ React20.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React20.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M5 2H19C20.6569 2 22 3.34315 22 5V19C22 20.6569 20.6569 22 19 22H5C3.34315 22 2 20.6569 2 19V5C2 3.34315 3.34315 2 5 2ZM6 4C5.44772 4 5 4.44772 5 5V19C5 19.5523 5.44772 20 6 20H9C9.55229 20 10 19.5523 10 19V5C10 4.44772 9.55229 4 9 4H6Z",
    fill: "currentColor"
  }));
}
var IconComponent19 = convertIcon(SvgComponent19, "sidebar");
var IconSidebar_default = IconComponent19;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconTick.js
var React21 = __toESM(require_react());
function SvgComponent20(props) {
  return /* @__PURE__ */ React21.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React21.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M21.3516 4.2652C22.0336 4.73552 22.2052 5.66964 21.7348 6.35162L11.7348 20.8516C11.4765 21.2262 11.0622 21.4632 10.6084 21.4961C10.1546 21.529 9.71041 21.3541 9.40082 21.0207L2.90082 14.0207C2.33711 13.4136 2.37226 12.4645 2.97933 11.9008C3.5864 11.3371 4.53549 11.3723 5.0992 11.9793L10.3268 17.6091L19.2652 4.64842C19.7355 3.96644 20.6696 3.79487 21.3516 4.2652Z",
    fill: "currentColor"
  }));
}
var IconComponent20 = convertIcon(SvgComponent20, "tick");
var IconTick_default = IconComponent20;

// node_modules/.pnpm/@douyinfe+semi-icons@2.66.1_react@18.3.1/node_modules/@douyinfe/semi-icons/lib/es/icons/IconTickCircle.js
var React22 = __toESM(require_react());
function SvgComponent21(props) {
  return /* @__PURE__ */ React22.createElement("svg", Object.assign({
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    width: "1em",
    height: "1em",
    focusable: false,
    "aria-hidden": true
  }, props), /* @__PURE__ */ React22.createElement("path", {
    fillRule: "evenodd",
    clipRule: "evenodd",
    d: "M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM17.8831 9.82235L11.6854 17.4112C11.4029 17.7806 10.965 17.9981 10.5 18C10.035 18.0019 9.59533 17.788 9.30982 17.421L5.81604 13.4209C5.30744 12.767 5.42524 11.8246 6.07916 11.316C6.73308 10.8074 7.67549 10.9252 8.1841 11.5791L10.4838 14.0439L15.5 8C16.0032 7.34193 16.9446 7.21641 17.6027 7.71964C18.2608 8.22287 18.3863 9.16428 17.8831 9.82235Z",
    fill: "currentColor"
  }));
}
var IconComponent21 = convertIcon(SvgComponent21, "tick_circle");
var IconTickCircle_default = IconComponent21;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/text.js
var import_react21 = __toESM(require_react());
var import_prop_types11 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/base/env.js
var BASE_CLASS_PREFIX2 = "semi";

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/typography/constants.js
var cssClasses = {
  PREFIX: `${BASE_CLASS_PREFIX2}-typography`
};
var strings = {
  WEIGHT: ["light", "regular", "medium", "semibold", "bold", "default"],
  TYPE: ["primary", "secondary", "danger", "warning", "success", "tertiary", "quaternary"],
  SIZE: ["normal", "small", "inherit"],
  SPACING: ["normal", "extended"],
  HEADING: [1, 2, 3, 4, 5, 6],
  RULE: ["text", "numbers", "bytes-decimal", "bytes-binary", "percentages", "exponential"],
  TRUNCATE: ["ceil", "floor", "round"]
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/base.js
var import_isFunction3 = __toESM(require_isFunction());
var import_isNull = __toESM(require_isNull());
var import_isString = __toESM(require_isString());
var import_merge = __toESM(require_merge());
var import_omit3 = __toESM(require_omit());
var import_isUndefined = __toESM(require_isUndefined());
var import_react20 = __toESM(require_react());
var import_classnames8 = __toESM(require_classnames());
var import_prop_types10 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/typography.js
var import_react2 = __toESM(require_react());
var import_classnames2 = __toESM(require_classnames());
var import_prop_types = __toESM(require_prop_types());
var __rest2 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls = cssClasses.PREFIX;
var Typography = class extends import_react2.PureComponent {
  render() {
    const _a = this.props, {
      component,
      className,
      children,
      forwardRef
    } = _a, rest = __rest2(_a, ["component", "className", "children", "forwardRef"]);
    const Component4 = component;
    const classNames6 = (0, import_classnames2.default)(prefixCls, className);
    return /* @__PURE__ */ import_react2.default.createElement(Component4, Object.assign({
      className: classNames6,
      ref: forwardRef
    }, rest), children);
  }
};
Typography.defaultProps = {
  component: "article",
  style: {},
  className: ""
};
Typography.propTypes = {
  component: import_prop_types.default.string,
  style: import_prop_types.default.object,
  className: import_prop_types.default.string
};
var typography_default = Typography;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/copyable.js
var import_react14 = __toESM(require_react());
var import_prop_types6 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/tooltip/index.js
var import_isEqual2 = __toESM(require_isEqual());
var import_isFunction = __toESM(require_isFunction());
var import_isEmpty2 = __toESM(require_isEmpty());
var import_each = __toESM(require_each());
var import_omit = __toESM(require_omit());
var import_get5 = __toESM(require_get());
var import_noop2 = __toESM(require_noop());
var import_throttle = __toESM(require_throttle());
var import_react11 = __toESM(require_react());
var import_react_dom2 = __toESM(require_react_dom());
var import_classnames4 = __toESM(require_classnames());
var import_prop_types4 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/warning.js
function warning(flag, info) {
  if (flag) {
    console.warn(`Warning: ${info}`);
  }
}

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/isNullOrUndefined.js
function isNullOrUndefined(value) {
  return value === null || value === void 0;
}

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/Event.js
var Event = class {
  constructor() {
    this._eventMap = /* @__PURE__ */ new Map();
  }
  on(event, callback) {
    if (event && typeof callback === "function") {
      this._eventMap.has(event) || this._eventMap.set(event, []);
      this._eventMap.get(event).push(callback);
    }
    return this;
  }
  once(event, callback) {
    var _this = this;
    if (event && typeof callback === "function") {
      const fn = function() {
        callback(...arguments);
        _this.off(event, fn);
      };
      this.on(event, fn);
    }
  }
  off(event, callback) {
    if (event) {
      if (typeof callback === "function") {
        const callbacks = this._eventMap.get(event);
        if (Array.isArray(callbacks) && callbacks.length) {
          let index = -1;
          while ((index = callbacks.findIndex((cb) => cb === callback)) > -1) {
            callbacks.splice(index, 1);
          }
        }
      } else if (isNullOrUndefined(callback)) {
        this._eventMap.delete(event);
      }
    }
    return this;
  }
  emit(event) {
    for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }
    if (!this._eventMap.has(event)) {
      return false;
    }
    const callbacks = [...this._eventMap.get(event)];
    callbacks.forEach((callback) => callback(...args));
    return true;
  }
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/isElement.js
function isElement(obj) {
  try {
    return obj instanceof HTMLElement;
  } catch (e) {
    return typeof obj === "object" && obj.nodeType === 1 && typeof obj.style === "object" && typeof obj.ownerDocument === "object";
  }
}

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/dom.js
function convertDOMRectToObject(domRect) {
  if (domRect && typeof domRect === "object") {
    if (typeof domRect.toJSON === "function") {
      return domRect.toJSON();
    } else {
      const keys = ["left", "top", "right", "bottom", "width", "height"];
      return keys.reduce((obj, key) => {
        obj[key] = domRect[key];
        return obj;
      }, {});
    }
  }
  return void 0;
}

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/tooltip/foundation.js
var import_isEmpty = __toESM(require_isEmpty());
var import_get3 = __toESM(require_get());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/base/foundation.js
var import_noop = __toESM(require_noop());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/log.js
var import_get = __toESM(require_get());
var log = function(text) {
  if ((0, import_get.default)(process, "env.NODE_ENV") === "development") {
    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }
    console.log(text, ...rest);
  }
};
var log_default = log;

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/base/foundation.js
var BaseFoundation = class {
  /** @return enum{css className} */
  /* istanbul ignore next */
  static get cssClasses() {
    return {};
  }
  /** @return enum{strings} */
  /* istanbul ignore next */
  static get strings() {
    return {};
  }
  /** @return enum{numbers} */
  /* istanbul ignore next */
  static get numbers() {
    return {};
  }
  static get defaultAdapter() {
    return {
      getProp: import_noop.default,
      getProps: import_noop.default,
      getState: import_noop.default,
      getStates: import_noop.default,
      setState: import_noop.default,
      getContext: import_noop.default,
      getContexts: import_noop.default,
      getCache: import_noop.default,
      setCache: import_noop.default,
      getCaches: import_noop.default,
      stopPropagation: import_noop.default,
      persistEvent: import_noop.default
    };
  }
  constructor(adapter) {
    this._adapter = Object.assign(Object.assign({}, BaseFoundation.defaultAdapter), adapter);
  }
  getProp(key) {
    return this._adapter.getProp(key);
  }
  getProps() {
    return this._adapter.getProps();
  }
  getState(key) {
    return this._adapter.getState(key);
  }
  getStates() {
    return this._adapter.getStates();
  }
  setState(states, cb) {
    return this._adapter.setState(Object.assign({}, states), cb);
  }
  getContext(key) {
    return this._adapter.getContext(key);
  }
  /* istanbul ignore next */
  getContexts() {
    return this._adapter.getContexts();
  }
  /* istanbul ignore next */
  getCaches() {
    return this._adapter.getCaches();
  }
  getCache(key) {
    return this._adapter.getCache(key);
  }
  setCache(key, value) {
    return key && this._adapter.setCache(key, value);
  }
  stopPropagation(e) {
    this._adapter.stopPropagation(e);
  }
  // Determine whether a controlled component
  _isControlledComponent() {
    let key = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "value";
    const props = this.getProps();
    const isControlComponent = key in props;
    return isControlComponent;
  }
  // Does the user have incoming props, eg: _isInProps (value)
  _isInProps(key) {
    const props = this.getProps();
    return key in props;
  }
  init(lifecycle) {
  }
  destroy() {
  }
  /* istanbul ignore next */
  log(text) {
    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }
    log_default(text, ...rest);
  }
  _persistEvent(e) {
    this._adapter.persistEvent(e);
  }
};
var foundation_default = BaseFoundation;

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/a11y.js
var import_get2 = __toESM(require_get());
function handlePrevent(event) {
  event.stopPropagation();
  event.preventDefault();
}
function isPrintableCharacter(string) {
  return string.length === 1 && string.match(/\S/);
}
function setFocusToItem(itemNodes, targetItem) {
  for (let i = 0; i < itemNodes.length; i++) {
    if (itemNodes[i] === targetItem) {
      itemNodes[i].tabIndex = 0;
      itemNodes[i].focus();
    } else {
      itemNodes[i].tabIndex = -1;
    }
  }
}
function setFocusToFirstItem(itemNodes) {
  itemNodes.length > 0 && setFocusToItem(itemNodes, itemNodes[0]);
}
function setFocusToLastItem(itemNodes) {
  itemNodes.length > 0 && setFocusToItem(itemNodes, itemNodes[itemNodes.length - 1]);
}
function setFocusToPreviousMenuItem(itemNodes, currentItem) {
  let newMenuItem, index;
  if (itemNodes.length > 0) {
    if (currentItem === itemNodes[0]) {
      newMenuItem = itemNodes[itemNodes.length - 1];
    } else {
      index = itemNodes.indexOf(currentItem);
      newMenuItem = itemNodes[index - 1];
    }
    setFocusToItem(itemNodes, newMenuItem);
  }
}
function setFocusToNextMenuitem(itemNodes, currentItem) {
  let newMenuItem, index;
  if (itemNodes.length > 0) {
    if (currentItem === itemNodes[itemNodes.length - 1]) {
      newMenuItem = itemNodes[0];
    } else {
      index = itemNodes.indexOf(currentItem);
      newMenuItem = itemNodes[index + 1];
    }
    setFocusToItem(itemNodes, newMenuItem);
  }
}
function findIndexByCharacter(itemList, curItem, firstCharList, char) {
  let start, index;
  if (!itemList || !firstCharList || !char || char.length > 1) {
    return -1;
  }
  char = char.toLowerCase();
  start = itemList.indexOf(curItem) + 1;
  if (start >= itemList.length) {
    start = 0;
  }
  index = firstCharList.indexOf(char, start);
  if (index === -1) {
    index = firstCharList.indexOf(char, 0);
  }
  return index >= 0 ? index : -1;
}
function getAncestorNodeByRole(curElement, role) {
  if (!curElement) {
    return null;
  }
  while (curElement.parentElement && (0, import_get2.default)(curElement.parentElement, "attributes.role.value", "") !== role) {
    curElement = curElement.parentElement;
  }
  return curElement.parentElement;
}
function getMenuButton(focusableEle, Id) {
  for (let i = 0; i < focusableEle.length; i++) {
    const curAriDescribedby = focusableEle[i].attributes["data-popupid"];
    if (curAriDescribedby && curAriDescribedby.value === Id) {
      return focusableEle[i];
    }
  }
  return null;
}

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/tooltip/foundation.js
var REGS = {
  TOP: /top/i,
  RIGHT: /right/i,
  BOTTOM: /bottom/i,
  LEFT: /left/i
};
var defaultRect = {
  left: 0,
  top: 0,
  height: 0,
  width: 0,
  scrollLeft: 0,
  scrollTop: 0
};
var Tooltip = class extends foundation_default {
  constructor(adapter) {
    var _this;
    super(Object.assign({}, adapter));
    _this = this;
    this.removePortal = () => {
      this._adapter.removePortal();
    };
    this.setDisplayNone = (displayNone, cb) => {
      this._adapter.setDisplayNone(displayNone, cb);
    };
    this.updateStateIfCursorOnTrigger = (trigger) => {
      var _a, _b;
      if ((_a = trigger === null || trigger === void 0 ? void 0 : trigger.matches) === null || _a === void 0 ? void 0 : _a.call(trigger, ":hover")) {
        const eventNames = this._adapter.getEventName();
        const triggerEventSet = this.getState("triggerEventSet");
        (_b = triggerEventSet[eventNames.mouseEnter]) === null || _b === void 0 ? void 0 : _b.call(triggerEventSet);
      }
    };
    this.onResize = () => {
      this.calcPosition();
    };
    this.delayShow = () => {
      const mouseEnterDelay = this.getProp("mouseEnterDelay");
      this.clearDelayTimer();
      if (mouseEnterDelay > 0) {
        this._timer = setTimeout(() => {
          this.show();
          this.clearDelayTimer();
        }, mouseEnterDelay);
      } else {
        this.show();
      }
    };
    this.show = () => {
      if (this._adapter.getAnimatingState()) {
        return;
      }
      const content = this.getProp("content");
      const trigger = this.getProp("trigger");
      const clickTriggerToHide = this.getProp("clickTriggerToHide");
      const {
        visible,
        displayNone
      } = this.getStates();
      if (displayNone) {
        this.setDisplayNone(false);
      }
      if (visible) {
        return;
      }
      this.clearDelayTimer();
      this._adapter.on("portalInserted", () => {
        this.calcPosition();
      });
      if (trigger === "hover") {
        const checkTriggerIsHover = () => {
          var _a;
          const triggerDOM = this._adapter.getTriggerDOM();
          if (trigger && !((_a = triggerDOM === null || triggerDOM === void 0 ? void 0 : triggerDOM.matches) === null || _a === void 0 ? void 0 : _a.call(triggerDOM, ":hover"))) {
            this.hide();
          }
          this._adapter.off("portalInserted", checkTriggerIsHover);
        };
        this._adapter.on("portalInserted", checkTriggerIsHover);
      }
      this._adapter.on("positionUpdated", () => {
        this._togglePortalVisible(true);
      });
      this._adapter.insertPortal(content, {
        left: -9999,
        top: -9999
      });
      if (trigger === "custom") {
        this._adapter.registerClickOutsideHandler(() => {
        });
      }
      if (trigger === "click" || clickTriggerToHide || trigger === "contextMenu") {
        this._adapter.registerClickOutsideHandler(this.hide);
      }
      this._bindScrollEvent();
      this._bindResizeEvent();
    };
    this.calcPosition = function(triggerRect, wrapperRect, containerRect) {
      let shouldUpdatePos = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : true;
      triggerRect = ((0, import_isEmpty.default)(triggerRect) ? _this._adapter.getTriggerBounding() : triggerRect) || Object.assign({}, defaultRect);
      containerRect = ((0, import_isEmpty.default)(containerRect) ? _this._adapter.getPopupContainerRect() : containerRect) || Object.assign({}, defaultRect);
      wrapperRect = ((0, import_isEmpty.default)(wrapperRect) ? _this._adapter.getWrapperBounding() : wrapperRect) || Object.assign({}, defaultRect);
      let style = _this.calcPosStyle({
        triggerRect,
        wrapperRect,
        containerRect
      });
      let position = _this.getProp("position");
      if (_this.getProp("autoAdjustOverflow")) {
        const {
          position: adjustedPos,
          isHeightOverFlow,
          isWidthOverFlow
        } = _this.adjustPosIfNeed(position, style, triggerRect, wrapperRect, containerRect);
        if (position !== adjustedPos || isHeightOverFlow || isWidthOverFlow) {
          position = adjustedPos;
          style = _this.calcPosStyle({
            triggerRect,
            wrapperRect,
            containerRect,
            position,
            spacing: null,
            isOverFlow: [isHeightOverFlow, isWidthOverFlow]
          });
        }
      }
      if (shouldUpdatePos && _this._mounted) {
        _this._adapter.setPosition(Object.assign(Object.assign({}, style), {
          position
        }));
      }
      return style;
    };
    this.delayHide = () => {
      const mouseLeaveDelay = this.getProp("mouseLeaveDelay");
      this.clearDelayTimer();
      if (mouseLeaveDelay > 0) {
        this._timer = setTimeout(() => {
          this.hide();
          this.clearDelayTimer();
        }, mouseLeaveDelay);
      } else {
        this.hide();
      }
    };
    this.hide = () => {
      this.clearDelayTimer();
      this._togglePortalVisible(false);
      this._adapter.off("portalInserted");
      this._adapter.off("positionUpdated");
    };
    this.handleContainerKeydown = (event) => {
      const {
        guardFocus,
        closeOnEsc
      } = this.getProps();
      switch (event && event.key) {
        case "Escape":
          closeOnEsc && this._handleEscKeyDown(event);
          break;
        case "Tab":
          if (guardFocus) {
            const container = this._adapter.getContainer();
            const focusableElements = this._adapter.getFocusableElements(container);
            const focusableNum = focusableElements.length;
            if (focusableNum) {
              if (event.shiftKey) {
                this._handleContainerShiftTabKeyDown(focusableElements, event);
              } else {
                this._handleContainerTabKeyDown(focusableElements, event);
              }
            }
          }
          break;
        default:
          break;
      }
    };
    this._timer = null;
  }
  init() {
    const {
      wrapperId
    } = this.getProps();
    this._mounted = true;
    this._bindEvent();
    this._shouldShow();
    this._initContainerPosition();
    if (!wrapperId) {
      this._adapter.setId();
    }
  }
  destroy() {
    this._mounted = false;
    this.unBindEvent();
  }
  _bindEvent() {
    const trigger = this.getProp("trigger");
    const {
      triggerEventSet,
      portalEventSet
    } = this._generateEvent(trigger);
    this._bindTriggerEvent(triggerEventSet);
    this._bindPortalEvent(portalEventSet);
    this._bindResizeEvent();
  }
  unBindEvent() {
    this._adapter.unregisterClickOutsideHandler();
    this.unBindResizeEvent();
    this.unBindScrollEvent();
    clearTimeout(this._timer);
  }
  _bindTriggerEvent(triggerEventSet) {
    this._adapter.registerTriggerEvent(triggerEventSet);
  }
  _bindPortalEvent(portalEventSet) {
    this._adapter.registerPortalEvent(portalEventSet);
  }
  _bindResizeEvent() {
    this._adapter.registerResizeHandler(this.onResize);
  }
  unBindResizeEvent() {
    this._adapter.unregisterResizeHandler(this.onResize);
  }
  _adjustPos() {
    let position = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    let isVertical = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    let adjustType = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "reverse";
    let concatPos = arguments.length > 3 ? arguments[3] : void 0;
    switch (adjustType) {
      case "reverse":
        return this._reversePos(position, isVertical);
      case "expand":
        return this._expandPos(position, concatPos);
      case "reduce":
        return this._reducePos(position);
      default:
        return this._reversePos(position, isVertical);
    }
  }
  _reversePos() {
    let position = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    let isVertical = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
    if (isVertical) {
      if (REGS.TOP.test(position)) {
        return position.replace("top", "bottom").replace("Top", "Bottom");
      } else if (REGS.BOTTOM.test(position)) {
        return position.replace("bottom", "top").replace("Bottom", "Top");
      }
    } else if (REGS.LEFT.test(position)) {
      return position.replace("left", "right").replace("Left", "Right");
    } else if (REGS.RIGHT.test(position)) {
      return position.replace("right", "left").replace("Right", "Left");
    }
    return position;
  }
  _expandPos() {
    let position = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    let concatPos = arguments.length > 1 ? arguments[1] : void 0;
    return position.concat(concatPos);
  }
  _reducePos() {
    let position = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    const found = ["Top", "Bottom", "Left", "Right"].find((pos) => position.endsWith(pos));
    return found ? position.replace(found, "") : position;
  }
  clearDelayTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  _generateEvent(types2) {
    const eventNames = this._adapter.getEventName();
    const triggerEventSet = {
      // bind esc keydown on trigger for a11y
      [eventNames.keydown]: (event) => {
        this._handleTriggerKeydown(event);
      }
    };
    let portalEventSet = {};
    switch (types2) {
      case "focus":
        triggerEventSet[eventNames.focus] = () => {
          this.delayShow();
        };
        triggerEventSet[eventNames.blur] = () => {
          this.delayHide();
        };
        portalEventSet = triggerEventSet;
        break;
      case "click":
        triggerEventSet[eventNames.click] = () => {
          this.show();
        };
        portalEventSet = {};
        break;
      case "hover":
        triggerEventSet[eventNames.mouseEnter] = () => {
          this.setCache("isClickToHide", false);
          this.delayShow();
        };
        triggerEventSet[eventNames.mouseLeave] = () => {
          this.delayHide();
        };
        triggerEventSet[eventNames.focus] = () => {
          const {
            disableFocusListener
          } = this.getProps();
          !disableFocusListener && this.delayShow();
        };
        triggerEventSet[eventNames.blur] = () => {
          const {
            disableFocusListener
          } = this.getProps();
          !disableFocusListener && this.delayHide();
        };
        portalEventSet = Object.assign({}, triggerEventSet);
        if (this.getProp("clickToHide")) {
          portalEventSet[eventNames.click] = () => {
            this.setCache("isClickToHide", true);
            this.hide();
          };
          portalEventSet[eventNames.mouseEnter] = () => {
            if (this.getCache("isClickToHide")) {
              return;
            }
            this.delayShow();
          };
        }
        break;
      case "custom":
        break;
      case "contextMenu":
        triggerEventSet[eventNames.contextMenu] = (e) => {
          e.preventDefault();
          this.show();
        };
        break;
      default:
        break;
    }
    return {
      triggerEventSet,
      portalEventSet
    };
  }
  _shouldShow() {
    const visible = this.getProp("visible");
    if (visible) {
      this.show();
    } else {
    }
  }
  _togglePortalVisible(isVisible) {
    const nowVisible = this.getState("visible");
    if (nowVisible !== isVisible) {
      this._adapter.togglePortalVisible(isVisible, () => {
        if (isVisible) {
          this._adapter.setInitialFocus();
        }
        this._adapter.notifyVisibleChange(isVisible);
      });
    }
  }
  _roundPixel(pixel) {
    if (typeof pixel === "number") {
      return Math.round(pixel);
    }
    return pixel;
  }
  calcTransformOrigin(position, triggerRect, translateX, translateY) {
    if (position && triggerRect && translateX != null && translateY != null) {
      if (this.getProp("transformFromCenter")) {
        if (["topLeft", "bottomLeft"].includes(position)) {
          return `${this._roundPixel(triggerRect.width / 2)}px ${-translateY * 100}%`;
        }
        if (["topRight", "bottomRight"].includes(position)) {
          return `calc(100% - ${this._roundPixel(triggerRect.width / 2)}px) ${-translateY * 100}%`;
        }
        if (["leftTop", "rightTop"].includes(position)) {
          return `${-translateX * 100}% ${this._roundPixel(triggerRect.height / 2)}px`;
        }
        if (["leftBottom", "rightBottom"].includes(position)) {
          return `${-translateX * 100}% calc(100% - ${this._roundPixel(triggerRect.height / 2)}px)`;
        }
      }
      return `${-translateX * 100}% ${-translateY * 100}%`;
    }
    return null;
  }
  calcPosStyle(props) {
    var _a;
    const {
      spacing,
      isOverFlow
    } = props;
    const {
      innerWidth
    } = window;
    const triggerRect = ((0, import_isEmpty.default)(props.triggerRect) ? props.triggerRect : this._adapter.getTriggerBounding()) || Object.assign({}, defaultRect);
    const containerRect = ((0, import_isEmpty.default)(props.containerRect) ? props.containerRect : this._adapter.getPopupContainerRect()) || Object.assign({}, defaultRect);
    const wrapperRect = ((0, import_isEmpty.default)(props.wrapperRect) ? props.wrapperRect : this._adapter.getWrapperBounding()) || Object.assign({}, defaultRect);
    const position = props.position != null ? props.position : this.getProp("position");
    const RAW_SPACING = spacing != null ? spacing : this.getProp("spacing");
    const {
      arrowPointAtCenter,
      showArrow,
      arrowBounding
    } = this.getProps();
    const pointAtCenter = showArrow && arrowPointAtCenter;
    let SPACING = RAW_SPACING;
    let ANO_SPACING = 0;
    if (typeof RAW_SPACING !== "number") {
      const isTopOrBottom = position.includes("top") || position.includes("bottom");
      SPACING = isTopOrBottom ? RAW_SPACING.y : RAW_SPACING.x;
      ANO_SPACING = isTopOrBottom ? RAW_SPACING.x : RAW_SPACING.y;
    }
    const horizontalArrowWidth = (0, import_get3.default)(arrowBounding, "width", 24);
    const verticalArrowHeight = (0, import_get3.default)(arrowBounding, "width", 24);
    const arrowOffsetY = (0, import_get3.default)(arrowBounding, "offsetY", 0);
    const positionOffsetX = 6;
    const positionOffsetY = 6;
    let left;
    let top;
    let translateX = 0;
    let translateY = 0;
    const middleX = triggerRect.left + triggerRect.width / 2;
    const middleY = triggerRect.top + triggerRect.height / 2;
    const offsetXWithArrow = positionOffsetX + horizontalArrowWidth / 2;
    const offsetYWithArrow = positionOffsetY + verticalArrowHeight / 2;
    const heightDifference = wrapperRect.height - containerRect.height;
    const widthDifference = wrapperRect.width - containerRect.width;
    const offsetHeight = heightDifference > 0 ? heightDifference : 0;
    const offsetWidth = widthDifference > 0 ? widthDifference : 0;
    const isHeightOverFlow = isOverFlow && isOverFlow[0];
    const isWidthOverFlow = isOverFlow && isOverFlow[1];
    const isTriggerNearLeft = middleX - containerRect.left < containerRect.right - middleX;
    const isTriggerNearTop = middleY - containerRect.top < containerRect.bottom - middleY;
    const isWrapperWidthOverflow = wrapperRect.width > innerWidth;
    const scaled = Math.abs((wrapperRect === null || wrapperRect === void 0 ? void 0 : wrapperRect.width) - ((_a = this._adapter.getContainer()) === null || _a === void 0 ? void 0 : _a.clientWidth)) > 1;
    if (scaled) {
      SPACING = SPACING * wrapperRect.width / this._adapter.getContainer().clientWidth;
    }
    switch (position) {
      case "top":
        left = isWidthOverFlow ? isTriggerNearLeft ? containerRect.left + wrapperRect.width / 2 : containerRect.right - wrapperRect.width / 2 + offsetWidth : middleX + ANO_SPACING;
        top = isHeightOverFlow ? containerRect.bottom + offsetHeight : triggerRect.top - SPACING;
        translateX = -0.5;
        translateY = -1;
        break;
      case "topLeft":
        left = isWidthOverFlow ? isWrapperWidthOverflow ? containerRect.left : containerRect.right - wrapperRect.width : pointAtCenter ? middleX - offsetXWithArrow + ANO_SPACING : triggerRect.left + ANO_SPACING;
        top = isHeightOverFlow ? containerRect.bottom + offsetHeight : triggerRect.top - SPACING;
        translateY = -1;
        break;
      case "topRight":
        left = isWidthOverFlow ? containerRect.right + offsetWidth : pointAtCenter ? middleX + offsetXWithArrow + ANO_SPACING : triggerRect.right + ANO_SPACING;
        top = isHeightOverFlow ? containerRect.bottom + offsetHeight : triggerRect.top - SPACING;
        translateY = -1;
        translateX = -1;
        break;
      case "left":
        left = isWidthOverFlow ? containerRect.right + offsetWidth - SPACING + offsetXWithArrow : triggerRect.left - SPACING;
        top = isHeightOverFlow ? isTriggerNearTop ? containerRect.top + wrapperRect.height / 2 : containerRect.bottom - wrapperRect.height / 2 + offsetHeight : middleY + ANO_SPACING;
        translateX = -1;
        translateY = -0.5;
        break;
      case "leftTop":
        left = isWidthOverFlow ? containerRect.right + offsetWidth - SPACING + offsetXWithArrow : triggerRect.left - SPACING;
        top = isHeightOverFlow ? containerRect.top : pointAtCenter ? middleY - offsetYWithArrow + ANO_SPACING : triggerRect.top + ANO_SPACING;
        translateX = -1;
        break;
      case "leftBottom":
        left = isWidthOverFlow ? containerRect.right + offsetWidth - SPACING + offsetXWithArrow : triggerRect.left - SPACING;
        top = isHeightOverFlow ? containerRect.bottom + offsetHeight : pointAtCenter ? middleY + offsetYWithArrow + ANO_SPACING : triggerRect.bottom + ANO_SPACING;
        translateX = -1;
        translateY = -1;
        break;
      case "bottom":
        left = isWidthOverFlow ? isTriggerNearLeft ? containerRect.left + wrapperRect.width / 2 : containerRect.right - wrapperRect.width / 2 + offsetWidth : middleX + ANO_SPACING;
        top = isHeightOverFlow ? containerRect.top + offsetYWithArrow - SPACING : triggerRect.top + triggerRect.height + SPACING;
        translateX = -0.5;
        break;
      case "bottomLeft":
        left = isWidthOverFlow ? isWrapperWidthOverflow ? containerRect.left : containerRect.right - wrapperRect.width : pointAtCenter ? middleX - offsetXWithArrow + ANO_SPACING : triggerRect.left + ANO_SPACING;
        top = isHeightOverFlow ? containerRect.top + offsetYWithArrow - SPACING : triggerRect.top + triggerRect.height + SPACING;
        break;
      case "bottomRight":
        left = isWidthOverFlow ? containerRect.right + offsetWidth : pointAtCenter ? middleX + offsetXWithArrow + ANO_SPACING : triggerRect.right + ANO_SPACING;
        top = isHeightOverFlow ? containerRect.top + offsetYWithArrow - SPACING : triggerRect.top + triggerRect.height + SPACING;
        translateX = -1;
        break;
      case "right":
        left = isWidthOverFlow ? containerRect.left - SPACING + offsetXWithArrow : triggerRect.right + SPACING;
        top = isHeightOverFlow ? isTriggerNearTop ? containerRect.top + wrapperRect.height / 2 : containerRect.bottom - wrapperRect.height / 2 + offsetHeight : middleY + ANO_SPACING;
        translateY = -0.5;
        break;
      case "rightTop":
        left = isWidthOverFlow ? containerRect.left - SPACING + offsetXWithArrow : triggerRect.right + SPACING;
        top = isHeightOverFlow ? containerRect.top : pointAtCenter ? middleY - offsetYWithArrow + ANO_SPACING : triggerRect.top + ANO_SPACING;
        break;
      case "rightBottom":
        left = isWidthOverFlow ? containerRect.left - SPACING + offsetXWithArrow : triggerRect.right + SPACING;
        top = isHeightOverFlow ? containerRect.bottom + offsetHeight : pointAtCenter ? middleY + offsetYWithArrow + ANO_SPACING : triggerRect.bottom + ANO_SPACING;
        translateY = -1;
        break;
      case "leftTopOver":
        left = triggerRect.left - SPACING;
        top = triggerRect.top - SPACING;
        break;
      case "rightTopOver":
        left = triggerRect.right + SPACING;
        top = triggerRect.top - SPACING;
        translateX = -1;
        break;
      case "leftBottomOver":
        left = triggerRect.left - SPACING;
        top = triggerRect.bottom + SPACING;
        translateY = -1;
        break;
      case "rightBottomOver":
        left = triggerRect.right + SPACING;
        top = triggerRect.bottom + SPACING;
        translateX = -1;
        translateY = -1;
        break;
      default:
        break;
    }
    const transformOrigin = this.calcTransformOrigin(position, triggerRect, translateX, translateY);
    const _containerIsBody = this._adapter.containerIsBody();
    left = left - containerRect.left;
    top = top - containerRect.top;
    if (scaled) {
      left /= wrapperRect.width / this._adapter.getContainer().clientWidth;
    }
    if (scaled) {
      top /= wrapperRect.height / this._adapter.getContainer().clientHeight;
    }
    if (_containerIsBody && !this._adapter.containerIsRelativeOrAbsolute()) {
      const documentEleRect = this._adapter.getDocumentElementBounding();
      left += containerRect.left - documentEleRect.left;
      top += containerRect.top - documentEleRect.top;
    }
    left = _containerIsBody ? left : left + containerRect.scrollLeft;
    top = _containerIsBody ? top : top + containerRect.scrollTop;
    const triggerHeight = triggerRect.height;
    if (this.getProp("showArrow") && !arrowPointAtCenter && triggerHeight <= (verticalArrowHeight / 2 + arrowOffsetY) * 2) {
      const offsetY = triggerHeight / 2 - (arrowOffsetY + verticalArrowHeight / 2);
      if ((position.includes("Top") || position.includes("Bottom")) && !position.includes("Over")) {
        top = position.includes("Top") ? top + offsetY : top - offsetY;
      }
    }
    const style = {
      left: this._roundPixel(left),
      top: this._roundPixel(top)
    };
    let transform = "";
    if (translateX != null) {
      transform += `translateX(${translateX * 100}%) `;
      Object.defineProperty(style, "translateX", {
        enumerable: false,
        value: translateX
      });
    }
    if (translateY != null) {
      transform += `translateY(${translateY * 100}%) `;
      Object.defineProperty(style, "translateY", {
        enumerable: false,
        value: translateY
      });
    }
    if (transformOrigin != null) {
      style.transformOrigin = transformOrigin;
    }
    if (transform) {
      style.transform = transform;
    }
    return style;
  }
  isLR() {
    let position = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    return position.includes("left") || position.includes("right");
  }
  isTB() {
    let position = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    return position.includes("top") || position.includes("bottom");
  }
  isReverse(rowSpace, reverseSpace, size) {
    return rowSpace < size && reverseSpace > size;
  }
  isOverFlow(rowSpace, reverseSpace, size) {
    return rowSpace < size && reverseSpace < size;
  }
  isHalfOverFlow(posSpace, negSpace, size) {
    return posSpace < size || negSpace < size;
  }
  isHalfAllEnough(posSpace, negSpace, size) {
    return posSpace >= size || negSpace >= size;
  }
  getReverse(viewOverFlow, containerOverFlow, shouldReverseView, shouldReverseContainer) {
    return viewOverFlow && shouldReverseContainer || shouldReverseView;
  }
  // place the dom correctly
  adjustPosIfNeed(position, style, triggerRect, wrapperRect, containerRect) {
    const {
      innerWidth,
      innerHeight
    } = window;
    const {
      margin
    } = this.getProps();
    const marginLeft = typeof margin === "number" ? margin : margin.marginLeft;
    const marginTop = typeof margin === "number" ? margin : margin.marginTop;
    const marginRight = typeof margin === "number" ? margin : margin.marginRight;
    const marginBottom = typeof margin === "number" ? margin : margin.marginBottom;
    let isHeightOverFlow = false;
    let isWidthOverFlow = false;
    const raw_spacing = this.getProp("spacing");
    let spacing = raw_spacing;
    let ano_spacing = 0;
    if (typeof raw_spacing !== "number") {
      const isTopOrBottom = position.includes("top") || position.includes("bottom");
      spacing = isTopOrBottom ? raw_spacing.y : raw_spacing.x;
      ano_spacing = isTopOrBottom ? raw_spacing.x : raw_spacing.y;
    }
    if (wrapperRect.width > 0 && wrapperRect.height > 0) {
      const clientLeft = triggerRect.left;
      const clientRight = triggerRect.right;
      const clientTop = triggerRect.top;
      const clientBottom = triggerRect.bottom;
      const restClientLeft = innerWidth - clientLeft;
      const restClientTop = innerHeight - clientTop;
      const restClientRight = innerWidth - clientRight;
      const restClientBottom = innerHeight - clientBottom;
      const widthIsBigger = wrapperRect.width > triggerRect.width;
      const heightIsBigger = wrapperRect.height > triggerRect.height;
      const shouldViewReverseTop = clientTop - marginTop < wrapperRect.height + spacing && restClientBottom - marginBottom > wrapperRect.height + spacing;
      const shouldViewReverseLeft = clientLeft - marginLeft < wrapperRect.width + spacing && restClientRight - marginRight > wrapperRect.width + spacing;
      const shouldViewReverseBottom = restClientBottom - marginBottom < wrapperRect.height + spacing && clientTop - marginTop > wrapperRect.height + spacing;
      const shouldViewReverseRight = restClientRight - marginRight < wrapperRect.width + spacing && clientLeft - marginLeft > wrapperRect.width + spacing;
      const shouldViewReverseTopOver = restClientTop - marginBottom < wrapperRect.height + spacing && clientBottom - marginTop > wrapperRect.height + spacing;
      const shouldViewReverseBottomOver = clientBottom - marginTop < wrapperRect.height + spacing && restClientTop - marginBottom > wrapperRect.height + spacing;
      const shouldViewReverseTopSide = restClientTop < wrapperRect.height + ano_spacing && clientBottom > wrapperRect.height + ano_spacing;
      const shouldViewReverseBottomSide = clientBottom < wrapperRect.height + ano_spacing && restClientTop > wrapperRect.height + ano_spacing;
      const shouldViewReverseLeftSide = restClientLeft < wrapperRect.width + ano_spacing && clientRight > wrapperRect.width + ano_spacing;
      const shouldViewReverseRightSide = clientRight < wrapperRect.width + ano_spacing && restClientLeft > wrapperRect.width + ano_spacing;
      const shouldReverseTopOver = restClientTop < wrapperRect.height + spacing && clientBottom > wrapperRect.height + spacing;
      const shouldReverseBottomOver = clientBottom < wrapperRect.height + spacing && restClientTop > wrapperRect.height + spacing;
      const shouldReverseLeftOver = restClientLeft < wrapperRect.width && clientRight > wrapperRect.width;
      const shouldReverseRightOver = clientRight < wrapperRect.width && restClientLeft > wrapperRect.width;
      const clientTopInContainer = clientTop - containerRect.top;
      const clientLeftInContainer = clientLeft - containerRect.left;
      const clientBottomInContainer = clientTopInContainer + triggerRect.height;
      const clientRightInContainer = clientLeftInContainer + triggerRect.width;
      const restClientBottomInContainer = containerRect.bottom - clientBottom;
      const restClientRightInContainer = containerRect.right - clientRight;
      const restClientTopInContainer = restClientBottomInContainer + triggerRect.height;
      const restClientLeftInContainer = restClientRightInContainer + triggerRect.width;
      const shouldContainerReverseTop = this.isReverse(clientTopInContainer - marginTop, restClientBottomInContainer - marginBottom, wrapperRect.height + spacing);
      const shouldContainerReverseLeft = this.isReverse(clientLeftInContainer - marginLeft, restClientRightInContainer - marginRight, wrapperRect.width + spacing);
      const shouldContainerReverseBottom = this.isReverse(restClientBottomInContainer - marginBottom, clientTopInContainer - marginTop, wrapperRect.height + spacing);
      const shouldContainerReverseRight = this.isReverse(restClientRightInContainer - marginRight, clientLeftInContainer - marginLeft, wrapperRect.width + spacing);
      const shouldContainerReverseTopOver = this.isReverse(restClientTopInContainer - marginBottom, clientBottomInContainer - marginTop, wrapperRect.height + spacing);
      const shouldContainerReverseBottomOver = this.isReverse(clientBottomInContainer - marginTop, restClientTopInContainer - marginBottom, wrapperRect.height + spacing);
      const shouldContainerReverseTopSide = this.isReverse(restClientTopInContainer, clientBottomInContainer, wrapperRect.height + ano_spacing);
      const shouldContainerReverseBottomSide = this.isReverse(clientBottomInContainer, restClientTopInContainer, wrapperRect.height + ano_spacing);
      const shouldContainerReverseLeftSide = this.isReverse(restClientLeftInContainer, clientRightInContainer, wrapperRect.width + ano_spacing);
      const shouldContainerReverseRightSide = this.isReverse(clientRightInContainer, restClientLeftInContainer, wrapperRect.width + ano_spacing);
      const halfHeight = triggerRect.height / 2;
      const halfWidth = triggerRect.width / 2;
      const isViewYOverFlow = this.isOverFlow(clientTop - marginTop, restClientBottom - marginBottom, wrapperRect.height + spacing);
      const isViewXOverFlow = this.isOverFlow(clientLeft - marginLeft, restClientRight - marginRight, wrapperRect.width + spacing);
      const isViewYOverFlowSide = this.isOverFlow(clientBottom - marginTop, restClientTop - marginBottom, wrapperRect.height + spacing);
      const isViewXOverFlowSide = this.isOverFlow(clientRight - marginLeft, restClientLeft - marginRight, wrapperRect.width + spacing);
      const isViewYOverFlowSideHalf = this.isHalfOverFlow(clientBottom - halfHeight, restClientTop - halfHeight, (wrapperRect.height + ano_spacing) / 2);
      const isViewXOverFlowSideHalf = this.isHalfOverFlow(clientRight - halfWidth, restClientLeft - halfWidth, (wrapperRect.width + ano_spacing) / 2);
      const isViewYEnoughSideHalf = this.isHalfAllEnough(clientBottom - halfHeight, restClientTop - halfHeight, (wrapperRect.height + ano_spacing) / 2);
      const isViewXEnoughSideHalf = this.isHalfAllEnough(clientRight - halfWidth, restClientLeft - halfWidth, (wrapperRect.width + ano_spacing) / 2);
      const isContainerYOverFlow = this.isOverFlow(clientTopInContainer - marginTop, restClientBottomInContainer - marginBottom, wrapperRect.height + spacing);
      const isContainerXOverFlow = this.isOverFlow(clientLeftInContainer - marginLeft, restClientRightInContainer - marginRight, wrapperRect.width + spacing);
      const isContainerYOverFlowSide = this.isOverFlow(clientBottomInContainer - marginTop, restClientTopInContainer - marginBottom, wrapperRect.height + spacing);
      const isContainerXOverFlowSide = this.isOverFlow(clientRightInContainer - marginLeft, restClientLeftInContainer - marginRight, wrapperRect.width + spacing);
      const isContainerYOverFlowSideHalf = this.isHalfOverFlow(clientBottomInContainer - halfHeight, restClientTopInContainer - halfHeight, (wrapperRect.height + ano_spacing) / 2);
      const isContainerXOverFlowSideHalf = this.isHalfOverFlow(clientRightInContainer - halfWidth, restClientLeftInContainer - halfWidth, (wrapperRect.width + ano_spacing) / 2);
      const isContainerYEnoughSideHalf = this.isHalfAllEnough(clientBottomInContainer - halfHeight, restClientTopInContainer - halfHeight, (wrapperRect.height + ano_spacing) / 2);
      const isContainerXEnoughSideHalf = this.isHalfAllEnough(clientRightInContainer - halfWidth, restClientLeftInContainer - halfWidth, (wrapperRect.width + ano_spacing) / 2);
      const shouldReverseTop = this.getReverse(isViewYOverFlow, isContainerYOverFlow, shouldViewReverseTop, shouldContainerReverseTop);
      const shouldReverseLeft = this.getReverse(isViewXOverFlow, isContainerXOverFlow, shouldViewReverseLeft, shouldContainerReverseLeft);
      const shouldReverseBottom = this.getReverse(isViewYOverFlow, isContainerYOverFlow, shouldViewReverseBottom, shouldContainerReverseBottom);
      const shouldReverseRight = this.getReverse(isViewXOverFlow, isContainerXOverFlow, shouldViewReverseRight, shouldContainerReverseRight);
      const shouldReverseTopSide = this.getReverse(isViewYOverFlowSide, isContainerYOverFlowSide, shouldViewReverseTopSide, shouldContainerReverseTopSide);
      const shouldReverseBottomSide = this.getReverse(isViewYOverFlowSide, isContainerYOverFlowSide, shouldViewReverseBottomSide, shouldContainerReverseBottomSide);
      const shouldReverseLeftSide = this.getReverse(isViewXOverFlowSide, isContainerXOverFlowSide, shouldViewReverseLeftSide, shouldContainerReverseLeftSide);
      const shouldReverseRightSide = this.getReverse(isViewXOverFlowSide, isContainerXOverFlowSide, shouldViewReverseRightSide, shouldContainerReverseRightSide);
      const isYOverFlowSideHalf = isViewYOverFlowSideHalf && isContainerYOverFlowSideHalf;
      const isXOverFlowSideHalf = isViewXOverFlowSideHalf && isContainerXOverFlowSideHalf;
      switch (position) {
        case "top":
          if (shouldReverseTop) {
            position = this._adjustPos(position, true);
          }
          if (isXOverFlowSideHalf && (shouldReverseLeftSide || shouldReverseRightSide)) {
            position = this._adjustPos(position, true, "expand", shouldReverseLeftSide ? "Right" : "Left");
          }
          break;
        case "topLeft":
          if (shouldReverseTop) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseLeftSide && widthIsBigger) {
            position = this._adjustPos(position);
          }
          if (isWidthOverFlow && (isViewXEnoughSideHalf || isContainerXEnoughSideHalf)) {
            position = this._adjustPos(position, true, "reduce");
          }
          break;
        case "topRight":
          if (shouldReverseTop) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseRightSide && widthIsBigger) {
            position = this._adjustPos(position);
          }
          if (isWidthOverFlow && (isViewXEnoughSideHalf || isContainerXEnoughSideHalf)) {
            position = this._adjustPos(position, true, "reduce");
          }
          break;
        case "left":
          if (shouldReverseLeft) {
            position = this._adjustPos(position);
          }
          if (isYOverFlowSideHalf && (shouldReverseTopSide || shouldReverseBottomSide)) {
            position = this._adjustPos(position, false, "expand", shouldReverseTopSide ? "Bottom" : "Top");
          }
          break;
        case "leftTop":
          if (shouldReverseLeft) {
            position = this._adjustPos(position);
          }
          if (shouldReverseTopSide && heightIsBigger) {
            position = this._adjustPos(position, true);
          }
          if (isHeightOverFlow && (isViewYEnoughSideHalf || isContainerYEnoughSideHalf)) {
            position = this._adjustPos(position, false, "reduce");
          }
          break;
        case "leftBottom":
          if (shouldReverseLeft) {
            position = this._adjustPos(position);
          }
          if (shouldReverseBottomSide && heightIsBigger) {
            position = this._adjustPos(position, true);
          }
          if (isHeightOverFlow && (isViewYEnoughSideHalf || isContainerYEnoughSideHalf)) {
            position = this._adjustPos(position, false, "reduce");
          }
          break;
        case "bottom":
          if (shouldReverseBottom) {
            position = this._adjustPos(position, true);
          }
          if (isXOverFlowSideHalf && (shouldReverseLeftSide || shouldReverseRightSide)) {
            position = this._adjustPos(position, true, "expand", shouldReverseLeftSide ? "Right" : "Left");
          }
          break;
        case "bottomLeft":
          if (shouldReverseBottom) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseLeftSide && widthIsBigger) {
            position = this._adjustPos(position);
          }
          if (isWidthOverFlow && (isViewXEnoughSideHalf || isContainerXEnoughSideHalf)) {
            position = this._adjustPos(position, true, "reduce");
          }
          break;
        case "bottomRight":
          if (shouldReverseBottom) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseRightSide && widthIsBigger) {
            position = this._adjustPos(position);
          }
          if (isWidthOverFlow && (isViewXEnoughSideHalf || isContainerXEnoughSideHalf)) {
            position = this._adjustPos(position, true, "reduce");
          }
          break;
        case "right":
          if (shouldReverseRight) {
            position = this._adjustPos(position);
          }
          if (isYOverFlowSideHalf && (shouldReverseTopSide || shouldReverseBottomSide)) {
            position = this._adjustPos(position, false, "expand", shouldReverseTopSide ? "Bottom" : "Top");
          }
          break;
        case "rightTop":
          if (shouldReverseRight) {
            position = this._adjustPos(position);
          }
          if (shouldReverseTopSide && heightIsBigger) {
            position = this._adjustPos(position, true);
          }
          if (isHeightOverFlow && (isViewYEnoughSideHalf || isContainerYEnoughSideHalf)) {
            position = this._adjustPos(position, false, "reduce");
          }
          break;
        case "rightBottom":
          if (shouldReverseRight) {
            position = this._adjustPos(position);
          }
          if (shouldReverseBottomSide && heightIsBigger) {
            position = this._adjustPos(position, true);
          }
          if (isHeightOverFlow && (isViewYEnoughSideHalf || isContainerYEnoughSideHalf)) {
            position = this._adjustPos(position, false, "reduce");
          }
          break;
        case "leftTopOver":
          if (shouldReverseTopOver) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseLeftOver) {
            position = this._adjustPos(position);
          }
          break;
        case "leftBottomOver":
          if (shouldReverseBottomOver) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseLeftOver) {
            position = this._adjustPos(position);
          }
          break;
        case "rightTopOver":
          if (shouldReverseTopOver) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseRightOver) {
            position = this._adjustPos(position);
          }
          break;
        case "rightBottomOver":
          if (shouldReverseBottomOver) {
            position = this._adjustPos(position, true);
          }
          if (shouldReverseRightOver) {
            position = this._adjustPos(position);
          }
          break;
        default:
          break;
      }
      if (this.isTB(position)) {
        isHeightOverFlow = isViewYOverFlow && isContainerYOverFlow;
        if (position === "top" || position === "bottom") {
          isWidthOverFlow = isViewXOverFlowSideHalf && isContainerXOverFlowSideHalf || clientRight < 0 || restClientRight < 0;
        } else {
          isWidthOverFlow = isViewXOverFlowSide && isContainerXOverFlowSide || clientRight < 0 || restClientRight < 0;
        }
      }
      if (this.isLR(position)) {
        isWidthOverFlow = isViewXOverFlow && isContainerXOverFlow;
        if (position === "left" || position === "right") {
          isHeightOverFlow = isViewYOverFlowSideHalf && isContainerYOverFlowSideHalf || clientTop < 0 || restClientTop < 0;
        } else {
          isHeightOverFlow = isViewYOverFlowSide && isContainerYOverFlowSide || clientTop < 0 || restClientTop < 0;
        }
      }
    }
    return {
      position,
      isHeightOverFlow,
      isWidthOverFlow
    };
  }
  _bindScrollEvent() {
    this._adapter.registerScrollHandler(() => this.calcPosition());
  }
  unBindScrollEvent() {
    this._adapter.unregisterScrollHandler();
  }
  _initContainerPosition() {
    this._adapter.updateContainerPosition();
  }
  _handleTriggerKeydown(event) {
    const {
      closeOnEsc,
      disableArrowKeyDown
    } = this.getProps();
    const container = this._adapter.getContainer();
    const focusableElements = this._adapter.getFocusableElements(container);
    const focusableNum = focusableElements.length;
    switch (event && event.key) {
      case "Escape":
        handlePrevent(event);
        closeOnEsc && this._handleEscKeyDown(event);
        break;
      case "ArrowUp":
        !disableArrowKeyDown && focusableNum && this._handleTriggerArrowUpKeydown(focusableElements, event);
        break;
      case "ArrowDown":
        !disableArrowKeyDown && focusableNum && this._handleTriggerArrowDownKeydown(focusableElements, event);
        break;
      default:
        break;
    }
  }
  /**
   * focus trigger
   *
   * when trigger is 'focus' or 'hover', onFocus is bind to show popup
   * if we focus trigger, popup will show again
   *
   * 如果 trigger 是 focus 或者 hover，则它绑定了 onFocus，这里我们如果重新 focus 的话，popup 会再次打开
   * 因此 returnFocusOnClose 只支持 click trigger
   */
  focusTrigger() {
    const {
      trigger,
      returnFocusOnClose,
      preventScroll
    } = this.getProps();
    if (returnFocusOnClose && trigger !== "custom") {
      const triggerNode = this._adapter.getTriggerNode();
      if (triggerNode && "focus" in triggerNode) {
        triggerNode.focus({
          preventScroll
        });
      }
    }
  }
  _handleEscKeyDown(event) {
    const {
      trigger
    } = this.getProps();
    if (trigger !== "custom") {
      this.focusTrigger();
      this.hide();
    }
    this._adapter.notifyEscKeydown(event);
  }
  _handleContainerTabKeyDown(focusableElements, event) {
    const {
      preventScroll
    } = this.getProps();
    const activeElement = this._adapter.getActiveElement();
    const isLastCurrentFocus = focusableElements[focusableElements.length - 1] === activeElement;
    if (isLastCurrentFocus) {
      focusableElements[0].focus({
        preventScroll
      });
      event.preventDefault();
    }
  }
  _handleContainerShiftTabKeyDown(focusableElements, event) {
    const {
      preventScroll
    } = this.getProps();
    const activeElement = this._adapter.getActiveElement();
    const isFirstCurrentFocus = focusableElements[0] === activeElement;
    if (isFirstCurrentFocus) {
      focusableElements[focusableElements.length - 1].focus({
        preventScroll
      });
      event.preventDefault();
    }
  }
  _handleTriggerArrowDownKeydown(focusableElements, event) {
    const {
      preventScroll
    } = this.getProps();
    focusableElements[0].focus({
      preventScroll
    });
    event.preventDefault();
  }
  _handleTriggerArrowUpKeydown(focusableElements, event) {
    const {
      preventScroll
    } = this.getProps();
    focusableElements[focusableElements.length - 1].focus({
      preventScroll
    });
    event.preventDefault();
  }
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/tooltip/constants.js
var cssClasses2 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-tooltip`
};
var strings2 = {
  POSITION_SET: ["top", "topLeft", "topRight", "left", "leftTop", "leftBottom", "right", "rightTop", "rightBottom", "bottom", "bottomLeft", "bottomRight", "leftTopOver", "rightTopOver", "leftBottomOver", "rightBottomOver"],
  TRIGGER_SET: ["hover", "focus", "click", "custom", "contextMenu"],
  STATUS_DISABLED: "disabled",
  STATUS_LOADING: "loading"
};
var numbers = {
  ARROW_BOUNDING: {
    offsetX: 0,
    offsetY: 2,
    width: 24,
    height: 7
  },
  DEFAULT_Z_INDEX: 1060,
  MOUSE_ENTER_DELAY: 50,
  MOUSE_LEAVE_DELAY: 50,
  SPACING: 8,
  MARGIN: 0
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/uuid.js
function getUuid(prefix2) {
  return `${prefix2}-${(/* @__PURE__ */ new Date()).getTime()}-${Math.random()}`;
}
function getUuidShort() {
  let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  const {
    prefix: prefix2 = "",
    length = 7
  } = options;
  const characters = "0123456789abcdefghijklmnopqrstuvwxyz";
  const total = characters.length;
  let randomId = "";
  for (let i = 0; i < length; i++) {
    const random = Math.floor(Math.random() * total);
    randomId += characters.charAt(random);
  }
  return prefix2 ? `${prefix2}-${randomId}` : randomId;
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_base/baseComponent.js
var import_react3 = __toESM(require_react());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/getDataAttr.js
function getDataAttr(props) {
  return Object.keys(props).reduce((prev, key) => {
    if (key.substr(0, 5) === "data-") {
      prev[key] = props[key];
    }
    return prev;
  }, {});
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_base/baseComponent.js
var {
  hasOwnProperty
} = Object.prototype;
var BaseComponent = class extends import_react3.Component {
  constructor(props) {
    super(props);
    this.isControlled = (key) => Boolean(key && this.props && typeof this.props === "object" && hasOwnProperty.call(this.props, key));
    this.setStateAsync = (state) => {
      return new Promise((resolve) => {
        this.setState(state, resolve);
      });
    };
    this.cache = {};
    this.foundation = null;
  }
  componentDidMount() {
    this.foundation && typeof this.foundation.init === "function" && this.foundation.init();
  }
  componentWillUnmount() {
    this.foundation && typeof this.foundation.destroy === "function" && this.foundation.destroy();
    this.cache = {};
  }
  get adapter() {
    return {
      getContext: (key) => {
        if (this.context && key) {
          return this.context[key];
        }
      },
      getContexts: () => this.context,
      getProp: (key) => this.props[key],
      // return all props
      getProps: () => this.props,
      getState: (key) => this.state[key],
      getStates: () => this.state,
      setState: (states, cb) => this.setState(Object.assign({}, states), cb),
      getCache: (key) => key && this.cache[key],
      getCaches: () => this.cache,
      setCache: (key, value) => key && (this.cache[key] = value),
      stopPropagation: (e) => {
        try {
          e.stopPropagation();
          e.nativeEvent && e.nativeEvent.stopImmediatePropagation();
        } catch (error) {
        }
      },
      persistEvent: (e) => {
        e && e.persist && typeof e.persist === "function" ? e.persist() : null;
      }
    };
  }
  log(text) {
    for (var _len = arguments.length, rest = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      rest[_key - 1] = arguments[_key];
    }
    return log_default(text, ...rest);
  }
  getDataAttr() {
    let props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : this.props;
    return getDataAttr(props);
  }
};
BaseComponent.propTypes = {};
BaseComponent.defaultProps = {};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_base/reactUtils.js
var import_react4 = __toESM(require_react());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_utils/index.js
var import_get4 = __toESM(require_get());
var import_set = __toESM(require_set());
var import_cloneDeepWith = __toESM(require_cloneDeepWith());
var import_react5 = __toESM(require_react());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_utils/semi-global.js
var SemiGlobal = class {
  constructor() {
    this.config = {};
  }
};
var semi_global_default = new SemiGlobal();

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_utils/index.js
var __awaiter = function(thisArg, _arguments, P, generator3) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator3.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator3["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator3 = generator3.apply(thisArg, _arguments || [])).next());
  });
};
function stopPropagation(e, noImmediate) {
  if (e && typeof e.stopPropagation === "function") {
    e.stopPropagation();
  }
  if (!noImmediate && e.nativeEvent && typeof e.nativeEvent.stopImmediatePropagation === "function") {
    e.nativeEvent.stopImmediatePropagation();
  }
}
function cloneDeep(value, customizer) {
  return (0, import_cloneDeepWith.default)(value, (v) => {
    if (typeof customizer === "function") {
      return customizer(v);
    }
    if (typeof v === "function" || /* @__PURE__ */ import_react5.default.isValidElement(v)) {
      return v;
    }
    if (Object.prototype.toString.call(v) === "[object Error]") {
      return v;
    }
    if (Array.isArray(v) && v.length === 0) {
      const keys = Object.keys(v);
      if (keys.length) {
        const newArray = [];
        keys.forEach((key) => {
          (0, import_set.default)(newArray, key, v[key]);
        });
        try {
          warning((0, import_get4.default)(process, "env.NODE_ENV") !== "production", `[Semi] You may use an out-of-bounds array. In some cases, your program may not behave as expected.
                    The maximum length of an array is 4294967295.
                    Please check whether the array subscript in your data exceeds the maximum value of the JS array subscript`);
        } catch (e) {
        }
        return newArray;
      } else {
        return void 0;
      }
    }
    return void 0;
  });
}
var registerMediaQuery = (media, _ref2) => {
  let {
    match: match2,
    unmatch,
    callInInit = true
  } = _ref2;
  if (typeof window !== "undefined") {
    let handlerMediaChange = function(e) {
      if (e.matches) {
        match2 && match2(e);
      } else {
        unmatch && unmatch(e);
      }
    };
    const mediaQueryList = window.matchMedia(media);
    callInInit && handlerMediaChange(mediaQueryList);
    if (Object.prototype.hasOwnProperty.call(mediaQueryList, "addEventListener")) {
      mediaQueryList.addEventListener("change", handlerMediaChange);
      return () => mediaQueryList.removeEventListener("change", handlerMediaChange);
    }
    mediaQueryList.addListener(handlerMediaChange);
    return () => mediaQueryList.removeListener(handlerMediaChange);
  }
  return () => void 0;
};
var isSemiIcon = (icon) => /* @__PURE__ */ import_react5.default.isValidElement(icon) && (0, import_get4.default)(icon.type, "elementType") === "Icon";
function getActiveElement() {
  return document ? document.activeElement : null;
}
function getFocusableElements(node) {
  if (!isElement(node)) {
    return [];
  }
  const focusableSelectorsList = ["input:not([disabled]):not([tabindex='-1'])", "textarea:not([disabled]):not([tabindex='-1'])", "button:not([disabled]):not([tabindex='-1'])", "a[href]:not([tabindex='-1'])", "select:not([disabled]):not([tabindex='-1'])", "area[href]:not([tabindex='-1'])", "iframe:not([tabindex='-1'])", "object:not([tabindex='-1'])", "*[tabindex]:not([tabindex='-1'])", "*[contenteditable]:not([tabindex='-1'])"];
  const focusableSelectorsStr = focusableSelectorsList.join(",");
  const focusableElements = Array.from(node.querySelectorAll(focusableSelectorsStr));
  return focusableElements;
}
function runAfterTicks(func, numberOfTicks) {
  return __awaiter(this, void 0, void 0, function* () {
    if (numberOfTicks === 0) {
      yield func();
      return;
    } else {
      yield new Promise((resolve) => {
        setTimeout(() => __awaiter(this, void 0, void 0, function* () {
          yield runAfterTicks(func, numberOfTicks - 1);
          resolve();
        }), 0);
      });
      return;
    }
  });
}
function getDefaultPropsFromGlobalConfig(componentName) {
  let semiDefaultProps = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
  const getFromGlobalConfig = () => {
    var _a, _b;
    return ((_b = (_a = semi_global_default === null || semi_global_default === void 0 ? void 0 : semi_global_default.config) === null || _a === void 0 ? void 0 : _a.overrideDefaultProps) === null || _b === void 0 ? void 0 : _b[componentName]) || {};
  };
  return new Proxy(Object.assign({}, semiDefaultProps), {
    get(target, key, receiver) {
      const defaultPropsFromGlobal = getFromGlobalConfig();
      if (key in defaultPropsFromGlobal) {
        return defaultPropsFromGlobal[key];
      }
      return Reflect.get(target, key, receiver);
    },
    set(target, key, value, receiver) {
      return Reflect.set(target, key, value, receiver);
    },
    ownKeys() {
      const defaultPropsFromGlobal = getFromGlobalConfig();
      return Array.from(/* @__PURE__ */ new Set([...Reflect.ownKeys(semiDefaultProps), ...Object.keys(defaultPropsFromGlobal)]));
    },
    getOwnPropertyDescriptor(target, key) {
      const defaultPropsFromGlobal = getFromGlobalConfig();
      if (key in defaultPropsFromGlobal) {
        return Reflect.getOwnPropertyDescriptor(defaultPropsFromGlobal, key);
      } else {
        return Reflect.getOwnPropertyDescriptor(target, key);
      }
    }
  });
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_portal/index.js
var import_react7 = __toESM(require_react());
var import_react_dom = __toESM(require_react_dom());
var import_prop_types2 = __toESM(require_prop_types());
var import_classnames3 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/configProvider/context.js
var import_react6 = __toESM(require_react());
var ConfigContext = /* @__PURE__ */ import_react6.default.createContext({});
var context_default = ConfigContext;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_portal/index.js
var defaultGetContainer = () => document.body;
var Portal = class extends import_react7.PureComponent {
  constructor(props, context) {
    var _this;
    super(props);
    _this = this;
    this.initContainer = function(context2) {
      let catchError = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
      var _a, _b;
      try {
        let container = void 0;
        if (!_this.el || !((_a = _this.state) === null || _a === void 0 ? void 0 : _a.container) || !Array.from(_this.state.container.childNodes).includes(_this.el)) {
          _this.el = document.createElement("div");
          const getContainer = _this.props.getPopupContainer || context2.getPopupContainer || defaultGetContainer;
          const portalContainer = getContainer();
          portalContainer.appendChild(_this.el);
          _this.addStyle(_this.props.style);
          _this.addClass(_this.props.prefixCls, context2, _this.props.className);
          container = portalContainer;
          return container;
        }
      } catch (e) {
        if (!catchError) {
          throw e;
        }
      }
      return (_b = _this.state) === null || _b === void 0 ? void 0 : _b.container;
    };
    this.addStyle = function() {
      let style = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
      if (_this.el) {
        for (const key of Object.keys(style)) {
          _this.el.style[key] = style[key];
        }
      }
    };
    this.addClass = function(prefixCls17) {
      let context2 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : _this.context;
      const {
        direction
      } = context2;
      for (var _len = arguments.length, classNames6 = new Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
        classNames6[_key - 2] = arguments[_key];
      }
      const cls32 = (0, import_classnames3.default)(prefixCls17, ...classNames6, {
        [`${prefixCls17}-rtl`]: direction === "rtl"
      });
      if (_this.el) {
        _this.el.className = cls32;
      }
    };
    this.state = {
      container: this.initContainer(context, true)
    };
  }
  componentDidMount() {
    const container = this.initContainer(this.context);
    if (container !== this.state.container) {
      this.setState({
        container
      });
    }
  }
  componentDidUpdate(prevProps) {
    const {
      didUpdate
    } = this.props;
    if (didUpdate) {
      didUpdate(prevProps);
    }
  }
  componentWillUnmount() {
    const {
      container
    } = this.state;
    if (container) {
      container.removeChild(this.el);
    }
  }
  render() {
    const {
      state,
      props
    } = this;
    if (state.container) {
      return /* @__PURE__ */ (0, import_react_dom.createPortal)(props.children, this.el);
    }
    return null;
  }
};
Portal.contextType = context_default;
Portal.defaultProps = {
  // getPopupContainer: () => document.body,
  prefixCls: `${BASE_CLASS_PREFIX2}-portal`
};
Portal.propTypes = {
  children: import_prop_types2.default.node,
  prefixCls: import_prop_types2.default.string,
  getPopupContainer: import_prop_types2.default.func,
  className: import_prop_types2.default.string,
  didUpdate: import_prop_types2.default.func
};
var portal_default = Portal;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/tooltip/TriangleArrow.js
var import_react8 = __toESM(require_react());
var __rest3 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var TriangleArrow = (props) => {
  const {
    className,
    style
  } = props, restProps = __rest3(props, ["className", "style"]);
  return /* @__PURE__ */ import_react8.default.createElement("svg", Object.assign({
    "aria-hidden": true,
    className,
    style
  }, restProps, {
    width: "24",
    height: "7",
    viewBox: "0 0 24 7",
    fill: "currentColor",
    xmlns: "http://www.w3.org/2000/svg"
  }), /* @__PURE__ */ import_react8.default.createElement("path", {
    d: "M24 0V1C20 1 18.5 2 16.5 4C14.5 6 14 7 12 7C10 7 9.5 6 7.5 4C5.5 2 4 1 0 1V0H24Z"
  }));
};
var TriangleArrow_default = TriangleArrow;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/tooltip/TriangleArrowVertical.js
var import_react9 = __toESM(require_react());
var __rest4 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var TriangleArrowVertical = (props) => {
  const {
    className,
    style
  } = props, restProps = __rest4(props, ["className", "style"]);
  return /* @__PURE__ */ import_react9.default.createElement("svg", Object.assign({
    "aria-hidden": true,
    className,
    style
  }, restProps, {
    width: "7",
    height: "24",
    xmlns: "http://www.w3.org/2000/svg",
    fill: "currentColor"
  }), /* @__PURE__ */ import_react9.default.createElement("path", {
    d: "M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z"
  }));
};
var TriangleArrowVertical_default = TriangleArrowVertical;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/tooltip/ArrowBoundingShape.js
var import_prop_types3 = __toESM(require_prop_types());
var ArrowBoundingShape_default = import_prop_types3.default.shape({
  offsetX: import_prop_types3.default.number,
  offsetY: import_prop_types3.default.number,
  width: import_prop_types3.default.number,
  height: import_prop_types3.default.number
});

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/_cssAnimation/index.js
var import_isEqual = __toESM(require_isEqual());
var import_react10 = __toESM(require_react());
var CSSAnimation = class extends import_react10.default.Component {
  constructor(props) {
    super(props);
    this.handleAnimationStart = () => {
      var _a, _b;
      (_b = (_a = this.props).onAnimationStart) === null || _b === void 0 ? void 0 : _b.call(_a);
    };
    this.handleAnimationEnd = () => {
      this.setState({
        currentClassName: this.props.endClassName,
        extraStyle: {
          animationFillMode: this.props.fillMode
        },
        isAnimating: false
      }, () => {
        var _a, _b;
        (_b = (_a = this.props).onAnimationEnd) === null || _b === void 0 ? void 0 : _b.call(_a, false);
      });
    };
    this.state = {
      currentClassName: this.props.startClassName,
      extraStyle: {
        animationFillMode: this.props.fillMode
      },
      isAnimating: true
    };
  }
  componentDidMount() {
    var _a, _b, _c2, _d;
    (_b = (_a = this.props).onAnimationStart) === null || _b === void 0 ? void 0 : _b.call(_a);
    if (!this.props.motion) {
      (_d = (_c2 = this.props).onAnimationEnd) === null || _d === void 0 ? void 0 : _d.call(_c2, false);
      this.setState({
        isAnimating: false
      });
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const changedKeys = Object.keys(this.props).filter((key) => !(0, import_isEqual.default)(this.props[key], prevProps[key]));
    if (changedKeys.includes("animationState")) {
    }
    if (changedKeys.includes("startClassName") || changedKeys.includes("replayKey") || changedKeys.includes("motion")) {
      this.setState({
        currentClassName: this.props.startClassName,
        extraStyle: {
          animationFillMode: this.props.fillMode
        },
        isAnimating: true
      }, () => {
        var _a, _b, _c2, _d;
        (_b = (_a = this.props).onAnimationStart) === null || _b === void 0 ? void 0 : _b.call(_a);
        if (!this.props.motion) {
          (_d = (_c2 = this.props).onAnimationEnd) === null || _d === void 0 ? void 0 : _d.call(_c2, this.state.isAnimating);
          this.setState({
            isAnimating: false
          });
        }
      });
    }
  }
  render() {
    var _a;
    if (this.props.motion) {
      return this.props.children({
        animationClassName: (_a = this.state.currentClassName) !== null && _a !== void 0 ? _a : "",
        animationStyle: this.state.extraStyle,
        animationEventsNeedBind: {
          onAnimationStart: this.handleAnimationStart,
          onAnimationEnd: this.handleAnimationEnd
        },
        isAnimating: this.state.isAnimating
      });
    } else {
      return this.props.children({
        animationClassName: "",
        animationStyle: {},
        animationEventsNeedBind: {},
        isAnimating: this.state.isAnimating
      });
    }
  }
};
CSSAnimation.defaultProps = {
  motion: true,
  replayKey: ""
};
var cssAnimation_default = CSSAnimation;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/tooltip/index.js
var __rest5 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefix = cssClasses2.PREFIX;
var positionSet = strings2.POSITION_SET;
var triggerSet = strings2.TRIGGER_SET;
var blockDisplays = ["flex", "block", "table", "flow-root", "grid"];
var defaultGetContainer2 = () => document.body;
var Tooltip2 = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.isAnimating = false;
    this.setContainerEl = (node) => this.containerEl = {
      current: node
    };
    this.isSpecial = (elem) => {
      if (isElement(elem)) {
        return Boolean(elem.disabled);
      } else if (/* @__PURE__ */ (0, import_react11.isValidElement)(elem)) {
        const disabled = (0, import_get5.default)(elem, "props.disabled");
        if (disabled) {
          return strings2.STATUS_DISABLED;
        }
        const loading = (0, import_get5.default)(elem, "props.loading");
        const isButton = !(0, import_isEmpty2.default)(elem) && !(0, import_isEmpty2.default)(elem.type) && ((0, import_get5.default)(elem, "type.elementType") === "Button" || (0, import_get5.default)(elem, "type.elementType") === "IconButton");
        if (loading && isButton) {
          return strings2.STATUS_LOADING;
        }
      }
      return false;
    };
    this.didLeave = () => {
      if (this.props.keepDOM) {
        this.foundation.setDisplayNone(true);
      } else {
        this.foundation.removePortal();
      }
      this.foundation.unBindEvent();
    };
    this.renderIcon = () => {
      const {
        placement
      } = this.state;
      const {
        showArrow,
        prefixCls: prefixCls17,
        style
      } = this.props;
      let icon = null;
      const triangleCls = (0, import_classnames4.default)([`${prefixCls17}-icon-arrow`]);
      const bgColor = (0, import_get5.default)(style, "backgroundColor");
      const iconComponent = (placement === null || placement === void 0 ? void 0 : placement.includes("left")) || (placement === null || placement === void 0 ? void 0 : placement.includes("right")) ? /* @__PURE__ */ import_react11.default.createElement(TriangleArrowVertical_default, null) : /* @__PURE__ */ import_react11.default.createElement(TriangleArrow_default, null);
      if (showArrow) {
        if (/* @__PURE__ */ (0, import_react11.isValidElement)(showArrow)) {
          icon = showArrow;
        } else {
          icon = /* @__PURE__ */ import_react11.default.cloneElement(iconComponent, {
            className: triangleCls,
            style: {
              color: bgColor,
              fill: "currentColor"
            }
          });
        }
      }
      return icon;
    };
    this.handlePortalInnerClick = (e) => {
      if (this.props.clickToHide) {
        this.foundation.hide();
      }
      if (this.props.stopPropagation) {
        stopPropagation(e);
      }
    };
    this.handlePortalMouseDown = (e) => {
      if (this.props.stopPropagation) {
        stopPropagation(e);
      }
    };
    this.handlePortalFocus = (e) => {
      if (this.props.stopPropagation) {
        stopPropagation(e);
      }
    };
    this.handlePortalBlur = (e) => {
      if (this.props.stopPropagation) {
        stopPropagation(e);
      }
    };
    this.handlePortalInnerKeyDown = (e) => {
      this.foundation.handleContainerKeydown(e);
    };
    this.renderContentNode = (content) => {
      const contentProps = {
        initialFocusRef: this.initialFocusRef
      };
      return !(0, import_isFunction.default)(content) ? content : content(contentProps);
    };
    this.renderPortal = () => {
      const {
        containerStyle = {},
        visible,
        portalEventSet,
        placement,
        displayNone,
        transitionState,
        id,
        isPositionUpdated
      } = this.state;
      const {
        prefixCls: prefixCls17,
        content,
        showArrow,
        style,
        motion,
        role,
        zIndex
      } = this.props;
      const contentNode = this.renderContentNode(content);
      const {
        className: propClassName
      } = this.props;
      const direction = this.context.direction;
      const className = (0, import_classnames4.default)(propClassName, {
        [`${prefixCls17}-wrapper`]: true,
        [`${prefixCls17}-wrapper-show`]: visible,
        [`${prefixCls17}-with-arrow`]: Boolean(showArrow),
        [`${prefixCls17}-rtl`]: direction === "rtl"
      });
      const icon = this.renderIcon();
      const portalInnerStyle = (0, import_omit.default)(containerStyle, motion ? ["transformOrigin"] : void 0);
      const transformOrigin = (0, import_get5.default)(containerStyle, "transformOrigin");
      const userOpacity = (0, import_get5.default)(style, "opacity", null);
      const opacity = userOpacity ? userOpacity : 1;
      const inner = /* @__PURE__ */ import_react11.default.createElement(cssAnimation_default, {
        fillMode: "forwards",
        animationState: transitionState,
        motion: motion && isPositionUpdated,
        startClassName: transitionState === "enter" ? `${prefix}-animation-show` : `${prefix}-animation-hide`,
        onAnimationStart: () => this.isAnimating = true,
        onAnimationEnd: () => {
          var _a, _b;
          if (transitionState === "leave") {
            this.didLeave();
            (_b = (_a = this.props).afterClose) === null || _b === void 0 ? void 0 : _b.call(_a);
          }
          this.isAnimating = false;
        }
      }, (_ref) => {
        let {
          animationStyle,
          animationClassName,
          animationEventsNeedBind
        } = _ref;
        return /* @__PURE__ */ import_react11.default.createElement("div", Object.assign({
          className: (0, import_classnames4.default)(className, animationClassName),
          style: Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({}, animationStyle), displayNone ? {
            display: "none"
          } : {}), {
            transformOrigin
          }), style), userOpacity ? {
            opacity: isPositionUpdated ? opacity : "0"
          } : {})
        }, portalEventSet, animationEventsNeedBind, {
          role,
          "x-placement": placement,
          id
        }), /* @__PURE__ */ import_react11.default.createElement("div", {
          className: `${prefix}-content`
        }, contentNode), icon);
      });
      return /* @__PURE__ */ import_react11.default.createElement(portal_default, {
        getPopupContainer: this.props.getPopupContainer,
        style: {
          zIndex
        }
      }, /* @__PURE__ */ import_react11.default.createElement("div", {
        // listen keyboard event, don't move tabIndex -1
        tabIndex: -1,
        className: `${BASE_CLASS_PREFIX2}-portal-inner`,
        style: portalInnerStyle,
        ref: this.setContainerEl,
        onClick: this.handlePortalInnerClick,
        onFocus: this.handlePortalFocus,
        onBlur: this.handlePortalBlur,
        onMouseDown: this.handlePortalMouseDown,
        onKeyDown: this.handlePortalInnerKeyDown
      }, inner));
    };
    this.wrapSpan = (elem) => {
      const {
        wrapperClassName
      } = this.props;
      const display = (0, import_get5.default)(elem, "props.style.display");
      const block = (0, import_get5.default)(elem, "props.block");
      const isStringElem = typeof elem == "string";
      const style = {};
      if (!isStringElem) {
        style.display = "inline-block";
      }
      if (block || blockDisplays.includes(display)) {
        style.width = "100%";
      }
      return /* @__PURE__ */ import_react11.default.createElement("span", {
        className: wrapperClassName,
        style
      }, elem);
    };
    this.mergeEvents = (rawEvents, events) => {
      const mergedEvents = {};
      (0, import_each.default)(events, (handler, key) => {
        if (typeof handler === "function") {
          mergedEvents[key] = function() {
            handler(...arguments);
            if (rawEvents && typeof rawEvents[key] === "function") {
              rawEvents[key](...arguments);
            }
          };
        }
      });
      return mergedEvents;
    };
    this.getPopupId = () => {
      return this.state.id;
    };
    this.state = {
      visible: false,
      /**
       *
       * Note: The transitionState parameter is equivalent to isInsert
       */
      transitionState: "",
      triggerEventSet: {},
      portalEventSet: {},
      containerStyle: {
        // zIndex: props.zIndex,
      },
      isInsert: false,
      placement: props.position || "top",
      transitionStyle: {},
      isPositionUpdated: false,
      id: props.wrapperId,
      displayNone: false
    };
    this.foundation = new Tooltip(this.adapter);
    this.eventManager = new Event();
    this.triggerEl = /* @__PURE__ */ import_react11.default.createRef();
    this.containerEl = /* @__PURE__ */ import_react11.default.createRef();
    this.initialFocusRef = /* @__PURE__ */ import_react11.default.createRef();
    this.clickOutsideHandler = null;
    this.resizeHandler = null;
    this.isWrapped = false;
    this.containerPosition = void 0;
  }
  get adapter() {
    var _this = this;
    return Object.assign(Object.assign({}, super.adapter), {
      // @ts-ignore
      on: function() {
        return _this.eventManager.on(...arguments);
      },
      // @ts-ignore
      off: function() {
        return _this.eventManager.off(...arguments);
      },
      getAnimatingState: () => this.isAnimating,
      insertPortal: (content, _a) => {
        var {
          position
        } = _a, containerStyle = __rest5(_a, ["position"]);
        this.setState({
          isInsert: true,
          transitionState: "enter",
          containerStyle: Object.assign(Object.assign({}, this.state.containerStyle), containerStyle)
        }, () => {
          setTimeout(() => {
            this.eventManager.emit("portalInserted");
          }, 0);
        });
      },
      removePortal: () => {
        this.setState({
          isInsert: false,
          isPositionUpdated: false
        });
      },
      getEventName: () => ({
        mouseEnter: "onMouseEnter",
        mouseLeave: "onMouseLeave",
        mouseOut: "onMouseOut",
        mouseOver: "onMouseOver",
        click: "onClick",
        focus: "onFocus",
        blur: "onBlur",
        keydown: "onKeyDown",
        contextMenu: "onContextMenu"
      }),
      registerTriggerEvent: (triggerEventSet) => {
        this.setState({
          triggerEventSet
        });
      },
      registerPortalEvent: (portalEventSet) => {
        this.setState({
          portalEventSet
        });
      },
      getTriggerBounding: () => {
        const triggerDOM = this.adapter.getTriggerNode();
        this.triggerEl.current = triggerDOM;
        return triggerDOM && triggerDOM.getBoundingClientRect();
      },
      // Gets the outer size of the specified container
      getPopupContainerRect: () => {
        const container = this.getPopupContainer();
        let rect = null;
        if (container && isElement(container)) {
          const boundingRect = convertDOMRectToObject(container.getBoundingClientRect());
          rect = Object.assign(Object.assign({}, boundingRect), {
            scrollLeft: container.scrollLeft,
            scrollTop: container.scrollTop
          });
        }
        return rect;
      },
      containerIsBody: () => {
        const container = this.getPopupContainer();
        return container === document.body;
      },
      containerIsRelative: () => {
        const container = this.getPopupContainer();
        const computedStyle = window.getComputedStyle(container);
        return computedStyle.getPropertyValue("position") === "relative";
      },
      containerIsRelativeOrAbsolute: () => ["relative", "absolute"].includes(this.containerPosition),
      // Get the size of the pop-up layer
      getWrapperBounding: () => {
        const el = this.containerEl && this.containerEl.current;
        return el && el.getBoundingClientRect();
      },
      getDocumentElementBounding: () => document.documentElement.getBoundingClientRect(),
      setPosition: (_a) => {
        var {
          position
        } = _a, style = __rest5(_a, ["position"]);
        this.setState({
          containerStyle: Object.assign(Object.assign({}, this.state.containerStyle), style),
          placement: position,
          isPositionUpdated: true
        }, () => {
          this.eventManager.emit("positionUpdated");
        });
      },
      setDisplayNone: (displayNone, cb) => {
        this.setState({
          displayNone
        }, cb);
      },
      updatePlacementAttr: (placement) => {
        this.setState({
          placement
        });
      },
      togglePortalVisible: (visible, cb) => {
        const willUpdateStates = {};
        willUpdateStates.transitionState = visible ? "enter" : "leave";
        willUpdateStates.visible = visible;
        this.mounted && this.setState(willUpdateStates, () => {
          cb();
        });
      },
      registerClickOutsideHandler: (cb) => {
        if (this.clickOutsideHandler) {
          this.adapter.unregisterClickOutsideHandler();
        }
        this.clickOutsideHandler = (e) => {
          if (!this.mounted) {
            return false;
          }
          let el = this.triggerEl && this.triggerEl.current;
          let popupEl = this.containerEl && this.containerEl.current;
          el = import_react_dom2.default.findDOMNode(el);
          popupEl = import_react_dom2.default.findDOMNode(popupEl);
          const target = e.target;
          const path = e.composedPath && e.composedPath() || [target];
          const isClickTriggerToHide = this.props.clickTriggerToHide ? el && el.contains(target) || path.includes(el) : false;
          if (el && !el.contains(target) && popupEl && !popupEl.contains(target) && !(path.includes(popupEl) || path.includes(el)) || isClickTriggerToHide) {
            this.props.onClickOutSide(e);
            cb();
          }
        };
        window.addEventListener("mousedown", this.clickOutsideHandler);
      },
      unregisterClickOutsideHandler: () => {
        if (this.clickOutsideHandler) {
          window.removeEventListener("mousedown", this.clickOutsideHandler);
          this.clickOutsideHandler = null;
        }
      },
      registerResizeHandler: (cb) => {
        if (this.resizeHandler) {
          this.adapter.unregisterResizeHandler();
        }
        this.resizeHandler = (0, import_throttle.default)((e) => {
          if (!this.mounted) {
            return false;
          }
          cb(e);
        }, 10);
        window.addEventListener("resize", this.resizeHandler, false);
      },
      unregisterResizeHandler: () => {
        if (this.resizeHandler) {
          window.removeEventListener("resize", this.resizeHandler, false);
          this.resizeHandler = null;
        }
      },
      notifyVisibleChange: (visible) => {
        this.props.onVisibleChange(visible);
      },
      registerScrollHandler: (rePositionCb) => {
        if (this.scrollHandler) {
          this.adapter.unregisterScrollHandler();
        }
        this.scrollHandler = (0, import_throttle.default)((e) => {
          if (!this.mounted) {
            return false;
          }
          const triggerDOM = this.adapter.getTriggerNode();
          const isRelativeScroll = e.target.contains(triggerDOM);
          if (isRelativeScroll) {
            const scrollPos = {
              x: e.target.scrollLeft,
              y: e.target.scrollTop
            };
            rePositionCb(scrollPos);
          }
        }, 10);
        window.addEventListener("scroll", this.scrollHandler, true);
      },
      unregisterScrollHandler: () => {
        if (this.scrollHandler) {
          window.removeEventListener("scroll", this.scrollHandler, true);
          this.scrollHandler = null;
        }
      },
      canMotion: () => Boolean(this.props.motion),
      updateContainerPosition: () => {
        const container = this.getPopupContainer();
        if (container && isElement(container)) {
          const computedStyle = window.getComputedStyle(container);
          const position = computedStyle.getPropertyValue("position");
          this.containerPosition = position;
        }
      },
      getContainerPosition: () => this.containerPosition,
      getContainer: () => this.containerEl && this.containerEl.current,
      getTriggerNode: () => {
        let triggerDOM = this.triggerEl.current;
        if (!isElement(this.triggerEl.current)) {
          triggerDOM = import_react_dom2.default.findDOMNode(this.triggerEl.current);
        }
        return triggerDOM;
      },
      getFocusableElements: (node) => {
        return getFocusableElements(node);
      },
      getActiveElement: () => {
        return getActiveElement();
      },
      setInitialFocus: () => {
        const {
          preventScroll
        } = this.props;
        const focusRefNode = (0, import_get5.default)(this, "initialFocusRef.current");
        if (focusRefNode && "focus" in focusRefNode) {
          focusRefNode.focus({
            preventScroll
          });
        }
      },
      notifyEscKeydown: (event) => {
        this.props.onEscKeyDown(event);
      },
      setId: () => {
        this.setState({
          id: getUuidShort()
        });
      },
      getTriggerDOM: () => {
        if (this.triggerEl.current) {
          return import_react_dom2.default.findDOMNode(this.triggerEl.current);
        } else {
          return null;
        }
      }
    });
  }
  componentDidMount() {
    this.mounted = true;
    this.getPopupContainer = this.props.getPopupContainer || this.context.getPopupContainer || defaultGetContainer2;
    this.foundation.init();
    runAfterTicks(() => {
      let triggerEle = this.triggerEl.current;
      if (triggerEle) {
        if (!(triggerEle instanceof HTMLElement)) {
          triggerEle = (0, import_react_dom2.findDOMNode)(triggerEle);
        }
      }
      this.foundation.updateStateIfCursorOnTrigger(triggerEle);
    }, 1);
  }
  componentWillUnmount() {
    this.mounted = false;
    this.foundation.destroy();
  }
  /**
   * focus on tooltip trigger
   */
  focusTrigger() {
    this.foundation.focusTrigger();
  }
  /** for transition - end */
  rePosition() {
    return this.foundation.calcPosition();
  }
  componentDidUpdate(prevProps, prevState) {
    warning(this.props.mouseLeaveDelay < this.props.mouseEnterDelay, "[Semi Tooltip] 'mouseLeaveDelay' cannot be less than 'mouseEnterDelay', which may cause the dropdown layer to not be hidden.");
    if (prevProps.visible !== this.props.visible) {
      if (["hover", "focus"].includes(this.props.trigger)) {
        this.props.visible ? this.foundation.delayShow() : this.foundation.delayHide();
      } else {
        this.props.visible ? this.foundation.show() : this.foundation.hide();
      }
    }
    if (!(0, import_isEqual2.default)(prevProps.rePosKey, this.props.rePosKey)) {
      this.rePosition();
    }
  }
  render() {
    const {
      isInsert,
      triggerEventSet,
      visible,
      id
    } = this.state;
    const {
      wrapWhenSpecial,
      role,
      trigger
    } = this.props;
    let {
      children
    } = this.props;
    const childrenStyle = Object.assign({}, (0, import_get5.default)(children, "props.style"));
    const extraStyle = {};
    if (wrapWhenSpecial) {
      const isSpecial = this.isSpecial(children);
      if (isSpecial) {
        childrenStyle.pointerEvents = "none";
        if (isSpecial === strings2.STATUS_DISABLED) {
          extraStyle.cursor = "not-allowed";
        }
        children = /* @__PURE__ */ (0, import_react11.cloneElement)(children, {
          style: childrenStyle
        });
        if (trigger !== "custom") {
          children = this.wrapSpan(children);
        }
        this.isWrapped = true;
      } else if (!/* @__PURE__ */ (0, import_react11.isValidElement)(children)) {
        children = this.wrapSpan(children);
        this.isWrapped = true;
      }
    }
    let ariaAttribute = {};
    if (role === "dialog") {
      ariaAttribute["aria-expanded"] = visible ? "true" : "false";
      ariaAttribute["aria-haspopup"] = "dialog";
      ariaAttribute["aria-controls"] = id;
    } else {
      ariaAttribute["aria-describedby"] = id;
    }
    const newChild = /* @__PURE__ */ import_react11.default.cloneElement(children, Object.assign(Object.assign(Object.assign(Object.assign({}, ariaAttribute), children.props), this.mergeEvents(children.props, triggerEventSet)), {
      style: Object.assign(Object.assign({}, (0, import_get5.default)(children, "props.style")), extraStyle),
      className: (0, import_classnames4.default)((0, import_get5.default)(children, "props.className")),
      // to maintain refs with callback
      ref: (node) => {
        this.triggerEl.current = node;
        const {
          ref: ref2
        } = children;
        if (typeof ref2 === "function") {
          ref2(node);
        } else if (ref2 && typeof ref2 === "object") {
          ref2.current = node;
        }
      },
      tabIndex: children.props.tabIndex || 0,
      "data-popupid": id
    }));
    return /* @__PURE__ */ import_react11.default.createElement(import_react11.default.Fragment, null, isInsert ? this.renderPortal() : null, newChild);
  }
};
Tooltip2.contextType = context_default;
Tooltip2.propTypes = {
  children: import_prop_types4.default.node,
  motion: import_prop_types4.default.bool,
  autoAdjustOverflow: import_prop_types4.default.bool,
  position: import_prop_types4.default.oneOf(positionSet),
  getPopupContainer: import_prop_types4.default.func,
  mouseEnterDelay: import_prop_types4.default.number,
  mouseLeaveDelay: import_prop_types4.default.number,
  trigger: import_prop_types4.default.oneOf(triggerSet).isRequired,
  className: import_prop_types4.default.string,
  wrapperClassName: import_prop_types4.default.string,
  clickToHide: import_prop_types4.default.bool,
  // used with trigger === hover, private
  clickTriggerToHide: import_prop_types4.default.bool,
  visible: import_prop_types4.default.bool,
  style: import_prop_types4.default.object,
  content: import_prop_types4.default.oneOfType([import_prop_types4.default.node, import_prop_types4.default.func]),
  prefixCls: import_prop_types4.default.string,
  onVisibleChange: import_prop_types4.default.func,
  onClickOutSide: import_prop_types4.default.func,
  spacing: import_prop_types4.default.oneOfType([import_prop_types4.default.number, import_prop_types4.default.object]),
  margin: import_prop_types4.default.oneOfType([import_prop_types4.default.number, import_prop_types4.default.object]),
  showArrow: import_prop_types4.default.oneOfType([import_prop_types4.default.bool, import_prop_types4.default.node]),
  zIndex: import_prop_types4.default.number,
  rePosKey: import_prop_types4.default.oneOfType([import_prop_types4.default.string, import_prop_types4.default.number]),
  arrowBounding: ArrowBoundingShape_default,
  transformFromCenter: import_prop_types4.default.bool,
  arrowPointAtCenter: import_prop_types4.default.bool,
  stopPropagation: import_prop_types4.default.bool,
  // private
  role: import_prop_types4.default.string,
  wrapWhenSpecial: import_prop_types4.default.bool,
  guardFocus: import_prop_types4.default.bool,
  returnFocusOnClose: import_prop_types4.default.bool,
  preventScroll: import_prop_types4.default.bool,
  keepDOM: import_prop_types4.default.bool
};
Tooltip2.__SemiComponentName__ = "Tooltip";
Tooltip2.defaultProps = getDefaultPropsFromGlobalConfig(Tooltip2.__SemiComponentName__, {
  arrowBounding: numbers.ARROW_BOUNDING,
  autoAdjustOverflow: true,
  arrowPointAtCenter: true,
  trigger: "hover",
  transformFromCenter: true,
  position: "top",
  prefixCls: prefix,
  role: "tooltip",
  mouseEnterDelay: numbers.MOUSE_ENTER_DELAY,
  mouseLeaveDelay: numbers.MOUSE_LEAVE_DELAY,
  motion: true,
  onVisibleChange: import_noop2.default,
  onClickOutSide: import_noop2.default,
  spacing: numbers.SPACING,
  margin: numbers.MARGIN,
  showArrow: true,
  wrapWhenSpecial: true,
  zIndex: numbers.DEFAULT_Z_INDEX,
  closeOnEsc: false,
  guardFocus: false,
  returnFocusOnClose: false,
  onEscKeyDown: import_noop2.default,
  disableFocusListener: false,
  disableArrowKeyDown: false,
  keepDOM: false
});

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/copyable.js
var import_copy_text_to_clipboard = __toESM(require_copy_text_to_clipboard());
var import_classnames5 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/function.js
function noop() {
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/locale/localeConsumer.js
var import_get6 = __toESM(require_get());
var import_react13 = __toESM(require_react());
var import_prop_types5 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/locale/context.js
var import_react12 = __toESM(require_react());
var LocaleContext = /* @__PURE__ */ import_react12.default.createContext(null);
var context_default2 = LocaleContext;

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/_lib/buildFormatLongFn/index.js
function buildFormatLongFn(args) {
  return function() {
    var options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    var width = options.width ? String(options.width) : args.defaultWidth;
    var format = args.formats[width] || args.formats[args.defaultWidth];
    return format;
  };
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/_lib/buildLocalizeFn/index.js
function buildLocalizeFn(args) {
  return function(dirtyIndex, options) {
    var context = options !== null && options !== void 0 && options.context ? String(options.context) : "standalone";
    var valuesArray;
    if (context === "formatting" && args.formattingValues) {
      var defaultWidth = args.defaultFormattingWidth || args.defaultWidth;
      var width = options !== null && options !== void 0 && options.width ? String(options.width) : defaultWidth;
      valuesArray = args.formattingValues[width] || args.formattingValues[defaultWidth];
    } else {
      var _defaultWidth = args.defaultWidth;
      var _width = options !== null && options !== void 0 && options.width ? String(options.width) : args.defaultWidth;
      valuesArray = args.values[_width] || args.values[_defaultWidth];
    }
    var index = args.argumentCallback ? args.argumentCallback(dirtyIndex) : dirtyIndex;
    return valuesArray[index];
  };
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/_lib/buildMatchFn/index.js
function buildMatchFn(args) {
  return function(string) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var width = options.width;
    var matchPattern = width && args.matchPatterns[width] || args.matchPatterns[args.defaultMatchWidth];
    var matchResult = string.match(matchPattern);
    if (!matchResult) {
      return null;
    }
    var matchedString = matchResult[0];
    var parsePatterns = width && args.parsePatterns[width] || args.parsePatterns[args.defaultParseWidth];
    var key = Array.isArray(parsePatterns) ? findIndex(parsePatterns, function(pattern) {
      return pattern.test(matchedString);
    }) : findKey(parsePatterns, function(pattern) {
      return pattern.test(matchedString);
    });
    var value;
    value = args.valueCallback ? args.valueCallback(key) : key;
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value,
      rest
    };
  };
}
function findKey(object, predicate) {
  for (var key in object) {
    if (object.hasOwnProperty(key) && predicate(object[key])) {
      return key;
    }
  }
  return void 0;
}
function findIndex(array, predicate) {
  for (var key = 0; key < array.length; key++) {
    if (predicate(array[key])) {
      return key;
    }
  }
  return void 0;
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/_lib/buildMatchPatternFn/index.js
function buildMatchPatternFn(args) {
  return function(string) {
    var options = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    var matchResult = string.match(args.matchPattern);
    if (!matchResult)
      return null;
    var matchedString = matchResult[0];
    var parseResult = string.match(args.parsePattern);
    if (!parseResult)
      return null;
    var value = args.valueCallback ? args.valueCallback(parseResult[0]) : parseResult[0];
    value = options.valueCallback ? options.valueCallback(value) : value;
    var rest = string.slice(matchedString.length);
    return {
      value,
      rest
    };
  };
}

// node_modules/.pnpm/@babel+runtime@7.25.6/node_modules/@babel/runtime/helpers/esm/typeof.js
function _typeof(o) {
  "@babel/helpers - typeof";
  return _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function(o2) {
    return typeof o2;
  } : function(o2) {
    return o2 && "function" == typeof Symbol && o2.constructor === Symbol && o2 !== Symbol.prototype ? "symbol" : typeof o2;
  }, _typeof(o);
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/_lib/toInteger/index.js
function toInteger(dirtyNumber) {
  if (dirtyNumber === null || dirtyNumber === true || dirtyNumber === false) {
    return NaN;
  }
  var number = Number(dirtyNumber);
  if (isNaN(number)) {
    return number;
  }
  return number < 0 ? Math.ceil(number) : Math.floor(number);
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/_lib/requiredArgs/index.js
function requiredArgs(required, args) {
  if (args.length < required) {
    throw new TypeError(required + " argument" + (required > 1 ? "s" : "") + " required, but only " + args.length + " present");
  }
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/toDate/index.js
function toDate(argument) {
  requiredArgs(1, arguments);
  var argStr = Object.prototype.toString.call(argument);
  if (argument instanceof Date || _typeof(argument) === "object" && argStr === "[object Date]") {
    return new Date(argument.getTime());
  } else if (typeof argument === "number" || argStr === "[object Number]") {
    return new Date(argument);
  } else {
    if ((typeof argument === "string" || argStr === "[object String]") && typeof console !== "undefined") {
      console.warn("Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://github.com/date-fns/date-fns/blob/master/docs/upgradeGuide.md#string-arguments");
      console.warn(new Error().stack);
    }
    return /* @__PURE__ */ new Date(NaN);
  }
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/_lib/defaultOptions/index.js
var defaultOptions = {};
function getDefaultOptions() {
  return defaultOptions;
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/_lib/startOfUTCWeek/index.js
function startOfUTCWeek(dirtyDate, options) {
  var _ref, _ref2, _ref3, _options$weekStartsOn, _options$locale, _options$locale$optio, _defaultOptions$local, _defaultOptions$local2;
  requiredArgs(1, arguments);
  var defaultOptions2 = getDefaultOptions();
  var weekStartsOn = toInteger((_ref = (_ref2 = (_ref3 = (_options$weekStartsOn = options === null || options === void 0 ? void 0 : options.weekStartsOn) !== null && _options$weekStartsOn !== void 0 ? _options$weekStartsOn : options === null || options === void 0 ? void 0 : (_options$locale = options.locale) === null || _options$locale === void 0 ? void 0 : (_options$locale$optio = _options$locale.options) === null || _options$locale$optio === void 0 ? void 0 : _options$locale$optio.weekStartsOn) !== null && _ref3 !== void 0 ? _ref3 : defaultOptions2.weekStartsOn) !== null && _ref2 !== void 0 ? _ref2 : (_defaultOptions$local = defaultOptions2.locale) === null || _defaultOptions$local === void 0 ? void 0 : (_defaultOptions$local2 = _defaultOptions$local.options) === null || _defaultOptions$local2 === void 0 ? void 0 : _defaultOptions$local2.weekStartsOn) !== null && _ref !== void 0 ? _ref : 0);
  if (!(weekStartsOn >= 0 && weekStartsOn <= 6)) {
    throw new RangeError("weekStartsOn must be between 0 and 6 inclusively");
  }
  var date = toDate(dirtyDate);
  var day = date.getUTCDay();
  var diff = (day < weekStartsOn ? 7 : 0) + day - weekStartsOn;
  date.setUTCDate(date.getUTCDate() - diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/_lib/isSameUTCWeek/index.js
function isSameUTCWeek(dirtyDateLeft, dirtyDateRight, options) {
  requiredArgs(2, arguments);
  var dateLeftStartOfWeek = startOfUTCWeek(dirtyDateLeft, options);
  var dateRightStartOfWeek = startOfUTCWeek(dirtyDateRight, options);
  return dateLeftStartOfWeek.getTime() === dateRightStartOfWeek.getTime();
}

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/zh-CN/_lib/formatDistance/index.js
var formatDistanceLocale = {
  lessThanXSeconds: {
    one: "\u4E0D\u5230 1 \u79D2",
    other: "\u4E0D\u5230 {{count}} \u79D2"
  },
  xSeconds: {
    one: "1 \u79D2",
    other: "{{count}} \u79D2"
  },
  halfAMinute: "\u534A\u5206\u949F",
  lessThanXMinutes: {
    one: "\u4E0D\u5230 1 \u5206\u949F",
    other: "\u4E0D\u5230 {{count}} \u5206\u949F"
  },
  xMinutes: {
    one: "1 \u5206\u949F",
    other: "{{count}} \u5206\u949F"
  },
  xHours: {
    one: "1 \u5C0F\u65F6",
    other: "{{count}} \u5C0F\u65F6"
  },
  aboutXHours: {
    one: "\u5927\u7EA6 1 \u5C0F\u65F6",
    other: "\u5927\u7EA6 {{count}} \u5C0F\u65F6"
  },
  xDays: {
    one: "1 \u5929",
    other: "{{count}} \u5929"
  },
  aboutXWeeks: {
    one: "\u5927\u7EA6 1 \u4E2A\u661F\u671F",
    other: "\u5927\u7EA6 {{count}} \u4E2A\u661F\u671F"
  },
  xWeeks: {
    one: "1 \u4E2A\u661F\u671F",
    other: "{{count}} \u4E2A\u661F\u671F"
  },
  aboutXMonths: {
    one: "\u5927\u7EA6 1 \u4E2A\u6708",
    other: "\u5927\u7EA6 {{count}} \u4E2A\u6708"
  },
  xMonths: {
    one: "1 \u4E2A\u6708",
    other: "{{count}} \u4E2A\u6708"
  },
  aboutXYears: {
    one: "\u5927\u7EA6 1 \u5E74",
    other: "\u5927\u7EA6 {{count}} \u5E74"
  },
  xYears: {
    one: "1 \u5E74",
    other: "{{count}} \u5E74"
  },
  overXYears: {
    one: "\u8D85\u8FC7 1 \u5E74",
    other: "\u8D85\u8FC7 {{count}} \u5E74"
  },
  almostXYears: {
    one: "\u5C06\u8FD1 1 \u5E74",
    other: "\u5C06\u8FD1 {{count}} \u5E74"
  }
};
var formatDistance = function formatDistance2(token, count, options) {
  var result;
  var tokenValue = formatDistanceLocale[token];
  if (typeof tokenValue === "string") {
    result = tokenValue;
  } else if (count === 1) {
    result = tokenValue.one;
  } else {
    result = tokenValue.other.replace("{{count}}", String(count));
  }
  if (options !== null && options !== void 0 && options.addSuffix) {
    if (options.comparison && options.comparison > 0) {
      return result + "\u5185";
    } else {
      return result + "\u524D";
    }
  }
  return result;
};
var formatDistance_default = formatDistance;

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/zh-CN/_lib/formatLong/index.js
var dateFormats = {
  full: "y'\u5E74'M'\u6708'd'\u65E5' EEEE",
  long: "y'\u5E74'M'\u6708'd'\u65E5'",
  medium: "yyyy-MM-dd",
  short: "yy-MM-dd"
};
var timeFormats = {
  full: "zzzz a h:mm:ss",
  long: "z a h:mm:ss",
  medium: "a h:mm:ss",
  short: "a h:mm"
};
var dateTimeFormats = {
  full: "{{date}} {{time}}",
  long: "{{date}} {{time}}",
  medium: "{{date}} {{time}}",
  short: "{{date}} {{time}}"
};
var formatLong = {
  date: buildFormatLongFn({
    formats: dateFormats,
    defaultWidth: "full"
  }),
  time: buildFormatLongFn({
    formats: timeFormats,
    defaultWidth: "full"
  }),
  dateTime: buildFormatLongFn({
    formats: dateTimeFormats,
    defaultWidth: "full"
  })
};
var formatLong_default = formatLong;

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/zh-CN/_lib/formatRelative/index.js
function checkWeek(date, baseDate, options) {
  var baseFormat = "eeee p";
  if (isSameUTCWeek(date, baseDate, options)) {
    return baseFormat;
  } else if (date.getTime() > baseDate.getTime()) {
    return "'\u4E0B\u4E2A'" + baseFormat;
  }
  return "'\u4E0A\u4E2A'" + baseFormat;
}
var formatRelativeLocale = {
  lastWeek: checkWeek,
  // days before yesterday, maybe in this week or last week
  yesterday: "'\u6628\u5929' p",
  today: "'\u4ECA\u5929' p",
  tomorrow: "'\u660E\u5929' p",
  nextWeek: checkWeek,
  // days after tomorrow, maybe in this week or next week
  other: "PP p"
};
var formatRelative = function formatRelative2(token, date, baseDate, options) {
  var format = formatRelativeLocale[token];
  if (typeof format === "function") {
    return format(date, baseDate, options);
  }
  return format;
};
var formatRelative_default = formatRelative;

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/zh-CN/_lib/localize/index.js
var eraValues = {
  narrow: ["\u524D", "\u516C\u5143"],
  abbreviated: ["\u524D", "\u516C\u5143"],
  wide: ["\u516C\u5143\u524D", "\u516C\u5143"]
};
var quarterValues = {
  narrow: ["1", "2", "3", "4"],
  abbreviated: ["\u7B2C\u4E00\u5B63", "\u7B2C\u4E8C\u5B63", "\u7B2C\u4E09\u5B63", "\u7B2C\u56DB\u5B63"],
  wide: ["\u7B2C\u4E00\u5B63\u5EA6", "\u7B2C\u4E8C\u5B63\u5EA6", "\u7B2C\u4E09\u5B63\u5EA6", "\u7B2C\u56DB\u5B63\u5EA6"]
};
var monthValues = {
  narrow: ["\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D", "\u4E03", "\u516B", "\u4E5D", "\u5341", "\u5341\u4E00", "\u5341\u4E8C"],
  abbreviated: ["1\u6708", "2\u6708", "3\u6708", "4\u6708", "5\u6708", "6\u6708", "7\u6708", "8\u6708", "9\u6708", "10\u6708", "11\u6708", "12\u6708"],
  wide: ["\u4E00\u6708", "\u4E8C\u6708", "\u4E09\u6708", "\u56DB\u6708", "\u4E94\u6708", "\u516D\u6708", "\u4E03\u6708", "\u516B\u6708", "\u4E5D\u6708", "\u5341\u6708", "\u5341\u4E00\u6708", "\u5341\u4E8C\u6708"]
};
var dayValues = {
  narrow: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  short: ["\u65E5", "\u4E00", "\u4E8C", "\u4E09", "\u56DB", "\u4E94", "\u516D"],
  abbreviated: ["\u5468\u65E5", "\u5468\u4E00", "\u5468\u4E8C", "\u5468\u4E09", "\u5468\u56DB", "\u5468\u4E94", "\u5468\u516D"],
  wide: ["\u661F\u671F\u65E5", "\u661F\u671F\u4E00", "\u661F\u671F\u4E8C", "\u661F\u671F\u4E09", "\u661F\u671F\u56DB", "\u661F\u671F\u4E94", "\u661F\u671F\u516D"]
};
var dayPeriodValues = {
  narrow: {
    am: "\u4E0A",
    pm: "\u4E0B",
    midnight: "\u51CC\u6668",
    noon: "\u5348",
    morning: "\u65E9",
    afternoon: "\u4E0B\u5348",
    evening: "\u665A",
    night: "\u591C"
  },
  abbreviated: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  },
  wide: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  }
};
var formattingDayPeriodValues = {
  narrow: {
    am: "\u4E0A",
    pm: "\u4E0B",
    midnight: "\u51CC\u6668",
    noon: "\u5348",
    morning: "\u65E9",
    afternoon: "\u4E0B\u5348",
    evening: "\u665A",
    night: "\u591C"
  },
  abbreviated: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  },
  wide: {
    am: "\u4E0A\u5348",
    pm: "\u4E0B\u5348",
    midnight: "\u51CC\u6668",
    noon: "\u4E2D\u5348",
    morning: "\u65E9\u6668",
    afternoon: "\u4E2D\u5348",
    evening: "\u665A\u4E0A",
    night: "\u591C\u95F4"
  }
};
var ordinalNumber = function ordinalNumber2(dirtyNumber, options) {
  var number = Number(dirtyNumber);
  switch (options === null || options === void 0 ? void 0 : options.unit) {
    case "date":
      return number.toString() + "\u65E5";
    case "hour":
      return number.toString() + "\u65F6";
    case "minute":
      return number.toString() + "\u5206";
    case "second":
      return number.toString() + "\u79D2";
    default:
      return "\u7B2C " + number.toString();
  }
};
var localize = {
  ordinalNumber,
  era: buildLocalizeFn({
    values: eraValues,
    defaultWidth: "wide"
  }),
  quarter: buildLocalizeFn({
    values: quarterValues,
    defaultWidth: "wide",
    argumentCallback: function argumentCallback(quarter) {
      return quarter - 1;
    }
  }),
  month: buildLocalizeFn({
    values: monthValues,
    defaultWidth: "wide"
  }),
  day: buildLocalizeFn({
    values: dayValues,
    defaultWidth: "wide"
  }),
  dayPeriod: buildLocalizeFn({
    values: dayPeriodValues,
    defaultWidth: "wide",
    formattingValues: formattingDayPeriodValues,
    defaultFormattingWidth: "wide"
  })
};
var localize_default = localize;

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/zh-CN/_lib/match/index.js
var matchOrdinalNumberPattern = /^(第\s*)?\d+(日|时|分|秒)?/i;
var parseOrdinalNumberPattern = /\d+/i;
var matchEraPatterns = {
  narrow: /^(前)/i,
  abbreviated: /^(前)/i,
  wide: /^(公元前|公元)/i
};
var parseEraPatterns = {
  any: [/^(前)/i, /^(公元)/i]
};
var matchQuarterPatterns = {
  narrow: /^[1234]/i,
  abbreviated: /^第[一二三四]刻/i,
  wide: /^第[一二三四]刻钟/i
};
var parseQuarterPatterns = {
  any: [/(1|一)/i, /(2|二)/i, /(3|三)/i, /(4|四)/i]
};
var matchMonthPatterns = {
  narrow: /^(一|二|三|四|五|六|七|八|九|十[二一])/i,
  abbreviated: /^(一|二|三|四|五|六|七|八|九|十[二一]|\d|1[12])月/i,
  wide: /^(一|二|三|四|五|六|七|八|九|十[二一])月/i
};
var parseMonthPatterns = {
  narrow: [/^一/i, /^二/i, /^三/i, /^四/i, /^五/i, /^六/i, /^七/i, /^八/i, /^九/i, /^十(?!(一|二))/i, /^十一/i, /^十二/i],
  any: [/^一|1/i, /^二|2/i, /^三|3/i, /^四|4/i, /^五|5/i, /^六|6/i, /^七|7/i, /^八|8/i, /^九|9/i, /^十(?!(一|二))|10/i, /^十一|11/i, /^十二|12/i]
};
var matchDayPatterns = {
  narrow: /^[一二三四五六日]/i,
  short: /^[一二三四五六日]/i,
  abbreviated: /^周[一二三四五六日]/i,
  wide: /^星期[一二三四五六日]/i
};
var parseDayPatterns = {
  any: [/日/i, /一/i, /二/i, /三/i, /四/i, /五/i, /六/i]
};
var matchDayPeriodPatterns = {
  any: /^(上午?|下午?|午夜|[中正]午|早上?|下午|晚上?|凌晨|)/i
};
var parseDayPeriodPatterns = {
  any: {
    am: /^上午?/i,
    pm: /^下午?/i,
    midnight: /^午夜/i,
    noon: /^[中正]午/i,
    morning: /^早上/i,
    afternoon: /^下午/i,
    evening: /^晚上?/i,
    night: /^凌晨/i
  }
};
var match = {
  ordinalNumber: buildMatchPatternFn({
    matchPattern: matchOrdinalNumberPattern,
    parsePattern: parseOrdinalNumberPattern,
    valueCallback: function valueCallback(value) {
      return parseInt(value, 10);
    }
  }),
  era: buildMatchFn({
    matchPatterns: matchEraPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseEraPatterns,
    defaultParseWidth: "any"
  }),
  quarter: buildMatchFn({
    matchPatterns: matchQuarterPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseQuarterPatterns,
    defaultParseWidth: "any",
    valueCallback: function valueCallback2(index) {
      return index + 1;
    }
  }),
  month: buildMatchFn({
    matchPatterns: matchMonthPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseMonthPatterns,
    defaultParseWidth: "any"
  }),
  day: buildMatchFn({
    matchPatterns: matchDayPatterns,
    defaultMatchWidth: "wide",
    parsePatterns: parseDayPatterns,
    defaultParseWidth: "any"
  }),
  dayPeriod: buildMatchFn({
    matchPatterns: matchDayPeriodPatterns,
    defaultMatchWidth: "any",
    parsePatterns: parseDayPeriodPatterns,
    defaultParseWidth: "any"
  })
};
var match_default = match;

// node_modules/.pnpm/date-fns@2.30.0/node_modules/date-fns/esm/locale/zh-CN/index.js
var locale = {
  code: "zh-CN",
  formatDistance: formatDistance_default,
  formatLong: formatLong_default,
  formatRelative: formatRelative_default,
  localize: localize_default,
  match: match_default,
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 4
  }
};
var zh_CN_default = locale;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/locale/source/zh_CN.js
var local = {
  code: "zh-CN",
  dateFnsLocale: zh_CN_default,
  Pagination: {
    pageSize: "\u6BCF\u9875\u6761\u6570\uFF1A${pageSize}",
    total: "\u603B\u9875\u6570\uFF1A${total}",
    jumpTo: "\u8DF3\u81F3",
    page: "\u9875"
  },
  Modal: {
    confirm: "\u786E\u5B9A",
    cancel: "\u53D6\u6D88"
  },
  Tabs: {
    more: "\u66F4\u591A"
  },
  TimePicker: {
    placeholder: {
      time: "\u8BF7\u9009\u62E9\u65F6\u95F4",
      timeRange: "\u8BF7\u9009\u62E9\u65F6\u95F4\u8303\u56F4"
    },
    begin: "\u5F00\u59CB\u65F6\u95F4",
    end: "\u7ED3\u675F\u65F6\u95F4",
    hour: "\u65F6",
    minute: "\u5206",
    second: "\u79D2",
    AM: "\u4E0A\u5348",
    PM: "\u4E0B\u5348"
  },
  DatePicker: {
    placeholder: {
      date: "\u8BF7\u9009\u62E9\u65E5\u671F",
      dateTime: "\u8BF7\u9009\u62E9\u65E5\u671F\u53CA\u65F6\u95F4",
      dateRange: ["\u5F00\u59CB\u65E5\u671F", "\u7ED3\u675F\u65E5\u671F"],
      dateTimeRange: ["\u5F00\u59CB\u65E5\u671F", "\u7ED3\u675F\u65E5\u671F"],
      monthRange: ["\u5F00\u59CB\u6708\u4EFD", "\u7ED3\u675F\u6708\u4EFD"]
    },
    presets: "\u5FEB\u6377\u9009\u62E9",
    footer: {
      confirm: "\u786E\u5B9A",
      cancel: "\u53D6\u6D88"
    },
    selectDate: "\u8FD4\u56DE\u9009\u62E9\u65E5\u671F",
    selectTime: "\u9009\u62E9\u65F6\u95F4",
    year: "\u5E74",
    month: "\u6708",
    day: "\u65E5",
    monthText: "${year}\u5E74 ${month}",
    months: {
      1: "1\u6708",
      2: "2\u6708",
      3: "3\u6708",
      4: "4\u6708",
      5: "5\u6708",
      6: "6\u6708",
      7: "7\u6708",
      8: "8\u6708",
      9: "9\u6708",
      10: "10\u6708",
      11: "11\u6708",
      12: "12\u6708"
    },
    // timepicker scrollwheel里只需要展示[1、2……]，所以这里的fullMonths根据UI定制了
    fullMonths: {
      1: "1",
      2: "2",
      3: "3",
      4: "4",
      5: "5",
      6: "6",
      7: "7",
      8: "8",
      9: "9",
      10: "10",
      11: "11",
      12: "12"
    },
    weeks: {
      Mon: "\u4E00",
      Tue: "\u4E8C",
      Wed: "\u4E09",
      Thu: "\u56DB",
      Fri: "\u4E94",
      Sat: "\u516D",
      Sun: "\u65E5"
    },
    localeFormatToken: {
      FORMAT_SWITCH_DATE: "yyyy-MM-dd"
    }
  },
  Navigation: {
    collapseText: "\u6536\u8D77\u4FA7\u8FB9\u680F",
    expandText: "\u5C55\u5F00\u4FA7\u8FB9\u680F"
  },
  Popconfirm: {
    confirm: "\u786E\u5B9A",
    cancel: "\u53D6\u6D88"
  },
  Table: {
    emptyText: "\u6682\u65E0\u6570\u636E",
    pageText: "\u663E\u793A\u7B2C ${currentStart} \u6761-\u7B2C ${currentEnd} \u6761\uFF0C\u5171 ${total} \u6761",
    descend: "\u70B9\u51FB\u964D\u5E8F",
    ascend: "\u70B9\u51FB\u5347\u5E8F",
    cancelSort: "\u53D6\u6D88\u6392\u5E8F"
  },
  Select: {
    emptyText: "\u6682\u65E0\u6570\u636E",
    createText: "\u521B\u5EFA"
  },
  Cascader: {
    emptyText: "\u6682\u65E0\u6570\u636E"
  },
  Tree: {
    emptyText: "\u6682\u65E0\u6570\u636E",
    searchPlaceholder: "\u641C\u7D22"
  },
  List: {
    emptyText: "\u6682\u65E0\u6570\u636E"
  },
  Calendar: {
    allDay: "\u5168\u5929",
    AM: "\u4E0A\u5348${time}\u65F6",
    PM: "\u4E0B\u5348${time}\u65F6",
    datestring: "\u65E5",
    remaining: "\u8FD8\u6709${remained}\u9879"
  },
  Upload: {
    mainText: "\u70B9\u51FB\u4E0A\u4F20\u6587\u4EF6\u6216\u62D6\u62FD\u6587\u4EF6\u5230\u8FD9\u91CC",
    illegalTips: "\u4E0D\u652F\u6301\u6B64\u7C7B\u578B\u6587\u4EF6",
    legalTips: "\u677E\u624B\u5F00\u59CB\u4E0A\u4F20",
    retry: "\u91CD\u8BD5",
    replace: "\u66FF\u6362\u6587\u4EF6",
    clear: "\u6E05\u7A7A",
    selectedFiles: "\u5DF2\u9009\u62E9\u6587\u4EF6",
    illegalSize: "\u6587\u4EF6\u5C3A\u5BF8\u4E0D\u5408\u6CD5",
    fail: "\u4E0A\u4F20\u5931\u8D25"
  },
  TreeSelect: {
    searchPlaceholder: "\u641C\u7D22"
  },
  Typography: {
    copy: "\u590D\u5236",
    copied: "\u590D\u5236\u6210\u529F",
    expand: "\u5C55\u5F00",
    collapse: "\u6536\u8D77"
  },
  Transfer: {
    emptyLeft: "\u6682\u65E0\u6570\u636E",
    emptySearch: "\u65E0\u641C\u7D22\u7ED3\u679C",
    emptyRight: "\u6682\u65E0\u5185\u5BB9\uFF0C\u53EF\u4ECE\u5DE6\u4FA7\u52FE\u9009",
    placeholder: "\u641C\u7D22",
    clear: "\u6E05\u7A7A",
    selectAll: "\u5168\u9009",
    clearSelectAll: "\u53D6\u6D88\u5168\u9009",
    total: "\u603B\u4E2A\u6570\uFF1A${total}",
    selected: "\u5DF2\u9009\u4E2A\u6570\uFF1A${total}"
  },
  Form: {
    optional: "\uFF08\u53EF\u9009\uFF09"
  },
  Image: {
    preview: "\u9884\u89C8",
    loading: "\u52A0\u8F7D\u4E2D",
    loadError: "\u52A0\u8F7D\u5931\u8D25",
    prevTip: "\u4E0A\u4E00\u5F20",
    nextTip: "\u4E0B\u4E00\u5F20",
    zoomInTip: "\u653E\u5927",
    zoomOutTip: "\u7F29\u5C0F",
    rotateTip: "\u65CB\u8F6C",
    downloadTip: "\u4E0B\u8F7D",
    adaptiveTip: "\u9002\u5E94\u9875\u9762",
    originTip: "\u539F\u59CB\u5C3A\u5BF8"
  },
  Chat: {
    deleteConfirm: "\u786E\u8BA4\u5220\u9664\u8BE5\u4F1A\u8BDD\u5417\uFF1F",
    clearContext: "\u4E0A\u4E0B\u6587\u5DF2\u6E05\u9664",
    copySuccess: "\u590D\u5236\u6210\u529F",
    stop: "\u505C\u6B62",
    copy: "\u590D\u5236",
    copied: "\u590D\u5236\u6210\u529F",
    dropAreaText: "\u5C06\u6587\u4EF6\u653E\u5230\u8FD9\u91CC"
  }
};
var zh_CN_default2 = local;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/locale/localeConsumer.js
var LocaleConsumer = class extends import_react13.Component {
  renderChildren(localeData, children) {
    const {
      componentName
    } = this.props;
    let locale2 = localeData;
    if (!(localeData === null || localeData === void 0 ? void 0 : localeData.code)) {
      locale2 = zh_CN_default2;
    }
    const defaultFnsLocale = (0, import_get6.default)(zh_CN_default2, "dateFnsLocale");
    const dateFnsLocale = (0, import_get6.default)(locale2, "dateFnsLocale", defaultFnsLocale);
    return children(locale2[componentName], locale2.code, dateFnsLocale);
  }
  render() {
    const {
      children
    } = this.props;
    return /* @__PURE__ */ import_react13.default.createElement(context_default.Consumer, null, (_ref) => {
      let {
        locale: locale2
      } = _ref;
      return /* @__PURE__ */ import_react13.default.createElement(context_default2.Consumer, null, (localeData) => this.renderChildren(locale2 || localeData, children));
    });
  }
};
LocaleConsumer.propTypes = {
  componentName: import_prop_types5.default.string.isRequired,
  children: import_prop_types5.default.any
};
LocaleConsumer.defaultProps = {
  componentName: ""
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/isEnterPress.js
var import_get7 = __toESM(require_get());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/keyCode.js
var ENTER_KEY = "Enter";

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/isEnterPress.js
function isEnterPress(e) {
  return (0, import_get7.default)(e, "key") === ENTER_KEY ? true : false;
}
var isEnterPress_default = isEnterPress;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/copyable.js
var prefixCls2 = cssClasses.PREFIX;
var Copyable = class extends import_react14.default.PureComponent {
  constructor(props) {
    super(props);
    this.copy = (e) => {
      const {
        content,
        duration: duration2,
        onCopy
      } = this.props;
      const res = (0, import_copy_text_to_clipboard.default)(content);
      onCopy && onCopy(e, content, res);
      this.setCopied(content, duration2);
    };
    this.setCopied = (item, timer) => {
      this.setState({
        copied: true,
        item
      });
      this._timeId = setTimeout(() => {
        this.resetCopied();
      }, timer * 1e3);
    };
    this.resetCopied = () => {
      if (this._timeId) {
        clearTimeout(this._timeId);
        this._timeId = null;
        this.setState({
          copied: false,
          item: ""
        });
      }
    };
    this.renderSuccessTip = () => {
      const {
        successTip
      } = this.props;
      if (typeof successTip !== "undefined") {
        return successTip;
      }
      return /* @__PURE__ */ import_react14.default.createElement(LocaleConsumer, {
        componentName: "Typography"
      }, (locale2) => /* @__PURE__ */ import_react14.default.createElement("span", null, /* @__PURE__ */ import_react14.default.createElement(IconTick_default, null), locale2.copied));
    };
    this.renderCopyIcon = () => {
      const {
        icon
      } = this.props;
      const copyProps = {
        role: "button",
        tabIndex: 0,
        onClick: this.copy,
        onKeyPress: (e) => isEnterPress_default(e) && this.copy(e)
      };
      {
      }
      const defaultIcon = (
        // eslint-disable-next-line jsx-a11y/anchor-is-valid
        /* @__PURE__ */ import_react14.default.createElement("a", {
          className: `${prefixCls2}-action-copy-icon`
        }, /* @__PURE__ */ import_react14.default.createElement(IconCopy_default, Object.assign({
          onClick: this.copy
        }, copyProps)))
      );
      return /* @__PURE__ */ import_react14.default.isValidElement(icon) ? /* @__PURE__ */ import_react14.default.cloneElement(icon, copyProps) : defaultIcon;
    };
    this.state = {
      copied: false,
      item: ""
    };
  }
  componentWillUnmount() {
    if (this._timeId) {
      clearTimeout(this._timeId);
      this._timeId = null;
    }
  }
  render() {
    const {
      style,
      className,
      forwardRef,
      copyTip,
      render
    } = this.props;
    const {
      copied
    } = this.state;
    const finalCls = (0, import_classnames5.default)(className, {
      [`${prefixCls2}-action-copy`]: !copied,
      [`${prefixCls2}-action-copied`]: copied
    });
    if (render) {
      return render(copied, this.copy, this.props);
    }
    return /* @__PURE__ */ import_react14.default.createElement(LocaleConsumer, {
      componentName: "Typography"
    }, (locale2) => /* @__PURE__ */ import_react14.default.createElement("span", {
      style: Object.assign({
        marginLeft: "4px"
      }, style),
      className: finalCls,
      ref: forwardRef
    }, copied ? this.renderSuccessTip() : /* @__PURE__ */ import_react14.default.createElement(Tooltip2, {
      content: typeof copyTip !== "undefined" ? copyTip : locale2.copy
    }, this.renderCopyIcon())));
  }
};
Copyable.propTypes = {
  content: import_prop_types6.default.string,
  onCopy: import_prop_types6.default.func,
  successTip: import_prop_types6.default.node,
  copyTip: import_prop_types6.default.node,
  duration: import_prop_types6.default.number,
  style: import_prop_types6.default.object,
  className: import_prop_types6.default.string,
  icon: import_prop_types6.default.node
};
Copyable.defaultProps = {
  content: "",
  onCopy: noop,
  duration: 3,
  style: {},
  className: ""
};
var copyable_default = Copyable;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/popover/index.js
var import_noop3 = __toESM(require_noop());
var import_isFunction2 = __toESM(require_isFunction());
var import_react16 = __toESM(require_react());
var import_classnames7 = __toESM(require_classnames());
var import_prop_types8 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/popover/constants.js
var cssClasses3 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-popover`,
  ARROW: `${BASE_CLASS_PREFIX2}-popover-icon-arrow`
};
var strings3 = {
  POSITION_SET: ["top", "topLeft", "topRight", "left", "leftTop", "leftBottom", "right", "rightTop", "rightBottom", "bottom", "bottomLeft", "bottomRight", "leftTopOver", "rightTopOver"],
  TRIGGER_SET: ["hover", "focus", "click", "custom", "contextMenu"],
  DEFAULT_ARROW_STYLE: {
    borderOpacity: "1",
    backgroundColor: "var(--semi-color-bg-3)",
    // borderColor: 'var(--semi-color-shadow)',
    borderColor: "var(--semi-color-border)"
  }
};
var numbers2 = {
  ARROW_BOUNDING: Object.assign(Object.assign({}, numbers.ARROW_BOUNDING), {
    offsetY: 6,
    offsetX: 0,
    height: 8
  }),
  SPACING: 4,
  SPACING_WITH_ARROW: 10,
  DEFAULT_Z_INDEX: 1030
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/popover/Arrow.js
var import_get8 = __toESM(require_get());
var import_react15 = __toESM(require_react());
var import_prop_types7 = __toESM(require_prop_types());
var import_classnames6 = __toESM(require_classnames());
var __rest6 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var Arrow = function() {
  let props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  const {
    position = "",
    className,
    arrowStyle,
    popStyle
  } = props, rest = __rest6(props, ["position", "className", "arrowStyle", "popStyle"]);
  const isVertical = position.indexOf("top") === 0 || position.indexOf("bottom") === 0;
  const cls32 = (0, import_classnames6.default)(className, cssClasses3.ARROW);
  const borderOpacity = (0, import_get8.default)(arrowStyle, "borderOpacity", strings3.DEFAULT_ARROW_STYLE.borderOpacity);
  const bgColor = (0, import_get8.default)(arrowStyle, "backgroundColor", (0, import_get8.default)(popStyle, "backgroundColor", strings3.DEFAULT_ARROW_STYLE.backgroundColor));
  const borderColor = (0, import_get8.default)(arrowStyle, "borderColor", (0, import_get8.default)(popStyle, "borderColor", strings3.DEFAULT_ARROW_STYLE.borderColor));
  const wrapProps = Object.assign(Object.assign({}, rest), {
    width: numbers2.ARROW_BOUNDING.width,
    height: numbers2.ARROW_BOUNDING.height,
    xmlns: "http://www.w3.org/2000/svg",
    className: cls32
  });
  return isVertical ? /* @__PURE__ */ import_react15.default.createElement("svg", Object.assign({}, wrapProps), /* @__PURE__ */ import_react15.default.createElement("path", {
    d: "M0 0.5L0 1.5C4 1.5, 5.5 3, 7.5 5S10,8 12,8S14.5 7, 16.5 5S20,1.5 24,1.5L24 0.5L0 0.5z",
    fill: borderColor,
    opacity: borderOpacity
  }), /* @__PURE__ */ import_react15.default.createElement("path", {
    d: "M0 0L0 1C4 1, 5.5 2, 7.5 4S10,7 12,7S14.5  6, 16.5 4S20,1 24,1L24 0L0 0z",
    fill: bgColor
  })) : /* @__PURE__ */ import_react15.default.createElement("svg", Object.assign({}, wrapProps), /* @__PURE__ */ import_react15.default.createElement("path", {
    d: "M0.5 0L1.5 0C1.5 4, 3 5.5, 5 7.5S8,10 8,12S7 14.5, 5 16.5S1.5,20 1.5,24L0.5 24L0.5 0z",
    fill: borderColor,
    opacity: borderOpacity
  }), /* @__PURE__ */ import_react15.default.createElement("path", {
    d: "M0 0L1 0C1 4, 2 5.5, 4 7.5S7,10 7,12S6 14.5, 4 16.5S1,20 1,24L0 24L0 0z",
    fill: bgColor
  }));
};
Arrow.propTypes = {
  position: import_prop_types7.default.string,
  className: import_prop_types7.default.string,
  arrowStyle: import_prop_types7.default.object,
  popStyle: import_prop_types7.default.object
};
var Arrow_default = Arrow;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/popover/index.js
var __rest7 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var positionSet2 = strings3.POSITION_SET;
var triggerSet2 = strings3.TRIGGER_SET;
var Popover = class extends import_react16.default.PureComponent {
  constructor(props) {
    super(props);
    this.focusTrigger = () => {
      var _a;
      (_a = this.tooltipRef.current) === null || _a === void 0 ? void 0 : _a.focusTrigger();
    };
    this.renderPopCard = (_ref) => {
      let {
        initialFocusRef
      } = _ref;
      const {
        content,
        contentClassName,
        prefixCls: prefixCls17
      } = this.props;
      const {
        direction
      } = this.context;
      const popCardCls = (0, import_classnames7.default)(prefixCls17, contentClassName, {
        [`${prefixCls17}-rtl`]: direction === "rtl"
      });
      const contentNode = this.renderContentNode({
        initialFocusRef,
        content
      });
      return /* @__PURE__ */ import_react16.default.createElement("div", {
        className: popCardCls
      }, /* @__PURE__ */ import_react16.default.createElement("div", {
        className: `${prefixCls17}-content`
      }, contentNode));
    };
    this.renderContentNode = (props2) => {
      const {
        initialFocusRef,
        content
      } = props2;
      const contentProps = {
        initialFocusRef
      };
      return !(0, import_isFunction2.default)(content) ? content : content(contentProps);
    };
    this.tooltipRef = /* @__PURE__ */ import_react16.default.createRef();
  }
  render() {
    const _a = this.props, {
      children,
      prefixCls: prefixCls17,
      showArrow,
      arrowStyle = {},
      arrowBounding,
      position,
      style,
      trigger
    } = _a, attr = __rest7(_a, ["children", "prefixCls", "showArrow", "arrowStyle", "arrowBounding", "position", "style", "trigger"]);
    let {
      spacing
    } = this.props;
    const arrowProps = {
      position,
      className: "",
      popStyle: style,
      arrowStyle
    };
    const arrow = showArrow ? /* @__PURE__ */ import_react16.default.createElement(Arrow_default, Object.assign({}, arrowProps)) : false;
    if (isNullOrUndefined(spacing)) {
      spacing = showArrow ? numbers2.SPACING_WITH_ARROW : numbers2.SPACING;
    }
    const role = trigger === "click" || trigger === "custom" ? "dialog" : "tooltip";
    return /* @__PURE__ */ import_react16.default.createElement(Tooltip2, Object.assign({
      guardFocus: true,
      ref: this.tooltipRef
    }, attr, {
      trigger,
      position,
      style,
      content: this.renderPopCard,
      prefixCls: prefixCls17,
      spacing,
      showArrow: arrow,
      arrowBounding,
      role
    }), children);
  }
};
Popover.contextType = context_default;
Popover.propTypes = {
  children: import_prop_types8.default.node,
  content: import_prop_types8.default.oneOfType([import_prop_types8.default.node, import_prop_types8.default.func]),
  visible: import_prop_types8.default.bool,
  autoAdjustOverflow: import_prop_types8.default.bool,
  motion: import_prop_types8.default.bool,
  position: import_prop_types8.default.oneOf(positionSet2),
  // getPopupContainer: PropTypes.func,
  margin: import_prop_types8.default.oneOfType([import_prop_types8.default.number, import_prop_types8.default.object]),
  mouseEnterDelay: import_prop_types8.default.number,
  mouseLeaveDelay: import_prop_types8.default.number,
  trigger: import_prop_types8.default.oneOf(triggerSet2).isRequired,
  contentClassName: import_prop_types8.default.oneOfType([import_prop_types8.default.string, import_prop_types8.default.array]),
  onVisibleChange: import_prop_types8.default.func,
  onClickOutSide: import_prop_types8.default.func,
  style: import_prop_types8.default.object,
  spacing: import_prop_types8.default.oneOfType([import_prop_types8.default.number, import_prop_types8.default.object]),
  zIndex: import_prop_types8.default.number,
  showArrow: import_prop_types8.default.bool,
  arrowStyle: import_prop_types8.default.shape({
    borderColor: import_prop_types8.default.string,
    backgroundColor: import_prop_types8.default.string,
    borderOpacity: import_prop_types8.default.oneOfType([import_prop_types8.default.string, import_prop_types8.default.number])
  }),
  arrowPointAtCenter: import_prop_types8.default.bool,
  arrowBounding: import_prop_types8.default.object,
  prefixCls: import_prop_types8.default.string,
  guardFocus: import_prop_types8.default.bool,
  disableArrowKeyDown: import_prop_types8.default.bool
};
Popover.__SemiComponentName__ = "Popover";
Popover.defaultProps = getDefaultPropsFromGlobalConfig(Popover.__SemiComponentName__, {
  arrowBounding: numbers2.ARROW_BOUNDING,
  showArrow: false,
  autoAdjustOverflow: true,
  zIndex: numbers2.DEFAULT_Z_INDEX,
  motion: true,
  trigger: "hover",
  cancelText: "No",
  okText: "Yes",
  position: "bottom",
  prefixCls: cssClasses3.PREFIX,
  onClickOutSide: import_noop3.default,
  onEscKeyDown: import_noop3.default,
  closeOnEsc: true,
  returnFocusOnClose: true,
  guardFocus: true,
  disableFocusListener: true
});
var popover_default = Popover;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/util.js
var import_omit2 = __toESM(require_omit());
var import_react_dom3 = __toESM(require_react_dom());
var import_react17 = __toESM(require_react());
var ellipsisContainer;
function pxToNumber(value) {
  if (!value) {
    return 0;
  }
  const match2 = value.match(/^\d*(\.\d*)?/);
  return match2 ? Number(match2[0]) : 0;
}
function styleToString(style) {
  const styleNames = Array.prototype.slice.apply(style);
  return styleNames.map((name) => `${name}: ${style.getPropertyValue(name)};`).join("");
}
var getRenderText = function(originEle, rows) {
  let content = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : "";
  let fixedContent = arguments.length > 3 ? arguments[3] : void 0;
  let ellipsisStr = arguments.length > 4 ? arguments[4] : void 0;
  let suffix = arguments.length > 5 ? arguments[5] : void 0;
  let ellipsisPos = arguments.length > 6 ? arguments[6] : void 0;
  if (content.length === 0) {
    return "";
  }
  if (!ellipsisContainer) {
    ellipsisContainer = document.createElement("div");
    ellipsisContainer.setAttribute("aria-hidden", "true");
    document.body.appendChild(ellipsisContainer);
  }
  const originStyle = window.getComputedStyle(originEle);
  const originCSS = styleToString(originStyle);
  const lineHeight = pxToNumber(originStyle.lineHeight);
  const maxHeight = Math.round(lineHeight * (rows + 1) + pxToNumber(originStyle.paddingTop) + pxToNumber(originStyle.paddingBottom));
  ellipsisContainer.setAttribute("style", originCSS);
  ellipsisContainer.style.position = "fixed";
  ellipsisContainer.style.left = "0";
  ellipsisContainer.style.height = "auto";
  ellipsisContainer.style.top = "-999999px";
  ellipsisContainer.style.zIndex = "-1000";
  ellipsisContainer.style.textOverflow = "clip";
  ellipsisContainer.style.webkitLineClamp = "none";
  import_react_dom3.default.render(/* @__PURE__ */ import_react17.default.createElement(import_react17.default.Fragment, null), ellipsisContainer);
  function inRange() {
    const widthInRange = ellipsisContainer.scrollWidth <= ellipsisContainer.offsetWidth;
    const heightInRange = ellipsisContainer.scrollHeight < maxHeight;
    return rows === 1 ? widthInRange && heightInRange : heightInRange;
  }
  const ellipsisContentHolder = document.createElement("span");
  const textNode = document.createTextNode(content);
  ellipsisContentHolder.appendChild(textNode);
  if (suffix.length > 0) {
    const ellipsisTextNode = document.createTextNode(suffix);
    ellipsisContentHolder.appendChild(ellipsisTextNode);
  }
  ellipsisContainer.appendChild(ellipsisContentHolder);
  Object.values((0, import_omit2.default)(fixedContent, "expand")).map((node) => node && ellipsisContainer.appendChild(node.cloneNode(true)));
  function appendExpandNode() {
    ellipsisContainer.innerHTML = "";
    ellipsisContainer.appendChild(ellipsisContentHolder);
    Object.values(fixedContent).map((node) => node && ellipsisContainer.appendChild(node.cloneNode(true)));
  }
  function getCurrentText(text, pos) {
    const end = text.length;
    if (!pos) {
      return ellipsisStr;
    }
    if (ellipsisPos === "end") {
      return text.slice(0, pos) + ellipsisStr;
    }
    return text.slice(0, pos) + ellipsisStr + text.slice(end - pos, end);
  }
  function measureText(textNode2, fullText) {
    let startLoc = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : 0;
    let endLoc = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : fullText.length;
    let lastSuccessLoc = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
    const midLoc = Math.floor((startLoc + endLoc) / 2);
    const currentText = getCurrentText(fullText, midLoc);
    textNode2.textContent = currentText;
    if (startLoc >= endLoc - 1 && endLoc > 0) {
      for (let step = endLoc; step >= startLoc; step -= 1) {
        const currentStepText = getCurrentText(fullText, step);
        textNode2.textContent = currentStepText;
        if (inRange()) {
          return currentStepText;
        }
      }
    } else if (endLoc === 0) {
      return ellipsisStr;
    }
    if (inRange()) {
      return measureText(textNode2, fullText, midLoc, endLoc, midLoc);
    }
    return measureText(textNode2, fullText, startLoc, midLoc, lastSuccessLoc);
  }
  let resText = content;
  if (!inRange()) {
    appendExpandNode();
    resText = measureText(textNode, content, 0, ellipsisPos === "middle" ? Math.floor(content.length / 2) : content.length);
  }
  ellipsisContainer.innerHTML = "";
  return resText;
};
var util_default = getRenderText;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/context.js
var import_react18 = __toESM(require_react());
var SizeContext = /* @__PURE__ */ import_react18.default.createContext("normal");
var context_default3 = SizeContext;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/resizeObserver/index.js
var import_react19 = __toESM(require_react());
var import_react_dom4 = __toESM(require_react_dom());
var import_prop_types9 = __toESM(require_prop_types());
var ObserverProperty;
(function(ObserverProperty2) {
  ObserverProperty2["Width"] = "width";
  ObserverProperty2["Height"] = "height";
  ObserverProperty2["All"] = "all";
})(ObserverProperty || (ObserverProperty = {}));
var ReactResizeObserver = class extends BaseComponent {
  constructor(props) {
    var _this;
    super(props);
    _this = this;
    this.formerPropertyValue = /* @__PURE__ */ new Map();
    this.getElement = () => {
      try {
        return (0, import_react_dom4.findDOMNode)(this.childNode || this);
      } catch (error) {
        return null;
      }
    };
    this.handleResizeEventTriggered = (entries) => {
      var _a, _b, _c2, _d;
      if (this.props.observerProperty === ObserverProperty.All) {
        (_b = (_a = this.props).onResize) === null || _b === void 0 ? void 0 : _b.call(_a, entries);
      } else {
        const finalEntries = [];
        for (const entry of entries) {
          if (this.formerPropertyValue.has(entry.target)) {
            if (entry.contentRect[this.props.observerProperty] !== this.formerPropertyValue.get(entry.target)) {
              this.formerPropertyValue.set(entry.target, entry.contentRect[this.props.observerProperty]);
              finalEntries.push(entry);
            }
          } else {
            this.formerPropertyValue.set(entry.target, entry.contentRect[this.props.observerProperty]);
            finalEntries.push(entry);
          }
        }
        if (finalEntries.length > 0) {
          (_d = (_c2 = this.props).onResize) === null || _d === void 0 ? void 0 : _d.call(_c2, finalEntries);
        }
      }
    };
    this.observeElement = function() {
      let force = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
      const element = _this.getElement();
      if (!_this.observer) {
        _this.observer = new ResizeObserver(_this.handleResizeEventTriggered);
      }
      if (!(element && element instanceof Element)) {
        _this.observer.disconnect();
        return;
      }
      if (element === _this.element && !force) {
        return;
      } else {
        _this.observer.disconnect();
        _this.element = element;
      }
      _this.observer.observe(element);
      if (_this.props.observeParent && element.parentNode && element.parentNode.ownerDocument && element.parentNode.ownerDocument.defaultView && element.parentNode instanceof element.parentNode.ownerDocument.defaultView.HTMLElement) {
        _this._parentNode = element.parentNode;
        _this.observer.observe(_this._parentNode);
      }
    };
    this.mergeRef = (ref2, node) => {
      this.childNode = node;
      if (typeof ref2 === "function") {
        ref2(node);
      } else if (typeof ref2 === "object" && ref2 && "current" in ref2) {
        ref2.current = node;
      }
    };
    if (globalThis["ResizeObserver"]) {
      this.observer = new ResizeObserver(this.handleResizeEventTriggered);
    }
  }
  componentDidMount() {
    var _a;
    (_a = this.observeElement) === null || _a === void 0 ? void 0 : _a.call(this);
  }
  componentDidUpdate(prevProps) {
    var _a;
    (_a = this.observeElement) === null || _a === void 0 ? void 0 : _a.call(this, this.props.observeParent !== prevProps.observeParent);
  }
  componentWillUnmount() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
      this.element = null;
    }
  }
  render() {
    const child = import_react19.default.Children.only(this.props.children);
    const {
      ref: ref2
    } = child;
    return /* @__PURE__ */ import_react19.default.cloneElement(child, {
      ref: (node) => this.mergeRef(ref2, node)
    });
  }
};
ReactResizeObserver.propTypes = {
  onResize: import_prop_types9.default.func,
  observeParent: import_prop_types9.default.bool,
  observerProperty: import_prop_types9.default.string,
  delayTick: import_prop_types9.default.number
};
ReactResizeObserver.defaultProps = {
  onResize: () => {
  },
  observeParent: false,
  observerProperty: "all",
  delayTick: 0
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/base.js
var __awaiter2 = function(thisArg, _arguments, P, generator3) {
  function adopt(value) {
    return value instanceof P ? value : new P(function(resolve) {
      resolve(value);
    });
  }
  return new (P || (P = Promise))(function(resolve, reject) {
    function fulfilled(value) {
      try {
        step(generator3.next(value));
      } catch (e) {
        reject(e);
      }
    }
    function rejected(value) {
      try {
        step(generator3["throw"](value));
      } catch (e) {
        reject(e);
      }
    }
    function step(result) {
      result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
    }
    step((generator3 = generator3.apply(thisArg, _arguments || [])).next());
  });
};
var __rest8 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls3 = cssClasses.PREFIX;
var ELLIPSIS_STR = "...";
var wrapperDecorations = (props, content) => {
  const {
    mark,
    code,
    underline,
    strong,
    link,
    disabled
  } = props;
  let wrapped = content;
  const wrap = (isNeeded, tag) => {
    let wrapProps = {};
    if (!isNeeded) {
      return;
    }
    if (typeof isNeeded === "object") {
      wrapProps = Object.assign({}, isNeeded);
    }
    wrapped = /* @__PURE__ */ import_react20.default.createElement(tag, wrapProps, wrapped);
  };
  wrap(mark, "mark");
  wrap(code, "code");
  wrap(underline && !link, "u");
  wrap(strong, "strong");
  wrap(props.delete, "del");
  wrap(link, disabled ? "span" : "a");
  return wrapped;
};
var Base = class extends import_react20.Component {
  constructor(props) {
    super(props);
    this.observerTakingEffect = false;
    this.onResize = (entries) => __awaiter2(this, void 0, void 0, function* () {
      if (this.rafId) {
        window.cancelAnimationFrame(this.rafId);
      }
      return new Promise((resolve) => {
        this.rafId = window.requestAnimationFrame(() => __awaiter2(this, void 0, void 0, function* () {
          yield this.getEllipsisState();
          resolve();
        }));
      });
    });
    this.canUseCSSEllipsis = () => {
      const {
        copyable
      } = this.props;
      const {
        expandable,
        expandText,
        pos,
        suffix
      } = this.getEllipsisOpt();
      return !expandable && (0, import_isUndefined.default)(expandText) && !copyable && pos === "end" && !suffix.length;
    };
    this.shouldTruncated = (rows) => {
      if (!rows || rows < 1) {
        return false;
      }
      const updateOverflow = rows <= 1 ? this.compareSingleRow() : this.wrapperRef.current.scrollHeight > this.wrapperRef.current.offsetHeight;
      return updateOverflow;
    };
    this.compareSingleRow = () => {
      if (!(document && document.createRange)) {
        return false;
      }
      const containerNode = this.wrapperRef.current;
      const containerWidth = containerNode.getBoundingClientRect().width;
      const childNodes = Array.from(containerNode.childNodes);
      const range = document.createRange();
      const contentWidth = childNodes.reduce((acc, node) => {
        var _a;
        range.selectNodeContents(node);
        return acc + ((_a = range.getBoundingClientRect().width) !== null && _a !== void 0 ? _a : 0);
      }, 0);
      range.detach();
      return contentWidth > containerWidth;
    };
    this.showTooltip = () => {
      var _a, _b;
      const {
        isOverflowed,
        isTruncated,
        expanded
      } = this.state;
      const {
        showTooltip,
        expandable,
        expandText
      } = this.getEllipsisOpt();
      const canUseCSSEllipsis = this.canUseCSSEllipsis();
      const overflowed = !expanded && (canUseCSSEllipsis ? isOverflowed : isTruncated);
      const noExpandText = !expandable && (0, import_isUndefined.default)(expandText);
      const show = noExpandText && overflowed && showTooltip;
      if (!show) {
        return show;
      }
      const defaultOpts = {
        type: "tooltip"
      };
      if (typeof showTooltip === "object") {
        if (showTooltip.type && showTooltip.type.toLowerCase() === "popover") {
          return (0, import_merge.default)({
            opts: {
              // style: { width: '240px' },
              showArrow: true
            }
          }, showTooltip, {
            opts: {
              className: (0, import_classnames8.default)({
                [`${prefixCls3}-ellipsis-popover`]: true,
                [(_a = showTooltip === null || showTooltip === void 0 ? void 0 : showTooltip.opts) === null || _a === void 0 ? void 0 : _a.className]: Boolean((_b = showTooltip === null || showTooltip === void 0 ? void 0 : showTooltip.opts) === null || _b === void 0 ? void 0 : _b.className)
              })
            }
          });
        }
        return Object.assign(Object.assign({}, defaultOpts), showTooltip);
      }
      return defaultOpts;
    };
    this.onHover = () => {
      const canUseCSSEllipsis = this.canUseCSSEllipsis();
      if (canUseCSSEllipsis) {
        const {
          rows,
          suffix,
          pos
        } = this.getEllipsisOpt();
        const updateOverflow = this.shouldTruncated(rows);
        this.setState({
          isOverflowed: updateOverflow,
          isTruncated: false
        });
        return void 0;
      }
    };
    this.getEllipsisState = () => __awaiter2(this, void 0, void 0, function* () {
      const {
        rows,
        suffix,
        pos
      } = this.getEllipsisOpt();
      const {
        children
      } = this.props;
      if (!this.wrapperRef || !this.wrapperRef.current) {
        yield this.onResize();
        return;
      }
      const {
        expanded
      } = this.state;
      const canUseCSSEllipsis = this.canUseCSSEllipsis();
      if (canUseCSSEllipsis) {
        return;
      }
      if ((0, import_isNull.default)(children)) {
        return new Promise((resolve) => {
          this.setState({
            isTruncated: false,
            isOverflowed: false
          }, resolve);
        });
      }
      warning("children" in this.props && typeof children !== "string", "[Semi Typography] Only children with pure text could be used with ellipsis at this moment.");
      if (!rows || rows < 0 || expanded) {
        return;
      }
      const extraNode = {
        expand: this.expandRef.current,
        copy: this.copyRef && this.copyRef.current
      };
      const realChildren = Array.isArray(children) ? children.join("") : String(children);
      const content = util_default(this.wrapperRef.current, rows, realChildren, extraNode, ELLIPSIS_STR, suffix, pos);
      return new Promise((resolve) => {
        this.setState({
          isOverflowed: false,
          ellipsisContent: content,
          isTruncated: realChildren !== content
        }, resolve);
      });
    });
    this.toggleOverflow = (e) => {
      const {
        onExpand,
        expandable,
        collapsible
      } = this.getEllipsisOpt();
      const {
        expanded
      } = this.state;
      onExpand && onExpand(!expanded, e);
      if (expandable && !expanded || collapsible && expanded) {
        this.setState({
          expanded: !expanded
        });
      }
    };
    this.getEllipsisOpt = () => {
      const {
        ellipsis
      } = this.props;
      if (!ellipsis) {
        return {};
      }
      const opt = Object.assign({
        rows: 1,
        expandable: false,
        pos: "end",
        suffix: "",
        showTooltip: false,
        collapsible: false,
        expandText: ellipsis.expandable ? this.expandStr : void 0,
        collapseText: ellipsis.collapsible ? this.collapseStr : void 0
      }, typeof ellipsis === "object" ? ellipsis : null);
      return opt;
    };
    this.renderExpandable = () => {
      const {
        expanded,
        isTruncated
      } = this.state;
      if (!isTruncated)
        return null;
      const {
        expandText,
        expandable,
        collapseText,
        collapsible
      } = this.getEllipsisOpt();
      const noExpandText = !expandable && (0, import_isUndefined.default)(expandText);
      const noCollapseText = !collapsible && (0, import_isUndefined.default)(collapseText);
      let text;
      if (!expanded && !noExpandText) {
        text = expandText;
      } else if (expanded && !noCollapseText) {
        text = collapseText;
      }
      if (!noExpandText || !noCollapseText) {
        return (
          // TODO: replace `a` tag with `span` in next major version
          // NOTE: may have effect on style
          // eslint-disable-next-line jsx-a11y/anchor-is-valid
          /* @__PURE__ */ import_react20.default.createElement("a", {
            role: "button",
            tabIndex: 0,
            className: `${prefixCls3}-ellipsis-expand`,
            key: "expand",
            ref: this.expandRef,
            "aria-label": text,
            onClick: this.toggleOverflow,
            onKeyPress: (e) => isEnterPress_default(e) && this.toggleOverflow(e)
          }, text)
        );
      }
      return null;
    };
    this.getEllipsisStyle = () => {
      const {
        ellipsis,
        component
      } = this.props;
      if (!ellipsis) {
        return {
          ellipsisCls: "",
          ellipsisStyle: {}
          // ellipsisAttr: {}
        };
      }
      const {
        rows
      } = this.getEllipsisOpt();
      const {
        expanded
      } = this.state;
      const useCSS = !expanded && this.canUseCSSEllipsis();
      const ellipsisCls = (0, import_classnames8.default)({
        [`${prefixCls3}-ellipsis`]: true,
        [`${prefixCls3}-ellipsis-single-line`]: rows === 1,
        [`${prefixCls3}-ellipsis-multiple-line`]: rows > 1,
        // component === 'span', Text component, It should be externally displayed inline
        [`${prefixCls3}-ellipsis-multiple-line-text`]: rows > 1 && component === "span",
        [`${prefixCls3}-ellipsis-overflow-ellipsis`]: rows === 1 && useCSS,
        // component === 'span', Text component, It should be externally displayed inline
        [`${prefixCls3}-ellipsis-overflow-ellipsis-text`]: rows === 1 && useCSS && component === "span"
      });
      const ellipsisStyle = useCSS && rows > 1 ? {
        WebkitLineClamp: rows
      } : {};
      return {
        ellipsisCls,
        ellipsisStyle
      };
    };
    this.renderEllipsisText = (opt) => {
      const {
        suffix
      } = opt;
      const {
        children
      } = this.props;
      const {
        isTruncated,
        expanded,
        ellipsisContent
      } = this.state;
      if (expanded || !isTruncated) {
        return /* @__PURE__ */ import_react20.default.createElement("span", {
          onMouseEnter: this.onHover
        }, children, suffix && suffix.length ? suffix : null);
      }
      return /* @__PURE__ */ import_react20.default.createElement("span", {
        onMouseEnter: this.onHover
      }, ellipsisContent, suffix);
    };
    this.state = {
      editable: false,
      copied: false,
      // ellipsis
      // if text is overflow in container
      isOverflowed: false,
      ellipsisContent: props.children,
      expanded: false,
      // if text is truncated with js
      isTruncated: false,
      prevChildren: null
    };
    this.wrapperRef = /* @__PURE__ */ import_react20.default.createRef();
    this.expandRef = /* @__PURE__ */ import_react20.default.createRef();
    this.copyRef = /* @__PURE__ */ import_react20.default.createRef();
  }
  componentDidMount() {
    if (this.props.ellipsis) {
      this.onResize().then(() => runAfterTicks(() => this.observerTakingEffect = true, 1));
    }
  }
  static getDerivedStateFromProps(props, prevState) {
    const {
      prevChildren
    } = prevState;
    const newState = {};
    newState.prevChildren = props.children;
    if (props.ellipsis && prevChildren !== props.children) {
      newState.isOverflowed = false;
      newState.ellipsisContent = props.children;
      newState.expanded = false;
      newState.isTruncated = true;
    }
    return newState;
  }
  componentDidUpdate(prevProps) {
    if (this.props.children !== prevProps.children) {
      this.forceUpdate();
      if (this.props.ellipsis) {
        this.onResize();
      }
    }
  }
  componentWillUnmount() {
    if (this.rafId) {
      window.cancelAnimationFrame(this.rafId);
    }
  }
  renderOperations() {
    return /* @__PURE__ */ import_react20.default.createElement(import_react20.default.Fragment, null, this.renderExpandable(), this.renderCopy());
  }
  renderCopy() {
    var _a;
    const {
      copyable,
      children
    } = this.props;
    if (!copyable) {
      return null;
    }
    const willCopyContent = (_a = copyable === null || copyable === void 0 ? void 0 : copyable.content) !== null && _a !== void 0 ? _a : children;
    let copyContent;
    let hasObject = false;
    if (Array.isArray(willCopyContent)) {
      copyContent = "";
      willCopyContent.forEach((value) => {
        if (typeof value === "object") {
          hasObject = true;
        }
        copyContent += String(value);
      });
    } else if (typeof willCopyContent !== "object") {
      copyContent = String(willCopyContent);
    } else {
      hasObject = true;
      copyContent = String(willCopyContent);
    }
    warning(hasObject, "Content to be copied in Typography is a object, it will case a [object Object] mistake when copy to clipboard.");
    const copyConfig = Object.assign({
      content: copyContent,
      duration: 3
    }, typeof copyable === "object" ? copyable : null);
    return /* @__PURE__ */ import_react20.default.createElement(copyable_default, Object.assign({}, copyConfig, {
      forwardRef: this.copyRef
    }));
  }
  renderIcon() {
    const {
      icon,
      size
    } = this.props;
    const realSize = size === "inherit" ? this.context : size;
    if (!icon) {
      return null;
    }
    const iconSize = realSize === "small" ? "small" : "default";
    return /* @__PURE__ */ import_react20.default.createElement("span", {
      className: `${prefixCls3}-icon`,
      "x-semi-prop": "icon"
    }, isSemiIcon(icon) ? /* @__PURE__ */ import_react20.default.cloneElement(icon, {
      size: iconSize
    }) : icon);
  }
  renderContent() {
    const _a = this.props, {
      component,
      children,
      className,
      type,
      spacing,
      disabled,
      style,
      ellipsis,
      icon,
      size,
      link,
      heading,
      weight
    } = _a, rest = __rest8(_a, ["component", "children", "className", "type", "spacing", "disabled", "style", "ellipsis", "icon", "size", "link", "heading", "weight"]);
    const textProps = (0, import_omit3.default)(rest, [
      "strong",
      "editable",
      "mark",
      "copyable",
      "underline",
      "code",
      // 'link',
      "delete"
    ]);
    const realSize = size === "inherit" ? this.context : size;
    const iconNode = this.renderIcon();
    const ellipsisOpt = this.getEllipsisOpt();
    const {
      ellipsisCls,
      ellipsisStyle
    } = this.getEllipsisStyle();
    let textNode = ellipsis ? this.renderEllipsisText(ellipsisOpt) : children;
    const linkCls = (0, import_classnames8.default)({
      [`${prefixCls3}-link-text`]: link,
      [`${prefixCls3}-link-underline`]: this.props.underline && link
    });
    textNode = wrapperDecorations(this.props, /* @__PURE__ */ import_react20.default.createElement(import_react20.default.Fragment, null, iconNode, this.props.link ? /* @__PURE__ */ import_react20.default.createElement("span", {
      className: linkCls
    }, textNode) : textNode));
    const hTagReg = /^h[1-6]$/;
    const isHeader = (0, import_isString.default)(heading) && hTagReg.test(heading);
    const wrapperCls = (0, import_classnames8.default)(className, ellipsisCls, {
      // [`${prefixCls}-primary`]: !type || type === 'primary',
      [`${prefixCls3}-${type}`]: type && !link,
      [`${prefixCls3}-${realSize}`]: realSize,
      [`${prefixCls3}-link`]: link,
      [`${prefixCls3}-disabled`]: disabled,
      [`${prefixCls3}-${spacing}`]: spacing,
      [`${prefixCls3}-${heading}`]: isHeader,
      [`${prefixCls3}-${heading}-weight-${weight}`]: isHeader && weight && isNaN(Number(weight))
    });
    const textStyle = Object.assign(Object.assign({}, isNaN(Number(weight)) ? {} : {
      fontWeight: weight
    }), style);
    return /* @__PURE__ */ import_react20.default.createElement(typography_default, Object.assign({
      className: wrapperCls,
      style: Object.assign(Object.assign({}, textStyle), ellipsisStyle),
      component,
      forwardRef: this.wrapperRef
    }, textProps), textNode, this.renderOperations());
  }
  renderTipWrapper() {
    const {
      children
    } = this.props;
    const showTooltip = this.showTooltip();
    const content = this.renderContent();
    if (showTooltip) {
      const {
        type,
        opts,
        renderTooltip
      } = showTooltip;
      if ((0, import_isFunction3.default)(renderTooltip)) {
        return renderTooltip(children, content);
      } else if (type.toLowerCase() === "popover") {
        return /* @__PURE__ */ import_react20.default.createElement(popover_default, Object.assign({
          content: children,
          position: "top"
        }, opts), content);
      }
      return /* @__PURE__ */ import_react20.default.createElement(Tooltip2, Object.assign({
        content: children,
        position: "top"
      }, opts), content);
    } else {
      return content;
    }
  }
  render() {
    var _this = this;
    const {
      size
    } = this.props;
    const realSize = size === "inherit" ? this.context : size;
    const content = /* @__PURE__ */ import_react20.default.createElement(context_default3.Provider, {
      value: realSize
    }, /* @__PURE__ */ import_react20.default.createElement(LocaleConsumer, {
      componentName: "Typography"
    }, (locale2) => {
      this.expandStr = locale2.expand;
      this.collapseStr = locale2.collapse;
      return this.renderTipWrapper();
    }));
    if (this.props.ellipsis) {
      return /* @__PURE__ */ import_react20.default.createElement(ReactResizeObserver, {
        onResize: function() {
          if (_this.observerTakingEffect) {
            _this.onResize(...arguments);
          }
        },
        observeParent: true,
        observerProperty: ObserverProperty.Width
      }, content);
    }
    return content;
  }
};
Base.propTypes = {
  children: import_prop_types10.default.node,
  copyable: import_prop_types10.default.oneOfType([import_prop_types10.default.shape({
    text: import_prop_types10.default.string,
    onCopy: import_prop_types10.default.func,
    successTip: import_prop_types10.default.node,
    copyTip: import_prop_types10.default.node
  }), import_prop_types10.default.bool]),
  delete: import_prop_types10.default.bool,
  disabled: import_prop_types10.default.bool,
  // editable: PropTypes.bool,
  ellipsis: import_prop_types10.default.oneOfType([import_prop_types10.default.shape({
    rows: import_prop_types10.default.number,
    expandable: import_prop_types10.default.bool,
    expandText: import_prop_types10.default.string,
    onExpand: import_prop_types10.default.func,
    suffix: import_prop_types10.default.string,
    showTooltip: import_prop_types10.default.oneOfType([import_prop_types10.default.shape({
      type: import_prop_types10.default.string,
      opts: import_prop_types10.default.object
    }), import_prop_types10.default.bool]),
    collapsible: import_prop_types10.default.bool,
    collapseText: import_prop_types10.default.string,
    pos: import_prop_types10.default.oneOf(["end", "middle"])
  }), import_prop_types10.default.bool]),
  mark: import_prop_types10.default.bool,
  underline: import_prop_types10.default.bool,
  link: import_prop_types10.default.oneOfType([import_prop_types10.default.object, import_prop_types10.default.bool]),
  spacing: import_prop_types10.default.oneOf(strings.SPACING),
  strong: import_prop_types10.default.bool,
  size: import_prop_types10.default.oneOf(strings.SIZE),
  type: import_prop_types10.default.oneOf(strings.TYPE),
  style: import_prop_types10.default.object,
  className: import_prop_types10.default.string,
  icon: import_prop_types10.default.oneOfType([import_prop_types10.default.node, import_prop_types10.default.string]),
  heading: import_prop_types10.default.string,
  component: import_prop_types10.default.string
};
Base.defaultProps = {
  children: null,
  copyable: false,
  delete: false,
  disabled: false,
  // editable: false,
  ellipsis: false,
  icon: "",
  mark: false,
  underline: false,
  strong: false,
  link: false,
  type: "primary",
  spacing: "normal",
  size: "normal",
  style: {},
  className: ""
};
Base.contextType = context_default3;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/text.js
var Text = class extends import_react21.PureComponent {
  render() {
    return /* @__PURE__ */ import_react21.default.createElement(Base, Object.assign({
      component: "span"
    }, this.props));
  }
};
Text.propTypes = {
  copyable: import_prop_types11.default.oneOfType([import_prop_types11.default.object, import_prop_types11.default.bool]),
  delete: import_prop_types11.default.bool,
  disabled: import_prop_types11.default.bool,
  icon: import_prop_types11.default.oneOfType([import_prop_types11.default.node, import_prop_types11.default.string]),
  ellipsis: import_prop_types11.default.oneOfType([import_prop_types11.default.object, import_prop_types11.default.bool]),
  mark: import_prop_types11.default.bool,
  underline: import_prop_types11.default.bool,
  link: import_prop_types11.default.oneOfType([import_prop_types11.default.object, import_prop_types11.default.bool]),
  strong: import_prop_types11.default.bool,
  type: import_prop_types11.default.oneOf(strings.TYPE),
  size: import_prop_types11.default.oneOf(strings.SIZE),
  style: import_prop_types11.default.object,
  className: import_prop_types11.default.string,
  code: import_prop_types11.default.bool,
  component: import_prop_types11.default.string,
  weight: import_prop_types11.default.number
};
Text.defaultProps = {
  copyable: false,
  delete: false,
  disabled: false,
  icon: "",
  // editable: false,
  ellipsis: false,
  mark: false,
  underline: false,
  strong: false,
  link: false,
  type: "primary",
  style: {},
  size: "normal",
  className: ""
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/title.js
var import_react22 = __toESM(require_react());
var import_prop_types12 = __toESM(require_prop_types());
var __rest9 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var Title = class extends import_react22.PureComponent {
  render() {
    const _a = this.props, {
      heading
    } = _a, rest = __rest9(_a, ["heading"]);
    const component = strings.HEADING.indexOf(heading) !== -1 ? `h${heading}` : "h1";
    return /* @__PURE__ */ import_react22.default.createElement(Base, Object.assign({
      component,
      heading: component
    }, rest));
  }
};
Title.propTypes = {
  copyable: import_prop_types12.default.oneOfType([import_prop_types12.default.object, import_prop_types12.default.bool]),
  delete: import_prop_types12.default.bool,
  disabled: import_prop_types12.default.bool,
  // editable: PropTypes.bool,
  ellipsis: import_prop_types12.default.oneOfType([import_prop_types12.default.object, import_prop_types12.default.bool]),
  mark: import_prop_types12.default.bool,
  link: import_prop_types12.default.oneOfType([import_prop_types12.default.object, import_prop_types12.default.bool]),
  underline: import_prop_types12.default.bool,
  strong: import_prop_types12.default.bool,
  type: import_prop_types12.default.oneOf(strings.TYPE),
  heading: import_prop_types12.default.oneOf(strings.HEADING),
  style: import_prop_types12.default.object,
  className: import_prop_types12.default.string,
  component: import_prop_types12.default.string,
  weight: import_prop_types12.default.oneOfType([import_prop_types12.default.oneOf(strings.WEIGHT), import_prop_types12.default.number])
};
Title.defaultProps = {
  copyable: false,
  delete: false,
  disabled: false,
  // editable: false,
  ellipsis: false,
  mark: false,
  underline: false,
  strong: false,
  link: false,
  type: "primary",
  heading: 1,
  style: {},
  className: ""
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/paragraph.js
var import_react23 = __toESM(require_react());
var import_prop_types13 = __toESM(require_prop_types());
var import_classnames9 = __toESM(require_classnames());
var prefixCls4 = cssClasses.PREFIX;
var Paragraph = class extends import_react23.PureComponent {
  render() {
    const {
      className
    } = this.props;
    const paragraphCls = (0, import_classnames9.default)(className, `${prefixCls4}-paragraph`);
    return /* @__PURE__ */ import_react23.default.createElement(Base, Object.assign({
      component: "p"
    }, this.props, {
      className: paragraphCls
    }));
  }
};
Paragraph.propTypes = {
  copyable: import_prop_types13.default.oneOfType([import_prop_types13.default.object, import_prop_types13.default.bool]),
  delete: import_prop_types13.default.bool,
  disabled: import_prop_types13.default.bool,
  // editable: PropTypes.bool,
  ellipsis: import_prop_types13.default.oneOfType([import_prop_types13.default.object, import_prop_types13.default.bool]),
  mark: import_prop_types13.default.bool,
  link: import_prop_types13.default.oneOfType([import_prop_types13.default.object, import_prop_types13.default.bool]),
  underline: import_prop_types13.default.bool,
  strong: import_prop_types13.default.bool,
  type: import_prop_types13.default.oneOf(strings.TYPE),
  size: import_prop_types13.default.oneOf(strings.SIZE),
  spacing: import_prop_types13.default.oneOf(strings.SPACING),
  style: import_prop_types13.default.object,
  className: import_prop_types13.default.string,
  component: import_prop_types13.default.string
};
Paragraph.defaultProps = {
  copyable: false,
  delete: false,
  disabled: false,
  // editable: false,
  ellipsis: false,
  mark: false,
  underline: false,
  strong: false,
  link: false,
  type: "primary",
  size: "normal",
  spacing: "normal",
  style: {},
  className: ""
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/numeral.js
var import_react24 = __toESM(require_react());
var import_prop_types14 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/typography/formatNumeral.js
var FormatNumeral = class {
  constructor(content, rule, precision, truncate, parser) {
    this.ruleMethods = {
      "bytes-decimal": (value) => {
        const units = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
        let i = 0;
        while (value >= 1e3) {
          value /= 1e3;
          i++;
        }
        return `${this.truncatePrecision(value)} ${units[i]}`;
      },
      "bytes-binary": (value) => {
        const units = ["B", "KiB", "MiB", "GiB", "TiB", "PiB", "EiB", "ZiB", "YiB"];
        let i = 0;
        while (value >= 1024) {
          value /= 1024;
          i++;
        }
        return `${this.truncatePrecision(value)} ${units[i]}`;
      },
      percentages: (value) => {
        return `${this.truncatePrecision(value * 100)}%`;
      },
      exponential: (value) => {
        const vExponential = value.toExponential(this.precision + 2);
        const vArr = vExponential.split("e");
        return `${this.truncatePrecision(Number(vArr[0]))}e${vArr[1]}`;
      }
    };
    this.truncateMethods = {
      ceil: Math.ceil,
      floor: Math.floor,
      round: Math.round
    };
    this.isDiyParser = typeof parser !== "undefined";
    this.content = content;
    this.rule = rule;
    this.precision = precision;
    this.truncate = truncate;
    this.parser = parser;
  }
  // Formatting numbers within a string.
  format() {
    if (this.isDiyParser) {
      return this.parser(this.content);
    }
    if (this.rule === "text") {
      return extractNumbers(this.content).map((item) => checkIsNumeral(item) ? this.truncatePrecision(item) : item).join("");
    }
    if (this.rule === "numbers") {
      return extractNumbers(this.content).filter((item) => checkIsNumeral(item)).map((item) => this.truncatePrecision(item)).join(",");
    }
    return extractNumbers(this.content).map((item) => checkIsNumeral(item) ? this.ruleMethods[this.rule](Number(item)) : item).join("");
  }
  truncatePrecision(content) {
    const cTruncated = this.truncateMethods[this.truncate](Number(content) * Math.pow(10, this.precision)) / Math.pow(10, this.precision);
    const cArr = cTruncated.toString().split(".");
    if (cArr.length === 1) {
      return cTruncated.toFixed(this.precision);
    }
    const cTLength = cArr[1].length;
    if (cTLength < this.precision) {
      return `${cArr[0]}.${cArr[1]}${"0".repeat(this.precision - cTLength)}`;
    }
    return cTruncated.toString();
  }
};
function extractNumbers(content) {
  const reg = /(-?[0-9]*\.?[0-9]+([eE]-?[0-9]+)?)|([^-\d\.]+)/g;
  return content.match(reg) || [];
}
function checkIsNumeral(str) {
  return !(isNaN(Number(str)) || str.replace(/\s+/g, "") === "");
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/numeral.js
var Numeral = class extends import_react24.PureComponent {
  // Traverse the entire virtual DOM using a depth-first traversal algorithm, then format each piece. (in react)
  formatNodeDFS(node) {
    if (!Array.isArray(node)) {
      node = [node];
    }
    node = node.map((item) => {
      if (typeof item === "string" || typeof item === "number") {
        return new FormatNumeral(String(item), this.props.rule, this.props.precision, this.props.truncate, this.props.parser).format();
      }
      if (typeof item === "function") {
        return this.formatNodeDFS(item());
      }
      if (typeof item === "object" && "children" in item["props"]) {
        return Object.assign(Object.assign({}, item), {
          props: Object.assign(Object.assign({}, item["props"]), {
            children: this.formatNodeDFS(item["props"]["children"])
          })
        });
      }
      return item;
    });
    return node.length === 1 ? node[0] : node;
  }
  render() {
    const baseProps = Object.assign({}, this.props);
    delete baseProps.rule;
    delete baseProps.parser;
    baseProps.children = this.formatNodeDFS(this.props.children);
    return /* @__PURE__ */ import_react24.default.createElement(Base, Object.assign({
      component: "span"
    }, baseProps));
  }
};
Numeral.propTypes = {
  rule: import_prop_types14.default.oneOf(strings.RULE),
  precision: import_prop_types14.default.number,
  truncate: import_prop_types14.default.oneOf(strings.TRUNCATE),
  parser: import_prop_types14.default.func,
  copyable: import_prop_types14.default.oneOfType([import_prop_types14.default.object, import_prop_types14.default.bool]),
  delete: import_prop_types14.default.bool,
  disabled: import_prop_types14.default.bool,
  icon: import_prop_types14.default.oneOfType([import_prop_types14.default.node, import_prop_types14.default.string]),
  mark: import_prop_types14.default.bool,
  underline: import_prop_types14.default.bool,
  link: import_prop_types14.default.oneOfType([import_prop_types14.default.object, import_prop_types14.default.bool]),
  strong: import_prop_types14.default.bool,
  type: import_prop_types14.default.oneOf(strings.TYPE),
  size: import_prop_types14.default.oneOf(strings.SIZE),
  style: import_prop_types14.default.object,
  className: import_prop_types14.default.string,
  code: import_prop_types14.default.bool,
  component: import_prop_types14.default.string
};
Numeral.defaultProps = {
  rule: "text",
  precision: 0,
  truncate: "round",
  parser: void 0,
  copyable: false,
  delete: false,
  icon: "",
  mark: false,
  underline: false,
  strong: false,
  link: false,
  type: "primary",
  style: {},
  size: "normal",
  className: ""
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/typography/index.js
var Typography2 = typography_default;
Typography2.Text = Text;
Typography2.Title = Title;
Typography2.Paragraph = Paragraph;
Typography2.Numeral = Numeral;
var typography_default2 = Typography2;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/button/index.js
var import_react28 = __toESM(require_react());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/button/Button.js
var import_omit4 = __toESM(require_omit());
var import_react25 = __toESM(require_react());
var import_classnames10 = __toESM(require_classnames());
var import_prop_types15 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/button/constants.js
var cssClasses4 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-button`
};
var strings4 = {
  sizes: ["default", "small", "large"],
  iconPositions: ["left", "right"],
  htmlTypes: ["button", "reset", "submit"],
  btnTypes: ["primary", "secondary", "tertiary", "warning", "danger"],
  themes: ["solid", "borderless", "light", "outline"],
  DEFAULT_ICON_SIZE: "default",
  DEFAULT_ICON_POSITION: "left"
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/button/Button.js
var import_classnames11 = __toESM(require_classnames());
var __rest10 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var btnSizes = strings4.sizes;
var {
  htmlTypes,
  btnTypes
} = strings4;
var Button = class extends import_react25.PureComponent {
  render() {
    const _a = this.props, {
      children,
      block,
      htmlType,
      loading,
      circle,
      className,
      style,
      disabled,
      size,
      theme,
      type,
      prefixCls: prefixCls17,
      iconPosition
    } = _a, attr = __rest10(_a, ["children", "block", "htmlType", "loading", "circle", "className", "style", "disabled", "size", "theme", "type", "prefixCls", "iconPosition"]);
    const baseProps = Object.assign(Object.assign({
      disabled
    }, (0, import_omit4.default)(attr, ["x-semi-children-alias"])), {
      className: (0, import_classnames10.default)(prefixCls17, {
        [`${prefixCls17}-${type}`]: !disabled && type,
        [`${prefixCls17}-disabled`]: disabled,
        [`${prefixCls17}-size-large`]: size === "large",
        [`${prefixCls17}-size-small`]: size === "small",
        // [`${prefixCls}-loading`]: loading,
        [`${prefixCls17}-light`]: theme === "light",
        [`${prefixCls17}-block`]: block,
        [`${prefixCls17}-circle`]: circle,
        [`${prefixCls17}-borderless`]: theme === "borderless",
        [`${prefixCls17}-outline`]: theme === "outline",
        [`${prefixCls17}-${type}-disabled`]: disabled && type
      }, className),
      type: htmlType,
      "aria-disabled": disabled
    });
    const xSemiProps = {};
    if (!(className && className.includes("-with-icon"))) {
      xSemiProps["x-semi-prop"] = this.props["x-semi-children-alias"] || "children";
    }
    return /* @__PURE__ */ import_react25.default.createElement("button", Object.assign({}, baseProps, {
      onClick: this.props.onClick,
      onMouseDown: this.props.onMouseDown,
      style
    }), /* @__PURE__ */ import_react25.default.createElement("span", Object.assign({
      className: (0, import_classnames11.default)(`${prefixCls17}-content`, this.props.contentClassName),
      onClick: (e) => disabled && e.stopPropagation()
    }, xSemiProps), children));
  }
};
Button.defaultProps = {
  disabled: false,
  size: "default",
  type: "primary",
  theme: "light",
  block: false,
  htmlType: "button",
  onMouseDown: noop,
  onClick: noop,
  onMouseEnter: noop,
  onMouseLeave: noop,
  prefixCls: cssClasses4.PREFIX
};
Button.propTypes = {
  children: import_prop_types15.default.node,
  disabled: import_prop_types15.default.bool,
  prefixCls: import_prop_types15.default.string,
  style: import_prop_types15.default.object,
  size: import_prop_types15.default.oneOf(btnSizes),
  type: import_prop_types15.default.oneOf(btnTypes),
  block: import_prop_types15.default.bool,
  onClick: import_prop_types15.default.func,
  onMouseDown: import_prop_types15.default.func,
  circle: import_prop_types15.default.bool,
  loading: import_prop_types15.default.bool,
  htmlType: import_prop_types15.default.oneOf(htmlTypes),
  theme: import_prop_types15.default.oneOf(strings4.themes),
  className: import_prop_types15.default.string,
  onMouseEnter: import_prop_types15.default.func,
  onMouseLeave: import_prop_types15.default.func,
  "aria-label": import_prop_types15.default.string,
  contentClassName: import_prop_types15.default.string
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/iconButton/index.js
var import_noop4 = __toESM(require_noop());
var import_react27 = __toESM(require_react());
var import_classnames12 = __toESM(require_classnames());
var import_prop_types16 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/icons/constants.js
var cssClasses5 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-icon`
};
var strings5 = {
  SIZE: ["extra-small", "small", "default", "large", "extra-large", "custom"],
  // use in svg xhref. No need to respond to the change of prefixCls, always constant
  ICON_PREFIX: "semi-icon-"
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/spin/icon.js
var import_react26 = __toESM(require_react());
var __rest11 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var _id = -1;
function Icon2() {
  let props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  const {
    id: propsId,
    className
  } = props, rest = __rest11(props, ["id", "className"]);
  let _propsId = propsId;
  if (isNullOrUndefined(_propsId)) {
    _id++;
    _propsId = _id;
  }
  const id = `linearGradient-${_propsId}`;
  return /* @__PURE__ */ import_react26.default.createElement("svg", Object.assign({}, rest, {
    className,
    width: "48",
    height: "48",
    viewBox: "0 0 36 36",
    version: "1.1",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": true,
    "data-icon": "spin"
  }), /* @__PURE__ */ import_react26.default.createElement("defs", null, /* @__PURE__ */ import_react26.default.createElement("linearGradient", {
    x1: "0%",
    y1: "100%",
    x2: "100%",
    y2: "100%",
    id
  }, /* @__PURE__ */ import_react26.default.createElement("stop", {
    stopColor: "currentColor",
    stopOpacity: "0",
    offset: "0%"
  }), /* @__PURE__ */ import_react26.default.createElement("stop", {
    stopColor: "currentColor",
    stopOpacity: "0.50",
    offset: "39.9430698%"
  }), /* @__PURE__ */ import_react26.default.createElement("stop", {
    stopColor: "currentColor",
    offset: "100%"
  }))), /* @__PURE__ */ import_react26.default.createElement("g", {
    stroke: "none",
    strokeWidth: "1",
    fill: "none",
    fillRule: "evenodd"
  }, /* @__PURE__ */ import_react26.default.createElement("rect", {
    fillOpacity: "0.01",
    fill: "none",
    x: "0",
    y: "0",
    width: "36",
    height: "36"
  }), /* @__PURE__ */ import_react26.default.createElement("path", {
    d: "M34,18 C34,9.163444 26.836556,2 18,2 C11.6597233,2 6.18078805,5.68784135 3.59122325,11.0354951",
    stroke: `url(#${id})`,
    strokeWidth: "4",
    strokeLinecap: "round"
  })));
}
var icon_default = Icon2;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/iconButton/index.js
var __rest12 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var iconSizes = strings5.SIZE;
var IconButton = class extends import_react27.PureComponent {
  render() {
    const _a = this.props, {
      children: originChildren,
      iconPosition,
      iconSize,
      iconStyle,
      style: originStyle,
      icon,
      noHorizontalPadding,
      theme,
      className,
      prefixCls: prefixCls17,
      loading
    } = _a, otherProps = __rest12(_a, ["children", "iconPosition", "iconSize", "iconStyle", "style", "icon", "noHorizontalPadding", "theme", "className", "prefixCls", "loading"]);
    const style = Object.assign({}, originStyle);
    if (Array.isArray(noHorizontalPadding)) {
      noHorizontalPadding.includes("left") && (style.paddingLeft = 0);
      noHorizontalPadding.includes("right") && (style.paddingRight = 0);
    } else if (noHorizontalPadding === true) {
      style.paddingLeft = 0;
      style.paddingRight = 0;
    } else if (typeof noHorizontalPadding === "string") {
      noHorizontalPadding === "left" && (style.paddingLeft = 0);
      noHorizontalPadding === "right" && (style.paddingRight = 0);
    }
    let finalChildren = null;
    let IconElem = null;
    if (loading && !otherProps.disabled) {
      IconElem = /* @__PURE__ */ import_react27.default.createElement(icon_default, null);
    } else if (/* @__PURE__ */ import_react27.default.isValidElement(icon)) {
      IconElem = icon;
    }
    const btnTextCls = (0, import_classnames12.default)({
      [`${prefixCls17}-content-left`]: iconPosition === "right",
      [`${prefixCls17}-content-right`]: iconPosition === "left"
    });
    const xSemiProp = this.props["x-semi-children-alias"] || "children";
    const children = originChildren != null ? /* @__PURE__ */ import_react27.default.createElement("span", {
      className: btnTextCls,
      "x-semi-prop": xSemiProp
    }, originChildren) : null;
    if (iconPosition === "left") {
      finalChildren = /* @__PURE__ */ import_react27.default.createElement(import_react27.default.Fragment, null, IconElem, children);
    } else {
      finalChildren = /* @__PURE__ */ import_react27.default.createElement(import_react27.default.Fragment, null, children, IconElem);
    }
    const iconBtnCls = (0, import_classnames12.default)(className, `${prefixCls17}-with-icon`, {
      [`${prefixCls17}-with-icon-only`]: children == null || children === "",
      [`${prefixCls17}-loading`]: loading
    });
    return /* @__PURE__ */ import_react27.default.createElement(Button, Object.assign({}, otherProps, {
      className: iconBtnCls,
      theme,
      style
    }), finalChildren);
  }
};
IconButton.defaultProps = {
  iconPosition: strings4.DEFAULT_ICON_POSITION,
  prefixCls: cssClasses4.PREFIX,
  loading: false,
  noHorizontalPadding: false,
  onMouseEnter: import_noop4.default,
  onMouseLeave: import_noop4.default
};
IconButton.elementType = "IconButton";
IconButton.propTypes = {
  iconStyle: import_prop_types16.default.object,
  style: import_prop_types16.default.object,
  loading: import_prop_types16.default.bool,
  prefixCls: import_prop_types16.default.string,
  icon: import_prop_types16.default.oneOfType([import_prop_types16.default.object, import_prop_types16.default.string, import_prop_types16.default.node]),
  iconSize: import_prop_types16.default.oneOf(iconSizes),
  noHorizontalPadding: import_prop_types16.default.oneOfType([import_prop_types16.default.bool, import_prop_types16.default.string, import_prop_types16.default.array]),
  children: import_prop_types16.default.node,
  theme: import_prop_types16.default.string,
  iconPosition: import_prop_types16.default.oneOf(strings4.iconPositions),
  className: import_prop_types16.default.string,
  onMouseEnter: import_prop_types16.default.func,
  onMouseLeave: import_prop_types16.default.func
};
var iconButton_default = IconButton;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/button/index.js
var Button2 = class extends import_react28.default.PureComponent {
  constructor() {
    let props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    super(props);
  }
  render() {
    const props = Object.assign({}, this.props);
    const hasIcon = Boolean(props.icon);
    const isLoading = Boolean(props.loading);
    const isDisabled = Boolean(props.disabled);
    if (hasIcon || isLoading && !isDisabled) {
      return /* @__PURE__ */ import_react28.default.createElement(iconButton_default, Object.assign({}, props));
    } else {
      return /* @__PURE__ */ import_react28.default.createElement(Button, Object.assign({}, props));
    }
  }
};
Button2.__SemiComponentName__ = "Button";
Button2.propTypes = Object.assign(Object.assign({}, Button.propTypes), iconButton_default.propTypes);
Button2.defaultProps = getDefaultPropsFromGlobalConfig(Button2.__SemiComponentName__);
Button2.elementType = "Button";
var button_default = Button2;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/space/index.js
var import_isNumber = __toESM(require_isNumber());
var import_isArray = __toESM(require_isArray());
var import_isString2 = __toESM(require_isString());
var import_react30 = __toESM(require_react());
var import_classnames13 = __toESM(require_classnames());
var import_prop_types17 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/space/constants.js
var cssClasses6 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-space`
};
var strings6 = {
  ALIGN_SET: ["start", "end", "center", "baseline"],
  SPACING_LOOSE: "loose",
  SPACING_MEDIUM: "medium",
  SPACING_TIGHT: "tight"
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/space/utils.js
var import_react29 = __toESM(require_react());
var REACT_FRAGMENT_TYPE = "Symbol(react.fragment)";
var flatten = (children) => {
  let res = [];
  import_react29.default.Children.forEach(children, (child) => {
    if (child === void 0 || child === null) {
      return;
    }
    if (Array.isArray(child)) {
      res = res.concat(flatten(child));
    } else if (/* @__PURE__ */ (0, import_react29.isValidElement)(child) && child.type && child.type.toString() === REACT_FRAGMENT_TYPE && child.props) {
      res = res.concat(flatten(child.props.children));
    } else {
      res.push(child);
    }
  });
  return res;
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/space/index.js
var prefixCls5 = cssClasses6.PREFIX;
var Space = class extends import_react30.PureComponent {
  render() {
    const {
      children = null,
      style,
      className,
      spacing,
      wrap,
      align,
      vertical
    } = this.props;
    const isWrap = wrap && vertical ? false : wrap;
    const realStyle = Object.assign({}, style);
    let spacingHorizontalType = "";
    let spacingVerticalType = "";
    if ((0, import_isString2.default)(spacing)) {
      spacingHorizontalType = spacing;
      spacingVerticalType = spacing;
    } else if ((0, import_isNumber.default)(spacing)) {
      realStyle.rowGap = spacing;
      realStyle.columnGap = spacing;
    } else if ((0, import_isArray.default)(spacing)) {
      if ((0, import_isString2.default)(spacing[0])) {
        spacingHorizontalType = spacing[0];
      } else if ((0, import_isNumber.default)(spacing[0])) {
        realStyle.columnGap = `${spacing[0]}px`;
      }
      if ((0, import_isString2.default)(spacing[1])) {
        spacingVerticalType = spacing[1];
      } else if ((0, import_isNumber.default)(spacing[1])) {
        realStyle.rowGap = `${spacing[1]}px`;
      }
    }
    const classNames6 = (0, import_classnames13.default)(prefixCls5, className, {
      [`${prefixCls5}-align-${align}`]: align,
      [`${prefixCls5}-vertical`]: vertical,
      [`${prefixCls5}-horizontal`]: !vertical,
      [`${prefixCls5}-wrap`]: isWrap,
      [`${prefixCls5}-tight-horizontal`]: spacingHorizontalType === strings6.SPACING_TIGHT,
      [`${prefixCls5}-tight-vertical`]: spacingVerticalType === strings6.SPACING_TIGHT,
      [`${prefixCls5}-medium-horizontal`]: spacingHorizontalType === strings6.SPACING_MEDIUM,
      [`${prefixCls5}-medium-vertical`]: spacingVerticalType === strings6.SPACING_MEDIUM,
      [`${prefixCls5}-loose-horizontal`]: spacingHorizontalType === strings6.SPACING_LOOSE,
      [`${prefixCls5}-loose-vertical`]: spacingVerticalType === strings6.SPACING_LOOSE
    });
    const childrenNodes = flatten(children);
    const dataAttributes = getDataAttr(this.props);
    return /* @__PURE__ */ import_react30.default.createElement("div", Object.assign({}, dataAttributes, {
      className: classNames6,
      style: realStyle,
      "x-semi-prop": "children"
    }), childrenNodes);
  }
};
Space.propTypes = {
  wrap: import_prop_types17.default.bool,
  align: import_prop_types17.default.oneOf(strings6.ALIGN_SET),
  vertical: import_prop_types17.default.bool,
  spacing: import_prop_types17.default.oneOfType([import_prop_types17.default.string, import_prop_types17.default.number, import_prop_types17.default.array]),
  children: import_prop_types17.default.node,
  style: import_prop_types17.default.object,
  className: import_prop_types17.default.string
};
Space.defaultProps = {
  vertical: false,
  wrap: false,
  spacing: "tight",
  align: "center"
};
var space_default = Space;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/divider/index.js
var import_react31 = __toESM(require_react());
var import_classnames14 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/divider/constants.js
var cssClasses7 = {
  PREFIX: `${BASE_CLASS_PREFIX2}`
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/divider/index.js
var __rest13 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls6 = cssClasses7.PREFIX;
var Divider = (props) => {
  const {
    layout = "horizontal",
    dashed,
    align = "center",
    className,
    margin,
    style,
    children
  } = props, rest = __rest13(props, ["layout", "dashed", "align", "className", "margin", "style", "children"]);
  const dividerClassNames = (0, import_classnames14.default)(`${prefixCls6}-divider`, className, {
    [`${prefixCls6}-divider-horizontal`]: layout === "horizontal",
    [`${prefixCls6}-divider-vertical`]: layout === "vertical",
    [`${prefixCls6}-divider-dashed`]: !!dashed,
    [`${prefixCls6}-divider-with-text`]: children && layout === "horizontal",
    [`${prefixCls6}-divider-with-text-${align}`]: children && layout === "horizontal"
  });
  let overrideDefaultStyle = {};
  if (margin !== void 0) {
    if (layout === "vertical") {
      overrideDefaultStyle = {
        "marginLeft": margin,
        "marginRight": margin
      };
    } else if (layout === "horizontal") {
      overrideDefaultStyle = {
        "marginTop": margin,
        "marginBottom": margin
      };
    }
  }
  return /* @__PURE__ */ import_react31.default.createElement("div", Object.assign({}, rest, {
    className: dividerClassNames,
    style: Object.assign(Object.assign({}, overrideDefaultStyle), style)
  }), children && layout === "horizontal" ? typeof children === "string" ? /* @__PURE__ */ import_react31.default.createElement("span", {
    className: `${prefixCls6}-divider_inner-text`,
    "x-semi-prop": "children"
  }, children) : children : null);
};
var divider_default = Divider;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/grid/row.js
var import_react32 = __toESM(require_react());
var import_classnames15 = __toESM(require_classnames());
var import_prop_types18 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/grid/constants.js
var cssClasses8 = {
  PREFIX: `${BASE_CLASS_PREFIX2}`
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/grid/row.js
var __rest14 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var responsiveArray = ["xxl", "xl", "lg", "md", "sm", "xs"];
var RowContext = /* @__PURE__ */ import_react32.default.createContext(null);
var responsiveMap = {
  xs: "(max-width: 575px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1600px)"
};
var Row = class extends import_react32.default.Component {
  constructor() {
    super(...arguments);
    this.state = {
      screens: {
        xs: true,
        sm: true,
        md: true,
        lg: true,
        xl: true,
        xxl: true
      }
    };
    this.unRegisters = [];
  }
  componentDidMount() {
    this.unRegisters = Object.keys(responsiveMap).map((screen) => registerMediaQuery(responsiveMap[screen], {
      match: () => {
        if (typeof this.props.gutter !== "object") {
          return;
        }
        this.setState((prevState) => ({
          screens: Object.assign(Object.assign({}, prevState.screens), {
            [screen]: true
          })
        }));
      },
      unmatch: () => {
        if (typeof this.props.gutter !== "object") {
          return;
        }
        this.setState((prevState) => ({
          screens: Object.assign(Object.assign({}, prevState.screens), {
            [screen]: false
          })
        }));
      }
    }));
  }
  componentWillUnmount() {
    this.unRegisters.forEach((unRegister) => unRegister());
  }
  getGutter() {
    const {
      gutter = 0
    } = this.props;
    const results = [0, 0];
    const normalizedGutter = Array.isArray(gutter) ? gutter.slice(0, 2) : [gutter, 0];
    normalizedGutter.forEach((g, index) => {
      if (typeof g === "object") {
        for (let i = 0; i < responsiveArray.length; i++) {
          const breakpoint = responsiveArray[i];
          if (this.state.screens[breakpoint] && g[breakpoint] !== void 0) {
            results[index] = g[breakpoint];
            break;
          }
        }
      } else {
        results[index] = g || 0;
      }
    });
    return results;
  }
  render() {
    const _a = this.props, {
      prefixCls: prefixCls17,
      type,
      justify,
      align,
      className,
      style,
      children
    } = _a, others = __rest14(_a, ["prefixCls", "type", "justify", "align", "className", "style", "children"]);
    const gutters = this.getGutter();
    const prefix2 = `${prefixCls17}-row`;
    const classes = (0, import_classnames15.default)({
      [prefix2]: type !== "flex",
      [`${prefix2}-${type}`]: type,
      [`${prefix2}-${type}-${justify}`]: type && justify,
      [`${prefix2}-${type}-${align}`]: type && align
    }, className);
    const rowStyle = Object.assign(Object.assign(Object.assign({}, gutters[0] > 0 ? {
      marginLeft: gutters[0] / -2,
      marginRight: gutters[0] / -2
    } : {}), gutters[1] > 0 ? {
      marginTop: gutters[1] / -2,
      marginBottom: gutters[1] / -2
    } : {}), style);
    const otherProps = Object.assign({}, others);
    delete otherProps.gutter;
    return /* @__PURE__ */ import_react32.default.createElement(RowContext.Provider, {
      value: {
        gutters
      }
    }, /* @__PURE__ */ import_react32.default.createElement("div", Object.assign({}, otherProps, {
      className: classes,
      style: rowStyle,
      "x-semi-prop": "children"
    }), children));
  }
};
Row.propTypes = {
  type: import_prop_types18.default.oneOf(["flex"]),
  align: import_prop_types18.default.oneOf(["top", "middle", "bottom"]),
  justify: import_prop_types18.default.oneOf(["start", "end", "center", "space-around", "space-between"]),
  className: import_prop_types18.default.string,
  style: import_prop_types18.default.object,
  children: import_prop_types18.default.node,
  gutter: import_prop_types18.default.oneOfType([import_prop_types18.default.object, import_prop_types18.default.number, import_prop_types18.default.array]),
  prefixCls: import_prop_types18.default.string
};
Row.defaultProps = {
  prefixCls: cssClasses8.PREFIX
};
Row.RowContext = {
  gutters: import_prop_types18.default.any
};
var row_default = Row;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/grid/col.js
var import_react33 = __toESM(require_react());
var import_prop_types19 = __toESM(require_prop_types());
var import_classnames16 = __toESM(require_classnames());
var __rest15 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var objectOrNumber = import_prop_types19.default.oneOfType([import_prop_types19.default.object, import_prop_types19.default.number]);
var Col = class extends import_react33.default.Component {
  render() {
    const {
      props
    } = this;
    const {
      prefixCls: prefixCls17,
      span,
      order,
      offset,
      push,
      pull,
      className,
      children
    } = props, others = __rest15(props, ["prefixCls", "span", "order", "offset", "push", "pull", "className", "children"]);
    let sizeClassObj = {};
    const prefix2 = `${prefixCls17}-col`;
    ["xs", "sm", "md", "lg", "xl", "xxl"].forEach((size) => {
      let sizeProps = {};
      if (typeof props[size] === "number") {
        sizeProps.span = props[size];
      } else if (typeof props[size] === "object") {
        sizeProps = props[size] || {};
      }
      delete others[size];
      sizeClassObj = Object.assign(Object.assign({}, sizeClassObj), {
        [`${prefix2}-${size}-${sizeProps.span}`]: sizeProps.span !== void 0,
        [`${prefix2}-${size}-order-${sizeProps.order}`]: sizeProps.order || sizeProps.order === 0,
        [`${prefix2}-${size}-offset-${sizeProps.offset}`]: sizeProps.offset || sizeProps.offset === 0,
        [`${prefix2}-${size}-push-${sizeProps.push}`]: sizeProps.push || sizeProps.push === 0,
        [`${prefix2}-${size}-pull-${sizeProps.pull}`]: sizeProps.pull || sizeProps.pull === 0
      });
    });
    const classes = (0, import_classnames16.default)(prefix2, {
      [`${prefix2}-${span}`]: span !== void 0,
      [`${prefix2}-order-${order}`]: order,
      [`${prefix2}-offset-${offset}`]: offset,
      [`${prefix2}-push-${push}`]: push,
      [`${prefix2}-pull-${pull}`]: pull
    }, className, sizeClassObj);
    let {
      style
    } = others;
    let gutters;
    try {
      gutters = this.context.gutters;
    } catch (error) {
      throw new Error("please make sure <Col> inside <Row>");
    }
    style = Object.assign(Object.assign(Object.assign({}, gutters[0] > 0 ? {
      paddingLeft: gutters[0] / 2,
      paddingRight: gutters[0] / 2
    } : {}), gutters[1] > 0 ? {
      paddingTop: gutters[1] / 2,
      paddingBottom: gutters[1] / 2
    } : {}), style);
    return /* @__PURE__ */ import_react33.default.createElement("div", Object.assign({}, others, {
      style,
      className: classes,
      "x-semi-prop": "children"
    }), children);
  }
};
Col.contextType = RowContext;
Col.propTypes = {
  span: import_prop_types19.default.number,
  order: import_prop_types19.default.number,
  offset: import_prop_types19.default.number,
  push: import_prop_types19.default.number,
  pull: import_prop_types19.default.number,
  className: import_prop_types19.default.string,
  children: import_prop_types19.default.node,
  xs: objectOrNumber,
  sm: objectOrNumber,
  md: objectOrNumber,
  lg: objectOrNumber,
  xl: objectOrNumber,
  xxl: objectOrNumber,
  prefixCls: import_prop_types19.default.string
};
Col.defaultProps = {
  prefixCls: cssClasses8.PREFIX
};
var col_default = Col;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/layout/index.js
var import_react36 = __toESM(require_react());
var import_classnames18 = __toESM(require_classnames());
var import_prop_types21 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/layout/constants.js
var cssClasses9 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-layout`
};
var strings7 = {
  BREAKPOINT: ["xs", "sm", "md", "lg", "xl", "xxl"]
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/layout/layout-context.js
var import_react34 = __toESM(require_react());
var LayoutContext = /* @__PURE__ */ import_react34.default.createContext({
  siderHook: {
    addSider: noop,
    removeSider: noop
  }
});
var layout_context_default = LayoutContext;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/layout/Sider.js
var import_react35 = __toESM(require_react());
var import_classnames17 = __toESM(require_classnames());
var import_prop_types20 = __toESM(require_prop_types());
var __rest16 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var responsiveMap2 = {
  xs: "(max-width: 575px)",
  sm: "(min-width: 576px)",
  md: "(min-width: 768px)",
  lg: "(min-width: 992px)",
  xl: "(min-width: 1200px)",
  xxl: "(min-width: 1600px)"
};
var generateId = (() => {
  let i = 0;
  return () => {
    i += 1;
    return `${cssClasses9.PREFIX}-sider-${i}`;
  };
})();
var bpt = strings7.BREAKPOINT;
var Sider = class extends import_react35.default.PureComponent {
  constructor(props) {
    super(props);
    this.unRegisters = [];
    this.uniqueId = "";
    this.uniqueId = generateId();
  }
  componentDidMount() {
    const {
      breakpoint
    } = this.props;
    const matchBpt = Object.keys(responsiveMap2).filter((item) => breakpoint && breakpoint.indexOf(item) !== -1);
    const unRegisters = matchBpt.map((screen) => registerMediaQuery(responsiveMap2[screen], {
      match: () => {
        this.responsiveHandler(screen, true);
      },
      unmatch: () => {
        this.responsiveHandler(screen, false);
      }
    }));
    this.unRegisters = unRegisters;
    if (this.context.siderHook) {
      this.context.siderHook.addSider(this.uniqueId);
    }
  }
  componentWillUnmount() {
    this.unRegisters.forEach((unRegister) => unRegister());
    if (this.context.siderHook) {
      this.context.siderHook.removeSider(this.uniqueId);
    }
  }
  responsiveHandler(screen, matches) {
    const {
      onBreakpoint
    } = this.props;
    if (onBreakpoint) {
      onBreakpoint(screen, matches);
    }
  }
  render() {
    const _a = this.props, {
      prefixCls: prefixCls17,
      className,
      children,
      style
    } = _a, others = __rest16(_a, ["prefixCls", "className", "children", "style"]);
    const classString = (0, import_classnames17.default)(className, {
      [`${prefixCls17}-sider`]: true
    });
    return /* @__PURE__ */ import_react35.default.createElement("aside", Object.assign({
      className: classString,
      "aria-label": this.props["aria-label"],
      style
    }, getDataAttr(others)), /* @__PURE__ */ import_react35.default.createElement("div", {
      className: `${prefixCls17}-sider-children`
    }, children));
  }
};
Sider.propTypes = {
  prefixCls: import_prop_types20.default.string,
  style: import_prop_types20.default.object,
  className: import_prop_types20.default.string,
  breakpoint: import_prop_types20.default.arrayOf(import_prop_types20.default.oneOf(bpt)),
  onBreakpoint: import_prop_types20.default.func,
  "aria-label": import_prop_types20.default.string,
  role: import_prop_types20.default.string
};
Sider.defaultProps = {
  prefixCls: cssClasses9.PREFIX
};
Sider.contextType = layout_context_default;
Sider.elementType = "Layout.Sider";
var Sider_default = Sider;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/layout/index.js
var __rest17 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var htmlTag = {
  Header: "header",
  Footer: "footer",
  Content: "main",
  Layout: "section"
};
function generator(type) {
  const tagName = htmlTag[type];
  const typeName = type.toLowerCase();
  return (BasicComponent) => class Adapter extends import_react36.default.PureComponent {
    render() {
      return /* @__PURE__ */ import_react36.default.createElement(BasicComponent, Object.assign({
        role: this.props.role,
        "aria-label": this.props["aria-label"],
        type: typeName,
        tagName
      }, this.props));
    }
  };
}
var Basic = class extends import_react36.default.PureComponent {
  render() {
    const _a = this.props, {
      prefixCls: prefixCls17,
      type,
      className,
      children,
      tagName
    } = _a, others = __rest17(_a, ["prefixCls", "type", "className", "children", "tagName"]);
    const classString = (0, import_classnames18.default)(className, `${prefixCls17}-${type}`);
    return /* @__PURE__ */ import_react36.default.createElement(tagName, Object.assign({
      className: classString
    }, others), children);
  }
};
Basic.propTypes = {
  prefixCls: import_prop_types21.default.string,
  style: import_prop_types21.default.object,
  className: import_prop_types21.default.string
};
Basic.defaultProps = {
  prefixCls: cssClasses9.PREFIX
};
var Header = generator("Header")(Basic);
var Footer = generator("Footer")(Basic);
var Content = generator("Content")(Basic);
var Layout = class extends import_react36.default.Component {
  constructor(props) {
    super(props);
    this.state = {
      siders: []
    };
  }
  getSiderHook() {
    return {
      addSider: (id) => {
        this.setState((state) => ({
          siders: [...state.siders, id]
        }));
      },
      removeSider: (id) => {
        this.setState((state) => ({
          siders: state.siders.filter((curr) => curr !== id)
        }));
      }
    };
  }
  render() {
    const _a = this.props, {
      prefixCls: prefixCls17,
      className,
      children,
      hasSider,
      tagName
    } = _a, others = __rest17(_a, ["prefixCls", "className", "children", "hasSider", "tagName"]);
    const {
      siders
    } = this.state;
    const classString = (0, import_classnames18.default)(className, prefixCls17, {
      [`${prefixCls17}-has-sider`]: typeof hasSider === "boolean" && hasSider || siders.length > 0 || import_react36.default.Children.toArray(children).some((child) => {
        return /* @__PURE__ */ import_react36.default.isValidElement(child) && child.type && child.type.elementType === "Layout.Sider";
      })
    });
    const Tag = tagName;
    return /* @__PURE__ */ import_react36.default.createElement(layout_context_default.Provider, {
      value: {
        siderHook: this.getSiderHook()
      }
    }, /* @__PURE__ */ import_react36.default.createElement(Tag, Object.assign({
      className: classString
    }, others), children));
  }
};
Layout.propTypes = {
  prefixCls: import_prop_types21.default.string,
  style: import_prop_types21.default.object,
  className: import_prop_types21.default.string
};
Layout.defaultProps = {
  prefixCls: cssClasses9.PREFIX,
  tagName: "section"
};
Layout.Header = Header;
Layout.Footer = Footer;
Layout.Content = Content;
Layout.Sider = Sider_default;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/list/index.js
var import_noop6 = __toESM(require_noop());
var import_react40 = __toESM(require_react());
var import_classnames21 = __toESM(require_classnames());
var import_prop_types24 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/list/constants.js
var cssClasses10 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-list`
};
var strings8 = {
  SIZE: ["large", "small", "default"],
  LAYOUT: ["vertical", "horizontal"],
  ALIGN: ["flex-start", "flex-end", "center", "baseline", "stretch"]
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/list/item.js
var import_noop5 = __toESM(require_noop());
var import_react38 = __toESM(require_react());
var import_classnames19 = __toESM(require_classnames());
var import_prop_types22 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/list/list-context.js
var import_react37 = __toESM(require_react());
var ListContext = /* @__PURE__ */ import_react37.default.createContext(null);
var list_context_default = ListContext;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/list/item.js
var __rest18 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls7 = cssClasses10.PREFIX;
var ListItem = class extends import_react38.PureComponent {
  wrapWithGrid(content) {
    const {
      grid
    } = this.context;
    const {
      gutter,
      justify,
      type,
      align
    } = grid, rest = __rest18(grid, ["gutter", "justify", "type", "align"]);
    return /* @__PURE__ */ import_react38.default.createElement(col_default, Object.assign({}, rest), content);
  }
  render() {
    const _a = this.props, {
      header,
      main,
      className,
      style,
      extra,
      children,
      align,
      onClick,
      onRightClick,
      onMouseEnter,
      onMouseLeave
    } = _a, rest = __rest18(_a, ["header", "main", "className", "style", "extra", "children", "align", "onClick", "onRightClick", "onMouseEnter", "onMouseLeave"]);
    const {
      onRightClick: contextOnRightClick,
      onClick: contextOnClick,
      grid: contextGrid
    } = this.context;
    const handleContextMenu = onRightClick ? onRightClick : contextOnRightClick;
    const handleClick = onClick ? onClick : contextOnClick;
    const itemCls = (0, import_classnames19.default)(`${prefixCls7}-item`, className);
    const bodyCls = (0, import_classnames19.default)(`${prefixCls7}-item-body`, {
      [`${prefixCls7}-item-body-${align}`]: align
    });
    let body;
    if (header || main) {
      body = /* @__PURE__ */ import_react38.default.createElement("div", {
        className: bodyCls
      }, header ? /* @__PURE__ */ import_react38.default.createElement("div", {
        className: `${prefixCls7}-item-body-header`
      }, header) : null, main ? /* @__PURE__ */ import_react38.default.createElement("div", {
        className: `${prefixCls7}-item-body-main`
      }, main) : null);
    }
    let content = (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-noninteractive-element-interactions
      /* @__PURE__ */ import_react38.default.createElement("li", Object.assign({
        className: itemCls,
        style,
        onClick: handleClick,
        onContextMenu: handleContextMenu,
        onMouseEnter,
        onMouseLeave
      }, getDataAttr(rest)), body ? body : null, children, extra ? /* @__PURE__ */ import_react38.default.createElement("div", {
        className: `${prefixCls7}-item-extra`
      }, extra) : null)
    );
    if (this.context && contextGrid) {
      content = this.wrapWithGrid(content);
    }
    return content;
  }
};
ListItem.contextType = list_context_default;
ListItem.propTypes = {
  extra: import_prop_types22.default.node,
  header: import_prop_types22.default.node,
  main: import_prop_types22.default.node,
  align: import_prop_types22.default.oneOf(strings8.ALIGN),
  className: import_prop_types22.default.string,
  children: import_prop_types22.default.node,
  style: import_prop_types22.default.object,
  onClick: import_prop_types22.default.func,
  onRightClick: import_prop_types22.default.func,
  onMouseEnter: import_prop_types22.default.func,
  onMouseLeave: import_prop_types22.default.func
};
ListItem.defaultProps = {
  align: "flex-start",
  onMouseEnter: import_noop5.default,
  onMouseLeave: import_noop5.default
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/spin/index.js
var import_react39 = __toESM(require_react());
var import_prop_types23 = __toESM(require_prop_types());
var import_classnames20 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/spin/constants.js
var PREFIX = `${BASE_CLASS_PREFIX2}-spin`;
var cssClasses11 = {
  PREFIX
};
var strings9 = {
  SIZE: ["small", "middle", "large"]
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/spin/foundation.js
var SpinFoundation = class extends foundation_default {
  static get spinDefaultAdapter() {
    return {
      getProp: () => void 0,
      setLoading: (val) => void 0
    };
  }
  constructor(adapter) {
    super(Object.assign(Object.assign({}, SpinFoundation.spinDefaultAdapter), adapter));
  }
  updateLoadingIfNeedDelay() {
    const {
      spinning: propsSpinning,
      delay: propsDelay
    } = this._adapter.getProps();
    const {
      delay
    } = this._adapter.getStates();
    if (delay) {
      const self2 = this;
      this._timer = setTimeout(() => {
        self2._adapter.setState({
          loading: propsSpinning,
          delay: 0
        });
      }, propsDelay);
    }
  }
  destroy() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
};
var foundation_default2 = SpinFoundation;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/spin/index.js
var __rest19 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls8 = cssClasses11.PREFIX;
var Spin = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.foundation = new foundation_default2(this.adapter);
    this.state = {
      delay: props.delay,
      loading: true
    };
  }
  static getDerivedStateFromProps(props) {
    if (!props.delay) {
      return {
        loading: props.spinning
      };
    }
    if (props.spinning === false) {
      return {
        delay: 0,
        loading: false
      };
    }
    return {
      delay: props.delay
    };
  }
  get adapter() {
    return Object.assign(Object.assign({}, super.adapter), {
      setLoading: (value) => {
        this.setState({
          loading: value
        });
      }
    });
  }
  componentWillUnmount() {
    this.foundation.destroy();
  }
  renderSpin() {
    const {
      indicator,
      tip
    } = this.props;
    const {
      loading
    } = this.state;
    return loading ? /* @__PURE__ */ import_react39.default.createElement("div", {
      className: `${prefixCls8}-wrapper`
    }, indicator ? /* @__PURE__ */ import_react39.default.createElement("div", {
      className: `${prefixCls8}-animate`,
      "x-semi-prop": "indicator"
    }, indicator) : /* @__PURE__ */ import_react39.default.createElement(icon_default, null), tip ? /* @__PURE__ */ import_react39.default.createElement("div", {
      "x-semi-prop": "tip"
    }, tip) : null) : null;
  }
  render() {
    this.foundation.updateLoadingIfNeedDelay();
    const _a = this.props, {
      children,
      style,
      wrapperClassName,
      childStyle,
      size
    } = _a, rest = __rest19(_a, ["children", "style", "wrapperClassName", "childStyle", "size"]);
    const {
      loading
    } = this.state;
    const spinCls = (0, import_classnames20.default)(prefixCls8, wrapperClassName, {
      [`${prefixCls8}-${size}`]: size,
      [`${prefixCls8}-block`]: children,
      [`${prefixCls8}-hidden`]: !loading
    });
    return /* @__PURE__ */ import_react39.default.createElement("div", Object.assign({
      className: spinCls,
      style
    }, this.getDataAttr(rest)), this.renderSpin(), /* @__PURE__ */ import_react39.default.createElement("div", {
      className: `${prefixCls8}-children`,
      style: childStyle,
      "x-semi-prop": "children"
    }, children));
  }
};
Spin.propTypes = {
  size: import_prop_types23.default.oneOf(strings9.SIZE),
  spinning: import_prop_types23.default.bool,
  children: import_prop_types23.default.node,
  indicator: import_prop_types23.default.node,
  delay: import_prop_types23.default.number,
  tip: import_prop_types23.default.node,
  wrapperClassName: import_prop_types23.default.string,
  childStyle: import_prop_types23.default.object,
  style: import_prop_types23.default.object
};
Spin.defaultProps = {
  size: "middle",
  spinning: true,
  children: null,
  indicator: null,
  delay: 0
};
var spin_default = Spin;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/list/index.js
var __rest20 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls9 = cssClasses10.PREFIX;
var List = class extends BaseComponent {
  constructor() {
    super(...arguments);
    this.renderEmpty = () => {
      const {
        emptyContent
      } = this.props;
      if (emptyContent) {
        return /* @__PURE__ */ import_react40.default.createElement("div", {
          className: `${cssClasses10.PREFIX}-empty`,
          "x-semi-prop": "emptyContent"
        }, emptyContent);
      } else {
        return /* @__PURE__ */ import_react40.default.createElement(LocaleConsumer, {
          componentName: "List"
        }, (locale2) => /* @__PURE__ */ import_react40.default.createElement("div", {
          className: `${cssClasses10.PREFIX}-empty`
        }, locale2.emptyText));
      }
    };
  }
  wrapChildren(childrenList, children) {
    const {
      grid
    } = this.props;
    if (grid) {
      const rowProps = {};
      ["align", "gutter", "justify", "type"].forEach((key) => {
        if (key in grid) {
          rowProps[key] = grid[key];
        }
      });
      return /* @__PURE__ */ import_react40.default.createElement(row_default, Object.assign({
        type: "flex"
      }, rowProps), childrenList ? childrenList : null, children);
    }
    return /* @__PURE__ */ import_react40.default.createElement("ul", {
      className: `${prefixCls9}-items`
    }, childrenList ? childrenList : null, children);
  }
  render() {
    const _a = this.props, {
      style,
      className,
      header,
      loading,
      onRightClick,
      onClick,
      footer,
      layout,
      grid,
      size,
      split,
      loadMore,
      bordered,
      dataSource,
      renderItem,
      children
    } = _a, rest = __rest20(_a, ["style", "className", "header", "loading", "onRightClick", "onClick", "footer", "layout", "grid", "size", "split", "loadMore", "bordered", "dataSource", "renderItem", "children"]);
    const wrapperCls = (0, import_classnames21.default)(prefixCls9, className, {
      [`${prefixCls9}-flex`]: layout === "horizontal",
      [`${prefixCls9}-${size}`]: size,
      [`${prefixCls9}-grid`]: grid,
      [`${prefixCls9}-split`]: split,
      [`${prefixCls9}-bordered`]: bordered
    });
    let childrenList;
    if (dataSource && dataSource.length) {
      childrenList = [];
      const items = renderItem ? dataSource.map((item, index) => renderItem(item, index)) : [];
      import_react40.default.Children.forEach(items, (child, index) => {
        const itemKey = child.key || `list-item-${index}`;
        childrenList.push(/* @__PURE__ */ import_react40.default.cloneElement(child, {
          key: itemKey
        }));
      });
    } else if (!children && !loading) {
      childrenList = this.renderEmpty();
    }
    return /* @__PURE__ */ import_react40.default.createElement("div", Object.assign({
      className: wrapperCls,
      style
    }, this.getDataAttr(rest)), header ? /* @__PURE__ */ import_react40.default.createElement("div", {
      className: `${cssClasses10.PREFIX}-header`,
      "x-semi-prop": "header"
    }, header) : null, /* @__PURE__ */ import_react40.default.createElement(list_context_default.Provider, {
      value: {
        grid,
        onRightClick,
        onClick
      }
    }, /* @__PURE__ */ import_react40.default.createElement(spin_default, {
      spinning: loading,
      size: "large"
    }, this.wrapChildren(childrenList, children))), footer ? /* @__PURE__ */ import_react40.default.createElement("div", {
      className: `${cssClasses10.PREFIX}-footer`,
      "x-semi-prop": "footer"
    }, footer) : null, loadMore ? loadMore : null);
  }
};
List.Item = ListItem;
List.propTypes = {
  style: import_prop_types24.default.object,
  className: import_prop_types24.default.string,
  bordered: import_prop_types24.default.bool,
  footer: import_prop_types24.default.node,
  header: import_prop_types24.default.node,
  layout: import_prop_types24.default.oneOf(strings8.LAYOUT),
  size: import_prop_types24.default.oneOf(strings8.SIZE),
  split: import_prop_types24.default.bool,
  emptyContent: import_prop_types24.default.node,
  dataSource: import_prop_types24.default.array,
  renderItem: import_prop_types24.default.func,
  grid: import_prop_types24.default.object,
  loading: import_prop_types24.default.bool,
  loadMore: import_prop_types24.default.node,
  onRightClick: import_prop_types24.default.func,
  onClick: import_prop_types24.default.func
};
List.defaultProps = {
  bordered: false,
  split: true,
  loading: false,
  layout: "vertical",
  size: "default",
  onRightClick: import_noop6.default,
  onClick: import_noop6.default
};
var list_default = List;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/index.js
var import_isEqual4 = __toESM(require_isEqual());
var import_get13 = __toESM(require_get());
var import_noop12 = __toESM(require_noop());
var import_react54 = __toESM(require_react());
var import_prop_types35 = __toESM(require_prop_types());
var import_classnames32 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/navigation/foundation.js
var import_get9 = __toESM(require_get());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/navigation/constants.js
var MODE_HORIZONTAL = "horizontal";
var MODE_VERTICAL = "vertical";
var cssClasses12 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-navigation`
};
var strings10 = {
  MODE: [MODE_VERTICAL, MODE_HORIZONTAL],
  MODE_VERTICAL,
  MODE_HORIZONTAL,
  ICON_POS_LEFT: "left",
  ICON_POS_RIGHT: "right",
  DEFAULT_LOGO_ICON_SIZE: "extra-large",
  TOGGLE_ICON_LEFT: "left",
  TOGGLE_ICON_RIGHT: "right"
};
var numbers3 = {
  DEFAULT_SUBNAV_MAX_HEIGHT: 999,
  DEFAULT_TOOLTIP_SHOW_DELAY: 0,
  DEFAULT_TOOLTIP_HIDE_DELAY: 100,
  DEFAULT_SUBNAV_OPEN_DELAY: 0,
  DEFAULT_SUBNAV_CLOSE_DELAY: 100
  // ms
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/navigation/NavItem.js
var DEFAULT_TOGGLE_ICON = {
  open: "chevron_up",
  closed: "chevron_down"
};
var NavItem = class {
  constructor() {
    let options = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    if (options == null || typeof options !== "object") {
      options = {
        text: options,
        itemKey: options,
        maxHeight: numbers3.DEFAULT_SUBNAV_MAX_HEIGHT,
        // selected: false,
        // isOpen: false,
        link: null,
        items: null,
        icon: "",
        indent: false
      };
    }
    for (const key of Object.keys(options)) {
      this[key] = options[key];
    }
    if (options.items && Array.isArray(options.items) && options.items.length) {
      this.items = options.items.map((item) => new NavItem(item));
      if ("toggleIcon" in options) {
        this.toggleIcon = NavItem.isValidToggleIcon(options.toggleIcon) ? Object.assign({}, options.toggleIcon) : Object.assign({}, DEFAULT_TOGGLE_ICON);
      } else {
        this.toggleIcon = Object.assign({}, DEFAULT_TOGGLE_ICON);
      }
    } else {
      this.items = null;
    }
  }
  static isValidToggleIcon(toggleIcon) {
    return Boolean(toggleIcon && typeof toggleIcon === "object" && typeof toggleIcon.open === "string" && toggleIcon.open.length && typeof toggleIcon.closed === "string" && toggleIcon.closed.length);
  }
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/navigation/foundation.js
var NavigationFoundation = class extends foundation_default {
  constructor(adapter) {
    super(Object.assign({}, adapter));
  }
  /* istanbul ignore next */
  static getZeroParentKeys() {
    let itemKeysMap = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    const willAddKeys = [];
    for (var _len = arguments.length, itemKeys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      itemKeys[_key - 1] = arguments[_key];
    }
    if (itemKeys.length) {
      for (const itemKey of itemKeys) {
        if (Array.isArray(itemKeysMap[itemKey]) && itemKeysMap[itemKey].length) {
          const levelZeroParentKey = itemKeysMap[itemKey][0];
          if (!isNullOrUndefined(levelZeroParentKey)) {
            willAddKeys.push(levelZeroParentKey);
          }
        }
      }
    }
    return willAddKeys;
  }
  static buildItemKeysMap() {
    let items = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    let keysMap = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : {};
    let parentKeys = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
    let keyPropName = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : "itemKey";
    if (Array.isArray(items) && items.length) {
      for (const item of items) {
        if (Array.isArray(item)) {
          NavigationFoundation.buildItemKeysMap(item, keysMap, [...parentKeys], keyPropName);
        } else {
          let itemKey;
          if (item && typeof item === "object") {
            itemKey = item[keyPropName] || item.props && item.props[keyPropName];
          }
          if (itemKey) {
            keysMap[itemKey] = [...parentKeys];
            if (Array.isArray(item.items) && item.items.length) {
              NavigationFoundation.buildItemKeysMap(item.items, keysMap, [...parentKeys, itemKey], keyPropName);
            } else if (item.props && item.props.children) {
              const children = Array.isArray(item.props.children) ? item.props.children : [item.props.children];
              NavigationFoundation.buildItemKeysMap(children, keysMap, [...parentKeys, itemKey], keyPropName);
            }
          }
        }
      }
    }
    return keysMap;
  }
  /**
   * init is called in constructor and componentDidMount.
   * if you want to update state in constructor, please add it to return object;
   * if you want to update state in componentDidMount, please call adapter in else logic.
   * @param {*} lifecycle
   * @returns
   */
  init(lifecycle) {
    const {
      defaultSelectedKeys,
      selectedKeys
    } = this.getProps();
    let willSelectedKeys = selectedKeys || defaultSelectedKeys || [];
    const {
      itemKeysMap,
      willOpenKeys,
      formattedItems
    } = this.getCalcState();
    const parentSelectKeys = this.selectLevelZeroParentKeys(itemKeysMap, willSelectedKeys);
    willSelectedKeys = willSelectedKeys.concat(parentSelectKeys);
    if (lifecycle === "constructor") {
      return {
        selectedKeys: willSelectedKeys,
        itemKeysMap,
        openKeys: willOpenKeys,
        items: formattedItems
      };
    } else {
      this._adapter.updateSelectedKeys(willSelectedKeys, false);
      this._adapter.setItemKeysMap(itemKeysMap);
      this._adapter.updateOpenKeys(willOpenKeys);
      this._adapter.updateItems(formattedItems);
      this._adapter.setItemsChanged(true);
    }
    return void 0;
  }
  /**
   * Get the state to be calculated
   */
  getCalcState() {
    const {
      itemKeysMap,
      formattedItems
    } = this.getFormattedItems();
    const willOpenKeys = this.getWillOpenKeys(itemKeysMap);
    return {
      itemKeysMap,
      willOpenKeys,
      formattedItems
    };
  }
  /**
   * Calculate formatted items and itemsKeyMap
   */
  getFormattedItems() {
    const {
      items,
      children
    } = this.getProps();
    const formattedItems = this.formatItems(items);
    const willHandleItems = Array.isArray(items) && items.length ? formattedItems : children;
    const itemKeysMap = NavigationFoundation.buildItemKeysMap(willHandleItems);
    return {
      itemKeysMap,
      formattedItems
    };
  }
  /**
   * Calculate the keys that will need to be opened soon
   * @param {*} itemKeysMap
   */
  getWillOpenKeys(itemKeysMap) {
    const {
      defaultOpenKeys,
      openKeys,
      defaultSelectedKeys,
      selectedKeys,
      mode
    } = this.getProps();
    const {
      openKeys: stateOpenKeys = []
    } = this.getStates();
    let willOpenKeys = openKeys || defaultOpenKeys || [];
    if (!(Array.isArray(defaultOpenKeys) || Array.isArray(openKeys)) && mode === strings10.MODE_VERTICAL && (Array.isArray(defaultSelectedKeys) || Array.isArray(selectedKeys))) {
      const currentSelectedKeys = Array.isArray(selectedKeys) ? selectedKeys : defaultSelectedKeys;
      willOpenKeys = stateOpenKeys.concat(this.getShouldOpenKeys(itemKeysMap, currentSelectedKeys));
      willOpenKeys = Array.from(new Set(willOpenKeys));
    }
    return [...willOpenKeys];
  }
  getShouldOpenKeys() {
    let itemKeysMap = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
    let selectedKeys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
    const willOpenKeySet = /* @__PURE__ */ new Set();
    if (Array.isArray(selectedKeys) && selectedKeys.length) {
      selectedKeys.forEach((item) => {
        if (item) {
          const parentKeys = (0, import_get9.default)(itemKeysMap, item);
          if (Array.isArray(parentKeys)) {
            parentKeys.forEach((k) => willOpenKeySet.add(k));
          }
        }
      });
    }
    return [...willOpenKeySet];
  }
  destroy() {
  }
  selectLevelZeroParentKeys(itemKeysMap, itemKeys) {
    const _itemKeysMap = isNullOrUndefined(itemKeysMap) ? this.getState("itemKeysMap") : itemKeysMap;
    const willAddKeys = [];
    if (itemKeys.length) {
      for (const itemKey of itemKeys) {
        if (Array.isArray(_itemKeysMap[itemKey]) && _itemKeysMap[itemKey].length) {
          const levelZeroParentKey = _itemKeysMap[itemKey][0];
          if (!isNullOrUndefined(levelZeroParentKey)) {
            willAddKeys.push(levelZeroParentKey);
          }
        }
      }
    }
    if (willAddKeys.length) {
      return willAddKeys;
    }
    return [];
  }
  formatItems() {
    let items = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    const formattedItems = [];
    for (const item of items) {
      formattedItems.push(new NavItem(item));
    }
    return formattedItems;
  }
  handleSelect(data) {
    this._adapter.notifySelect(data);
  }
  /* istanbul ignore next */
  judgeIfOpen(openKeys, items) {
    let shouldBeOpen = false;
    const _openKeys = Array.isArray(openKeys) ? openKeys : openKeys && [openKeys];
    if (_openKeys && Array.isArray(items) && items.length) {
      for (const item of items) {
        shouldBeOpen = _openKeys.includes(item.itemKey) || this.judgeIfOpen(_openKeys, item.items);
        if (shouldBeOpen) {
          break;
        }
      }
    }
    return shouldBeOpen;
  }
  handleCollapseChange() {
    const isCollapsed = !this.getState("isCollapsed");
    if (!this._isControlledComponent("isCollapsed")) {
      this._adapter.setIsCollapsed(isCollapsed);
    }
    this._adapter.notifyCollapseChange(isCollapsed);
  }
  handleItemsChange(isChanged) {
    this._adapter.setItemsChanged(isChanged);
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/SubNav.js
var import_get12 = __toESM(require_get());
var import_times2 = __toESM(require_times());
var import_react50 = __toESM(require_react());
var import_prop_types32 = __toESM(require_prop_types());
var import_classnames29 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/navigation/subNavFoundation.js
var addKeys = function addKeys2() {
  let originKeys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  const keySet = new Set(originKeys);
  for (var _len = arguments.length, willAddKeys = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    willAddKeys[_key - 1] = arguments[_key];
  }
  willAddKeys.forEach((key) => key && keySet.add(key));
  return Array.from(keySet);
};
var removeKeys = function removeKeys2() {
  let originKeys = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
  const keySet = new Set(originKeys);
  for (var _len2 = arguments.length, willRemoveKeys = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
    willRemoveKeys[_key2 - 1] = arguments[_key2];
  }
  willRemoveKeys.forEach((key) => key && keySet.delete(key));
  return Array.from(keySet);
};
var SubNavFoundation = class extends foundation_default {
  constructor(adapter) {
    super(Object.assign({}, adapter));
  }
  init() {
    this._timer = null;
  }
  destroy() {
    this.clearDelayTimer();
  }
  clearDelayTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  isValidKey(itemKey) {
    return itemKey != null && (typeof itemKey === "number" || typeof itemKey === "string");
  }
  handleDropdownVisibleChange(visible) {
    const itemKey = this.getProp("itemKey");
    const openKeysIsControlled = this._adapter.getOpenKeysIsControlled();
    const canUpdateOpenKeys = this._adapter.getCanUpdateOpenKeys();
    const rawOpenKeys = this._adapter.getOpenKeys();
    const openKeys = visible ? addKeys(rawOpenKeys, itemKey) : removeKeys(rawOpenKeys, itemKey);
    this.clearDelayTimer();
    if (!openKeysIsControlled) {
      if (canUpdateOpenKeys) {
        this._adapter.updateOpen(visible);
      }
    }
    this._adapter.notifyGlobalOpenChange({
      itemKey,
      openKeys,
      isOpen: visible
    });
  }
  /**
   *
   * @param {Event} e
   * @param {HTMLElement} titleRef
   */
  handleClick(e, titleRef) {
    const {
      itemKey,
      disabled
    } = this.getProps();
    if (disabled) {
      return;
    }
    const clickedDomIsTitle = titleRef && titleRef.contains(e.target);
    let isOpen = Boolean(this._adapter.getIsOpen());
    if (!clickedDomIsTitle) {
      isOpen = false;
    } else {
      isOpen = !isOpen;
    }
    const openKeys = isOpen ? addKeys(this._adapter.getOpenKeys(), itemKey) : removeKeys(this._adapter.getOpenKeys(), itemKey);
    const cbVal = {
      itemKey,
      openKeys,
      isOpen,
      domEvent: e
    };
    const openKeysIsControlled = this._adapter.getOpenKeysIsControlled();
    const canUpdateOpenKeys = this._adapter.getCanUpdateOpenKeys();
    if (!openKeysIsControlled && canUpdateOpenKeys) {
      this._adapter.updateOpen(isOpen);
    }
    this._adapter.notifyGlobalOpenChange(cbVal);
    this._adapter.notifyGlobalOnClick(cbVal);
  }
  /**
   * A11y: simulate sub nav click
   * @param e
   * @param titleRef
   */
  handleKeyPress(e, titleRef) {
    if (isEnterPress_default(e)) {
      this.handleClick(e, titleRef);
    }
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/Item.js
var import_times = __toESM(require_times());
var import_noop9 = __toESM(require_noop());
var import_react48 = __toESM(require_react());
var import_prop_types30 = __toESM(require_prop_types());
var import_classnames27 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/navigation/itemFoundation.js
var import_get10 = __toESM(require_get());
var ItemFoundation = class extends foundation_default {
  constructor(adapter) {
    super(Object.assign({}, adapter));
  }
  init() {
    this._timer = null;
    this._mounted = true;
  }
  destroy() {
    this._mounted = false;
  }
  isValidKey(itemKey) {
    return itemKey != null && (typeof itemKey === "string" || typeof itemKey === "number");
  }
  handleClick(e) {
    const {
      isSubNav,
      itemKey,
      text,
      disabled
    } = this.getProps();
    if (disabled) {
      return;
    }
    if (!isSubNav && this.isValidKey(itemKey) && !this._adapter.getSelectedKeysIsControlled() && !this._adapter.getSelected()) {
      this._adapter.updateSelected(true);
    }
    const selectedKeys = [itemKey];
    if (!isSubNav) {
      if (!this._adapter.getSelected()) {
        const selectedItems = [this._adapter.cloneDeep(this.getProps())];
        this._adapter.notifyGlobalOnSelect({
          itemKey,
          selectedKeys,
          selectedItems,
          domEvent: e
        });
      }
      this._adapter.notifyGlobalOnClick({
        itemKey,
        text,
        domEvent: e
      });
    }
    this._adapter.notifyClick({
      itemKey,
      text,
      domEvent: e
    });
  }
  /**
   * A11y: simulate item click
   */
  handleKeyPress(e) {
    if (isEnterPress_default(e)) {
      const {
        link,
        linkOptions
      } = this.getProps();
      const target = (0, import_get10.default)(linkOptions, "target", "_self");
      this.handleClick(e);
      if (typeof link === "string") {
        target === "_blank" ? window.open(link) : window.location.href = link;
      }
    }
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/nav-context.js
var import_react41 = __toESM(require_react());
var NavContext = /* @__PURE__ */ import_react41.default.createContext({
  isCollapsed: false,
  selectedKeys: [],
  openKeys: []
});
var nav_context_default = NavContext;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/index.js
var import_get11 = __toESM(require_get());
var import_noop8 = __toESM(require_noop());
var import_react47 = __toESM(require_react());
var import_classnames26 = __toESM(require_classnames());
var import_prop_types29 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/dropdown/constants.js
var cssClasses13 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-dropdown`,
  SELECTED: `${BASE_CLASS_PREFIX2}-dropdown-item-selected`,
  DISABLED: `${BASE_CLASS_PREFIX2}-dropdown-item-disabled`
};
var strings11 = {
  POSITION_SET: strings2.POSITION_SET,
  TRIGGER_SET: ["hover", "focus", "click", "custom", "contextMenu"],
  DEFAULT_LEAVE_DELAY: 100,
  ITEM_TYPE: ["primary", "secondary", "tertiary", "warning", "danger"]
};
var numbers4 = {
  SPACING: 4,
  NESTED_SPACING: 2
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/dropdown/foundation.js
var DropdownFoundation = class extends foundation_default {
  handleVisibleChange(visible) {
    this._adapter.setPopVisible(visible);
    this._adapter.notifyVisibleChange(visible);
    const {
      trigger
    } = this.getProps();
    if (visible && trigger === "click") {
      const popupId = this._adapter.getPopupId();
      this.setFocusToFirstMenuItem(popupId);
    }
  }
  getMenuItemNodes(id) {
    const menuWrapper = document.getElementById(id);
    return menuWrapper ? Array.from(menuWrapper.getElementsByTagName("li")).filter((item) => item.ariaDisabled === "false") : null;
  }
  setFocusToFirstMenuItem(id) {
    const menuItemNodes = this.getMenuItemNodes(id);
    menuItemNodes && setFocusToFirstItem(menuItemNodes);
  }
  setFocusToLastMenuItem(id) {
    const menuItemNodes = this.getMenuItemNodes(id);
    menuItemNodes && setFocusToLastItem(menuItemNodes);
  }
  handleKeyDown(event) {
    var _a, _b;
    const id = (_b = (_a = event.target) === null || _a === void 0 ? void 0 : _a.attributes["data-popupid"]) === null || _b === void 0 ? void 0 : _b.value;
    const {
      visible
    } = this._adapter.getStates();
    switch (event.key) {
      case " ":
      case "Enter":
        event.target.click();
        break;
      case "ArrowDown":
        this.setFocusToFirstMenuItem(id);
        visible && handlePrevent(event);
        break;
      case "ArrowUp":
        this.setFocusToLastMenuItem(id);
        visible && handlePrevent(event);
        break;
      default:
        break;
    }
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/dropdownMenu.js
var import_react43 = __toESM(require_react());
var import_prop_types25 = __toESM(require_prop_types());
var import_classnames22 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/dropdown/menuFoundation.js
var DropdownMenuFoundation = class extends foundation_default {
  constructor() {
    super(...arguments);
    this.menuItemNodes = null;
    this.firstChars = [];
  }
  handleEscape(menu) {
    const trigger = this._adapter.getContext("trigger");
    if (trigger === "custom") {
      const menuButton = menu && getMenuButton(document.querySelectorAll(`[data-popupid]`), menu.id);
      menuButton.focus();
    }
  }
  setFocusByFirstCharacter(curItem, char) {
    const index = findIndexByCharacter(this.menuItemNodes, curItem, this.firstChars, char);
    if (index >= 0) {
      setFocusToItem(this.menuItemNodes, this.menuItemNodes[index]);
    }
  }
  onMenuKeydown(event) {
    const menu = getAncestorNodeByRole(event.target, "tooltip");
    if (!this.menuItemNodes) {
      this.menuItemNodes = [...event.target.parentNode.getElementsByTagName("li")].filter((item) => item.ariaDisabled !== "true");
    }
    if (this.firstChars.length === 0) {
      this.menuItemNodes.forEach((item) => {
        var _a;
        this.firstChars.push((_a = item.textContent.trim()[0]) === null || _a === void 0 ? void 0 : _a.toLowerCase());
      });
    }
    const curItem = this.menuItemNodes.find((item) => item.tabIndex === 0);
    switch (event.key) {
      case " ":
      case "Enter":
        event.target.click();
        break;
      case "Escape":
        this.handleEscape(menu);
        break;
      case "ArrowUp":
        setFocusToPreviousMenuItem(this.menuItemNodes, curItem);
        handlePrevent(event);
        break;
      case "ArrowDown":
        setFocusToNextMenuitem(this.menuItemNodes, curItem);
        handlePrevent(event);
        break;
      default:
        if (isPrintableCharacter(event.key)) {
          this.setFocusByFirstCharacter(curItem, event.key);
        }
        break;
    }
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/context.js
var import_react42 = __toESM(require_react());
var DropdownContext = /* @__PURE__ */ import_react42.default.createContext({
  level: 0
});
var context_default4 = DropdownContext;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/dropdownMenu.js
var __rest21 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls10 = cssClasses13.PREFIX;
var DropdownMenu = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.foundation = new DropdownMenuFoundation(this.adapter);
  }
  get adapter() {
    return Object.assign({}, super.adapter);
  }
  render() {
    const _a = this.props, {
      children,
      className,
      style
    } = _a, rest = __rest21(_a, ["children", "className", "style"]);
    return /* @__PURE__ */ import_react43.default.createElement("ul", Object.assign({
      role: "menu",
      "aria-orientation": "vertical"
    }, rest, {
      className: (0, import_classnames22.default)(`${prefixCls10}-menu`, className),
      style,
      onKeyDown: (e) => this.foundation.onMenuKeydown(e)
    }), children);
  }
};
DropdownMenu.propTypes = {
  children: import_prop_types25.default.node,
  className: import_prop_types25.default.string,
  style: import_prop_types25.default.object
};
DropdownMenu.contextType = context_default4;
var dropdownMenu_default = DropdownMenu;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/dropdownItem.js
var import_noop7 = __toESM(require_noop());
var import_react44 = __toESM(require_react());
var import_classnames23 = __toESM(require_classnames());
var import_prop_types26 = __toESM(require_prop_types());
var prefixCls11 = cssClasses13.PREFIX;
var DropdownItem = class extends BaseComponent {
  render() {
    const {
      children,
      disabled,
      className,
      forwardRef,
      style,
      type,
      active,
      icon,
      onKeyDown,
      showTick,
      hover
    } = this.props;
    const {
      showTick: contextShowTick
    } = this.context;
    const realShowTick = contextShowTick !== null && contextShowTick !== void 0 ? contextShowTick : showTick;
    const itemclass = (0, import_classnames23.default)(className, {
      [`${prefixCls11}-item`]: true,
      [`${prefixCls11}-item-disabled`]: disabled,
      [`${prefixCls11}-item-hover`]: hover,
      [`${prefixCls11}-item-withTick`]: realShowTick,
      [`${prefixCls11}-item-${type}`]: type,
      [`${prefixCls11}-item-active`]: active
    });
    const events = {};
    if (!disabled) {
      ["onClick", "onMouseEnter", "onMouseLeave", "onContextMenu"].forEach((eventName) => {
        const isInAnotherDropdown = this.context.level !== 1;
        if (isInAnotherDropdown && eventName === "onClick") {
          events["onMouseDown"] = (e) => {
            var _a, _b;
            if (e.button === 0) {
              (_b = (_a = this.props)[eventName]) === null || _b === void 0 ? void 0 : _b.call(_a, e);
            }
          };
        } else {
          events[eventName] = this.props[eventName];
        }
      });
    }
    let tick = null;
    switch (true) {
      case (realShowTick && active):
        tick = /* @__PURE__ */ import_react44.default.createElement(IconTick_default, null);
        break;
      case (realShowTick && !active):
        tick = /* @__PURE__ */ import_react44.default.createElement(IconTick_default, {
          style: {
            color: "transparent"
          }
        });
        break;
      default:
        tick = null;
        break;
    }
    let iconContent = null;
    if (icon) {
      iconContent = /* @__PURE__ */ import_react44.default.createElement("div", {
        className: `${prefixCls11}-item-icon`
      }, icon);
    }
    return /* @__PURE__ */ import_react44.default.createElement("li", Object.assign({
      role: "menuitem",
      tabIndex: -1,
      "aria-disabled": disabled
    }, events, {
      onKeyDown,
      ref: (ref2) => forwardRef(ref2),
      className: itemclass,
      style
    }, this.getDataAttr(this.props)), tick, iconContent, children);
  }
};
DropdownItem.propTypes = {
  children: import_prop_types26.default.oneOfType([import_prop_types26.default.string, import_prop_types26.default.node]),
  name: import_prop_types26.default.string,
  disabled: import_prop_types26.default.bool,
  selected: import_prop_types26.default.bool,
  onClick: import_prop_types26.default.func,
  onMouseEnter: import_prop_types26.default.func,
  onMouseLeave: import_prop_types26.default.func,
  onContextMenu: import_prop_types26.default.func,
  className: import_prop_types26.default.string,
  style: import_prop_types26.default.object,
  forwardRef: import_prop_types26.default.func,
  type: import_prop_types26.default.oneOf(strings11.ITEM_TYPE),
  active: import_prop_types26.default.bool,
  icon: import_prop_types26.default.node
};
DropdownItem.contextType = context_default4;
DropdownItem.defaultProps = {
  disabled: false,
  divided: false,
  selected: false,
  onMouseEnter: import_noop7.default,
  onMouseLeave: import_noop7.default,
  forwardRef: import_noop7.default
};
DropdownItem.elementType = "Dropdown.Item";
var dropdownItem_default = DropdownItem;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/dropdownDivider.js
var import_react45 = __toESM(require_react());
var import_classnames24 = __toESM(require_classnames());
var import_prop_types27 = __toESM(require_prop_types());
var prefixCls12 = cssClasses13.PREFIX;
var DropdownDivider = function() {
  let props = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : {};
  const {
    style,
    className
  } = props;
  return /* @__PURE__ */ import_react45.default.createElement("div", {
    className: (0, import_classnames24.default)(`${prefixCls12}-divider`, className),
    style
  });
};
DropdownDivider.propTypes = {
  style: import_prop_types27.default.object,
  className: import_prop_types27.default.string
};
var dropdownDivider_default = DropdownDivider;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/dropdownTitle.js
var import_react46 = __toESM(require_react());
var import_prop_types28 = __toESM(require_prop_types());
var import_classnames25 = __toESM(require_classnames());
var prefixCls13 = cssClasses13.PREFIX;
var DropdownTitle = class extends import_react46.PureComponent {
  render() {
    const {
      className,
      style,
      children
    } = this.props;
    const {
      showTick
    } = this.context;
    const titleCls = (0, import_classnames25.default)({
      [`${prefixCls13}-title`]: true,
      [`${prefixCls13}-title-withTick`]: showTick
    }, className);
    return /* @__PURE__ */ import_react46.default.createElement("div", {
      className: titleCls,
      style
    }, children);
  }
};
DropdownTitle.propTypes = {
  children: import_prop_types28.default.node,
  className: import_prop_types28.default.string,
  style: import_prop_types28.default.object
};
DropdownTitle.contextType = context_default4;
var dropdownTitle_default = DropdownTitle;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/dropdown/index.js
var __rest22 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var positionSet3 = strings11.POSITION_SET;
var triggerSet3 = strings11.TRIGGER_SET;
var Dropdown = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleVisibleChange = (visible) => this.foundation.handleVisibleChange(visible);
    this.state = {
      popVisible: props.visible
    };
    this.foundation = new DropdownFoundation(this.adapter);
    this.tooltipRef = /* @__PURE__ */ import_react47.default.createRef();
  }
  get adapter() {
    return Object.assign(Object.assign({}, super.adapter), {
      setPopVisible: (popVisible) => this.setState({
        popVisible
      }),
      notifyVisibleChange: (visible) => {
        var _a, _b;
        return (_b = (_a = this.props).onVisibleChange) === null || _b === void 0 ? void 0 : _b.call(_a, visible);
      },
      getPopupId: () => this.tooltipRef.current.getPopupId()
    });
  }
  renderContent() {
    const {
      render,
      menu,
      contentClassName,
      style,
      showTick,
      prefixCls: prefixCls17,
      trigger
    } = this.props;
    const className = (0, import_classnames26.default)(prefixCls17, contentClassName);
    const {
      level = 0
    } = this.context;
    const contextValue = {
      showTick,
      level: level + 1,
      trigger
    };
    let content = null;
    if (/* @__PURE__ */ import_react47.default.isValidElement(render)) {
      content = render;
    } else if (Array.isArray(menu)) {
      content = this.renderMenu();
    }
    return /* @__PURE__ */ import_react47.default.createElement(context_default4.Provider, {
      value: contextValue
    }, /* @__PURE__ */ import_react47.default.createElement("div", {
      className,
      style
    }, /* @__PURE__ */ import_react47.default.createElement("div", {
      className: `${prefixCls17}-content`,
      "x-semi-prop": "render"
    }, content)));
  }
  renderMenu() {
    const {
      menu
    } = this.props;
    const content = menu.map((m, index) => {
      switch (m.node) {
        case "title": {
          const {
            name,
            node
          } = m, rest = __rest22(m, ["name", "node"]);
          return /* @__PURE__ */ import_react47.default.createElement(Dropdown.Title, Object.assign({}, rest, {
            key: node + name + index
          }), name);
        }
        case "item": {
          const {
            node,
            name
          } = m, rest = __rest22(m, ["node", "name"]);
          return /* @__PURE__ */ import_react47.default.createElement(Dropdown.Item, Object.assign({}, rest, {
            key: node + name + index
          }), name);
        }
        case "divider": {
          return /* @__PURE__ */ import_react47.default.createElement(Dropdown.Divider, {
            key: m.node + index
          });
        }
        default:
          return null;
      }
    });
    return /* @__PURE__ */ import_react47.default.createElement(Dropdown.Menu, null, content);
  }
  renderPopCard() {
    const {
      render,
      contentClassName,
      style,
      showTick,
      prefixCls: prefixCls17
    } = this.props;
    const className = (0, import_classnames26.default)(prefixCls17, contentClassName);
    const {
      level = 0
    } = this.context;
    const contextValue = {
      showTick,
      level: level + 1
    };
    return /* @__PURE__ */ import_react47.default.createElement(context_default4.Provider, {
      value: contextValue
    }, /* @__PURE__ */ import_react47.default.createElement("div", {
      className,
      style
    }, /* @__PURE__ */ import_react47.default.createElement("div", {
      className: `${prefixCls17}-content`
    }, render)));
  }
  render() {
    const _a = this.props, {
      children,
      position,
      trigger,
      onVisibleChange,
      zIndex,
      className,
      motion,
      margin,
      style,
      prefixCls: prefixCls17
    } = _a, attr = __rest22(_a, ["children", "position", "trigger", "onVisibleChange", "zIndex", "className", "motion", "margin", "style", "prefixCls"]);
    let {
      spacing
    } = this.props;
    const {
      level
    } = this.context;
    const {
      popVisible
    } = this.state;
    const pop = this.renderContent();
    if (level > 0) {
      spacing = typeof spacing === "number" ? spacing : numbers4.NESTED_SPACING;
    } else if (spacing === null || typeof spacing === "undefined") {
      spacing = numbers4.SPACING;
    }
    return /* @__PURE__ */ import_react47.default.createElement(Tooltip2, Object.assign({
      zIndex,
      motion,
      margin,
      content: pop,
      className,
      prefixCls: prefixCls17,
      spacing,
      position,
      trigger,
      onVisibleChange: this.handleVisibleChange,
      showArrow: false,
      returnFocusOnClose: true,
      ref: this.tooltipRef
    }, attr), /* @__PURE__ */ import_react47.default.isValidElement(children) ? /* @__PURE__ */ import_react47.default.cloneElement(children, {
      //@ts-ignore
      className: (0, import_classnames26.default)((0, import_get11.default)(children, "props.className"), {
        [`${prefixCls17}-showing`]: popVisible
      }),
      "aria-haspopup": true,
      "aria-expanded": popVisible,
      onKeyDown: (e) => {
        this.foundation.handleKeyDown(e);
        const childrenKeyDown = (0, import_get11.default)(children, "props.onKeyDown");
        childrenKeyDown && childrenKeyDown(e);
      }
    }) : children);
  }
};
Dropdown.Menu = dropdownMenu_default;
Dropdown.Item = dropdownItem_default;
Dropdown.Divider = dropdownDivider_default;
Dropdown.Title = dropdownTitle_default;
Dropdown.contextType = context_default4;
Dropdown.propTypes = {
  children: import_prop_types29.default.node,
  contentClassName: import_prop_types29.default.oneOfType([import_prop_types29.default.string, import_prop_types29.default.array]),
  className: import_prop_types29.default.string,
  getPopupContainer: import_prop_types29.default.func,
  margin: import_prop_types29.default.oneOfType([import_prop_types29.default.number, import_prop_types29.default.object]),
  mouseEnterDelay: import_prop_types29.default.number,
  mouseLeaveDelay: import_prop_types29.default.number,
  menu: import_prop_types29.default.array,
  motion: import_prop_types29.default.oneOfType([import_prop_types29.default.bool, import_prop_types29.default.func, import_prop_types29.default.object]),
  onVisibleChange: import_prop_types29.default.func,
  prefixCls: import_prop_types29.default.string,
  position: import_prop_types29.default.oneOf(positionSet3),
  rePosKey: import_prop_types29.default.oneOfType([import_prop_types29.default.string, import_prop_types29.default.number]),
  render: import_prop_types29.default.node,
  spacing: import_prop_types29.default.oneOfType([import_prop_types29.default.number, import_prop_types29.default.object]),
  showTick: import_prop_types29.default.bool,
  style: import_prop_types29.default.object,
  trigger: import_prop_types29.default.oneOf(triggerSet3),
  visible: import_prop_types29.default.bool,
  zIndex: import_prop_types29.default.number
};
Dropdown.__SemiComponentName__ = "Dropdown";
Dropdown.defaultProps = getDefaultPropsFromGlobalConfig(Dropdown.__SemiComponentName__, {
  onVisibleChange: import_noop8.default,
  prefixCls: cssClasses13.PREFIX,
  zIndex: numbers.DEFAULT_Z_INDEX,
  motion: true,
  trigger: "hover",
  position: "bottom",
  mouseLeaveDelay: strings11.DEFAULT_LEAVE_DELAY,
  showTick: false,
  closeOnEsc: true,
  onEscKeyDown: import_noop8.default
});
var dropdown_default = Dropdown;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/Item.js
var clsPrefix = `${cssClasses12.PREFIX}-item`;
var NavItem2 = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.setItemRef = (ref2) => {
      this.props.forwardRef && this.props.forwardRef(ref2);
    };
    this.wrapTooltip = (node) => {
      const {
        text,
        tooltipHideDelay,
        tooltipShowDelay
      } = this.props;
      const hideDelay = tooltipHideDelay !== null && tooltipHideDelay !== void 0 ? tooltipHideDelay : this.context.tooltipHideDelay;
      const showDelay = tooltipShowDelay !== null && tooltipShowDelay !== void 0 ? tooltipShowDelay : this.context.tooltipShowDelay;
      return /* @__PURE__ */ import_react48.default.createElement(Tooltip2, {
        content: text,
        position: "right",
        trigger: "hover",
        mouseEnterDelay: showDelay,
        mouseLeaveDelay: hideDelay
      }, node);
    };
    this.handleClick = (e) => this.foundation.handleClick(e);
    this.handleKeyPress = (e) => this.foundation.handleKeyPress(e);
    this.state = {
      tooltipShow: false
    };
    this.foundation = new ItemFoundation(this.adapter);
  }
  _invokeContextFunc(funcName) {
    if (funcName && this.context && typeof this.context[funcName] === "function") {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return this.context[funcName](...args);
    }
    return null;
  }
  get adapter() {
    var _this = this;
    return Object.assign(Object.assign({}, super.adapter), {
      cloneDeep,
      updateTooltipShow: (tooltipShow) => this.setState({
        tooltipShow
      }),
      updateSelected: (_selected) => this._invokeContextFunc("updateSelectedKeys", [this.props.itemKey]),
      updateGlobalSelectedKeys: (keys) => this._invokeContextFunc("updateSelectedKeys", [...keys]),
      getSelectedKeys: () => this.context && this.context.selectedKeys,
      getSelectedKeysIsControlled: () => this.context && this.context.selectedKeysIsControlled,
      notifyGlobalOnSelect: function() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return _this._invokeContextFunc("onSelect", ...args);
      },
      notifyGlobalOnClick: function() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        return _this._invokeContextFunc("onClick", ...args);
      },
      notifyClick: function() {
        return _this.props.onClick(...arguments);
      },
      notifyMouseEnter: function() {
        return _this.props.onMouseEnter(...arguments);
      },
      notifyMouseLeave: function() {
        return _this.props.onMouseLeave(...arguments);
      },
      getIsCollapsed: () => this.props.isCollapsed || Boolean(this.context && this.context.isCollapsed) || false,
      getSelected: () => Boolean(this.context && this.context.selectedKeys && this.context.selectedKeys.includes(this.props.itemKey)),
      getIsOpen: () => Boolean(this.context && this.context.openKeys && this.context.openKeys.includes(this.props.itemKey))
    });
  }
  renderIcon(icon, pos) {
    let isToggleIcon = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : false;
    let key = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : 0;
    if (this.props.isSubNav) {
      return null;
    }
    if (!icon && this.context.mode === strings10.MODE_HORIZONTAL) {
      return null;
    }
    let iconSize = "large";
    if (pos === strings10.ICON_POS_RIGHT) {
      iconSize = "default";
    }
    const className = (0, import_classnames27.default)(`${clsPrefix}-icon`, {
      [`${clsPrefix}-icon-toggle-${this.context.toggleIconPosition}`]: isToggleIcon,
      [`${clsPrefix}-icon-info`]: !isToggleIcon
    });
    return /* @__PURE__ */ import_react48.default.createElement("i", {
      className,
      key
    }, isSemiIcon(icon) ? /* @__PURE__ */ import_react48.default.cloneElement(icon, {
      size: icon.props.size || iconSize
    }) : icon);
  }
  render() {
    const {
      text,
      children,
      icon,
      toggleIcon,
      className,
      isSubNav,
      style,
      indent,
      onMouseEnter,
      onMouseLeave,
      link,
      linkOptions,
      disabled,
      level = 0,
      tabIndex
    } = this.props;
    const {
      mode,
      isInSubNav,
      prefixCls: prefixCls17,
      limitIndent
    } = this.context;
    const isCollapsed = this.adapter.getIsCollapsed();
    const selected = this.adapter.getSelected();
    let itemChildren = null;
    if (!isNullOrUndefined(children)) {
      itemChildren = children;
    } else {
      let placeholderIcons = null;
      if (mode === strings10.MODE_VERTICAL && !limitIndent && !isCollapsed) {
        const iconAmount = icon && !indent ? level : level - 1;
        placeholderIcons = (0, import_times.default)(iconAmount, (index) => this.renderIcon(null, strings10.ICON_POS_RIGHT, false, index));
      }
      itemChildren = /* @__PURE__ */ import_react48.default.createElement(import_react48.default.Fragment, null, placeholderIcons, this.context.toggleIconPosition === strings10.TOGGLE_ICON_LEFT && this.renderIcon(toggleIcon, strings10.ICON_POS_RIGHT, true, "key-toggle-pos-right"), icon || indent || isInSubNav ? this.renderIcon(icon, strings10.ICON_POS_LEFT, false, "key-position-left") : null, !isNullOrUndefined(text) ? /* @__PURE__ */ import_react48.default.createElement("span", {
        className: `${cssClasses12.PREFIX}-item-text`
      }, text) : "", this.context.toggleIconPosition === strings10.TOGGLE_ICON_RIGHT && this.renderIcon(toggleIcon, strings10.ICON_POS_RIGHT, true, "key-toggle-pos-right"));
    }
    if (typeof link === "string") {
      itemChildren = /* @__PURE__ */ import_react48.default.createElement("a", Object.assign({
        className: `${prefixCls17}-item-link`,
        href: link,
        tabIndex: -1
      }, linkOptions), itemChildren);
    }
    let itemDom = "";
    if (isInSubNav && (isCollapsed || mode === strings10.MODE_HORIZONTAL)) {
      const popoverItemCls = (0, import_classnames27.default)({
        [clsPrefix]: true,
        [`${clsPrefix}-sub`]: isSubNav,
        [`${clsPrefix}-selected`]: selected,
        [`${clsPrefix}-collapsed`]: isCollapsed,
        [`${clsPrefix}-disabled`]: disabled
      });
      itemDom = /* @__PURE__ */ import_react48.default.createElement(dropdown_default.Item, {
        selected,
        active: selected,
        forwardRef: this.setItemRef,
        className: popoverItemCls,
        onClick: this.handleClick,
        onMouseEnter,
        onMouseLeave,
        disabled,
        onKeyDown: this.handleKeyPress
      }, itemChildren);
    } else {
      const popoverItemCls = (0, import_classnames27.default)(`${className || `${clsPrefix}-normal`}`, {
        [clsPrefix]: true,
        [`${clsPrefix}-sub`]: isSubNav,
        [`${clsPrefix}-selected`]: selected && !isSubNav,
        [`${clsPrefix}-collapsed`]: isCollapsed,
        [`${clsPrefix}-disabled`]: disabled,
        [`${clsPrefix}-has-link`]: typeof link === "string"
      });
      const ariaProps = {
        "aria-disabled": disabled
      };
      if (isSubNav) {
        const isOpen = this.adapter.getIsOpen();
        ariaProps["aria-expanded"] = isOpen;
      }
      itemDom = // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      /* @__PURE__ */ import_react48.default.createElement("li", Object.assign({
        // if role = menuitem, the narration will read all expanded li
        role: isSubNav ? null : "menuitem",
        tabIndex: isSubNav ? -1 : tabIndex
      }, ariaProps, {
        style,
        ref: this.setItemRef,
        className: popoverItemCls,
        onClick: this.handleClick,
        onMouseEnter,
        onMouseLeave,
        onKeyPress: this.handleKeyPress
      }, this.getDataAttr(this.props)), itemChildren);
    }
    if (isCollapsed && !isInSubNav && !isSubNav || isCollapsed && isSubNav && disabled) {
      itemDom = this.wrapTooltip(itemDom);
    }
    if (typeof this.context.renderWrapper === "function") {
      return this.context.renderWrapper({
        itemElement: itemDom,
        isSubNav,
        isInSubNav,
        props: this.props
      });
    }
    return itemDom;
  }
};
NavItem2.contextType = nav_context_default;
NavItem2.propTypes = {
  text: import_prop_types30.default.oneOfType([import_prop_types30.default.string, import_prop_types30.default.node]),
  itemKey: import_prop_types30.default.oneOfType([import_prop_types30.default.string, import_prop_types30.default.number]),
  onClick: import_prop_types30.default.func,
  onMouseEnter: import_prop_types30.default.func,
  onMouseLeave: import_prop_types30.default.func,
  children: import_prop_types30.default.node,
  icon: import_prop_types30.default.oneOfType([import_prop_types30.default.node]),
  className: import_prop_types30.default.string,
  toggleIcon: import_prop_types30.default.string,
  style: import_prop_types30.default.object,
  forwardRef: import_prop_types30.default.func,
  indent: import_prop_types30.default.oneOfType([import_prop_types30.default.bool, import_prop_types30.default.number]),
  isCollapsed: import_prop_types30.default.bool,
  isSubNav: import_prop_types30.default.bool,
  link: import_prop_types30.default.string,
  linkOptions: import_prop_types30.default.object,
  disabled: import_prop_types30.default.bool,
  tabIndex: import_prop_types30.default.number
};
NavItem2.defaultProps = {
  isSubNav: false,
  indent: false,
  forwardRef: import_noop9.default,
  isCollapsed: false,
  onClick: import_noop9.default,
  onMouseEnter: import_noop9.default,
  onMouseLeave: import_noop9.default,
  disabled: false,
  tabIndex: 0
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/collapsible/index.js
var import_isEqual3 = __toESM(require_isEqual());
var import_react49 = __toESM(require_react());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/collapsible/foundation.js
var CollapsibleFoundation = class extends foundation_default {
  constructor(adapter) {
    super(Object.assign({}, adapter));
    this.updateDOMInRenderTree = (isInRenderTree) => {
      this._adapter.setDOMInRenderTree(isInRenderTree);
    };
    this.updateDOMHeight = (domHeight) => {
      this._adapter.setDOMHeight(domHeight);
    };
    this.updateVisible = (visible) => {
      this._adapter.setVisible(visible);
    };
    this.updateIsTransitioning = (isTransitioning) => {
      this._adapter.setIsTransitioning(isTransitioning);
    };
  }
};
var foundation_default3 = CollapsibleFoundation;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/collapsible/index.js
var import_prop_types31 = __toESM(require_prop_types());
var import_classnames28 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/collapsible/constants.js
var cssClasses14 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-collapsible`
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/collapsible/index.js
var Collapsible = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.domRef = /* @__PURE__ */ import_react49.default.createRef();
    this.hasBeenRendered = false;
    this.handleResize = (entryList) => {
      const entry = entryList[0];
      if (entry) {
        const entryInfo = Collapsible.getEntryInfo(entry);
        this.foundation.updateDOMHeight(entryInfo.height);
        this.foundation.updateDOMInRenderTree(entryInfo.isShown);
      }
    };
    this.isChildrenInRenderTree = () => {
      if (this.domRef.current) {
        return this.domRef.current.offsetHeight > 0;
      }
      return false;
    };
    this.state = {
      domInRenderTree: false,
      domHeight: 0,
      visible: this.props.isOpen,
      isTransitioning: false
    };
    this.foundation = new foundation_default3(this.adapter);
  }
  get adapter() {
    return Object.assign(Object.assign({}, super.adapter), {
      setDOMInRenderTree: (domInRenderTree) => {
        if (this.state.domInRenderTree !== domInRenderTree) {
          this.setState({
            domInRenderTree
          });
        }
      },
      setDOMHeight: (domHeight) => {
        if (this.state.domHeight !== domHeight) {
          this.setState({
            domHeight
          });
        }
      },
      setVisible: (visible) => {
        if (this.state.visible !== visible) {
          this.setState({
            visible
          });
        }
      },
      setIsTransitioning: (isTransitioning) => {
        if (this.state.isTransitioning !== isTransitioning) {
          this.setState({
            isTransitioning
          });
        }
      }
    });
  }
  componentDidMount() {
    super.componentDidMount();
    this.resizeObserver = new ResizeObserver(this.handleResize);
    this.resizeObserver.observe(this.domRef.current);
    const domInRenderTree = this.isChildrenInRenderTree();
    this.foundation.updateDOMInRenderTree(domInRenderTree);
    if (domInRenderTree) {
      this.foundation.updateDOMHeight(this.domRef.current.scrollHeight);
    }
  }
  componentDidUpdate(prevProps, prevState, snapshot) {
    const changedPropKeys = Object.keys(this.props).filter((key) => !(0, import_isEqual3.default)(this.props[key], prevProps[key]));
    const changedStateKeys = Object.keys(this.state).filter((key) => !(0, import_isEqual3.default)(this.state[key], prevState[key]));
    if (changedPropKeys.includes("reCalcKey")) {
      this.foundation.updateDOMHeight(this.domRef.current.scrollHeight);
    }
    if (changedStateKeys.includes("domInRenderTree") && this.state.domInRenderTree) {
      this.foundation.updateDOMHeight(this.domRef.current.scrollHeight);
    }
    if (changedPropKeys.includes("isOpen")) {
      if (this.props.isOpen || !this.props.motion) {
        this.foundation.updateVisible(this.props.isOpen);
      }
    }
    if (this.props.motion && prevProps.isOpen !== this.props.isOpen) {
      this.foundation.updateIsTransitioning(true);
    }
  }
  componentWillUnmount() {
    super.componentWillUnmount();
    this.resizeObserver.disconnect();
  }
  render() {
    const wrapperStyle = Object.assign({
      overflow: "hidden",
      height: this.props.isOpen ? this.state.domHeight : this.props.collapseHeight,
      opacity: this.props.isOpen || !this.props.fade || this.props.collapseHeight !== 0 ? 1 : 0,
      transitionDuration: `${this.props.motion && this.state.isTransitioning ? this.props.duration : 0}ms`
    }, this.props.style);
    const wrapperCls = (0, import_classnames28.default)(`${cssClasses14.PREFIX}-wrapper`, {
      [`${cssClasses14.PREFIX}-transition`]: this.props.motion && this.state.isTransitioning
    }, this.props.className);
    const shouldRender = this.props.keepDOM && (this.props.lazyRender ? this.hasBeenRendered : true) || this.props.collapseHeight !== 0 || this.state.visible || this.props.isOpen;
    if (shouldRender && !this.hasBeenRendered) {
      this.hasBeenRendered = true;
    }
    return /* @__PURE__ */ import_react49.default.createElement("div", Object.assign({
      className: wrapperCls,
      style: wrapperStyle,
      onTransitionEnd: () => {
        var _a, _b;
        if (!this.props.isOpen) {
          this.foundation.updateVisible(false);
        }
        this.foundation.updateIsTransitioning(false);
        (_b = (_a = this.props).onMotionEnd) === null || _b === void 0 ? void 0 : _b.call(_a);
      }
    }, this.getDataAttr(this.props)), /* @__PURE__ */ import_react49.default.createElement("div", {
      "x-semi-prop": "children",
      ref: this.domRef,
      style: {
        overflow: "hidden"
      },
      id: this.props.id
    }, shouldRender && this.props.children));
  }
};
Collapsible.__SemiComponentName__ = "Collapsible";
Collapsible.defaultProps = getDefaultPropsFromGlobalConfig(Collapsible.__SemiComponentName__, {
  isOpen: false,
  duration: 250,
  motion: true,
  keepDOM: false,
  lazyRender: false,
  collapseHeight: 0,
  fade: false
});
Collapsible.getEntryInfo = (entry) => {
  let inRenderTree;
  if (entry.borderBoxSize) {
    inRenderTree = !(entry.borderBoxSize[0].blockSize === 0 && entry.borderBoxSize[0].inlineSize === 0);
  } else {
    inRenderTree = !(entry.contentRect.height === 0 && entry.contentRect.width === 0);
  }
  let height = 0;
  if (entry.borderBoxSize) {
    height = Math.ceil(entry.borderBoxSize[0].blockSize);
  } else {
    const target = entry.target;
    height = target.clientHeight;
  }
  return {
    isShown: inRenderTree,
    height
  };
};
Collapsible.propTypes = {
  motion: import_prop_types31.default.bool,
  children: import_prop_types31.default.node,
  isOpen: import_prop_types31.default.bool,
  duration: import_prop_types31.default.number,
  keepDOM: import_prop_types31.default.bool,
  collapseHeight: import_prop_types31.default.number,
  style: import_prop_types31.default.object,
  className: import_prop_types31.default.string,
  reCalcKey: import_prop_types31.default.oneOfType([import_prop_types31.default.string, import_prop_types31.default.number])
};
var collapsible_default = Collapsible;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/SubNav.js
var SubNav = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.setItemRef = (ref2) => {
      if (ref2 && ref2.current) {
        this.itemRef = ref2;
      } else {
        this.itemRef = {
          current: ref2
        };
      }
    };
    this.setTitleRef = (ref2) => {
      if (ref2 && ref2.current) {
        this.titleRef = ref2;
      } else {
        this.titleRef = {
          current: ref2
        };
      }
    };
    this.handleClick = (e) => {
      this.foundation.handleClick(e && e.nativeEvent, this.titleRef && this.titleRef.current);
    };
    this.handleKeyPress = (e) => {
      this.foundation.handleKeyPress(e && e.nativeEvent, this.titleRef && this.titleRef.current);
    };
    this.handleDropdownVisible = (visible) => this.foundation.handleDropdownVisibleChange(visible);
    this.state = {
      isHovered: false
    };
    this.adapter.setCache("firstMounted", true);
    this.titleRef = /* @__PURE__ */ import_react50.default.createRef();
    this.itemRef = /* @__PURE__ */ import_react50.default.createRef();
    this.foundation = new SubNavFoundation(this.adapter);
  }
  _invokeContextFunc(funcName) {
    if (funcName && this.context && typeof this.context[funcName] === "function") {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      return this.context[funcName](...args);
    }
    return null;
  }
  get adapter() {
    var _this = this;
    return Object.assign(Object.assign({}, super.adapter), {
      updateIsHovered: (isHovered) => this.setState({
        isHovered
      }),
      getOpenKeys: () => this.context && this.context.openKeys,
      getOpenKeysIsControlled: () => this.context && this.context.openKeysIsControlled,
      getCanUpdateOpenKeys: () => this.context && this.context.canUpdateOpenKeys,
      updateOpen: (isOpen) => this._invokeContextFunc(isOpen ? "addOpenKeys" : "removeOpenKeys", this.props.itemKey),
      notifyGlobalOpenChange: function() {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }
        return _this._invokeContextFunc("onOpenChange", ...args);
      },
      notifyGlobalOnSelect: function() {
        for (var _len3 = arguments.length, args = new Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
          args[_key3] = arguments[_key3];
        }
        return _this._invokeContextFunc("onSelect", ...args);
      },
      notifyGlobalOnClick: function() {
        for (var _len4 = arguments.length, args = new Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
          args[_key4] = arguments[_key4];
        }
        return _this._invokeContextFunc("onClick", ...args);
      },
      getIsSelected: (itemKey) => Boolean(!isNullOrUndefined(itemKey) && (0, import_get12.default)(this.context, "selectedKeys", []).includes(String(itemKey))),
      getIsOpen: () => {
        const {
          itemKey
        } = this.props;
        return Boolean(this.context && this.context.openKeys && this.context.openKeys.includes(this.props.itemKey));
      }
    });
  }
  renderIcon(icon, pos, withTransition) {
    let isToggleIcon = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : false;
    let key = arguments.length > 4 && arguments[4] !== void 0 ? arguments[4] : 0;
    const {
      prefixCls: prefixCls17
    } = this.context;
    let iconSize = "large";
    if (pos === strings10.ICON_POS_RIGHT) {
      iconSize = "default";
    }
    const className = (0, import_classnames29.default)(`${prefixCls17}-item-icon`, {
      [`${prefixCls17}-item-icon-toggle-${this.context.toggleIconPosition}`]: isToggleIcon,
      [`${prefixCls17}-item-icon-info`]: !isToggleIcon
    });
    const isOpen = this.adapter.getIsOpen();
    const iconElem = /* @__PURE__ */ import_react50.default.isValidElement(icon) ? withTransition ? /* @__PURE__ */ import_react50.default.createElement(cssAnimation_default, {
      animationState: isOpen ? "enter" : "leave",
      startClassName: `${cssClasses12.PREFIX}-icon-rotate-${isOpen ? "180" : "0"}`
    }, (_ref) => {
      let {
        animationClassName
      } = _ref;
      return /* @__PURE__ */ import_react50.default.cloneElement(icon, {
        size: iconSize,
        className: animationClassName
      });
    }) : /* @__PURE__ */ import_react50.default.cloneElement(icon, {
      size: iconSize
    }) : null;
    return /* @__PURE__ */ import_react50.default.createElement("i", {
      key,
      className
    }, iconElem);
  }
  renderTitleDiv() {
    const {
      text,
      icon,
      itemKey,
      indent,
      disabled,
      level,
      expandIcon
    } = this.props;
    const {
      mode,
      isInSubNav,
      isCollapsed,
      prefixCls: prefixCls17,
      subNavMotion,
      limitIndent
    } = this.context;
    const isOpen = this.adapter.getIsOpen();
    const titleCls = (0, import_classnames29.default)(`${prefixCls17}-sub-title`, {
      [`${prefixCls17}-sub-title-selected`]: this.adapter.getIsSelected(itemKey),
      [`${prefixCls17}-sub-title-disabled`]: disabled
    });
    let withTransition = false;
    let toggleIconType = "";
    if (isCollapsed) {
      if (isInSubNav) {
        toggleIconType = /* @__PURE__ */ import_react50.default.createElement(IconChevronRight_default, null);
      } else {
        toggleIconType = null;
      }
    } else if (mode === strings10.MODE_HORIZONTAL) {
      if (isInSubNav) {
        toggleIconType = /* @__PURE__ */ import_react50.default.createElement(IconChevronRight_default, {
          "aria-hidden": true
        });
      } else {
        toggleIconType = expandIcon ? expandIcon : /* @__PURE__ */ import_react50.default.createElement(IconChevronDown_default, {
          "aria-hidden": true
        });
      }
    } else {
      if (subNavMotion) {
        withTransition = true;
      }
      toggleIconType = expandIcon ? expandIcon : /* @__PURE__ */ import_react50.default.createElement(IconChevronDown_default, {
        "aria-hidden": true
      });
    }
    let placeholderIcons = null;
    if (mode === strings10.MODE_VERTICAL && !limitIndent && !isCollapsed) {
      const iconAmount = icon && !indent ? level : level - 1;
      placeholderIcons = (0, import_times2.default)(iconAmount, (index) => this.renderIcon(null, strings10.ICON_POS_RIGHT, false, false, index));
    }
    const isIconChevronRightShow = !isCollapsed && isInSubNav && mode === strings10.MODE_HORIZONTAL || isCollapsed && isInSubNav;
    const titleDiv = /* @__PURE__ */ import_react50.default.createElement("div", {
      role: "menuitem",
      // to avoid nested horizontal navigation be focused
      tabIndex: isIconChevronRightShow ? -1 : 0,
      ref: this.setTitleRef,
      className: titleCls,
      onClick: this.handleClick,
      onKeyPress: this.handleKeyPress,
      "aria-expanded": isOpen ? "true" : "false"
    }, /* @__PURE__ */ import_react50.default.createElement("div", {
      className: `${prefixCls17}-item-inner`
    }, placeholderIcons, this.context.toggleIconPosition === strings10.TOGGLE_ICON_LEFT && this.renderIcon(toggleIconType, strings10.ICON_POS_RIGHT, withTransition, true, "key-toggle-position-left"), icon || indent || isInSubNav && mode !== strings10.MODE_HORIZONTAL ? this.renderIcon(icon, strings10.ICON_POS_LEFT, false, false, "key-inSubNav-position-left") : null, /* @__PURE__ */ import_react50.default.createElement("span", {
      className: `${prefixCls17}-item-text`
    }, text), this.context.toggleIconPosition === strings10.TOGGLE_ICON_RIGHT && this.renderIcon(toggleIconType, strings10.ICON_POS_RIGHT, withTransition, true, "key-toggle-position-right")));
    return titleDiv;
  }
  renderSubUl() {
    const {
      children,
      maxHeight
    } = this.props;
    const {
      isCollapsed,
      mode,
      subNavMotion,
      prefixCls: prefixCls17
    } = this.context;
    const isOpen = this.adapter.getIsOpen();
    const isHorizontal = mode === strings10.MODE_HORIZONTAL;
    const subNavCls = (0, import_classnames29.default)(`${prefixCls17}-sub`, {
      [`${prefixCls17}-sub-open`]: isOpen,
      [`${prefixCls17}-sub-popover`]: isCollapsed || isHorizontal
    });
    const ulWithMotion = /* @__PURE__ */ import_react50.default.createElement(collapsible_default, {
      motion: subNavMotion,
      isOpen,
      keepDOM: false,
      fade: true
    }, !isCollapsed ? /* @__PURE__ */ import_react50.default.createElement("ul", {
      className: subNavCls
    }, children) : null);
    const finalDom = isHorizontal ? null : subNavMotion ? ulWithMotion : isOpen && !isCollapsed ? /* @__PURE__ */ import_react50.default.createElement("ul", {
      className: subNavCls
    }, children) : null;
    return finalDom;
  }
  wrapDropdown() {
    let elem = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : "";
    let _elem = elem;
    const {
      children,
      dropdownStyle,
      disabled
    } = this.props;
    const {
      mode,
      isInSubNav,
      isCollapsed,
      subNavCloseDelay,
      subNavOpenDelay,
      prefixCls: prefixCls17,
      getPopupContainer
    } = this.context;
    const isOpen = this.adapter.getIsOpen();
    const openKeysIsControlled = this.adapter.getOpenKeysIsControlled();
    const subNavCls = (0, import_classnames29.default)({
      [`${prefixCls17}-popover`]: isCollapsed
    });
    const dropdownProps = {
      trigger: "hover",
      style: dropdownStyle
    };
    if (openKeysIsControlled) {
      dropdownProps.trigger = "custom";
      dropdownProps.visible = isOpen;
    }
    if (getPopupContainer) {
      dropdownProps.getPopupContainer = getPopupContainer;
    }
    if (isCollapsed || mode === strings10.MODE_HORIZONTAL) {
      _elem = !disabled ? /* @__PURE__ */ import_react50.default.createElement(dropdown_default, Object.assign({
        className: subNavCls,
        render: /* @__PURE__ */ import_react50.default.createElement(dropdown_default.Menu, null, children),
        position: mode === strings10.MODE_HORIZONTAL && !isInSubNav ? "bottomLeft" : "rightTop",
        mouseEnterDelay: subNavOpenDelay,
        mouseLeaveDelay: subNavCloseDelay,
        onVisibleChange: this.handleDropdownVisible
      }, dropdownProps), _elem) : _elem;
    }
    return _elem;
  }
  render() {
    const {
      itemKey,
      style,
      onMouseEnter,
      onMouseLeave,
      disabled,
      text
    } = this.props;
    const {
      mode,
      isCollapsed,
      prefixCls: prefixCls17
    } = this.context;
    let titleDiv = this.renderTitleDiv();
    const subUl = this.renderSubUl();
    if (isCollapsed || mode === strings10.MODE_HORIZONTAL) {
      titleDiv = this.wrapDropdown(titleDiv);
    }
    return /* @__PURE__ */ import_react50.default.createElement(NavItem2, {
      style,
      isSubNav: true,
      itemKey,
      forwardRef: this.setItemRef,
      isCollapsed,
      className: `${prefixCls17}-sub-wrap`,
      onMouseEnter,
      onMouseLeave,
      disabled,
      text
    }, /* @__PURE__ */ import_react50.default.createElement(nav_context_default.Provider, {
      value: Object.assign(Object.assign({}, this.context), {
        isInSubNav: true
      })
    }, titleDiv, subUl));
  }
};
SubNav.contextType = nav_context_default;
SubNav.propTypes = {
  /**
   * Unique identification
   */
  itemKey: import_prop_types32.default.oneOfType([import_prop_types32.default.string, import_prop_types32.default.number]),
  /**
   * Copywriting
   */
  text: import_prop_types32.default.oneOfType([import_prop_types32.default.string, import_prop_types32.default.node]),
  /**
   * Whether child navigation is expanded
   */
  isOpen: import_prop_types32.default.bool,
  /**
   * Whether it is in the state of being stowed to the sidebar
   */
  isCollapsed: import_prop_types32.default.bool,
  /**
   * Whether to keep the left Icon placeholder
   */
  indent: import_prop_types32.default.oneOfType([import_prop_types32.default.bool, import_prop_types32.default.number]),
  /**
   * Nested child elements
   */
  children: import_prop_types32.default.node,
  style: import_prop_types32.default.object,
  /**
   * Icon name on the left
   */
  icon: import_prop_types32.default.node,
  /**
   * Maximum height (for animation)
   */
  maxHeight: import_prop_types32.default.number,
  onMouseEnter: import_prop_types32.default.func,
  onMouseLeave: import_prop_types32.default.func,
  // Is it disabled
  disabled: import_prop_types32.default.bool,
  level: import_prop_types32.default.number
};
SubNav.defaultProps = {
  level: 0,
  indent: false,
  isCollapsed: false,
  isOpen: false,
  maxHeight: numbers3.DEFAULT_SUBNAV_MAX_HEIGHT,
  disabled: false
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/Footer.js
var import_noop11 = __toESM(require_noop());
var import_react52 = __toESM(require_react());
var import_prop_types33 = __toESM(require_prop_types());
var import_classnames30 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/CollapseButton.js
var import_noop10 = __toESM(require_noop());
var import_react51 = __toESM(require_react());
function CollapseButton(_ref) {
  let {
    prefixCls: prefixCls17,
    locale: locale2,
    collapseText,
    isCollapsed,
    onClick = import_noop10.default
  } = _ref;
  const handleClick = () => {
    if (typeof onClick === "function") {
      onClick(!isCollapsed);
    }
  };
  const btnProps = {
    icon: /* @__PURE__ */ import_react51.default.createElement(IconSidebar_default, null),
    type: "tertiary",
    theme: "borderless",
    onClick: handleClick
  };
  let finalCollapseText = isCollapsed ? locale2 === null || locale2 === void 0 ? void 0 : locale2.expandText : locale2 === null || locale2 === void 0 ? void 0 : locale2.collapseText;
  if (typeof collapseText === "function") {
    finalCollapseText = collapseText(isCollapsed);
  }
  return /* @__PURE__ */ import_react51.default.createElement("div", {
    className: `${prefixCls17}-collapse-btn`
  }, isCollapsed ? /* @__PURE__ */ import_react51.default.createElement(Tooltip2, {
    content: finalCollapseText,
    position: "right"
  }, /* @__PURE__ */ import_react51.default.createElement(button_default, Object.assign({}, btnProps))) : /* @__PURE__ */ import_react51.default.createElement(button_default, Object.assign({}, btnProps), finalCollapseText));
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/Footer.js
var NavFooter = class extends import_react52.PureComponent {
  constructor() {
    super(...arguments);
    this.renderCollapseButton = () => {
      const {
        collapseButton,
        collapseText
      } = this.props;
      if (/* @__PURE__ */ import_react52.default.isValidElement(collapseButton)) {
        return collapseButton;
      }
      const {
        onCollapseChange,
        prefixCls: prefixCls17,
        locale: locale2,
        isCollapsed
      } = this.context;
      return /* @__PURE__ */ import_react52.default.createElement(CollapseButton, {
        prefixCls: prefixCls17,
        isCollapsed,
        locale: locale2,
        onClick: onCollapseChange,
        collapseText
      });
    };
  }
  render() {
    const {
      style,
      className,
      collapseButton,
      onClick
    } = this.props;
    let {
      children
    } = this.props;
    const {
      isCollapsed,
      mode
    } = this.context;
    if (!/* @__PURE__ */ import_react52.default.isValidElement(children) && collapseButton && mode !== strings10.MODE_HORIZONTAL) {
      children = this.renderCollapseButton();
    }
    const wrapCls = (0, import_classnames30.default)(className, `${cssClasses12.PREFIX}-footer`, {
      [`${cssClasses12.PREFIX}-footer-collapsed`]: isCollapsed
    });
    return (
      // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
      /* @__PURE__ */ import_react52.default.createElement("div", {
        className: wrapCls,
        style,
        onClick
      }, children)
    );
  }
};
NavFooter.contextType = nav_context_default;
NavFooter.propTypes = {
  children: import_prop_types33.default.node,
  style: import_prop_types33.default.object,
  className: import_prop_types33.default.string,
  collapseButton: import_prop_types33.default.oneOfType([import_prop_types33.default.node, import_prop_types33.default.bool]),
  collapseText: import_prop_types33.default.func,
  onClick: import_prop_types33.default.func
};
NavFooter.defaultProps = {
  collapseButton: false,
  onClick: import_noop11.default
};
NavFooter.elementType = "NavFooter";

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/Header.js
var import_react53 = __toESM(require_react());
var import_prop_types34 = __toESM(require_prop_types());
var import_classnames31 = __toESM(require_classnames());
var NavHeader = class extends import_react53.PureComponent {
  renderLogo(logo) {
    if (/* @__PURE__ */ import_react53.default.isValidElement(logo)) {
      return logo;
    }
    return null;
  }
  render() {
    const {
      children,
      style,
      className,
      logo,
      text,
      link,
      linkOptions,
      prefixCls: prefixCls17
    } = this.props;
    const {
      isCollapsed
    } = this.context;
    const wrapCls = (0, import_classnames31.default)(className, `${cssClasses12.PREFIX}-header`, {
      [`${cssClasses12.PREFIX}-header-collapsed`]: isCollapsed
    });
    let wrappedChildren = /* @__PURE__ */ import_react53.default.createElement(import_react53.default.Fragment, null, logo ? /* @__PURE__ */ import_react53.default.createElement("i", {
      className: `${cssClasses12.PREFIX}-header-logo`
    }, this.renderLogo(logo)) : null, !isNullOrUndefined(text) && !isCollapsed ? /* @__PURE__ */ import_react53.default.createElement("span", {
      className: `${cssClasses12.PREFIX}-header-text`
    }, text) : null, children);
    if (typeof link === "string") {
      wrappedChildren = /* @__PURE__ */ import_react53.default.createElement("a", Object.assign({
        className: `${prefixCls17}-header-link`,
        href: link
      }, linkOptions), wrappedChildren);
    }
    return /* @__PURE__ */ import_react53.default.createElement("div", {
      className: wrapCls,
      style
    }, wrappedChildren);
  }
};
NavHeader.contextType = nav_context_default;
NavHeader.propTypes = {
  prefixCls: import_prop_types34.default.string,
  logo: import_prop_types34.default.oneOfType([import_prop_types34.default.string, import_prop_types34.default.object, import_prop_types34.default.node]),
  text: import_prop_types34.default.oneOfType([import_prop_types34.default.string, import_prop_types34.default.node]),
  children: import_prop_types34.default.node,
  style: import_prop_types34.default.object,
  className: import_prop_types34.default.string,
  link: import_prop_types34.default.string,
  linkOptions: import_prop_types34.default.object
};
NavHeader.defaultProps = {
  prefixCls: cssClasses12.PREFIX
};
NavHeader.elementType = "NavHeader";

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/navigation/index.js
var __rest23 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
function createAddKeysFn(context, keyName) {
  return function addKeys3() {
    const handleKeys = new Set(context.state[keyName]);
    for (var _len = arguments.length, keys = new Array(_len), _key = 0; _key < _len; _key++) {
      keys[_key] = arguments[_key];
    }
    keys.forEach((key) => key && handleKeys.add(key));
    context.setState({
      [keyName]: Array.from(handleKeys)
    });
  };
}
function createRemoveKeysFn(context, keyName) {
  return function removeKeys3() {
    const handleKeys = new Set(context.state[keyName]);
    for (var _len2 = arguments.length, keys = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      keys[_key2] = arguments[_key2];
    }
    keys.forEach((key) => key && handleKeys.delete(key));
    context.setState({
      [keyName]: Array.from(handleKeys)
    });
  };
}
var {
  hasOwnProperty: hasOwnProperty2
} = Object.prototype;
var Nav = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.onCollapseChange = () => {
      this.foundation.handleCollapseChange();
    };
    this.foundation = new NavigationFoundation(this.adapter);
    this.itemsChanged = true;
    const {
      isCollapsed,
      defaultIsCollapsed,
      items,
      children
    } = props;
    const initState = {
      isCollapsed: Boolean(this.isControlled("isCollapsed") ? isCollapsed : defaultIsCollapsed),
      // calc state
      openKeys: [],
      items: [],
      itemKeysMap: {},
      selectedKeys: []
    };
    this.state = Object.assign({}, initState);
    if (items && items.length || children) {
      const calcState = this.foundation.init("constructor");
      this.state = Object.assign(Object.assign({}, initState), calcState);
    }
  }
  static getDerivedStateFromProps(props, state) {
    const willUpdateState = {};
    if (hasOwnProperty2.call(props, "isCollapsed") && props.isCollapsed !== state.isCollapsed) {
      willUpdateState.isCollapsed = props.isCollapsed;
    }
    return willUpdateState;
  }
  componentDidMount() {
  }
  componentDidUpdate(prevProps) {
    if (prevProps.items !== this.props.items || prevProps.children !== this.props.children) {
      this.foundation.init();
    } else {
      this.foundation.handleItemsChange(false);
      if (this.props.selectedKeys && !(0, import_isEqual4.default)(prevProps.selectedKeys, this.props.selectedKeys)) {
        this.adapter.updateSelectedKeys(this.props.selectedKeys);
        const willOpenKeys = this.foundation.getWillOpenKeys(this.state.itemKeysMap);
        this.adapter.updateOpenKeys(willOpenKeys);
      }
      if (this.props.openKeys && !(0, import_isEqual4.default)(prevProps.openKeys, this.props.openKeys)) {
        this.adapter.updateOpenKeys(this.props.openKeys);
      }
    }
  }
  get adapter() {
    var _this = this;
    return Object.assign(Object.assign({}, super.adapter), {
      notifySelect: function() {
        return _this.props.onSelect(...arguments);
      },
      notifyOpenChange: function() {
        return _this.props.onOpenChange(...arguments);
      },
      setIsCollapsed: (isCollapsed) => this.setState({
        isCollapsed
      }),
      notifyCollapseChange: function() {
        return _this.props.onCollapseChange(...arguments);
      },
      updateItems: (items) => this.setState({
        items: [...items]
      }),
      setItemKeysMap: (itemKeysMap) => this.setState({
        itemKeysMap: Object.assign({}, itemKeysMap)
      }),
      addSelectedKeys: createAddKeysFn(this, "selectedKeys"),
      removeSelectedKeys: createRemoveKeysFn(this, "selectedKeys"),
      /**
       * when `includeParentKeys` is `true`, select a nested nav item will select parent nav sub
       */
      updateSelectedKeys: function(selectedKeys) {
        let includeParentKeys = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
        let willUpdateSelectedKeys = selectedKeys;
        if (includeParentKeys) {
          const parentSelectKeys = _this.foundation.selectLevelZeroParentKeys(null, selectedKeys);
          willUpdateSelectedKeys = Array.from(new Set(selectedKeys.concat(parentSelectKeys)));
        }
        _this.setState({
          selectedKeys: willUpdateSelectedKeys
        });
      },
      updateOpenKeys: (openKeys) => this.setState({
        openKeys: [...openKeys]
      }),
      addOpenKeys: createAddKeysFn(this, "openKeys"),
      removeOpenKeys: createRemoveKeysFn(this, "openKeys"),
      setItemsChanged: (isChanged) => {
        this.itemsChanged = isChanged;
      }
    });
  }
  /**
   * Render navigation items recursively
   *
   * @param {NavItem[]} items
   * @returns {JSX.Element}
   */
  renderItems() {
    let items = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : [];
    let level = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0;
    const {
      expandIcon
    } = this.props;
    const finalDom = /* @__PURE__ */ import_react54.default.createElement(import_react54.default.Fragment, null, items.map((item, idx) => {
      if (Array.isArray(item.items) && item.items.length) {
        return /* @__PURE__ */ import_react54.default.createElement(SubNav, Object.assign({
          key: item.itemKey || String(level) + idx
        }, item, {
          level,
          expandIcon
        }), this.renderItems(item.items, level + 1));
      } else {
        return /* @__PURE__ */ import_react54.default.createElement(NavItem2, Object.assign({
          key: item.itemKey || String(level) + idx
        }, item, {
          level
        }));
      }
    }));
    return finalDom;
  }
  render() {
    const _a = this.props, {
      children: originChildren,
      mode,
      onOpenChange,
      onSelect,
      onClick,
      style,
      className,
      subNavCloseDelay,
      subNavOpenDelay,
      subNavMotion,
      tooltipShowDelay,
      tooltipHideDelay,
      prefixCls: prefixCls17,
      bodyStyle,
      footer,
      header,
      toggleIconPosition,
      limitIndent,
      renderWrapper,
      getPopupContainer
    } = _a, rest = __rest23(_a, ["children", "mode", "onOpenChange", "onSelect", "onClick", "style", "className", "subNavCloseDelay", "subNavOpenDelay", "subNavMotion", "tooltipShowDelay", "tooltipHideDelay", "prefixCls", "bodyStyle", "footer", "header", "toggleIconPosition", "limitIndent", "renderWrapper", "getPopupContainer"]);
    const {
      selectedKeys,
      openKeys,
      items,
      isCollapsed
    } = this.state;
    const {
      updateOpenKeys,
      addOpenKeys,
      removeOpenKeys,
      updateSelectedKeys,
      addSelectedKeys,
      removeSelectedKeys
    } = this.adapter;
    const finalStyle = Object.assign({}, style);
    let children = import_react54.Children.toArray(originChildren);
    const footers = [];
    const headers = [];
    if (/* @__PURE__ */ import_react54.default.isValidElement(footer)) {
      footers.push(/* @__PURE__ */ import_react54.default.createElement(NavFooter, {
        key: 0
      }, footer));
    } else if (footer && typeof footer === "object") {
      footers.push(/* @__PURE__ */ import_react54.default.createElement(NavFooter, Object.assign({
        key: 0
      }, footer)));
    }
    if (/* @__PURE__ */ import_react54.default.isValidElement(header)) {
      headers.push(/* @__PURE__ */ import_react54.default.createElement(NavHeader, {
        key: 0
      }, header));
    } else if (header && typeof header === "object") {
      headers.push(/* @__PURE__ */ import_react54.default.createElement(NavHeader, Object.assign({
        key: 0
      }, header)));
    }
    if (Array.isArray(children) && children.length) {
      children = [...children];
      let childrenLength = children.length;
      for (let i = 0; i < childrenLength; i++) {
        const child = children[i];
        if (child.type === NavFooter || (0, import_get13.default)(child, "type.elementType") === "NavFooter") {
          footers.push(child);
          children.splice(i, 1);
          i--;
          childrenLength--;
        } else if (child.type === NavHeader || (0, import_get13.default)(child, "type.elementType") === "NavHeader") {
          headers.push(child);
          children.splice(i, 1);
          i--;
          childrenLength--;
        }
      }
    }
    const finalCls = (0, import_classnames32.default)(prefixCls17, className, {
      [`${prefixCls17}-collapsed`]: isCollapsed,
      [`${prefixCls17}-horizontal`]: mode === "horizontal",
      [`${prefixCls17}-vertical`]: mode === "vertical"
    });
    const headerListOuterCls = (0, import_classnames32.default)(`${prefixCls17}-header-list-outer`, {
      [`${prefixCls17}-header-list-outer-collapsed`]: isCollapsed
    });
    if (this.itemsChanged) {
      this.adapter.setCache("itemElems", this.renderItems(items));
    }
    return /* @__PURE__ */ import_react54.default.createElement(LocaleConsumer, {
      componentName: "Navigation"
    }, (locale2) => /* @__PURE__ */ import_react54.default.createElement(nav_context_default.Provider, {
      value: {
        subNavCloseDelay,
        subNavOpenDelay,
        subNavMotion,
        tooltipShowDelay,
        tooltipHideDelay,
        openKeys,
        openKeysIsControlled: this.isControlled("openKeys") && mode === "vertical" && !isCollapsed,
        // canUpdateOpenKeys: mode === 'vertical' && !isCollapsed,
        canUpdateOpenKeys: true,
        selectedKeys,
        selectedKeysIsControlled: this.isControlled("selectedKeys"),
        isCollapsed,
        onCollapseChange: this.onCollapseChange,
        mode,
        onSelect,
        onOpenChange,
        updateOpenKeys,
        addOpenKeys,
        removeOpenKeys,
        updateSelectedKeys,
        addSelectedKeys,
        removeSelectedKeys,
        onClick,
        locale: locale2,
        prefixCls: prefixCls17,
        toggleIconPosition,
        limitIndent,
        renderWrapper,
        getPopupContainer
      }
    }, /* @__PURE__ */ import_react54.default.createElement("div", Object.assign({
      className: finalCls,
      style: finalStyle
    }, this.getDataAttr(rest)), /* @__PURE__ */ import_react54.default.createElement("div", {
      className: `${prefixCls17}-inner`
    }, /* @__PURE__ */ import_react54.default.createElement("div", {
      className: headerListOuterCls
    }, headers, /* @__PURE__ */ import_react54.default.createElement("div", {
      style: bodyStyle,
      className: `${prefixCls17}-list-wrapper`
    }, /* @__PURE__ */ import_react54.default.createElement("ul", {
      role: "menu",
      "aria-orientation": mode,
      className: `${prefixCls17}-list`
    }, this.adapter.getCache("itemElems"), children))), footers))));
  }
};
Nav.Sub = SubNav;
Nav.Item = NavItem2;
Nav.Header = NavHeader;
Nav.Footer = NavFooter;
Nav.propTypes = {
  collapseIcon: import_prop_types35.default.node,
  // Initial expanded SubNav navigation key array
  defaultOpenKeys: import_prop_types35.default.arrayOf(import_prop_types35.default.oneOfType([import_prop_types35.default.string, import_prop_types35.default.number])),
  openKeys: import_prop_types35.default.arrayOf(import_prop_types35.default.oneOfType([import_prop_types35.default.string, import_prop_types35.default.number])),
  // Initial selected navigation key array
  defaultSelectedKeys: import_prop_types35.default.arrayOf(import_prop_types35.default.oneOfType([import_prop_types35.default.string, import_prop_types35.default.number])),
  expandIcon: import_prop_types35.default.node,
  selectedKeys: import_prop_types35.default.arrayOf(import_prop_types35.default.oneOfType([import_prop_types35.default.string, import_prop_types35.default.number])),
  // Navigation type, now supports vertical, horizontal
  mode: import_prop_types35.default.oneOf([...strings10.MODE]),
  // Triggered when selecting a navigation item
  onSelect: import_prop_types35.default.func,
  // Triggered when clicking a navigation item
  onClick: import_prop_types35.default.func,
  // SubNav expand/close callback
  onOpenChange: import_prop_types35.default.func,
  // Array of options (nested options can continue)
  items: import_prop_types35.default.array,
  // Is it in the state of being stowed to the sidebar
  isCollapsed: import_prop_types35.default.bool,
  defaultIsCollapsed: import_prop_types35.default.bool,
  onCollapseChange: import_prop_types35.default.func,
  multiple: import_prop_types35.default.bool,
  onDeselect: import_prop_types35.default.func,
  subNavMotion: import_prop_types35.default.oneOfType([import_prop_types35.default.bool, import_prop_types35.default.object, import_prop_types35.default.func]),
  subNavCloseDelay: import_prop_types35.default.number,
  subNavOpenDelay: import_prop_types35.default.number,
  tooltipShowDelay: import_prop_types35.default.number,
  tooltipHideDelay: import_prop_types35.default.number,
  children: import_prop_types35.default.node,
  style: import_prop_types35.default.object,
  bodyStyle: import_prop_types35.default.object,
  className: import_prop_types35.default.string,
  toggleIconPosition: import_prop_types35.default.string,
  prefixCls: import_prop_types35.default.string,
  header: import_prop_types35.default.oneOfType([import_prop_types35.default.node, import_prop_types35.default.object]),
  footer: import_prop_types35.default.oneOfType([import_prop_types35.default.node, import_prop_types35.default.object]),
  limitIndent: import_prop_types35.default.bool,
  getPopupContainer: import_prop_types35.default.func
};
Nav.__SemiComponentName__ = "Navigation";
Nav.defaultProps = getDefaultPropsFromGlobalConfig(Nav.__SemiComponentName__, {
  subNavCloseDelay: numbers3.DEFAULT_SUBNAV_CLOSE_DELAY,
  subNavOpenDelay: numbers3.DEFAULT_SUBNAV_OPEN_DELAY,
  tooltipHideDelay: numbers3.DEFAULT_TOOLTIP_HIDE_DELAY,
  tooltipShowDelay: numbers3.DEFAULT_TOOLTIP_SHOW_DELAY,
  onCollapseChange: import_noop12.default,
  onSelect: import_noop12.default,
  onClick: import_noop12.default,
  onOpenChange: import_noop12.default,
  toggleIconPosition: "right",
  limitIndent: true,
  prefixCls: cssClasses12.PREFIX,
  subNavMotion: true,
  // isOpen: false,
  mode: strings10.MODE_VERTICAL
  // defaultOpenKeys: [],
  // defaultSelectedKeys: [],
  // items: [],
});
var navigation_default = Nav;

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/avatar/constants.js
var cssClasses15 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-avatar`
};
var strings12 = {
  SHAPE: ["circle", "square"],
  SIZE: ["extra-extra-small", "extra-small", "small", "default", "medium", "large", "extra-large"],
  COLOR: ["grey", "red", "pink", "purple", "violet", "indigo", "blue", "light-blue", "cyan", "teal", "green", "light-green", "lime", "yellow", "amber", "orange", "white"],
  OVERLAP_FROM: ["start", "end"]
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/breadcrumb/index.js
var import_isFunction4 = __toESM(require_isFunction());
var import_react57 = __toESM(require_react());
var import_classnames34 = __toESM(require_classnames());
var import_prop_types37 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/breadcrumb/constants.js
var cssClasses16 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-breadcrumb`
};
var strings13 = {
  MORE_TYPE: ["default", "popover"]
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/breadcrumb/foundation.js
var BreadcrumbFoundation = class extends foundation_default {
  constructor(adapter) {
    super(Object.assign({}, adapter));
  }
  handleClick(info, event) {
    this._adapter.notifyClick(info, event);
  }
  handleExpand(clickEvent) {
    this._adapter.expandCollapsed(clickEvent);
  }
  /**
   * A11y: simulate clear button click
   */
  handleExpandEnterPress(keyboardEvent) {
    if (isEnterPress_default(keyboardEvent)) {
      this.handleExpand(keyboardEvent);
    }
  }
  genRoutes(routes) {
    return routes.map((route) => {
      if (typeof route !== "object") {
        return {
          name: route,
          _origin: {
            name: route
          }
        };
      }
      let config = {};
      config._origin = route;
      return Object.assign(Object.assign({}, config), route);
    });
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/breadcrumb/item.js
var import_isNull2 = __toESM(require_isNull());
var import_isUndefined2 = __toESM(require_isUndefined());
var import_merge2 = __toESM(require_merge());
var import_react56 = __toESM(require_react());
var import_classnames33 = __toESM(require_classnames());
var import_prop_types36 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/breadcrumb/itemFoundation.js
var BreadcrumbItemFoundation = class extends foundation_default {
  constructor(adapter) {
    super(Object.assign({}, adapter));
  }
  handleClick(item, e) {
    this._adapter.notifyClick(item, e);
    this._adapter.notifyParent(item, e);
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/breadcrumb/bread-context.js
var import_react55 = __toESM(require_react());
var BreadContext = /* @__PURE__ */ import_react55.default.createContext({});
var bread_context_default = BreadContext;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/breadcrumb/item.js
var clsPrefix2 = cssClasses16.PREFIX;
var BreadcrumbItem = class extends BaseComponent {
  get adapter() {
    var _this = this;
    return Object.assign(Object.assign({}, super.adapter), {
      notifyClick: function() {
        _this.props.onClick(...arguments);
      },
      notifyParent: function() {
        _this.context.onClick(...arguments);
      }
    });
  }
  constructor(props) {
    super(props);
    this.renderIcon = () => {
      const iconType = this.props.icon;
      const {
        compact
      } = this.context;
      const iconSize = compact ? "small" : "default";
      const className = `${clsPrefix2}-item-icon`;
      if (/* @__PURE__ */ import_react56.default.isValidElement(iconType)) {
        return /* @__PURE__ */ import_react56.default.cloneElement(iconType, {
          className,
          size: iconSize
        });
      }
      return iconType;
    };
    this.getTooltipOpt = () => {
      const {
        showTooltip
      } = this.context;
      if (!showTooltip) {
        return {
          width: 150,
          ellipsisPos: "end"
        };
      }
      const defaultOpts = {
        width: 150,
        ellipsisPos: "end",
        opts: {
          autoAdjustOverflow: true,
          position: "top"
        }
      };
      if (typeof showTooltip === "object") {
        return (0, import_merge2.default)(defaultOpts, showTooltip);
      }
      return defaultOpts;
    };
    this.getItemInfo = () => {
      let itemInfo = {};
      const {
        route,
        children,
        href
      } = this.props;
      const hasHref = !(0, import_isUndefined2.default)(href) && !(0, import_isNull2.default)(href);
      if (route) {
        itemInfo = route;
      } else {
        itemInfo.name = children;
        if (hasHref) {
          itemInfo.href = href;
        }
      }
      return itemInfo;
    };
    this.renderBreadItem = () => {
      const {
        children
      } = this.props;
      const {
        compact
      } = this.context;
      const showTooltip = this.getTooltipOpt();
      const icon = this.renderIcon();
      if (Boolean(children) && typeof children === "string") {
        const {
          opts,
          ellipsisPos,
          width
        } = showTooltip;
        return /* @__PURE__ */ import_react56.default.createElement(import_react56.Fragment, null, icon, /* @__PURE__ */ import_react56.default.createElement("span", {
          className: `${clsPrefix2}-item-title`
        }, /* @__PURE__ */ import_react56.default.createElement(typography_default2.Text, {
          ellipsis: {
            showTooltip: opts ? {
              opts
            } : false,
            pos: ellipsisPos
          },
          // icon={this.renderIcon(icon)}
          style: {
            maxWidth: width
          },
          size: compact ? "small" : "normal"
        }, children)));
      }
      return /* @__PURE__ */ import_react56.default.createElement(import_react56.Fragment, null, icon, children ? /* @__PURE__ */ import_react56.default.createElement("span", {
        className: `${clsPrefix2}-item-title ${clsPrefix2}-item-title-inline`
      }, children) : null);
    };
    this.renderItem = () => {
      const {
        href,
        active,
        noLink
      } = this.props;
      const hasHref = href !== null && typeof href !== "undefined";
      const itemCls = (0, import_classnames33.default)({
        [`${clsPrefix2}-item`]: true,
        [`${clsPrefix2}-item-active`]: active,
        [`${clsPrefix2}-item-link`]: !noLink
      });
      const itemInner = this.renderBreadItem();
      const tag = active || !hasHref ? "span" : "a";
      const itemInfo = this.getItemInfo();
      return /* @__PURE__ */ import_react56.default.createElement(tag, {
        className: itemCls,
        onClick: (e) => this.foundation.handleClick(itemInfo, e),
        href
      }, itemInner);
    };
    this.foundation = new BreadcrumbItemFoundation(this.adapter);
  }
  componentDidMount() {
    this.foundation.init();
  }
  componentWillUnmount() {
    this.foundation.destroy();
  }
  render() {
    const {
      active,
      shouldRenderSeparator
      // children,
    } = this.props;
    const pageLabel = active ? {
      "aria-current": "page"
    } : {};
    const item = this.renderItem();
    const separator = this.props.separator || /* @__PURE__ */ import_react56.default.createElement("span", {
      className: `${clsPrefix2}-separator`
    }, this.context.separator);
    const wrapperCLs = (0, import_classnames33.default)({
      [`${clsPrefix2}-item-wrap`]: true
      // [`${clsPrefix}-item-wrap-iconOnly`]: !!children && this.props.icon,
    });
    return /* @__PURE__ */ import_react56.default.createElement("span", Object.assign({
      className: wrapperCLs
    }, pageLabel, this.getDataAttr(this.props)), item, shouldRenderSeparator && separator);
  }
};
BreadcrumbItem.isBreadcrumbItem = true;
BreadcrumbItem.contextType = bread_context_default;
BreadcrumbItem.propTypes = {
  onClick: import_prop_types36.default.func,
  route: import_prop_types36.default.oneOfType([import_prop_types36.default.object, import_prop_types36.default.string]),
  name: import_prop_types36.default.string,
  children: import_prop_types36.default.node,
  active: import_prop_types36.default.bool,
  shouldRenderSeparator: import_prop_types36.default.bool,
  icon: import_prop_types36.default.node,
  separator: import_prop_types36.default.node,
  noLink: import_prop_types36.default.bool
};
BreadcrumbItem.defaultProps = {
  onClick: noop,
  shouldRenderSeparator: true
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/breadcrumb/index.js
var clsPrefix3 = cssClasses16.PREFIX;
var Breadcrumb = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleCollapse = (template, itemsLen) => {
      const {
        maxItemCount,
        renderMore,
        moreType
      } = this.props;
      const hasRenderMore = (0, import_isFunction4.default)(renderMore);
      const restItem = template.slice(1, itemsLen - maxItemCount + 1);
      const spread = /* @__PURE__ */ import_react57.default.createElement("span", {
        className: `${clsPrefix3}-collapse`,
        key: `more-${itemsLen}`
      }, /* @__PURE__ */ import_react57.default.createElement("span", {
        className: `${clsPrefix3}-item-wrap`
      }, /* @__PURE__ */ import_react57.default.createElement("span", {
        role: "button",
        tabIndex: 0,
        "aria-label": "Expand breadcrumb items",
        className: `${clsPrefix3}-item ${clsPrefix3}-item-more`,
        onClick: (item) => this.foundation.handleExpand(item),
        onKeyPress: (e) => this.foundation.handleExpandEnterPress(e)
      }, hasRenderMore && renderMore(restItem), !hasRenderMore && moreType === "default" && /* @__PURE__ */ import_react57.default.createElement(IconMore_default, null), !hasRenderMore && moreType === "popover" && this.renderPopoverMore(restItem)), /* @__PURE__ */ import_react57.default.createElement("span", {
        className: `${clsPrefix3}-separator`,
        "x-semi-prop": "separator"
      }, this.props.separator)));
      template.splice(1, itemsLen - maxItemCount, spread);
      return template;
    };
    this.renderRouteItems = (items, shouldCollapse, moreTypeIsPopover) => {
      const {
        renderItem,
        renderMore,
        maxItemCount
      } = this.props;
      const restItemLength = items.length - maxItemCount;
      const hasRenderMore = (0, import_isFunction4.default)(renderMore);
      const template = items.map((route, idx) => {
        const key = route._origin.key || `item-${route.name || route.path}-${idx}`;
        const inCollapseArea = idx > 0 && idx <= restItemLength;
        return /* @__PURE__ */ import_react57.default.createElement(BreadcrumbItem, Object.assign({}, route, {
          key,
          active: this.props.activeIndex !== void 0 ? this.props.activeIndex === idx : idx === items.length - 1,
          route: route._origin,
          shouldRenderSeparator: idx !== items.length - 1 && !(shouldCollapse && (hasRenderMore || moreTypeIsPopover) && inCollapseArea)
        }), renderItem ? renderItem(route._origin) : route.name);
      });
      return template;
    };
    this.renderList = () => {
      const {
        routes,
        children,
        autoCollapse,
        maxItemCount,
        renderMore,
        moreType
      } = this.props;
      const {
        isCollapsed
      } = this.state;
      const hasRoutes = routes && routes.length > 0;
      const items = hasRoutes ? this.foundation.genRoutes(routes) : import_react57.default.Children.toArray(children);
      let template;
      const itemLength = items.length;
      const restItemLength = itemLength - maxItemCount;
      const shouldCollapse = items && autoCollapse && itemLength > maxItemCount && isCollapsed;
      const hasRenderMore = (0, import_isFunction4.default)(renderMore);
      const moreTypeIsPopover = moreType === "popover";
      if (hasRoutes) {
        template = this.renderRouteItems(items, shouldCollapse, moreTypeIsPopover);
      } else {
        template = items.map((item, idx) => {
          const inCollapseArea = idx > 0 && idx <= restItemLength;
          if (!item) {
            return item;
          }
          warning(item.type && !item.type.isBreadcrumbItem, "[Semi Breadcrumb]: Only accepts Breadcrumb.Item as its children");
          return /* @__PURE__ */ import_react57.default.cloneElement(item, {
            key: `${idx}-item`,
            active: this.props.activeIndex !== void 0 ? this.props.activeIndex === idx : idx === items.length - 1,
            shouldRenderSeparator: idx !== items.length - 1 && !(shouldCollapse && (hasRenderMore || moreTypeIsPopover) && inCollapseArea)
          });
        });
      }
      if (shouldCollapse) {
        return this.handleCollapse(template, items.length);
      }
      return template;
    };
    this.onClick = (info, event) => {
      this.foundation.handleClick(info, event);
    };
    this.foundation = new BreadcrumbFoundation(this.adapter);
    this.state = {
      isCollapsed: true
    };
    this.onClick = this.onClick.bind(this);
  }
  get adapter() {
    var _this = this;
    return Object.assign(Object.assign({}, super.adapter), {
      notifyClick: function() {
        _this.props.onClick(...arguments);
      },
      expandCollapsed: () => this.setState({
        isCollapsed: false
      })
    });
  }
  componentDidMount() {
    this.foundation.init();
  }
  componentWillUnmount() {
    this.foundation.destroy();
  }
  renderPopoverMore(restItem) {
    const {
      separator
    } = this.props;
    const content = /* @__PURE__ */ import_react57.default.createElement(import_react57.default.Fragment, null, restItem.map((item, idx) => /* @__PURE__ */ import_react57.default.createElement(import_react57.default.Fragment, {
      key: `restItem-${idx}`
    }, item, idx !== restItem.length - 1 && /* @__PURE__ */ import_react57.default.createElement("span", {
      className: `${clsPrefix3}-restItem`
    }, separator))));
    return /* @__PURE__ */ import_react57.default.createElement(popover_default, {
      content,
      style: {
        padding: 12
      },
      showArrow: true
    }, /* @__PURE__ */ import_react57.default.createElement(IconMore_default, null));
  }
  render() {
    const breadcrumbs = this.renderList();
    const {
      compact,
      className,
      style,
      separator,
      showTooltip
    } = this.props;
    const sizeCls = (0, import_classnames34.default)(className, {
      [`${clsPrefix3}-wrapper`]: true,
      [`${clsPrefix3}-wrapper-compact`]: compact,
      [`${clsPrefix3}-wrapper-loose`]: !compact
    });
    return /* @__PURE__ */ import_react57.default.createElement(bread_context_default.Provider, {
      value: {
        onClick: this.onClick,
        showTooltip,
        compact,
        separator
      }
    }, /* @__PURE__ */ import_react57.default.createElement("nav", Object.assign({
      "aria-label": this.props["aria-label"],
      className: sizeCls,
      style
    }, this.getDataAttr(this.props)), breadcrumbs));
  }
};
Breadcrumb.contextType = bread_context_default;
Breadcrumb.Item = BreadcrumbItem;
Breadcrumb.propTypes = {
  activeIndex: import_prop_types37.default.number,
  routes: import_prop_types37.default.array,
  onClick: import_prop_types37.default.func,
  separator: import_prop_types37.default.node,
  compact: import_prop_types37.default.bool,
  children: import_prop_types37.default.node,
  style: import_prop_types37.default.object,
  renderItem: import_prop_types37.default.func,
  showTooltip: import_prop_types37.default.oneOfType([import_prop_types37.default.shape({
    width: import_prop_types37.default.oneOfType([import_prop_types37.default.string, import_prop_types37.default.number]),
    ellipsisPos: import_prop_types37.default.oneOf(["end", "middle"]),
    opts: import_prop_types37.default.object
  }), import_prop_types37.default.bool]),
  className: import_prop_types37.default.string,
  autoCollapse: import_prop_types37.default.bool,
  maxItemCount: import_prop_types37.default.number,
  /* Customize the contents of the ellipsis area */
  renderMore: import_prop_types37.default.func,
  /* Type of ellipsis area */
  moreType: import_prop_types37.default.oneOf(strings13.MORE_TYPE),
  "aria-label": import_prop_types37.default.string
};
Breadcrumb.defaultProps = {
  routes: [],
  onClick: noop,
  renderItem: void 0,
  separator: "/",
  compact: true,
  showTooltip: {
    width: 150,
    ellipsisPos: "end"
  },
  autoCollapse: true,
  moreType: "default",
  maxItemCount: 4,
  "aria-label": "Breadcrumb"
};
var breadcrumb_default = Breadcrumb;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/button/buttonGroup.js
var import_get14 = __toESM(require_get());
var import_react58 = __toESM(require_react());
var import_prop_types38 = __toESM(require_prop_types());
var import_classnames35 = __toESM(require_classnames());
var __rest24 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls14 = cssClasses4.PREFIX;
var btnSizes2 = strings4.sizes;
var ButtonGroup = class extends BaseComponent {
  getInnerWithLine(inner) {
    const innerWithLine = [];
    if (inner.length > 1) {
      inner.slice(0, -1).forEach((item, index) => {
        const isButtonType = (0, import_get14.default)(item, "type.elementType") === "Button";
        const buttonProps = (0, import_get14.default)(item, "props");
        const {
          type,
          theme,
          disabled
        } = buttonProps !== null && buttonProps !== void 0 ? buttonProps : {};
        if (isButtonType && theme !== "outline") {
          const lineCls = (0, import_classnames35.default)(`${prefixCls14}-group-line`, `${prefixCls14}-group-line-${theme !== null && theme !== void 0 ? theme : "light"}`, `${prefixCls14}-group-line-${type !== null && type !== void 0 ? type : "primary"}`, {
            [`${prefixCls14}-group-line-disabled`]: disabled
          });
          innerWithLine.push(item, /* @__PURE__ */ import_react58.default.createElement("span", {
            className: lineCls,
            key: `line-${index}`
          }));
        } else {
          innerWithLine.push(item);
        }
      });
      innerWithLine.push(inner.slice(-1));
      return innerWithLine;
    } else {
      return inner;
    }
  }
  render() {
    const _a = this.props, {
      children,
      disabled,
      size,
      type,
      className,
      style,
      "aria-label": ariaLabel
    } = _a, rest = __rest24(_a, ["children", "disabled", "size", "type", "className", "style", "aria-label"]);
    let inner;
    let innerWithLine = [];
    const cls32 = (0, import_classnames35.default)(`${prefixCls14}-group`, className);
    if (children) {
      inner = (Array.isArray(children) ? children : [children]).map((itm, index) => {
        var _a2;
        return /* @__PURE__ */ (0, import_react58.isValidElement)(itm) ? /* @__PURE__ */ (0, import_react58.cloneElement)(itm, Object.assign(Object.assign(Object.assign({
          disabled,
          size,
          type
        }, itm.props), rest), {
          key: (_a2 = itm.key) !== null && _a2 !== void 0 ? _a2 : index
        })) : itm;
      });
      innerWithLine = this.getInnerWithLine(inner);
    }
    return /* @__PURE__ */ import_react58.default.createElement("div", {
      className: cls32,
      style,
      role: "group",
      "aria-label": ariaLabel
    }, innerWithLine);
  }
};
ButtonGroup.propTypes = {
  children: import_prop_types38.default.node,
  disabled: import_prop_types38.default.bool,
  type: import_prop_types38.default.string,
  size: import_prop_types38.default.oneOf(btnSizes2),
  theme: import_prop_types38.default.oneOf(strings4.themes),
  "aria-label": import_prop_types38.default.string
};
ButtonGroup.defaultProps = {
  // There are default values ​​for type and theme in Button. 
  // In order to allow users to individually customize the type and theme of the Button through the parameters of the Button in the ButtonGroup,
  // the default value of type and theme is not given in the ButtonGroup。
  size: "default"
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/card/index.js
var import_isString3 = __toESM(require_isString());
var import_omit5 = __toESM(require_omit());
var import_react62 = __toESM(require_react());
var import_prop_types42 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/card/constants.js
var cssClasses17 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-card`
};
var strings14 = {
  SHADOWS: ["hover", "always"],
  TYPE: ["grid"]
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/card/meta.js
var import_react59 = __toESM(require_react());
var import_prop_types39 = __toESM(require_prop_types());
var import_classnames36 = __toESM(require_classnames());
var __rest25 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixcls = cssClasses17.PREFIX;
var Meta = class extends import_react59.PureComponent {
  render() {
    const _a = this.props, {
      avatar,
      className,
      description,
      style,
      title
    } = _a, others = __rest25(_a, ["avatar", "className", "description", "style", "title"]);
    const metaCls = (0, import_classnames36.default)(`${prefixcls}-meta`, className);
    const avatarNode = avatar && /* @__PURE__ */ import_react59.default.createElement("div", {
      className: `${prefixcls}-meta-avatar`
    }, avatar);
    const titleNode = title && /* @__PURE__ */ import_react59.default.createElement("div", {
      className: `${prefixcls}-meta-wrapper-title`
    }, title);
    const descriptionNode = description && /* @__PURE__ */ import_react59.default.createElement("div", {
      className: `${prefixcls}-meta-wrapper-description`
    }, description);
    const wrapper = title || description ? /* @__PURE__ */ import_react59.default.createElement("div", {
      className: `${prefixcls}-meta-wrapper`
    }, titleNode, descriptionNode) : null;
    return /* @__PURE__ */ import_react59.default.createElement("div", Object.assign({}, others, {
      className: metaCls,
      style
    }), avatarNode, wrapper);
  }
};
Meta.propTypes = {
  avatar: import_prop_types39.default.node,
  className: import_prop_types39.default.string,
  description: import_prop_types39.default.node,
  style: import_prop_types39.default.object,
  title: import_prop_types39.default.node
};
var meta_default = Meta;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/card/index.js
var import_classnames39 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/skeleton/index.js
var import_react61 = __toESM(require_react());
var import_classnames38 = __toESM(require_classnames());
var import_prop_types41 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/skeleton/constants.js
var cssClasses18 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-skeleton`
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/skeleton/item.js
var import_react60 = __toESM(require_react());
var import_classnames37 = __toESM(require_classnames());
var import_prop_types40 = __toESM(require_prop_types());
var __rest26 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var sizeSet = strings12.SIZE;
var shapeSet = strings12.SHAPE;
var generator2 = (type) => (BasicComponent) => (props) => /* @__PURE__ */ import_react60.default.createElement(BasicComponent, Object.assign({
  type
}, props));
var Generic = class extends import_react60.PureComponent {
  render() {
    const _a = this.props, {
      prefixCls: prefixCls17,
      className,
      type,
      size,
      shape
    } = _a, others = __rest26(_a, ["prefixCls", "className", "type", "size", "shape"]);
    const classString = (0, import_classnames37.default)(className, `${prefixCls17}-${type}`, {
      [`${prefixCls17}-${type}-${size}`]: type.toUpperCase() === "AVATAR"
    }, {
      [`${prefixCls17}-${type}-${shape}`]: type.toUpperCase() === "AVATAR"
    });
    return /* @__PURE__ */ import_react60.default.createElement("div", Object.assign({
      className: classString
    }, others));
  }
};
Generic.propTypes = {
  type: import_prop_types40.default.string,
  prefixCls: import_prop_types40.default.string,
  style: import_prop_types40.default.object,
  className: import_prop_types40.default.string,
  size: import_prop_types40.default.oneOf(sizeSet),
  shape: import_prop_types40.default.oneOf(shapeSet)
};
Generic.defaultProps = {
  prefixCls: cssClasses18.PREFIX,
  size: "medium",
  shape: "circle"
};
var Avatar = generator2("avatar")(Generic);
var Image = generator2("image")(Generic);
var Title2 = generator2("title")(Generic);
var Button3 = generator2("button")(Generic);
var Paragraph2 = class extends import_react60.PureComponent {
  render() {
    const {
      prefixCls: prefixCls17,
      className,
      style,
      rows
    } = this.props;
    const classString = (0, import_classnames37.default)(className, `${prefixCls17}-paragraph`);
    return /* @__PURE__ */ import_react60.default.createElement("ul", {
      className: classString,
      style
    }, [...Array(rows)].map((e, i) => /* @__PURE__ */ import_react60.default.createElement("li", {
      key: i
    })));
  }
};
Paragraph2.propTypes = {
  rows: import_prop_types40.default.number,
  prefixCls: import_prop_types40.default.string,
  style: import_prop_types40.default.object,
  className: import_prop_types40.default.string
};
Paragraph2.defaultProps = {
  prefixCls: cssClasses18.PREFIX,
  rows: 4
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/skeleton/index.js
var __rest27 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls15 = cssClasses18.PREFIX;
var Skeleton = class extends import_react61.PureComponent {
  render() {
    const _a = this.props, {
      placeholder,
      active,
      children,
      className,
      loading,
      style
    } = _a, others = __rest27(_a, ["placeholder", "active", "children", "className", "loading", "style"]);
    const skCls = (0, import_classnames38.default)(prefixCls15, {
      [`${prefixCls15}-active`]: Boolean(active)
    }, className);
    let content;
    if (loading) {
      content = /* @__PURE__ */ import_react61.default.createElement("div", Object.assign({
        className: skCls,
        style
      }, others, {
        "x-semi-prop": "placeholder"
      }), placeholder);
    } else {
      content = children;
    }
    return content;
  }
};
Skeleton.Avatar = Avatar;
Skeleton.Title = Title2;
Skeleton.Button = Button3;
Skeleton.Paragraph = Paragraph2;
Skeleton.Image = Image;
Skeleton.defaultProps = {
  loading: true
};
Skeleton.propTypes = {
  active: import_prop_types41.default.bool,
  placeholder: import_prop_types41.default.node,
  style: import_prop_types41.default.object,
  className: import_prop_types41.default.string,
  loading: import_prop_types41.default.bool,
  children: import_prop_types41.default.node
};
var skeleton_default = Skeleton;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/card/index.js
var __rest28 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixcls2 = cssClasses17.PREFIX;
var Card = class extends import_react62.PureComponent {
  constructor() {
    super(...arguments);
    this.renderHeader = () => {
      const {
        title,
        headerExtraContent,
        header,
        headerLine,
        headerStyle
      } = this.props;
      const headerCls = (0, import_classnames39.default)(`${prefixcls2}-header`, {
        [`${prefixcls2}-header-bordered`]: Boolean(headerLine)
      });
      const headerWrapperCls = (0, import_classnames39.default)(`${prefixcls2}-header-wrapper`);
      const titleCls = (0, import_classnames39.default)(`${prefixcls2}-header-wrapper-title`, {
        [`${prefixcls2}-header-wrapper-spacing`]: Boolean(headerExtraContent)
      });
      if (header || headerExtraContent || title) {
        return /* @__PURE__ */ import_react62.default.createElement("div", {
          style: headerStyle,
          className: headerCls
        }, header || // Priority of header over title and headerExtraContent
        /* @__PURE__ */ import_react62.default.createElement("div", {
          className: headerWrapperCls
        }, headerExtraContent && /* @__PURE__ */ import_react62.default.createElement("div", {
          className: `${prefixcls2}-header-wrapper-extra`,
          "x-semi-prop": "headerExtraContent"
        }, headerExtraContent), title && /* @__PURE__ */ import_react62.default.createElement("div", {
          className: titleCls
        }, (0, import_isString3.default)(title) ? /* @__PURE__ */ import_react62.default.createElement(typography_default2.Title, {
          heading: 6,
          ellipsis: {
            showTooltip: true,
            rows: 1
          },
          "x-semi-prop": "title"
        }, title) : title)));
      }
      return null;
    };
    this.renderCover = () => {
      const {
        cover
      } = this.props;
      const coverCls = (0, import_classnames39.default)(`${prefixcls2}-cover`);
      return cover && /* @__PURE__ */ import_react62.default.createElement("div", {
        className: coverCls,
        "x-semi-prop": "cover"
      }, cover);
    };
    this.renderBody = () => {
      const {
        bodyStyle,
        children,
        actions,
        loading
      } = this.props;
      const bodyCls = (0, import_classnames39.default)(`${prefixcls2}-body`);
      const actionsCls = (0, import_classnames39.default)(`${prefixcls2}-body-actions`);
      const actionsItemCls = (0, import_classnames39.default)(`${prefixcls2}-body-actions-item`);
      const placeholder = /* @__PURE__ */ import_react62.default.createElement("div", null, /* @__PURE__ */ import_react62.default.createElement(skeleton_default.Title, null), /* @__PURE__ */ import_react62.default.createElement("br", null), /* @__PURE__ */ import_react62.default.createElement(skeleton_default.Paragraph, {
        rows: 3
      }));
      return /* @__PURE__ */ import_react62.default.createElement("div", {
        style: bodyStyle,
        className: bodyCls
      }, children && /* @__PURE__ */ import_react62.default.createElement(skeleton_default, {
        placeholder,
        loading,
        active: true
      }, children), Array.isArray(actions) && /* @__PURE__ */ import_react62.default.createElement("div", {
        className: actionsCls
      }, /* @__PURE__ */ import_react62.default.createElement(space_default, {
        spacing: 12
      }, actions.map((item, idx) => /* @__PURE__ */ import_react62.default.createElement("div", {
        key: idx,
        className: actionsItemCls,
        "x-semi-prop": `actions.${idx}`
      }, item)))));
    };
    this.renderFooter = () => {
      const {
        footer,
        footerLine,
        footerStyle
      } = this.props;
      const footerCls = (0, import_classnames39.default)(`${prefixcls2}-footer`, {
        [`${prefixcls2}-footer-bordered`]: footerLine
      });
      return footer && /* @__PURE__ */ import_react62.default.createElement("div", {
        style: footerStyle,
        className: footerCls,
        "x-semi-prop": "footer"
      }, footer);
    };
  }
  render() {
    const _a = this.props, {
      bordered,
      shadows,
      style,
      className
    } = _a, otherProps = __rest28(_a, ["bordered", "shadows", "style", "className"]);
    const others = (0, import_omit5.default)(otherProps, ["actions", "bodyStyle", "cover", "headerExtraContent", "footer", "footerLine", "footerStyle", "header", "headerLine", "headerStyle", "loading", "title"]);
    const cardCls = (0, import_classnames39.default)(prefixcls2, className, {
      [`${prefixcls2}-bordered`]: bordered,
      [`${prefixcls2}-shadows`]: shadows,
      [`${prefixcls2}-shadows-${shadows}`]: shadows
    });
    return /* @__PURE__ */ import_react62.default.createElement("div", Object.assign({}, others, {
      "aria-busy": this.props.loading,
      className: cardCls,
      style
    }), this.renderHeader(), this.renderCover(), this.renderBody(), this.renderFooter());
  }
};
Card.Meta = meta_default;
Card.propTypes = {
  actions: import_prop_types42.default.array,
  bodyStyle: import_prop_types42.default.object,
  bordered: import_prop_types42.default.bool,
  children: import_prop_types42.default.node,
  className: import_prop_types42.default.string,
  cover: import_prop_types42.default.node,
  footer: import_prop_types42.default.node,
  footerLine: import_prop_types42.default.bool,
  footerStyle: import_prop_types42.default.object,
  header: import_prop_types42.default.node,
  headerExtraContent: import_prop_types42.default.node,
  headerLine: import_prop_types42.default.bool,
  headerStyle: import_prop_types42.default.object,
  loading: import_prop_types42.default.bool,
  shadows: import_prop_types42.default.oneOf(strings14.SHADOWS),
  style: import_prop_types42.default.object,
  title: import_prop_types42.default.node,
  "aria-label": import_prop_types42.default.string
};
Card.defaultProps = {
  bordered: true,
  footerLine: false,
  headerLine: true,
  loading: false
};
var card_default = Card;

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/isObject.js
function isObject(obj) {
  return obj !== null && typeof obj === "object";
}

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/utils/isPromise.js
function isPromise(value) {
  return isObject(value) && typeof value.then === "function";
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/notification/index.js
var import_react66 = __toESM(require_react());
var import_react_dom5 = __toESM(require_react_dom());
var import_classnames42 = __toESM(require_classnames());
var import_prop_types44 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/notification/notificationListFoundation.js
var NotificationListFoundation = class extends foundation_default {
  addNotice(opts) {
    const notices = this._adapter.getNotices();
    this._adapter.updateNotices([opts, ...notices]);
  }
  has(id) {
    return this._adapter.getNotices().some((notice) => notice.id === id);
  }
  update(id, noticeOpts) {
    let notices = this._adapter.getNotices();
    notices = notices.map((notice) => notice.id === id ? Object.assign(Object.assign({}, notice), noticeOpts) : notice);
    const updatedItems = notices.filter((notice) => notice.id === id);
    this._adapter.updateNotices(notices, [], updatedItems);
  }
  removeNotice(id) {
    let notices = this._adapter.getNotices();
    const removedItems = [];
    notices = notices.filter((notice) => {
      if (notice.id === id) {
        removedItems.push(notice);
        return false;
      }
      return true;
    });
    this._adapter.updateNotices(notices, removedItems);
  }
  destroyAll() {
    const notices = this._adapter.getNotices();
    if (notices.length > 0) {
      this._adapter.updateNotices([], notices);
    }
  }
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/notification/constants.js
var cssClasses19 = {
  WRAPPER: `${BASE_CLASS_PREFIX2}-notification-wrapper`,
  LIST: `${BASE_CLASS_PREFIX2}-notification-list`,
  NOTICE: `${BASE_CLASS_PREFIX2}-notification-notice`
};
var strings15 = {
  types: ["warning", "success", "info", "error", "default"],
  themes: ["normal", "light"],
  directions: ["ltr", "rtl"]
};
var numbers5 = {
  duration: 3
  // default close time, unit: s
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/notification/notice.js
var import_noop13 = __toESM(require_noop());
var import_react63 = __toESM(require_react());
var import_classnames40 = __toESM(require_classnames());
var import_prop_types43 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/notification/notificationFoundation.js
var import_isNumber2 = __toESM(require_isNumber());
var NotificationFoundation = class extends foundation_default {
  constructor(adapter) {
    super(Object.assign(Object.assign({}, NotificationFoundation.defaultAdapter), adapter));
    this._timer = null;
    this._id = null;
  }
  init() {
    this._startCloseTimer();
    this._id = this.getProp("id");
  }
  destroy() {
    this._clearCloseTimer();
  }
  _startCloseTimer() {
    const duration2 = this.getProp("duration");
    if (duration2 && (0, import_isNumber2.default)(duration2)) {
      this._timer = setTimeout(() => {
        this.close();
      }, duration2 * 1e3);
    }
  }
  close(e) {
    if (e) {
      e.stopPropagation();
    }
    this._adapter.notifyWrapperToRemove(this._id);
    this._adapter.notifyClose();
  }
  _clearCloseTimer() {
    if (this._timer) {
      clearTimeout(this._timer);
      this._timer = null;
    }
  }
  restartCloseTimer() {
    this._clearCloseTimer();
    this._startCloseTimer();
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/notification/notice.js
var __rest29 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var prefixCls16 = cssClasses19.NOTICE;
var {
  duration
} = numbers5;
var {
  types,
  themes,
  directions
} = strings15;
var Notice = class extends BaseComponent {
  get adapter() {
    return Object.assign(Object.assign({}, super.adapter), {
      notifyWrapperToRemove: (id) => {
        this.props.close(id);
      },
      notifyClose: () => {
        this.props.onClose();
        this.props.onHookClose && this.props.onHookClose();
      }
    });
  }
  constructor(props) {
    super(props);
    this.clearCloseTimer = () => {
      this.foundation._clearCloseTimer();
    };
    this.startCloseTimer = () => {
      this.foundation._startCloseTimer();
    };
    this.close = (e) => {
      this.props.onCloseClick(this.props.id);
      this.foundation.close(e);
    };
    this.notifyClick = (e) => {
      this.props.onClick(e);
    };
    this.state = {
      visible: true
    };
    this.foundation = new NotificationFoundation(this.adapter);
  }
  componentWillUnmount() {
    this.foundation.destroy();
  }
  renderTypeIcon() {
    const {
      type,
      icon
    } = this.props;
    const iconMap = {
      warning: /* @__PURE__ */ import_react63.default.createElement(IconAlertTriangle_default, {
        size: "large"
      }),
      success: /* @__PURE__ */ import_react63.default.createElement(IconTickCircle_default, {
        size: "large"
      }),
      info: /* @__PURE__ */ import_react63.default.createElement(IconInfoCircle_default, {
        size: "large"
      }),
      error: /* @__PURE__ */ import_react63.default.createElement(IconAlertCircle_default, {
        size: "large"
      })
    };
    let iconType = iconMap[type];
    const iconCls = (0, import_classnames40.default)({
      [`${prefixCls16}-icon`]: true,
      [`${prefixCls16}-${type}`]: true
    });
    if (icon) {
      iconType = icon;
    }
    if (iconType) {
      return /* @__PURE__ */ import_react63.default.createElement("div", {
        className: iconCls,
        "x-semi-prop": "icon"
      }, isSemiIcon(iconType) ? /* @__PURE__ */ import_react63.default.cloneElement(iconType, {
        size: iconType.props.size || "large"
      }) : iconType);
    }
    return null;
  }
  render() {
    const direction = this.props.direction || this.context.direction;
    const defaultPosition = direction === "rtl" ? "topLeft" : "topRight";
    const _a = this.props, {
      content,
      title,
      theme,
      position = defaultPosition,
      type,
      id,
      onCloseClick,
      className,
      showClose,
      style
    } = _a, attr = __rest29(_a, ["content", "title", "theme", "position", "type", "id", "onCloseClick", "className", "showClose", "style"]);
    const {
      visible
    } = this.state;
    const wrapper = (0, import_classnames40.default)(prefixCls16, className, {
      [`${prefixCls16}-close`]: !visible,
      [`${prefixCls16}-icon-show`]: types.includes(type),
      [`${prefixCls16}-${type}`]: true,
      [`${prefixCls16}-${theme}`]: theme === "light",
      [`${prefixCls16}-rtl`]: direction === "rtl"
    });
    const titleID = getUuidShort({});
    return /* @__PURE__ */ import_react63.default.createElement("div", {
      className: wrapper,
      style,
      onMouseEnter: this.clearCloseTimer,
      onMouseLeave: this.startCloseTimer,
      onClick: this.notifyClick,
      "aria-labelledby": titleID,
      role: "alert",
      onAnimationEnd: this.props.onAnimationEnd,
      onAnimationStart: this.props.onAnimationStart
    }, /* @__PURE__ */ import_react63.default.createElement("div", null, this.renderTypeIcon()), /* @__PURE__ */ import_react63.default.createElement("div", {
      className: `${prefixCls16}-inner`
    }, /* @__PURE__ */ import_react63.default.createElement("div", {
      className: `${prefixCls16}-content-wrapper`
    }, title ? /* @__PURE__ */ import_react63.default.createElement("div", {
      id: titleID,
      className: `${prefixCls16}-title`,
      "x-semi-prop": "title"
    }, title) : "", content ? /* @__PURE__ */ import_react63.default.createElement("div", {
      className: `${prefixCls16}-content`,
      "x-semi-prop": "content"
    }, content) : ""), showClose && /* @__PURE__ */ import_react63.default.createElement(iconButton_default, {
      className: `${prefixCls16}-icon-close`,
      type: "tertiary",
      icon: /* @__PURE__ */ import_react63.default.createElement(IconClose_default, null),
      theme: "borderless",
      size: "small",
      onClick: this.close
    })));
  }
};
Notice.contextType = context_default;
Notice.propTypes = {
  duration: import_prop_types43.default.number,
  id: import_prop_types43.default.string,
  title: import_prop_types43.default.node,
  content: import_prop_types43.default.node,
  type: import_prop_types43.default.oneOf(types),
  theme: import_prop_types43.default.oneOf(themes),
  icon: import_prop_types43.default.node,
  onClick: import_prop_types43.default.func,
  onClose: import_prop_types43.default.func,
  onCloseClick: import_prop_types43.default.func,
  showClose: import_prop_types43.default.bool,
  // private props
  close: import_prop_types43.default.func,
  direction: import_prop_types43.default.oneOf(directions)
};
Notice.__SemiComponentName__ = "Notification";
Notice.defaultProps = getDefaultPropsFromGlobalConfig(Notice.__SemiComponentName__, {
  duration,
  id: "",
  close: import_noop13.default,
  onClose: import_noop13.default,
  onClick: import_noop13.default,
  onCloseClick: import_noop13.default,
  content: "",
  title: "",
  showClose: true,
  theme: "normal"
});
var notice_default = Notice;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/notification/useNotification/index.js
var import_react65 = __toESM(require_react());
var import_classnames41 = __toESM(require_classnames());

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/notification/useNotification/HookNotice.js
var import_react64 = __toESM(require_react());
var __rest30 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var HookNotice = (_a, ref2) => {
  var {
    afterClose
  } = _a, config = __rest30(_a, ["afterClose"]);
  const [visible, setVisible] = (0, import_react64.useState)(true);
  const close = () => {
    setVisible(false);
  };
  import_react64.default.useImperativeHandle(ref2, () => ({
    close: () => {
      setVisible(false);
    }
  }));
  (0, import_react64.useEffect)(() => {
    if (!visible) {
      afterClose(String(config.id));
    }
  }, [visible]);
  return visible ? /* @__PURE__ */ import_react64.default.createElement(notice_default, Object.assign({}, config, {
    onHookClose: close
  })) : null;
};
var HookNotice_default = /* @__PURE__ */ import_react64.default.forwardRef(HookNotice);

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/notification/useNotification/index.js
var defaultConfig = {
  duration: 3,
  position: "topRight",
  motion: true,
  content: "",
  title: "",
  zIndex: 1010
};
function usePatchElement() {
  const [elements, setElements] = (0, import_react65.useState)([]);
  function patchElement(element, config) {
    setElements((originElements) => [{
      element,
      config
    }, ...originElements]);
    return (id) => {
      setElements((originElements) => originElements.filter((_ref) => {
        let {
          config: configOfCurrentElement
        } = _ref;
        return configOfCurrentElement.id !== id;
      }));
    };
  }
  function renderList() {
    const noticesInPosition = {
      top: [],
      topLeft: [],
      topRight: [],
      bottom: [],
      bottomLeft: [],
      bottomRight: []
    };
    elements.forEach((_ref2) => {
      let {
        element,
        config
      } = _ref2;
      const {
        position
      } = config;
      noticesInPosition[position].push(element);
    });
    return Object.entries(noticesInPosition).map((obj) => {
      const pos = obj[0];
      const notices = obj[1];
      return Array.isArray(notices) && notices.length ? /* @__PURE__ */ import_react65.default.createElement("div", {
        key: pos,
        className: (0, import_classnames41.default)(cssClasses19.LIST),
        placement: pos
      }, notices) : null;
    });
  }
  return [renderList(), patchElement];
}
function useNotification() {
  const [elements, patchElement] = usePatchElement();
  const noticeRef = /* @__PURE__ */ new Map();
  const addNotice = (config) => {
    const id = getUuid("semi_notice_");
    const mergeConfig = Object.assign(Object.assign({}, config), {
      id
    });
    let closeFunc;
    const ref2 = (ele) => {
      noticeRef.set(id, ele);
    };
    const notice = /* @__PURE__ */ import_react65.default.createElement(HookNotice_default, Object.assign({
      key: id
    }, mergeConfig, {
      afterClose: (instanceID) => closeFunc(instanceID),
      ref: ref2
    }));
    closeFunc = patchElement(notice, Object.assign({}, mergeConfig));
    return id;
  };
  const removeElement = (instanceID) => {
    const ele = noticeRef.get(instanceID);
    ele && ele.close();
  };
  return [{
    success: (config) => addNotice(Object.assign(Object.assign(Object.assign({}, defaultConfig), config), {
      type: "success"
    })),
    info: (config) => addNotice(Object.assign(Object.assign(Object.assign({}, defaultConfig), config), {
      type: "info"
    })),
    error: (config) => addNotice(Object.assign(Object.assign(Object.assign({}, defaultConfig), config), {
      type: "error"
    })),
    warning: (config) => addNotice(Object.assign(Object.assign(Object.assign({}, defaultConfig), config), {
      type: "warning"
    })),
    open: (config) => addNotice(Object.assign(Object.assign(Object.assign({}, defaultConfig), config), {
      type: "default"
    })),
    close: removeElement
  }, /* @__PURE__ */ import_react65.default.createElement(import_react65.default.Fragment, null, elements)];
}

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/notification/index.js
var ref = null;
var defaultConfig2 = {
  duration: 3,
  position: "topRight",
  motion: true,
  content: "",
  title: "",
  zIndex: 1010
};
var NotificationList = class extends BaseComponent {
  constructor(props) {
    var _this;
    super(props);
    _this = this;
    this.add = (noticeOpts) => this.foundation.addNotice(noticeOpts);
    this.has = (id) => this.foundation.has(id);
    this.remove = (id) => {
      this.foundation.removeNotice(String(id));
    };
    this.update = (id, opts) => {
      return this.foundation.update(id, opts);
    };
    this.destroyAll = () => this.foundation.destroyAll();
    this.renderNoticeInPosition = function(notices, position) {
      let removedItems = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
      let updatedItems = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : [];
      const className = (0, import_classnames42.default)(cssClasses19.LIST);
      if (notices.length) {
        const style = _this.setPosInStyle(notices[0]);
        return (
          // @ts-ignore
          /* @__PURE__ */ import_react66.default.createElement("div", {
            placement: position,
            key: position,
            className,
            style
          }, notices.map((notice, index) => {
            const isRemoved = removedItems.find((removedItem) => removedItem.id === notice.id) !== void 0;
            return /* @__PURE__ */ import_react66.default.createElement(cssAnimation_default, {
              key: notice.id,
              animationState: isRemoved ? "leave" : "enter",
              startClassName: `${cssClasses19.NOTICE}-animation-${isRemoved ? "hide" : "show"}_${position}`
            }, (_ref) => {
              let {
                animationClassName,
                animationEventsNeedBind,
                isAnimating
              } = _ref;
              return isRemoved && !isAnimating ? null : /* @__PURE__ */ import_react66.default.createElement(notice_default, Object.assign({}, notice, {
                ref: (notice2) => {
                  if (notice2 && updatedItems.some((item) => item.id === notice2.props.id)) {
                    notice2.foundation.restartCloseTimer();
                  }
                },
                className: (0, import_classnames42.default)({
                  [notice.className]: Boolean(notice.className),
                  [animationClassName]: true
                })
              }, animationEventsNeedBind, {
                style: Object.assign({}, notice.style),
                close: _this.remove
              }));
            });
          }))
        );
      }
      return null;
    };
    this.state = {
      notices: [],
      removedItems: [],
      updatedItems: []
    };
    this.noticeStorage = [];
    this.removeItemStorage = [];
    this.foundation = new NotificationListFoundation(this.adapter);
  }
  get adapter() {
    var _this2 = this;
    return Object.assign(Object.assign({}, super.adapter), {
      updateNotices: function(notices) {
        let removedItems = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : [];
        let updatedItems = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
        _this2.noticeStorage = [...notices];
        _this2.removeItemStorage = [...removedItems];
        _this2.setState({
          notices,
          removedItems,
          updatedItems
        });
      },
      getNotices: () => this.noticeStorage
    });
  }
  static addNotice(notice) {
    var _a;
    notice = Object.assign(Object.assign({}, defaultConfig2), notice);
    const id = (_a = notice.id) !== null && _a !== void 0 ? _a : getUuid("notification");
    if (!ref) {
      const {
        getPopupContainer
      } = notice;
      const div = document.createElement("div");
      if (!this.wrapperId) {
        this.wrapperId = getUuid("notification-wrapper").slice(0, 32);
      }
      div.className = cssClasses19.WRAPPER;
      div.id = this.wrapperId;
      div.style.zIndex = String(typeof notice.zIndex === "number" ? notice.zIndex : defaultConfig2.zIndex);
      if (getPopupContainer) {
        const container = getPopupContainer();
        container.appendChild(div);
      } else {
        document.body.appendChild(div);
      }
      import_react_dom5.default.render(/* @__PURE__ */ import_react66.default.createElement(NotificationList, {
        ref: (instance) => ref = instance
      }), div, () => {
        ref.add(Object.assign(Object.assign({}, notice), {
          id
        }));
      });
    } else {
      if (ref.has(`${id}`)) {
        ref.update(id, notice);
      } else {
        ref.add(Object.assign(Object.assign({}, notice), {
          id
        }));
      }
    }
    return id;
  }
  static removeNotice(id) {
    if (ref) {
      ref.remove(id);
    }
    return id;
  }
  static info(opts) {
    return this.addNotice(Object.assign(Object.assign({}, opts), {
      type: "info"
    }));
  }
  static success(opts) {
    return this.addNotice(Object.assign(Object.assign({}, opts), {
      type: "success"
    }));
  }
  static error(opts) {
    return this.addNotice(Object.assign(Object.assign({}, opts), {
      type: "error"
    }));
  }
  static warning(opts) {
    return this.addNotice(Object.assign(Object.assign({}, opts), {
      type: "warning"
    }));
  }
  static open(opts) {
    return this.addNotice(Object.assign(Object.assign({}, opts), {
      type: "default"
    }));
  }
  static close(id) {
    return this.removeNotice(id);
  }
  static destroyAll() {
    if (ref) {
      ref.destroyAll();
      const wrapper = document.querySelector(`#${this.wrapperId}`);
      import_react_dom5.default.unmountComponentAtNode(wrapper);
      wrapper && wrapper.parentNode.removeChild(wrapper);
      ref = null;
      this.wrapperId = null;
    }
  }
  static config(opts) {
    ["top", "left", "bottom", "right"].map((pos) => {
      if (pos in opts) {
        defaultConfig2[pos] = opts[pos];
      }
    });
    if (typeof opts.zIndex === "number") {
      defaultConfig2.zIndex = opts.zIndex;
    }
    if (typeof opts.duration === "number") {
      defaultConfig2.duration = opts.duration;
    }
    if (typeof opts.position === "string") {
      defaultConfig2.position = opts.position;
    }
  }
  setPosInStyle(noticeInstance) {
    const style = {};
    ["top", "left", "bottom", "right"].forEach((pos) => {
      if (pos in noticeInstance) {
        const val = noticeInstance[pos];
        style[pos] = typeof val === "number" ? `${val}px` : val;
      }
    });
    return style;
  }
  render() {
    let {
      notices
    } = this.state;
    const {
      removedItems,
      updatedItems
    } = this.state;
    notices = Array.from(/* @__PURE__ */ new Set([...notices, ...removedItems]));
    const noticesInPosition = {
      top: [],
      topLeft: [],
      topRight: [],
      bottom: [],
      bottomLeft: [],
      bottomRight: []
    };
    notices.forEach((notice) => {
      const direction = notice.direction || this.context.direction;
      const defaultPosition = direction === "rtl" ? "topLeft" : "topRight";
      const position = notice.position || defaultPosition;
      noticesInPosition[position].push(notice);
    });
    const noticesList = Object.entries(noticesInPosition).map((obj) => {
      const pos = obj[0];
      const noticesInPos = obj[1];
      return this.renderNoticeInPosition(noticesInPos, pos, removedItems, updatedItems);
    });
    return /* @__PURE__ */ import_react66.default.createElement(import_react66.default.Fragment, null, noticesList);
  }
};
NotificationList.contextType = context_default;
NotificationList.propTypes = {
  style: import_prop_types44.default.object,
  className: import_prop_types44.default.string,
  direction: import_prop_types44.default.oneOf(strings15.directions)
};
NotificationList.defaultProps = {};
NotificationList.useNotification = useNotification;
var notification_default = NotificationList;

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/popconfirm/index.js
var import_omit6 = __toESM(require_omit());
var import_isFunction5 = __toESM(require_isFunction());
var import_get16 = __toESM(require_get());
var import_noop14 = __toESM(require_noop());
var import_react67 = __toESM(require_react());
var import_classnames43 = __toESM(require_classnames());
var import_prop_types45 = __toESM(require_prop_types());

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/popconfirm/constants.js
var cssClasses20 = {
  PREFIX: `${BASE_CLASS_PREFIX2}-popconfirm`,
  POPOVER: `${BASE_CLASS_PREFIX2}-popconfirm-popover`
};
var numbers6 = {
  SPACING: 4,
  DEFAULT_Z_INDEX: 1030
};

// node_modules/.pnpm/@douyinfe+semi-foundation@2.66.1/node_modules/@douyinfe/semi-foundation/lib/es/popconfirm/popconfirmFoundation.js
var import_get15 = __toESM(require_get());
var PopConfirmFoundation = class extends foundation_default {
  init() {
  }
  destroy() {
  }
  handleCancel(e) {
    const maybePromise = this._adapter.notifyCancel(e);
    if (isPromise(maybePromise)) {
      this._adapter.updateCancelLoading(true);
      maybePromise.then((result) => {
        this.handleVisibleChange(false);
        this._adapter.updateCancelLoading(false);
      }, (errors) => {
        this._adapter.updateCancelLoading(false);
      });
    } else {
      this.handleVisibleChange(false);
    }
  }
  handleConfirm(e) {
    const maybePromise = this._adapter.notifyConfirm(e);
    if (isPromise(maybePromise)) {
      this._adapter.updateConfirmLoading(true);
      maybePromise.then((result) => {
        this._adapter.updateConfirmLoading(false);
        this.handleVisibleChange(false);
      }, (errors) => {
        this._adapter.updateConfirmLoading(false);
      });
    } else {
      this.handleVisibleChange(false);
    }
  }
  handleClickOutSide(e) {
    this._adapter.notifyClickOutSide(e);
  }
  handleVisibleChange(visible) {
    if (!this._isControlledComponent("visible")) {
      this._adapter.setVisible(visible);
    }
    if (visible) {
      this.handleFocusOperateButton();
    } else {
      this._adapter.focusPrevFocusElement();
    }
    this._adapter.notifyVisibleChange(visible);
  }
  handleFocusOperateButton() {
    const {
      cancelButtonProps,
      okButtonProps
    } = this._adapter.getProps();
    if ((0, import_get15.default)(cancelButtonProps, "autoFocus") && !(0, import_get15.default)(cancelButtonProps, "disabled")) {
      this._adapter.focusCancelButton();
    } else if ((0, import_get15.default)(okButtonProps, "autoFocus") && !(0, import_get15.default)(okButtonProps, "disabled")) {
      this._adapter.focusOkButton();
    }
  }
};

// node_modules/.pnpm/@douyinfe+semi-ui@2.66.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/@douyinfe/semi-ui/lib/es/popconfirm/index.js
var __rest31 = function(s, e) {
  var t = {};
  for (var p in s)
    if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
      t[p] = s[p];
  if (s != null && typeof Object.getOwnPropertySymbols === "function")
    for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
      if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
        t[p[i]] = s[p[i]];
    }
  return t;
};
var Popconfirm = class extends BaseComponent {
  constructor(props) {
    super(props);
    this.handleCancel = (e) => this.foundation.handleCancel(e && e.nativeEvent);
    this.handleConfirm = (e) => this.foundation.handleConfirm(e && e.nativeEvent);
    this.handleVisibleChange = (visible) => this.foundation.handleVisibleChange(visible);
    this.handleClickOutSide = (e) => this.foundation.handleClickOutSide(e);
    this.stopImmediatePropagation = (e) => e && e.nativeEvent && e.nativeEvent.stopImmediatePropagation();
    this.renderConfirmPopCard = (_ref) => {
      let {
        initialFocusRef
      } = _ref;
      const {
        content,
        title,
        className,
        style,
        cancelType,
        icon,
        prefixCls: prefixCls17,
        showCloseIcon
      } = this.props;
      const {
        direction
      } = this.context;
      const popCardCls = (0, import_classnames43.default)(prefixCls17, className, {
        [`${prefixCls17}-rtl`]: direction === "rtl"
      });
      const showTitle = title !== null && typeof title !== "undefined";
      const showContent = !(content === null || typeof content === "undefined");
      const hasIcon = /* @__PURE__ */ import_react67.default.isValidElement(icon);
      const bodyCls = (0, import_classnames43.default)({
        [`${prefixCls17}-body`]: true,
        [`${prefixCls17}-body-withIcon`]: hasIcon
      });
      return (
        /* eslint-disable-next-line jsx-a11y/no-static-element-interactions */
        /* @__PURE__ */ import_react67.default.createElement("div", {
          className: popCardCls,
          onClick: this.stopImmediatePropagation,
          style
        }, /* @__PURE__ */ import_react67.default.createElement("div", {
          className: `${prefixCls17}-inner`
        }, /* @__PURE__ */ import_react67.default.createElement("div", {
          className: `${prefixCls17}-header`
        }, hasIcon ? /* @__PURE__ */ import_react67.default.createElement("i", {
          className: `${prefixCls17}-header-icon`,
          "x-semi-prop": "icon"
        }, icon) : null, /* @__PURE__ */ import_react67.default.createElement("div", {
          className: `${prefixCls17}-header-body`
        }, showTitle ? /* @__PURE__ */ import_react67.default.createElement("div", {
          className: `${prefixCls17}-header-title`,
          "x-semi-prop": "title"
        }, title) : null), showCloseIcon ? /* @__PURE__ */ import_react67.default.createElement(button_default, {
          className: `${prefixCls17}-btn-close`,
          icon: /* @__PURE__ */ import_react67.default.createElement(IconClose_default, null),
          size: "small",
          theme: "borderless",
          type: cancelType,
          onClick: this.handleCancel
        }) : null), showContent ? /* @__PURE__ */ import_react67.default.createElement("div", {
          className: bodyCls,
          "x-semi-prop": "content"
        }, (0, import_isFunction5.default)(content) ? content({
          initialFocusRef
        }) : content) : null, /* @__PURE__ */ import_react67.default.createElement("div", {
          className: `${prefixCls17}-footer`,
          ref: this.footerRef
        }, this.renderControls())))
      );
    };
    this.state = {
      cancelLoading: false,
      confirmLoading: false,
      visible: props.defaultVisible || false
    };
    this.foundation = new PopConfirmFoundation(this.adapter);
    this.footerRef = /* @__PURE__ */ import_react67.default.createRef();
    this.popoverRef = /* @__PURE__ */ import_react67.default.createRef();
  }
  static getDerivedStateFromProps(props, state) {
    const willUpdateStates = {};
    const {
      hasOwnProperty: hasOwnProperty3
    } = Object.prototype;
    if (hasOwnProperty3.call(props, "visible")) {
      willUpdateStates.visible = props.visible;
    }
    return willUpdateStates;
  }
  get adapter() {
    return Object.assign(Object.assign({}, super.adapter), {
      setVisible: (visible) => this.setState({
        visible
      }),
      updateConfirmLoading: (loading) => this.setState({
        confirmLoading: loading
      }),
      updateCancelLoading: (loading) => this.setState({
        cancelLoading: loading
      }),
      notifyConfirm: (e) => this.props.onConfirm(e),
      notifyCancel: (e) => this.props.onCancel(e),
      notifyVisibleChange: (visible) => this.props.onVisibleChange(visible),
      notifyClickOutSide: (e) => this.props.onClickOutSide(e),
      focusCancelButton: () => {
        var _a, _b;
        const buttonNode = (_b = (_a = this.footerRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.querySelector("[data-type=cancel]");
        buttonNode === null || buttonNode === void 0 ? void 0 : buttonNode.focus({
          preventScroll: true
        });
      },
      focusOkButton: () => {
        var _a, _b;
        const buttonNode = (_b = (_a = this.footerRef) === null || _a === void 0 ? void 0 : _a.current) === null || _b === void 0 ? void 0 : _b.querySelector("[data-type=ok]");
        buttonNode === null || buttonNode === void 0 ? void 0 : buttonNode.focus({
          preventScroll: true
        });
      },
      focusPrevFocusElement: () => {
        var _a;
        (_a = this.popoverRef.current) === null || _a === void 0 ? void 0 : _a.focusTrigger();
      }
    });
  }
  renderControls() {
    const {
      okText,
      cancelText,
      okType,
      cancelType,
      cancelButtonProps,
      okButtonProps
    } = this.props;
    const {
      cancelLoading,
      confirmLoading
    } = this.state;
    return /* @__PURE__ */ import_react67.default.createElement(LocaleConsumer, {
      componentName: "Popconfirm"
    }, (locale2, localeCode) => /* @__PURE__ */ import_react67.default.createElement(import_react67.default.Fragment, null, /* @__PURE__ */ import_react67.default.createElement(button_default, Object.assign({
      "data-type": "cancel",
      type: cancelType,
      onClick: this.handleCancel,
      loading: cancelLoading
    }, (0, import_omit6.default)(cancelButtonProps, "autoFocus")), cancelText || (0, import_get16.default)(locale2, "cancel")), /* @__PURE__ */ import_react67.default.createElement(button_default, Object.assign({
      "data-type": "ok",
      type: okType,
      theme: "solid",
      onClick: this.handleConfirm,
      loading: confirmLoading
    }, (0, import_omit6.default)(okButtonProps, "autoFocus")), okText || (0, import_get16.default)(locale2, "confirm"))));
  }
  render() {
    const {
      direction
    } = this.context;
    const defaultPosition = direction === "rtl" ? "bottomRight" : "bottomLeft";
    const _a = this.props, {
      className,
      prefixCls: prefixCls17,
      disabled,
      children,
      style,
      position = defaultPosition
    } = _a, attrs = __rest31(_a, ["className", "prefixCls", "disabled", "children", "style", "position"]);
    if (disabled) {
      return children;
    }
    const {
      visible
    } = this.state;
    const popProps = {
      onVisibleChange: this.handleVisibleChange,
      className: cssClasses20.POPOVER,
      onClickOutSide: this.handleClickOutSide
    };
    if (this.isControlled("visible")) {
      popProps.trigger = "custom";
    }
    return /* @__PURE__ */ import_react67.default.createElement(popover_default, Object.assign({
      ref: this.popoverRef
    }, attrs, {
      // A arrow function needs to be passed here, otherwise the content will not be updated after the Popconfirm state is updated
      // Popover is a PureComponent, same props will not trigger update
      content: (_ref2) => {
        let {
          initialFocusRef
        } = _ref2;
        return this.renderConfirmPopCard({
          initialFocusRef
        });
      },
      visible,
      position
    }, popProps), children);
  }
};
Popconfirm.contextType = context_default;
Popconfirm.propTypes = {
  motion: import_prop_types45.default.oneOfType([import_prop_types45.default.bool, import_prop_types45.default.func, import_prop_types45.default.object]),
  disabled: import_prop_types45.default.bool,
  content: import_prop_types45.default.oneOfType([import_prop_types45.default.node, import_prop_types45.default.func]),
  title: import_prop_types45.default.any,
  prefixCls: import_prop_types45.default.string,
  className: import_prop_types45.default.string,
  style: import_prop_types45.default.object,
  icon: import_prop_types45.default.node,
  okText: import_prop_types45.default.string,
  okType: import_prop_types45.default.string,
  cancelText: import_prop_types45.default.string,
  cancelType: import_prop_types45.default.string,
  onCancel: import_prop_types45.default.func,
  onConfirm: import_prop_types45.default.func,
  onClickOutSide: import_prop_types45.default.func,
  onVisibleChange: import_prop_types45.default.func,
  visible: import_prop_types45.default.bool,
  defaultVisible: import_prop_types45.default.bool,
  okButtonProps: import_prop_types45.default.object,
  cancelButtonProps: import_prop_types45.default.object,
  stopPropagation: import_prop_types45.default.oneOfType([import_prop_types45.default.bool, import_prop_types45.default.string]),
  showCloseIcon: import_prop_types45.default.bool,
  zIndex: import_prop_types45.default.number,
  // private
  trigger: import_prop_types45.default.string,
  position: import_prop_types45.default.string
};
Popconfirm.__SemiComponentName__ = "Popconfirm";
Popconfirm.defaultProps = getDefaultPropsFromGlobalConfig(Popconfirm.__SemiComponentName__, {
  stopPropagation: true,
  trigger: "click",
  // position: 'bottomLeft',
  onVisibleChange: import_noop14.default,
  disabled: false,
  icon: /* @__PURE__ */ import_react67.default.createElement(IconAlertTriangle_default, {
    size: "extra-large"
  }),
  okType: "primary",
  cancelType: "tertiary",
  prefixCls: cssClasses20.PREFIX,
  zIndex: numbers6.DEFAULT_Z_INDEX,
  showCloseIcon: true,
  onCancel: import_noop14.default,
  onConfirm: import_noop14.default,
  onClickOutSide: import_noop14.default
});

// app/components/width_limit.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/width_limit.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/width_limit.tsx"
  );
  import.meta.hot.lastModified = "1724971773433.3914";
}
function WidthLimit({
  children,
  style,
  maxWidth = "1200px",
  top,
  ...props
}) {
  top = top ?? false;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
    ...style,
    maxWidth,
    margin: "0 auto",
    padding: "0 1em",
    paddingTop: top ? "1em" : 0
  }, ...props, children }, void 0, false, {
    fileName: "app/components/width_limit.tsx",
    lineNumber: 29,
    columnNumber: 10
  }, this);
}
_c = WidthLimit;
var _c;
$RefreshReg$(_c, "WidthLimit");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  IconActivity_default,
  IconBell_default,
  IconCheckboxTick_default,
  IconCopy_default,
  IconDelete_default,
  IconDownload_default,
  IconEdit_default,
  IconFavoriteList_default,
  IconGithubLogo_default,
  IconHome_default,
  IconPlus_default,
  IconTick_default,
  require_prop_types,
  Tooltip2 as Tooltip,
  popover_default,
  Text,
  Title,
  typography_default2 as typography_default,
  spin_default,
  breadcrumb_default,
  button_default,
  ButtonGroup,
  space_default,
  card_default,
  divider_default,
  dropdown_default,
  row_default,
  col_default,
  Layout,
  list_default,
  navigation_default,
  notification_default,
  Popconfirm,
  WidthLimit
};
/*! Bundled license information:

classnames/index.js:
  (*!
  	Copyright (c) 2018 Jed Watson.
  	Licensed under the MIT License (MIT), see
  	http://jedwatson.github.io/classnames
  *)

react-is/cjs/react-is.development.js:
  (** @license React v16.13.1
   * react-is.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

object-assign/index.js:
  (*
  object-assign
  (c) Sindre Sorhus
  @license MIT
  *)
*/
//# sourceMappingURL=/build/_shared/chunk-N2TUX3U2.js.map
