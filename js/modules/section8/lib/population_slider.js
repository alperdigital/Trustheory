// mod8 population controls using core Slider visuals & scaling logic like Sandbox
(function(){

    window.MOD8_buildPopulationWithSliders = function(container, map){

        // order mirrors Sandbox layout
        var order = ["TIT_FOR_TAT","DEFECTOR","COOPERATOR","GRUDGER","PROBER","TIT_FOR_TWO_TATS","PAVLOV","RANDOM"];
        var registry = {}; // { key: { amt, slider } }

        // read from state
        function read(){
            var dist = {COOPERATOR:0,RANDOM:0,TIT_FOR_TAT:0,TIT_FOR_TWO_TATS:0,GRUDGER:0,DEFECTOR:0,PAVLOV:0,PROBER:0};
            if(window.mod8_state && window.mod8_state.groups){ window.mod8_state.groups.forEach(function(g){ if(dist[g.strategy]!==undefined) dist[g.strategy]++; }); }
            return dist;
        }
        var current = read();
        var anchorKey = order[0];
        var anchorSnapshot = order.map(function(k){ return current[k]; });
        var anchorRemainder = 10 - current[anchorKey];
        function anchor(key){ anchorKey=key; anchorSnapshot = order.map(function(k){ return current[k]; }); anchorRemainder = 10 - current[key]; }
        function rebuild(){ var newGroups=[]; order.forEach(function(k){ for(var i=0;i<current[k];i++){ newGroups.push(mod8_makeGroup(k)); } }); window.mod8_state.groups=newGroups; window.mod8_state.round=0; mod8_renderUI(); refresh(); }
        function refresh(){
            order.forEach(function(k){
                var v=current[k];
                var el = document.getElementById('mod8-amt-'+k);
                if(el){ el.innerHTML = String(v); }
                try{ publish && publish('mod8/pop/'+k,[v]); }catch(e){}
            });
        }
        function adjust(key, value){
            value = Math.max(0, Math.min(10, Math.round(value)));
            current[key]=value; var newRemainder = Math.max(0, 10-value); var scale = (anchorRemainder>0)? (newRemainder/anchorRemainder) : 0;
            var total=value;
            for(var i=0;i<order.length;i++){ var k=order[i]; if(k===key) continue; var init=anchorSnapshot[i]; var nv=Math.round(init*scale); current[k]=nv; total+=nv; }
            var diff=10-total; if(diff!==0){ for(var i=0;i<order.length && diff!==0;i++){ var kk=order[i]; if(kk===key) continue; if(diff>0){ current[kk]++; diff--; } else if(diff<0 && current[kk]>0){ current[kk]--; diff++; } } }
            // update UI elements directly (knobs and labels)
            for(var j=0;j<order.length;j++){
                var kk = order[j]; var v = current[kk];
                var rec = registry[kk];
                if(rec){ if(rec.amt){ rec.amt.innerHTML = String(v); } if(rec.slider && typeof rec.slider.setValue==='function'){ rec.slider.setValue(v); } }
            }
            rebuild();
        }

        // build rows and sliders
        function rowY(i){ return 40 + Math.floor(i/2)*80; }
        function rowX(i){ return (i%2===0)? 0 : 220; }
        for(var i=0;i<order.length;i++){
            var sk = order[i]; var meta = map.find(function(r){ return r.strat===sk; }); if(!meta) continue;
            // wrap icon+label
            var popDOM = document.createElement('div'); popDOM.className='sandbox_pop'; popDOM.style.left = rowX(i)+'px'; popDOM.style.top=rowY(i)+'px'; container.appendChild(popDOM);
            var icon = document.createElement('div'); icon.className='sandbox_pop_icon'; icon.style.backgroundPosition = (-(meta.frame*40))+'px 0px'; popDOM.appendChild(icon);
            var name = document.createElement('div'); name.className='sandbox_pop_label'; name.innerHTML = (Words.get?Words.get(meta.label):meta.key).toUpperCase(); name.style.color=meta.color; popDOM.appendChild(name);
            var amt = document.createElement('div'); amt.className='sandbox_pop_label'; amt.style.textAlign='right'; amt.style.color=meta.color; popDOM.appendChild(amt);
            registry[sk] = registry[sk] || {}; registry[sk].amt = amt;
            amt.innerHTML = String(current[sk]||0);

            // slider
            (function(sk){ var msg='mod8/pop/'+sk; var slider = new Slider({ x: rowX(i), y: rowY(i)+35, width: 200, min:0, max:10, step:1, message: msg, onselect:function(){ anchor(sk); }, onchange:function(v){ adjust(sk,v); } }); slider.slideshow = { dom: container }; registry[sk]=registry[sk]||{}; registry[sk].slider = slider; slider.setValue(current[sk]||0); container.appendChild(slider.dom); })(sk);
        }

        // anchor default
        anchor(order[0]);
    };

})();


