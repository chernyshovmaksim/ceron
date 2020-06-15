Blueprint.classes.Menu = function(){
	this.highlightRep = /<b class="highlight">(.*?)<\/b>/g,
	this.highlightAdd = '<b class="highlight">$1</b>';

	this.categorys = {
		blueprints: 'Blueprints',
		blueprint: 'Blueprint',
		function: 'Function',
		vtc: 'VTC',
		css: 'CSS',
		file: 'File',
		all: 'All'
	}

	this.menu  = $('#blueprint-menu');
	this.input = $('input',this.menu);
	this.list  = $('.blueprint-menu-list',this.menu);

	this.input.on('keyup',this.search.bind(this))

	var self = this;

	$(document).on('mousedown',function(e){
		if(!$( e.target ).closest( self.menu ).length){
			self.menu.hide();
		}
	})

	this.build();
}



Object.assign( Blueprint.classes.Menu.prototype, EventDispatcher.prototype, {
	show: function(cursor){
		var offset    = $('#blueprint-blueprints').offset(),
			winHeight = $(window).height(),
			position  = {
				x: cursor.x + offset.left,
				y: cursor.y + offset.top,
			};
		
		this.menu.css({
			left: position.x + 'px',
			top: position.y + 'px',
		}).show();

		var menuHeight = this.menu.outerHeight(),
			menuSize   = menuHeight + position.y + 20;

		if(menuSize > winHeight){
			this.menu.css({top: (position.y - (menuSize - winHeight)) + 'px'});
		}

		this.input.focus();

		this.input.val('');

		this.search()

		this.dispatchEvent({type: 'show'})
	},
	select: function(name,data){
		this.hide()

		$('#blueprint-blueprints iframe.active').focus();

		this.dispatchEvent({type: 'select', name: name, data: data || {}})
	},
	build: function(){
		this.list.empty()

		var cats = {},
			self = this;

		$.each(this.categorys,function(category,name){
			cats[category] = $([
				'<li cat="'+category+'">',
					'<span class="cat">'+name+'</span>',
					'<ul></ul>',
				'</li>'
			].join(''))

			self.list.append(cats[category])
		})

		$.each(Blueprint.Worker.getAll(),function(name,params){
			if(params.params.inmenu !== undefined && !params.params.inmenu) return;

			if(params.params.category == 'none') return;

			var node = $('<li><span><replace><name>'+params.params.name+'</name></replace><br><small>'+Functions.Substring(params.params.description || '', 50)+'</small></span></li>'),
			//var node = $('<li><span>'+params.params.name+'</span></li>'),
				cat  = cats[params.params.category]; 

			node.on('click',function(){
				Blueprint.Menu.select(name)
			})

			if(params.params.category && cat){
				$('ul',cat).append(node)
			}
			else $('ul',cats.all).append(node)
		})

		this.dispatchEvent({type: 'build'})
	},
	search: function(){
		//надо бы транслит забабахать
		this.input.val(Functions.ToLatin(this.input.val()));

		var term      = this.input.val(),
			categorys = $(' > li',this.list),
			category,inner,txt;

		var self = this;

		categorys.each(function(){
			category = $(this);
			inner    = $('ul > li',category);

			var found = 0;

			inner.each(function(){
				li = $(this)

				txt = ($('name',li).html() || '').replace(self.highlightRep,'$1');

		        if(term !== ''){
			        txt = txt.replace(new RegExp('(' + term + ')', 'gi'), self.highlightAdd);
			    }
		          
		        $('replace',li).html('<name>'+txt+'</name>'); 

		        li.show();

		        if(term){
		        	if($('.highlight',li).length){
		        		found++;
		        	}
		        	else li.hide();
		        }
			})

			category.show()

			if(term && !found){
				category.hide()
			}          
		})

		this.dispatchEvent({type: 'search', search: term})
	},
	hide: function(){
		this.menu.hide();

		this.dispatchEvent({type: 'hide'})
	}
})