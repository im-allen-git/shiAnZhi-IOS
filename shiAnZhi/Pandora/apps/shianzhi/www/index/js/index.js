/* 获取蓝牙数据信息 */
var deviceName = window.localStorage.getItem('deviceName');
var deviceId = window.localStorage.getItem('deviceId');
var serviceId = window.localStorage.getItem('serviceId');
var characteristicId = window.localStorage.getItem('characteristicId');
var hasDevice = ''; // 进入首页是否有设备
// cookie
// param name : 表示cookie的名称，必填
// param subName : 表示子cookie的名称，必填
// param value : 表示子cookie的值，必填
// param expires : 表示cookie的过期时间，可以不填
// param domain : 表示cookie的域名，可以不填
// param path : 表示cookie的路径，可以不填
// param secure : 表示cookie的安全标志，可以不填
var cookieObject = {
	setCookie: function(name, value, expiry, path, domain, secure) {
		var nameString = 'ck_' + name + '=' + value;
		var expiryString = '';
		if (expiry != null) {
			try {
				expiryString = '; expires=' + expiry.toUTCString();
			} catch (e) {
				if (expiry) {
					var lsd = new Date();
					lsd.setTime(lsd.getTime() + expiry * 1000);
					expiryString = '; expires=' + lsd.toUTCString();
				}
			}
		} else {
			var ltm = new Date();
			expiryString = '; expires=' + ltm.toUTCString();
		}
		var pathString = path == null ? ' ;path=/' : ' ;path = ' + path;
		var domainString = domain == null ? '' : ' ;domain = ' + domain;
		var secureString = secure ? ';secure=' : '';
		document.cookie = nameString + expiryString + pathString + domainString + secureString;
	},
	getCookie: function(name) {
		var i, aname, value, ARRcookies = document.cookie.split(';');
		for (i = 0; i < ARRcookies.length; i++) {
			aname = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='));
			value = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1);
			aname = aname.replace(/^\s+|\s+$/g, '');
			if (aname == 'ck_' + name) {
				return value
			}
		}
		return ''
	},
	removeCookie: function(name) {
		this.setCookie(name, '', -1);
	}
}
var storageObject = {
	localGetItem: function(key) {
		//假如浏览器支持本地存储则从localStorage,localStorage，否则乖乖用Cookie
		return window.localStorage ? localStorage.getItem(key) : cookieObject.getCookie(key);
	},
	localSetItem: function(key, val) {
		return window.localStorage ? localStorage.setItem(key, val) : cookieObject.setCookie(key, val);
	},
	localRemoveItem: function(key) {
		return window.localStorage ? localStorage.removeItem(key) : cookieObject.removeCookie(key);
	},
	sessionGetItem: function(key) {
		return window.localStorage ? localStorage.getItem(key) : cookieObject.getCookie(key);
	},
	sessionSetItem: function(key, val) {
		return window.localStorage ? localStorage.setItem(key, val) : cookieObject.setCookie(key, val);
	},
	sessionRemoveItem: function(key) {
		return window.localStorage ? localStorage.removeItem(key) : cookieObject.removeCookie(key);
	}
}

var item = ''; //大类别food_item的值,下面需要用到
var goodsItemIndex = 0; //大类别food_item添加序号,下面需要用到
/* 已进入首页就初始化查看是否有数据 */
var foodType = $('#foodType'); //顶部食品名称列表
var foodAmount = $('#foodAmount'); //顶部食品名称相对于的详细数据
var motherboardTop = $('#motherboardTop');
var guideIntake = 0; //某一个食物大类别的指导摄入量重量,在添加设备时获取
var weightUnit = '克';
var weightUnitE = 50; //单位在数据库对应的编号
var weightUnit1 = 'g';
var now = new Date();
var year = now.getFullYear();
var month = (now.getMonth() + 1 < 10 ? '0' : '') + (now.getMonth() + 1);
var day = (now.getDate() < 10 ? '0' : '') + now.getDate();
var hour = (now.getHours() < 10 ? '0' : '') + now.getHours();
var hasEquipmentList = false;
var startTime = year + '-' + month + '-' + day + ' 00:00:00';
var endTime = year + '-' + month + '-' + day + ' 23:59:00';
var foodTypeAll = '' //存储食物大类别的具体数据,用@@分割,第一个数据为食物类别名,第二个数据为类别推荐指标(就是上面的指导摄入量重量guideIntake),第三个数据为食称重单位,第四个数据为绑定的设备名,第五个数据为今日摄入量,第六个为剩余总重量
var dayTotalIntake = 0;  //当前类别当日摄入人均总重量
var systemMealsNum = 0; //人数
var systemWasteRatio = 0; //浪费比率

var thatDayManualCumulativeIntake = 0;   //当日手动人均摄入量总和
var thatDayDeviceCumulativeIntake = 0;   //当日蓝牙设备人均摄入量总和
var arrangeDeviceArr = []; //处理好的所有蓝牙重量数据数组
var arrangeManualArr = []; //处理好的所有手动重量数据数组
var arrangeAllArr = []; //处理好的所有数据数组
var deviceAllWeight = 0; //当前项目(item)的总重量
var initAllWeight = 0;  //初始称重重量

// var chartLastTimeAvgWeight = 0;  //周月图表上一次记录的人均用量
// var chartLastTimeAllWeight = 0;  //周月图表上一次记录的总用量
// var chartLastTimeDate = '';  //周月图表上一次记录的时间
//var weekTime = ['周一','周二','周三','周四','周五','周六','周日']; //周平均图表X轴的时间数据
var manArr = [0, 0, 0]; //手动输入数据,默认全部为0
var weekWeight = [0,0,0,0,0,0,0]; //周平均图表Y轴的周平均重量,默认全部为0
var weekTimeArr = []; //周平均图表里柱体对应的日期,为了点击跳转详情页

//var monthTime = ['第一周','第二周','第三周','第四周','第五周']; //月平均图表X轴的时间数据,如有的月份只有4周去掉最后一个元素
var monthWeight = [0,0,0,0,0]; //月平均图表Y轴的重量
var todayUsageWeightArr = []; //今日每一餐使用重量数组
var todayUsageTimeArr = []; //今日每一餐使用时间数组
var weekDataArr = [];

