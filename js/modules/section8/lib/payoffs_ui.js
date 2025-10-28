// mod8 isolated Payoffs UI (clone of core PayoffsUI, writes to mod8_state.payoffs)
(function(){

    window.MOD8_PayoffsUI = function(config){

        var self = this;
        self.dom = document.createElement('div');
        self.dom.className = 'object';
        if(config && config.scale){ self.dom.style.transform = 'scale('+config.scale+','+config.scale+')'; }

        // Background image
        var bg = document.createElement('div');
        bg.style.backgroundImage = "url('assets/ui/payoffs_ui.png')";
        bg.style.width = '300px';
        bg.style.height = '300px';
        bg.style.backgroundSize = '100% 100%';
        self.dom.appendChild(bg);

        // Helper to create IncDec controls at positions, bound to mod8_state.payoffs
        function addIncDec(letter, x, y){
            var wrap = document.createElement('div');
            wrap.className = 'incdec';
            wrap.style.left = (x-64)+'px';
            wrap.style.top = (y-47)+'px';

            var num = document.createElement('div');
            num.className = 'incdec_num';
            wrap.appendChild(num);
            function setValue(v){ num.innerHTML = (v>0?'+':'')+v; }
            setValue(window.mod8_state.payoffs[letter]);

            var up = document.createElement('div'); up.className='incdec_control'; up.setAttribute('arrow','up');
            up.onclick=function(){ var v=window.mod8_state.payoffs[letter]+1; if(v>5) v=5; window.mod8_state.payoffs[letter]=v; setValue(v); };
            var down = document.createElement('div'); down.className='incdec_control'; down.setAttribute('arrow','down');
            down.onclick=function(){ var v=window.mod8_state.payoffs[letter]-1; if(v<-5) v=-5; window.mod8_state.payoffs[letter]=v; setValue(v); };
            wrap.appendChild(up); wrap.appendChild(down);

            self.dom.appendChild(wrap);
        }

        // Positions copied from core PayoffsUI (adjusted same as slides)
        addIncDec('R', 191, 127);
        addIncDec('R', 233, 127);

        addIncDec('T', 121, 197);
        addIncDec('S', 161, 197);

        addIncDec('S', 263, 197);
        addIncDec('T', 306, 197);

        addIncDec('P', 192, 268);
        addIncDec('P', 232, 268);

        self.remove = function(){ if(self.dom && self.dom.parentNode){ self.dom.parentNode.removeChild(self.dom); } };
    };

})();


