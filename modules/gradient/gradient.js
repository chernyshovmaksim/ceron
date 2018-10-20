var MGD = {};

MGD.GetPercent = function(container, clientX){
    var offset = container.offset(),
        width  = container.width();

    return Math.round(Math.min(width,Math.max(0,clientX - offset.left)) / width * 100);
}

MGD.Marker = function(container, data){
    this.container = container;
    this.data      = data;

    this.marker = $('<span></span>');
}

Object.assign( MGD.Marker.prototype, EventDispatcher.prototype, {
    init: function(){
        var self = this;

        this.container.append(this.marker);

        this.marker.on('mousedown',this.dragStart.bind(this));

        this.marker.on('click',function(){
            
        });

        this.update();
        this.updateColor();
    },
    dragStart: function(){
        Drag.add(this.dragMove.bind(this));

        this.dispatchEvent({type: 'drag_start'});
        this.dispatchEvent({type: 'select', data: this.data});
    },
    dragMove: function(e){
        this.data.position = MGD.GetPercent(this.container, e.drag.move.x);

        this.update();

        this.dispatchEvent({type: 'drag_move'});

        if(Math.abs(e.drag.start.y - e.drag.move.y) > 20){
            Drag.stop();

            this.dispatchEvent({type: 'need_remove'});
        }
    },
    update: function(){
        this.marker.css('left',this.data.position + '%');
    },
    updateColor: function(){
        this.marker.css('background-color',this.data.color);
    },
    updateOpacity: function(){
        this.marker.css('opacity',Math.max(0.1, this.data.opacity));
    },
    remove: function(){
        this.marker.remove();

        this.dispatchEvent({type: 'remove'});
    }
})







