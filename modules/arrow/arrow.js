Ceron.modules.Arrow = function(){
	var self = this;

    var width, height, weight, angle, color;

    this.Init = function(){
        
        Generators.Module.GetHtml('arrow',function(html){

            self.module = $(html);

            width  = $('.width',self.module);
            height = $('.height',self.module);
            weight = $('.weight',self.module);
            angle  = $('.angle',self.module);
            color  = $('.color',self.module);

            Form.InputDrag(width,'px');
            Form.InputDrag(height,'px');
            Form.InputDrag(weight,'px');
            Form.InputDrag(angle,'deg');

            function setArrow(){
                Generators.Css.Add('width: ' + Form.InputGetValue(width));
                Generators.Css.Add('height: ' + Form.InputGetValue(height));
                Generators.Css.Add('border-width: ' + Form.InputGetValue(weight));
                Generators.Css.Add('transform: rotateZ(' + Form.InputGetValue(angle) + ')');
                Generators.Css.Add('border-color: ' + Form.InputGetValue(color));

                Generators.Css.Add('border-right-style: solid');
                Generators.Css.Add('border-bottom-style: solid');
            }

            Form.ColorsChangeEvent(color, '$color' ,setArrow);

            Form.InputChangeEvent($('.form-input',self.module), setArrow)
            
            Generators.Module.AddToTool(self.module);

        })
    }

    this.Select = function(){

    }
}