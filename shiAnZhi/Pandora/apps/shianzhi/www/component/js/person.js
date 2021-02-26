$(function(){
	// 查询用户信息
	var userId = window.localStorage.getItem("useId");
	$.ajax({
		url:'https://192.168.1.55:448/user/getUserInfoDataList',
		type:'post',
		data:{
			'user_id':userId
		},
		dataType:'json',
		success:function(result){
			if(result.nick_name){
			        $('.name_text').text(result.nick_name);
			        $('.name_val').val(result.nick_name);
			    };
			if(result.sex){
				$('.sex_text').text(result.sex);
				$('.sex_tc .sex ').each(function(){
					if($(this).text() == result.sex){
						$(this).addClass('active').siblings('span').removeClass('active');
					}
				})
			};
			if(result.birthday){
				$('#demo4').text(result.birthday).css('color','#333');
			};
			if(result.height){
				 $('#height').text(result.height).css('color','#333');
			};
			if(result.weight){
				 $('#weight').text(result.weight).css('color','#333');
			};
		},
		error:function(ero){
			console.log(ero);
		}
	})
	
	// 修改用户信息
	/* $('#person_data').click(function(){
	     var nick_name = $('.name_text').text();
	     var sex = $('.sex_text').text();
	     var birthday = $('#demo4').text();
	     var height = $('#height').text();
	     var weight = $('#weight').text();
	     $.ajax({
	     	url:'https://192.168.1.55:448/user/updateUserInfo',
	     	type:'post',
	     	data:{
				'user_id':userId,
				'nick_name':nick_name,
				'sex':sex,
				'birthday':birthday,
				'height':height,
				'weight':weight,
				'waste_rate':'',
				'number':''
			},
			dataType:'json',
			success:function(result){
			},
			error:function(ero){
				console.log(ero);
			}
	    })
	}) */

	/* 当用户点击手机自带的返回按钮离开本页面,没有点击返回按钮,也要走返回按钮person_data的方法,保存最新信息到数据库 */
	// let pageVisibility = document.visibilityState;
	// // 监听 visibility change 事件 
	// document.addEventListener('visibilitychange', function() {
	//   // 页面变为不可见时触发
	//   if (document.visibilityState == 'hidden') {}
	//   // 页面变为可见时触发
	//   if (document.visibilityState == 'visible') {} 
	// });
	
})


