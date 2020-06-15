Blueprint.classes.Helper = function(uid){
	this.uid    = uid;
	this.data   = Blueprint.Data.get().helpers[uid];
	
	this.position = {
		x: 0,
		y: 0
	}

	this.size = {
		width: 0,
		height: 0
	}

	this.init();
}
Object.assign( Blueprint.classes.Helper.prototype, EventDispatcher.prototype, {
	create: function(){
		this.data.position = Blueprint.Utility.snapPosition(this.data.position);

		this.setPosition();
	},
	init: function(){
		this.node = $([
			'<div class="blueprint-helper" id="'+this.data.uid+'">',
				'<div class="blueprint-helper-inner">',
	                '<div class="blueprint-helper-top">',
	                	'<div class="blueprint-helper-trigger"></div>',
	                    '<div class="blueprint-helper-title">'+this.data.title+'</div>',
	                    '<div class="blueprint-helper-close"></div>',
	                '</div>',
	                '<div class="blueprint-helper-resize"></div>',
                '</div>',
            '</div>',
		].join(''));

		this.trigger = $('.blueprint-helper-trigger',this.node);

		if(this.data.disable){
			this.trigger.addClass('off');
		}

		this.addEvents();

		this.setPosition();
		this.setSize();

		$('.blueprint-container').append(this.node)
	},
	addEvents: function(){
		var self = this;
		
		this.node.on('mousedown',function(event){
			if($(event.target).closest($('.blueprint-helper-resize',self.node)).length) {
				self.resizeStart();

				self.dispatchEvent({type: 'resize'});
			}
			else{
				self.dragStart();

				self.dispatchEvent({type: 'drag',event: event});
			}
		});

		this.node.on('click',function(event){
			self.dispatchEvent({type: 'select',worker: self.data.worker, uid: self.uid, data: self.data});
		});

		this.trigger.on('click', function(){
			$(this).toggleClass('off');

			self.data.disable = $(this).hasClass('off');
		})


		$('.blueprint-helper-close',this.node).on('click',function(){
			Blueprint.Triggers.remove(self.uid);

			self.dispatchEvent({type: 'remove'});

			self.remove();
		})

		//показываем окошко с настройками
		$('.blueprint-helper-title',this.node).dblclick(function(){
			Blueprint.Callback.Program.helperOption(self.data, ()=>{
				//обновляе титл
				$(this).text(self.data.title);

				//обновляем триггер
				self.setTrigger(self.data.trigger_global);
			})
		})

		//если удалили тригер, то показываем тригер обратно
		Blueprint.Triggers.addEventListener('remove',(event)=>{
			if(event.uid == this.uid){
				this.setTrigger(false);
			} 
		})

		//если поменяли статус, то и мы себе меняем статус
		Blueprint.Triggers.addEventListener('status',(event)=>{
			if(event.uid == this.uid){
				//записываем в реверсе
				this.data.disable = !event.status;

				this.trigger.removeClass('off');

				if(this.data.disable) this.trigger.addClass('off');
			} 
		})


		//если установлено глобально, но триггер удален, то показываем триггер
		if(this.data.trigger_global && !Blueprint.Triggers.get(this.uid)) this.setTrigger(false);

		//инициализируем
		this.setTrigger(self.data.trigger_global);

		this.node.mouseenter(function(e){
        	self.dispatchEvent({
        		type: 'mouseenter',
        		offset: self.node.offset(),
        		width:  self.node.outerWidth(),
        		height: self.node.outerHeight()
        	});
        }).mouseleave(function(){
        	self.dispatchEvent({type: 'mouseleave'});
        })
	},
	setTrigger: function(status){
		this.trigger.toggle(!status);
		this.data.trigger_global = status;
	},
	remove: function(){
		this.node.remove();
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
	drag: function(dif, move, start){
		var snap = {};

		snap.x = this.position.x - (move.x - start.x) / Blueprint.Viewport.scale;
		snap.y = this.position.y - (move.y - start.y) / Blueprint.Viewport.scale;

		this.data.position = Blueprint.Utility.snapPosition(snap);

		this.setPosition();
	},
	resizeStart: function(){
		this.size.width = this.data.size.width;
		this.size.height = this.data.size.height;

		this.resizeCall = this.resize.bind(this);

		Blueprint.Drag.add(this.resizeCall);
	},
	resize: function(dif){
		this.size.width -= dif.x / Blueprint.Viewport.scale;
		this.size.height -= dif.y / Blueprint.Viewport.scale;

		var snap = {
			x: this.size.width,
			y: this.size.height
		}
		
		if(Blueprint.snaped){
			snap.x = Blueprint.Utility.snapValue(snap.x);
			snap.y = Blueprint.Utility.snapValue(snap.y);
		}

		this.data.size.width  = snap.x;
		this.data.size.height = snap.y;

		this.setSize();
	},
	resizeRemove: function(){
		Blueprint.Drag.remove(this.resizeCall);
	},
	setPosition: function(){
		this.node.css({
			left: this.data.position.x + 'px',
			top: this.data.position.y + 'px'
		})

		this.dispatchEvent({type: 'position'})
	},
	setSize: function(){
		this.node.css({
			width: this.data.size.width + 'px',
			height: this.data.size.height + 'px'
		})
	}
})
