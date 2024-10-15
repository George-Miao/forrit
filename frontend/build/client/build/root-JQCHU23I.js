import {
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration
} from "/build/_shared/chunk-NDPJ7OKC.js";
import "/build/_shared/chunk-JLWCXM6I.js";
import {
  IconActivity_default,
  IconBell_default,
  IconDownload_default,
  IconFavoriteList_default,
  IconGithubLogo_default,
  IconHome_default,
  Layout,
  WidthLimit,
  button_default,
  navigation_default,
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

// app/root.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/root.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/root.tsx"
  );
}
var {
  Header,
  Content,
  Footer
} = Layout;
var {
  Text,
  Paragraph
} = typography_default;
function Layout2({
  children
}) {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("html", { lang: "en", children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("head", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("meta", { charSet: "utf-8" }, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 55,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("meta", { name: "viewport", content: "width=device-width, initial-scale=1" }, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 56,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Meta, {}, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 57,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Links, {}, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 58,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/root.tsx",
      lineNumber: 54,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("body", { children: [
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Layout, { style: {
        backgroundColor: "var(--semi-color-fill-0)"
      }, children: [
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Header, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(navigation_default, { mode: "horizontal", renderWrapper: ({
          itemElement,
          props
        }) => {
          const p = props;
          return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(NavLink, { to: p.itemKey, style: {
            textDecoration: "none"
          }, children: itemElement }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 71,
            columnNumber: 20
          }, this);
        }, children: [
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(navigation_default.Item, { itemKey: "/", link: "/", icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(IconHome_default, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 78,
            columnNumber: 52
          }, this) }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 78,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(navigation_default.Item, { itemKey: "/entry", link: "/entry", icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(IconActivity_default, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 79,
            columnNumber: 62
          }, this) }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 79,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(navigation_default.Item, { itemKey: "/subscription", link: "/subscription", icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(IconFavoriteList_default, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 81,
            columnNumber: 76
          }, this) }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 81,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(navigation_default.Item, { itemKey: "/download", link: "/download", icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(IconDownload_default, {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 83,
            columnNumber: 68
          }, this) }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 83,
            columnNumber: 15
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(navigation_default.Footer, { children: [
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(button_default, { theme: "borderless", icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(IconBell_default, {}, void 0, false, {
              fileName: "app/root.tsx",
              lineNumber: 86,
              columnNumber: 50
            }, this), style: {
              color: "var(--semi-color-text-2)",
              marginRight: "12px"
            } }, void 0, false, {
              fileName: "app/root.tsx",
              lineNumber: 86,
              columnNumber: 17
            }, this),
            /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(button_default, { theme: "borderless", icon: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(IconGithubLogo_default, {}, void 0, false, {
              fileName: "app/root.tsx",
              lineNumber: 91,
              columnNumber: 50
            }, this), style: {
              color: "var(--semi-color-text-2)",
              marginRight: "12px"
            } }, void 0, false, {
              fileName: "app/root.tsx",
              lineNumber: 91,
              columnNumber: 17
            }, this)
          ] }, void 0, true, {
            fileName: "app/root.tsx",
            lineNumber: 85,
            columnNumber: 15
          }, this)
        ] }, void 0, true, {
          fileName: "app/root.tsx",
          lineNumber: 66,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/root.tsx",
          lineNumber: 65,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Content, { style: {
          minHeight: "calc(100svh - 204px)"
        }, children }, void 0, false, {
          fileName: "app/root.tsx",
          lineNumber: 99,
          columnNumber: 11
        }, this),
        /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Footer, { style: {
          padding: "2em 0",
          marginTop: "1em"
        }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(WidthLimit, { children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Paragraph, { type: "tertiary", style: {
          textAlign: "center"
        }, children: [
          "Project Forrit \xA9 ",
          (/* @__PURE__ */ new Date()).getFullYear(),
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 115,
            columnNumber: 61
          }, this),
          "By",
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { link: {
            href: "https://github.com/George-Miao"
          }, children: "Pop" }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 117,
            columnNumber: 17
          }, this),
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("br", {}, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 122,
            columnNumber: 17
          }, this),
          "Built with",
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { link: {
            href: "https://remix.run"
          }, children: "Remix" }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 124,
            columnNumber: 17
          }, this),
          " and",
          " ",
          /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Text, { link: {
            href: "https://semi.design"
          }, children: "Semi UI" }, void 0, false, {
            fileName: "app/root.tsx",
            lineNumber: 127,
            columnNumber: 17
          }, this)
        ] }, void 0, true, {
          fileName: "app/root.tsx",
          lineNumber: 111,
          columnNumber: 15
        }, this) }, void 0, false, {
          fileName: "app/root.tsx",
          lineNumber: 110,
          columnNumber: 13
        }, this) }, void 0, false, {
          fileName: "app/root.tsx",
          lineNumber: 105,
          columnNumber: 11
        }, this)
      ] }, void 0, true, {
        fileName: "app/root.tsx",
        lineNumber: 61,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(ScrollRestoration, {}, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 135,
        columnNumber: 9
      }, this),
      /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Scripts, {}, void 0, false, {
        fileName: "app/root.tsx",
        lineNumber: 136,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/root.tsx",
      lineNumber: 60,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/root.tsx",
    lineNumber: 53,
    columnNumber: 10
  }, this);
}
_c = Layout2;
function App() {
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Outlet, {}, void 0, false, {
    fileName: "app/root.tsx",
    lineNumber: 142,
    columnNumber: 10
  }, this);
}
_c2 = App;
var _c;
var _c2;
$RefreshReg$(_c, "Layout");
$RefreshReg$(_c2, "App");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;
export {
  Layout2 as Layout,
  App as default
};
//# sourceMappingURL=/build/root-JQCHU23I.js.map
