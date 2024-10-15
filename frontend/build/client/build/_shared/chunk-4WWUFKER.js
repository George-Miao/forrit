import {
  spin_default
} from "/build/_shared/chunk-N2TUX3U2.js";
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
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// node_modules/.pnpm/react-swr-infinite-scroll@1.0.1_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/react-swr-infinite-scroll/index.esm.js
var import_react = __toESM(require_react());
function index_esm_default(r) {
  var i = r.swr, o = r.swr, u = o.setSize, a = o.data, c = o.isValidating, f = r.children, l = r.loadingIndicator, s = r.endingIndicator, d = r.isReachingEnd, v = r.offset, p = void 0 === v ? 0 : v, m = function() {
    var n2 = (0, import_react.useState)(false), r2 = n2[0], i2 = n2[1], o2 = (0, import_react.useState)(), u2 = o2[0], a2 = o2[1];
    return (0, import_react.useEffect)(function() {
      if (u2) {
        var n3 = new IntersectionObserver(function(n4) {
          var e2;
          i2(null === (e2 = n4[0]) || void 0 === e2 ? void 0 : e2.isIntersecting);
        });
        return n3.observe(u2), function() {
          return n3.unobserve(u2);
        };
      }
    }, [u2]), [r2, function(n3) {
      return n3 && a2(n3);
    }];
  }(), g = m[0], b = m[1], y = "function" == typeof d ? d(i) : d;
  return (0, import_react.useEffect)(function() {
    !g || c || y || u(function(n2) {
      return n2 + 1;
    });
  }, [g, c, u, y]), import_react.default.createElement(import_react.default.Fragment, null, "function" == typeof f ? null == a ? void 0 : a.map(function(n2) {
    return f(n2);
  }) : f, import_react.default.createElement("div", { style: { position: "relative" } }, import_react.default.createElement("div", { ref: b, style: { position: "absolute", top: p } }), y ? s : l));
}

// app/components/loading_infinite.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/loading_infinite.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/loading_infinite.tsx"
  );
  import.meta.hot.lastModified = "1726366494033.7554";
}
function LoadingInfinite({
  useData: data,
  children
}) {
  const has_next_page = data.data?.[data.data.length - 1]?.page_info.has_next_page;
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(index_esm_default, { swr: data, isReachingEnd: has_next_page === false, loadingIndicator: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(spin_default, { style: {
    display: "block",
    margin: "4em auto"
  } }, void 0, false, {
    fileName: "app/components/loading_infinite.tsx",
    lineNumber: 28,
    columnNumber: 95
  }, this), offset: -300, children: (data2) => data2 && children(data2.items) }, void 0, false, {
    fileName: "app/components/loading_infinite.tsx",
    lineNumber: 28,
    columnNumber: 10
  }, this);
}
_c = LoadingInfinite;
var _c;
$RefreshReg$(_c, "LoadingInfinite");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  LoadingInfinite
};
//# sourceMappingURL=/build/_shared/chunk-4WWUFKER.js.map
