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


var Slide = (function(){
    var addClass = function(elem, cls){
        var c=elem.className;
        // empty class.
        if(/^\s*$/.test(c)){elem.className = cls;}
        // exist class.
        if(c.indexOf(cls)==0 || c.indexOf(" "+cls)>0){return;}
        elem.className+=" "+cls;
    };
    var removeClass = function(elem, cls){
        var c=elem.className;
        // empty class.
        if(/^\s*$/.test(c)){elem.className = "";}
        if(c.indexOf(" "+cls)>0){
            c=c.replace(new RegExp("\s+"+cls+"\s*","g"), " ")
        }
        if(c.indexOf(cls)==0){
            c=c.replace(new RegExp("^"+cls+"\s*",""), "")
        }
        elem.className = c;
    };

    var Slide = function(c){
        this.container = c||document;
        if(document==this.container){
            this.page = location.hash.match(/#(\d+)/);
            this.page = this.page && this.page[1] ? parseInt(this.page[1]) : 1;
            if(this.page<0){this.page = 1;}
        }else{
            this.page = 1;
        }
        this.init();
        this.NORMAL_HANDLER={};
        this.COMMAND_HANDLER={};
        this.SEARCH_HANDLER={};
        this.key_history="";
        this.count = "";

        this.nmap("<Esc>", Function.createDelegate(this, this.reset));
        this.nmap("j", Function.createDelegate(this, this.nextSlide));
        this.nmap("<Down>", Function.createDelegate(this, this.nextSlide));
        this.nmap("<Right>", Function.createDelegate(this, this.nextSlide));

        this.nmap("k", Function.createDelegate(this, this.prevSlide));
        this.nmap("<Up>", Function.createDelegate(this, this.prevSlide));
        this.nmap("<Left>", Function.createDelegate(this, this.prevSlide));

        this.nmap("gg", Function.createDelegate(this, this.gg));
        this.nmap("G", Function.createDelegate(this, this.G));

        this.nmap("/", Function.createDelegate(this, this.searchModeOn));
        this.smap("<Esc>", Function.createDelegate(this, this.searchModeOff));
        this.smap("<BS>", Function.createDelegate(this, this.searchModeBackspace));

        this.nmap(":", Function.createDelegate(this, this.commandModeOn));
        this.cmap("<Esc>", Function.createDelegate(this, this.commandModeOff));
        this.cmap("<BS>", Function.createDelegate(this, this.commandBackspace));

        this.nmap("-", Function.createDelegate(this, this.fontSizeMinus));
        this.nmap("_", Function.createDelegate(this, this.fontSizeMinus));
        this.nmap("+", Function.createDelegate(this, this.fontSizePlus));
        this.nmap("=", Function.createDelegate(this, this.fontSizePlus));
        this.nmap("0", Function.createDelegate(this, this.fontSizeRevert));
    };
    Slide.prototype.init = function(){
        this.outliner = document.createElement("div");
        this.outlineBar = document.createElement("a");
        this.outlineHd = document.createElement("h4");
        this.outlineHd.appendChild(document.createTextNode("Outline:"))
        this.outlineBox = document.createElement("div");
        this.outlineBd = document.createElement("ol");
        this.outliner.appendChild(this.outlineBar);
        this.outliner.appendChild(this.outlineHd);
        this.outliner.appendChild(this.outlineBox);
        this.outlineBox.appendChild(this.outlineBd);

        this.toolbar = document.createElement("div");
        this.toolbar.className = "slide-toolbar";

        this.countBox = document.createElement("span");
        this.toolbar.appendChild(this.countBox);

        this.searchBox = document.createElement("div");
        this.searchBox.className = "status-bar";
        this.searchInput = document.createElement("input");
        this.searchInput.setAttribute("type", "text");
        this.searchBox.appendChild(document.createTextNode("/"));
        this.searchBox.appendChild(this.searchInput);
        this.toolbar.appendChild(this.searchBox);

        this.commandBox = document.createElement("div");
        this.commandBox.className = "status-bar";
        this.commandInput = document.createElement("input");
        this.commandInput.setAttribute("type", "text");
        this.commandBox.appendChild(document.createTextNode(":"))
        this.commandBox.appendChild(this.commandInput);
        this.toolbar.appendChild(this.commandBox);

        this.pageInfoBox = document.createElement("span");
        this.currPageInput = document.createElement("input");
        this.currPageInput.setAttribute("type", "text");
        this.maxPageBox = document.createElement("cite");
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
        this.pauseBar.innerHTML = "Pause &Iota;&Iota;";
        //this.pauseBar.appendChild(document.createTextNode("Pause &Iota;&Iota;"));
        this.toolbar.appendChild(this.prevBar);
        this.toolbar.appendChild(this.playBar);
        this.toolbar.appendChild(this.pauseBar);
        this.toolbar.appendChild(this.nextBar);

        if(document==this.container){
            var b = document.body; //this.container.body;
        }
        b.appendChild(this.outliner);
        b.appendChild(this.toolbar);
        b.tabIndex = 1;
        b.setAttribute("tabindex", "1");
        //jQuery.
        this.DEFAULT_FONTSIZE = this.FONTSIZE = $(b).css("font-size");
        addClass(b, "presentation");

        Event.add(this.container, "keypress", Function.createDelegate(this, this.normalHandler));

        //this.nmap("<Esc>", Function.createDelegate(this, function(){
            //alert(0);
            //ths.key_history = "";
        //}));
    };
    Slide.prototype.normalHandler = function(evt){
        evt = evt || window.event;
        var keycode = evt.keyCode || evt.which;
        var keyname;
        switch(keycode){
        case Event.KEY_ESC:
            keyname = "<Esc>";
            break;
        case Event.KEY_BACKSPACE:
            keyname = "<BS>";
            break;
        case Event.KEY_TAB:
            keyname = "<Tab>";
            break;
        case Event.KEY_RETURN:
            keyname = "<CR>";
            break;
        case Event.KEY_SHIFT:
        case Event.KEY_CTRL:
            return;
        case Event.KEY_CAPSLOCK:
            keyname = "<CapsLock>";
            break;
        case Event.KEY_LEFT:
            keyname = "<Left>";
            break;
        case Event.KEY_UP:
            keyname = "<Up>";
            break;
        case Event.KEY_RIGHT:
            keyname = "<Right>";
            break;
        case Event.KEY_DOWN:
            keyname = "<Down>";
            break;
        default:
            keyname = String.fromCharCode(keycode);
            break;
        }
        if("0"==keyname && this.count){
            // "0" 开始的量词是没有意义的，可以直接当作命令。
            // 所以这里排除了这种情况。
            this.count += keyname;
        }else if(/^[1-9]$/.test(keyname)){
            this.count += keyname;
        }else if(this.NORMAL_HANDLER[keyname] &&
                 this.NORMAL_HANDLER[keyname] instanceof Function){
            this.NORMAL_HANDLER[keyname].call(this, evt);
            this.key_history = "";
            this.count = "";
            Event.stop(evt);
            return false;
        }

        keyname = this.key_history+keyname;
        if(this.NORMAL_HANDLER[keyname] &&
           this.NORMAL_HANDLER[keyname] instanceof Function){
            this.NORMAL_HANDLER[keyname].call(this, evt);
            this.key_history = "";
            this.count = "";
            Event.stop(evt);
            return false;
        }

        this.key_history = keyname;
    };
    Slide.prototype.commandHandler = function(evt){};
    Slide.prototype.searchHandler = function(evt){};
    Slide.prototype.nmap = function(keys, callback){
        if(!(callback instanceof Function)){return;}
        this.NORMAL_HANDLER[keys] = callback;
    };
    Slide.prototype.unmap = function(keys){
        this.NORMAL_HANDLER[keys] = null;
    };
    Slide.prototype.cmap = function(keys, callback){
        this.COMMAND_HANDLER[keys] = callback;
    };
    Slide.prototype.ucmap = function(keys){
        this.COMMAND_HANDLER[keys] = null;
    };
    Slide.prototype.smap = function(keys, callback){
        this.SEARCH_HANDLER[keys] = callback;
    };
    Slide.prototype.usmap = function(keys){
        this.SEARCH_HANDLER[keys] = null;
    };
    Slide.prototype.reset = function(){};
    Slide.prototype.gg = function(){
        this.go2(parseInt(this.count||1));
    };
    Slide.prototype.G = function(){
        this.go2(parseInt(this.count||this._maxpage));
    };
    Slide.prototype.prevItem = function(){};
    Slide.prototype.prevSlide = function(){
        this.go(0 - parseInt(this.count||1));
    };
    Slide.prototype.nextItem = function(){
    };
    Slide.prototype.nextSlide = function(){
        this.go(parseInt(this.count||1));
    };

    Slide.prototype.searchModeOn = function(){};
    Slide.prototype.searchModeOff = function(){};
    Slide.prototype.searchModeBackspace = function(){};

    Slide.prototype.commandModeOn = function(){};
    Slide.prototype.commandModeOff = function(){};
    Slide.prototype.commandBackspace = function(){};
    /*
     * fix container size for resize event.
     */
    Slide.prototype.fixSize = function(){
        alert("fix container size for resize.")
    };
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
        alert(page);
        return;
        page = parseInt(page);
        var p = page-1;
        if(page==this.page && !flag){return;}
        if(page<1){p=0; page=1;}
        if(page>this._maxpage){p=this._maxpage-1; page=this._maxpage;}

        $("#content").css({"top":"-"+(p*docHi)+"px"});
        //$("#content").animate({"top":"-"+(p*docHi)+"px"},200);
        $("#outline-bd>li.active").removeClass("active");
        $("#outline-bd>li:eq("+(p)+")").addClass("active");
        // TODO: auto sync outline.
        var t = $("#outline-bd>li:eq("+p+")").offset().top,
            b=$("#outline-box"),
            s=b.scrollTop();
        if(t<40 || t>(docHi-40)){b.scrollTop(s+t-40);}
        this.page = page;
        $("#lab-curr").val(CURR_PAGE);
        window.location.hash = "#"+this.page;
    }

    return Slide;
})();
