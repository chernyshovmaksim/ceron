Blueprint.Worker.add('regex',{
	params: {
		name: 'Regexp',
		description: 'Находит и заменяет',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
				},
				find: {
					name: 'find',
					color: '#ddd',
					placeholder: 'Что найти'
				},
				replace: {
					name: 'replace',
					color: '#ddd',
					placeholder: 'На что заменить'
				},
				flag: {
					name: 'flag',
					color: '#ddd',
					value: 'gi'
				},
			},
			output: {
				output: {
					name: '',
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
			var input   = this.getValue('input',true).join('');
			var find    = this.getValue('find',true).join('');
			var replace = this.getValue('replace',true).join('');
			var flag    = this.getValue('flag',true).join('');

			input = input.replace(new RegExp(find, flag), replace);

			this.setValue('output', input);
		}
	}
});