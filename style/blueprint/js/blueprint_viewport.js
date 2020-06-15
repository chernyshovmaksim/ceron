Blueprint.classes.Viewport = function(){
	this.scale = 1;

	this.position = {
		x: 0,
		y: 0
	}

	this.cursor = {
		x: 0,
		y: 0
	}

    this.timer_resize;

	this.zoom = $('.blueprint-zoom');
	this.wrap = $('.blueprint-wrap');
	this.body = $('body');

	var self = this;

    $(document).mouseup(function(e) {
		
    }).mousedown(function(e) {
    	if(!$(e.target).closest($('.blueprint-node,.blueprint-helper')).length) {
    		Blueprint.Drag.add(self.drag.bind(self));
		}
    }).mousemove(function(e) {
        self.cursor.x = e.pageX;
        self.cursor.y = e.pageY;
    }).on('mousewheel',this.mousewheel.bind(this))
}

Object.assign( Blueprint.classes.Viewport.prototype, EventDispatcher.prototype, {
    mousewheel: function(e){
        e.preventDefault();

        var delta = e.originalEvent.wheelDelta ? e.originalEvent.wheelDelta/120 : -e.originalEvent.detail/3;
            delta *= 0.120;


        var zoom = 1.1 - (delta < 0 ? 0.2 : 0);
            
        var newscale = Math.max(0.1,Math.min(2,this.scale * zoom));

        var mx = -this.cursor.x;
        var my = -this.cursor.y;
        
        this.position.x = Math.round(mx / this.scale + this.position.x - mx / newscale);
        this.position.y = Math.round(my / this.scale + this.position.y - my / newscale);
        
        this.scale = newscale;
        
        this.zoom.css({
            transform: 'scale('+this.scale+')',
            transformOrigin: '0 0'
        })

        this.drag({x: 0, y: 0})

        this.dispatchEvent({type: 'zoom'})
    },
    setScale: function(scale){
        this.scale = scale;

        this.zoom.css({
            transform: 'scale('+this.scale+')',
            transformOrigin: '0 0'
        })

        this.dispatchEvent({type: 'zoom'})
    },
    drag: function(dif){
        this.position.x -= dif.x / this.scale;
        this.position.y -= dif.y / this.scale;

        this.wrap.css({
            left: this.position.x + 'px',
            top: this.position.y + 'px'
        })

        /** 
         * Магия чуваки!
         * После движения, все блюрится, но!
         * Если потом сделать заново зум, то все отлично.
        **/

        clearTimeout(this.timer_resize)

        this.zoom.css({
            transform: 'scale('+(this.scale * 0.99999)+')',
            transformOrigin: '0 0'
        })

        this.timer_resize = setTimeout(()=>{
            this.zoom.css({
                transform: 'scale('+this.scale+')',
                transformOrigin: '0 0'
            })
        },100)

        /*
        this.body.css({
            backgroundPosition: Math.round(this.position.x) + 'px ' + Math.round(this.position.y) + 'px'
        })
        */

        this.dispatchEvent({type: 'drag'})
    }
})