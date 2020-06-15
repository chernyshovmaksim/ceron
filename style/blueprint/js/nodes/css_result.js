Blueprint.Worker.add('css_result',{
	params: {
		name: 'Css Result',
		description: 'Вывод результата в формате css',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		category: 'css',
		vars: {
			input: {
				list: {
					name: 'list',
					color: '#fdbe00',
					disableChange: true
				},
				branch: {
					name: 'branch',
					color: '#fdbe00',
					//displayInTitle: true,
					disableVisible: true,
					type: function(entrance, group, name, params, event){
						var input = $([
							'<div class="form-btn"><img src="style/img/branch/mini.png"> <span>Master</span></div>',
						].join(''))

						var selected = event.target.getValue(entrance, name);
						var branch   = Data.branches[selected];

						if(branch) $('span',input).text(branch.name);

						input.on('click', function(){
							var ul = $([
			                    '<ul class="list-select">',
			                        '<li data-id="">Master</li>',
			                    '</ul>'
			                ].join(''));

			                for(var i in Data.branches){
			                	ul.append('<li data-id="'+i+'">'+Data.branches[i].name+'</li>');
			                }

			                $('li',ul).on('click',function(){
			                	var branch_id   = $(this).data('id');
			                	var branch_name = branch_id ? Data.branches[branch_id].name : 'Master';

			                	$('span',input).text(branch_name);

			                	event.target.data.userData.branch_name = branch_name;

			                	event.target.setValue(entrance, name, branch_id);

			                	Popup.Hide();
			                })

							Popup.Box(input, ul);
						})

						return input;
					}
				},
			},
			output: {
				output: {
					name: 'all',
					color: '#ddd',
					varType: 'round',
					disableChange: true
				},
				main: {
					name: 'main',
					color: '#ddd',
					disableChange: true,
				},
				cascade: {
					name: 'cascade',
					color: '#ddd',
					disableChange: true,
				},
				media: {
					name: 'media',
					color: '#ddd',
					disableChange: true,
				},
			}
		},
		userData: {
			
		}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var name = event.target.getValue('input','branch') ? event.target.data.userData.branch_name : 'Master';

			event.target.setDisplayInTitle(name);
			
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'branch'){
					this.setDisplayInTitle(e.value ? this.data.userData.branch_name : 'Master');

					Blueprint.Render.draw();
				}
			});
		}
	},
	working: {
		start: function(){
			
		},
		
		build: function(){
			var custom_list = this.getValue('list');
			var any_changes = this.isAnyTrue(custom_list);
			
			var css = Generators.Build.Css(true,{
				toObject: true,
				list: any_changes ? custom_list : false,
				branch: this.getValue('branch',true).join('')
			});

			this.setValue('main', css.main);
			this.setValue('cascade', css.cascade);
			this.setValue('media', css.media);

			this.setValue('output', [css.main, css.cascade, css.media].join("\n"));
		},
	}
});