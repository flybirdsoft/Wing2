/*
Wing.js
write by wuweiwei

www.flybirdsoft.com
www.flybirdsoft.com/WUI
www.cnblogs.com/wsoft
www.github.com/flybirdosft

*/


(function(win){
	
	"use strict";


	var wRouter = function(options){

		this.options = options;
		this.version = "2.0.0";
		this.route = [];
		this.defRouteIndex = -1;
		this.commonControllerHandler = function(isFirst){};
		this.endControllerHandler = function(controllerName){};
		this.isFirstLoad = true;
		this.prevControllerName = "";
		this.event = {};
		//this.http = {userMask:true};
		//this.template = {};
		this.location = {
			url:"",
			host:"",
			fileName:"",    /*获得URL中的文件名*/
			port:"",
			param:"",      /*?后面的get字符串*/
			params:[],     /*参数格式是?key=value&key=value ， 然后转换成{key:"xx",value:"ddd"}存入params*/
			action:""      /*url中#号后面的/xx/xxx */
		};
		this.fileCache = [];
		this.microServiceCash = [];/*save route*/
		this._onhashchange();
	}


	/*
	*******************************
	wRouter.location对象的调用接口
	调用wRouter.location.getURL(url);
	接口类型：内部
	*******************************
	*/
	wRouter.prototype.getURL=function(url){
		if(url!=undefined)
		{
			this.location.url=decodeURI(url);
		}
		else
		{
			this.location.url=decodeURI(window.location.href);
		}
		if(this.isHistory())
		{
			this.convertHistoryURL();
		}
		else
		{
			this.convertURL();
		}
		
	}

	wRouter.prototype.isIE=function(){
		/*
		if(navigator.userAgent.indexOf("MSIE 8")>0)
		{return true;}
		*/
		if(navigator.userAgent.indexOf("MSIE 7")>0)
		{return true;}
		if(navigator.userAgent.indexOf("MSIE 6")>0)
		{return true;}
		return false;
	}

	wRouter.prototype.isIE8=function(){
		if(navigator.userAgent.indexOf("MSIE 8")>0)
		{return true;}
		return false;
	}

	wRouter.prototype.isHistory=function(){
		var useHistory = this.options && this.options.useHistory;
		if(!!history.pushState&&(!!this.useHistory||useHistory))
		{
			return true;
		}
		else
		{
			return false;
		}
		
	}

	wRouter.prototype.onLoad = function(){
		var th = this;
		if(this.isHistory())
		{
			window.addEventListener('DOMContentLoaded', function () {
		    	document.querySelectorAll('a[type=history]').forEach(e => e.addEventListener('click', function (_e) {
		        	_e.preventDefault();
		        	history.pushState(null, '', e.getAttribute('href'));
		        	th.viewChange();
		    	}));
		    	th.viewChange();
		 	});
			window.addEventListener('popstate', th.viewChange);
		}
		else
		{
			window.onload=function(){
				var reg=/\/:\w{1,}/;
				if(window.location.href.indexOf("#")==-1)
				{
					if(th.defRouteIndex!=-1)
					{
						window.location.href=th.location.fileName+"#"+th.route.routes[th.defRouteIndex].url.replace(reg,"");
					}
					if(th.isIE())
					{
						th.event.onhashchange();
					}	
				}
				th.options.refresh(location.hash);
				th._onrefresh();
			}
		}
	}

	wRouter.prototype.setHistoryLink = function(container){
		var th = this;
    	document.querySelectorAll('a[href]').forEach(e => e.onclick=function(_e) {
        	_e.preventDefault();
        	history.pushState(null, '', e.getAttribute('href'));
        	th.viewChange();
    	});
	}

	wRouter.prototype.viewChange = function(){
		this.getURL(location.href);
		this.compareHistoryURLs();
	}


	wRouter.prototype.compareHistoryURLs=function(){
		var i, action,rAction,i,rLen,routes;
		var reg=/\/:\w{1,}/g , rAction2=""; /*如果router是/action/action2/:xx，存储去掉:/xx的结果 */
		/*reg是去掉rAction中的 /:xx */
		var args={},mapParam={},v,pos;
		
		routes = this.route.routes;
		rLen = routes.length;
		action = this.location.action; /*格式是：/action/action2 */
		
		for(i=0;i<rLen;i++)
		{
			rAction = routes[i].url;
			if(routes[i].url.indexOf(":")>0)
			{
				rAction2=routes[i].url.replace(reg,"");
				/*args[reg.exec(routes[i].url)[0].replace("/:","")] = action.replace(rAction2,"");*/
				mapParam = this.mapRouteUrlParam(routes[i].url , action.replace(rAction2,""));
				for(v in mapParam)
				{
					args[v] = mapParam[v];
				}
			}
			
			if(rAction.substr(0,1)!="/")
			{
				rAction = "/" + rAction;
			}
			
			if(rAction==action)
			{
				this.tmpl(routes[i]);
				this.loadScript(routes[i].servicePath||routes[i].js,function(){
					this.commonControllerHandler.call(this,this.isFirstLoad);
					this.isFirstLoad=false;
					routes[i].handler&&routes[i].handler.call(this,args);
					this.endControllerHandler.call(this,this.prevControllerName);
					this.prevControllerName = routes[i].controller;
				});
			}
			else if(routes[i].url.indexOf(":")>0)
			{
				if(rAction2==action.substr(0,rAction2.length))
				{
					if(rAction2.length!=action.length&&action.substr(rAction2.length,1)!="/")
					{
						if(this.defRouteIndex!=-1)
						{
							window.location.href=this.location.fileName+"#"+routes[this.defRouteIndex].url.replace(reg,"");
						}
					}
					this.tmpl(routes[i]);
					this.loadScript(routes[i].servicePath||routes[i].js,function(){
						this.commonControllerHandler.call(this,this.isFirstLoad);
						this.isFirstLoad=false;
						routes[i].handler&&routes[i].handler.call(this,args);
						this.endControllerHandler.call(this,this.prevControllerName);
						this.prevControllerName = routes[i].controller;
					});
					return;				
				}
			}
		}
		if(i==rLen)
		{
			//window.location.href=this.location.fileName+"#"+routes[this.defRouteIndex].url.replace(reg,"");
			if(this.defRouteIndex!=-1)
			{
				history.pushState(null, '', routes[this.defRouteIndex].url);
			}
		}
	}


	wRouter.prototype._onrefresh = function(){
		var i,microServiceCash,len;
		microServiceCash = this.microServiceCash;
		len = microServiceCash.length;

		var getHash = function(){
			if(window.location.href.indexOf("#")>-1)
			{
				return window.location.hash.replace("#","");
			}
		}

		var hash = getHash();
		for(i=0;i<len;i++)
		{
			if(hash == 1)
			{

			}
		}
	}

	/*
	******************************
	功能：解析URL,获取action路径信息
	结果：把URL中的 action 存储到 wRouter.location对象里
	接口类型：内部
	******************************
	*/
	wRouter.prototype.convertURL=function(){
		var r,ar,arSub,i,pItem={key:"",value:""};
		r=/\/[\u4E00-\u9FFF]+|\w+\.html/;
		if(r.exec(this.location.url))
		{
			this.location.fileName=r.exec(this.location.url)[0];
		}
		r=/#\S{0,}/;
		if(r.exec(this.location.url)!=null)
		{
			this.location.action = r.exec(this.location.url)[0];
			this.location.action = this.location.action.replace("#","");
			this.location.action = this.location.action.replace(/\?\S+/,"");
			if(this.location.action.substr(0,1)!="/")
			{
				this.location.action = "/"+this.location.action;
			}
			if(this.location.action.substr(this.location.action.length-1,1)=="/")
			{
				this.location.action = this.location.action.substr(0,this.location.action.length-1);
			}		
		}
		r=/\?\S{0,}/;
		if(r.exec(this.location.url)!=null)
		{
			this.location.params=[];
			this.location.param = r.exec(this.location.url)[0];
			this.location.param = this.location.param.replace("?","");
			ar = this.location.param.split("&");
			for(i=0;i<ar.length;i++)
			{
				pItem={key:"",value:""};
				arSub = ar[i].split("=");
				pItem.key = arSub[0];
				pItem.value = arSub[1];		
				this.location.params.push(pItem);
			}
		}
		this.location.param = this.location.param.replace("?","");
	}


	wRouter.prototype.convertHistoryURL=function(){
		var r,ar,arSub,i,pItem={key:"",value:""};
		r=/\/[\u4E00-\u9FFF]+|\w+\.html/;
		if(r.exec(this.location.url))
		{
			this.location.fileName=r.exec(this.location.url)[0];
		}
		
		this.location.action = window.location.pathname;

		r=/\?\S{0,}/;
		if(r.exec(this.location.url)!=null)
		{
			this.location.params=[];
			this.location.param = r.exec(this.location.url)[0];
			this.location.param = this.location.param.replace("?","");
			ar = this.location.param.split("&");
			for(i=0;i<ar.length;i++)
			{
				pItem={key:"",value:""};
				arSub = ar[i].split("=");
				pItem.key = arSub[0];
				pItem.value = arSub[1];		
				this.location.params.push(pItem);
			}
		}
		this.location.param = this.location.param.replace("?","");
	}
	/*window.$location = wRouter.location;*/

	/*************/
	/*缓存路由中的 servicePath*/
	/*************/
	wRouter.prototype.cashMicroService = function(routes){
		var i,len;
		len = routes.length;
		for(i=0;i<len;i++)
		{
			if(!!routes[i].servicePath)
			{
				this.microServiceCash.push(routes[i]);
			}
		}
	}
	
	/*
	****************************************
	接口类型：外部
	功能：配置路由
	参数：
	routes={
		templateContentId:"#mainContent",
		routes:[
			{
			url:"/action/index",
			controller:"myController",
			template:"#templateIndex"
			}
			,	
			{
			url:"/action/action2",
			controller:"myController",
			templateUrl:"xxx.html"
			}
			,
			{
			url:"/action/action2",
			controller:"myController"
			handler:function(){}       通过wRouter.controller()函数添加
			}
		],
		otherwise:{
			redirectTo:"action/index",
			handler:function(){}
		}
	}
	****************************************
	*/
	wRouter.prototype.config=function(routes){
		this.route = routes;
		this.controlLink();
		this.onLoad();
		this.cashMicroService(routes);
	}

	/*
	*************************************
	类型：对外接口
	功能：添加路由
	*************************************
	*/
	wRouter.prototype.addRoute=function(routes){
		/*
		routes=[
			{
			url:"/action/index",
			controller:"myController",
			template:"#templateIndex"
			}
			,	
			{
			url:"/action/action2",
			controller:"myController",
			templateUrl:"xxx.html"
			}
		]
		或
		routes={
			url:"/action/action2",
			controller:"myController",
			templateUrl:"xxx.html"	
		}
		 */
		var i;
		if(routes.length==undefined)
		{
			this.route.routes.push(routes);
		}
		else
		{
			for(i=0;i<routes.length;i++)
			{
				this.route.routes.push(routes[i]);
			}
		}
	}


	/*
	***********************************
	说明：所有的URL请求都执行此commonController
	功能：在wRouter.controller(function(){...})前执行
	接口类型：外部
	***********************************
	*/
	wRouter.prototype.commonController=function(f){
		if(f!=undefined)
		{
			this.commonControllerHandler=f;
		}
		else
		{
			this.commonControllerHandler=function(){};
		}
	}

	/*
	***********************************
	说明：所有的URL请求都执行此endController
	功能：在wRouter.controller(function(){...})后执行
	，作用是用户自定义清理前一个controller的清理工作
	接口类型：外部
	***********************************
	*/
	wRouter.prototype.endController=function(f){
		if(f!=undefined)
		{
			this.endControllerHandler=f;
		}
		else
		{
			this.endControllerHandler=function(){};
		}
	}

	/*
	*******************************************
	功能：注册函数方法，当URL发生变化执行对应的URL对应的函数(此方法多次调用)
	注意：进入或刷新页面时执行
	接口类型：外部
	********************************************
	*/
	wRouter.prototype.controller=function(controllerName,f){
		var i,rLen,routes,otherwise;
		var reg=/\/:\w{1,}/;
		if(this.route.length==0)
		{return;}
		routes = this.route.routes;
		rLen = routes.length;

		otherwise = this.route.otherwise;
		
		for(i=0;i<rLen;i++)
		{
			if(routes[i].controller==controllerName)
			{
				routes[i].handler = f;
				this.run(routes[i]);
				if(!!this.route.otherwise)
				{
					if(routes[i].url==this.route.otherwise.redirectTo || routes[i].url.replace(reg,"")==this.route.otherwise.redirectTo)
					{
						this.defRouteIndex=i;
					}
				}

				//console.log("contrller:",this.defRouteIndex);
				return;
			}		
		}
		if(i==rLen)
		{
			if(this.defRouteIndex!=-1)
			{
				window.location.href=wRouter.location.fileName+"#"+routes[this.defRouteIndex].url.replace(reg,"");
			}
		}	
	}

	/*
	***************************************
	功能：调用其它的controller
	接口类型：外部
	***************************************
	*/
	wRouter.prototype.callController=function(controllerName,json){
		/*
		controllerName=需要调用的controller名称
		json=是传给这个controller函数的的参数
		*/
		var i,rLen,routes;
		var args={};
		routes = this.route.routes;
		rLen = routes.length;
		args = json;
		for(i=0;i<rLen;i++)
		{
			if(routes[i].controller==controllerName)
			{
				this.run(routes[i]);
				routes[i].handler.call(this,args);
			}
		}
	}

	/*
	***************************************
	功能：have bug
	接口类型：外部
	***************************************
	*/
	wRouter.prototype.triggerRouter=function(controllerName,json){
		/*
		controllerName=需要调用的controller名称
		json=是传给这个controller函数的的参数
		*/
		var i,rLen,routes , th = this;
		var args={};
		routes = this.route.routes;
		rLen = routes.length;
		args = json;
		for(i=0;i<rLen;i++)
		{
			if(routes[i].controller==controllerName)
			{
				debugger;
				this.tmpl(routes[i]);
				(function(i){
					var ii = i;
					th.loadScript(routes[ii].js,function(){
						th.commonControllerHandler.call(th,th.isFirstLoad);
						th.isFirstLoad=false;
						routes[ii].handler&&routes[ii].handler.call(th,args);
						th.endControllerHandler.call(th,th.prevControllerName);
						th.prevControllerName = routes[ii].controller;
					});
				})(i);

			}
		}
	}


	/*
	***************************************
	功能：have bug
	接口类型：外部
	***************************************
	*/
	wRouter.prototype.redirectTo=function(controllerName){

		var i,rLen,routes , th = this;
		routes = this.route.routes;
		rLen = routes.length;
		for(i=0;i<rLen;i++)
		{
			if(routes[i].controller == controllerName)
			{
				if(!this.isHistory())
				{
					window.location.href = "#" + routes[i].url;
				}
				else
				{

				}
			}
		}

	}

	/*****************
	new wRouter() call _onhashchange
	******************/
	wRouter.prototype._onhashchange = function(){
		var th = this;
		window.addEventListener("hashchange",function(e){
			var evt;
			evt = e ||event;
			th.getURL(evt.newURL);
			th.compareURLs();
		},false);
	}
	/*
	***************************************
	说明：由wRourer.controller()调用
	功能：匹配  浏览器URL action 与 wRouter.config(routes)的路由位置信息
	***************************************
	*/
	wRouter.prototype.run=function(router){
		var th = this;
		this.mask.init();
		this.getURL();
		this.compareURL(router);

		/*
		window.onhashchange = function(e){
			var evt;
			evt = e ||event;
			th.getURL(evt.newURL);
			th.compareURLs();
		};
		*/
		
		this.event.onhashchange=function(){
			th.getURL(location.href);
			th.compareURLs();
		}
	}

	wRouter.prototype.trigger=function(eventStr){
		if(navigator.userAgent.indexOf("MSIE 7")>0)
		{
			th.event[eventStr].call(this);
			return;
		}
		try
		{
			th.event[eventStr].call(this);
		}
		catch(e)
		{;}
	}

	/*
	*******************************************
	功能：
	匹配地址栏URL与wRouter.route.routes[]中的url
	匹配成功后执行用户代码
	*******************************************
	*/
	wRouter.prototype.compareURL=function(router){
		var action,rAction;
		var reg=/\/:\w{1,}/g , rAction2=""; /*如果router是/action/action2/:xx，存储去掉:/xx的结果 */
		/*reg是去掉rAction中的 /:xx */
		var args={},mapParam={},v,pos;
		var routes = this.route.routes;
		router = router;
		action = this.location.action; /*格式是：/action/action2 */
		rAction =router.url;
		if(router.url.indexOf(":")>0)
		{
			rAction2=router.url.replace(reg,"");
			/*args[reg.exec(router.url)[0].replace("/:","")] = action.replace(rAction2,"");*/
			mapParam = this.mapRouteUrlParam(router.url , action.replace(rAction2,""));
			for(v in mapParam)
			{
				args[v] = mapParam[v];
			}
		}
		
		if(rAction.substr(0,1)!="/")
		{
			rAction = "/" + rAction;
		}

		if(rAction==action)
		{
			this.tmpl(router);
			this.loadScript(router.servicePath||router.js,function(){
				this.commonControllerHandler.call(this,this.isFirstLoad);
				this.isFirstLoad=false;
				router.handler&&router.handler.call(this,args);
				this.endControllerHandler.call(this,this.prevControllerName);
				this.prevControllerName = router.controller;
			});
		}
		else if(router.url.indexOf(":")>0)
		{
			if(rAction2==action.substr(0,rAction2.length))
			{
				if(rAction2.length!=action.length&&action.substr(rAction2.length,1)!="/")
				{
					if(this.defRouteIndex!=-1)
					{
						window.location.href=this.location.fileName+"#"+routes[this.defRouteIndex].url.replace(reg,"");
					}
				}
				this.tmpl(router);
				this.loadScript(router.servicePath||router.js,function(){
					this.commonControllerHandler.call(this,this.isFirstLoad);
					this.isFirstLoad=false;
					router.handler&&router.handler.call(this,args);
					this.endControllerHandler.call(this,this.prevControllerName);
					this.prevControllerName = router.controller;
				});
			}
		}
	}

	/*
	*********************************************
	功能：
	匹配地址栏URL与wRouter.route.routes[]中的url
	匹配成功后执行用户代码
	*********************************************
	*/
	wRouter.prototype.compareURLs=function(){
		var i, action,rAction,i,rLen,routes;
		var reg=/\/:\w{1,}/g , rAction2=""; /*如果router是/action/action2/:xx，存储去掉:/xx的结果 */
		/*reg是去掉rAction中的 /:xx */
		var args={},mapParam={},v,pos;
		
		routes = this.route.routes;
		rLen = routes.length;
		action = this.location.action; /*格式是：/action/action2 */
		
		for(i=0;i<rLen;i++)
		{
			rAction = routes[i].url;
			if(routes[i].url.indexOf(":")>0)
			{
				rAction2=routes[i].url.replace(reg,"");
				/*args[reg.exec(routes[i].url)[0].replace("/:","")] = action.replace(rAction2,"");*/
				mapParam = this.mapRouteUrlParam(routes[i].url , action.replace(rAction2,""));
				for(v in mapParam)
				{
					args[v] = mapParam[v];
				}
			}
			
			if(rAction.substr(0,1)!="/")
			{
				rAction = "/" + rAction;
			}
			
			if(rAction==action)
			{
				this.tmpl(routes[i]);
				this.loadScript(routes[i].servicePath||routes[i].js,function(){
					this.commonControllerHandler.call(this,this.isFirstLoad);
					this.isFirstLoad=false;
					routes[i].handler&&routes[i].handler.call(this,args);
					this.endControllerHandler.call(this,this.prevControllerName);
					this.prevControllerName = routes[i].controller;
				});
				return;
			}
			else if(routes[i].url.indexOf(":")>0)
			{
				if(rAction2==action.substr(0,rAction2.length))
				{
					if(rAction2.length!=action.length&&action.substr(rAction2.length,1)!="/")
					{
						if(this.defRouteIndex!=-1)
						{
							window.location.href=this.location.fileName+"#"+routes[this.defRouteIndex].url.replace(reg,"");
						}
					}				
					this.tmpl(routes[i]);
					this.loadScript(routes[i].servicePath||routes[i].js,function(){
						this.commonControllerHandler.call(this,this.isFirstLoad);
						this.isFirstLoad=false;
						routes[i].handler&&routes[i].handler.call(this,args);
						this.endControllerHandler.call(this,this.prevControllerName);
						this.prevControllerName = routes[i].controller;
					});
					return;				
				}
			}
		}
		if(i==rLen)
		{
			if(this.defRouteIndex!=-1)
			{
				window.location.href=this.location.fileName+"#"+routes[this.defRouteIndex].url.replace(reg,"");
			}
		}
	}

	/*
	*********************************************
	功能：
	处理浏览器url后面的参数与路由的参数匹配(即/:xx/:yy)
	匹配成功后执行用户代码
	*********************************************
	*/
	wRouter.prototype.mapRouteUrlParam = function(routeUrl,url){
		/*
		routeUrl,url is string
		routeUrl is 路由表里配置的参数（即:/xx/:yy）
		url is 浏览器的URL参数(即/xx/yy)
		*/
		var routeAr = [] , ar = [] ,routeUrlParam="",urlParam="",i,object={},pos=-1;
		
		pos = routeUrl.indexOf("/:");
		routeUrl = routeUrl.substr(pos);
		routeUrlParam = routeUrl.replace("/:","");

		routeAr = routeUrlParam.split("/:");
		urlParam = url.substr(0,1)=="/" ? url.substr(1) : url;
		ar = urlParam.split("/");
		if(ar[0]==""){ar[0]=undefined;}
		for(i=0;i<routeAr.length;i++)
		{
			object[routeAr[i]] = ar[i];
		}
		return object;
	}
	
	/*
	 * 对routes[].handler函数里的参数注入
	 * 被wRouter.compareURLs()和wRouter.compareURL()调用
	 * ==未使用==
	*/
	wRouter.prototype.Injection=function(fun,injectionObj){
		/*fun即函数名传递进来,injectionObj是字符串数组依赖注入的对象名*/
		var i,j;
		var reg = /\(\S+\)/;
		var funStr = fun.toString();
		var argstr = (reg.exec(funStr));
		var args = [];
		var injectionArgs="";
		if(argstr!=null)
		{
			argstr = argstr[0].replace("(","").replace(")","");
			args[0] = argstr;
			if(argstr.indexOf(",")>0)
			{
				args = argstr.split(",");
			}
			if(typeof(injectionObj)=="string")
			{
				for(i=0;i<args.length;i++)
				{
					for(j=0;j<injectionObj.length;j++)
					{
						if(args[i]==injectionObj[j])
						{
							;
						}
					}
				}
			}
		}
	}


	wRouter.prototype.tmpl=function(router){
		var th =this , url="";
		if(this.route.container!=undefined)
		{
			if(router.template!=undefined)
			{
				try
				{
					this.route.container.innerHTML = router.template.innerHTML;
				}
				catch(e)
				{
					throw new Error("没有找到模板");
				}
			}
			else if(router.templateUrl!=undefined)
			{
				try
				{
					if(!!this.options.servicePath)
					{
						url = this.options.servicePath + "/" + router.templateUrl;
					}
					else
					{
						url = router.templateUrl;
					}
					//url = url.replace("//","/");
					var options={
							url: url,/*请求模板的页面*/
							data:{},
							async:false,
							success:function(data){
								if(th.isHistory())
								{
									th.setHistoryLink(th.route.container);
								}
							},
							error:function(){}
						};
					this.getTmpl(options);/*异步请求模板*/				
				}
				catch(e)
				{
					throw new Error("没有找到模板");
				}			
			}
		}	
	}


	wRouter.prototype.loadTmpl=function(options){
		this.getTmpl(options);
	}

	var $template={};
	window.$template = $template;



	/*
	****************************
	请求命名空间
	wRouter.http={}
	处理ajax请求
	****************************
	*/
	
	/*
	options={
	url:url,
	param:{a:"aaa",b:"bbb"},
	success:function(){},
	error:function(){}
	}
	*/
	wRouter.prototype.http = {userMask:true};
	wRouter.prototype.get=function(options){
		/*
		options={
		url:"xxx",
		param:{},
		success:function(){},
		error:function(){}
		} 
		*/
		if(this.http.useMask)
		{
			this.mask.show();
		}
		var th = this.http;
		wAjax.ajax({
			url:options.url, 
			type:'GET', 
			dataType:'text', 
			data:options.param||options.data,
			success:function(data){
				var json=eval("("+data+")");
				if(options.success!=undefined)
				{
					options.success.call(th,json);
				}
				setTimeout(this.mask.hide,100);
			},
			error:function(){
				if(options.error!=undefined)
				{
					this.mask.hide();
					options.error.call(th);
				}
			}
	     });
	}

	/*
	********************************
	功能：获取模板页面
	接口类型:内部接口
	********************************
	*/
	wRouter.prototype.getTmpl=function(options){
		/*
		options={
		async:true|false,
		templateContentId:"xxx",
		url:"xxx",
		param:{},
		success:function(){},
		error:function(){}
		} 
		*/
		var container = options.container||this.route.container;
		var th = this;
		var async=true;
		if(options.async!=undefined&&options.async==false)
		{
			async=false;
		}
		wAjax.ajax({
			url:options.url, 
			type:'GET', 
			dataType:'html', 
			data:options.param||options.data,
			async:async,
			success:function(data){
				if(options.success!=undefined)
				{
					container.innerHTML = data;
					options.success.call(th,data);
				}
			},
			error:function(){
				if(options.success!=undefined)
				{
					options.error.call(th);
				}
			}
	     });
	}

	wRouter.prototype.loadScript=function(_url,callback){
		var th = this,js,i;
		var url = _url;
		var path = "";
		if(!!!url)
		{
			callback&&callback.call(this);
			return;
		}

		for(i=0; i<this.fileCache.length;i++)
		{
			if(url == this.fileCache[i])
			{
				callback&&callback.call(th);
				return;
			}
		}
		if(!!this.options.servicePath)
		{
			path = this.options.servicePath;
			if(path.substr(path.length-1,1)!="/")
			{
				path = path + "/";
			}
		}
		js = document.createElement("script");
		js.type="text/javascript";
		js.src = path + url;
		js.onload = js.onreadystatechange =function(){
			if (window.navigator.userAgent.indexOf("MSIE")>0)
			{
				if(js.readyState == "loaded" || js.readyState == "complete")
				{
					callback&&callback.call(th);
				}
			}
			else /**上面是IE执行的，下面是非IE**/
			{
				callback&&callback.call(th);
			}
		}
		document.getElementsByTagName("head")[0].appendChild(js);
		this.fileCache.push(url);
	}

	wRouter.prototype.postData=function(options){
		/*
		options={
			url:"xxx",
			data:{key:value},
			form:"#id",         form优先
			success:function(){},
			error:function(){}
		}
		*/
		if(options.url==undefined)
		{
			throw new Error("参数不足");
			return;
		}
	    wAjax.ajax({
	        url:options.url,
	        type:"POST",
	        data:$(options.form).serialize(),
	        success: function(data) {
	        	if(options.success!=undefined)
	            {
	        		options.success.call(this,data);
	            }
	        },
	        error:function(){
	        	if(options.error!=undefined)
	        	{
	        		options.error.call(this,data);
	        	}
	        }
	    });	
	}

	/*
	*******************************************
	功能： 获取模板页面
	接口类型：外部接口
	调用示例：$http.template("templates/list.html")
	*******************************************
	*/
	wRouter.prototype.template = function(url){
		var result="";
	    wAjax.ajax({
	        url:url,
	        type:"GET",
	        dataType:"html",
	        async:false ,
	        success: function(data) {
	        	result = (data).toString();
	        	return;
	        },
	        error:function(e){
	        	result = "error";
	        }
	    });
	    return result;
	}
	/*
	var $http={};
	$http.get = wRouter.prototype.http.get;
	$http.getTmpl=wRouter.prototype.http.getTmpl;
	$http.postData = wRouter.prototype.http.postData;
	$http.template = wRouter.prototype.http.template;
	window.$http = $http;
	*/
	/*
	********************************
	对页面的<a>链接进行处理 
	********************************
	*/
	wRouter.prototype.controlLink=function(){
		/*注意：页面上的链接方式应为 <a href="#/action/action2" route=""></a>*/
		var r=/#\S+/;
		var href="";
		/*
		$("a[route]").click(function(){
			href=this.href.replace("file://","");
			href=href.replace("http://","");
			href=r.exec(href);
			if(href!=null)
			{
				href=href[0].replace("#","/");
				window.location.href=wRouter.location.fileName+"#"+href;
			}
			if(wRouter.isIE())
			{
					wRouter.event.onhashchange(window.location.href);
			}
			return false;
		});
		*/
	}


	/*
	*********************
	mask遮罩
	*********************
	*/
	wRouter.prototype.mask={created:false};
	wRouter.prototype.mask.init=function(){
		if(this.created){return;}
		this.created=true;
		this.maskDiv = document.createElement("div");
		this.maskDiv.id="_mask_";
		this.maskDiv.style["position"]="fixed";
		this.maskDiv.style["width"]="100%";
		this.maskDiv.style["height"]="100%";
		this.maskDiv.style["top"]="0";
		this.maskDiv.style["left"]="0";
		this.maskDiv.style["z-index"]="1000";
		this.maskDiv.style["_position"]="absolute";
		this.maskDiv.style["background"]="#CCC";
		this.maskDiv.style["opacity"]="0.4";
		this.maskDiv.style["filter"]="alpha(opacity=40)";
		this.maskDiv.style["text-align"]="center";
		this.maskDiv.style["vertical-align"]="middle";
		this.maskDiv.style["padding-top"]="100px";
		this.maskDiv.style.display="none";
		this.maskDiv.innerHTML="载入中......";
		document.getElementsByTagName("body")[0].appendChild(this.maskDiv);
	}
	wRouter.prototype.mask.show = function(){
		this.maskDiv.style.display="block";
	}
	wRouter.prototype.mask.hide = function(){
		document.getElementById("_mask_").style.display="none";
	}

	
	
	
	/*
	*************************
	wAjax 类似于$.ajax,
	代替$.ajax功能
	接口类型：外部或内部
	*************************
	*/
	var wAjax = {
		xmlhttp : null,

		getFormData : function(form){
			var aParams = new Array();
			for (var i=0 ; i < oForm.elements.length; i++)
			{
				var sParam = encodeURIComponent(oForm.elements[i].name);
				sParam += "=";
				sParam += encodeURIComponent(oForm.elements[i].value);
				aParams.push(sParam);
			}
			return aParams.join("&");
		},

		getParamData : function(json){
			var i,v,result = "?interval=";
			var now = new Date();
			result += now.getTime();
			if(json==undefined)
			{
				return "";
			}
			for(v in json)
			{
				result = result + "&" + v + "=" + json[v];
			}
			return result;
		},

		ajax : function(options){
			this.options = options;
			/*
			options.url
			options.type
			options.data
			options.dataType
			options.success
			options.error
			*/
			var th = this;
			var data;/*返回的数据*/
			var submitData;/*提交的数据*/
			var async = true;
			if(options.async!=undefined&&!options.async)
			{
				async = false;
			}
		    if(window.XMLHttpRequest)
		    {
		        this.xmlhttp = new XMLHttpRequest();
		    }
		    else
		    {
		        var arr = ["MSXML2.XMLHttp.5.0", "MSXML2.XMLHttp.4.0", "MSXML2.XMLHttp.3.0", "MSXML2.XMLHttp", "Microsoft.XMLHttp"];
		        for (i = 0; i < arr.length; i++) 
		        {
		            try
		            {
		                this.xmlhttp = new ActiveXObject(arr[i]);
		                return;
		            }
		            catch(e)
		            {}
		        }
		    }

		    if(options.type=="GET")
		    {
			    this.xmlhttp.open("get", options.url + this.getParamData(options.data), async);
			    this.xmlhttp.onreadystatechange = function(){
			    	if(th.xmlhttp.readyState == 4 && th.xmlhttp.status == 200)
			    	{
			    		if(options.dataType==undefined||options.dataType=="text"||options.dataType=="html")
			    		{
			    			data = th.xmlhttp.responseText;
			    		}
			    		else if(options.dataType.toLowerCase()=="json")
			    		{
			    			data = eval("(" + th.xmlhttp.responseText + ")");
			    		}
			    		options.success(data);
			    	}
			    	else
			    	{
			    		options.error(data);
			    	}
			    }
			    this.xmlhttp.send(null);
		    }
		    else if(options.type=="POST")
		    {
		    	this.xmlhttp.open("post", options.url, async);
		    	this.xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");
			    this.xmlhttp.onreadystatechange = function(){
			    	if(th.xmlhttp.readyState == 4 && th.xmlhttp.status == 200)
			    	{
			    		if(options.dataType==undefined||options.dataType=="text"||options.dataType=="html")
			    		{
			    			data = th.xmlhttp.responseText;
			    		}
			    		else if(options.dataType.toLowerCase()=="json")
			    		{
			    			data = eval("(" + th.xmlhttp.responseText + ")");
			    		}
			    		options.success(data);
			    	}
			    	else
			    	{
			    		options.error(data);
			    	}
			    }
			    submitData = this.getParamData(options.data);
			    this.xmlhttp.send(submitData);
		    }
		} /*end ajax*/
	};
	

	/**** end wRouter2.js*****/


	var template = function(options){
		this._startSymbol = "\{\{";
		this._endSymbol = "\}\}";
		this.templateElement = {};
		this.contentNode = null;
		options.beforeCreate&&options.beforeCreate.call(this); /*time life (1)*/
		this.repeat(options);
		options.mounted&&options.mounted.call(this); /*time life (3)*/
	};

	template.useES5GetSet = true;  //if use es5 get set method
	template.prefix = "_";         //当使用es5 get set时,prefix is "_"

	template.prototype.useEs5DataBind = function(bool){
		template.useES5GetSet = bool;
		if(!bool)
		{
			template.prefix = "";
		}
	}

	template.prototype.startSymbol=function(symbol){
		var _symbol="",i;
		var regx="\^$*+?{}[]|.";
		for(i=0;i<symbol.length;i++)
		{
			if(regx.indexOf(symbol.substr(i,1))>=0)
			{
				_symbol = _symbol + '\\' ;
			}
			_symbol = _symbol + symbol.substr(i,1);
		}
		this._startSymbol = _symbol;
	};
	template.prototype.endSymbol=function(symbol){
		var _symbol="",i;
		var regx="\^$*+?{}[]|.";
		for(i=0;i<symbol.length;i++)
		{
			if(regx.indexOf(symbol.substr(i,1))>=0)
			{
				_symbol = _symbol + '\\' ;
			}
			_symbol = _symbol + symbol.substr(i,1);
		}
		this._endSymbol = symbol;
	};

	/*模板函数入口*/
	template.prototype.repeat = function(options){
		/*
		options={
			data:data,
			repeatElement|repeatId:"",
			template:"", 
			render:function(object){
				object.index,object.item.field
				return {"field":"xxx"}
			},
			count:n,
			type : "cover|append|insert",
			onload : function(){},
			loadBefore:function(){}
		}

		可选参数：template,render,count,type(默认cover),onload
		*/
		this.options = options;
		if(options.data==undefined)
		{
			throw new Error("参数名称不对,参数是{},缺少data");
			return;
		}
		if((options.repeatId==undefined&&options.repeatElement==undefined))
		{
			throw new Error("参数名称不对,参数是{},缺少repeatElement或repeatId");
			return;
		}

		var tmpl={string:""},all="";            /*tmpl=依据模板替换后的数据,all=全部替换的数据*/
		var data =[];                           /*存储传入的数据，list*/
		var i,j,len=0,item,subItem;               /*item=data中的每一行数据 , len=data数组长度*/
		var v,subv,jsonStr="";                  /*v,subv存储JOSN中的key; jsonStr存储JSON的表达式形式如：title.sum*/
		var target;                             /*存储模板DOM对象*/
		var nextNode=null,lastNode=null;        /*用于parent.insertBefore*/
		var parent;                             /*模板的父节点*/
		var fun=function(){},result,v;          /*fun是render回调函数*/
		
		var resultObject={};
		var json={};
		var node=null;                          /*插入的节点元素*/
		
		var strV                                /*即页面字段值例如：${title}*/,reg/*strV的正则表达式*/;
		var attrValue="";                      /*repeatId元素上的遍历属性值*/
		
		target = options.repeatElement;
		parent = target.parentNode;

		if(options.type==undefined ||(options.type!=undefined && options.type=="cover"))
		{
			this.deleteNode(target);              /*删除所有节点*/
		}
		
		if(options.template==undefined)
		{
			options.template = target.innerHTML;
		}
		
		if(options.data.length==undefined)
		{
			len=1;
			data[0]=options.data;
		}
		else
		{
			len=options.data.length;
			data=options.data;
		}
		
		if(options.count!=undefined)
		{
			if(options.count<=len)
			{
				len = options.count;
			}
		}
		
		if(options.render!=undefined)
		{
			fun=options.render||options.onrender;
		}

		nextNode = target;
		lastNode = parent.lastChild;

		for(i=len-1;i>=0;i--)  /*节点是到的插入才是顺序显示*/
		{
			item = data[i];

			resultObject={index:i,item:data[i]};

			result = fun.call(this,resultObject);           /*执行回调函数*/

			node = document.createElement(target.nodeName); /*创建插入的节点*/

			for(j=0;j<target.attributes.length;j++)         /*遍历repeat元素上的属性*/
			{
				attrValue = target.attributes.item(j).value;
				for(v in result)
				{
					strV = this._startSymbol+v+this._endSymbol;
					reg = new RegExp(strV,"g");
					attrValue = attrValue.replace(reg,result[v]);
				}
				for(v in item)
				{
					strV = this._startSymbol+v+this._endSymbol;
					reg = new RegExp(strV,"g");	
					attrValue = attrValue.replace(reg,item[v]);
				}
				node.setAttribute(target.attributes.item(j).name , attrValue);			
			}

			tmpl.string=options.template;

			for(v in result)
			{
				if(typeof(result[v])!="object")
				{
					strV = this._startSymbol+v+this._endSymbol;
					reg = new RegExp(strV,"g");
					//tmpl.string = tmpl.string.replace(reg,result[v]); //code good
					tmpl.string = tmpl.string.replace(reg,result[v].replace(/,/g,"")); /*解决外部使用 map()函数返回逗号问题*/
				}
				else
				{
					this.getScope(result,v,tmpl);
				}
				/*
				strV = this._startSymbol+v+this._endSymbol;
				reg = new RegExp(strV,"g");	
				tmpl.string = tmpl.string.replace(reg,result[v]);
				*/
			}
			for(v in item)
			{
				if(typeof(item[v])!="object")
				{
					strV = this._startSymbol+v+this._endSymbol;
					reg = new RegExp(strV,"g");
					tmpl.string = tmpl.string.replace(reg,item[v]);
				}
				else
				{
					this.getScope(item,v,tmpl);
				}
			}
			
			node.innerHTML = tmpl.string;
			if(options.type!=undefined&&options.type=="append")
			{
				while(lastNode!=null)
				{
					if(lastNode.nodeType==1 && lastNode.getAttribute("templateItem")=="templateItem")
					{
						break;
					}
					lastNode = lastNode.previousSibling;
				}
				parent.insertBefore(node,lastNode.nextSibling);
				node.style.display="";
				node.setAttribute("templateItem","templateItem");
				node.setAttribute("templateItem-index",i);   /*为DOM列表生成顺序索引,base 0*/
				node = lastNode;
			}
			else
			{
				parent.insertBefore(node,nextNode.nextSibling);
				node.style.display="";
				node.setAttribute("templateItem","templateItem");
				node.setAttribute("templateItem-index",i);
			}

			options.onEvent&&options.onEvent(node);

		} /*end for 模板渲染完毕*/

		target.style.display="none";

		options.created&&options.created.call(this); /*time life (2)*/

		//console.log("**",data)
		var innerData = this.copyUserData(data); /*把数据进行深拷贝*/
		this.innerData = innerData;
		window.innerData = innerData;
		this.extendData(data); /*便利所有属性并加下划线*/
		this.es5GetSet(options);
		/*
		return new this.ModelView({
			innerData : innerData,
			data : data,
			target : target,
			parentNode : parent
		});
		*/

	}/*end function repeat*/


	/*
	TYPE: API
	开发着调用的方法
	*/
	template.prototype.render = function(){
		this.repeat(this.options);
	}

	/*获取JSON的对象形式*/
	template.prototype.getScope = function(item,v,tmpl,scopeStr){
		var jsonStr="",subv,subItem, strV, reg;
		subItem = item[v];
		if(typeof(subItem)=="object")
		{
			if(scopeStr==undefined)
			{
				jsonStr = v;
			}
			else
			{
				jsonStr = scopeStr;
			}
			for(subv in subItem)
			{
				jsonStr += "."+subv;
				if(typeof(subItem[subv])=="object")
				{
					this.getScope(subItem,subv,tmpl,jsonStr);
					return;
				}
				strV = this._startSymbol+jsonStr+this._endSymbol;
				reg = new RegExp(strV,"g");
				tmpl.string = tmpl.string.replace(reg , subItem[subv]);
			}
		}
		return ;
	}

	/*
	使用于ea5 get set 后的属性
	注意:再使用es5的get set 之前 template.extendData方法
	把template.repeat方法中参数data属性进行复制加下划线
	*/
	template.prototype.getES5Scope = function(item,v,tmpl,scopeStr){
		var jsonStr="",subv,subItem, strV, reg;
		subItem = item[v];
		//console.log("scope:",scopeStr);
		if(typeof(subItem)=="object")
		{
			if(scopeStr==undefined)
			{
				jsonStr = v;
			}
			else
			{
				jsonStr = scopeStr;
			}
			for(subv in subItem)
			{
				jsonStr += "."+subv;
				if(typeof(subItem[subv])=="object")
				{
					this.getES5Scope(subItem,subv,tmpl,jsonStr);
					return;
				}
				strV = this._startSymbol+jsonStr+this._endSymbol;
				reg = new RegExp(strV,"g");
				tmpl.string = tmpl.string.replace(reg , subItem[template.prefix + subv]);
			}				
		}
		return ;
	}


	/*
	用于es5的get和set
	给所有属性加下划线
	*/
	template.prototype.extendData = function(data){
		var i,v,item;
		var len = data.length;
		var copyArray = function(arr){ /* 废弃 */
			var newArr,i,len;
			len = arr.length;
			newArr = [];
			for(i=0;i<len;i++)
			{
				newArr.push(arr[i]);
			}
			return newArr;
		}

		var deepCopy = function(item){
			var v;

			for(v in item)
			{

				if(typeof item[v] === 'object')
				{
					//item["_"+v] = (item[v].constructor === Array) ? [] : {};
					//item["_"+v] = deepCopy(item[v]);
					deepCopy(item[v]);
				}
				else if(item[v].constructor == Array) /* never use */
				{
					item["_"+v] = copyArray(item[v]);
				}
				else
				{
					item["_"+v] = item[v];
				}
				
			}
			return item;
		}

		for(i=0;i<len;i++)
		{
			item = data[i];
			deepCopy(item);
		}
		
		//console.log("extendData:",data);
	}

	/*
	用户es5的get和set
	深拷贝数据;
	把用户数据拷贝
	*/
	template.prototype.copyUserData = function(data){
		var i,v,item;
		var len = data.length;
		var newData = []; /*最终生成的 用户数据*/

		var deepCopy = function(item,_newItem){
			var v,newItem = _newItem || {};

			for(v in item)
			{
				if(typeof(item[v]) == 'object')
				{
					newItem[v] = (item[v].constructor === Array) ? [] : {};
					newItem[v] = deepCopy(item[v],newItem[v]);
				}
				else
				{
					newItem[v] = item[v];
				}
			}
			return newItem;	
		}

		for(i=0;i<len;i++)
		{
			item = data[i];
			newData.push(deepCopy(item));
		}
		//console.log("newData",newData);
		return newData;
	}



	/*删除DOM节点*/
	template.prototype.deleteNode=function(target){
		var node = target.nextSibling;
		if(node ==null)/*如果options.data is [] ,node is null*/
		{
			return;
		}
		var nextNode,ife;
		try
		{
			ife = (node.nodeType==1&&node.getAttribute("templateItem")=="templateItem")||node.nodeType!=1;
		}
		catch(e)
		{
			return;
		}
		while(node!=null)
		{
			nextNode = node.nextSibling;
			if(ife)
			{
				node.parentNode.removeChild(node);
			}
			node = nextNode;
			if(node==null)/*如果没有要删除的节点推出循环*/
			{
				break;
			}
			ife = (node.nodeType==1&&node.getAttribute("templateItem")=="templateItem");
		}
		return;
		for(i=0;i<len;i++)
		{
			if(childNodes[i].nodeType==1&&childNodes[i].getAttribute("templateItem")=="templateItem")
			{
				parentNode.removeChild(childNodes[i]);
			}
		}
	}


	/*
	set get set method 数据驱动
	*/
	template.prototype.es5GetSet = function(options){
		var th =this;
		var len = options.data.length;
		var i ,j  , v , item , result;
		var th = this;
		var _scopeObj;
		if(Object.defineProperty==undefined) /*不支持ES5新特性*/
		{
			return;
		}

		var _defineProperty = function(object,key,index){
			Object.defineProperty(object , key, {
			 	get: function() {
			 		return key.indexOf("_")>-1 ? this[key] : this["_"+key];
			    },
			 	set: function(o) {
			 		if(key.indexOf("_")>-1)
			 		{
			 			this[key] = o;
			 		}
			 		else
			 		{
			 			this["_"+key] = o;
			 		}
			     	
			     	th.viewPage(index);
			    }
			});
		}

		var _iteration = function(item,index){
			for(v in item)
			{
				if(v.indexOf("_")>=0)
				{
					continue;
				}
				
				if(typeof(item[v])!="object")
				{
					_defineProperty(item,v,index);
				}
				else
				{
					_iteration(item[v],index);
				}

			}
		}
		//console.log("DATA",len)
		if(!!!len)
		{
			item = options.data;
			_iteration(item,0);
			return;
		}

		for(i=0;i<len;i++)
		{
			let n = i;
			item = options.data[i];
			_iteration(item,i);
		}
	}

	/*
	对Array增加监听,需要在初始化template时调用 ***未完全实现***
	*/
	var monitorArray = function(arrayData,optionsDataIndex){
		var arrayPush = {};
		arrayPush.optionsDataIndex = optionsDataIndex;
		var methodsToPatch = [
			'push',
			'pop',
			'shift',
			'unshift',
			'splice',
			'sort',
			'reverse',
			'filter',
			'map',
			'every',
			'some',
			'reduce',
			'split',
		];
		methodsToPatch.forEach(method =>{
		    var original = Array.prototype[method];
		    arrayPush[method] = function() {
		        // this 指向可通过下面的测试看出
		        
		        return original.apply(this, arguments)
		    };	
		});

		arrayData.__proto__ = arrayPush;
	}

	/*
	渲染页面上某个DOM数据
	*/
	template.prototype.viewPage = function(index){
		this.repeatToSingleNode(index);
		this.options.stateChange&&this.options.stateChange(this.options.data[index]); /*time life (4)*/
	}

	/*
	更新页面某个DOM数据或添加新的DOM
	*/
	template.prototype.repeatToSingleNode = function(itemIndex,isNew){
		/*
		参数:itemIndex is this.data index
		*/
		//console.log(itemIndex);
		var node ,v ,j;
		var target = this.options.repeatElement;
		var tmpl = {string:""};
		var item = this.options.data[itemIndex]; /*需要给你关心的数据*/
		if(this.options.data.constructor == Array)
		{
			item = this.options.data[itemIndex];
		}
		else if(this.options.data.constructor == Object)
		{
			item = this.options.data;
		}
		//console.log("item=>",item);
		var resultObject,result;/*render method callback use*/
		var attrValue,reg,strV;
		tmpl.string = target.innerHTML;  /*模板内容*/

		var fun=this.options.render||this.options.onrender; /*执行repeat()函数中参数的render,render is function*/

		if(isNew!=undefined&&isNew)
		{
			node = document.createElement(target.nodeName);
		}
		else
		{
			node = this.findNode(itemIndex);
		}

		resultObject={index : itemIndex , item : item};
		result = fun.call(this,resultObject);  /*执行回调函数*/

		for(j=0;j<target.attributes.length;j++)         /*遍历repeat元素上的属性*/
		{
			attrValue = target.attributes.item(j).value;
			for(v in result)
			{
				strV = this._startSymbol+v+this._endSymbol;
				reg = new RegExp(strV,"g");				
				attrValue = attrValue.replace(reg,result[v]);
			}
			for(v in item)
			{
				strV = this._startSymbol+v+this._endSymbol;
				reg = new RegExp(strV,"g");	
				attrValue = attrValue.replace(reg,item[this.prefix + v]);
			}
			node.setAttribute(target.attributes.item(j).name , attrValue);
		}

		for(v in result)
		{
			if(typeof(result[v])!="object")
			{
				strV = this._startSymbol+v+this._endSymbol;
				reg = new RegExp(strV,"g");
				//tmpl.string = tmpl.string.replace(reg , result[v]);
				if(!!result[v])
				{
					tmpl.string = tmpl.string.replace(reg , result[v].replace(/,/g,""));
				}
			}
			else
			{
				this.getES5Scope(result,v,tmpl);
			}
		}
		for(v in item)
		{
			if(typeof(item[v])!="object")
			{
				strV = this._startSymbol+v+this._endSymbol;
				reg = new RegExp(strV,"g");
				//tmpl.string = tmpl.string.replace(reg , item[template.prefix + v]);
				if(!!item[template.prefix + v])
				{
					tmpl.string = tmpl.string.replace(reg , item[template.prefix + v].replace(/,/g,""));
				}
			}
			else
			{
				this.getES5Scope(item,v,tmpl);
			}
		}
		node.innerHTML = tmpl.string;
		node.style.display = "";
		return node;
	}

	/*通过索引查找DOM段素*/
	template.prototype.findNode = function(itemIndex){
		var parentNode = this.options.repeatElement.parentNode;
		var i , index = -1 , isStart = false;
		var childs = parentNode.childNodes;
		var len = childs.length;
		for(i=0;i<len;i++)
		{

			if(childs[i].nodeType == 1 && childs[i].getAttribute("templateitem")=="templateItem")
			{
				index++;
			}
			if(index==itemIndex)
			{
				return childs[i];
			}
		}
		return null;
	}




	/*
	***************************
	模型对象
	功能:
	template.repeat return 的对象;
	用来控制页面DOM和data
	***************************
	*/
	template.ModelView = function(options){
		/* autoReview 属性(外部控制)是否通过es5的get,set自动更新页面*/
		this.autoReview = true;

		this.innerData = options.innerData;
		this.data = options.data;
		this.parentNode = options.parentNode;
		this.target = options.target;
		this.changedIndexs = [];
		/*
		this.row = {...}; 用于repeatToSingleNode()函数
		this.changedIndexs = []; 存放数据被改变的索引
		*/
		if(template.useES5GetSet)
		{
			this.es5GetSet();
		}
	}

	/*通过索引查找DOM段素*/
	template.ModelView.prototype.findNode = function(itemIndex){
		var i , index = 0 , isStart = false;
		var childs = this.parentNode.childNodes;
		var len = childs.length;
		for(i=0;i<len;i++)
		{
			if(this.target == childs[i])
			{
				index = 0;
				isStart = true;
			}
			if(childs[i].nodeType == 1)
			{
				index++;
			}
			if(isStart && index == itemIndex+2)
			{
				return childs[i];
			}
		}
		return null;
	}

	/*
	更新页面某个DOM数据或添加新的DOM
	*/
	template.ModelView.prototype.repeatToSingleNode = function(itemIndex,isNew){
		/*
		参数:itemIndex is this.data index
		*/
		var node ,v ,j;
		var target = this.target;
		var tmpl = {string:""};
		var item = this.row; /*需要给你关心的数据*/
		var attrValue,reg,strV;
		tmpl.string = target.innerHTML;  /*模板内容*/
		if(isNew!=undefined&&isNew)
		{
			node = document.createElement(target.nodeName);
		}
		else
		{
			node = this.findNode(itemIndex);
		}
		for(j=0;j<target.attributes.length;j++)         /*遍历repeat元素上的属性*/
		{
			attrValue = target.attributes.item(j).value;
			for(v in item)
			{
				strV = template._startSymbol+v+template._endSymbol;
				reg = new RegExp(strV,"g");	
				attrValue = attrValue.replace(reg,item[template.prefix + v]);
			}
			node.setAttribute(target.attributes.item(j).name , attrValue);
		}
		for(v in item)
		{
			if(typeof(item[v])!="object")
			{
				strV = template._startSymbol+v+template._endSymbol;
				reg = new RegExp(strV,"g");
				tmpl.string = tmpl.string.replace(reg , item[template.prefix + v]);
			}
			else
			{
				template.getES5Scope(item,v,tmpl);
			}
		}
		node.innerHTML = tmpl.string;
		node.style.display = "";
		return node;
	}

	/*
	根据条件查找匹配数据;
	返回值:返回被查找的node节点在this.data中的位置,从0开始
	*/
	template.ModelView.prototype.doCondition = function(condition){
		/*
		condition,data is json
		condition = {"app.title.num":"100"}
		返回值:return -1 表示没有找到匹配的数据,return >=0 表示找到匹配的数据
		注意  :
		*/

		var v,i,j;
		var len = this.data.length;
		var data = this.data;
		var item;
		var keyArr , value;
		var isUndefined = false;
		var isFound = false;      /*根据参数condition找到匹配的数据*/
		var isFail = false;       /*如果isFail=true表示最终没找到*/
		var itemIndex = -1;

		for(v in condition)
		{
			keyArr = v.split(".");
			value = condition[v];
			isUndefined = false;
			isFound = false;

			for(i=0;i<len;i++)
			{
				item = data[i];
				for(j=0;j<keyArr.length;j++)
				{
					item = item[keyArr[j]];
					if(item==undefined)
					{
						isUndefined = true;
						break;
					}
				}

				if(isUndefined)
				{
					break;
				}
				else if(item == value)
				{
					isFound = true;
					itemIndex = i;
					break;
				}
				else
				{
					isFound = false;
				}
			}/*end for i*/
			if(!isFound)
			{
				break;
			}
		}

		if(isFound)
		{
			return itemIndex; /*itemIndex是在this.data中的位置,从0开始*/
		}
		else
		{
			return -1;
		}
	}


	/*
	类型:接口
	功能:更新页面数据
	*/
	template.ModelView.prototype.update = function(condition,row,callback){
		/*
		condition,data is json
		condition = {"app.title.num":"100"}
		*/
		this.row = row;  /*repeatToSingleNode()用到this.row*/

		var itemIndex;
		itemIndex = this.doCondition(condition);
		if(itemIndex!=-1)
		{
			this.repeatToSingleNode(itemIndex);
			this.data[itemIndex] = row;
		}
		callback.call(this,itemIndex==-1?false:true);
		/*
		callback(p);返回一个参数为bool型,该参数说明更新是否成功
		*/
	}

	/*
	类型:接口
	功能:删除数据
	*/
	template.ModelView.prototype.delete = function(condition,callback){
		var itemIndex;
		var node;
		itemIndex = this.doCondition(condition);
		node = this.findNode(itemIndex);
		node.parentNode.removeChild(node);
		this.data.splice(itemIndex,1);
		if(callback!=undefined)
		{
			callback.call(this,itemIndex==-1?false:true);
		}
	}

	/*
	类型:接口
	功能:删除数据
	*/
	template.ModelView.prototype.deleteIndex = function(itemIndex,callback){
		/*
		itemIndex is this.data index
		*/
		var node;
		node = this.findNode(itemIndex);
		node.parentNode.removeChild(node);
		this.data.splice(itemIndex,1);
		if(callback!=undefined)
		{
			callback.call(this,itemIndex==-1?false:true);
		}
	}

	/*
	类型:接口
	功能:添加数据
	*/
	template.ModelView.prototype.add = function(row,callback){
		var itemIndex;
		var node,prevNode = null;
		this.row = row;
		node = this.repeatToSingleNode(-1,true);
		prevNode = this.parentNode.lastChild;
		while(prevNode!=null)
		{
			if(prevNode.nodeType==1 && prevNode.getAttribute("templateItem")=="templateItem")
			{
				break;
			}
			prevNode = prevNode.previousSibling;
		}
		this.parentNode.insertBefore(node,prevNode.nextSibling);
		this.data.push(row);
		if(callback!=undefined)
		{
			callback.call(this);
		}
	}

	/*
	类型:接口
	功能:插入数据
	*/
	template.ModelView.prototype.insert = function(rowIndex,row,callback){
		/*
		rowIndex is this.data index
		*/
		var node , posNode = null ,i;
		this.row = row;
		node = this.repeatToSingleNode(-1,true);
		posNode = this.target.nextSibling;
		for(i=0;i<rowIndex;i++)
		{
			posNode = posNode.nextSibling;
		}
		this.parentNode.insertBefore(node,posNode);
		this.data.splice(rowIndex,0,row);
		if(callback!=undefined)
		{
			callback.call(this);
		}
	}

	template.ModelView.prototype.destroy = function(){
		this.data.length = 0;
		this.parentNode = null;
		this.target = null;
	}



	/*
	es5 新特性应用 set get,给数据对象增加get和set方法
	功能:当外界改变data数组中对象的某个值,能记录下
	*/
	template.ModelView.prototype.es5GetSet = function(){
		var len = this.data.length;
		var i ,j  , v , item , result;
		var th = this;
		var _scopeObj;
		if(Object.defineProperty==undefined) /*不支持ES5新特性*/
		{
			return;
		}
		this._scopeAr = [];
		var isObject = function(v,obj,item){
			/*v is key; obj is value*/
			var vv;
			var object;
			if(typeof(obj)=="object")
			{
				th._scopeAr.push(v);
				for(vv in obj)
				{
					if(typeof(obj[vv])=="object")
					{
						return isObject(vv,obj[vv]);
					}
					else
					{
						th._scopeAr.push(vv);
						return {
							attrName : vv,
							scope : th._scopeAr
						};
						return vv;
					}	
				}
			}
			else
			{
				return {
					attrName : v,
					scope : null 
				};/*here obj is not object*/
				return v;
			}

		}

		for(i=0;i<len;i++)
		{
			let n = i;
			item = this.data[i];
			this._scopeAr.length = 0;
			for(v in item)
			{
				if(v.indexOf("_")>=0)
				{
					continue;
				}
				//let result = isObject(v,item[v]);
				
				if(typeof(item[v])!="object")
				{
					Object.defineProperty(item , v, {
					 	get: function() {
					 		return this["_"+v];
					    },
					 	set: function(o) {
					     	this["_"+v] = o;
					     	th.changedIndexs.push(n);
					     	th.autoReview && th.viewPage(n);
					    },
					    enumerable: true,  
	    				configurable: true
					});
					continue;
				}
				
				if(this._scopeAr.length!=0)
				{
					_scopeObj = item;
					for(j=0;j<this._scopeAr.length;j++)
					{
						if(v.indexOf("_")>=0)
						{
							//continue;
						}
						

						var attrName = this._scopeAr[j];
						
						Object.defineProperty(_scopeObj, attrName, {
							get: function() {
						    	return this["_"+attrName];
						    },
							set: function(o) {
						    	this["_"+attrName] = o;
						    	th.changedIndexs.push(n);
						    	th.autoReview && th.viewPage(n);
						    }
						});
						_scopeObj = _scopeObj[this._scopeAr[j]];
					}
				}
			}
		}
	}



	template.ModelView.prototype.viewPage = function(n){
		var i,len;
		this.row = this.data[n];
		this.repeatToSingleNode(n);
		this.changedIndexs.length = 0;
	}

	/*
	根据es5 get set 新功能 改变的值,通过refresh更新到页面上
	*/
	template.ModelView.prototype.refresh = function(){
		var i,len;
		len = this.changedIndexs.length;
		for(i=0;i<len;i++)
		{
			this.row = this.data[this.changedIndexs[i]];
			this.repeatToSingleNode(this.changedIndexs[i]);
		}
		this.changedIndexs.length = 0;
	}


	/*on()方法还没有写完*/
	template.ModelView.prototype.on = function(eventName,target,f){
		/*
		参数说明:
		eventName is string;target is string example("div a")
		*/
		var fun;
		var queryAr,queryArLen=0;
		var th = this;
		var childs = this.parentNode.childNodes;
		if(arguments.length==2)
		{
			fun = target;
		}
		else if(arguments.length==3)
		{
			queryAr = target.split(" ");
			queryArLen = queryAr.length;
			fun = f;
		}

		this.parentNode.addEventListener(eventName,function(e){
			var target = e.target||e.srcElement;
			if(queryArLen==0)
			{
				if(target.getAttribute("templateitem") == "templateItem" || th.parentNode.contains(target))
				{
					fun.call(th,e);
				}
			}
		},false);

		var i_n = 0;
		for(i=0;i<childs.length;i++)
		{
			if(childs[i].nodeType == 1 && childs[i].getAttribute("templateitem") == "templateItem")
			{
				childs[i].addEventListener(eventName,function(i_n,targetParent){
					return function(e){
						var target = e.target||e.srcElement;
						if(isTarget(queryAr,target,targetParent))
						{
							th.item = th.data[targetParent.getAttribute("templateitem-index")];
							th.itemIndex = targetParent.getAttribute("templateitem-index");
							fun.call(th,e);
						}					
					}
				}(i_n,childs[i]),false);
				i_n++;	
			}
		}
		/*判断是否符合on()中第二个参数*/
		var isTarget = function(ar,target,targetParent){
			/*ar is param target array*/
			var i=0;
			var len = ar.length, count = 0;
			var isContinue = false;
			i = len - 1;

			while(targetParent.contains(target))
			{
				if(ar[i].indexOf(".")==0)/* is .xxx*/
				{
					if(target.className.indexOf(ar[i].replace(".",""))>=0)
					{
						count++;
						i--;
					}
				}
				else if(ar[i].indexOf(".")>0) /*is xx.yy example div.red*/
				{

				}
				else
				{
					if(target.nodeName==ar[i].toUpperCase())
					{
						count++;
						i--;
					}
				}
				if(i<0)
				{
					break;
				}
				target = target.parentNode;
			}

			if(count == len)
			{
				return true;
			}
			else
			{
				return false;
			}

		}
	}

	//win.T=win.wTemplate=template;


	/******end tempalte******/
	
	var Wing = {
		version:"2.0.0",
		wRouter:wRouter,
		wTemplate:template
	};
	win["Wing"] = Wing;
})(window);
