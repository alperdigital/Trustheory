window.mod8_getPayoff = function(a,b, P){
    var T=P.T,R=P.R,Pp=P.P,S=P.S; // rename to avoid shadow
    if(a==='C'&&b==='C') return R;
    if(a==='D'&&b==='D') return Pp;
    if(a==='D'&&b==='C') return T;
    if(a==='C'&&b==='D') return S;
    return 0;
};

