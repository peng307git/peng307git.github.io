/*分页组件
*
*
*
*   
type        ajax type 默认 GET
size        ajax 参数 单页容量 默认10
sizeKey     ajax 参数 单页容量Key名 默认"size"
pageKey     ajax 参数 当前页Key名 默认“page“
ajaxUrl     ajax数据请求url地址 mode:"Server"时 必选
pageBox     分页数标签的父级（必选）
mode        分页方法 Server or FE (注意大小写),默认FE
sortKey     后台排序方式（目前防止SQL注入由后端控制，此功能取消。）
intoBox     因数据和页面DOM结构需求不一样， 有 ajaxUrl 时 必须定义 intoBox 将数据写入DOM。
pageNow     当前页，默认1（第一页）
translation 是否需要国际化翻译(用到了/static/i18n/**  做国际化翻译)，true(是) / false(否) 默认 true 。
centerSelf  本分页内容本元素 mode:"FE" 时必选 
centerBox   被分页内容的父级元素 mode:"FE" 时必选 
otherData   追加参数（如我的脑波数据展示选择的时间段等）需拼成字符串 如："ee=66&ii=99"（可选）
        
        var paging = new pagingFunc({
             pageBox:"#table-pager",
             ajaxUrl:"/deal/btc/recharge/list",
             type: "Get",
             pageKey:"withdraw_page",
             sizeKey:"withdraw_size",
             size:20,
             mode:"Server",
             centerBox:"#table-tbody",
             centerSelf:".table-tr", 
             otherData:"ee=66&ii=99",
             translation:false,
             intoBox : function(data){ //因数据和页面DOM结构需求不一样， 有 ajaxUrl 时 必须定义 paging.intoBox ，将数据写入DOM。
                 var datar = data;
                 var htmlT="";
                 if (datar==null || datar.length <= 0) {
                     htmlT='<div class="table-tr clearfix">'+' <@spring.messageText "recharge.no.data" "您暂时没有充值记录"/> '+'</div>';
                 } else{
                     for(var i = 0 ; i < datar.length ; i++){
                         var addTime = datar[i].addTime ;
                         var amount = datar[i].amount ;
                         var address = datar[i].btcAddress;
                         var confirm = datar[i].confirm;
                         var status = datar[i].status;
                         htmlT += '<div class="table-tr clearfix">'+
                                     '<div class="table-td note-tr-address"> '+datar[i].rechargeAddress+' </div>'+
                                     '<div class="table-td note-tr-time">'+ datar[i].dealTime +'</div>'+
                                     '<div class="table-td note-tr-amount"> '+ datar[i].total+' </div>'+
                                     '<div class="table-td note-tr-status">';
                             if (datar[i].accounted==1) {
                                 htmlT += '<@spring.messageText "succeed" "成功"/>';
                             } else{
                                 htmlT += '<@spring.messageText "withdrawal.text15" "待确认"/>';
                             };
                         htmlT += '</div>'+'</div>' ;
                     }
                 };
                 $("#table-tbody").html(htmlT);
              }
         }); 

*
*
*
*
*
*
*/
var pagingFunc=function(data){
    var _self = this;
    //初始页 1
    _self.pageNow = 1;
    
    //ajax 请求方式 默认 get；
    _self .datatype = "GET";
    if (data.type) {
        _self.datatype = data.type;
    };
    //ajax url
    if (data.ajaxUrl) {
        _self.dataUrl = data.ajaxUrl;
    };
    //ajax参数key名
        //当前页值Key 默认"page";
    _self.pageKey = "page";
    if (data.pageKey) {
        _self.pageKey = data.pageKey;
    };
        //单页容量Key 默认"size";
    _self.sizeKey = "size";
    if (data.sizeKey) {
        _self.sizeKey = data.sizeKey;
    };
        //单页容量 默认每 10 条一页
    _self.pagersize = 10;
    if (data.size) {
        _self.pagersize = data.size;
    };
        //追加参数
    _self.otherData = "";
    if(data.otherData){
        _self.otherData = "&"+data.otherData;
    }
        //排序方式KEY // ---- 目前防止SQL注入由后端控制，此功能取消。
    // _self.sortKey = "sort";
    // if (data.sortKey) {
    //  _self.sortKey = data.sortKey;
    // };
    if(data.centerBox&&data.centerSelf){
        _self.centerBox = data.centerBox;
        _self.centerSelf = data.centerSelf;
    }
    //分页标签父级元素
    _self.pageBox = data.pageBox;
    
    //分页方法 默认 FE 前端分页 Server 服务器端分页；
    _self.mode = "FE";
    if (data.mode) {
        _self.mode = data.mode;
    };  
    //data into Box
    if (data.intoBox&&data.ajaxUrl) {
        _self.intoBox = data.intoBox;
    } else if(data.intoBox && !data.ajaxUrl){
        console.log("pagingFunc:参数不对！");
        return;
    }else if(!data.intoBox && data.ajaxUrl){
        console.log("pagingFunc:参数不对！");
        return;
    };

    _self.ready();
    _self.pageBoxOperation();
}

