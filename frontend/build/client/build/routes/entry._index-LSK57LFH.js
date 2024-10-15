import {
  EntryListItem
} from "/build/_shared/chunk-C2T2CZ3A.js";
import {
  LoadingInfinite
} from "/build/_shared/chunk-4WWUFKER.js";
import "/build/_shared/chunk-U3XMRG2U.js";
import {
  useEntryList
} from "/build/_shared/chunk-WUDVS3RQ.js";
import {
  extract_entry
} from "/build/_shared/chunk-JLWCXM6I.js";
import {
  PageHeader
} from "/build/_shared/chunk-ARDAIBRE.js";
import {
  Text,
  WidthLimit,
  list_default,
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

// app/routes/entry._index.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/entry._index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/entry._index.tsx"
  );
  import.meta.hot.lastModified = "1726432824163.6538";
}
var {
  Title
} = typography_default;
function Entry() {
  _s();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PageHeader, { routes: [{
      href: "/",
      name: "\u9996\u9875"
    }, {
      name: "\u66F4\u65B0"
    }], children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, { type: "secondary", style: {
      margin: "2em 0 1em"
    }, children: "\u66F4\u65B0" }, void 0, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 42,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 36,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(WidthLimit, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(list_default, { style: {
      width: "100%"
    }, emptyContent: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { type: "tertiary", style: {
      display: "block",
      marginTop: "2em"
    }, children: "\u6682\u65E0\u8D44\u6E90" }, void 0, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 51,
      columnNumber: 24
    }, this), children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(LoadingInfinite, { useData: useEntryList(), children: (data) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: data.map((item) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(EntryListItem, { item: extract_entry(item), show_meta: true }, item._id.$oid, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 59,
      columnNumber: 35
    }, this)) }, void 0, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 58,
      columnNumber: 22
    }, this) }, void 0, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 57,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 49,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/entry._index.tsx",
      lineNumber: 48,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/entry._index.tsx",
    lineNumber: 35,
    columnNumber: 10
  }, this);
}
_s(Entry, "5jbUC9Tr1W1/rwPp1iUPGuwOogI=", false, function() {
  return [useEntryList];
});
_c = Entry;
var _c;
$RefreshReg$(_c, "Entry");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Entry as default
};
//# sourceMappingURL=/build/routes/entry._index-LSK57LFH.js.map
