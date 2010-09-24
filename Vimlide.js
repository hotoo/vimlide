/**
 * Vimlide: Vim-like HTML(5) Slide.
 *
 * @author 闲耘™(hotoo, hotoo.cn[AT]gmail.com)
 * @version 1.0, 2010/09
 */
var Queue = function(){
    this._list = [];
    for(var i=0,l=arguments.length; i<l; i++){
        this._list.push(arguments[i]);
    }
};
Queue.prototype.push = function(item){
    return this._list.push(item);
};
Queue.prototype.pop = function(){
    return this._list.pop();
};
Queue.prototype.clear = function(){
	//this._list.length = 0;
	return this._list.splice(0, this._list.length);
};
Queue.prototype.peek = function(){
    return this._list.length ? this._list[this._list.length-1] : null;
};
Function.createDelegate = function(instance, method) {
	//var args = Array.from(arguments).splice(2,arguments.length - 2);
    return function() {
        return method.apply(instance, arguments);
    }
};


var Vimlide = (function(){
    var RE_EMPTY=/^\s*$/;
    function has(str, val) {
        if (!str){return false;}
        return (str.search('(^|\\s)'+val+'(\\s|$)') != -1);
    }
    function hasClass(elem, cls){
        var c = elem.className;
        if (!c || RE_EMPTY.test(c)){return false;}
        return (c.search('(^|\\s)'+cls+'(\\s|$)') != -1);
    }
    var addClass = function(elem, cls){
        if(!elem || hasClass(elem, cls)){return;}
        var c=elem.className;
        if(!c || RE_EMPTY.test(c)){elem.className = cls;}
        else{elem.className += (" "+cls);}
    };
    var removeClass = function(elem, cls){
        if(!elem || !hasClass(elem, cls)){return;}
        var c=elem.className, a=c.split(" "), n=[];
        for(var i=a.length-1; i>-1; i--){
            if(cls==a[i]){n[n.length]=a[i];}
        }
        elem.className = n.join(" ");
    };
    function childNodes(elem){
        if(!elem){return null;}
        var c=elem.childNodes,r=[];
        for(var i=0,l=c.length; i<l; i++){
            if(1==c[i].nodeType){
                r[r.length] = c[i];
            }
        }
        return r;
    }

    var Slide = function(c){
        this.container = c||document;
        //if(document==this.container){
            this.page = location.hash.match(/#(\d+)/);
            this.page = this.page && this.page[1] ? parseInt(this.page[1]) : 1;
            if(this.page<0){this.page = 1;}
        //}else{
            //this.page = 1;
        //}
        this.slidesBox = childNodes(this.container)[0];
        this.slides = childNodes(this.slidesBox)
        this._maxpage = this.slides.length;
        if(this.page>this._maxpage){this.page=this._maxpage;}
        this.init();
        this.NORMAL_HANDLER={};
        this.COMMAND_HANDLER={};
        this.SEARCH_HANDLER={};

        this.SEARCHRESULTS = [];
        this.SEARCH_HISTORY=[];
        this.SEARCH_HISTORY_CACHE={};

        this.key_history="";
        this.count = "";
        this.mode = "normal";

        this.nmap("<Esc>", Function.createDelegate(this, this.reset));

        this.nmap("j", Function.createDelegate(this, this.nextItem));
        this.nmap("<Down>", Function.createDelegate(this, this.nextItem));

        this.nmap("J", Function.createDelegate(this, this.nextSlide));
        this.nmap("<Right>", Function.createDelegate(this, this.nextSlide));
        this.nmap("<PageDown>", Function.createDelegate(this, this.nextSlide));

        this.nmap("k", Function.createDelegate(this, this.prevItem));
        this.nmap("<Up>", Function.createDelegate(this, this.prevItem));

        this.nmap("K", Function.createDelegate(this, this.prevSlide));
        this.nmap("<Left>", Function.createDelegate(this, this.prevSlide));
        this.nmap("<PageUp>", Function.createDelegate(this, this.prevSlide));

        this.nmap("gg", Function.createDelegate(this, this.gg));
        this.nmap("G", Function.createDelegate(this, this.G));

        this.nmap("/", Function.createDelegate(this, this.searchModeOn));
        this.nmap("n", Function.createDelegate(this, this.searchNext));
        this.nmap("N", Function.createDelegate(this, this.searchPrev));
        this.smap("<Esc>", Function.createDelegate(this, this.searchModeOff));
        this.smap("<BS>", Function.createDelegate(this, this.searchModeBackspace));
        this.smap("<CR>", Function.createDelegate(this, this.searchDo));

        this.nmap(":", Function.createDelegate(this, this.commandModeOn));
        this.cmap("<Esc>", Function.createDelegate(this, this.commandModeOff));
        this.cmap("<BS>", Function.createDelegate(this, this.commandBackspace));
        this.cmap("<CR>", Function.createDelegate(this, this.commandDo));

        this.nmap("<", Function.createDelegate(this, this.hideOutline));
        this.nmap(">", Function.createDelegate(this, this.showOutline));

        this.nmap("-", Function.createDelegate(this, this.fontSizeMinus));
        this.nmap("_", Function.createDelegate(this, this.fontSizeMinus));
        this.nmap("+", Function.createDelegate(this, this.fontSizePlus));
        this.nmap("=", Function.createDelegate(this, this.fontSizePlus));
        this.nmap("0", Function.createDelegate(this, this.fontSizeRevert));

        this.nmap("?", Function.createDelegate(this, this.showHelp));

        // make outline.
        var docHi = $(document.body).height();
        for(var i=0,l=this.slides.length; i<l; i++){
            $(this.slides[i]).css({"height":docHi+"px"});
            var x=i+1;
            var t=$(this.slides[i]).find("header:eq(0)").text()||"Unamed Page "+x;
            $(this.outlineBd).append('<li id="idx-'+x+'"><a href="#'+x+'">'+t+'</a></li>');
        }

        this.fixSize();
        $(window).resize(this.fixSize);
        // TODO: for class.
        $("#outline-bd>li").click(function(){
            this.go2($(this).attr("id").replace("idx-", ""));
        });
        this.go2(this.page);

        this.container.focus();
        window.onhashchange = Function.createDelegate(this, this.hashChanged);
    };
    Slide.prototype.hashChanged = function(){
        this.go2(parseInt(location.hash.replace("#","")));
    };
    // TODO: for class.
    Slide.prototype.fixSize = function(){
        var docHi = $(document.body).height();
        $('#content>div.slide').css({"height":docHi+"px"});
        $('#outline-box').height(docHi-$('#outline>h4').outerHeight());
        this.go2(this.page||1, 1);
    }
    // TODO:
    Slide.prototype.fontSize = function(offset){
        var o=$("div.slides>div.slide");
        o.css("font-size", parseInt(o.css("font-size"))+offset)
    }

    Slide.prototype.init = function(){
        this.msgbox = document.createElement("div");
        this.msgbox.className = "vimlide-msg";

        this.outliner = document.createElement("div");
        this.outliner.className = "vimlide-outline";
        this.outlineBar = document.createElement("a");
        this.outlineBar.className = "vimlide-outlinebar";
        this.outlineBar.appendChild(document.createTextNode("<"));
        this.outlineHd = document.createElement("h4");
        this.outlineHd.appendChild(document.createTextNode("Outline:"))
        this.outlineBox = document.createElement("div");
        this.outlineBox.className = "vimlide-outline-box";
        this.outlineBd = document.createElement("ol");
        this.outlineBd.className = "vimlide-outline-bd";
        this.outliner.appendChild(this.outlineBar);
        this.outliner.appendChild(this.outlineHd);
        this.outliner.appendChild(this.outlineBox);
        this.outlineBox.appendChild(this.outlineBd);

        this.toolbar = document.createElement("div");
        this.toolbar.className = "vimlide-toolbar";

        this.countBox = document.createElement("span");
        this.toolbar.appendChild(this.countBox);

        this.searchBox = document.createElement("div");
        this.searchBox.className = "status-bar";
        this.searchInput = document.createElement("input");
        this.searchInput.setAttribute("type", "text");
        Event.add(this.searchInput, "keypress", Function.createDelegate(this, this.searchHandler));
        Event.add(this.searchInput, "blur", Function.createDelegate(this, this.searchModeOff));
        this.searchBox.appendChild(document.createTextNode("/"));
        this.searchBox.appendChild(this.searchInput);

        this.commandBox = document.createElement("div");
        this.commandBox.className = "status-bar";
        this.commandInput = document.createElement("input");
        this.commandInput.setAttribute("type", "text");
        Event.add(this.commandInput, "keypress", Function.createDelegate(this, this.commandHandler));
        Event.add(this.commandInput, "blur", Function.createDelegate(this, this.commandModeOff));
        this.commandBox.appendChild(document.createTextNode(":"))
        this.commandBox.appendChild(this.commandInput);

        this.pageInfoBox = document.createElement("span");
        this.currPageInput = document.createElement("input");
        this.currPageInput.className = "vimlide-pagebox";
        this.currPageInput.setAttribute("type", "text");
        this.currPageInput.value = this.page;
        this.maxPageBox = document.createElement("cite");
        this.maxPageBox.appendChild(document.createTextNode(this._maxpage));
        this.pageInfoBox.appendChild(this.currPageInput);
        this.pageInfoBox.appendChild(document.createTextNode("/"));
        this.pageInfoBox.appendChild(this.maxPageBox);

        this.prevBar = document.createElement("a");
        this.prevBar.innerHTML = "&laquo; Backword";
        //this.prevBar.appendChild(document.createTextNode("&laquo; Backword"));
        this.nextBar = document.createElement("a");
        this.nextBar.innerHTML = "Foreword &raquo;";
        //this.nextBar.appendChild(document.createTextNode("Foreword &raquo;"));
        this.playBar = document.createElement("a");
        this.playBar.innerHTML = "Play &rsaquo;";
        //this.nextBar.appendChild(document.createTextNode("Play &rsaquo;"));
        this.pauseBar = document.createElement("a");
        this.pauseBar.style.display = "none";
        this.pauseBar.innerHTML = "Pause &Iota;&Iota;";
        //this.pauseBar.appendChild(document.createTextNode("Pause &Iota;&Iota;"));
        this.toolbar.appendChild(this.countBox);
        this.toolbar.appendChild(this.pageInfoBox);
        this.toolbar.appendChild(this.prevBar);
        this.toolbar.appendChild(this.playBar);
        this.toolbar.appendChild(this.pauseBar);
        this.toolbar.appendChild(this.nextBar);

        this.statusLine = document.createElement("div");
        this.statusLine.className = "vimlide-statusline";
        this.statusLine.appendChild(this.searchBox);
        this.statusLine.appendChild(this.commandBox);
        this.statusLine.appendChild(this.toolbar);

        this.helper = document.createElement("div");
        this.helper.className = "vimlide-help";
        this.helper.innerHTML = S_HELP;

        var b=this.container;
        if(document==this.container){
            b = document.body; //this.container.body;
        }
        b.appendChild(this.outliner);
        b.appendChild(this.msgbox);
        b.appendChild(this.statusLine);
        b.appendChild(this.helper);
        b.tabIndex = 1;
        b.setAttribute("tabindex", "1");
        //jQuery.
        this.DEFAULT_FONTSIZE = this.FONTSIZE = $(b).css("font-size");
        addClass(b, "presentation");

        Event.add(this.container, "keypress", Function.createDelegate(this, this.normalHandler));
    };
    Slide.prototype.normalHandler = function(evt){
        evt = evt || window.event;
        var keycode = evt.keyCode || evt.which;
        var keyname;
        switch(keycode){
        case Event.KEY_ESC:
            keyname = "<Esc>";
            this.key_history += keyname;
            break;
        case Event.KEY_BACKSPACE:
            keyname = "<BS>";
            this.key_history += keyname;
            break;
        case Event.KEY_TAB:
            keyname = "<Tab>";
            this.key_history += keyname;
            break;
        case Event.KEY_RETURN:
            keyname = "<CR>";
            this.key_history += keyname;
            break;
        case Event.KEY_SHIFT:
        case Event.KEY_CTRL:
            return;
        case Event.KEY_CAPSLOCK:
            keyname = "<CapsLock>";
            this.key_history += keyname;
            break;
        case Event.KEY_LEFT:
            keyname = "<Left>";
            this.key_history += keyname;
            break;
        case Event.KEY_UP:
            keyname = "<Up>";
            this.key_history += keyname;
            break;
        case Event.KEY_RIGHT:
            keyname = "<Right>";
            this.key_history += keyname;
            break;
        case Event.KEY_DOWN:
            keyname = "<Down>";
            this.key_history += keyname;
            break;
        case 48: // KEY_0
            // "0" 开始的量词是没有意义的，可以直接当作命令。
            // 所以这里排除了这种情况。
            if(this.count){this.count+="0"; this.countBox.innerHTML=this.count;}
            else{keyname="0"; this.key_history+="0";}
            break;
        case 49: // KEY_1
        case 50: // KEY_2
        case 51: // KEY_3
        case 52: // KEY_4
        case 53: // KEY_5
        case 54: // KEY_6
        case 55: // KEY_7
        case 56: // KEY_8
        case 57: // KEY_9
            this.count += String.fromCharCode(keycode);
            this.countBox.innerHTML = this.count;
            break;
        default:
            keyname = String.fromCharCode(keycode);
            this.key_history += keyname;
            break;
        }

        if(!keyname){return false;}
        if(this.NORMAL_HANDLER[keyname] &&
           this.NORMAL_HANDLER[keyname] instanceof Function){
            this.NORMAL_HANDLER[keyname].call(this, evt);
            this.key_history = "";
            this.count = "";
            this.countBox.innerHTML = "";
            Event.stop(evt);
            return false;
        }
        if(this.NORMAL_HANDLER[this.key_history] &&
           this.NORMAL_HANDLER[this.key_history] instanceof Function){
            this.NORMAL_HANDLER[this.key_history].call(this, evt);
            this.key_history = "";
            this.count = "";
            this.countBox.innerHTML = "";
            Event.stop(evt);
            return false;
        }
    };
    Slide.prototype.commandHandler = function(evt){
        evt = window.event || evt;
        var keycode = evt.keyCode || evt.which;
        var keyname;
        switch(keycode){
        case Event.KEY_ESC:
            keyname = "<Esc>";
            break;
        case Event.KEY_BACKSPACE:
            keyname = "<BS>";
            break;
        case Event.KEY_RETURN:
            keyname = "<CR>";
            break;
        default:
            keyname = String.fromCharCode(keycode);
            break;
        }
        Event.pause(evt);
        if(!keyname){return true;}
        if(this.COMMAND_HANDLER[keyname] &&
           this.COMMAND_HANDLER[keyname] instanceof Function){
            this.COMMAND_HANDLER[keyname].call(this, evt);
            return true;
        }
        if(this.COMMAND_HANDLER[this.key_history] &&
           this.COMMAND_HANDLER[this.key_history] instanceof Function){
            this.COMMAND_HANDLER[this.key_history].call(this, evt);
            return true;
        }

        return true;
    };
    Slide.prototype.searchHandler = function(evt){
        evt = window.event || evt;
        var keycode = evt.keyCode || evt.which;
        var keyname;
        switch(keycode){
        case Event.KEY_ESC:
            keyname = "<Esc>";
            break;
        case Event.KEY_BACKSPACE:
            keyname = "<BS>";
            break;
        case Event.KEY_RETURN:
            keyname = "<CR>";
            break;
        default:
            keyname = String.fromCharCode(keycode);
            break;
        }
        Event.pause(evt);
        if(!keyname){return true;}
        if(this.SEARCH_HANDLER[keyname] &&
           this.SEARCH_HANDLER[keyname] instanceof Function){
            this.SEARCH_HANDLER[keyname].call(this, evt);
            return true;
        }
        if(this.SEARCH_HANDLER[this.key_history] &&
           this.SEARCH_HANDLER[this.key_history] instanceof Function){
            this.SEARCH_HANDLER[this.key_history].call(this, evt);
            return true;
        }

        return true;
    };
    Slide.prototype.nmap = function(keys, callback){
        if(!(callback instanceof Function)){return;}
        this.NORMAL_HANDLER[keys] = callback;
    };
    Slide.prototype.unmap = function(keys){
        this.NORMAL_HANDLER[keys] = null;
    };
    Slide.prototype.cmap = function(keys, callback){
        if(!(callback instanceof Function)){return;}
        this.COMMAND_HANDLER[keys] = callback;
    };
    Slide.prototype.ucmap = function(keys){
        this.COMMAND_HANDLER[keys] = null;
    };
    Slide.prototype.smap = function(keys, callback){
        if(!(callback instanceof Function)){return;}
        this.SEARCH_HANDLER[keys] = callback;
    };
    Slide.prototype.usmap = function(keys){
        this.SEARCH_HANDLER[keys] = null;
    };
    Slide.prototype.reset = function(){
        this.count = "";
        this.key_history = "";
        this.mode = "normal";
    };
    Slide.prototype.toggleOutline = function(b){
        var o=$(this.outliner), c=$(this.slides),x=$(this.outlineBar);
        b = b==undefined?(parseInt(o.css("left"))!=0):b;
        if(b){
            o.css({"left":"0"});
            c.css({"margin-left":210});
            x.text("<");
        }else{
            o.css({"left":"-200px"});
            c.css({"margin-left":10});
            x.text(">");
        }
    };
    Slide.prototype.showOutline = function(){
        this.toggleOutline(true);
    };
    Slide.prototype.hideOutline = function(){
        this.toggleOutline(false);
    };
    Slide.prototype.gg = function(){
        this.go2(parseInt(this.count||1));
    };
    Slide.prototype.G = function(){
        this.go2(parseInt(this.count||this._maxpage));
    };
    Slide.prototype.prevItem = function(){
        if(this.items>this.item){
        }else{
            this.prevSlide();
        }
    };
    Slide.prototype.prevSlide = function(){
        this.go(0 - parseInt(this.count||1));
    };
    Slide.prototype.nextItem = function(){
        if(this.items>this.item){
        }else{
            this.nextSlide();
        }
    };
    Slide.prototype.nextSlide = function(){
        this.go(parseInt(this.count||1));
    };

    Slide.prototype.searchModeOn = function(){
        this.toolbar.style.display = "none";
        this.searchBox.style.display = "block";
        this.searchInput.focus();
    };
    Slide.prototype.searchModeOff = function(){
        this.container.focus();
        this.searchBox.style.display = "none";
        this.toolbar.style.display = "block";
    };
    Slide.prototype.searchModeBackspace = function(){
        if(this.searchInput.value==""){
            this.searchModeOff();
        }
    };
    Slide.prototype.searchDo = function(){
        var key = this.searchInput.value;
        this.SEARCH_RESULTS = this.doSearch(key);
        this.searchModeOff();
        if(this.SEARCH_RESULTS.length==0){return;}
        for(var i=0,l=this.SEARCH_RESULTS.length; i<l; i++){
            if(this.page <= this.SEARCH_RESULTS[i]){
                this.go2(this.SEARCH_RESULTS[i]);
                return;
            }
        }
        this.go2(this.SEARCH_RESULTS[0]);
    };
    // TODO: do search process for class.
    Slide.prototype.doSearch = function(key){
        var re = new RegExp('('+key+')', key==key.toLowerCase()?"img":"mg");
        $(">li.slide-search", this.outlineBd).removeClass("slide-search");
        $('span.slide-search').each(function(){
            $(this).replaceWith($(this).text());
        });
        var r = [], _this=this;
        if(!key){return r;}
        $(">div.slide", this.slidesBox).each(function(page){
            var has = searchTextNode(this.childNodes);
            if(has){
                r.push(page+1);
                $(">li:eq("+page+")", _this.outlineBd).addClass("slide-search");
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
                }
            }
            return has;
        }
        return r;
    };
    Slide.prototype.searchPrev = function(){
        if(!this.SEARCH_RESULTS.length){return;}
        for(var i=this.SEARCH_RESULTS.length-1; i>=0; i--){
            if(this.page>this.SEARCH_RESULTS[i]){
                this.go2(this.SEARCH_RESULTS[i]);
                return;
            }
        }
        this.go2(this.SEARCH_RESULTS[this.SEARCH_RESULTS.length-1]);
    };
    Slide.prototype.searchNext = function(){
        if(!this.SEARCH_RESULTS.length){return;}
        for(var i=0,l=this.SEARCH_RESULTS.length; i<l; i++){
            if(this.page<this.SEARCH_RESULTS[i]){
                this.go2(this.SEARCH_RESULTS[i]);
                return;
            }
        }
        this.go2(this.SEARCH_RESULTS[0]);
    };
    Slide.prototype.commandModeOn = function(){
        this.toolbar.style.display = "none";
        this.commandBox.style.display = "block";
        this.commandInput.focus();
    };
    Slide.prototype.commandModeOff = function(){
        this.container.focus();
        this.commandBox.style.display = "none";
        this.toolbar.style.display = "block";
    };
    Slide.prototype.commandBackspace = function(){
        if(this.commandInput.value==""){
            this.commandModeOff();
        }
    };
    /*
     * fix container size for resize event.
     */
    Slide.prototype.fontSizePlus = function(){
        this.fontSize(parseInt(this.count||1));
    };
    Slide.prototype.fontSizeMinus = function(){
        this.fontSize(0 - parseInt(this.count||1));
    };
    Slide.prototype.fontSizeRevert = function(){
        this.fontSize(0);
    };
    Slide.prototype.fontSize = function(offset){
        var s;
        if(0==offset){s=this.DEFAULT_FONTSIZE;}
        else{s=this.FONTSIZE+offset;}
        this.container.css("font-size", s);
    };
    Slide.prototype.fullScreen = function(){
        alert("full screen.")
    };
    Slide.prototype.go = function(offset){
        this.go2(this.page+parseInt(offset));
    };
    // TODO:for class version 2.
    Slide.prototype.go2 = function(page, flag){
        this.items = 0;
        this.item = 0;
        page = parseInt(page);
        var p = page-1;
        if(page==this.page && !flag){return;}
        if(page<1){p=0; page=1;}
        if(page>this._maxpage){p=this._maxpage-1; page=this._maxpage;}

        var docHi = $(this.container).height();
        $(".slides").css({"top":"-"+(p*docHi)+"px"});
        //$("#content").animate({"top":"-"+(p*docHi)+"px"},200);
        $(">li.active", this.outlineBd).removeClass("active");
        $(">li:eq("+(p)+")", this.outlineBd).addClass("active");
        // TODO: auto sync outline.
        var t = $(">li:eq("+p+")", this.outlineBd).offset().top,
            b=$(this.outlineBox),
            s=b.scrollTop();
        if(t<40 || t>(docHi-40)){b.scrollTop(s+t-40);}
        this.page = page;
        this.currPageInput.value = this.page;
        window.location.hash = "#"+this.page;
    }
    Slide.prototype.showHelp = function(){
        this.helper.style.display = "block";
        this.mode = "help";
    };
    Slide.prototype.hideHelp = function(){
        this.helper.style.display = "none";
        this.mode = "normal";
    };

    var S_HELP = '<table>'+
        '<thead>'+
        '    <tr>'+
        '        <th colspan="2" width="50%">键盘映射(快捷键)</th>'+
        '        <th colspan="2" width="50%" id="help-close"><span>Close</span></th>'+
        '    </tr>'+
        '</thead>'+
        '<tbody>'+
        '    <tr>'+
        '        <th width="80">{count}j</td>'+
        '        <td>向后翻 {count} 页，缺省向后翻 1 页。</td>'+
        '        <th width="80">/</th>'+
        '        <td class="desc">正向搜索，注意右下角的搜索输入框，输入关键字或 JavaScript 正则模式，并回车。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>{count}k</th>'+
        '        <td>向前翻 {count} 页，缺省向前翻 1 页。</td>'+
        '        <th>{count}n</th>'+
        '        <td>向后翻到第 {count} 个搜索结果页，缺省翻到后一个搜索结果页。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th></th>'+
        '        <td></td>'+
        '        <th>{count}N</th>'+
        '        <td>向前翻到第 {count} 个搜索结果页，缺省翻到前一个搜索结果页。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>{count}gg</th>'+
        '        <td>翻到第 {count} 页；缺省翻到第 1 页。</td>'+
        '        <th>&gt;</th>'+
        '        <td>显示大纲视图。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>{count}G</th>'+
        '        <td>翻到第 {count} 页；缺省翻到最后一页。</td>'+
        '        <th>&lt;</th>'+
        '        <td>隐藏大纲视图。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th></th>'+
        '        <td></td>'+
        '        <th>?</th>'+
        '        <td>显示帮助。触发其他按键会自动隐藏帮助信息。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>{count}+</th>'+
        '        <td>字体放大 {count} 像素，缺省放大 1 像素。</td>'+
        '        <th></th>'+
        '        <td></td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>{count}-</th>'+
        '        <td>字体缩小 {count} 像素，缺省缩小 1 像素。</td>'+
        '        <th>&lt;Esc&gt;</th>'+
        '        <td>重置操作，例如清除 {count}，退出 Help 模式，退出搜索模式等。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>0</th>'+
        '        <td>(数字零) 字体还原到初始大小。</td>'+
        '        <th>o</th>'+
        '        <td>打开外部 Slide 档。</td>'+
        '    </tr>'+
        '</tbody>'+
        '<thead>'+
        '    <tr>'+
        '        <th colspan="4">命令</th>'+
        '    </tr>'+
        '</thead>'+
        '<tbody>'+
        '    <tr>'+
        '        <th>:play</th>'+
        '        <td>开始播放。</td>'+
        '        <th>:ig[norecase]<br />:ic<br />:noig[norecase]<br />:noic</th>'+
        '        <td>搜索忽略大小写。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>:pause</th>'+
        '        <td>停止播放。</td>'+
        '        <th>:smartcase<br />:sc<br />:nosmartcase<br />:nosc</th>'+
        '        <td>搜索时使用智能大小写匹配。</td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th>:stop</th>'+
        '        <td>停止播放。</td>'+
        '        <th></th>'+
        '        <td></td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th></th>'+
        '        <td></td>'+
        '        <th></th>'+
        '        <td></td>'+
        '    </tr>'+
        '    <tr>'+
        '        <th></th>'+
        '        <td></td>'+
        '        <th></th>'+
        '        <td></td>'+
        '    </tr>'+
        '</tbody>'+
        '</table>';

    return Slide;
})();
