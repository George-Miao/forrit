import {
  extract_entry,
  extract_meta
} from "/build/_shared/chunk-JLWCXM6I.js";
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

// node_modules/.pnpm/use-sync-external-store@1.2.2_react@18.3.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js
var require_use_sync_external_store_shim_development = __commonJS({
  "node_modules/.pnpm/use-sync-external-store@1.2.2_react@18.3.1/node_modules/use-sync-external-store/cjs/use-sync-external-store-shim.development.js"(exports) {
    "use strict";
    if (true) {
      (function() {
        "use strict";
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(new Error());
        }
        var React2 = require_react();
        var ReactSharedInternals = React2.__SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED;
        function error(format) {
          {
            {
              for (var _len2 = arguments.length, args = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                args[_key2 - 1] = arguments[_key2];
              }
              printWarning("error", format, args);
            }
          }
        }
        function printWarning(level, format, args) {
          {
            var ReactDebugCurrentFrame = ReactSharedInternals.ReactDebugCurrentFrame;
            var stack = ReactDebugCurrentFrame.getStackAddendum();
            if (stack !== "") {
              format += "%s";
              args = args.concat([stack]);
            }
            var argsWithFormat = args.map(function(item) {
              return String(item);
            });
            argsWithFormat.unshift("Warning: " + format);
            Function.prototype.apply.call(console[level], console, argsWithFormat);
          }
        }
        function is(x, y) {
          return x === y && (x !== 0 || 1 / x === 1 / y) || x !== x && y !== y;
        }
        var objectIs = typeof Object.is === "function" ? Object.is : is;
        var useState = React2.useState, useEffect2 = React2.useEffect, useLayoutEffect2 = React2.useLayoutEffect, useDebugValue3 = React2.useDebugValue;
        var didWarnOld18Alpha = false;
        var didWarnUncachedGetSnapshot = false;
        function useSyncExternalStore3(subscribe, getSnapshot, getServerSnapshot) {
          {
            if (!didWarnOld18Alpha) {
              if (React2.startTransition !== void 0) {
                didWarnOld18Alpha = true;
                error("You are using an outdated, pre-release alpha of React 18 that does not support useSyncExternalStore. The use-sync-external-store shim will not work correctly. Upgrade to a newer pre-release.");
              }
            }
          }
          var value = getSnapshot();
          {
            if (!didWarnUncachedGetSnapshot) {
              var cachedValue = getSnapshot();
              if (!objectIs(value, cachedValue)) {
                error("The result of getSnapshot should be cached to avoid an infinite loop");
                didWarnUncachedGetSnapshot = true;
              }
            }
          }
          var _useState = useState({
            inst: {
              value,
              getSnapshot
            }
          }), inst = _useState[0].inst, forceUpdate = _useState[1];
          useLayoutEffect2(function() {
            inst.value = value;
            inst.getSnapshot = getSnapshot;
            if (checkIfSnapshotChanged(inst)) {
              forceUpdate({
                inst
              });
            }
          }, [subscribe, value, getSnapshot]);
          useEffect2(function() {
            if (checkIfSnapshotChanged(inst)) {
              forceUpdate({
                inst
              });
            }
            var handleStoreChange = function() {
              if (checkIfSnapshotChanged(inst)) {
                forceUpdate({
                  inst
                });
              }
            };
            return subscribe(handleStoreChange);
          }, [subscribe]);
          useDebugValue3(value);
          return value;
        }
        function checkIfSnapshotChanged(inst) {
          var latestGetSnapshot = inst.getSnapshot;
          var prevValue = inst.value;
          try {
            var nextValue = latestGetSnapshot();
            return !objectIs(prevValue, nextValue);
          } catch (error2) {
            return true;
          }
        }
        function useSyncExternalStore$1(subscribe, getSnapshot, getServerSnapshot) {
          return getSnapshot();
        }
        var canUseDOM = !!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
        var isServerEnvironment = !canUseDOM;
        var shim = isServerEnvironment ? useSyncExternalStore$1 : useSyncExternalStore3;
        var useSyncExternalStore$2 = React2.useSyncExternalStore !== void 0 ? React2.useSyncExternalStore : shim;
        exports.useSyncExternalStore = useSyncExternalStore$2;
        if (typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ !== "undefined" && typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop === "function") {
          __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(new Error());
        }
      })();
    }
  }
});

// node_modules/.pnpm/use-sync-external-store@1.2.2_react@18.3.1/node_modules/use-sync-external-store/shim/index.js
var require_shim = __commonJS({
  "node_modules/.pnpm/use-sync-external-store@1.2.2_react@18.3.1/node_modules/use-sync-external-store/shim/index.js"(exports, module) {
    "use strict";
    if (false) {
      module.exports = null;
    } else {
      module.exports = require_use_sync_external_store_shim_development();
    }
  }
});

