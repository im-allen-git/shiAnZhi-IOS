var userId = window.localStorage.getItem("useId");
var date = new Date();
var thisYear = date.getFullYear();
var thisMonth = date.getMonth()+1;
var thisDay = date.getDate();
var currentMonth =thisMonth;
var thisWeek = getYearWeek(thisYear,thisMonth,thisDay)
var thisMonthArr;
$(function() {
	getAllItem();
})
var reloadIndex = 0;
function getLastDay(year, month) {
		var new_year = year; //取当前的年份
		var new_month = month++; //取下一个月的第一天，方便计算（最后一天不固定）
		if (month > 12) {
			new_month -= 12; //月份减
			new_year++; //年份增
		}
		var new_date = new Date(new_year, new_month, 1); //取当年当月中的第一天
		return (new Date(new_date.getTime() - 1000 * 60 * 60 * 24)).getDate(); //获取当月最后一天日期
	}
function getYearWeek(year,month,date){
        /*
            dateNow是当前日期
            dateFirst是当年第一天
            dataNumber是当前日期是今年第多少天
            用dataNumber + 当前年的第一天的周差距的和在除以7就是本年第几周
        */
        let dateNow = new Date(year, parseInt(month) - 1, date);
        let dateFirst = new Date(year, 0, 1);
        let dataNumber = Math.round((dateNow.valueOf() - dateFirst.valueOf()) / 86400000);
        return Math.ceil((dataNumber + ((dateFirst.getDay() + 1) - 1)) / 7);
    }
