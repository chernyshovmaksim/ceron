Blueprint.Worker.add('scss_output',{
	params: {
		name: 'Output',
		description: '',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		titleColor: '#fdbe00',
		category: 'none',
		type: 'round',
		add_class: 'css',
		random_line_color: true,
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
					varType: 'round',
				}
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(event){
			
		},
		remove: function(event){
			
		},
		init: function(event){
			var data = event.target.data.userData;
			var working = parent.Blueprint.Worker.get('scss_input').working;

			event.target.node.dblclick(function(){
				working.rename({
					type: 'output',
					data: data,
					uid:  event.target.uid
				}, ()=>{
					event.target.setDisplayTitle('<i class="flaticon-layers" style="font-size: 15px; margin-right: 5px"></i>Output ('+(data.name || '...')+')');

					Blueprint.Render.draw();
				});
			})

			event.target.setDisplayTitle('<i class="flaticon-layers" style="font-size: 15px; margin-right: 5px"></i>Output ('+(data.name || '...')+')');
		}
	},
	working: {
		create: function(uid, data){
			
		},
		remove: function(uid){
			
		},
		start: function(){
			
		},
		build: function(){
			var data   = this.data.userData;
			var uid    = this.data.uid;
			var input  = this.getValue('input',true);

			if(data.name !== undefined){
				if(Data.vtc.scssEnters[data.name] == undefined) {
					Data.vtc.scssEnters[data.name] = {};
				}

				if(Data.vtc.scssEnters[data.name][uid] == undefined) {
					Data.vtc.scssEnters[data.name][uid] = [];
				}

				Data.vtc.scssEnters[data.name][uid] = input; 
			}
		}
	}
});