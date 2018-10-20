Blueprint.Worker.add('css_selector',{
	params: {
		name: 'Selector',
		description: 'Псевдоклассы, определяющие состояние элементов',
		saturation: 'hsl(93, 93%, 54%)',
		alpha: 0.62,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {},
				selector: {
					name: 'selector',
					color: '#ddd',
					displayInTitle: true,
					disableVisible: true,
					value: '',
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="f m-b-5">',
								'<div class="form-input">',
                                    '<input type="text" value="" name="'+name+'" placeholder="selector" />',
                                    '<ul class="drop"></ul>',
                               ' </div>',
                            '</div>',
						].join(''))

						var input = $('.form-input',field);

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						Form.InputDrop(input,{
							':after':':after',
							':before':':before',
							':active':':active',
							':hover':':hover',
							':first-child':':first-child',
							':last-child':':last-child',
						})

						input.find('input').val(event.target.getValue(entrance, name));

						return field;
					}
				}
			},
			output: {
				output: {
					color: '#ddd',
					disableChange: true
				},
			}
		},
	},
	on: {
		create: function(event){
			event.target.setValue('input', 'selector', ':after');
		},
		remove: function(){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var i = this.getValue('input',true).join(''),
				s = this.getDefault('input','selector');

			this.setValue('output',i + s);
		}
	}
});