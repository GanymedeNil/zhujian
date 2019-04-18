//  点击事件
var clickType = ''
// 当前选中节点
var selectedNode=null

// 保存内容节点
var saveNode = null

function boundHandleRequest(data) {
  clickType = data.type
  if(clickType === 'select' || clickType === 'removeAD'){

    if (clickType === 'select') {
      new Notify().Render( chrome.i18n.getMessage("extMsgSelect") );
    }
    if (clickType === 'removeAD') {
      new Notify().Render( chrome.i18n.getMessage("extMsgRemoveAD") );
    }
    listenerEvent()
}
if(clickType==='saveMarkdown'){
  datas={
    title:data.title,
    url:data.url
  }
  saveMarkdown(data.imageType,datas)
}
if(clickType==='saveImage'){
  saveImage(data.title)
}
  
}

function listenerEvent() {
  document.addEventListener("mouseover", inspectorMouseOver, true);
  document.addEventListener("mouseout", inspectorMouseOut, true);
  document.addEventListener("click", inspectorOnClick, true);
}

function inspectorMouseOver(e) {
  //NB: this doesn't work in IE (needs fix):
  selectedNode = e
  var element = e.target;

  //Set outline:
  if (clickType === 'select') {
    element.style.outline = '2px solid #00FF00';
  }
  if (clickType === 'removeAD') {
    element.style.outline = '2px solid #ff0000';
  }

  //Set last selected element so it can be 'deselected' on cancel.
  last = element;
}

function inspectorMouseOut(e) {
  // Remove outline from element:
  e.target.style.outline = '';

 
}

function inspectorOnClick(e) {
  e.preventDefault();
  selectedNode = e
  if(clickType ==='select'){
    saveNode = e
    new Notify().Render( chrome.i18n.getMessage("extMsgSelectNoOut"));
    removeEvent(false)
  }
  if (clickType === 'removeAD') {
    $(e.srcElement).remove()
  }

}

function saveMarkdown(imageType,datas){
  if(saveNode===null){
    new Notify().Render( chrome.i18n.getMessage("extMsgNoSelect") );
    return
  }
  new Notify().Render( chrome.i18n.getMessage("extMsgOutMarkdown")  );
  var turndownService = new TurndownService()
    var markdown = turndownService.turndown(saveNode.srcElement)
    if(imageType==='source'){
      markdownSave(markdown,datas)
    }
    if(imageType==='base64'){
      var regex = /(?:\[\!|\!)(?:\[\]|\[.+?\])\((.+?)(?:\)|\)\])/ig;
    var matches = [];
    var match;
    while (match = regex.exec(markdown)) {
      matches.push(match[1])
    }
    chrome.runtime.sendMessage(matches, function (datas) {
      for (data of datas.datas) {
        markdown = markdown.replace(data.url, data.base64)
      }
     markdownSave(markdown,datas)
    });
    }
    
}

function markdownSave(markdown,datas){
  var foot = '\r\n\r\n[^' + datas.title + ']: ' + datas.url
  markdown += foot
  var file = new File([markdown], datas.title + ".md", {
    type: "text/plain;charset=utf-8"
  });
  FileSaver.saveAs(file);
  removeEvent()
}

function saveImage(title){
  new Notify().Render( chrome.i18n.getMessage("extMsgOutImage") );
  selectedNode.target.style.outline = '';
  saveNode.srcElement.style.padding="20px";
   // 设置选中节点背景为白色
  saveNode.srcElement.style.backgroundColor="#ffffff"




//   html2canvas(saveNode.srcElement).then(function(canvas) {
//     canvas.toBlob(function(blob) {
//       console.log(blob)
//       FileSaver.saveAs(blob, title+'.png');
//   });
    
// });

  domtoimage.toBlob(saveNode)
    .then(function (blob) {
      FileSaver.saveAs(blob, title+'.png');
      removeEvent()
    }).catch(error =>{
      new Notify().Render( chrome.i18n.getMessage("extMsgOutErr") );
      console.error('oops, something went wrong!', error);
    });
}

chrome.runtime.onMessage.addListener(boundHandleRequest)

// 移除监听事件
Mousetrap.bind('esc', function () {
  removeEvent()
}, 'keyup');


function removeEvent(removeStyle=true){
  if(removeStyle){
    selectedNode.target.style.outline = '';
    selectedNode=null
  }
  document.removeEventListener("mouseover", inspectorMouseOver, true);
  document.removeEventListener("mouseout", inspectorMouseOut, true);
  document.removeEventListener("click", inspectorOnClick, true);
}