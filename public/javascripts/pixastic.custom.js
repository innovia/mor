/*
 * Pixastic - JavaScript Image Processing Library
 * Copyright (c) 2008 Jacob Seidelin, jseidelin@nihilogic.dk, http://blog.nihilogic.dk/
 * MIT License [http://www.pixastic.com/lib/license.txt]
 */


var Pixastic=(function(){function addEvent(el,event,handler){if(el.addEventListener)
el.addEventListener(event,handler,false);else if(el.attachEvent)
el.attachEvent("on"+event,handler);}
function onready(handler){var handlerDone=false;var execHandler=function(){if(!handlerDone){handlerDone=true;handler();}}
document.write("<"+"script defer src=\"//:\" id=\"__onload_ie_sumbox__\"></"+"script>");var script=document.getElementById("__onload_ie_sumbox__");script.onreadystatechange=function(){if(script.readyState=="complete"){script.parentNode.removeChild(script);execHandler();}}
if(document.addEventListener)
document.addEventListener("DOMContentLoaded",execHandler,false);addEvent(window,"load",execHandler);}
function init(){var imgEls=getElementsByClass("pixastic",null,"img");var canvasEls=getElementsByClass("pixastic",null,"canvas");var elements=imgEls.concat(canvasEls);for(var i=0;i<elements.length;i++){(function(){var el=elements[i];var actions=[];var classes=el.className.split(" ");for(var c=0;c<classes.length;c++){var cls=classes[c];if(cls.substring(0,9)=="pixastic-"){var actionName=cls.substring(9);if(actionName!="")
actions.push(actionName);}}
if(actions.length){if(el.tagName.toLowerCase()=="img"){var dataImg=new Image();dataImg.src=el.src;if(dataImg.complete){for(var a=0;a<actions.length;a++){var res=Pixastic.applyAction(el,el,actions[a],null);if(res)
el=res;}}else{dataImg.onload=function(){for(var a=0;a<actions.length;a++){var res=Pixastic.applyAction(el,el,actions[a],null)
if(res)
el=res;}}}}else{setTimeout(function(){for(var a=0;a<actions.length;a++){var res=Pixastic.applyAction(el,el,actions[a],null);if(res)
el=res;}},1);}}})();}}
if(typeof pixastic_parseonload!="undefined"&&pixastic_parseonload)
onready(init);function getElementsByClass(searchClass,node,tag){var classElements=new Array();if(node==null)
node=document;if(tag==null)
tag='*';var els=node.getElementsByTagName(tag);var elsLen=els.length;var pattern=new RegExp("(^|\\s)"+searchClass+"(\\s|$)");for(i=0,j=0;i<elsLen;i++){if(pattern.test(els[i].className)){classElements[j]=els[i];j++;}}
return classElements;}
var debugElement;function writeDebug(text,level){if(!Pixastic.debug)return;try{switch(level){case"warn":console.warn("Pixastic:",text);break;case"error":console.error("Pixastic:",text);break;default:console.log("Pixastic:",text);}}catch(e){}
if(!debugElement){}}
return{parseOnLoad:false,debug:false,applyAction:function(img,dataImg,actionName,options){options=options||{};var imageIsCanvas=(img.tagName.toLowerCase()=="canvas");if(imageIsCanvas&&Pixastic.Client.isIE()){if(Pixastic.debug)writeDebug("Tried to process a canvas element but browser is IE.");return false;}
var canvas,ctx;if(Pixastic.Client.hasCanvas()){canvas=document.createElement("canvas");ctx=canvas.getContext("2d");}
var w=parseInt(img.offsetWidth);var h=parseInt(img.offsetHeight);if(imageIsCanvas){w=img.width;h=img.height;}
if(actionName.indexOf("(")>-1){var tmp=actionName;actionName=tmp.substr(0,tmp.indexOf("("));var arg=tmp.match(/\((.*?)\)/);if(arg[1]){arg=arg[1].split(";");for(var a=0;a<arg.length;a++){thisArg=arg[a].split("=");if(thisArg.length==2){if(thisArg[0]=="rect"){var rectVal=thisArg[1].split(",");options[thisArg[0]]={left:parseInt(rectVal[0],10)||0,top:parseInt(rectVal[1],10)||0,width:parseInt(rectVal[2],10)||0,height:parseInt(rectVal[3],10)||0}}else{options[thisArg[0]]=thisArg[1];}}}}}
if(!options.rect){options.rect={left:0,top:0,width:w,height:h};}
var validAction=false;if(Pixastic.Actions[actionName]&&typeof Pixastic.Actions[actionName].process=="function"){validAction=true;}
if(!validAction){if(Pixastic.debug)writeDebug("Invalid action \""+actionName+"\". Maybe file not included?");return false;}
if(!Pixastic.Actions[actionName].checkSupport()){if(Pixastic.debug)writeDebug("Action \""+actionName+"\" not supported by this browser.");return false;}
if(Pixastic.Client.hasCanvas()){canvas.width=w;canvas.height=h;canvas.style.width=w+"px";canvas.style.height=h+"px";ctx.drawImage(dataImg,0,0,w,h);if(!img.__pixastic_org_image){canvas.__pixastic_org_image=img;canvas.__pixastic_org_width=w;canvas.__pixastic_org_height=h;}else{canvas.__pixastic_org_image=img.__pixastic_org_image;canvas.__pixastic_org_width=img.__pixastic_org_width;canvas.__pixastic_org_height=img.__pixastic_org_height;}}else if(Pixastic.Client.isIE()&&typeof img.__pixastic_org_style=="undefined"){img.__pixastic_org_style=img.style.cssText;}
var params={image:img,canvas:canvas,width:w,height:h,useData:true,options:options}
var res=Pixastic.Actions[actionName].process(params);if(!res){return false;}
if(Pixastic.Client.hasCanvas()){if(params.useData){if(Pixastic.Client.hasCanvasImageData()){canvas.getContext("2d").putImageData(params.canvasData,options.rect.left,options.rect.top);canvas.getContext("2d").fillRect(0,0,0,0);}}
if(!options.leaveDOM){canvas.title=img.title;canvas.imgsrc=img.imgsrc;if(!imageIsCanvas)canvas.alt=img.alt;if(!imageIsCanvas)canvas.imgsrc=img.src;canvas.className=img.className;canvas.style.cssText=img.style.cssText;canvas.name=img.name;canvas.tabIndex=img.tabIndex;canvas.id=img.id;if(img.parentNode&&img.parentNode.replaceChild){img.parentNode.replaceChild(canvas,img);}}
options.resultCanvas=canvas;return canvas;}
return img;},prepareData:function(params,getCopy){var ctx=params.canvas.getContext("2d");var rect=params.options.rect;var dataDesc=ctx.getImageData(rect.left,rect.top,rect.width,rect.height);var data=dataDesc.data;if(!getCopy)params.canvasData=dataDesc;return data;},process:function(img,actionName,options,callback)
{if(img.tagName.toLowerCase()=="img"){var dataImg=new Image();dataImg.src=img.src;if(dataImg.complete){var res=Pixastic.applyAction(img,dataImg,actionName,options);if(callback)callback(res);return res;}else{dataImg.onload=function(){var res=Pixastic.applyAction(img,dataImg,actionName,options)
if(callback)callback(res);}}}
if(img.tagName.toLowerCase()=="canvas"){var res=Pixastic.applyAction(img,img,actionName,options);if(callback)callback(res);return res;}},revert:function(img){if(Pixastic.Client.hasCanvas()){if(img.tagName.toLowerCase()=="canvas"&&img.__pixastic_org_image){img.width=img.__pixastic_org_width;img.height=img.__pixastic_org_height;img.getContext("2d").drawImage(img.__pixastic_org_image,0,0);if(img.parentNode&&img.parentNode.replaceChild){img.parentNode.replaceChild(img.__pixastic_org_image,img);}
return img;}}else if(Pixastic.Client.isIE()&&typeof img.__pixastic_org_style!="undefined"){img.style.cssText=img.__pixastic_org_style;}},Client:{hasCanvas:(function(){var c=document.createElement("canvas");var val=false;try{val=!!((typeof c.getContext=="function")&&c.getContext("2d"));}catch(e){}
return function(){return val;}})(),hasCanvasImageData:(function(){var c=document.createElement("canvas");var val=false;var ctx;try{if(typeof c.getContext=="function"&&(ctx=c.getContext("2d"))){val=(typeof ctx.getImageData=="function");}}catch(e){}
return function(){return val;}})(),isIE:function(){return!!document.all&&!!window.attachEvent&&!window.opera;}},Actions:{}}})();Pixastic.Actions.brightness={process:function(params){var brightness=parseInt(params.options.brightness,10)||0;var contrast=parseFloat(params.options.contrast)||0;var legacy=!!(params.options.legacy&&params.options.legacy!="false");if(legacy){brightness=Math.min(150,Math.max(-150,brightness));}else{var brightMul=1+Math.min(150,Math.max(-150,brightness))/150;}
contrast=Math.max(0,contrast+1);if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);var rect=params.options.rect;var w=rect.width;var h=rect.height;var p=w*h;var pix=p*4,pix1,pix2;var mul,add;if(contrast!=1){if(legacy){mul=contrast;add=(brightness-128)*contrast+128;}else{mul=brightMul*contrast;add=-contrast*128+128;}}else{if(legacy){mul=1;add=brightness;}else{mul=brightMul;add=0;}}
var r,g,b;while(p--){if((r=data[pix-=4]*mul+add)>255)
data[pix]=255;else if(r<0)
data[pix]=0;else
data[pix]=r;if((g=data[pix1=pix+1]*mul+add)>255)
data[pix1]=255;else if(g<0)
data[pix1]=0;else
data[pix1]=g;if((b=data[pix2=pix+2]*mul+add)>255)
data[pix2]=255;else if(b<0)
data[pix2]=0;else
data[pix2]=b;}
return true;}},checkSupport:function(){return Pixastic.Client.hasCanvasImageData();}}
Pixastic.Actions.coloradjust={process:function(params){var red=parseFloat(params.options.red)||0;var green=parseFloat(params.options.green)||0;var blue=parseFloat(params.options.blue)||0;red=Math.round(red*255);green=Math.round(green*255);blue=Math.round(blue*255);if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);var rect=params.options.rect;var p=rect.width*rect.height;var pix=p*4,pix1,pix2;var r,g,b;while(p--){pix-=4;if(red){if((r=data[pix]+red)<0)
data[pix]=0;else if(r>255)
data[pix]=255;else
data[pix]=r;}
if(green){if((g=data[pix1=pix+1]+green)<0)
data[pix1]=0;else if(g>255)
data[pix1]=255;else
data[pix1]=g;}
if(blue){if((b=data[pix2=pix+2]+blue)<0)
data[pix2]=0;else if(b>255)
data[pix2]=255;else
data[pix2]=b;}}
return true;}},checkSupport:function(){return(Pixastic.Client.hasCanvasImageData());}}
Pixastic.Actions.crop={process:function(params){if(Pixastic.Client.hasCanvas()){var rect=params.options.rect;var width=rect.width;var height=rect.height;var top=rect.top;var left=rect.left;if(typeof params.options.left!="undefined")
left=parseInt(params.options.left,10);if(typeof params.options.top!="undefined")
top=parseInt(params.options.top,10);if(typeof params.options.height!="undefined")
width=parseInt(params.options.width,10);if(typeof params.options.height!="undefined")
height=parseInt(params.options.height,10);if(left<0)left=0;if(left>params.width-1)left=params.width-1;if(top<0)top=0;if(top>params.height-1)top=params.height-1;if(width<1)width=1;if(left+width>params.width)
width=params.width-left;if(height<1)height=1;if(top+height>params.height)
height=params.height-top;var copy=document.createElement("canvas");copy.width=params.width;copy.height=params.height;copy.getContext("2d").drawImage(params.canvas,0,0);params.canvas.width=width;params.canvas.height=height;params.canvas.getContext("2d").clearRect(0,0,width,height);params.canvas.getContext("2d").drawImage(copy,left,top,width,height,0,0,width,height);params.useData=false;return true;}},checkSupport:function(){return Pixastic.Client.hasCanvas();}}
Pixastic.Actions.desaturate={process:function(params){var useAverage=!!(params.options.average&&params.options.average!="false");if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);var rect=params.options.rect;var w=rect.width;var h=rect.height;var p=w*h;var pix=p*4,pix1,pix2;if(useAverage){while(p--)
data[pix-=4]=data[pix1=pix+1]=data[pix2=pix+2]=(data[pix]+data[pix1]+data[pix2])/3}else{while(p--)
data[pix-=4]=data[pix1=pix+1]=data[pix2=pix+2]=(data[pix]*0.3+data[pix1]*0.59+data[pix2]*0.11);}
return true;}else if(Pixastic.Client.isIE()){params.image.style.filter+=" gray";return true;}},checkSupport:function(){return(Pixastic.Client.hasCanvasImageData()||Pixastic.Client.isIE());}}
Pixastic.Actions.flip={process:function(params){var rect=params.options.rect;var copyCanvas=document.createElement("canvas");copyCanvas.width=rect.width;copyCanvas.height=rect.height;copyCanvas.getContext("2d").drawImage(params.image,rect.left,rect.top,rect.width,rect.height,0,0,rect.width,rect.height);var ctx=params.canvas.getContext("2d");ctx.clearRect(rect.left,rect.top,rect.width,rect.height);if(params.options.axis=="horizontal"){ctx.scale(-1,1);ctx.drawImage(copyCanvas,-rect.left-rect.width,rect.top,rect.width,rect.height)}else{ctx.scale(1,-1);ctx.drawImage(copyCanvas,rect.left,-rect.top-rect.height,rect.width,rect.height)}
params.useData=false;return true;},checkSupport:function(){return Pixastic.Client.hasCanvas();}}
Pixastic.Actions.fliph={process:function(params){if(Pixastic.Client.hasCanvas()){var rect=params.options.rect;var copyCanvas=document.createElement("canvas");copyCanvas.width=rect.width;copyCanvas.height=rect.height;copyCanvas.getContext("2d").drawImage(params.image,rect.left,rect.top,rect.width,rect.height,0,0,rect.width,rect.height);var ctx=params.canvas.getContext("2d");ctx.clearRect(rect.left,rect.top,rect.width,rect.height);ctx.scale(-1,1);ctx.drawImage(copyCanvas,-rect.left-rect.width,rect.top,rect.width,rect.height)
params.useData=false;return true;}else if(Pixastic.Client.isIE()){params.image.style.filter+=" fliph";return true;}},checkSupport:function(){return(Pixastic.Client.hasCanvas()||Pixastic.Client.isIE());}}
Pixastic.Actions.flipv={process:function(params){if(Pixastic.Client.hasCanvas()){var rect=params.options.rect;var copyCanvas=document.createElement("canvas");copyCanvas.width=rect.width;copyCanvas.height=rect.height;copyCanvas.getContext("2d").drawImage(params.image,rect.left,rect.top,rect.width,rect.height,0,0,rect.width,rect.height);var ctx=params.canvas.getContext("2d");ctx.clearRect(rect.left,rect.top,rect.width,rect.height);ctx.scale(1,-1);ctx.drawImage(copyCanvas,rect.left,-rect.top-rect.height,rect.width,rect.height)
params.useData=false;return true;}else if(Pixastic.Client.isIE()){params.image.style.filter+=" flipv";return true;}},checkSupport:function(){return(Pixastic.Client.hasCanvas()||Pixastic.Client.isIE());}}
Pixastic.Actions.glow={process:function(params){var amount=(parseFloat(params.options.amount)||0);var blurAmount=parseFloat(params.options.radius)||0;amount=Math.min(1,Math.max(0,amount));blurAmount=Math.min(5,Math.max(0,blurAmount));if(Pixastic.Client.hasCanvasImageData()){var rect=params.options.rect;var blurCanvas=document.createElement("canvas");blurCanvas.width=params.width;blurCanvas.height=params.height;var blurCtx=blurCanvas.getContext("2d");blurCtx.drawImage(params.canvas,0,0);var scale=2;var smallWidth=Math.round(params.width/scale);var smallHeight=Math.round(params.height/scale);var copy=document.createElement("canvas");copy.width=smallWidth;copy.height=smallHeight;var clear=true;var steps=Math.round(blurAmount*20);var copyCtx=copy.getContext("2d");for(var i=0;i<steps;i++){var scaledWidth=Math.max(1,Math.round(smallWidth-i));var scaledHeight=Math.max(1,Math.round(smallHeight-i));copyCtx.clearRect(0,0,smallWidth,smallHeight);copyCtx.drawImage(blurCanvas,0,0,params.width,params.height,0,0,scaledWidth,scaledHeight);blurCtx.clearRect(0,0,params.width,params.height);blurCtx.drawImage(copy,0,0,scaledWidth,scaledHeight,0,0,params.width,params.height);}
var data=Pixastic.prepareData(params);var blurData=Pixastic.prepareData({canvas:blurCanvas,options:params.options});var w=rect.width;var h=rect.height;var w4=w*4;var y=h;do{var offsetY=(y-1)*w4;var x=w;do{var offset=offsetY+(x*4-4);var r=data[offset]+amount*blurData[offset];var g=data[offset+1]+amount*blurData[offset+1];var b=data[offset+2]+amount*blurData[offset+2];if(r>255)r=255;if(g>255)g=255;if(b>255)b=255;if(r<0)r=0;if(g<0)g=0;if(b<0)b=0;data[offset]=r;data[offset+1]=g;data[offset+2]=b;}while(--x);}while(--y);return true;}},checkSupport:function(){return Pixastic.Client.hasCanvasImageData();}}
Pixastic.Actions.lighten={process:function(params){var amount=parseFloat(params.options.amount)||0;if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);var rect=params.options.rect;var w=rect.width;var h=rect.height;var w4=w*4;var y=h;do{var offsetY=(y-1)*w4;var x=w;do{var offset=offsetY+(x-1)*4;var r=data[offset];var g=data[offset+1];var b=data[offset+2];r+=r*amount;g+=g*amount;b+=b*amount;if(r<0)r=0;if(g<0)g=0;if(b<0)b=0;if(r>255)r=255;if(g>255)g=255;if(b>255)b=255;data[offset]=r;data[offset+1]=g;data[offset+2]=b;}while(--x);}while(--y);return true;}else if(Pixastic.Client.isIE()){var img=params.image;if(amount<0){img.style.filter+=" light()";img.filters[img.filters.length-1].addAmbient(255,255,255,100*-amount);}else if(amount>0){img.style.filter+=" light()";img.filters[img.filters.length-1].addAmbient(255,255,255,100);img.filters[img.filters.length-1].addAmbient(255,255,255,100*amount);}
return true;}},checkSupport:function(){return(Pixastic.Client.hasCanvasImageData()||Pixastic.Client.isIE());}}
Pixastic.Actions.mosaic={process:function(params){var blockSize=Math.max(1,parseInt(params.options.blockSize,10));if(Pixastic.Client.hasCanvasImageData()){var rect=params.options.rect;var w=rect.width;var h=rect.height;var w4=w*4;var y=h;var ctx=params.canvas.getContext("2d");var pixel=document.createElement("canvas");pixel.width=pixel.height=1;var pixelCtx=pixel.getContext("2d");var copy=document.createElement("canvas");copy.width=w;copy.height=h;var copyCtx=copy.getContext("2d");copyCtx.drawImage(params.canvas,rect.left,rect.top,w,h,0,0,w,h);for(var y=0;y<h;y+=blockSize){for(var x=0;x<w;x+=blockSize){var blockSizeX=blockSize;var blockSizeY=blockSize;if(blockSizeX+x>w)
blockSizeX=w-x;if(blockSizeY+y>h)
blockSizeY=h-y;pixelCtx.drawImage(copy,x,y,blockSizeX,blockSizeY,0,0,1,1);var data=pixelCtx.getImageData(0,0,1,1).data;ctx.fillStyle="rgb("+data[0]+","+data[1]+","+data[2]+")";ctx.fillRect(rect.left+x,rect.top+y,blockSize,blockSize);}}
params.useData=false;return true;}},checkSupport:function(){return(Pixastic.Client.hasCanvasImageData());}}
Pixastic.Actions.resize={process:function(params){if(Pixastic.Client.hasCanvas()){var width=parseInt(params.options.width,10);var height=parseInt(params.options.height,10);var canvas=params.canvas;if(width<1)width=1;if(width<2)width=2;var copy=document.createElement("canvas");copy.width=width;copy.height=height;copy.getContext("2d").drawImage(canvas,0,0,width,height);canvas.width=width;canvas.height=height;canvas.getContext("2d").drawImage(copy,0,0);params.useData=false;return true;}},checkSupport:function(){return Pixastic.Client.hasCanvas();}}
Pixastic.Actions.rotate={process:function(params){if(Pixastic.Client.hasCanvas()){var canvas=params.canvas;var width=params.width;var height=params.height;var copy=document.createElement("canvas");copy.width=width;copy.height=height;copy.getContext("2d").drawImage(canvas,0,0,width,height);var angle=-parseFloat(params.options.angle)*Math.PI/180;var dimAngle=angle;if(dimAngle>Math.PI*0.5)
dimAngle=Math.PI-dimAngle;if(dimAngle<-Math.PI*0.5)
dimAngle=-Math.PI-dimAngle;var diag=Math.sqrt(width*width+height*height);var diagAngle1=Math.abs(dimAngle)-Math.abs(Math.atan2(height,width));var diagAngle2=Math.abs(dimAngle)+Math.abs(Math.atan2(height,width));var newWidth=Math.abs(Math.cos(diagAngle1)*diag);var newHeight=Math.abs(Math.sin(diagAngle2)*diag);canvas.width=newWidth;canvas.height=newHeight;var ctx=canvas.getContext("2d");ctx.translate(newWidth/2,newHeight/2);ctx.rotate(angle);ctx.drawImage(copy,-width/2,-height/2);params.useData=false;return true;}},checkSupport:function(){return Pixastic.Client.hasCanvas();}}
Pixastic.Actions.sepia={process:function(params){var mode=(parseInt(params.options.mode,10)||0);if(mode<0)mode=0;if(mode>1)mode=1;if(Pixastic.Client.hasCanvasImageData()){var data=Pixastic.prepareData(params);var rect=params.options.rect;var w=rect.width;var h=rect.height;var w4=w*4;var y=h;do{var offsetY=(y-1)*w4;var x=w;do{var offset=offsetY+(x-1)*4;if(mode){var d=data[offset]*0.299+data[offset+1]*0.587+data[offset+2]*0.114;var r=(d+39);var g=(d+14);var b=(d-36);}else{var or=data[offset];var og=data[offset+1];var ob=data[offset+2];var r=(or*0.393+og*0.769+ob*0.189);var g=(or*0.349+og*0.686+ob*0.168);var b=(or*0.272+og*0.534+ob*0.131);}
if(r<0)r=0;if(r>255)r=255;if(g<0)g=0;if(g>255)g=255;if(b<0)b=0;if(b>255)b=255;data[offset]=r;data[offset+1]=g;data[offset+2]=b;}while(--x);}while(--y);return true;}},checkSupport:function(){return Pixastic.Client.hasCanvasImageData();}}