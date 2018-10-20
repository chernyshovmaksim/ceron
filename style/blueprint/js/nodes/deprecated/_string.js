Blueprint.Worker.add('string',{
	params: {
		name: 'String',
		description: 'Строка',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		titleColor: '#3e3729',
		category: 'text',
		type: 'round',
		vars: {
			input: {
				
			},
			output: {
				output: {
					name: '',
					enableChange: true,
					displayInTitle: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			this.setValue('output', this.getDefault('output', 'output'));
		}
	}
});