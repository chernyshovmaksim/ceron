Blueprint.Worker.add('vtc_perform',{
	params: {
		name: 'VTC Perform',
		description: 'Выполнить действие',
		saturation: 'hsl(212, 100%, 65%)',
		alpha: 0.58,
		category: 'none',
		deprecated: true,
		vars: {
			input: {
				from: {
					name: 'from',
					color: '#ff7d63',
					disableChange: true,
					allowed: ['vtc_find'],
					maxConnections: 1
				},
				to: {
					name: 'to',
					color: '#ddd',
					disableChange: true,
					allowed: ['vtc_template','string'],
					///maxConnections: 1
				},
				perform: {
					name: 'perform',
					color: '#ddd',
					disableVisible: true,
					value: 'add_after',
					type: function(entrance, group, name, params, event){
						var input = $([
							'<div class="form-btn"><span></span></div>',
						].join(''))

						var selected = event.target.getValue(entrance, name);
						
						$('span',input).text(event.target.data.userData.perform_name || 'Add After');

						input.on('click', function(){
							var ul = $([
			                    '<ul class="list-select">',
			                        '<li data-perform="remove">Remove</li>',
			                        '<li data-perform="replace">Replace</li>',
			                        '<li data-perform="add_before">Add before</li>',
			                        '<li data-perform="add_after">Add after</li>',
			                        '<li data-perform="inside_before">Inside before</li>',
			                        '<li data-perform="inside_after">Inside after</li>',
			                    '</ul>'
			                ].join(''));

			                
			                $('li',ul).on('click',function(){
			                	var perform   = $(this).data('perform');
			                	var perform_name = $(this).text();

			                	$('span',input).text(perform_name);

			                	event.target.data.userData.perform_name = perform_name;

			                	event.target.setValue(entrance, name, perform);

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
					name: 'perform',
					varType: 'round',
					color: '#7bda15',
					allowed: ['vtc_perform']
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
			event.target.setDisplayInTitle(event.target.data.userData.perform_name || 'Add after');
			
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'perform'){
					this.setDisplayInTitle(event.target.data.userData.perform_name);

					Blueprint.Render.draw();
				}
			});
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var find   = this.getValue('from');
			var to     = this.getValue('to');
			var method = this.getValue('perform',true).join('');

			var perform = {
				find: find,
				method: method,
				to: to
			}

			this.setValue('output', perform);
		}
	}
});