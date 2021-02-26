var now = new Date();
var year = now.getFullYear();
var month = ((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)
var nowWeek1 = ''; //切换到的周数据,如"2020/11/2",表示的是11月的第二周
var timeWeek = 0;  //切换到的周的对应的日期数据,如当天"2020/11/11",11月的第二周,点击增加一周,timeWeek值就变为"2020/11/18"
var day = (now.getDate()<10?"0":"")+now.getDate();
var hour = (now.getHours()<10?"0":"")+now.getHours();
var minutes = (now.getMinutes()<10?"0":"")+now.getMinutes();
var oldMonth = month; //用于记录切换到什么月份了,默认是当前月.因为从周年切换到月可能造成传给后台的不是月要展示的月份,比如月要展示的是11月份,但是switchEndOfMonth参数记录的是10月份
var oldDay = year+month+day; //用于记录切换到的旧的日期
var switchEndOfYear = 2021; //swiper切换月份后的变化的年份
var switchEndOfMonth = 1; //swiper切换月份后的变化的月份
var switchDateDay = 1; //swiper切换'日'后的日期
var switchEndOfMonthDay = 1; //swiper切换'月'后获取那个月对应多少天,比如2020-02对应的是29天
var itemIndex = 1; //detail_type子元素大类别的序号,默认1
var xAxis = []; //X轴的时间数据
var manArr = [0, 0, 0]; //手动输入数据,默认全部为0
var devArr = []; //设备记录的数据
var oldxAxis = []; //xAxis X轴的时间数据因为新增手动输入时间会变化,oldxAxis用来存储没变化前的设备时间
var formatTimeArr = [];  //就餐时间(手动、设备)集合
var chartIdArr = []; //X轴的柱体对应的ID

var manualTimeArr = [];  //下方meal_data人均摄入量列表里所有手动输入meal_item_capita的时间组成的数组
var manualweightArr = [];  //下方meal_data人均摄入量列表里所有手动输入meal_item_capita的摄入重量组成的数组
var foodTypeAll = '';  //存储食物大类别的具体数据
var guideIntake = 0;  //某一个食物大类别的指导摄入量重量,在添加设备时获取
var number = 0; //某一个类别对应的用餐人数
var weightUnit = '克';
var weightUnitE = 50; //单位在数据库对应的编号
var weightUnit1 = 'g';
var dayTotalIntake = 0;  //当前类别当日摄入人均总重量
var deviceAllWeight = 0; //当前项目(item)的总重量
var systemWasteRatio = 0; //浪费比率

// 查询后台接口需要用到的参数说明
var id = 1; //自增长id
var user_id = ''; //用户id
var item = 1; //食物大类别的id
var itemChineseName = '盐' //食物大类别的中文名
var type = 0; //类型,1为手动输入数据,2位设备传过来的数据
var start_time = ''; // 某一餐的开始时间
var end_time = ''; // 某一餐的结束时间,2020-08-08 14:59:00
var flag_type = 0; //flag_type:1天2周3月4年
var perMealWeightArr = []; //每餐人均重量数组

var currentEditData = [];  //点击meal_item编辑按钮获取的数据存在此全局变量里,下面确认编辑时存储到本地时需要这个数据

var clearEditIndexStr = ''; //当点击保存手动输入数据时,要将session保存的以mealEdit为开头的编辑数据
/* 获取蓝牙数据信息 */
var userId = window.localStorage.getItem("useId"); //用户id
var deviceName = window.localStorage.getItem('deviceName');
var deviceId = ''; //设备mac,后面从
//var deviceId = window.localStorage.getItem('deviceId');//mac
var serviceId = window.localStorage.getItem('serviceId');
var characteristicId = window.localStorage.getItem('characteristicId');
var perCapitaData = ''; //每个大类别对应的人均摄入量数据
var typeCorrespondDetail = $('#typeCorrespondDetail');
/* var typeCorrespondDetail = document.getElementById('typeCorrespondDetail'); */
var detailType = $('#detailType');
var editItem = $('#editItem');
var mealDataElement = typeCorrespondDetail.find('.type_item1').find('.meal_data'); //因为.meal_data有多个,这里通过序号来查询,下面点击detail_item切换大类别时要重新获取,不然一直是第一次获取的那个元素
var currentUserID;//用于群组用户切换
var currentUserPhone;//用于群组用户切换


$(function(){
	initDate();
	var newTime = getUrlParam('time'); //从首页点击图表日期过来的
	if(!newTime){ //如果不存在就置为空,不然就变为字符串'null'
		newTime = '';
	}

	currentUserID = window.localStorage.getItem('currentUserID');
	if(currentUserID){
		userId=currentUserID;
	}
	currentUserPhone = window.localStorage.getItem('currentUserPhone');
	//写死的测试数据,后面要删除
	//foodTypeVal = '盐@@60@@克@@esp-v3.0.1@@7C:9E:BD:F3:56:FE@@6FAFC201-1FB5-459E-8FCC-C5C9C331914B@@6EB5483E-36E1-4688-B7F5-EA07361B26A8||油@@0@@毫升@@esp-31@@80:7D:3A:E5:FC:DE@@6FAFC201-1FB5-459E-8FCC-C5C9C331914B@@6EB5483E-36E1-4688-B7F5-EA07361B26A8||糖@@0@@克@@esp-35@@80:7D:3A:E5:FC:DE@@6FAFC201-1FB5-459E-8FCC-C5C9C331914B@@6EB5483E-36E1-4688-B7F5-EA07361B26A8||味精@@0@@克@@esp-08@@80:7D:3A:E5:FC:DE@@6FAFC201-1FB5-459E-8FCC-C5C9C331914B@@6EB5483E-36E1-4688-B7F5-EA07361B26A8';
	// foodTypeVal = '盐@@60@@克@@esp-v3.0.1@@7C:9E:BD:F3:56:FE@@6FAFC201-1FB5-459E-8FCC-C5C9C331914B@@6EB5483E-36E1-4688-B7F5-EA07361B26A8||糖@@0@@克@@esp-35@@80:7D:3A:E5:FC:DE@@6FAFC201-1FB5-459E-8FCC-C5C9C331914B@@6EB5483E-36E1-4688-B7F5-EA07361B26A8';
	// storageObject.localSetItem('foodTypeVal',foodTypeVal);
	// console.log('获取到首页传过来的本地存储数据为：' + foodTypeVal);

	// 进入详情页,拿到存储数据，和首页的项目列表同步展示
	var foodTypeVal = storageObject.localGetItem('foodTypeVal');  //session里存储的食品类别信息数据
	//console.log('获取到首页传过来的本地存储数据为1：' + foodTypeVal);
	if(foodTypeVal&&foodTypeVal.length>0){
		//alert('本地存储首页传过来的数据是：'+foodTypeVal)
		// console.log('本地存储首页传过来的数据是：'+foodTypeVal)
		var foodTypeValList = [];
		var foodTypeValList2 = [];
		if(foodTypeVal.indexOf('||') > -1){
			foodTypeValList = foodTypeVal.split('||');
			let detailItemHtml = '';
			for(let i=0;i<foodTypeValList.length;i++){
				foodTypeValList2 = foodTypeValList[i].split('@@');
				detailItemHtml += '<li class="detail_item" muitime="'+newTime+'" deviceId="' + foodTypeValList2[4] + '"  deviceName="' + foodTypeValList2[3] + '"  serviceId="' + foodTypeValList2[5] + '"  characteristicId="' + foodTypeValList2[6] + '"><span class="item_name">'+foodTypeValList2[0]+'</span><input type="hidden" class="item_standard" value="'+foodTypeValList2[1]+'"><input type="hidden" class="item_unit" value="'+foodTypeValList2[2]+'"></li>';
				//克隆第一个type_item大类别的html内容后添加数据
				cloneTypeItem(i);
			}
			$('#detailType').append(detailItemHtml);

		}else{
			let foodTypeValList3 = foodTypeVal.split('@@');
			$('#detailType').append('<li class="detail_item" muitime="'+newTime+'" deviceId="' + foodTypeValList3[4] + '"  deviceName="' + foodTypeValList3[3] + '"  serviceId="' + foodTypeValList3[5] + '"  characteristicId="' + foodTypeValList3[6] + '"><span class="item_name">'+foodTypeValList3[0]+'</span><input type="hidden" class="item_standard" value="'+foodTypeValList3[1]+'"><input type="hidden" class="item_unit" value="'+foodTypeValList3[2]+'"></li>');
			weightUnit = foodTypeValList3[2];
		}

	}else{ //本地存储里没有数据就要去后台获取了
		$.ajax({
			url: 'https://192.168.1.55:448/user/getEquipmentDataList',
			type: 'post',
			data: {
				user_id: userId //用户ID
			},
			async: false,
			dataType: 'json',
			success: function(res) {
				console.log('刚进入详情页获取的项目'+JSON.stringify(res));
				if(res && res.length >0){
					let getEquipmentHtml = '';
					for(let i=0;i<res.length;i++){
						let targetNum = 0;
						if(res[i].target){
							targetNum = res[i].target;
						}
						getEquipmentHtml += '<li class="detail_item" muitime="'+newTime+'" deviceId="' + res[i].mac + '"  deviceName="' + res[i].device_name + '"  serviceId="' + res[i].service_id + '"  characteristicId="' + res[i].characteristic_id + '"><span class="item_name">'+res[i].item_value+'</span><input type="hidden" class="item_standard" value="'+targetNum+'"><input type="hidden" class="item_unit" value="'+res[i].unit_value+'"></li>';
						//克隆第一个type_item大类别的html内容后添加数据
						cloneTypeItem(i);
					}
					$('#detailType').append(getEquipmentHtml);
				}
			},
			error: function(mes){
				console.log(mes)
				/* 详情获取项目信息报错,此时返回首页 */
				//window.location.href = '../index/index.html';
			}
		})
	}

	/* 所有项目类别插入后,获取当前项目名和单位,赋值全局变量 */
	var foodActiveName = window.localStorage.getItem('foodActiveName');
	var objectIndex = 0; //项目的序号
	if(foodActiveName){
		detailType.find('.detail_item').each(function(){  // 首次进入详情页,根据缓存来查找被选中的项目类别
			if($.trim($(this).text()) == foodActiveName){
				$(this).addClass('detail_active').siblings().removeClass('detail_active');  //给当前的项目添加标志
				objectIndex = $(this).index();
			}
		});
	}
	itemChineseName = foodActiveName;
	item = switchItem(itemChineseName); //类别中文名转为对应的数字
	let weightUnit2 = $.trim(detailType.find('.detail_active').find('.item_unit').val());
	if(weightUnit2 == "克"){
		weightUnit1 = 'g';
		weightUnitE = 49;
	}else if(weightUnit2 == "毫升"){
		weightUnit1 = 'ml';
		weightUnitE = 50;
	}
	/* 所有项目类别插入后,获取当前项目名和单位,赋值全局变量 end */

	//itemIndex = objectIndex; //全局变量itemIndex值更新,下面可以直接用
	//*****获取大类别后,暂且点击第一个大类别,后面根据foodItemIndex来确定默认显示哪一个大类别,暂且隐藏后面要显示
	setTimeout(function(){
		detailType.find('.detail_item').eq(objectIndex).trigger('click');
	},120);

	/* 因为手动输入插入数据要克隆meal_data子列表第一条数据,
	未防止用户先将子列表全删除了再手动输入(这时clone第一条数据为空),这里初始化时就clone插入,但是隐藏.
	这里如果clone后赋值给参数,后面再clone这个参数去插入到列表里.会造成插入的列表数据点击编辑和删除按钮没有反应 */
	mealDataElement.prepend(mealDataElement.find('.meal_item').eq(0).clone(true).hide());
	mealDataElement.find('.meal_item').eq(0).find('.meal_edit').attr('edit-number',0);  //给刚clone插入的第一个元素属性赋值0
	/* 需要后台提供的初始化数据 end */

	$('.detail_item').on('click',function(){ //切换大类别
		let _that = $(this);
		let index = _that.index();
		if(itemIndex != index+1){ //重复点击当前食物大类别不执行
			swiper_first_flat = true; //切换非当前大类别时,执行一次swiper初始化方法
		}
		itemChineseName = $.trim(_that.text()); //***重要:切换到的项目中文名
		item = switchItem(itemChineseName); //类别中文名转为对应的数字,下面ajax用

		deviceId = $.trim(_that.attr('deviceId')); //****重要:切换到的项目绑定的mac数据
		// alert('当前类别的mac：'+deviceId)
		storageObject.localSetItem('foodActiveName',itemChineseName); // 当前被选中的项目
		storageObject.localSetItem('project_select',itemChineseName); // 当前被选中的项目
		storageObject.localSetItem('foodItemIndex',index); // 当前被选中的项目序号
		// alert('当前item是：'+item)
		_that.addClass('detail_active').siblings().removeClass('detail_active');
		/* 隐藏新的chart表,显示旧的chart表和人居摄入量列表 */
		//typeCorrespondDetail.find('.type_item'+itemIndex).find('#swiperNewChart'+itemIndex).hide().siblings('.number_chart,.meal_data').show();
		$('.type_correspond_detail .type_item').eq(index).show().siblings().hide();
		_that.parent().attr('item-index',index+1); //给父元素item-index属性添加序号,下面需要用到
		itemIndex = index+1; //全局变量itemIndex值更新,下面可以直接用

		/* 切换大类别后,有的需要更新*/
		/* manualTimeArr = []; */ //下方meal_data人均摄入量列表里所有手动输入meal_item_capita的时间组成的数组要从新获取


		/* 下面测试用 */
		// let result6 = '[{"flag_type":0,"format_time":"2021-01-27 11:12","id":7626,"number":5,"type":"2","waste_rate":"4","weight":"156"},{"flag_type":0,"format_time":"2021-01-27 11:12","id":7627,"number":5,"type":"2","waste_rate":"4","weight":"152"},{"flag_type":0,"format_time":"2021-01-27 11:12","id":7628,"number":5,"type":"2","waste_rate":"4","weight":"146"},{"flag_type":0,"format_time":"2021-01-27 11:12","id":7629,"number":5,"type":"2","waste_rate":"4","weight":"131"},{"flag_type":0,"format_time":"2021-01-27 11:12","id":7630,"number":5,"type":"2","waste_rate":"4","weight":"122"},{"flag_type":0,"format_time":"2021-01-27 11:13","id":7631,"number":5,"type":"2","waste_rate":"4","weight":"111"},{"flag_type":0,"format_time":"2021-01-27 11:13","id":7632,"number":5,"type":"2","waste_rate":"4","weight":"101"},{"flag_type":0,"format_time":"2021-01-27 11:13","id":7633,"number":5,"type":"2","waste_rate":"4","weight":"51"},{"flag_type":0,"format_time":"2021-01-27 14:06","id":7640,"number":5,"type":"2","waste_rate":"4","weight":"159"},{"flag_type":0,"format_time":"2021-01-27 14:06","id":7641,"number":5,"type":"2","waste_rate":"4","weight":"138"},{"flag_type":0,"format_time":"2021-01-27 14:07","id":7642,"number":5,"type":"2","waste_rate":"4","weight":"129"},{"flag_type":0,"format_time":"2021-01-27 14:07","id":7643,"number":5,"type":"2","waste_rate":"4","weight":"109"},{"flag_type":0,"format_time":"2021-01-27 11:39","id":7639,"number":5,"type":"1","waste_rate":"4","weight":"10"},{"flag_type":0,"format_time":"2021-01-27 14:06","id":7645,"number":5,"type":"1","waste_rate":"4","weight":"15"}]';
		// storageObject.localSetItem("typeResult-"+userId+"-"+itemIndex,result6);
		// result6 = JSON.parse(result6);
		// categoryDataFn(result6,itemIndex,true);

// storageObject.localRemoveItem("typeResult-"+userId+"-"+itemIndex);



		/* 克隆完html内容后,开始判断是否有本地存储数据,没有就请求后台数据*/
		// let resultTypeData = storageObject.localGetItem("typeResult-"+userId+"-"+itemIndex);//先判断本地存储里当前序号对应的大类别的数据
		// resultTypeData = JSON.parse(resultTypeData);
		// if(resultTypeData && (resultTypeData.length>0)){
		// 	/* 获取到session里大类别数据后操作方法 */
		// 	categoryDataFn(resultTypeData,itemIndex)
		// }else{
		// 	let ajStartTime = year+'-'+month+'-' + day + ' 00:00:00';
		// 	let ajEndTime = year+'-'+month+'-' + day + ' 23:59:00';
		// 	getWeightingDataCalculateList(ajStartTime,ajEndTime);
		// }


		//***查询总数据展示,这里没有判断本地隐藏域是否有数据,后面需要优化
		let indexHrefTime = '';
		//当天
		let ajStartTime = year+'-'+month+'-' + day + ' 00:00:00';
		let ajEndTime = year+'-'+month+'-' + day + ' 23:59:00';
		//非当天
		muiNowTime = $.trim(detailType.find('.detail_item').eq(index).attr('muitime'));
		if(muiNowTime){  //从首页点击图表日期过来的,页面url传的时间如果存在
			//indexHrefTime = muiNowTime.substr(muiNowTime.length-2,muiNowTime.length);
			ajStartTime = muiNowTime + ' 00:00:00';
			ajEndTime = muiNowTime + ' 23:59:00';
		}

		getWeightingDataCalculateList(ajStartTime,ajEndTime,false);

		//**这里很重要,切换的时候重新获取值,不然后面用每次获取的都是上面获取的那个元素
		mealDataElement = typeCorrespondDetail.find('.type_item'+itemIndex).find('.meal_data');
	})

	var nowDayTime = year+'/'+month+'/'+day;
	var timeDay = nowDayTime; //传递addDate方法的日期参数
	timeWeek = nowDayTime; //传递addDate方法的周参数，以为周数据也是用day数据减去7再计算的,所以这里用day数据做初始值
	var nowMonthTime = year+'/'+month;
	var timeMonth = nowMonthTime; //传递addDate方法的月份参数
	var timeYear = year; //传递addDate方法的年份参数
	var lessDayType = '';
	var lessWeekType = '';
	var lessMonthType = '';
	//天和周月年不同,每天都要展示详情数据
	$('.date_chart_day').on('click','.date_right',function(){ //天数加方法
		let _that = $(this);
		if(_that.hasClass('date_no_click')){
			return false;
		}
		let nextTime = $.trim(typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_change_btn em').text());
		nextTime = nextTime.replace('年','/').replace('月','/').replace('日',''); //年月汉字替换为反斜杠
		let plusTime = addDate(nextTime.toString(),1);
		timeDay = plusTime;  //将加过一天的新的时间传给参数,下次点击要用此参数
		if(nowDayTime.toString() === plusTime.toString()){ //如果时间增加到当前日期,就不能再增加了
			_that.addClass('date_no_click');
		}
		lessDayType = plusTime.split('/');
		switchDateDay = lessDayType[0]+'-'+lessDayType[1]+'-'+lessDayType[2]; //转换时间格式为2020-11-13
		let addDayType1 = lessDayType[0]+'年'+lessDayType[1]+'月'+lessDayType[2]+'日'; //转换时间格式
		_that.parents('.date_chart').find('.date_chart_txt em').text(addDayType1);
		let addDayType2 = lessDayType[0]+'-'+lessDayType[1]+'-' + lessDayType[2];
		detailType.find('.detail_item').eq(itemIndex-1).attr('muitime',addDayType2);
		let daysPlusStartTime = addDayType2+ ' 00:00:00';
		let daysPlusEndTime = addDayType2 + ' 23:59:00';
		getWeightingDataCalculateList(daysPlusStartTime,daysPlusEndTime,false);


		// let nowTime1 = year+'/'+month+'/'+day;
		// if(nowTime1 == timeDay){ //天数加,切换回当天,获取本地存储里当天数据展示
		// 	let resultTypeData = storageObject.localGetItem("typeResult-"+userId+"-"+itemIndex);//先判断本地存储里当前序号对应的大类别的数据
		// 	resultTypeData = JSON.parse(resultTypeData);
		// 	if(resultTypeData && (resultTypeData.length>0)){
		// 		/* 获取到session里大类别数据后操作方法 */
		// 		categoryDataFn(resultTypeData,itemIndex)
		// 	}else{//如果本地存储没有此项目当天的数据,就点击一下当前项目,从新走后台方法,不过这种情况应该不存在
		// 		setTimeout(function(){
		// 			detailType.find('.detail_item'+itemIndex).trigger('click');
		// 		},120);
		// 	}
		// }else{//切换到其他天数
		// 	swiperFinishFn(1); //切换日后,下面图表变化
		// }

	})

	$('.date_chart_day').on('click','.date_left',function(){ //天数减方法
		let prevTime = $.trim(typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_change_btn em').text());
		prevTime = prevTime.replace('年','/').replace('月','/').replace('日',''); //年月汉字替换为反斜杠
		let lessTime = addDate(prevTime.toString(),-1);
		timeDay = lessTime;  //将减过一天的新的时间传给参数,下次点击要用此参数
		lessDayType = lessTime.split('/');
		switchDateDay = lessDayType[0]+'-'+lessDayType[1]+'-'+lessDayType[2]; //转换时间格式为2020-11-13
		let lessDayType1 = lessDayType[0]+'年'+lessDayType[1]+'月'+lessDayType[2]+'日'; //转换时间格式
		$(this).parents('.date_chart').find('.date_chart_txt em').text(lessDayType1).end().end().siblings('.date_right').removeClass('date_no_click');
		let lessDayType2 = lessDayType[0]+'-'+lessDayType[1]+'-' + lessDayType[2];
		detailType.find('.detail_item').eq(itemIndex-1).attr('muitime',lessDayType2);
		let daysPlusStartTime = lessDayType2 + ' 00:00:00';
		let daysPlusEndTime = lessDayType2 + ' 23:59:00';
		getWeightingDataCalculateList(daysPlusStartTime,daysPlusEndTime,false);

		//swiperFinishFn(1); //切换日后,下面图表变化
	})

	/* 点击弹窗mui选择日期 */
	$('.date_change_btn').on('click',function(){
		var dtPicker = new mui.DtPicker({ type: 'date', beginYear:1949,endYear:3016});
		/*type参数：'datetime'-完整日期视图(年月日时分)
				'date'--年视图(年月日)
				'time' --时间视图(时分)
				'month'--月视图(年月)
				'hour'--时视图(年月日时)
		*/
		dtPicker.show(function (selectItems) {
		    var y = selectItems.y.text;  //获取选择的年
		    var m = selectItems.m.text;  //获取选择的月
		    var d = selectItems.d.text;  //获取选择的日
		    var date = y + "年" + m + "月" + d + "日" ;
			detailType.find('.detail_item').eq(itemIndex-1).attr('muitime',y + "-" + m + "-" + d);
		    typeCorrespondDetail.find('.type_item'+itemIndex).find(".date_change_btn em").text(date); //赋值
		    let daysPlusStartTime = y +'-'+ m +'-' + d + ' 00:00:00';
			let daysPlusEndTime = y +'-'+ m +'-' + d + ' 23:59:00';
			getWeightingDataCalculateList(daysPlusStartTime,daysPlusEndTime,false);
		})
	})

	var plusWeekTime4 = '';
	$('.date_chart_week').on('click','.date_right',function(){ //周数加方法
		let _that = $(this);
		if(_that.hasClass('date_no_click')){
			return false;
		}
		let plusTime4 = addDate(timeWeek.toString(),7);
		timeWeek = plusTime4;//将加过一周的新的时间传给参数,下次点击要用此参数
		lessWeekType = plusTime4.split('/');
		let getDate1 = getMonthWeek(lessWeekType[0], lessWeekType[1], lessWeekType[2]);  /* 获取传过去的事件是某月的第几周 */
		lessWeekType = getDate1.getYear + "年" +getDate1.getMonth+"月"+getDate1.getWeek+"周"; //转换时间格式
		plusWeekTime4 = getDate1.getYear + "/" +getDate1.getMonth+"/"+getDate1.getWeek; //另外一种转换时间格式,用于和当前时间对于的周数对比
		if(nowWeek1.toString() === plusWeekTime4.toString()){ //如果时间增加到当前日期,就不能再增加了
			_that.addClass('date_no_click');
		}
		_that.parents('.date_chart_week').find('.date_chart_txt').text(lessWeekType);

		swiperFinishFn(2); //切换周后,下面图表变化
	})
	$('.date_chart_week').on('click','.date_left',function(){ //周数减方法
		let lessTime4 = addDate(timeWeek.toString(),-7); //周每次减7天
		timeWeek = lessTime4;  //将减过一周的新的时间传给参数,下次点击要用此参数
		lessWeekType = lessTime4.split('/'); //将减掉7日后的时间2020/06/30,拆分成单独的年月日
		let getDate1 = getMonthWeek(lessWeekType[0], lessWeekType[1], lessWeekType[2]);  /* 获取传过去的事件是某月的第几周 */
		lessWeekType = getDate1.getYear + "年" +getDate1.getMonth+"月"+getDate1.getWeek+"周"; //转换时间格式
		$(this).parents('.date_chart_week').find('.date_chart_txt').text(lessWeekType).siblings('.date_right').removeClass('date_no_click');

		swiperFinishFn(2); //切换周后,下面图表变化
	})

	$('.date_chart_month').on('click','.date_right',function(){ //月数加方法
		let _that = $(this);
		if(_that.hasClass('date_no_click')){
			return false;
		}
		var plusTime2 = addMonth(timeMonth.toString(),1);
		timeMonth = plusTime2;//将加过一月的新的时间传给参数,下次点击要用此参数
		if(nowMonthTime.toString() === plusTime2.toString()){ //如果时间增加到当前日期,就不能再增加了
			_that.addClass('date_no_click');
		}
		lessMonthType = plusTime2.split('/');
		lessMonthType = lessMonthType[0]+'年'+lessMonthType[1]+'月'; //转换时间格式
		_that.parents('.date_chart_month').find('.date_chart_txt').text(lessMonthType);

		swiperFinishFn(3); //切换月后,下面图表变化
	})
	$('.date_chart_month').on('click','.date_left',function(){ //月数减方法
		var lessTime2 = addMonth(timeMonth.toString(),-1);
		timeMonth = lessTime2;//将减过一月的新的时间传给参数,下次点击要用此参数
		lessMonthType = lessTime2.split('/');
		lessMonthType = lessMonthType[0]+'年'+lessMonthType[1]+'月'; //转换时间格式
		$(this).parents('.date_chart_month').find('.date_chart_txt').text(lessMonthType).siblings('.date_right').removeClass('date_no_click');

		swiperFinishFn(3); //切换月后,下面图表变化
	})

	$('.date_chart_year').on('click','.date_right',function(){ //年数加方法
		let _that = $(this);
		if(_that.hasClass('date_no_click')){
			return false;
		}
		var plusTime3 = addYear(timeYear.toString(),1);
		timeYear = plusTime3;//将加过一年的新的时间传给参数,下次点击要用此参数
		if(year.toString() === plusTime3.toString()){ //如果时间增加到当前年,就不能再增加了
			_that.addClass('date_no_click');
		}
		_that.parents('.date_chart_year').find('.date_chart_txt').text(plusTime3+'年');

		swiperFinishFn(4); //切换年后,下面图表变化
	})

	$('.date_chart_year').on('click','.date_left',function(){ //年数减方法
		var lessTime3 = addYear(timeYear.toString(),-1);
		timeYear = lessTime3;//将减过一年的新的时间传给参数,下次点击要用此参数
		$(this).parents('.date_chart_year').find('.date_chart_txt').text(lessTime3+'年').siblings('.date_right').removeClass('date_no_click');

		swiperFinishFn(4); //切换年后,下面图表变化
	})

	/* 日周月年部分方法 end */



	$('#confirmBg,#confirmClose').on('click',function(){
		$('#confirmDelete').hide();
	})
	$('#devicePrevious7').on('click',function(){
		$('#confirmDelete').hide();
	})

	$('#addDeviceNext7').on('click',function(){
		$('#confirmDelete').hide();
		let closeMealType = 2; //默认删除设备数据
		if(manualCloseTime.length > 0){
			closeMealType = 1;  //删除的是手动输入的数据
		}
		let allData1 = $.trim($('#currentTypeAllData1').val());
		let typeAllData = JSON.parse(allData1); //隐藏域里的当前大类别的所有具体数据
		var typeAllData2 = $.extend(true, [], typeAllData); //复制数组,typeAllData2是删除某一整餐的所有称重数据时用
		var typeAllData3 = $.extend(true, [], typeAllData); //复制数组,typeAllData3是删除某一餐里的某一次称重数据时用
		console.log('删除前的总的数据是：'+JSON.stringify(typeAllData3))
		let allDataIdArr = [];  //存储所有数据的id的数组
		let allDataTimeArr = [];  //存储所有数据的时间的数组
		for(let j in typeAllData2){
			allDataIdArr.push(typeAllData2[j].id);
			allDataTimeArr.push(typeAllData2[j].format_time);
		}
		//要删除的就餐数据的序号,这里判断有此属性就表示删除就餐列表部分的数据，否则删除的是编辑就餐editItem弹窗里的称重数据
		let closeMealIndex = $(this).attr("close-meal-index");
		let closeMealDataPosition = 0; //手动输入列表里被点击的是那一餐的序号
		if(typeof closeMealIndex !== typeof undefined && closeMealIndex !== false){ //closeMealIndex存在,表示删除某一整餐的所有数据
			closeMealDataPosition = closeMealIndex;
		}else{ //如果没有closeMealIndex,就表示不是删除某一整餐的数据,此时确认addDeviceNext5按钮的edit-index属性就表示当前操作的是第几餐
			let closeWeighingListIndex = $.trim($('#addDeviceNext5').attr('edit-index'));
			closeMealDataPosition = parseInt(closeWeighingListIndex);
		}

		/* 获取当前要删除的某一餐的所有数据 */
		let closeMealDataAll = $.trim(typeCorrespondDetail.find('.type_item'+itemIndex).find('.meal_data .meal_item').eq(closeMealDataPosition).find('.meal_hidden_data').val()); //要删除的所有数据,获取ID拼接传给后台
		let closeMealDataAll2 = JSON.parse(closeMealDataAll);
		var closeMealDataAll1 = $.extend(true, [], closeMealDataAll2); //复制数组,closeMealDataAll1是删除某一整餐的所有称重数据时用
		var closeMealDataAll3 = $.extend(true, [], closeMealDataAll2); //复制数组,closeMealDataAll3是删除某一餐里的某一次称重数据时用

		/* 将所有数据里的当前要删除的某一餐里的所有称重数据清除 */
		closeMealDataAll1 = closeMealDataAll1.reverse(); //反转数组,便于删除
		let closeMealDataAllLength = closeMealDataAll1.length //要删除所有数据的长度
		let mealDataIdArr = [];  //存储当前点击的某一餐所有数据的id的数组,删除单条数据时使用
		for(let k in closeMealDataAll1){
			let closeMealDataId = closeMealDataAll1[k].id;
			mealDataIdArr.push(closeMealDataId);
			let closeMealInAllDataIndex = $.inArray(closeMealDataId,allDataIdArr); //判断要删除的数据的id在所有id数组里的位置
			if(closeMealInAllDataIndex > -1){
				typeAllData2.splice(closeMealInAllDataIndex,1); //根据位置closeMealInAllDataIndex删除对应的数据,typeAllData2是所有称重数据删除某一餐的所有称重数据后剩下的称重数据
			}
		}
		//console.log("需要删除一整餐后的数据是："+JSON.stringify(typeAllData2))
		//console.log("需要删除的id数组是："+mealDataIdArr)
		/* 将所有数据里的当前要删除的某一餐里的所有称重数据清除 end*/

		//存在closeMealIndex属性,删除就餐列表数据,就是外层的人均摄入量数据,不存在删除的是具体每次称重的数据
		if(typeof closeMealIndex !== typeof undefined && closeMealIndex !== false){  //存在closeMealIndex属性,删除就餐列表里的数据
			let closeMealTime = $.trim(typeCorrespondDetail.find('.type_item'+itemIndex).find('.meal_data .meal_item').eq(closeMealDataPosition).find('.meal_time').text());
			let closeMealWeight = $.trim(typeCorrespondDetail.find('.type_item'+itemIndex).find('.meal_data .meal_item').eq(closeMealDataPosition).find('.shi_num').text());
			closeMealWeight = parseFloat(closeMealWeight);
			/* 获取删除时间 */
			let startTime = 0;
			let endTime = 23;
			let idAllStr = ''; //要传到后台的要删除ID的拼接字符串,如1:2:3
			if(closeMealTime){
				closeMealTime = closeMealTime.substr(1,closeMealTime.length-2); //截取时间改为为15:23,后面去时间数组里查找位置
				if(closeMealTime.indexOf('-') >-1){
					closeMealTime = closeMealTime.split('-')[0];
				}
				let closeMealTime1 = closeMealTime.substr(0,closeMealTime.length-3); //截取时间为15
				startTime= year+'-'+month+'-'+day + ' ' + closeMealTime1 +':00:00';
				endTime= year+'-'+month+'-'+day + ' ' + closeMealTime1 +':59:00';

			}
			if(closeMealDataAll1.length > 0){
				for(let i=0;i<closeMealDataAll1.length;i++){
					idAllStr += closeMealDataAll1[i].id + ':';
				}
				idAllStr = idAllStr.substr(0,idAllStr.length-1); //去除最后的冒号
			}
			/* 删除多条数据到后台 */
			$.ajax({
				url:'https://192.168.1.55:448/user/updateDelWeighingAllData',
				type:'post',
				data:{
					'user_id': userId,
					'item': item,
					'mac':deviceId,
					'type': closeMealType,  // 1代表手动输入数据
					'weight': closeMealWeight,
					'start_time': startTime,
					'end_time': endTime,
					'idAllStr':idAllStr //要传到后台的要删除ID的拼接字符串,如1:2:3
				},
				dataType:'json',
				success:function(result){
					var result5 = JSON.stringify(result);
					//console.log('删除数据成功后返回：'+result5)
					//后台删除成功,本地要操作隐藏域里的总数据并刷新页面
					/* 将总数据里对应序号的数据删除后,将剩余的总数据传给categoryDataFn方法,从新刷新详情页面 */
					categoryDataFn(typeAllData2,itemIndex,false); //后面点击确认按钮时才需要将新计算的人均值传到数据库,所以这里传false
				},
				error:function(error){
					var str = JSON.stringify(error);
				}
			});

		}else{  //不存在属性,删除就餐数据编辑弹窗里的具体每一次称重数据,每次只删除单条数据
			let closeWeighAttr = $.trim($(this).attr("close-weigh-index"));
			let closeWeighIndex = parseInt(closeWeighAttr.split('-')[0]); //要删除的称重数据的序号
			let closeWeighId = parseInt(closeWeighAttr.split('-')[1]); //要删除的称重数据的ID,要传给后台的
			editItem.find('.dev_input_item3').children('.weighing_list').eq(closeWeighIndex).remove();// 删除html内容
			//alert('删除单条数据到后台：'+closeWeighId+deviceId+closeMealType);
			//console.log('删除单条数据到后台：'+closeWeighId+deviceId+closeMealType);

			/* 删除单条数据到后台 */
			$.ajax({
				url:'https://192.168.1.55:448/user/updateDelWeighingData',
				type:'post',
				data:{
					'id': closeWeighId, //要删除称重数据的id
					'user_id': userId,
					'item': item,
					'mac':deviceId,
					'type': closeMealType,  // 1代表手动输入数据
				},
				dataType:'json',
				success:function(data){
					//console.log('601删除编辑弹窗里的单条数据成功后返回：'+JSON.stringify(data));
					//操作总的隐藏域数据,后台删除成功了,要将本地隐藏域里的数据也删除掉
					//console.log('删除完：'+closeWeighId+'：'+allDataIdArr)
					let closeMealOneselfIndex = $.inArray(closeWeighId,allDataIdArr); //判断当前id在总数据的里的位置
					if(closeMealOneselfIndex > -1){
						typeAllData3.splice(closeMealOneselfIndex,1); //删除总数据里对应的数据
					}
					//操作当前某一餐对应的隐藏域数据
					let closeMealOneselfIndex1 = $.inArray(closeWeighId,mealDataIdArr);
					if(closeMealOneselfIndex1 > -1){
						closeMealDataAll1.splice(closeMealOneselfIndex1,1); //删除总数据里对应的数据
					}
					//console.log('删除后的总的数据是：'+JSON.stringify(typeAllData3))
					//console.log('删除后的某一餐剩余的数据是：'+JSON.stringify(closeMealDataAll1))
					/* 将操作后的数据存到隐藏域中 */
					$('#currentTypeAllData1').val(' ').val(JSON.stringify(typeAllData3));
					mealDataElement.find('.meal_item').eq(parseInt(closeMealDataPosition)).find('.meal_hidden_data').val('').val(JSON.stringify(closeMealDataAll1));

				},
				error:function(err){
					console.log('删除编辑弹窗里的单条数据失败返回数据：'+err)
				}
			});
		}

		/* 计算平均值提示方法 */
		averageValueFn();
	})

	$('#editBg,#editClose,#devicePrevious5').on('click',function(){
		editItem.hide();
	})

	$('#addDeviceNext5').on('click',function(){
		editItem.hide();
		let aThis = $(this);
		let index = parseInt(aThis.attr('edit-index')); //编辑对象的序号
		let sessionEdit = aThis.attr('session-edit'); //要存储sission名称的后缀名
		let numberOfMeals = $.trim(editItem.find('.edit_is_input').val()); //进餐人数
		let WasteRatio = $.trim(editItem.find('#inline-range-val').text()); //浪费比率
		let weighingWeight = '';
		let weighingWeightArr = [];
		let updateIdWeightStr = ''; //要传到后台的id和重量的拼接字符串

		//隐藏域里的当前大类别的所有具体数据,因为确认编辑后只要更新总隐藏域数据,走categoryDataFn方法既可以将当前某一餐的隐藏域更新,所以这里只需要操作总的数据既可
		let allDataIdArr1 = [];  //存储所有数据的id的数组
		let allData2 = $.trim($('#currentTypeAllData1').val());
		let allData3 = JSON.parse(allData2);
		//let allData3 = allData2;
		for(let j in allData3){
			allDataIdArr1.push(allData3[j].id);
		}
		/* 循环更新数据 */
		editItem.find('.recommend_input').each(function(i){
			let _this = $(this);
			let _thisVal = $.trim(_this.text());
			let _thisId = $.trim(_this.attr('ed-id'));
			//console.log('判断当前id在总数据的里的位置1'+_thisId);
			//console.log('判断当前id在总数据的里的位2'+allDataIdArr1);
			updateIdWeightStr += _thisId + ':' + _thisVal + ':'+numberOfMeals+':'+WasteRatio+';';
			let editMealOneselfIndex = $.inArray(parseInt(_thisId),allDataIdArr1); //判断当前id在总数据的里的位置
			//console.log('判断当前id在总数据的里的位置'+editMealOneselfIndex);
			if(editMealOneselfIndex>-1){ //存在才执行
				allData3[editMealOneselfIndex].number = parseInt(numberOfMeals); //更新原数组里对应序号的数据
				allData3[editMealOneselfIndex].waste_rate = WasteRatio;
				allData3[editMealOneselfIndex].weight = parseFloat(_thisVal);
			}
		})
		updateIdWeightStr = updateIdWeightStr.substr(0,updateIdWeightStr.length-1); //去除最后的封号

		/* updateWeighingdata更新数据到后台 */
		//alert("编辑传到后台人数："+numberOfMeals+','+WasteRatio+','+updateIdWeightStr);
		console.log("编辑传到后台人数："+numberOfMeals+','+WasteRatio+','+updateIdWeightStr);
		$.ajax({
			url:'https://192.168.1.55:448/user/updateWeighingdata',
			type:'post',
			data:{
				'user_id':userId, //用户id
				'mac':deviceId,
				'number':numberOfMeals, //进餐人数
				'waste_rate':WasteRatio, //浪费比率
				'weightStr':updateIdWeightStr //重量集合数据
			},
			dataType:'json',
			success:function(result){
				//var result = JSON.stringify(result);
				console.log(result)
				/* 编辑后的数据传给categoryDataFn,计算出最新的人均用量和总重量,传到数据库 */
				categoryDataFn(allData3,itemIndex,true);
				//清空总的隐藏域数据,插入编辑后的新的数据
				$('#currentTypeAllData1').val(' ').val(JSON.stringify(allData3));

				// 将最新计算出的人均用量和总重量插到数据库后,刷新当前页面
				window.location.reload();
			},
			error:function(error){
				console.log(error)
			}
		});



		// let mealEditNumHtml1 = $.trim(aThis.parents('#editItem').find('.device_operating_title').text());
		// let mealEditType1 = 2; //判断当前点击编辑的数据是设备数据2还是手动输入数据1
		// if(mealEditNumHtml1 == '手动输入'){
		// 	mealEditType1 = 1;
		// }
		// if(mealEditType1 ==1 && (weighingWeightArr.length == 1)){ //手动输入，只有一个数据就是人均摄入量
		// 	arrActionNum = weighingWeightArr[0];
		// }else{
		// 	arrAction(weighingWeightArr); //传入每次称重重量,计算人均摄入量方法
		// }
		// //alert('称重数据：'+arrActionNum+','+WasteRatio+','+numberOfMeals);
		// let weighingWeightAll = arrActionNum; //arrAction方法计算的总重量值赋值给weighingWeightAll
		// let perCapitaIntake = ((weighingWeightAll*(1-parseInt(WasteRatio)/100))/parseInt(numberOfMeals)).toFixed(1); //计算摄入量的平均值
		// let editTime = editItem.find('.dining_time').text();
		// if(editTime.indexOf('-')>-1){
		// 	editTime = editTime.split('-')[0];
		// }
		// let inArrIndex =  $.inArray(editTime,xAxis); //编辑时间在时间数组里的序号
		// mealDataElement.find('.meal_item').eq(index).find('.meal_weight .shi_num').text(perCapitaIntake); //赋值总重
		// typeCorrespondDetail.find('.type_item'+index).find('.date_chart_day .date_chart_num strong').text(perCapitaIntake);
		// if(editCapita == true){  //editCapita为true就表示编辑的是手动输入数据
		// 	manArr.splice(inArrIndex,1,perCapitaIntake);
		// }else{  //editCapita为false表示编辑的是设备数据
		// 	devArr.splice(inArrIndex,1,perCapitaIntake);
		// }
		// let chartIndex = sessionEdit.split('-')[0];
		// setTimeout(function(){
		// 	initChart3(chartIndex);
		// },120);  //图表数据更新
		// editCapita = false;  //判断结束后恢复参数为false,再次点击时还要用
		// /* 计算平均值提示方法 */
		// averageValueFn();
	})

	$('#ratioInterval').on('click','.interval_item',function(){
		let _that = $(this);
		let index = _that.index();
		let intervalWidth = (index+1)*12.5;
		_that.parents('.waste_chart').children('.progress_bar').css('width',intervalWidth+'%').find('.progress_tip').text(index+1);
	})

	mui.init({
		swipeBack: true //启用右滑关闭功能
	});
	//监听input事件，获取range的value值，也可以直接element.value获取该range的值
	var rangeList = document.querySelectorAll('input[type="range"]');
	for (var i = 0, len = rangeList.length; i < len; i++) {
		rangeList[i].addEventListener('input', function() {
			if (this.id.indexOf('field') >= 0) {
				document.getElementById(this.id + '-input').value = this.value;
				$('.bg_span').css('width', this.value + '%');
			} else {
				$('#'+this.id + '-val').text(this.value).css('left', this.value + '%');
				$('.bg_span').css('width', this.value + '%');
			}
		});
	}

	// $('.single-slider').jRange({
	// 	from: 0,//开始于
	// 	to: 100,//结束于
	// 	step: 12.5,//一次滑动多少
	// 	scale: [0,12.5,25,37.5,50,62.5,75,87.5,100],//分割点
	// 	format: '%s',//格式化格式
	// 	width: '100%',//宽度
	// 	showLabels: false,
	// 	snap: false,
	// 	showScale: false,
	// 	isRange:false,
	// 	onstatechange:function (data) {//数字变化的时候的回调函数,不论是点击还是拖动都会走此方法
	// 		/* $('.pointer-label').text(data/12.5).show();
	// 		console.log('数字变化'+data)
	// 		$('.slider').jRange('setValue', '12.5'); */
	// 	},
	// 	ondragend:function (data) {//拖动结束时的回调函数
	// 		/* $('.pointer-label').text(data/12.5).show(); */
	// 		setTimeout(function(){
	// 			let index = data/12.5;
	// 			let intervalWidth = ($('.waste_chart').width()) / 8;
	// 			let indexWidth = intervalWidth*index;
	// 			let circleLeft = indexWidth - 9;
	// 			let tipLeft = indexWidth - 4;
	// 			$('#editType .edit_item').eq(index-1).addClass('edit_active').siblings().removeClass('edit_active');
	// 			if(index === 0){
	// 				indexWidth = 0;
	// 				circleLeft = -5;
	// 				tipLeft = 0;
	// 				$('#editType .edit_item').removeClass('edit_active');
	// 			}
	// 			$('.progress_tip').text(index).show();
	// 			console.log('拖动结束'+data)
	// 			$('.selected-bar').css('width',indexWidth);
	// 			$('.pointer').css('left',circleLeft);
	// 			$('.progress_tip').css('left',tipLeft);
	// 		},420);
	// 	},
	// 	onbarclicked:function (data) {//刻度条被按住时的回调函数
	// 		/* $('.pointer-label').text(err/12.5).show(); */
	// 		setTimeout(function(){
	// 			let index = data/12.5;
	// 			let intervalWidth = ($('.waste_chart').width()) / 8;
	// 			let indexWidth = intervalWidth*index;
	// 			let circleLeft = indexWidth - 9;
	// 			let tipLeft = indexWidth - 4;
	// 			$('#editType .edit_item').eq(index-1).addClass('edit_active').siblings().removeClass('edit_active');
	// 			if(index === 0){
	// 				indexWidth = 0;
	// 				circleLeft = -5;
	// 				tipLeft = 0;
	// 				$('#editType .edit_item').removeClass('edit_active');
	// 			}

	// 			$('.progress_tip').text(index).show();
	// 			console.log('拖动结束'+data)
	// 			$('.selected-bar').css('width',indexWidth);
	// 			$('.pointer').css('left',circleLeft);
	// 			$('.progress_tip').css('left',tipLeft);
	// 		},420);
	// 	}
	// });


	/* 详情返回首页方法 */
	$('.detail_back').click(function(){

		var url = window.location.href;
		var index1 = url.indexOf('?') + 1;
		var useId = url.substring(index1,url.length);
		//console.log('详情返回首页时候的用户 useId ==' + useId );

		 window.location.href = '../index/index.html?' +useId ;
	});

	$('#editType').on('click','.edit_item',function(){
		let _that = $(this);
		/* let index = _that.index()+1;
		let intervalWidth = index * ($('.waste_chart').width()/8); */
		_that.addClass('edit_active').siblings().removeClass('edit_active');
		/* $('.selected-bar').css('width',intervalWidth);
		$('.pointer').css('left',intervalWidth-9);
		$('.progress_tip').text(index).css('left',intervalWidth-5); */
	})

	/* meal_data部分相关方法 end */


	/* manualInput手动输入部分相关方法 */
	if(currentUserID&&currentUserPhone){ //不是本用户不能操作删除输入编辑
		$('#footItem1,#footItem2,#footItem3').addClass("opac_btn")
	}
	else{
		/* meal_data部分相关方法 */
		var editCapita = false;
		$('#typeCorrespondDetail .meal_item').on('click','.meal_edit',function(){
			let _this = $(this);
			let editNumber = Number(_this.attr('edit-number'));   //当前编辑元素的默认编号
			let editIndex = _this.parents('.meal_item').index();    //当前编辑元素的序号
			let editTime1 = $.trim(_this.parents('.meal_item').find('.meal_time').text()); //时间
			editTime1 = editTime1.substr(1,editTime1.length-2); //去掉时间前后的括号

// storageObject.localRemoveItem("mealEdit-"+itemIndex+"-"+editNumber);
			//let mealEditObj1 = storageObject.localGetItem("mealEdit-"+itemIndex+"-"+editNumber);
			let mealEditObj1 = $.trim(_this.parents('.meal_item').find('.meal_hidden_data').val()); //获取隐藏域的称重数据
			console.log(mealEditObj1);
			let mealEditNumHtml = $.trim(_this.parents('.meal_item').find('.meal_num').text());
			let mealEditType = 2; //判断当前点击编辑的数据是设备数据2还是手动输入数据1
			if(mealEditNumHtml == '手动输入'){
				mealEditType = 1;
			}
			if(mealEditObj1){ //如果当前编辑的内容在隐藏域里有数据,展示隐藏域的数据
				mealEditObj1 = JSON.parse(mealEditObj1);
				// alert('本地编辑数据是：'+mealEditObj1);
				eidtMealDataFn(mealEditObj1,mealEditType); //获取本地存储数据开始后面操作

			}else{ //本地存储没有数据,请求后台数据
				/* 测试 */
				// var result2 = [{"create_time":"2020-10-15 14:55:08","del_status":"0","flag_type":0,"id":3534,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:57:04.0","user_id":"8","waste_rate":"0","weight":"18"},{"create_time":"2020-10-15 14:56:30","del_status":"0","flag_type":0,"id":3535,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:58:26.0","user_id":"8","waste_rate":"0","weight":"50"},{"create_time":"2020-10-15 14:56:41","del_status":"0","flag_type":0,"id":3536,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:58:37.0","user_id":"8","waste_rate":"0","weight":"2"},{"create_time":"2020-10-15 14:56:51","del_status":"0","flag_type":0,"id":3537,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:58:47.0","user_id":"8","waste_rate":"0","weight":"18"},{"create_time":"2020-10-15 14:57:02","del_status":"0","flag_type":0,"id":3538,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:58:58.0","user_id":"8","waste_rate":"0","weight":"50"},{"create_time":"2020-10-15 14:57:12","del_status":"0","flag_type":0,"id":3539,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:59:08.0","user_id":"8","waste_rate":"0","weight":"45"},{"create_time":"2020-10-15 14:57:23","del_status":"0","flag_type":0,"id":3540,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:59:19.0","user_id":"8","waste_rate":"0","weight":"50"},{"create_time":"2020-10-15 14:57:44","del_status":"0","flag_type":0,"id":3541,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:59:40.0","user_id":"8","waste_rate":"0","weight":"2"},{"create_time":"2020-10-15 14:57:54","del_status":"0","flag_type":0,"id":3542,"item":"盐","mac":"80:7D:3A:E5:FC:DE","number":1,"type":"2","unit":"克","update_time":"2020-10-15 14:59:50.0","user_id":"8","waste_rate":"0","weight":"50"}];
    //             console.log(result2);
    //             storageObject.localSetItem("mealEdit-"+itemIndex+"-"+editNumber,JSON.stringify(result2)); //ajax后台获取到数据后存到本地存储里,后面点击确认按钮要操作这个数据
    //             eidtMealDataFn(result2,mealEditType);


				/* 查询用户信息 */
				let EditTypeHtml = $.trim(_this.parents('.meal_item').find('.meal_num').text());
				let EditType = 2;
				if(EditTypeHtml.indexOf('手动输入') > -1){
					EditType = 1;
				}
				let thatMealtime = editTime1.substr(0,2);
				let startTime = year+'-'+month+'-'+day + ' ' +thatMealtime+':00:00';
				let endTime = year+'-'+month+'-'+day + ' ' +thatMealtime+':59:00';
				$.ajax({
					url:'https://192.168.1.55:448/user/getWeightingDataListByHour',
					type:'post',
					data:{
						'user_id':userId,
						'item':item,
						'mac':deviceId,
						'type':EditType, //类型
						'start_time':startTime,
						'end_time':endTime
					},
					dataType:'json',
					success:function(result2){
						var str = JSON.stringify(result2);
						console.log(str);
						//var result2 = [{"create_time":"2020-08-08 14:10:01","del_status":"0","flag_type":0,"id":3,"item":"盐","mac":"as:qw","number":"1","type":"1","unit":"克","update_time":"2020-08-08 14:10:01.0","user_id":"1","waste_rate":"1","weight":"0.4"},{"create_time":"2020-08-08 14:11:53","del_status":"0","flag_type":0,"id":4,"item":"盐","mac":"as:qw","number":"1","type":"1","unit":"克","update_time":"2020-08-08 14:11:53.0","user_id":"1","waste_rate":"1","weight":"0.3"}];
						console.log(result2);
						eidtMealDataFn(result2,mealEditType); //获取后台存储数据开始后面操作
					},
					error:function(ero){
						console.log(ero);
					}
				})

			}

			editItem.show().find('.device_operating_title').text(_this.parents('.meal_item').find('.meal_num').text()).siblings('.dining_time').text(editTime1);

			$('#addDeviceNext5').attr({'session-edit':itemIndex+'-'+editNumber,'edit-index':editIndex});  //将大类别序号,人均摄入列表序号赋值给确认按钮,后面存session时要用到,editIndex是编辑元素的序号,后面确认的时候要用到
			if(_this.parents('.meal_item').hasClass('meal_item_capita')){  //有meal_item_capita类名就表示是手动输入数据
				editCapita = true;
			}

		})

		var mealCloseTime = '';  //点击人均摄入量列表里 设备数据 删除按钮获取的时间数据,下面通过length>-1判断是删除设备数据
		var manualCloseTime = '';  //点击人均摄入量列表里 手动输入数据 删除按钮获取的时间数据,下面通过length>-1判断是删除手动输入数据
		$('#typeCorrespondDetail .meal_item').on('click','.meal_close',function(){
			let _this = $(this);
			let index = _this.parents('.meal_item').index();
			$('#confirmDelete').show().find('#addDeviceNext7').removeAttr('close-weigh-index').attr('close-meal-index',index);
			var closeTime1 = $.trim(_this.parents('.meal_item').find('.meal_time').text());
			closeTime1 = closeTime1.substr(1,closeTime1.length-2);
			if(closeTime1.indexOf('-') > -1){
				closeTime1 = closeTime1.split('-')[0];
			}
			let fatherMealItem = _this.parents('.meal_item');
			if(fatherMealItem.hasClass('meal_item_capita')){ //删除的是手动输入的数据,将被点击的手动输入赋值给时间参数,后面点击确认按钮再删除
				manualCloseTime = closeTime1;
			}else{ //删除的是设备数据
				mealCloseTime = closeTime1;
			}

		})


		$('#footItem1').on('click',function(){
			if(!$(this).hasClass('no_manual_input')){ //没有no_manual_input,即当前swiper切换的是日期
				$('#manualInput').show().find('.shi_unit').text(weightUnit);
			}
		})
		/* addDevice编辑项目部分相关方法,这里只有展示,关闭弹窗的功能,其他功能早addItem.js里 */
		var addDevice = $('#addDevice');
		$('#footItem2').on('click',function(){
			var currentSelect = $(".detail_active").text();
			var currentTarget = $(".detail_active").find(".item_standard").val();
			var currentUnit = $(".detail_active").find(".item_unit").val();
			var allType = $("#addType1").find("li");
			console.log(currentSelect,currentTarget,currentUnit)
			$(".type1_active").removeClass("type1_active");
			$(".type2_active").removeClass("type2_active");
			allType.each(function(){
				if($(this).text() == currentSelect){
					$(this).addClass("type1_active");
					return
				}
			})
			if(currentUnit == "克"){
				$("#addType2").find("li:first-child").addClass("type2_active");
			}
			else if(currentUnit == "毫升"){
				$("#addType2").find("li:last-child").addClass("type2_active");
			}
			$("recommend_unit").val(currentTarget);
			addDevice.show();
		})

		$('#addDeviceBg,#addDeviceClose,#devicePrevious1').on('click',function(){
			addDevice.hide();
		})
		/* addDevice编辑项目部分相关方法 end */
		/* 删除项目相关方法 */
		$('#footItem3').on('click',function(){
			$('#confirmDeleteItem').show();
		})
		$('#confirmItemBg,#confirmItemClose,#devicePrevious6').on('click',function(){
			$('#confirmDeleteItem').hide();
		})
		$('#addDeviceNext6').on('click',function(){ // 确认删除
			$('#confirmDeleteItem').hide();
			let currentItemIndex = $('#detailType').attr('item-index'); //当前大类被的序号
			let deteleItem1 = $.trim(detailType.find('.detail_active').text());
			let switchItem1 = switchItem(deteleItem1); //类别名转为对应的数字
			let deteleItem = 0;
			if(switchItem1 > -1){
				deteleItem = switchItem1;
			}
			let mac1 = $.trim($('.detail_active').attr('deviceId')); //备用设备号
			//alert('删除项目1111:'+deviceId)
			//alert('删除项目333:'+mac1)
			if(!deviceId){
				deviceId = mac1;
			}
			//alert('删除项目传给后台的参数:'+userId+deteleItem+deviceId)
			/* 先删除后台项目数据 */
			//alert('删除项目传给后台的参数:'+userId+deteleItem+deviceId)
			$.ajax({
				url: 'https://192.168.1.55:448/user/equipmentDel',
				type: 'post',
				data: {
					'user_id': userId, //用户ID
					'item':deteleItem, //项目类别
					'mac':deviceId  //设备mac号
				},
				async: false, //同步,后台删除成功再执行下面的代码
				success: function(data){
					console.log('删除项目成功返回的数据是：'+ JSON.stringify(data));
				},
				error: function(error){
					console.log(error);
					alert('删除项目失败！');
					return;
				}
			})

			let currentTypeItemLength = 0;
			detailType.children('.detail_item').each(function(){  //获取当前还显示的类别个数
				if($(this).is(':visible')){
					currentTypeItemLength++;
				}
			})

			if(currentTypeItemLength>1){ //大类别大于1个时,删除对应的大类别
				let currentItemNext = detailType.children('.detail_item').eq(currentItemIndex);
				if(currentItemNext.length > 0 && currentItemNext.is(':visible')){ //后一个类别可能不存在,也可能已经被删除(隐藏),所以这里要同时满足即存在又显示
					currentItemNext.trigger('click');//删除当前类别,后一个类别被展示
				}else{
					detailType.children('.detail_item').eq(currentItemIndex-2).trigger('click');//删除当前类别,后一个类别不存在,展示前一个类别
				}

				detailType.children('.detail_item').eq(currentItemIndex-1).hide();
				typeCorrespondDetail.children('.type_item'+currentItemIndex).hide();
			}else{ //当前只有一个大类别,删除页面为null
				detailType.children('.detail_item').eq(currentItemIndex-1).hide();
				typeCorrespondDetail.children('.type_item'+currentItemIndex).hide();
			}
			/* 下面操作本地存储 */
			let mealEditIndex = storageObject.localGetItem('mealEditIndex');  //本地存储里记录编辑的序号
			storageObject.localRemoveItem('typeResult-'+userId+'-'+currentItemIndex); //删除项目对应的大类别的本地存储数据
			if(mealEditIndex &&mealEditIndex.length>0){
				mealEditIndexArr = mealEditIndex.split('@');
				for(let i=0;i<mealEditIndexArr.length;i++){
					if(mealEditIndexArr[i].length > 0){
						storageObject.localRemoveItem('mealEdit-'+mealEditIndexArr[i]); //删除本项目所有的编辑数据
					}
				}
				storageObject.localRemoveItem('mealEditIndex'); //将记录编辑序号的参数也删除
			}

			let foodTypeVal1 = storageObject.localGetItem('foodTypeVal'); //删除食物大类别数组里对应被删除的那部分数据
			if(foodTypeVal1&&foodTypeVal1.length>0){
				if(foodTypeVal1.indexOf('||') > -1){ //多个类别,删除foodTypeVal里对应类别的数据
					let currentTypeList = foodTypeVal1.split('||');
					currentTypeList.splice(currentItemIndex-1, 1);
					let currentTypeListStr = '';
					if(currentTypeList.length > 1){
						currentTypeListStr = currentTypeList.join('||');
					}else{
						currentTypeListStr = currentTypeList;
					}

					storageObject.localSetItem('foodTypeVal',currentTypeListStr);
				}else{//只有一个类别
					if(currentTypeItemLength == 1){
						storageObject.localRemoveItem('foodTypeVal'); //将记录编辑序号的参数也删除
					}
				}
			}

			var foodActiveName = window.localStorage.getItem('foodActiveName');
			console.log('当前被选中的类别是' + foodActiveName);


			/* 删除完回到首页 */
			window.location.href = 'index.html';
		})
		/* 删除项目相关方法 end*/
	}


	$('#manualClose').on('click',function(){
		$(this).parents('#manualInput').hide();
	})
	/* 点击选择日期方法 */
	$("#manualDay").click(function () {
		var dtPicker = new mui.DtPicker({ type: 'date', beginYear:1949,endYear:3016});
		/*参数：'datetime'-完整日期视图(年月日时分)
				'date'--年视图(年月日)
				'time' --时间视图(时分)
				'month'--月视图(年月)
				'hour'--时视图(年月日时)
		*/
		dtPicker.show(function (selectItems) {
		   var y = selectItems.y.text;  //获取选择的年
		   var m = selectItems.m.text;  //获取选择的月
		   var d = selectItems.d.text;  //获取选择的日
		   var date = y + "/" + m + "/" + d ;
		   $("#manualDay em").text(date); //赋值
		})
	});

	/* 点击选择时间方法 */
	$("#manualTime").click(function () {
		let dtPicker1 = new mui.DtPicker({ type: 'time'}); //type为time,表示是时间视图(时分)
		dtPicker1.show(function (selectItems) {
		   let h = selectItems.h.text;  //获取选择的时
		   let i = selectItems.i.text;  //获取选择的分
		   let date = h + ":" + i ;
		   $("#manualTime em").text(date); //赋值
		})
	});

	/* 选择摄入量方法 */
	manualIntake('manualIntake',50,weightUnit);

	$('#manualConfirm').on('click',function(){
		let mealIntake = $.trim($('#manualIntake .shi_num').text()); //获取的手动输入重量值
		let that1 = $(this);
		if(mealIntake != 0){
			let mealDay = $.trim($('#manualDay em').text());  //天
			let mealTime = $.trim($('#manualTime em').text()); //时间
			let mealFlag = true; //设备时间是否重复参数
			let manualFlag = true;  //手动输入时间是否重复参数
			let number1 = storageObject.localGetItem('personNum'); //进餐人数
			if(!number1){ //如果获取不到人数,就默认1
				number1 = 1;
			}
			let wasteName1 = $.trim($('#detailType .detail_active').attr('devicename'));
			let wasteNum1 = storageObject.localGetItem('wasteNum'); //损耗比例
			if(!wasteNum1){ //如果损耗比例本地不存在,就表示用户没有设置,这时用默认值0
				wasteNum1 = 0;
			}
			mealDataElement.find('.meal_item_capita').remove();//重要: 每次新增手动输入数据前先将原来显示的手动输入列表数据删除(有meal_item_capita类名的),下面给排序后再循环插入
			let resultTypeDay = mealDay.replace(/\//gm,'-'); //天日期改变格式,替换全部的/符号
			let resultTypeDay1 = resultTypeDay + ' ' + mealTime;
			if(formatTimeArr.indexOf(resultTypeDay1)>-1){  //手动选择的时间在图表里已经存在,提示从选个时间
				console.log(formatTimeArr)
				alert('当前选择的时间已经存在数据,请重新选择时间!');
				return false;
			}
			/* 先传数据到后台 */
			//alert('手动输入传到后台的参数：'+item+','+deviceId+','+wasteName1+','+mealIntake+','+number1+','+wasteNum1+','+weightUnit+','+resultTypeDay+','+mealTime)
			$.ajax({
				url:'https://192.168.1.55:448/user/weighingdataAdd',
				type:'post',
				data:{
					'user_id':userId, //用户ID
					'item':item, //项目名称
					'name':wasteName1, //设备名称
					'mac':deviceId, //设备ID号
					'type':1,  // 1代表手动输入数据,因为是手动输入数据,所以这里写死为1
					'weight':mealIntake, //手动输入重量
					'waste_rate':wasteNum1, //损耗比例
					'number':number1,  //用餐人数
					'unit':weightUnitE,  //单位
					'create_time': resultTypeDay1 + ':00' //创建时间
				},
				dataType:'json',
				success:function(result){
					that1.parents('#manualInput').hide();  //关闭弹窗
					var result4 = JSON.stringify(result);
					console.log('插入手动输入数据后返回结果:'+result4)
					window.location.reload();
					/* 插入成功后开始查询并展示刚插入的数据 */
					//alert('时间是：'+resultTypeDay+','+resultTypeDay)
					let manualRequestStartTime = resultTypeDay + ' 00:00:00';
					let manualRequestEndTime = resultTypeDay + ' 23:59:00';
					getWeightingDataCalculateList(manualRequestStartTime,manualRequestEndTime,true);
				},
				error:function(error){
					var str = JSON.stringify(error);
				}
			});


			/* 下面的判断后面要放到上面ajax成功事件里 */
			// if(mealDay === nowDayTime){ //选择的是当前日期,添加此数据到当前页面
				//发送手动输入数据到后台后.传当天时间参数,从新请求后台数据,刷新页面
				// let manualRequestStartTime = resultTypeDay + ' 00:00:00';
				// let manualRequestEndTime = resultTypeDay + ' 23:59:00';
				// getWeightingDataCalculateList(manualRequestStartTime,manualRequestEndTime);


				// let editItemIndex = $.trim(detailType.attr('item-index'));
				// let resultTypeData1 = storageObject.localGetItem("typeResult-"+userId+"-"+editItemIndex);//先判断本地存储里当前序号对应的大类别的数据
				// resultTypeData1 = JSON.parse(resultTypeData1);
				// if(resultTypeData1 && (resultTypeData1.length>0)){
				// 	let resultTimeArr = [];
				// 	for(let i=0;i<resultTypeData1.length;i++){
				// 		let format_time = resultTypeData1[i].format_time;
				// 		if(format_time){
				// 			format_time = format_time.substr(format_time.length-5,format_time.length-1);
				// 		}
				// 		resultTimeArr.push(format_time); //图表时间
				// 		resultTimeArr.sort(function(a,b){ //图表时间排序
				// 			return a > b ? 1 : -1
				// 		})
				// 	}

				// 	//查询选择的时间在原时间数组里的位置,大于-1表示在数组里存在,数字即位置序号
				// 	let mealTimeIndex = resultTimeArr.indexOf(mealTime);
				// 	if(mealTimeIndex > -1){  //选择的时间在原数组里,更新对应位置的数据
				// 		resultTypeData1[mealTimeIndex].avg_weight = mealIntake;  //??? mealIntake是人均摄入量还是总摄入量呢?没有选中人数啊

				// 	}else{   //选择的时间不在原数组里,新增一条数据
				// 		resultTimeArr.push(mealTime);
				// 		resultTimeArr.sort(function(a,b){ //图表时间排序
				// 			return a > b ? 1 : -1
				// 		})
				// 		let mealTimeIndex1 = resultTimeArr.indexOf(mealTime);
				// 		let personNum = storageObject.localGetItem("personNum"); //进餐人数
				// 		if(!personNum){
				// 			personNum = 1;
				// 		}

				// 		let resultTypeObject = {} //创建数组对象
				// 		resultTypeObject.avg_weight = mealIntake;
				// 		resultTypeObject.format_time = resultTypeDay + ' ' + mealTime;
				// 		resultTypeObject.group_weight = (mealIntake*personNum)/((100-wasteNum1)/100); //手动输入的就是平均重量,所以这里总重量要计算一下
				// 		resultTypeObject.id = id; //这个id本地没有,需要后台返回
				// 		resultTypeObject.number = number1;
				// 		resultTypeObject.type = 1;
				// 		resultTypeObject.waste_rate = wasteNum1;
				// 		resultTypeObject.weight = mealIntake;

				// 		resultTypeData1.splice(mealTimeIndex1, 0, resultTypeObject); //数组插入新的数据

				// 	}
				// 	/* 添加新的数据到本地存储里 */
				// 	storageObject.localSetItem("typeResult-"+userId+"-"+itemIndex,JSON.stringify(resultTypeData1));

				// 	/* 添加新的数据到当前大类别数据后操作方法 */
				// 	categoryDataFn(resultTypeData1,editItemIndex);

				// 	/* 手动添加的数据展示到页面和本地存储后,因为从新排序了(edit-number值从新排列了),要将已经不再准确的以mealEdit开头的编辑数据清除 */
				// 	let mealEditIndexSession = storageObject.localGetItem("mealEditIndex");
				// 	if(mealEditIndexSession){
				// 		mealEditIndexSession = mealEditIndexSession.substr(0,mealEditIndexSession.length-1);
				// 		if(mealEditIndexSession.indexOf('@') > -1){ //多条
				// 			let mealEditIndexSessionArr = mealEditIndexSession.split('@');
				// 			$.each(mealEditIndexSessionArr,function(i,val){
				// 				storageObject.localRemoveItem("mealEdit-"+val);
				// 			})
				// 		}else{ //只有一条
				// 			storageObject.localRemoveItem("mealEdit-"+mealEditIndexSession);
				// 		}
				// 		storageObject.localRemoveItem("mealEditIndex"); //mealEdit类的session清除完了,记录名称的session也要清除
				// 	}

				// }


			// }else{ //选择的不是当前日期,只需要将数据传到后台,没有其他操作了

			// }
		}else{
			that1.css('background','#ccc');
		}
	})

	/* manualInput手动输入部分相关方法 end */



})


//克隆第一个大类别的html内容后添加数据(原本是切换大类别时克隆,但是会造成没有数据时图表显示一片空白的问题)
function cloneTypeItem(index){
	let itemIndex = index+1;
	let typeNowItem = typeCorrespondDetail.find('.type_item'+itemIndex); //当前点击大类别菜单,与之对应的下方type_item内容
	if((typeNowItem.length < 1) || (!typeNowItem.hasClass('type_item'+itemIndex))){ //如果对应type_item内容不存在,克隆第一个大类别的html内容后添加数据
		/* 切换到的类别没有内容,克隆第一个大类别的html内容后*/
		typeCorrespondDetail.find('.type_item').eq(0).show();
		var createTypeItemElement = typeCorrespondDetail.find('.type_item').eq(0).clone(true);
		createTypeItemElement.removeClass('type_item1').addClass('type_item'+itemIndex);
		createTypeItemElement.find('.swiper_new_chart').attr('id','swiperNewChart'+itemIndex);
		createTypeItemElement.find('.day_chart').attr('id','dayChart'+itemIndex);
		typeCorrespondDetail.find('.type_item').hide(); //clone完将所有.type_item内容隐藏
		let typeItemNext = typeCorrespondDetail.find('.type_item'+(index+2)); //当前元素的后一个元素
		let typeItemPrev = '';
		if(index==0){ //当前元素的前一个元素
			typeItemPrev = typeCorrespondDetail.find('.type_item1');
		}else{
			typeItemPrev = typeCorrespondDetail.find('.type_item'+index);
		}
		if(typeItemNext.length > 0){
			typeItemNext.before(createTypeItemElement);
		}else if(typeItemPrev.length > 0){
			typeItemPrev.after(createTypeItemElement); //插入到对应序号的后面
		}else{
			typeCorrespondDetail.find('.type_item').eq(0).after(createTypeItemElement); //插入到对应序号的后面
		}
	}
}

/* 点击按钮减事件 */
function recommendDecrease(thatPlus){
	let inputVal = parseInt($(thatPlus).siblings('.edit_is_input').val());
	if(inputVal === 0){
		$(thatPlus).siblings('.edit_is_input').val(0);
	}else{
		$(thatPlus).siblings('.edit_is_input').val(inputVal-1);
	}
}
/* 点击按钮加事件 */
function recommendIncrease(thatPlus){
	let inputVal = parseInt($(thatPlus).siblings('.edit_is_input').val());
	if(inputVal > 9998){
		$(thatPlus).siblings('.edit_is_input').val(9999);
	}else{
		$(thatPlus).siblings('.edit_is_input').val(inputVal+1);
	}
}
/* 点击称重重量删除按钮事件 */
function recommendClose(thatPlus){
	let index = $(thatPlus).parents('.weighing_list').index();
	let deteleId = $(thatPlus).parents('.weighing_list').find('.recommend_input').attr('ed-id');
	$('#confirmDelete').show().find('#addDeviceNext7').removeAttr('close-meal-index').attr('close-weigh-index',index+'-'+deteleId); //index为删除的序号，deteleId为删除的重量数据的id号
}

/*获取当天的数据,要传时间参数*/
function getWeightingDataCalculateList(startTime,endTime,weekOrMonthFlag){
	// let startTime= year+'-'+month+'-' + day + ' 00:00:00';
	// let endTime= year+'-'+month+'-' + day + ' 23:59:00';
	// var href = window.location.href;
	// console.log('href==' + href ) ;
	// var index1 = href.indexOf('?') +1;
	// var userId  = href.substring(index1,href.length+1);
	// console.log('userId ==' + userId);

	console.log('详情查询数据之前参数==:'+userId+','+item+','+deviceId+','+startTime+','+endTime);
	$.ajax({
		url:'https://192.168.1.55:448/user/getWeightingDataCalculateList',
		type:'post',
		data:{
			'user_id':userId,
			'item':item,
			'mac':deviceId,
			'start_time':startTime,
			'end_time':endTime
		},
		dataType:'json',
		success:function(result7){
			/*切到日,隐藏新的chart表,各种错误提示,显示旧的chart表和人居摄入量列表 */
			typeCorrespondDetail.find('.type_item'+itemIndex).find('#swiperNewChart'+itemIndex).hide().siblings('.number_chart,.meal_data').show().siblings('.swiper_error_html').remove();

			/* 获取到后台大类别数据后操作方法 */
			// alert('返回的重量数据是：'+result7)
			console.log('详情返回的所有重量数据是：'+JSON.stringify(result7));
			//alert('详情返回的所有重量数据是：'+result7)
			if(result7 && result7.length >0){
				typeCorrespondDetail.find('.meal_data').show(); //有数据,人均摄入列表显示
				//typeCorrespondDetail.find('.date_chart_day .date_still_bad').show(); //提示显示
				// weekOrMonthFlag判断是否需要忘数据库添加新的人均摄入量,这里只有手动输入时需要传
				categoryDataFn(result7,itemIndex,weekOrMonthFlag);
			}else{
				typeCorrespondDetail.find('.meal_data').hide(); //没有数据,人均摄入列表隐藏
				typeCorrespondDetail.find('.date_chart_day .date_chart_num strong').text(0); //当日累计摄入量置为0
				typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_still_bad span').text(0); //当日总用量置为0
				typeCorrespondDetail.find('.type_item'+itemIndex).find('.today_first_weight .today_txt').text('').end().find('.weighing_weight .shi_num').text(0);
				typeCorrespondDetail.find('.type_item'+itemIndex).find('.today_last_weight .today_txt').text('').end().find('.today_last_weight .shi_num').text(0);
				typeCorrespondDetail.find('.type_item'+itemIndex).find('.meal_per_num').text(0);
				//typeCorrespondDetail.find('.date_chart_day .date_still_bad').hide(); //提示隐藏
				xAxis = ["00:00","12:00","23:00"];
				manArr = [0,0,0];
				devArr = [0,0,0];
				/* 切换类别后更新图表 */
				setTimeout(function(){
					initChart3(itemIndex)
				},300);

				/* swiper初始化,暂且隐藏,现在不需要了 */
				// if(swiper_first_flat == true){ //控制只执行一次
				// 	swiperInitFn(1);
				// }
			}
			// 判断左右按钮是否可以点击
			let todayDate = new Date(year+'/'+month+'/'+day);  //今天日期
			let newChangeDate = startTime.substr(0,10);  //从首页跳转过来的日期
			let newChangeDate1 = new Date(newChangeDate.replace("-", "/").replace("-", "/"));  //转换格式
			if(todayDate>newChangeDate1){ //从首页跳转过来的日期在今天之前,比如今天1月26日,跳转过来的日期是1月24日
				typeCorrespondDetail.find('.date_right').removeClass('date_no_click');
			}else{
				typeCorrespondDetail.find('.date_right').addClass('date_no_click');
			}
		},
		error:function(err){
			console.log(err);
		}
	});
}

/* 初始化或者点击切换大类别,获取到session或者后台数据后操作方法, reData是数据,index是当前点击的序号,weekFlag表示是否需要将计算的平均值传到后台数据库*/
var swiper_first_flat = true;
var arrangeDeviceArr = []; //处理好的所有蓝牙重量数据数组
var arrangeDeviceIndexArr = []; //记录设备每一餐对应的称重数据的序号数组,如['3@@4'],表示总称重数据reData里的第4,5条数据
var arrangemanualIndexArr = []; //记录手动输入每一餐对应的称重数据的序号数组

var thatDayManualCumulativeIntake = 0;   //当日手动人均摄入量总和
var thatDayDeviceCumulativeIntake = 0;   //当日蓝牙设备人均摄入量总和
var mdIndexArr = [];
var mdIndexArr1 = [];
function categoryDataFn(reData,index,weekFlag){
	//alert(JSON.stringify(reData))
	/* 每次接收的reData都是后台传的全部的称重数据,下面要出来拼接成以前的result3需要的格式,result3格式如下*/
	//let result3 = '[{"avg_weight":"3","format_time":"2020-08-28 09:32","group_weight":3,"id":1,"type":1},{"avg_weight":"76.44444444444444","flag_type":0,"format_time":"2020-08-27 17:54","group_weight":"688","id":0,"number":0,"type":"2"},{"avg_weight":"20","format_time":"2020-08-27 18:25","group_weight":20,"id":1,"type":1}]';

	if(reData){
		//******* 将大规格对应的所有数据保存到隐藏域中去,要先清除再存入
		$('#currentTypeAllData1').val('');
		$('#currentTypeAllData1').val(JSON.stringify(reData));

		/* 处理拼接数据数组开始 */
		var deviceWeightList = []; //蓝牙设备重量列表
		var manualWeightList = []; //手动输入重量列表
		for(var i=0;i<reData.length;i++){
			if(reData[i].type == 2){ //蓝牙设备重量
				deviceWeightList.push(reData[i]);
			}else if(reData[i].type == 1){ //手动输入重量
				manualWeightList.push(reData[i]);
			}
		}
		if((deviceWeightList.length<1) && (manualWeightList.length<1)){ //都不存在,没有数据
			return false;
		}
		/*处理设备列表数据*/
		arrangeDeviceWeightListData(deviceWeightList);
		/*处理手动输入列表数据*/
		arrangeManualWeightListData(manualWeightList);
		/* 处理拼接数据数组结束 */


		let typeCorrespondDetail = $('#typeCorrespondDetail');
		let typeindexClass = '.type_item'+index;
		/* 根据设备数据展示首次和当前称重重量 */
		if(deviceWeightList.length > 0){
			let firstFormatTime1 = deviceWeightList[0].format_time; //第一次称重时的时间
			firstFormatTime = firstFormatTime1.substr(firstFormatTime1.length-5,firstFormatTime1.length-1);
			let todayTime1 = firstFormatTime1.substr(0,10); //当天日期
			let todayTime2 = todayTime1.split('-'); //拆分时间
			let todayTime = todayTime2[0]+'年'+todayTime2[1]+'月'+todayTime2[2]+'日';
			let firstWeighing = deviceWeightList[0].weight; //第一次称重的重量
			let lastFormatTime = deviceWeightList[deviceWeightList.length-1].format_time; //最新一次称重时的时间
			lastFormatTime = lastFormatTime.substr(lastFormatTime.length-5,lastFormatTime.length-1);
			let lastWeighing = deviceWeightList[deviceWeightList.length-1].weight; //最新一次称重重量
			let numberOfMeals1 = deviceWeightList[deviceWeightList.length-1].number;  //用餐人数去最新一次称重数据的人数
			typeCorrespondDetail.find(typeindexClass).find('.date_change_btn em').text(todayTime);
			typeCorrespondDetail.find(typeindexClass).find('.today_first_weight .today_txt').text(firstFormatTime).end().find('.weighing_weight .shi_num').text(firstWeighing);
			typeCorrespondDetail.find(typeindexClass).find('.today_last_weight .today_txt').text(lastFormatTime).end().find('.today_last_weight .shi_num').text(lastWeighing);
			typeCorrespondDetail.find(typeindexClass).find('.meal_per_num').text(numberOfMeals1);
			//alert('最后一次称重的人数是：'+numberOfMeals1)
		}else{ //没有称重数据
			typeCorrespondDetail.find(typeindexClass).find('.today_first_weight .today_txt').text('').end().find('.weighing_weight .shi_num').text(0);
			typeCorrespondDetail.find(typeindexClass).find('.today_last_weight .today_txt').text('').end().find('.today_last_weight .shi_num').text(0);
			if(manualWeightList.length>0){ //如果蓝牙设备没有数据,手动输入有数据,就展示手动输入的最后一天数据
				let manualNum1 = manualWeightList[manualWeightList.length-1].number;
				typeCorrespondDetail.find(typeindexClass).find('.meal_per_num').text(manualNum1);
			}else{
				typeCorrespondDetail.find(typeindexClass).find('.meal_per_num').text(0);
			}
		}

		/* 将处理拼接的数组数据传给以前的参数result3 */
		result3 = arrangeDeviceArr;
		perCapitaData = arrangeDeviceArr; //将处理拼接的数组数据传给全局变量,后面添加手动数据等操作时需要
		console.log('处理后所有的数据的是：'+JSON.stringify(result3))

		if(result3 && result3.length>0){
			//storageObject.localSetItem("typeResult-"+userId+"-"+index,JSON.stringify(result3)); //将刚进入页面获取的大类别的数据存到本地存储里,序号是0,后面切换大类别时序号跟踪变化
			let mealDataHtml = '';
			chartIdArr = [];  //先清空ID数组
			/* if(index == 0){
				typeindexClass = '.type_item1';
			}else{
				typeindexClass = '.type_item'+(index+1);
			} */
			/* 因为手动输入插入数据要克隆meal_data子列表第一条数据,
			未防止用户先将子列表全删除了再手动输入(这时clone第一条数据为空),这里初始化时就clone插入,但是隐藏.
			这里如果clone后赋值给参数,后面再clone这个参数去插入到列表里.会造成插入的列表数据点击编辑和删除按钮没有反应 */
			// typeCorrespondDetail.find('.type_item'+(index+1)).find('.meal_data').prepend(typeCorrespondDetail.find('.type_item'+(index+1)).find('.meal_data').find('.meal_item:eq(0)').clone(true));
			// typeCorrespondDetail.find('.type_item'+(index+1)).find('.meal_data').find('.meal_item:eq(0)').find('.meal_edit').attr('edit-number',0);  //给刚clone插入的第一个元素属性赋值0
			/* clone过来的数据插入新的meal_item列表数据前,要将以前的meal_item列表数据删除 */

			typeCorrespondDetail.find(typeindexClass).find('.meal_data').find('.meal_item:eq(0)').show().nextAll().remove(); //将原本第一个隐藏的显示供后面clone,后面的先全部清除
			/* 不论是切换天数回到当前日期还是刚进入详情页面,都要隐藏新的chart表,显示旧的chart表和人居摄入量列表 */
			typeCorrespondDetail.find(typeindexClass).find('#swiperNewChart'+itemIndex).hide().siblings('.number_chart,.meal_data').show();
			xAxis = []; //清空数组
			manArr = [];
			devArr = [];
			let xAxisArr = []; //所有时间没有排序前的数组
			let deviceXArr = []; //设备时间数组
			let capitaXArr = []; //手动输入时间数组
			let deviceOrcapitaArr = [];

			// let chartDataArr = [];
			// for(let i=0;i<result3.length;i++){
			// 	let chartDataObj = {};
			// 	let format_time = result3[i].format_time;
			// 	if(format_time){
			// 		format_time = format_time.substr(format_time.length-5,format_time.length-1);
			// 	}
			// 	let format_id = result3[i].id;
			// 	let format_type = result3[i].type;
			// 	let format_avg_weight = result3[i].avg_weight;
			// 	chartDataObj.time = format_time;
			// 	chartDataObj.id = format_id;
			// 	chartDataObj.type = format_type;
			// 	chartDataObj.avg_weight = format_avg_weight;
			// 	chartDataArr.push(chartDataObj);
			// }
			// console.log(chartDataArr);
			let chartIdArr1 = []; //chartIdArr1用于存储手动输入的ID
			let chartIdArr2 = []; //chartIdArr2用于存储蓝牙设备的ID
			var resultChartData = $.extend(true, [], result3); //赋值数据,供图表方法使用,图表部分按时间来排列
			resultChartData.sort(function(a, b) { //排序方法
				let aDate = new Date(a.format_time.replace(/-/g, '/'));
				let bData = new Date(b.format_time.replace(/-/g, '/'));
				let myData = new Date();
				let year = myData.getYear();
				if (aDate.getYear > year && aDate.getYear == year) {
					return true;
				}
				return aDate - bData;
			});
			for(let i=0;i<resultChartData.length;i++){
				/* 图表部分*/
				let formatTime1 = resultChartData[i].format_time;
				formatTimeArr.push(formatTime1); //记录数据里的时间,后面添加手动输入数据的时候用
				let format_time = formatTime1.substr(formatTime1.length-5,formatTime1.length-1);
				let format_id = resultChartData[i].id;
				chartIdArr.push(format_id);
				xAxisArr.push(format_time); //记录数据里的时间,后面排序用
				xAxis.push(format_time); //图表时间
				// xAxis.sort(function(a,b){ //图表时间排序
				// 	return a > b ? 1 : -1
				// })
				// chartIdArr.sort(function(a,b){ //图表时间排序
				// 	return a > b ? 1 : -1
				// })


				let mealTimeIndex = chartIdArr.indexOf(format_id); //查询新增的时间在数组里的位置
				let mealAvgWeight = parseFloat(resultChartData[i].avg_weight);
				if(resultChartData[i].type == 1){ //type等于1是手动输入数据,manArr插入重量数据,devArr插入0
					capitaXArr.push(format_time);
					manArr.splice(mealTimeIndex,0,(mealAvgWeight).toFixed(2));  //手动输入数组添加重量数据
					devArr.splice(mealTimeIndex,0,0);  //设备获取数据数组添加0
					chartIdArr1.push(format_id);
				}else if(resultChartData[i].type == 2){ //type等于2是设备传的数据,manArr插入0,devArr插入重量数据
					deviceXArr.push(format_time);
					manArr.splice(mealTimeIndex,0,0);  //手动输入数组添加0
					devArr.splice(mealTimeIndex,0,(mealAvgWeight).toFixed(2));  //设备获取数据数组添加重量数据
					chartIdArr2.push(format_id);
					chartIdArr2.sort(function(a,b){ //图表时间排序
						return a > b ? 1 : -1
					})
				}
			};

			// if(chartIdArr2 && chartIdArr1){ //如果设备ID数组、手动输入ID数组数据都存在
			// 	chartIdArr = chartIdArr2.concat(chartIdArr1);
			// }else if(chartIdArr2 && (!chartIdArr1)){ //只有设备ID数组,没有手动输入ID数组数据
			// 	chartIdArr = $.extend(true, [], chartIdArr2);
			// }else if(chartIdArr1 && (!chartIdArr2)){ //只有手动输入ID数组,没有设备ID数组数据
			// 	chartIdArr = $.extend(true, [], chartIdArr1);
			// }
			// console.log('zhenghao'+chartIdArr)

			//chartIdArr.push(format_id); //记录数据里的ID,记录到图表里,后面点击图表的柱体根据这个ID确定弹窗

			/* 手动和设备时间排序 */
			// deviceXArr.sort(function(a,b){ //设备时间排序
			// 	return a > b ? 1 : -1
			// })
			// capitaXArr.sort(function(a,b){ //手动输入时间排序
			// 	return a > b ? 1 : -1
			// })
			// $.each(deviceXArr,function(i,val){
			// 	deviceOrcapitaArr.push(xAxisArr.indexOf(deviceXArr[i]));
			// })
			// $.each(capitaXArr,function(i,val){
			// 	deviceOrcapitaArr.push(xAxisArr.indexOf(capitaXArr[i]));
			// })

			/* 人均摄入列表部分,根据排序结果deviceOrcapitaArr来循环插入,按手动和设备数据来排列 */
			for(let j=0;j<result3.length;j++){
				let format_time1 = result3[j].format_time;
				format_time1 = format_time1.substr(format_time1.length-5,format_time1.length-1);
				let newMealItemManualHtml = '';
				/* 克隆具体就餐数据html,添加真实数据后插入到人居摄入数据列表里 */
				let newMealItemElement = typeCorrespondDetail.find(typeindexClass).find('.meal_data').find('.meal_item:eq(0)').clone(true);
				if(result3[j].type == '1'){ //type等于1是手动输入数据
					newMealItemElement.addClass('meal_item_capita').find('.meal_num').text('手动输入');
					let mealHiddenData = result3[j];
					let mealHiddenDataArr = [];
					mealHiddenDataArr.push(mealHiddenData);
					newMealItemElement.find('.meal_hidden_data').val(JSON.stringify(mealHiddenDataArr)); //将对应的手动输入称重数据转为json数组赋值给隐藏域
				}else if(result3[j].type == '2'){ //type等于2是设备传的数据
					newMealItemElement.find('.meal_num').text('第'+toChinesNum(j+1)+'餐');
					/* 按arrangeDeviceIndexArr里的序号将reData里对应的数据拼接后存到隐藏域里 */
					let newMealDataArr = [];
					let newMealDataIndexArr = arrangeDeviceIndexArr[j].split('@@');
					for(let p=0;p<newMealDataIndexArr.length;p++){
						let newMealDataIndex = parseInt(newMealDataIndexArr[p]);
						newMealDataArr.push(deviceWeightList[newMealDataIndex]); //从蓝牙设备数据数组里根据序号查找具体数据,赋值给隐藏域
					}
					newMealItemElement.find('.meal_hidden_data').val(JSON.stringify(newMealDataArr)); //将对应的设备称重数据转为json数组赋值给隐藏域
				}
				newMealItemElement.attr('id',result3[j].id);
				newMealItemElement.find('.meal_time').text('('+format_time1+')');
				let mealAvgWeight1 = parseFloat(result3[j].avg_weight);
				newMealItemElement.find('.shi_num').text((mealAvgWeight1).toFixed(2));
				newMealItemElement.find('.meal_edit').attr('edit-number',(j+1));
				typeCorrespondDetail.find(typeindexClass).find('.meal_data').append(newMealItemElement);
			}

			typeCorrespondDetail.find(typeindexClass).find('.meal_data').find('.meal_item:eq(0)').hide(); //clone完以后要将第一个被clone的对象隐藏

			//计算称重总重量
			deviceAllWeight = Math.round(deviceAllWeight*100)/100;
			typeCorrespondDetail.find(typeindexClass).find('.date_still_bad span').text(deviceAllWeight);

			//当前类别当日摄入人均总重量
			dayTotalIntake = thatDayManualCumulativeIntake + thatDayDeviceCumulativeIntake;
			dayTotalIntake = Math.round(dayTotalIntake*100)/100;
			typeCorrespondDetail.find(typeindexClass).find('.date_chart_day .date_chart_num strong').text(dayTotalIntake);
			/* 指导重量赋值 */
			// let itemStandard = parseFloat(detailType.find('.detail_active').find('.item_standard').val());
			// let beyondWeightAbs = (Math.round(Math.abs(itemStandard - dayTotalIntake)*100)/100).toFixed(2); //求差值,保留两位小数
			// if(itemStandard - dayTotalIntake > 0){ //指导摄入重量大于当日累计摄入量
			// 	typeCorrespondDetail.find(typeindexClass).find('.date_chart_day .date_still_bad').html('提示：离指导量还有 <span>'+beyondWeightAbs+'</span><i class="shi_unit">'+weightUnit+'</i>');
			// }else{ //指导摄入重量小于当日累计摄入量
			// 	typeCorrespondDetail.find(typeindexClass).find('.date_chart_day .date_still_bad').html('提示：超过最大摄入量 <span>'+beyondWeightAbs+'</span><i class="shi_unit">'+weightUnit+'</i>');
			// }

			/* 切换成功后赋值重量单位 */
			let itemUnit = $.trim(detailType.find('.detail_active').find('.item_unit').val());
			if(itemUnit == '克'){
				weightUnit1 = 'g';
				weightUnitE = 49;
			}else{
				weightUnit1 = 'ml';
				weightUnitE = 50;
			}
			typeCorrespondDetail.find(typeindexClass).find('.shi_unit').text(weightUnit1);
			storageObject.localSetItem('project_unit',itemUnit); // 当前被选中的项目
			//网后台传当前项目的当天的人均用量(dayTotalIntake),总摄入量(deviceAllWeight),称重时间(lastWeighingTime).供首页周月图表使用
			if(weekFlag){  //weekFlag为true时才往后台传新的数据,编辑、删除、添加手动输入数据时为true
				weekOrMonthChartInsertFn(dayTotalIntake,deviceAllWeight);
			}

		}else{ //数据为null,可能是全部删除了,要将人均列表、总重等信息置0,本地存储清除
			storageObject.localRemoveItem('typeResult-'+userId+'-'+index); //全部删除了,删除项目对应的大类别的本地存储数据
			mealDataElement.find('.meal_item').hide(); //人均列表隐藏
			//typeCorrespondDetail.find(typeindexClass).find('.date_chart_num strong').text(0).end().find('.date_still_bad span').text(0); //总重和指导重量置0
			// var errorHTML1 = '<div style="text-align: center; line-height: 150px; color: #999;">暂且没有对应的数据</div>'
			// typeCorrespondDetail.find('.type_item'+itemIndex).find(".day_chart").html(errorHTML1);
			xAxis = ["00:00","12:00","23:00"];
			manArr = [0,0,0];
			devArr = [0,0,0];
		}

		/* 切换类别后更新图表 */
		setTimeout(function(){
			initChart3(index)
		},300);

		if(currentUserID&&currentUserPhone){
			$(".meal_operating_icon").hide();
		}
		else{
			$(".meal_operating_icon").show();
		}
		/* 计算平均值提示方法 */
		averageValueFn();
		typeCorrespondDetail.find('.type_item'+itemIndex).find('.no_type_data_html').remove();
	}else{ //数据为空时
		/* 数据为空,此时将图表数据全部置为null展示 */
		xAxis = ["00:00","12:00","23:00"];
		manArr = [0,0,0];
		devArr = [0,0,0];
		setTimeout(function(){ //更新空的图表
			initChart3(index)
		},300);
	}

	/* swiper初始化 */
	if(swiper_first_flat == true){ //控制只执行一次
		//swiperInitFn(index);   //最新详情页面设计去掉顶部日周月年swiper切换,这里暂时隐藏
	}
}

/* 获取到当前项目近日人均用量(avgWeight),总重(grossWeight),称重时间(lastWeighingTime)后传到后台保存 */
function weekOrMonthChartInsertFn(avgWeight,grossWeight){
	let deviceName1 = $.trim($('#detailType .detail_active').attr('devicename'));
	let lastWeighingTime = $.trim(typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_change_btn em').text());
	lastWeighingTime = lastWeighingTime.replace('年','-').replace('月','-').replace('日',''); //年月汉字替换为横线

	if((avgWeight != 0) && (grossWeight == 0)){ //如果人均不为0,总重为0.就表示这天只有手动输入数据、没有设备数据.此时总重量就是人均重量
		grossWeight = avgWeight;
	}
	//alert('平均值是:'+userId+','+deviceId+','+deviceName1+','+item+','+avgWeight+','+grossWeight+','+lastWeighingTime);
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
			console.log('插入周月数据到后台成功'+JSON.stringify(result3));
		},
		error: function(error) {
			console.log('插入周月数据到后台失败'+error);
		}
	})
}


//计算总重量
var newArr = [];
var lyArr2 = [];
function computeTotalWeight(data){
	let avgWeight = 0; //累计摄入总重量
	var shi_num = 0;
	var sd_num = 0;
	/* 2020.10.30  开始   重新计算总计摄入量和剩余摄入量  */
	var arr = [];
	for (var i = 0; i < data.length; i++) {
		arr.push(data[i]);
	}
	//console.log('总数据1：=='+ JSON.stringify(arr));
	//console.log('分组前拿到的数据==' + arr.length);
	if(arr && arr.length > 0){
		// 2020.11.9 赋值计算开始
		var lyArr = [];
		sortArr(arr, 'type'); // 第一次分组 ，按照 type 类型
		console.log('第一次分组后newArr长度 ==' + newArr.length);
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
			if(newArr[1]){
				for (var s = 0; s < newArr[1].length; s++) {
					sdArr.push(newArr[1][s].weight);
				}
			}
			lyArr = newArr[0];
		}

		$.each(sdArr, function(index, item) {
			sdWeight += Number(item);
		})
		sd_num = Number(sdWeight).toFixed();
	}

	// if(lyArr && lyArr.length >0){
		sortArr(lyArr, 'number'); //  进行第2次分组，按照人数划分
		var dValueArAll = [];
		var ArrTotalWeight = 0;
		console.log('蓝牙数据分组后 lyArr2 ==' +  JSON.stringify(lyArr2));
		var arrTotalWeight = 0;
		for (var j = 0; j < lyArr2.length; j++) {
			var ArrJ = lyArr2[j];
			var dValueArr = [];
			for (var k = 0; k < (ArrJ.length - 1); k++) {
				var dValue = Number(ArrJ[k].weight) - Number(ArrJ[k + 1].weight);
				if (dValue > 0) {
					dValueArr.push(dValue);
					var dValueSum = 0;
					for (d = 0; d < dValueArr.length; d++) {
						dValueSum += Number(dValueArr[d]);
					}
					arrTotalWeight = Number(dValueSum) * (1 - (Number(ArrJ[k].waste_rate) / 100)) / (Number(ArrJ[k].number)); // 每个数组的元素对象的差值和 *(1-浪费比率)/人数
				}
			}
			if (arrTotalWeight) {
				dValueArAll.push(arrTotalWeight);
			}
		}
		var tSum = 0;
		//console.log('dValueArAll.length==' + dValueArAll.length);
		//console.log('dValueArAll==' + dValueArAll);
		for (var t = 0; t < dValueArAll.length; t++) {
			tSum += Number(dValueArAll[t]);
		}
		shi_num = Number(tSum).toFixed(2);
	//}
	//console.log('tSum摄入量总和 ==' + shi_num); // 计算的是蓝牙数据的平均值
	//console.log('手动平均值和 == ' + sd_num); // 计算的是手动数据的平均值
	avgWeight = Number(shi_num) + Number(sd_num);
	return avgWeight;
}

function sortArr(arr,str){
	// if(str == 'type'){
	// 	console.log('Type进入分组函数的数据长度 == ' + arr.length);
	// }else if(str == 'number'){
	// 	console.log('number进入分组函数的数据长度 == ' + arr.length);
	// }
	var _arr = [],_t = [],_tmp;  // 临时的变量
	// 按照特定的参数将数组排序将具有相同值得排在一起
	arr = arr.sort(function(a, b) {
		var s = a[str],
			t = b[str];
		return s < t ? -1 : 1;
	});
	if (arr.length) {
		_tmp = arr[0][str];
	}
	// 将相同类别的对象添加到统一个数组
	for (var i in arr) {
		if (arr[i][str] === _tmp) {
			_t.push(arr[i]);
		} else {
			_tmp = arr[i][str];
			_arr.push(_t);
			_t = [arr[i]];
		}
	}
	// 将最后的内容推出新数组
	_arr.push(_t);
	if(str == 'type'){
		newArr = _arr; // 第一次 type 分类后的新数组
		console.log('第一次分组时 newArr长度赋值 ==' + newArr.length);
	}
	if(str == 'number'){
		lyArr2 = _arr; // 第二次 number 分类后的新数组
		//console.log('蓝牙数据分组后11111 lyArr2 ==' +  JSON.stringify(lyArr2));
	}
}

/*将蓝牙设备重量列表数据转化成categoryDataFn需要的数据格式*/
function arrangeDeviceWeightListData(deviceData1){
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
						console.log(formatTimeOrNumberStr)
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
			console.log(formatTimeOrNumStr1)
			formatTimeOrNumStr1 = formatTimeOrNumStr1.substr(0,formatTimeOrNumStr1.length-1);  //去除最后的:符号
			let PerCapitaIntake = perCapitaIntakeFn(deviceData1,formatTimeOrNumStr1) //某一餐的人均摄入量
			console.log('人均：'+PerCapitaIntake);
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
			console.log(formatWeitghtArr)
			let totalWeight = arrAction(formatWeitghtArr); //计算重量差值
			if(totalWeight > 0){ //差值必须大于0,才计算人均摄入量,创建数据
				deviceAllWeight += totalWeight;
				console.log(deviceAllWeight)
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

//旧版处理称重数据的方法,暂时不用
function arrangeDeviceWeightListData1(deviceData1){
	var deviceData2 = $.extend(true, [], deviceData1); //复制数组
	arrangeDeviceIndexArr = [];
	thatDayDeviceCumulativeIntake = 0; //当日蓝牙设备人均摄入量总和先置0
	arrangeDeviceArr = []; //刚进入前先清空数据
	var formatTimeHourArr = []; //存放某一个小时内的所有数据
	var formatTimeOrNumArr = []; //存放根据时间、人数分类号的所有数据
	// 下面的for循环会根据小时数判断,如果是同一个时间区间的放到一起,返回一个数组["0@@1@@", "2@@3@@"]
	// 表示第一、二条数据是一个时间段内的，第三、四条数据是一个时间段内的
	for(let j=0;j<deviceData2.length;j++){
		let formatTimeHourStr = ''; //记录某一时间段内的序号,拼接成字符串
		let formatTimeOrNumberStr = ''; //记录某一时间段内、人数相同的序号,拼接成字符串
		let formatNumber = deviceData2[j].number;
		let formatTimeHour = deviceData2[j].format_time;
		if(formatTimeHour){ //时间格式是"2020-10-16 01:19",长度是16
			let formatTimeHour1 = formatTimeHour.substr(11,2);
			let formatTimeOrNumberStr1 = '';
			for(let k=0;k<deviceData2.length;k++){
				let nextFormatNumber = deviceData2[k].number;
				let nextFormatTimeHour = deviceData2[k].format_time;
				if(nextFormatTimeHour){ //时间格式是"2020-10-16 01:19",长度是16
					let nextFormatTimeHour1 = nextFormatTimeHour.substr(11,2);
					if(formatTimeHour1 == nextFormatTimeHour1){ //formatTimeHourMill+3600000表示被比较时间往后延伸一个小时,小于这个数字的表示在被比较时间的一个小时内,算同一餐
						formatTimeHourStr += k+"@@";
						if(formatNumber == nextFormatNumber){
							formatTimeOrNumberStr += k+"@@";
						}
					}

				}
			}

			// let formatTimeHourMill = new Date(formatTimeHour).getTime();
			// let formatTimeOrNumberStr1 = '';
			// for(let k=j;k<deviceData2.length;k++){
			// 	let nextFormatNumber = deviceData2[k].number;
			// 	let nextFormatTimeHour = deviceData2[k].format_time;
			// 	if(nextFormatTimeHour){
			// 		let nextFormatTimeHourMill = new Date(nextFormatTimeHour).getTime();
			// 		/* 判断每一餐的时间要在第一次称重时间往后一个小时内,大于一个小时或者小于当前时间的都不算 */
			// 		if(nextFormatTimeHourMill < (formatTimeHourMill+3600000)){ //formatTimeHourMill+3600000表示被比较时间往后延伸一个小时,小于这个数字的表示在被比较时间的一个小时内,算同一餐
			// 			formatTimeHourStr += k+"@@";
			// 			if(formatNumber == nextFormatNumber){
			// 				formatTimeOrNumberStr += k+"@@";
			// 			}
			// 		}
			// 	}
			// }

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
		console.log(formatIndexArr.length)
		console.log(typeof formatIndexArr)
		let formatFirstIndex = 0; //截取每个序号字符串的第一个数字
		let formatWeitghtArr = []; //存放某一个小时内所有重量的数组
		//let formatDataArr = []; //存放某一个小时内所有具体数据的数组
		let formatIndexFirstFlag = true;
		for(let n=0;n<formatIndexArr.length;n++){ //循环获取重量存到数组里
			formatFirstIndex = formatIndexArr[0];
			//formatIndexFirstFlag控制只执行一次,formatIndexArr[0]不等于0,表示当前不是今日的第一餐,计算总重时,要用上一餐的最后一次称重重量当做本餐的第一次称重(被减数)
			if((parseInt(formatFirstIndex) != 0) && (formatIndexFirstFlag == true)){
				formatWeitghtArr.push(deviceData1[parseInt(formatIndexArr[n])-1].weight);
				formatIndexFirstFlag = false;
			}
			formatWeitghtArr.push(deviceData1[formatIndexArr[n]].weight);
			//formatDataArr.push(deviceData1[formatIndexArr[n]]);
		}

		//如果formatIndexArr[0]不是0,就表示当前数据不是当天的第一次称重,这时就要给当前时间段的数据数组formatDataArr里添加前一个时间段的最后一次称重的数据
		// if(formatIndexArr[0] != 0){
		// 	let formatDataLastSonDataIndex = formatIndexArr[formatIndexArr.length-1]; //上一条数据里最后一条子元素的序号
		// 	formatDataArr.unshift(deviceData1[formatDataLastSonDataIndex]);
		// }
		//计算某一个小时内的总人均摄入量
		// let someHourAverageWeight = computeTotalWeight(deviceData1);

		let totalWeight = arrAction(formatWeitghtArr); //计算重量差值
		if(totalWeight > 0){ //差值必须大于0,才计算人均摄入量,创建数据
			deviceAllWeight += totalWeight;
			arrangeDeviceIndexArr.push(formatTimeHourArr[m]); //将满足条件的数据存到数组里,如['3@@4']
			//console.log(arrangeDeviceIndexArr)
			let PerCapitaIntake = perCapitaIntakeFn(deviceData1,formatTimeOrNumStr1) //某一餐的人均摄入量
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
			//console.log(arrangeDeviceArr);

			thatDayDeviceCumulativeIntake += PerCapitaIntake; //当日蓝牙设备人均摄入量总和
		}
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


/*将手动输入重量列表数据转化成categoryDataFn需要的数据格式*/
function arrangeManualWeightListData(manualData2){
	thatDayManualCumulativeIntake = 0; //当日手动人均摄入量总和先置0
	//这里将手动输入数据里的同一时间内的多条数据累加起来
	//let manualData1 = accumulateManualInputData(manualData2);

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
		arrangeDeviceArr.push(arrangeManualObj);

		manualWeightSum += parseFloat(manualData1[h].weight);
	}
	//console.log(arrangeDeviceArr);
	thatDayManualCumulativeIntake = manualWeightSum;
}

/* 累加同一时间内的手动输入数据 */
function accumulateManualInputData(accumulateData){
	var accumulateData1 = $.extend(true, [], accumulateData); //复制数组,改变accumulateData1不会影响accumulateData
	var accumulateData2 = $.extend(true, [], accumulateData);
	var accumulateData3 = [];
	//双循环判断查找相同时间的数据累加,只有不同时再插入到新的accumulateData3数组里
	for(let i=0;i<accumulateData1.length;i++){
		let account9 = 1;
		let accumulateNum = 0;
		for(let j=0;j<accumulateData2.length;j++){
			if(accumulateData2[j].format_time != -1){
				if(accumulateData1[i].format_time == accumulateData2[j].format_time){
					accumulateData2[j].format_time = -1;
					accumulateNum += parseFloat(accumulateData2[j].weight);
					account9--;
				}
			}
		}
		if(account9 < 1){ //小于1表示在accumulateData2数组里没有和当前值相同的时间了,这时将此数据插入accumulateData3数组
			let accumulateObj = {};
			accumulateObj.weight = accumulateNum;
			accumulateObj.avg_weight = accumulateData1[i].weight;
			accumulateObj.format_time = accumulateData1[i].format_time; //时间
			accumulateObj.group_weight = accumulateData1[i].weight; //总重
			accumulateObj.id = accumulateData1[i].id;
			accumulateObj.type = accumulateData1[i].type;
			accumulateObj.number = accumulateData1[i].number;
			accumulateObj.waste_rate = accumulateData1[i].waste_rate;
			accumulateData3.push(accumulateObj);
		}
	}
	//返回处理后的数据
	return accumulateData3;
}

/* swiper初始化 */
var swiper_flat = true;
var swiper_flat1 = false;
function swiperInitFn(index){
	swiper_first_flat = false;
	// var typeCorrespondDetail = $('#typeCorrespondDetail');
	let typeindexClass = '.type_item'+index;
	let dateChartIndex = 'date_chart_box'+index; //图表序号
	let dateChartPaginationIndex = 'swiper-pagination'+index; //图表分页器序号
	typeCorrespondDetail.find(typeindexClass).find('.date_chart_box').removeClass('date_chart_box1').addClass(dateChartIndex);
	typeCorrespondDetail.find(typeindexClass).find('.swiper-pagination').removeClass('swiper-pagination1').addClass(dateChartPaginationIndex);
	setTimeout(function () {
	    var mySwiper1 = new Swiper ('.'+dateChartIndex, {
	        direction: 'horizontal', // 垂直切换选项
	        loop: true, // 循环模式选项
			observer: true, //修改swiper自己或子元素时，自动初始化swiper
			observeParents: true, //修改swiper的父元素时，自动初始化swiper,添加了observer,observeParents后页面有多个swiper滑动模块都能正常滑动
	        pagination: {//分页器
	          el: '.'+dateChartPaginationIndex,
	    	  clickable :true,
	    	  renderBullet: function (i, className) {
	    		switch(i){
	    			case 0:text='日';break;
	    			case 1:text='周';break;
	    			case 2:text='月';break;
	    			case 3:text='年';break;
	    		}
	    		return '<span class="' + className + '">' + text + '</span>';
	    	  },
	    	  clickableClass : 'chart_top_list',
	    	  bulletClass : 'chart_top_item',
	    	  bulletActiveClass: 'chart_top_sctive'

	        },
			on: {
				slideChangeTransitionEnd: function(swiper){//切换结束时触发的方法
					let activeIndex = this.activeIndex;   //切换结束时是第几个slide
					/* 左右滑动或者点击日周月年切换完成后的方法 */
					if(activeIndex>3){
						activeIndex = activeIndex % 3; //求余,第一个有可能activeIndex值是4(原本有年时可能是5,现在年去掉了这里就是4).
					}
					if(activeIndex==1){ //切换的是日,日直接走categoryDataFn方法
						$('#footItem1').removeClass('no_manual_input');  //切换的是日,手动输入恢复添加功能
						let dateChartTxt = typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_day .date_chart_txt:eq(0)').text();
						let nowDate = year+'年'+month+'月'+day+'日';

						//切换日期和周月年不同,日直接走categoryDataFn方法
						let daysSwiperStartTime = switchDateDay + ' 00:00:00';
						let daysSwiperEndTime = switchDateDay + ' 23:59:00';
						getWeightingDataCalculateList(daysSwiperStartTime,daysSwiperEndTime,false);

						// if(dateChartTxt == nowDate){ //swiper切换到的日期和当前日期相同
						// 	if(swiper_flat == true && swiper_flat1 == true){ //页面第一次加载或者切换大类别时才执行一次
						// 		detailType.find('.detail_active').trigger('click');
						// 		swiper_flat = false;
						// 	}

						// }else{
						// 	swiper_flat = true;
						// 	swiperFinishFn(activeIndex);
						// }
					}else{//切换的是周月年,走swiperFinishFn方法
						$('#footItem1').addClass('no_manual_input');  //切换的不是日,不能添加手动输入
						swiper_flat = true;
						swiperFinishFn(activeIndex);
					}
					swiper_flat1 = true;
				}
			}
	    })
	}, 200);
	typeCorrespondDetail.find(typeindexClass).find('.number_chart_item .day_chart').remove();
	typeCorrespondDetail.find(typeindexClass).find('.number_chart_item').append('<div class="day_chart" id="dayChart'+index+'"></div>');

}

/* 左右滑动或者点击日周月年切换完成后的方法 */
function swiperFinishFn(activeIndex){
	/* 显示新的chart表,隐藏旧的chart表和人居摄入量列表 */
	typeCorrespondDetail.find('.type_item'+itemIndex).find('.number_chart,.meal_data').hide();
	let swiprTimeStart = '';
	let swiprTimeEnd = '';
	if(activeIndex === 1){
		console.log('日')
		swiprTimeStart = switchDateDay + ' 00:00:00';
		swiprTimeEnd = switchDateDay + ' 23:59:59';
		flag_type = 1;
	}else if(activeIndex === 2){
		console.log('周')

		let timeWeek1 = timeWeek.replace(/\//g,''); //去除反斜杠
		console.log('记录的旧的时间是：'+timeWeek1)
		let nowWeekFirstDay = dealTime(1, timeWeek1);
		let nowWeekLastDay = dealTime(0, timeWeek1);
		swiprTimeStart = nowWeekFirstDay + ' 00:00:00';
		swiprTimeEnd = nowWeekLastDay + ' 23:59:59';
		flag_type = 2;
	}else if(activeIndex === 3){
		console.log('月')
		swiprTimeStart = switchEndOfYear + '-' + oldMonth + '-01 00:00:00';
		swiprTimeEnd = switchEndOfYear + '-' + oldMonth + '-' + new Date(year,month,0).getDate() + ' 23:59:59';
		flag_type = 3;
	}else if(activeIndex === 4){
		console.log('年')
		swiprTimeStart = switchEndOfYear + '-01-01 00:00:00';
		swiprTimeEnd = switchEndOfYear + '-12-' + new Date(year,12,0).getDate() + ' 23:59:59';
		flag_type = 4;
	}
	let swiperItem = $.trim(detailType.find('.detail_active').text());
	let switchItem2 = switchItem(swiperItem); //类别名转为对应的数字
	if(switchItem2 > -1){
		item = switchItem2;
	}
	typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_num strong').text('0'); //总重量先置为0
	let swiperDayTime = typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_day .date_chart_txt:eq(0)').text();

	/* 测试 */
	// let result8 = '[{"flag_type":0,"format_time":"2020-11-05 10:15","id":3925,"number":6,"type":"2","waste_rate":"30","weight":"51"},{"flag_type":0,"format_time":"2020-11-05 10:15","id":3926,"number":6,"type":"2","waste_rate":"30","weight":"2565"},{"flag_type":0,"format_time":"2020-11-05 10:22","id":3927,"number":6,"type":"2","waste_rate":"30","weight":"256"},{"flag_type":0,"format_time":"2020-11-05 10:22","id":3928,"number":6,"type":"2","waste_rate":"30","weight":"363"},{"flag_type":0,"format_time":"2020-11-05 10:23","id":3929,"number":6,"type":"2","waste_rate":"30","weight":"140"},{"flag_type":0,"format_time":"2020-11-05 10:23","id":3930,"number":6,"type":"2","waste_rate":"30","weight":"316"},{"flag_type":0,"format_time":"2020-11-05 10:23","id":3931,"number":6,"type":"2","waste_rate":"30","weight":"318"},{"flag_type":0,"format_time":"2020-11-05 10:24","id":3932,"number":6,"type":"2","waste_rate":"30","weight":"136"},{"flag_type":0,"format_time":"2020-11-05 15:48","id":3934,"number":6,"type":"2","waste_rate":"30","weight":"360"},{"flag_type":0,"format_time":"2020-11-05 16:10","id":3935,"number":6,"type":"2","waste_rate":"30","weight":"362"},{"flag_type":0,"format_time":"2020-11-05 16:10","id":3936,"number":6,"type":"2","waste_rate":"30","weight":"231"},{"flag_type":0,"format_time":"2020-11-05 16:11","id":3937,"number":6,"type":"2","waste_rate":"30","weight":"230"},{"flag_type":0,"format_time":"2020-11-05 16:13","id":3938,"number":6,"type":"2","waste_rate":"30","weight":"221"},{"flag_type":0,"format_time":"2020-11-05 16:13","id":3939,"number":6,"type":"2","waste_rate":"30","weight":"365"},{"flag_type":0,"format_time":"2020-11-05 16:14","id":3940,"number":6,"type":"2","waste_rate":"30","weight":"78"},{"flag_type":0,"format_time":"2020-11-05 16:15","id":3941,"number":6,"type":"2","waste_rate":"30","weight":"230"},{"flag_type":0,"format_time":"2020-11-05 16:16","id":3942,"number":6,"type":"2","waste_rate":"30","weight":"712"},{"flag_type":0,"format_time":"2020-11-05 16:16","id":3943,"number":6,"type":"2","waste_rate":"30","weight":"592"},{"flag_type":0,"format_time":"2020-11-05 16:17","id":3944,"number":6,"type":"2","waste_rate":"30","weight":"591"},{"flag_type":0,"format_time":"2020-11-05 16:17","id":3945,"number":6,"type":"2","waste_rate":"30","weight":"230"},{"flag_type":0,"format_time":"2020-11-05 16:17","id":3946,"number":6,"type":"2","waste_rate":"30","weight":"363"},{"flag_type":0,"format_time":"2020-11-05 16:17","id":3947,"number":6,"type":"2","waste_rate":"30","weight":"192"},{"flag_type":0,"format_time":"2020-11-05 16:17","id":3948,"number":6,"type":"2","waste_rate":"30","weight":"232"},{"flag_type":0,"format_time":"2020-11-05 16:18","id":3949,"number":6,"type":"2","waste_rate":"30","weight":"301"},{"flag_type":0,"format_time":"2020-11-05 16:18","id":3950,"number":6,"type":"2","waste_rate":"30","weight":"519"},{"flag_type":0,"format_time":"2020-11-05 16:18","id":3951,"number":6,"type":"2","waste_rate":"30","weight":"533"},{"flag_type":0,"format_time":"2020-11-05 16:18","id":3952,"number":6,"type":"2","waste_rate":"30","weight":"274"},{"flag_type":0,"format_time":"2020-11-05 16:19","id":3953,"number":6,"type":"2","waste_rate":"30","weight":"220"},{"flag_type":0,"format_time":"2020-11-05 16:19","id":3954,"number":6,"type":"2","waste_rate":"30","weight":"231"},{"flag_type":0,"format_time":"2020-11-05 16:19","id":3955,"number":6,"type":"2","waste_rate":"30","weight":"46"},{"flag_type":0,"format_time":"2020-11-05 16:19","id":3956,"number":6,"type":"2","waste_rate":"30","weight":"46"},{"flag_type":0,"format_time":"2020-11-05 17:33","id":3957,"number":6,"type":"1","waste_rate":"30","weight":"6"},{"flag_type":0,"format_time":"2020-11-05 17:35","id":3958,"number":6,"type":"1","waste_rate":"30","weight":"5"},{"flag_type":0,"format_time":"2020-11-05 17:35","id":3959,"number":6,"type":"1","waste_rate":"30","weight":"5"},{"flag_type":0,"format_time":"2020-11-05 17:40","id":3960,"number":6,"type":"1","waste_rate":"30","weight":"6"},{"flag_type":0,"format_time":"2020-11-05 17:40","id":3961,"number":6,"type":"1","waste_rate":"30","weight":"6"},{"flag_type":0,"format_time":"2020-11-05 17:40","id":3962,"number":6,"type":"1","waste_rate":"30","weight":"6"},{"flag_type":0,"format_time":"2020-11-05 17:40","id":3963,"number":6,"type":"1","waste_rate":"30","weight":"6"},{"flag_type":0,"format_time":"2020-11-05 17:40","id":3964,"number":6,"type":"1","waste_rate":"30","weight":"18"},{"flag_type":0,"format_time":"2020-11-05 17:40","id":3965,"number":6,"type":"1","waste_rate":"30","weight":"8"},{"flag_type":0,"format_time":"2020-11-05 17:40","id":3966,"number":6,"type":"1","waste_rate":"30","weight":"8"},{"flag_type":0,"format_time":"2020-11-05 17:44","id":3967,"number":6,"type":"1","waste_rate":"30","weight":"8"}]';
	// result8 = JSON.parse(result8);
	// swiperDataFn(result8,flag_type);

	$.ajax({
			url:'https://192.168.1.55:448/user/getWeightingDataCalculateList',
			type:'post',
			data:{
				'user_id':userId,
				'item':item,
				'mac':deviceId,
				'start_time':swiprTimeStart,
				'end_time':swiprTimeEnd
			},
			dataType:'json',
			success:function(result8){
				/* 获取到后台大类别某一个时间段内所有数据后操作方法 */
				console.log('详情返回的所有重量数据是：'+JSON.stringify(result8));
				if(result8 && result8.length >0){
					//获取'周月年'的数据后用新的方法展示
					typeCorrespondDetail.find('.type_item'+itemIndex).find(".swiper_new_chart").show().siblings('.swiper_error_html').remove(); //先清除提示
					swiperDataFn(result8,flag_type);
				}else{
					typeCorrespondDetail.find('.swiper_error_html').remove(); //先清除提示
					let errorHTML = '<div class="swiper_error_html" style="text-align: center; line-height: 150px; color: #999;">暂且没有相关数据</div>'
					typeCorrespondDetail.find('.type_item'+itemIndex).find(".swiper_new_chart").hide().after(errorHTML);

				}
			},
			error:function(error){
				typeCorrespondDetail.find('.type_item'+itemIndex).find('.swiper_error_html').remove();
				let errorHTML = '<div class="swiper_error_html" style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>'
				typeCorrespondDetail.find('.type_item'+itemIndex).find(".swiper_new_chart").hide().after(errorHTML);
			}
		});


	//console.log('swiper传到后台的参数是：'+userId+','+item+','+flag_type+','+swiprTimeStart);
	// alert('swiper切换传给后台参数：'+deviceId+','+flag_type+','+swiprTimeStart+','+swiprTimeEnd)
	// $.ajax({
	// 	url:'https://192.168.1.55:448/user/getWeightingDataListByYMWD',
	// 	type:'post',
	// 	data:{
	// 		'user_id':userId, //用户ID
	// 		'item':item, //食物大类别
	// 		'mac':deviceId,
	// 		'flag_type': flag_type, //flag_type:1天2周3月4年
	// 		'start_time':swiprTimeStart, //查询开始时间
	// 		'end_time':swiprTimeEnd   //查询结束时间
	// 	},
	// 	dataType:'json',
	// 	success:function(result5){
	// 		console.log(JSON.stringify(result5))
	// 		alert(JSON.stringify(result5))
	// 		if(result5.length>0){
	// 			//获取'周月年'的数据后用新的方法展示
	// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('.error_html').remove(); //先清除提示
	// 			swiperDataFn(result5,flag_type);
	// 		}else{
	// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('.error_html').remove();
	// 			var errorHTML = '<div class="error_html" style="text-align: center; line-height: 150px; color: #999;">暂且没有相关数据</div>'
	// 			typeCorrespondDetail.find('.type_item'+itemIndex).find(".swiper_new_chart").hide().after(errorHTML);
	// 		}
	// 	},
	// 	error:function(error){
	// 		typeCorrespondDetail.find('.type_item'+itemIndex).find('.error_html').remove();
	// 		var errorHTML = '<div class="error_html" style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>'
	// 		typeCorrespondDetail.find('.type_item'+itemIndex).find(".swiper_new_chart").hide().after(errorHTML);
	// 	}
	// });

}

/* 点击人均摄入量列表里的编辑获取到本地存储或者后台数据后的操作 */
function eidtMealDataFn(result2,typeE){
	//alert(result2[0].waste_rate+','+result2[0].number);
	currentEditData = result2; //后台获取数据赋值给当前编辑数据变量
	if(result2&& result2.length>0){
		let editItem = $('#editItem');
		editItem.find('#editType .edit_item').eq(parseInt(result2[0].number)-1).addClass('edit_active').siblings().removeClass('edit_active');
		let editNum = result2[result2.length-1].number;
		if(!editNum){
			editNum = 1;
		}
		$('.edit_is_input').val(editNum);
		let wasteRate = result2[0].waste_rate;
		if(!wasteRate){ //摄入损耗如果是0,后台返回的数据是null,这时设为默认值
			wasteRate = 0;
		}
		$('#inline-range').val(wasteRate);
		$('.mui-tooltip').text(wasteRate);
		$('#inline-range-val').text(wasteRate).css('left', (wasteRate) + '%');
		$('.bg_span').css('width', wasteRate + '%');
		let mealEditHtml = '';
		editItem.find('.dev_input_item3').html('');
		for(let i=0;i<result2.length;i++){
			//let index = LowercaseToUppercase(i+1);
			let addDevInput = result2[i].format_time;
			addDevInput = addDevInput.substr(addDevInput.length-5,addDevInput.length);
			mealEditHtml += '<div class="weighing_list"><span class="input_txt">'+addDevInput+'</span>';
			let mealEditWeight = 0;
			if(typeE == 1){ //手动数据
				mealEditWeight = result2[i].avg_weight;
			}else{ //typeE==2是设备数据
				mealEditWeight = result2[i].weight;
			}
			mealEditHtml += '<div class="increase_decrease clearfix"><div class="recommend_box"><em class="recommend_input" ed-id="'+result2[i].id+'">'+mealEditWeight+'</em>';
			mealEditHtml += '<b class="recommend_unit shi_unit">'+weightUnit1+'</b></div>';
			mealEditHtml += '<i class="recommend_close iconfont" onclick="recommendClose(this)">&#xe7c3;</i></div></div>';
		}
		editItem.find('.dev_input_item3').append(mealEditHtml);
	}
}



/* 获取'周月年'的数据后操作方法 */
function swiperDataFn(data4,flag_type){
	let allWeight1 = computeTotalWeight(data4);  //计算总重
	let allWeight = [];
	allWeight.push((allWeight1*100/100).toFixed(2)); //重量保留两位小数
	let timeNameArr = [];
	if(flag_type == 1){
		//alert(allWeight)
		typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_day .date_chart_num strong').text(allWeight);
	}else if(flag_type == 2){
		let nowWeekNum = nowWeek1.split('/')[2];
		timeNameArr.push('第'+nowWeekNum+'周');
		typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_week .date_chart_num strong').text(allWeight);
	}else if(flag_type == 3){
		timeNameArr.push(switchEndOfYear+'年'+oldMonth+'月');
		typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_month .date_chart_num strong').text(allWeight);
	}else if(flag_type == 4){
		timeNameArr.push(switchEndOfYear+'年');
		typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_year .date_chart_num strong').text(allWeight);
	}
	typeCorrespondDetail.find('.type_item'+itemIndex).find('.error_html').remove(); //先清除提示
	//刷新图表
	barEChart(allWeight,timeNameArr,itemIndex);
}

// var count5 = 0;
// function swiperDataFn1(result5,flag_type){
// 	//console.log("数据1请求是："+JSON.stringify(result5))
// 	//alert('切换日后数据：'+ result5+','+flag_type)
// 	let weightArr = [];
// 	let timeNameArr = [];
// 	let reTotalWeight = 0;
// 	if (result5 && result5.length > 0) {
// 		for(let i=0; i< result5.length;i++){
// 			let reWeight = result5[i].weight;
// 			if(reWeight){
// 				weightArr.push(parseFloat(reWeight));
// 				reTotalWeight += parseFloat(reWeight);
// 				if(flag_type == 1){
// 					timeNameArr.push(result5[i].format_time);
// 				}else if(flag_type == 2){

// 					timeNameArr.push('第'+(i+1)+'周');
// 				}else if(flag_type == 3){
// 					timeNameArr.push(switchEndOfYear+'年'+result5[i].format_time+'月');
// 				}else if(flag_type == 4){
// 					timeNameArr.push(result5[i].format_time+'年');
// 				}
// 				count5++;
// 			}

// 		}
// 		if(flag_type == 1){
// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_day .date_chart_num strong').text(reTotalWeight);
// 		}else if(flag_type == 2){
// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_week .date_chart_num strong').text(reTotalWeight);
// 		}else if(flag_type == 3){
// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_month .date_chart_num strong').text(reTotalWeight);
// 		}else if(flag_type == 4){
// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_chart_year .date_chart_num strong').text(reTotalWeight);
// 		}
// 		if(count5>0){
// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('.error_html').remove(); //先清除提示
// 			//刷新图表
// 			barEChart(weightArr,timeNameArr,itemIndex);
// 		}else{ //没有数据显示提示
// 			typeCorrespondDetail.find('.type_item'+itemIndex).find('network_error').remove();  //先清除提示
// 			var errorHTML = '<div class="network_error" style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>'
// 			typeCorrespondDetail.find('.type_item'+itemIndex).find(".swiper_new_chart").hide().after(errorHTML);
// 		}
// 	}else{
// 		typeCorrespondDetail.find('.type_item'+itemIndex).find('network_error').remove();  //先清除提示
// 		var errorHTML = '<div class="network_error" style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>'
// 		typeCorrespondDetail.find('.type_item'+itemIndex).find(".swiper_new_chart").hide().after(errorHTML);
// 	}
// }

/* 初始化时间 */
function initDate(){
	/* var now = new Date();
	var year = now.getFullYear();
	var month = ((now.getMonth()+1)<10?"0":"")+(now.getMonth()+1)
	var day = (now.getDate()<10?"0":"")+now.getDate(); */
	var getDate = getMonthWeek(year, month, day);
	var dayTime = year + "年" +month+"月"+day+"日";
	var weekTime = year + "年" +month+"月"+getDate.getWeek+"周";
	nowWeek1 = getDate.getYear + "/" +getDate.getMonth+"/"+getDate.getWeek;
	typeCorrespondDetail.find('.type_item'+itemIndex).find('.date_change_btn em').text(dayTime);
	$('.date_chart_day').find('.date_chart_txt').text(dayTime); //日周月年时间初始化
	$('.date_chart_week').find('.date_chart_txt').text(weekTime);
	$('.date_chart_month').find('.date_chart_txt').text(year + "年" +month+"月");
	$('.date_chart_year').find('.date_chart_txt').text(year + "年");
	$('#manualDay em').text(year + "/" +month+"/"+day); //手动输入事件初始化
	$('#manualTime em').text(hour + ":" +minutes);
	switchEndOfMonthDay = new Date(year,month,0).getDate(); //使用new Date()创建时间对象时,如果date传入0,就能直接通过getDate()获取到最后一天的日期
	switchDateDay = year + "-" +month+"-"+day; //另一种格式的日期,全局变量
	switchEndOfYear = year; //初始化时给切换月份后变化的年份赋值
	switchEndOfMonth = month; //初始化时给点击左右箭头后的月份赋值,全局变量
}

// 日期，在原有日期基础上，增加days天数，默认增加1天
function addDate(date,days){
	if (days == undefined || days == ''){
		days = 1;
	}
	let d=new Date(date);
	d.setDate(d.getDate()+days);
	let month=d.getMonth()+1;
	let day = d.getDate();
	if(month<10){
		month = "0"+month;
	}
	if(day<10){
		day = "0"+day;
	}
	switchEndOfYear = d.getFullYear(); //切换月份后的变化的年份
	switchEndOfMonth = month; //点击左右箭头后另一种格式的月份,全局变量
	//switchDateDay = d.getFullYear()+"-"+month+"-"+day; //另一种格式的日期,全局变量
	//alert('原有日期增加方法里切换后日：'+switchDateDay)
	let val = d.getFullYear()+"/"+month+"/"+day;
	return val;
}
//月份，在原有的日期基础上，增加 months 月份，默认增加1月
function addMonth(date,months){
    if(months==undefined||months=='')
        months=1;
    let d=new Date(date);
    d.setMonth(d.getMonth()+months);
    let month=d.getMonth()+1;
	oldMonth = month; //全局变量保存当前切换到哪个月份了
	if(month<10){
		month = "0"+month;
	}
	switchEndOfYear = d.getFullYear(); //切换月份后的变化的年份
	switchEndOfMonth = month; //点击左右箭头后另一种格式的月份,全局变量
	switchEndOfMonthDay = new Date(d.getFullYear(),month,0).getDate(); //使用new Date()创建时间对象时,如果date传入0,就能直接通过getDate()获取到当月对应的最后一天的日期
    return d.getFullYear()+'/'+month;
}

//年份，在原有的日期基础上，增加 years年份，默认增加1年
function addYear(date,years){
    if(years==undefined||years=='')
        years=1;
    let d=new Date(date);
    d.setFullYear(d.getFullYear()+years);
	switchEndOfYear = d.getFullYear(); //切换月份后的变化的年份
    return d.getFullYear();
}

function initChart(xAxis,manArr,devArr){
	// 柱状体
	var myChart = echarts.init(document.getElementById('dayChart'));

	// 指定图表的配置项和数据
	var option = {
		tooltip: {},
		legend: {},
		grid: { //配置canves图标父元素div的距离
			top:"25px",
		    left:"10px",
		    right:"10px",
		    bottom:"20px",
			width:'auto',
			containLabel: true
		},
		xAxis: { //配置x轴数据和坐标轴轴线
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			},
			type: 'category',
			data: xAxis
		},
		yAxis: { //配置y轴数据和坐标轴轴线
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			},
			splitLine: {
				show: true,
				lineStyle: {
					type: 'dashed'
			    }
			}
		},
		series: [
			{
				type: 'bar',
				size: '100%',  //图大小
				barWidth : 8, //设置柱的宽度
				barGap: "100%",/*多个并排柱子设置柱子之间的间距*/
				/* barCategoryGap: "100%", */   /*同一系列的柱间距离，默认为类目间距的20%，可设固定值*/
				itemStyle:{
					normal:{
						barBorderRadius: 4, //设置柱的圆角
						color:'#AD39FF',
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
				data: manArr
			},
			{
				type: 'bar',
				barWidth : 8, //设置柱的宽度
				barGap: "100%",/*多个并排柱子设置柱子之间的间距*/
				itemStyle:{
					normal:{
						barBorderRadius: 4, //设置柱的圆角
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
				data: devArr
			}

		]
	};

	// 使用刚指定的配置项和数据显示图表。
	myChart.setOption(option,true,true);
	$(window).resize(function(){  //改变浏览器窗口大小时，图标自动从新加载
		myChart.resize();
	})
}

function initChart3(index){
	$('.type_item'+index).show().siblings().hide();
	if(!index  || index==0){ //如果index不存在或者传值为0,就默认为空,去第一个类别的ID
		index = '';
	}
	//$("#dayChart"+index).show();
	//let dayChartIndex = 'dayChart'+index;
	// 柱状体
	//var myChart1 = echarts.init(document.getElementById(dayChartIndex));
	let dayChartIndex = typeCorrespondDetail.find('.type_item'+index+' .day_chart')[0];
	var myChart1 = echarts.init(dayChartIndex);

	// 指定图表的配置项和数据
	var option1 = {
		tooltip: {},
		legend: {},
		grid: { //配置canves图标父元素div的距离
			top:"25px",
		    left:"10px",
		    right:"10px",
		    bottom:"20px",
			width:'auto',
			containLabel: true
		},
		xAxis: { //配置x轴数据和坐标轴轴线
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			},
			type: 'category',
			data: xAxis
		},
		yAxis: { //配置y轴数据和坐标轴轴线
			axisLine:{
				show: false
			},
			axisTick:{
				show: false
			},
			splitLine: {
				show: true,
				lineStyle: {
					type: 'dashed'
			    }
			}
		},
		series: [
			{
				type: 'bar',
				size: '100%',  //图大小
				barWidth : 8, //设置柱的宽度
				barGap: "100%",/*多个并排柱子设置柱子之间的间距*/
				/* barCategoryGap: "100%", */   /*同一系列的柱间距离，默认为类目间距的20%，可设固定值*/
				itemStyle:{
					normal:{
						barBorderRadius: 4, //设置柱的圆角
						color:'#AD39FF',
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
				data: manArr
			},
			{
				type: 'bar',
				barWidth : 8, //设置柱的宽度
				barGap: "100%",/*多个并排柱子设置柱子之间的间距*/
				itemStyle:{
					normal:{
						barBorderRadius: 4, //设置柱的圆角
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
				data: devArr
			}

		]
	};

	// 使用刚指定的配置项和数据显示图表。
	myChart1.setOption(option1,true,true);
	$(window).resize(function(){  //改变浏览器窗口大小时，图标自动从新加载
		myChart1.resize();
	})

	myChart1.getZr().on('click', function(params){
	  let pointInPixel = [params.offsetX, params.offsetY]
	  if (myChart1.containPixel('grid', pointInPixel)) {
		let xIndex = myChart1.convertFromPixel({ seriesIndex: 0 }, [params.offsetX, params.offsetY])[0];
		console.log('序号数组是：'+chartIdArr)
		let chartId = chartIdArr[xIndex];
		console.log('序号是：'+chartId)
		typeCorrespondDetail.find('.meal_data .meal_item').each(function(){
			let mealItemId = $(this).attr('id');
			if(mealItemId == chartId){
				$(this).find('.meal_edit').trigger('click');
			}
		})
		//typeCorrespondDetail.find('.type_item'+index).find('.meal_data .meal_item').eq(xIndex+1).find('.meal_edit').trigger('click');
		//stopBubble(event);
		stopDefault(event);
	  }
	})

	/* myChart1.on('click',function(params){
		let barId = option1.series[params.seriesIndex].barIds[params.dataIndex];
		console.log(barId)
		typeCorrespondDetail.find('.meal_data .meal_item').each(function(){
			let mealItemId = $(this).attr('id');
			if(mealItemId == barId){
				$(this).find('.meal_edit').trigger('click');
			}
		})
	}) */
}

function barEChart(weightArr,timeNameArr,index) {
	//alert('图表序号：'+index)
	if(!index  || index==0){ //如果index不存在或者传值为0,就默认为空,去第一个类别的ID
		index = 1;
	}
	var barClass = 'swiperNewChart'+index;
	// 柱状体
	myChart2 = echarts.init(document.getElementById(barClass));

	// 指定图表的配置项和数据
	var option2 = {
		grid: { //配置canves图标父元素div的距离(就是canves与周边距离)
			top: "25px",
			left: "10px",
			right: "10px",
			bottom: "20px",
			width: 'auto',
			containLabel: true
		},
		xAxis: {
			axisLine: { // 设置X轴线条不要
				show: false
			},
			axisTick: { // 设置X轴线条不要
				show: false
			},

			data: timeNameArr, //X轴展示时间
		},
		yAxis: {
			axisLine: { // 设置Y轴线条不要
				show: false
			},
			axisTick: { // 设置Y轴线条不要
				show: false
			},
			splitLine: { //  设置X轴线条为虚线
				show: true,
				lineStyle: {
					type: 'dashed'
				}
			},
			offset: 5, // 设置Y轴上数据与线条X轴的位置距离
		},
		series: [{
				name: '',
				size: '100%',  //图大小
				type: 'bar',
				barWidth: '8',
				data: weightArr, //展示重量
				itemStyle: {
					normal: {
						barBorderRadius: [8],
						color: '#3aa0ff',
						label: { //柱顶部显示数值
							show: true,
							position: 'top',
							distance: 3,
							textStyle: { //数值样式
								fontSize: 14,
								color: '#868B91',
							},
							formatter: function(params) { //数据为0时不显示数字0
								if (params.value > 0) {
									return params.value;
								} else {
									return '';
								}
							}
						}
					}

				}
			}

		]
	};

	// 使用刚指定的配置项和数据显示图表。
	myChart2.setOption(option2);
}



function manualIntake(id,num,unit){
	var picker = new mui.PopPicker({
		layer: 1,
		buttons: ['取消','确定']
	});

	/* 创建如[{value: "1",text: "0克"}]格式的对象数组 */
	let manualArr = [];
	for(let o=0;o<num;o++){
		let arrObj = {}; //创建数组对象
		arrObj.value = o+1;
		arrObj.text = o+' '+unit;
		manualArr.push(arrObj);
	}

	picker.setData(manualArr);
	document.getElementById(id).addEventListener('tap', function(event) {
		/* $("#"+id).text(""); */
		picker.pickers[0].setSelectedIndex(6, 2000);
		picker.show(function(selectItems) {
			let text = selectItems[0].text;
			let textNum = text.split(' ')[0];
			$("#"+id).find('.shi_num').text(textNum);
			if(textNum == 0){
				$('#manualConfirm').css('background','#ccc');
			}else{
				$('#manualConfirm').css('background','#16B347');
			}


		});
	});
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

/* 正排序函数 */
function sortNumber(a,b){
	return a - b
}

/* 小写转大写 */
function LowercaseToUppercase(num){
	if(num == '0'){
		return '零';
	}else if(num == '10'){
		return '十';
	}else if(num == '100'){
		return '一百';
	}else{
		var num = num.toString();
		var uppercaseArr = ['一','二','三','四','五','六','七','八','九'];
		var uppercaseNum = '十';
		var uppercaseNum1 = '百';
		if(num.length == 1){
			uppercase = uppercaseArr[num-1];
		}else if(num.length == 2){ //两位数
			let numFirst = num.substr(0,1); //十位
			let numSecond = num.substr(1,1); //个位
			let onesPlace = ''; //个位数字
			if(numSecond != '0'){  //个位不为0
				let onesPlace = uppercaseArr[numSecond-1];
				uppercase = uppercaseArr[numFirst-1] + uppercaseNum+onesPlace;
			}else{
				uppercase = uppercaseArr[numFirst-1] + uppercaseNum;
			}
		}else if(num.length == 3){ //三位数
			let numFirst1 = num.substr(0,1); //百位
			let numSecond1 = num.substr(1,1); //十位
			let numThree1 = num.substr(2,1); //个位
			let onesPlace1 = ''; //个位数字
			let tenPlace1 = ''; //十位数字
			if(numSecond1 == '0'){ //十位等于0
				tenPlace1 = '零';
			}else{
				tenPlace1 = uppercaseArr[numSecond1-1];
			}
			if(numThree1 != '0'){
				onesPlace1 = uppercaseArr[numThree1-1];
			}

			if(numSecond1 == '0'){
				uppercase = uppercaseArr[numFirst1-1] + uppercaseNum1+tenPlace1+onesPlace1;
			}else{
				uppercase = uppercaseArr[numFirst1-1] + uppercaseNum1+tenPlace1+uppercaseNum+onesPlace1;
			}
		}
		return uppercase;
	}
}


//cookie
// param name : 表示cookie的名称，必填
// param subName : 表示子cookie的名称，必填
// param value : 表示子cookie的值，必填
// param expires : 表示cookie的过期时间，可以不填
// param domain : 表示cookie的域名，可以不填
// param path : 表示cookie的路径，可以不填
// param secure : 表示cookie的安全标志，可以不填

var cookieObject= {
    setCookie: function(name, value, expiry, path, domain, secure) {
        var nameString = "ck_" + name + "=" + value;
        var expiryString = "";
        if(expiry != null) {
            try {
                expiryString = "; expires=" + expiry.toUTCString();
            }
            catch(e) {
                if(expiry) {
                    var lsd = new Date();
                    lsd.setTime(lsd.getTime() + expiry * 1000);
                    expiryString = "; expires=" + lsd.toUTCString();
                }
            }
        } else {
            var ltm = new Date();
            expiryString = "; expires=" + ltm.toUTCString();
        }
        var pathString = (path == null) ? " ;path=/" : " ;path = " + path;
        var domainString = (domain == null) ? "" : " ;domain = " + domain;
        var secureString = (secure) ? ";secure=" : "";
        document.cookie = nameString + expiryString + pathString + domainString + secureString;
    },
    getCookie: function(name) {
        var i, aname, value, ARRcookies = document.cookie.split(";");
        for(i = 0; i < ARRcookies.length; i++) {
            aname = ARRcookies[i].substr(0, ARRcookies[i].indexOf("="));
            value = ARRcookies[i].substr(ARRcookies[i].indexOf("=") + 1);
            aname = aname.replace(/^\s+|\s+$/g, "");
            if(aname == "ck_" + name) {
                return(value);
            }
        }
        return '';
    },
    removeCookie:function(name){
        this.setCookie(name,'',-1);
    }
};
var storageObject= {
    localGetItem: function(key) { //假如浏览器支持本地存储则从localStorage,localStorage，否则乖乖用Cookie
        return window.localStorage ? localStorage.getItem(key) : cookieObject.getCookie(key);
    },
    localSetItem: function(key, val) {
        return window.localStorage ? localStorage.setItem(key, val) : cookieObject.setCookie(key, val);
    },
    localRemoveItem:function(key){
        return window.localStorage ? localStorage.removeItem(key) : cookieObject.removeCookie(key);
    },
    sessionGetItem:function(key){
        return window.localStorage ? localStorage.getItem(key) : cookieObject.getCookie(key);
    },
    sessionSetItem:function(key, val){
        return window.localStorage ? localStorage.setItem(key, val) : cookieObject.setCookie(key, val);
    },
    sessionRemoveItem:function(key){
        return window.localStorage ? localStorage.removeItem(key) : cookieObject.removeCookie(key);
    }
};

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

	// let arrActionFlag = false;
	// let sun = 0,j=0;
	// for ( let i =  0 ; i < r.length-1 ; i++){
	//     if ( r[i] > r[i+1] ){
	//         sun = sun+(r[i]-r[i+1]);
	// 		arrActionFlag = false;
	//     }else{
	// 		j = i;
	// 		arrActionFlag = true;
	// 		break;
	// 	}
	// }
	// if(arrActionFlag == true){
	// 	r.splice(j,1);
	// 	let r1 = r;
	// 	arrAction (r1);
	// 	return false;
	// }

	// arrActionNum = sun;
	// return false;
}

// 获取url中参数
function getUrlParam(name) {
    var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)");
    var r = window.location.search.substr(1).match(reg); //匹配目标参数
    if (r != null) return unescape(r[2]); return null; //返回参数值
}


/* 传入数字,转为大写数字 */
function toChinesNum(num){
	num = parseInt(num);
	let overWan = Math.floor(num / 10000);
	let noWan = num % 10000;
	if (noWan.toString().length < 4) noWan = "0" + noWan;
	return overWan ? getWan(overWan) + "万" + getWan(noWan) : getWan(num);
}
function getWan(temp){
	let unit = ["", "十", "百", "千", "万"];
	let changeNum = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九']; //changeNum[0] = "零"
	let strArr = temp.toString().split("").reverse();
	let newNum = "";
	for (var i = 0; i < strArr.length; i++) {
		newNum = (i == 0 && strArr[i] == 0 ? "零" : (i > 0 && strArr[i] == 0 && strArr[i - 1] == 0 ? "零" : changeNum[strArr[i]] + (strArr[i] == 0 ? unit[0] : unit[i]))) + newNum;
	}
	return newNum;
}

/* 计算平均值提示方法 */
function averageValueFn(){
	perMealWeightArr = [];
	let perMealAllWeight = 0;
	mealDataElement.find('.meal_item').not(':eq(0)').each(function(i,item){ //第一个是隐藏的重量不需要获取
		let perMealWeight = $.trim($(this).find('.meal_weight .shi_num').text());
		if(perMealWeight){
			perMealAllWeight += parseFloat(perMealWeight);
			perMealWeightArr.push(perMealWeight);
		}
	})

	let averageWeight = ((perMealAllWeight/perMealWeightArr.length)*100/100).toFixed(2);  //计算平均值
	//let averageWeight = parseFloat($(".detail_active").find(".item_standard").val()); //指导摄入量
	let averageMultiple = 0;
	for(let t=0;t<perMealWeightArr.length;t++){
		//console.log('某一餐的总重量：'+parseFloat(perMealWeightArr[t]));
		//console.log('所有餐的平均值：'+averageWeight);
		averageMultiple = parseFloat(perMealWeightArr[t])/averageWeight;
		//console.log('平均倍数：'+averageMultiple);
		if(averageMultiple >3 && averageMultiple < 10){ //如果超过平均值3-10倍，则在app端，提示用户有可能需要修改人数
			// alert(averageMultiple)
			mealDataElement.find('.meal_item').eq(t+1).addClass('beyond_x_times');
		}else if(averageMultiple > 10){ //如果大于/小于平均值10倍量，则认为为‘添加用量’，并通知用户
			//alert(averageMultiple)
			mealDataElement.find('.meal_item').eq(t+1).addClass('beyond_ten_times');
		}
	}
}

//传大类别汉字返回在数组里的序号
function switchItem(data){
	let itemArr = ["油","菜籽油","葵花籽油","橄榄油","花生油","玉米油","豆油","香油","芝麻油","麻油","糖","冰糖","白砂糖","红糖","盐","细盐","粗盐","碘盐","无碘盐","海盐","玫瑰盐","岩盐","竹盐","醋","黑醋","香醋","米醋","白醋","陈醋","康乐醋","酱油","海鲜酱油","生抽","老抽","六月鲜","味极鲜","刺生酱油","日式酱油","辣酱油","耗油","蒸鱼豉油","料酒","葱姜料酒","椒盐","淀粉","味精","鸡精","鸡粉"];
	let dataNum = -1;
	if(data&&data.length>0){
		let itemIndex1 = $.inArray(data,itemArr);
		if(itemIndex1 > -1){
			dataNum = itemIndex1+1;
		}
	}
	return dataNum;
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
