Ceron.modules.Effects =  function(){
    var self = this;

    var filters = {
        use: {},
        all: {
            'blur': {
                default: '5px',
                patern: 'px'
            },
            'brightness': {
                default: '100%',
                patern: '%',
                min: 0
            },
            'contrast': {
                default: '100%',
                patern: '%',
                min: 0
            },
            'grayscale': {
                default: '0%',
                patern: '%',
                min: 0
            },
            'hue-rotate': {
                default: '0deg',
                patern: 'deg',
                min: 0,
                max: 360, 
            },
            'invert': {
                default: '0%',
                patern: '%',
                max: 100, 
                min: 0
            },
            'opacity': {
                default: '100%',
                patern: '%',
                max: 100, 
                min: 0
            },
            'saturate': {
                default: '100%',
                patern: '%',
                max: 100, 
                min: 0
            },
            'sepia': {
                default: '0%',
                patern: '%',
                max: 100, 
                min: 0
            }
        }
    }

    var transforms = {
        use: {}
    }

    this.Init = function(){
        
        Generators.Module.GetHtml('Effects',function(html){

            self.module = $(html);


            /** Opacity **/
            var opacity = $('.opacity',self.module);

            Form.InputChangeEvent($('.form-range.opacity',self.module),function(name, value){
                Generators.Css.Add('opacity: ' + value );
                
                Form.InputSetValue(opacity, value)
            })

            Form.InputChangeEvent(opacity,function(name, value){
                Generators.Css.Add('opacity: ' + value);

                $('.form-range.opacity input',self.module).val(value);
            });

            Form.InputDrag(opacity,'',{isFloat: 2, step: 0.02,max: 1, min: 0});

            
            /** Transition **/
            var transition = $('.transition',self.module);

            Form.InputChangeEvent($('.form-range.transition',self.module),function(name, value){
                Generators.Css.Add('transition: all ' + value + 'ms');
                
                Form.InputSetValue(transition, value)
            })

            Form.InputChangeEvent(transition,function(name, value){
                Generators.Css.Add('transition: all ' + value + 'ms');

                $('.form-range.transition input',self.module).val(value);
            });
            
            Form.InputDrag(transition,'',{min: 0});
            

            /** Cursor **/
            Form.InputChange($('.cursor',self.module))
            
            Form.InputDrop($('.cursor',self.module),{
                default: 'default',
                pointer: 'pointer'
            })

            /** pointer-events **/
            Form.InputChange($('.pointer-events',self.module))
            
            Form.InputDrop($('.pointer-events',self.module),{
                auto: 'auto',
                none: 'none'
            })

            /** Filter **/
            $('.add-filter',self.module).on('click',function(){
                var ul = $('<ul class="list-select"></ul>');

                $.each(filters.all,function(name){
                    var filter = $('<li class="copy">'+name.slice(0,1).toUpperCase() + name.slice(1)+'</li>');

                        filter.on('click',function(){
                            self.FilterCreate(name);

                            Popup.Hide();
                        })

                    ul.append(filter)
                })

                Popup.Box($(this), ul);
            })

            filters.list = $('.all-filter',self.module);
            filters.no   = $('.no-filter',self.module);

            /** Transform **/
            var select = $('.select-transform',self.module);

            Form.RadioChangeEvent(select,function(name){
                $('.transform',self.module).hide();
                $('.'+name,self.module).show();
            });

            $('li:eq(0)',select).click();

            transforms.list = $('.transform',self.module);

            self.TransformBind('translate','px');
            self.TransformBind('scale','', {step: 0.01, isFloat: 2});
            self.TransformBind('rotate','deg');
            self.TransformBind('skew','deg');

            var posX = $('.transform-origin-x',self.module);
            var posY = $('.transform-origin-y',self.module);

            Form.RadioChange($('.transform-origin',self.module),'transform-origin',function(value){
                var spl = value.split(' ');

                $('input',posX).val(spl[0]).trigger('change');
                $('input',posY).val(spl[1]).trigger('change');
            });

            Form.InputDrag(posX)
            Form.InputDrag(posY)

            Form.InputChangeEvent(posX,function(name,val){
                Generators.Css.Add('transform-origin' + ': ' + val + ' ' + $('input',posY).val());
            })
            Form.InputChangeEvent(posY,function(name,val){
                Generators.Css.Add('transform-origin' + ': ' + $('input',posX).val() + ' ' + val );
            })
            
            Form.SelectChange($('.mix-blend-mode',self.module));

            Generators.Module.AddToTool(self.module);
        })
    }

    this.FilterCreate = function(name){
        filters.use[name] = filters.all[name].default;

        this.FilterAdd(name);

        this.FilterSort();

        this.FilterBuild();
    }

    this.FilterAdd = function(name){
        var filter = $([
            '<li data-id="'+name+'">',
                '<div class="drag"></div>',
                '<div class="name">'+name+'</div>',
                
                '<div class="form-input form-input-medium">',
                    '<input type="text" value="" name="'+name+'" />',
                '</div>',
                
                '<ico class="delete m-l-5"><img src="style/img/icons-panel/delete.png"></ico>',
            '</li>'
        ].join(''));

        var input = $('.form-input',filter);
        
        Form.InputChangeEvent(input,function(name, value){
            filters.use[name] = value;

            self.FilterBuild();
        });

        Form.InputDrag(input, filters.all[name].patern, filters.all[name]);

        Form.InputSetValue(input, filters.use[name]);

        $('.delete',filter).on('click',function(){
            filter.remove();

            delete filters.use[name];

            self.FilterBuild();
        })

        filters.list.append(filter);
    }

    this.FilterGet = function(filter){
        var split  = filter.split(' ');

        for (var i = 0; i < split.length; i++) {
            var name = split[i];

            var math = name.match(/([^\(]+)\(([^\(]+)\)/);

            if(math && filters.all[math[1]]){
                filters.use[math[1]] = math[2];
            }
        }
    }

    this.FilterSort = function(){
        Sortable.create($('.all-filter',self.module)[0], {
            group: "filter",
            handle: '.drag',
            animation: 150,
            onStart: function (evt) {
                $(evt.item).addClass('drag')
            },
            onEnd: function (evt) {
                $(evt.item).removeClass('drag')

                var arr = this.toArray();
                var res = {};

                for(var i = 0; i < arr.length; i++){
                    var id = arr[i];

                    res[id] = filters.use[id];
                }

                filters.use = res;

                self.FilterBuild();
            }
        });
    }

    this.FilterBuild = function(){
        var build = [];

        for(var i in filters.use){
            build.push(i + '('+filters.use[i]+')');
        }

        Generators.Css.Add('filter: ' + (build.length ? build.join(' ') : 'none'));

        this.FilterExist();
    }

    this.FilterExist = function(){
        if(!Arrays.toArray(filters.use).length) filters.no.show();
        else filters.no.hide();
    }

    this.TransformBind = function(transform, patern, params){
        var vector = ['X','Y','Z'];

        $.each(vector, function(i, v){
            var input = $('input[name="'+transform+v+'"]',transforms.list).parent();
        
            Form.InputChangeEvent(input,function(name, value){
                transforms.use[name] = value;

                self.TransformBuild();
            });

            Form.InputDrag(input, patern, params);
        })
    }

    this.TransformGet = function(transform){
        var split  = transform.split(' ');

        for (var i = 0; i < split.length; i++) {
            var name = split[i];

            var math = name.match(/([^\(]+)\(([^\(]+)\)/);

            if(math){
                transforms.use[math[1]] = math[2];
            }
        }
    }

    this.TransformBuild = function(){
        var build = [];

        for(var i in transforms.use){
            build.push(i + '('+transforms.use[i]+')');
        }

        Generators.Css.Add('transform: ' + (build.length ? build.join(' ') : 'none'));
    }

    this.Select = function(){
        var opacity   = Generators.Css.Get('opacity');
        var filter    = Generators.Css.Get('filter');
        var transform = Generators.Css.Get('transform');
        var blend     = Generators.Css.Get('mix-blend-mode');

        Form.RadioSelect($('.transform-origin',self.module),'transform-origin');

        var origin = Functions.SplitValue(Generators.Css.Get('transform-origin'));

        $('.transform-origin-x input',self.module).val(origin[0]);
        $('.transform-origin-y input',self.module).val(origin[1]);

        filters.use    = {};
        transforms.use = {};

        this.FilterGet(filter);
        this.TransformGet(transform);

        filters.list.empty();

        for(var i in filters.use){
            this.FilterAdd(i);
        }

        this.FilterSort();
        this.FilterExist();

        $('input',transforms.list).val('');

        for(var i in transforms.use){
            $('input[name="'+i+'"]',transforms.list).val(transforms.use[i]);
        }

        Form.InputSelect($('.opacity,.cursor,.pointer-events',self.module));

        Form.SelectSetValue($('.mix-blend-mode',self.module),blend);

        $('input[name="opacity"]',self.module).val(opacity);
    }
}