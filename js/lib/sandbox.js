// Simple iframe sandbox creator so isolated globals can be used safely
// Usage: var sb = createIsolatedRuntime({ src:"env11.html", width:500, height:500, left:-20, top:-20 });
// Then append sb.iframe to a container. Call sb.destroy() on cleanup.

(function(){
	window.createIsolatedRuntime = function(opts){
		var o = opts||{};
		var iframe = document.createElement("iframe");
		iframe.src = o.src || "env11.html";
		iframe.width = (o.width!=null? o.width : 500);
		iframe.height = (o.height!=null? o.height : 500);
		iframe.style.border = "0";
		iframe.style.position = "absolute";
		iframe.style.left = ((o.left!=null? o.left : 0))+"px";
		iframe.style.top = ((o.top!=null? o.top : 0))+"px";
		iframe.setAttribute("allowtransparency","true");

		var api = {
			iframe: iframe,
			post: function(type, payload){
				try{ iframe.contentWindow.postMessage({ type:type, payload:payload }, "*"); }catch(e){}
			},
			destroy: function(){
				if(iframe.parentNode) iframe.parentNode.removeChild(iframe);
			}
		};

		return api;
	};
})();


