/*
write by wuweiwei
*/
App.Project = {
	data : {
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
	},
	init: function(args){
		/*args is config from config2.js use url in routes*/
		this.obj = {};
		this.obj.id = args.id;
		this.obj.location = window.routerObject.location;

		this.showParams();
		this.renderView();
		this.bindEvent();
	},
	showParams: function(){
		var router_action,router_location;

		router_action = document.querySelector("#router_action");
		router_location = document.querySelector("#router_location");
		router_action.innerHTML = this.obj.id;
		router_location.innerHTML = JSON.stringify(this.obj.location);
	},
	renderView: function(){
		var data = this.data;

		this.template = new Wing.wTemplate({
		    repeatElement : document.querySelector("#templateDom"),
		    data : data,
		    beforeCreate : function(){
		        //console.log("beforeCreate");
		    },
		    created : function(){
		        //console.log("created");
		    },
		    mounted:function(){
		        //数据渲染完毕，可以处理DOM或绑定事件
		        console.log("mounted",this);
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

	},
	bindEvent: function(){
		var th = this, data = this.data;

		var btn_add,btn_delete;

		btn_add = document.querySelector("#btn_add");
		btn_delete = document.querySelector("#btn_delete");

		btn_add.onclick = function(e){
		    data.result.push({
		            title:"我的应用311",
		            url:"www.cnblogs.com/wsoft3",
		            numbers:
		            {
		                app:{count:"100"}
		            },
		            list:[{"a":"111","b":{"c":"ccc"}},"5","6"]
		    });
		    th.template.render(); //调用render更新
		}

		btn_delete.onclick = function(e){
			data.result.pop();
		    th.template.render();
		}
	}
}
