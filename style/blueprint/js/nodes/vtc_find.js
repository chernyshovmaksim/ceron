Blueprint.Worker.add('vtc_find',{
	params: {
		name: 'VTC Find',
		description: 'Найти VTC нод',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'none',
		deprecated: true,
		vars: {
			input: {
				id: {
					name: 'find',
					color: '#ff7d63',
					disableChange: true,
					allowed: ['vtc_find'],
					maxConnections: 1
				},
				custom: {
					name: 'custom',
					color: '#ddd',
					displayInTitle: true,
					disableVisible: true,
					placeholder: 'UID нода'
				}
			},
			output: {
				output: {
					name: '',
					varType: 'round',
					color: '#ff7d63',
					allowed: ['vtc_find']
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
			var id     = this.getValue('id');
			var custom = this.getValue('custom',true).join('');
			
			var find = [];

			if(id.length) find.push(id);
			if(custom)    find.push({find: custom});

			this.setValue('output', find);
		}
	}
});