

function jsonp(url){
  var s = document.createElement('script');
  s.src = (location.protocol=='https:'?'https:':'http:')+"//"+url;
  document.body.appendChild(s);
}

if(!window.create_contextmenu){ 
  var SCRIPT_URL = API_DOMAIN+'/assets/microwave.js'
  var s = document.createElement('script');
  s.src = (location.protocol=='https:'?'https:':'http:')+"//"+SCRIPT_URL;
  document.body.appendChild(s);
}

function reply(text){
  wave.wavelet.appendBlip2(text, msg.data.waveletData.waveId, msg.data.waveletData.waveletId);
  //wave.blip.contentCreateChild(reply_text.value,current_blip.blipId,current_blip.waveId,current_blip.waveletId);
  loadWave(msg.data.waveletData.waveId);
  runQueue()
}
  

(function(){
  window.NO_STARTUP = true;
  window.NO_LISTEN_HASHCHANGE = true;
  //window.NO_HOVER_SHOW_BOX = true;
  window.NO_RENDER_TAGS = true;
  opt = {multipane: false, no_sig: true, c: {}, x: {}, fn: {}};
  window.small_screen = false;
  
  chronos = document.createElement('input'); chronos.id = 'chronos';
  document.body.appendChild(chronos);
  
  if(!window.create_contextmenu){ //todo: better microwave presence test
    setTimeout(arguments.callee, 400);
  }else{
    search_container = document.createElement('div');
    suggest_box = document.createElement('div');
    jsonp(API_DOMAIN+'/db/op?jsonp=check_wave_exists&title='+encodeURIComponent(window.WAVE_IDENTIFIER))
    
    window.old_blip_render = window.blip_render;
    /*
    window.blip_render = function(blipid, parent){
      var doc = old_blip_render(blipid, parent);
      if(blipid == msg.data.waveletData.rootBlipId) {
        doc.style.display = 'none';
      }
      return doc;
    }*/
    
    
    window.doXHR = function(postdata, callback){
      var cid = "_x"+Math.random().toString(36).substr(2);
      window[cid] = function(json){callback({responseText: JSON.stringify(json), readyState: 4, status: 200})}; 
      jsonp(API_DOMAIN+'/rpc?jsonp='+cid+'&p='+encodeURIComponent(postdata));
  }
    
    
    window.blip_render = function(blipid, parent){ //a wrapper around renderBlip that adds chrome related things
  var blip = msg.data.blips[blipid];
  if(!blip || blip.dom) return; //already rendered, go on
  
  var html = renderBlip(blip).innerHTML;
  var doc = document.createElement('div');
  
  msg.data.blips[blipid].dom = doc;
  
  blip.html = html;
  blip.date = format_time(blip.lastModifiedTime).toString();

  
  doc.className = "message";
  
  
  doc.innerHTML = MESSAGE_TEMPLATE.replace(/\{\{(.*)\}\}/g, function(a, g){
    return eval(g);
  });
  
  
//  userList(blip.contributors)
  
  
  var show_box = function(e){
    e = e || window.event;
    e.cancelBubble = true;
    if(e.stopPropagation) e.stopPropagation();
    var tag = (e.target||e.srcElement).tagName.toLowerCase();
    if(tag != "a"){
      console.log(blip);
      doc.insertBefore(create_contextmenu(blip), doc.firstChild)//info.nextSibling);
      //info.appendChild(create_contextmenu(blip))
    }
  }
  
  if(!window.NO_HOVER_SHOW_BOX){
    doc.onmouseover = show_box;
  }else{
    doc.onclick = show_box;
  }
  //doc.insertBefore(info, doc.firstChild);
  parent.appendChild(doc);
  
  if(blipid == msg.data.waveletData.rootBlipId) {
        doc.style.display = 'none';
      }
  return doc;
}

  }
})()




function check_wave_exists(res){
  if(res){
    loadWave(res);
    runQueue();
    //var repl = create_context_box();
    //repl.style.display = ''
    //wave_container.appendChild(repl)
  }else{
    var xcf = {};
    window.user = 'Anonymous';
    callbacks[wave.robot.createWavelet([], xcf)] = function(json){
      jsonp(API_DOMAIN+'/db/op?jsonp=check_wave_exists&title='+encodeURIComponent(window.WAVE_IDENTIFIER)+'&waveid='+encodeURIComponent(json.data.waveId))
    }
    
    wave.blip.insert(window.WAVE_CONTENT, xcf.rootBlipId, xcf.waveId, xcf.waveletId);
    wave.wavelet.setTitle(window.WAVE_TITLE, xcf.waveId, xcf.waveletId)
    runQueue();
    window.user = null;
  }
}



