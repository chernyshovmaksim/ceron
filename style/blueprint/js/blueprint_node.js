Blueprint.classes.Node = function(uid){
	this.uid    = uid;
	this.data   = Blueprint.Data.get().nodes[uid];
	this.worker = Blueprint.Worker.get(this.data.worker);
	this.params = this.worker.params;

	this.position = {
		x: 0,
		y: 0
	}

	this.init();
}
Object.assign( Blueprint.classes.Node.prototype, EventDispatcher.prototype, {
	fire: function(name,add){
		if(this.worker.on[name]) this.worker.on[name]({
			target: this,
			data: this.data.userData,
			add: add
		})
	},
	create: function(){
		this.data.position = Blueprint.Utility.snapPosition(this.data.position);

		this.setPosition();

		this.fire('create');
	},
	init: function(){
		var self = this;

		var title = [
			'<div class="blueprint-node-title" style="'+(this.params.titleColor ? 'color:' + this.params.titleColor : '')+'">',
                this.params.name,
                '<span class="display-subtitle"></span>',
            '</div>',
		].join('');

		this.node = $([
			'<div class="blueprint-node '+(this.params.type || '')+'" id="'+this.data.uid+'">',
                (this.params.type == 'round' ? '' : title),

                '<div class="blueprint-node-vars">',
                    '<div class="vars input"></div>',
                    (this.params.type == 'round' ? '<div class="display"><span class="display-title"></span><span class="display-subtitle"></span></div>' : ''),
                    '<div class="vars output"></div>',
                '</div>',
            '</div>',
		].join(''));

		if(this.params.saturation){
			Blueprint.Image.saturation('style/blueprint/img/node.png', this.params.saturation, this.params.alpha || 1 ,function(base){
				self.node.css({
					backgroundImage: 'url('+base+')'
				})
			})
		}


		this.addVars('input');
		this.addVars('output');

		if(this.params.type == 'round'){
			$('.display-title',this.node).html(this.params.name)
		}

		this.addEvents();

		this.setPosition();

		$('.blueprint-container').append(this.node)

		this.fire('init');
	},
	addVars: function(entrance){
		var self = this;

		$.each(this.params.vars[entrance],function(name,params){
			if(params.displayInTitle){
				$('.display-subtitle', self.node).text('('+self.getValue(entrance, name)+')');
			}

			if(params.disableVisible) return;

			var variable, select,
				is_content = name == 'input' || name == 'output';

			var type      = is_content && !params.varType ? 'content' : params.varType || '',
				className = 'var var-' + entrance + '-' + name + ' ' + type;

			
			variable = $('<div><span>'+(params.name || '')+'<span class="display-var display-'+entrance+'-'+name+'">'+(params.display ? '('+self.getValue(entrance, name)+')' : '')+'</span></span></div>');
			select   = $('<i class="'+className+'"></i>');

			if(entrance == 'input') select.prependTo(variable);
			else                    select.appendTo(variable);

			variable.appendTo($('.vars.'+entrance,self.node));
			
			if(params.color){
				var img = type == 'content' ? 'node-content' : 'var';

				Blueprint.Image.color('style/blueprint/img/'+img+'.png',params.color,function(base){
					select.css({
						backgroundImage: 'url('+base+')'
					})
				})
			}

			select.on('mousedown',function(event){
				if(event.which == 3){
					self.outputRemove(name);
				}
				else{
					self.selectVar      = name;
					self.selectEntrance = entrance;

					Blueprint.Drag.add(self.drawConnection.bind(self))

					self.dispatchEvent({type: 'output', entrance: entrance, name: name})
				}
				
			})

			select.on('mouseup',function(){
				if(event.which == 3){
					self.inputRemove(name);
				}
				else{
					self.dispatchEvent({type: 'input', entrance: entrance, name: name})
				}
			})
			
		})
	},
	getValue: function(entrance, name){
		var value = this.data.varsData[entrance][name] || this.params.vars[entrance][name].value || '';

		this.dispatchEvent({type: 'getValue', entrance: entrance, name: name, value: value});

		return value;
	},
	setValue: function(entrance, name, value){
		this.data.varsData[entrance][name] = value;

		var params = this.params.vars[entrance][name];

		if(params.display) this.setDisplayInNode(entrance, name, value);

		if(params.displayInTitle) this.setDisplayInTitle(value);

		this.dispatchEvent({type: 'setValue', entrance: entrance, name: name, value: value})
	},
	setDisplayTitle: function(value){
		$('.display-title',this.node).html(value);
	},
	setDisplayInTitle: function(value){
		$('.display-subtitle',this.node).html('('+value+')');
	},
	setDisplayInNode: function(entrance, name, value){
		$('.display-'+entrance+'-'+name,this.node).html('('+value+')');
	},
	inputRemove: function(name){
		var parents = this.data.parents;

		for(var i = parents.length; i--;){
			var p = parents[i];

			if(p.input == name){
				Arrays.remove(parents,p);

				this.dispatchEvent({type: 'inputRemove', name: name})
			} 
		}
	},
	outputRemove: function(name){
		var nodes = Blueprint.Data.get().nodes,
			self  = this;

		$.each(nodes,function(uid,node){
			for(var i = node.parents.length; i--;){
				var p = node.parents[i];

				if(p.uid == self.uid && p.output == name){
					Arrays.remove(node.parents,p);

					self.dispatchEvent({type: 'outputRemove', name: name})
				}
			}
		})
	},
	checkLoop: function(){

	},
	addEvents: function(){
		var self = this;
		
		this.node.on('mousedown',function(event){
			if(!$(event.target).closest($('.var',self.node)).length) {
				if(event.which == 3){
					//self.remove();
				}
				else{
					self.dragStart();

					self.dispatchEvent({type: 'drag'});
				}
			}
		})

		this.node.on('click',function(event){
			if(!$(event.target).closest($('.var',self.node)).length) {
				self.dispatchEvent({type: 'select',worker: self.data.worker, uid: self.uid, data: self.data});

				self.fire('select');
			}
		})
	},
	showOptionAgain: function(){
		this.dispatchEvent({type: 'showOptionAgain',worker: this.data.worker, uid: this.uid, data: this.data});
	},
	remove: function(){
		this.node.remove();

		this.fire('remove');

		this.dispatchEvent({type: 'remove', uid: self.uid});
	},
	dragStart: function(){
		this.position.x = this.data.position.x;
		this.position.y = this.data.position.y;

		this.dragCall = this.drag.bind(this);

		Blueprint.Drag.add(this.dragCall);
	},
	dragRemove: function(){
		Blueprint.Drag.remove(this.dragCall);
	},
	drag: function(dif){
		this.position.x -= dif.x / Blueprint.Viewport.scale;
		this.position.y -= dif.y / Blueprint.Viewport.scale;

		var snap = {
			x: this.position.x,
			y: this.position.y
		}

		this.data.position = Blueprint.Utility.snapPosition(snap)

		this.setPosition();
	},
	drawConnection: function(dif,start,move){
		var ctx = Blueprint.Render.ctx;

		var min      = Math.min(100,Math.abs(move.y - start.y));
		var distance = Math.max(min,(move.x - start.x) / 2) * Blueprint.Viewport.scale;
		var variable = this.params.vars[this.selectEntrance][this.selectVar];
		var reverse  = move.x < start.x;

		var output = {
			x: reverse ? start.x - distance : start.x + distance,
			y: start.y
		}

		var input = {
			x: reverse ? move.x + distance : move.x - distance,
			y: move.y
		}

		ctx.beginPath();

		ctx.moveTo(start.x, start.y);
		ctx.bezierCurveTo(output.x, output.y, input.x, input.y, move.x, move.y);

		ctx.lineWidth   = 2;
		ctx.strokeStyle = this.selectVar == 'input' || this.selectVar == 'output' ? '#ddd' : variable.color || '#ff0000';

		ctx.stroke();

		this.dispatchEvent({type: 'connection'})
	},
	setPosition: function(){
		this.node.css({
			left: this.data.position.x + 'px',
			top: this.data.position.y + 'px'
		})

		this.dispatchEvent({type: 'position'})
	}
})
