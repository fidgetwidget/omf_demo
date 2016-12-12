var Dom = require(__dirname+"/Dom");

var elms = [];
var PageScripts = {}

var instructions_click = function (event) {
  if (Dom.hasClass(elms['instructions'], 'hidden'))
    Dom.removeClass(elms['instructions'], 'hidden');
  else
    Dom.addClass(elms['instructions'], 'hidden');
}


PageScripts.run = function () {

  elms['instructions'] = Dom.byId('instructions');
  elms['instructions_close'] = Dom.findChild(elms['instructions'], '.close')[0];
  elms['instructions_close'].onclick = instructions_click;

}

module.exports = PageScripts;