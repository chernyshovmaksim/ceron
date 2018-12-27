Blueprint.Worker.add('css_font_name',{
	params: {
		name: 'Font Name',
		description: 'Название шрифта',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {
					displayInTitle: true,
					enableChange: true,
					disableVisible: true
				}
			},
			output: {
				output: {},
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
			var name         = this.getValue('input'),
				name_default = this.getDefault('input','input');

			var value = '';

			if(name.length){
				if(name_default) name.push(name_default);

				value = name.join('-');
			}
			else if(name_default){
				value = name_default;
			}
			
			this.setValue('output',value);
		}
	}
});