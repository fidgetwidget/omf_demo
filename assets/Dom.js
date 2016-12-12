var _document = document;
var _window = _document.window;
var Dom = {};

Dom.doc = _document;

Dom.win = _window;

Dom.byId = function (id) {
    return _document.getElementById(id);
}

Dom.find = function (selector) {
    return _document.querySelectorAll(selector);
}

Dom.findChild = function (parent, selector) {
    return parent.querySelectorAll(selector);
}

Dom.hasClass = function (elm, className) {
    if (elm.classList)
        return elm.classList.contains(className);
    else
        return !!elm.className.match(new RegExp('(\\s|^)' + className + '(\\s|$)'));
}

Dom.addClass = function (elm, className) {
    if (elm.classList)
        elm.classList.add(className);
    else if (!Dom.hasClass(elm, className)) 
        elm.className += " " + className;  
}

Dom.removeClass = function (elm, className) {
    if (elm.classList)
        elm.classList.remove(className);
    else if (Dom.hasClass(elm, className))
        var r = new RegExp('(\\s|^)' + className + '(\\s|$)');
        elm.className = elm.className.replace(r, ' ');
}

Dom.ready = function (func) {
    _document.addEventListener('DOMContentLoaded', func);
}

module.exports = Dom;