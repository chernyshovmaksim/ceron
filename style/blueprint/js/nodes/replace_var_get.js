Blueprint.Worker.add('replace_var_get',{
	params: {
		name: 'Get variable',
		description: 'Получить значение из переменной',
		saturation: 'hsl(29, 100%, 58%)',
		alpha: 0.33,
		category: 'function',
		vars: {
			input: {
				var: {
					name: 'variable',
					color: '#fdbe00',
					disableChange: true
				},
				name: {
					name: 'name',
					color: '#ddd',
					display: true
				}
			},
			output: {
				value: {
					color: '#ddd',
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
			var input = this.getValue('var');
			var value = [];

			input.map(function(a){
				if(Arrays.isObject(a)){
					if(a.name == name) value = a.value;
				}
			});

			this.setValue('value', value);
		}
	}
});