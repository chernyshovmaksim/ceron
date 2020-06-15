Blueprint.Worker.add('css_categorys',{
	params: {
		name: 'Css Сategories',
		description: 'Выводит список css папок из категорий',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				
			},
			output: {
				output: {
					color: '#fdbe00',
					varType: 'round',
					enableChange: true,
					type: function(entrance, group, fieldname, params, event){

						var ul = $('<ul class="list-css mixin"></ul>');

						var include = event.target.getValue(entrance, fieldname).split(',');

						$.each(Data.vtc.categorys, function(id, arr){
							var name = arr.name;
							var item = $([
								'<li>',
									'<div>',
										'<div class="form-checkbox m-r-10">',
											'<input type="checkbox" id="cts-'+id+'" name="'+id+'">',
											'<label for="cts-'+id+'"></label>',
										'</div>',
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

							if(include.indexOf(id) >= 0) $('input',item).prop('checked',true);

							ul.append(item);
						});

						return ul;
					}
				},
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
			var roll = this.getDefault('output', 'output').split(',');
			var incl = [];

			for (var i = 0; i < roll.length; i++) {
				var id = roll[i];

				if(Data.vtc.categorys[id]){
					for(var a in Data.vtc.cssList){
						var css = Data.vtc.cssList[a];

						if(css.category == id){
							incl.push(css.prefix);
						}
					}
				}
			}

			this.setValue('output',incl);
		}
	}
});