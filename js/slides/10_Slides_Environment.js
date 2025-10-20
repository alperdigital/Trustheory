SLIDES.push({

	id: "environment",
	onstart: function(self){
		// Mount isolated iframe for 11th section (fully sandboxed globals)
		var sandbox = createIsolatedRuntime({
			src: "env11.html",
			width: 1000,
			height: 600,
			left: 0,
			top: 0
		});
		self.dom.appendChild(sandbox.iframe);
		self.objects.environment_sandbox = sandbox;
		
		// Environment explanation text (kept outside iframe)
		self.add({ id:"label_environment", type:"TextBox", x:55, y:470, width:900, align:"left", text_id: "environment_explanation" });
		
	},
	onend: function(self){
		if (self.objects.environment_sandbox) {
			self.objects.environment_sandbox.destroy();
			delete self.objects.environment_sandbox;
		}
		self.clear();
	}

});