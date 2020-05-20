Ceron.modules.ConvertUnit = function(){
	var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('convert-unit',function(html){
        
            self.module = $(html);


            Form.InputChangeEvent($('.form-input',self.module),function(name,val){
                var convert = name == 'px' ? Functions.PxToEm(parseFloat(val)) : Functions.EmToPX(parseFloat(val), true);

                $('input[name="re-'+(name == 'px' ? 'em' : 'px')+'"]',self.module).val(convert);
            })

            Form.InputDrag($('.form-input.px',self.module),'',{min: 0})
            Form.InputDrag($('.form-input.em',self.module),'',{isFloat: 2, min: 0, step: 0.1})
            
            //Generators.Module.AddToTool(self.module);
            Generators.Module.AddToBar(self.module);
        })
    }

    this.Select = function(){
    	
    }
}