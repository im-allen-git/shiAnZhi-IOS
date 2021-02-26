window.onload = window.onresize = function() {

	var clientWidth = document.documentElement.clientWidth;

	document.getElementsByTagName("html")[0].style.fontSize =

		clientWidth / 750 * 100 + "px";
}

$(function() {
	// 获取公共 useId
	var userId = window.localStorage.getItem("useId");
	
	// 开启弹窗
	$('.wrap').click(function(){
		$(this).siblings('.tc').show();
		return false;
	});
	// 取消设置, 关闭弹窗
	$('.tc  .close , .tc .cancel').click(function(){
		$(this).closest('.tc').hide();
		return false;
		// 阻止冒泡
		event.stopPropagation(); 
		//阻止默认事件 
		event.preventDefault() 
	});
	
	
	
	// 昵称修改后赋值
	$('.name_tc .sure').click(function(){
		var name_val = $('.name_val').val().trim();
		$('.name_text').text(name_val);
		$('.name_tc').hide();
		window.localStorage.setItem('userName',name_val);
		/* 修改用户信息 */
		revisePersonInfo();
	});
	// 清空修改的昵称
	$('.name_tc .del').click(function(){
		$('.name_tc .name_val').val('');
	});
	
	
	// edit sex 性别选择
	$('.sex_tc .sex').click(function() {
		$(this).addClass('active').siblings('span').removeClass('active');
	});
	// 修改性别后赋值
	$('.sex_tc .sure').click(function(){
		var sex_text = $('.sex_tc .sex.active').text().trim();
		$('.sex_text').text(sex_text);
		$('.sex_tc').hide();
		window.localStorage.setItem('sex',sex_text);
		/* 修改用户信息 */
		revisePersonInfo();
	});
	
	// 进餐人数赋值
	$('.num_tc .sure').click(function(){
		var num_val = $('.paramater .num_val').val().trim();
		$('.paramater .diner_num,.set .diner_num').text(num_val);
		$('.num_tc').hide();
		window.localStorage.setItem('personNum',num_val);
		
	});
	// 浪费比例赋值
	$('.waste_tc .sure').click(function(){
		$('.waste_tc').hide();
	});
	$('.set_wrap').click(function(){
		$('.paramater').show();
	})
	$('.back_set').click(function(){
		$('.paramater').hide();
	})
	
	// 系统生成二维码
	console.log('userId==' + userId);
	$('.erweima_wrap').click(function(){
		var id = userId;
		console.log('生成二维码前一刻userId ==' + id);
		// 系统自动生成二维码
		var name = $.trim($('.name_text').text());
		var userName = id + ',' + name;
		url14 = userName ; //二维码内容（即该页面的路径）;
		console.log('url14 == ' + url14);
		WeiXin(url14);
		$('.erweim_tc').show();
	});
	$('.close').click(function(){
		$('.erweim_tc').hide();
	});
})
// 系统生成二维码图片
//微信扫描二维码
function WeiXin(url14) {
	//每次先清空二维码容器
	$("#qrcode").html("");
	// var url4 = window.location.href;     //二维码内容（即该页面的路径）
	// url4 = 'A -- 测试二维码 -- B'; //二维码内容（即该页面的路径）
	var s = str2utf8(url14);

	/* 生成二维码 */
	$("#qrcode").qrcode({
		render: "canvas", //设置渲染方式
		width: 300, //设置宽度,默认生成的二维码大小是 256×256
		height:300, //设置高度
		typeNumber: -1, //计算模式
		background: "#ffffff", //背景颜色
		foreground: "#000", //前景颜色（粉色）
		correctLevel: 0,
		text: s //设置二维码内容
	});
}

// UCS-2 编码转 UTF-8 编码，防止中文乱码
function str2utf8(str) {
	// UCS-2和UTF8都是unicode的一种编码方式
	// js代码中使用的是UCS-2编码

	var code;
	var utf = "";

	for (var i = 0; i < str.length; i++) {
		code = str.charCodeAt(i); //返回每个字符的Unicode 编码

		if (code < 0x0080) {
			utf += str.charAt(i); //返回指定位置的字符
		} else if (code < 0x0800) {
			utf += String.fromCharCode(0xC0 | ((code >> 6) & 0x1F));
			utf += String.fromCharCode(0x80 | ((code >> 0) & 0x3F));
		} else if (code < 0x10000) {
			utf += String.fromCharCode(0xE0 | ((code >> 12) & 0x0F));
			utf += String.fromCharCode(0x80 | ((code >> 6) & 0x3F));
			utf += String.fromCharCode(0x80 | ((code >> 0) & 0x3F));
		} else {
			throw "不是UCS-2字符集"
		}

	}
	return utf;
}

function NumToName(num,name){
	// let name = '';
	if (num = '1') {
		name == '油'
	} else if (num = '2') {
		name == '菜籽油'
	} else if (num = '3') {
		name == '葵花籽油';
	} else if (num = '4') {
		name == '橄榄油';
	} else if (num = '5') {
		name == '花生油';
	} else if (num = '6') {
		name == '玉米油';
	} else if (num = '7') {
		name == '豆油';
	} else if (num = '8') {
		name == '香油';
	} else if (num = '9') {
		name == '芝麻油';
	} else if (num = '10') {
		name == '麻油'
	} else if (num = '11') {
		name == '糖';
	} else if (num = '12') {
		name == '冰糖';
	} else if (num = '13') {
		name == '白砂糖';
	} else if (num = '14') {
		name == '红糖';
	} else if (num = '15') {
		name == '盐';
	} else if (num = '16') {
		name == '细盐';
	} else if (num = '17') {		
		name == '粗盐';
	} else if (num = '18') {		
		name == '碘盐';
	} else if (num = '19') {		
		name == '无碘盐';
	} else if (num = '20') {		
		name == '海盐';
	} else if (num = '21') {		
		name == '玫瑰盐';
	} else if (num = '22') {		
		name == '岩盐';
	} else if (num = '23') {		
		name == '竹盐';
	} else if (num = '24') {		
		name == '醋';
	} else if (num = '25') {		
		name == '黑醋';
	} else if (num = '26') {		
		name == '香醋';
	} else if (num = '27') {		
		name == '米醋';
	} else if (num = '28') {		
		name == '白醋';
	} else if (num = '29') {		
		name == '陈醋';
	} else if (num = '30') {		
		name == '康乐醋';
	} else if (num = '31') {		
		name == '酱油';
	} else if (num = '32') {		
		name == '海鲜酱油';
	} else if (num = '33') {		
		name == '生抽';
	} else if (num = '34') {	
		name == '老抽';
	} else if (num = '35') {		
		name == '六月鲜';
	} else if (num = '36') {		
		name == '味极鲜';
	} else if (num = '37') {		
		name == '刺生酱油';
	} else if (num = '38') {		
		name == '日式酱油';
	} else if (num = '39') {		
		name == '辣酱油';
	} else if (num = '40') {		
		name == '耗油';
	} else if (num = '41') {		
		name == '蒸鱼豉油';
	} else if (num = '42') {		
		name == '料酒';
	} else if (num = '43') {		
		name == '葱姜料酒';
	} else if (num = '44') {		
		name == '椒盐';
	} else if (num = '45') {		
		name == '淀粉';
	} else if (num = '46') {		
		name == '味精';
	} else if (num = '47') {		
		name == '鸡精';
	} else if (num = '48') {		
		name == '鸡粉';
	} else if (num = '49') {		
		name == '克';
	} else if (num = '50') {		
		name == '毫升';
	}
	return name;
}