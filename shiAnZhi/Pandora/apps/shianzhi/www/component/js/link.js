var weightShow_set = window.localStorage.getItem('weightShow_set');
var userId = window.localStorage.getItem("useId");
// var personNum = window.localStorage.getItem('personNum');
// var wasteNum = window.localStorage.getItem('wasteNum');
var foodActiveName = window.localStorage.getItem('foodActiveName');  //当前选择的项目中文名
var deviceId,name,personNum,wasteNum,item,weightUnitE,serviceId,characteristicId,onlineType;

$(function(){
	var link_state = '' ;
	var ip_address = '';

	console.log('进入页面时候 设备屏幕显示重量方式 ==' + weightShow_set);
	$('.weightshow_tc input').each(function(){
		if($(this).val() == weightShow_set){
			$('.weightshow_tc input').prop('checked',false);
			$(this).prop('checked',true);
		}
	})
	showLevelWeight();
	function showLevelWeight(){
		var picker = new mui.PopPicker({
			layer: 1,
			buttons: ['取消', '确定']
		});
		picker.setData(
			[
				{
					value: "1",
					text: "蓝牙连接"
				}, {
					value: "2",
					text: "WIFI连接"
				}
			]
		);
		
		document.getElementById("link").addEventListener('tap', function(event) {
			console.log('进入切换流程')
			// var link_state = '' ;
			// var ip_address = '';
			// 进入设置页面的时候通过 ，查询设备信息，查看当前是什么链接方式
			$.ajax({
				url: 'https://192.168.1.55:448/user/getEquipmentDataList',
				type: 'post',
				data: {
					'user_id': userId
				},
				dataType:'json',
				async:false,
				success:function(result){
					console.log('设备页获取的用户设备数据==' + JSON.stringify(result));
					if (result[0].online_type == '1') {  // online_type   1.是蓝牙
						link_state = 'switchBt';
						
					} else if(result[0].online_type == '2'){ // online_type   2.是wifi
						link_state = 'switchWifi';
						ip_address = result[0].ip_address ;
					};
				},
				error:function(ero){
					console.log(ero);
				}
			});
			
			console.log('设置页面，数据库里设备的链接方式是 link_state == ' + link_state);

			var currentHeight = $("#link").text();
			      var checkData = picker.pickers[0].items;
			      var currentIndex = 1;
			     // console.log(checkData)
			      for(var i in checkData){
			        if(checkData[i].text == currentHeight){
			          currentIndex = i
			          break;
			        }
			      }
			// 默认显示第3项
			picker.pickers[0].setSelectedIndex(currentIndex, 2000);
			picker.show(function(selectItems) {
				var text = selectItems[0].text;
				$("#link").text(text );
				$("#link").css('color','#333');

				if(link_state == 'switchBt'){ // 如果原本是 蓝牙链接
					if(text == 'WIFI连接'){  // 切换到 wifi
						$('.link_tc').show();
						getWifiName();
						window.localStorage.setItem('device_link',text);
					}
				}
				
				if(link_state == 'switchWifi'){  // 如果原本是 wifi 链接
					if(text == '蓝牙连接'){  // 切换到 蓝牙
							$('.link_tc').hide();
							// $("#loading_data").hide();
							 
							console.log('wifi切换蓝牙后拿到的 ip_address ==  ' + ip_address);
							// $('.switchTolanya iframe').attr('src','http:'+ip_address);
							//alert('开始访问 ip_dress , 返回 success 后，板子从 wifi 状态切换到 蓝牙状态');
							$('.switchTolanya iframe').attr('src','http:'+ip_address);
							// $('.switchTolanya').show();
							$('.switchTolanya').show().fadeOut(20000);
							
							// window.open('http:'+ip_address);
							window.localStorage.setItem('device_link',text);
					}
				}
			});
		});

	};

	//先获取用户所有的设备信息
	$.ajax({
		url: 'https://192.168.1.55:448/user/getEquipmentDataList',
		type: 'post',
		data: {
			user_id: userId //用户ID
		},
		async:false,  //同步,获取数据了再执行下面的更新ajax
		dataType: 'json',
		success: function(res) {
			console.log('用户的数据是：'+JSON.stringify(res));
			if(res && res.length>0){
				for(let i=0;i<res.length;i++){
					if(foodActiveName == res[i].item_value){ //当前数据就是选中的项目
						deviceId = res[i].mac;
						name = res[i].device_name;
						personNum = res[i].number;
						wasteNum = res[i].target;
						item = res[i].item;
						weightUnitE = res[i].unit;
						serviceId = res[i].service_id;
						characteristicId = res[i].characteristic_id;
						onlineType = res[i].online_type;
						//用餐人数和损耗比赋值
						//console.log('用餐人数和损耗比:'+personNum+','+wasteNum);
						if(personNum){
							 $('.diner_num').text(personNum);
							 $('.num_val').val(personNum);
						}
						if(wasteNum){
							$('.waste_num,.waste,#inline-range-val').text(wasteNum);
							$('.bg_span').css('width', wasteNum + '%') ;
							$('input[type="range"]').val(wasteNum);
						}
					}
				}
			}else{
				console.log('没有用户数据返回');
			}
		},
		error: function(err){
			console.log(err);
		}
	})

	// 进入页面时候查询就餐人数和浪费比例
	// $.ajax({
	// 	url:'https://192.168.1.55:448/user/getUserInfoDataList',
	// 	type:'post',
	// 	data:{'user_id':userId},
	// 	dataType:'json',
	// 	success:function(result){
	// 		//alert('获取用户信息是：'+JSON.stringify(result))
	// 		if(result.number){
	// 			 $('.diner_num').text(result.number);
	// 			 $('.num_val').val(result.number);
	// 		}
	// 		if(result.waste_rate){
	// 			$('.waste_num,.waste,#inline-range-val').text(result.waste_rate);
	// 			$('.bg_span').css('width', result.waste_rate + '%') ;
	// 			$('input[type="range"]').val(result.waste_rate);
	// 		}
	// 	},error:function(ero){
	// 		console.log(ero);
	// 	}
	// })

	// 修改浪费比例和就餐人数
	 $('#paramater_back').click(function(){
		var number = $.trim($('#dinner_num').text());
		var wasteRate = $.trim($('#waste_num').text());
		$.ajax({
			url:'https://192.168.1.55:448/user/updateUserInfo',
			type:'post',
			data:{
				'user_id':userId,
				'nick_name':'',
				'sex':'',
				'birthday':'',
				'height':'',
				'weight':'',
				'waste_rate':wasteRate,
				'number':number
			},
			dataType:'json',
			success:function(result){
				/* 将用餐人数和损耗比率存到本地存储里,首页下一次称重传到后台时需要用到这个数据 */
				window.localStorage.setItem('personNum',parseInt(number));
				window.localStorage.setItem('wasteNum',parseInt(wasteRate));
			},
			error:function(ero){
				console.log(ero);
			}
		})
		//获取然后将修改后的用户、损耗比更新到对应的用户项目中去
		getAndSetEquipment(number,wasteRate);
	 });


	// 进入页面时候 设备屏幕显示重量方式：
	//  var weightShow = window.localStorage.getItem('weightShow_set')
	if(weightShow_set == 'show_1'){
		$('#weightShow').text('实际称重');
	}else if(weightShow_set == 'show_0'){
		$('#weightShow').text('人均摄入量');
	}
	

	// 发送 显设备显剩余重量还是人均重量示方式
	$('.closeWeight_set').click(function(){
		var weightType1 = weightShow_set;
		var val1 = $.trim($('.weightshow_tc input:checked').val());
		$('.weightshow_tc').hide();
		if(val1 != weightType1){
			window.localStorage.setItem('weightShow_set',val1);
			// 发送设置信息
			writeCharacteristics(val1,'');
		}
		var weightShow = window.localStorage.getItem('weightShow_set')
		if(weightShow == 'show_1'){
			$('#weightShow').text('实际称重');
		}else if(weightShow == 'show_0'){
			$('#weightShow').text('人均摄入量');
		}
	})
	


	/* 点击去皮后发送去皮标识到蓝牙 */
	$('.peel').click(function(){
		console.log('去皮开始');
		writeCharacteristics('peel','');
	});
	
	$('.password_del').click(function(){
		$('.password_val').val('');
	});
	 $('.link_tc,.link_center .cancel').click(function(){
		$('#wife_link').hide();
		// $('#device_link').show();
	});
	

	/* 判断wifi 密码是否正确开始 */
	var ssid = '';
	var password = '';
	
	(function($, doc) {
		$.init({
			//通知栏的颜色
			statusBarBackground: '#f7f7f7'
		});
		$.plusReady(function() {
			
			
	// 		 document.getElementById("test_button").addEventListener("tap", function() {
	// 				judgePlatform();
	// 			function judgePlatform() {
	// 				switch (plus.os.name) {
	// 					case "Android":
	// 						// Android平台: plus.android.*
	// 						console.log('进入安卓');
	// 						androidOpenWifi(); //通常需要3~5秒
	// 						loadWifiInfo();
	// 						break;
	// 					case "iOS":
	// 						// iOS平台: plus.ios.*
	// 						break;
	// 					default:
	// 						// 其它平台
	// 						break;
	// 				}
	// 			}
	
	// 		});
			//监听每一个ul下的li事件
			//  mui(".mui-table-view").on('tap', '.mui-table-view-cell', function() {
				
				  mui(".link_center").on('tap', '#btnToWifi_sure', function() {
					  
				var wifiListLength = $('#wifiList option').length;
				if (wifiListLength <= 0) {
					alert('请开启该 app 的定位权限, 用来获取 wifi ');
				}	  
					  
				var obj = document.getElementById("wifiList"); //定位id
				
				var index = obj.selectedIndex; // 选中索引
				
				var ssid = obj.options[index].text; // 选中文本     输出张三等汉字信息
				
				// var ssid = obj.options[index].value; // 选中值        输出zhangsan等英文信息	  
					  
					  
					  
				 password = document.getElementById('wifiPassowrd').value;
				 
				console.log('点击选择的时候获取到的SSID==' + ssid);
				console.log('点击选择的时候获取到的password==' + password);
				judgePlatform();
				function judgePlatform() {
					switch (plus.os.name) {
						case "Android":
							// Android平台: plus.android.*
							// androidWifiConnection("FGJSB", "fuguangjsb14", "wpa"); 
							// androidWifiConnection("HWIFI", "1234", "wpa"); // 密码错误， enableNetwork status enable== true
							// androidWifiConnection("HWIFI", "ldl@12345678", "wpa");  // OK  enableNetwork status enable== true
							 androidWifiConnection(ssid, password,"wpa");
							
							break;
						case "iOS":
							// iOS平台: plus.ios.*
							break;
						default:
							// 其它平台
							break;
					}
				}
			});
		});
	}(mui, document));
	
	/* 判断wifi 密码是否正确结束 */
})