// node_modules/.pnpm/openapi-fetch@0.9.8/node_modules/openapi-fetch/dist/index.js
var DEFAULT_HEADERS = {
  "Content-Type": "application/json"
};
var PATH_PARAM_RE = /\{[^{}]+\}/g;
var CustomRequest = class extends Request {
  constructor(input, init) {
    super(input, init);
    for (const key in init) {
      if (!(key in this)) {
        this[key] = init[key];
      }
    }
  }
};
function createClient(clientOptions) {
  let {
    baseUrl = "",
    fetch: baseFetch = globalThis.fetch,
    querySerializer: globalQuerySerializer,
    bodySerializer: globalBodySerializer,
    headers: baseHeaders,
    ...baseOptions
  } = { ...clientOptions };
  if (baseUrl.endsWith("/")) {
    baseUrl = baseUrl.substring(0, baseUrl.length - 1);
  }
  baseHeaders = mergeHeaders(DEFAULT_HEADERS, baseHeaders);
  const middlewares = [];
  async function coreFetch(url, fetchOptions) {
    const {
      fetch = baseFetch,
      headers,
      params = {},
      parseAs = "json",
      querySerializer: requestQuerySerializer,
      bodySerializer = globalBodySerializer ?? defaultBodySerializer,
      ...init
    } = fetchOptions || {};
    let querySerializer = typeof globalQuerySerializer === "function" ? globalQuerySerializer : createQuerySerializer(globalQuerySerializer);
    if (requestQuerySerializer) {
      querySerializer = typeof requestQuerySerializer === "function" ? requestQuerySerializer : createQuerySerializer({
        ...typeof globalQuerySerializer === "object" ? globalQuerySerializer : {},
        ...requestQuerySerializer
      });
    }
    const requestInit = {
      redirect: "follow",
      ...baseOptions,
      ...init,
      headers: mergeHeaders(baseHeaders, headers, params.header)
    };
    if (requestInit.body) {
      requestInit.body = bodySerializer(requestInit.body);
    }
    if (requestInit.body instanceof FormData) {
      requestInit.headers.delete("Content-Type");
    }
    let request = new CustomRequest(createFinalURL(url, { baseUrl, params, querySerializer }), requestInit);
    const mergedOptions = {
      baseUrl,
      fetch,
      parseAs,
      querySerializer,
      bodySerializer
    };
    for (const m of middlewares) {
      if (m && typeof m === "object" && typeof m.onRequest === "function") {
        request.schemaPath = url;
        request.params = params;
        const result = await m.onRequest(request, mergedOptions);
        if (result) {
          if (!(result instanceof Request)) {
            throw new Error("Middleware must return new Request() when modifying the request");
          }
          request = result;
        }
      }
    }
    let response = await fetch(request);
    for (let i = middlewares.length - 1; i >= 0; i--) {
      const m = middlewares[i];
      if (m && typeof m === "object" && typeof m.onResponse === "function") {
        request.schemaPath = url;
        request.params = params;
        const result = await m.onResponse(response, mergedOptions, request);
        if (result) {
          if (!(result instanceof Response)) {
            throw new Error("Middleware must return new Response() when modifying the response");
          }
          response = result;
        }
      }
    }
    if (response.status === 204 || response.headers.get("Content-Length") === "0") {
      return response.ok ? { data: {}, response } : { error: {}, response };
    }
    if (response.ok) {
      if (parseAs === "stream") {
        return { data: response.body, response };
      }
      return { data: await response[parseAs](), response };
    }
    let error = await response.text();
    try {
      error = JSON.parse(error);
    } catch {
    }
    return { error, response };
  }
  return {
    /** Call a GET endpoint */
    async GET(url, init) {
      return coreFetch(url, { ...init, method: "GET" });
    },
    /** Call a PUT endpoint */
    async PUT(url, init) {
      return coreFetch(url, { ...init, method: "PUT" });
    },
    /** Call a POST endpoint */
    async POST(url, init) {
      return coreFetch(url, { ...init, method: "POST" });
    },
    /** Call a DELETE endpoint */
    async DELETE(url, init) {
      return coreFetch(url, { ...init, method: "DELETE" });
    },
    /** Call a OPTIONS endpoint */
    async OPTIONS(url, init) {
      return coreFetch(url, { ...init, method: "OPTIONS" });
    },
    /** Call a HEAD endpoint */
    async HEAD(url, init) {
      return coreFetch(url, { ...init, method: "HEAD" });
    },
    /** Call a PATCH endpoint */
    async PATCH(url, init) {
      return coreFetch(url, { ...init, method: "PATCH" });
    },
    /** Call a TRACE endpoint */
    async TRACE(url, init) {
      return coreFetch(url, { ...init, method: "TRACE" });
    },
    /** Register middleware */
    use(...middleware2) {
      for (const m of middleware2) {
        if (!m) {
          continue;
        }
        if (typeof m !== "object" || !("onRequest" in m || "onResponse" in m)) {
          throw new Error("Middleware must be an object with one of `onRequest()` or `onResponse()`");
        }
        middlewares.push(m);
      }
    },
    /** Unregister middleware */
    eject(...middleware2) {
      for (const m of middleware2) {
        const i = middlewares.indexOf(m);
        if (i !== -1) {
          middlewares.splice(i, 1);
        }
      }
    }
  };
}
function serializePrimitiveParam(name, value, options) {
  if (value === void 0 || value === null) {
    return "";
  }
  if (typeof value === "object") {
    throw new Error(
      "Deeply-nested arrays/objects aren\u2019t supported. Provide your own `querySerializer()` to handle these."
    );
  }
  return `${name}=${options?.allowReserved === true ? value : encodeURIComponent(value)}`;
}
function serializeObjectParam(name, value, options) {
  if (!value || typeof value !== "object") {
    return "";
  }
  const values = [];
  const joiner = {
    simple: ",",
    label: ".",
    matrix: ";"
  }[options.style] || "&";
  if (options.style !== "deepObject" && options.explode === false) {
    for (const k in value) {
      values.push(k, options.allowReserved === true ? value[k] : encodeURIComponent(value[k]));
    }
    const final2 = values.join(",");
    switch (options.style) {
      case "form": {
        return `${name}=${final2}`;
      }
      case "label": {
        return `.${final2}`;
      }
      case "matrix": {
        return `;${name}=${final2}`;
      }
      default: {
        return final2;
      }
    }
  }
  for (const k in value) {
    const finalName = options.style === "deepObject" ? `${name}[${k}]` : k;
    values.push(serializePrimitiveParam(finalName, value[k], options));
  }
  const final = values.join(joiner);
  return options.style === "label" || options.style === "matrix" ? `${joiner}${final}` : final;
}
function serializeArrayParam(name, value, options) {
  if (!Array.isArray(value)) {
    return "";
  }
  if (options.explode === false) {
    const joiner2 = { form: ",", spaceDelimited: "%20", pipeDelimited: "|" }[options.style] || ",";
    const final = (options.allowReserved === true ? value : value.map((v) => encodeURIComponent(v))).join(joiner2);
    switch (options.style) {
      case "simple": {
        return final;
      }
      case "label": {
        return `.${final}`;
      }
      case "matrix": {
        return `;${name}=${final}`;
      }
      default: {
        return `${name}=${final}`;
      }
    }
  }
  const joiner = { simple: ",", label: ".", matrix: ";" }[options.style] || "&";
  const values = [];
  for (const v of value) {
    if (options.style === "simple" || options.style === "label") {
      values.push(options.allowReserved === true ? v : encodeURIComponent(v));
    } else {
      values.push(serializePrimitiveParam(name, v, options));
    }
  }
  return options.style === "label" || options.style === "matrix" ? `${joiner}${values.join(joiner)}` : values.join(joiner);
}
function createQuerySerializer(options) {
  return function querySerializer(queryParams) {
    const search = [];
    if (queryParams && typeof queryParams === "object") {
      for (const name in queryParams) {
        const value = queryParams[name];
        if (value === void 0 || value === null) {
          continue;
        }
        if (Array.isArray(value)) {
          search.push(
            serializeArrayParam(name, value, {
              style: "form",
              explode: true,
              ...options?.array,
              allowReserved: options?.allowReserved || false
            })
          );
          continue;
        }
        if (typeof value === "object") {
          search.push(
            serializeObjectParam(name, value, {
              style: "deepObject",
              explode: true,
              ...options?.object,
              allowReserved: options?.allowReserved || false
            })
          );
          continue;
        }
        search.push(serializePrimitiveParam(name, value, options));
      }
    }
    return search.join("&");
  };
}
function defaultPathSerializer(pathname, pathParams) {
  let nextURL = pathname;
  for (const match of pathname.match(PATH_PARAM_RE) ?? []) {
    let name = match.substring(1, match.length - 1);
    let explode = false;
    let style = "simple";
    if (name.endsWith("*")) {
      explode = true;
      name = name.substring(0, name.length - 1);
    }
    if (name.startsWith(".")) {
      style = "label";
      name = name.substring(1);
    } else if (name.startsWith(";")) {
      style = "matrix";
      name = name.substring(1);
    }
    if (!pathParams || pathParams[name] === void 0 || pathParams[name] === null) {
      continue;
    }
    const value = pathParams[name];
    if (Array.isArray(value)) {
      nextURL = nextURL.replace(match, serializeArrayParam(name, value, { style, explode }));
      continue;
    }
    if (typeof value === "object") {
      nextURL = nextURL.replace(match, serializeObjectParam(name, value, { style, explode }));
      continue;
    }
    if (style === "matrix") {
      nextURL = nextURL.replace(match, `;${serializePrimitiveParam(name, value)}`);
      continue;
    }
    nextURL = nextURL.replace(match, style === "label" ? `.${value}` : value);
  }
  return nextURL;
}
function defaultBodySerializer(body) {
  return JSON.stringify(body);
}
function createFinalURL(pathname, options) {
  let finalURL = `${options.baseUrl}${pathname}`;
  if (options.params?.path) {
    finalURL = defaultPathSerializer(finalURL, options.params.path);
  }
  let search = options.querySerializer(options.params.query ?? {});
  if (search.startsWith("?")) {
    search = search.substring(1);
  }
  if (search) {
    finalURL += `?${search}`;
  }
  return finalURL;
}
function mergeHeaders(...allHeaders) {
  const finalHeaders = new Headers();
  for (const h of allHeaders) {
    if (!h || typeof h !== "object") {
      continue;
    }
    const iterator = h instanceof Headers ? h.entries() : Object.entries(h);
    for (const [k, v] of iterator) {
      if (v === null) {
        finalHeaders.delete(k);
      } else if (Array.isArray(v)) {
        for (const v2 of v) {
          finalHeaders.append(k, v2);
        }
      } else if (v !== void 0) {
        finalHeaders.set(k, v);
      }
    }
  }
  return finalHeaders;
}

// node_modules/.pnpm/swr@2.2.5_react@18.3.1/node_modules/swr/dist/core/index.mjs
var import_react2 = __toESM(require_react(), 1);
var import_shim = __toESM(require_shim(), 1);

