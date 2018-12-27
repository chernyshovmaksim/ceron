Blueprint.Worker.add('css_font',{
	params: {
		name: 'Font',
		description: 'Подключение шрифта через @font-face',
		saturation: 'hsl(212, 100%, 65%)',
		titleColor: '#ffffff',
		alpha: 0.58,
		category: 'css',
		vars: {
			input: {
				name: {
					name: 'name',
					color: '#ddd',
					display: true
				},
				weight: {
					name: 'weight',
					color: '#ddd',
					value: 400,
					display: true
				},
				style: {
					name: 'style',
					color: '#ddd',
					value: 'normal',
					display: true
				},
				path: {
					name: 'path',
					color: '#ddd',
					type: 'fileOpen',
					disableVisible: true,
				},
			},
			output: {
				output: {},
			}
		},
	},
	on: {
		init: function(event){
			event.target.addEventListener('setValue',function(e){
				if(e.name == 'path'){
					if(!this.getValue('input', 'name')){
						this.setValue('input', 'name', parent.Blueprint.Worker.get('css_font').working.name(e.value));

						this.showOptionAgain();
					}
				}
			});
		},
		create: function(){
			
		},
		remove: function(){

		}
	},
	working: {
		name: function(path){
			return nw.path.basename(path, nw.path.extname(path));
		},
		start: function(){
			
		},
		build: function(){
			var name   = this.getValue('name',true).join(''),
				path   = this.getValue('path',true).join(''),
				weight = this.getValue('weight',true).join(''),
				style  = this.getValue('style',true).join('');

			var formats = {
				eot: 'embedded-opentype',
				woff2: 'woff2',
				woff: 'woff',
				ttf: 'truetype',
				svg: 'svg',
				otf: 'opentype'
			};

			var exe = path ? nw.path.extname(path).substr(1) : '';

			var font = [
				'@font-face {',
				    '	font-family: "' + (name || nw.path.basename(path, nw.path.extname(path))) + '";',
				    '	src: url("' + Functions.NormalPath(Functions.AssetPath(Data.path.img, path)) + '") format("'+formats[exe]+'");',
				    '	font-weight: '+(weight || 'normal')+';',
				    '	font-style: '+(style || 'normal')+';',
				'}',
			].join("\n");

			this.setValue('output',font);
		}
	}
});