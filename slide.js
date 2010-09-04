$(function(){
    var CURR_PAGE;
    var docHi = $().height();
    var idx = location.href.match(/#page-(\d+)/);
    idx = idx && idx[1]? idx[1]:0;
    if(idx<0){idx=0;}

    var slides = $("div.slide"), MAX_PAGE=slides.length;
    if(idx>MAX_PAGE){idx=slides.length;}

    // make outline.
    $('div.slide').appendTo("#content").each(function(i){
        $(this).css({"height":docHi+"px"});
        var t=$(this).find("header:eq(0)").text()||"Unamed Page "+i;
        $("#outline-bd").append('<li id="idx-'+i+'"><a href="#page-'+i+'">'+t+'</a></li>');
    });
    $().resize(function(){
        $('#content>div.slide').css({"height":$().height()+"px"});
    });
    $("#outline-bd>li").click(function(){
        go($(this).attr("id").replace("idx-", ""));
    });
    go2(idx);

    $("#btn-outline-hider").click(function(){
        $("#outline").css({"width":"0px"});
    });
    $("#btn-backword").click(function(){go(-1);})
    $("#btn-foreword").click(function(){go(1);})

    $().keyup(function(evt){
        switch(evt.keyCode){
        case 39: // Right->
        case 40: // Down
        case 74: // j
            go(1);
            break;
        case 37: // <-Left
        case 38: // Up
        case 75: // k
            go(-1);
            break;
        default:
            break;
        }
    });

    function go(offset){
        if(offset!=0){
            go2(CURR_PAGE+offset);
        }
    }
    function go2(page){
        if(page<0 || page>=MAX_PAGE || page==CURR_PAGE){return;}
        $("#content").css({"top":"-"+(page*docHi)+"px"});
        $("#outline-bd>li.active").removeClass("active");
        $("#outline-bd>li:eq("+page+")").addClass("active");
        CURR_PAGE = page|0;
        window.location.hash = "#page-"+CURR_PAGE;
    }
});
