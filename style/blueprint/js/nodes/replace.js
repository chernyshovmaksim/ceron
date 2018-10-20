Blueprint.Worker.add('replace',{
	params: {
		name: 'Replace',
		description: 'Заменяет переменную в строке, используя регулярное выражение {@varname}',
		saturation: 'hsl(139, 45%, 44%)',
		alpha: 0.67,
		category: 'function',
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
					disableChange: true
				},
				vars: {
					name: 'vars',
					color: '#fdbe00',
					disableChange: true
				},
			},
			output: {
				output: {

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
			var data = this.getValue('input',true).join('');
			var vars = this.getValue('vars',true);

			
			for (var i = 0; i < vars.length; i++) {
				var variable = vars[i];

				if(Arrays.isObject(variable)){
					data = data.replace(new RegExp('{@'+variable.name+'}',"g"), variable.value);
				}
			}

			this.setValue('output', data);
		}
	}
});