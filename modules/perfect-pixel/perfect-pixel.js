Ceron.modules.PerfectPixel = function(){
	var self = this;

    this.imagesLoad = false;

    this.Init = function(){
        if(!Data.repfectPixel) Data.repfectPixel = {
            x: 0,
            y: 0,

            opacity: 0.5,
            scale: 1,
            enable: true,
            invert: false,

            img: '',

            baselineOpacity: 0.1,
            baselineHeight: '30px',

            gridOpacity: 0.2,
            gridOffset: '30px',
            gridCols: 12,
            gridWidth: '1200px',

            showLayout: false,
            showBaseline: false,

            last: []
        };

        if(!Data.repfectPixel.last) Data.repfectPixel.last = {};

        this.data = Data.repfectPixel;
        
        Generators.Module.GetHtml('perfect-pixel',function(html){

            self.module = $(html);

            Form.InputDrag($('.form-input.px',self.module),'px')

            Form.InputChangeEvent($('.form-input.px',self.module),function(name,value){
                self.data[name] = value;

                Raid.PerfectChange();
            })

            Form.InputChangeEvent($('.form-input.num',self.module),function(name,value){
                self.data[name] = value;

                $('.form-range.'+name+' input',self.module).val(value)

                Raid.PerfectChange();
            })

            Form.InputChangeEvent($('.form-input.cols',self.module),function(name,value){
                self.data[name] = value;

                Raid.PerfectGridBuild();
            })

            Form.InputChangeEvent($('.form-range',self.module),function(name,value){
                self.data[name] = value;
                
                $('.form-input.'+name+' input',self.module).val(value)

                Raid.PerfectChange();
            })

            $('.show-hide',self.module).on('click',function(){
                self.data.enable = !self.data.enable;

                if(self.data.enable) $(this).addClass('active')
                else $(this).removeClass('active')

                Raid.PerfectEnableDisable();
            })

            $('.invert',self.module).on('click',function(){
                self.data.invert = !self.data.invert;

                if(self.data.invert) $(this).addClass('active')
                else $(this).removeClass('active')
                
                Raid.PerfectInvert();
            })

            $('.grid-layout',self.module).on('click',function(){
                self.data.showLayout = !self.data.showLayout;

                if(self.data.showLayout) $(this).addClass('active')
                else $(this).removeClass('active')
                
                Raid.PerfectShowLayout();
            })

            $('.grid-baseline',self.module).on('click',function(){
                self.data.showBaseline = !self.data.showBaseline;

                if(self.data.showBaseline) $(this).addClass('active')
                else $(this).removeClass('active')
                
                Raid.PerfectShowBaseline();
            })

            $('.img-choise',self.module).on('click',function(){
                File.Choise('fileOpen',function(img){
                    self.data.img = img;
                    self.data.psd = false;

                    Raid.PerfectChangeImg()
                })
            })


            if(self.data.enable) $('.show-hide',self.module).addClass('active')
            if(self.data.invert) $('.invert',self.module).addClass('active')
            if(self.data.showLayout)   $('.grid-layout',self.module).addClass('active')
            if(self.data.showBaseline) $('.grid-baseline',self.module).addClass('active')

            $('input[name="x"]',self.module).val(self.data.x)
            $('input[name="y"]',self.module).val(self.data.y)

            $('input[name="opacity"]',self.module).val(self.data.opacity)
            $('input[name="scale"]',self.module).val(self.data.scale)

            $('input[name="baselineOpacity"]',self.module).val(self.data.baselineOpacity)
            $('input[name="baselineHeight"]',self.module).val(self.data.baselineHeight)

            $('input[name="gridOpacity"]',self.module).val(self.data.gridOpacity)
            $('input[name="gridOffset"]',self.module).val(self.data.gridOffset)
            $('input[name="gridCols"]',self.module).val(self.data.gridCols)
            $('input[name="gridWidth"]',self.module).val(self.data.gridWidth)


            self.AddBtn('style/img/icons-panel/img.png','Показать изображение',function(){
                $('.show-hide',self.module).click();
            })

            self.AddBtn('style/img/icons-panel/grid.png','Показать вертикальную сетку',function(){
                $('.grid-layout',self.module).click();
            })

            self.AddBtn('style/img/icons-panel/baseline.png','Показать горизонтальную сетку',function(){
                $('.grid-baseline',self.module).click();
            })

            $(window).resize(function(){
                setTimeout(() => {
                    try{
                        Raid.PerfectDrawImg();
                    }
                    catch(e){}
                    
                },100);
            })


            PsdViewer.addEventListener('addItem',self.AddPsd.bind(self));

            Generators.Module.AddToTool(self.module);
        })
    }

    this.AddPsd = function(e){
        var psd = e.psd;

        $('[data-id="'+psd.id+'"]',$('#perfect-last-content',self.module)).remove();

        var item = $([
            '<div class="vtc-psd" data-id="'+psd.id+'">',
                '<div class="vtc-psd-image">',
                    '<img class="vtc-psd-img" src="'+Functions.CheckImageSrc(Functions.LocalPath(psd.preview))+'?a'+psd.hash+'" />',
                    '<div class="vtc-psd-layer cursor-pointer"></div>',
                '</div>',

                '<ul class="vtc-psd-info selected">',
                    '<li><span class="name">Имя:</span><span>'+psd.name+'</span></li>',
                    '<li><span class="name">Файл:</span><span>'+Functions.NormalPath(psd.path)+'</span></li>',
                '</ul>',
            '</div>',
        ].join(''));

        $('.vtc-psd-layer',item).on('click',function(){
            self.data.img = false;
            self.data.psd = psd.id;

            Raid.PerfectChangeImg();
        })

        $('#perfect-last-content',self.module).prepend(item)
    }

    this.AddBtn = function(img,title,callback){
        var btn = $('<li data-toggle="tooltip" title="'+title+'"><img src="'+img+'" /></li>').tooltip();
            btn.on('click',callback)

            btn.appendTo('.tools-left');
    } 

    this.Select = function(){
    	
    }

    this.Ready = function(){        
        Raid.Perfect = function(){
            this.perfectImg     = $('<canvas />');

            this.perfectCanvas  = this.perfectImg[0];
            this.perfectContext = this.perfectCanvas.getContext('2d');


            this.perfectImgOuter = $('<div><div></div></div>');
            this.perfectImgOuter.css({
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                overflow: 'hidden',
                maxWidth: '100vw',
                minHeight: '100vh',
                height: '100vh',
                zIndex: 214748364,
                pointerEvents: 'none',
                display: 'flex',
                justifyContent: 'center'
            });
            
            $('div',this.perfectImgOuter).append(this.perfectImg);

            this.doc.append(this.perfectImgOuter);

            this.perfectGrids = $([
                '<div>',
                    '<div class="pixel-layout"></div>',
                    '<div class="pixel-baseline"></div>',
                '</div>'
            ].join('')).css({
                position: 'fixed',
                zIndex: 2147483646,
                pointerEvents: 'none',
                left: 0,
                top: 0,
                width: '100%'
            });

            $('.pixel-layout',this.perfectGrids).css({
                position: 'fixed',
                zIndex: 1,
                pointerEvents: 'none',
                transform: 'translate(-50%,-50%)',
                tableLayout: 'fixed',
                display: 'table',
                left: '50%',
                top: '50%',
                opacity: 0.2,
                borderSpacing: '30px',
                width: '1260px',
                visibility: 'hidden'
            })

            $('.pixel-baseline',this.perfectGrids).css({
                position: 'fixed',
                zIndex: 1,
                pointerEvents: 'none',
                left: 0,
                top: 0,
                opacity: 0.2,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(transparent, transparent 96.6667%, blue 96.6667%, blue) 0% 0% / 100% 30px',
                visibility: 'hidden'
            })

            this.doc.append(this.perfectGrids);
        };

        Raid.PerfectGridBuild = function(){
            var grid = $('.pixel-layout',this.perfectGrids).empty()

            var cols = parseInt(self.data.gridCols);

            cols = isNaN(cols) ? 0 : cols;

            for(var i = 0; i < cols; i++){
                var item = $('<span></span>');
                    item.css({
                        display: 'table-cell',
                        background: 'red',
                        height: '200vh'
                    })

                grid.append(item)
            }
        }

        Raid.PerfectDrawImg = function(){
            if(!self.imagesLoad) return;

            var images = self.imagesLoad;

            var scr = this.content.scrollTop();
            var top = Functions.Negative(parseInt(self.data.y)) + scr;

            //берем размеры экрана, если он скрыт то берем из последего результата
            var cw = this.iframe.width()  || self.iframe_last_cw || 0;
            var ch = this.iframe.height() || self.iframe_last_ch || 0;

            if(images.length){
                this.perfectCanvas.width  = images[0].width;
                this.perfectCanvas.height = ch;
            }

            //записываем размеры экрана
            if(cw && ch){
                self.iframe_last_cw = cw;
                self.iframe_last_ch = ch;
            }

            for (var i = 0; i < images.length; i++) {
                var img = images[i];

                var cr = {
                    left: 0,
                    top: 0,
                    width: cw,
                    height: ch
                }

                var ir = {
                    left: 0,
                    top: -top + (500 * i),
                    width: img.width,
                    height: img.height
                }

                //чтобы все подряд не рисовать, а только то что попало в облость
                if(Functions.Intersect(cr, ir)){
                    this.perfectContext.drawImage(
                        img, 
                        ir.left, 
                        ir.top, 
                        ir.width, 
                        ir.height
                    );
                }
            }
        }

        Raid.PerfectChangeImg = function(){
            if(!self.data.img && !self.data.psd) return;
            
            if(self.data.img){
                Psd.Cut(self.data.img,(images) => {
                    self.imagesLoad = images;

                    this.PerfectDrawImg();
                })
            }
            else{
                var psd = Psd.Get(self.data.psd);

                if(psd){
                    Psd.LoadTiles(psd.tiles, Functions.LocalPath(psd.folder.tile), psd.hash, (images) => {
                        self.imagesLoad = images;

                        this.PerfectDrawImg();
                    })
                }
            }
        };

        Raid.PerfectChange = function(){
            this.perfectImg.css({
                marginLeft: self.data.x,
                //marginTop: self.data.y,
                opacity: self.data.opacity,
                zIndex: 2147483645,
                pointerEvents: 'none',
                transform: 'scale('+self.data.scale+')',
                transformOrigin: '0 0'
            })

            $('.pixel-layout',this.perfectGrids).css({
                opacity: self.data.gridOpacity,
                borderSpacing: self.data.gridOffset,
                width: parseInt(self.data.gridWidth) + (parseInt(self.data.gridOffset) * 2),
                //width: parseInt(self.data.gridWidth) + (parseInt(self.data.gridOffset)),
            })

            $('.pixel-baseline',this.perfectGrids).css({
                opacity: self.data.baselineOpacity,
                background: 'linear-gradient(transparent, transparent 96.6667%, blue 96.6667%, blue) 0% 0% / 100% ' + self.data.baselineHeight,
            })

            this.PerfectDrawImg();
        }

        Raid.PerfectEnableDisable = function(){
            if(self.data.enable) this.perfectImg.show();
            else this.perfectImg.hide();
        }

        Raid.PerfectInvert = function(){
            this.perfectImg.css('filter','invert('+(self.data.invert ? 1 : 0)+')');
        }

        Raid.PerfectShowLayout = function(){
            $('.pixel-layout',this.perfectGrids).css({visibility: self.data.showLayout ? 'visible' : 'hidden'})
        }
        Raid.PerfectShowBaseline = function(){
            $('.pixel-baseline',this.perfectGrids).css({visibility: self.data.showBaseline ? 'visible' : 'hidden'})
        }

        Raid.Perfect();
        Raid.PerfectChange();

        Raid.PerfectEnableDisable();
        Raid.PerfectInvert();

        Raid.PerfectChangeImg();

        Raid.PerfectGridBuild();

        Raid.PerfectShowLayout();
        Raid.PerfectShowBaseline();
    }
}