Blueprint.Worker.add('variable',{
	params: {
		name: 'Variable',
		description: 'Переменная',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		type: 'round',
		vars: {
			input: {
				input: {
					enableChange: true,
					varType: 'round',
					color: '#ddd',
				},
			},
			output: {
				output: {
					name: '',
					enableChange: true,
					displayInTitle: true,
					varType: 'round',
					color: '#ddd',
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		close: function(){
			
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var input  = this.getValue('input',true).join('');
			var output = this.getDefault('output', 'output')
			var name   = input ? input + output : output;

			this.setValue('output', Variables.Get(name));
		}
	}
});