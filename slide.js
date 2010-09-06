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
        var o=$("#outline"), c=$("#content"),x=$("#btn-outline-hider");
        b = b==undefined?(parseInt(o.css("left"))!=0):b;
        if(b){
            o.css({"left":"0"});
            c.css({"margin-left":210})
            x.text("<")
        }else{
            o.css({"left":"-200px"});
            c.css({"margin-left":0})
            x.text(">")
        }
    }
    $("#btn-outline-hider").click(function(){toggleOutline();});
    $("#btn-backword").click(function(){go(-1);})
    $("#btn-foreword").click(function(){go(1);})

    var SEARCHRESULTS = [];
    var SEARCH_HISTORY=[], SEARCH_HISTORY_CACHE={};
    function doSearch(key){
        var re = new RegExp('('+key+')', key==key.toLowerCase()?"img":"mg");
        $("#outline-bd>li.slide-search").removeClass("slide-search");
        $('span.slide-search').each(function(){
            $(this).replaceWith($(this).text());
        });
        var r = [];
        if(!key){return r;}
        $("#content>div.slide").each(function(page){
            var has = searchTextNode(this.childNodes);
            if(has){
                r.push(page+1);
                $("#outline-bd>li:eq("+page+")").addClass("slide-search");
            }
        });
        function searchTextNode(nodes){
            var has = false;
            for(var i=0,l=nodes.length; i<l; i++){
                if(nodes[i].nodeType==1){ // ELEMENT_NODE
                    var b = searchTextNode(nodes[i].childNodes);
                    if(!has){has = b;}
                }else if(nodes[i].nodeType==3){ // TEXT_NODE
                    var tag=nodes[i].parentNode.tagName;
                    if(tag=="script" || tag=="style"){continue;}
                    if(!nodes[i].nodeValue.match(re)){continue;}
                    var s=nodes[i].nodeValue.replace(re,'<cite class="slide-search">$1</cite>');
                    if(s==nodes[i].nodeValue){continue;}
                    // FIXME: &lt;script&gt; convert <script> and exec it.
                    var n=document.createElement("span");
                    n.className = "slide-search";
                    n.innerHTML = s;
                    nodes[i].parentNode.replaceChild(n, nodes[i]);
                    has = true;

                    // ======= The following code exec regexp twice. ========
                    //var n=document.createElement("span");
                    //n.className = "slide-search";
                    //n.innerHTML = nodes[i].nodeValue.replace(re,'<cite class="slide-search">$1</cite>');
                    //nodes[i].parentNode.replaceChild(n, nodes[i]);
                    //has = true;
                }
            }
            return has;
        }
        return r;
    }
    function prevSearchResult(){
        if(!SEARCHRESULTS.length){return;}
        for(var i=SEARCHRESULTS.length-1; i>=0; i--){
            if(CURR_PAGE>SEARCHRESULTS[i]){
                go2(SEARCHRESULTS[i]);
                return;
            }
        }
    }
    function nextSearchResult(){
        if(!SEARCHRESULTS.length){return;}
        for(var i=0,l=SEARCHRESULTS.length; i<l; i++){
            if(CURR_PAGE<SEARCHRESULTS[i]){
                go2(SEARCHRESULTS[i]);
                return;
            }
        }
    }
    function forwardSearch(){
        $("#forward-search").show();
        $("#forward-search>input").focus();
    }
    function doForwardSearch(key){
        SEARCHRESULTS = doSearch(key);
        hideForwardSearch();
        if(SEARCHRESULTS.length==0){return;}
        for(var i=0,l=SEARCHRESULTS.length; i<l; i++){
            if(CURR_PAGE <= SEARCHRESULTS[i]){
                go2(SEARCHRESULTS[i]);
                return;
            }
        }
        go2(SEARCHRESULTS[0]);
    }
    function hideForwardSearch(){
        //$(window).focus();
        $("#forward-search").hide();
        $("#forward-search>input").val("");
    }
    $("#forward-search>input").keydown(function(evt){
        switch(evt.keyCode){
        case 10:
        case 13: // <Enter>
            doForwardSearch($(this).val());
            $("#forward-search>input").blur();
            break;
        case 27: // Esc
            hideForwardSearch();
            $("#forward-search>input").blur();
            break;
        default:
            break;
        }
        evt.stopPropagation();
    }).blur(hideForwardSearch);

    function backwardSearch(){
        $("#backward-search").show();
        $("#backward-search>input").focus();
    }
    function doBackwardSearch(key){
        doSearch(key);
        hideBackwardSearch();
    }
    function hideBackwardSearch(){
        //$(window).focus();
        $("#backward-search>input").blur();
        $("#backward-search").hide();
        $("#backward-search>input").val("");
    }
    $("#backward-search>input").keydown(function(evt){
        switch(evt.keyCode){
        case 10:
        case 13: // <Enter>
            doBackwardSearch($(this).val());
            break;
        case 27: // Esc
            hideBackwardSearch();
            break;
        default:
            break;
        }
        evt.stopPropagation();
    }).blur(hideBackwardSearch);
    $().keydown(function(evt){
        if(window.console && window.console.log){window.console.log(evt.keyCode);}
        var help = $("#help");
        help.hide();
        switch(evt.keyCode){
        case 10:
        case 13: // <Enter>
            //go2(parseInt(location.hash.replace("#","")));
            lastKey = evt.keyCode;
            break;
        case 27: // Esc
            if(count){count="";}
            lastKey = evt.keyCode;
            break;
        case 39: // Right->
        case 40: // Down
        case 74: // j
            go(count||1);
            count="";
            lastKey = evt.keyCode;
            break;
        case 37: // <-Left
        case 38: // Up
        case 75: // k
            go(count?"-"+count:-1);
            count="";
            lastKey = evt.keyCode;
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
            }else{
                lastKey = evt.keyCode;
            }
            break;
        case 48: // 0
            count+="0";
            lastKey = evt.keyCode;
            break;
        case 49: // 1
            count+="1";
            lastKey = evt.keyCode;
            break;
        case 50: // 2
            count+="2";
            lastKey = evt.keyCode;
            break;
        case 51: // 3
            count+="3";
            lastKey = evt.keyCode;
            break;
        case 52: // 4
            count+="4";
            lastKey = evt.keyCode;
            break;
        case 53: // 5
            count+="5";
            lastKey = evt.keyCode;
            break;
        case 54: // 6
            count+="6";
            lastKey = evt.keyCode;
            break;
        case 55: // 7
            count+="7";
            lastKey = evt.keyCode;
            break;
        case 56: // 8
            count+="8";
            lastKey = evt.keyCode;
            break;
        case 57: // 9
            count+="9";
            lastKey = evt.keyCode;
            break;
        case 78: // n
            if(evt.shiftKey){
                prevSearchResult();
            }else{
                nextSearchResult();
            }
            lastKey = evt.keyCode;
            break;
        case 188: // "<"
            if(evt.shiftKey)toggleOutline(0);
            count="";
            lastKey = evt.keyCode;
            break;
        case 190: // ">"
            if(evt.shiftKey)toggleOutline(1);
            count="";
            lastKey = evt.keyCode;
            break;
        case 191: // "/"
            if(evt.shiftKey){
                //backwardSearch();

                help.show();
            }else{
                forwardSearch();
            }
            evt.stopPropagation();
            lastKey = evt.keyCode;
            return false;
            break;
        default:
            lastKey = evt.keyCode;
            break;
        }
        $("#count").text(count);
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
