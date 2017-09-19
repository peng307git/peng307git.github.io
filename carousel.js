/*$("#marks-bar").html(barHtml);
                var picer = new carousel({
                    "pic": id,
                    "speed": 5000,
                    "prev": "#prev-gradient",
                    "next": "#next-gradient",
                    "bar": "#marks-bar .marker"
                });*/
//Memorabilia 图片轮播
var carousel=function(data){
    var _self = this;
    _self.pic = $(data.pic);
    _self.picLength = _self.pic.length;
    _self.indexer = 5;
    _self.bar = $(data.bar);
    _self.barWidth = _self.bar.width();
    if(data.speed){
        var direction = 0;
        _self.speed = data.speed;
        var timer = setInterval(function(){
            if(_self.indexer == _self.picLength-1){
                direction = 1;
            }else if(_self.indexer == 0){
                direction = 0;
            }
            if (direction == 1) {
                _self.indexer--;
            } else if(direction == 0){
                _self.indexer++;
            };
            _self.change();
        }, _self.speed )
    }
    if (data.prev) {
        $(data.prev).on('click', function(event) {
            event.preventDefault();
            _self.indexer -- ;
            _self.change();
            if(data.speed){
                clearInterval(timer);
            }
        });
    };
    if (data.next) {
        $(data.next).on('click', function(event) {
            event.preventDefault();
            _self.indexer ++ ;
            _self.change();
            if(data.speed){
                clearInterval(timer);
            }
        });
    };
    if(data.bar){
        _self.bar.each(function(index, el) {
            $(this).on('click', function(event) {
                event.preventDefault();
                _self.indexer = index;
                _self.change();
                if(data.speed){
                    clearInterval(timer);
                }
            });
        });
    }
    _self.ready();
}
var prCarousel = carousel.prototype;
prCarousel.ready = function(){
    var _self = this;
    _self.change();
}
prCarousel.change = function(){
    var _self = this;
    if(_self.indexer >= _self.picLength){
        _self.indexer = _self.picLength-1 ;
    }else if( _self.indexer < 0 ){
        _self.indexer = 0;
    }
    _self.pic.each(function(index, el) {
        var that = $(this);
        var thatIndex = that.index();
        if(thatIndex < _self.indexer){
            $(this).removeClass('active').removeClass('after').addClass('before').css('z-index', thatIndex );
        }else if(thatIndex == _self.indexer){
            $(this).removeClass('before').removeClass('after').addClass('active').css('z-index', _self.picLength+1 );
        }else if(thatIndex > _self.indexer){
            $(this).removeClass('active').removeClass('before').addClass('after').css('z-index', _self.picLength - thatIndex );
        }
    });
    _self.bar.each(function(index, el) {
        var that = $(this);
        var thatIndex = that.index();
        if(thatIndex == _self.indexer){
            $(this).addClass('active').siblings().removeClass('active');
            $(this).css({'opacity': 1 ,"z-index":"1" });
        }
        if(thatIndex == _self.indexer+1 || thatIndex == _self.indexer-1 ){
            $(this).css({'opacity': 0.7 ,"z-index":"1"})
        }
        if(thatIndex == _self.indexer+2 || thatIndex == _self.indexer-2 ){
            $(this).css({'opacity': 0.4 ,"z-index":"1"})
        }
        if(thatIndex == _self.indexer+3 || thatIndex == _self.indexer-3 ){
            $(this).css({'opacity': 0.1 ,"z-index":"1" })
        }
        if(thatIndex >= _self.indexer+4 || thatIndex <= _self.indexer-4 ){
            $(this).css({'opacity': 0 ,"z-index":"0"})
        }
    });
    
    _self.bar.parent().animate({"left": -(_self.barWidth*(_self.indexer+0.5))}, 500);
}