function getBase64(img,url) {
  function getBase64Image(img, width, height) { //width、height调用时传入具体像素值，控制大小 ,不传则默认图像大小
    var canvas = document.createElement("canvas");
    canvas.width = width ? width : img.width;
    canvas.height = height ? height : img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    var dataURL = canvas.toDataURL();
    return dataURL;
  }
  var image = new Image();
  image.crossOrigin = '';
  image.src = img;
  var deferred = $.Deferred();
  if (img) {
    image.onload = function () {
        deferred.resolve({"url":url,"base64":getBase64Image(image)}); //将base64传给done上传处理
    }
    
   return deferred.promise(); //问题要让onload完成后再return sessionStorage['imgTest']
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender,callback){
    function aw(request,callback){
      var arr = []
      var num = request.length
      for (url of request){
        var rurl = ''
        if(url.indexOf("http")===-1){
          rurl = "http:"+url
        }else{
          rurl = url
        }
        getBase64(rurl,url).then(function (res) {
          arr.push(res)
          if(arr.length===num){
            callback(arr)
          }
        })
      }
    }
    if(request.length===0){
      callback({datas:[],url:sender.tab.url,title:sender.tab.title})
    }
    aw(request,function(data){
      callback({datas:data,url:sender.tab.url,title:sender.tab.title})
    })    
    return true;
  }
);

chrome.contextMenus.create({
  title: "清除广告",
  onclick: function(e,tab){
    chrome.tabs.sendMessage(tab.id, {type: 'removeAD'});
  }
});

chrome.contextMenus.create({
  title: "选择内容",
  onclick: function(e,tab){
    chrome.tabs.sendMessage(tab.id, {type: 'select'});
  }
});
chrome.contextMenus.create({
  type: 'separator',
  contexts: ['all']
});
chrome.contextMenus.create({
  title: "导出到markdown（base64图片）",
  onclick: function(e,tab){
    chrome.tabs.sendMessage(tab.id, {type: 'saveMarkdown',imageType:'base64',title:tab.title,url:tab.url});
  }
});
chrome.contextMenus.create({
  title: "导出到markdown（源图片地址）",
  onclick: function(e,tab){
    chrome.tabs.sendMessage(tab.id, {type: 'saveMarkdown',imageType:'source',title:tab.title,url:tab.url});
  }
});
chrome.contextMenus.create({
  type: 'separator',
  contexts: ['all']
});
chrome.contextMenus.create({
  title: "导出到图片",
  onclick: function(e,tab){
    console.log(tab)
    chrome.tabs.sendMessage(tab.id, {type: 'saveImage',title:tab.title});
  }
});