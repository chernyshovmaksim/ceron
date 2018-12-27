Blueprint.Worker.add('vtc_live',{
	params: {
		name: 'VTC Live',
		description: 'Вставить свой HTML код в живой просмотр VTC',
		saturation: 'hsl(191, 100%, 40%)',
		alpha: 0.77,
		category: 'vtc',
		vars: {
			input: {
				html: {
					name: 'html',
					color: '#ddd',
					disableChange: true
				},
				update: {
					name: 'update',
					color: '#7bda15',
					disableChange: true
				},
			},
			output: {
				
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var html   = this.getValue('html',true).join('');
			var update = this.getValue('update',true);

			var change = false;

			for (var i = 0; i < update.length; i++) {
				if(update[i]) change = true;
			}

			if(VTC.Live){
				VTC.Live.includeHtml(html, change);
			}
		}
	}
});