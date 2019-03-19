Blueprint.classes.Drag = function(){
	this.callbacks = [];
	this.enable    = true;
	this.sticking  = false;

	this.drag = {
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

	var calcSticking = (e)=>{
		var point = {
			x: e.pageX,
			y: e.pageY
		}

		if(this.sticking) point = Blueprint.Utility.checkSticking(this.sticking, point).point;

		return point;
	}


	$(document).mouseup((e)=>{
		this.stop(e);
	}).mousedown((e)=> {
		var stic = calcSticking(e);

    	this.drag.start.x = stic.x;
    	this.drag.start.y = stic.y;

    	this.drag.move.x = stic.x;
    	this.drag.move.y = stic.y;

		this.drag.active = true;

		this.dispatchEvent({type: 'start', drag: this.drag})
    }).mousemove((e)=> {
        var ww = window.innerWidth,
            wh = window.innerHeight;

        var stic = calcSticking(e);

        if(this.drag.active && (stic.y > wh-10 || stic.y < 10 || stic.x > ww-10 || stic.x < 10)) this.stop(e)

        this.drag.dif = {
    		x: this.drag.move.x - stic.x,
    		y: this.drag.move.y - stic.y,
    	}

    	this.drag.move.x = stic.x;
    	this.drag.move.y = stic.y;

        if(this.drag.active == false || !this.callbacks.length) return
        else{
        	this.dispatchEvent({type: 'drag', drag: this.drag})

        	if(this.enable){
	            for(var i = 0; i < this.callbacks.length; i++){
	            	this.callbacks[i](this.drag.dif, this.drag.start, this.drag.move)
	            }
	        }

	        this.dispatchEvent({type: 'drag-after', drag: this.drag})
        }
    });
}

Object.assign( Blueprint.classes.Drag.prototype, EventDispatcher.prototype, {
	add: function(call){
		this.callbacks.push(call)
	},
	get: function(){
		return this.drag;
	},
	has: function(call){
		if(this.callbacks.indexOf(call) >= 0) return true;
	},
	remove: function(call){
		Arrays.remove(this.callbacks,call)
	},
	clear: function(){
		this.callbacks = [];
	},
	setSticking: function(sticking){
		this.sticking = sticking;
	},
	stop: function(e){
		this.drag.active = false;

		this.callbacks = [];
		this.sticking  = [];

		this.dispatchEvent({type: 'stop', drag: this.drag})
	}
})