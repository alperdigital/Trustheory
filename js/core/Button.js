Loader.addToManifest(Loader.manifest,{

	// SFX
	button1: "assets/sounds/button1.mp3",
	button2: "assets/sounds/button2.mp3",
	button3: "assets/sounds/button3.mp3"

});

function Button(config){

	var self = this;
	self.id = config.id;
	self.config = config;

	// Create DOM
	var button = document.createElement("div");
	button.className = "object";
	button.classList.add("button");
	if(config.size) button.setAttribute("size", config.size);
	self.dom = button;

	// TOOLTIP?
	if(config.tooltip){
		self.dom.style.width = 190;
		self.dom.style.height = 55;
		self.dom.style.position = "absolute";
		self.dom.setAttribute("data-balloon-length", "large");
		self.dom.setAttribute("data-balloon", Words.get(config.tooltip));
		self.dom.setAttribute("data-balloon-pos", "left");
	}

	// BG
	var bg = document.createElement("div");
	bg.id = "background";
	var text = document.createElement("div");
	text.id = "text";
	var hitbox = document.createElement("div");
	hitbox.id = "hitbox";
	button.appendChild(bg);
	button.appendChild(text);
	button.appendChild(hitbox);

	// Customize DOM
	button.style.left = config.x+"px";
	button.style.top = config.y+"px";
	self.setText = function(text_id){
		var words = Words.get(text_id);
		if(config.uppercase) words = words.toUpperCase();
		self.setText2(words);
	};
	self.setText2 = function(words){
		text.innerHTML = words;
	};
	self.setText(config.text_id);

	// On hover...
	hitbox.onmouseover = function(){
		if(self.active) button.setAttribute("hover","yes");
	};
	hitbox.onmouseout = function(){
		if(self.active) button.removeAttribute("hover");
	};

	// Click handler function (shared by click and touch events)
	var isHandling = false; // Flag to prevent double-firing
	var handleClick = function(e){
		// Prevent double-firing
		if(isHandling) return;
		isHandling = true;
		
		if(parseFloat(getComputedStyle(self.dom).opacity)<0.5){
			isHandling = false;
			return; // DON'T CLICK INVISIBLE BUTTONS
		}

		if(self.active){

			// Sound!
			if(config.sound){
				Loader.sounds[config.sound].play();
			}else{
				var num = Math.ceil(Math.random()*3);
				Loader.sounds["button"+num].play();
			}

			// Actual Logic
			if(config.onclick) config.onclick();
			if(config.message) publish(config.message);

		}
		
		// Reset flag after a short delay to allow legitimate separate clicks
		setTimeout(function(){ isHandling = false; }, 300);
	};

	// On click (desktop/mouse)
	hitbox.onclick = function(e){
		handleClick(e);
	};

	// Touch events for mobile/iPad/touchscreen compatibility
	var touchStartY = null;
	var touchStartTime = null;
	
	hitbox.addEventListener('touchstart', function(e){
		if(self.active && !self.dom.hasAttribute('deactivated')){
			touchStartY = e.touches[0].clientY;
			touchStartTime = Date.now();
			self.dom.setAttribute('hover', 'yes'); // Visual feedback
		}
	}, {passive: true});
	
	hitbox.addEventListener('touchend', function(e){
		if(!self.active || self.dom.hasAttribute('deactivated')){
			self.dom.removeAttribute('hover');
			return;
		}
		
		var touchEndY = e.changedTouches[0].clientY;
		var touchDuration = Date.now() - (touchStartTime || Date.now());
		var touchDistance = Math.abs(touchEndY - (touchStartY || touchEndY));
		
		// Only trigger if touch was quick and didn't scroll much (prevent scroll interference)
		if(touchDuration < 300 && touchDistance < 10){
			// Don't preventDefault - let both touch and click events work
			// Flag will prevent double-firing
			handleClick(e);
		}
		self.dom.removeAttribute('hover');
		touchStartY = null;
		touchStartTime = null;
	}, {passive: true});

	// Activate/Deactivate
	self.active = true;
	self.activate = function(){
		self.active = true;
		button.removeAttribute("deactivated");
	};
	self.deactivate = function(){
		self.active = false;
		button.setAttribute("deactivated","yes");
		button.removeAttribute("hover");
	};
	if(config.active===undefined) config.active=true;
	if(!config.active) self.deactivate();

	// Listeners!
	if(self.id){
		listen(self, self.id+"/activate", self.activate);
		listen(self, self.id+"/deactivate", self.deactivate);
	}

	// Add & Remove
	self.add = function(){ _add(self); };
	self.remove = function(){
		unlisten(self);
		_remove(self);
	};

}