var chuanCount = 0;
var oldDetectWeight = 0; //记录上一次传过来的重量,用于和新的重量对比,防止重复传数据到后台
var oldItem = 0;
window.onload = function() {
	/* 添加设备弹窗相关方法 */
	//var addDeviceBtn = document.getElementById('addDeviceBtn');
	var addDevice = document.getElementById('addDevice');
	var addDeviceBg = document.getElementById('addDeviceBg');
	var addDeviceClose = document.getElementById('addDeviceClose');

	// addDeviceBtn.onclick = function(){
	// 	addDevice.style.display = 'block';
	// }
	addDeviceBg.onclick = function() {
		addDevice.style.display = 'none';
		$('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
	}
	addDeviceClose.onclick = function() {
		addDevice.style.display = 'none';
		$('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
	}
	/* 添加设备弹窗相关方法 end */
	/* 还无设备弹窗相关方法 */
	var deviceBox = document.getElementById('deviceBox');
	var deviceBg = document.getElementById('deviceBg');
	var deviceClose = document.getElementById('deviceClose');
	deviceBg.onclick = function() {
		deviceBox.style.display = 'none';
		$('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
	}
	deviceClose.onclick = function() {
		deviceBox.style.display = 'none';
		$('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
	}
	/* 还无设备弹窗相关方法 end */

	/* 系统提示弹窗相关方法 */
	/* var systemHint = document.getElementById('systemHint');
	  var systemHintBg = document.getElementById('systemHintBg');
	  var systemHintClose = document.getElementById('systemHintClose');
	  systemHintBg.onclick = function(){
	      systemHint.style.display = 'none';
	  }
	  systemHintClose.onclick = function(){
	      systemHint.style.display = 'none';
	  } */

	// 添加项目弹窗
	$('#addDeviceBtn1,#addDeviceBtn').click(function() {
		$('.add_item').show();
	})
	$('.need_add_type .btn_add').click(function() {
		$('.add_item').show();
		$(".need_add_type,.need_add_type_bg").hide();
	})
	$(".need_add_type .btn_cancle,.need_add_type_bg").click(function() {
		$(".need_add_type,.need_add_type_bg").hide();
	})
	$(".shebeiliebiao_note .btn_cancle,.need_add_type_bg").click(function() {
		$(".shebeiliebiao_note,.need_add_type_bg").hide();
	})
	/* 解释说明弹窗相关 */
	$('.meals_number_icon').click(function() {
		$('.meals_number_contanier').show();
	})
	$(".meals_number_close,.meals_number_bg").click(function() {
		$(".meals_number_contanier").hide();
	})
	/* 解释说明弹窗相关 end */

	$('.motherboard_left').on('click',function(){
		let motherNowIndex = goodsItemIndex+1;  //当前项目的序号加一
		if($(this).hasClass('prohibit_lik')){
			return false;
		}
		$('#remain').text('');
		let motherboardMain1 = $('.motherboard_main1');
		let motherboardItems = motherboardMain1.find('.motherboard_item');
		let motherboardMainLeft = motherboardMain1.css('left');
		motherboardMainLeft = parseFloat(motherboardMainLeft);
		let motherboardMainWidth = motherboardMain1.width();
		let motherboardItemWidth = motherboardItems.width();
		let motherboardItemlength = motherboardItems.length;
		if(motherNowIndex < motherboardItemlength){
			$('.motherboard_right').removeClass('prohibit_lik');
			//非左侧按钮赋值
			let prevItemName = $.trim(motherboardItems.eq(motherNowIndex-1).find('.motherboard_name').text()); //没切换前默认展示的项目名在切换后要赋给左侧按钮
			$('.motherboard_left .motherboard_item_name').text(prevItemName);
			motherNowIndex++;
			motherboardMain1.stop(true).animate({"left": -(motherNowIndex - 1) * motherboardItemWidth},500);
			//非右侧按钮赋值
			let prevItemName1 = $.trim(motherboardItems.eq(motherNowIndex).find('.motherboard_name').text()); //后一个项目名值如果存在赋给右侧按钮
			if(prevItemName1){
				$('.motherboard_right .motherboard_item_name').text(prevItemName1);
			}else{
				$('.motherboard_right .motherboard_item_name').text('');
			}
		}
		/* 切换选中类名 */
		$('#motherboardList li').eq(motherNowIndex-1).addClass('food_active').siblings().removeClass('food_active');
		foodType.find('.food_item').eq(motherNowIndex-1).trigger('click');
		if(motherNowIndex == motherboardItemlength){
			$('.motherboard_right motherboard_item_name').text('');
			$(this).addClass('prohibit_lik');
		}
		/* 切换项目后,清除本地存储里判断是否重复的旧的称重重量 */
		storageObject.localRemoveItem('oldDetectWeight');
		storageObject.localRemoveItem('oldItem');
	})

	$('.motherboard_right').on('click',function(){
		let motherNowIndex = goodsItemIndex+1; //当前项目的序号加一
		if($(this).hasClass('prohibit_lik')){
			return false;
		}
		$('#remain').text('');
		let motherboardMain1 = $('.motherboard_main1');
		let motherboardItems = motherboardMain1.find('.motherboard_item');
		let motherboardMainLeft = motherboardMain1.css('left');
		motherboardMainLeft = parseFloat(motherboardMainLeft);
		let motherboardMainWidth = motherboardMain1.width();
		let motherboardItemWidth = motherboardItems.width();
		if(motherNowIndex>1){
			$('.motherboard_left').removeClass('prohibit_lik');
			//非右侧按钮赋值
			let nextItemName = $.trim(motherboardItems.eq(motherNowIndex-1).find('.motherboard_name').text());
			$('.motherboard_right .motherboard_item_name').text(nextItemName);
			motherNowIndex--;
			motherboardMain1.stop(true).animate({"left": -(motherNowIndex - 1) * motherboardItemWidth},500);
			//非左侧按钮赋值
			let nextItemIndexNum = 0;
			if(motherNowIndex > 1){
				nextItemIndexNum = motherNowIndex-2;
			}
			let nextItemName1 = $.trim(motherboardItems.eq(nextItemIndexNum).find('.motherboard_name').text()); //后一个项目名值如果存在赋给右侧按钮
			if(nextItemName1){
				$('.motherboard_left .motherboard_item_name').text(nextItemName1);
			}else{
				$('.motherboard_left .motherboard_item_name').text('');
			}
		}
		/* 切换选中类名 */
		$('#motherboardList li').eq(motherNowIndex-1).addClass('food_active').siblings().removeClass('food_active');
		foodType.find('.food_item').eq(motherNowIndex-1).trigger('click');
		if(motherNowIndex == 1){
			$('.motherboard_left .motherboard_item_name').text('');
			$(this).addClass('prohibit_lik');
		}
		/* 切换项目后,清除本地存储里判断是否重复的旧的称重重量 */
		storageObject.localRemoveItem('oldDetectWeight');
		storageObject.localRemoveItem('oldItem');
	})
}
var setIntervalSendToBT
var currentUserID; //用于群组用户切换
var currentUserPhone; //用于群组用户切换
$(function() {
//alert(storageObject.localGetItem('foodActiveName'));
// alert(storageObject.localGetItem('oldItem'));

	var userId = window.localStorage.getItem('useId');
	currentUserID = window.localStorage.getItem('currentUserID');
	currentUserPhone = window.localStorage.getItem('currentUserPhone');

	let personNum = storageObject.localGetItem('personNum');
	let wasteNum = storageObject.localGetItem('wasteNum');
	let userName = storageObject.localGetItem('userName');
	let groupPhone = storageObject.localGetItem('groupPhone');
	/* userName = 'wuhong'; */
	// if (!personNum) {
	// 	//session参数不存在,表示第一次进入app,显示系统设置提示弹窗
	// 	$('#device_link').show();
	// 	// $('#systemHint').show();
	// 	/* $('.ingest_href').removeAttr('href'); */
	// 	//第一次进入app时.不能点击查看详情数据
	// }else{
	// 	$('#device_link').hide();
	// }








	var switchTop = $('.switch_top')
	if (userName) {
		// switchTop.find('#myname').text(userName).end().siblings('.switch_users').children('li').eq(0).text(userName).attr(
		// 	"onclick", "getBindUserId('" + userName + "','" + userId + "',0,'')");
		switchTop.find('#myname').text(userName).end().siblings('.switch_users').children('li').eq(0).text(userName);
	}

	/* 现在并添加项目后的下一步方法 */
	$('#addDeviceNext1').on('click', function() {


		foodTypeAll = '' //存储新的数据之前，将全局变量先清空
		let typeThat = $(this).parents('.add_dev_one');
		let addTypeName = $.trim(typeThat.find('#addType1').children('.type1_active').text()); //项目名称
		let addTypeUnit = $.trim(typeThat.find('#addType2').children('.type2_active').text()); //项目单位
		//let systemMealsNum = $.trim(typeThat.find('.meals_number').children('.meals_number_input').val()); //就餐人数
		//let systemWasteRatio = 0 //浪费比率
		//设置了基础设置后保存到本地session里
		//storageObject.localSetItem('personNum', parseFloat(systemMealsNum));
		//storageObject.localSetItem('wasteNum', parseFloat(systemWasteRatio));
		//let addTypeNum = typeThat.find('.recommend_bun').val(); //项目推荐指标
		let addTypeNum = 0; //项目推荐指标暂且不需要置0

		var foodItemArr = [];
		$('#foodType .food_item').each(function() { // 项目类别不能重复
			foodItemArr.push($(this).text());
		});
		if (foodItemArr.indexOf(addTypeName) != -1) { // 如果添加的项目重复，提示更换添加项目
			alert('项目类别重复请更换项目');
			return false;
		} else { // 如果没有重复添加的项目，就进行下一步，开始绑定添加设备
			$('#addDevice').hide(); // 添加项目隐藏
			/* 查询设备信息列表数据 */

		}

		/* 单位赋值 */
		guideIntake = addTypeNum; //某一个食物大类别的指导摄入量重量
		storageObject.localRemoveItem('guideIntake');  //先清除
		storageObject.localSetItem('guideIntake', guideIntake); //将当前类别知道重量保存到本地存储里
		weightUnit = addTypeUnit;
		if (addTypeUnit == '克') {
			weightUnit1 = 'g';
			weightUnitE = 49;
		} else {
			weightUnit1 = 'ml';
			weightUnitE = 50;
		}
		/* 存储设置的数据 */
		foodTypeAll = addTypeName + '@@' + addTypeNum + '@@' + addTypeUnit;
		// 单独存储项目
		var project_select_text = $('.type1_active').text();
		/* var project_select = */
		window.localStorage.setItem('project_select', project_select_text);
		var project_unit_text = $('#addType2 .type2_active').text();
		/* var project_unit = */
		window.localStorage.setItem('project_unit', project_unit_text);
		var position_text = $('.equipments_active').closest('li').find('.position').text();
		/* var position = */
		window.localStorage.setItem('position', position_text);

		// 添加项目后，直接进入到项目提交弹窗，并赋值
		var project =  $('#addType1 .type1_active').text();
		var unit = $('#addType2 .type2_active').text();
		var person_num = $.trim($('.meals_number_input').val());
		var deviceName = window.localStorage.getItem('deviceName');
		// console.log('添加项目确定后，获取的就餐人数和设备名称==' + person_num + '&&' + deviceName);
		$('.add_txt1').text(project);
		$('.add_txt2').text(unit);
		$('.add_list .add_txt5 em').text(person_num);
		$('.add_txt4').text(deviceName);
		$('#addDevice,#addDevice  .add_dev_two').show();
		$('#addDevice  .add_dev_one').hide();

		var person = 'person_' + person_num ;
		var typeNumber = '人数';
		//console.log('点击下一步时候，发送项目时获取的设备信息 == ' + deviceId + '&&' +  serviceId + '&&' +characteristicId);
		writeCharacteristics(person, typeNumber, deviceId, serviceId, characteristicId); // 发送用餐人数




	})

	/* 绑定后点击完成开始 */
	$('#addDeviceNext2').on('click', function() {
		// 完成添加设备及项目详情信息
		var position = $.trim(window.localStorage.getItem('position'));
		if (position == '左边') {
			position = '1';
		} else if (position == '右边') {
			position = '2';
		}
		// 绑定完成后发送项目数据
		var project_select = window.localStorage.getItem('project_select');
		project_select = getProjectId(project_select);
		// console.log("project_select:::" + project_select)
		var project_unit = window.localStorage.getItem('project_unit');
		project_unit = getProjectId(project_unit);
		// console.log("project_unit:::" + project_unit)
		var t1 = 'inputCategory' + position;
		var project = t1 + '_' + project_select + '=' + project_unit;
		var type1 = '项目';
		// console.log('点击完成后，发送项目时获取的设备信息 == ' + deviceId + '&&' +  serviceId + '&&' +characteristicId);
		writeCharacteristics(project, type1, deviceId, serviceId, characteristicId);

		// 发送项目后，判断添加现目前，是否选择了需要wifi,判断是否需要发送wifi 数据


		// 绑定设备完成后，添加数据到后台，
		let item1 = $.trim($('.add_list .add_txt1').text());
		let switchItem1 = switchItem(item1,1); //类别名转为对应的数字
		if(switchItem1 > -1){
			item = switchItem1;
		}
		var unit = $.trim($('.add_list .add_txt2').text());
		if(unit == '克'){
			weightUnit1 = 'g';
			weightUnitE = 49;
		} else {
			weightUnit1 = 'ml';
			weightUnitE = 50;
		}
		//var target = $.trim($('.add_list .add_txt3').text());
		var target = 0; //推荐指标不需要了,默认为0
		var name = $.trim($('.add_list .add_txt4').text());
		// var deviceId = $('#equipmentsList .equipments_active').closest('li').attr('mac'); //获取被绑定的设备id
		var deviceId2 = $('#equipmentsList .equipments_active').closest('li').attr('mac'); //获取被绑定的设备id

		// 检测是否是已存在的项目关联当前设备
		var listEquipments = $('#equipmentsList').find(".equipments_item");
		// var BoundItemFlag = false;
		var currentListMac, currentListItem, currentListName, sameType, boundOldItem;
		// console.log(JSON.stringify(listEquipments))
		listEquipments.each(function() {
			currentListMac = $(this).attr('mac');
			currentListItem = $(this).find(".equipments_function").text().split("-")[1];
			currentListName = $(this).find(".equipments_name").text() + $(this).find(".position").text().substring(1, 0);
			// console.log("currentListMac::" + currentListMac);
			// console.log("currentListItem::" + currentListItem);
			// console.log("currentListName::" + currentListName);

			// if (currentListMac == deviceId && currentListName == name && currentListItem && item != currentListItem) { //如果添加的信息与已有的相同，说明是替换
			// 	boundOldItem = currentListItem;
			// 	BoundItemFlag = true;
			// 	return;
			// }
		})

		systemMealsNum = $.trim($('.add_list .add_txt5 em').text());//用餐人数

		//alert('绑定设备时候传递后台的数据=='+deviceId+','+ name+','+ userId +'&&' + item +'&&' + weightUnitE +'&&'+target+'&&' + name +'&&'+systemMealsNum +'&&' + serviceId +'&&' + characteristicId);
		$.ajax({
			url: 'https://192.168.1.55:448/user/updateEquipment',  // 更新设备接口
			type: 'post',
			data: {
				'mac': deviceId,
				'name': name, // 绑定设备的左右称的名称,
				'user_id': userId,
				'item': item, // 项目名称 ，油盐...
				'unit': weightUnitE, // 指标单位
				'target': target, // 指标数量
				'device_name':name,  //设备名
				'number':systemMealsNum,
				'service_id': serviceId,
				'characteristic_id': characteristicId,
				//'ip_address':'', // wifi 的地址
				'online_type': '1' // 传递的蓝牙或者wifi  //1 蓝牙  2. wifi
			},
			dataType: 'json',
			success: function(result) {
				//console.log('更新设备时候传递后台的数据==' + userId +'&&' + item +'&&' + weightUnitE +'&&'+target+'&&' + name +'&&'+systemMealsNum +'&&' + serviceId +'&&' + characteristicId);
				// console.log("把--" + boundOldItem + '==换成==' + item)
				$("#foodType").find("li.food_item").each(function() {
					if ($(this).text() == boundOldItem) {
						$(this).text(item);
						return
					}
				})
				// 绑定完成后读取蓝牙数据
				var timer = null;
				setIntervalSendToBT = setTimeout(function() {
					//alert('10秒过去了,开始接收数据')
					clearInterval(reconnectInterval); // 清除自动重新链接蓝牙循环
					timer = setInterval(function() { // 一直刷新
						readlanya(deviceName, deviceId, serviceId, characteristicId);
					}, 7000); /* reReadInterval */
				}, 10000);
				// console.log('添加项目结束并读取蓝牙数据成功后读取摄入量数据开始 ==');

				foodTypeTab(userId); //tab切换
				$('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
				/* 更新本地存储数据 */
				storageObject.localSetItem('foodItemIndex', $('#foodAmount>.amount_item').length - 1);
				let foodTypeVal = storageObject.localGetItem('foodTypeVal');
				var newFootType = item1 + "@@" + target + "@@" + unit + "@@" + name + "@@" + deviceId + "@@" + serviceId +
					"@@" + characteristicId;
				var newfoodTypeAll = '';
				if (foodTypeVal) {
					newfoodTypeAll = newFootType + "||" + foodTypeVal;
					newfoodTypeAll = newfoodTypeAll.substr(0,newfoodTypeAll.length-2); //去除最后的||符号
				}else{
					newfoodTypeAll = newFootType;
				}
				storageObject.localSetItem('foodTypeVal', newfoodTypeAll);
				//alert('新增项目为当前默认展示项目：'+item1)
				storageObject.localSetItem('foodActiveName', item1); //设置新增项目为当前默认展示项目
				storageObject.localSetItem('project_select', item1);

				/* 更新本地存储数据 end*/

				/* 更新后台用餐人数 */
				//updateMealsNum(systemWasteRatio,parseInt(systemMealsNum));

				//切换更新设备后操作方法
				//switchOrUpdate(1);  //1是更新,2是新增

			},
			error: function(ero) {
				console.log('添加数据到后台失败');
				console.log(ero);
				window.localStorage.removeItem('BoundItem');
			}
		})

		// 添加项目结束后, 弹出选择称的显示屏是显示当前重量还是人均重量后
		$('#addDevice,#addDevice  .add_dev_two').hide();
		$('.weightShow_set').show();
	});

	/* 绑定后点击完成结束 */



	$('#addDeviceNext3').on('click', function() {
		/* 这里先扫描二维码 */
		$('#deviceBox').hide();
		// $('#confirmDevice').show();
	})
	// $('#addDeviceNext4').on('click', function() {
	// 	var boundItem = $('.equipments_active').closest('li').find('.equipments_function').attr("bound");
	// 	if (boundItem) {
	// 		var item_0 = $.trim($('#addType1 .type1_active').text()); // 初始项目
	// 		$("#BoundItem").text(boundItem)
	// 		$("#NewItem").text(item_0)
	// 		$(".shebeiliebiao_note,.need_add_type_bg").show();
	// 		return
	// 	}
	// 	nextStepToBind();
	// })
	/* 上一步方法 */
	// $('#devicePrevious1').on('click', function() {
	// 	$('#addDevice').hide();
	// 	$('#newEquipments').show();
	// })
	$('#devicePrevious2').on('click', function() {
		// $('#newEquipments').show();
		$('#addDevice').show().find('.add_dev_one').show().next('.add_dev_two').hide();
		/* foodTypeAll = foodTypeAll.substr(0,foodTypeAll.lastIndexOf('@@'));  //添加设备点击上一步时,去掉foodTypeAll最后面已经添加的设备名称
		    storageObject.localRemoveItem('foodTypeVal'); */

	})
	$('#devicePrevious3').on('click', function() {
		$('#addDevice').show();
		$('#deviceBox').hide();
	})
	$('#devicePrevious4').on('click', function() {
		$('#addDevice').show();
		// $('#confirmDevice').show();
		$('#newEquipments').hide();
	})

	/* 添加设备弹窗相关方法 */
	$('#addType1').on('click', 'li', function() {
		let thatType = $(this);
		if (thatType.hasClass('type1_customize')) {
			$('#customizeProject').show();
		} else {
			thatType.addClass('type1_active').siblings().removeClass('type1_active');
		}

		let project = $.trim($(this).text());
		if(project == '盐' || project == '糖' || project == '味精'){
			$('#addType2 li:first-child').addClass('type2_active').siblings().removeClass('type2_active');
		}else{
			$('#addType2 li:last-child').addClass('type2_active').siblings().removeClass('type2_active');
		}
	})
	$('#addType2').on('click', 'li', function() {
		let thatType = $(this);
		thatType.addClass('type2_active').siblings().removeClass('type2_active');
		if (thatType.text() == '克') {
			$(".recommend_font").text("克/天");
		} else if (thatType.text() == '毫升') {
			$(".recommend_font").text("毫升/天");
		}
	})

	/* 点击减按钮 */
	$('.recommend_decrease').on('click', function() {
		let thatPlus = $(this);
		let inputVal = parseInt(thatPlus.siblings('.recommend_bun').val());
		if (inputVal === 0) {
			thatPlus.siblings('.recommend_bun').val(0);
		} else {
			thatPlus.siblings('.recommend_bun').val(inputVal - 1);
		}
	})
	$('.meals_decrease').on('click', function() {
		let thatPlus = $(this);
		let inputVal = parseInt(thatPlus.siblings('.meals_number_input').val());
		if (inputVal === 1) {
			thatPlus.siblings('.meals_number_input').val(1);
		} else {
			thatPlus.siblings('.meals_number_input').val(inputVal - 1);
		}
	})

	/* 点击加按钮 */
	$('.recommend_increase').on('click', function() {
		let thatPlus = $(this);
		let inputVal = parseInt(thatPlus.siblings('.recommend_bun').val());
		if (inputVal > 9998) {
			thatPlus.siblings('.recommend_bun').val(9999);
		} else {
			thatPlus.siblings('.recommend_bun').val(inputVal + 1);
		}
	})
	$('.meals_increase').on('click', function() {
		let thatPlus = $(this);
		let inputVal = parseInt(thatPlus.siblings('.meals_number_input').val());
		if (inputVal > 9998) {
			thatPlus.siblings('.meals_number_input').val(9999);
		} else {
			thatPlus.siblings('.meals_number_input').val(inputVal + 1);
		}
	})
	$('#customizeBg,#customizeClose').on('click', function() {
		$('#customizeProject').hide();
	})
	$('#customizeIcon').on('click', function() {
		$(this).siblings('#customizeName').val('').focus();
	})
	$('#customizeConfirm').on('click', function() {
		let _that = $(this)
		let customizeNameVal = _that.siblings('#customizeName').val()
		if (customizeNameVal.length > 0) {
			$('#customizeProject').hide();
			/* 插入输入的新的自定义项目名 */
			$('.type1_customize').siblings().removeClass('type1_active').end().before('<li class="type1_active">' +
				customizeNameVal + '</li>');
		} else {
			_that.addClass('customize_embar');
		}
	})
	$('#customizeName').on('focus', function() {
		$(this).siblings('#customizeConfirm').removeClass('customize_embar');
	})
	/* 添加设备弹窗相关方法 end */

	/* 添加新设备列表弹窗相关方法 start*/
	$('#device_bg,#newEquipmentsClose').on('click', function() {
		$('#newEquipments').hide();
	})
	/* $('#equipmentsList').on('click','.equipments_item',function(){
	      let thatEqu = $(this);
	      thatEqu.find('.equipments_check').addClass('equipments_active').end().siblings().find('.equipments_check').removeClass('equipments_active');
	  }) */

	/* 添加新设备列表弹窗相关方法 end */

	/* 确认设备弹窗相关方法 */
	$('#confirmBackBtn,#confirmDeviceBack').on('click', function() {
		let thatType = $(this);
		thatType.parents('#confirmDevice').hide();
		if (hasEquipmentList) {
			$('#newEquipments').show();
			$('#deviceBox').hide();
		} else {
			$('#newEquipments').hide();
			$('#deviceBox').show();
		}
	})

	/* 确认设备弹窗相关方法 end */

	/* 系统提示弹窗相关方法 */
	// $('#singleSlider').jRange({
	// 	from: 0, //开始于
	// 	to: 100, //结束于
	// 	step: 1, //一次滑动多少
	// 	format: '%s', //格式化格式
	// 	width: ($('.waste_chart').width() / 300) * 300, //宽度,这里为了适应父元素的宽度，做了自适应的处理
	// 	snap: false, //是否只允许按增值选择(默认false)
	// 	showLabels: true, //布尔型，是否显示滑动条下方的尺寸标签
	// 	isRange: false //是否为选取方位
	// });

	// $('#mealsList').on('click', '.meals_item', function() {
	// 	let _that = $(this);
	// 	_that.addClass('meals_active').siblings().removeClass('meals_active');
	// })

	// $('#hintMainBottom').on('click', function() {
	// 	//设置了基础设置后保存到本地session里
	// 	let _that = $(this);
	// 	systemMealsNum = $.trim(_that.parents('.device_pop').find('.meals_active').text()); //人数
	// 	systemWasteRatio = _that.parents('.device_pop').find('#singleSlider').val(); //浪费比率
	// 	alert("就餐人数是："+systemMealsNum)
	// 	storageObject.localSetItem('personNum', parseFloat(systemMealsNum));
	// 	storageObject.localSetItem('wasteNum', parseFloat(systemWasteRatio));
	// 	$('#systemHint').hide();

	// 	/* 提交信息，就餐人数和浪费比例 */
	// 	$.ajax({
	// 		url: 'https://192.168.1.55:448/user/updateUserInfo',
	// 		type: 'post',
	// 		data: {
	// 			user_id: userId,
	// 			nick_name: '',
	// 			sex: '',
	// 			birthday: '',
	// 			height: '',
	// 			weight: '',
	// 			waste_rate: systemWasteRatio,
	// 			number: systemMealsNum
	// 		},
	// 		dataType: 'json',
	// 		success: function(result) {
	// 			console.log('updateUserInfo:' + JSON.stringify(result));
	// 			if (result.code == 200) {
	// 				window.localStorage.setItem('firstDefaultSetBW', 'true');
	// 			}
	// 		},
	// 		error: function(ero) {
	// 			//alert(ero);
	// 		}
	// 	})
	// })
	/* 系统提示弹窗相关方法 end */

	/* 系统链接方式开始 */
	$('.password_del').click(function() {
		$('.password_val').val('');
	})
	$('#systemLinkClose,.link_center .cancel').click(function() {
		$('#wife_link').hide();
		$('#device_link').hide();
	})


	/* 周月按钮切换 */
	$('.amount_chart_link1').on('click',function(event){
		$(this).addClass('amount_chart_active').siblings('a').removeClass('amount_chart_active');
		//$('#amountChart1').show().siblings('#amountChart2').hide();
		$('.chart_fat2').hide().siblings('.chart_fat1').show();
		$('.amount_chart_average .amount_chart_text').text('周平均用量: ');
		$('.amount_chart_all .amount_chart_text').text('周总用量: ');
		/* 获取周数据展示 */
		weekChartSearchFn()
	})

	$('.amount_chart_link2').on('click',function(event){
		// stopBubble(event);
		// stopDefault(event);
		$(this).addClass('amount_chart_active').siblings('a').removeClass('amount_chart_active');
		$('.chart_fat1').hide().siblings('.chart_fat2').show();
		$('.amount_chart_average .amount_chart_text').text('月平均用量: ');
		$('.amount_chart_all .amount_chart_text').text('月总用量: ');
		/* 获取月数据展示 */
		monthChartSearchFn();
		/* 切换类别后更新图表 */
		// setTimeout(function(){
		// 	initChart1(2)
		// },300);
	})

}) /*  $(function()) 的结束号*/

/* 切换\添加设备后操作 */
// function switchOrUpdate(type,deviceTypeIndex,detectWeight,systemMealsNum,systemWasteRatio){
// 	let foodActiveIndex1 = $('#foodType .food_active').index(); //已切换设备,剩余量为0
// }

/* 更新后台用餐人数 */
function updateMealsNum(WasteRatio,number){
	//alert('更新后台用餐人数:'+WasteRatio+','+number)
	$.ajax({
		url:'https://192.168.1.55:448/user/updateUserInfo',
		type:'post',
		data:{
			'user_id':userId,
			'waste_rate':WasteRatio,  //首页添加项目没有损耗比率,就默认为0
			'number':number
		},
		dataType:'json',
		success:function(result){
			// console.log('修改用户的用餐人数成功!'+JSON.stringify(result));
		},
		error:function(ero){
			console.log(ero);
		}
	})
}

function nextStepToBind() {
	var obj = $('#addDeviceNext4');
	let personNum = storageObject.localGetItem('personNum');
	//  sendInfoToBL();  不需要发送蓝牙数据
	/* 发送蓝牙数据结束 */

	/* 设置是哪个称 ， 第一个盐左边是 1 ，第二个称右边是 2  */
	var position_text = $('.equipments_active').closest('li').find('.position').text();
	//alert(position_text)
	window.localStorage.setItem('position', position_text);

	$('#newEquipments').hide();
	let addDeviceName = $(obj).parents('.equipments_main').find('.equipments_active').siblings('.equipments_name').text();
	// console.log('addDeviceName:' + addDeviceName);
	// let foodTypeAllArr = foodTypeAll.split('@@');
	// $('#addDevice').show().find('.add_dev_one').hide().next('.add_dev_two').show().find('.add_txt1').text(foodTypeAllArr[0])
	// 	.end()
	// 	.find('.add_txt2').text(foodTypeAllArr[2]).end().find('.add_txt5').text(position_text+'人');
	// $('#addDevice').find('.add_txt4').text(addDeviceName)

	// 如果项目相同，设备项目，就是更新设备项目指标(添加设备最终完成那步)
	//var item_0 = $.trim($('#addType1 .type1_active').text()); // 初始项目
	//var unit0 = $.trim($('#addType2 .type2_active').text()); //初始单位
	//var target0 = $.trim($('.increase_decrease .recommend_bun').val());   //推荐指标暂时不需要
	//$('.add_txt1').text(item_0);
	//$('.add_txt2').text(unit0);
	//$('.add_txt3').text(target0);

	// 首页添加设备填充设备名称
	var name1 = addDeviceName;
	var name2 = $.trim($('.equipments_active').parents('li').find('.position').text());
	if (name2 == '左边') {
		name2 = '左';
	} else if (name2 == '右边') {
		name2 = '右';
	}
	var name = name1 + name2;
	$('.add_txt4').text(name);
	$(".shebeiliebiao_note,.need_add_type_bg").hide(); //设备列表提示隐藏

	// 设备列表的下一步是添加项目弹窗
	$('#addDevice,#addDevice .add_dev_one').show();
	$('#addDevice  .add_dev_two').hide();
}

/* 顶部大类别tab切换 */
function foodTypeTab(userId) {
	var foodType = document.querySelector('#foodType');
	var foodTypeList = foodType.querySelectorAll('li');
	var foodAmount = document.querySelector('#foodAmount');
	var foodAmountList = foodAmount.querySelectorAll('.amount_item');
	for (var i = 0; i < foodTypeList.length; i++) {
		foodTypeList[i].onclick = (function(i) {
			return function() {
				//alert('切换类别的指导重量'+goodsItemIndex)
				goodsItemIndex = i; //全局变量,表示顶部食品大类别的序号
				storageObject.localSetItem('foodItemIndex', goodsItemIndex);
				//alert("食品大类别的序号"+goodsItemIndex);
				addCurClass(foodTypeList, i, 'food_active');
				let item = $.trim($('#foodType .food_active').text());
				storageObject.localSetItem('foodActiveName', item); // 当前被选中的项目
				storageObject.localSetItem('project_select', item);
				addCurClass1(foodAmountList, i);
				// console.log('点击大类别了');
				// console.log('开始进入摄入量读取并赋值数量');
				requestTypeData(i,userId); //获取对应类别的数据
				getActiveDeviceName(foodTypeList[i], goodsItemIndex)
				// console.log(JSON.stringify(foodTypeList[i]))
				autoConnectDevice();
				/* 切换成功后赋值重量单位 */
				let itemUnit = $.trim($('#foodType .food_active').attr('itemunit'));
				if(itemUnit == '克'){
					weightUnit1 = 'g';
					weightUnitE = 49;
				}else{
					weightUnit1 = 'ml';
					weightUnitE = 50;
				}
				$('.shi_unit').text(weightUnit1);
				storageObject.localSetItem('project_unit', itemUnit); // 当前被选中的项目的单位
				/* 切换成功后赋值重量单位 end */
			}
		})(i)
	}
}

function getActiveDeviceName(obj, index) {
	let foodTypeVal = storageObject.localGetItem("foodTypeVal");
	var foodTypeArr = foodTypeVal.split("||");
	$(".amount_item" + (Number(index) + 1)).find(".detect_num3").text(foodTypeArr[index].split("@@")[3]);
}

/* tab切换class */
function addCurClass(obj, index, className) {
	for (var i = 0; i < obj.length; i++) {
		obj[i].classList.remove(className);
	}
	obj[index].classList.add(className);
}

/* tab切换显隐 */
function addCurClass1(foodAmountList, index) {
	for (var i = 0; i < foodAmountList.length; i++) {
		foodAmountList[i].style.display = 'none';
	}
	foodAmountList[index].style.display = 'block';
}



/* 传入摄入量重量和剩余总重量,计算比例和动画效果 */
function ingestDataMethod(guideNum, ingestNum, index) {
	//alert('总重：'+ingestNum+',指导量：'+guideNum)
	//guideNum为指导摄入量,ingestNum摄入量重量,index为类别的序号
	// console.log("ingestNum===" + ingestNum);
	// console.log("指导量 guideNum===" + guideNum);
	// if (guideNum && ingestNum) {
	if (ingestNum) {
		// console.log('摄入量赋值前夕取值 ingestNum ==  ' + ingestNum);
		let amountItemNew = foodAmount.find('.amount_item'); //clone后新的列表

		// 今日共摄入量赋值
		// amountItemNew.eq(index).find('.ingest_today1 .shi_num').text(ingestNum);
		//amountItemNew.eq(index).find('.ingest_today1').find('.shi_num').text(ingestNum);
		// 动画进度条底部数量赋值
		// amountItemNew.eq(index).find('.ingest_num').find('.shi_num').text(ingestNum);

		let ingestRate = 0; //蓝牙获取重量和指导摄入重量的比率
		let ingestRate1 = 0; //ingest_num位置
		let ingestRate2 = 0; //ingest_bg_new高度
		if (ingestNum < parseInt(guideNum) && ingestNum > 0) {  //总重小于指导重量
			//guideNum 为指导摄入量数据
			ingestRate = Math.round((parseInt(ingestNum) / guideNum) * 100); //计算摄入重量比率(四舍五入),
			if (ingestRate < 12) {
				//ingest_bg_new高度最大不能大于92%
				ingestRate2 = 92;
				ingestRate1 = 8;
			} else {
				ingestRate2 = 100 - ingestRate;
				ingestRate1 = ingestRate - 8; //数字位置比ingest_bg_new少8%
			}
		} else if (ingestNum == 0) { //总重等于0
			ingestRate2 = 100;
			ingestRate1 = 0;
		} else { //总重大于指导重量
			ingestRate2 = 0;
			ingestRate1 = 92; //数字位置比ingest_bg_new少8%
		}

		// console.log('总量赋值前夕==' + Number(ingestNum).toFixed(2));
		amountItemNew.eq(index).find('.ingest_today1 .shi_num').text(Number(ingestNum).toFixed(2));
		amountItemNew.eq(index).find('.ingest_num').css('bottom', ingestRate1 + '%');
		amountItemNew.eq(index).find('.ingest_bg').show();
		amountItemNew.eq(index).find('.ingest_bg_new').show().css('height', ingestRate2 + '%');
		// console.log('超过最大摄入量赋值前夕，指标是 guideNum ==' + guideNum);
		if (ingestNum < guideNum) {
			//今日摄入量没有超过指导摄入量
			amountItemNew.eq(index).removeClass('index_exceed');
			amountItemNew.eq(index).find('.ingest_today2').text('指导摄入量还剩');
			// 指导摄入量还剩余赋值
			amountItemNew.eq(index).find('.remain_weight .shi_num').text(Math.abs(guideNum - Number(ingestNum)).toFixed(2));
		} else {
			//超出指导量
			amountItemNew.eq(index).addClass('index_exceed');
			amountItemNew.eq(index).find('.ingest_today2').text('超过最大摄入量');
			// 指导摄入量还剩余赋值
			amountItemNew.eq(index).find('.remain_weight .shi_num').text(Math.abs(guideNum - Number(ingestNum)).toFixed(2));
		}
	}
}

/* 首页顶部动画效果方法 */
function ingestDataMethod1(averageNum,grossNum,index){
	let motherboardList = $('#motherboardList');
	/* 人均重量和总重量的比率 */
	let perCapitaProportion = averageNum/grossNum;
	perCapitaProportion = Math.round(perCapitaProportion*100)/100;
	if(perCapitaProportion > 1){
		perCapitaProportion = 1;
	}
	if(perCapitaProportion < 0){
		perCapitaProportion = 0;
	}
	if(perCapitaProportion > 0.5){ //绿色区域超过一半
		motherboardList.find('.motherboard_item').eq(index).find('.circle_left').css({'transform':'rotate(180deg)','transition':'opacity 0s step-end 1s, transform 1s linear','opacity':'0'});
		motherboardList.find('.motherboard_item').eq(index).find('.circle_right1').css({'transition':'transform ' + ((perCapitaProportion - 0.5) / 0.5) + 's linear 1s','transform':'rotate('+(perCapitaProportion * 300-150)+'deg)'});
		motherboardList.find('.motherboard_item').eq(index).find('.circle_box').css({'transform':'rotate('+(perCapitaProportion * 300+30)+'deg)','transition':'opacity 0s step-end '+(perCapitaProportion * 2)+'s, transform '+(perCapitaProportion * 2)+'s linear'});
	}else{
		motherboardList.find('.motherboard_item').eq(index).find('.circle_left').css({'transform':'rotate('+(perCapitaProportion * 300+30)+'deg)'});
		if(perCapitaProportion==0){
			motherboardList.find('.motherboard_item').eq(index).find('.circle_box').css({'transform':'rotate(26deg)'});
		}else{
			motherboardList.find('.motherboard_item').eq(index).find('.circle_box').css({'transform':'rotate('+(perCapitaProportion * 300+30)+'deg)'});
		}
	}
}

// init();
function init() {  // hasDevice  = 'yes' 有设备的情况下，查找项目和项目数据
	let cookieFoodTypeVal = storageObject.localGetItem('foodTypeVal');
	getEquipmentDataListForUser(userId); //进入首页获取项目列表
	var defaultActive = $("#foodType").find(".food_active");
	// autoConnectDevice(defaultActive);
	var item_length = $.trim($('#foodType').html());
	 // console.log('item_length 个数 == ' + item_length);
}

// 从详情返回首页的时候，展示的是详情页的 用户id 的当前数据
// function detailBackDataShow(){
// 	var url = window.location.href;
// 	var index1 = url.indexOf('?') + 1;
// 	var useId = url.substring(index1,url.length);
// 	console.log('回到首页后，详情返回首页后的用户 useId ==' + useId );
// }

function getEquipmentDataListForUser(user) {  // 进入首页查找项目列表
	//console.log('查询项目接口时候当前用户的user_id ==' + user );
	$.ajax({
		url: 'https://192.168.1.55:448/user/getEquipmentDataList',
		type: 'post',
		data: {
			user_id: user //用户ID
		},
		// async: false,
		dataType: 'json',
		success: function(res) {
			//测试数据
			//res = [{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"esp-2","item":"11","item_value":"糖","mac":"C4:4F:33:6B:0A:87","number":"3","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","target":"0","unit":"49","unit_value":"克","update_time":"2021-01-21 17:16:56.0","user_id":"13"},{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"esp-v3.0.1","item":"1","item_value":"油","mac":"7C:9E:BD:ED:57:7E","number":"3","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","target":"0","unit":"50","unit_value":"毫升","update_time":"2021-01-21 20:16:38.0","user_id":"13"}];
			//res = [{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"","mac":"8C:AA:B5:8B:6B:96","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","update_time":"2020-12-10 18:00:26.0","user_id":"8"},{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"esp-v3.0.1","item":"15","item_value":"盐","mac":"8C:AA:B5:8B:6B:96","name":"esp-v3.0.1","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","target":"0","unit":"50","unit_value":"毫升","update_time":"2020-12-10 18:00:31.0","user_id":"8"},{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"esp-v3.0.1","item":"1","item_value":"油","mac":"8C:AA:B5:8B:6B:96","name":"esp-v3.0.1","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","target":"0","unit":"50","unit_value":"毫升","update_time":"2020-12-10 18:02:01.0","user_id":"8"},{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"esp-v3.0.1","item":"1","item_value":"糖","mac":"8C:AA:B5:8B:6B:96","name":"esp-v3.0.1","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","target":"0","unit":"49","unit_value":"克","update_time":"2020-12-10 18:02:01.0","user_id":"8"},{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"esp-v3.0.1","item":"1","item_value":"味精","mac":"8C:AA:B5:8B:6B:96","name":"esp-v3.0.1","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","target":"0","unit":"49","unit_value":"克","update_time":"2020-12-10 18:02:01.0","user_id":"8"}];
			//alert('刚进入首页获取的用户 '+ user +'的数据是：'+JSON.stringify(res))
			// console.log('刚进入首页获取的用户 '+ user +'的数据是：'+JSON.stringify(res));

			getAllEquipments = res;
			// console.log("后台数据：：：："+JSON.stringify(res))
			var obj = {};
			var peon = res.reduce(function(cur, next) {
				obj[next.mac] ? "" : obj[next.mac] = true && cur.push(next);
				return cur;
			}, []);
			getEquipments = peon;
			var macObj = {};
			if (res && res.length > 0) {
				let resLength = res.length;
				res = res.reverse();  //反转数据数组的顺序. 因为返回的数据是按时间先后排序的,这里要将最新添加的项目放在第一个展示
				//var firstItem = true;
				var forIndex = 0;
				var this_mac_id, this_service_id, this_characteristic_id, this_device_name;
				storageObject.localRemoveItem('foodTypeVal'); //存之前先清除
				var hasItemLenght = 0; //所有数据里有item项目名称的长度,如果没有项目名称的数据不展示
				let thisType = '';
				let thisTypestorage = '';
				var html = '';
				var foodTypeHtml = '';
				let foodTypeCount = 0;
				let allItemArr = [];
				for (var i in res) {
					if (res[i].item) { //如果存在item项目名
						allItemArr.push(res[i].item_value);
						this_mac_id = res[i].mac;
						deviceId = res[i].mac;
						this_person_num = res[i].number;  //用餐人数
						this_waste_num = res[i].target;  //损耗比
						this_service_id = res[i].service_id;
						this_characteristic_id = res[i].characteristic_id;
						this_device_name = res[i].device_name;
						var obj = {};
						obj["service_id"] = this_service_id;
						obj["characteristic_id"] = this_characteristic_id;
						obj["device_name"] = this_device_name;
						macObj[this_mac_id] = obj;
						let amountItem = foodAmount.find('.amount_item');
						var itemPosition = 1;
						//先清空再插入
						$('#motherboardList').html('');
						if (this_mac_id == res[i].mac) {
							if(hasItemLenght == 0){ //第一个项目
								html += '<li class="motherboard_item food_active" itemName="' + res[i].item_value +'" personNum="'+this_person_num+'" wasteRatio="'+this_waste_num+'" itemUnit="' + res[i].unit_value + '" deviceId="'+res[i].mac+
								'" serviceId="'+this_service_id+'" characteristicId="'+this_characteristic_id+'" deviceName="'+this_device_name+'">';

								foodTypeHtml += '<li class="food_item food_active" ' +
									'itemName="' + res[i].item_value + '" personNum="'+this_person_num+'" wasteRatio="'+this_waste_num+'" ' +
									'itemUnit="' + res[i].unit_value + '" ' +
									'itemPosition="' + itemPosition + '" ' +
									'deviceId="' + res[i].mac + '" ' +
									'serviceId="' + this_service_id + '" ' +
									'characteristicId="' + this_characteristic_id + '" ' +
									'deviceName="' + this_device_name + '" >' + res[i].item_value + '</li>'
								amountItem.eq(0).find('.guideIntake').val(res[i].target).end().find('.index_con_box').show().find(
									'.detect_num1').text(res[i].item_value).end().find('.detect_num3').text(res[i].device_name);
								amountItem.eq(0).find('.guideIntake').val(res[i].target).end().find('.index_con_box').show().find('.detect_num1').text(res[i].item_value).end().find('.detect_num3').text(res[i].device_name);
							}else{
								html += '<li class="motherboard_item" itemName="' + res[i].item_value +'" personNum="'+this_person_num+'" wasteRatio="'+this_waste_num+'" itemUnit="' + res[i].unit_value + '" deviceId="'+res[i].mac+
								'" serviceId="'+this_service_id+'" characteristicId="'+this_characteristic_id+'" deviceName="'+this_device_name+'">';

								foodTypeHtml += '<li class="food_item" ' +
									'itemName="' + res[i].item_value + '" personNum="'+this_person_num+'" wasteRatio="'+this_waste_num+'"' +
									'itemUnit="' + res[i].unit_value + '" ' +
									'itemPosition="' + itemPosition + '" ' +
									'deviceId="' + res[i].mac + '" ' +
									'serviceId="' + this_service_id + '" ' +
									'characteristicId="' + this_characteristic_id + '" ' +
									'deviceName="' + this_device_name + '" >' + res[i].item_value + '</li>'
								amountItem.eq(0).find('.guideIntake').val(res[i].target).end().find('.index_con_box').show().find(
									'.detect_num1').text(res[i].item_value).end().find('.detect_num3').text(res[i].device_name);
							}

							html += '<a href="../index/detail.html"><div class="motherboard_first"><div class="motherboard_circle">';
							html += '<div class="circle_left"></div><div class="circle_right circle_right1"></div>';
							html += '<div class="circle-bottom-left"></div><div class="circle-bottom-right"></div>';
							html += '<div class="circle_list"><i></i><i></i><i></i><i></i><i></i><i></i></div></div>';
							html += '<em class="circle_box"><i></i></em><img src="./img/index/shi_in3.png">';
							html += '<div class="motherboard_first_bottom"><span class="first_left_num">0</span>';
							html += '<span class="first_right_num">100</span></div></div>';
							html += '<div class="motherboard_second"><p class="motherboard_name">'+res[i].item_value+'</p>';
							html += '<p class="motherboard_weight"><strong class="shi_num">0</strong><i class="shi_unit">g</i></p>';
							html += '<p class="motherboard_font">今日人均用量</p></div>';
							html += '<div class="motherboard_third"></div></a></li>';
						}
						hasItemLenght++;
						/* 复制amount_item部分内容并添加属性 */
						if (hasItemLenght > 1) {
							foodAmount.append(amountItem.eq(0).clone(true)); //克隆第一条数据,插入到最后
						}
						amountItem.hide();
						let NowAmountItemLength = foodAmount.find('.amount_item').length; //插入克隆数据后总数据的长度,$('#foodAmount>.amount_item')不能替换为amountItem,因为amountItem获取的没有克隆前的数据
						foodAmount.find('.amount_item').eq(NowAmountItemLength - 1).removeClass('amount_item1').addClass('amount_item' +
								NowAmountItemLength).show()
							.find('.guideIntake').val(res[i].target).end()
							.find('.detect_num1').text(res[i].item_value).end()
							.find('.detect_num3').text(res[i].device_name);
						/* 复制amount_item部分内容并添加属性 end */

						/* 拼接类别数据,后面插入本地存储中 */
						let targetVal = 0;
						if (res[i].target) {
							targetVal = res[i].target;
						}
						thisType += '||'+res[i].item_value + '@@' + targetVal + '@@' + res[i].unit_value + '@@' + res[i].device_name + '@@' + res[i].mac +
							'@@' + macObj[res[i].mac].service_id + '@@' + macObj[res[i].mac].characteristic_id;
						// console.log('currentTypes:L:: ' + currentTypes)
						// console.log('thisType:L:: ' + thisType)
						/* 拼接类别数据,后面插入本地存储中 end*/
					}else{
						foodTypeCount++;
					}
				}
				// 全部数据都是没有项目名称,图表展示为空,就不执行下面的代码了
				if(resLength == foodTypeCount){
					nullChart(goodsItemIndex+1,1);
					return false;
				}

				//resLength!=foodTypeCount 表示有项目类别,继续执行下方的代码
				$('#motherboardList').append(html);
				foodType.css('display', 'inline-block').append(foodTypeHtml);
				//将所有的项目类别数据插入本地存储
				let currentTypes = storageObject.localGetItem('foodTypeVal');
				if (currentTypes && currentTypes.length > 0) {
					thisTypestorage = currentTypes + thisType;
				}else{
					thisTypestorage = thisType.substr(2,thisType.length); //去除最前面的||符号
				}
				storageObject.localSetItem('foodTypeVal', thisTypestorage);

				let foodActiveName = storageObject.localGetItem('foodActiveName');
				let itemIndex = allItemArr.indexOf(foodActiveName);  //当前选中项目在所有项目数组里的位置
				if(itemIndex > -1){ //将当前项目的序号赋值给全局变量goodsItemIndex
					goodsItemIndex = itemIndex;
				}

				//有多个数据时,去除左侧的不可点击类名,给右侧赋第二个项目的名称
				if(hasItemLenght > 1){
					if(goodsItemIndex == 0){ //默认选中第一个项目,去除左侧的不可点击类名,给右侧赋第二个项目的名称
						$('#motherboardTop .motherboard_left').removeClass('prohibit_lik');
						let motherboardRight = $.trim($('#motherboardList li').eq(1).find('.motherboard_name').text());
						$('#motherboardTop .motherboard_right .motherboard_item_name').text(motherboardRight);
					}else if (goodsItemIndex == hasItemLenght-1){ //默认选中最后一个项目,去除右侧的不可点击类名,给左侧赋倒数二个项目的名称
						$('#motherboardTop .motherboard_right').removeClass('prohibit_lik');
						let motherboardLeft = $.trim($('#motherboardList li').eq(goodsItemIndex-1).find('.motherboard_name').text());
						$('#motherboardTop .motherboard_left .motherboard_item_name').text(motherboardLeft);
					}else{ //默认选中中间的,去除左、右两侧的不可点击类名,给左、右两侧分别赋项目的名称
						$('#motherboardTop .motherboard_left,#motherboardTop .motherboard_right').removeClass('prohibit_lik');
						let motherboardLeft1 = $.trim($('#motherboardList li').eq(goodsItemIndex-1).find('.motherboard_name').text());
						let motherboardRight1 = $.trim($('#motherboardList li').eq(goodsItemIndex+1).find('.motherboard_name').text());
						$('#motherboardTop .motherboard_left .motherboard_item_name').text(motherboardLeft1);
						$('#motherboardTop .motherboard_right .motherboard_item_name').text(motherboardRight1);
					}
					/* 切换选中项目 */
					$('#motherboardList li').eq(goodsItemIndex).addClass('food_active').siblings().removeClass('food_active');
					let firstItemWidth = $('.motherboard_main1').find('.motherboard_item').eq(0).width();
					$('.motherboard_main1').stop(true).animate({"left": -goodsItemIndex * firstItemWidth},50);

				}

				// $('.ingest_href').attr('href', '../index/detail.html'); //添加跳转连接
				$('.ingest_href').attr('onclick', 'goToDetail('+ user +')'); //添加跳转连接
				foodTypeTab(user); //tab切换方法

				/* 初始化后请求当前选中类别的数据 */
				foodType.find('.food_item').eq(goodsItemIndex).trigger('click');

				getBtnOrWifiData(); // 开始读取蓝牙或者wifi 重量数据
				// requestTypeData(0,user);读取的是蓝牙重量数据接口

				setTimeout(function(){ //更新空的图表
					initChart(goodsItemIndex+1);
				},300);
			} else {  // 如果项目列表为空
				/* 数据为空,此时将图表数据全部置为null展示 */
				nullChart(goodsItemIndex+1,1);
			}
		},
		error: function(error) {
			console.log(error);
			/* 数据为空,此时将图表数据全部置为null展示 */
			nullChart(goodsItemIndex+1,1);
			$('.remaining_weight_txt').text(0+weightUnit);
		}
	})
}

function goToDetail(user) {
	var hasItem = $("#foodType").children('li').length > 0 ? true : false;
	//console.log("goToDetail:" + hasItem)
	if (hasItem) {
		window.location.href = '../index/detail.html?'+user
	} else {
		$(".need_add_type,.need_add_type_bg").show();
	}
}

/* 测试后面要删除 */
// var deVal = '1597386951048_226_0';
// deviceChanges(deVal);

function deviceChanges(deVal,lastDeviceId) {
	//alert("接收到蓝牙数据："+deVal)
	//console.log("接收到蓝牙数据："+deVal);
	if (deVal.indexOf('_') > -1) {} else {
		return false
	}
	//alert('蓝牙传过来的数据是：'+deVal);
	//deVal为蓝牙传的剩余总重量
	let typeName1 = $.trim($('#foodType').find('.food_active').text()); //大类别的名称
	if(!typeName1){ //项目不存在不执行后面的代码
		return false;
	}
	if (deVal) {
		let deviceId = $('#foodType .food_active').attr('deviceId'); //设备ID
		if(deviceId != lastDeviceId){ //是非当前项目绑定设备传过来的数据,不展示
			return false;
		}
		let deValArr = deVal.split('_'); //本次剩余总重量
		let typeArr = $.trim(foodType.find('.food_item').text());
		let mealNumber = storageObject.localGetItem('personNum'); //进餐人数
		if(!mealNumber){
			mealNumber = 1;
		}
		let wasteRatio = storageObject.localGetItem('wasteNum'); //浪费比率
		if(!wasteRatio){ //浪费比率如果本地存储不存在,就用默认值0
			wasteRatio = 0;
		}
		let deviceChangesTime = deValArr[0]; // 当前时间戳,数组第一个值
		//deviceChangesTime = stampToDate(deviceChangesTime); //时间戳转日期
		let switchItem2 = switchItem(typeName1,1); //类别名转为对应的数字
		let typeDensity = switchItem(typeName1,2); //类别对应的密度
		let typeName = 0;
		if(switchItem2 > -1){
			typeName = switchItem2;
		}
		let deviceTypeIndex = parseInt($('#foodType').find('.food_active').index()); //大类别的序号
		//let detectPosition = parseInt(foodAmount.find('.amount_item').eq(deviceTypeIndex).find('.detect_num3').attr('detect-position'));
		let detectName = $.trim(foodType.find('.food_item').eq(deviceTypeIndex).attr('devicename'));
		let detectWeight = 0; //当前重量
		// if (detectPosition == 1) {
		// 	//绑定左边设备,获取数组第二个值
		// 	detectWeight = deValArr[1];
		// } else if (detectPosition == 2) {
		// 	//绑定右边设备,获取数组第三个值
		// 	detectWeight = deValArr[2];
		// }
		detectWeight = parseFloat(deValArr[1]) * parseFloat(typeDensity);
		detectWeight = Math.round(detectWeight*100)/100;
		//alert('deValArr[1]='+deValArr[1]+',typeDensity='+typeDensity+',detectWeight='+detectWeight)
		//console.log('蓝牙传的重量是：' + detectWeight);
		//获取本地存储里上一次传过来的重量,用于和新的重量对比,防止重复传数据到后台
		oldDetectWeight = storageObject.localGetItem('oldDetectWeight');  //session里存储的食品类别信息数据
		oldItem = storageObject.localGetItem('oldItem');
		var res = /^\d+(\.\d+)?$/; //判断是否是数字
		// console.log('33333'+','+oldDetectWeight+','+detectWeight+','+oldItem+','+typeName);

		//如果重量是非数字、0,null,undefined不对后台存储
		if (!res.test(detectWeight) || parseInt(detectWeight) == 0) {
			$('#remain').text(0);
			return false;
		}else if(oldDetectWeight && (parseFloat(oldDetectWeight) == parseFloat(detectWeight)) && (oldItem == typeName)){ //旧的重量存在
			//console.log('本次称重和上一次称重的数据相同,重量是：'+detectWeight+',项目名是：'+typeName, "oldDetectWeight::"+oldDetectWeight)
			// 新重量、项目名和旧重量、项目名相同,不对后台存储
			$('#remain').text(parseFloat(detectWeight));
			return false;
		} else {
			//console.log('插入后台数据是：'+oldDetectWeight+',蓝牙传的shuju是：' + typeName+'：'+detectWeight)
			//oldDetectWeight = detectWeight;
			storageObject.localSetItem('oldDetectWeight',detectWeight);  //将本地最新的称重重量存到本地存储里,用于下次判断用
			storageObject.localSetItem('oldItem',typeName);
			if (!deviceId) {
				alert('设备号为null');
			}

			//console.log('旧的重量' + oldDetectWeight)
			chuanCount++;
			//console.log('新的重量' + detectWeight)
			//console.log('往后传了' + chuanCount + '次');
			//console.log('网后台传的数据是：' + deviceId + ',' + userId + ',' + mealNumber +',' + wasteRatio +',' + typeName + ',' + detectName + ',' + detectWeight + ',' +deviceChangesTime);
			let deviceChangesTime2 = deviceChangesTime.substr(0, deviceChangesTime.length - 3);
			//alert('传给后台的时间是：'+stampToDate(deviceChangesTime2));
			// deviceChangesTime = parseInt(deviceChangesTime) + 406493000;
			deviceChangesTime = parseInt(deviceChangesTime)
			//console.log('111' + deviceChangesTime);
			// 当前剩余量赋值
			//foodAmount.find('.amount_item' + (deviceTypeIndex+1)).find('.detect_num2 .shi_num').text(parseInt(detectWeight));

			/* 存重量数据到后台 */
			//alert('网后台传的数据是：'+ deviceId+','+ userId+','+ typeName+','+ detectName+','+wasteRatio+','+mealNumber+','+ detectWeight+','+ deviceChangesTime)
			$.ajax({
				url: 'https://192.168.1.55:448/user/weighingDataInsertSf',   // 存储读取到的重量数据传递给后台
				type: 'post',
				data: {
					mac: deviceId, //设备id
					user_id: userId, //用户id
					item: typeName, //大类别名
					type: 2, // 2代表设备数据,1代表手动输入数据
					name: detectName, //设备名称
					weight: detectWeight, //重量
					unit: weightUnitE, //单位
					waste_rate: wasteRatio, //浪费比率
					number: mealNumber, //进餐人数
					create_time: deviceChangesTime //时间戳
				},
				dataType: 'json',
				success: function(result) {
					var result5 = JSON.stringify(result);
					//alert(result5)
					//console.log('成功传递到后台的时间戳' + deviceChangesTime);
					//console.log('蓝牙传值保存到后台成功返回的数据是：' + result5);
					/* 每次传到后台成功后都要刷新一下,展示当天总摄入量 */
					// 调用蓝牙重量数据接口  https://192.168.1.55:448/user/getWeightingDataCalculateList
					requestTypeData(deviceTypeIndex,userId); // 调用蓝牙数据接口，读取后台蓝牙重量数据并赋值

				},
				error: function(error) {
					var str = JSON.stringify(error);
					console.log(str)
				}
			})
		}
	}
}


/* 获取tab切换对应类别的数据 */
//requestTypeData(1);
function requestTypeData(i,userId) {  // 获取项目对应的数据
	let item2 = $.trim(foodType.find('.food_item').eq(i).text());
	let switchItem3 = switchItem(item2,1); //类别名转为对应的数字
	if(switchItem3 > -1){
		item = switchItem3;
	}
	/* 先判断本地存储里当前序号对应的大类别的数据 */
	let resultTypeData = storageObject.localGetItem("indexTypeData-" + goodsItemIndex);

	systemMealsNum = $.trim($('#motherboardList .food_active').attr('personnum'));   //用餐人数
	systemWasteRatio = $.trim($('#motherboardList .food_active').attr('wasteratio'));  //损耗比率
	storageObject.localSetItem('personNum', parseInt(systemMealsNum)); //用餐人数存到本地存储里
	storageObject.localSetItem('wasteNum', parseInt(systemWasteRatio)); //损耗比率存到本地存储里
	//alert('刚进入首页存：'+systemMealsNum+','+systemWasteRatio)
	//foodAmount.find('.amount_item' + (goodsItemIndex+1)).find('.index_num1').text(systemMealsNum);
	//foodAmount.find('.amount_item' + (goodsItemIndex+1)).find('.index_rate').text(systemWasteRatio);

	/* 测试用,获取类别数据展示方法 */
	// let result1 = [];
	// let result1 = [{"flag_type":0,"format_time":"2020-12-29 16:08","id":6621,"number":4,"type":"1","waste_rate":"11","weight":"5"},{"flag_type":0,"format_time":"2020-12-29 16:36","id":6624,"number":4,"type":"1","waste_rate":"11","weight":"5"}];
	// CategoryDataRevealFn1(result1,goodsItemIndex);
	// foodTypeTab(13);

	let startTime5 = year + '-' + month + '-' + day + ' 00:00:00'
	let endTime5 = year + '-' + month + '-' + day + ' 23:59:00'
	//alert('要传递的参数是:' + userId + ',' + item + ',' + startTime5)
	if (item) {
		$.ajax({
			// url: 'https://192.168.1.55:448/user/getWeightingDataListByYMWD',
			url: 'https://192.168.1.55:448/user/getWeightingDataCalculateList',  // 蓝牙接口查询数据
			type: 'post',
			data: {
				user_id: userId, //用户ID
				item: item, //食物大类别
				flag_type: 1, // 设备数据还是手动添加的数据
				start_time: startTime5, //查询开始时间
				end_time: endTime5 //查询结束时间
			},
			// async: false,
			dataType: 'json',
			success: function(result1) {
				firstCheckFlag = true;
				//console.log('查询用户'+ userId +'的日重量的日期' + startTime5 + '==,==' + endTime5);
				//console.log('查询用户'+ userId +'的所有重量数据==' + JSON.stringify(result1));

				//alert("获取tab切换对应类别的数据"+JSON.stringify(result1));
				// console.log("获取tab切换对应类别的数据"+JSON.stringify(result1));
				if (result1.length > 0) {
					//console.log('查询'+ userId +'日重量的日期后的数据 > 0 ==' + result1.length );
					//获取数据展示
					CategoryDataRevealFn1(result1, goodsItemIndex);
				} else { //没有数据展示为空
					//console.log('查询'+ userId +'日重量的日期后的数据为空==' + result1.length );
					//var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">暂且没有相关数据</div>';
					/* 没有数据都置为0 */
					$('.motherboard_bottom .motherboard_num_today .shi_num').text(0);
					$('#motherboardList .motherboard_item').eq(goodsItemIndex).find('.motherboard_weight .shi_num').text(0);
					$('#remain').text(0);
				}
				/* 当日数据为空,但本周其他日期有可能有数据,所以要获取本周的数据展示 */
				weekChartSearchFn();

				/* 如果有数据了，再自动重连开始 */
				autoConnectDevice(); //默认点击第一个项目li 因为goodsItemIndex ==0
				/* 如果有数据了，再自动重连结束 */
			},
			error: function(error) {
				//console.log(error);
				var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>';
				//typeCorrespondDetail.find('.type_item'+goodsItemIndex).find(".swiper_new_chart").html(errorHTML);
			}
		})
	}

}

/* 获取类别数据展示方法 */
function CategoryDataRevealFn(data, index_i) {
	storageObject.localSetItem('indexTypeData-' + index_i, JSON.stringify(data)); //将当前大类别的数据存到本地存储里
	// data = JSON.stringify(data);

	let avgWeight = 0; //累计摄入总重量
	// for (let i = 0; i < data.length; i++) {
	// 	avgWeight += parseFloat(data[i].weight);
	// }
	/* 2020.10.30  开始   重新计算总计摄入量和剩余摄入量  */
	var arr = [];
	for (var i = 0; i < data.length; i++) {
		arr.push(data[i]);
	}

	// 2020.11.9 赋值计算开始
	// console.log('查询日重量后新数组 == 类型 = ' + typeof(arr) + '=+ 数据 == ' + arr);
	// sortArr(arr, 'type'); // 第一次分组，按照 type 分组 （手动还是蓝牙数据）
	var lyArr = [];
	var newArr = [];

	sortArr(arr, 'type'); // 第一次分组 ，按照 type 类型

	// console.log(newArr);
	var sdArr = [];
	var sdWeight = 0;

	if (newArr[0][0].type == '1') { // 如果 第一组是 手动

		for (var s = 0; s < newArr[0].length; s++) {
			sdArr.push(newArr[0][s].weight);
		}
		if(newArr[1]){
			lyArr = newArr[1];
		}

	} else { // 如果 第二组是 手动
		// console.log('如果是手动输入');
		if(newArr[1]){
			for (var s = 0; s < newArr[1].length; s++) {

				sdArr.push(newArr[1][s].weight);
			}
		}

		lyArr = newArr[0];
	}

	//console.log('sdArr1==' + sdArr);
	$.each(sdArr, function(index, item) {

		sdWeight += Number(item);
	})

	 //console.log('sdWeight1 ==' + sdWeight); //  计算手动平均值总和

	// 新计算结束

	// 计算 蓝牙平局值总和 ，拿到蓝牙数据是 lyArr,然后按照人数划分

	// console.log(lyArr); //

	var lyArr2 = [];
	sortArr(lyArr, 'number'); //  进行第2次分组，按照人数划分
	var dValueArAll = [];
	var ArrTotalWeight = 0;
	//console.log('蓝牙数据分组后 lyArr2 ==' +  JSON.stringify(lyArr2));

	for (var j = 0; j < lyArr2.length; j++) {
		var ArrJ = lyArr2[j];
		var dValueArr = [];
		for (var k = 0; k < (ArrJ.length - 1); k++) {
			//console.log('Number(ArrJ[k].weight) == ' + Number(ArrJ[k].weight));
			//console.log('Number(ArrJ[k + 1].weight) == ' + Number(ArrJ[k + 1].weight));
			var dValue = Number(ArrJ[k].weight) - Number(ArrJ[k + 1].weight);
			// console.log('分解后最终的数组元素的对象重量差dValue == ' + dValue);
			if (dValue > 0) {
				dValueArr.push(dValue);
				// console.log('分解后最终的数组元素的对象重量差数组 + dValueArr == ' + dValueArr);
				var dValueSum = 0;
				for (d = 0; d < dValueArr.length; d++) {
					dValueSum += Number(dValueArr[d]);
					// console.log('计算的最终和是' + dValueSum);
				}
				var arrTotalWeight = Number(dValueSum) * (1 - (Number(ArrJ[k].waste_rate) / 100)) / (Number(ArrJ[k].number)); // 每个数组的元素对象的差值和 *(1-浪费比率)/人数

			}
		}
		// console.log('arrTotalWeight + Number === ' + arrTotalWeight );
		if (arrTotalWeight) {
			dValueArAll.push(arrTotalWeight);
		}

	}
	var tSum = 0;
	//console.log('dValueArAll.length==' + dValueArAll.length);
	//console.log('dValueArAll==' + dValueArAll);
	for (var t = 0; t < dValueArAll.length; t++) {
		// console.log('dValueArAll[t]' + dValueArAll[t]);
		tSum += Number(dValueArAll[t]);
	}
	var shi_num = Number(tSum).toFixed(2);
	var sd_num = Number(sdWeight).toFixed();
	// var remain_weight = shi_num  -  '指标数量' ;
	//console.log('tSum摄入量总和 ==' + shi_num); // 计算的是蓝牙数据的平均值
	//console.log('手动平均值和 == ' + sd_num); // 计算的是手动数据的平均值
	avgWeight = Number(shi_num) + Number(sd_num);

	//console.log('平均摄入量和avgWeight ==' + avgWeight);
	// 2020.11.9 赋值结束

	//  将数组中具有相同值的对象 取出组成新的数组
	function sortArr(arr, str) {
		if(str == 'type'){
			//console.log('Type进入分组函数的数据 == ' + JSON.stringify(arr));
			//console.log('Type进入分组函数的数据长度 == ' + arr.length);
		}else if(str == 'number'){
			//console.log('number进入分组函数的数据 == ' + JSON.stringify(arr));
			//console.log('number进入分组函数的数据长度 == ' + arr.length);
		}

		var _arr = [],
			_t = [],
			// 临时的变量
			_tmp;

		// 按照特定的参数将数组排序将具有相同值得排在一起
		arr = arr.sort(function(a, b) {
			var s = a[str],
				t = b[str];

			return s < t ? -1 : 1;
		});

		if (arr.length) {

			_tmp = arr[0][str];
		}
		// console.log( arr );
		// 将相同类别的对象添加到统一个数组
		for (var i in arr) {
			// console.log( _tmp);
			if (arr[i][str] === _tmp) {
				// console.log(_tmp);
				_t.push(arr[i]);
			} else {
				_tmp = arr[i][str];
				_arr.push(_t);
				_t = [arr[i]];
			}
		}

		// 将最后的内容推出新数组
		_arr.push(_t);
		// return _arr;
		// console.log('分解后最终的数组是' + _arr);

		if(str == 'type'){
			newArr = _arr; // 第一次 type 分类后的新数组
		}
		if(str == 'number'){
			lyArr2 = _arr; // 第二次 number 分类后的新数组
		}

	}

	/* 2020.10.30  结束   重新计算总计摄入量和剩余摄入量  */

	var guideIntake1 = foodAmount.find('.amount_item').eq(index_i).find('.guideIntake').val();
	if (guideIntake1) {
		guideIntake = guideIntake1;
	}
	//alert('指导重量为：'+guideIntake+','+avgWeight);

	/* 计算比例和动画效果 */

	ingestDataMethod(guideIntake, avgWeight, index_i);
}

function CategoryDataRevealFn1(data, index_i){
	// console.log('查询数据是：'+JSON.stringify(data)+','+index_i)
	if(data){
		deviceAllWeight = 0;
		let todayUsageIndex = 0; //todayUsageWeightArr每一餐使用量数组的序号
		let amountItemNew = foodAmount.find('.amount_item'); //clone后新的列表
		/* 处理拼接数据数组开始 */
		var deviceWeightList = []; //蓝牙设备重量列表
		var manualWeightList = []; //手动输入重量列表
		for(var i=0;i<data.length;i++){
			if(data[i].type == 2){ //蓝牙设备重量
				deviceWeightList.push(data[i]);
			}else if(data[i].type == 1){ //手动输入重量
				manualWeightList.push(data[i]);
			}
		}
		//蓝牙和手动数据都不存在,没有数据,要不显示chart,清除隐藏域的数据
		if((deviceWeightList.length<1) && (manualWeightList.length<1)){
			storageObject.localRemoveItem('personNum'); //人数
			storageObject.localRemoveItem('wasteNum'); //浪费比率
			foodAmount.find('.amount_item').eq(index_i).find('.motherboard_num .shi_num').text(0);
			//foodAmount.find('.amount_item').eq(index_i).find('.index_num1').text(0);
			//foodAmount.find('.amount_item').eq(index_i).find('.index_rate').text(0);
			//foodAmount.find('.amount_item').eq(index_i).find('.amount_chart').hide(); //隐藏chart
			return false;
		}

		/*处理蓝牙列表数据*/
		arrangeDeviceData(deviceWeightList);
		/*处理手动输入列表数据*/
		arrangeManualData(manualWeightList);
		/* 处理拼接数据数组结束 */
		/* 剩余总重量赋值 */
		if(deviceWeightList.length > 0){
			let remainWeight = deviceWeightList[deviceWeightList.length-1].weight;
			$('#remain').text(remainWeight);
		}
		arrangeAllArr = arrangeDeviceArr.concat(arrangeManualArr);  //整合两个数组
		if(arrangeAllArr && arrangeAllArr.length>0){
			weekTime = []; //清空数组
			manArr = [];
			weekWeight = [];
			// let xAxisArr = []; //所有时间没有排序前的数组
			// let deviceXArr = []; //设备时间数组
			// let capitaXArr = []; //手动输入时间数组
			// let deviceOrcapitaArr = [];
			// for(let i=0;i<arrangeAllArr.length;i++){
			// 	/* 图表部分*/
			// 	let format_time = arrangeAllArr[i].format_time;
			// 	if(format_time){
			// 		format_time = format_time.substr(format_time.length-5,format_time.length-1);
			// 	}
			// 	xAxisArr.push(format_time); //记录数据里的时间,后面排序用
			// 	weekTime.push(format_time); //图表时间
			// 	weekTime.sort(function(a,b){ //图表时间排序
			// 		return a > b ? 1 : -1
			// 	})
			// 	let mealTimeIndex = weekTime.indexOf(format_time); //查询新增的时间在数组里的位置
			// 	let mealAvgWeight = parseFloat(arrangeAllArr[i].avg_weight);

			// 	if(arrangeAllArr[i].type == 1){ //type等于1是手动输入数据,manArr插入重量数据,weekWeight插入0
			// 		capitaXArr.push(format_time);
			// 		manArr.splice(mealTimeIndex,0,(mealAvgWeight).toFixed(2));  //手动输入数组添加重量数据
			// 		weekWeight.splice(mealTimeIndex,0,0);  //设备获取数据数组添加0

			// 	}else if(arrangeAllArr[i].type == 2){ //type等于2是设备传的数据,manArr插入0,weekWeight插入重量数据
			// 		deviceXArr.push(format_time);
			// 		manArr.splice(mealTimeIndex,0,0);  //手动输入数组添加0
			// 		weekWeight.splice(mealTimeIndex,0,todayUsageWeightArr[todayUsageIndex]);
			// 		//weekWeight.splice(mealTimeIndex,0,(mealAvgWeight).toFixed(2));  //设备获取数据数组添加重量数据
			// 		todayUsageIndex++;
			// 	}
			// }

			initAllWeight = parseFloat(data[0].weight); //将第一次称重的数据作为总重量
			/* 计算的称重总重量 */
			deviceAllWeight = Math.round(deviceAllWeight*100)/100;
			//foodAmount.find('.amount_item').eq(index_i).find('.ingest_num .shi_num').text(deviceAllWeight);
			$('.motherboard_bottom .motherboard_num_today .shi_num').text(deviceAllWeight);
			//今日共摄入量赋值,将今日使用总量和罐内总重量当做参数传入计算,暂时不要此方法(首页改版)
			//ingestDataMethod(initAllWeight,deviceAllWeight,index_i);

			//计算人均摄入量,赋值给dayTotalIntake全局变量
			dayTotalIntake = thatDayManualCumulativeIntake + thatDayDeviceCumulativeIntake;
			dayTotalIntake = Math.round(dayTotalIntake*100)/100;
			//alert('计算新的人均总重是：'+deviceAllWeight+','+dayTotalIntake)

			//foodAmount.find('.amount_item').eq(index_i).find('.index_weight').text(dayTotalIntake);
			motherboardTop.find('.motherboard_item').eq(index_i).find('.motherboard_weight .shi_num').text(dayTotalIntake);

			//今日共摄入量赋值,将今日人均用量和今日总使用量当做参数传入计算,制作顶部动画
			//console.log('计算新的人均总重是：'+deviceAllWeight+','+dayTotalIntake+','+index_i)
			ingestDataMethod1(dayTotalIntake,deviceAllWeight,index_i);
			//循环展示每一餐的使用重量
			// let todayUsageHtml = '';
			// if(todayUsageWeightArr.length>1){
			// 	for(let o=0;o<todayUsageWeightArr.length;o++){
			// 		let formatTime = todayUsageTimeArr[o];
			// 		if(formatTime){
			// 			formatTime = formatTime.substr(formatTime.length-5,formatTime.length-1);
			// 		}
			// 		weekTime.push(formatTime);
			// 		weekWeight.push(todayUsageWeightArr[o]);
			// 		todayUsageHtml += todayUsageWeightArr[o]+'+';
			// 	}
			// 	todayUsageHtml = todayUsageHtml.substr(0,todayUsageHtml.length-1); //去除最后的加号
			// 	todayUsageHtml += '='+ deviceAllWeight + weightUnit;
			// }else{ //只有一个重量
			// 	todayUsageHtml = deviceAllWeight + weightUnit;
			// }
			// foodAmount.find('.amount_item').eq(index_i).find('.remaining_weight_txt').text(todayUsageHtml);

			/* 切换成功后赋值重量单位 */
			let itemUnit = $.trim($('#motherboardList .food_active').attr('itemunit'));
			if(itemUnit == '克'){
				weightUnit1 = 'g';
				weightUnitE = 49;
			}else{
				weightUnit1 = 'ml';
				weightUnitE = 50;
			}
			$('.shi_unit').text(weightUnit1);
			storageObject.localSetItem('project_unit', itemUnit); // 当前被选中的项目的单位
			/* 切换成功后赋值重量单位 end */

			//网后台传当前项目的当天的人均用量(dayTotalIntake),总摄入量(deviceAllWeight),最近一次称重的时间(lastWeighingTime).供后面月轴图表使用
			weekOrMonthChartInsertFn(dayTotalIntake,deviceAllWeight);

		}else{ //数据为null,可能是全部删除了,要将人均列表、总重等信息置0,本地存储清除
			/* 显示一个空表 */
			nullChart(goodsItemIndex+1,1);
		}
	}
}

/* 获取到当前项目近日人均用量(avgWeight),总重(grossWeight),最近一次称重时间(lastWeighingTime)后传到后台保存 */
function weekOrMonthChartInsertFn(avgWeight,grossWeight){
	//item = 15;
	let lastWeighingTime = year + '-' + month + '-' + day; //时间就传年月日的形式
	let deviceName1 = $.trim($('#motherboardList .food_active').attr('deviceName'));
	//alert('查询周月数据传给后台的参数是：'+userId+','+deviceId+','+deviceName1+','+item+','+avgWeight+','+grossWeight+','+lastWeighingTime);
	if(!item){  //当没有项目时,展示一个空表,不往后台存储数据
		nullChart(goodsItemIndex+1,1);
		return false;
	}
	$.ajax({
		url: 'https://192.168.1.55:448/user/weightAvgAdd',
		type: 'post',
		data: {
			'user_id': userId, //用户ID
			'mac': deviceId, //设备ID
			'name':deviceName1, //设备名称
			'item': item,  //食物大类别
			'weight_avg':avgWeight,	 //人均使用量
			'weight_avg_sum':grossWeight, //总重
			'unit':weightUnitE,  //单位
			'create_time': lastWeighingTime  //称重时间,只需要年月日
		},
		dataType: 'json',
		success: function(result3) {
			//console.log('插入周月数据到后台成功'+JSON.stringify(result3));
			/* 往后台存储成功后获取本周的所有数据 */
			weekChartSearchFn();
		},
		error: function(error) {
			console.log('插入周月数据到后台失败');
			//var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>';
			/* 报错了显示一个空表 */
			nullChart(goodsItemIndex+1,1);
		}
	})
}

//weekChartSearchFn();
/* 获取本周的人均用量,总用量的所有数据,在图表里展示 */
function weekChartSearchFn(){
	let weekTodayTime2 = year+month+day; //当天日期,20201211
	var lastDate = dealTime(0, weekTodayTime2);  //本周的最后一天的日期
	var firstDate = dealTime(1, weekTodayTime2);  //本周的第一天的日期
	//item = 15;
	// deviceId = '8C:AA:B5:8B:6B:96';

	if(!item){  //当没有项目时,展示一个空表,不执行获取周数据得方法
		nullChart(goodsItemIndex+1,1);
		return false;
	}

	console.log('查询周数据传给后台的参数是：'+userId+','+deviceId+','+item+','+firstDate+','+lastDate);
	$.ajax({
		url: 'https://192.168.1.55:448/user/getWeightingDataAvgListByYMWD',
		type: 'post',
		data: {
			'user_id': userId, //用户ID
			'mac': deviceId,
			'item': item, //食物大类别
			'flag_type':1, //flag_type为1代表获取的是周的数据
			'start_time': firstDate, //查询开始时间
			'end_time': lastDate //查询结束时间
		},
		dataType: 'json',
		success: function(result2) {
			//alert('获取到所有的周数据是：' + JSON.stringify(result2))
			console.log('获取到所有的周数据是：' + JSON.stringify(result2));
			//result2 = [{"flag_type":0,"format_time":"2020-12-07","id":0,"item":"15","weight_avg":"40","weight_avg_sum":"100"},{"flag_type":0,"format_time":"2020-12-08","id":0,"item":"15","weight_avg":"23.25","weight_avg_sum":"98"},{"flag_type":0,"format_time":"2020-12-09","id":0,"item":"15","weight_avg":"16","weight_avg_sum":"78"},{"flag_type":0,"format_time":"2020-12-10","id":0,"item":"15","weight_avg":"17","weight_avg_sum":"78.5"},{"flag_type":0,"format_time":"2020-12-11","id":0,"item":"15","weight_avg":"10","weight_avg_sum":"50"},{"flag_type":0,"format_time":"2020-12-12","id":0,"item":"15","weight_avg":"11.35","weight_avg_sum":"39"},{"flag_type":0,"format_time":"2020-12-13","id":0,"item":"15","weight_avg":"13.54","weight_avg_sum":"69"}];
			if(result2 && result2.length>0){
				/* 先清空数组 */
				weekWeight = [];
				weekTimeArr = [];
				weekTimeArr =  daysOfThisWeek(); //获取一周七天具体的日期
				let resultDataTimeArr = [];
				/* 将获取的周数据的日期存到数组里,下面对比数组 */
				for(let j=0;j<result2.length;j++){
					let resultTime = result2[j].format_time;
					resultDataTimeArr.push(resultTime);
				}
				/* 判断当前一周的每一天在返回的数据里是否存在,存在就有数据,不存在就没有数据(置0) */
				let weekWeighingAverage = 0;
				let weekWeighingAll = 0;
				for(let k=0;k<7;k++){
					let weekTodayTime = weekTimeArr[k];
					let weekTodayTimeIndex = $.inArray(weekTodayTime,resultDataTimeArr);
					if(weekTodayTimeIndex > -1){ //返回的数据里存在weekTimeArr[k]天的数据,将数据存到图表X数据数组weekWeight里
						let weekAverage = parseFloat(result2[weekTodayTimeIndex].weight_avg);
						weekAverage = Math.round(weekAverage*100)/100;
						weekWeight.push(weekAverage);
						weekWeighingAverage += parseFloat(weekAverage); //周平均用量
						weekWeighingAll += parseFloat(result2[weekTodayTimeIndex].weight_avg_sum); //周总用量
					}else{ //不存在,就插入0,不计算重量
						weekWeight.push(0);
					}
				}
				weekWeighingAverage = Math.round(weekWeighingAverage*100)/100;
				weekWeighingAll = Math.round(weekWeighingAll*100)/100;
				$('.weighing_average_num .shi_num').text(weekWeighingAverage);
				$('.weighing_all_num .shi_num').text(weekWeighingAll);

			}else{ //没有数据展示为空
				$('.weighing_average_num .shi_num').text(0);
				$('.weighing_all_num .shi_num').text(0);
				weekWeight = [0,0,0,0,0,0,0];
				monthWeight = [0,0,0,0,0];
			}
			/* 更新空的图表,先置更新周表,月表等点击按钮再执行*/
			setTimeout(function(){
				initChart(goodsItemIndex+1);
			},300);
		},
		error: function(error) {
			console.log('周报错');
			//var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>';
			/* 报错了显示一个空表 */
			nullChart(goodsItemIndex+1,1);
		}
	})
}

//monthChartSearchFn();
/* 获取本月的人均用量,总用量的所有数据,在图表里展示 */
function monthChartSearchFn(){
	let startTime2 = year + '-' + month + '-' + '01';
	let daysPerMonthnew = new Date(year,month,0).getDate();  //每月对应的天数,2020年2月是29天
	let endTime2 = year + '-' + month + '-' + daysPerMonthnew;
	//item = 15;
	// deviceId = '8C:AA:B5:8B:6B:96';
	if(!item){  //当没有项目时,展示一个空表,不执行获取月数据得方法
		nullChart(goodsItemIndex+1,2);
		return false;
	}

	//alert('查询月数据传给后台的参数是：'+userId+','+deviceId+','+item+','+startTime2+','+endTime2);
	$.ajax({
		url: 'https://192.168.1.55:448/user/getWeightingDataAvgListByYMWD',
		type: 'post',
		data: {
			'user_id': userId, //用户ID
			'mac': deviceId,
			'item': item, //食物大类别
			'flag_type':2, //flag_type为2代表获取的是月的数据
			'start_time': startTime2, //查询开始时间
			'end_time': endTime2 //查询结束时间
		},
		dataType: 'json',
		success: function(result4) {
			//alert('获取到所有的月数据是：' + JSON.stringify(result4))
			//console.log('获取到所有的月数据是：' + JSON.stringify(result4));
			//result4 = [{"create_time":"2020-12-09 17:44","del_status":"0","id":5044,"item":"15","item_value":"盐","mac":"8C:AA:B5:8B:6B:96","name":"","unit":"50","unit_value":"毫升","user_id":"8","weight_avg":"293.26","weight_avg_sum":"599"},{"create_time":"2020-12-09 08:49:59","del_status":"0","id":5030,"item":"15","item_value":"盐","mac":"8C:AA:B5:8B:6B:96","name":"","unit":"50","unit_value":"毫升","user_id":"8","weight_avg":"200","weight_avg_sum":"200"}];
			if(result4 && result4.length>0){
				/* 判断当前月的每一周在返回的数据里是否存在,存在就有数据,不存在就没有数据(置0) */
				let monthWeighingAverage = 0;
				let monthWeighingAll = 0;
				/* 将获取的月数据的日期存到数组里,下面对比数组 */
				for(let j=0;j<result4.length;j++){
					let resultTime = result4[j].end_week; //获取每个周日那天的日期
					if(resultTime.length > 14){ //时间带小时
						resultTime = resultTime.substring(0,10); //只需要年月日
					}
					let resultTime1 = resultTime.split('-')[2]; //获取日期
					let weekNum1 = getMonthWeek(year,month,resultTime1).getWeek; //如果是12月的第一周,weekNum1值就等于1
					let weekNumAvgWeight = result4[j].weight_avg; //一周的人均重量
					weekNumAvgWeight = Math.round(weekNumAvgWeight*100)/100;
					monthWeight[weekNum1-1] = weekNumAvgWeight; //替换原来月人均重量数组里对应位置的数据
					monthWeighingAverage += parseFloat(weekNumAvgWeight); //周平均用量
					monthWeighingAll += parseFloat(result4[j].weight_avg_sum); //周总用量
				}
				monthWeighingAverage = Math.round(monthWeighingAverage*100)/100;
				monthWeighingAll = Math.round(monthWeighingAll*100)/100;
				$('.weighing_average_num .shi_num').text(monthWeighingAverage);
				$('.weighing_all_num .shi_num').text(monthWeighingAll);
			}else{
				$('.weighing_average_num .shi_num').text(0);
				$('.weighing_all_num .shi_num').text(0);
				weekWeight = [0,0,0,0,0,0,0];
				monthWeight = [0,0,0,0,0];
			}

			/* 更新空的图表,先置更新周表,月表等点击按钮再执行*/
			setTimeout(function(){
				initChart1(goodsItemIndex+1);
			},300);
		},
		error: function(error) {
			//alert('月报错');
			console.log('月报错')
			//var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>';
			/* 报错了显示一个空表 */
			nullChart(goodsItemIndex+1,2);
		}
	})

}

/* 当报错或者数据为空,显示一个空表 */
function nullChart(index,type){ //index代表项目序号,type代表是周表还是月表
	$('.weighing_average_num .shi_num').text(0);
	$('.weighing_all_num .shi_num').text(0);
	weekWeight = [0,0,0,0,0,0,0];
	monthWeight = [0,0,0,0,0];
	if(type == 1){ //type等于1,表示是周表
		/* 更新空的图表,先置更新周表,月表等点击按钮再执行*/
		setTimeout(function(){
			initChart(index);
		},300);
	}else{ //type不等于1,表示是月表
		/* 更新空的图表,先置更新周表,月表等点击按钮再执行*/
		setTimeout(function(){
			initChart1(index);
		},300);
	}
}

/* 获取当前日期一周的具体时间数组 */
function daysOfThisWeek(){
	let dateOfToday = Date.now()
	let dayOfToday = (new Date().getDay() + 7 - 1) % 7
	let timeArr = [];
	for(i=0;i<7;i++){
		let date = new Date(dateOfToday + (i - dayOfToday) * 1000 * 60 * 60 * 24);
		let todayDate = date.getFullYear() + '-' +String(date.getMonth() + 1).padStart(2, '0') +'-' +String(date.getDate()).padStart(2, '0');
		timeArr.push(todayDate);
	}
	return timeArr;
}

/* 获取当前时间是本月第几周 */
function getMonthWeek (a, b, c) {
	/**
	* a = d = 当前日期
	* b = 6 - w = 当前周的还有几天过完(不算今天)
	* a + b 的和在除以7 就是当天是当前月份的第几周
	*/
	var date = new Date(a, parseInt(b) - 1, c),
		w = date.getDay(),
		d = date.getDate();
	if(w==0){
		w=7;
	}
	var config={
		getMonth:date.getMonth()+1,
		getYear:date.getFullYear(),
		getWeek:Math.ceil((d + 6 - w) / 7),
	}
	return config;
};

/*将蓝牙设备重量列表数据转化成CategoryDataRevealFn1需要的数据格式*/
function arrangeDeviceData(deviceData1){
	let deviceDataA = $.extend(true, [], deviceData1);
	let deviceDataB = $.extend(true, [], deviceData1);
	thatDayDeviceCumulativeIntake = 0; //当日蓝牙设备人均摄入量总和先置0
	deviceAllWeight = 0; //总重量要清零
	arrangeDeviceArr = []; //刚进入前先清空数据
	var formatTimeHourArr = []; //存放某一个小时内的所有数据
	var formatTimeOrNumArr = []; //存放根据时间、人数分类号的所有数据

	for(let j=0;j<deviceDataA.length;j++){
		let formatTimeHourStr = ''; //记录某一时间段内的序号,拼接成字符串
		let formatTimeHour = deviceDataA[j].format_time;
		if(formatTimeHour && formatTimeHour != -1){
			formatTimeHour = formatTimeHour.replace(/-/g,"/")
			let formatTimeHour1 = new Date(formatTimeHour).getTime(); //时间戳
			for(let k=0;k<deviceDataB.length;k++){
				let nextFormatTimeHour = deviceDataB[k].format_time;
				if(nextFormatTimeHour && nextFormatTimeHour != -1){
					nextFormatTimeHour = nextFormatTimeHour.replace(/-/g,"/")
					let nextFormatTimeHour1 = new Date(nextFormatTimeHour).getTime();
					if(formatTimeHour1+3600000 > nextFormatTimeHour1 && formatTimeHour1<=nextFormatTimeHour1){ //时间戳比较大小
						formatTimeHourStr += k+"@@";
						deviceDataA[k] = -1;
						deviceDataB[k] = -1;
					}
				}
			}
			if(formatTimeHourStr){
				//console.log(formatTimeHourStr)
				formatTimeHourStr = formatTimeHourStr.substr(0,formatTimeHourStr.length-2); //去除最后的@@符号
				//如果formatTimeHourStr字符串在数组里不存在，就插入到数组里
				if($.inArray(formatTimeHourStr,formatTimeHourArr)==-1) {
			　　　　	formatTimeHourArr.push(formatTimeHourStr);
			　　 }
			}
		}
	}

	if(formatTimeHourArr.length>0){  //有几条数据就代表有几餐
		arrangeDeviceIndexArr = formatTimeHourArr;
		let deviceDataC = $.extend(true, [], deviceData1);
		let deviceDataD = $.extend(true, [], deviceData1);

		let formatTimeOrNumStr1 = '';
		for(let c=0;c<formatTimeHourArr.length;c++){
			formatTimeOrNumStr1 = '';
			let formatIndexArr = [];
			let arrangeDeviceObj = {}; //处理好的蓝牙重量数据对象
			if(formatTimeHourArr[c].indexOf('@@') > -1){
				formatIndexArr = formatTimeHourArr[c].split('@@');
			}else{
				formatIndexArr.push(formatTimeHourArr[c]);
			}
			for(let z=0;z<formatIndexArr.length;z++){
				let formatTimeOrNumberStr = ''; //记录某一时间段内、人数相同的序号,拼接成字符串
				let formatNumber = deviceDataC[formatIndexArr[z]].number;
				if(formatNumber){
					for(let x=0;x<formatIndexArr.length;x++){
						let nextFormatNumber = deviceDataD[formatIndexArr[x]].number;
						if(nextFormatNumber){
							if(formatNumber == nextFormatNumber){
								formatTimeOrNumberStr += formatIndexArr[x]+"&&";
								deviceDataC[formatIndexArr[x]] = -1;
								deviceDataD[formatIndexArr[x]] = -1;
							}else{
								break;
							}
						}
					}
					if(formatTimeOrNumberStr){
						//console.log(formatTimeOrNumberStr)
						formatTimeOrNumberStr = formatTimeOrNumberStr.substr(0,formatTimeOrNumberStr.length-2); //去除最后的@@符号
						//如果formatTimeOrNumberStr字符串在数组里不存在，就插入到数组里
						if($.inArray(formatTimeOrNumberStr,formatTimeOrNumArr)==-1) {
					　　　　	formatTimeOrNumArr.push(formatTimeOrNumberStr);
							formatTimeOrNumStr1 += formatTimeOrNumberStr+':';

					　　 }
					}
				}
			}
			/*获取到拼接数组formatTimeOrNumStr1,传给perCapitaIntakeFn方法,计算某一餐的人均摄入量*/
			//console.log(formatTimeOrNumStr1)
			formatTimeOrNumStr1 = formatTimeOrNumStr1.substr(0,formatTimeOrNumStr1.length-1);  //去除最后的:符号
			let PerCapitaIntake = perCapitaIntakeFn(deviceData1,formatTimeOrNumStr1) //某一餐的人均摄入量
			//console.log('人均：'+PerCapitaIntake);
			let formatFirstIndex = 0; //截取每个序号字符串的第一个数字
			let formatWeitghtArr = []; //存放某一个小时内所有重量的数组
			let formatIndexFirstFlag = true;
			for(let n=0;n<formatIndexArr.length;n++){
				formatFirstIndex = formatIndexArr[0];
				//formatIndexFirstFlag控制只执行一次,formatIndexArr[0]不等于0,表示当前不是今日的第一餐,计算总重时,要用上一餐的最后一次称重重量当做本餐的第一次称重(被减数)
				if((parseInt(formatFirstIndex) != 0) && (formatIndexFirstFlag == true)){
					formatWeitghtArr.push(deviceData1[parseInt(formatIndexArr[n])-1].weight);
					formatIndexFirstFlag = false;
				}
				formatWeitghtArr.push(deviceData1[formatIndexArr[n]].weight);
			}
			//console.log(formatWeitghtArr)
			let totalWeight = arrAction(formatWeitghtArr); //计算重量差值
			if(totalWeight > 0){ //差值必须大于0,才计算人均摄入量,创建数据
				deviceAllWeight += totalWeight;
				//console.log(deviceAllWeight)
				var wasteRatio3 = deviceData1[formatFirstIndex].waste_rate;  //每个时间段里第一条数据的指导摄入量
				var numberOfMeals3 = deviceData1[formatFirstIndex].number;  //每个时间段里第一条数据的就餐人数
				var aperCapitaWeight = ((totalWeight*(1-parseInt(wasteRatio3)/100))/parseInt(numberOfMeals3)).toFixed(2); //每个时间段里的人均摄入量
				arrangeDeviceObj.avg_weight = PerCapitaIntake;
				arrangeDeviceObj.format_time = deviceData1[formatFirstIndex].format_time; //时间
				arrangeDeviceObj.group_weight = totalWeight; //总重
				arrangeDeviceObj.id = deviceData1[formatFirstIndex].id;
				arrangeDeviceObj.type = deviceData1[formatFirstIndex].type;
				arrangeDeviceObj.number = deviceData1[formatFirstIndex].number;
				arrangeDeviceObj.waste_rate = deviceData1[formatFirstIndex].waste_rate;
				arrangeDeviceArr.push(arrangeDeviceObj);
				thatDayDeviceCumulativeIntake += PerCapitaIntake; //当日蓝牙设备人均摄入量总和
			}
		}
	}
}

/*将蓝牙设备重量列表数据转化成CategoryDataRevealFn1需要的数据格式,旧版本暂且不用了*/
function arrangeDeviceData1(deviceData1){
	deviceAllWeight = 0;  //当然摄入总重量先置0
	arrangeDeviceIndexArr = [];
	thatDayDeviceCumulativeIntake = 0; //当日蓝牙设备人均摄入量总和先置0
	arrangeDeviceArr = []; //刚进入前先清空数据
	var formatTimeHourArr = []; //存放某一个小时内的所有数据
	var formatTimeOrNumArr = []; //存放根据时间、人数分类号的所有数据
	// 下面的for循环会根据小时数判断,如果是同一个时间区间的放到一起,返回一个数组["0@@1@@", "2@@3@@"]
	// 表示第一、二条数据是一个时间段内的，第三、四条数据是一个时间段内的
	for(var j=0;j<deviceData1.length;j++){
		var formatTimeHourStr = ''; //记录某一时间段内的序号,拼接成字符串
		var formatTimeOrNumberStr = ''; //记录某一时间段内、人数相同的序号,拼接成字符串
		var formatTimeHour = deviceData1[j].format_time;
		var formatNumber = deviceData1[j].number;
		if(formatTimeHour.length == 16){ //时间格式是"2020-10-16 01:19",长度是16
			var formatTimeHour1 = formatTimeHour.substr(11,2);
			let formatTimeOrNumberStr1 = '';
			for(var k=0;k<deviceData1.length;k++){
				var nextFormatTimeHour = deviceData1[k].format_time;
				var nextFormatNumber = deviceData1[k].number;
				if(nextFormatTimeHour.length == 16){ //时间格式是"2020-10-16 01:19",长度是16
					var nextFormatTimeHour1 = nextFormatTimeHour.substr(11,2);
					if(formatTimeHour1 == nextFormatTimeHour1){
						formatTimeHourStr += k+"@@";
						if(formatNumber == nextFormatNumber){
							formatTimeOrNumberStr += k+"@@";
						}
					}

				}
			}
			formatTimeOrNumberStr = formatTimeOrNumberStr.substr(0,formatTimeOrNumberStr.length-2); //去除最后的@@符号
			formatTimeHourStr = formatTimeHourStr.substr(0,formatTimeHourStr.length-2); //去除最后的@@符号
			//如果formatTimeOrNumberStr字符串在数组里不存在，就插入到数组里
			if($.inArray(formatTimeOrNumberStr,formatTimeOrNumArr)==-1) {
		　　　　	formatTimeOrNumArr.push(formatTimeOrNumberStr);
		　　 }
			//如果formatTimeHourStr字符串在数组里不存在，就插入到数组里
			if($.inArray(formatTimeHourStr,formatTimeHourArr)==-1) {
		　　　　	formatTimeHourArr.push(formatTimeHourStr);
		　　 }

		}





	}

	for(let m=0;m<formatTimeHourArr.length;m++){ //循环拆分数组
		let arrangeDeviceObj = {}; //处理好的蓝牙重量数据对象
		//let formatIndexStr = formatTimeHourArr[m].substr(0,formatTimeHourArr[m].length-2);
		let formatIndexArr = [];
		if(formatTimeHourArr[m].indexOf('@@') > -1){
			formatIndexArr = formatTimeHourArr[m].split('@@');
		}else{
			formatIndexArr.push(formatTimeHourArr[m]);
		}
		let formatTimeOrNumStr1 = '';
		for(let g=0;g<formatTimeOrNumArr.length;g++){
			let formatTimeOrNumArrData = formatTimeOrNumArr[g];
			if(formatTimeHourArr[m].indexOf(formatTimeOrNumArrData)>=0){
				formatTimeOrNumStr1 += formatTimeOrNumArrData+':';
				formatTimeOrNumArr[g] = -1;
			}
		}
		formatTimeOrNumStr1 = formatTimeOrNumStr1.substr(0,formatTimeOrNumStr1.length-1);  //去除最后的:符号

		let formatFirstIndex = formatIndexArr[0]; //截取没有序号字符串的第一个数字
		let formatWeitghtArr = []; //存放某一个小时内所有重量的数组
		//let formatDataArr = []; //存放某一个小时内所有具体数据的数组
		for(let n=0;n<formatIndexArr.length;n++){ //循环获取重量存到数组里
			formatWeitghtArr.push(deviceData1[formatIndexArr[n]].weight);
			//formatDataArr.push(deviceData1[formatIndexArr[n]]);
		}

		let totalWeight = arrAction(formatWeitghtArr); //计算重量差值
		if(totalWeight > 0){ //差值必须大于0,才计算人均摄入量,创建数据
			deviceAllWeight += totalWeight;
			todayUsageWeightArr.push(totalWeight);  //每餐使用量存到数组里
			todayUsageTimeArr.push(deviceData1[formatFirstIndex].format_time);  //每次时间存到数组里
			arrangeDeviceIndexArr.push(formatTimeHourArr[m]); //将满足条件的数据存到数组里,如['3@@4']
			//console.log(arrangeDeviceIndexArr)
			let PerCapitaIntake = perCapitaIntakeFn(deviceData1,formatTimeOrNumStr1) //某一餐的人均摄入量
			var wasteRatio3 = deviceData1[formatFirstIndex].waste_rate;  //每个时间段里第一条数据的指导摄入量
			var numberOfMeals3 = deviceData1[formatFirstIndex].number;  //每个时间段里第一条数据的就餐人数
			//var aperCapitaWeight = ((totalWeight*(1-parseInt(wasteRatio3)/100))/parseInt(numberOfMeals3)).toFixed(2); //每个时间段里的人均摄入量
			arrangeDeviceObj.avg_weight = PerCapitaIntake;
			arrangeDeviceObj.format_time = deviceData1[formatFirstIndex].format_time; //时间
			arrangeDeviceObj.group_weight = totalWeight; //总重
			arrangeDeviceObj.id = deviceData1[formatFirstIndex].id;
			arrangeDeviceObj.type = deviceData1[formatFirstIndex].type;
			arrangeDeviceObj.number = deviceData1[formatFirstIndex].number;
			arrangeDeviceObj.waste_rate = deviceData1[formatFirstIndex].waste_rate;
			arrangeDeviceArr.push(arrangeDeviceObj); //处理后的蓝牙数据存到数据里

			thatDayDeviceCumulativeIntake += PerCapitaIntake; //当日蓝牙设备人均摄入量总和
		}
	}
	// console.log('返回首页拿到的获取数据列表值===' + deviceData1);
	 let str = JSON.stringify(deviceData1);
	// console.log('返回首页拿到的获取数据列表值str===' + str);
	let lastData = deviceData1[deviceData1.length -1];
	let remain = lastData.weight;
	//console.log('返回首页最后一条数据remain==' + remain);
	if(remain != 0){
		$('#remain').text(remain);
	}
}

/* 计算某一餐的人均摄入量 */
function perCapitaIntakeFn(data,indexArr){
	let perCapWeightAll = 0;
	let perCapIndexArr = [];
	if(indexArr.indexOf(':')>-1){
		perCapIndexArr = indexArr.split(':');
	}else{
		perCapIndexArr.push(indexArr);
	}
	let perCapIndexArr1 = [];
	let perCapWeight = 0;
	for(let k=0;k<perCapIndexArr.length;k++){
		if(perCapIndexArr[k].indexOf('&&')>-1){
			perCapIndexArr1 = perCapIndexArr[k].split('&&');
		}else{
			perCapIndexArr1.push(perCapIndexArr[k]);
		}
		let perCapWeightArr = [];
		let perCapWeighFlag = true;
		for(let l=0;l<perCapIndexArr1.length;l++){
			let perI = parseInt(perCapIndexArr1[l]);
			if((parseInt(perCapIndexArr1[0]) != 0) && (perCapWeighFlag == true)){ //perCapWeighFlag控制只执行一次
				perCapWeightArr.unshift(data[perI-1].weight);
				perCapWeighFlag = false;
			}
			perCapWeightArr.push(data[perI].weight);
		}
		let perCapNum = parseInt(data[perCapIndexArr1[0]].number);
		let perCapWasteRate = parseInt(data[perCapIndexArr1[0]].waste_rate);
		if(!perCapWasteRate){//本地浪费比例也不存在,就设置为默认值0
			perCapWasteRate = 0;
		}
		let perCapCountResults = arrAction(perCapWeightArr); //重量计算结果
		perCapWeight = ((perCapCountResults*((100-parseInt(perCapWasteRate))/100))/parseInt(perCapNum));
		perCapWeightAll += parseFloat(perCapWeight);
	}

	perCapWeightAll = Math.round(perCapWeightAll*100)/100; //129.295结果是129.295,不准
	return perCapWeightAll
}

/*将手动输入重量列表数据转化成CategoryDataRevealFn1需要的数据格式*/
function arrangeManualData(manualData2){
	arrangeManualArr = []; //刚进入前先清空数据
	thatDayManualCumulativeIntake = 0; //当日手动人均摄入量总和先置0
	//这里将手动输入数据里的同一时间内的多条数据累加起来
	let manualData1 = manualData2;
	let manualWeightSum = 0;
	for(var h=0;h<manualData1.length;h++){ //循环生成新的数组
		var arrangeManualObj = {};
		arrangeManualObj.avg_weight = manualData1[h].weight;
		arrangeManualObj.format_time = manualData1[h].format_time; //时间
		arrangeManualObj.group_weight = manualData1[h].weight; //总重
		arrangeManualObj.id = manualData1[h].id;
		arrangeManualObj.type = manualData1[h].type;
		arrangeManualObj.number = manualData1[h].number;
		arrangeManualObj.waste_rate = manualData1[h].waste_rate;
		arrangeManualArr.push(arrangeManualObj); //处理后的手动数据存到数据里
		manualWeightSum += parseFloat(manualData1[h].weight);
	}
	thatDayManualCumulativeIntake = manualWeightSum;
}

/* 计算数组的差值, */
var arrActionNum = 0; //计算总重量
function arrAction(trArr){
	arrActionNum = 0; //每次进入计算总重量值先赋值0
	var trArrCount = 0; //有效计算次数
	for(var o=0;o<trArr.length;o++){
	    if(trArr[o] - trArr[o+1] > 0){
	        arrActionNum += trArr[o] - trArr[o+1];
	        trArrCount++;
	    }
	}
	return arrActionNum;
}


function nextSet() {
	window.localStorage.setItem('device_link', 'switchBt');
	$('#device_link').hide();
	// $('#systemHint').show();
	openBluetooth(); // 打开蓝牙设备

}
function wifiSetSure(){  //  接受wifi ，就把wifi 数据发送到蓝牙指令，让板子切换到wifi
	// console.log('同意切换，弹出wifi 窗');
	getWifiName(); // 获取wifi 列表
	$('.wifi_set').hide();
	$('#wife_link').show();
	$('#systemHint').hide();
	window.localStorage.setItem('needWifi','yes');
}


/* * 时间戳转日期 */
function stampToDate(time) {
	var date = new Date(Number(time) * 1000); //将接收到的的String类型的时间转为数字类型,时间戳为10位(秒)需timestamp*1000,如果是13位微秒不需乘1000
	var y = date.getFullYear();
	var m = date.getMonth() + 1;
	var d = date.getDate();
	var hour = date.getHours().toString();
	var minutes = date.getMinutes().toString();
	var seconds = date.getSeconds().toString();
	if (hour < 10) {
		hour = '0' + hour;
	}
	if (minutes < 10) {
		minutes = '0' + minutes;
	}
	if (seconds < 10) {
		seconds = '0' + seconds;
	}
	return (y + '-' + (m < 10 ? '0' + m : m) + '-' + (d < 10 ? '0' + d : d) + ' ' + hour + ':' + minutes + ':' + seconds)
}

/**
 * 储存设备信息
 */
function saveDevices(e) {
	// console.log('saveDevives::::' + JSON.stringify(e));
	var mac = e.mac;
	var service_id = e.service_id;
	var device_name = e.device_name;
	var characteristic_id = e.characteristic_id;
	var update_time = e.update_time;
	var currentDevices = JSON.parse(window.localStorage.getItem('deviceObj')) || [];
	var currentNewDevice = {
		deviceName: device_name,
		deviceId: mac,
		serviceId: service_id,
		characteristicId: characteristic_id,
		update_time: update_time
	};
	var hasSameFlag = false;
	for (let i = 0; i < currentDevices.length; i++) {
		if (currentDevices[i].deviceId && currentDevices[i].deviceId == mac) {
			hasSameFlag = true;
			break
		}
	}
	if (!hasSameFlag) {
		currentDevices.push(currentNewDevice);
		//console.log('currentDevices after:' + JSON.stringify(currentDevices));
		window.localStorage.setItem('deviceObj', JSON.stringify(currentDevices));
	}
}

/**
 * 给板子发送时间
 */
function sendInfoToBL() { // 不需要发送时间
	// 发送时间
	// connectDevice(deviceId); //  链接蓝牙 发送之前先链接蓝牙
	/* 发送蓝牙时间戳 */
	// 绑定设备成功后，发送当前时间戳
	// 要写入的数据
	/* 要写入的时间数据开始 */
	var d = new Date();
	var y = d.getFullYear();
	month = d.getMonth() + 1;
	day = d.getDate();
	(h = d.getHours()), (m = d.getMinutes()), (s = d.getSeconds()), (ms = d.getMilliseconds())
	if (h < 10) {
		h = '0' + h;
	}
	if (m < 10) {
		m = '0' + m;
	}
	if (s < 10) {
		s = '0' + s;
	}
	if (ms < 10) {
		ms = '00' + ms;
	} else if (ms < 100) {
		ms = '0' + ms;
	}
	var time = y + '/' + month + '/' + day + ' ' + h + ':' + m + ':' + s;
	// 1.将日期格式转化为时间戳：
	var date = new Date();
	// 有三种方式获取
	var time1 = date.getTime();
	var time2 = date.valueOf();
	var time3 = Date.parse(date);
	var str = y + '-' + month + '-' + day + ' ' + h + ':' + m + ':' + s;
	var time1 = new Date(str.split(' ')).getTime() / 1000;
	var time2 = 'time_' + time1.toString();
	var type = '时间';
	//console.log('send to Bluetooth info：   ' + time2, type);
	// writeCharacteristics(time2, type);
}

function lastUploadDevice() {
	// console.log('lastUploadDevice');
	var day1 = (now.getDate() < 10 ? '0' : '') + now.getDate();
	var day2 = (now.getDate() - 1 < 10 ? '0' : '') + (now.getDate() - 1);
	let startTime = year + '-' + month + '-' + '01' + ' 00:00:00';
	let endTime = year + '-' + month + '-' + day1 + ' 23:59:00';
	// console.log('startTime:' + startTime, 'endTime:' + endTime);
	$.ajax({
		url: 'https://192.168.1.55:448/user/getWeightingDataList',
		type: 'post',
		data: {
			user_id: userId, //用户ID
			start_time: startTime, //查询开始时间
			end_time: endTime //查询结束时间
		},
		// async: false,
		dataType: 'json',
		success: function(result) {
			// console.log('lastUploadWeightInfoMac==' + JSON.stringify(result));
			if (result && result.length > 0) {
				lastUploadWeightInfoMac = result[0].mac;
			}
		}
	})
}

// 进入首页判断是蓝牙还是 wifi 链接，并且获取对应方式传递的重量数据
function getBtnOrWifiData() {

	var userId = window.localStorage.getItem('useId');
	// var deviceId = $('#foodType .food_active').attr('deviceId');
	//alert('进入首页获取设备号是：'+deviceId)
	// var serviceId = $('#foodType .food_active').attr('serviceId'); //获取被绑定的设备id
	// var characteristicId = $('#foodType .food_active').attr('characteristicId'); //获取被绑定的设备id
	let food_active1 = $.trim($('#foodType .food_active').text());
	let switchItem4 = switchItem(food_active1,1); //类别名转为对应的数字
	let food_active = 0;
	if(switchItem4 > -1){
		food_active = switchItem4;
	}
	var foodActiveIndex = $('#foodType .food_active').index();

	// 进入首页，有设备，有项目的情况下，判断目前是蓝牙还是wifi l链接，来获取项目的总量数据，读取项目列表成功的请款下调用
	// var item_length = $.trim($('#foodType').html());
	// if (item_length) {
	// 如果有项目就获取蓝牙或者wifi 传递的数据
	var link_state = '' ;
	// 进入首页的时候通过 数据库设备数据判断 目前设备是什么链接模式
	$.ajax({
		url: 'https://192.168.1.55:448/user/getEquipmentDataList',  // 调用设备接口，获取设备状态，判断目前是蓝牙还是wifi
		type:'post',
		data:{
			'user_id':userId
		},
		dataType:'json',
		async:false,
		success:function(result){
			//console.log('首页获取的用户设备数据==' + JSON.stringify(result));
			//console.log('首页获取的用户设备数据==' + typeof(result));
			//alert('进入首页判断是蓝牙还是 wifi 链接'+result[0].online_type);
			if(result[0].online_type == '1'){ // 如果设备是蓝牙模式，就读取蓝牙数据
				 link_state = 'switchWifi';
				 //console.log('目前是蓝牙链接，读取蓝牙称重数据');
				 //console.log('目前是蓝牙链接，读取蓝牙称重数据，并且开始自动重连');
				/* setIntervalSendToBT = setInterval(function () {
								// clearInterval(reconnectInterval);

								readlanya('', deviceId, serviceId, characteristicId);
							}, 7000) */

				autoConnectDevice(); // 自动重连,并读取数据

				// 调用接口 ： https://192.168.1.55:448/user/getWeightingDataCalculateList
				requestTypeData(foodActiveIndex,userId);// 获取蓝牙数据接口 进入摄入量和指导摄入量剩余赋值，

			}else if(result[0].online_type == '2'){ // 2 是 wifi 模式 ，读取wifi 数据
				link_state = 'switchBt';
				//console.log('目前是WIFI链接，读取WIFI称重数据');
				$.ajax({
					url: 'https://192.168.1.55:448/user/getWeightingDataList',
					type: 'post',
					data: {
						user_id: userId,
						mac: deviceId,
						item: food_active,
						start_time: startTime,
						end_time: endTime
					},
					dataType: 'json',
					success: function(result) {
						//console.log('wifi返回数据成功,提交的查询user_id,mac,item 是==' + userId + ' ;&&; ' + deviceId + ' ;&&; ' +  food_active);
						//console.log('wifi返回数据成功,提交的查询时间是 ==' + startTime + ' ;&&; ' + endTime);
						//console.log('wifi返回数据成功接收的数据 ==' + JSON.stringify(result));

						if (result && result.length > 0) {
							let wifiWeightLength = result.length;
							let wifiWeightNum = result[wifiWeightLength - 1].weight; //wifi获取返回数据列表里最后一个数据的重量,此重量就是当前秤上面还剩余的总重量
							//console.log('Wifi获取后台数据总重量为：'+wifiWeightNum);
							//$('#remain').text(wifiWeightNum);
							// 当前剩余量赋值
							foodAmount.find('.amount_item').eq(foodActiveIndex).find('.detect_num2 .shi_num,.weighing_num ').text(wifiWeightNum);
							// 进入摄入量和指导摄入量剩余赋值
							requestTypeData(foodActiveIndex,userId);

						} else {
							alert('wifi返回数据里重量信息为0');
						}
					},
					error: function(ero) {
						console.log('wifi返回数据失败时候,提交的查询user_id,mac,item 是==' + userId + ' ;&&; ' + deviceId + ' ;&&; ' +  food_active);
						console.log('wifi返回数据失败时候,提交的查询时间是==' + startTime + ' ;&&; ' + endTime);
						 console.log('wifi 返回数据失败' + JSON.stringify(ero));
					}
				})
			};
		},
		error:function(ero){
			console.log(ero);
		}
	});

}

function getBindingUserList() {
	var userId = window.localStorage.getItem("useId");
	//console.log(userId)
	//console.log("接口查找群组信息开始")
	$.ajax({
		url: 'https://192.168.1.55:448/user/getBindingUserList',
		type: 'post',
		data: {
			'user_id': userId
		},
		dataType: 'json',
		success: function(result) {
			 //console.log("首页获取群组信息结果== "+JSON.stringify(result));
			if (result && result.length > 0) {
				var list = '';
				for (var i = 0; i < result.length; i++) {
					if (result[i].binding_userid && result[i].binding_userid != '') {
						//console.log('开始进入点击切换用户');
						list += '<li class="switch_item" onclick="getBindUserId(' + result[i].binding_userid + ',' + result[i].user_id +
							',1,\''+ result[i].nick_name +'\')" >' + result[i].nick_name + '</li>';
					}
				}
				//console.log('开始进入点击切换用户列表list ==' + list);
				$('.switch_users').append(list);
				$('#switch_group').show();
			} else {
				$('switch_users').hide();
				$('#switch_group').hide();
			};
			if (currentUserID && currentUserPhone) { //如果选择的是切换用户，则显示切换用户
				 //console.log("新加的currentUserID ==" + currentUserID);
				// console.log("新加的currentUserPhone==" + currentUserPhone);
				// getBindUserId(currentUserPhone, userId, 1,result[i].nick_name);
			}
		},
		error: function(ero) {
			console.log(ero);
		}
	});
}

function getBindUserId(bindUserPhone, bindUserMasterID, type,nick_name) { //type 0: 本身用户 1：切换用户

	showLoading();
	if (type == 0) {
		//console.log('切换用户本身');
		storageObject.localRemoveItem('currentUserID');
		storageObject.localRemoveItem('currentUserPhone');
		getEquipmentDataListForUser(bindUserMasterID);
		$("#addDeviceBtn1").show();
		//console.log("切换为binding用户Phone:" + bindUserPhone);
		//console.log("切换为binding用户ID:" + bindUserMasterID);
		//console.log("切换为binding用户type:" + type);
		$('#myname').text(nick_name);
		$('.switch_users').hide();
		hideLoading();
	} else if (type == 1) {
		//console.log('切换群组用户');
		$("#addDeviceBtn1").hide();
		//console.log('首页切换获取的绑定id ==' + bindUserPhone);
		$.ajax({
			url: 'https://192.168.1.55:448/user/getUserInfoDataList',
			type: 'post',
			data: {
				 'mobile': bindUserPhone,
				// 'mobile':binding_userid
			},
			// async: false,
			dataType: 'json',
			success: function(result) {
				var str = JSON.stringify(result);
				//console.log("获取绑定getBindUserId数据==" + str);
				if (result && result.user_id) {
					storageObject.localSetItem('currentUserID', result.user_id); //将当前大类别的数据存到本地存储里
					storageObject.localSetItem('currentUserPhone', bindUserPhone); //将当前大类别的数据存到本地存储里
					getEquipmentDataListForUser(result.user_id);
					//console.log("切换为binding用户Phone:" + bindUserPhone);
					//console.log("切换为binding用户ID:" + bindUserMasterID);
					//console.log("切换为binding用户type:" + type);
					$('#myname').text(nick_name);
					$('.switch_users').hide();
					hideLoading();
				} else {
					alert("没有数据，请换一个用户")
					$('.switch_users').hide();
				}

				hideLoading();
			},
			error: function(ero) {
				console.log(JSON.stringify(ero))
				hideLoading();
			}
		})
	}
}

/**
 *检测设备是否被绑定过，如果绑定过，保存个参数，让更新使用（将该绑定的设备的item名称改掉）
 */
function checkIfBangding() {
	//console.log("checkIfBangdingFn")
	//console.log(":::" + JSON.stringify(getAllEquipments))
	var listEquipments = $('#equipmentsList').find(".equipments_item");
	for (var i in getAllEquipments) {
		//getAllEquipments == [{"characteristic_id":"5EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"ESP32-new-1","mac":"FC:F5:C4:16:24:AA","online_type":"bluetooth","service_id":"5FAFC201-1FB5-459E-8FCC-C5C9C331914B","user_id":"6"},{"item":"糖","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","user_id":"6"},{"item":"味精","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","user_id":"6"}]

		if (getAllEquipments[i].name && getAllEquipments[i].item_value && getAllEquipments[i].mac) {
			listEquipments.each(function() {
				var currentListMac = $(this).attr('mac');
				var currentListItem = $(this).attr('item');
				var currentListName = $(this).find(".equipments_name").text() + $(this).find(".position").text().substring(1, 0);
				let typeThat = $('#addDeviceNext1').parents('.add_dev_one');
				let addTypeName = typeThat.find('#addType1').children('.type1_active').text();
				//console.log("currentListMac::" + currentListMac);
				//console.log("currentListName::" + currentListName);
				if (currentListMac == getAllEquipments[i].mac && currentListName == getAllEquipments[i].name && getAllEquipments[
						i].item_value) { //currentListItem == getAllEquipments[i].item_value &&
					$(this).find(".equipments_function").text("已绑定-" + getAllEquipments[i].item_value);
					$(this).find(".equipments_function").attr("bound", getAllEquipments[i].item_value);
				}
			})
		}
	}
}

function showLoading() {
	$("#loading_data").show();
}

function hideLoading() {
	$("#loading_data").hide();
}

function getProjectId(itemName) {
	if (itemName == '油') {
		itemName = '1';
	} else if (itemName == '菜籽油') {
		itemName = '2';
	} else if (itemName == '葵花籽油') {
		itemName = '3';
	} else if (itemName == '橄榄油') {
		itemName = '4';
	} else if (itemName == '花生油') {
		itemName = '5';
	} else if (itemName == '玉米油') {
		itemName = '6';
	} else if (itemName == '豆油') {
		itemName = '7';
	} else if (itemName == '香油') {
		itemName = '8';
	} else if (itemName == '芝麻油') {
		itemName = '9';
	} else if (itemName == '麻油') {
		itemName = '10'
	} else if (itemName == '糖') {
		itemName = '11';
	} else if (itemName == '冰糖') {
		itemName = '12';
	} else if (itemName == '白砂糖') {
		itemName = '13';
	} else if (itemName == '红糖') {
		itemName = '14';
	} else if (itemName == '盐') {
		itemName = '15';
	} else if (itemName == '细盐') {
		itemName = '16';
	} else if (itemName == '粗盐') {
		itemName = '17';
	} else if (itemName == '碘盐') {
		itemName = '18';
	} else if (itemName == '无碘盐') {
		itemName = '19';
	} else if (itemName == '海盐') {
		itemName = '20';
	} else if (itemName == '玫瑰盐') {
		itemName = '21';
	} else if (itemName == '岩盐') {
		itemName = '22';
	} else if (itemName == '竹盐') {
		itemName = '23';
	} else if (itemName == '醋') {
		itemName = '24';
	} else if (itemName == '黑醋') {
		itemName = '25';
	} else if (itemName == '香醋') {
		itemName = '26';
	} else if (itemName == '米醋') {
		itemName = '27';
	} else if (itemName == '白醋') {
		itemName = '28';
	} else if (itemName == '陈醋') {
		itemName = '29';
	} else if (itemName == '康乐醋') {
		itemName = '30';
	} else if (itemName == '酱油') {
		itemName = '31';
	} else if (itemName == '海鲜酱油') {
		itemName = '32';
	} else if (itemName == '生抽') {
		itemName = '33';
	} else if (itemName == '老抽') {
		itemName = '34';
	} else if (itemName == '六月鲜') {
		itemName = '35';
	} else if (itemName == '味极鲜') {
		itemName = '36';
	} else if (itemName == '刺生酱油') {
		itemName = '37';
	} else if (itemName == '日式酱油') {
		itemName = '38';
	} else if (itemName == '辣酱油') {
		itemName = '39';
	} else if (itemName == '耗油') {
		itemName = '40';
	} else if (itemName == '蒸鱼豉油') {
		itemName = '41';
	} else if (itemName == '料酒') {
		itemName = '42';
	} else if (itemName == '葱姜料酒') {
		itemName = '43';
	} else if (itemName == '椒盐') {
		itemName = '44';
	} else if (itemName == '淀粉') {
		itemName = '45';
	} else if (itemName == '味精') {
		itemName = '46';
	} else if (itemName == '鸡精') {
		itemName = '47';
	} else if (itemName == '鸡粉') {
		itemName = '48';
	} else if (itemName == '克') {
		itemName = '49';
	} else if (itemName == '毫升') {
		itemName = '50';
	}
	return itemName;
}
// var weekTime = ['06:00','09:21','12:03','18:32']; //X轴的时间数据
// var manArr = [0, 0, 0,0]; //手动输入数据,默认全部为0
// var weekWeight = [153,142,132,111]; //设备记录的数据

// initChart(1);
function initChart(index){
	// 测试数据
	//var weekWeight = [18,14,12,11,0,0,0]; //设备记录的数据

	var weekTime = ['周一','周二','周三','周四','周五','周六','周日']; //周平均图表X轴的时间数据
	if(!index  || index==0){ //如果index不存在或者传值为0,就默认为空,去第一个类别的ID
		index = '';
	}
	$("#amountChart"+index).show();
	let dayChartIndex = 'amountChart'+index;
	// 柱状体
	//var myChart1 = echarts.init(document.getElementById(dayChartIndex));
	let dayChartName = $('.amount_item'+index+' .chart_fat1 .remaining_chart')[0];  //js获取图表元素对象,多个项目时id重复了所以不能通过id获取元素
	var myChart1 = echarts.init(dayChartName);

	// 指定图表的配置项和数据
	var option1 = {
		tooltip: {},
		legend: {},
		grid: { //配置canves图标父元素div的距离
			top:"20px",
		    left:"10px",
		    right:"10px",
		    bottom:"10px",
			width:'auto',
			containLabel: true
		},
		xAxis: { //配置x轴数据和坐标轴轴线
			//name: '时间',
			data: weekTime,
			// nameLocation: "center",
			// nameGap:25,
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			}
		},
		yAxis: { //配置y轴数据和坐标轴轴线
			//name: '剩余量',
			type: "value",
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			}
		},
		series: [
			{
				type: 'bar',
				barWidth : 12, //设置柱的宽度
				itemStyle:{
					normal:{
						barBorderRadius: 6, //设置柱的圆角
						color:'#39A0FF',
						label: { //柱顶部显示数值
							show: true,
							position: 'top',
							distance: 3,
							textStyle: {	    //数值样式
							    fontSize: 14
							},
							formatter: function (params) { //数据为0时不显示数字0
								if (params.value > 0) {
									return params.value;
								} else {
									return '';
								}
						    }
						}
					}
				},
				data: weekWeight,
				timeX: weekTimeArr
			}

		]
	};

	// 使用刚指定的配置项和数据显示图表。
	myChart1.setOption(option1,true,true);
	$(window).resize(function(){  //改变浏览器窗口大小时，图标自动从新加载
		myChart1.resize();
	})

	myChart1.on('click',function(params){
		//console.log(params)
		let clickTime = option1.series[params.seriesIndex].timeX[params.dataIndex];
		//console.log(clickTime);
		if(clickTime){
			window.location.href = '../index/detail.html?time='+clickTime
		}

	})

}

function initChart1(index){
	// 测试数据
	//var monthWeight = [153,142,132,111,126]; //设备记录的数据

	var monthTime = ['第一周','第二周','第三周','第四周','第五周']; //月平均图表X轴的时间数据,如有的月份只有4周去掉最后一个元素
	if(!index  || index==0){ //如果index不存在或者传值为0,就默认为空,去第一个类别的ID
		index = '';
	}
	let dayChartIndex = 'amountChart'+index;
	// 柱状体
	//var myChart = echarts.init(document.getElementById(dayChartIndex));
	let weekChartName = $('.amount_item'+index+' .chart_fat2 .remaining_chart')[0];
	var myChart = echarts.init(weekChartName);

	// 指定图表的配置项和数据
	var option1 = {
		tooltip: {},
		legend: {},
		grid: { //配置canves图标父元素div的距离
			top:"15px",
		    left:"10px",
		    right:"10px",
		    bottom:"10px",
			width:'auto',
			containLabel: true
		},
		xAxis: { //配置x轴数据和坐标轴轴线
			//name: '时间',
			data: monthTime,
			// nameLocation: "center",
			// nameGap:25,
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			}
		},
		yAxis: { //配置y轴数据和坐标轴轴线
			//name: '剩余量',
			type: "value",
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			}
		},
		series: [
			{
				type: 'bar',
				barWidth : 12, //设置柱的宽度
				itemStyle:{
					normal:{
						barBorderRadius: 6, //设置柱的圆角
						color:'#39A0FF',
						label: { //柱顶部显示数值
							show: true,
							position: 'top',
							distance: 3,
							textStyle: {	    //数值样式
							    fontSize: 14
							},
							formatter: function (params) { //数据为0时不显示数字0
								if (params.value > 0) {
									return params.value;
								} else {
									return '';
								}
						    }
						}
					}
				},
				data: monthWeight
			}

		]
	};

	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option1,true,true);
	$(window).resize(function(){  //改变浏览器窗口大小时，图标自动从新加载
		myChart.resize();
	})
}

