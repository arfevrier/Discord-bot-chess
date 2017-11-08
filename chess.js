var page = require('webpage').create();
var system = require('system');
page.viewportSize = { width: 250, height: 250 };
page.content = decodeURIComponent(system.args[2]).replace( /\+/g, ' ' );
page.render(system.args[1]);
phantom.exit();