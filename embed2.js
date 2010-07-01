function w2_embed(config){
  var globname = config.globname || 'w2_embed';
  var screen_size = (document.documentElement.clientWidth||innerWidth), 
      small_screen = (screen_size<500);
  
  var username = [];
  config.api_root = config.api_root || 'anony-bot.appspot.com';
  

function CName(el, name){
  if(el.getElementsByClassName){
    return el.getElementsByClassName(name);
  }else{
    for(var e = el.getElementsByTagName('*'), l = e.length, m = []; l--;){
      if((' '+e[l].className+' ').indexOf(' '+name+' ') != -1){
        m.push(e[l]);
      }
    }
    return m.reverse();
  }
}

  
  config.body = config.body || CName(config.element,'wavebody')[0];
  var blip_template = config.body.innerHTML;
  config.body.innerHTML = '';
  config.body = null; //no longer associate stuff with it
  
  //config.blip = config.blip || CName(config.element,'waveblip')[0];
  //var blip_template = config.blip.innerHTML;
  //config.blip.parentNode.removeChild(config.blip); //service is no longer needed
  
  config.edit = config.edit || CName(config.element,'waveedit')[0];
  if(config.edit){
    var edit_template = config.edit.innerHTML;
    config.edit.parentNode.removeChild(config.edit); //service is no longer needed
  }else{
    //pre-template because edit isn't that special
    var edit_template = '<textarea style="width:100%;height:130px" class="wavetext"></textarea>'+
      '<button onclick="{{submit}}">Submit</button> or <a href="#" onclick="{{cancel}}">cancel</a>';
  }
  
  //config.footer = config.footer || CName(config.element,'wavefooter')[0];
  //var footer_template = config.footer.innerHTML;
  //config.header = config.header || CName(config.element,'waveheader')[0];
  //var header_template = config.header.innerHTML;
  
  var master_template = config.element.innerHTML;
  
  config.root_content = config.root_content || '(no content)';
  config.root_title = config.root_title || '(no title)';
  
  config.tags = config.tags || [];
  config.identifier = config.identifier || location.pathname;


  
  function fire(event, args){
    if(config[event]){
      try{
        return config[event](args);
      }catch(err){
        fire('fire_error', err)
      }
    }
  }

  
  var username = null;
  function get_proxy(waveId, waveletId){
    if(username ===  null){
      username = prompt('What name would you like to post this under?','Anonymous').replace(/ /g,'+');
    }
    if (username != '') {
      api.wavelet.participant.add('anony-bot+' + username + '@appspot.com', waveId, waveletId)
    }
    return username;
  }
  
  
  var queue = [];
var callbacks = {};
var id_count = 0;



function queueOp(method, params, callback){
  var id = (id_count++).toString();
  if(callback) callbacks[id] = callback;
  queue.push({
      id: id,
      method: 'wave.'+method,
      params: params
    });
  return id;
}

function script_include(url){
  var s = document.createElement('script');
  s.src = (location.protocol=='https:'?'https:':'http:')+"//"+url;
  s.onload = function(){
    setTimeout(function(){
      try{
        document.body.removeChild(s);
      }catch(err){}
    },500);
  };
  document.body.appendChild(s);
}

function autopost(posturl,params,cb) {
	// random id
	var conv = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', len = conv.length, ucb = 'ucb_';
	for(var i = 0; i < 32; i++) ucb += conv.charAt(Math.floor(Math.random()*len));
	var div = document.createElement('div');
	// container div
	//div.style.display = 'none';
	div.style.position='absolute';
  document.body.appendChild(div);
	var iframe, form = document.createElement('form');
	window['c'+ucb] = function() {
    try{
				if(iframe.contentWindow.location =='about:blank'){ //opera and safari load about:blank
          return;
				}
			}catch(e){}
		//setTimeout(function() { if(div.parentNode) div.parentNode.removeChild(div); },0);
		cb();
	}
	// iframe
	try { iframe = document.createElement('<iframe id="'+ucb+'" name="'+ucb+'" onload="window.c'+ucb+'()">'); }	// IE
	catch(ex) { iframe = document.createElement('iframe'); iframe.id = iframe.name = ucb; iframe.onload = window['c'+ucb]; }	// normal
	div.appendChild(iframe);
	// form
	form.target = ucb;
	form.action = posturl;
	form.method = 'POST';
	div.appendChild(form);
	// submit form
	for(var key in params) {
		var input = document.createElement('input');
		input.type = 'text';
		input.name = key;
		input.value = params[key];
		form.appendChild(input);
	}
	if(window.frames[ucb].name != ucb) {
		window.frames[ucb].name = ucb;
	}
	form.submit();
}


function formpost(postdata, callback){
  var cid = "_x"+Math.random().toString(36).substr(2);
  window[globname][cid] = function(json){
    callback(json);
    delete window[globname][cid];
  }; 
  autopost((location.protocol=='https:'?'https:':'http:')+"//"+
           config.api_root+'/rpc?jsonpost='+cid,{p: postdata},function(){
    setTimeout(function(){
      script_include(config.api_root+'/rpc?jsonp='+globname+'.'+cid+'&jsonpost='+cid);
    },100)
  })
}
function doXHR(postdata, callback){
  if(postdata.length > 1900){
    return formpost(postdata, callback);
  }

  var cid = "_x"+Math.random().toString(36).substr(2);
  window[globname][cid] = function(json){
    callback(json);
    delete window[globname][cid];
  }; 
  script_include(config.api_root+'/rpc?jsonp='+globname+'.'+cid+'&p='+encodeURIComponent(postdata));
}







function runQueue(){
  if(queue.length == 0) return false;

  doXHR(JSON.stringify(queue), function(json){
      if(json){
        //no error yay
        //console.log(json)
        for(var i = 0; i < json.length; i++){
          //run each callback.
          var id = json[i].id;
          var cb_result = null;
          if(callbacks[id]){
            cb_result = callbacks[id](json[i]);
            delete callbacks[id];
          }
          if(json[i].error && !cb_result){
            if(json[i].error.code == 401){
              
              alert('Your login token has expired\n'+xhr.responseText)
              return location = '/?force_auth=true';
            }
            alert("Error "+json[i].error.code+": "+json[i].error.message)
          }
        }
      }
  })
  queue = [];
}

  
  var api = {
  robot:{
    fetchWave: function(waveId, waveletId){
      return queueOp('robot.fetchWave',{waveId: waveId, waveletId: waveletId})
    },
    "search": function(query, index, numResults){
      return queueOp('robot.search', {query: query, index: index, numResults: numResults});
    },
    folderAction: function(modifyHow, waveId, waveletId){
      return queueOp('robot.folderAction', {waveId: waveId, modifyHow: modifyHow, waveletId: waveletId});
    },
    notifyCapabilitiesHash: function(protocolVersion){
      return queueOp('robot.notifyCapabilitiesHash', {protocolVersion: protocolVersion||'0.21'});
    },
    createWavelet: function(participants, preconf){ //awkkwurrdd!
      var rootBlipId = "TBD_"+waveletId+"_0x"+(Math.random()*9e5).toString(16);
      var wavehost = 'googlewave.com'//username.replace(/^.+@/,'');
      var waveletId = wavehost+"!conv+root";
      var waveId = wavehost+"!TBD_0x"+(Math.random()*9e5).toString(16);
      if(!preconf) preconf = {};
      preconf.waveId = waveId;
      preconf.waveletId = waveletId;
      preconf.rootBlipId = rootBlipId;
      return queueOp("robot.createWavelet", {
             "waveletId": waveletId, 
             "waveletData": {
                "waveletId": waveletId, 
                "waveId": waveId, 
                "rootBlipId": rootBlipId, 
                "participants": participants
              }, 
              "waveId": waveId
              });
    }
    
  },
  wavelet:{
    appendBlip2: function(content, waveId, waveletId){
      var wavehost = 'googlewave.com';//username.replace(/^.+@/,'');
      var user = get_proxy(waveId, waveletId);
      var blipId =  "TBD_"+wavehost+"!conv+root_0x"+(Math.random()*9e5).toString(16);
      return queueOp('wavelet.appendBlip', {
        waveletId: waveletId, waveId: waveId, blipId:blipId, 
        proxyingFor: user,  "blipData": {
          "waveletId": waveletId, "blipId": blipId, "waveId": waveId, 
          "content": content, "parentBlipId": undefined}, parentBlipId: undefined})
    },
    modifyParticipantRole: function(participant, role, waveId, waveletId){
      return queueOp('wavelet.modifyParticipantRole', {waveletId: waveletId, waveId: waveId, participantId: participant, participantRole: role})
    },
    removeTag: function(tag, waveId, waveletId){
      return queueOp('wavelet.modifyTag', {waveletId: waveletId, waveId: waveId, name: tag, modifyHow: 'remove'});
    },
    addTag: function(tag, waveId, waveletId){
      return queueOp('wavelet.modifyTag', {waveletId: waveletId, waveId: waveId, name: tag});
    },
    
    setTitle: function(title, waveId, waveletId){
      return queueOp('wavelet.setTitle', {waveletId: waveletId, waveId: waveId, waveletTitle: title});
    },
    participant: {
      add: function(participant, waveId, waveletId){
        return queueOp('wavelet.participant.add', {waveId: waveId, waveletId: waveletId, participantId: participant});
      }
    }
  },
  document:{
    appendMarkup: function(content, blipId, waveId, waveletId){
      return queueOp('document.appendMarkup', {waveletId: waveletId, waveId: waveId, blipId: blipId, content: content})
    },
    modify: function(modifyAction, blipId, waveId, waveletId){
      var user = get_proxy(waveId, waveletId);
      return queueOp('document.modify', {waveletId: waveletId, waveId: waveId, blipId: blipId, modifyAction: modifyAction, proxyingFor: user})
    },
    modify_range: function(modifyAction, start, end,  blipId, waveId, waveletId){
      var user = get_proxy(waveId, waveletId);
      return queueOp('document.modify', {waveletId: waveletId, waveId: waveId, blipId: blipId, modifyAction: modifyAction, range: {start: start, end: end}, proxyingFor: user})
    }
  },
  blip:{
    "delete": function(blipId, waveId, waveletId){
      return queueOp('blip.delete', {waveletId: waveletId, waveId: waveId, blipId: blipId})
    },
    //this is actually pretty different from others, it's just a shortcut for another one
    "replace": function(content, blipId, waveId, waveletId){
      return api.document.modify({modifyHow: "REPLACE", values: ['\n'+content]}, blipId, waveId, waveletId)
    },
    "replace_range": function(content, start, end, blipId, waveId, waveletId){
      return api.document.modify_range({modifyHow: "REPLACE", values: [content]}, start, end, blipId, waveId, waveletId)
    },
    "insert": function(content, blipId, waveId, waveletId){
      return api.document.modify({modifyHow: "INSERT", values: ['\n'+content]}, blipId, waveId, waveletId)
    },
    "append": function(content, blipId, waveId, waveletId){
      return api.document.modify({modifyHow: "INSERT_AFTER", values: [content]}, blipId, waveId, waveletId)
    },

    createChild: function(parentBlipId, waveId, waveletId, blipId){
      var user = get_proxy(waveId, waveletId);
      return queueOp('blip.createChild', {
        "waveletId": waveletId, "waveId": waveId, blipId: parentBlipId, 
        proxyingFor: user, 
        "blipData": {"waveletId": waveletId, "blipId": blipId, "waveId": waveId, "content":  '', "parentBlipId": parentBlipId}
      })
    },
    contentCreateChild: function(content, parentBlipId, waveId, waveletId){
      var blipId = "TBD_"+waveletId+"_0x"+(Math.random()*9e5).toString(16);
      api.blip.createChild(parentBlipId, waveId, waveletId, blipId);
      api.blip.replace(content, blipId, waveId, waveletId);
    }
  }
};

///////////////end wave api




function renderGadget(el, blip){
  var state = {}, keys = [];
  for(var prop in el.properties){
    if(prop != 'url' && prop != 'author')
      state[prop] = el.properties[prop];
      keys.push(prop);
  }
  var cont = document.createElement('div');
  cont.style.margin = '10px'
  var url = el.properties.url;
  cont.innerHTML = '<b>gadget</b> '+url+' <br>';
  if(config.gadgets){
    load_native_gadget(state, el, blip, cont);
    return cont;
  }
  if(url == 'http://wave-api.appspot.com/public/gadgets/areyouin/gadget.xml'){
    var lists = {y:[],n:[],m:[]};
    for(var prop in state){
      if(/:answer$/.test(prop))
        lists[state[prop]].push(prop.substr(0, prop.length - 7));
    }
    for(var opt in lists){
      cont.innerHTML += "<br><span style='color:red;font-weight:bold'>"+({m:"Maybe",y:"Yes",n:"No"})[opt]+"</span><br> ";
      if(lists[opt].length == 0) cont.innerHTML += "(None) <br>";
      for(var k = 0; k < lists[opt].length; k++){
        cont.innerHTML += lists[opt][k].replace(/@googlewave.com/g, "") + ' <span style="color: gray;font-style: italic">'+(state[lists[opt][k]+":status"]||'') + "</span><br>";
      }
    }
  }else if(url == 'http://plus-one.appspot.com/plus-one.xml'){
    var sum = 0;
    for(var prop in state)
      sum += parseInt(state[prop]);
    cont.innerHTML += "<br><b>Votes:</b> " + sum + "/" + keys.length;
  }else if(url == 'http://www.elizabethsgadgets.appspot.com/public/gadget.xml'){
    cont.innerHTML += '<br> <b>Pluses</b> ('+(state.pluses||0)+')&nbsp;&nbsp;&nbsp;&nbsp;<b>Minuses</b> ('+(state.minuses||0)+')';
  }else if(url == 'http://pushyrobot.appspot.com/gadgets/github.xml'){
    cont.innerHTML += '<pre>'+JSON.stringify(JSON.parse(unescape(state.commit)),null,2)+'</pre>'
  }else if(url == 'http://everybodyapi.appspot.com/gadget/image/gadget.xml'){
    cont.innerHTML += '<img src="'+state.imgUrl+'" width="'+state.imgWidth+'" height="'+state.imgHeight+'">';
  }else if(url == 'http://wavepollo.appspot.com/wavepollo/com.appspot.wavepollo.client.PolloWaveGadget.gadget.xml'){
    var items = {};
    for(var i in state){
      if(i.indexOf('MVOTE_') == 0){
        var parts = i.match(/MVOTE_(.+)(OPT_.+)$/);
        if(parts){
          if(!items[parts[2]]) items[parts[2]] = [];
          items[parts[2]].push(parts[1]);
        }
      }
    }
    for(var i in items){
      cont.innerHTML += "<br><span style='color:red;font-weight:bold'>"+state[i]+"</span> ("+items[i].length+")<br> ";
      for(var k = 0; k < items[i].length; k++){
        cont.innerHTML += items[i][k].replace(/@googlewave.com/g, "") + ', ';
      }
    }
  }else if(url == 'https://statusee.appspot.com/gadget/statusee.xml'){
    var v = ({notstarted:'Not started', describing: 'Describing', brainstorming: 'Brainstorming', inprogress: 'In Progress',
              inreview: 'In Review', pending: 'Pending', testing: 'Testing', completed: 'Completed', rejected: 'Rejected',
              'canceled': 'Canceled'})[state.sel];
    cont.innerHTML += "<b>Status</b> " + (v||state.sel.substr(7));
  }else if(url == 'http://wave-poll.googlecode.com/svn/trunk/src/poll.xml'){
    for(var i in state){
      var p = JSON.parse(state[i]).participants;
      cont.innerHTML += "<br><span style='color:red;font-weight:bold'>"+i.substr(7)+"</span> ("+p.length+")<br> ";
      for(var k = 0; k < p.length; k++){
        cont.innerHTML += p[k].replace(/@googlewave.com/g, "") + ', ';
      }
    }
  }else if(url == 'https://everybodyapi.appspot.com/gadget/miniroster/main.xml'){
    cont.innerHTML += "<br><span style='color:red;font-weight:bold'>Assigned</span> ("+keys.length+")<br> ";
    for(var i in state){
      cont.innerHTML += i.split('~')[3] + ', ';
    }
  }else if(url == 'http://www.nebweb.com.au/wave/likey.xml'){
    cont.innerHTML += '<br> <b>Like</b> ('+(state.likeCount||0)+')&nbsp;&nbsp;&nbsp;&nbsp;<b>Dislike</b> ('+(state.dislikeCount||0)+')';
  }else if(config.render_state || JSON.stringify(state).length < 1337){
    console.log("Unknown Gadget",url);
    cont.innerHTML += '<pre>'+JSON.stringify(state,null,2)+'</pre>'
  }
  return cont
}

function inline_blip_render(blipid){
  var doc = document.createElement("div");
  doc.className = "wavethread"
  blip_render(blipid, doc);
  return doc;
}
function renderBlip(markup){
  var content = markup.content + ' '; //render an extra space at the end for rendering the user cursor annotations
  var annotation_starts = {}, annotation_ends = {};
  var user_colors = {};
  for(var i = 0; i < markup.annotations.length; i++){
    //iterate and note where the annotations end and start
    var note = markup.annotations[i];
    
    if(note.name.indexOf('user/d/') == 0){
      var user_session = note.value.split(',');
      var userid = note.name.substr(7);
      if(new Date - parseInt(user_session[1]) < 1000 * 60 * 60){ //expire after one haor
        user_colors[userid] = 'rgb(' +
                Math.floor(205-Math.random()*100).toString()+',' +
                Math.floor(205-Math.random()*100).toString()+',' +
                Math.floor(205-Math.random()*100).toString()+')';
      }
    }
    if(!annotation_starts[note.range.start]) 
      annotation_starts[note.range.start] = [i]
    else annotation_starts[note.range.start].push(i);
    if(!annotation_ends[note.range.end]) 
      annotation_ends[note.range.end] = [i]
    else annotation_ends[note.range.end].push(i);
  }
  var notes = {};
  var doc = document.createElement('div'), line = null, section = null;
  var htmlbuffer = '';
  for(var i = 0; i < content.length; i++){
    if(annotation_starts[i] || annotation_ends[i] || markup.elements[i]){
      if(htmlbuffer) section.appendChild(document.createTextNode(htmlbuffer));
  
      htmlbuffer = '';
      if(markup.elements[i]){
        //define new superelement and span
        var el = markup.elements[i];

        if(el.type == "INLINE_BLIP"){
          //var cont = document.createElement('div');
          //cont.style.border = "3px dotted blue";
          //cont.style.margin = '10px'
          //cont.innerHTML = '&lt;<b>inline</b> blip '+el.properties.id+'&gt;';
          //doc.appendChild(cont);
          
          doc.appendChild(inline_blip_render(el.properties.id));
        }else if(el.type == "IMAGE"){
          //this is actually something which shouldn't happen, it means that ur capabilities arent up to date
          var cont = document.createElement('div');
          cont.style.border = "3px dotted orange";
          cont.style.margin = '10px'
          cont.innerHTML = '&lt;<b>Wave 1.0 Attachment</b> '+el.properties.attachmentId+' '+el.properties.caption+'&gt;';
          
          doc.appendChild(cont);
        }else if(el.type == "INSTALLER"){
          //this is actually something which shouldn't happen, it means that ur capabilities arent up to date
          var cont = document.createElement('div');
          cont.style.border = "3px dotted orange";
          cont.style.margin = '10px'
          cont.innerHTML = '&lt;<b>Extension Installer</b> '+el.properties.manifest+'&gt;';
          
          doc.appendChild(cont);
        }else if(el.type == "ATTACHMENT"){
          var cont = document.createElement('div');
          cont.style.margin = '10px'
          cont.innerHTML = '<b>'+el.properties.mimeType+'</b> '+el.properties.caption+'<br>';
          if(el.properties.mimeType.indexOf('image/') == 0){
            var img = document.createElement('img');
            img.src = el.properties.attachmentUrl;
            if(small_screen){
              img.style.width = "100%";
              img.onclick = function(){
                if(img.style.width.indexOf('%') == -1){
                  img.style.width = "100%";
                }else{
                  img.style.width = "";
                }
              }
            }
            
            //alert(img.style.width)
            cont.appendChild(img);
          }else{
            cont.innerHTML += "<a href='"+el.properties.attachmentUrl+"'>Download</a>"
          }
          doc.appendChild(cont);
        }else if(el.type == "GADGET"){
         
          doc.appendChild(renderGadget(el, markup));
        }else if(el.type != "LINE"){
          console.log('unknown element type', el.type, el.properties)
        }
        //implicitly create a new element anyway
        //if(el.type == "LINE"){
          line = document.createElement(el.properties.lineType || "p");
          if(el.properties.indent)
            line.style.marginLeft = el.properties.indent * 20 + 'px';
          if(el.properties.alignment)
            line.style.textAlign = ({l: 'left', c: 'center', r: 'right'})[el.properties.alignment];          
          if(el.properties.direction)
            line.setAttribute('dir',({l: 'ltr', r: 'rtl'})[el.properties.alignment]);
          doc.appendChild(line);
        //}
      }

      
      if(annotation_starts[i]){
        //add to the styles list/create new blah
        for(var k = annotation_starts[i], l = k.length; l--;){
          var note = markup.annotations[k[l]];
          if(!notes[note.name]) notes[note.name] = [];
          notes[note.name].push(note.value);
          
          if(note.name.indexOf('user/e/') == 0){
            var userid = note.name.substr(7);
            if(user_colors[userid]){
              var cursor = document.createElement('span');
              cursor.className = 'cursor';
              cursor.innerHTML = note.value.replace(/@.+/,'');
              cursor.style.backgroundColor = user_colors[userid];
              section.appendChild(cursor)
            }
          }
        }
      }
      if(annotation_ends[i]){
        //add to styles list/create new blah
        for(var k = annotation_ends[i], l = k.length; l--;){
          var note = markup.annotations[k[l]];
          notes[note.name].shift()
          if(notes[note.name].length == 0){
            delete notes[note.name];
          }
        }      
      }
      //create new span
      if(notes['link/auto'] || notes['link/manual'] || notes['link/wave']){ //probably needs some rewriting
        section = document.createElement('a');
      }else  section = document.createElement('span');
      line.appendChild(section);
      //apply the styles to the new span
      for(var note in notes){
        //if(notes[note].length == 0) continue;
        var val = notes[note][0];
        if(note.indexOf("style/") == 0){
          section.style[note.substr(6)] = val;
        }else if(note == "conv/title"){
          section.style.fontWeight = 'bold';
        }else if(note == 'spell'){
          //section.style.borderBottom = '1px solid #C00';
        }else if(note == 'lang'){
          //section.title = "Language: "+val;
        }else if(note == 'link/manual' || note == 'link/auto'){
          section.href = val;
          section.target = "_blank"
        }else if(note == 'link/wave'){
          section.href = '#wave:'+val;
          section.setAttribute('onclick', 'ch(this)')
          
        }else if(note.indexOf("user/e") == 0){
          //ignore (parsed elsewhere)
        }else if(note.indexOf("user/d") == 0){
          //ignore
        }else if(note.indexOf("user/r") == 0){
          //ignore
        }else{
          console.log('unrecognized annotation', note, val);
        }
      }
    }
    if(content.charAt(i) != "\n")
      htmlbuffer += content.charAt(i);
    
  }
  if(htmlbuffer) section.appendChild(document.createTextNode(htmlbuffer));
  
  doc.onclick = function(e){
    e = e || window.event; //god, i hate IE
    e.cancelBubble = true;
    if(e.stopPropagation) e.stopPropagation();
  }
  return doc;
}

function format_time(date){
  if(typeof date == "number"){
    var date2 = new Date();
    date2.setTime(date);
    date = date2;
  }
  var hr = date.getHours(), ampm = "am";
  if(hr > 12){ hr = hr - 12; ampm = "pm"}
  if(hr == 0){hr = 12}
  var minute = date.getMinutes().toString()
  if(minute.length == 1) minute = "0"+minute;
  return (date.getMonth()+1)+"/"+(date.getDate())+" "+hr+":"+minute+ampm;
}
































var msg = {};






function chronological_blip_render(parent){
  var blips = []
  for(var blip in msg.data.blips){
    blips.push(msg.data.blips[blip])
  }
  blips = blips.sort(function(a, b){
    return a.lastModifiedTime - b.lastModifiedTime
  })
  
  var singleBlip = function(i){
    var doc = blip_render(blips[i].blipId, parent);
    if(msg.data.blips[blips[i].parentBlipId] && doc){
      var blockquote = document.createElement("blockquote");
      var markup = msg.data.blips[blips[i].parentBlipId];
      var ht = markup.contributors.join(", ").replace(/@googlewave.com/g, "") + ":" + markup.content;
      blockquote.innerHTML = ht.substr(0,140) + (ht.length > 140?"...":"");
      //blockquote.setAttribute("onclick", "msg.data.blips['"+markup.blipId+"'].dom.scrollIntoView()")
      (function(blockquote, msg, blipID){
        blockquote.onclick = function(){
          msg.data.blips[blipID].dom.scrollIntoView();
        }
      })(blockquote, msg, markup.blipId)
      doc.insertBefore(blockquote,doc.getElementsByTagName("div")[0].nextSibling)
      
    }
  }
  
  //for(var i = blips.length; i--;)singleBlip(i);
  var i = blips.length-1;
  (function(){
    var ii = Math.max(0, i-10);
    //console.log(i,blips[i]);
    for(;i >= ii; i--) singleBlip(i);
    
    if(ii) setTimeout(arguments.callee, 0);
  })()
}

function recursive_blip_render(blipid, parent){
  var doc = blip_render(blipid, parent);
  var blip = msg.data.blips[blipid];
  if(blip.childBlipIds.length > 0){
    if(blip.childBlipIds.length > 1){
      var thread = document.createElement("div");
      thread.className = "wavethread";
      for(var i = 1; i < blip.childBlipIds.length; i++){
        var child = recursive_blip_render(blip.childBlipIds[i], thread); //render children
      }
      if(thread.childNodes.length != 0)
        parent.appendChild(thread);
    }
    var child = recursive_blip_render(blip.childBlipIds[0], parent); //render children
  }
  return doc;
}





function userList(users, expanded){ //because participant is a long word
  var USER_CUTOFF = small_screen?2:5;
  var span = document.createElement('span');
  if(users.length <= USER_CUTOFF || expanded){
    //todo: check if contributors are named robert<script>table.drop('students')</@googlewave.com
    
    span.innerHTML = users.join(", ")
          .replace(/anony\-bot\+(.+)\@appspot\.com/,'$1')
          .replace(/antimatter15@googlewave.com/g,"<a href='http://antimatter15.com'>antimatter15</a>")
          .replace(/@googlewave.com/g, "");
    if(expanded){
      var fewer = document.createElement('a');
      fewer.innerHTML = " (fewer)";
      fewer.href = "javascript:void(0)";
      fewer.onclick = function(){
        span.parentNode.replaceChild(userList(users), span);
        return false;
      }
      span.appendChild(fewer);
    }
  }else{
    span.innerHTML = users.slice(0,USER_CUTOFF).join(", ")
          .replace(/antimatter15@googlewave.com/g,"<a href='http://antimatter15.com'>antimatter15</a>")
          .replace(/anony\-bot\+(.+)\@appspot\.com/,'$1')
          .replace(/@googlewave.com/g, "");
    var more = document.createElement('a');
    more.innerHTML = " ... (" + (users.length-USER_CUTOFF) + " more)";
    more.href = "#";
    more.onclick = function(){
      span.parentNode.replaceChild(userList(users, true), span);
      return false;
    }
    span.appendChild(more);
  }
  return span
}



function Map(arr, fn){
  for(var r = arr.length; r--;){
    fn(arr[r]);
  }
}




var wave = {}


var _bliparr = [], bliparr = [];

function render(blipcontent){
  return renderBlip(blip).innerHTML;
}

function blip_render(blipid, parent){ //a wrapper around renderBlip that adds chrome related things
  var blip = msg.data.blips[blipid];
  if(!blip || blip.dom) return; //already rendered, go on
  
  
  
  var html = renderBlip(blip).innerHTML;
  var doc = document.createElement('div');
  

  
  msg.data.blips[blipid].dom = doc;
  
  blip.html = html;
  blip.permalink = wave.permalink+'/~/'+wave.waveletId.split('!')[1]+'/'+blip.blipId;
  
  
  
  doc.className = "waveblip";
  
  var contributorlist = '<span class="contributorlist"></span>';
  
  var blipscope = {edit:'', reply:'', remove:''};
  
  _bliparr.push(blip.blipId);
  for(var i in blipscope){
    blipscope[i] = prefix+i+'('+(_bliparr.length-1)+');return false';
  }

  
  with (blipscope) {
    doc.innerHTML = blip_template.replace(/\{\{(.*)\}\}/g, function(a, g){
      return eval(g);
    });
  }
  Map(CName(doc, 'contributorlist'), function(el){
    el.parentNode.replaceChild(userList(blip.contributors), el);
  });

  parent.appendChild(doc);
  
  if(config.hideroot && blipid == msg.data.waveletData.rootBlipId) {
    doc.style.display = 'none';
  }
  return doc;
}



//crappy diff algorithm which handles simple replace cases
//hello world blah blah blah blah blah cheetoes blah blah blah
//hello world blah blah blah blah cheetoes blah blah blah
//returns range of change:        [  ] -> []
//example:
//> diff('the huge cute pink elephant ate children',
//       'the huge cute gray elephant ate children')
//[14, 18, "gray"]
function diff(a, b){
  var al = a.length, bl = b.length, s = -1, e = -1;
  while(s++ < al && a[s] == b[s]){};
  while(e++ < al && a[al-e] == b[bl-e]){};
  return [s,al-e+1,b.substring(s,bl-e+1)]
}

var embed_id = 'aph'+Math.random().toString(36).substr(4);
var prefix = globname+"."+embed_id+".";
window[globname][embed_id] = {
  //some actions you can do
  addparticipant: function(){
    var participant = prompt('Enter Participant ID to Add');
    if(participant){
      if(participant.indexOf("@") == -1){
        participant += "@googlewave.com";
      }
      api.wavelet.participant.add(participant, wave.waveId, wave.waveletId);
      loadWave(wave.waveId);
      runQueue();
    }
  },
  reload: function(){
    loadWave(wave.waveId);
    runQueue();
  },
  setname: function(){
    username = prompt('What name would you like to post this under?','Anonymous').replace(/ /g,'+')||username;
  },
  addtag: function(){
    var tag = prompt('Add tag');
    if(tag){
      api.wavelet.addTag(tag, wave.waveId, wave.waveletId);
      loadWave(wave.waveId);
      runQueue();
    }
  },
  edit: function(blipcount){
    var blipid = _bliparr[blipcount];
    console.log(blipid)
    var rep_start = 0;
    var blip = msg.data.blips[blipid];
    console.log(blip);
    try{
      for(var i = blip.annotations.length; i--;){
        if(current_blip.annotations[i].name == 'conv/title') rep_start = current_blip.annotations[0].range.end;
      }
    }catch(err){}
    
    
    var doc = render_edit(blip.content.substr(rep_start+1),function(text, doc){
      if(blip.content.substr(rep_start) == '\n'+text){
        return doc.style.display = 'none';
      }
      var rep_start = 0;
      var change = diff(blip.content.substr(rep_start), '\n'+text);
      //console.log(change);
      //console.log(blip.content, '\n'+text)
      
      api.blip.replace_range(change[2], 
                              rep_start + change[0], 
                              rep_start + change[1], 
                              blip.blipId, blip.waveId, blip.waveletId)
      loadWave(blip.waveId);
      runQueue()
    });
     blip.dom.parentNode.insertBefore(doc, blip.dom.nextSibling);
  },
  reply: function(blipcount){
    var blipid = _bliparr[blipcount], blip = msg.data.blips[blipid];
    var doc = render_edit('',function(text){
      api.blip.contentCreateChild(text,blipid,wave.waveId,wave.waveletId);
      loadWave(wave.waveId);
      runQueue()
    });
    if(blip.childBlipIds.length > 0){
      doc.className += ' wavethread'
    }
    blip.dom.parentNode.insertBefore(doc, blip.dom.nextSibling);
  },
  remove: function(blipcount){
    var blipid = _bliparr[blipcount];
    if(confirm('Are you sure you want to remove this blip?')){
      //destroy_world
      api.blip['delete'](blipid,wave.waveId,wave.waveletId);
      loadWave(wave.waveId);
      runQueue();
    }
  }
  
}
var tpl_environ = {
  participantlist: '<span class="participantlist"></span>',
  contributorlist: '<span class="contributorlist"></span>'
};

for(var i in window[globname][embed_id]){
  tpl_environ[i] = prefix+i+'();return false'
}


function loadWave(waveId, waveletId){
  waveId = waveId.replace("/", '!');
  waveletId = waveletId || waveId.replace(/[\/!].+/,'!conv+root')
  callbacks[api.robot.fetchWave(waveId, waveletId)] = function(waveContent){
    is_editing = false;
    msg = waveContent;
    wave = msg.data.waveletData;    
    
    _bliparr = [];
    bliparr = [];
    for(var i in msg.data.blips) bliparr.push(i);
    
    wave.permalink = 'https://wave.google.com/wave/waveref/'+wave.waveId.replace('!','/');
    wave.blips = msg.data.blips;
    wave._bliparr = bliparr;


    //https://wave.google.com/wave/waveref/googlewave.com/w+himNQ2ZjA 
    //console.log(msg);
    if(config.element) config.element.style.display = '';

    
    config.element.innerHTML = template_renderer(master_template, tpl_environ);
    Map(CName(config.element, 'participantlist'), function(el){
      el.parentNode.replaceChild(userList(wave.participants), el);
    });
    
    config.body = CName(config.element,'wavebody')[0];
    
    if(config.chronological){
      chronological_blip_render(config.body)
    }else{
      recursive_blip_render(wave.rootBlipId, config.body);
    }
  }
}




function pollWave(waveId, waveletId){
  waveId = waveId.replace("/", '!');
  waveletId = waveletId || waveId.replace(/[\/!].+/,'!conv+root')
  callbacks[api.robot.fetchWave(waveId, waveletId)] = function(waveContent){
    var version = waveContent.data.waveletData.version;
    if(version > wave.version && is_editing == false){
    
      loadWave(waveId, waveletId);
    }
  }
  runQueue();
  setTimeout(function(){
    pollWave(waveId, waveletId);
  },5000)
}




//*
function template_renderer(source, scope){
  
  return source.replace(/\{\{(.+?)\}\}/g, function(a, g){
    try {
      with (scope) {
        return eval(g);
      }
    }catch(err){
      console.error(err);
      return g;
    }
  });
}
//*/



var is_editing = false;
function render_edit(text, submithandler){
  var doc = document.createElement('div');
  doc.className += ' waveedit ';
  var edit_id = 'eid'+Math.random().toString().substr(5);
  var prefix = globname+"."+edit_id+".";
  var edit_area = null;
  if(is_editing){
    is_editing.cancel();
  }
  window[globname][edit_id] = {
    //some actions you can do
    submit: function(){
      edit_area.disabled = 'disabled';
      is_editing = false;
      if(submithandler) submithandler(edit_area.value, doc);
    },
    cancel: function(){
      doc.style.display = 'none';
      is_editing = false;
    }
  }
  is_editing = window[globname][edit_id];
  for(var i in window[globname][edit_id]){
    tpl_environ[i] = prefix+i+'();return false'
  }
  doc.innerHTML = template_renderer(edit_template, tpl_environ);
  edit_area = CName(doc, 'wavetext')[0];
  edit_area.value = text;
  return doc;
}


  if(!window.JSON) script_include(config.json_url || 'http://anony-bot.appspot.com/assets/json2.mini.js');
  



  var rid = 'cwe'+Math.random().toString(36).substr(4);
  window[globname][rid] = function(res){
    if(res){
      //console.log('Got WaveID '+res);
      loadWave(res);
       if(config.poll_updates){
        setTimeout(function(){
          pollWave(res)
        },5000);
      } 

      
      runQueue();
    }else{
      //console.log('No wave ID found in database')
      var xcf = {}; 
      username = '';
      callbacks[api.robot.createWavelet(config.participants||[], xcf)] = function(json){
        script_include(config.api_root + '/db/op?jsonp='+globname+'.'+rid+'&title=' + encodeURIComponent(config.identifier)+'&waveid='+encodeURIComponent(json.data.waveId));
      }
      api.blip.insert(config.root_content, xcf.rootBlipId, xcf.waveId, xcf.waveletId);
      api.wavelet.setTitle(config.root_title, xcf.waveId, xcf.waveletId)
      if(config.tags){
        for(var i = 0; i < config.tags.length; i++){
          api.wavelet.addTag(config.tags[i], xcf.waveId, xcf.waveletId);
        }
      }
      
      
      username = null;
      runQueue();
    }
  }
     
  if (config.waveid) {
    window[globname][rid](config.waveid);
  }
  else {
    script_include(config.api_root + '/db/op?jsonp='+globname+'.'+rid+'&title=' + encodeURIComponent(config.identifier))
  }
  
 
  
 return {
   config: config,
   reply: function(text){
     api.wavelet.appendBlip2(text, wave.waveId, wave.waveletId);
     loadWave(wave.waveId);
     runQueue();
   },
   reload: function(text){
     loadWave(wave.waveId);
     runQueue();
   }
 };
}
