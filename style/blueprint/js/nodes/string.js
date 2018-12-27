Blueprint.Worker.add('string',{
	params: {
		name: 'String',
		description: 'Строка',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		type: 'round',
		vars: {
			input: {
				input: {
					enableChange: true,
					varType: 'round',
					color: '#ddd'
				},
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
			var input  = this.getValue('input',true);
			var output = this.getDefault('output', 'output')

				output = input ? input + output : output;

			this.setValue('output', output);
		}
	}
});