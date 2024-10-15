import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  useLoaderData
} from "/build/_shared/chunk-NDPJ7OKC.js";
import {
  Loading
} from "/build/_shared/chunk-U3XMRG2U.js";
import {
  useExtractedEntry
} from "/build/_shared/chunk-WUDVS3RQ.js";
import "/build/_shared/chunk-JLWCXM6I.js";
import {
  PageHeader
} from "/build/_shared/chunk-ARDAIBRE.js";
import "/build/_shared/chunk-N2TUX3U2.js";
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

// app/routes/entry.$id.tsx
var import_node = __toESM(require_node(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/entry.$id.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/entry.$id.tsx"
  );
  import.meta.hot.lastModified = "1726381156963.9412";
}
function EntryDetail() {
  var _s = $RefreshSig$();
  function useData() {
    _s();
    const id = useLoaderData().id;
    return useExtractedEntry(id);
  }
  _s(useData, "LO+aI6Xt3HnHbgEd6YlRnS4yelM=", false, function() {
    return [useLoaderData, useExtractedEntry];
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Loading, { size: "large", useData, children: (data) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Loaded, { entry: data }, void 0, false, {
    fileName: "app/routes/entry.$id.tsx",
    lineNumber: 44,
    columnNumber: 16
  }, this) }, void 0, false, {
    fileName: "app/routes/entry.$id.tsx",
    lineNumber: 43,
    columnNumber: 10
  }, this);
}
_c = EntryDetail;
function Loaded({
  entry
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(PageHeader, { routes: [{
    href: "/",
    name: "\u9996\u9875"
  }, {
    href: "/entry",
    name: "\u66F4\u65B0"
  }, {
    name: entry.title
  }], children: entry.title }, void 0, false, {
    fileName: "app/routes/entry.$id.tsx",
    lineNumber: 52,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/routes/entry.$id.tsx",
    lineNumber: 51,
    columnNumber: 10
  }, this);
}
_c2 = Loaded;
var _c;
var _c2;
$RefreshReg$(_c, "EntryDetail");
$RefreshReg$(_c2, "Loaded");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  EntryDetail as default
};
//# sourceMappingURL=/build/routes/entry.$id-LGKJR5DG.js.map
