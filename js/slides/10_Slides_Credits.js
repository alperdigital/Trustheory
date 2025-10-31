SLIDES.push({
	id: "credits",
	onstart: function(self){
		var o = self.objects;
		self.add({ id:"bg", type:"Background", color:"#111" });

		// Visual: fades in
		self.add({ id:"vision", type:"ImageBox", src:"assets/ch11/prophecy.webp", x:110, y:40, width:740, height:360 });
		_hide(self.objects.vision); _fadeIn(self.objects.vision, 1200);

		// Title line
		self.add({ id:"t1", type:"TextBox", x:0, y:420, width:960, height:40, align:"center", size:28, color:"#fff",
			text:"İçinizden biri bana ihanet edecek" });
		_hide(self.objects.t1); _fadeIn(self.objects.t1, 600);

		// Sub lines
		self.add({ id:"t2", type:"TextBox", x:0, y:460, width:960, height:28, align:"center", size:18, color:"#ddd",
			text:"Bir kehanet mi? Yoksa arkasında bir matematik var mı?" });
		self.add({ id:"t3", type:"TextBox", x:0, y:488, width:960, height:28, align:"center", size:16, color:"#bbb",
			text:"Devamı gelecek ..." });

		// Support / Contact
		self.add({ id:"support", type:"TextBox", x:0, y:430, width:960, height:100, align:"center", size:16, color:"#fff",
			text:"<br><br><br><br><br>Destek olarak bu gibi projelerin devamının gelmesini istersen &amp; benimle çalışmak istersen bana buradan ulaşabilirsin. <strong>Alperdigital:</strong> <a href=\"https://wa.me/905071353025\" target=\"_blank\" style=\"color:#2a9d8f\">wa.me/905071353025</a>" });
	}
});