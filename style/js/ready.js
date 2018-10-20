$(document).ready(function(){
	//на всякий пожарный, вдруг видос не сработает
	var sure = setTimeout(function(){
		$('.layer-welcome').fadeOut(300);
		$('.layer-main').addClass('active');
	},6000)

	var welcome = document.getElementById("welcome");
		welcome.onended  = function() {
		    setTimeout(function(){
		        $('.layer-welcome').fadeOut(300);
		        $('.layer-main').addClass('active');
		    },500);

		    clearTimeout(sure);
		};

	$('#crash').hide();

	if(typeof Program == 'undefined'){
		$('#crash').show();
	}
	else{
	    $(window).resize(function(){
	        Layer.Resize();
	        Iframe.Resize();
	        PsdViewer.Resize();
	        Media.Resize();
	    })

	    Program.Init();
	}
});