// node_modules/.pnpm/swr@2.2.5_react@18.3.1/node_modules/swr/dist/_internal/index.mjs
var import_react = __toESM(require_react(), 1);
var noop = () => {
};
var UNDEFINED = (
  /*#__NOINLINE__*/
  noop()
);
var OBJECT = Object;
var isUndefined = (v) => v === UNDEFINED;
var isFunction = (v) => typeof v == "function";
var mergeObjects = (a, b) => ({
  ...a,
  ...b
});
var isPromiseLike = (x) => isFunction(x.then);
var table = /* @__PURE__ */ new WeakMap();
var counter = 0;
var stableHash = (arg) => {
  const type = typeof arg;
  const constructor = arg && arg.constructor;
  const isDate = constructor == Date;
  let result;
  let index;
  if (OBJECT(arg) === arg && !isDate && constructor != RegExp) {
    result = table.get(arg);
    if (result)
      return result;
    result = ++counter + "~";
    table.set(arg, result);
    if (constructor == Array) {
      result = "@";
      for (index = 0; index < arg.length; index++) {
        result += stableHash(arg[index]) + ",";
      }
      table.set(arg, result);
    }
    if (constructor == OBJECT) {
      result = "#";
      const keys = OBJECT.keys(arg).sort();
      while (!isUndefined(index = keys.pop())) {
        if (!isUndefined(arg[index])) {
          result += index + ":" + stableHash(arg[index]) + ",";
        }
      }
      table.set(arg, result);
    }
  } else {
    result = isDate ? arg.toJSON() : type == "symbol" ? arg.toString() : type == "string" ? JSON.stringify(arg) : "" + arg;
  }
  return result;
};
var SWRGlobalState = /* @__PURE__ */ new WeakMap();
var EMPTY_CACHE = {};
var INITIAL_CACHE = {};
var STR_UNDEFINED = "undefined";
var isWindowDefined = typeof window != STR_UNDEFINED;
var isDocumentDefined = typeof document != STR_UNDEFINED;
var hasRequestAnimationFrame = () => isWindowDefined && typeof window["requestAnimationFrame"] != STR_UNDEFINED;
var createCacheHelper = (cache2, key) => {
  const state = SWRGlobalState.get(cache2);
  return [
    // Getter
    () => !isUndefined(key) && cache2.get(key) || EMPTY_CACHE,
    // Setter
    (info) => {
      if (!isUndefined(key)) {
        const prev = cache2.get(key);
        if (!(key in INITIAL_CACHE)) {
          INITIAL_CACHE[key] = prev;
        }
        state[5](key, mergeObjects(prev, info), prev || EMPTY_CACHE);
      }
    },
    // Subscriber
    state[6],
    // Get server cache snapshot
    () => {
      if (!isUndefined(key)) {
        if (key in INITIAL_CACHE)
          return INITIAL_CACHE[key];
      }
      return !isUndefined(key) && cache2.get(key) || EMPTY_CACHE;
    }
  ];
};
var online = true;
var isOnline = () => online;
var [onWindowEvent, offWindowEvent] = isWindowDefined && window.addEventListener ? [
  window.addEventListener.bind(window),
  window.removeEventListener.bind(window)
] : [
  noop,
  noop
];
var isVisible = () => {
  const visibilityState = isDocumentDefined && document.visibilityState;
  return isUndefined(visibilityState) || visibilityState !== "hidden";
};
var initFocus = (callback) => {
  if (isDocumentDefined) {
    document.addEventListener("visibilitychange", callback);
  }
  onWindowEvent("focus", callback);
  return () => {
    if (isDocumentDefined) {
      document.removeEventListener("visibilitychange", callback);
    }
    offWindowEvent("focus", callback);
  };
};
var initReconnect = (callback) => {
  const onOnline = () => {
    online = true;
    callback();
  };
  const onOffline = () => {
    online = false;
  };
  onWindowEvent("online", onOnline);
  onWindowEvent("offline", onOffline);
  return () => {
    offWindowEvent("online", onOnline);
    offWindowEvent("offline", onOffline);
  };
};
var preset = {
  isOnline,
  isVisible
};
var defaultConfigOptions = {
  initFocus,
  initReconnect
};
var IS_REACT_LEGACY = !import_react.default.useId;
var IS_SERVER = !isWindowDefined || "Deno" in window;
var rAF = (f) => hasRequestAnimationFrame() ? window["requestAnimationFrame"](f) : setTimeout(f, 1);
var useIsomorphicLayoutEffect = IS_SERVER ? import_react.useEffect : import_react.useLayoutEffect;
var navigatorConnection = typeof navigator !== "undefined" && navigator.connection;
var slowConnection = !IS_SERVER && navigatorConnection && ([
  "slow-2g",
  "2g"
].includes(navigatorConnection.effectiveType) || navigatorConnection.saveData);
var serialize = (key) => {
  if (isFunction(key)) {
    try {
      key = key();
    } catch (err) {
      key = "";
    }
  }
  const args = key;
  key = typeof key == "string" ? key : (Array.isArray(key) ? key.length : key) ? stableHash(key) : "";
  return [
    key,
    args
  ];
};
var __timestamp = 0;
var getTimestamp = () => ++__timestamp;
var FOCUS_EVENT = 0;
var RECONNECT_EVENT = 1;
var MUTATE_EVENT = 2;
var ERROR_REVALIDATE_EVENT = 3;
var events = {
  __proto__: null,
  ERROR_REVALIDATE_EVENT,
  FOCUS_EVENT,
  MUTATE_EVENT,
  RECONNECT_EVENT
};
async function internalMutate(...args) {
  const [cache2, _key, _data, _opts] = args;
  const options = mergeObjects({
    populateCache: true,
    throwOnError: true
  }, typeof _opts === "boolean" ? {
    revalidate: _opts
  } : _opts || {});
  let populateCache = options.populateCache;
  const rollbackOnErrorOption = options.rollbackOnError;
  let optimisticData = options.optimisticData;
  const rollbackOnError = (error) => {
    return typeof rollbackOnErrorOption === "function" ? rollbackOnErrorOption(error) : rollbackOnErrorOption !== false;
  };
  const throwOnError = options.throwOnError;
  if (isFunction(_key)) {
    const keyFilter = _key;
    const matchedKeys = [];
    const it = cache2.keys();
    for (const key of it) {
      if (
        // Skip the special useSWRInfinite and useSWRSubscription keys.
        !/^\$(inf|sub)\$/.test(key) && keyFilter(cache2.get(key)._k)
      ) {
        matchedKeys.push(key);
      }
    }
    return Promise.all(matchedKeys.map(mutateByKey));
  }
  return mutateByKey(_key);
  async function mutateByKey(_k) {
    const [key] = serialize(_k);
    if (!key)
      return;
    const [get, set] = createCacheHelper(cache2, key);
    const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
    const startRevalidate = () => {
      const revalidators = EVENT_REVALIDATORS[key];
      const revalidate = isFunction(options.revalidate) ? options.revalidate(get().data, _k) : options.revalidate !== false;
      if (revalidate) {
        delete FETCH[key];
        delete PRELOAD[key];
        if (revalidators && revalidators[0]) {
          return revalidators[0](MUTATE_EVENT).then(() => get().data);
        }
      }
      return get().data;
    };
    if (args.length < 3) {
      return startRevalidate();
    }
    let data = _data;
    let error;
    const beforeMutationTs = getTimestamp();
    MUTATION[key] = [
      beforeMutationTs,
      0
    ];
    const hasOptimisticData = !isUndefined(optimisticData);
    const state = get();
    const displayedData = state.data;
    const currentData = state._c;
    const committedData = isUndefined(currentData) ? displayedData : currentData;
    if (hasOptimisticData) {
      optimisticData = isFunction(optimisticData) ? optimisticData(committedData, displayedData) : optimisticData;
      set({
        data: optimisticData,
        _c: committedData
      });
    }
    if (isFunction(data)) {
      try {
        data = data(committedData);
      } catch (err) {
        error = err;
      }
    }
    if (data && isPromiseLike(data)) {
      data = await data.catch((err) => {
        error = err;
      });
      if (beforeMutationTs !== MUTATION[key][0]) {
        if (error)
          throw error;
        return data;
      } else if (error && hasOptimisticData && rollbackOnError(error)) {
        populateCache = true;
        set({
          data: committedData,
          _c: UNDEFINED
        });
      }
    }
    if (populateCache) {
      if (!error) {
        if (isFunction(populateCache)) {
          const populateCachedData = populateCache(data, committedData);
          set({
            data: populateCachedData,
            error: UNDEFINED,
            _c: UNDEFINED
          });
        } else {
          set({
            data,
            error: UNDEFINED,
            _c: UNDEFINED
          });
        }
      }
    }
    MUTATION[key][1] = getTimestamp();
    Promise.resolve(startRevalidate()).then(() => {
      set({
        _c: UNDEFINED
      });
    });
    if (error) {
      if (throwOnError)
        throw error;
      return;
    }
    return data;
  }
}
var revalidateAllKeys = (revalidators, type) => {
  for (const key in revalidators) {
    if (revalidators[key][0])
      revalidators[key][0](type);
  }
};
var initCache = (provider, options) => {
  if (!SWRGlobalState.has(provider)) {
    const opts = mergeObjects(defaultConfigOptions, options);
    const EVENT_REVALIDATORS = {};
    const mutate2 = internalMutate.bind(UNDEFINED, provider);
    let unmount = noop;
    const subscriptions = {};
    const subscribe = (key, callback) => {
      const subs = subscriptions[key] || [];
      subscriptions[key] = subs;
      subs.push(callback);
      return () => subs.splice(subs.indexOf(callback), 1);
    };
    const setter = (key, value, prev) => {
      provider.set(key, value);
      const subs = subscriptions[key];
      if (subs) {
        for (const fn of subs) {
          fn(value, prev);
        }
      }
    };
    const initProvider = () => {
      if (!SWRGlobalState.has(provider)) {
        SWRGlobalState.set(provider, [
          EVENT_REVALIDATORS,
          {},
          {},
          {},
          mutate2,
          setter,
          subscribe
        ]);
        if (!IS_SERVER) {
          const releaseFocus = opts.initFocus(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, FOCUS_EVENT)));
          const releaseReconnect = opts.initReconnect(setTimeout.bind(UNDEFINED, revalidateAllKeys.bind(UNDEFINED, EVENT_REVALIDATORS, RECONNECT_EVENT)));
          unmount = () => {
            releaseFocus && releaseFocus();
            releaseReconnect && releaseReconnect();
            SWRGlobalState.delete(provider);
          };
        }
      }
    };
    initProvider();
    return [
      provider,
      mutate2,
      initProvider,
      unmount
    ];
  }
  return [
    provider,
    SWRGlobalState.get(provider)[4]
  ];
};
var onErrorRetry = (_, __, config, revalidate, opts) => {
  const maxRetryCount = config.errorRetryCount;
  const currentRetryCount = opts.retryCount;
  const timeout = ~~((Math.random() + 0.5) * (1 << (currentRetryCount < 8 ? currentRetryCount : 8))) * config.errorRetryInterval;
  if (!isUndefined(maxRetryCount) && currentRetryCount > maxRetryCount) {
    return;
  }
  setTimeout(revalidate, timeout, opts);
};
var compare = (currentData, newData) => stableHash(currentData) == stableHash(newData);
var [cache, mutate] = initCache(/* @__PURE__ */ new Map());
var defaultConfig = mergeObjects(
  {
    // events
    onLoadingSlow: noop,
    onSuccess: noop,
    onError: noop,
    onErrorRetry,
    onDiscarded: noop,
    // switches
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    revalidateIfStale: true,
    shouldRetryOnError: true,
    // timeouts
    errorRetryInterval: slowConnection ? 1e4 : 5e3,
    focusThrottleInterval: 5 * 1e3,
    dedupingInterval: 2 * 1e3,
    loadingTimeout: slowConnection ? 5e3 : 3e3,
    // providers
    compare,
    isPaused: () => false,
    cache,
    mutate,
    fallback: {}
  },
  // use web preset by default
  preset
);
var mergeConfigs = (a, b) => {
  const v = mergeObjects(a, b);
  if (b) {
    const { use: u1, fallback: f1 } = a;
    const { use: u2, fallback: f2 } = b;
    if (u1 && u2) {
      v.use = u1.concat(u2);
    }
    if (f1 && f2) {
      v.fallback = mergeObjects(f1, f2);
    }
  }
  return v;
};
var SWRConfigContext = (0, import_react.createContext)({});
var SWRConfig = (props) => {
  const { value } = props;
  const parentConfig = (0, import_react.useContext)(SWRConfigContext);
  const isFunctionalConfig = isFunction(value);
  const config = (0, import_react.useMemo)(() => isFunctionalConfig ? value(parentConfig) : value, [
    isFunctionalConfig,
    parentConfig,
    value
  ]);
  const extendedConfig = (0, import_react.useMemo)(() => isFunctionalConfig ? config : mergeConfigs(parentConfig, config), [
    isFunctionalConfig,
    parentConfig,
    config
  ]);
  const provider = config && config.provider;
  const cacheContextRef = (0, import_react.useRef)(UNDEFINED);
  if (provider && !cacheContextRef.current) {
    cacheContextRef.current = initCache(provider(extendedConfig.cache || cache), config);
  }
  const cacheContext = cacheContextRef.current;
  if (cacheContext) {
    extendedConfig.cache = cacheContext[0];
    extendedConfig.mutate = cacheContext[1];
  }
  useIsomorphicLayoutEffect(() => {
    if (cacheContext) {
      cacheContext[2] && cacheContext[2]();
      return cacheContext[3];
    }
  }, []);
  return (0, import_react.createElement)(SWRConfigContext.Provider, mergeObjects(props, {
    value: extendedConfig
  }));
};
var INFINITE_PREFIX = "$inf$";
var enableDevtools = isWindowDefined && window.__SWR_DEVTOOLS_USE__;
var use = enableDevtools ? window.__SWR_DEVTOOLS_USE__ : [];
var setupDevTools = () => {
  if (enableDevtools) {
    window.__SWR_DEVTOOLS_REACT__ = import_react.default;
  }
};
var normalize = (args) => {
  return isFunction(args[1]) ? [
    args[0],
    args[1],
    args[2] || {}
  ] : [
    args[0],
    null,
    (args[1] === null ? args[2] : args[1]) || {}
  ];
};
var useSWRConfig = () => {
  return mergeObjects(defaultConfig, (0, import_react.useContext)(SWRConfigContext));
};
var middleware = (useSWRNext) => (key_, fetcher_, config) => {
  const fetcher = fetcher_ && ((...args) => {
    const [key] = serialize(key_);
    const [, , , PRELOAD] = SWRGlobalState.get(cache);
    if (key.startsWith(INFINITE_PREFIX)) {
      return fetcher_(...args);
    }
    const req = PRELOAD[key];
    if (isUndefined(req))
      return fetcher_(...args);
    delete PRELOAD[key];
    return req;
  });
  return useSWRNext(key_, fetcher, config);
};
var BUILT_IN_MIDDLEWARE = use.concat(middleware);
var withArgs = (hook) => {
  return function useSWRArgs(...args) {
    const fallbackConfig = useSWRConfig();
    const [key, fn, _config] = normalize(args);
    const config = mergeConfigs(fallbackConfig, _config);
    let next = hook;
    const { use: use4 } = config;
    const middleware2 = (use4 || []).concat(BUILT_IN_MIDDLEWARE);
    for (let i = middleware2.length; i--; ) {
      next = middleware2[i](next);
    }
    return next(key, fn || config.fetcher || null, config);
  };
};
var subscribeCallback = (key, callbacks, callback) => {
  const keyedRevalidators = callbacks[key] || (callbacks[key] = []);
  keyedRevalidators.push(callback);
  return () => {
    const index = keyedRevalidators.indexOf(callback);
    if (index >= 0) {
      keyedRevalidators[index] = keyedRevalidators[keyedRevalidators.length - 1];
      keyedRevalidators.pop();
    }
  };
};
var withMiddleware = (useSWR3, middleware2) => {
  return (...args) => {
    const [key, fn, config] = normalize(args);
    const uses = (config.use || []).concat(middleware2);
    return useSWR3(key, fn, {
      ...config,
      use: uses
    });
  };
};
setupDevTools();

