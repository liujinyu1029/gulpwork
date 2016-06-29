var by = function(a) {
    return function(c, e) {
        var h, g;
        if ("object" === typeof c && "object" === typeof e && c && e) return h = c[a], g = e[a], 
        h === g ? 0 :typeof h === typeof g ? h < g ? -1 :1 :typeof h < typeof g ? -1 :1;
        throw "error";
    };
}, requestCount = 0, keyvalueOld = "", regNum = /^[0-9]*[0-9][0-9]A*$/, regEn = /^[A-Za-z]+$/, regCn = RegExp("[一-龥]"), requestOccur = 0;

function searchJudge(a) {
    "输入城市名、景点名 查天气" != a ? readData(a, 0) :hide();
}
define(function(require){
	require('jquery');
	$(".city-tt a").click(function(e){
		e.stopPropagation();
		$(this).addClass("cur").siblings().removeClass("cur");
		$(".w_city").eq($(".city-tt a").index($(this))).show().siblings(".w_city").hide();
	})
	$(".text").click(function(){
		$(".city-box").addClass("show_head");
	})
	
	//$(".city-box").mouseleave(function(){
		//$(".city-box").removeClass("show_head");
	//})
	//$(".w_weather").mouseenter(function(){
		//$(".w_weather .more").show();
	//})
	//$(".w_weather .more").mouseleave(function(){
	//	$(this).hide();
	//})
	$(".city-tt b").click(function(){
		$(".city-box").hide();
	})
	
	$(".sheng").click(function(){
		$(".sheng-show").slideToggle(500);
	})
	$(".sjz").click(function() {
		    $(".provinceLinks").animate({
		      height: 'toggle'
		    }, "normal");
	})
	$(".nav a[id="+$("#colorid").val()+"]").addClass("sheng");
	$(".menu a[id="+$("#colorid").val()+"]").parent().addClass("sheng");
	$(".menu a[id="+$("#colorid").val()+"]").addClass("color");
    $(".nav a[id="+$("#colortid").val()+"]").addClass("sheng");
	var navid = $(".nav a").attr("id");
	
	// if(colorid == 510){
	// 	$(".menu").eq(0).show().siblings().hide();
	// }else if(colorid == 32){
	// 	$(".menu").eq(1).show().siblings().hide();
	// }else if(colorid == 10){
	// 	$(".menu").eq(2).show().siblings().hide();
	// }else if(colorid == 34){
	// 	$(".menu").eq(3).show().siblings().hide();
	// }
	
	var dizhi = window.location.href;
	var dizhi = dizhi.split("/");
    var dizhi = dizhi.pop().split(".");
    

	var str = dizhi[0];


	if(istrue(str)){
    var aaa  = str.length;
    if(aaa == 7){
     
    var rs="http://wgeo.weather.com.cn/ip/";

				$.getScript(rs,function(){
					$.getScript("http://d1.weather.com.cn/index_around/"+id+".html",function(){
					var arr = around.n;
					 $.each(arr,function(i,v){
							$(".city_guonei").eq(1).find("dd").eq(0).append("<a href='http://www.weather.com.cn/weather1d/"+v.ac+".shtml' title='"+v.an+"'>"+v.an+"</a>");  
					  })
					 var array = around.jd;
					 $.each(array,function(index,act){
							$(".city_guonei").eq(1).find("dd").eq(1).append("<a href='http://www.weather.com.cn/weather1d/"+act.ac+".shtml' title='"+act.an+"'>"+act.an+"</a>");
					  }) 
				   })
				});
    }else{
     
    $.getScript("http://d1.weather.com.cn/index_around/"+dizhi[0]+".html",function(){
	  	var arr = around.n;
		 $.each(arr,function(i,v){
				$(".city_guonei").eq(1).find("dd").eq(0).append("<a href='http://www.weather.com.cn/weather1d/"+v.ac+".shtml#around1' title='"+v.an+"'>"+v.an+"</a>");  
		  })
		 var array = around.jd;
		 $.each(array,function(index,act){
				$(".city_guonei").eq(1).find("dd").eq(1).append("<a href='http://www.weather.com.cn/weather1d/"+act.ac+".shtml#around1' title='"+act.an+"'>"+act.an+"</a>");
		  }) 
       })
    }
    
		
	}else{
		var rs="http://wgeo.weather.com.cn/ip/";

				$.getScript(rs,function(){
					$.getScript("http://d1.weather.com.cn/index_around/"+id+".html",function(){
					var arr = around.n;
					 $.each(arr,function(i,v){
							$(".city_guonei").eq(1).find("dd").eq(0).append("<a href='http://www.weather.com.cn/weather1d/"+v.ac+".shtml#around1' title='"+v.an+"'>"+v.an+"</a>");  
					  })
					 var array = around.jd;
					 $.each(array,function(index,act){
							$(".city_guonei").eq(1).find("dd").eq(1).append("<a href='http://www.weather.com.cn/weather1d/"+act.ac+".shtml#around1' title='"+act.an+"'>"+act.an+"</a>");
					  }) 
				   })
				});
	};
	
	 
     $("#txtZip").focus(function() {
              

        if ("" == $("#txtZip").val() || "输入城市名、景点名 查天气" == $("#txtZip").val()) $("#idss").show(), 
        hide();
        $(this).val() == this.defaultValue ? $(this).val("") :"" != $("#txtZip").val() && "输入城市名、景点名 查天气" != $("#txtZip").val() && $("#show").show();
        setInterval(function() {
            var a = $("#txtZip").val();
            "" == a && hide();
            a != keyvalueOld && ($("#idss").hide(), searchJudge(a));
        }, 300);
       $('.city-box').show();
      
    });
    $(document).click(function() {
        "" == $("#txtZip").val() ? ($("#show").hide(), $("#txtZip").val("输入城市名、景点名 查天气")) :($("#show").hide());
       // $('.city-box').hide();
      

    });
    $("#txtZip").add("#selectsionTabs").click(function(a) {
        a.stopPropagation();
        return !1;
    });
    $("#selectsionTabs span").click(function() {
        var a = $("#selectsionTabs span").index(this);
        $("#selectsionGroups ul").hide();
        $("#selectsionGroups ul").eq(a).show();
        $("#selectsionTabs span").removeClass("active");
        $(this).addClass("active");
    });
    $("#selectsionTabs .tab").click(function() {
        event.stopPropagation();
        return !1;
    });
    $("#btnZip").bind("click", function(a) {
        a.stopPropagation();
        a = $("#txtZip").val();
        if ("" == a || "输入城市名、景点名 查天气" == $.trim(a)) return window.location = "http://www.weather.com.cn/forecast/index.shtml#input", 
        !1;
        readData(a, 1);
    });
    $("#txtZip").keyup(function(a) {
        var c = $("#txtZip");
        c.offset();
        c.height();
        "" == $("#txtZip").val() && (keyvalueOld = "");
        keysearch(a);
    });
	   $(document).click(function(){
		if($(".city-box").hasClass("show_head")){
		$(".city-box").hide();
		}
	   })
	
	//var COOKIE_NAME = 'f_city';
	var DZ = {
		COOKIE_NAME:'f_city',//favorite city name
		default_id:101010100,//默认值
		default_name:'北京,北京,北京',//默认值
		weaJsonUrl:"http://d1.weather.com.cn/dingzhi/_id_.html",
		cookieDatas:[],
		_initCookieDatas:function(){
			$('.w_weather').empty();
			var cookieCity = cookieMaker(DZ.COOKIE_NAME);
			DZ.cookieDatas = [];
			// var id;
			// var addr;
			if (!cookieCity) {
				//没有cookie 开始ip定位
				$.ajax({
					type:"get",
					dataType:"script",
					url:"http://wgeo.weather.com.cn/ip/",
					success:function(){
						var cityInfo = {
							cityName:addr.split(',').pop(),
							cityId:id,
							cityCusName:''
						}
						DZ.cookieDatas.push(cityInfo)
						DZ._goWeaDatas();
						var strCookie = cityInfo.cityName+'|'+cityInfo.cityId+'|'+cityInfo.cityCusName
						cookieMaker(DZ.COOKIE_NAME,strCookie,{expires: 999, path: '/', domain: 'weather.com.cn'});
					}
				})
			}else{
				//读取cookie中城市数据，并初始化到cookieDatas
				var cookieArr = cookieCity.split(',');
				for (var i = 0,len = cookieArr.length; i < len; i++) {
					var cookieCityArr = cookieArr[i].split('|');
					DZ.cookieDatas.unshift({
						cityName:cookieCityArr[0],
						cityId:cookieCityArr[1],
						cityCusName:cookieCityArr[2]
					})
				};
				DZ._goWeaDatas();
			};

			$('.w_weather .delete').live("click",function(){
				var cityId = $(this).parents('li').attr('data-n');
				DZ._remove(cityId);
				DZ._goWeaDatas();
			})
		},
		_remove:function(cityId){
			var arrCookies = [];
			for (var i = DZ.cookieDatas.length - 1; i >= 0; i--) {			
				var d = DZ.cookieDatas[i];
				if (d.cityId == cityId) {
					DZ.cookieDatas.splice(i,1);
				}else{
					arrCookies.push(d.cityName+'|'+d.cityId+'|'+d.cityCusName);
				};
			};
			cookieMaker(DZ.COOKIE_NAME,arrCookies.join(','),{expires: 999, path: '/', domain: 'weather.com.cn'});
		},
		_goWeaDatas:function(){
			var point = DZ.cookieDatas.length-1;
			function gets(){
				var d = DZ.cookieDatas[point];
				$.ajax({
					type:'get',
					dataType:'script',
					url:DZ.weaJsonUrl.replace('_id_',d.cityId),
					success:function(){
						var city = eval("cityDZ"+d.cityId).weatherinfo;
						var weaDatas = {
							id:city.city,
							name:city.cityname,
							tem1:city.temp,
							tem2:city.tempn,
							txt:city.weather,
							icon1:city.weathercode,
							icon2:city.weathercoden,
							wind:city.wd,
							windl:city.ws,
							alarms:eval("alarmDZ"+d.cityId).w
						}
						var moreClass = DZ.cookieDatas.length>1 && "dz_right" || "";
						if (point==DZ.cookieDatas.length-1) {
							DZ._setDomHeadCity(weaDatas,moreClass);
						}else{
							DZ._setDomMoreCity(weaDatas);
						};
						if(point--){
							gets();
						}else{
							$('.w_weather ul').append('<li class="add"> <a href="http://www.weather.com.cn/profile/city.shtml"  target="_self">+</a> </li>');
						}
					}
				})
			}gets()
		},
		_setDomHeadCity:function(d,moreClass){
			var str = '<a href="http://www.weather.com.cn/weather1d/'+d.id+'.shtml#dingzhi_first" target="_self" title="'+d.txt+'"><span class="city_name"><em>'+d.name+'</em></span> <big class="icon '+d.icon1+' fl"></big> <big class="icon '+d.icon2+' fl"></big> <em class="fl s">'+d.tem1+'/'+d.tem2+'</em> </a>';
			if (d.alarms.length) {
				str += '<a class="fl w_yj" href="http://www.weather.com.cn/alarm/newalarmlist.shtml?areaId='+d.id+'"></a>';
			};
			str += '<a class="add fl '+moreClass+'" href="http://www.weather.com.cn/profile/city.shtml" target="_self">+</a>';
			str +='<ul class="more" style="display: none;"></ul>'
			$('.w_weather').empty().html(str);
			
			
		},
		_setDomMoreCity:function(d){
			var alarm = '';
			if (d.alarms.length) {
				alarm = '<em class="w_yj"></em>';
			};
			$('.w_weather ul').append('<li data-n="'+d.id+'"><a title="'+d.txt+'" target="_self" href="http://www.weather.com.cn/weather1d/'+d.id+'.shtml#dingzhi_more" class="clearfix"><span>'+d.name+'</span><big class="'+d.icon1+' ic"></big><big class="'+d.icon2+' ic"></big><em>'+d.tem1+'/'+d.tem2+'</em></a><b class="delete"></b></li>')

			var $w_weather = $('.w_weather');
			//地名 hover滚动效果
			var $city_name = $w_weather.find('.city_name');
			var $city_name_em = $city_name.children('em');
			var city_name_width = $city_name.width();
			var city_name_em_width = $city_name_em.width();
			if(city_name_em_width>city_name_width){
				$city_name_em.hover(function(){
					$(this).stop(true).animate({'left':'-'+(city_name_em_width-city_name_width)+'px'},"slow")
				},function(){
					$(this).css("left",'0px')
				})
			}
			var $more = $w_weather.find('.more');
			makeClass($more)
			var $dz_right = $w_weather.find('a.dz_right')
			makeClass($dz_right)
			function makeClass($obj){
				$obj.live("mouseover mouseout",function(e){
					if (e.type == "mouseover") {
						$more.show();
						$dz_right.addClass('dz_down');
					}else{
						$more.hide();
						$dz_right.removeClass('dz_down');
					};
				})
			}
		}

	}
	DZ._initCookieDatas();
	
	function initDzCity(){
		DZ._initCookieDatas();
	}
	var Event = require('../m_event');
	var dzEvent = (W.data || (W.data = {}))['event.dz_city'] = new Event();
	dzEvent.on('modify',DZ._initCookieDatas);//保证事件让外部可调用
	
	
	function cookieMaker(name, value, options) {
		if (typeof value != 'undefined') { // name and value given, set cookie
			options = options || {};
			if (value === null) {
				value = '';
				options.expires = -1;
			}
			var expires = '';
			if (options.expires && (typeof options.expires == 'number' || options.expires.toUTCString)) {
				var date;
				if (typeof options.expires == 'number') {
					date = new Date();
					date.setTime(date.getTime() + (options.expires * 24 * 60 * 60 * 1000));
				} else {
					date = options.expires;
				}
				expires = '; expires=' + date.toUTCString(); // use expires attribute, max-age is not supported by IE
			}
			var path = options.path ? '; path=' + options.path : '';
			var domain = options.domain ? '; domain=' + options.domain : '';
			var secure = options.secure ? '; secure' : '';
			document.cookie = [name, '=', encodeURIComponent(value), expires, path, domain, secure].join('');
		} else { // only name given, get cookie
			var cookieValue = null;
			if (document.cookie && document.cookie != '') {
				var cookies = document.cookie.split(';');
				for (var i = 0; i < cookies.length; i++) {
					var cookie = jQuery.trim(cookies[i]);
					// Does this cookie string begin with the name we want?
					if (cookie.substring(0, name.length + 1) == (name + '=')) {
						cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
						break;
					}
				}
			}
			return cookieValue;
		}
	};
	
	
})


 function readData(a, c) {
    keyvalueOld = a;
    $.ajax({
        type:"GET",
        url:"http://toy1.weather.com.cn/search?cityname=" + a + "",
        dataType:"jsonp",
        requestCount:++requestCount,
        jsonp:"callback",
        jsonpCallback:"success_jsonpCallback",
        timeout:3e3,
        async:!1,
        success:function(e) {
            requestCount === this.requestCount && (0 == c && ("" == e ? ($("#show ul").html("<span style='color:#f00;'>对不起，未找到您查询的城市天气!</a></span>"), 
            $("#show").show()) :displayData(a, e)), 1 == c && ("" == e ? window.location = "http://www.weather.com.cn/forecast/index.shtml#input" :(displayData(a, e), 
            areaid = $("#show li.select").attr("num"), regEn.test(areaid) && (window.location = "http://www.weather.com.cn/html/province/" + areaid + ".shtml#input"), 
            regNum.test(areaid) && (window.location = "http://www.weather.com.cn/weather1d/" + areaid + ".shtml#input"))));
        },
        error:function() {
            1 == c && (window.location = "http://www.weather.com.cn/weather1d/" + areaid + ".shtml#input");
        }
    });
}

