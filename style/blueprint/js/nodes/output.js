Blueprint.Worker.add('output',{
	params: {
		name: 'Output',
		description: 'Исходящие данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.22,
		category: 'blueprint',
		type: 'round',
		add_class: 'icon',
		vars: {
			input: {
				input: {},
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var join = $('<i class="flaticon-login"></i>');
				join.css({
					fontSize: '15px',
					color: '#ddd',
					marginLeft: '2px'
				});
				
			event.target.setDisplayTitle(join);
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			Blueprint.Vars.set(this.blueprintUid, 'output', this.getValue('input'))
		}
	}
});