// node_modules/.pnpm/swr@2.2.5_react@18.3.1/node_modules/swr/dist/core/index.mjs
var use2 = import_react2.default.use || ((promise) => {
  if (promise.status === "pending") {
    throw promise;
  } else if (promise.status === "fulfilled") {
    return promise.value;
  } else if (promise.status === "rejected") {
    throw promise.reason;
  } else {
    promise.status = "pending";
    promise.then((v) => {
      promise.status = "fulfilled";
      promise.value = v;
    }, (e) => {
      promise.status = "rejected";
      promise.reason = e;
    });
    throw promise;
  }
});
var WITH_DEDUPE = {
  dedupe: true
};
var useSWRHandler = (_key, fetcher, config) => {
  const { cache: cache2, compare: compare2, suspense, fallbackData, revalidateOnMount, revalidateIfStale, refreshInterval, refreshWhenHidden, refreshWhenOffline, keepPreviousData } = config;
  const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
  const [key, fnArg] = serialize(_key);
  const initialMountedRef = (0, import_react2.useRef)(false);
  const unmountedRef = (0, import_react2.useRef)(false);
  const keyRef = (0, import_react2.useRef)(key);
  const fetcherRef = (0, import_react2.useRef)(fetcher);
  const configRef = (0, import_react2.useRef)(config);
  const getConfig = () => configRef.current;
  const isActive = () => getConfig().isVisible() && getConfig().isOnline();
  const [getCache, setCache, subscribeCache, getInitialCache] = createCacheHelper(cache2, key);
  const stateDependencies = (0, import_react2.useRef)({}).current;
  const fallback = isUndefined(fallbackData) ? config.fallback[key] : fallbackData;
  const isEqual = (prev, current) => {
    for (const _ in stateDependencies) {
      const t = _;
      if (t === "data") {
        if (!compare2(prev[t], current[t])) {
          if (!isUndefined(prev[t])) {
            return false;
          }
          if (!compare2(returnedData, current[t])) {
            return false;
          }
        }
      } else {
        if (current[t] !== prev[t]) {
          return false;
        }
      }
    }
    return true;
  };
  const getSnapshot = (0, import_react2.useMemo)(() => {
    const shouldStartRequest = (() => {
      if (!key)
        return false;
      if (!fetcher)
        return false;
      if (!isUndefined(revalidateOnMount))
        return revalidateOnMount;
      if (getConfig().isPaused())
        return false;
      if (suspense)
        return false;
      if (!isUndefined(revalidateIfStale))
        return revalidateIfStale;
      return true;
    })();
    const getSelectedCache = (state) => {
      const snapshot = mergeObjects(state);
      delete snapshot._k;
      if (!shouldStartRequest) {
        return snapshot;
      }
      return {
        isValidating: true,
        isLoading: true,
        ...snapshot
      };
    };
    const cachedData2 = getCache();
    const initialData = getInitialCache();
    const clientSnapshot = getSelectedCache(cachedData2);
    const serverSnapshot = cachedData2 === initialData ? clientSnapshot : getSelectedCache(initialData);
    let memorizedSnapshot = clientSnapshot;
    return [
      () => {
        const newSnapshot = getSelectedCache(getCache());
        const compareResult = isEqual(newSnapshot, memorizedSnapshot);
        if (compareResult) {
          memorizedSnapshot.data = newSnapshot.data;
          memorizedSnapshot.isLoading = newSnapshot.isLoading;
          memorizedSnapshot.isValidating = newSnapshot.isValidating;
          memorizedSnapshot.error = newSnapshot.error;
          return memorizedSnapshot;
        } else {
          memorizedSnapshot = newSnapshot;
          return newSnapshot;
        }
      },
      () => serverSnapshot
    ];
  }, [
    cache2,
    key
  ]);
  const cached = (0, import_shim.useSyncExternalStore)((0, import_react2.useCallback)(
    (callback) => subscribeCache(key, (current, prev) => {
      if (!isEqual(prev, current))
        callback();
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cache2,
      key
    ]
  ), getSnapshot[0], getSnapshot[1]);
  const isInitialMount = !initialMountedRef.current;
  const hasRevalidator = EVENT_REVALIDATORS[key] && EVENT_REVALIDATORS[key].length > 0;
  const cachedData = cached.data;
  const data = isUndefined(cachedData) ? fallback : cachedData;
  const error = cached.error;
  const laggyDataRef = (0, import_react2.useRef)(data);
  const returnedData = keepPreviousData ? isUndefined(cachedData) ? laggyDataRef.current : cachedData : data;
  const shouldDoInitialRevalidation = (() => {
    if (hasRevalidator && !isUndefined(error))
      return false;
    if (isInitialMount && !isUndefined(revalidateOnMount))
      return revalidateOnMount;
    if (getConfig().isPaused())
      return false;
    if (suspense)
      return isUndefined(data) ? false : revalidateIfStale;
    return isUndefined(data) || revalidateIfStale;
  })();
  const defaultValidatingState = !!(key && fetcher && isInitialMount && shouldDoInitialRevalidation);
  const isValidating = isUndefined(cached.isValidating) ? defaultValidatingState : cached.isValidating;
  const isLoading = isUndefined(cached.isLoading) ? defaultValidatingState : cached.isLoading;
  const revalidate = (0, import_react2.useCallback)(
    async (revalidateOpts) => {
      const currentFetcher = fetcherRef.current;
      if (!key || !currentFetcher || unmountedRef.current || getConfig().isPaused()) {
        return false;
      }
      let newData;
      let startAt;
      let loading = true;
      const opts = revalidateOpts || {};
      const shouldStartNewRequest = !FETCH[key] || !opts.dedupe;
      const callbackSafeguard = () => {
        if (IS_REACT_LEGACY) {
          return !unmountedRef.current && key === keyRef.current && initialMountedRef.current;
        }
        return key === keyRef.current;
      };
      const finalState = {
        isValidating: false,
        isLoading: false
      };
      const finishRequestAndUpdateState = () => {
        setCache(finalState);
      };
      const cleanupState = () => {
        const requestInfo = FETCH[key];
        if (requestInfo && requestInfo[1] === startAt) {
          delete FETCH[key];
        }
      };
      const initialState = {
        isValidating: true
      };
      if (isUndefined(getCache().data)) {
        initialState.isLoading = true;
      }
      try {
        if (shouldStartNewRequest) {
          setCache(initialState);
          if (config.loadingTimeout && isUndefined(getCache().data)) {
            setTimeout(() => {
              if (loading && callbackSafeguard()) {
                getConfig().onLoadingSlow(key, config);
              }
            }, config.loadingTimeout);
          }
          FETCH[key] = [
            currentFetcher(fnArg),
            getTimestamp()
          ];
        }
        [newData, startAt] = FETCH[key];
        newData = await newData;
        if (shouldStartNewRequest) {
          setTimeout(cleanupState, config.dedupingInterval);
        }
        if (!FETCH[key] || FETCH[key][1] !== startAt) {
          if (shouldStartNewRequest) {
            if (callbackSafeguard()) {
              getConfig().onDiscarded(key);
            }
          }
          return false;
        }
        finalState.error = UNDEFINED;
        const mutationInfo = MUTATION[key];
        if (!isUndefined(mutationInfo) && // case 1
        (startAt <= mutationInfo[0] || // case 2
        startAt <= mutationInfo[1] || // case 3
        mutationInfo[1] === 0)) {
          finishRequestAndUpdateState();
          if (shouldStartNewRequest) {
            if (callbackSafeguard()) {
              getConfig().onDiscarded(key);
            }
          }
          return false;
        }
        const cacheData = getCache().data;
        finalState.data = compare2(cacheData, newData) ? cacheData : newData;
        if (shouldStartNewRequest) {
          if (callbackSafeguard()) {
            getConfig().onSuccess(newData, key, config);
          }
        }
      } catch (err) {
        cleanupState();
        const currentConfig = getConfig();
        const { shouldRetryOnError } = currentConfig;
        if (!currentConfig.isPaused()) {
          finalState.error = err;
          if (shouldStartNewRequest && callbackSafeguard()) {
            currentConfig.onError(err, key, currentConfig);
            if (shouldRetryOnError === true || isFunction(shouldRetryOnError) && shouldRetryOnError(err)) {
              if (!getConfig().revalidateOnFocus || !getConfig().revalidateOnReconnect || isActive()) {
                currentConfig.onErrorRetry(err, key, currentConfig, (_opts) => {
                  const revalidators = EVENT_REVALIDATORS[key];
                  if (revalidators && revalidators[0]) {
                    revalidators[0](events.ERROR_REVALIDATE_EVENT, _opts);
                  }
                }, {
                  retryCount: (opts.retryCount || 0) + 1,
                  dedupe: true
                });
              }
            }
          }
        }
      }
      loading = false;
      finishRequestAndUpdateState();
      return true;
    },
    // `setState` is immutable, and `eventsCallback`, `fnArg`, and
    // `keyValidating` are depending on `key`, so we can exclude them from
    // the deps array.
    //
    // FIXME:
    // `fn` and `config` might be changed during the lifecycle,
    // but they might be changed every render like this.
    // `useSWR('key', () => fetch('/api/'), { suspense: true })`
    // So we omit the values from the deps array
    // even though it might cause unexpected behaviors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      key,
      cache2
    ]
  );
  const boundMutate = (0, import_react2.useCallback)(
    // Use callback to make sure `keyRef.current` returns latest result every time
    (...args) => {
      return internalMutate(cache2, keyRef.current, ...args);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useIsomorphicLayoutEffect(() => {
    fetcherRef.current = fetcher;
    configRef.current = config;
    if (!isUndefined(cachedData)) {
      laggyDataRef.current = cachedData;
    }
  });
  useIsomorphicLayoutEffect(() => {
    if (!key)
      return;
    const softRevalidate = revalidate.bind(UNDEFINED, WITH_DEDUPE);
    let nextFocusRevalidatedAt = 0;
    const onRevalidate = (type, opts = {}) => {
      if (type == events.FOCUS_EVENT) {
        const now = Date.now();
        if (getConfig().revalidateOnFocus && now > nextFocusRevalidatedAt && isActive()) {
          nextFocusRevalidatedAt = now + getConfig().focusThrottleInterval;
          softRevalidate();
        }
      } else if (type == events.RECONNECT_EVENT) {
        if (getConfig().revalidateOnReconnect && isActive()) {
          softRevalidate();
        }
      } else if (type == events.MUTATE_EVENT) {
        return revalidate();
      } else if (type == events.ERROR_REVALIDATE_EVENT) {
        return revalidate(opts);
      }
      return;
    };
    const unsubEvents = subscribeCallback(key, EVENT_REVALIDATORS, onRevalidate);
    unmountedRef.current = false;
    keyRef.current = key;
    initialMountedRef.current = true;
    setCache({
      _k: fnArg
    });
    if (shouldDoInitialRevalidation) {
      if (isUndefined(data) || IS_SERVER) {
        softRevalidate();
      } else {
        rAF(softRevalidate);
      }
    }
    return () => {
      unmountedRef.current = true;
      unsubEvents();
    };
  }, [
    key
  ]);
  useIsomorphicLayoutEffect(() => {
    let timer;
    function next() {
      const interval = isFunction(refreshInterval) ? refreshInterval(getCache().data) : refreshInterval;
      if (interval && timer !== -1) {
        timer = setTimeout(execute, interval);
      }
    }
    function execute() {
      if (!getCache().error && (refreshWhenHidden || getConfig().isVisible()) && (refreshWhenOffline || getConfig().isOnline())) {
        revalidate(WITH_DEDUPE).then(next);
      } else {
        next();
      }
    }
    next();
    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = -1;
      }
    };
  }, [
    refreshInterval,
    refreshWhenHidden,
    refreshWhenOffline,
    key
  ]);
  (0, import_react2.useDebugValue)(returnedData);
  if (suspense && isUndefined(data) && key) {
    if (!IS_REACT_LEGACY && IS_SERVER) {
      throw new Error("Fallback data is required when using suspense in SSR.");
    }
    fetcherRef.current = fetcher;
    configRef.current = config;
    unmountedRef.current = false;
    const req = PRELOAD[key];
    if (!isUndefined(req)) {
      const promise = boundMutate(req);
      use2(promise);
    }
    if (isUndefined(error)) {
      const promise = revalidate(WITH_DEDUPE);
      if (!isUndefined(returnedData)) {
        promise.status = "fulfilled";
        promise.value = true;
      }
      use2(promise);
    } else {
      throw error;
    }
  }
  return {
    mutate: boundMutate,
    get data() {
      stateDependencies.data = true;
      return returnedData;
    },
    get error() {
      stateDependencies.error = true;
      return error;
    },
    get isValidating() {
      stateDependencies.isValidating = true;
      return isValidating;
    },
    get isLoading() {
      stateDependencies.isLoading = true;
      return isLoading;
    }
  };
};
var SWRConfig2 = OBJECT.defineProperty(SWRConfig, "defaultValue", {
  value: defaultConfig
});
var useSWR = withArgs(useSWRHandler);

