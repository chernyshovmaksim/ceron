Blueprint.Worker.add('css_style',{
	params: {
		name: 'Css Style',
		description: 'Стили для класса',
		saturation: 'hsl(38, 100%, 43%)',
		alpha: 0.78,
		category: 'css',
		type: 'round',
		vars: {
			input: {
				input: {
					disableChange: true,
				},
			},
			output: {
				
			}
		},
		userData: {
			css_uid: '',
			css_name: ''
		}
	},
	on: {
		create: function(event){
			parent.Blueprint.Worker.get('css_style').working.create(event.data);
		},
		remove: function(event){
			parent.Blueprint.Worker.get('css_style').working.remove(event.data);
		},
		select: function(event){
			parent.Blueprint.Worker.get('css_style').working.select(event.data);
		}
	},
	working: {
		create: function(data){
			var uid = Generators.Css.Create('');

			Data.css[uid].blueprint = true;

			data.css_uid = uid;

			Generators.Build.Css();

			console.log('create',uid)
		},
		remove: function(data){
			delete Data.css[data.css_uid];

			Generators.Build.Css();

			console.log('remove')
		},
		select: function(data){
			ECSS.dispatchEvent({type: 'select', name: data.css_name});

			console.log('select',data)
		},
		start: function(){
			
		},
		build: function(){
			var name = this.getValue('input',true).join(', '),
				uid  = this.data.userData.css_uid;

			this.data.userData.css_name = name;

			Data.css[uid].name = name;

			Generators.Css.CommitChanges(name);

			//Generators.Build.Css();
		}
	}
});