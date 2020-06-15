Blueprint.Worker.add('string_change',{
	params: {
		name: 'String change',
		description: 'Проверяет изменилась ли строка',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'function',
		vars: {
			input: {
				data: {
					name: 'data',
					color: '#ddd',
					disableChange: true,
				},
			},
			output: {
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
				},
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
			var data = this.getValue('data',true).join('');

			if(this.data.userData.cache_uid == undefined) this.data.userData.cache_uid = Functions.Uid();

			var cache_name = 'string_' + this.data.userData.cache_uid,
				cache_data = Ceron.cache[cache_name];

			var change = false, data_hash = Functions.StringHash(data);

			if(cache_data !== data_hash){
				change = true;

				Ceron.cache[cache_name] = data_hash;
			}

			this.setValue('change', change);
		}
	}
});