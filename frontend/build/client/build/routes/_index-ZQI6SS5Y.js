import {
  SubscribeButton
} from "/build/_shared/chunk-A5SVFICX.js";
import {
  require_node
} from "/build/_shared/chunk-G7CHZRZX.js";
import {
  Loading
} from "/build/_shared/chunk-U3XMRG2U.js";
import {
  useMetaSeason
} from "/build/_shared/chunk-WUDVS3RQ.js";
import {
  format_broadcast,
  format_day,
  get_title,
  group_by,
  parse_broadcast,
  sort_day,
  use_is_xs
} from "/build/_shared/chunk-JLWCXM6I.js";
import {
  PageHeader
} from "/build/_shared/chunk-ARDAIBRE.js";
import {
  WidthLimit,
  card_default,
  col_default,
  divider_default,
  row_default,
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

// app/routes/_index.tsx
var import_node = __toESM(require_node(), 1);

// app/components/meta_card/index.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/meta_card/index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/meta_card/index.tsx"
  );
}
var xs_width = "47dvw - 8px";
function MetaCard({
  meta: meta2
}) {
  const {
    Text
  } = typography_default;
  const is_xs = use_is_xs();
  const [width, height] = is_xs ? [`calc(${xs_width})`, `calc(1.5 * (${xs_width}))`] : [230, 230 * 1.5];
  const cover = meta2.tv?.poster_path ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", { tabIndex: 0, style: {
    width,
    textDecoration: "none",
    cursor: "pointer",
    zIndex: 100
  }, role: "button", href: `/meta/${meta2._id.$oid}`, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { alt: "backdrop", style: {
    width,
    height
  }, src: `https://image.tmdb.org/t/p/original/${meta2.tv.poster_path}` }, void 0, false, {
    fileName: "app/components/meta_card/index.tsx",
    lineNumber: 45,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/meta_card/index.tsx",
    lineNumber: 38,
    columnNumber: 40
  }, this) : null;
  const interval = meta2.broadcast ? parse_broadcast(meta2.broadcast) : {};
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(card_default, { shadows: "always", bordered: false, cover, style: {
    width,
    cursor: "unset"
  }, bodyStyle: {
    maxWidth: "100%",
    display: "flex",
    flexDirection: "row",
    flexWrap: "nowrap",
    justifyContent: "space-between",
    padding: "15px"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(card_default.Meta, { style: {
      overflow: "hidden",
      textOverflow: "ellipsis"
    }, title: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { ellipsis: {
      showTooltip: true
    }, children: get_title(meta2) }, void 0, false, {
      fileName: "app/components/meta_card/index.tsx",
      lineNumber: 67,
      columnNumber: 15
    }, this), description: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(space_default, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { type: "secondary", children: format_broadcast(interval) }, void 0, false, {
      fileName: "app/components/meta_card/index.tsx",
      lineNumber: 70,
      columnNumber: 13
    }, this) }, void 0, false, {
      fileName: "app/components/meta_card/index.tsx",
      lineNumber: 69,
      columnNumber: 47
    }, this) }, void 0, false, {
      fileName: "app/components/meta_card/index.tsx",
      lineNumber: 64,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(SubscribeButton, { show_text: false, meta_id: meta2._id.$oid, subscription: meta2.subscription ?? null }, void 0, false, {
      fileName: "app/components/meta_card/index.tsx",
      lineNumber: 77,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/meta_card/index.tsx",
    lineNumber: 52,
    columnNumber: 10
  }, this);
}
_c = MetaCard;
var _c;
$RefreshReg$(_c, "MetaCard");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/routes/_index.tsx
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/routes/_index.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/routes/_index.tsx"
  );
  import.meta.hot.lastModified = "1726381587782.9924";
}
var meta = () => {
  return [{
    title: "New Remix App"
  }, {
    name: "description",
    content: "Welcome to Remix!"
  }];
};
function Index() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Loading, { size: "large", useData: useMetaSeason, children: (data) => Loaded(data) }, void 0, false, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 43,
    columnNumber: 10
  }, this);
}
_c2 = Index;
function Loaded(data) {
  const bangumi = data.filter((m) => !!m.tv && !!m.broadcast).map((m) => ({
    ...m,
    parsed_broadcast: parse_broadcast(m.broadcast)
  }));
  const by_day = [...group_by(bangumi, (m) => m.parsed_broadcast.begin.getDay())].sort(([a], [b]) => sort_day(a, b));
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(PageHeader, { routes: [{
      href: "/",
      name: "\u9996\u9875"
    }, {
      name: "\u672C\u5B63\u65B0\u756A"
    }], children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(typography_default.Title, { type: "secondary", style: {
      margin: "2em 0 1em"
    }, children: "\u672C\u5B63\u65B0\u756A" }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 61,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 55,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(WidthLimit, { maxWidth: 230 * 6 + 20 * 5, children: by_day.map(([day, bangumis]) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(row_default, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(divider_default, { style: {
        marginTop: "2em",
        marginBottom: "3em"
      }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(typography_default.Title, { heading: 4, style: {
        margin: "0 1em"
      }, children: [
        "\u661F\u671F",
        format_day(day)
      ] }, void 0, true, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 74,
        columnNumber: 17
      }, this) }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 70,
        columnNumber: 15
      }, this) }, `header-${day}`, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 69,
        columnNumber: 13
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(row_default, { gutter: {
        xs: 8,
        sm: 12,
        md: 20
      }, children: bangumis.sort((a, b) => +a.parsed_broadcast.begin - +b.parsed_broadcast.begin).map((meta2) => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(col_default, { xs: 12, md: 8, lg: 6, xxl: 4, style: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "1em"
      }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(MetaCard, { meta: meta2 }, void 0, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 91,
        columnNumber: 21
      }, this) }, meta2._id.$oid, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 86,
        columnNumber: 107
      }, this)) }, `content-${day}`, false, {
        fileName: "app/routes/_index.tsx",
        lineNumber: 81,
        columnNumber: 13
      }, this)
    ] }, void 0, true, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 68,
      columnNumber: 42
    }, this)) }, void 0, false, {
      fileName: "app/routes/_index.tsx",
      lineNumber: 67,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/routes/_index.tsx",
    lineNumber: 54,
    columnNumber: 10
  }, this);
}
_c22 = Loaded;
var _c2;
var _c22;
$RefreshReg$(_c2, "Index");
$RefreshReg$(_c22, "Loaded");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Index as default,
  meta
};
//# sourceMappingURL=/build/routes/_index-ZQI6SS5Y.js.map
