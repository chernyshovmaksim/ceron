Ceron.modules.Size = function(){
	var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('size',function(html){

            self.module = $(html);

            Form.InputDrag($('.form-input',self.module))

            Form.InputChange($('.form-input',self.module))

            Form.RadioChange($('.overflow',self.module),'overflow');
            
            Generators.Module.AddToTool(self.module);

        })
    }

    this.Select = function(){
    	Form.InputSelect($('.form-input',self.module))

    	Form.RadioSelect($('.overflow',self.module),'overflow');
    }
}