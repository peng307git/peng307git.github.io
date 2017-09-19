/******
    *   data.id;     //当前 视频ID  javascript元素   (必填)
    *  
    *   autoPlay;         //选择立即播放，还是点击播放   true  or false （ 默认是false 可不填  ）
    *   homeplay;    //    点击出现视频弹窗并播放  （ 无视频弹窗不写 ）
    *   alertparent   //   视频弹窗的父级   （和上面一个参数同时出现）
    *   title            视频内带标题  (可不写)
    *   mask          视频暂停时的遮罩
    *
    *    var video = document.getElementById('myVideo');
    *    var play = new playvideo({
    *        'id':video,
    *        'mask':'.play-back',
    *        'autoPlay':true
    *    })
    *
    ******/

    var playvideo = function(data){
        var _self = this;
            _self.video = data.id;     //当前 视频ID  javascript元素
            _self.$video = $(data.id);    //当前 视频ID  jouery元素
            _self.autoPlay = data.autoPlay;         //选择立即播放，还是点击播放   true  or false 
            _self.$homeplay = data.homeplay;    //  点击出现视频弹窗并播放  （ 无视频弹窗不写 ）
            _self.$alertparent = $(data.alertparent);   //视频弹窗的父级
            _self.title = $(data.title);                 //视频内带标题
            _self.mask = $(data.mask);
            _self.$parent = _self.$video.parent();
            _self.timer = null; //定时器
            _self.signout = true; //全屏开关 
            if( data.homeplay ){
                this.homeplay();
                this.relay();
            }
            else{
                this.relay();
            } 
    }
    var proto = playvideo.prototype;

    proto.relay = function (){
        
            this.change();
    }
    proto.change = function(){
        var _self = this;
        _self.createElem();
        _self.defaultState();         //默认样式 
        _self.playnone();              //  播放／音量 控制
        _self.setControl();        //控件样式设置
        _self.fullscreen();       //  检查退出全屏
        setTimeout(function(){      //缓冲进度条
            _self.startBuffer();
        }, 1000);
        _self.ControlsMove();     //控件显示隐藏 
        if( _self.autoPlay ){
            $('#myControls').find('.onoff-play').addClass('clickplay');
            _self.video.play();
            _self.slideup();
        }
    }
    proto.createElem = function (){
         var _self = this;
         var iHTML = '<div id="myControls">'+
                        '<div class="play-left">'+
                            '<div class="play-onoff">'+   //播放暂停 -->
                                '<span class="onoff-play"></span>'+
                            '</div>'+
                            '<div class="play-time">'+   //播放时长总时长 -->
                                '<i class="move-time">00:00</i>/<i class="total-tiem"></i>'+
                            '</div>'+
                        '</div>'+ 
                        '<div class="play-bar">'+   //播放进度条 -->
                            '<div class="progressBar">'+
                               '<div class="timeBar"></div>'+
                               '<div class="boeridus"></div>'+
                                '<div class="bufferBar"></div>'+ //  缓冲进度 -->
                            '</div>'+
                        '</div>'+
                        '<div class="play-right">'+   
                            '<div class="play-metu"><span class="playMetu"></span></div>'+   //静音喇叭 -->  
                            '<div class="play-clickedMetu">'+   //音量控制条 -->
                                '<div class="volumeBar">'+
                                    '<div class="volume"></div>'+
                                    '<div class="volumegarden"></div>'+
                                '</div>'+
                            '</div>'+
                            '<div class="play-fullScreen"><span class="fullScreen"></span></div>'+   //全屏幕 -->   
                        '</div>'+
                    '</div>';
        _self.$video.after(iHTML);    //插入视频控件
    }
    proto.defaultState = function(){
        var _self = this;
        var movetime = '00:00';
        _self.video.volume = 0.8;
        _self.video.currentTime = 0;
        var $myControls = $('#myControls');
          $myControls.find('.timeBar').css('width', 0);
          $myControls.find('.boeridus').css('left',0);
          $myControls.find('.move-time').text(movetime);
          $myControls.find('.onoff-play').removeClass('clickplay');
          $myControls.find('.volume').css('width','80%');
          $myControls.find('.volumegarden').css('left','80%');
        if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){  //移动端视频播放
            _self.video.controls = true;
           var html = "<div class='play'>播放<div>"
                $(".video").append(html);
                $(".play").click(function(){
                    _self.video.play();
                    $(this).hide();
                })
        }
    }
    proto.playnone = function(){
        var _self = this;
         //播放暂停
        $('#myControls .onoff-play').on('click',function(e){
            e.preventDefault();
            if( _self.video.paused ){
                _self.video.play();
                $(this).addClass('clickplay');
            }else{
                _self.video.pause();
                clearTimeout(_self.timer);
                $(this).removeClass('clickplay');
                _self.slideDown();
            }
        })
        //静音按钮
        $('#myControls .playMetu').on('click',function(e){
                e.preventDefault();
            if( _self.video.muted ){
                $(this).removeClass('metu-no');
                _self.video.muted = !_self.video.muted;
            }
            else{
                $(this).addClass('metu-no');
                _self.video.muted = !_self.video.muted;
            }
        });
        //音量控制
        $('#myControls .volumeBar').on('mousedown', function(e) {
           var position = e.pageX - $(this).offset().left;
           var percentage = 100 * position / $(this).width();
           $('.volume').css('width', percentage+'%');
           $('.volumegarden').css('left', percentage+'%');
               _self.video.volume = percentage / 100;
        });
        //全屏播放
        $('#myControls .fullScreen').on('click', function() {
            if(_self.signout){
                launchFullscreen(_self.video);
                _self.clickFullScreen();
            }
            else{
                _self.exitFullscreen();
            }
        });
    }
    proto.setControl = function(){
        var _self = this;
        //当前播放时间
        _self.$video.on('timeupdate', function() {
                var mynum = changeTime(_self.video.currentTime);
                $('.move-time').text(mynum);
        });
        //播放时长
        _self.$video.on('loadedmetadata', function() {
                var mynum = changeTime(_self.video.duration);
                $('.total-tiem').text(mynum);
        });
        //视频进度条
         _self.$video.on('timeupdate', function() {
                   var currentPos = _self.video.currentTime; //当前播放时间 
                   var maxduration = _self.video.duration; //播放时长
                   var percentage = 100 * currentPos / maxduration; // %
                   $('.timeBar').css('width', percentage+'%');
                   $('.boeridus').css('left',percentage-1+'%');
                   if(_self.video.ended){
                        _self.video.pause();
                        _self.video.load();
                        $('.onoff-play').removeClass('clickplay');
                    }
        });
         var timeDrag = false;   /* 播放净度显示及控制 */
        $('.progressBar').mousedown(function(e) {
               timeDrag = true;
               _self.updatebar(e.pageX);
        });
        var borderDrag = false;
        $('.boeridus').mousedown(function(e){
                var _this = this;
                borderDrag = true;
                var pagex = e.pageX;//鼠标到屏幕左距离 
                var borderleft = $('.boeridus').position().left + 7;
                var initall = pagex - borderleft;  //初始值

            $(document).bind('mousemove',function(e){
                _self.statmove(e,borderDrag,initall,borderleft);
            })
        })
        $(document).mouseup(function(){
                borderDrag = false;  
                document.onmouseup = document.onmousemove = null;

        })
    }
    proto.statmove = function(e,borderDrag,initall,borderleft){
                var _self = this;
        if( borderDrag ){
                $('.boeridus').css('cursor','default');
                var distx = e.pageX;//鼠标到屏幕左距离
                var parentWidth = $('.boeridus').parent().width();  //进度条长度
                var maxduration = _self.video.duration;
                var newinit = distx - initall;
                var newperwidth = 100 * newinit / parentWidth;
                if(newperwidth > 100) {
                      newperwidth = 99;
                };
                if(newperwidth < 0) {
                      newperwidth = 0;
                };
                $('.boeridus').css('left',newperwidth+'%');
                _self.video.currentTime = maxduration * newperwidth / 100;
        }
    }
    //进入全屏样式
   proto.clickFullScreen = function(){
        var _self = this;
        _self.slideup();
        _self.$parent.addClass('videoMaxZidex');
        $('#myControls').addClass('maxZindex');
        $('.fullScreen').addClass('fullScreenhover');
        _self.signout = false;
        if( _self.mask ){
            _self.mask.addClass('maxZindex');
        }
    }
    //退出全屏样式
    proto.exitFullscreen = function () {
         var _self = this;
         var de = document;
         if (de.exitFullscreen) {
             de.exitFullscreen();
         } else if (de.mozCancelFullScreen) {
             de.mozCancelFullScreen();
         } else if (de.webkitCancelFullScreen) {
             de.webkitCancelFullScreen();
         }
         $('#myControls').removeClass('maxZindex');
         _self.$parent.removeClass('videoMaxZidex');
         $('.fullScreen').removeClass('fullScreenhover');
         _self.signout = true;
         if( _self.mask ){
            _self.mask.removeClass('maxZindex');
        }
    }
    //檢查瀏覽器是否處於全屏
    proto.fullscreen = function(){
        var _self = this;
        document.addEventListener('webkitfullscreenchange', function(){ /*chrome浏览器*/
            if(!document.webkitIsFullScreen){
                if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){
                    _self.hiderVideo();
                    _self.defaultState();
                }
                else{
                    _self.exitFullscreen();
                }
            }
        });
        document.addEventListener('mozfullscreenchange', function(){ /*FF浏览器*/
            if(!window.fullScreen){
                if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){
                    _self.hiderVideo();
                    _self.defaultState();
                }
                else{
                    _self.exitFullscreen();
                }
            }
        });
    }
    proto.hiderVideo = function(){
        var _self = this;
            _self.video.pause();
            _self.video.load();
            if( _self.$alertparent ){
                _self.$alertparent.css('visibility','hidden');
            }
    }
    proto.updatebar = function(x) {
        var _self = this;
           var progress = $('.progressBar');
           var maxduration = _self.video.duration; //Video 总时长
           var position = x - progress.offset().left; //鼠标到屏幕左距离减去当前元素的距离
           var percentage = 100 * position / progress.width();
           if(percentage > 100) {
              percentage = 100;
           }
           if(percentage < 0) {
              percentage = 0;
           }
           $('.timeBar').css('width', percentage+'%');
           $('.boeridus').css('left',percentage+'%');
           _self.video.currentTime = maxduration * percentage / 100;
    };
    proto.startBuffer = function() {
            var _self = this;
           var maxduration = _self.video.duration;
           var currentBuffer = _self.video.buffered.end(0);
           var percentage = 100 * currentBuffer / maxduration;
           $('.bufferBar').css('width', percentage+'%');
           if(currentBuffer < maxduration) {
              setTimeout(function(){
                _self.startBuffer();
              }, 1000);
           }
    };
    proto.ControlsMove = function(){
        var _self = this;
        //视频范围鼠标移入移出
        _self.$video.hover(function(){
            _self.slideDown();
            if(!_self.video.paused){
                _self.slideup();
            }
        },function(){
            if(!_self.video.paused){
                _self.slideup();
            }
        })
        //视频范围鼠标移动
        _self.$video.on('mousemove',function(){
            _self.slideDown();
            if(!_self.video.paused){
                _self.slideup();
            }
        })
        //控件范围内鼠标移入移出
        $('#myControls').mouseover(function(){
                clearTimeout(_self.timer);
        })
        $('#myControls').mouseout(function(){
            if(!_self.video.paused){
                _self.slideup();
            }
        })
    }
    proto.slideup = function(){
        var _self = this;
        clearTimeout(_self.timer);
        _self.timer = setTimeout(function(){
                    $('#myControls').stop(true,true).slideUp(500);
             if( _self.title ){
                    _self.title.stop(true,true).slideUp(500);
            }
        },2000);
    }
    proto.slideDown = function(){
        var _self = this;
        $('#myControls').stop(true,true).slideDown(500);
            if( _self.title ){
                        _self.title.stop(true,true).slideDown(500);
            }
    }
     //首页弹窗播放视频／兼容移动端
     proto.homeplay = function(){
            var _self = this;
            $(_self.$homeplay).on('click', function(event) {
                var mySrc = this.getAttribute('videoSrc');
                var myHead = this.getAttribute('videohead');
                    _self.$video.attr('src',mySrc);
                    _self.title.text(myHead); 
                    $('.onoff-play').addClass('clickplay');
                    $('#myControls').show();
                    _self.title.show();
                    _self.$alertparent.css('visibility','visible');
                    _self.video.play();
                    _self.slideup();
                if(navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i)){  //移动端视频播放
                        $('#myControls').hide();
                        _self.video.controls = controls;
                }
                
            });
            //点击关闭播放器
            _self.$alertparent.find('.close-video').on('click',function(event) {
                    _self.hiderVideo();
                    _self.defaultState();
            });
            //ios safari 退出全屏时捕获不到退出全屏事件
            // $(document).on('touchstart',function(){    //移动端下 需要把播放器的宽高设置为1px
            //     if (navigator.userAgent.match(/(iPhone|iPod|Android|ios)/i) && _self.video.paused) {
            //         _self.hiderVideo();
            //         _self.$alertparent.hide();
            //     }
            // })
     }

//时间转换
function changeTime( inum ){
    inum = parseInt(inum);
    var iM = toZero(Math.floor(inum/60));
    var iS = toZero(Math.floor(inum%60));
    return iM + ':'+ iS

}
function toZero(num){
    if(num <= 9){
        return '0'+num;
    }
    else{
        return ''+num;
    }
}
// 判断各种浏览器，找到正确的方法
function launchFullscreen(element) {
      if(element.requestFullscreen) {
        element.requestFullscreen();
      } else if(element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
      } else if(element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
      } else if(element.msRequestFullscreen) {
        element.msRequestFullscreen();
      }
}





