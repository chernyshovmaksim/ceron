Blueprint.classes.Selection = function(){
	this.selection = [];

	this.area = $('.blueprint-selection');
}

Object.assign( Blueprint.classes.Selection.prototype, EventDispatcher.prototype, {
	add: function(node){
		if(this.selection.indexOf(node) == -1){
			this.selection.push(node)

			this.dispatchEvent({type: 'add', node: node})
		}
	},
	remove: function(node){
		if(this.selection.indexOf(node) >= 0){
			Arrays.remove(this.selection, node);

			this.dispatchEvent({type: 'remove', node: node})
		}
	},
	clear: function(){
		this.selection = [];

		this.dispatchEvent({type: 'clear'})
	},
	select: function(node){
		this.clear();
		this.add(node);

		this.dispatchEvent({type: 'select', node: node})
	},
	drag: function(event){
		this.area.show();

		var x = event.drag.move.x - event.drag.start.x,
			y = event.drag.move.y - event.drag.start.y;

		var box = {
			left: x < 0 ? event.drag.move.x : event.drag.start.x,
			top: y < 0 ? event.drag.move.y : event.drag.start.y,
			width: x < 0 ? event.drag.start.x - event.drag.move.x : x,
			height: y < 0 ? event.drag.start.y - event.drag.move.y : y,
		}

		var viewport = {
			left: Blueprint.Utility.negative( Blueprint.Viewport.position.x - box.left / Blueprint.Viewport.scale ),
			top: Blueprint.Utility.negative( Blueprint.Viewport.position.y - box.top / Blueprint.Viewport.scale ),
			width: box.width / Blueprint.Viewport.scale,
			height: box.height / Blueprint.Viewport.scale,
		}

		this.area.css({
			left: box.left + 'px',
			top: box.top + 'px',
			width: box.width  + 'px',
			height: box.height + 'px'
		})

		this.dispatchEvent({type: 'drag', box: box, viewport: viewport})
	},
	stop: function(){
		this.area.hide()

		this.dispatchEvent({type: 'stop'})
	}
})