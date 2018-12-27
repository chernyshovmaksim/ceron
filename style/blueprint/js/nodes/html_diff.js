Blueprint.Worker.add('html_diff',{
	params: {
		name: 'Html Diff',
		description: 'Заменят HTML в браузере если он был изменен',
		saturation: 'hsl(84, 0%, 100%)',
		alpha: 0.78,
		category: 'function',
		titleColor: '#444',
		vars: {
			input: {
				input: {
					name: 'html',
					disableChange: true
				},
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				}
			},
			output: {
				
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
			var input  = this.getValue('input').join('');
			var change = this.isAnyTrue(this.getValue('change'));

			if(change) Raid.ReplaceBody(input);

			this.setValue('change',change);
		}
	}
});