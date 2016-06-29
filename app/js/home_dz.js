define(function(require){
	require('jquery');
	require('j/tool/tool_raphael');
	require('j/tool/cookie');
	var COOKIE_NAME = 'dzwea';

	//读取cookie创建全局变量objCookie
	var cookieData = $_cookie(COOKIE_NAME)||'北京|101010100|alarm,work|uv,gm,ct';	
	var cd = cookieData.split('|');
	var objCookie = {
		cname : cd[0],
		cid :   cd[1],
		m:      cd[2],
		index:  cd[3]
	};

	// var objCookie = {cid:'101010100',cname:'北京',m:'alarm,work',index:'uv,gm,ct'}
	var $dz = $('#dz'),
		$dzCname = $dz.find('#dz-cname'),
		$dzCnameSpan = $dzCname.children('span'),
		$dzSk = $dz.find('#dz-sk'),
		$dzH1 = $dz.find('h1'),
		$dzAlarm = $dz.find('#dz-alarm'),
		// $dzTime = $dz.find('#dz-time'),
		// $dzTem = $dz.find('#dz-tem'),
		// $dzAqi = $dz.find('#dz-aqi'),
		// $dzDetail = $dz.find('#dz-detail'),
		$dzSet = $dz.find('#dz-set'),
		$dzWork = $dz.find('#dz-work'),
		$dzTag= $dz.find('#dz-tag'),
		$dzFo24h= $dz.find('#dz-fo24h'),
		$dzFo3d= $dz.find('#dz-fo3d'),
		$dzLocal = $dz.find('.local')

	var $dzPop = $('#dzpop');

	var $dzsearch = $('#dzsearch'),
		$dzsearchResult = $dzsearch.find('#dzsearch-result'),
		$dzsearchCon = $dzsearch.find('.con'),
		$dzsearchClose = $dzsearch.find('.close'),
		$dzsearchInput = $dzsearch.find('.txt'),
		$dzsearchBtn = $dzsearch.find('.btn')

	//=====主体界面=========================
	$dzSet.live('click',function() {
		$dzPop.stop(true,true).animate({right:0},600);
	});
	$dzLocal.live('click',function() {
		$dzsearch.fadeIn();
		$dzsearchCon.animate({top: '30%'},500);
	});

	//=====搜索弹出框=========================
	//搜索到的城市点击-切换城市
	$dzsearchResult.find('li').live('click', function() {
		$this = $(this);
		objCookie.cname = $this.data('cname');
		objCookie.cid = $this.data('cid');
		$dzsearchClose.click();
		$dzsearchResult.hide();
		initObjCookie();
	});
	//确定按钮
	$dzsearchBtn.click(function() {
		$dzsearchResult.find('li:first').click();
	});
	//关闭搜索框
	$dzsearchClose.click(function() {
		$dzsearch.fadeOut();
		$dzsearchCon.animate({top: '-180px'},500);
	});
	//input获得焦点
	$dzsearchInput.keyup(function(e) {
		$dzsearchResult.show();
		search($(this).val())
	});
	//
	$dzsearch.find('.cbg').click(function() {
		$dzsearchResult.hide();
	});

	//=====管理面板=========================
	//点击打勾选中效果
	var $select = $dzPop.find('.dzalert').click(function(event) {
		var $i = $(this).find('[data-id=select]')
		if($i.hasClass('selecton')){
			$i.removeClass('selecton');
		}else{
			$i.addClass('selecton');
		}
	});
	//三选一约束
	var $c3to1 = $dzPop.find('.c3to1').click(function() {
		$c3to1.find('[data-id=select]').removeClass('selecton');
		$(this).find('[data-id=select]').addClass('selecton');
	});
	//选择3个指数约束
	var objIndexs = {'3':'您已经选满3个指数','2':'请再选择1个指数','1':'请再选择2个指数','0':'请选择您感兴趣的3个指数'}
	var $dzPopText = $dzPop.find('#dzpop-text');
	var $indexUl = $dzPop.find('#dzpop-index');
	$indexUl.find('li').click(function() {
		var len = $indexUl.find('.on').length;
		if (len<3) {
			if($(this).hasClass('on')){
				$(this).removeClass('on');
				$dzPopText.text(objIndexs[len-1]);
			}else{
				$(this).addClass('on');
				$dzPopText.text(objIndexs[len+1]);
			}
		}else{
			if($(this).hasClass('on')){
				$(this).removeClass('on');
				$dzPopText.text(objIndexs[len-1]);
			}
		};		
	})
	//24小时预报在控制面板的显示效果  静态
	var data = ["-2", "2", "0", "-3", "-5", "-7", "-8", "-7" ]
	drawLine('wealine',data);
	//点击保存
	$('#dzpop-save').click(function() {
		var $index = $indexUl.find('.on');
		if ($index.length!=3) {
			alert(objIndexs[$index.length])
		}else{
			var arr = [];
			$.each($dzPop.find('.selecton'),function(i,v) {
				arr.push($(v).data('name'))
			});
			var arr1 = [];
			$.each($index,function(i,v) {
				arr1.push($(v).data('ind'));
			});
			//更新全局变量 objCookie
			objCookie.m = arr.join(',');
			objCookie.index = arr1.slice(0,3).join(',');
			$dzPop.stop(true,true).animate({right:'-400px'},600);
		};
		//保存cookie之后，再重置界面
		initObjCookie()
	});
	//关闭管理面板
	$dzPop.find('#dzpop-close').click(function() {
		$dzPop.stop(true,true).animate({right:'-400px'},600);
	});
	//读取objCookie数据，重置界面
	initObjCookie()
	//============函数层========================
	function initObjCookie(){
		$dzFo3d.hide();
		$dzWork.hide();
		$dzFo24h.hide();
		$dzAlarm.hide();
		//主页显示部分
		$.each(objCookie.m.split(','),function(i, v) {//alarm,work 选择显示的模块
			//主页显示部分
			// $dz.find('.'+v).show();
			//控制面板
			$dzPop.find('[data-name='+v+']').addClass('selecton');
		});
		$.each(objCookie.index.split(','),function(i, v) {//uv,gm,ct 指数
			$indexUl.find('.'+v).addClass('on');
		});
		//保存新cookie
		$_cookie(COOKIE_NAME,objCookie.cname+'|'+objCookie.cid+'|'+objCookie.m+'|'+objCookie.index,{expires: 999, path: '/', domain: 'weather.com.cn'});
		//更新天气数据
		updateWea()
	}
	  
	function search(txt){
		$.ajax({
			url: 'http://toy1.weather.com.cn/search?cityname='+txt,
			type: 'GET',
			dataType: 'jsonp',
			success:function(arr){
				var strLi = '<ul>';
				$.each(arr,function(i,v) {
					var a = v.ref.split('~');
					if(/^101/.test(a[0]) && !/A/.test(a[0])){
						strLi += '<li data-cid="'+a[0]+'" data-cname="'+a[2]+'">'+a[2]+'-'+a[9]+'-'+a[5]+'</li>'
					}
				});
				strLi += '</ul>'
				$dzsearchResult.html(strLi);
			}
		})
	}
	function updateWea(){
		$dzH1.html('<a id="dz-cname" href="http://www.weather.com.cn/weather1d/'+objCookie.cid+'.shtml" class="dcity"><span>'+objCookie.cname+'</span></a><i class="local"></i><em id="dz-set" class="set"><i></i></em>');
		//实况
		$.ajax({
			url: 'http://d1.weather.com.cn/sk_2d/'+objCookie.cid+'.html',
			type: 'GET',
			dataType: 'script',
			success:function(){
				var levelNum = dataSK.aqi; 
				var levelTxt = levelNum<=50 && "优" || levelNum<=100 && "良" || levelNum<=150 && "轻度污染" || levelNum<=200 && "中度污染" || levelNum<=300 && "重度污染" || levelNum>300 && "严重污染" || "";
				var temp = '<em id="dz-time" class="time">'+dataSK.time+'实况</em>'+
							'<div id="dz-tem" class="tem">'+
								'<span>'+dataSK.temp+'</span><em>℃</em>'+
							'</div>'+
							(levelNum && 
							'<div id="dz-aqi" class="aqi">'+
								'<p>'+levelNum+'</p><p>'+levelTxt+'</p>'+
							'</div>' || '')+
							'<div id="dz-detail" class="detail '+(dataSK.rain!="0" &&dataSK.rain!="暂无实况"&& 'p3' || '')+'">'+
								'<p class="wind"><i class="'+dataSK.wde+'"></i><span>'+dataSK.WD+'  '+dataSK.WS+'</span></p><p class="hum"><i></i><span>湿度  '+dataSK.SD+'</span></p>'+
								(dataSK.rain!="0" && dataSK.rain!="暂无实况" && ('<p class="rain"><i></i><span>整点降水  '+dataSK.rain+'mm</span></p>') || '')+
							'</div>';
				$dzSk.html(temp);
			}
		})
		//定制的指数
		$.ajax({
			url: 'http://d1.weather.com.cn/zs_index/'+objCookie.cid+'.html',
			type: 'GET',
			dataType: 'script',
			success:function(){
				var d = dataZS.zs;
				
				var temp = "";
				var arrIndexs = objCookie.index.split(',');
				for (var i = 0; i < 3; i++) {
					
					temp += '<li class="'+arrIndexs[i]+'">'+
								'<h1>'+d[arrIndexs[i]+'_name']+'</h1>'+
								'<p>'+
									'<i></i>'+
									'<span>'+d[arrIndexs[i]+'_hint']+'</span>'+
								'</p>'+
							'</li>';
				};
				$dzTag.html(temp);
			}
		})
		//定制功能，展示
		$.each(objCookie.m.split(','),function(i,v) {
			switch(v){
				case 'work': setSxb();break;
				case 'fo3d': setFo3d();break;
				case 'fo24h': setFo24h();break;
				case 'alarm': setAlarm();break;
			}
		});
		//3天预报
		function setFo3d(){
			$dzFo3d.show();
			$.ajax({
				url: 'http://d1.weather.com.cn/fc_3d_dz/'+objCookie.cid+'.htm',
				// url: 'http://d1.weather.com.cn/fc_3d_dz/'+101010100+'.htm',
				type: 'GET',
				dataType: 'jsonp',
				jsonpCallback:'fc3day',
				success:function(arr){
					var strLi = '';
					for (var i = 0; i < 3; i++) {
						var d = arr[i];
						strLi += '<li>'+
									'<h2>'+d.date+'</h2>'+
									'<div class="icon">'+
										'<big class="blue22 '+d.icon.split('/')[0]+'"></big>'+
										'<big class="blue22 '+d.icon.split('/')[1]+'"></big>'+
									'</div>'+
									'<div class="wea">'+d.weather+'</div>'+
									'<div class="tem">'+
										'<span>'+d.temp.split('/')[0]+'℃ /</span>'+
										'<em>'+d.temp.split('/')[1]+'℃</em>'+
									'</div>'+
								'</li>';
					};
					$dzFo3d.html(strLi);
				}
			})
		}
		//24小时详细预报
		function setFo24h(){
			$dzFo24h.show();
			$.ajax({
				url: 'http://d1.weather.com.cn/fc_3h_dz/'+objCookie.cid+'.html',
				// url: 'http://d1.weather.com.cn/fc_3h_dz/'+101010100+'.html',
				type: 'GET',
				dataType: 'jsonp',
				jsonpCallback:'dynamic3h',
				success:function(arr){
					var arrTem = [];
					var strWea = '<ul class="wea clearfix">';
					var strTime = '<ul class="time clearfix">';
					for (var i = 0; i < 8; i++) {
						var d = arr[i];

						arrTem.push(d.k6);
						strWea += '<li><big class="blue22 '+d.k3+'"></big></li>';
						strTime += '<li>'+d.k+'时</li>'
					};
					strWea += '</ul>';
					strTime += '</ul>';
					$dzFo24h.html(strWea+'<div id="dz-wealine" class="wealine"></div>'+strTime)
					drawLine('dz-wealine',arrTem);
				}
			})
		}
		//上下班
		function setSxb(){
			$.ajax({
				url: 'http://d1.weather.com.cn/sxb/'+objCookie.cid+'.htm',
				type: 'GET',
				dataType: 'script',
				success:function(){
					//set上下班天气数据
					$dzWork.show();
					var strLi = '';
					for (var i = 2; i > 0; i--) {
						var imgSrc = 'http://i.tq121.com.cn/i/weather2014/png/blue_30/';
						var st = i==1?'back':'go';
						var goBack = i==1?'下班':'上班';
						
						if (goBackWork[st+'_img1']==goBackWork[st+'_img2']) {
							var strImg = '<big class="blue22 '+goBackWork[st+'_img1']+'"></big>';
						}else{
							var strImg = '<big class="blue22 '+goBackWork[st+'_img1']+'"></big>'+'<big class="blue22 '+goBackWork[st+'_img2']+'"></big>';
						}
						if(goBackWork[st+'_tem1'] == goBackWork[st+'_tem2']){
							var strTem = '<span>'+goBackWork[st+'_tem1']+'℃</span>'
						}else{
							var strTem = '<span>'+goBackWork[st+'_tem1']+'℃ /</span><em>'+goBackWork[st+'_tem2']+'℃</em>'
						}
						if(goBackWork[st+'_win1'] == goBackWork[st+'_win2']){
							var strWin = goBackWork[st+'_win1'];
						}else{
							var strWin = goBackWork[st+'_win1']+"转"+goBackWork[st+'_win2'];
						}
						if(strWin=='微风') var strWin = '小于3级'

						strLi += '<li class="clearfix">'+
									'<h1>'+goBack+'</h1>'+
									'<div class="img">'+
										strImg+
									'</div>'+
									'<p class="tem">'+
										strTem+
									'</p>'+
									'<b>风力：'+strWin+'</b>'+
								'</li>';
					};
					$dzWork.html(strLi);
				}
			})
		}
		function setAlarm(){
			//预警数据
			$.getScript('http://d1.weather.com.cn/dingzhi/'+objCookie.cid+'.html',function(){
				var alarms = eval('alarmDZ'+objCookie.cid).w;
				// var alarms =[{"w1":"河南省","w2":"驻马店市","w3":"","w4":12,"w5":"大雾","w6":"03","w7":"橙色","w8":"2016-01-05 16:00","w9":"驻马店市气象台2016年1月5日16时00分继续发布大雾橙色预警信号：今天夜里到明天上午我市大部分县区将继续出现能见度小于200米的大雾，请注意防范。","w10":"201601051539572900大雾橙色","w11":"1011816-20160105160000-1203.html"},{"w1":"河南省","w2":"","w3":"","w4":13,"w5":"霾","w6":"02","w7":"黄色","w8":"2016-01-06 09:36","w9":"河南省气象台01月06日09时30分继续发布霾黄色预警信号:预计未来24小时，焦作、三门峡、洛阳、郑州、平顶山五地区及巩义、汝州大部分地区有中度霾，请注意防范。","w10":"201601060934570831霾黄色","w11":"10118-20160106093600-1302.html"}]
				if (alarms.length) {
					var temp = '';
					$.each(alarms,function(i,v) {
						 ;
						temp +=	'<a target="_blank" href="http://www.weather.com.cn/alarm/newalarmcontent.shtml?file='+v.w11+'">'+
									'<i></i>'+
									'<span>'+v.w1+v.w2+v.w3+'发布'+v.w5+v.w7+'预警</span>'+
								'</a>'
					});
					$dzAlarm.html(temp).show();
					var index = 0;
					var len = alarms.length;
					function _circle(){
						$dzAlarm.find('a').eq(index).fadeIn().siblings().hide();
						index++;
						if (index == len) {
							index = 0;
						}
					}_circle();
					var alarmInterval = setInterval(_circle,4000);
					$dzAlarm.hover(function() {
						clearInterval(alarmInterval)
					}, function() {
						alarmInterval = setInterval(_circle,4000);
					});
				};

			})
		}
	}
	
	//画曲线
	function drawLine(contain,data){
		//曲线计算公式
		function getAnchors(p1x, p1y, p2x, p2y, p3x, p3y) {
			var l1 = (p2x - p1x) / 2,
				l2 = (p3x - p2x) / 2,
				a = Math.atan((p2x - p1x) / Math.abs(p2y - p1y)),
				b = Math.atan((p3x - p2x) / Math.abs(p2y - p3y));
			a = p1y < p2y ? Math.PI - a : a;
			b = p3y < p2y ? Math.PI - b : b;
			var alpha = Math.PI / 2 - ((a + b) % (Math.PI * 2)) / 2,
				dx1 = l1 * Math.sin(alpha + a),
				dy1 = l1 * Math.cos(alpha + a),
				dx2 = l2 * Math.sin(alpha + b),
				dy2 = l2 * Math.cos(alpha + b);
			return {
				x1: p2x - dx1,
				y1: p2y + dy1,
				x2: p2x + dx2,
				y2: p2y + dy2
			};
		}
		
		//init datas
		$('#'+contain).empty();
		// Draw
		var width = 300,
			height = 100,
			leftgutter = 0,
			bottomgutter = 20,
			topgutter = 18,
			colorhue = Math.random(),
			color = "#88d0f7",
			r = Raphael(contain, width, height),
			txt = {font: '12px Helvetica, Arial', fill: "#333"};
			var blanket = r.set();
		//画底线
		var DR = {
			dots:[[],[],[],[]],
			rects:[],
			lineNum:0,
			Max:0,
			Min:0,
			_getMaxMin:function(){
				this.Max = Math.max.apply(Math, data);
				this.Min = Math.min.apply(Math, data);
			},
			_setLine:function (data,color,strokeDash){
				//set Dom
				// var $wealine = $("#wealine");
				// var $x = $wealine.find('.x');
				// var $y = $wealine.find('.y');
				//
				var dataLen = data.length;
				var p = [],bgpp;
				this._getMaxMin();
				//单元格宽 两个点之间的距离
				var X = (width - leftgutter) / dataLen;
				var CN = this.Max-this.Min;
				var cheight = height - bottomgutter - topgutter;
				//Y值一个单位的相对px值
				var Y = cheight / CN;
				var path = r.path().attr({stroke: color, "stroke-width": 2, "stroke-linejoin": "round","opacity":"0.8","stroke-dasharray":strokeDash});
				var bgp = r.path().attr({stroke: "none", opacity: .3, fill: color});
				//横坐标
				// for (var i = 0, len = dataLen; i < len; i++) {
				// 	var x = Math.round(leftgutter + X * (i + .5));
					
				// 	//横坐标 -> 日期	
				// 	$x.append('<span style="width:'+(X)+'px">'+(i+1)+'</span>').css('left',22+X+'px');
				// }
				//画曲线
				
				for (var i = 0, len = dataLen; i < len; i++) {
					if (!data[i]) {
						var y = -100,
							x = -100;
					}else{
						var y = Math.round(height - bottomgutter- Y * (data[i]-DR.Min)),
							x = Math.round(leftgutter + X * (i + .5));
					};
					var dot = r.circle(x, y, 2).attr({fill:"#148fd0" , stroke: "#148fd0", "stroke-width": 1,title:data[i]});
					var text = r.text(x,y-10,data[i]+'℃').attr({fill:'#666'})
					DR.dots[DR.lineNum].push(dot);
					
					if (!p.length && data[i]) {
						p = ["M", x, y, "C", x, y];
						bgpp = ["M", leftgutter + X * .5, height, "L", x, y, "C", x, y];
					}
					if (data[i] && i && i < len - 1) {
						var Y0 = Math.round(height - bottomgutter - Y * data[i - 1]),
							X0 = Math.round(leftgutter + X * (i - .5)),
							Y2 = Math.round(height - bottomgutter - Y * data[i + 1]),
							X2 = Math.round(leftgutter + X * (i + 1.5));
						var a = getAnchors(X0, Y0, x, y, X2, Y2);
						// r.circle(a.x1, a.y1, 5).attr('fill','red');
						// r.circle(a.x2, a.y2, 5).attr('fill','red');
						p = p.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
						bgpp = bgpp.concat([a.x1, a.y1, x, y, a.x2, a.y2]);
					}				
				}	
				p = p.concat([x, y, x, y]);	
				bgpp = bgpp.concat([x, y, x, y, "L", x, height, "z"]);
				path.attr({path: p});
				bgp.attr({path: bgpp});
			},
			_init:function(){
				this._setLine(data,color);
			}
		}
		DR._init();	
	}
		
})