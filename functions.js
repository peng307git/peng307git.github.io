function getCookie(name){
    var arr,reg=new RegExp("(^| )"+name+"=([^;]*)(;|$)");
    if(arr=document.cookie.match(reg))
        return unescape(arr[2]);
    else
        return null;
}

function getURLVar(key) {
    var value = [];

    var query = String(document.location).split('?');

    if (query[1]) {
        var part = query[1].split('&');

        for (i = 0; i < part.length; i++) {
            var data = part[i].split('=');

            if (data[0] && data[1]) {
                value[data[0]] = data[1];
            }
        }

        if (value[key]) {
            return value[key];
        } else {
            return '';
        }
    }
}
//  缓冲加载
function nextReadyLoad(name,doFuntion){
    var windowHeight = $(window).height();
    var name = $(name);
    var ni = 0;
    var topPx = name.offset().top;
    $(window).scroll(function () {
        if($(window).scrollTop() > (topPx-windowHeight) && ni == 0){
            ni = 1;
            doFuntion();
        }
    })
}

//闰年判断
function is_leap(year) {  
    return (year%100==0?res=(year%400==0?1:0):res=(year%4==0?1:0));
 }