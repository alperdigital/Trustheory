window.addEventListener("load",function(){

	// Find the "sharing" dom
	var sharingDOM = document.body.querySelector("sharing");

	// URL encodeable
	var title = sharingDOM.getAttribute("title");
	var text = sharingDOM.getAttribute("text");
	var link = sharingDOM.getAttribute("link");
	text = encodeURIComponent(text);
	link = encodeURIComponent(link);

	// Create full html
	var sharing = document.createElement("div");
	sharing.className = "sharing";
	sharing.innerHTML = '<a href="https://github.com/alperdigital" title="GitHub" target="_blank"><img alt="GitHub" src="social/facebook.png"></a>'+
						'<a href="https://x.com/alperdigital" target="_blank" title="X (Twitter)"><img alt="X (Twitter)" src="social/twitter.png"></a>'+
						'<a href="mailto:alperdigital@icloud.com?subject='+title+'&body='+text+" "+link+'" target="_blank" title="Send email"><img alt="Send email" src="social/email.png"></a>';

	// Replace it in the dom
	sharingDOM.parentNode.replaceChild(sharing, sharingDOM);

});