Blueprint.Worker.add('input',{
	params: {
		name: 'Input',
		description: 'Входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.22,
		category: 'blueprint',
		type: 'round',
		add_class: 'icon',
		vars: {
			input: {
				
			},
			output: {
				output: {}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var join = $('<i class="flaticon-exit"></i>');
				join.css({
					fontSize: '15px',
					color: '#ddd',
				});
				
			event.target.setDisplayTitle(join);
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			this.setValue('output', Blueprint.Vars.get(this.blueprintUid, 'input'));
		}
	}
});