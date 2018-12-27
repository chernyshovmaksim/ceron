Blueprint.Worker.add('switch',{
	params: {
		name: 'Switch',
		description: 'Переключатель',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'blueprint',
		type: 'round',
		add_class: 'icon',
		vars: {
			input: {
				input: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			},
			output: {
				output: {
					disableChange: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
		userData: {}
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var data = event.target.data.userData;

			if(data.enable == undefined) data.enable = true;

			var join = $('<i class="flaticon-app"></i>');
				join.css({
					fontSize: '15px',
					cursor: 'pointer',
					color: '#ddd',
					marginLeft: '2px'
				});

				join.on('click',function(){
					$(this).toggleClass('active');

					data.enable = $(this).hasClass('active');

					status(data.enable);
				})

			var status = function(enable){
				join.removeClass('flaticon-multiply flaticon-app')

				if(enable){
					join.css({
						opacity: 1
					}).addClass('flaticon-app')
				}
				else{
					join.css({
						opacity: 0.5
					}).addClass('flaticon-multiply')
				}
			}

			status(false);

			if(data.enable) join.addClass('active'), status(true);

			event.target.setDisplayTitle(join);
		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			if(this.data.userData.enable) this.setValue('output',this.getValue('input'));
		}
	}
});