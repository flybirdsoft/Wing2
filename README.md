# Wing2
Wing.js version2 is SPA for front-end framework

### Wing.js 的理念：

  * 1.减少对第三方的重度依赖；
  * 2.无需安装babel即可写出像React的代码风格；
  * 3.wing.js的设计极简思路，指包含有路由管理、数据渲染管理，让研发更便捷；
  * 4.让前端研发回归原生，提高研发工程师的技术能力，发挥主观能动性；
  
### Wing.js路由配置
	var wR = new Wing.wRouter({
		useHistory:false,
		refresh:function(hash){
		}
	}); /*路由控制器组件*/
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
  
  
  