//获取当前wifi

		// getWifiName = function() {
		function getWifiName(){
			if (mui.os.android) {
				//console.log('获取wifi');
				var wifiManager, wifiInfo;
				var Context = plus.android.importClass("android.content.Context");
				var WifiManager = plus.android.importClass("android.net.wifi.WifiManager");
				var WifiInfo = plus.android.importClass("android.net.wifi.WifiInfo");
				wifiManager = plus.android.runtimeMainActivity().getSystemService(Context.WIFI_SERVICE);
				wifiInfo = wifiManager.getConnectionInfo(); // 获取连接的wifi 名
				wifis = wifiManager.getScanResults();
				var str = wifis.toString();
				var s = str.substring(0, str.length);
				var arr = s.split(',');
				var name_arr = [];
				for (var i = 0; i < arr.length; i++) {
					// console.log(arr[i]);
					if (arr[i].indexOf('SSID:') > 0) {
						name_arr.push(arr[i]);
					}
				}

				// console.log('新数组name_arr == ' + name_arr);

				var newNameArr = [];
				for (var j = 0; j < name_arr.length; j++) {
					var a = name_arr[j];
					var b = name_arr[j].indexOf('BSSID');
					if (name_arr[j].indexOf('BSSID') == -1) {
						newNameArr.push(name_arr[j]);
					}
				}

				//console.log('最终新数组newNameArr == ' + newNameArr);

				var option = '';
				for (var k = 0; k < newNameArr.length; k++) {
					// console.log(newNameArr[k].substring(6,newNameArr[k].length));
					option += '<option>' + newNameArr[k].substring(6, newNameArr[k].length) + '</option>';
				};
				//console.log(option);
				$('#wifiList').html(option);
			}
		};

