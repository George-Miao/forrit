import {
  WidthLimit,
  breadcrumb_default,
  space_default
} from "/build/_shared/chunk-N2TUX3U2.js";
import {
  require_jsx_dev_runtime
} from "/build/_shared/chunk-PMI65YMG.js";
import {
  createHotContext
} from "/build/_shared/chunk-SCUC3Y5X.js";
import {
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// app/components/page_header.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/page_header.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/page_header.tsx"
  );
  import.meta.hot.lastModified = "1726380767263.371";
}
function PageHeader({
  children,
  routes
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
    padding: "1em 0",
    backgroundColor: "#FFF",
    boxShadow: "0px 1px 2px rgba(0, 0, 0, 0.1)"
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(WidthLimit, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(space_default, { vertical: true, align: "start", spacing: "loose", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(breadcrumb_default, { showTooltip: {
      width: "24em",
      opts: {
        position: "bottom"
      }
    }, routes }, void 0, false, {
      fileName: "app/components/page_header.tsx",
      lineNumber: 34,
      columnNumber: 11
    }, this),
    children
  ] }, void 0, true, {
    fileName: "app/components/page_header.tsx",
    lineNumber: 33,
    columnNumber: 9
  }, this) }, void 0, false, {
    fileName: "app/components/page_header.tsx",
    lineNumber: 32,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/page_header.tsx",
    lineNumber: 27,
    columnNumber: 10
  }, this);
}
_c = PageHeader;
var _c;
$RefreshReg$(_c, "PageHeader");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  PageHeader
};
//# sourceMappingURL=/build/_shared/chunk-ARDAIBRE.js.map
