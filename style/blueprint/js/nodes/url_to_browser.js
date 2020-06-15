Blueprint.Worker.add('url_to_browser',{
	params: {
		name: 'Add link to browser',
		description: 'Добовляет сылку в адресную строку браузера',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'all',
		type: 'round',
		vars: {
			input: {
				input: {
					enableChange: true,
					varType: 'round',
					color: '#ddd'
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
			var url  = this.getValue('input',true).join('');
			
			if(Data.lastUrls.indexOf(url) == -1){
				Arrays.insert(Data.lastUrls, 0, url);

				File.DrawUrls();
			}
			
		}
	}
});