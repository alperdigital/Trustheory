window.S9_buildUI=function(){ var root=document.getElementById('s9-page-controls'); if(!root) return; root.innerHTML='';
  // Decision toggle
  var top=document.createElement('div'); top.style.display='flex'; top.style.alignItems='center'; top.style.gap='8px'; top.style.margin='0 0 10px 0'; var lbl=document.createElement('div'); lbl.textContent='Karar Verme:'; top.appendChild(lbl);
  var toggle=document.createElement('div'); toggle.className='s9-toggle'; toggle.setAttribute('data-mode', (S9_state.decisionMode||'individual'));
  var thumb=document.createElement('div'); thumb.className='s9-toggle-thumb'; toggle.appendChild(thumb);
  var optG=document.createElement('div'); optG.className='s9-toggle-option'; optG.setAttribute('data-key','group'); optG.textContent='Grup';
  var optI=document.createElement('div'); optI.className='s9-toggle-option'; optI.setAttribute('data-key','individual'); optI.textContent='Bireysel';
  toggle.appendChild(optG); toggle.appendChild(optI);
  function updateToggle(next){ toggle.setAttribute('data-mode', next); S9_state.decisionMode=next; }
  toggle.addEventListener('click', function(){ var cur=toggle.getAttribute('data-mode'); var next=(cur==='group')?'individual':'group'; updateToggle(next); });
  optG.addEventListener('click', function(e){ e.stopPropagation(); updateToggle('group'); });
  optI.addEventListener('click', function(e){ e.stopPropagation(); updateToggle('individual'); });
  updateToggle(S9_state.decisionMode||'individual');
  top.appendChild(toggle); root.appendChild(top);
  // Payoffs
  var pay=document.createElement('div'); pay.style.position='relative'; pay.style.margin='0 0 10px 0'; var pui=new S9_PayoffsUI(); pay.appendChild(pui.dom); root.appendChild(pay); window.S9_payUI=pui;
  // Rules
  var rules=document.createElement('div'); rules.style.position='relative'; root.appendChild(rules);
  function addRow(name, getVal, setVal, min,max,step){ var row=document.createElement('div'); row.style.display='flex'; row.style.alignItems='center'; row.style.gap='10px'; row.style.margin='4px 0'; var l=document.createElement('div'); l.textContent=name; l.style.minWidth='130px'; row.appendChild(l); var v=document.createElement('div'); v.textContent=String(getVal()); v.style.minWidth='34px'; v.style.textAlign='right'; row.appendChild(v); var holder=document.createElement('div'); holder.style.position='relative'; holder.style.flex='1 1 auto'; holder.style.minHeight='36px'; row.appendChild(holder); var slider=new Slider({x:0,y:8,width:320,min:min,max:max,step:step,onchange:function(val){ setVal(val); v.textContent=String(getVal()); slider.setValue(val); }}); slider.setValue(getVal()); slider.slideshow={dom:holder}; holder.appendChild(slider.dom); rules.appendChild(row); }
  addRow('Hata Payı (%)', function(){ return Math.round((S9_state.noise||0)*100); }, function(val){ S9_state.noise=(val||0)/100; }, 0,50,1);
  addRow('Maç başına tur', function(){ return (S9_state.rounds||10); }, function(val){ S9_state.rounds=val; }, 1,100,1);
};

window.S9_render=function(){ var s=S9_state, stage=document.getElementById('s9-stage'); if(!stage||!s) return; var cx=300, cy=300, r=220, G=s.groups.length; function meta(str){ var k=(str||'').toUpperCase(); var frame=7; if(k==='TIT_FOR_TAT')frame=0; else if(k==='DEFECTOR')frame=1; else if(k==='COOPERATOR')frame=2; else if(k==='GRUDGER')frame=3; else if(k==='PROBER')frame=4; else if(k==='TIT_FOR_TWO_TATS')frame=5; else if(k==='PAVLOV')frame=6; else if(k==='RANDOM')frame=7; return {frame:frame}; }
  // place groups on ring
  for(var i=0;i<G;i++){
    var ang=(i/G)*Math.PI*2 - Math.PI/2; var x=cx + r*Math.cos(ang) - 32; var y=cy + r*Math.sin(ang) - 32; var id='s9-gn-'+i; var node=document.getElementById(id); if(!node){ node=document.createElement('div'); node.id=id; node.className='s9-group-node'; stage.appendChild(node); }
    node.style.left=x+'px'; node.style.top=y+'px'; node.classList.remove('s9-best','s9-worst','s9-copied');
    if(s.phase===2){ // marking step: green/red
      if(i===s.bestGroup) node.classList.add('s9-best');
      if(i===s.worstGroup) node.classList.add('s9-worst');
    } else if(s.phase===0){ // next step: turn marked groups to yellow
      if(i===s.prevBestGroup || i===s.prevWorstGroup) node.classList.add('s9-copied');
    }
    var sc=node.querySelector('.s9-group-score'); if(!sc){ sc=document.createElement('div'); sc.className='s9-group-score'; node.appendChild(sc); } sc.textContent=String(Math.round(s.groups[i].score)); var cyNode=y+32; if(cyNode>cy){ sc.classList.add('above'); } else { sc.classList.remove('above'); }
    // big/small icons per current rule (big only if all agents same strategy)
    var nA=s.groups[i].agents.length; var same=true; var first=(s.groups[i].agents[0]&&s.groups[i].agents[0].strategy)||''; var firstUp=(first||'').toUpperCase(); for(var c=1;c<nA;c++){ var su=((s.groups[i].agents[c].strategy)||'').toUpperCase(); if(su!==firstUp){ same=false; break; } }
    var ic=node.querySelector('.s9-group-icon'); if(same){ if(!ic){ ic=document.createElement('div'); ic.className='s9-group-icon'; node.appendChild(ic); } var mAll=meta(firstUp); ic.style.backgroundPosition=(-(mAll.frame*40))+'px 0px'; } else { if(ic&&ic.parentNode){ ic.parentNode.removeChild(ic); ic=null; } }
    for(var a=0;a<nA;a++){ var aid='s9-ag-'+i+'-'+a; var el=document.getElementById(aid); var hiddenIdx=(s.hiddenIdxByGroup&&s.hiddenIdxByGroup[i]!=null)? s.hiddenIdxByGroup[i] : -1; if(same){ if(el){ el.style.display='none'; } continue; } if(!el){ el=document.createElement('div'); el.id=aid; el.className='s9-member'; el.title=s.groups[i].agents[a].strategy; stage.appendChild(el); } el.style.display=(a===hiddenIdx && s.phase>=2)?'none':''; var gx=x+32, gy=y+32; var count=nA>0?nA:5; var radiusInner=22; var base=-Math.PI/2; var step=(2*Math.PI)/count; var ang2=base+a*step; var mx=gx+radiusInner*Math.cos(ang2)-12; var my=gy+radiusInner*Math.sin(ang2)-12; el.style.left=mx+'px'; el.style.top=my+'px'; var sm=meta(s.groups[i].agents[a].strategy); el.style.backgroundPosition=(-(sm.frame*25))+'px 0px'; }
  }
  var st=document.getElementById('s9-status'); if(st){ st.textContent='Jenerasyon: '+(s.gen||0)+' | Faz: '+s.phase; }
  if(window.S9_payUI&&S9_payUI.render) S9_payUI.render();
};


