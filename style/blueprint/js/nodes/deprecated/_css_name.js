Blueprint.Worker.add('css_name',{ 
	params: {
		name: 'Class',
		description: 'Название класса, если есть входные данные, то класс будет формироваться через знак -',
		saturation: 'hsl(246, 83%, 100%)',
		alpha: 0.49,
		titleColor: '#3e3729',
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {
					displayInTitle: false,
					enableChange: true,
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="form-field form-field-icon m-b-5">',
								'<div>',
									'<div class="form-btn form-btn-icon m-r-5"><img src="style/img/icons-panel/pip.png" /></div>',
								'</div>',
								'<div>',
									'<div class="form-input">',
                                        '<input type="text" value="" name="'+name+'" placeholder="" />',
                                   ' </div>',
								'</div>',
                            '</div>',
						].join(''))

						var input = $('.form-input',field);

						Form.InputChangeEvent(input,function(name,value){
							event.target.setDisplayInTitle(event.target.getValue(entrance, 'join') + value);

							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setDisplayInTitle(event.target.getValue(entrance, 'join'));

							event.target.setValue(entrance, name, '');
						})

						$('.form-btn-icon',field).on('click', function(){
							input.find('input').val(Generators.work_class);
							
							event.target.setValue(entrance, name, Generators.work_class);
						})

						
						input.find('input').val(event.target.getValue(entrance, name));

						return field;
					}
				},
				join: {
					name: 'join',
					color: '#ddd',
					displayInTitle: false,
					disableVisible: true,
					value: '',
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="f m-b-5">',
								'<div class="form-input">',
                                    '<input type="text" value="" name="'+name+'" placeholder="join" />',
                                    '<ul class="drop"></ul>',
                               ' </div>',
                            '</div>',
						].join(''))

						var input = $('.form-input',field);

						Form.InputChangeEvent(input,function(name,value){
							event.target.setDisplayInTitle(value + event.target.getValue(entrance, 'input'));

							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setDisplayInTitle(event.target.getValue(entrance, 'input'));

							event.target.setValue(entrance, name, '');
						})

						Form.InputDrop(input,{
							'.':'.',
							' > ':' > ',
							'_.':' .',
							' + ':' + ',
						}, true)

						input.find('input').val(event.target.getValue(entrance, name));

						return field;
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
			event.target.setDisplayInTitle(event.target.getValue('input', 'join') + event.target.getValue('input', 'input'));
		},
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var name         = this.getValue('input'),
				name_default = this.getDefault('input','input');
				join_default = this.getDefault('input','join');

			var value = '';

			if(name.length){

				name = name.map(function(val){
					return val + join_default + name_default;
				})

				value = name.join(', ');
			}
			else if(name_default){
				value = name_default;
			}

			this.setValue('output',value);
		}
	}
});