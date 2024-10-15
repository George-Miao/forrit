import{n as b}from"./jsx-runtime-BVzQf6E0.js";import{B as R,r as _,a as P,P as r}from"./width_limit-CngMnDB3.js";const v={PREFIX:`${R}`};var N=function(o,t){var n={};for(var e in o)Object.prototype.hasOwnProperty.call(o,e)&&t.indexOf(e)<0&&(n[e]=o[e]);if(o!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,e=Object.getOwnPropertySymbols(o);s<e.length;s++)t.indexOf(e[s])<0&&Object.prototype.propertyIsEnumerable.call(o,e[s])&&(n[e[s]]=o[e[s]]);return n};const w=["xxl","xl","lg","md","sm","xs"],E=b.createContext(null),C={xs:"(max-width: 575px)",sm:"(min-width: 576px)",md:"(min-width: 768px)",lg:"(min-width: 992px)",xl:"(min-width: 1200px)",xxl:"(min-width: 1600px)"};class $ extends b.Component{constructor(){super(...arguments),this.state={screens:{xs:!0,sm:!0,md:!0,lg:!0,xl:!0,xxl:!0}},this.unRegisters=[]}componentDidMount(){this.unRegisters=Object.keys(C).map(t=>_(C[t],{match:()=>{typeof this.props.gutter=="object"&&this.setState(n=>({screens:Object.assign(Object.assign({},n.screens),{[t]:!0})}))},unmatch:()=>{typeof this.props.gutter=="object"&&this.setState(n=>({screens:Object.assign(Object.assign({},n.screens),{[t]:!1})}))}}))}componentWillUnmount(){this.unRegisters.forEach(t=>t())}getGutter(){const{gutter:t=0}=this.props,n=[0,0];return(Array.isArray(t)?t.slice(0,2):[t,0]).forEach((s,c)=>{if(typeof s=="object")for(let u=0;u<w.length;u++){const f=w[u];if(this.state.screens[f]&&s[f]!==void 0){n[c]=s[f];break}}else n[c]=s||0}),n}render(){const t=this.props,{prefixCls:n,type:e,justify:s,align:c,className:u,style:f,children:x}=t,y=N(t,["prefixCls","type","justify","align","className","style","children"]),i=this.getGutter(),d=`${n}-row`,a=P({[d]:e!=="flex",[`${d}-${e}`]:e,[`${d}-${e}-${s}`]:e&&s,[`${d}-${e}-${c}`]:e&&c},u),O=Object.assign(Object.assign(Object.assign({},i[0]>0?{marginLeft:i[0]/-2,marginRight:i[0]/-2}:{}),i[1]>0?{marginTop:i[1]/-2,marginBottom:i[1]/-2}:{}),f),g=Object.assign({},y);return delete g.gutter,b.createElement(E.Provider,{value:{gutters:i}},b.createElement("div",Object.assign({},g,{className:a,style:O,"x-semi-prop":"children"}),x))}}$.propTypes={type:r.oneOf(["flex"]),align:r.oneOf(["top","middle","bottom"]),justify:r.oneOf(["start","end","center","space-around","space-between"]),className:r.string,style:r.object,children:r.node,gutter:r.oneOfType([r.object,r.number,r.array]),prefixCls:r.string};$.defaultProps={prefixCls:v.PREFIX};$.RowContext={gutters:r.any};var S=function(o,t){var n={};for(var e in o)Object.prototype.hasOwnProperty.call(o,e)&&t.indexOf(e)<0&&(n[e]=o[e]);if(o!=null&&typeof Object.getOwnPropertySymbols=="function")for(var s=0,e=Object.getOwnPropertySymbols(o);s<e.length;s++)t.indexOf(e[s])<0&&Object.prototype.propertyIsEnumerable.call(o,e[s])&&(n[e[s]]=o[e[s]]);return n};const h=r.oneOfType([r.object,r.number]);class j extends b.Component{render(){const{props:t}=this,{prefixCls:n,span:e,order:s,offset:c,push:u,pull:f,className:x,children:y}=t,i=S(t,["prefixCls","span","order","offset","push","pull","className","children"]);let d={};const a=`${n}-col`;["xs","sm","md","lg","xl","xxl"].forEach(p=>{let l={};typeof t[p]=="number"?l.span=t[p]:typeof t[p]=="object"&&(l=t[p]||{}),delete i[p],d=Object.assign(Object.assign({},d),{[`${a}-${p}-${l.span}`]:l.span!==void 0,[`${a}-${p}-order-${l.order}`]:l.order||l.order===0,[`${a}-${p}-offset-${l.offset}`]:l.offset||l.offset===0,[`${a}-${p}-push-${l.push}`]:l.push||l.push===0,[`${a}-${p}-pull-${l.pull}`]:l.pull||l.pull===0})});const O=P(a,{[`${a}-${e}`]:e!==void 0,[`${a}-order-${s}`]:s,[`${a}-offset-${c}`]:c,[`${a}-push-${u}`]:u,[`${a}-pull-${f}`]:f},x,d);let{style:g}=i,m;try{m=this.context.gutters}catch{throw new Error("please make sure <Col> inside <Row>")}return g=Object.assign(Object.assign(Object.assign({},m[0]>0?{paddingLeft:m[0]/2,paddingRight:m[0]/2}:{}),m[1]>0?{paddingTop:m[1]/2,paddingBottom:m[1]/2}:{}),g),b.createElement("div",Object.assign({},i,{style:g,className:O,"x-semi-prop":"children"}),y)}}j.contextType=E;j.propTypes={span:r.number,order:r.number,offset:r.number,push:r.number,pull:r.number,className:r.string,children:r.node,xs:h,sm:h,md:h,lg:h,xl:h,xxl:h,prefixCls:r.string};j.defaultProps={prefixCls:v.PREFIX};export{j as C,$ as R};
