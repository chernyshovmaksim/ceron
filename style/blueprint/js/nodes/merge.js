Blueprint.Worker.add('merge',{
	params: {
		name: 'Merge',
		description: 'Объединить входные данные',
		saturation: 'hsl(221, 97%, 76%)',
		alpha: 0.62,
		category: 'function',
		vars: {
			input: {
				a: {
					name: 'input A',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				b: {
					name: 'input B',
					color: '#ddd',
					varType: 'content',
					disableChange: true
				},
				join: {
					name: 'join',
					color: '#ddd',
					displayInTitle: true,
					disableVisible: true,
					value: '\\n',
					type: function(entrance, group, name, params, event){
						var field = $([
							'<div class="form-field form-field-icon m-b-5">',
								'<div>',
									'<span class="m-r-5">Join type:</span>',
								'</div>',
								'<div>',
									'<div class="form-input">',
                                        '<input type="text" value="" name="'+name+'" placeholder="" />',
                                        '<ul class="drop"></ul>',
                                   ' </div>',
								'</div>',
                            '</div>',
						].join(''))

						var input = $('.form-input',field);

						Form.InputChangeEvent(input,function(name,value){
							event.target.setValue(entrance, name, value);
						},function(name,value){
							event.target.setValue(entrance, name, '');
						})

						Form.InputDrop(input,{
							'\\n':'\\n',
							'.':'.',
							'_.':' .',
							' + ':' + ',
							' > ':' > ',
							'_':'_',
							'&nbsp;':' ',
						},true)

						input.find('input').val(event.target.getValue(entrance, name) || '.');

						return field;
					}
				}
			},
			output: {
				output: {
					disableChange: true
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
			var j = this.getValue('join',true).join('');

			var c = {
				'\\n': "\n\r",
			};

			j = c[j] || j;
			
			var	a = this.removeEmpty(this.getValue('a',true)).join(j),
				b = this.removeEmpty(this.getValue('b',true)).join(j);
			
			var r = [a,b];
				r = this.removeEmpty(r);

			this.setValue('output',r.join(j));
		}
	}
});