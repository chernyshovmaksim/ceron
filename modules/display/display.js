Ceron.modules.Display = function(){
	var self = this;

	this.Init = function(){
		this.module = $(Generators.Module.GetHtml('display'));

		Form.RadioChange($('.display',this.module),'display');

		/**
		 * Flex
		 */
		
		Form.RadioChange($('.flex-direction',this.module),'flex-direction');
		Form.RadioChange($('.flex-wrap',this.module),'flex-wrap');

		Form.InputDrag($('.flex .form-input',this.module),'')
		Form.InputChange($('.flex .form-input',this.module))

		Form.RadioChange($('.flex-subtype',this.module),'display');

		/**
		 * Align
		 */

		Form.RadioChange($('.justify-content',this.module),'justify-content');
		Form.RadioChange($('.align-content',this.module),'align-content');
		Form.RadioChange($('.justify-items',this.module),'justify-items');
		Form.RadioChange($('.align-items',this.module),'align-items');
		
		Form.RadioChange($('.justify-self',this.module),'justify-self');
		Form.RadioChange($('.align-self',this.module),'align-self');

		/**
		 * Grid
		 */
		Form.InputChange($('.grid-template-columns',this.module));
		Form.InputChange($('.grid-template-rows',this.module));
		Form.InputChange($('.grid-auto-columns',this.module));
		Form.InputChange($('.grid-auto-rows',this.module));
		Form.RadioChange($('.grid-auto-flow',this.module),'grid-auto-flow');

		Form.InputDrag($('.gap .form-input',this.module));
		Form.InputChange($('.gap .form-input',this.module));

		Form.InputChange($('.grid .form-input',this.module));

		Form.RadioChange($('.grid-subtype',this.module),'display');


		//авто колонки
		var auto_width = $('.grid-autosize-min',this.module);
		var auto_type  = $('.grid-autosize-type',this.module);

		Form.InputDrag(auto_width);

		Form.InputChangeEvent(auto_width, function(name,val){
			Generators.Css.Add('grid-template-columns: repeat( '+auto_type.val()+', minmax('+val+', 1fr) )');
		});

		auto_type.on('change', function(){
			Generators.Css.Add('grid-template-columns: repeat( '+$(this).val()+', minmax('+Form.InputGetValue(auto_width)+', 1fr) )');
		})

		/**
		 * Init
		 */
		

		Form.RadioChangeEvent($('.display',this.module),function(name){
			self.ShowDisplay(name);
		});

		$('.ask',this.module).on('click',function(){
			var box = $(this).data('ask');

			Popup.Window('Help',$('.ask-'+box,self.module).clone(),{size: 'md'});
		})

		Generators.Module.AddToTool(this.module);

		self.ShowDisplay('none');
	}

	this.ShowDisplay = function(name){
		$('.display-all',this.module).hide();

		name = name.replace('inline-','');

		$('.display-'+name,this.module).show();
	}

	this.Select = function(){
		var display = Generators.Css.Get('display');
			display = display.replace('inline-','');

		Form.RadioSetValueOnly($('.display',this.module),display);

		Form.RadioSelect($('.flex-direction',this.module),'flex-direction');
		Form.RadioSelect($('.flex-wrap',this.module),'flex-wrap');
		Form.RadioSelect($('.flex-subtype',this.module),'display');
		Form.RadioSelect($('.grid-subtype',this.module),'display');

		Form.RadioSelect($('.justify-content',this.module),'justify-content');
		Form.RadioSelect($('.align-content',this.module),'align-content');
		Form.RadioSelect($('.justify-items',this.module),'justify-items');
		Form.RadioSelect($('.align-items',this.module),'align-items');
		
		Form.RadioSelect($('.justify-self',this.module),'justify-self');
		Form.RadioSelect($('.align-self',this.module),'align-self');

		Form.RadioSelect($('.grid-auto-flow',this.module),'grid-auto-flow');


		var vars = [
			'flex-shrink',
			'flex-grow',
			'flex-basis',
			'order',

			'grid-column-gap',
			'grid-row-gap',

			'grid-column-start',
			'grid-column-end',
			'grid-row-start',
			'grid-row-end',

			'grid-template-columns',
			'grid-template-rows',
			'grid-auto-columns',
			'grid-auto-rows'

		];

		$.each(vars,function(i,varName){
			var val  = Generators.Css.Get(varName);

			$('input[name="'+varName+'"]',self.module).val(val)
		})

		self.ShowDisplay('none');

		this.ShowDisplay(Generators.Css.Get('display'));
	}
}