function differentType(itemName,obj,forIndex) {
	let itemNameNum = switchItem(itemName);
	// 切换
	$(obj).addClass('active').siblings('span').removeClass('active');
	console.log("当前类型：" + itemNameNum)
	var lastDay = (getLastDay(thisYear, thisMonth));
	var this_month;
	if(thisMonth<10){
		this_month = "0"+thisMonth
	}
	else{
		this_month = thisMonth;
	}
	var start_time = thisYear + '-' + this_month + '-' + '01' + ' ' + '00:00:00';
	var end_time = thisYear + '-' + this_month + '-' + lastDay + ' ' + '23:59:59';
	// console.log('start_time ==' + start_time);
	// console.log('end_time ==' + end_time);
	// console.log(userId + ',' + item + ',' + '1'   + ',' + start_time + ',' + end_time);
	console.log("start_time:"+start_time,"end_time:"+end_time,"item:"+itemNameNum,"userId："+userId)
	//start_time = thisYear + '-' + '05' + '-' + '01' + ' ' + '00:00:00';
	$.ajax({
		//url: 'https://192.168.1.55:448/user/getWeightingDataListByYMWD',
		url: 'https://192.168.1.55:448/user/getWeightingDataAvgListByYMWD',
		type: 'POST',
		data: {
			'user_id': userId,
			'item': itemNameNum,
			'flag_type': '2',//flag_type:1天2周3月4年
			'start_time': start_time,
			'end_time': end_time
		},
		async:false,
		dataType: 'json',
		beforeSend: function() {
			showLoading();
		},
		success: function(result) {
			// console.log('月报返回数据成功');
			// console.log('月报返回数据成功result == ' + result);
			console.log('周报返回数据成功JSON.stringify == ' + JSON.stringify(result));
			// var result =  [{"end_week":"2020-08-20 19:26:48","flag_type":0,"format_time":"33","id":0,"number":0,"start_week":"2020-08-20 17:50:35","weight":"2811"}]
			if (result && result.length > 0) {
				var weightArr = [];
				var monthWeekArr = [];
				for (var i in result) {
					let weightAvg = 0;
					if(result[i].weight_avg){
						weightAvg = result[i].weight_avg;
					}
					weightAvg = Math.round(weightAvg*100)/100;
					weightArr.push(weightAvg);
					monthWeekArr.push(result[i].start_week + "@"+result[i].end_week);
				}
				console.log(weightArr+',monthWeekArr:'+monthWeekArr)
				lineEChart(weightArr, monthWeekArr,forIndex,itemNameNum);
				thisMonthArr = monthWeekArr;
				var firstWeek = monthWeekArr[0];
				// console.log(firstWeek)
				getDayData(firstWeek,forIndex,itemNameNum);//加载折线图后，自动加载第一个月的柱状图数据
				hideLoading();
				reloadIndex = 0
			} else {
				if (reloadIndex < 3) {
					setTimeout(function() {
						reloadIndex++
						differentType(itemNameNum,obj,forIndex);
					}, 500)
				} else {
					reloadIndex = 0
					console.log("暂且没有对应的数据")
					noDataShow();
					hideLoading();
				}
			}
		},
		error:function(e){
			console.log(e)
			hideLoading();
			var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>'
			$(".each_line_chart").hide();
			$("#main"+forIndex).html(errorHTML).show();
			$("#main2_wrapper").hide();
			console.log("暂且没有对应的数据")
			hideLoading();
		}
	})
}
var myChart1,myChart2;
function lineEChart(weightArr, monthArr,forIndex,itemName) {
	console.log("lineEChartFn:"+weightArr,monthArr,forIndex,itemName)
	$(".each_line_chart").hide();
	$("#main1_wrapper").find("#main"+forIndex).show();
	var xData =[];
	if(monthArr.length){ //因为无法提供第几周，所以直接写成1234
		for(var i=1; i<= monthArr.length;i++){
			xData.push("第"+i+"周");
		}
	}
	// 折线图
	var chartName = 'main'+forIndex
	//console.log("chartName:"+chartName)
	myChart1 = echarts.init(document.getElementById(chartName));
	var option0 = {
		title: {
			/* text: '一天用电量分布',
			 subtext: '纯属虚构' */
		},
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'cross'
			},
			triggerOn:"click",
			formatter:function (params) { //折线图的点击事件
				console.log("selectedMonth:"+params[0].data,params[0].name)
				var selectedWeek = Number(params[0].name.substring(1,params[0].name.length-1))-1;
				var selectedRange = thisMonthArr[selectedWeek];
				console.log("selectedWeek:"+selectedWeek)
				console.log("146thisMonthArr:"+thisMonthArr)
				console.log("147selectedRange:"+selectedRange)
				//console.log("option: "+forIndex)
				getDayData(selectedRange,forIndex,itemName);
			}
		},
		toolbox: {
			show: false,
			feature: {
				saveAsImage: {}
			},
			color: '#333',
			backgroundColor: '#fff',
			boxShadow: '0px 2px 20px 0px rgba(46,73,99,0.2)',
			borderColor: '#ccc'
		},
		xAxis: {
			axisLine: { // 设置X轴线条不要
				show: true,
				lineStyle: {
					color: '#d1e0ee',
					// width:8,//这里是为了突出显示加上的
				},
			},
			axisTick: { // 设置X轴线条不要
				show: false
			},
			offset: 5, // 设置Y轴上数据与线条X轴的位置距离
			axisLabel: { //坐标轴刻度标签的相关设置
				// interval: 1, //横轴信息全部显示
				show: true,
				textStyle: {
					color: '#868B91',
				},
				fontSize: 14, //字体大小
				interval: 0,
				rotate: 40
			},
			type: 'category',
			boundaryGap: false,
			data: xData,
		},
		yAxis: {
			axisLine: { // 设置X轴线条不要
				show: true,
				lineStyle: {
					color: '#d1e0ee',
					// width:8,//这里是为了突出显示加上的
				}
			},
			axisTick: { // 设置X轴线条不要
				show: false
			},
			type: 'value',
			offset: 5, // 设置Y轴上数据与线条X轴的位置距离
			axisLabel: { //坐标轴刻度标签的相关设置
				// interval: 1, //横轴信息全部显示
				show: true,
				textStyle: {
					color: '#868B91',
				},
				fontSize: 14, //字体大小
			},
			axisPointer: {
				snap: true
			},
			splitLine: { //  设置X轴线条为虚线
				show: true,
				lineStyle: {
					type: 'dashed',
					color: ['#d1e0ee'], // 设置X轴虚线颜色,

				}
			},
		},
		visualMap: {
			show: false,
			dimension: 0,
			pieces: [{
				lte: 6,
				color: '#3aa0ff'
			}, {
				gt: 6,
				lte: 8,
				color: '#3aa0ff'
			}, {
				gt: 8,
				lte: 14,
				color: '#3aa0ff'
			}, {
				gt: 14,
				lte: 17,
				color: '#3aa0ff'
			}, {
				gt: 17,
				color: '#3aa0ff'
			}]
		},
		series: [{
			name: '摄入盐分相较 前一周下降',
			type: 'line',
			smooth: true,
			//  data: [300, 280, 250, 260, 270, 300, 550, 500, 400, 390, 380, 390, 400, 500, 600, 750, 800, 700, 600, 400],
			data: weightArr,
			markArea: { //标记最大最小值背景色https://echarts.apache.org/examples/zh/editor.html?c=line-sections
				data: [
					[{
							//  name: '早高峰',
							xAxis: '5/18-24'
						},
						{
							xAxis: '5/25-31'
						},
					],
					/* , [{
	                   // name: '晚高峰',
	                    xAxis: '17:30'
	                }, {
	                    xAxis: '21:15'
	                }] */
				],
				itemStyle: {
					color: ['#ecf3fb'],
					opacity: 0.8,
					border: '5px solid #51a9ff'
				}
			},
			itemStyle: {
				normal: {
					borderWidth: 5, // 拐点边框大小
					borderColor: '#3aa0ff', //拐点边框颜色
					lineStyle: {
						width: 4, // 线条粗细
						shadowColor: 'rgba(81,169,255,0.4)',
					}
				}

			}
		}]
	};
	myChart1.setOption(option0);
}
function getDayData(thatWeekRange,forIndex,itemName){ //获取选中月份的天数柱状图数据
	/*var item = $.trim($('.report .sort span.active').text());*/
	console.log("thatWeekRange:::"+thatWeekRange)
	console.log("getDayDateFun: " + forIndex + itemName)
	var timesArr = thatWeekRange.split("@");
	var start_time = timesArr[0];
	var end_time = timesArr[1];
	console.log('start_time:'+start_time+',end_time:'+end_time)
	//alert('start_time:'+start_time+',end_time:'+end_time)
	$.ajax({
		// url: 'https://192.168.1.55:448/user/getWeightingDataListByYMWD',
		url: 'https://192.168.1.55:448/user/getWeightingDataAvgListByYMWD',
		type: 'POST',
		data: {
			'user_id': userId,
			'item': itemName,
			'flag_type': '1',//flag_type:1天2周3月4年
			'start_time': start_time,
			'end_time': end_time
		},
		dataType: 'json',
		beforeSend: function () {
			showLoading();
		},
		success: function (result) {
			console.log('月报day返回数据成功JSON.stringify == ' + JSON.stringify(result));
			if (result && result.length > 0) {
				var weightArr = [];
				var monthArr = [];
				for (var i in result) {
					let weightAvg = 0;
					if(result[i].weight_avg){
						weightAvg = result[i].weight_avg;
					}
					weightAvg = Math.round(weightAvg*100)/100;
					weightArr.push(weightAvg);
					monthArr.push(result[i].format_time.substring(5, result[i].format_time.length));
				}
				console.log("barEChart:  " + weightArr, monthArr, forIndex)
				barEChart(weightArr, monthArr, forIndex);
				hideLoading();
				reloadIndex = 0
			} else {
				if (reloadIndex < 3) {
					setTimeout(function () {
						reloadIndex++
						getDayData(thatWeekRange, forIndex, itemName)
					}, 500)
				} else {
					var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">暂且没有对应的数据</div>'
					$(".each_bar_chart").hide();
					$("#main2_wrapper").show();
					$("#barChart" + forIndex).html(errorHTML).show();
					console.log("暂且没有对应的数据")
					hideLoading();
				}

			}
		},
		error: function (e) {
			console.log(e)
			hideLoading();
			var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>'
			$(".each_bar_chart").hide();
			$("#main2_wrapper").show();
			$("#barChart" + forIndex).html(errorHTML).show();
		}
	})
}
function barEChart(weightWeekArr,monthWeekArr,forIndex) {
	$(".each_bar_chart").hide();
	$("#main2_wrapper").show();
	var barchartName = "barChart"+forIndex
	$("#"+barchartName).show();
	// console.log("showed bar : "+forIndex + "----"+JSON.stringify($("#"+barchartName)))
// 柱状体
// 	console.log("barchartName:"+barchartName)
	myChart2 = echarts.init(document.getElementById(barchartName));
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
		title: {
			/* text: '*最大摄入量每日8克，日均摄入6克',
			textStyle: {
				fontSize: 10,
				fontWeight: 'normal',
				color:'#868c92'
			},
			height:5 */

		},
		tooltip: {},
		color: '#32ff22',
		legend: {
			data: ['每日标准 (单位：克)'],
			textStyle: {
				fontSize: 10,
				fontWeight: 'normal',
				color: '#868c92',
			},
			itemWidth: 20,
			itemHeight: 5,
			top: '0',
			right: '10px',
			orient: 'vertical'

		},
		xAxis: {
			axisLine: { // 设置X轴线条不要
				show: false
			},
			axisTick: { // 设置X轴线条不要
				show: false
			},

			data: monthWeekArr,
			offset: 5, // 设置X轴上数据与线条X轴的位置距离
			axisLabel: { //坐标轴刻度标签的相关设置
				//interval: 1, //横轴信息全部显示
				show: true,
				textStyle: {
					color: '#868B91',
				},
				fontSize: 14, //字体大小
				rotate: 40
			}
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
					type: 'dashed',
					color: ['#b1b6bc', '#b1b6bc', '#b1b6bc', '#32ff22', '#b1b6bc'], // 设置X轴虚线颜色,

				}
			},
			offset: 5, // 设置Y轴上数据与线条X轴的位置距离
			axisLabel: { //坐标轴刻度标签的相关设置
				// interval: 1, //横轴信息全部显示
				show: true,
				textStyle: {
					color: '#868B91',
				},
				fontSize: 14, //字体大小
			}
		},
		series: [{
				name: ' 每日标准 (单位：克) ',
				type: 'bar',
				barWidth: '20%',

				data: weightWeekArr,
				itemStyle: {
					normal: {
						barBorderRadius: [8],
						color: '#3aa0ff',
						type: 'dashed',
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
			}]
	};

	// 使用刚指定的配置项和数据显示图表。
	myChart2.setOption(option2);
}

