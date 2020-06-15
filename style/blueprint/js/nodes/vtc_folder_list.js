Blueprint.Worker.add('vtc_folder_list',{
	params: {
		name: 'VTC Folder List',
		description: 'Выводит название шаблонов из указанной папки VTC Templates',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'vtc',
		vars: {
			input: {
				folder: {
					name: 'folder',
					color: '#ddd',
					placeholder: 'Название папки'
				},
			},
			output: {
				output: {

				}
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
			var folder    = this.getValue('folder',true).join('');
			var templates = [];

			if(folder){
				var search = Functions.SeachTPL('title',folder);

				if(search && search.childList){
					search.childList.map(function(a){
						templates.push(a.data.title);
					})
				}

				this.setValue('output', templates);
			}
		}
	}
});