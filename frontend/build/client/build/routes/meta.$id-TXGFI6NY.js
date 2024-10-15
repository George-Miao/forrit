import {
  SubscribeButton
} from "/build/_shared/chunk-A5SVFICX.js";
import {
  EntryListItem
} from "/build/_shared/chunk-C2T2CZ3A.js";
import {
  LoadingInfinite
} from "/build/_shared/chunk-4WWUFKER.js";
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
  useExtractedMeta,
  useMetaEntries
} from "/build/_shared/chunk-WUDVS3RQ.js";
import {
  extract_entry,
  use_is_xs
} from "/build/_shared/chunk-JLWCXM6I.js";
import {
  PageHeader
} from "/build/_shared/chunk-ARDAIBRE.js";
import {
  Text,
  Tooltip,
  WidthLimit,
  list_default,
  space_default,
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

// app/routes/meta.$id.tsx
var import_node = __toESM(require_node(), 1);

// app/components/meta_detail_header.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/meta_detail_header.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/meta_detail_header.tsx"
  );
  import.meta.hot.lastModified = "1726383737195.0603";
}
var width = "(min(max(100dvw * 0.3, 150px), 300px))";
var header_height = `calc(60px + 2em + ${width} * 1.5)`;
var {
  Text: Text2,
  Title
} = typography_default;
var placeholder = "https://placedog.net/2000/3000";
function MetaDetailHeader({
  meta
}) {
  const {
    poster,
    title,
    year,
    info,
    overview,
    tv
  } = meta;
  const is_xs = use_is_xs();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(space_default, { align: "start", spacing: is_xs ? "medium" : "loose", style: {
    paddingBottom: "1em"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { alt: "backdrop", style: {
      width: `calc(${width})`,
      height: `calc(${width} * 1.5)`,
      borderRadius: "var(--semi-border-radius-medium)"
    }, src: poster ?? placeholder }, void 0, false, {
      fileName: "app/components/meta_detail_header.tsx",
      lineNumber: 46,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(space_default, { vertical: true, align: "start", style: {
      minHeight: `calc(${width} * 1.5)`
    }, children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, { heading: 3, style: {
        verticalAlign: "baseline"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tooltip, { content: tv?.original_name, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: title }, void 0, false, {
          fileName: "app/components/meta_detail_header.tsx",
          lineNumber: 59,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/components/meta_detail_header.tsx",
          lineNumber: 58,
          columnNumber: 11
        }, this),
        year ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Title, { heading: 4, type: "tertiary", weight: "light", component: "span", style: {
          marginLeft: "0.2em"
        }, children: [
          "(",
          year,
          ")"
        ] }, void 0, true, {
          fileName: "app/components/meta_detail_header.tsx",
          lineNumber: 61,
          columnNumber: 19
        }, this) : null
      ] }, void 0, true, {
        fileName: "app/components/meta_detail_header.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text2, { type: "tertiary", children: info.map((x, i, arr) => /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(import_jsx_dev_runtime.Fragment, { children: [
        x.tooltip ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tooltip, { content: x.tooltip, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: x.content }, void 0, false, {
          fileName: "app/components/meta_detail_header.tsx",
          lineNumber: 70,
          columnNumber: 19
        }, this) }, x.content, false, {
          fileName: "app/components/meta_detail_header.tsx",
          lineNumber: 69,
          columnNumber: 28
        }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { children: x.content }, x.content, false, {
          fileName: "app/components/meta_detail_header.tsx",
          lineNumber: 71,
          columnNumber: 30
        }, this),
        i < arr.length - 1 ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("span", { style: {
          margin: "0 .3em"
        }, children: "\xB7" }, x.content, false, {
          fileName: "app/components/meta_detail_header.tsx",
          lineNumber: 73,
          columnNumber: 37
        }, this) : null
      ] }, void 0, true, {
        fileName: "app/components/meta_detail_header.tsx",
        lineNumber: 68,
        columnNumber: 36
      }, this)) }, void 0, false, {
        fileName: "app/components/meta_detail_header.tsx",
        lineNumber: 67,
        columnNumber: 9
      }, this),
      overview ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text2, { type: "secondary", ellipsis: {
        rows: 4,
        expandable: true
      }, children: overview }, void 0, false, {
        fileName: "app/components/meta_detail_header.tsx",
        lineNumber: 81,
        columnNumber: 21
      }, this) : null,
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("div", { style: {
        flex: 1,
        display: "flex",
        justifyContent: "flex-end",
        alignItems: "flex-end",
        width: "100%"
      }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SubscribeButton, { show_text: true, meta_id: meta.id, subscription: meta.subscription ?? null }, void 0, false, {
        fileName: "app/components/meta_detail_header.tsx",
        lineNumber: 94,
        columnNumber: 11
      }, this) }, void 0, false, {
        fileName: "app/components/meta_detail_header.tsx",
        lineNumber: 87,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/meta_detail_header.tsx",
      lineNumber: 52,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/meta_detail_header.tsx",
    lineNumber: 43,
    columnNumber: 10
  }, this);
}
_c = MetaDetailHeader;
var _c;
$RefreshReg$(_c, "MetaDetailHeader");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/meta.$id.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/meta.$id.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s2 = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/meta.$id.tsx"
  );
  import.meta.hot.lastModified = "1726432900802.2446";
}
function MetaDetail() {
  var _s = $RefreshSig$();
  function useData() {
    _s();
    const id = useLoaderData().id;
    return useExtractedMeta(id);
  }
  _s(useData, "F6LuBNH2CEPd4aySzIKp4pVkTZg=", false, function() {
    return [useLoaderData, useExtractedMeta];
  });
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Loading, { size: "large", useData, children: (data) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Loaded, { meta: data }, void 0, false, {
    fileName: "app/routes/meta.$id.tsx",
    lineNumber: 54,
    columnNumber: 16
  }, this) }, void 0, false, {
    fileName: "app/routes/meta.$id.tsx",
    lineNumber: 53,
    columnNumber: 10
  }, this);
}
_c2 = MetaDetail;
function Loaded({
  meta
}) {
  _s2();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(PageHeader, { routes: [{
      href: "/",
      name: "\u9996\u9875"
    }, {
      href: "/meta",
      name: "\u756A\u5267"
    }, {
      name: meta.title
    }], children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(MetaDetailHeader, { meta }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 72,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 63,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(WidthLimit, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(space_default, { vertical: true, align: "start", spacing: "loose", style: {
      width: "100%"
    }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(list_default, { style: {
      width: "100%"
    }, emptyContent: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { type: "tertiary", style: {
      display: "block",
      marginTop: "2em"
    }, children: "\u6682\u65E0\u8D44\u6E90" }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 81,
      columnNumber: 26
    }, this), children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(LoadingInfinite, { useData: useMetaEntries(meta.id), children: (data) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: data.map((entry) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(EntryListItem, { item: extract_entry(entry), show_meta: false }, entry._id.$oid, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 89,
      columnNumber: 38
    }, this)) }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 88,
      columnNumber: 24
    }, this) }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 87,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 79,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 76,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/meta.$id.tsx",
      lineNumber: 75,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/meta.$id.tsx",
    lineNumber: 62,
    columnNumber: 10
  }, this);
}
_s2(Loaded, "uMq/KdY7t1D7xJitDJLE59Qcyq0=", false, function() {
  return [useMetaEntries];
});
_c22 = Loaded;
var _c2;
var _c22;
$RefreshReg$(_c2, "MetaDetail");
$RefreshReg$(_c22, "Loaded");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  MetaDetail as default
};
//# sourceMappingURL=/build/routes/meta.$id-TXGFI6NY.js.map
