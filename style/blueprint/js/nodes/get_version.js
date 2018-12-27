Blueprint.Worker.add('get_version',{
	params: {
		name: 'Get version',
		description: 'Получить версию изменений',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		type: 'round',
		vars: {
			input: {
				
			},
			output: {
				output: {
					name: '',
					varType: 'round',
					color: '#ddd'
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
	},
	working: {
		start: function(){
			
		},
		build: function(event){
			if(Ceron.cache.build_version == undefined){
				Ceron.cache.build_version = Math.round(Math.random() * 1e10);
			}

			this.setValue('output', Ceron.cache.build_version || 1);
		}
	}
});