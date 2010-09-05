$(function(){
    var CURR_PAGE;
    var lastKey;
    var count="";
    var docHi = $(document.body).height();
    var idx = location.href.match(/#(\d+)/);
    idx = idx && idx[1]? idx[1]:1;
    if(idx<0){idx=0;}

    var slides = $("div.slide"), MAX_PAGE=slides.length;
    $("#lab-max").text(MAX_PAGE);
    if(idx>MAX_PAGE){idx=slides.length;}

    // make outline.
    $('div.slide').appendTo("#content").each(function(i){
        $(this).css({"height":docHi+"px"});
        i=i+1;
        var t=$(this).find("header:eq(0)").text()||"Unamed Page "+i;
        $("#outline-bd").append('<li id="idx-'+i+'"><a href="#'+i+'">'+t+'</a></li>');
    });
    fixSize();
    $(window).resize(fixSize);
    function fixSize(){
        docHi = $(document.body).height();
        $('#content>div.slide').css({"height":docHi+"px"});
        $('#outline-box').height(docHi-$('#outline>h4').outerHeight());
    }
    $("#outline-bd>li").click(function(){
        go2($(this).attr("id").replace("idx-", ""));
    });
    go2(idx);

    function toggleOutline(b){
        var o=$("#outline"), c=$("#content");
        b = b==undefined?(parseInt(o.css("left"))!=0):b;
        if(b){
            o.css({"left":"0"});
            c.css({"margin-left":210})
        }else{
            o.css({"left":"-200px"});
            c.css({"margin-left":0})
        }
    }
    $("#btn-outline-hider").click(function(){toggleOutline();});
    $("#btn-backword").click(function(){go(-1);})
    $("#btn-foreword").click(function(){go(1);})

    $().keydown(function(evt){
        //if(window.console && window.console.log){window.console.log(evt.keyCode);}
        switch(evt.keyCode){
        case 10:
        case 13: // <Enter>
            go2(parseInt(location.hash.replace("#","")));
            break;
        case 27: // Esc
            if(count){count="";}
            break;
        case 39: // Right->
        case 40: // Down
        case 74: // j
            go(count||1);
            count="";
            break;
        case 37: // <-Left
        case 38: // Up
        case 75: // k
            go(count?"-"+count:-1);
            count="";
            break;
        case 71:
            if(evt.shiftKey){ // G
                go2(count?parseInt(count):MAX_PAGE);
                lastKey=0;
                count="";
            }else if(lastKey==71){ // gg
                go2(count?parseInt(count):1);
                lastKey=0;
                count="";
            }
            break;
        case 48: // 0
            count+="0";
            break;
        case 49: // 1
            count+="1";
            break;
        case 50: // 2
            count+="2";
            break;
        case 51: // 3
            count+="3";
            break;
        case 52: // 4
            count+="4";
            break;
        case 53: // 5
            count+="5";
            break;
        case 54: // 6
            count+="6";
            break;
        case 55: // 7
            count+="7";
            break;
        case 56: // 8
            count+="8";
            break;
        case 57: // 9
            count+="9";
            break;
        case 188: // "<"
            toggleOutline(0);
            count="";
            break;
        case 190: // ">"
            toggleOutline(1);
            count="";
            break;
        default:
            break;
        }
        lastKey = evt.keyCode;
        $("#count").text(count);
        var help = $("#help");
        if(evt.keyCode==191 && evt.shiftKey){ // ?
            help.show();
        //}else if(evt.keyCode!=16){
        }else{
            help.hide();
        }
    });
    window.onhashchange = function(){
        go2(parseInt(location.hash.replace("#","")));
    };

    function go(offset){
        go2(CURR_PAGE+parseInt(offset));
        //if(window.console && window.console.log){window.console.log(CURR_PAGE,",",offset);}
    }
    function go2(page){
        page = parseInt(page);
        var p = page-1;
        if(page<=0 || page>MAX_PAGE || page==CURR_PAGE){return;}
        $("#content").css({"top":"-"+(p*docHi)+"px"});
        //$("#content").animate({"top":"-"+(p*docHi)+"px"},200);
        $("#outline-bd>li.active").removeClass("active");
        $("#outline-bd>li:eq("+(p)+")").addClass("active");
        // TODO: auto sync outline.
        var t = $("#outline-bd>li:eq("+p+")").offset().top,
            b=$("#outline-box"),
            s=b.scrollTop();
        if(t<40 || t>(docHi-40)){b.scrollTop(s+t-40);}
        if(window.console && window.console.log){window.console.log(t,s,docHi);}
        CURR_PAGE = page;
        $("#lab-curr").val(CURR_PAGE);
        window.location.hash = "#"+CURR_PAGE;
    }

});
