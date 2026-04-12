import{r as o,j as v}from"./jsx-runtime-B65B224C.js";import{r as h}from"./index-BkUS1f4k.js";import{E as C,i as M,d as y,c as g,m as E,s as b,a as S,g as F,b as P,e as k,f as D,u as z,R as H,h as L,j as O,k as T}from"./components-kHn0Qymz.js";/**
 * @remix-run/react v2.12.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function j(u){if(!u)return null;let m=Object.entries(u),s={};for(let[a,e]of m)if(e&&e.__type==="RouteErrorResponse")s[a]=new C(e.status,e.statusText,e.data,e.internal===!0);else if(e&&e.__type==="Error"){if(e.__subType){let i=window[e.__subType];if(typeof i=="function")try{let r=new i(e.message);r.stack=e.stack,s[a]=r}catch{}}if(s[a]==null){let i=new Error(e.message);i.stack=e.stack,s[a]=i}}else s[a]=e;return s}/**
 * @remix-run/react v2.12.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let n,t,f=!1,c;new Promise(u=>{c=u}).catch(()=>{});function B(u){if(!t){if(window.__remixContext.future.unstable_singleFetch){if(!n){let l=window.__remixContext.stream;M(l,"No stream found for single fetch decoding"),window.__remixContext.stream=void 0,n=y(l,window).then(_=>{window.__remixContext.state=_.value,n.value=!0}).catch(_=>{n.error=_})}if(n.error)throw n.error;if(!n.value)throw n}let i=g(window.__remixManifest.routes,window.__remixRouteModules,window.__remixContext.state,window.__remixContext.future,window.__remixContext.isSpaMode),r;if(!window.__remixContext.isSpaMode){r={...window.__remixContext.state,loaderData:{...window.__remixContext.state.loaderData}};let l=E(i,window.location,window.__remixContext.basename);if(l)for(let _ of l){let d=_.route.id,x=window.__remixRouteModules[d],w=window.__remixManifest.routes[d];x&&b(w,x,window.__remixContext.isSpaMode)&&(x.HydrateFallback||!w.hasLoader)?r.loaderData[d]=void 0:w&&!w.hasLoader&&(r.loaderData[d]=null)}r&&r.errors&&(r.errors=j(r.errors))}t=S({routes:i,history:k(),basename:window.__remixContext.basename,future:{v7_normalizeFormMethod:!0,v7_fetcherPersist:window.__remixContext.future.v3_fetcherPersist,v7_partialHydration:!0,v7_prependBasename:!0,v7_relativeSplatPath:window.__remixContext.future.v3_relativeSplatPath,v7_skipActionErrorRevalidation:window.__remixContext.future.unstable_singleFetch===!0},hydrationData:r,mapRouteProperties:T,unstable_dataStrategy:window.__remixContext.future.unstable_singleFetch?P(window.__remixManifest,window.__remixRouteModules,()=>t):void 0,unstable_patchRoutesOnNavigation:F(window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode,window.__remixContext.basename)}),t.state.initialized&&(f=!0,t.initialize()),t.createRoutesForHMR=D,window.__remixRouter=t,c&&c(t)}let[m,s]=o.useState(void 0),[a,e]=o.useState(t.state.location);return o.useLayoutEffect(()=>{f||(f=!0,t.initialize())},[]),o.useLayoutEffect(()=>t.subscribe(i=>{i.location!==a&&e(i.location)}),[a]),z(t,window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode),o.createElement(o.Fragment,null,o.createElement(H.Provider,{value:{manifest:window.__remixManifest,routeModules:window.__remixRouteModules,future:window.__remixContext.future,criticalCss:m,isSpaMode:window.__remixContext.isSpaMode}},o.createElement(L,{location:a},o.createElement(O,{router:t,fallbackElement:null,future:{v7_startTransition:!0}}))),window.__remixContext.future.unstable_singleFetch?o.createElement(o.Fragment,null):null)}var p,R=h;R.createRoot,p=R.hydrateRoot;o.startTransition(()=>{p(document,v.jsx(B,{}))});