function displayData(a, c) {
    var e = [];
    $.each(c, function(a, b) {
        e[a] = b.ref.split("~");
    });
    var h = e.sort(by("0")), g = "", f = "";
    regNum.test(a) && $.each(h, function(j, b) {
        var d = b[2] + "-" + b[9], c = RegExp(a, "ig");
        c.test(b[6]) && (d += "-" + b[6]);
        c.test(b[7]) && (d += "-" + b[7]);
        d = d.replace(c, "<b>" + a + "</b>");
        0 == j && (f += '<li class="select" num=' + b[0] + ">" + d + "</li>");
        12 > j && 0 < j && (f += '<li class="unselect" num=' + b[0] + ">" + d + "</li>");
        if (11 == j) return !1;
    });
    regEn.test(a) && $.each(h, function(j, b) {
        var d = "" != b[9] ? b[2] + "-" + b[9] :b[2], c = RegExp(a, "ig");
        c.test(b[3]) && (d += "-" + b[3]);
        c.test(b[5]) && (d = b[2] + "-" + b[9] + "-" + b[5]);
        d = d.replace(c, "<b>" + a + "</b>");
        c.test(b[8]) && (d += "-<b>" + b[8].toUpperCase() + "</b>");
        0 == j && (f += '<li class="select" num=' + b[0] + ">" + d + "</li>");
        12 > j && 0 < j && (f += '<li class="unselect" num=' + b[0] + ">" + d + "</li>");
        if (11 == j) return !1;
    });
    regCn.test(a) && $.each(h, function(c, b) {
        var d = "" != b[9] ? b[2] + "-" + b[9] :b[2], e = RegExp(a, "ig"), e = RegExp(a, "ig"), d = d.replace(e, "<b>" + a + "</b>");
        0 == c && (f += '<li class="select" num=' + b[0] + ">" + d + "</li>");
        12 > c && 0 < c && (f += '<li class="unselect" num=' + b[0] + ">" + d + "</li>");
        if (11 == c) return !1;
    });
    $("#show ul").html(f);
    $("#show").show();
    $("#show li").mouseover(function() {
        $("#show li.select").removeClass("select").addClass("unselct");
        $(this).removeClass("unselect").addClass("select");
    }).mouseout(function() {
        $(this).removeClass("select").addClass("unselect");
    }).click(function() {
        var a = $("#show li.select").text(), a = a.split("-");
        g = $("#show li.select").attr("num");
        regEn.test(g) && (window.location = "http://www.weather.com.cn/html/province/" + g + ".shtml#input");
        regNum.test(g) && (window.location = "http://www.weather.com.cn/weather1d/" + g + ".shtml#input");
        1 < a.length && $("#txtZip").val(a[0]);
        hide();
    });
}

