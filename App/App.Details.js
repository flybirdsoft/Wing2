App.Details = {
	data: {
		list: [
			{
				name: "张三",
				age: "33",
				sex: "男",
				jiguan: "北京",
				email: "123124@qq.com"
			},
			{
				name: "李四",
				age: "40",
				sex: "女",
				jiguan: "河北",
				email: "399097@qq.com"
			},
			{
				name: "王五",
				age: "40",
				sex: "男",
				jiguan: "内蒙古",
				email: "545443543@qq.com"
			},
			{
				name: "赵六",
				age: "38",
				sex: "男",
				jiguan: "上海",
				email: "4444@qq.com"
			},
			{
				name: "陈七",
				age: "33",
				sex: "女",
				jiguan: "新疆",
				email: "342343@qq.com"
			},
		],
		card: [
			{
				company: "软通动力",
				introduction: "软通动力[上市代码：ISS（纽交所）;301236.SZ（深交所）]是中国领先的全方位IT服务及行业解决方案提供商，立足中国，服务大中华区和全球市场。业务范围涵盖咨询及解决方案、IT服务及业务流程外包（BPO）服务等，是高科技、通信、银行/企业金融/保险、医疗健康、电力及公用事业等行业重要的IT综合服务提供商和战略合作伙伴。"
			},
			{
				company: "360",
				introduction: "奇虎360 [1]  是（北京奇虎科技有限公司）的简称，由周鸿祎于2005年9月创立，主营360杀毒为代表的免费网络安全平台和拥有360安全大脑等业务的公司 [2]  。该公司主要依靠在线广告、游戏、互联网和增值业务创收。"
			},
			{
				company: "联想",
				introduction: "联想集团是一家成立于中国、业务遍及180个市场的全球化科技公司。联想聚焦全球化发展，持续开发创新技术，致力于建设一个更加包容、值得信赖和可持续发展的数字化社会，引领和赋能智能化新时代的转型变革，为全球数以亿计的消费者打造更好的体验和机遇。"
			},
		]
	},
	init: function(){
		this.view();
	},
	view: function(){
		this.viewCard();
		this.viewList();
	},
	viewCard: function(){
		this.template = new Wing.wTemplate({
		    repeatElement : document.querySelector("#card"),
		    data : this.data.card,
		    render:function(object){
		        var data = object.item;
		    }
		});
	},
	viewList: function(){
		this.template = new Wing.wTemplate({
		    repeatElement : document.querySelector("#listItem"),
		    data : this.data.list,
		    render:function(object){
		        var data = object.item;
		        var index = object.index;
		        return {
		        	"bgColor": index%2==0 ? "" : "odd"
		        }
		    }
		});
	}
}