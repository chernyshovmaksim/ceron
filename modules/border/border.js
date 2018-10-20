Ceron.modules.Border = function(){
	var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('border',function(html){
        
            self.module = $(html);

            var width     = '1px',
            	style     = 'solid',
            	pos       = '',
            	color     = '#ddd',
            	radius    = '0px',
            	radiusPos = '';

            Form.ColorsChangeEvent($('.form-color-picker',self.module),'$color',function(val){
            	color = val;
            });

            Form.InputDrop($('.border-width',self.module),'$border-width')
            Form.InputDrop($('.border-radius',self.module),'$border-radius')
            Form.InputDrag($('.form-input',self.module))
            Form.InputChangeEvent($('.border-width',self.module),function(name,val){
            	width = val;
            })
            Form.InputChangeEvent($('.border-radius',self.module),function(name,val){
            	radius = val;
            })

            Form.RadioChangeEvent($('.border-style',self.module),function(val){
            	style = val;
            });

            Form.RadioChangeEvent($('.border',self.module),function(val){
            	pos = val;
            });

            Form.RadioChangeEvent($('.border-radius-position',self.module),function(val){
            	radiusPos = val;
            });

            $('.set-border',self.module).on('click',function(){
            	var name = 'border';

            	if(pos) name += '-'+pos;

            	Generators.Css.Add(name + ': ' + width + ' ' + style + ' ' + color);
            })

            $('.set-radius',self.module).on('click',function(){
            	var name = 'border';

            	name += radiusPos ? '-'+radiusPos : '';
            	name += '-radius'

            	if(radius) Generators.Css.Add(name + ': ' + radius);
            	else Generators.Css.Remove(name);
            })


            
            Generators.Module.AddToTool(self.module);
        })
    }

    this.Select = function(){

    }
}