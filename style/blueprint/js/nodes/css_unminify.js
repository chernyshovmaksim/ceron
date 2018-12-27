Blueprint.Worker.add('css_unminify',{
	params: {
		name: 'Css Unminify',
		description: 'Перевод css в читабельный вид',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {
					disableChange: true
				},
			},
			output: {
				output: {
					disableChange: true
				},
			}
		},
		userData: {
			css_name: '',
			css_value: []
		}
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
			var value = this.getValue('input').join("\n");

				value = Generators.Build._unminify(value);
			
			this.setValue('output',value);
		}
	}
});