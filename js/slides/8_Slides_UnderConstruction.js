SLIDES.push({
	id: "under_construction",
	onstart: function(self){
		
		// Ana başlık
		self.add({
			id:"title", type:"TextBox",
			x:50, y:100, width:700, size:40, color:"#ff6b35", align:"center",
			text:"🚧 Yapım Aşamasında 🚧"
		});
		
		// Açıklama metni
		self.add({
			id:"description", type:"TextBox",
			x:50, y:200, width:700, size:24, align:"center",
			text:"Bu bölüm şu anda geliştirilme aşamasındadır.<br><br>Yakında daha fazla içerik eklenecek!"
		});
		
		// Devam et butonu
		self.add({
			id:"button_continue", type:"Button",
			x:350, y:350, size:"long",
			text:"Sıradaki Bölüme Geç →",
			message: "slideshow/next"
		});
		
	},
	onend: function(self){
		self.clear();
	}
});
