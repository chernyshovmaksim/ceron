Ceron.modules.Shadow = function(){
    var self = this;

    this.Init = function(){
        
        Generators.Module.GetHtml('shadow',function(html){

            self.module = $(html);

            var x     = '1px',
                y     = '1px',
                blur  = '3px',
                size  = '0',
                pos   = '',
                type  = 'box',
                color = '#ddd';

            var name, value;

            var setShadow = function(){
                if(type == 'box'){
                    name  = 'box-shadow';
                    value = [pos,x,y,blur,size,color].join(' ');
                }
                else if(type == 'text'){
                    name  = 'text-shadow';
                    value = [x,y,blur,color].join(' ');
                }
                else{
                    name  = 'filter';
                    value = 'drop-shadow('+[x,y,blur,color].join(' ')+')';
                }

                Generators.Css.Add(name + ': ' + value);
            }

            Form.ColorsChangeEvent($('.form-color-picker',self.module),'$color',function(val){
                color = val;

                setShadow();
            });

            Form.RadioChangeEvent($('.box-shadow-pos',self.module),function(val){
                pos = val;

                setShadow();
            });

            Form.RadioChangeEvent($('.box-shadow-type',self.module),function(val){
                type = val;
            });

            Form.InputChangeEvent($('.box-shadow-x',self.module),function(name,val){
                x = val;

                setShadow();
            })
            Form.InputChangeEvent($('.box-shadow-y',self.module),function(name,val){
                y = val;

                setShadow();
            })

            Form.InputChangeEvent($('.box-shadow-blur',self.module),function(name,val){
                blur = val;

                setShadow();
            })

            Form.InputChangeEvent($('.box-shadow-size',self.module),function(name,val){
                size = val;

                setShadow();
            })

            Form.InputDrag($('.form-input',self.module))
            
            Generators.Module.AddToTool(self.module);
        })
    }

    
}