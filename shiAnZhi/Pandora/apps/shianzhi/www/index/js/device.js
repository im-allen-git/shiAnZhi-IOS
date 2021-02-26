$(function(){

	var userId = window.localStorage.getItem("useId");
	var link_state =  window.localStorage.getItem("link_state");


	/* 进入查询设备列表 */
	$.ajax({
		url:'https://192.168.1.55:448/user/getEquipmentDataList',
		type:'post',
		data:{'user_id':userId},
		dataType:'json',
		success:function(result){
			console.log('设备页设备列表JSON.stringify(result)==' + JSON.stringify(result));
			//result = [{"characteristic_id":"6EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"esp-v3.0.1","item":"11","item_value":"糖","mac":"8C:AA:B5:8B:6B:96","online_type":"1","online_value":"蓝牙","service_id":"6FAFC201-1FB5-459E-8FCC-C5C9C331914B","unit":"50","unit_value":"毫升","update_time":"2020-12-12 11:23:31.0","user_id":"8"}]

			if(result && result.length >0){
				var obj = {};
				var peon = result.reduce(function(cur,next){
					obj[next.mac] ? "" : obj[next.mac] = true && cur.push(next);
				    return cur;
				},[]);
				 console.log('设备页去重后设备列表peon==' + peon);
				var l = JSON.stringify(peon);
				// console.log('设备页去重后设备列表JSON.stringify(result)==' + l);
				for(var i=0;i<peon.length;i++){
					var list = ''
					// 设备名称部分
					// console.log('新加的 peon[i].mac == ' + peon[i].mac) ;
					list += '<li class="device_item clearfix" mac='+ peon[i].mac +'  service_id='+ peon[i].service_id +' characteristic_id='+ peon[i].characteristic_id +'>'
					list +=	'<div class="device_left">'
					list +=		'<p class="device_shi_name" id="add_name"> '+ peon[i].device_name +' <span class="not_connected">'+ peon[i].online_value +'已连接</span></p>'
					list +=		'<p class="device_shi_txt" old-item="'+ peon[i].item_value+'" old-unit="'+ peon[i].unit_value+'"> 已绑定<span id="item_value">'+ peon[i].item_value+'</span></p>'
					list +=	'</div>'
					list +=	'<div class="device_right">'
					// list +=		'<span class="not_connected">已连接</span>';
					list +=		'<p id="editProject"  onclick="device_project(this)" >编辑</p>'
					list +=		'<p class=""  onclick="device_close(this)" >删除</p>'
					list +=	'</div>'
					list +='</li>';
					$('.device_list').append(list);
					$('.no_device').hide();
					$('.icon-jia').show();
					 console.log('编辑页的事件 ==' + peon[i].mac );
				}
			}else{ //设备列表数据为[],这时要将本地存储的某些数据清除
				window.localStorage.removeItem("foodTypeVal");
				window.localStorage.removeItem('deviceName');
				window.localStorage.removeItem('deviceId');
				window.localStorage.removeItem('serviceId');
				window.localStorage.removeItem('characteristicId');
			}
		},
		error: function(err){
			console.log(err)
		}
	})


	$('#systemBg,#systemClose,.system_previous').on('click',function(){
		$('#systemBox').hide();
	})
	$('#systemNext').on('click',function(){   //确认删除
		let delIndex = $(this).attr('del-index');
		//删除的项目
		let delItem = $.trim($('.device_list').children('li').eq(delIndex).find('.device_shi_txt').attr('old-item'));
		
		var li_name = $('.device_list').children('li').eq(delIndex).find('#add_name').text().trim();
		
		var deivceName = window.localStorage.getItem('deivceName');
		if(deivceName && deivceName.length > 0){
			var device_arr2 = deivceName.split(',');
			device_arr2.splice($.inArray(li_name,device_arr2),1);  // 删除数组中元素值
			var s = device_arr2.join(',');
			// 添加群组 设置缓存
			window.localStorage.setItem('deivceName',s);
			// 如果全部删除了，提示显示
		}
		$('.device_list').children('li').eq(delIndex).remove();

		$('#systemBox').hide();
		if($('.device_list').children('li').length > 0){
			 $('.no_device,.device_btn').hide();
			 $('.icon-jia').show();
		}else{
			$('.no_device,.device_btn').show();
			$('.icon-jia').hide();
		}

		var mac = $('#systemNext').attr('mac');
		// 删除后台设备
		$.ajax({
			url:'https://192.168.1.55:448/user/equipmentDel',
			type:'post',
			data:{
				'user_id':userId,
				'mac':mac
			},
			dataType:'json',
			success:function(result){
				console.log('删除设备成功');
				/* 删除设备成功后,本地存储也同步,修改本地存储数据 */
				window.localStorage.removeItem("oldItem"); //去除旧的项目名称

				/* 先判断此时是否还有绑定设备,如果没有就清空本地的所有foodTypeVal*/
				let deviceItemLength = $('.device_list li').length;
				if(deviceItemLength < 1){ //如果最后一条数据被删除,清空所有本地存储数据,下面的代码不需要执行
					window.localStorage.removeItem("foodTypeVal");
					window.localStorage.removeItem('deviceName');
					window.localStorage.removeItem('deviceId');
					window.localStorage.removeItem('serviceId');
					window.localStorage.removeItem('characteristicId');
					return false;
				}
				//当设备列表数据长度大于0时,执行下面代码
				var foodVal = window.localStorage.getItem("foodTypeVal");
				let foodVal1 = [];
				if(foodVal.indexOf('||') > -1 ){
					foodVal1 = foodVal.split('||');
				}else{
					foodVal1.push(foodVal);
				}
				let typeIndex1 = 0;
				for(let i=0;i<foodVal1.length;i++){
					let foodTypeName = foodVal1[i].split('@@')[0];
					if(foodTypeName == delItem){
						foodVal1.splice(i,1); //删除这条数据
					}
				}
				if(foodVal1.length > 0){
					let foodVal2 = foodVal1.join('||'); //拼接成字符串
					window.localStorage.setItem("foodTypeVal",foodVal2);  //插入本地存储中
				}else{ //只有一条被删除,就清除本地存储里这个foodTypeVal
					window.localStorage.removeItem("foodTypeVal");
				}
				/* 修改本地存储数据 end */
			},
			error:function(ero){
				console.log('删除设备失败');
				console.log(ero);
			}
		})

	})

	/* 确认设备弹窗相关方法 */
	
	
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
	
	
		$('#confirmDeviceBack').on('click',function(){
			let thatType = $(this);
			thatType.parents('#confirmDevice').hide();
			$('#deviceBox').show();
		});

		$('#confirmBackBtn').on('click',function(){
			let thatType = $(this);
			thatType.parents('#confirmDevice').hide();
			$('#deviceBox').show();
		});
		
		/* 确认设备弹窗相关方法 end */
		
		
		
		
		
		
		/* 添加自定义项目开始 */
		
		
		
		$('#addDeviceClose').click(function(){
			$('.edit_project').hide();
		});
		$('#customizeBg,#customizeClose').on('click', function() {
			$('#customizeProject').hide();
		});
		$('#customizeIcon').on('click', function() {
			$(this).siblings('#customizeName').val('').focus();
		});
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
		});
		$('#customizeName').on('focus', function() {
			$(this).siblings('#customizeConfirm').removeClass('customize_embar');
		});
		
		
		/* 添加自定义项目结束 */
		
		
		
		
		
		
})