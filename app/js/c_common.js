define(function(require){
	require('jquery');
	//require('j/weather2015/ch_nation_jdSearch.js');
	var dataUrl = 'http://d1.weather.com.cn/spots/_proId_.html' ; 
	$("#txt1,#txt2,#txt3").click(function(){
	$(this).parent().next().show();
	}).mouseleave(function(){
	  $(this).parent().next().hide();
	})
	
	$("#List1 a").live('click',function(){
	  var $menu = $(this).parents('.Menu').hide();
	var txt = $(this).text();
	$('p.txt1').text(txt);
	$('span.jqu').text("景区");
	$('span.jqu').attr('data-id','');
	$menu.prev().children().val(txt).attr('data-id',$(this).attr('data-id'));
		
	})
	$("#List2 a").live('click',function(){
	  var $menu = $(this).parents('.Menu').hide();
		var txt = $(this).text();
		$('p.txt2').text(txt);
		$('span.jqu').text("景区");
	  $menu.prev().children().val(txt).attr('data-id',$(this).attr('data-id'));
		
	})
	$("#List3 a").live('click',function(){
	  var $menu = $(this).parents('.Menu').hide();
	  var txt = $(this).text();
	  $('span.jqu').text(txt);
	  $menu.prev().children().children().text(txt).attr('data-id',$(this).attr('data-id'));
	  
	})
	$("#txt3").live('click',function(){
	var $menu = $("#List2 a").parents('.Menu');
	var view = $menu.prev().children();
	var view_id = view.attr("data-id");
	if(view_id){
	var proId = $('#txt1').attr('data-id');
	var str = '';
	$.ajax({
		  type:'GET',
		  url:dataUrl.replace('_proId_',proId),
		  dataType:'script',
		  success:function(){
			var arr = eval("spot"+proId);
			$.each(arr[view_id],function(i,v){  
		  str += '<li><a target="_blank" data-id="'+i+'">'+v+'</a></li>';
		}) 
		$('#List3 ul').empty().append(str);
		  }
		})
	}else{alert('请选择景区级别'); return false;}
	})
	
	$('.Menu').mouseenter(function(){
	  $(this).show();
	}).mouseleave(function(){
	  $(this).hide();
	})
	
	
	$("#viewSearch").click(function(){
	  var viewId = $('#txt3').children().attr('data-id');
	  if(viewId){
	  window.open('http://www.weather.com.cn/weather1d/'+viewId+'.shtml');
	  }else{alert('请选择景区');}
	})
	//打印更新时间
	$('.ctop .time').html($('#update_time').attr('value')+"更新");
	$("#adposter_6287 p img").click(function(){
		$("#adposter_6287").hide(); 
	})
	$("#duilian p img").click(function(){
		$("#duilian").hide(); 
	})	
	
	//周边地区效果
	var $ard = $('#around');
	if(!$ard.find('.aro_view').children().length){
		$ard.find('h1').find('em').remove()
		$ard.find('h1').find('span:eq(1)').remove();
	}
	$ard.find('h1').children('span').click(function(){
		//$(this).addClass('move').siblings('span').removeClass('move');
		if($(this).text()=="周边地区"){
			$ard.find('.aro_view').hide();
			$ard.find('.aro_city').show();
		}else{
			$ard.find('.aro_view').show();
			$ard.find('.aro_city').hide();
		}
	})
	//高清图集
	var $hdImg_I = $('.hdImgs i').show();
	$.each($hdImg_I,function(i,v){
		if(i==2){
			$(v).height($(v).prev('b').height()+18);
		}else{
			var fontHei=$(v).prev('b').height()
				$(v).height(fontHei+6).prev('b');
		}
	})
	//大事件
	$('.greatEvent li').mousemove(function(){
		$(this).addClass('on').siblings('li').removeClass('on');
	})
	//热点
	$(".chartPH>h1>i").mouseenter(function(){
		var $this = $(this);
		var index = 3-$this.index();
		$this.addClass('on').siblings().removeClass('on');
		$('.chartPH>ul').hide().eq(index).show();
	})
	
	//滚动图
	var defaultConfig = {
		eleFather: null,  //容器标签 父元素 最外围标签  
		eleText: null,    //图解文字所在标签
		eleSmallClass: 'on', //下方的缩略图选中时的样式
		// eleBottom: null,  //下方的缩略图
		rollLeft: null,   //向左转标签
		rollRight: null,  //向右转标签
		time:3000         //图片切换时间间隔，默认3000毫秒
	}
	function picRoll(config){
		config = $.extend({},defaultConfig,config);
		
		var $imgUl = $(config.eleFather).find('ul:has(img):first');//检索获取图片ul列表
		var $botUl = $(config.eleFather).find('ul:not(:has(img)):last'); //检索获取缩略图ul列表
		var imgWidth = $imgUl.find('img').width()||300;
		var imgNum = $imgUl.find('img').length;
		var arrInter = [];
		//根据图片数量自匹配imgUl的宽
		$imgUl.width(imgWidth*imgNum*2).css("left",-imgWidth*imgNum+"px");
		$imgUl.append($imgUl.html());
		var pointer = imgNum;
		var time = null;
		//定时器
		//arrInter.push(setInterval(function(){_move(++pointer)},config.time));
		time = setInterval(function(){_move(++pointer)},config.time);
		$(config.eleFather).mouseover(function(){
			//_clearInter(arrInter);
			clearInterval(time)
		}).mouseout(function(){
			time = setInterval(function(){_move(++pointer)},config.time);
			//arrInter.push(setInterval(function(){_move(++pointer)},config.time));
		})
		//左右点击按钮的hover透明度效果
		var opa = $(config.rollLeft).css('opacity');
		$(config.rollLeft+","+config.rollRight).hover(function(){
			$(this).css('opacity',1);
			//_clearInter(arrInter);
		},function(){
			$(this).css('opacity',opa);
			//arrInter.push(setInterval(function(){_move(++pointer)},config.time));
		})
		//向左，向右滚动点击效果
		
		$(config.rollLeft).click(function(){
			//_clearInter(arrInter);
			_move(--pointer);
		})
		$(config.rollRight).click(function(){
			//_clearInter(arrInter);
			_move(++pointer);
		})
		//底部缩略图点击效果
		$botUl.empty();
		var $botUlLi = '';
		for (var i = imgNum - 1; i >= 0; i--) {
			$botUlLi += '<li></li>';
		};
		$botUl.append($botUlLi).find('li').live('click',function(){
			pointer = $(this).index();
			_move(pointer);
		}).first().addClass(config.eleSmallClass);
		
		//底部图标块 居中
		var botUlWidth = imgNum*16;
		$botUl.css('marginLeft',150-botUlWidth/2+'px').width(botUlWidth); 
		
		$(config.eleText).html($imgUl.find('img').first().attr('alt'));
		function _move(poi){
			if(poi==(imgNum*2-1)){
				$imgUl.stop(true,true).animate({left: -imgWidth*poi+'px'},'fast',function(){
					$imgUl.css('left',-imgWidth*imgNum+imgWidth+"px");
				});
				poi = imgNum-1;
			}else if(poi == 0){
				$imgUl.stop(true,true).animate({left: -imgWidth*poi+'px'},'fast',function(){
					$imgUl.css('left',-imgWidth*imgNum+"px");
				});
				poi = imgNum;
			}else{
				$imgUl.stop(true,true).animate({left: -imgWidth*poi+'px'},'fast');
			}
			$botUl.find('li').removeClass(config.eleSmallClass).eq(poi-imgNum).addClass(config.eleSmallClass);
			//图示文字切换
			$(config.eleText).html($imgUl.children('li').eq(poi).find('img').attr('alt'));
			pointer = poi;
		}
		
		function _clearInter(arrInter){
			for (var i = arrInter.length - 1; i >= 0; i--) {
				clearInterval(arrInter[i]);
			}
		}
	}
	
	var picOpation1 = {
		eleFather: '#scrollPic',  //容器标签 父元素 最外围标签  
		eleText: '#scrollPic p',    //图解文字所在标签
		eleSmallClass: 'on', //下方的缩略图选中时的样式
		rollLeft: "#scrollPic .rollLeft",   //向左转标签
		rollRight: '#scrollPic .rollRight'   //向右转标签
	}
	picRoll(picOpation1);
	var picOpation2 = {
		eleFather: '.travel',   
		eleText: '.travel p',    
		eleSmallClass: 'on', 
		rollLeft: ".travel .rollLeft",   
		rollRight: '.travel .rollRight'
	}
	picRoll(picOpation2);
	//蒙蒙 广告
	
})

 function setHomepage()
        {
             var url = window.location.href; 
             if (document.all)
             {
                      document.body.style.behavior='url(#default#homepage)';
                      document.body.setHomePage(url);
 
              }
              else if (window.sidebar)
             {
                       if(window.netscape)
                       {
                        try
                           { 
                            netscape.security.PrivilegeManager.enablePrivilege("UniversalXPConnect"); 
                        } 
                         catch (e) 
                         { 
                           alert( "设为首页操作被浏览器拒绝，如果想启用设为首页功能，请选择信任此代码" ); 
                         }
               }
                 var prefs = Components.classes['@mozilla.org/preferences-service;1'].getService(Components. interfaces.nsIPrefBranch);
                 prefs.setCharPref('browser.startup.homepage',url);
               }
          }