//type等于1返回大类别汉字(data)在数组里的序号,type等于2返回大类别汉字(data)在数组里的密度值(density),
function switchItem(data,type){
	let itemObj = [{name:"油",density:0.9},{name:"菜籽油",density:0.92},{name:"葵花籽油",density:0.935},{name:"橄榄油",density:0.91},{name:"花生油",density:0.91},{name:"玉米油",density:0.8},{name:"豆油",density:0.917},
	{name:"香油",density:0.923},{name:"芝麻油",density:0.923},{name:"麻油",density:0.9},{name:"糖",density:1},{name:"冰糖",density:1},{name:"白砂糖",density:1},{name:"红糖",density:1},{name:"盐",density:1},
	{name:"细盐",density:1},{name:"粗盐",density:1},{name:"碘盐",density:1},{name:"无碘盐",density:1},{name:"海盐",density:1},{name:"玫瑰盐",density:1},{name:"岩盐",density:1},{name:"竹盐",density:1},
	{name:"醋",density:1},{name:"黑醋",density:1},{name:"香醋",density:1},{name:"米醋",density:1},{name:"白醋",density:1},{name:"陈醋",density:1},{name:"康乐醋",density:1},{name:"酱油",density:1.15},
	{name:"海鲜酱油",density:1.15},{name:"生抽",density:1.15},{name:"老抽",density:1.15},{name:"六月鲜",density:1.15},{name:"味极鲜",density:1.15},{name:"刺生酱油",density:1.15},{name:"日式酱油",density:1.15},{name:"辣酱油",density:1.15},
	{name:"耗油",density:0.9},{name:"蒸鱼豉油",density:0.9},{name:"料酒",density:0.9},{name:"葱姜料酒",density:0.9},{name:"椒盐",density:1},{name:"淀粉",density:1},{name:"味精",density:1},{name:"鸡精",density:1},{name:"鸡粉",density:1}];
	let dataNum = -1; //项目号item
	let densityNum = 1;  //密度值
	if(data&&data.length>0){
		itemObj.forEach(function(item,i){
			if(item.name == data){
				dataNum = i+1;
				densityNum = item.density;
			}
		})
	}
	if(type == 1){
		return dataNum;
	}else if(type == 2){
		return densityNum;
	}
}

