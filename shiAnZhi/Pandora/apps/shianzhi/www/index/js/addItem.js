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
    var nameString = 'ck_' + name + '=' + value
    var expiryString = ''
    if (expiry != null) {
      try {
        expiryString = '; expires=' + expiry.toUTCString()
      } catch (e) {
        if (expiry) {
          var lsd = new Date()
          lsd.setTime(lsd.getTime() + expiry * 1000)
          expiryString = '; expires=' + lsd.toUTCString()
        }
      }
    } else {
      var ltm = new Date()
      expiryString = '; expires=' + ltm.toUTCString()
    }
    var pathString = path == null ? ' ;path=/' : ' ;path = ' + path
    var domainString = domain == null ? '' : ' ;domain = ' + domain
    var secureString = secure ? ';secure=' : ''
    document.cookie =
      nameString + expiryString + pathString + domainString + secureString
  },
  getCookie: function(name) {
    var i,
      aname,
      value,
      ARRcookies = document.cookie.split(';')
    for (i = 0; i < ARRcookies.length; i++) {
      aname = ARRcookies[i].substr(0, ARRcookies[i].indexOf('='))
      value = ARRcookies[i].substr(ARRcookies[i].indexOf('=') + 1)
      aname = aname.replace(/^\s+|\s+$/g, '')
      if (aname == 'ck_' + name) {
        return value
      }
    }
    return ''
  },
  removeCookie: function(name) {
    this.setCookie(name, '', -1)
  }
}
var storageObject = {
  localGetItem: function(key) {
    //假如浏览器支持本地存储则从localStorage,localStorage，否则乖乖用Cookie
    return window.localStorage
      ? localStorage.getItem(key)
      : cookieObject.getCookie(key)
  },
  localSetItem: function(key, val) {
    return window.localStorage
      ? localStorage.setItem(key, val)
      : cookieObject.setCookie(key, val)
  },
  localRemoveItem: function(key) {
    return window.localStorage
      ? localStorage.removeItem(key)
      : cookieObject.removeCookie(key)
  },
  sessionGetItem: function(key) {
    return window.localStorage
      ? localStorage.getItem(key)
      : cookieObject.getCookie(key)
  },
  sessionSetItem: function(key, val) {
    return window.localStorage
      ? localStorage.setItem(key, val)
      : cookieObject.setCookie(key, val)
  },
  sessionRemoveItem: function(key) {
    return window.localStorage
      ? localStorage.removeItem(key)
      : cookieObject.removeCookie(key)
  }
}