Ceron.modules.Gradient = function(){
    var self = this;

    var markers = [];

    var option = {
        type: 'linear',
        angle: '90deg',
        radial_type: 'circle',
        radial_position: '50% 50%'
    }

    var html = {
        markers: {},
        marker: {},
        type: {},
        input: {},
        gradient: {}
    }

    var drag,selected;

    this.AddMarker = function(container, data){
        var marker = new MGD.Marker(container,data);
            marker.init();

        markers.push(marker);

        this.dispatchEvent({type: 'add_marker', marker: marker});
    }

    this.InitPresets = function(){
        for (var i = 0; i < Config.config.gradients.length; i++) {
            this.AddPreset(Config.config.gradients[i]);
        }
    }

    this.SetPreset = function(data){
        Arrays.walkReverse(markers,'remove');

        for (var i = 0; i < data.markers.length; i++) {
            var mark = data.markers[i];

            this.AddMarker(html.markers.color, Arrays.clone(mark));
        }

        option = Arrays.clone(data.option);

        this.SetOption();

        this.Draw();
    }

    this.SetOption = function(){
        html.marker.settings.hide();

        Form.SelectSetValue(html.input.type, option.type)
        Form.InputSetValue(html.input.rotate, option.angle)

        Form.RadioSetValue(html.input.radial_type, option.radial_type);
        Form.RadioSetValue(html.input.radial_position, option.radial_position);

        html.input.type.trigger('change')
    }

    this.AddPreset = function(data){
        var item = $('<li></li>');

            item.css('background', data.preview);

            item.on('click',function(){
                self.SetPreset(data)
            })

            item.contextmenu(function(e){
                e.preventDefault();

                var ul = $([
                    '<ul class="list-select">',
                        '<li class="delete">Удалить</li>',
                    '</ul>'
                ].join(''));

                $('.delete',ul).on('click',function(){
                    Arrays.remove(Config.config.gradients, data);

                    item.remove();

                    Popup.Hide();
                })

                Popup.Box($(this), ul, {width: 'auto', position: {left: e.clientX, top: e.clientY}});
            });

        html.gradient.presets.append(item)
    }

    this.Init = function(){
        if(Config.config.gradients == undefined) Config.config.gradients = [];

        Generators.Module.GetHtml('gradient',function(module){
            
            self.module = $(module);

            html.marker.settings = $('.gd-marker-settings',self.module).hide();
            html.marker.color    = $('.gd-marker-color',self.module).hide();
            html.marker.opacity  = $('.gd-marker-opacity',self.module).hide();

            html.type.linear = $('.gd-type-linear',self.module);
            html.type.radial = $('.gd-type-radial',self.module).hide();

            html.gradient.line    = $('.gd-preview-line',self.module);
            html.gradient.preview = $('.gd-preview',self.module);

            html.markers.opacity = $('.gd-markers-opacity',self.module);
            html.markers.color   = $('.gd-markers-color',self.module);
            html.markers.all     = $('.form-gradient-markers',self.module).addClass('cursor-plus');

            html.input.color    = $('.gd-color', self.module);
            html.input.type     = $('.gd-type', self.module);
            html.input.opacity  = $('.gd-opacity', self.module);
            html.input.position = $('.gd-position', self.module);
            html.input.rotate   = $('.gd-rotate', self.module);

            html.input.radial_type       = $('.gp-radius-type', self.module);
            html.input.radial_position   = $('.gp-radius-position', self.module);
            html.input.radial_position_x = $('.gp-radius-position-x', self.module);
            html.input.radial_position_y = $('.gp-radius-position-y', self.module);

            html.gradient.presets = $('.gb-presets', self.module);
            
            
            
            html.markers.color.on('click',function(event){
                var type = $(this).data('type');

                if(!$(event.target).closest($(' > span', html.markers.all)).length) {
                    var data   = {
                        color: '#dddddd',
                        position: MGD.GetPercent($(this), event.clientX)
                    };

                    self.AddMarker($(this), data);
                }
            });


            self.addEventListener('add_marker',function(event){
                var marker = event.marker;

                marker.addEventListener('remove',function(){
                    Arrays.remove(markers, marker);

                    if(selected == marker){
                        html.marker.settings.hide();
                    }
                });

                marker.addEventListener('select', function(){
                    html.marker.settings.show();
                    html.marker.color.show();
                    html.marker.opacity.hide();

                    selected = marker;

                    Form.ColorsSetValue(html.input.color, marker.data.color);
                    Form.InputSetValue(html.input.opacity, marker.data.opacity)
                    Form.InputSetValue(html.input.position, marker.data.position + '%')
                   
                })

                marker.addEventListener('drag_move',function(){
                    drag = true;

                    if(selected){
                        Form.InputSetValue(html.input.position, marker.data.position + '%')
                    }

                    self.Draw();
                })

                marker.addEventListener('drag_start',function(){
                    html.markers.all.removeClass('cursor-plus')
                })

                marker.addEventListener('need_remove',function(){
                    if(markers.length > 2){
                        marker.remove();

                        self.Draw();
                    }
                })

                marker.dispatchEvent({type: 'select'});

                self.Draw();
            })


            Drag.addEventListener('stop',function(event){
                html.markers.all.addClass('cursor-plus')

                drag = false;
            });

            Form.SelectChangeEvent(html.input.type,function(name, type){
                html.type.linear.hide();
                html.type.radial.hide();

                html.type[type].show();

                option.type = type;

                self.Draw();
            });


            Form.ColorsChangeEvent(html.input.color,'$color',function(hex){
                if(selected){
                    selected.data.color = Generators.Build._value(hex);
                    selected.updateColor();

                    self.Draw();
                }
            });

            Form.InputChangeEvent(html.input.opacity,function(name,val){
                if(selected){
                    selected.data.opacity = val;
                    selected.updateOpacity();

                    self.Draw();
                }
            })

            Form.InputChangeEvent(html.input.rotate,function(name,val){
                option.angle = val;

                self.Draw();
            })

            Form.InputDrag(html.input.opacity,'', {isFloat: 2, step: 0.01, max: 1, min: 0})

            Form.InputDrag(html.input.rotate, 'deg');

            Form.RadioChangeEvent(html.input.radial_type, function(type){
                option.radial_type = type;

                self.Draw();
            });


            Form.RadioChangeEvent(html.input.radial_position,function(value){
                var spl = value.split(' ');

                $('input',html.input.radial_position_x).val(spl[0]).trigger('change');
                $('input',html.input.radial_position_y).val(spl[1]).trigger('change');

                option.radial_position = value;

                self.Draw();
            });

            Form.InputDrag(html.input.radial_position_x, '%', {max: 100, min: 0})
            Form.InputDrag(html.input.radial_position_y, '%', {max: 100, min: 0})

            Form.InputChangeEvent(html.input.radial_position_x,function(name,val){
                option.radial_position = val + ' ' + $('input',html.input.radial_position_y).val();

                self.Draw();
            })
            Form.InputChangeEvent(html.input.radial_position_y,function(name,val){
                option.radial_position = $('input',html.input.radial_position_x).val() + ' ' + val;

                self.Draw();
            })

            self.AddMarker(html.markers.color, {
                color: 'rgba(210,210,210,1)',
                position: 0
            });

            self.AddMarker(html.markers.color, {
                color: 'rgba(210,210,210,0)',
                position: 100
            });

            self.Draw();

            $('.add-preset',self.module).on('click',function(){
                var markers_data = [];

                for (var i = 0; i < markers.length; i++) {
                    var mark = markers[i];

                    markers_data.push(Arrays.clone(mark.data));
                }

                var gradient = {
                    markers: markers_data,
                    option: Arrays.clone(option),
                    preview: option.preview
                }

                Config.config.gradients.push(gradient)

                self.AddPreset(gradient);
            })

            self.InitPresets();

            Generators.Module.AddToTool(self.module);
        })
    }

    this.Draw = function(){
        var colors = [];

        markers.sort(function(a, b){
            if (a.data.position > b.data.position) return 1;
            else if (a.data.position < b.data.position) return -1;
            else return 0;
        });

        for (var i = 0; i < markers.length; i++) {
            var marker = markers[i];

            colors.push(marker.data.color + ' ' + marker.data.position + '%');
        }

        html.gradient.line.css('background','linear-gradient(to right, '+colors.join(',')+')');

        var gradient = option.type + '-gradient(';

        if(option.type == 'linear') gradient += option.angle;
        else{
            gradient += option.radial_type + ' at ' + option.radial_position;
        }

        gradient += ', ' + colors.join(',')+')';

        html.gradient.preview.css('background', gradient);

        option.preview = gradient;

        Generators.Css.Add('background: ' + gradient);
    }

    this.Select = function(){
        
    }
}