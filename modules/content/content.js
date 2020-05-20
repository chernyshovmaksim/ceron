Ceron.modules.Content = function(){
	var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('content',function(html){
        
            self.module = $(html);

            var input = $('.form-input',self.module);

            Form.InputChangeEvent(input,function(n,val){
                if(!/"|'/.test(val[0])) val = `'${val}'`;
                
                Generators.Css.Add(`content: ${val}`);
            })

            $('.url',self.module).on('click', function(){
                File.Choise('fileOpen',function(file){

                    var path = Functions.RelativePath(Data.path.img, file),
                        url = `url(${path})`;

                    Form.InputSetValue(input, url);

                    Generators.Css.Add(`content: ${url}`);
                });
            })

            $('.preset',self.module).on('click', function(){
                var preset = $(this).data('preset');

                if(preset == 'a'){
                    Generators.Css.Add(`content: ''`);
                    Generators.Css.Add(`display: block`);
                }
                if(preset == 'b'){
                    Generators.Css.Add(`content: ''`);
                    Generators.Css.Add(`display: block`);
                    Generators.Css.Add(`position: absolute`);
                }
                if(preset == 'c'){
                    Generators.Css.Add(`content: ''`);
                    Generators.Css.Add(`display: block`);
                    Generators.Css.Add(`position: absolute`);
                    Generators.Css.Add(`left: 0`);
                    Generators.Css.Add(`bottom: 0`);
                    Generators.Css.Add(`right: 0`);
                    Generators.Css.Add(`top: 0`);
                }
            })

            Generators.Module.AddToTool(self.module);
        })
    }

    this.Select = function(){
        Form.InputSelect($('.form-input',self.module));
    }
}