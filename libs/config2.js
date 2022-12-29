/*
write by wuweiwei
Wing.js is write by wweiwei

*/
(function(win){
	var $ID = function(id){
		return document.getElementById(id);
	}
	/*
	Wing is global object
	*/
	var wRouter = Wing.wRouter;

	var wR = new wRouter({
		useHistory:false,
		refresh:function(hash){
		}
	}); /*路由控制器组件*/

	window.routerObject = wR; //全局变量,App.Project.js里用到

	wR.loadScript('/App/App.js',function(){
		console.log("loaded");
	});
	
	var routerCfg = {
		container:document.getElementById("app"),
		routes:[
			{
				url:"/index",
				controller:"Index",
				templateUrl:"tpls/AppIndex.html", /*载入模板到container指定的DOM里*/
				js:"/App/App.Index.js"
			},
			{
				url:"/project/:id",
				controller:"project",
				templateUrl:"/tpls/Project.html",
				js:"/App/App.Project.js"
			}
		],
		otherwise:{
			redirectTo:"/index"
		}
	}

	wR.config(routerCfg);
	wR.controller("Index",function(args){
		App.Index.init(args);
		console.log(this.location);/* this is location object*/
	});
	wR.controller("project",function(args){
		/*
		args is url :id object
		this args is "{id:2017111231}"
		*/
		App.Project.init(args);
	});
	wR.commonController(function(isFirst){
		console.log(this.location.action);

		var mainMenu = document.querySelector(".mainMenu");
		var mainMenuItem = mainMenu.querySelectorAll("dd");
		if(this.location.action == "/index")
		{
			mainMenuItem[0].className = "select";
		}
		else if(this.location.action.indexOf("project")>-1)
		{
			mainMenuItem[1].className = "select";
		}
		mainMenu.onclick = function(e){
			let target = e.target;
			let aList = mainMenu.querySelectorAll("a");
			aList.forEach(function(item){
				item.parentNode.className = "";
			});
			if(target.nodeName == "A")
			{
				target.parentNode.className = "select";
			}
		}
	});
	//wR.triggerRouter("Index");
})(window);
