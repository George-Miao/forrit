import {
  Loading
} from "/build/_shared/chunk-U3XMRG2U.js";
import {
  useClient,
  useExtractedMeta
} from "/build/_shared/chunk-WUDVS3RQ.js";
import {
  format_broadcast,
  format_time_relative,
  parse_broadcast,
  use_is_xs
} from "/build/_shared/chunk-JLWCXM6I.js";
import {
  ButtonGroup,
  IconCheckboxTick_default,
  IconCopy_default,
  IconDownload_default,
  Tooltip,
  button_default,
  card_default,
  list_default,
  popover_default,
  space_default,
  typography_default
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
  __commonJS,
  __toESM
} from "/build/_shared/chunk-PNG5AS42.js";

// node_modules/.pnpm/toggle-selection@1.0.6/node_modules/toggle-selection/index.js
var require_toggle_selection = __commonJS({
  "node_modules/.pnpm/toggle-selection@1.0.6/node_modules/toggle-selection/index.js"(exports, module) {
    module.exports = function() {
      var selection = document.getSelection();
      if (!selection.rangeCount) {
        return function() {
        };
      }
      var active = document.activeElement;
      var ranges = [];
      for (var i = 0; i < selection.rangeCount; i++) {
        ranges.push(selection.getRangeAt(i));
      }
      switch (active.tagName.toUpperCase()) {
        case "INPUT":
        case "TEXTAREA":
          active.blur();
          break;
        default:
          active = null;
          break;
      }
      selection.removeAllRanges();
      return function() {
        selection.type === "Caret" && selection.removeAllRanges();
        if (!selection.rangeCount) {
          ranges.forEach(function(range) {
            selection.addRange(range);
          });
        }
        active && active.focus();
      };
    };
  }
});

