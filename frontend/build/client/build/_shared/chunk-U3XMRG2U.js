import {
  notification_default,
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

// app/components/loading.tsx
var import_react = __toESM(require_react(), 1);
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/loading.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/loading.tsx"
  );
  import.meta.hot.lastModified = "1726198129671.4978";
}
function Loading({
  useData,
  children,
  size,
  spin,
  spinStyle
}) {
  _s();
  const {
    data,
    isLoading,
    error
  } = useData();
  const [errorShowed, setShowed] = (0, import_react.useState)(false);
  size = size ?? "middle";
  spin = spin ?? true;
  if (spin && isLoading) {
    return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(spin_default, { size, style: {
      display: "block",
      margin: "auto",
      marginTop: size === "large" ? "5em" : size === "middle" ? "3.5em" : "1.5em",
      ...spinStyle
    } }, void 0, false, {
      fileName: "app/components/loading.tsx",
      lineNumber: 41,
      columnNumber: 12
    }, this);
  }
  if (error) {
    if (!errorShowed) {
      setShowed(true);
      notification_default.open({
        title: "\u52A0\u8F7D\u5931\u8D25",
        content: `${error}`,
        duration: 3
      });
    }
    return;
  }
  return data ? children(data) : null;
}
_s(Loading, "D4ZqEFNvDVcQaK90gYlU/MyWRYU=", true);
_c = Loading;
var _c;
$RefreshReg$(_c, "Loading");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  Loading
};
//# sourceMappingURL=/build/_shared/chunk-U3XMRG2U.js.map
