var App = {
	init: []
};

$(function(){
	for (var i = 0; i < App.init.length; i++) {
		var name = App.init[i];

		App[name]();
	}
});


/** Libs **/

