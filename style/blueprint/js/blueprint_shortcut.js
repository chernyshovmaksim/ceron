Blueprint.classes.Shortcut = function(){
	this.shortcuts = [];

	$(window).on('keydown',this._down.bind(this));
}

Object.assign( Blueprint.classes.Shortcut.prototype, EventDispatcher.prototype, {
	add: function(key,callback){
		this.shortcuts.push({
			key: key,
			callback: callback
		})
	},
	_down: function(e){
		var key  = this._decode(e.keyCode);
		var ctrl = e.ctrlKey;

		$.each(this.shortcuts,function(i,shortcut){
			var combination = shortcut.key.split('+');
			var pressed     = true;

			$.each(combination,function(a,combo){
				if(combo == 'Ctrl'){
					if(!ctrl) pressed = false;
				}
				else if(combo !== key) pressed = false;
			})

			if(pressed) shortcut.callback();
		})
	},
	_decode: function(key){
		var decode = {
			37: 'Left',
			39: 'Right',
			38: 'Up',
			40: 'Down',
			16: 'Shift'
		}

		if(decode[key]){
			return decode[key];
		}
		else return String.fromCharCode(key).toUpperCase();
	}
})