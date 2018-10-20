Blueprint.Worker.add('replace_var',{
	params: {
		name: 'Replace Var',
		description: 'Создает переменную для замены в функции Replace',
		saturation: 'hsl(29, 100%, 58%)',
		alpha: 0.33,
		category: 'function',
		vars: {
			input: {
				name: {
					name: 'name',
					color: '#ddd',
					display: true
				},
				value: {
					name: 'value',
					color: '#ddd'
				},
			},
			output: {
				var: {
					color: '#fdbe00',
					disableChange: true
				}
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var name  = this.getValue('name',true).join('');
			var value = this.getValue('value',true).join('')

			this.setValue('var', {
				name: name,
				value: value
			});
		}
	}
});