// node_modules/.pnpm/swr@2.2.5_react@18.3.1/node_modules/swr/dist/infinite/index.mjs
var import_react3 = __toESM(require_react(), 1);
var import_shim2 = __toESM(require_shim(), 1);
var use3 = import_react3.default.use || ((promise) => {
  if (promise.status === "pending") {
    throw promise;
  } else if (promise.status === "fulfilled") {
    return promise.value;
  } else if (promise.status === "rejected") {
    throw promise.reason;
  } else {
    promise.status = "pending";
    promise.then((v) => {
      promise.status = "fulfilled";
      promise.value = v;
    }, (e) => {
      promise.status = "rejected";
      promise.reason = e;
    });
    throw promise;
  }
});
var WITH_DEDUPE2 = {
  dedupe: true
};
var useSWRHandler2 = (_key, fetcher, config) => {
  const { cache: cache2, compare: compare2, suspense, fallbackData, revalidateOnMount, revalidateIfStale, refreshInterval, refreshWhenHidden, refreshWhenOffline, keepPreviousData } = config;
  const [EVENT_REVALIDATORS, MUTATION, FETCH, PRELOAD] = SWRGlobalState.get(cache2);
  const [key, fnArg] = serialize(_key);
  const initialMountedRef = (0, import_react3.useRef)(false);
  const unmountedRef = (0, import_react3.useRef)(false);
  const keyRef = (0, import_react3.useRef)(key);
  const fetcherRef = (0, import_react3.useRef)(fetcher);
  const configRef = (0, import_react3.useRef)(config);
  const getConfig = () => configRef.current;
  const isActive = () => getConfig().isVisible() && getConfig().isOnline();
  const [getCache, setCache, subscribeCache, getInitialCache] = createCacheHelper(cache2, key);
  const stateDependencies = (0, import_react3.useRef)({}).current;
  const fallback = isUndefined(fallbackData) ? config.fallback[key] : fallbackData;
  const isEqual = (prev, current) => {
    for (const _ in stateDependencies) {
      const t = _;
      if (t === "data") {
        if (!compare2(prev[t], current[t])) {
          if (!isUndefined(prev[t])) {
            return false;
          }
          if (!compare2(returnedData, current[t])) {
            return false;
          }
        }
      } else {
        if (current[t] !== prev[t]) {
          return false;
        }
      }
    }
    return true;
  };
  const getSnapshot = (0, import_react3.useMemo)(() => {
    const shouldStartRequest = (() => {
      if (!key)
        return false;
      if (!fetcher)
        return false;
      if (!isUndefined(revalidateOnMount))
        return revalidateOnMount;
      if (getConfig().isPaused())
        return false;
      if (suspense)
        return false;
      if (!isUndefined(revalidateIfStale))
        return revalidateIfStale;
      return true;
    })();
    const getSelectedCache = (state) => {
      const snapshot = mergeObjects(state);
      delete snapshot._k;
      if (!shouldStartRequest) {
        return snapshot;
      }
      return {
        isValidating: true,
        isLoading: true,
        ...snapshot
      };
    };
    const cachedData2 = getCache();
    const initialData = getInitialCache();
    const clientSnapshot = getSelectedCache(cachedData2);
    const serverSnapshot = cachedData2 === initialData ? clientSnapshot : getSelectedCache(initialData);
    let memorizedSnapshot = clientSnapshot;
    return [
      () => {
        const newSnapshot = getSelectedCache(getCache());
        const compareResult = isEqual(newSnapshot, memorizedSnapshot);
        if (compareResult) {
          memorizedSnapshot.data = newSnapshot.data;
          memorizedSnapshot.isLoading = newSnapshot.isLoading;
          memorizedSnapshot.isValidating = newSnapshot.isValidating;
          memorizedSnapshot.error = newSnapshot.error;
          return memorizedSnapshot;
        } else {
          memorizedSnapshot = newSnapshot;
          return newSnapshot;
        }
      },
      () => serverSnapshot
    ];
  }, [
    cache2,
    key
  ]);
  const cached = (0, import_shim2.useSyncExternalStore)((0, import_react3.useCallback)(
    (callback) => subscribeCache(key, (current, prev) => {
      if (!isEqual(prev, current))
        callback();
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cache2,
      key
    ]
  ), getSnapshot[0], getSnapshot[1]);
  const isInitialMount = !initialMountedRef.current;
  const hasRevalidator = EVENT_REVALIDATORS[key] && EVENT_REVALIDATORS[key].length > 0;
  const cachedData = cached.data;
  const data = isUndefined(cachedData) ? fallback : cachedData;
  const error = cached.error;
  const laggyDataRef = (0, import_react3.useRef)(data);
  const returnedData = keepPreviousData ? isUndefined(cachedData) ? laggyDataRef.current : cachedData : data;
  const shouldDoInitialRevalidation = (() => {
    if (hasRevalidator && !isUndefined(error))
      return false;
    if (isInitialMount && !isUndefined(revalidateOnMount))
      return revalidateOnMount;
    if (getConfig().isPaused())
      return false;
    if (suspense)
      return isUndefined(data) ? false : revalidateIfStale;
    return isUndefined(data) || revalidateIfStale;
  })();
  const defaultValidatingState = !!(key && fetcher && isInitialMount && shouldDoInitialRevalidation);
  const isValidating = isUndefined(cached.isValidating) ? defaultValidatingState : cached.isValidating;
  const isLoading = isUndefined(cached.isLoading) ? defaultValidatingState : cached.isLoading;
  const revalidate = (0, import_react3.useCallback)(
    async (revalidateOpts) => {
      const currentFetcher = fetcherRef.current;
      if (!key || !currentFetcher || unmountedRef.current || getConfig().isPaused()) {
        return false;
      }
      let newData;
      let startAt;
      let loading = true;
      const opts = revalidateOpts || {};
      const shouldStartNewRequest = !FETCH[key] || !opts.dedupe;
      const callbackSafeguard = () => {
        if (IS_REACT_LEGACY) {
          return !unmountedRef.current && key === keyRef.current && initialMountedRef.current;
        }
        return key === keyRef.current;
      };
      const finalState = {
        isValidating: false,
        isLoading: false
      };
      const finishRequestAndUpdateState = () => {
        setCache(finalState);
      };
      const cleanupState = () => {
        const requestInfo = FETCH[key];
        if (requestInfo && requestInfo[1] === startAt) {
          delete FETCH[key];
        }
      };
      const initialState = {
        isValidating: true
      };
      if (isUndefined(getCache().data)) {
        initialState.isLoading = true;
      }
      try {
        if (shouldStartNewRequest) {
          setCache(initialState);
          if (config.loadingTimeout && isUndefined(getCache().data)) {
            setTimeout(() => {
              if (loading && callbackSafeguard()) {
                getConfig().onLoadingSlow(key, config);
              }
            }, config.loadingTimeout);
          }
          FETCH[key] = [
            currentFetcher(fnArg),
            getTimestamp()
          ];
        }
        [newData, startAt] = FETCH[key];
        newData = await newData;
        if (shouldStartNewRequest) {
          setTimeout(cleanupState, config.dedupingInterval);
        }
        if (!FETCH[key] || FETCH[key][1] !== startAt) {
          if (shouldStartNewRequest) {
            if (callbackSafeguard()) {
              getConfig().onDiscarded(key);
            }
          }
          return false;
        }
        finalState.error = UNDEFINED;
        const mutationInfo = MUTATION[key];
        if (!isUndefined(mutationInfo) && // case 1
        (startAt <= mutationInfo[0] || // case 2
        startAt <= mutationInfo[1] || // case 3
        mutationInfo[1] === 0)) {
          finishRequestAndUpdateState();
          if (shouldStartNewRequest) {
            if (callbackSafeguard()) {
              getConfig().onDiscarded(key);
            }
          }
          return false;
        }
        const cacheData = getCache().data;
        finalState.data = compare2(cacheData, newData) ? cacheData : newData;
        if (shouldStartNewRequest) {
          if (callbackSafeguard()) {
            getConfig().onSuccess(newData, key, config);
          }
        }
      } catch (err) {
        cleanupState();
        const currentConfig = getConfig();
        const { shouldRetryOnError } = currentConfig;
        if (!currentConfig.isPaused()) {
          finalState.error = err;
          if (shouldStartNewRequest && callbackSafeguard()) {
            currentConfig.onError(err, key, currentConfig);
            if (shouldRetryOnError === true || isFunction(shouldRetryOnError) && shouldRetryOnError(err)) {
              if (!getConfig().revalidateOnFocus || !getConfig().revalidateOnReconnect || isActive()) {
                currentConfig.onErrorRetry(err, key, currentConfig, (_opts) => {
                  const revalidators = EVENT_REVALIDATORS[key];
                  if (revalidators && revalidators[0]) {
                    revalidators[0](events.ERROR_REVALIDATE_EVENT, _opts);
                  }
                }, {
                  retryCount: (opts.retryCount || 0) + 1,
                  dedupe: true
                });
              }
            }
          }
        }
      }
      loading = false;
      finishRequestAndUpdateState();
      return true;
    },
    // `setState` is immutable, and `eventsCallback`, `fnArg`, and
    // `keyValidating` are depending on `key`, so we can exclude them from
    // the deps array.
    //
    // FIXME:
    // `fn` and `config` might be changed during the lifecycle,
    // but they might be changed every render like this.
    // `useSWR('key', () => fetch('/api/'), { suspense: true })`
    // So we omit the values from the deps array
    // even though it might cause unexpected behaviors.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      key,
      cache2
    ]
  );
  const boundMutate = (0, import_react3.useCallback)(
    // Use callback to make sure `keyRef.current` returns latest result every time
    (...args) => {
      return internalMutate(cache2, keyRef.current, ...args);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  useIsomorphicLayoutEffect(() => {
    fetcherRef.current = fetcher;
    configRef.current = config;
    if (!isUndefined(cachedData)) {
      laggyDataRef.current = cachedData;
    }
  });
  useIsomorphicLayoutEffect(() => {
    if (!key)
      return;
    const softRevalidate = revalidate.bind(UNDEFINED, WITH_DEDUPE2);
    let nextFocusRevalidatedAt = 0;
    const onRevalidate = (type, opts = {}) => {
      if (type == events.FOCUS_EVENT) {
        const now = Date.now();
        if (getConfig().revalidateOnFocus && now > nextFocusRevalidatedAt && isActive()) {
          nextFocusRevalidatedAt = now + getConfig().focusThrottleInterval;
          softRevalidate();
        }
      } else if (type == events.RECONNECT_EVENT) {
        if (getConfig().revalidateOnReconnect && isActive()) {
          softRevalidate();
        }
      } else if (type == events.MUTATE_EVENT) {
        return revalidate();
      } else if (type == events.ERROR_REVALIDATE_EVENT) {
        return revalidate(opts);
      }
      return;
    };
    const unsubEvents = subscribeCallback(key, EVENT_REVALIDATORS, onRevalidate);
    unmountedRef.current = false;
    keyRef.current = key;
    initialMountedRef.current = true;
    setCache({
      _k: fnArg
    });
    if (shouldDoInitialRevalidation) {
      if (isUndefined(data) || IS_SERVER) {
        softRevalidate();
      } else {
        rAF(softRevalidate);
      }
    }
    return () => {
      unmountedRef.current = true;
      unsubEvents();
    };
  }, [
    key
  ]);
  useIsomorphicLayoutEffect(() => {
    let timer;
    function next() {
      const interval = isFunction(refreshInterval) ? refreshInterval(getCache().data) : refreshInterval;
      if (interval && timer !== -1) {
        timer = setTimeout(execute, interval);
      }
    }
    function execute() {
      if (!getCache().error && (refreshWhenHidden || getConfig().isVisible()) && (refreshWhenOffline || getConfig().isOnline())) {
        revalidate(WITH_DEDUPE2).then(next);
      } else {
        next();
      }
    }
    next();
    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = -1;
      }
    };
  }, [
    refreshInterval,
    refreshWhenHidden,
    refreshWhenOffline,
    key
  ]);
  (0, import_react3.useDebugValue)(returnedData);
  if (suspense && isUndefined(data) && key) {
    if (!IS_REACT_LEGACY && IS_SERVER) {
      throw new Error("Fallback data is required when using suspense in SSR.");
    }
    fetcherRef.current = fetcher;
    configRef.current = config;
    unmountedRef.current = false;
    const req = PRELOAD[key];
    if (!isUndefined(req)) {
      const promise = boundMutate(req);
      use3(promise);
    }
    if (isUndefined(error)) {
      const promise = revalidate(WITH_DEDUPE2);
      if (!isUndefined(returnedData)) {
        promise.status = "fulfilled";
        promise.value = true;
      }
      use3(promise);
    } else {
      throw error;
    }
  }
  return {
    mutate: boundMutate,
    get data() {
      stateDependencies.data = true;
      return returnedData;
    },
    get error() {
      stateDependencies.error = true;
      return error;
    },
    get isValidating() {
      stateDependencies.isValidating = true;
      return isValidating;
    },
    get isLoading() {
      stateDependencies.isLoading = true;
      return isLoading;
    }
  };
};
OBJECT.defineProperty(SWRConfig, "defaultValue", {
  value: defaultConfig
});
var useSWR2 = withArgs(useSWRHandler2);
var getFirstPageKey = (getKey) => {
  return serialize(getKey ? getKey(0, null) : null)[0];
};
var EMPTY_PROMISE = Promise.resolve();
var infinite = (useSWRNext) => (getKey, fn, config) => {
  const didMountRef = (0, import_react3.useRef)(false);
  const { cache: cache$1, initialSize = 1, revalidateAll = false, persistSize = false, revalidateFirstPage = true, revalidateOnMount = false, parallel = false } = config;
  const [, , , PRELOAD] = SWRGlobalState.get(cache);
  let infiniteKey;
  try {
    infiniteKey = getFirstPageKey(getKey);
    if (infiniteKey)
      infiniteKey = INFINITE_PREFIX + infiniteKey;
  } catch (err) {
  }
  const [get, set, subscribeCache] = createCacheHelper(cache$1, infiniteKey);
  const getSnapshot = (0, import_react3.useCallback)(() => {
    const size = isUndefined(get()._l) ? initialSize : get()._l;
    return size;
  }, [
    cache$1,
    infiniteKey,
    initialSize
  ]);
  (0, import_shim2.useSyncExternalStore)((0, import_react3.useCallback)(
    (callback) => {
      if (infiniteKey)
        return subscribeCache(infiniteKey, () => {
          callback();
        });
      return () => {
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      cache$1,
      infiniteKey
    ]
  ), getSnapshot, getSnapshot);
  const resolvePageSize = (0, import_react3.useCallback)(() => {
    const cachedPageSize = get()._l;
    return isUndefined(cachedPageSize) ? initialSize : cachedPageSize;
  }, [
    infiniteKey,
    initialSize
  ]);
  const lastPageSizeRef = (0, import_react3.useRef)(resolvePageSize());
  useIsomorphicLayoutEffect(() => {
    if (!didMountRef.current) {
      didMountRef.current = true;
      return;
    }
    if (infiniteKey) {
      set({
        _l: persistSize ? lastPageSizeRef.current : resolvePageSize()
      });
    }
  }, [
    infiniteKey,
    cache$1
  ]);
  const shouldRevalidateOnMount = revalidateOnMount && !didMountRef.current;
  const swr = useSWRNext(infiniteKey, async (key) => {
    const forceRevalidateAll = get()._i;
    const shouldRevalidatePage = get()._r;
    set({
      _r: UNDEFINED
    });
    const data = [];
    const pageSize = resolvePageSize();
    const [getCache] = createCacheHelper(cache$1, key);
    const cacheData = getCache().data;
    const revalidators = [];
    let previousPageData = null;
    for (let i = 0; i < pageSize; ++i) {
      const [pageKey, pageArg] = serialize(getKey(i, parallel ? null : previousPageData));
      if (!pageKey) {
        break;
      }
      const [getSWRCache, setSWRCache] = createCacheHelper(cache$1, pageKey);
      let pageData = getSWRCache().data;
      const shouldFetchPage = revalidateAll || forceRevalidateAll || isUndefined(pageData) || revalidateFirstPage && !i && !isUndefined(cacheData) || shouldRevalidateOnMount || cacheData && !isUndefined(cacheData[i]) && !config.compare(cacheData[i], pageData);
      if (fn && (typeof shouldRevalidatePage === "function" ? shouldRevalidatePage(pageData, pageArg) : shouldFetchPage)) {
        const revalidate = async () => {
          const hasPreloadedRequest = pageKey in PRELOAD;
          if (!hasPreloadedRequest) {
            pageData = await fn(pageArg);
          } else {
            const req = PRELOAD[pageKey];
            delete PRELOAD[pageKey];
            pageData = await req;
          }
          setSWRCache({
            data: pageData,
            _k: pageArg
          });
          data[i] = pageData;
        };
        if (parallel) {
          revalidators.push(revalidate);
        } else {
          await revalidate();
        }
      } else {
        data[i] = pageData;
      }
      if (!parallel) {
        previousPageData = pageData;
      }
    }
    if (parallel) {
      await Promise.all(revalidators.map((r) => r()));
    }
    set({
      _i: UNDEFINED
    });
    return data;
  }, config);
  const mutate2 = (0, import_react3.useCallback)(
    // eslint-disable-next-line func-names
    function(data, opts) {
      const options = typeof opts === "boolean" ? {
        revalidate: opts
      } : opts || {};
      const shouldRevalidate = options.revalidate !== false;
      if (!infiniteKey)
        return EMPTY_PROMISE;
      if (shouldRevalidate) {
        if (!isUndefined(data)) {
          set({
            _i: false,
            _r: options.revalidate
          });
        } else {
          set({
            _i: true,
            _r: options.revalidate
          });
        }
      }
      return arguments.length ? swr.mutate(data, {
        ...options,
        revalidate: shouldRevalidate
      }) : swr.mutate();
    },
    // swr.mutate is always the same reference
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      infiniteKey,
      cache$1
    ]
  );
  const setSize = (0, import_react3.useCallback)(
    (arg) => {
      if (!infiniteKey)
        return EMPTY_PROMISE;
      const [, changeSize] = createCacheHelper(cache$1, infiniteKey);
      let size;
      if (isFunction(arg)) {
        size = arg(resolvePageSize());
      } else if (typeof arg == "number") {
        size = arg;
      }
      if (typeof size != "number")
        return EMPTY_PROMISE;
      changeSize({
        _l: size
      });
      lastPageSizeRef.current = size;
      const data = [];
      const [getInfiniteCache] = createCacheHelper(cache$1, infiniteKey);
      let previousPageData = null;
      for (let i = 0; i < size; ++i) {
        const [pageKey] = serialize(getKey(i, previousPageData));
        const [getCache] = createCacheHelper(cache$1, pageKey);
        const pageData = pageKey ? getCache().data : UNDEFINED;
        if (isUndefined(pageData)) {
          return mutate2(getInfiniteCache().data);
        }
        data.push(pageData);
        previousPageData = pageData;
      }
      return mutate2(data);
    },
    // exclude getKey from the dependencies, which isn't allowed to change during the lifecycle
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      infiniteKey,
      cache$1,
      mutate2,
      resolvePageSize
    ]
  );
  return {
    size: resolvePageSize(),
    setSize,
    mutate: mutate2,
    get data() {
      return swr.data;
    },
    get error() {
      return swr.error;
    },
    get isValidating() {
      return swr.isValidating;
    },
    get isLoading() {
      return swr.isLoading;
    }
  };
};
var useSWRInfinite = withMiddleware(useSWR2, infinite);

