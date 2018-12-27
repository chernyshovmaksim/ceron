Blueprint.Worker.add('vtc_clear',{
	params: {
		name: 'VTC Clear',
		description: 'Чистит код от атрибутов data-vcid',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'vtc',
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
			var value = this.getValue('input').join("");

				value = value.replace(new RegExp(' data-vcid=\"[^\"]+\"', 'gi'), '');
			
			this.setValue('output',value);
		}
	}
});