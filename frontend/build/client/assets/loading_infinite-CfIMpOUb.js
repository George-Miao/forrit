import{B as A,a as L,g as X,P as o,j as _,e as T,L as G}from"./width_limit-CngMnDB3.js";import{n as a,r as k,j as B}from"./jsx-runtime-BVzQf6E0.js";import{C as D,R as U}from"./col-72kQnMqL.js";import{S as W}from"./client-c40QJxix.js";const I={PREFIX:`${A}-list`},S={SIZE:["large","small","default"],LAYOUT:["vertical","horizontal"],ALIGN:["flex-start","flex-end","center","baseline","stretch"]},z=a.createContext(null);var F=function(t,s){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&s.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,e=Object.getOwnPropertySymbols(t);n<e.length;n++)s.indexOf(e[n])<0&&Object.prototype.propertyIsEnumerable.call(t,e[n])&&(r[e[n]]=t[e[n]]);return r};const O=I.PREFIX;class w extends k.PureComponent{wrapWithGrid(s){const{grid:r}=this.context,e=F(r,["gutter","justify","type","align"]);return a.createElement(D,Object.assign({},e),s)}render(){const s=this.props,{header:r,main:e,className:n,style:i,extra:f,children:R,align:g,onClick:m,onRightClick:p,onMouseEnter:C,onMouseLeave:b}=s,y=F(s,["header","main","className","style","extra","children","align","onClick","onRightClick","onMouseEnter","onMouseLeave"]),{onRightClick:$,onClick:u,grid:c}=this.context,v=p||$,j=m||u,x=L(`${O}-item`,n),d=L(`${O}-item-body`,{[`${O}-item-body-${g}`]:g});let h;(r||e)&&(h=a.createElement("div",{className:d},r?a.createElement("div",{className:`${O}-item-body-header`},r):null,e?a.createElement("div",{className:`${O}-item-body-main`},e):null));let l=a.createElement("li",Object.assign({className:x,style:i,onClick:j,onContextMenu:v,onMouseEnter:C,onMouseLeave:b},X(y)),h||null,R,f?a.createElement("div",{className:`${O}-item-extra`},f):null);return this.context&&c&&(l=this.wrapWithGrid(l)),l}}w.contextType=z;w.propTypes={extra:o.node,header:o.node,main:o.node,align:o.oneOf(S.ALIGN),className:o.string,children:o.node,style:o.object,onClick:o.func,onRightClick:o.func,onMouseEnter:o.func,onMouseLeave:o.func};w.defaultProps={align:"flex-start",onMouseEnter:_,onMouseLeave:_};var Y=function(t,s){var r={};for(var e in t)Object.prototype.hasOwnProperty.call(t,e)&&s.indexOf(e)<0&&(r[e]=t[e]);if(t!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,e=Object.getOwnPropertySymbols(t);n<e.length;n++)s.indexOf(e[n])<0&&Object.prototype.propertyIsEnumerable.call(t,e[n])&&(r[e[n]]=t[e[n]]);return r};const E=I.PREFIX;class M extends T{constructor(){super(...arguments),this.renderEmpty=()=>{const{emptyContent:s}=this.props;return s?a.createElement("div",{className:`${I.PREFIX}-empty`,"x-semi-prop":"emptyContent"},s):a.createElement(G,{componentName:"List"},r=>a.createElement("div",{className:`${I.PREFIX}-empty`},r.emptyText))}}wrapChildren(s,r){const{grid:e}=this.props;if(e){const n={};return["align","gutter","justify","type"].forEach(i=>{i in e&&(n[i]=e[i])}),a.createElement(U,Object.assign({type:"flex"},n),s||null,r)}return a.createElement("ul",{className:`${E}-items`},s||null,r)}render(){const s=this.props,{style:r,className:e,header:n,loading:i,onRightClick:f,onClick:R,footer:g,layout:m,grid:p,size:C,split:b,loadMore:y,bordered:$,dataSource:u,renderItem:c,children:v}=s,j=Y(s,["style","className","header","loading","onRightClick","onClick","footer","layout","grid","size","split","loadMore","bordered","dataSource","renderItem","children"]),x=L(E,e,{[`${E}-flex`]:m==="horizontal",[`${E}-${C}`]:C,[`${E}-grid`]:p,[`${E}-split`]:b,[`${E}-bordered`]:$});let d;if(u&&u.length){d=[];const h=c?u.map((l,N)=>c(l,N)):[];a.Children.forEach(h,(l,N)=>{const P=l.key||`list-item-${N}`;d.push(a.cloneElement(l,{key:P}))})}else!v&&!i&&(d=this.renderEmpty());return a.createElement("div",Object.assign({className:x,style:r},this.getDataAttr(j)),n?a.createElement("div",{className:`${I.PREFIX}-header`,"x-semi-prop":"header"},n):null,a.createElement(z.Provider,{value:{grid:p,onRightClick:f,onClick:R}},a.createElement(W,{spinning:i,size:"large"},this.wrapChildren(d,v))),g?a.createElement("div",{className:`${I.PREFIX}-footer`,"x-semi-prop":"footer"},g):null,y||null)}}M.Item=w;M.propTypes={style:o.object,className:o.string,bordered:o.bool,footer:o.node,header:o.node,layout:o.oneOf(S.LAYOUT),size:o.oneOf(S.SIZE),split:o.bool,emptyContent:o.node,dataSource:o.array,renderItem:o.func,grid:o.object,loading:o.bool,loadMore:o.node,onRightClick:o.func,onClick:o.func};M.defaultProps={bordered:!1,split:!0,loading:!1,layout:"vertical",size:"default",onRightClick:_,onClick:_};function Z(t){var s=t.swr,r=t.swr,e=r.setSize,n=r.data,i=r.isValidating,f=t.children,R=t.loadingIndicator,g=t.endingIndicator,m=t.isReachingEnd,p=t.offset,C=p===void 0?0:p,b=function(){var c=k.useState(!1),v=c[0],j=c[1],x=k.useState(),d=x[0],h=x[1];return k.useEffect(function(){if(d){var l=new IntersectionObserver(function(N){var P;j((P=N[0])===null||P===void 0?void 0:P.isIntersecting)});return l.observe(d),function(){return l.unobserve(d)}}},[d]),[v,function(l){return l&&h(l)}]}(),y=b[0],$=b[1],u=typeof m=="function"?m(s):m;return k.useEffect(function(){!y||i||u||e(function(c){return c+1})},[y,i,e,u]),a.createElement(a.Fragment,null,typeof f=="function"?n==null?void 0:n.map(function(c){return f(c)}):f,a.createElement("div",{style:{position:"relative"}},a.createElement("div",{ref:$,style:{position:"absolute",top:C}}),u?g:R))}function J({data:t,children:s}){var e,n;const r=(n=(e=t.data)==null?void 0:e[t.data.length-1])==null?void 0:n.page_info.has_next_page;return B.jsx(Z,{swr:t,isReachingEnd:r===!1,offset:-300,children:i=>i&&s(i.items)})}export{M as L,J as a};
