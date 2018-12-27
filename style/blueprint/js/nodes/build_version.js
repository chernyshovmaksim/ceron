Blueprint.Worker.add('build_version',{
	params: {
		name: 'Build version',
		description: 'Генерирует хеш, если сработал тригер изменения',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		vars: {
			input: {
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
			},
			output: {
				
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
			var change = Blueprint.Utility.onChange(this.getValue('change',true));

			if(change){
				Ceron.cache.build_version = Math.round(Math.random() * 1e10);
			}
		}
	}
});