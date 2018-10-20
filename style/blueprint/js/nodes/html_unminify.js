Blueprint.Worker.add('html_unminify',{
	params: {
		name: 'Html Unminify',
		description: 'Перевод html в читабельный вид',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'function',
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

				value = nw.beautify_html(value, { indent_size: 4, space_in_empty_paren: true })
			
			this.setValue('output',value);
		}
	}
});