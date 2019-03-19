Blueprint.Worker.add('scss_class',{
	params: {
		name: 'Class',
		description: 'Строка',
		saturation: 'hsl(197, 98%, 83%)',
		alpha: 0.42,
		category: 'none',
		type: 'round',
		add_class: 'css',
		vars: {
			input: {
				input: {
					name: '',
					color: '#ddd',
					varType: 'round',
				}
			},
			output: {
				output: {
					name: '',
					enableChange: true,
					displayInTitle: true,
					varType: 'round',
					color: '#ddd'
				},
			}
		},
	},
	on: {
		create: function(){
			
		},
		remove: function(){

		},
		init: function(event){
			var data    = event.target.data.userData;
			var working = parent.Blueprint.Worker.get('scss_class').working;

			var join = $((data.uid ? '<i class="flaticon-tabs" style="margin-right: 5px"></i> ' : '') + '<span style="cursor: pointer">&</span>');
				join.on('click',function(){
					$(this).toggleClass('active');

					data.join = $(this).hasClass('active');

					status(data.join);

					Blueprint.Callback.Program.fireChangeEvent({type: 'scss_join'}); 
				})

			var status = function(joined){
				if(joined){
					join.css({
						color: '#fdbe00',
						opacity: 1
					})
				}
				else{
					join.css({
						color: '#ddd',
						opacity: 0.5
					})
				}
			}

			status(false);

			if(data.join) join.addClass('active'), status(true);

			event.target.setDisplayInTitle(working.search(data.custom || data.uid) || data.custom || 'Не найдено');
			event.target.setDisplayTitle(join);

			Blueprint.Callback.Program.addEventListener('update', function(){
				event.target.setDisplayInTitle(working.search(data.custom || data.uid) || data.custom || 'Не найдено');
			})

			Blueprint.Callback.Program.addEventListener('highlight', function(e){
				if(data.lastBuild == e.name) event.target.node.addClass('active');
				else                         event.target.node.removeClass('active');
			})
		}
	},
	working: {
		search: function(nameOrUid){
			var found, name = Generators.Css._check(nameOrUid);

			if(Data.css[nameOrUid]) found = Data.css[nameOrUid].fullname;

			if(name) found = name.fullname;

			return found;
		},
		start: function(){
			
		},
		build: function(){
			var data  = this.data.userData;
			var join  = data.join ? '' : ' ';

			var search = this.worker.working.search(data.uid || data.custom);
			var name   = search ? search : data.custom || 'not-found';

			var input  = this.getValue('input',true);
			var output = name;

			var output = [];

			if(input.length){
				output = input.map(function(a){
					return a + join + (data.uid && search ? '.' : '') + name;
				})
			}
			else{
				output.push(name);
			}
			
			data.lastBuild = output.join(', .');

			this.setValue('output', output);
		}
	}
});