// app/client.ts
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/client.ts"
  );
  import.meta.hot.lastModified = "1726380857066.9385";
}
var get_edge = (cursor) => "Backwards" in cursor ? cursor.Backwards : cursor.Forward;
var handle = (x) => {
  return x;
};
var map = (x, f) => {
  if (x.data !== void 0)
    return { isLoading: false, error: null, data: f(x.data) };
  return x;
};
var useClient = () => {
  const api = "http://10.0.1.69:8080";
  return createClient({ baseUrl: api });
};
var get_key = (resource) => (i, prev) => i === 0 ? [resource] : prev.page_info.has_next_page ? [resource, get_edge(prev.page_info.end_cursor)] : null;
var throw_it = (resp) => {
  if (resp.error)
    throw resp.error;
  return resp.data;
};
function make_inf(resource, req) {
  return () => useSWRInfinite(get_key(resource), (key) => req(key).then(throw_it));
}
var get_key_with_id = (id, resource) => (i, prev) => i === 0 ? [resource, id] : prev.page_info.has_next_page ? [resource, id, get_edge(prev.page_info.end_cursor)] : null;
function make_inf_with_id(resource, req) {
  return (id) => useSWRInfinite(
    get_key_with_id(id, resource),
    (key) => req(key).then(throw_it)
  );
}
function make_get(resource, req) {
  return (id) => handle(useSWR([resource, id], ([, id2]) => req(id2).then(throw_it)));
}
var useMeta = make_get(
  "meta",
  (id) => useClient().GET("/meta/{id}", { params: { path: { id } } })
);
var useMetaList = make_inf(
  "meta",
  ([, cursor]) => useClient().GET("/meta", { params: { query: { cursor } } })
);
var useMetaGroup = make_get("meta-group", (id) => {
  return useClient().GET("/meta/{id}/group", { params: { path: { id } } });
});
var useMetaEntries = make_inf_with_id(
  "meta-entry",
  ([, id, cursor]) => useClient().GET("/meta/{id}/entry", {
    params: { path: { id }, query: { cursor } }
  })
);
var useMetaAlias = make_inf_with_id(
  "meta-alias",
  ([, id, cursor]) => useClient().GET("/meta/{id}/alias", {
    params: { path: { id }, query: { cursor } }
  })
);
var useMetaSubs = make_inf_with_id(
  "meta-subscription",
  ([, id, cursor]) => useClient().GET("/meta/{id}/subscription", {
    params: { path: { id }, query: { cursor } }
  })
);
var useMetaSeason = (year, season) => handle(
  useSWR(
    ["season", year, season],
    () => useClient().GET("/meta/season", { params: { query: { year, season } } }).then(throw_it)
  )
);
var useExtractedMeta = (id) => map(useMeta(id), extract_meta);
var useExtractedEntry = (id) => map(useEntry(id), extract_entry);
var useDownload = make_get(
  "download",
  (id) => useClient().GET("/download/{id}", { params: { path: { id } } })
);
var useDownloadList = make_inf(
  "download",
  ([, cursor]) => useClient().GET("/download", { params: { query: { cursor } } })
);
var useEntry = make_get(
  "entry",
  (id) => useClient().GET("/entry/{id}", { params: { path: { id } } })
);
var useEntryList = make_inf(
  "entry",
  ([, cursor]) => useClient().GET("/entry", { params: { query: { cursor } } })
);

export {
  useClient,
  useMetaGroup,
  useMetaEntries,
  useMetaSeason,
  useExtractedMeta,
  useExtractedEntry,
  useDownloadList,
  useEntryList
};
/*! Bundled license information:

use-sync-external-store/cjs/use-sync-external-store-shim.development.js:
  (**
   * @license React
   * use-sync-external-store-shim.development.js
   *
   * Copyright (c) Facebook, Inc. and its affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
//# sourceMappingURL=/build/_shared/chunk-WUDVS3RQ.js.map
