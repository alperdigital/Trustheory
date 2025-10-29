(function(){
  window.S9 = window.S9 || {};
  var mounted=false; var listeners=[]; function on(el,ev,fn){ el.addEventListener(ev,fn); listeners.push([el,ev,fn]); }
  function offAll(){ for(var i=0;i<listeners.length;i++){ var l=listeners[i]; try{ l[0].removeEventListener(l[1],l[2]); }catch(e){} } listeners=[]; }
  window.S9_mount=function(){ if(mounted) return; var root=document.getElementById('s9-root'); if(!root){ console.error('s9-root yok'); return; } root.hidden=false; try{ root.classList.add('s9-sketch'); }catch(e){}
    root.innerHTML=''+
      '<div class="s9-intro">'+
        '<div class="s9-intro-title">9. Bölüm – Grup içi evrim</div>'+
        '<div class="s9-intro-desc">20 grup ve her grupta 5 birey ile, güven oyununu hem gruplar <i>arasında</i> hem de grupların <i>içinde</i> evrimleştiriyoruz. Her jenerasyon sonunda en düşük puanlı gruplar elenir ve en yüksek puanlı gruplar kopyalanır; ayrıca her grupta en yüksek puanlı bireyin stratejisi, en düşük puanlı bireye aktarılır. Gürültü (hata payı), ödül tablosu ve karar verme modu (Grup | Bireysel) üzerinde oynayarak dinamikleri keşfedin.</div>'+
      '</div>'+
      '<div class="s9-layout">'+
        '<div class="s9-stage-col">'+
          '<div id="s9-stage" class="s9-stage">'+
            '<div class="s9-stage-circle"></div>'+
            '<div class="s9-stage-center">'+
              '<div class="s9-center-buttons">'+
                '<button id="s9-start" class="s9-btn">BAŞLAT</button>'+
                '<button id="s9-step" class="s9-btn">ADIM</button>'+
                '<button id="s9-stop" class="s9-btn">DUR</button>'+
                '<button id="s9-reset" class="s9-btn">SIFIRLA</button>'+
              '</div>'+
              '<div class="s9-center-info"><span id="s9-status"></span></div>'+
            '</div>'+
          '</div>'+
        '</div>'+
        '<div class="s9-side-col">'+
          '<div class="s9-sb" id="s9-tabs">'+
            '<div class="s9-page" id="s9-page-controls"></div>'+
          '</div>'+
        '</div>'+
      '</div>';
    try{ S9_initState(); S9_buildUI(); S9_render(); }catch(e){ console.error('S9 init error',e); root.innerHTML='<div style="padding:20px">9. bölüm yüklenemedi.</div>'; }
    var b;
    b=document.getElementById('s9-start'); if(b) on(b,'click',function(){ S9_start(); });
    b=document.getElementById('s9-stop'); if(b) on(b,'click',function(){ S9_stop(); });
    b=document.getElementById('s9-step'); if(b) on(b,'click',function(){ S9_stepOnce(); });
    b=document.getElementById('s9-reset'); if(b) on(b,'click',function(){ S9_stop(); S9_initState(S9_newSeed()); S9_buildUI(); S9_render(); });
    mounted=true;
  };
  window.S9_unmount=function(){ if(!mounted) return; try{ S9_stop(); }catch(e){} offAll(); var root=document.getElementById('s9-root'); if(root){ root.innerHTML=''; root.hidden=true; } mounted=false; };
})();


