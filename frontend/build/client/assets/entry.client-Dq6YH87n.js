import{r as o,j as p}from"./jsx-runtime-BVzQf6E0.js";import{r as v}from"./index-Dm89QOQe.js";import{E as h,c as b,i as C,d as y,a as g,m as E,s as F,b as $,e as S,f as k,g as P,h as H,u as O,R as j,j as B,k as D}from"./components-WhqMYwqP.js";/**
 * @remix-run/react v2.12.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */function z(u){if(!u)return null;let w=Object.entries(u),s={};for(let[a,e]of w)if(e&&e.__type==="RouteErrorResponse")s[a]=new h(e.status,e.statusText,e.data,e.internal===!0);else if(e&&e.__type==="Error"){if(e.__subType){let i=window[e.__subType];if(typeof i=="function")try{let r=new i(e.message);r.stack=e.stack,s[a]=r}catch{}}if(s[a]==null){let i=new Error(e.message);i.stack=e.stack,s[a]=i}}else s[a]=e;return s}/**
 * @remix-run/react v2.12.1
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */let n,t,f=!1;let c,N=new Promise(u=>{c=u}).catch(()=>{});function A(u){if(!t){if(window.__remixContext.future.unstable_singleFetch){if(!n){let d=window.__remixContext.stream;C(d,"No stream found for single fetch decoding"),window.__remixContext.stream=void 0,n=y(d,window).then(l=>{window.__remixContext.state=l.value,n.value=!0}).catch(l=>{n.error=l})}if(n.error)throw n.error;if(!n.value)throw n}let i=g(window.__remixManifest.routes,window.__remixRouteModules,window.__remixContext.state,window.__remixContext.future,window.__remixContext.isSpaMode),r;if(!window.__remixContext.isSpaMode){r={...window.__remixContext.state,loaderData:{...window.__remixContext.state.loaderData}};let d=E(i,window.location,window.__remixContext.basename);if(d)for(let l of d){let _=l.route.id,x=window.__remixRouteModules[_],m=window.__remixManifest.routes[_];x&&F(m,x,window.__remixContext.isSpaMode)&&(x.HydrateFallback||!m.hasLoader)?r.loaderData[_]=void 0:m&&!m.hasLoader&&(r.loaderData[_]=null)}r&&r.errors&&(r.errors=z(r.errors))}t=$({routes:i,history:S(),basename:window.__remixContext.basename,future:{v7_normalizeFormMethod:!0,v7_fetcherPersist:window.__remixContext.future.v3_fetcherPersist,v7_partialHydration:!0,v7_prependBasename:!0,v7_relativeSplatPath:window.__remixContext.future.v3_relativeSplatPath,v7_skipActionErrorRevalidation:window.__remixContext.future.unstable_singleFetch===!0},hydrationData:r,mapRouteProperties:k,unstable_dataStrategy:window.__remixContext.future.unstable_singleFetch?P(window.__remixManifest,window.__remixRouteModules,()=>t):void 0,unstable_patchRoutesOnNavigation:H(window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode,window.__remixContext.basename)}),t.state.initialized&&(f=!0,t.initialize()),t.createRoutesForHMR=b,window.__remixRouter=t,c&&c(t)}let[w,s]=o.useState(void 0),[a,e]=o.useState(t.state.location);return o.useLayoutEffect(()=>{f||(f=!0,t.initialize())},[]),o.useLayoutEffect(()=>t.subscribe(i=>{i.location!==a&&e(i.location)}),[a]),O(t,window.__remixManifest,window.__remixRouteModules,window.__remixContext.future,window.__remixContext.isSpaMode),o.createElement(o.Fragment,null,o.createElement(j.Provider,{value:{manifest:window.__remixManifest,routeModules:window.__remixRouteModules,future:window.__remixContext.future,criticalCss:w,isSpaMode:window.__remixContext.isSpaMode}},o.createElement(B,{location:a},o.createElement(D,{router:t,fallbackElement:null,future:{v7_startTransition:!0}}))),window.__remixContext.future.unstable_singleFetch?o.createElement(o.Fragment,null):null)}var M,R=v;R.createRoot,M=R.hydrateRoot;o.startTransition(()=>{M(document,p.jsx(A,{}))});
