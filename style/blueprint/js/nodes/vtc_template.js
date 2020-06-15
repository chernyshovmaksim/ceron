Blueprint.Worker.add('vtc_template',{
	params: {
		name: 'VTC Template',
		description: 'Найти шаблон по его названию',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'none',
		deprecated: true,
		vars: {
			input: {
				template: {
					name: 'template',
					color: '#ddd',
					displayInTitle: true,
					allowed: ['string'],
					placeholder: 'Название шаблона'
				}
			},
			output: {
				output: {
					name: '',
					varType: 'round',
					color: '#ddd',
					allowed: ['vtc_template'],
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
		build: function(e){
			var name = this.getValue('template',true).join('');

			this.setValue('output', {template: name});
		}
	}
});