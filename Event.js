/**
 * @author 闲耘™(hotoo.cn[AT]gmail.com)
 */
var Event = {
    KEY_BACKSPACE: 8,
    KEY_TAB     : 9,
    KEY_RETURN  : 13,
    KEY_SHIFT   : 16,
    KEY_CTRL    : 17,
    KEY_CAPSLOCK: 20,
    KEY_ESC     : 27,
    KEY_LEFT    : 37,
    KEY_UP      : 38,
    KEY_RIGHT   : 39,
    KEY_DOWN    : 40,
    KEY_DELETE  : 46,
    KEY_HOME    : 36,
    KEY_END     : 35,
    KEY_PAGEUP  : 33,
    KEY_PAGEDOWN: 34,
    KEY_INSERT  : 45,
    KEY_WINDOWS : 91,
    KEY_COMMA   : 188,
    KEY_SEMICOLON: 186,
    KEY_QUOTATION: 222,
    KEY_SIGN    : 49
};
Event.stop = function(evt){
    if(evt.stopPropagation){
        evt.preventDefault();
        evt.stopPropagation();
    }else{
        evt.cancelBubble = true;
        evt.returnValue = false;
    }
};
// for keypress handler.
Event.key = function(evt){
    evt = window.event || evt;
    var keycode = evt.keyCode || evt.which || evt.charCode;
    var keyname = String.fromCharCode(keycode);
    if(Event.KEY_SHIFT==keycode || Event.KEY_CTRL==keycode){
        return;
    }
    if((evt.shiftKey && Event.CapsLock(evt)) || (!evt.shiftKey &&!Event.CapsLock(evt))){
        keyname = keyname.toLowerCase();
    }
    return keyname;
};
Event.CapsLock = function(evt){
    var e = evt||window.event;
    var o = e.target||e.srcElement;
    var oTip = o.nextSibling;
    var keyCode  =  e.keyCode||e.which; // 获取按键的keyCode
    var isShift  =  e.shiftKey ||(keyCode  ==   16 ) || false ;
    // 判断shift键是否按住
    if (
        ((keyCode >=   65   &&  keyCode  <=   90 )  &&   !isShift)
        // Caps Lock 打开，且没有按住shift键
        || ((keyCode >=   97   &&  keyCode  <=   122 )  &&  isShift)
        // Caps Lock 打开，且按住shift键
    ){return true;}
    else{return false;}
};
Event.add = function(elem, evt, callback){
    if (elem.addEventListener) {
        if(document==elem){
            document["on"+evt] = callback;
        }else{
            elem.addEventListener(name, callback, false);
        }
    } else {
        elem.attachEvent("on"+evt, callback);
    }
};
Event.remove = function(elem, evt, callback){
    if (elem.removeEventListener) {
        elem.removeEventListener(evt, callback, false);
    } else {
        elem.detachEvent("on"+evt, callback);
    }
};
