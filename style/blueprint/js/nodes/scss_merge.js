Blueprint.Worker.add('scss_merge',{
	params: {
		name: 'Extend',
		description: 'Объединить входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.62,
		category: 'none',
		vars: {
			input: {
				a: {
					name: 'from class',
					color: '#ddd',
					varType: 'round',
					disableChange: true
				},
				b: {
					name: 'to class',
					color: '#ddd',
					varType: 'round',
					disableChange: true
				},
			},
			output: {
				
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
			this.data.userData.input_a = this.getValue('a',true).join(', .');
			this.data.userData.input_b = this.getValue('b',true).join(', .');
		}
	}
});