var proto = pagingFunc.prototype;

proto.ready=function(){
    var _self = this;
    if (_self.mode == "FE") {
        if ( _self.dataUrl ) {
            _self.update();
        } else{
            var totaler = $(_self.centerBox).find(_self.centerSelf).length;
            if (totaler>=0) {
                _self.pageNumber = Math.ceil( totaler / _self.pagersize );
                _self.changePage();
            };
        };
    }else if(_self.mode == "Server"){
        _self.update();
    }else{
        console.log("mode:参数不对！请注意大小写！");
    };
}

proto.update = function(){
    var _self = this;
    var ajaxData = ''
    if(_self.mode=="Server"){
        ajaxData = _self.pageKey +'='+ (_self.pageNow-1) +'&' + _self.sizeKey +'='+ _self.pagersize ;
        //+' &'+ _self.sortKey +'='+ "add_time,DESC";//排序功能 暂时取消
    }
    $.ajax({
        url: _self.dataUrl+'?'+ ajaxData + _self.otherData , //请求地址 + 参数;
        type: _self.datatype,  
        dataType: "json",
        success: function (data) {
            if(data.status == 0){
                var datar = data.data;
                _self.intoBox(datar);
                if (datar.total>=0||datar.length>=0|| datar != null ) {
                    if(_self.mode=="Server"){
                        _self.pageNumber = Math.ceil( datar.total / _self.pagersize );
                        _self.pageBoxHtml();
                    }else{
                        _self.pageNumber = Math.ceil( datar.length / _self.pagersize );
                        _self.changePage();
                    }
                }
            }else{
                alertBoxFunc(data.error.message, "sure");
            }
        },
        fail: function (status) {
            location.reload();
        }
    })
}
proto.changePage = function(){
    var _self = this;
    if(_self.pageNow >= _self.pageNumber){
        _self.pageNow =_self.pageNumber;
    }else if(_self.pageNow <= 1){
        _self.pageNow =1;
    }
    if (_self.mode == "FE") {
        var centers = $(_self.centerBox).find(_self.centerSelf);
        centers.hide();
        for(var i = (_self.pageNow-1)*_self.pagersize ; i < _self.pageNow*_self.pagersize ; i++){
            centers.eq(i).show();
        }
        _self.pageBoxHtml();
    }else if(_self.mode == "Server"){
        _self.update();
    }else{
        console.log("mode:参数不对！请注意大小写！");
    };
}
proto.pageBoxHtml = function(){
    //flags国际化
    var proFirst="首页",proPrev = "上一页",proNext="下一页",proLast="尾页",proTotal="共",proPages="页",proGoto="跳到",proSure="确定";
    var _lang=langType();
    $.i18n.properties({
            name : 'strings', //资源文件名称
            path : '/static/i18n/', //资源文件路径
            cache: true,
            mode : 'map', //用Map的方式使用资源文件中的值
            language : _lang,
            callback : function() {//加载成功后设置显示内容
                proFirst = $.i18n.prop('paging3');
                proPrev = $.i18n.prop('paging1');
                proNext = $.i18n.prop('paging2');
                proLast = $.i18n.prop('paging4');
                proTotal = $.i18n.prop('paging7');
                proPages = $.i18n.prop('paging8');
                proGoto = $.i18n.prop('paging5');
                proSure = $.i18n.prop('paging6');
            }
    });
    var _self = this;
    if (_self.pageNumber<=0) return;
    var pageBoxer = $(_self.pageBox)
    var pageBoxHtml= ['<a id="head_prev" href="####">'+proFirst+'</a>',
                      '<a id="prev" href="####">'+proPrev+'</a>',
                      '<i class="before">...</i>',
                      '<em>'+(_self.pageNow-2)+'</em>',
                      '<em>'+(_self.pageNow-1)+'</em>',
                      '<b>'+_self.pageNow+'</b>',
                      '<em>'+(_self.pageNow+1)+'</em>',
                      '<em>'+(_self.pageNow+2)+'</em>',
                      '<i class="after">...</i>',
                      '<a id="next" href="####">'+proNext+'</a>',
                      '<a id="head_next" href="####">'+proLast+'</a>',
                      '&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+proTotal+'&nbsp;<span>'+_self.pageNumber+'</span>&nbsp;'+proPages+',',
                      '&nbsp;'+proGoto+':<input type="text" id="pager-text"/>',
                      '<button id="pager-btn">'+proSure+'</button>'
                    ];
    if ((_self.pageNow-2) <= 0) {
        pageBoxHtml.deleteByContent('<i class="before">...</i>');
        pageBoxHtml.deleteByContent('<em>'+(_self.pageNow-2)+'</em>');
    };
    if ((_self.pageNow-2) == 1) {
        pageBoxHtml.deleteByContent('<i class="before">...</i>');
    };
    if ((_self.pageNow-1) <= 0) {
        pageBoxHtml.deleteByContent('<i class="before">...</i>');
        pageBoxHtml.deleteByContent('<em>'+(_self.pageNow-1)+'</em>');
    };
    if ( _self.pageNow <= 1 ) {
        _self.pageNow = 1;
        pageBoxHtml.deleteByContent('<a id="head_prev" href="####">'+proFirst+'</a>');
        pageBoxHtml.deleteByContent('<a id="prev" href="####">'+proPrev+'</a>');
    };
    if ((_self.pageNow+2) >= _self.pageNumber) {
        pageBoxHtml.deleteByContent('<i class="after">...</i>');
        if ((_self.pageNow+2) > _self.pageNumber) {
            pageBoxHtml.deleteByContent('<em>'+(_self.pageNow+2)+'</em>');
        }
    };
    if ((_self.pageNow+1) >= _self.pageNumber) {
        pageBoxHtml.deleteByContent('<i class="after">...</i>');
        if ((_self.pageNow+1) > _self.pageNumber) {
            pageBoxHtml.deleteByContent('<em>'+(_self.pageNow+1)+'</em>');
        }
    };
    if ( _self.pageNow >= _self.pageNumber) {
        _self.pageNow = _self.pageNumber;
        pageBoxHtml.deleteByContent('<a id="head_next" href="####">'+proLast+'</a>');
        pageBoxHtml.deleteByContent('<a id="next" href="####">'+proNext+'</a>');
    };
    if(_self.pageNumber<=3){
        pageBoxHtml.deleteByContent('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;'+proTotal+'&nbsp;<span>'+_self.pageNumber+'</span>&nbsp;'+proPages+',');
        pageBoxHtml.deleteByContent('&nbsp;'+proGoto+':<input type="text" id="pager-text"/>');
        pageBoxHtml.deleteByContent('<button id="pager-btn">'+proSure+'</button>');
    }
    pageBoxHtml.join('');
    pageBoxer.html(pageBoxHtml)

    pageBoxer.css({
        "text-align":"center"
    })

    var arryBorder =[];
    arryBorder.push(pageBoxer.find("em"));
    arryBorder.push(pageBoxer.find("a"));
    arryBorder.push(pageBoxer.find("button"));
    arryBorder.push(pageBoxer.find("input"));

    for (var i = 0; i < arryBorder.length ; i++) {
        arryBorder[i].css({
            "display":"inline-block",
            "color":"#666",
            "border":"#b9b9b9 solid 1px",
            "border-radius":"3px",
            "padding":"3px 5px",
            "margin":"0 5px",
            "cursor":"pointer",
            "text-decoration":"none",
            "text-align":"center",
            "min-width":"20px",
            "outline":"none"
        })
        arryBorder[i].hover(function() {
            $(this).css({
                "color":"#0e8bec",
                "border":"#0e8bec solid 1px"
            })
        },function() {
            $(this).css({
                "color":"#666",
                "border":"#b9b9b9 solid 1px"
            })
        });
    };
    pageBoxer.find("i").css({
        "display":"inline-block",
        "color":"#666",
        "padding":"3px 5px",
        "margin":"0 6px",
    });
    pageBoxer.find("b").css({
        "display":"inline-block",
        "color":"#FFF",
        "border":"#0e8bec solid 1px",
        "border-radius":"3px",
        "padding":"3px 5px",
        "margin":"0 5px",
        "text-align":"center",
        "min-width":"20px",
        "font-weight":"normal",
        "background":"#0e8bec"
    });
    pageBoxer.find("button").css({
        "margin":"0",
        "background":"transparent"
    });
    pageBoxer.find("input").css({
        "width":"50px",
        "background":"transparent",
        "cursor":"text"
    });
    pageBoxer.find("input").focus(function(event) {
        $(this).css({
            "border":"#0e8bec solid 1px"
        });
    });
    pageBoxer.find("span").css({
        "color":"#0e8bec"
    });
    
}
proto.pageBoxOperation = function(){
    var _self = this;
    var pageBoxer = $(_self.pageBox)
    pageBoxer.off();
    pageBoxer.on('click','em', function(event) {
        _self.pageNow = parseInt($(this).text());
        _self.changePage();
    });
    pageBoxer.on('click','#head_prev', function(event) {
        _self.pageNow = 1 ;
        _self.changePage();
    });
    pageBoxer.on('click','#head_next', function(event) {
        _self.pageNow = _self.pageNumber;
        _self.changePage();
    });
    pageBoxer.on('click','#prev', function(event) {
        _self.pageNow -- ;
        if(_self.pageNow <= 1){
            _self.pageNow =1;
        }
        _self.changePage();
    });
    pageBoxer.on('click','#next', function(event) {
        _self.pageNow ++ ;
        if(_self.pageNow >= _self.pageNumber){
            _self.pageNow =_self.pageNumber;
        }
        _self.changePage();
    });
    pageBoxer.on('click','button', function(event) {
        var valer = parseInt(pageBoxer.find('input').val().replace(/\ +/g,""));
        if(!isNaN(valer)){
            _self.pageNow = valer;
            console.log(valer);
            if(_self.pageNow >= _self.pageNumber){
                _self.pageNow =_self.pageNumber;
            }else if(_self.pageNow <= 1){
                _self.pageNow =1;
            }
            _self.changePage();
        }
    });
    pageBoxer.on('keypress','input',function(event) {
        var eventObj = event || e;
        var keyCode = eventObj.keyCode || eventObj.which;
        if ((keyCode >= 48 && keyCode <= 57))
            return true;
        else
            return false;
    });
}
//jq 数组操作根据内容删除元素
Array.prototype.deleteByContent = function(content) {
    for(var i=0; i<this.length; i++) {
        if (this[i] == content) {
            this.splice(i, 1);
            return;//如果要删除内容全部为content的数据，就删除return
        }
    }
}
