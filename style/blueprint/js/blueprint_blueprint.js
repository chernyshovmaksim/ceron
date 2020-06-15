Blueprint.classes.Blueprint = function(data){
	this.uid  = data.uid;
	this.data = data;
	
	this.tabs       = $('#blueprint-tabs');
	this.blueprints = $('#blueprint-blueprints');

	this.initTab();
	this.initWindow();
}

Object.assign( Blueprint.classes.Blueprint.prototype, EventDispatcher.prototype, {
	initTab: function(){
		var self = this;

	 	this.tab = $('<li class="active '+(this.uid == 'main' ? 'main' : '')+'" uid="'+this.uid+'"><span>'+this.data.name+'</span>'+(this.uid == 'main' ? '' : '<a></a>')+'</li>'); 

	 	this.closer = $('a',this.tab);

		this.tab.on('click',function(e){
			if($( e.target ).closest($('a',self.tab)).length){
				self.close();
			}
			else{
				self.active();
			}
			
		}).click()

		this.tabs.append(this.tab);
	},

	initViewport: function(){
		this.contentBlueprint.Triggers = BlueprintTriggers;
		this.contentBlueprint.Unclosed = this.unclosed.bind(this);
		this.contentBlueprint.Callback = Blueprint; //втуливаем ссылку тудой
		this.contentBlueprint.Initialization.viewport();
		this.contentBlueprint.Viewport.setScale(Config.config.interf_size / 100);
		this.contentBlueprint.Data.set(Blueprint.Program.nodeData(this.uid))
		this.contentBlueprint.Initialization.nodes();
		this.contentBlueprint.Initialization.helpers();
	},

	unclosed: function(uclosed){
		if(this.uid !== 'main'){
			if(uclosed){
				this.closer.hide();
			}
			else{
				this.closer.show();
			}
		}
	},

	initWindow: function(){
		var self = this;

		$('iframe',this.blueprints).removeClass('active');

		this.blueprint = $('<iframe src="blueprint.html" class="active" id="'+this.uid+'"></iframe>')

		this.blueprint.on('load',function(){
			self.contents         = self.blueprint.contents();

			self.contentBlueprint = $('#blueprint-blueprints #' + self.uid)[0].contentWindow.Blueprint; //не знаю, зато млин так работает, маджик!

			self.initViewport();
		})

		this.blueprints.append(this.blueprint);
	},

	close: function(){
		this.contentBlueprint.Close();

		this.tab.remove();

		this.blueprint.remove();

		this.dispatchEvent({type: 'close'});
	},

	remove: function(){
		this.contentBlueprint.Close();

		this.tab.remove();

		this.blueprint.remove();

		this.dispatchEvent({type: 'remove'});
	},

	active: function(){
		$('li',this.tabs).removeClass('active');

		$('iframe',this.blueprints).removeClass('active');

		$(this.tab).addClass('active');

		$(this.blueprint).addClass('active');

		this.dispatchEvent({type: 'active'});
	},

	change: function(){
		$('#blueprint-tabs li[uid="'+this.uid+'"] span').text(this.data.name);

		this.dispatchEvent({type: 'change'});
	}	
})