// node_modules/.pnpm/copy-to-clipboard@3.3.3/node_modules/copy-to-clipboard/index.js
var require_copy_to_clipboard = __commonJS({
  "node_modules/.pnpm/copy-to-clipboard@3.3.3/node_modules/copy-to-clipboard/index.js"(exports, module) {
    "use strict";
    var deselectCurrent = require_toggle_selection();
    var clipboardToIE11Formatting = {
      "text/plain": "Text",
      "text/html": "Url",
      "default": "Text"
    };
    var defaultMessage = "Copy to clipboard: #{key}, Enter";
    function format(message) {
      var copyKey = (/mac os x/i.test(navigator.userAgent) ? "\u2318" : "Ctrl") + "+C";
      return message.replace(/#{\s*key\s*}/g, copyKey);
    }
    function copy(text, options) {
      var debug, message, reselectPrevious, range, selection, mark, success = false;
      if (!options) {
        options = {};
      }
      debug = options.debug || false;
      try {
        reselectPrevious = deselectCurrent();
        range = document.createRange();
        selection = document.getSelection();
        mark = document.createElement("span");
        mark.textContent = text;
        mark.ariaHidden = "true";
        mark.style.all = "unset";
        mark.style.position = "fixed";
        mark.style.top = 0;
        mark.style.clip = "rect(0, 0, 0, 0)";
        mark.style.whiteSpace = "pre";
        mark.style.webkitUserSelect = "text";
        mark.style.MozUserSelect = "text";
        mark.style.msUserSelect = "text";
        mark.style.userSelect = "text";
        mark.addEventListener("copy", function(e) {
          e.stopPropagation();
          if (options.format) {
            e.preventDefault();
            if (typeof e.clipboardData === "undefined") {
              debug && console.warn("unable to use e.clipboardData");
              debug && console.warn("trying IE specific stuff");
              window.clipboardData.clearData();
              var format2 = clipboardToIE11Formatting[options.format] || clipboardToIE11Formatting["default"];
              window.clipboardData.setData(format2, text);
            } else {
              e.clipboardData.clearData();
              e.clipboardData.setData(options.format, text);
            }
          }
          if (options.onCopy) {
            e.preventDefault();
            options.onCopy(e.clipboardData);
          }
        });
        document.body.appendChild(mark);
        range.selectNodeContents(mark);
        selection.addRange(range);
        var successful = document.execCommand("copy");
        if (!successful) {
          throw new Error("copy command was unsuccessful");
        }
        success = true;
      } catch (err) {
        debug && console.error("unable to copy using execCommand: ", err);
        debug && console.warn("trying IE specific stuff");
        try {
          window.clipboardData.setData(options.format || "text", text);
          options.onCopy && options.onCopy(window.clipboardData);
          success = true;
        } catch (err2) {
          debug && console.error("unable to copy using clipboardData: ", err2);
          debug && console.error("falling back to prompt");
          message = format("message" in options ? options.message : defaultMessage);
          window.prompt(message, text);
        }
      } finally {
        if (selection) {
          if (typeof selection.removeRange == "function") {
            selection.removeRange(range);
          } else {
            selection.removeAllRanges();
          }
        }
        if (mark) {
          document.body.removeChild(mark);
        }
        reselectPrevious();
      }
      return success;
    }
    module.exports = copy;
  }
});

// node_modules/.pnpm/react-string-replace@1.1.1/node_modules/react-string-replace/index.js
var require_react_string_replace = __commonJS({
  "node_modules/.pnpm/react-string-replace@1.1.1/node_modules/react-string-replace/index.js"(exports, module) {
    var isRegExp = function(re) {
      return re instanceof RegExp;
    };
    var escapeRegExp = function escapeRegExp2(string) {
      var reRegExpChar = /[\\^$.*+?()[\]{}|]/g, reHasRegExpChar = RegExp(reRegExpChar.source);
      return string && reHasRegExpChar.test(string) ? string.replace(reRegExpChar, "\\$&") : string;
    };
    var isString = function(value) {
      return typeof value === "string";
    };
    var flatten = function(array) {
      var newArray = [];
      array.forEach(function(item) {
        if (Array.isArray(item)) {
          newArray = newArray.concat(item);
        } else {
          newArray.push(item);
        }
      });
      return newArray;
    };
    function replaceString(str, match, fn) {
      var curCharStart = 0;
      var curCharLen = 0;
      if (str === "") {
        return str;
      } else if (!str || !isString(str)) {
        throw new TypeError("First argument to react-string-replace#replaceString must be a string");
      }
      var re = match;
      if (!isRegExp(re)) {
        re = new RegExp("(" + escapeRegExp(re) + ")", "gi");
      }
      var result = str.split(re);
      for (var i = 1, length = result.length; i < length; i += 2) {
        if (result[i] === void 0 || result[i - 1] === void 0) {
          console.warn("reactStringReplace: Encountered undefined value during string replacement. Your RegExp may not be working the way you expect.");
          continue;
        }
        curCharLen = result[i].length;
        curCharStart += result[i - 1].length;
        result[i] = fn(result[i], i, curCharStart);
        curCharStart += curCharLen;
      }
      return result;
    }
    module.exports = function reactStringReplace2(source, match, fn) {
      if (!Array.isArray(source))
        source = [source];
      return flatten(source.map(function(x) {
        return isString(x) ? replaceString(x, match, fn) : x;
      }));
    };
  }
});

// node_modules/.pnpm/react-use-clipboard@1.0.9_react-dom@18.3.1_react@18.3.1__react@18.3.1/node_modules/react-use-clipboard/dist/react-use-clipboard.module.js
var import_react = __toESM(require_react());
var import_copy_to_clipboard = __toESM(require_copy_to_clipboard());
function react_use_clipboard_module_default(n, i) {
  var u = (0, import_react.useState)(false), c = u[0], e = u[1], f = i && i.successDuration;
  return (0, import_react.useEffect)(function() {
    if (c && f) {
      var t2 = setTimeout(function() {
        e(false);
      }, f);
      return function() {
        clearTimeout(t2);
      };
    }
  }, [c, f]), [c, function() {
    var t2 = (0, import_copy_to_clipboard.default)(n);
    e(t2);
  }];
}

// app/components/meta_preview.tsx
var import_jsx_dev_runtime = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/meta_preview.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/meta_preview.tsx"
  );
  import.meta.hot.lastModified = "1726371181752.9646";
}
function MetaPreview({
  id
}) {
  if (id) {
    let useData2 = function() {
      _s2();
      return useExtractedMeta(id);
    };
    var useData = useData2;
    var _s2 = $RefreshSig$();
    _s2(useData2, "1xvDvuGOeSjBKbUAvoPfpTx1OQ0=", false, function() {
      return [useExtractedMeta];
    });
    return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(Loading, { useData: useData2, children: (meta) => Loaded({
      meta
    }) }, void 0, false, {
      fileName: "app/components/meta_preview.tsx",
      lineNumber: 37,
      columnNumber: 12
    }, this);
  }
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(card_default, { children: "\u672A\u77E5" }, void 0, false, {
    fileName: "app/components/meta_preview.tsx",
    lineNumber: 41,
    columnNumber: 10
  }, this);
}
_c = MetaPreview;
var width = 200;
function Loaded({
  meta
}) {
  const cover = meta.tv?.poster_path ? /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("a", { style: {
    width,
    height: width * 1.5
  }, href: `/meta/${meta.id}`, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)("img", { style: {
    width: "100%",
    height: "100%"
  }, alt: "poster", src: `https://image.tmdb.org/t/p/original/${meta.tv.poster_path}` }, void 0, false, {
    fileName: "app/components/meta_preview.tsx",
    lineNumber: 52,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/meta_preview.tsx",
    lineNumber: 48,
    columnNumber: 40
  }, this) : null;
  const interval = meta.broadcast ? parse_broadcast(meta.broadcast) : {};
  return /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(card_default, { cover, style: {
    maxWidth: width
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime.jsxDEV)(card_default.Meta, { title: meta.title, description: format_broadcast(interval) }, void 0, false, {
    fileName: "app/components/meta_preview.tsx",
    lineNumber: 61,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/meta_preview.tsx",
    lineNumber: 58,
    columnNumber: 10
  }, this);
}
_c2 = Loaded;
var _c;
var _c2;
$RefreshReg$(_c, "MetaPreview");
$RefreshReg$(_c2, "Loaded");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

// app/components/entry_list/item.tsx
var import_react2 = __toESM(require_react(), 1);
var import_react_string_replace = __toESM(require_react_string_replace(), 1);
var import_jsx_dev_runtime2 = __toESM(require_jsx_dev_runtime(), 1);
if (!window.$RefreshReg$ || !window.$RefreshSig$ || !window.$RefreshRuntime$) {
  console.warn("remix:hmr: React Fast Refresh only works when the Remix compiler is running in development mode.");
} else {
  prevRefreshReg = window.$RefreshReg$;
  prevRefreshSig = window.$RefreshSig$;
  window.$RefreshReg$ = (type, id) => {
    window.$RefreshRuntime$.register(type, '"app/components/entry_list/item.tsx"' + id);
  };
  window.$RefreshSig$ = window.$RefreshRuntime$.createSignatureFunctionForTransform;
}
var prevRefreshReg;
var prevRefreshSig;
var _s = $RefreshSig$();
if (import.meta) {
  import.meta.hot = createHotContext(
    //@ts-expect-error
    "app/components/entry_list/item.tsx"
  );
}
var {
  Text
} = typography_default;
function EntryListItem({
  item,
  show_meta
}) {
  _s();
  const [copied, copy] = react_use_clipboard_module_default(item.torrent, {
    successDuration: 1e3
  });
  const [downloaded, setDownloaded] = (0, import_react2.useState)(false);
  const client = useClient();
  const is_xs = use_is_xs();
  const download = () => {
    if (downloaded)
      return;
    client.POST("/entry/{id}/download", {
      params: {
        path: {
          id: item.id
        }
      }
    });
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 1e3);
  };
  const detail = /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(space_default, { align: "start", children: [
    item.pub_date ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Tooltip, { position: "right", content: item.pub_date.toLocaleString(), children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { size: "small", type: "tertiary", children: format_time_relative(item.pub_date) }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 59,
      columnNumber: 11
    }, this) }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 58,
      columnNumber: 24
    }, this) : null,
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { type: "tertiary", size: "small", children: [
      "\u6765\u81EA",
      /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { size: "inherit", weight: 400, style: {
        maxWidth: "15em",
        overflow: "hidden",
        textOverflow: "ellipsis",
        marginLeft: ".2em"
      }, link: item.link ? {
        href: item.link,
        target: "_blank"
      } : void 0, children: item.sourcer }, void 0, false, {
        fileName: "app/components/entry_list/item.tsx",
        lineNumber: 67,
        columnNumber: 9
      }, this)
    ] }, void 0, true, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 65,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 56,
    columnNumber: 18
  }, this);
  const episode = item.elements.EpisodeNumber ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
    "\u7B2C",
    item.elements.EpisodeNumber,
    "\u96C6"
  ] }, void 0, true, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 81,
    columnNumber: 49
  }, this) : null;
  const meta_text = /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { style: {
    fontSize: "16px",
    fontWeight: show_meta ? 300 : 500
  }, children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(import_jsx_dev_runtime2.Fragment, { children: [
    show_meta && item.meta_id && /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { style: {
      fontSize: "inherit",
      textDecoration: "none",
      fontWeight: 500,
      marginRight: ".5em"
    }, link: {
      href: `/meta/${item.meta_id?.$oid}`
    }, children: item.meta_title }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 87,
      columnNumber: 39
    }, this),
    episode
  ] }, void 0, true, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 86,
    columnNumber: 7
  }, this) }, void 0, false, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 82,
    columnNumber: 21
  }, this);
  const meta = item.meta_id && (is_xs ? meta_text : /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(popover_default, { content: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(MetaPreview, { id: item.meta_id?.$oid }, void 0, false, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 101,
    columnNumber: 71
  }, this), trigger: "hover", children: meta_text }, void 0, false, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 101,
    columnNumber: 53
  }, this));
  const title = /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { size: show_meta ? "small" : "normal", link: {
    href: `/entry/${item.id}`
  }, style: {
    wordWrap: "break-word",
    wordBreak: "break-all",
    cursor: item.link ? "pointer" : "default",
    fontWeight: 400,
    letterSpacing: "-0.5px",
    "--semi-color-link": "var(--semi-color-text-2)"
  }, children: item.group ? (0, import_react_string_replace.default)(item.title, item.group, () => /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Text, { size: "inherit", style: {
    color: "rgba(var(--semi-teal-7))"
  }, children: item.group }, void 0, false, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 116,
    columnNumber: 70
  }, this)) : item.title }, void 0, false, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 105,
    columnNumber: 17
  }, this);
  const non_xs_buttons = /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(ButtonGroup, { children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Tooltip, { content: "\u590D\u5236\u94FE\u63A5", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(button_default, { theme: "borderless", style: {
      color: "rgba(var(--semi-grey-3))"
    }, icon: copied ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconCheckboxTick_default, {}, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 126,
      columnNumber: 25
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconCopy_default, {}, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 126,
      columnNumber: 48
    }, this), onClick: copy }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 124,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 123,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(Tooltip, { content: "\u4E0B\u8F7D", children: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(button_default, { theme: "borderless", icon: downloaded ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconCheckboxTick_default, {}, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 130,
      columnNumber: 55
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconDownload_default, {}, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 130,
      columnNumber: 78
    }, this), onClick: download }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 130,
      columnNumber: 9
    }, this) }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 129,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 122,
    columnNumber: 26
  }, this);
  const xs_buttons = /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(ButtonGroup, { style: {
    alignSelf: "flex-end"
  }, children: [
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(button_default, { theme: "borderless", style: {
      color: "rgba(var(--semi-grey-3))"
    }, icon: copied ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconCheckboxTick_default, { size: "small" }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 139,
      columnNumber: 23
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconCopy_default, { size: "small" }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 139,
      columnNumber: 59
    }, this), onClick: copy, children: "\u590D\u5236" }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 137,
      columnNumber: 7
    }, this),
    /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(button_default, { theme: "borderless", icon: downloaded ? /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconCheckboxTick_default, { size: "small" }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 143,
      columnNumber: 53
    }, this) : /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(IconDownload_default, { size: "small" }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 143,
      columnNumber: 89
    }, this), onClick: download, children: "\u4E0B\u8F7D" }, void 0, false, {
      fileName: "app/components/entry_list/item.tsx",
      lineNumber: 143,
      columnNumber: 7
    }, this)
  ] }, void 0, true, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 134,
    columnNumber: 22
  }, this);
  return /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(list_default.Item, { style: {
    width: "100%",
    padding: "16px 0",
    paddingTop: is_xs ? "24px" : void 0
  }, main: /* @__PURE__ */ (0, import_jsx_dev_runtime2.jsxDEV)(space_default, { vertical: true, align: "start", className: "entry-list-item", spacing: "tight", children: [
    detail,
    meta,
    title,
    is_xs ? xs_buttons : null
  ] }, void 0, true, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 152,
    columnNumber: 12
  }, this), extra: is_xs ? null : non_xs_buttons }, void 0, false, {
    fileName: "app/components/entry_list/item.tsx",
    lineNumber: 148,
    columnNumber: 10
  }, this);
}
_s(EntryListItem, "cdDaYpwC0g8zCI5bnmoODruLsyU=", false, function() {
  return [react_use_clipboard_module_default, useClient];
});
_c3 = EntryListItem;
var _c3;
$RefreshReg$(_c3, "EntryListItem");
window.$RefreshReg$ = prevRefreshReg;
window.$RefreshSig$ = prevRefreshSig;

export {
  EntryListItem
};
//# sourceMappingURL=/build/_shared/chunk-C2T2CZ3A.js.map