function hide() {
    $("#show").hide();
}

function keysearch(a) {
    38 == a.keyCode || 40 == a.keyCode || 13 == a.keyCode || 27 == a.keyCode || 9 == a.keyCode ? (40 == a.keyCode && ("" != $("#show li.select").next().text() ? $("#show li.select").removeClass("select").addClass("unselect").next().removeClass("unselect").addClass("select") :($("#show li.select").removeClass("select").addClass("unselect"), 
    $("#show li:first").removeClass("unselect").addClass("select"))), 38 == a.keyCode && ("" != $("#show li.select").prev().text() ? $("#show li.select").removeClass("select").addClass("unselect").prev().removeClass("unselect").addClass("select") :($("#show li.select").removeClass("select").addClass("unselect"), 
    $("#show li:last").removeClass("unselect").addClass("select"))), 13 == a.keyCode && (a = $("#show li.select").text(), 
    a = a.split("-"), areaid = $("#show li.select").attr("num"), regEn.test(areaid) && (window.location = "http://www.weather.com.cn/html/province/" + areaid + ".shtml#input"), 
    regNum.test(areaid) && (window.location = "http://www.weather.com.cn/weather1d/" + areaid + ".shtml#input"), 
    1 < a.length && $("#txtZip").val(a[0]), hide())) :0 == $("#txtZip").val().length && hide();
}
 
 function istrue(str){

	var reg=/^((?=[0-9]+[A])|[0-9]+(?=[0-9]))[a-z0-9]+$/ig;

	return reg.test(str);

	}