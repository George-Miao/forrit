import {
  PageHeader
} from "/build/_shared/chunk-ARDAIBRE.js";
import {
  IconPlus_default,
  WidthLimit,
  button_default,
  typography_default
} from "/build/_shared/chunk-N2TUX3U2.js";
import "/build/_shared/chunk-56LDNGDG.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-PMI65YMG.js";
import {
  createHotContext
} from "/build/_shared/chunk-SCUC3Y5X.js";
import "/build/_shared/chunk-4JLKO6E3.js";
import "/build/_shared/chunk-2Q7FBYOG.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/routes/subscription._index.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/subscription._index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/subscription._index.tsx"
  );
  import.meta.hot.lastModified = "1726277740563.7102";
}
var {
  Title
} = typography_default;
function Subscription() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PageHeader, { routes: [{
      href: "/",
      name: "\u9996\u9875"
    }, {
      name: "\u8BA2\u9605"
    }], children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, { type: "secondary", style: {
      margin: "2em 0 1em"
    }, children: "\u8BA2\u9605" }, void 0, false, {
      fileName: "app/routes/subscription._index.tsx",
      lineNumber: 36,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/subscription._index.tsx",
      lineNumber: 30,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(WidthLimit, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(button_default, { onClick: () => alert("NOT IMPLEMENTED"), style: {
      height: 100,
      width: "100%",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      marginTop: "1em",
      border: "2px dashed var(--semi-color-border)"
    }, theme: "borderless", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(IconPlus_default, { size: "extra-large" }, void 0, false, {
      fileName: "app/routes/subscription._index.tsx",
      lineNumber: 52,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/subscription._index.tsx",
      lineNumber: 43,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/subscription._index.tsx",
      lineNumber: 42,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/subscription._index.tsx",
    lineNumber: 29,
    columnNumber: 10
  }, this);
}
_c = Subscription;
var _c;
$RefreshReg$(_c, "Subscription");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Subscription as default
};
//# sourceMappingURL=/build/routes/subscription._index-JO77PQTH.js.map
