import {
  LoadingInfinite
} from "/build/_shared/chunk-4WWUFKER.js";
import {
  useDownloadList
} from "/build/_shared/chunk-WUDVS3RQ.js";
import {
  format_time_relative,
  get_date_from_id
} from "/build/_shared/chunk-JLWCXM6I.js";
import {
  PageHeader
} from "/build/_shared/chunk-ARDAIBRE.js";
import {
  Text,
  Title,
  Tooltip,
  WidthLimit,
  list_default,
  space_default
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

// app/components/download_list/index.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/download_list/index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/download_list/index.tsx"
  );
  import.meta.hot.lastModified = "1726434534236.8792";
}
var stateMap = {
  "cancelled": "\u5DF2\u53D6\u6D88",
  "finished": "\u5B8C\u6210",
  "pending": "\u7B49\u5F85\u4E2D",
  "downloading": "\u4E0B\u8F7D\u4E2D",
  "failed": "\u5931\u8D25"
};
function DownloadItem({
  item
}) {
  const added = get_date_from_id(item._id.$oid);
  const added_formatted = format_time_relative(added);
  const state_type = item.state === "failed" ? "danger" : item.state === "finished" ? "success" : "tertiary";
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(list_default.Item, { style: {
    padding: "16px 0",
    width: "100%"
  }, extra: item.state === "pending", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(space_default, { vertical: true, align: "start", spacing: 4, style: {
    width: "100%"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { link: {
      href: `/entry/${item.entry_id.$oid}`
    }, style: {
      wordWrap: "break-word",
      wordBreak: "break-all",
      letterSpacing: "-0.3px",
      cursor: "pointer",
      fontWeight: 400
    }, children: item.name }, void 0, false, {
      fileName: "app/components/download_list/index.tsx",
      lineNumber: 44,
      columnNumber: 9
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(space_default, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { type: state_type, size: "small", children: stateMap[item.state] }, void 0, false, {
        fileName: "app/components/download_list/index.tsx",
        lineNumber: 56,
        columnNumber: 11
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { type: "tertiary", size: "small", children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Tooltip, { content: added.toLocaleString(), trigger: "click", children: added_formatted }, void 0, false, {
        fileName: "app/components/download_list/index.tsx",
        lineNumber: 60,
        columnNumber: 13
      }, this) }, void 0, false, {
        fileName: "app/components/download_list/index.tsx",
        lineNumber: 59,
        columnNumber: 11
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/download_list/index.tsx",
      lineNumber: 55,
      columnNumber: 9
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/download_list/index.tsx",
    lineNumber: 41,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/download_list/index.tsx",
    lineNumber: 37,
    columnNumber: 10
  }, this);
}
_c = DownloadItem;
var _c;
$RefreshReg$(_c, "DownloadItem");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/download._index.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/download._index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/download._index.tsx"
  );
  import.meta.hot.lastModified = "1726432828464.6868";
}
function Download() {
  _s();
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(PageHeader, { routes: [{
      href: "/",
      name: "\u9996\u9875"
    }, {
      name: "\u4E0B\u8F7D"
    }], children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Title, { type: "secondary", style: {
      margin: "2em 0 1em"
    }, children: "\u4E0B\u8F7D" }, void 0, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 39,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 33,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(WidthLimit, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(list_default, { style: {
      width: "100%"
    }, emptyContent: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { type: "tertiary", style: {
      display: "block",
      marginTop: "2em"
    }, children: "\u6682\u65E0\u4E0B\u8F7D" }, void 0, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 48,
      columnNumber: 24
    }, this), children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(LoadingInfinite, { useData: useDownloadList(), children: (data) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: data.map((item) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(DownloadItem, { item }, item._id.$oid, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 56,
      columnNumber: 35
    }, this)) }, void 0, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 55,
      columnNumber: 22
    }, this) }, void 0, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 54,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 46,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/download._index.tsx",
      lineNumber: 45,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/download._index.tsx",
    lineNumber: 32,
    columnNumber: 10
  }, this);
}
_s(Download, "sb0PIar4UdOYMmypVVNh1scW6KU=", false, function() {
  return [useDownloadList];
});
_c2 = Download;
var _c2;
$RefreshReg$(_c2, "Download");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Download as default
};
//# sourceMappingURL=/build/routes/download._index-R4Q263JM.js.map
