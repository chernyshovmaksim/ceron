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

            Generators.Module.AddToTool(self.module);
        })
    }

    this.Select = function(){
        Form.InputSelect($('.form-input',self.module));
    }
}