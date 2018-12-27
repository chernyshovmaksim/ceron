Blueprint.Worker.add('css_google_font',{
	params: {
		name: 'Google Fonts',
		description: 'Подключение шрифта через сервис Google Fonts',
		saturation: 'hsl(151, 64%, 36%)',
		titleColor: '#ffffff',
		alpha: 0.87,
		category: 'css',
		vars: {
			input: {
				name: {
					name: 'name',
					color: '#ddd',
					display: true
				},
				types: {
					name: 'files',
					color: '#ddd',
					disableVisible: true,
					type: function(entrance, group, fieldname, params, event){
						var weights = {
					        'Thin': '100',
					        'ThinItalic': '100i',

					        'ExtraLight': '200',
					        'ExtraLightItalic': '200i',

					        'Light': '300',
					        'LightItalic': '300i',

					        'Regular': '400',
					        'RegularItalic': '400i',

					        'Medium': '500',
					        'MediumItalic': '500i',

					        'Semibold': '600',
					        'SemiboldItalic': '600i',

					        'Bold': '700',
					        'BoldItalic': '700i',

					        'ExtraBold': '800',
					        'ExtraBoldItalic': '800i',

					        'Black': '900',
					        'BlackItalic': '900i',
					    };

						var ul = $('<ul class="list-css mixin"></ul>');

						var include = event.target.getValue(entrance, fieldname).split(',');

						$.each(weights, function(name, weight){
							var id = Functions.Uid();
							var item = $([
								'<li>',
									'<div>',
										'<div class="form-checkbox m-r-10">',
											'<input type="checkbox" id="cvd-'+id+'" name="'+weight+'">',
											'<label for="cvd-'+id+'"></label>',
										'</div>',
										'<kbd>'+weight+'</kbd> ',
										'<code class="code-dark m-l-5">'+name+'</code>',
									'</div>',
								'</li>',
							].join(''));

							$('input',item).on('change',function(){
								include = [];

								$('input',ul).each(function(){
									if($(this).is(':checked')) include.push($(this).attr('name'));
								})

								event.target.setValue(entrance, fieldname, include.join(','));
							})

							if(include.indexOf(weight) >= 0) $('input',item).prop('checked',true);

							ul.append(item);
						});

						return ul;
					}
				}
			},
			output: {
				output: {},
			}
		},
	},
	on: {
		init: function(event){
			
		},
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		name: function(path){
			return nw.path.basename(path, nw.path.extname(path));
		},
		start: function(){
			
		},
		build: function(){
			var name = this.getValue('name',true).join('');
			var types = this.getValue('types',true).join('');

			name = name.replace(' ','+');

			var url = "@import url('https://fonts.googleapis.com/css?family="+name+":"+types+"');";

			this.setValue('output',url);
		}
	}
});