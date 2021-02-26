$(function(){
	// 获取公共 useId
	var userId = window.localStorage.getItem("useId");
	// console.log(userId)
	// 查询群组信息
	$.ajax({
		url:'https://192.168.1.55:448/user/getBindingUserList',
		type:'post',
		data:{'user_id':userId},
		dataType:'json',
		success:function(result){
			console.log('群组信息页面查询时传递的用户id ==' + userId);
			console.log('群组信息页面查询的群组绑定用户信息==' + JSON.stringify(result));
			if(result && result.length > 0){
				var list = '';
				for(var i = 0;i< result.length;i++){
					if(result[i].binding_userid && result[i].binding_userid != ''){

						list += '<div class="list clearfix"  >'
						list +=	'<div class="col-xs-8">'
						list +=		'<span class="group_name" id="add_name"> '+ result[i].nick_name +' </span>'
						// list +=		'<span class="state"> 已连接 </span>'
						list +=	'</div>'
						list +=	'<div class="col-xs-4 text-right">'
						list += '<i class="look" onclick="groupDetail('+ result[i].binding_userid +')">查看</i>'
						list +=		'<i class="icon del_list" onclick="del_list(this,'+ userId +', '+ result[i].binding_userid +')" >删除</i>'
						list +=	'</div>'
						list += '</div>';
					}
				}
				$('.group_list').append(list).show();
				$('.no_group').hide();
				$('.icon-jia_wrap').show();
				$('.share_foot button.add_phone,.share_foot button.sm').hide();
			}else{
				$('.group_list').hide();
				$('.no_group').show();
				$('.icon-jia_wrap').hide();
				$('.share_foot button.add_phone,.share_foot button.sm').show();
			};
		},
		error:function(ero){
			console.log(ero);
		}
	});

	//添加群组信息
	$('#group_phone_data').click(function(){
		var group_list = '';
		var binding_userid = $.trim($('#phone_val').val());
		if(!(/^1(3|4|5|7|8)\d{9}$/.test(binding_userid))){
			alert("手机号码有误，请重填");
			return false;
		}

		$.ajax({
			url:'https://192.168.1.55:448/user/bindingUserAdd',
			type:'post',
			data:{
				'user_id':userId,
				'binding_userid':binding_userid,
				'type' :'1'
			},
			dataType:'json',
			success:function(res){
				console.log("bindingUserAdd:::"+JSON.stringify(res))
				if(res.code==200){
					if(res.total==0){
						alert("添加失败，请稍后重试！")
					}
					else if(res.total==1){
						console.log('添加成功的');
						group_list += '<div class="list clearfix" type="1" >'
						group_list +=	'<div class="col-xs-8">'
						group_list +=		'<span class="group_name" id="add_name"> '+ binding_userid +' </span>'
						// group_list +=		'<span class="state"> 已连接 </span>'
						group_list +=	'</div>'
						group_list +=	'<div class="col-xs-4 text-right">'
						group_list += 		'<i class="look" onclick="groupDetail('+ binding_userid +')">查看</i>'
						group_list +=		'<i class="iconfont del_list" onclick="del_list(this,'+ userId + ' ,'+ binding_userid +')">删除</i>'
						group_list +=	'</div>'
						group_list +='</div>';
						$('.group_list').append(group_list).show();
						$('.no_group').hide();
						$('.phone_tc').hide();
					}
					else if(res.total==2){
						alert("已添加该用户，请勿重复添加！")
					}
					else if(res.total==3){
						alert("该用户未注册本产品，请先注册！")
					}
				}

			},
			error:function(ero){
				console.log(ero);
			}
		})
	});
})
// 删除群组成员
function del_list(obj,userId,binding_userid){
   
	
    console.log('删除开始时候useid==' + userId + ', binding_userid== ' + binding_userid);
	$.ajax({
		url:'https://192.168.1.55:448/user/bindingUserDel',
		type:'post',
		data:{
			'user_id':userId,
			'binding_userid':binding_userid
		},
		dtaType:'json',
		success:function(result){
			console.log('删除成功useid==' + userId + ', binding_userid== ' + binding_userid);
			 $(obj).closest('.list').remove();
		},
		error:function(ero){
			
			console.log('删除失败useid==' + userId + ', binding_userid== ' + binding_userid + '&&' + ero);
		}
	})
};

// 加号icon添加群组
function addGroupIcon(){
	$('.icon-jia_tc,.transparent').show();
}

// 跳转详情
function groupDetail(binding_userid){
	window.open('group_detail.html?'+ binding_userid);
}
function iconJiaPhone(){
	$('.icon-jia_tc,.transparent').hide();
	$('.phone_tc').show();
}
function transparentHide(){
	$('.icon-jia_tc,.transparent').hide();
}