//根据时间获取当前月的周数以及每周开始时间和结束时间
function weekData(ymd) {
	var week = new Date(Date.parse(ymd.replace(/\-/g, "/")));
	var w = week.toString().substring(0, 3);
	var yymm = new Date(ymd.substring(0, 4), ymd.substring(5, 7), 0);
	var day = yymm.getDate();
	var dd = 1;
	switch (w) {
		case "Mon": dd = 0; break;
		case "Tue": dd = 1; break;
		case "Wed": dd = 2; break;
		case "Thu": dd = 3; break;
		case "Fri": dd = 4; break;
		case "Sat": dd = 5; break;
		case "Sun": dd = 6; break;
	}
	var aw = 5;
	if (day == 28 && dd == 0) {
		aw = 4;
	}
	var objArr = [];
	for (var i = 0; i < aw; i++) {
		var start = i * 7 + 1 - dd;
		var end = i * 7 + 7 - dd;
		if (start < 1) {
			start = 1;
		}
		if (end > day) {
			end = day;
		}
		var obj = {};
		var firstTime = ymd.substring(0, 7) + "-" + start;
		firstTime = firstTime.replace(/-/g,'/');
		var lastTime = ymd.substring(0, 7) + "-" + end;
		lastTime = lastTime.replace(/-/g,'/');
		obj.firstTime = firstTime;
		obj.lastTime = lastTime;
		weekDataArr.push(obj);
	}
	//console.log(weekDataArr)
	var firstTime1 = new Date(weekDataArr[0].firstTime).getTime();
	//console.log(firstTime1)
}

