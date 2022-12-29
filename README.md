# Wing2
Wing.js version2 is SPA for front-end framework.

Wing.js and project design & write by Wuweiwei(邬畏畏)

### 项目安装

* 1.安装nodejs
* 2.安装express或node-basis

node-basis安装：

	* 1.> npm i node-basis
	* 2.打开 node_modules 文件夹 -> node-basis文件夹 -> 加压 basisApp.zip ,把basisApp文件夹里的app.js复制到根目录
	* 3.> node app.js

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
				controller:"Index",  /*与controller()第一个参数对应*/
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
  
 	wR.controller("Index",function(args){ /*与routerCfg routes controller 属性对应*/
		App.Index.init(args);
		console.log(this.location);/* this is location object*/
	});
  
  
  ### 模板渲染示例 1
  
  
     	 <!--模板 begin-->  
	    <div id="myList" class="app-myapp fl {{bgcolor}}" title="{{title}}" style="position:relative;">
		<div class="app-myapp-shared">{{numbers.app.count}}</div>
		<div class="app-myapp-photo icons"></div>
		<div class="app-myapp-caption">{{title}}</div>
		<div>{{dataList}}</div>
		<div class="app-myapp-op">
		    <a target="_blank" href="http://{{url}}">{{url}}</a>
		</div>
	    </div>
   	 <!--模板 end-->  

	var data = [
		    {
			title:"我的应用1",
			url:"www.cnblogs.com/wsoft1",
			numbers:
			{
			    app:{count:"10"}
			},
			//list:["1","2","3"]
			list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
		    },
		    {
			title:"我的应用2",
			url:"www.cnblogs.com/wsoft2",
			numbers:
			{
			    app:{count:"11"}
			},
			list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
		    },
		    {
			title:"我的应用2",
			url:"www.cnblogs.com/wsoft2",
			numbers:
			{
			    app:{count:"12"}
			},
			//list:["7","8","9"]
			list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
		    },
		    {
			title:"我的应用3",
			url:"www.cnblogs.com/wsoft3",
			numbers:
			{
			    app:{count:"13"}
			},
			//list:["10","11","12"]
			list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
		    }
		];


	this.viewModel = new Wing.wTemplate({
	    repeatElement : document.querySelector("#myList"),
	    data : data,
	    beforeCreate : function(){
		//console.log("beforeCreate");
	    },
	    created : function(){
		//console.log("created");
	    },
	    mounted:function(){
		//数据渲染完毕，可以处理DOM或绑定事件
		/*
		$("#desk").on("click",".app-create",function(){
		    alert("你想创建增值服务吗");
		});
		*/
	    },
	    stateChange:function(item){
		//console.log(item);
	    },
	    render:function(object){
		var item = object.item;   // object.item is data
		var index = object.index; // object.index is index of array

		return {
		    "bgcolor" : index==1 ? "odd" : "even",
		    "numbers.app.count" : item.numbers.app.count+"(个)",
		    "dataList" : `
			<div>
			    <span>${item.list[0].b.c}</span>
			    <br/>
			    <i>list count:<span style="color:#F00;">${item.list.length}</span></i>
			    <i>|${ !!item.list[3] ? item.list[3] : "" }</i>
			    <i style="color:#00F;">(${ item.list[1] })</i>
			</div>
			`,
		}
	    }
	});

### Wing.js模板渲染示例2

	<!--模板 begin--> 
	<div id="templateDom">
	{{component}}
	</div>

	<!--模板 end-->  

	var data = {
	    result:[
	        {
	            title:"我的应用1",
	            url:"www.cnblogs.com/wsoft1",
	            numbers:
	            {
	                app:{count:"100"}
	            },
	            //list:["1","2","3"]
	            list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
	        },
	        {
	            title:"我的应用2",
	            url:"www.cnblogs.com/wsoft2",
	            numbers:
	            {
	                app:{count:"100"}
	            },
	            list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
	        },
	        {
	            title:"我的应用2",
	            url:"www.cnblogs.com/wsoft2",
	            numbers:
	            {
	                app:{count:"100"}
	            },
	            //list:["7","8","9"]
	            list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
	        },
	        {
	            title:"我的应用3",
	            url:"www.cnblogs.com/wsoft3",
	            numbers:
	            {
	                app:{count:"100"}
	            },
	            //list:["10","11","12"]
	            list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
	        }
	    ]
	}
	
	
	var template = new Wing.wTemplate({
	    repeatElement : document.querySelector("#templateDom"),
	    data : data,
	    render:function(object){
		var data = object.item;
		return {
		    "component":`
			<div>
			    ${
				data.result.map(function(obj){
				    return (`<div class="app-myapp fl {{bgcolor}}" title="{{title}}">
						<div class="app-myapp-shared">${obj.numbers.app.count}</div>
						<div class="app-myapp-photo icons"></div>
						<div class="app-myapp-caption">${obj.title}</div>
					    </div>`)
				})
			    }
			</div>`,
		}
	    }
	});

		    
