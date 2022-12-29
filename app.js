var basis = require("node-basis");

basis.setRouter({
	"controllerName1":"/api/:id/:version", /*:id,:version是URL中的动态参数,在basis.controller()中可以获取参数*/
	"controllerName2":"/",
	"interface":"/restful/info"
});

basis.run(80);