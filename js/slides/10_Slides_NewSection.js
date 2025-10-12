SLIDES.push({
	id: "new_section",
	onstart: function(self){
		
		// Background
		self.add({ id:"bg", type:"Background", color:"#1a1a2e" });

		// Title
		self.add({
			id:"title", type:"TextBox",
			x:160, y:50, width:640, height:80, align:"center", size:36, color:"#fff",
			text_id:"new_section_title"
		});

		// Main content
		self.add({
			id:"content1", type:"TextBox",
			x:80, y:150, width:800, height:200, align:"left", size:18, color:"#e6e6e6",
			text_id:"new_section_content1"
		});

		// Interactive element or image
		self.add({
			id:"content2", type:"TextBox",
			x:80, y:370, width:800, height:100, align:"center", size:16, color:"#4089DD",
			text_id:"new_section_content2"
		});

		// Button to continue
		self.add({
			id:"button", type:"Button", x:427, y:466, 
			text_id:"new_section_btn", size:"short",
			message:"slideshow/next"
		});

	},
	onend: function(self){
		self.clear();
	}
});

SLIDES.push({
	onstart: function(self){
		
		// Background
		self.add({ id:"bg", type:"Background", color:"#16213e" });

		// Second slide content
		self.add({
			id:"text", type:"TextBox",
			x:160, y:100, width:640, height:300, align:"center", size:20, color:"#fff",
			text_id:"new_section_slide2"
		});

		// Button to go back to main menu or next section
		self.add({
			id:"button", type:"Button", x:427, y:466, 
			text_id:"new_section_btn2", size:"short",
			message:"slideshow/scratch"
		});

	},
	onend: function(self){
		self.clear();
	}
});
