Blueprint.Worker.add('vtc_render',{
	params: {
		name: 'VTC Render',
		description: 'Возвращает скомпилированный html код шаблона',
		saturation: 'hsl(139, 45%, 44%)',
		alpha: 0.67,
		category: 'vtc',
		vars: {
			input: {
				template: {
					name: 'template',
					placeholder: 'Название шаблона в VTC',
					color: '#ddd',
					display: true
				},
				vars: {
					name: 'vars',
					color: '#fdbe00',
					disableChange: true
				},
			},
			output: {
				output: {

				},
				change: {
					name: 'onChange',
					color: '#7bda15',
					disableChange: true,
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

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var data = '';
			var name = this.getValue('template',true).join('');
			var vars = this.getValue('vars',true);

			var template;

			var match = Functions.SeachTPL('title',name);

			if(match && !match.data.isFolder){
				template = Data.vtc.tpl[match.data.key];
			}

			if(template){
				VTC.Build.startInstruction();

				data = VTC.Build.template(template, match.data.key);
			}
			else{
				Console.Add({message: 'Не найден шаблон', stack: name});
			}

			for (var i = 0; i < vars.length; i++) {
				var variable = vars[i];

				if(Arrays.isObject(variable)){
					data = data.replace(new RegExp('{@'+name+'~.*?}',"g"), variable.value);
					data = data.replace(new RegExp('{@'+variable.name+'}',"g"), variable.value);
				}
			}

			//да бы не срабатывало обновление постоянно, ставим кеш
			if(Ceron.cache.vtc_render == undefined) Ceron.cache.vtc_render = {};

			var cache_name = 'render_' + name,
				cache_data = Ceron.cache.vtc_render[cache_name];

			var change = false, data_hash = Functions.StringHash(data);

			if(cache_data !== data_hash){
				change = true;

				Ceron.cache.vtc_render[cache_name] = data_hash;
			}

			data = Functions.AttachHtmlFiles(data);
			data = Functions.ClearHtmlVars(data);

			//data = data.replace(new RegExp('{@.*?~(.*?)}',"g"),'$1'); //оставляем дефолтные значения
			//data = data.replace(new RegExp('{@(.*?)}',"g"),''); //затираем лишнии переменные

			this.setValue('output', data);
			this.setValue('change', change);
		}
	}
});