SLIDES.push({

	id: "environment",
	onstart: function(self){
		// Isolated iframe for Environment (fully sandboxed)
		var iframe = document.createElement("iframe");
		iframe.src = "env11.html";
		iframe.width = 500;
		iframe.height = 500;
		iframe.style.border = "0";
		iframe.style.position = "absolute";
		iframe.style.left = (-20)+"px";
		iframe.style.top = (-20)+"px";
		iframe.setAttribute("allowtransparency","true");
		self.dom.appendChild(iframe);
		self.objects.environment_iframe = { remove: function(){ self.dom.removeChild(iframe); } };
		
		// Environment explanation text (kept outside iframe)
		self.add({ id:"label_environment", type:"TextBox", x:55, y:470, width:900, align:"left", text_id: "environment_explanation" });
		
	},
	onend: function(self){
		self.clear();
	}

});