function getAllItem(){
	$.ajax({
		url: 'https://192.168.1.55:448/user/getEquipmentDataList',
		type: 'post',
		data: {
			user_id: userId //用户ID
		},
		async: false,
		dataType: 'json',
		beforeSend: function() {
			showLoading();
		},
		success: function (res) {
			console.log("后台数据：：：："+JSON.stringify(res))
			var macObj = {};
			// var res = [{"characteristic_id":"5EB5483E-36E1-4688-B7F5-EA07361B26A8","device_name":"ESP32-new-1","mac":"FC:F5:C4:16:24:AA","online_type":"bluetooth","service_id":"5FAFC201-1FB5-459E-8FCC-C5C9C331914B","update_time":"2020-08-20 18:47:07.0","user_id":"7"},{"item":"盐","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1左","online_type":"bluetooth","target":"","unit":"克","update_time":"2020-08-20 18:47:11.0","user_id":"7"},{"item":"盐","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","update_time":"2020-08-24 10:38:16.0","user_id":"7"},{"item":"味精","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","update_time":"2020-08-24 10:38:35.0","user_id":"7"},{"item":"酱油","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1右","online_type":"bluetooth","target":"","unit":"克","update_time":"2020-08-24 10:45:32.0","user_id":"7"},{"item":"糖","mac":"FC:F5:C4:16:24:AA","name":"ESP32-new-1左","online_type":"bluetooth","target":"","unit":"克","update_time":"2020-08-24 16:18:13.0","user_id":"7"}]
			if (res && res.length > 0) {
				var firstItem = true;
				var forIndex = 0;
				var this_mac_id, this_service_id, this_characteristic_id, this_device_name;
				var firstItemName;
				var firstItemObj;
				var html = '';
				for (var i in res) {
					if (res[i].service_id && res[i].characteristic_id) {
						this_mac_id = res[i].mac;
						this_service_id = res[i].service_id;
						this_characteristic_id = res[i].characteristic_id;
						this_device_name = res[i].device_name;
						var obj = {};
						obj["service_id"] = this_service_id;
						obj["characteristic_id"] = this_characteristic_id;
						obj["device_name"] = this_device_name;
						macObj[this_mac_id] = obj;
						// console.log("==============="+JSON.stringify(macObj))
					}
					if (res[i].item_value) {
						if (firstItem) {
							html += '<span class="active" onclick="differentType(\''+res[i].item_value+'\',this,'+(forIndex+1)+')">'+res[i].item_value+'</span>';
							firstItemName = res[i].item_value
							firstItem = false;
							forIndex++;
						} else {
							html += '<span class="" onclick="differentType(\''+res[i].item_value+'\',this,'+(forIndex+1)+')">'+res[i].item_value+'</span>'
							forIndex++;
						}
					}
					// console.log('forIndex:'+forIndex)
					if(forIndex>1) {
						$("#main1_wrapper").append('<div id="main' + forIndex + '" class="each_line_chart" style="width: 100%;height:400px;"></div>')
						// $("#main2_wrapper").append('<div id="barChart' + forIndex + '" class="each_bar_chart" style="width: 100%;height:400px;"></div>')
						// console.log(JSON.stringify($("#main1_wrapper .each_line_chart" )))
					}
				}
				if(forIndex>0) {
					$("#foodType").html(html);
					firstItemObj = $("span.active");
					differentType(firstItemName, firstItemObj, 1); //默认类型
				}
				else{
					// var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">暂且没有对应的数据</div>'
					// $("#main1").html(errorHTML);
					// $("#main2_wrapper").hide();
					noDataShow();
				}
			}
		},
		error: function (error) {
			console.log(error);
			var errorHTML = '<div style="text-align: center; line-height: 150px; color: #999;">网络错误，请稍后重试</div>';
			$("#main1").html(errorHTML).show();
			$("#main2_wrapper").hide();
			console.log("暂且没有对应的数据")
			hideLoading();
		}
	})
}


function showLoading() {
	$("#loading_data").show();
}

function hideLoading() {
	$("#loading_data").hide();
}

function noDataShow(){
	var weightArr = ['0','0','0','0'];
	var monthWeekArr = ['0@0','0@0','0@0','0@0'];
	thisMonthArr = monthWeekArr;
	lineEChart(weightArr, monthWeekArr,1,'不知道');
	var firstWeek = monthWeekArr[0];
	getDayData(firstWeek,1,"不知道");//加载折线图后，自动加载第一个月的柱状图数据
	$("#main2_wrapper").hide();
	$("#barChart1").show();
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