//获取当前日期所在周的第一天和最后一天,如dealTime(1, '20201101'); 返回的是11月09日
function dealTime(dayNum, dat) {
	if (dayNum == "0") {
		dayNum = 7;
	}
	var uom = new Date(), dateStr = '', fday = '';
	fday = dat.substring(6, 8);
	uom.setYear(dat.substring(0, 4));
	uom.setMonth(parseInt(dat.substring(4, 6)) - 1);
	uom.setDate(fday);

	if(uom.getDay() == 0){
		uom.setDate(uom.getDate() - (7 - dayNum));
	}else{
		uom.setDate(uom.getDate() - (uom.getDay() - dayNum));
	}
	var mon = (uom.getMonth() + 1) + '';
	if (mon.length != 2) {
		mon = '0' + mon;
	}
	var day = uom.getDate() + '';
	if (day.length != 2) {
		day = '0' + day;
	}
	dateStr = '' + uom.getFullYear() + '-' + mon + '-' + day;
	return dateStr;
}

/* 阻止停止冒泡 */
function stopBubble(e) {
    //如果提供了事件对象，则这是一个非IE浏览器
    if ( e && e.stopPropagation ){
    	//因此它支持W3C的stopPropagation()方法
    	e.stopPropagation();
    }else{
    	//否则，我们需要使用IE的方式来取消事件冒泡
    	window.event.cancelBubble = true;
    }
}

/* 阻止浏览器的默认行为 */
function stopDefault(e){
   //阻止默认浏览器动作(W3C)
   if ( e && e.preventDefault ){
	e.preventDefault();
   }else{
	//IE中阻止函数器默认动作的方式
	window.event.returnValue = false;
	return false;
   }
}



function closeWeightSet(){
	// 放入缓存 显示重量还是平均值
	var val1 = $.trim($('.weightShow_set input:checked').val());
	window.localStorage.setItem('weightShow_set',val1);
	var deviceId = window.localStorage.getItem('deviceId');
	var serviceId = window.localStorage.getItem('serviceId');
	var characteristicId = window.localStorage.getItem('characteristicId');
	// 选择称的显示屏是显示当前重量还是人均重量后， 弹出是否选择wifi 弹窗
	$('.weightShow_set').hide();
	$('.wifi_set').show();
	var type = '设备显示重量方式';
	//console.log('设备显示重量方式设备信息  ');
	writeCharacteristics(val1, type, deviceId, serviceId, characteristicId);
}