/**
			 * 获取安卓的wifi列表
			 */
			function loadWifiInfo() {
				// 主窗体
				var MainActivity = plus.android.runtimeMainActivity()
				// 上下文
				var Context = plus.android.importClass('android.content.Context')
				// 导入WIFI管理 和 WIFI 信息 的class
				plus.android.importClass("android.net.wifi.WifiManager")
				plus.android.importClass("android.net.wifi.WifiInfo")
				plus.android.importClass("android.net.wifi.ScanResult")
				plus.android.importClass("java.util.ArrayList")
				// 获取 WIFI 管理实例
				var wifiManager = MainActivity.getSystemService(Context.WIFI_SERVICE)

				// 获取当前连接WIFI的信息
				var info = wifiManager.getConnectionInfo();
				console.log("进入获取wifi列表, 当前连接的wifi的信息是:" + info);
				 getWifiName();
			}

			/**
			 * 打开安卓的wifi模块
			 */
			function androidOpenWifi() {
				var bRet = false;
				var MainActivity = plus.android.runtimeMainActivity()
				var Context = plus.android.importClass('android.content.Context')
				plus.android.importClass("android.net.wifi.WifiManager")
				plus.android.importClass("android.net.wifi.WifiInfo")
				var wifiManager = MainActivity.getSystemService(Context.WIFI_SERVICE)
				if (!wifiManager.isWifiEnabled()) {
					bRet = wifiManager.setWifiEnabled(true); //返回自动打开的结果
					console.log("打开wifi的返回结果是" + bRet)
				} else {
					bRet = true;
					console.log("wifi原本已经打开")
				}
				return bRet;
			}

			/**
			 * 安卓自动连接wifi，根据制定的ssid
			 * @param {Object} ssid 名称
			 * @param {Object} password 密码
			 * @param {Object} type 加密方式
			 */
			function androidWifiConnection(ssid, password, type) {
				console.log('开始进入自动连接');
				var MainActivity = plus.android.runtimeMainActivity();
				var Context = plus.android.importClass('android.content.Context');
				plus.android.importClass("android.net.wifi.WifiManager");
				plus.android.importClass("android.net.wifi.WifiInfo");
				plus.android.importClass("android.net.wifi.WifiConfiguration");
				var wifiManager = MainActivity.getSystemService(Context.WIFI_SERVICE);

				//WifiConfiguration
				var wifiConfig = androidCreateWifiInfo(ssid, password, type);
				//
				if (wifiConfig == null) {
					console.log("wifiConfig is null!")
					return;
				}

				//WifiConfiguration
				var WifiConfiguration = tempConfig = isExsitsAndroid(ssid);
				if (tempConfig != null) {
					console.log("删除原来连接的wifi == " + tempConfig);
					console.log("删除原来连接的wifi 的 ID == " + tempConfig.plusGetAttribute('networkId'));
					 wifiManager.removeNetwork(tempConfig.plusGetAttribute('networkId'));
				}

				//int
				console.log("要连接的新的wifi配置：" + wifiConfig)
				 var networkId = wifiManager.addNetwork(wifiConfig);
				 if(networkId == -1){
					 // 如果networkId返回为 -1 ， 说明已经被配置过，就把原来的网络的 networkId 返回并赋给新的网络
					 networkId = tempConfig.plusGetAttribute('networkId');
				 }

				console.log('新配置选择的 networkId == ' + networkId);
				//boolean
				var enabled = wifiManager.enableNetwork(networkId, true);
				console.log("enableNetwork status enable==" + enabled)
				// boolean
				var connected = wifiManager.reconnect();
				// console.log('wifiManager ==' + wifiManager);
				console.log("enableNetwork connected==" + connected);
				
				  if(enabled == true && connected == true && password == 'ldl@12345678'){
					console.log('wifi 名和密码匹配，发送wifiName 和 wifiPassword 到蓝牙，通知蓝牙板子切换到 wifi 模式');
					// 开始发送 wifi 数据到蓝牙
					
						$('.link_tc').hide();
					
						var wifiName = $.trim($('#wifiList option:selected').text());
						var wifiPassword = $.trim($('#wifiPassowrd').val());
						var link_wifi =  wifiName + '+' + wifiPassword +'='+ 'switchWifi';
						console.log('发送的link_wifi == ' + link_wifi);
						var type = "切换到wifi";
						// 重启 app
						// 发送切换wifi 数据
						writeCharacteristics(link_wifi, type);
						window.localStorage.setItem('device_link',link_wifi);
						window.localStorage.setItem('link_state','switchWifi');

				}else{
					alert('您输入的密码不正确，请重新输入');
				}
			}

			/**
			 * 查看以前是否也配置过这个网络
			 */
			function isExsitsAndroid(sSID) {
				
				//WifiConfiguration
				var MainActivity = plus.android.runtimeMainActivity();
				var Context = plus.android.importClass('android.content.Context');
				plus.android.importClass("android.net.wifi.WifiManager");
				plus.android.importClass("android.net.wifi.WifiInfo");
				var List = plus.android.importClass("java.util.List");
				var ArrayList = plus.android.importClass("java.util.ArrayList");
				var wifiManager = MainActivity.getSystemService(Context.WIFI_SERVICE);
				//
				var existingConfigs = new ArrayList();
				existingConfigs = wifiManager.getConfiguredNetworks();
				if (existingConfigs.size() != 0) {
					for (var i = 0; i < existingConfigs.size(); i++) {
						if (existingConfigs.get(i).plusGetAttribute('SSID') == ("\"" + sSID + "\"")) {
							console.log("该制定的ssid存在于配置中:" + sSID);
							return existingConfigs.get(i);
						}
					}
				}
				console.log("该ssid没有配置过")
				return null;
			}

			/**
			 * 创建wifi配置对象
			 * @param {Object} SSID
			 * @param {Object} Password
			 * @param {Object} Type
			 */
			function androidCreateWifiInfo(SSID, Password, Type) {
				plus.android.importClass("java.util.BitSet");
				var WifiConfiguration = plus.android.importClass("android.net.wifi.WifiConfiguration");
				var config = new WifiConfiguration();
				config.plusGetAttribute('allowedAuthAlgorithms').clear();
				config.plusGetAttribute('allowedGroupCiphers').clear();
				config.plusGetAttribute('allowedKeyManagement').clear();
				config.plusGetAttribute('allowedPairwiseCiphers').clear();
				config.plusGetAttribute('allowedProtocols').clear();
				config.plusSetAttribute('SSID', "\"" + SSID + "\"");
				// nopass
				if (Type == "nopass") {
					config.plusSetAttribute(wepKeys[0], "");
					config.plusGetAttribute('allowedKeyManagement').set(WifiConfiguration.KeyMgmt.NONE);
					config.plusSetAttribute('wepTxKeyIndex', 0);
				}



				// wep
				if (Type == "wep") {
					if (!Password != "") {
						if (isHexWepKey(Password)) {
							config.plusSetAttribute(wepKeys[0], Password);
						} else {
							config.plusSetAttribute(wepKeys[0], "\"" + Password + "\"");
						}
					}
					config.allowedAuthAlgorithms.set(AuthAlgorithm.OPEN);
					config.allowedAuthAlgorithms.set(AuthAlgorithm.SHARED);
					config.allowedKeyManagement.set(KeyMgmt.NONE);
					config.plusSetAttribute('wepTxKeyIndex', 0);
				}
				// wpa
				if (Type == "wpa") {
					config.plusSetAttribute('preSharedKey', "\"" + Password + "\"");
					config.plusSetAttribute('hiddenSSID', true);

					config.plusGetAttribute('allowedAuthAlgorithms').set(WifiConfiguration.AuthAlgorithm.OPEN);
					config.plusGetAttribute('allowedGroupCiphers').set(WifiConfiguration.GroupCipher.TKIP);
					config.plusGetAttribute('allowedKeyManagement').set(WifiConfiguration.KeyMgmt.WPA_PSK);
					config.plusGetAttribute('allowedPairwiseCiphers').set(WifiConfiguration.PairwiseCipher.TKIP);
					// 此处需要修改否则不能自动重联
					//config.plusGetAttribute('allowedProtocols').set(WifiConfiguration.Protocol.WPA);
					config.plusGetAttribute('allowedGroupCiphers').set(WifiConfiguration.GroupCipher.CCMP);
					config.plusGetAttribute('allowedPairwiseCiphers').set(WifiConfiguration.PairwiseCipher.CCMP);
					config.plusSetAttribute('status', WifiConfiguration.Status.ENABLED);
				}
				return config;



			}

			//-------------------------ios代码
		
		/* 验证wifi 密码结束 */
		
		// 访问完 ip_dress 后，关闭弹窗
		function ipDressBtnClose(){
			$('.switchTolanya').hide();
		}

		// 就餐人数删减
		function reduceNum(){
			var num_val = Number($('#num_val').val());
			if(num_val >=1){
				$('#num_val').val(num_val - 1);
			}else{
				$('#num_val').val('0');
			}
		}
		function addNum(){
			var num_val = Number($('#num_val').val());
			$('#num_val').val(num_val + 1);
		}
		function weightShow_wrap(){
			console.log('打开弹窗')
			$('.weightshow_tc').show();
		}

//获取然后将修改后的用户、损耗比更新到对应的用户项目中去
function getAndSetEquipment(number,wasteRate){
	//alert('要更新的数据是'+deviceId+','+name+','+userId+','+item+','+weightUnitE+','+wasteRate+','+number+','+serviceId+','+characteristicId+','+onlineType)
	//再更新用户当前的设备信息
	$.ajax({
		url: 'https://192.168.1.55:448/user/updateEquipment',  // 更新设备接口
		type: 'post',
		data: {
			'mac': deviceId,
			'name': name, // 绑定设备的左右称的名称,
			'user_id': userId,
			'item': item, // 项目名称 ，油盐...
			'unit': weightUnitE, // 指标单位
			'number':number,  //用餐人数
			'target': wasteRate, // 损耗比
			'device_name':name,  //设备名
			'service_id': serviceId,
			'characteristic_id': characteristicId,
			'online_type': onlineType // 传递的蓝牙或者wifi  //1 蓝牙  2. wifi
		},
		dataType: 'json',
		success: function(result) {
			console.log('已将最新的用餐人数、损耗比更新到数据库对应的项目里!')
		},
		error: function(err){
			console.log(err);
		}
	})
}
		