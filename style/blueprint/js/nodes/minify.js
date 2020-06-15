Blueprint.Worker.add('minify',{
	params: {
		name: 'MinifyJS',
		description: 'Сжимает JS код',
		saturation: 'hsl(221, 100%, 16%)',
		alpha: 0.89,
		category: 'function',
		type: 'round',
		vars: {
			input: {
				input: {
					varType: 'round',
					color: '#ddd'
				},
			},
			output: {
				output: {
					name: '',
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

		}
	},
	working: {
		start: function(){
			
		},
		build: function(){
			var input  = this.getValue('input');

			var options = {
			    toplevel: true,
			};

			var minify = Terser.minify(input,options);
			var result = minify.code || '';

			if(minify.error){
				var code = '';

				try{
					code = input[minify.error.filename].split("\n");
					code = code[minify.error.line];
					code = code.slice(minify.error.col-1,minify.error.col + 50);
				}
				catch(e){

				}

				var stack = [
					'Col: '+minify.error.col,
					'Filename: '+minify.error.filename,
					'Line: '+minify.error.line,
					'Pos: '+minify.error.pos,
					'Code: '+code
				].join("\n");

				Console.Add({message: 'MinifyJS Error:' + minify.message, stack: stack});
			}

			this.setValue('output', result);
		}
	}
});