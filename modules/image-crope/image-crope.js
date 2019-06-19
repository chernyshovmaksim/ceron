Ceron.modules.ImageCrop = function(){
	var self = this;

    var crope  = {};
    var worked = false;

    this.Init = function(){
        if(Data.imageCrope == undefined){
            Data.imageCrope = {
                watch: '',
                save: '',
                images: []
            }
        }

        crope = Data.imageCrope;

        Generators.Module.GetHtml('image-crope',function(html){

            self.module    = $(html);
            self.container = $('.image-fields',self.module);
            self.clone     = $('.image-item',self.module)

            Form.InputDrag($('.form-input.num',self.module),'');

            Form.InputChangeEvent($('.form-input.num',self.module),function(name,value){
                crop[name] = parseInt(value);
            });

            $('.path-watch',self.module).on('click',function(){
                var input = $('input',this);

                File.Choise('fileDir',function(folder){
                    crope.watch = Functions.NormalPath(folder);

                    input.val(crope.watch);
                });
            }).find('input').val(crope.watch);

            $('.path-save',self.module).on('click',function(){
                var input = $('input',this);

                File.Choise('fileDir',function(folder){
                    crope.save = Functions.NormalPath(folder);

                    input.val(crope.save);
                });
            }).find('input').val(crope.save);

            $('.start',self.module).on('click',function(){
                self.Start();
            });

            $('.add',self.module).on('click',function(){

                self.Add();

                Generators.Module.Fixed(self.module);
            });

            $.each(crope.images, function(i, data){
                self.Image(data);
            });
           
            Generators.Module.AddToTool(self.module);
        })
    }

    this.Image = function(data){
        var clone = self.clone.clone();

        Form.InputDrag($('.num',clone),'');

        Form.InputChange($('.form-input',clone), function(name, value){
            data[name] = value;
        });

        Form.RadioChangeEvent($('.type',clone),function(name){
            data.croped = name;
        });

        Form.RadioSetValue($('.type',clone),data.croped);

        Form.InputSetValue($('.folder_name',clone), data.folder_name);

        Form.InputSetValue($('.width',clone), data.width);
        Form.InputSetValue($('.height',clone), data.height);

        $('.delete',clone).on('click', function(){
            Arrays.remove(crope.images, data);

            clone.remove();

            Generators.Module.Fixed(self.module);
        })

        this.container.append(clone);
    }

    this.Add = function(){
        var data = {
            folder_name: 'small',
            width: 1200,
            height: 500,
            croped: 'contain'
        }

        this.Image(data);

        crope.images.push(data);
    }

    this.Start = function(file){
        if(!crope.watch) return Functions.Error('Укажите путь к папке с изображениями');
        if(!crope.save)  return Functions.Error('Укажите путь к папке для сохранения');

        if(worked) return;

        worked = true;

        var btn = $('.start',self.module).css('opacity',0.4)

        var proces = Process.Add();
            proces.name('Обрезка изображений');
            proces.work(crope.save);

        var json = JSON.stringify(crope.images);
        var base = btoa(json);
        
        Psd.ImageMagick(
            'resizefolder',
            crope.watch,
            crope.save,
            base,
            '',
            function(){
                proces.complite();

                btn.css('opacity',1);

                worked = false;
            },
            function(){
                proces.error();

                btn.css('opacity',1);

                worked = false;
            }
        );
        
    }

    this.Select = function(){

    }
}