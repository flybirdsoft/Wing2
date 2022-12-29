/*
write by wuweiwei
*/
App.Index = {
	stateData:{
		info:["快用起来","我的框架","自主研发","中华武术","创新创造","中国创造"]
	},
	init:function(p){
		this.template = App.wTemplate;
		this.data = [
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
		this.showData();
		this.bindEvent();
	},
	showData:function(){

		this.viewModel = new Wing.wTemplate({
		    repeatElement : document.querySelector("#myList"),
		    data : this.data,
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
		    },
		    onEvent:function(node){
		        //node is current element
		        //console.log("www",node);
		        //给每一个元素绑定事件
		        node.onclick = function(e){

		        }
		    }
		});

	},
	bindEvent: function(){
		/*数据驱动，当数据改变时，页面更新*/
		var data,th = this;
		var btn_data,btn_setData,btn_tips;
		btn_data = document.querySelector("#btn_data");
		btn_setData = document.querySelector("#btn_setData");
		btn_tips = document.querySelector("#desk .app-create");
		data = this.data;

		btn_data.onclick = function(e){
		    data[0].title = "title changed";
		    //data[0].url = "myurl";
		    data[0].numbers.app.count = "99998888999";
		    //console.log(data[1].list);
		    //data[0].list[2]=100;
		    //data[0].list[3]=200;
		    data[1].list.push(300);
		    data[1].list[0].b.c = "@@@@";
		    //data[0].list.push(111);
		    //data[0].list.push(888);
		};

		/*数据驱动，当数据改变时，页面数据更新*/
		btn_setData.onclick = function(e){
			let index = Math.floor((Math.random()*5));
			console.log("index:",index);
		    data[0].list[1] = th.stateData.info[index].substr(0,1);
		    data[1].list[1] = th.stateData.info[index].substr(1,1);
		    data[2].list[1] = th.stateData.info[index].substr(2,1);
		    data[3].list[1] = th.stateData.info[index].substr(3,1);
		};

		btn_tips.onclick = function(e){
			//alert("wing.js单页应用框架 无需安装babel即可轻松实现开发\r\n\r\nwing.js理念是：无需过度引入第单方依赖库也无需实时本地编译\r\n\r\n框架研发作者：邬畏畏");
		}
	}
}
