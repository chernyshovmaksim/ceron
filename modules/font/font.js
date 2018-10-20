Ceron.modules.Font = function(){
    var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('font',function(html){

            if(!Data.fonts) Data.fonts = [];
            
            self.module = $(html);
            
            Form.ColorsChange($('.form-color-picker',self.module),'$color','color');

            Form.Select($('.font-family',self.module),'$font-family');

            /*
            Form.SelectChangeEvent($('.font-family',self.module),function(name,val){
                if(!/\$/.test(val)) Generators.Css.Add(name+": '"+val+"'");
            },function(){
                
            });
            */

            Form.Select($('.font-weight',self.module),'$font-weight');

            Form.RadioChange($('.font-style',self.module),'font-style');
            Form.RadioChange($('.text-decoration',self.module),'text-decoration');
            Form.RadioChange($('.text-align',self.module),'text-align');
            Form.RadioChange($('.text-transform',self.module),'text-transform');
            Form.RadioChange($('.white-space',self.module),'white-space');
            Form.RadioChange($('.text-overflow',self.module),'text-overflow');

            Form.InputDrag($('.form-input',self.module))

            Form.InputDrop($('.line-height',self.module),'$line-height')
            Form.InputDrop($('.font-size',self.module),'$font-size')
            Form.InputDrop($('.letter-spacing',self.module),'$letter-spacing')

            Form.InputChange($('.form-input',self.module))

            
            Generators.Module.AddToTool(self.module);
        });
    }

    this.Select = function(){
        Form.ColorsSelect($('.form-color-picker',self.module),'color');

        Form.RadioSelect($('.font-style',self.module),'font-style');
        Form.RadioSelect($('.text-decoration',self.module),'text-decoration');
        Form.RadioSelect($('.text-align',self.module),'text-align');
        Form.RadioSelect($('.text-transform',self.module),'text-transform');
        Form.RadioSelect($('.white-space',self.module),'white-space');
        Form.RadioSelect($('.text-overflow',self.module),'text-overflow');

        Form.InputSelect($('.form-input',self.module))

        Form.SelectSelect($('.form-select',self.module))
    }
}