var item = ''; //大类别food_item的值,下面需要用到
var goodsItemIndex = 0 //大类别food_item添加序号,下面需要用到
/* 已进入首页就初始化查看是否有数据 */
var foodType = $('#foodType') //顶部食品名称列表
var foodAmount = $('#foodAmount') //顶部食品名称相对于的详细数据
var guideIntake = 0 //某一个食物大类别的指导摄入量重量,在添加设备时获取
var weightUnit = '克'
var weightUnit1 = 'g'
var now = new Date();
var year = now.getFullYear();
var month = ((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)
var day = (now.getDate()<10?"0":"")+now.getDate();
var hour = (now.getHours()<10?"0":"")+now.getHours();


var foodTypeAll = '' //存储食物大类别的具体数据,用@@分割,第一个数据为食物类别名,第二个数据为类别推荐指标(就是上面的指导摄入量重量guideIntake),第三个数据为食称重单位,第四个数据为绑定的设备名,第五个数据为今日摄入量,第六个为剩余总重量

// var selectedEquipBound='';//设备左右所绑定的项目

window.onload = function() {
  var addDevice = document.getElementById('addDevice')
  var addDeviceBg = document.getElementById('addDeviceBg')
  var addDeviceClose = document.getElementById('addDeviceClose')
  addDeviceBg.onclick = function() {
    addDevice.style.display = 'none'
  $('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
  }
  addDeviceClose.onclick = function() {
    addDevice.style.display = 'none'
      $('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
  }
  /* 添加设备弹窗相关方法 end */
  /* 还无设备弹窗相关方法 */
  var deviceBox = document.getElementById('deviceBox')
  var deviceBg = document.getElementById('deviceBg')
  var deviceClose = document.getElementById('deviceClose')
  deviceBg.onclick = function() {
    deviceBox.style.display = 'none'
      $('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
  }
  deviceClose.onclick = function() {
    deviceBox.style.display = 'none'
      $('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
  }
  /* 还无设备弹窗相关方法 end */


}
var setIntervalSendToBT;
var getEquipments; //所有去重的设备列表
var getAllEquipments; //所有未去重的设备列表
$(function() {
	/* 添加设备弹窗相关方法 */
	var userId = window.localStorage.getItem('useId')
	/* 获取蓝牙数据信息 */
	var deviceName = window.localStorage.getItem('deviceName')
	//var deviceId = window.localStorage.getItem('deviceId') //mac
	var serviceId = window.localStorage.getItem('serviceId')
	var characteristicId = window.localStorage.getItem('characteristicId')
	let personNum = storageObject.localGetItem('personNum')
	let wasteNum = storageObject.localGetItem('wasteNum')
	let userName = storageObject.localGetItem('userName')
	let groupPhone = storageObject.localGetItem('groupPhone')

  // 添加项目弹窗
  $('#addDeviceBtn1,#addDeviceBtn').click(function() {
    $('.add_item').show()
  })
  /* 下一步方法 */
    getDevice();
  $('#addDeviceNext1').on('click', function () {

      foodTypeAll = '' //存储新的数据之前，将全局变量先清空
      let typeThat = $(this).parents('.add_dev_one');
      let addTypeName = typeThat.find('#addType1').children('.type1_active').text();
      let addTypeUnit = typeThat.find('#addType2').children('.type2_active').text();
      let addTypeNum = typeThat.find('.recommend_bun').val();

      var foodItemArr = [];
      $('#detailType .detail_item').each(function(){  // 项目类别不能重复
      	foodItemArr.push($(this).text());
      });
      if(foodItemArr.indexOf(addTypeName) != -1){ // 如果添加的项目重复，提示更换添加项目
      	alert('项目类别重复请更换项目');
      	return false;
      }else{  // 如果没有重复添加的项目，就进行下一步，开始绑定添加设备
      	 $('#addDevice').hide(); // 添加项目隐藏
			/* 查询设备信息列表数据 */
			console.log('getDevice -- getEquipments:' + getEquipments);
			if (getEquipments && getEquipments.length > 0) {
				var peon = getEquipments;
				var l = JSON.stringify(peon);
				console.log('首页去重后设备列表JSON.stringify(result)==' + l);
				var html = '';
				for (var i = 0; i < peon.length; i++) {
					if (peon[i].device_name) { // 如果数据库有设备列表
						var li = '';
						if (i == 0) {
							li += '<li class="equipments_item clearfix" item= ' + peon[i].item + ' mac=' + peon[i].mac + '  service_id=' + peon[i].service_id + ' characteristic_id=' + peon[i].characteristic_id + '>';
							li += '<span class="equipments_name">' + peon[i].device_name + '</span><span class="position left">左边</span><span class="equipments_function">未绑定</span>';
							li += '<input type="hidden" class="bountInput" value="">';
							li += '<em class="equipments_check equipments_active" onclick="deviceCheck(this)"><i class="iconfont"></i></em>';
							li += '</li>';
						} else {
							li += '<li class="equipments_item clearfix" item= ' + peon[i].item + ' mac=' + peon[i].mac + '  service_id=' + peon[i].service_id + ' characteristic_id=' + peon[i].characteristic_id + '>';
							li += '<span class="equipments_name">' + peon[i].device_name + '</span><span class="position left">左边</span><span class="equipments_function">未绑定</span>';
                            li += '<input type="hidden" class="bountInput" value="">';
							li += '<em class="equipments_check" onclick="deviceCheck(this)"><i class="iconfont"></i></em>';
							li += '</li>'
						}
						li += '<li class="equipments_item clearfix" item= ' + peon[i].item + ' mac=' + peon[i].mac + '  service_id=' + peon[i].service_id + ' characteristic_id=' + peon[i].characteristic_id + '>';
						li += '<span class="equipments_name">' + peon[i].device_name + '</span><span class="position right">右边</span><span class="equipments_function">未绑定</span>';
                        li += '<input type="hidden" class="bountInput" value="">';
						li += '<em class="equipments_check " onclick="deviceCheck(this)"><i class="iconfont"></i></em>';
						li += '</li>';
						html += li;
					}
				}
				$('#equipmentsList').html(html);
				hasEquipmentList = true;
                checkIfBangding();
				$('#deviceBox').hide();
				$('#newEquipments').show();
			} else { // 如果数据库没有设备列表，需要重新添加设备
				hasEquipmentList = false;
				$('#deviceBox').show();
				$('#newEquipments').hide();
			}
		}

      /* 单位赋值 */
      guideIntake = addTypeNum;//某一个食物大类别的指导摄入量重量
      weightUnit = addTypeUnit;
      if (addTypeUnit == '克') {
          weightUnit1 = 'g';
      } else {
          weightUnit1 = 'ml';
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
  });

 /* 绑定后点击完成开始 */
 $('#addDeviceNext2').on('click', function () {
     submitEdit();
 });
 /* 绑定后点击完成结束 */

  $('#addDeviceNext3').on('click', function() {
    /* 这里先扫描二维码 */
    $('#deviceBox').hide()
    // $('#confirmDevice').show()
  })
  $('#addDeviceNext4').on('click', function() {
      var boundItem = $('.equipments_active').closest('li').find('.equipments_function').attr("bound");
      // selectedEquipBound = $('.equipments_active').closest('li').find('.bountInput').val();
      // console.log("selectedEquipBound::"+selectedEquipBound)
      if(boundItem){
          var item_0 = $.trim($('#addType1 .type1_active').text()); // 初始项目
          $("#BoundItem").text(boundItem)
          $("#NewItem").text(item_0)
          $(".shebeiliebiao_note,.need_add_type_bg").show();
          return
      }
      else{
          $("#BoundItem").text('')
          $("#NewItem").text('')
      }
      nextStepToBind();
  })
    $('.need_add_type .btn_add').click(function () {
        $('.add_item').show();
        $(".need_add_type,.need_add_type_bg").hide();
    })
    $(".need_add_type .btn_cancle,.need_add_type_bg").click(function(){
        $(".need_add_type,.need_add_type_bg").hide();
    })
    $(".shebeiliebiao_note .btn_cancle,.need_add_type_bg").click(function(){
        $(".shebeiliebiao_note,.need_add_type_bg").hide();
    })
  /* 上一步方法 */
  $('#devicePrevious1').on('click', function() {
    $('#addDevice').hide()
  })
  $('#devicePrevious2').on('click', function() {
    $('#newEquipments').show()
    $('#addDevice')
      .hide()
      .find('.add_dev_one')
      .show()
      .next('.add_dev_two')
      .hide()
    /* foodTypeAll = foodTypeAll.substr(0,foodTypeAll.lastIndexOf('@@'));  //添加设备点击上一步时,去掉foodTypeAll最后面已经添加的设备名称
		storageObject.localRemoveItem('foodTypeVal'); */
  })
  $('#devicePrevious3').on('click', function() {
    $('#addDevice').show()
    $('#deviceBox').hide()
  })
  $('#devicePrevious4').on('click', function() {
      $('#addDevice').show();
      // $('#confirmDevice').show();
      $('#newEquipments').hide();
  })

  /* 添加设备弹窗相关方法 */
  $('#addType1').on('click', 'li', function() {
    let thatType = $(this)
    if (thatType.hasClass('type1_customize')) {
      $('#customizeProject').show()
    } else {
      thatType
        .addClass('type1_active')
        .siblings()
        .removeClass('type1_active')
    }
  })
  $('#addType2').on('click', 'li', function() {
    let thatType = $(this)
    thatType
      .addClass('type2_active')
      .siblings()
      .removeClass('type2_active')
  })

  /* 点击减按钮 */
  $('.recommend_decrease').on('click', function() {
    let thatPlus = $(this)
    let inputVal = parseInt(thatPlus.siblings('.recommend_bun').val())
    if (inputVal === 0) {
      thatPlus.siblings('.recommend_bun').val(0)
    } else {
      thatPlus.siblings('.recommend_bun').val(inputVal - 1)
    }
  })

  /* 点击加按钮 */
  $('.recommend_increase').on('click', function() {
    let thatPlus = $(this)
    let inputVal = parseInt(thatPlus.siblings('.recommend_bun').val())
    if (inputVal > 9998) {
      thatPlus.siblings('.recommend_bun').val(9999)
    } else {
      thatPlus.siblings('.recommend_bun').val(inputVal + 1)
    }
  })
  $('#customizeBg,#customizeClose').on('click', function() {
    $('#customizeProject').hide()
  })
  $('#customizeIcon').on('click', function() {
    $(this)
      .siblings('#customizeName')
      .val('')
      .focus()
  })
  $('#customizeConfirm').on('click', function() {
    let _that = $(this)
    let customizeNameVal = _that.siblings('#customizeName').val()
    if (customizeNameVal.length > 0) {
      $('#customizeProject').hide()
      /* 插入输入的新的自定义项目名 */
      $('.type1_customize')
        .siblings()
        .removeClass('type1_active')
        .end()
        .before('<li class="type1_active">' + customizeNameVal + '</li>')
    } else {
      _that.addClass('customize_embar')
    }
  })
  $('#customizeName').on('focus', function() {
    $(this)
      .siblings('#customizeConfirm')
      .removeClass('customize_embar')
  })
  /* 添加设备弹窗相关方法 end */

  /* 添加新设备列表弹窗相关方法 start*/
  $('#device_bg,#newEquipmentsClose').on('click', function() {
    $('#newEquipments').hide()
  })
  /* $('#equipmentsList').on('click','.equipments_item',function(){
		let thatEqu = $(this);
		thatEqu.find('.equipments_check').addClass('equipments_active').end().siblings().find('.equipments_check').removeClass('equipments_active');
	}) */

  /* 添加新设备列表弹窗相关方法 end */

  /* 确认设备弹窗相关方法 */
  $('#confirmBackBtn,#confirmDeviceBack').on('click', function() {
    let thatType = $(this)
    thatType.parents('#confirmDevice').hide()
    $('#deviceBox').show()
  })

  /* 确认设备弹窗相关方法 end */


  /* 系统链接方式开始 */
  $('.password_del').click(function() {
    $('.password_val').val('')
  })
  $('#systemLinkClose,.link_center .cancel').click(function() {
    $('#wife_link').hide()
    $('#device_link').show()
  })
  $('.link_center .sure').click(function() {
    $('#wife_link').hide()
    $('#device_link').hide()
    $('#device_tips')
      .show()
      .fadeOut(500)

    var wifiName = $.trim($('#wifiList option:selected').text())
    var wifiPassword = $.trim($('#wifiPassowrd').val())
    var link_wifi = 'wifi_' + wifiName + '=' + wifiPassword
    console.log('link_wifi == ' + link_wifi)
    // 重启 app
    window.localStorage.setItem('device_link', link_wifi)
  })
  /* 系统链接方式结束 */


})


/*  进入页面，看看有没有蓝牙或者wifi 选项*/
var device_link = window.localStorage.getItem("device_link");//首次默认选择蓝牙或者无线
if(device_link && device_link != ''){
	$('#device_link').hide();
}else{
	$('#device_link').show();
}

/* 蓝牙变量开始 */
var bds = []; // 可连接设备列表
var deviceId = null,
	bconnect = false;
var bss = []; // 连接设备服务列表
var serviceId = null;
var bscs = []; // 连接设备服务对应的特征值列表
var characteristicId = null;
var bscws = []; // 可写特征值列表
var wcharacteristicId = null;
var hclanya = ''
/* 蓝牙变量结束 */

var lanyaarr = [];
var text = '';
var img = null;
var blist = [];

var deviceName = '';
var deviceId = '';
var serviceId = '';
var characteristicId = '';

function scaned(t, r, f) {
	var d = new Date();
	var h = d.getHours(),
		m = d.getMinutes(),
		s = d.getSeconds(),
		ms = d.getMilliseconds();
	if (h < 10) { // 扫描时间
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
	var ts = '[' + h + ':' + m + ':' + s + '.' + ms + ']';
	var li = null,
		hl = document.getElementById('history');
	if (blist.length > 0) {
		li = document.createElement('li');
		li.className = 'ditem';
		hl.insertBefore(li, hl.childNodes[0]);
	} else {
		li = document.getElementById('nohistory');
	}
	li.id = blist.length;
	var html = '[' + h + ':' + m + ':' + s + '.' + ms + ']' + '　　' + t + '码<div class="hdata">';
	html += r;
	html += '</div>';
	li.innerHTML = html;
	text = r;
	//  alert(text);

	var deviceArr = r.split(',');

	var deviceName = deviceArr[0];
	/* if(deviceName){
		alert(deviceName);
	} */

	deviceName = deviceArr[0];
	deviceId = deviceArr[1];
	serviceId = deviceArr[2];
	characteristicId = deviceArr[3];

	 //alert( '扫描读取的二维码数据' + deviceName + ',' + deviceId + ',' + serviceId + ',' + characteristicId );

	window.localStorage.setItem('deviceName', deviceName);
	window.localStorage.setItem('deviceId', deviceId);
	window.localStorage.setItem('serviceId', serviceId);
	window.localStorage.setItem('characteristicId', characteristicId);


	//var name = text.substring(0,text.indexOf('&'));
	//var url = text.substring(text.indexOf('&')+1,text.length+1);
	$('#confirm_name').text(deviceName).attr('mac',deviceId);
	// $('#cold_img').attr('src',url);
	// window.localStorage.setItem('device_name',deviceName); // 设备名称
	// window.localStorage.setItem('device_img',url); // 设备图片

	$('#deviceBox').hide();
	$('#confirmDevice').show();
	$('#newEquipments').hide();

	li.setAttribute('onclick', 'selected(id)');
	blist[blist.length] = {
		type: t,
		result: r,
		file: f
	};
	update(t, r, f);

}

function selected(id) { // 选择二维码
	var h = blist[id];
	update(h.type, h.result, h.file);
	if (h.result.indexOf('http://') == 0 || h.result.indexOf('https://') == 0) {
		plus.nativeUI.confirm(h.result, function(i) {
			if (i.index == 0) {
				plus.runtime.openURL(h.result);
			}
		}, '', ['打开', '取消']);
	} else {
		plus.nativeUI.alert(h.result);
	}
}

function update(t, r, f) {
	console.log('扫描成功：');
	console.log(t);
	console.log(r);
	console.log('\n图片地址：' + f);
	if (!f || f == 'null') {
		img.src = '../img/barcode.png';
	} else {
		plus.io.resolveLocalFileSystemURL(f, function(entry) {
			img.src = entry.toLocalURL();
		});
		//img.src = 'http://localhost:13131/'+f;
	}
}

function onempty() {
	if (window.plus) {
		plus.nativeUI.alert('无扫描记录');
	} else {
		alert('无扫描记录');
	}
}

function cleanHistroy() {
	if (blist.length > 0) {
		var hl = document.getElementById('history');
		hl.innerHTML = '<li id="nohistory" class="ditem" onclick="onempty();">无历史记录	</li>';
	}
	plus.io.resolveLocalFileSystemURL('_doc/barcode/', function(entry) {
		entry.removeRecursively(function() {
			// Success
		}, function(e) {
			//alert( "failed"+e.message );
		});
	});
}
// 打开二维码扫描界面
function openBarcode() {
	createWithoutTitle('../plus/barcode_scan.html', {
		titleNView: {
			type: 'float',
			backgroundColor: 'rgba(215,75,40,0.3)',
			titleText: '扫一扫',
			titleColor: '#FFFFFF',
			autoBackButton: true,
			buttons: [{
				fontSrc: '_www/helloh5.ttf',
				text: '\ue302',
				fontSize: '18px',
				onclick: 'javascript:scanPicture()'
			}]
		}
	});
}
// 打开自定义扫描界面
/* function openBarcodeCustom() {
	createWithoutTitle('../plusbarcode_custom.html', {
		titleNView: {
			type: 'float',
			backgroundColor: 'rgba(215,75,40,0.3)',
			titleText: '扫一扫',
			titleColor: '#FFFFFF',
			autoBackButton: true,
			buttons: [{
				fontSrc: '_www/helloh5.ttf',
				text: '\ue401',
				fontSize: '18px',
				onclick: 'javascript:switchFlash()'
			}]
		}
	});
} */

/* 蓝牙*/
/* 蓝牙变量开始 */
// var bds = []; // 可连接设备列表
// var deviceId = null,
// 	bconnect = false;
// var bss = []; // 连接设备服务列表
// var serviceId = null;
// var bscs = []; // 连接设备服务对应的特征值列表
// var characteristicId = null;
// var bscws = []; // 可写特征值列表
// var wcharacteristicId = null;
/* 蓝牙变量结束 */

// 重设数据
function resetDevices(d, s) {
	d || (bds = [], deviceId = null, document.getElementById('deivce').value = '');
	s || (bss = [], serviceId = null, document.getElementById('service').value = '');
	bscs = [], bscws = [], characteristicId = null, wcharacteristicId = null, document.getElementById('characteristic')
		.value = '', document.getElementById('wcharacteristic').value = '';
}

// 页面初始化操作
document.addEventListener('plusready', function(e) {

	// connectDevice('FC:F5:C4:16:24:AA'); // 链接蓝牙设备
	// 监听蓝牙适配器状态变化
	plus.bluetooth.onBluetoothAdapterStateChange(function(e) {
		console.log('onBluetoothAdapterStateChange: ' + JSON.stringify(e));
	});
	//  监听搜索到新设备
	plus.bluetooth.onBluetoothDeviceFound(function(e) {
		var devices = e.devices;
		console.log('onBluetoothDeviceFound: ' + devices.length);
		for (var i in devices) {
			console.log(JSON.stringify(devices[i]));
			var device = devices[i];
			if (device.deviceId /*&&device.name&&device.name.length>0&&device.name!='null'*/ ) {
				bds.push(device);
			}
		}
		if (!bconnect && bds.length > 0) { // 默认选择最后一个
			var n = bds[bds.length - 1].name;
			if (!n || n.length <= 0) {
				n = bds[bds.length - 1].deviceId;
			}
			document.getElementById('deivce').value = n;
			deviceId = bds[bds.length - 1].deviceId;

		}
	});


	//  监听低功耗蓝牙设备连接状态变化
	plus.bluetooth.onBLEConnectionStateChange(function(e) {
		console.log('onBLEConnectionStateChange: ' + JSON.stringify(e));
		if (deviceId == e.deviceId) { // 更新连接状态
			bconnect = e.connected;
			console.log('监听的链接状态是 == ' + bconnect);

		}
	});
	// 监听低功耗蓝牙设备的特征值变化
	plus.bluetooth.onBLECharacteristicValueChange(function(e) {
		/* console.log('onBLECharacteristicValueChange: ' + JSON.stringify(e));
		var value = buffer2hex(e.value);

		console.log('value(hex) = ' + value); */

		var value1 = buffer2hex(e.value); // 调用  arrayBuffer 数据类型转16进制方法，把数据转成 16进制的
		 console.log('value(hex) = ' + value1);
		var v2 = value1.replace(/0x3/g, ''); // 去掉所有的 '0x3', '0x' 是转16进制时候，自己添加的，3是16进制的标识，所有字符串前面都有个 3 。
		// console.log('接收的数据是 == ' + v2);
		var v3 = v2.replace(/0x5f/g, '_'); // 去掉所有的 '0x5f', '0x' 是转16进制时候，自己添加的，5f 是 16 进制的标识： 转换成字符串后就是  _   。
		var v4 = v3.replace(/0x2e/g, '.'); // 去掉所有的 '0x2e', '0x' 是转16进制时候，自己添加的，2e 是 16 进制的标识： 转换成字符串后就是  .  。
		var value = v4.replace(/ /g, ''); // 去掉所有的 空格，空格是自己转 16进制的时候自己添加的 ; 这时候得到的数据是真实的数字
		value = value.replace(/0x2d/g, '');
		// console.log('接收的最终数据 =='+ value);
		$('#yalan').val(value);
		/* value = '1597386951048_226_0'; */
		deviceChanges(value); //typeName为大类别名称,value为重量.蓝牙值发生变化,对应的大规格的展示数据要变化,还要将变化的值传到后台

		hclanya += value + '&';
		window.localStorage.setItem('lanya', hclanya);
		var lanya_h = window.localStorage.getItem("hclanya");
		$('#huancun').val(lanya_h)
		// console.log('获取的缓存值是:' + hclanya);
		// alert('获取的缓存值是:'+lanya_h);

		if (characteristicId == e.characteristicId) {
			// 更新到页面显示
			document.getElementById('readvalue').value = value;
		} else if (wcharacteristicId == e.characteristicId) {
			plus.nativeUI.toast(value);
		}
	});
}, false);

function buffer2hex(value) {
	var t = '';
	if (value) {
		var v = new Uint8Array(value);
		for (var i in v) {
			t += '0x' + v[i].toString(16) + ' ';
		}
	} else {
		t = '无效值';
	}
	return t;
}

// 打开蓝牙
function openBluetooth() {
	console.log('打开蓝牙适配器：');
	plus.bluetooth.openBluetoothAdapter({
		success: function(e) {
			console.log('打开成功!');
		},
		fail: function(e) {
			console.log('打开失败! ' + JSON.stringify(e));
			alert('打开蓝牙失败，请重新打开');
		}
	});
}

// 开始搜索蓝牙设备
function startDiscovery() {
	console.log('开始搜索蓝牙设备：');
	resetDevices();
	plus.bluetooth.startBluetoothDevicesDiscovery({
		success: function(e) {
			console.log('开始搜索成功!' + JSON.stringify(e));
		},
		fail: function(e) {
			console.log('开始搜索失败! ' + JSON.stringify(e));
		}
	});
}

// 停止搜索蓝牙设备
function stopDiscovery() {
	console.log('停止搜索蓝牙设备：');
	plus.bluetooth.stopBluetoothDevicesDiscovery({
		success: function(e) {
			console.log('停止搜索成功!');
		},
		fail: function(e) {
			console.log('停止搜索失败! ' + JSON.stringify(e));
		}
	});
}

// 选择蓝牙设备
function selectDevice() {
	if (bds.length <= 0) {
		plus.nativeUI.toast('未搜索到有效蓝牙设备!');
		return;
	}
	var bts = [];
	for (var i in bds) {
		var t = bds[i].name;
		if (!t || t.length <= 0) {
			t = bds[i].deviceId;
		}
		bts.push({
			title: t
		});
	}
	plus.nativeUI.actionSheet({
		title: "选择蓝牙设备",
		cancel: "取消",
		buttons: bts
	}, function(e) {
		if (e.index > 0) {
			document.getElementById('deivce').value = bds[e.index - 1].name;
			deviceId = bds[e.index - 1].deviceId;
			console.log('选择了蓝牙: == "' + bds[e.index - 1].name + '"');
		}
	});
}

// 连接蓝牙设备
function connectDevice(deviceId) {
	if (!deviceId) {
		plus.nativeUI.toast('未选择设备!');
		return;
	}
	console.log('连接设备deviceId == : ' + deviceId);
	plus.bluetooth.createBLEConnection({
		deviceId: deviceId,
		success: function(e) {
			console.log('连接成功!');
		},
		fail: function(e) {
			console.log('连接失败! ' + JSON.stringify(e));
			alert('蓝牙链接失败，请重新链接');
		}
	});
}
// 获取设备服务
function getServices(deviceId,bconnect) {
	if (!deviceId) {
		plus.nativeUI.toast('未选择设备!');
		return;
	}
	 if (!bconnect) {
		plus.nativeUI.toast('未连接蓝牙设备!');
		return;
	}
	resetDevices(true);
	console.log('获取蓝牙设备服务:');
	plus.bluetooth.getBLEDeviceServices({
		deviceId: deviceId,
		success: function(e) {
			var services = e.services;
			console.log('获取服务成功! ' + services.length);
			if (services.length > 0) {
				for (var i in services) {
					bss.push(services[i]);
					console.log(JSON.stringify(services[i]));
				}
				if (bss.length > 0) { // 默认选择最后一个服务
					document.getElementById('service').value = serviceId = bss[bss.length - 1].uuid;

				}
			} else {
				console.log('获取服务列表为空?');
			}
		},
		fail: function(e) {
			console.log('获取服务失败! ' + JSON.stringify(e));
		}
	});
}
// 选择服务
function selectService() {
	if (bss.length <= 0) {
		plus.nativeUI.toast('未获取到有效蓝牙服务!');
		return;
	}
	var bts = [];
	for (var i in bss) {
		bts.push({
			title: bss[i].uuid
		});
	}
	plus.nativeUI.actionSheet({
		title: "选择服务",
		cancel: "取消",
		buttons: bts
	}, function(e) {
		if (e.index > 0) {
			document.getElementById('service').value = serviceId = bss[e.index - 1].uuid;
			console.log('选择了服务: "' + serviceId + '"');
		}
	});
}

// 获取服务的特征值
function getCharacteristics() {
	if (!deviceId) {
		plus.nativeUI.toast('未选择设备!');
		return;
	}
	if (!bconnect) {
		plus.nativeUI.toast('未连接蓝牙设备!');
		return;
	}
	if (!serviceId) {
		plus.nativeUI.toast('未选择服务!');
		return;
	}
	resetDevices(true, true);
	console.log('获取蓝牙设备指定服务的特征值:');
	plus.bluetooth.getBLEDeviceCharacteristics({
		deviceId: deviceId,
		serviceId: serviceId,
		success: function(e) {
			var characteristics = e.characteristics;
			console.log('获取特征值成功! ' + characteristics.length);
			if (characteristics.length > 0) {
				for (var i in characteristics) {
					var characteristic = characteristics[i];
					console.log(JSON.stringify(characteristic));
					if (characteristic.properties) {
						if (characteristic.properties.read) {
							bscs.push(characteristics[i]);
						}
						if (characteristic.properties.write) {
							bscws.push(characteristics[i]);
							if (characteristic.properties.notify || characteristic.properties.indicate) {
								plus.bluetooth.notifyBLECharacteristicValueChange({ //监听数据变化
									deviceId: deviceId,
									serviceId: serviceId,
									characteristicId: characteristic.uuid,
									success: function(e) {
										console.log('notifyBLECharacteristicValueChange ' + characteristic.uuid + ' success.');
									},
									fail: function(e) {
										console.log('notifyBLECharacteristicValueChange ' + characteristic.uuid + ' failed! ' + JSON.stringify(
											e));
									}
								});
							}
						}
					}
				}
				if (bscs.length > 0) { // 默认选择最后特征值
					document.getElementById('characteristic').value = characteristicId = bscs[bscs.length - 1].uuid;
				}
				if (bscws.length > 0) { // 默认选择最后一个可写特征值
					document.getElementById('wcharacteristic').value = wcharacteristicId = bscws[bscws.length - 1].uuid;
				}
			} else {
				console.log('获取特征值列表为空?');
			}
		},
		fail: function(e) {
			console.log('获取特征值失败! ' + JSON.stringify(e));
		}
	});
}

// 选择特征值(读取)
function selectCharacteristic() {
	if (bscs.length <= 0) {
		plus.nativeUI.toast('未获取到有效可读特征值!');
		return;
	}
	var bts = [];
	for (var i in bscs) {
		bts.push({
			title: bscs[i].uuid
		});
	}
	plus.nativeUI.actionSheet({
		title: '选择特征值',
		cancel: '取消',
		buttons: bts
	}, function(e) {
		if (e.index > 0) {
			document.getElementById('characteristic').value = characteristicId = bscs[e.index - 1].uuid;
			console.log('选择了特征值: "' + characteristicId + '"');
		}
	});
}

// 读取特征值数据
function readValue(deviceId, bconnect, serviceId, characteristicId) {
	if (!deviceId) {
		plus.nativeUI.toast('未选择设备!');
		return;
	}
	if (!bconnect) {
		plus.nativeUI.toast('未连接蓝牙设备!');
		return;
	}
	if (!serviceId) {
		plus.nativeUI.toast('未选择服务!');
		return;
	}
	if (!characteristicId) {
		plus.nativeUI.toast('未选择读取的特征值!');
		return;
	}
	console.log('读取蓝牙设备的特征值数据: ');
	plus.bluetooth.readBLECharacteristicValue({
		deviceId: deviceId,
		serviceId: serviceId,
		characteristicId: characteristicId,
		success: function(e) {
			console.log('读取数据成功!');

		},
		fail: function(e) {
			console.log('读取数据失败! ' + JSON.stringify(e));
		}
	});
}

// 选择特征值(写入)
function selectwCharacteristic() {
	if (bscws.length <= 0) {
		plus.nativeUI.toast('未获取到有效可写特征值!');
		return;
	}
	var bts = [];
	for (var i in bscws) {
		bts.push({
			title: bscws[i].uuid
		});
	}
	plus.nativeUI.actionSheet({
		title: '选择特征值',
		cancel: '取消',
		buttons: bts
	}, function(e) {
		if (e.index > 0) {
			document.getElementById('wcharacteristic').value = wcharacteristicId = bscws[e.index - 1].uuid;
			console.log('选择了特征值: "' + wcharacteristicId + '"');
		}
	});
}

// 写入特征值数据
function writeValue() {
	if (!deviceId) {
		plus.nativeUI.toast('未选择设备!');
		return;
	}
	if (!bconnect) {
		plus.nativeUI.toast('未连接蓝牙设备!');
		return;
	}
	if (!serviceId) {
		plus.nativeUI.toast('未选择服务!');
		return;
	}
	if (!wcharacteristicId) {
		plus.nativeUI.toast('未选择写入的特征值!');
		return;
	}
	var value = document.getElementById('writevalue').value;
	if (!value || value == '') {
		plus.nativeUI.toast('请输入需要写入的数据');
		document.getElementById('writevalue').focus();
		return;
	}
	// 转换为ArrayBuffer写入蓝牙
	str2ArrayBuffer(value, function(buffer) {
		console.log('写入蓝牙设备的特征值数据: ');
		plus.bluetooth.writeBLECharacteristicValue({
			deviceId: deviceId,
			serviceId: serviceId,
			characteristicId: wcharacteristicId,
			value: buffer,
			success: function(e) {
				console.log('写入数据成功!');
			},
			fail: function(e) {
				console.log('写入数据失败! ' + JSON.stringify(e));
			}
		});
	});
}

function str2ArrayBuffer(s, f) {
	var b = new Blob([s], {
		type: 'text/plain'
	});
	var r = new FileReader();
	r.readAsArrayBuffer(b);
	r.onload = function() {
		if (f) f.call(null, r.result)
	}
}

// 断开蓝牙设备
function disconnectDevice() {
	if (!deviceId) {
		plus.nativeUI.toast('未选择设备!');
		return;
	}
	resetDevices(true);
	console.log('断开蓝牙设备连接：');
	plus.bluetooth.closeBLEConnection({
		deviceId: deviceId,
		success: function(e) {
			console.log('断开连接成功!');
		},
		fail: function(e) {
			console.log('断开连接失败! ' + JSON.stringify(e));
		}
	});
}

// 关闭蓝牙
function closeBluetooth() {
	console.log('关闭蓝牙适配器：');
	resetDevices();
	plus.bluetooth.closeBluetoothAdapter({
		success: function(e) {
			console.log('关闭成功!');
			bconnect = false;
		},
		fail: function(e) {
			console.log('关闭失败! ' + JSON.stringify(e));
		}
	});
}

// 获取缓存值
var personNum = window.localStorage.getItem('personNum');
var wasteNum = window.localStorage.getItem('wasteNum');
var userName = window.localStorage.getItem('userName');
var groupPhone = window.localStorage.getItem('groupPhone');
var groupErweima = window.localStorage.getItem('groupErweima');
var lanya_h = window.localStorage.getItem("hclanya");

function saveEquipment(){ //添加设备
	connectDevice(deviceId); //  链接蓝牙
	$("#confirmDevice").hide();
	$('#newEquipments').show().find('.equipments_item .equipments_check').removeClass('equipments_active');
	// 展示设备列表
	var deviceName = $('#confirm_name').text();
	var mac = $('#confirm_name').attr('mac');
	var sameMac = false;
	$(".equipments_item").each(function(){
		var currentMac = $(this).attr("mac");
		if(currentMac == mac){
			alert("already add");
			sameMac = true;
			return false
		}
	})
	//alert('mac='+ mac);
	// 如果设备列表中已经有了相同的设备，则，不再次添加相同的设备
	// $('#equipmentsList li').each(function(){
	// 	if($.trim($(this).find('.equipments_name').text()) != deviceName){
	if(!sameMac) {
		var li = '';
		li += '<li class="equipments_item clearfix li_active" mac=' + mac + '>'
		li += '<span class="equipments_name">' + deviceName +
			'</span><span class="position left">左边</span><span class="equipments_function">已绑定</span>'
		li += '<em class="equipments_check equipments_active" onclick="deviceCheck(this)"><i class="iconfont"></i></em>'
		li += '</li>'
		li += '<li class="equipments_item clearfix" mac=' + mac + '>'
		li += '<span class="equipments_name">' + deviceName +
			'</span><span class="position right">右边</span><span class="equipments_function">未绑定</span>'
		li += '<em class="equipments_check " onclick="deviceCheck(this)"><i class="iconfont"></i></em>'
		li += '</li>'
		$('#equipmentsList').append(li);
		/* 添加设备结束，发送时间 */
		// 	}
		// })
		$.ajax({ //添加设备数据到后台
			url: 'https://192.168.1.55:448/user/equipmentAdd',
			type: 'post',
			data: {
				'mac': deviceId,
				'service_id': serviceId,
				'characteristic_id': characteristicId,
				'device_name': deviceName, // 绑定设备的左右称的名称,
				'user_id': userId,
				'online_type': 'bluetooth' // 传递的蓝牙或者wifi，默认传递蓝牙链接
			},
			dataType: 'json',
			success: function (result) {

				// alert('添加设备成功');
				// alert('添加设备成功的二维码数据' + deviceName + ',' + deviceId + ',' + serviceId + ',' + characteristicId);
				console.log(JSON.stringify(result));
			},
			error: function (ero) {
                alert('添加设备失败');
				console.log(JSON.stringify(ero));
			}
		})
	}
}

// 添加设备后读取蓝牙数据
function readlanya(deviceName, deviceId, serviceId, characteristicId) {
	// alert('缓存读取的二维码数据==' + deviceName + ',' + deviceId + ',' + serviceId + ',' + characteristicId);
	//connectDevice('FC:F5:C4:16:24:AA'); // 链接蓝牙设备
	// connectDevice(deviceId); // 链接蓝牙设备
	readValue(deviceId, true, serviceId, characteristicId); //动态读取蓝牙设备
	/* var n = 0;
	var timer = null;
	timer = setInterval(function() {
		n++;
		// readValue('FC:F5:C4:16:24:AA',true,'5FAFC201-1FB5-459E-8FCC-C5C9C331914B','5EB5483E-36E1-4688-B7F5-EA07361B26A8');
		readValue(deviceId, true, serviceId, characteristicId); //动态读取蓝牙设备
		if (n > 10) {
			clearInterval(timer);
		}
	}, 5000); */
}

// 添加设备后，发送数据
function writeCharacteristics(value_enty, type) {
	// alert('读取的二维码数据和发送的数据' + deviceName + ',' + deviceId + ',' + serviceId + ',' + characteristicId + ',' + value_enty);
	//alert('发送数据' + type + ' == ' + value_enty);
	// openBluetooth(); // 打开蓝牙
	// alert('发送时间时的deviceId ')
	// connectDevice(deviceId); //  链接蓝牙

	// 字符串转为ArrayBuffer对象，参数为字符串
	function str2ab(str) {
		var buf = new ArrayBuffer(str.length * 2); // 每个字符占用2个字节
		var bufView = new Uint16Array(buf);
		for (var i = 0, strLen = str.length; i < strLen; i++) {
			bufView[i] = str.charCodeAt(i);
		}
		return buf;
	};
	var value = str2ab(value_enty); //  发送 ArrayBuffer 数据
	// var value = value_enty; // 没有转化的数据
	//alert('发送的数据 == ' + value);
	plus.bluetooth.writeBLECharacteristicValue({
		deviceId: deviceId,
		serviceId: serviceId,
		characteristicId: characteristicId,
		value: value,
		success: function(e) {
			//alert('发送成功');
			console.log('write characteristics success: ' + JSON.stringify(e));
			// console.log('发送的数据是' + value);
			 var v = ab2str(value);
			// var v = value;
			// ArrayBuffer转为字符串，参数为ArrayBuffer对象
			function ab2str(buf) {
				return String.fromCharCode.apply(null, new Uint16Array(buf));
			}
			console.log('发送成功的数据是 == ' + v);
			//alert('发送成功的数据是 == ' + v);
		},
		fail: function(e) {
			//alert('发送失败');
			console.log('write characteristics failed: ' + JSON.stringify(e));
		}
	});
}

/* 绑定设备切换开始 */
function deviceCheck(obj){
	$(obj).closest('#equipmentsList').find('.equipments_check ').removeClass('equipments_active');
	$(obj).addClass('equipments_active');
	$(obj).closest('#equipmentsList').find('li').removeClass('li_active');
	$(obj).closest('li').addClass('li_active')
	// $(obj).closest('#equipmentsList').find('.equipments_function').text('未绑定');
	// $(obj).closest('.equipments_item').find('.equipments_function').text('已绑定');
}
/* 绑定设备切换结束 */

/* 默认蓝牙连接提示 */
function nextSet() {
  window.localStorage.setItem('device_link', 'switchBt')
  window.localStorage.setItem('device_link', 'switchBt')
  $('#device_link').hide()
  $('#systemHint').show()
}

/* * 时间戳转日期 */
function stampToDate(time) {
  var date = new Date(Number(time)*1000);//将接收到的的String类型的时间转为数字类型,时间戳为10位(秒)需timestamp*1000,如果是13位微秒不需乘1000
  var y = date.getFullYear();
  var m = date.getMonth() + 1;
  var d = date.getDate();
  var hour = date.getHours().toString();
  var minutes = date.getMinutes().toString();
  var seconds = date.getSeconds().toString();
  if(hour < 10) {
    hour = "0" + hour;
  }
  if(minutes < 10) {
    minutes = "0" + minutes;
  }
  if(seconds < 10) {
    seconds = "0" + seconds;
  }
  return y + '-' + (m < 10 ? ('0' + m) : m) + '-' + (d < 10 ? ('0' + d) : d) + " " + hour + ":" + minutes + ":" + seconds;
}

// 设备列表展示

function getBtnOrWifiData() { // 进入首页判断是蓝牙还是 wifi 链接，并且获取对应方式传递的重量数据
    var userId = window.localStorage.getItem('useId');
    var deviceId = $('#foodType .food_active').attr('deviceId');
    var serviceId = $('#foodType .food_active').attr('serviceId'); //获取被绑定的设备id
    var characteristicId = $('#foodType .food_active').attr('characteristicId'); //获取被绑定的设备id
    var food_active = $.trim($('#foodType .food_active').text());
    alert('切换类别获取的相关数据=' + food_active + ',' + userId + ',' + deviceId + ',' + serviceId + ',' + characteristicId);
    // 进入首页判断目前是蓝牙还是wifi l链接
    var link_state = localStorage.getItem('link_state');
    //alert('进入时候，链接状态是==' + link_state);
    // 如果首页有项目列表
    var item_length = $('#foodType').html();
    if (item_length) {
        // 如果有项目就获取蓝牙或者wifi 传递的数据
        if (link_state == 'switchBt') {
            // 如果是蓝牙，就链接蓝牙数据
            alert('目前是蓝牙链接，读取蓝牙称重数据');
            setIntervalSendToBT = setInterval(function () {
                // clearInterval(reconnectInterval);
                readlanya('', deviceId, serviceId, characteristicId);
            }, 7000)
        } else if (link_state == 'switchWifi') {
            // 如果是wifi 就通过wifi 接收称的数据到首页赋值
            alert('目前是wifi链接，读取wifi接口称重数据');
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
                success: function (result) {
                    alert('wifi返回数据成功');
                    alert('wifi链接接收数据==' + JSON.stringify(result));
                },
                error: function (ero) {
                    alert('wifi 返回数据失败' + JSON.stringify(ero));
                }
            })
        }
    }
}

function getDevice(){
    var userId = window.localStorage.getItem('useId');
    console.log("userId:"+userId)
    $.ajax({
        url:'https://192.168.1.55:448/user/getEquipmentDataList',
        type:'post',
        data:{'user_id':userId},
        dataType:'json',
        async:false,
        success:function(result){
            getAllEquipments = result;
            console.log('设备页设备列表result==' + JSON.stringify(result));
            //[{"characteristic_id":"5EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"ESP32-new-1","mac":"FC:F5:C4:16:24:AA","online_type":"bluetooth","service_id":"5FAFC201-1FB5-459E-8FCC-C5C9C331914B","user_id":"6"},{"item":"糖","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","user_id":"6"},{"item":"味精","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","user_id":"6"}]
            var obj = {};
            var peon = result.reduce(function(cur,next){
                obj[next.mac] ? "" : obj[next.mac] = true && cur.push(next);
                return cur;
            },[]);
            getEquipments = peon
        }
    })
}

/**
 *检测设备是否被绑定过，如果绑定过，保存个参数，让更新使用（将该绑定的设备的item名称改掉）
 */
function checkIfBangding() {
    console.log("checkIfBangdingFn")
    console.log(":::"+JSON.stringify(getAllEquipments))
    var listEquipments = $('#equipmentsList').find(".equipments_item");
    for (var i in getAllEquipments) {
        //getAllEquipments == [{"characteristic_id":"5EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"ESP32-new-1","mac":"FC:F5:C4:16:24:AA","online_type":"bluetooth","service_id":"5FAFC201-1FB5-459E-8FCC-C5C9C331914B","user_id":"6"},{"item":"糖","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","user_id":"6"},{"item":"味精","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","user_id":"6"}]
        if (getAllEquipments[i].name && getAllEquipments[i].item && getAllEquipments[i].mac) {
            listEquipments.each(function(){
                var currentListMac = $(this).attr('mac');
                var currentListItem = $(this).attr('item');
                var currentListName = $(this).find(".equipments_name").text()+$(this).find(".position").text().substring(1,0);
                let typeThat =  $('#addDeviceNext1').parents('.add_dev_one');
                let addTypeName = typeThat.find('#addType1').children('.type1_active').text();
                // console.log("currentListMac::"+currentListMac);
                // console.log("currentListName::"+currentListName);
                if (currentListMac == getAllEquipments[i].mac &&  currentListName == getAllEquipments[i].name && getAllEquipments[i].item) { //currentListItem == getAllEquipments[i].item &&
                    // console.log("已绑定-"+ getAllEquipments[i].item)
                    $(this).find(".equipments_function").text("已绑定-"+ getAllEquipments[i].item);
                    $(this).find(".equipments_function").attr("bound",getAllEquipments[i].item);
                    $(this).find(".bountInput").val(getAllEquipments[i].item);
                }
            })
        }
    }
}

/**
 * $('#addDeviceNext4') 方法独立
 */
function nextStepToBind(){
    var obj =  $('#addDeviceNext4');
    //  sendInfoToBL();  不需要发送蓝牙数据
    /* 发送蓝牙数据结束 */

    /* 设置是哪个称 ， 第一个盐左边是 1 ，第二个称右边是 2  */
    var position_text = $('.equipments_active').closest('li').find('.position').text();
    //alert(position_text)
    window.localStorage.setItem('position', position_text);

    $('#newEquipments').hide();
    let addDeviceName = $(obj).parents('.equipments_main').find('.equipments_active').siblings('.equipments_name').text();
    // console.log('addDeviceName:' + addDeviceName);
    let foodTypeAllArr = foodTypeAll.split('@@');
    $('#addDevice').show().find('.add_dev_one').hide().next('.add_dev_two').show().find('.add_txt1').text(foodTypeAllArr[0]).end()
        .find('.add_txt2').text(foodTypeAllArr[2]).end()
        .find('.add_txt3').text(foodTypeAllArr[1] + foodTypeAllArr[2] + '/天');
    // $('#addDevice').find('.add_txt4').text(addDeviceName)

    // 如果项目相同，设备项目，就是更新设备项目指标(添加设备最终完成那步)
    var item_0 = $.trim($('#addType1 .type1_active').text()); // 初始项目
    var unit0 = $.trim($('#addType2 .type2_active').text()); //初始单位
    var target0 = $.trim($('.increase_decrease .recommend_bun').val());
    $('.add_txt1').text(item_0);
    $('.add_txt2').text(unit0);
    $('.add_txt3').text(target0);

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
    $(".shebeiliebiao_note,.need_add_type_bg").hide();//设备列表提示隐藏
}

/**
 *绑定后点击完成开始
 * $('#addDeviceNext2')方法独立
 */
function submitEdit(){
    // 完成添加设备及项目详情信息
    var position = $.trim(window.localStorage.getItem('position'));
    if (position == '左边') {
        position = '1';
    } else if (position == '右边') {
        position = '2';
    }
    // 绑定完成后发送项目数据
    var project_select = window.localStorage.getItem('project_select');
    if (project_select == '油') {
        project_select = '1';
    } else if (project_select == '菜籽油') {
        project_select = '2';
    } else if (project_select == '葵花籽油') {
        project_select = '3';
    } else if (project_select == '橄榄油') {
        project_select = '4';
    } else if (project_select == '花生油') {
        project_select = '5';
    } else if (project_select == '玉米油') {
        project_select = '6';
    } else if (project_select == '豆油') {
        project_select = '7';
    } else if (project_select == '香油') {
        project_select = '8';
    } else if (project_select == '芝麻油') {
        project_select = '9';
    } else if (project_select == '麻油') {
        project_select = '10'
    } else if (project_select == '糖') {
        project_select = '11';
    } else if (project_select == '冰糖') {
        project_select = '12';
    } else if (project_select == '白砂糖') {
        project_select = '13';
    } else if (project_select == '红糖') {
        project_select = '14';
    } else if (project_select == '盐') {
        project_select = '15';
    } else if (project_select == '细盐') {
        project_select = '16';
    } else if (project_select == '粗盐') {
        project_select = '17';
    } else if (project_select == '碘盐') {
        project_select = '18';
    } else if (project_select == '无碘盐') {
        project_select = '19';
    } else if (project_select == '海盐') {
        project_select = '20';
    } else if (project_select == '玫瑰盐') {
        project_select = '21';
    } else if (project_select == '岩盐') {
        project_select = '22';
    } else if (project_select == '竹盐') {
        project_select = '23';
    } else if (project_select == '醋') {
        project_select = '24';
    } else if (project_select == '黑醋') {
        project_select = '25';
    } else if (project_select == '香醋') {
        project_select = '26';
    } else if (project_select == '米醋') {
        project_select = '27';
    } else if (project_select == '白醋') {
        project_select = '28';
    } else if (project_select == '陈醋') {
        project_select = '29';
    } else if (project_select == '康乐醋') {
        project_select = '30';
    } else if (project_select == '酱油') {
        project_select = '31';
    } else if (project_select == '海鲜酱油') {
        project_select = '32';
    } else if (project_select == '生抽') {
        project_select = '33';
    } else if (project_select == '老抽') {
        project_select = '34';
    } else if (project_select == '六月鲜') {
        project_select = '35';
    } else if (project_select == '味极鲜') {
        project_select = '36';
    } else if (project_select == '刺生酱油') {
        project_select = '37';
    } else if (project_select == '日式酱油') {
        project_select = '38';
    } else if (project_select == '辣酱油') {
        project_select = '39';
    } else if (project_select == '耗油') {
        project_select = '40';
    } else if (project_select == '蒸鱼豉油') {
        project_select = '41';
    } else if (project_select == '料酒') {
        project_select = '42';
    } else if (project_select == '葱姜料酒') {
        project_select = '43';
    } else if (project_select == '椒盐') {
        project_select = '44';
    } else if (project_select == '淀粉') {
        project_select = '45';
    } else if (project_select == '味精') {
        project_select = '46';
    } else if (project_select == '鸡精') {
        project_select = '47';
    } else if (project_select == '鸡粉') {
        project_select = '48';
    }

    var project_unit = window.localStorage.getItem('project_unit');
    if (project_unit == '克') {
        project_unit = '49';
    } else if (project_unit == '毫升') {
        project_unit = '50';
    }

    var t1 = 'inputCategory' + position;
    var project = t1 + '_' + project_select + '=' + project_unit;
    var type1 = '项目';
    writeCharacteristics(project, type1);
    // 绑定设备完成后，添加数据到后台，
    var item = $.trim($('.add_list .add_txt1').text());
    var unit = $.trim($('.add_list .add_txt2').text());
    var target = $.trim($('.add_list add_txt3').text());
    var name = $.trim($('.add_list .add_txt4').text());
    var deviceId = $('#equipmentsList .equipments_active').closest('li').attr('mac'); //获取被绑定的设备id
    var serviceId = $('#equipmentsList .equipments_active').closest('li').attr('service_id'); //获取被绑定的设备id
    var characteristicId = $('#equipmentsList .equipments_active').closest('li').attr('characteristic_id'); //获取被绑定的设备id
    // showLoading();
    var boundItem = $('.equipments_active').closest('li').find('.equipments_function').attr("bound");
    if(boundItem){
        checkIfNeedSubmitTwice(deviceId,name,userId,item,unit,target);
    }
    else{
        var currentEquipName='';
        // if(!selectedEquipBound){//设备左右所绑定的项目
        var currentActive = $(".detail_active").text();//当前的项目
        var allEquipment = $('.equipments_active').closest('#equipmentsList').find("li.equipments_item");
        allEquipment.each(function(){
            var thisDeviceName = $(this).find(".equipments_name").text()+ $(this).find(".position").text().substring(1,0);
            var thisDeviceItem = $(this).find('.equipments_function').attr("bound")
            if(thisDeviceItem && thisDeviceItem == currentActive){
                currentEquipName = thisDeviceName;
                return;
            }
        })
        if(!currentEquipName){

        }
    console.log("该选择没有绑定项目，找到原有的--"+ currentActive + '--对应的设备名称=='+currentEquipName)
        normalUpdateEquip(deviceId,name,userId,item,unit,target,currentEquipName,currentActive)
    }

}

/**
 *
 */
function checkIfNeedSubmitTwice(deviceId,name,userId,item,unit,target){

    var currentActive = $(".detail_active").text();//当前的项目

    var boundItem = $('.equipments_active').closest('li').find('.equipments_function').attr("bound");//选中的已绑定的项目
    var boundDeviceName = $('.equipments_active').closest('li').find('.equipments_name').text();//选中的已绑定的设备名称
    var currentSide = $('.equipments_active').closest('li').find(".position").text().substring(1,0);
    var boundItemName = boundDeviceName+currentSide;//选中的已绑定的项目的左右名称

    var anotherSide = "";
    var anotherName = "";
    var anotherItem = "";
    if(currentSide == "左"){
        anotherSide = "右";
        anotherName = boundDeviceName+"右";
    }
    else if(currentSide == "右"){
        anotherSide = "左";
        anotherName = boundDeviceName+"左";
    }
    var allEquipment = $('.equipments_active').closest('#equipmentsList').find("li.equipments_item");
    allEquipment.each(function(){
        var thisDeviceName = $(this).find(".equipments_name").text();
        var thisSide = $(this).find(".position").text().substring(1,0);
        var notActiveFlag = $(this).find(".equipments_check").hasClass("equipments_active");
        if(thisDeviceName == boundDeviceName && !notActiveFlag ){
            anotherItem = $(this).find('.equipments_function').attr("bound")
            return;
        }
    })

    if(currentActive == boundItem){
        normalUpdateEquip(deviceId,name,userId,item,unit,target,boundItemName,boundItem)
    }
    else{//当前选中li分类 和绑定的名字不一致，说明要进行两种项目都要更改信息
        //li 盐
        // 左 味精  右盐
        //选中 左 味精
        //结果： 新分类（油） - 左
        //结果： 味精  - 空
        //提交修改 当前选中的分类      - 选中的绑定项目名 boundItem   选中的绑定设备名称 boundItemName
        $.ajax({
            url: 'https://192.168.1.55:448/user/updateEquipments',
            type: 'post',
            data: {
                mac: deviceId,
                name: boundItemName, // 左 味精
                user_id: userId,
                item: boundItem, // 左 味精
                unit: unit, // 指标单位
                target: target, // 指标数量
                set_name: "1", //修改后的名称 //1==空值
                set_item: boundItem, //修改后的项目名 //1==空值
                //'ip_address':'', // wifi 的地址
                online_type: 'bluetooth' // 传递的蓝牙或者wifi
            },
            async:false,
            dataType: 'json',
            success: function (result) {
                    console.log("解绑数据： "+boundItem )
            },
            error: function (ero) {
                //alert('添加数据到后台失败')
                console.log(ero);
                hideLoading();
            }
        });

        //提交修改 当前未选中的分类    - 选中的绑定项目名 anotherItem   选中的绑定设备名称 anotherName
        $.ajax({
            url: 'https://192.168.1.55:448/user/updateEquipments',
            type: 'post',
            data: {
                mac: deviceId,
                name: anotherName, //  右 盐
                user_id: userId,
                item: anotherItem, // 右 盐
                unit: unit, // 指标单位
                target: target, // 指标数量
                set_name: name, //修改后的名称 //1==空值
                set_item: item, //修改后的项目名 //1==空值
                //'ip_address':'', // wifi 的地址
                online_type: 'bluetooth' // 传递的蓝牙或者wifi
            },
            async:false,
            dataType: 'json',
            success: function (result) {
                $(".detail_active").text(item);
                console.log("更新替换数据：anotherName=="+anotherName )
                console.log("更新替换数据：anotherItem=="+anotherItem )
            },
            error: function (ero) {
                //alert('添加数据到后台失败')
                console.log(ero);
                hideLoading();
            }
        })
    }
    $('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
}
function normalUpdateEquip(deviceId,name,userId,item,unit,target,boundItemName,boundItem){
    console.log(deviceId,name,userId,item,unit,target,boundItemName,boundItem)
    $.ajax({
        url: 'https://192.168.1.55:448/user/updateEquipments',
        type: 'post',
        data: {
            mac: deviceId,
            name: boundItemName, // 左 味精
            user_id: userId,
            item: boundItem, // 左 味精
            unit: unit, // 指标单位
            target: target, // 指标数量
            set_name: name, //修改后的名称 //1==空值
            set_item: item, //修改后的项目名 //1==空值
            //'ip_address':'', // wifi 的地址
            online_type: 'bluetooth' // 传递的蓝牙或者wifi
        },
        async:false,
        dataType: 'json',
        success: function (result) {
            //alert('添加项目设备数据参数==' + deviceId + ',' + name  + ',' + userId + ',' +  item + ',' +  unit + ',' + target) ;
            var str = JSON.stringify(result);
            console.log('添加数据到后台成功==' + str);
            $(".detail_active").text(item);
            $('#addDevice').hide().find('.add_dev_one').show().next('.add_dev_two').hide();
            hideLoading();
        },
        error: function (ero) {
            //alert('添加数据到后台失败')
            console.log(ero);
            hideLoading();
        }
    })
}

function showLoading(){
    $("#loading_data").show();
}
function hideLoading(){
    $("#loading_data").hide();
}
