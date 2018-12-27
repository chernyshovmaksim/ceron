Blueprint.Worker.add('join_reverse',{
	params: {
		name: 'Join Reverse',
		description: 'Объединить входные данные в один выход',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'blueprint',
		type: 'round',
		add_class: 'join',
		reverse: true,
		vars: {
			input: {
				input: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			},
			output: {
				output: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			event.target.setDisplayTitle('');
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			this.setValue('output',this.getValue('input'));
		}
	}
});