
 var get_messages = function(data){
    var _self = this;
        _self.obj =  data.obj;
        _self.url = data.url;
        _self.type = "POST";
        if( data.type ){
            _self.type = data.type;
        }
        _self.datas = {};
        if( data.datas ){
            _self.datas = data.datas;
        }
        _self.alertError = true;
        if( data.alertError ){
            _self.alertError = data.alertError;
        }
        _self.judge = true;
        _self.relay();
 };
    var proto = get_messages.prototype;

    proto.relay = function(){
        var _self = this;
        $(_self.obj).on('click',function(){
                    _self.trigger('requestCheck',_self.datas);  //发送之前的校验
                    if( _self.judge ){
                        _self.datachange();
                    }
                    else{
                        console.log("验证失败，不予发送信息");
                    }
            })
    };
    proto.datachange = function(){
        var _self = this;
            $.ajax({
                url  : _self.url,
                type : _self.type,
                dataType : 'json',
                data : _self.datas,
                success : function(data){
                    if( data.status == 0 ){
                        _self.sendTrue();
                    }
                    else{
                        _self.aborted(data);
                    }
                },
                error:function(err){
                    console.log('请求失败，请查看！');
                    console.log(err);
                }
            });
    }
    proto.sendTrue = function(){
            var _self = this;
            var _selfObj = $(_self.obj);
            var wait  = 60;
            _self.trigger('requestSuccess');    //发送成功后绑定事件
            _self.onoffClick(true);
            _selfObj.val(wait + getmessages_text1);
            var timer = setInterval(function(){
                    if( wait == 0 ){
                        clearInterval(timer);
                        _self.onoffClick(false);
                        _selfObj.val(getmessages_text2);
                    }
                    else{
                        wait --;
                        _selfObj.val(wait + getmessages_text1);
                    }
                },1000);
            _selfObj.parent().find('input[type="text"]').focus();
    }
    proto.aborted = function( data ){
        var _self = this;
        if( _self.alertError ){
                alert(data.error.message);
        };
        this.trigger('requestAborted',data);         //发送失败后绑定事件
    }
    proto.onoffClick = function(){
        var _self = this;
        var myObj = $(_self.obj)[0];
            if( myoffClick ){
                myObj.setAttribute("disabled", true);
            }
            else{
                myObj.removeAttribute("disabled"); 
            }
    }
