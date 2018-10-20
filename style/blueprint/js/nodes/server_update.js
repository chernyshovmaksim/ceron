Blueprint.Worker.add('server_update',{
	params: {
		name: 'Browser Reload',
		description: 'Обновит страницу браузера, если simple или stream будет присвоено true',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'function',
		vars: {
			input: {
				simple: {
					name: 'simple',
					color: '#7bda15',
					disableChange: true,
				},
				stream: {
					name: 'stream',
					color: '#7bda15',
					disableChange: true,
				},
				files: {
					name: 'files',
					color: '#ddd',
					type: function(entrance, group, name, params, event){
						var input = $([
							'<div class="form-input">',
								'<textarea rows="6" name="'+name+'" placeholder="Перечислите файлы с новой строки" />',
                            '</div>',
						].join(''))

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						input.find('textarea').val(event.target.getValue(entrance, name) || '');

						return input;
					}
				}
			},
			output: {
				simple: {
					name: 'event',
					color: '#7bda15',
					disableChange: true,
				},
				stream: {
					name: 'event',
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
			var simple = this.getValue('simple',true);
			var stream = this.getValue('stream',true);

			var se = sm = false;

			function check(arr){
				for (var i = 0; i < arr.length; i++) {
					var a = arr[i];

					if(Arrays.isArray(a)) check(a);
					else if(a) se = true;
				}
			}

			check(simple);

			for (var i = 0; i < stream.length; i++) {
				if(stream[i]) sm = true;
			}

			var files         = this.getValue('files'),
				files_default = this.getDefault('input','files');

			var files_reload = [];

			if(files.length) files_reload = files;
			else if(files_default){
				files_reload = files_default.split("\n");
			}

			if(se) Server.Reload();
			else if(sm) Server.Reload(files_reload);

			this.setValue('simple',se);
			this.setValue('stream',sm);
		}
	}
});