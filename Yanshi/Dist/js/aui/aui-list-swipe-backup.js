!function(e){"use strict";var t,n,i,a,s,r,o=1,u=!1,c=!1,l=!1,d=!1,f=function(e){this._init(e)};f.prototype={_init:function(s){var r=this;e.addEventListener("touchstart",function(e){if(d)return console.log(1),void(d=!1);if(u)return e.preventDefault(),r.setTranslate(u,"0px"),u.classList.remove("aui-swipe-opened"),void(u=!1);l=!1,u=!1;for(var o=e.target;o&&o!==document;o=o.parentNode)if(o.classList&&o.classList.contains("aui-swipe-handle")){if(u=o,i=e.changedTouches[0],t=i.clientX,n=i.clientY,a=e.timeStamp,u.className.indexOf("aui-swipe-opened")>-1)return void e.preventDefault();r.toggleEvents(u,s)}}),e.addEventListener("touchmove",function(){})},toggleEvents:function(e,i){if(u){var f=this;f.setTransform(e,300),e.addEventListener("touchstart",function(t){e.parentNode.style.backgroundColor="#ffffff",!e.nextSibling},!1),e.addEventListener("touchmove",function(i){if(document.querySelector(".aui-swipe-opened")&&(i.preventDefault(),u!=document.querySelector(".aui-swipe-opened")))return f.setTranslate(document.querySelector(".aui-swipe-opened"),"0px"),document.querySelector(".aui-swipe-opened").classList.remove("aui-swipe-opened"),d=!1,void i.stopPropagation();f.setTransform(e,0),e.parentNode.querySelector(".aui-swipe-btn")&&(c=e.parentNode.querySelector(".aui-swipe-btn").offsetWidth);var p=i.changedTouches[0],v=p.clientX;s=-Math.pow(t-v,.85),r=s/o;var h=p.clientX-t,m=p.clientY-n,g=f.getDirection(h,m),w=f.getAngle(Math.abs(h),Math.abs(m));if("right"==g&&(l=!1,i.preventDefault()),"top"==g||"down"==g)return void(l=!1);if(w<=15&&"left"===g&&(i.preventDefault(),l=!0),i.timeStamp-a>=100&&s<0&&p.screenX>0&&l){if(!(e.className.indexOf("aui-swipe-opened")<=-1))return;r+10>-c&&f.setTranslate(e,""+(r+10)+"px")}},!1),e.addEventListener("touchend",function(a){f.setTransform(e,300);var s=a.changedTouches[0],o=({x:s.clientX||0,y:s.clientY||0},s.clientX-t),u=s.clientY-n,p=f.getDirection(o,u);"left"==p&&r<-c/3&&l?(f.setTranslate(e,""+-c+"px"),e.classList.add("aui-swipe-opened"),i({status:!0,dom:e}),d=!0):(e.classList.remove("aui-swipe-opened"),f.setTranslate(e,"0px"),d=!1),console.log(d)},!0)}},setTransform:function(e,t){e.style.webkitTransitionDuration=e.style.transitionDuration=t+"ms"},setTranslate:function(e,t){e&&(e.style.webkitTransform=e.style.transform="translate3d("+t+",0,0)")},getDistance:function(e,t,n){n||(n=["x","y"]);var i=t[n[0]]-e[n[0]],a=t[n[1]]-e[n[1]];return Math.sqrt(i*i+a*a)},getAngle:function(e,t){var n=Math.sqrt(e*e+t*t);return Math.round(Math.asin(t/n)/Math.PI*180)},getDirection:function(e,t){return e===t?"":Math.abs(e)>=Math.abs(t)?e>0?"right":"left":t>0?"down":"up"}},e.auiListSwipe=f}(window);
//# sourceMappingURL=aui-list-swipe-backup.js.map
