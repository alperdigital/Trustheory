(function(){
  function bgPath(){ var p=window.location.pathname; return (p.indexOf('/section9/')>=0)? '../assets/ui/payoffs_ui.png' : 'assets/ui/payoffs_ui.png'; }
  window.S9_PayoffsUI=function(cfg){
    var self=this;
    self.dom=document.createElement('div');
    self.dom.style.position='relative';
    self.dom.style.width='300px';
    self.dom.style.height='300px';
    if(cfg&&cfg.scale){ self.dom.style.transform='scale('+cfg.scale+','+cfg.scale+')'; }
    var bg=document.createElement('div');
    bg.style.backgroundImage="url('"+bgPath()+"')";
    bg.style.width='300px';
    bg.style.height='300px';
    bg.style.backgroundSize='100% 100%';
    self.dom.appendChild(bg);
    function add(letter,x,y){
      var wrap=document.createElement('div');
      wrap.className='incdec';
      wrap.style.position='absolute';
      wrap.style.left=(x-64)+'px';
      wrap.style.top=(y-47)+'px';
      var num=document.createElement('div'); num.className='incdec_num'; wrap.appendChild(num);
      function setValue(v){ num.innerHTML=(v>0?'+':'')+v; }
      setValue((window.S9_state&&window.S9_state.payoffs)?window.S9_state.payoffs[letter]:0);
      var up=document.createElement('div'); up.className='incdec_control'; up.setAttribute('arrow','up');
      up.onclick=function(){ if(!window.S9_state)return; var v=window.S9_state.payoffs[letter]+1; if(v>5)v=5; window.S9_state.payoffs[letter]=v; setValue(v); if(window.S9_render) S9_render(); };
      var down=document.createElement('div'); down.className='incdec_control'; down.setAttribute('arrow','down');
      down.onclick=function(){ if(!window.S9_state)return; var v=window.S9_state.payoffs[letter]-1; if(v<-5)v=-5; window.S9_state.payoffs[letter]=v; setValue(v); if(window.S9_render) S9_render(); };
      wrap.appendChild(up); wrap.appendChild(down);
      self.dom.appendChild(wrap);
    }
    add('R',191,127); add('R',233,127);
    add('T',121,197); add('S',161,197);
    add('S',263,197); add('T',306,197);
    add('P',192,268); add('P',232,268);
  };
})();

 