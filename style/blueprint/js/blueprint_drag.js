Blueprint.classes.Drag = function(){
	this.callbacks = [];
	this.enable    = true;

	var drag = {
		active: false,
		start: {
			x: 0,
			y: 0
		},
		move: {
			x: 0,
			y: 0
		},
		dif: {
			x: 0,
			y: 0
		}
	} 

	var self = this;

	var stop = function(e){
		drag.active = false;

		self.callbacks = [];

		self.dispatchEvent({type: 'stop', drag: drag})
	}

	$(document).mouseup(stop).mousedown(function(e) {
    	drag.start.x = e.pageX;
    	drag.start.y = e.pageY;

    	drag.move.x = e.pageX;
    	drag.move.y = e.pageY;

		drag.active = true;

		self.dispatchEvent({type: 'start', drag: drag})
    }).mousemove(function(e) {
        var ww = window.innerWidth,
            wh = window.innerHeight;

        if(drag.active && (e.pageY > wh-10 || e.pageY < 10 || e.pageX > ww-10 || e.pageX < 10)) stop(e)

        drag.dif = {
    		x: drag.move.x - e.pageX,
    		y: drag.move.y - e.pageY,
    	}

    	drag.move.x = e.pageX;
    	drag.move.y = e.pageY;

        if(drag.active == false || !self.callbacks.length) return
        else{
        	self.dispatchEvent({type: 'drag', drag: drag})

        	if(self.enable){
	            for(var i = 0; i < self.callbacks.length; i++){
	            	self.callbacks[i](drag.dif, drag.start, drag.move)
	            }
	        }
        }
    });
}

Object.assign( Blueprint.classes.Drag.prototype, EventDispatcher.prototype, {
	add: function(call){
		this.callbacks.push(call)
	},
	has: function(call){
		if(this.callbacks.indexOf(call) >= 0) return true;
	},
	remove: function(call){
		Arrays.remove(this.callbacks,call)
	},
	clear: function(){
		this.callbacks = [];
	}
})