define(function(require){
	require('jquery');
	//页面默认执行
	var fxClass = {"西南风":"SW","东南风":"SE","西北风":"NW","东北风":"NE","东风":"E","西风":"W","南风":"S","北风":"N"}
	var cityId = location.href.match(/\d{9}/)[0];
	var skUrl = 'http://d1.weather.com.cn/sk_2d/'+cityId+'.html';
	var alarmDataUrl = "http://d1.weather.com.cn/dingzhi/_id_.html";
	
	$.ajax({
		type:'GET',
		url:skUrl,
		dataType:'script',
		success:function(){
			var $sk = $('#today .sk');
			if(dataSK && dataSK.temp!="暂无实况"){
				var str = "";
				str += dataSK.time && '<p class="time"><span>'+dataSK.time+' 实况</span></p>' || '';
				str += dataSK.sd && '<div class="zs h"><i></i><span>相对湿度</span><em>'+dataSK.sd+'</em></div>' || '';
				str += dataSK.WD && '<div class="zs w"><i></i><span>'+dataSK.WD+'</span><em>'+dataSK.WS+'</em></div>' || '';
				//温度
				if(dataSK.temp){
					var tem = Number(dataSK.temp);
					str += '<div class="tem"><span>'+tem+'</span><em>℃</em></div></p>';
					var height = (tem+50)*(20/25);
					str += '<div class="therm"><p><i class="t"></i><i class="c" style="height:'+height+'px"></i></p></div>'
				}
				var levelNum = dataSK.aqi;
				if(levelNum){
					var levelColor = levelNum<=50 && "#44cf12" || levelNum<=100 && '#eec50b' || levelNum<=150 && "#f6b42c" || levelNum<=200 && "#fa5535" || levelNum<=300 && "#e31b40" || levelNum>300 && "#8e0636" || "#fff";
					var levelTxt = levelNum<=50 && "优" || levelNum<=100 && "良" || levelNum<=150 && "轻度污染" || levelNum<=200 && "中度污染" || levelNum<=300 && "重度污染" || levelNum>300 && "严重污染" || "";
					str += '<div class="zs pol"><i></i><span><a style="color:'+levelColor+'" href="http://www.weather.com.cn/air/?city='+dataSK.city+'" target="_blank">'+levelNum+levelTxt+'</a></span></div>';
				}
				$sk.append(str);
			}else{
				$('.sk').css('background','url("http://i.tq121.com.cn/i/weather2014/city/zw.jpg") no-repeat scroll center center').empty();
			}
		}
	})

	//加载城市信息地址 实况预警
	$.getScript(alarmDataUrl.replace('_id_',cityId),function(){
		var arr = eval("alarmDZ"+cityId).w;
		var len = arr.length;
		if(len){
			var gradeObj={'01':'blue','02':'yellow','03':'orange','04':'red','91':'white'};
			var $item = $('<div class="sk_alarm"></div>');
			$.each(arr,function(i,d){
				// var alarmUrl = data.id.match(/\d{5}/)[0] != "10128" && 'http://www.weather.com.cn/alarm/newalarmcontent.shtml?file='+d.w11 || 'http://gd.weather.com.cn/zhyj/yjlb/index.shtml';
				var alarmUrl ='http://www.weather.com.cn/alarm/newalarmcontent.shtml?file='+d.w11;
				var color = '';
				if (d.w6=="00") {
					color = d.w7=="蓝色" && 'blue' ||d.w7=="黄色" && 'yellow' ||d.w7=="橙色" && 'orange' ||d.w7=="红色" && 'red' ||'';
				}else{
					color = gradeObj[d.w6];
				};
				$item.append('<a class="'+color+'" href="'+alarmUrl+'" target="_blank" title="'+d.w1+d.w2+d.w3+'气象台发布'+d.w5+d.w7+'预警">'+d.w5+'预警</a>');
			})
			var aA = $item.children('a');
			$item.appendTo($('#today .sk'));
			var index = 0;
			function _circle(){
				aA.eq(index).fadeIn().siblings().hide();
				index++;
				if (index == len) {
					index = 0;
				}
			}_circle();
			setInterval(_circle,4000);
		}
		
	})
	//逐小时预报曲线
	require('j/tool/raphael');
	var H = {
		_getArrMax:function(arr){
			return Math.max.apply(Math,arr) || null;
		},
		_getArrMin:function(arr){
			return Math.min.apply(Math,arr) || null;
		},
		len:0,
		arrTime:[],
		arrWeapic:[],
		arrWeaTxt:[],
		arrTem:[],
		arrWinf:[],
		arrWinl:[],
		_clearArr:function(){
			H.arrTime = [];
			H.arrWeapic=[];
			H.arrWeaTxt=[];
			H.arrTem=[];
			H.arrWinf=[];
			H.arrWinl=[];
			H.arrCircle = [];
		},
		_initWeaData:function(oneDayArr){//参数为  一天的数组
			H._clearArr();
			$.each(oneDayArr,function(i,v){
				var d = v.split(',');
				H.arrTime.push(d[0].substr(3));
				H.arrWeapic.push(d[1]);
				H.arrWeaTxt.push(d[2]);
				H.arrTem.push(parseInt(d[3]));
				H.arrWinf.push(d[4]);
				H.arrWinl.push(d[5]);
			})
			this.len = oneDayArr.length;
			
			//生成 svg的circle数据  和 path的线数据
			var temMin = H._getArrMin(H.arrTem);//求出这一组温度的最大最小值
			var temMax = H._getArrMax(H.arrTem);
			//temD 一摄氏度 = X像素高
			if(temMin != temMax){
				var temD = (this.svgH-20)/(temMax - temMin);
			}else{
				var temD = (this.svgH-20)/1;
			}
			this.cel_w = this.svgW/this.len;
			var arrPath = [];
			$.each(H.arrTem,function(i,v){
				var circleX = H.cel_w*i+H.cel_w/2;
				var circleY = (temMax-H.arrTem[i])*temD+9; 
				H.arrCircle.push({'x':circleX,'y':circleY});
				arrPath.push([circleX,circleY]);
				
			})
			this.svgPath = arrPath.join(',');
		},
		svgW:680,
		svgH:70,
		cel_w:0,
		svgPath:'',
		arrCircle:[]
	}
		
	var $F = $('#curve');
	var $time = $F.find('.time');
	var $weapic = $F.find('.wpic');
	var $winf = $F.find('.winf');
	var $winl = $F.find('.winl');
	var $tem = $F.find('.tem');
	
	var whichDay = '1d';
	H._initWeaData(hour3data[whichDay].slice(0,8));
	
	var paper = Raphael('biggt',H.svgW,H.svgH); 
	var line = paper.path('M10,20').attr({"stroke": "#f68227","stroke-width":2});
	var objCircle = [];  //存储点circle对象的 数组
	var originX = H.arrCircle[0].x;
	var originY = H.arrCircle[0].y;
	for(var i = 0; i<= H.len-1; i++){
		//时间
		$time.append($('<em style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px">'+H.arrTime[i]+'</em>'));
		//微风时特殊处理  上微风，下<3级
		var txt1 = H.arrWinf[i];
		var txt2 = H.arrWinl[i];
		if(txt2=="微风"){
			var txt1 = "微风";
			var txt2 = "<3级";	
		}
		//风向
		$winf.append($('<em style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px">'+txt1+'</em>').animate({'left':H.cel_w*i+'px'},'slow'));
		//风力
		$winl.append($('<em style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px">'+txt2+'</em>').animate({'left':H.cel_w*i+'px'},'slow'));
		//svg 点  
		var circleX = H.arrCircle[i].x;
		var circleY = H.arrCircle[i].y;
		
		objCircle.push(paper.circle(originX,originY,4).attr({'fill':'#f68227','stroke':'#f68227','cx':circleX,'cy':circleY}));
		//温度
		$tem.append($('<em style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px;top:'+(circleY+70)+'px">'+H.arrTem[i]+'℃</em>'));
		//天气图标
		//$weapic.append($('<div style="width:'+H.cel_w+'px;left:'+0+'px;top:'+(circleY+30)+'px"><big title="'+H.arrWeaTxt[i]+'" class="png40 '+H.arrWeapic[i]+'"></big></div>').animate({'left':H.cel_w*i+'px'},'slow'));
		$weapic.append($('<div style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px;top:'+(0+30)+'px"><big title="'+H.arrWeaTxt[i]+'" class="png40 '+H.arrWeapic[i]+'"></big></div>'));
	}
	line.attr({"path":"M"+H.svgPath});
	
	//整点实况曲线
	setAirData(observe24h_data);
	
	//生活指数
	var $live_li3 = $(".livezs .li3");
	var $live_li3_i = $live_li3.find('i');
	switch($live_li3.find('span').text()){
		case "舒适":$live_li3_i.addClass('v2');break;
		case "较舒适":$live_li3_i.addClass('v2');break;
		case "较冷":$live_li3_i.addClass('v2');break;
		case "冷":$live_li3_i.addClass('v3');break;
		case "寒冷":$live_li3_i.addClass('v3');break;
		//case "热":$live_li3_i.addClass('');break;
		//case "炎热":$live_li3_i.addClass('');break;
	}
})
function setAirData(observe24h_data){
	//主体
	var BHtml2= '<div class="tabs"><h2>整点天气实况</h2><p id="currHour"></p><p class="second"><b id="detailHour"></b></p><ul><li class="aqi_on on" data-role="air">空气质量</li><li class="p2" data-role="tem">温度</li><li class="sd" data-role="humidity">相对湿度</li><li class="js" data-role="rain">降水量</li><li class="fl" data-role="wind">风力风向</li></ul></div><div class="split"></div><div class="chart"><div id="hourHolder"><div class="xLabel"></div><div class="yLabel"></div><div class="result"></div><div class="showData"></div></div><em>(h)</em><b id="wd"></b> <b id="tem">℃</b> <b id="pm10">(μg/m³)</b> <b id="sd">(%)</b> <b id="js">(mm)</b> <b id="fl">(级)</b><p class="air detail">空气质量指数：简称AQI，是定量描述空气质量状况的无量纲指数。（数据由环保部提供）</p><p class="humidity">相对湿度：空气中实际水汽压与当时气温下的饱和水汽压之比，以百分比（%）表示。</p><p class="pm10 tem">温度：表示大气冷热程度的物理量，气象上给出的温度是指离地面1.5米高度上百叶箱中的空气温度。</p><p class="rain">降水量：某一时段内的未经蒸发、渗透、流失的降水，在水平面上积累的深度，以毫米（mm）为单位。 </p><p class="wind">风力风向：空气的水平运动，风力是风吹到物体上所表示出力量的大小，风向指风的来向。</p><div class="aqiColorExp clearfix"><span class="span1">优</span> <span class="span2">良</span> <span class="span3">轻度</span> <span class="span4">中度</span> <span class="span5">重度</span> <span class="span6">严重</span></div>';
	var $weatherChart = $('#weatherChart').html(BHtml2);

	//绘制表格
	//$('#hourHolder').html('<div class="xLabel"></div><div class="yLabel"></div><div class="result"></div><div class="showData"></div>');
	Raphael.fn.drawGrid = function(x, y, w, h, hv, color) {
		color = color || "#000";
		var path = ["M", Math.round(x) + .5, Math.round(y) + .5, "L", Math.round(x + w) + .5, Math.round(y) + .5],
			rowHeight = h / hv;
		for (var i = 1; i <= hv; i++) {
			path = path.concat(["M", Math.round(x) + .5, Math.round(y + i * rowHeight) + .5, "H", Math.round(x + w) + .5]);
			
		}
		return this.path(path.join(',')).attr({
			stroke: color,
			fill: "#fff"
		});
	};
	//多边形定义
	Raphael.fn.polygon = function(x, y, s) {
		var path = ["M", x, y, "L", x - s * Math.sin(15), y + Math.sin(15) * s * Math.sqrt(3), x, y - s * Math.sin(15) * 2, x + s * Math.sin(15), y + Math.sin(15) * s * Math.sqrt(3), "z"];
		return this.path(path.join(","));
	}

	var rowNum = 6,
		paper = null;
	//分析数据
	var isInvalid = function(val,isWind){
		//风数据为0是为不合法
		return val == '' || val == 'null' || isWind && val == 0;
	}
	var adjustData = {
		length: 0,
		date: [],
		air: [],
		tem:[],
		humidity: [],
		rain: [],
		rainSum: 0,
		windLevel: [],
		windAngle: [],
		windDirection: [],
		flagData: {
			air: {
				max: 0,
				min: 0
			},
			tem:{
				max: 0,
				min: 0
			},
			humidity: {
				max: 0,
				min: 0
			},
			rain: {
				max: 0,
				min: 0
			},
			wind: {
				max: 0,
				min: 0
			}
		},
		min: {
			air: 0,
			tem:0,
			humidity: 0,
			rain: 0,
			wind: 0
		},
		max: {
			air: 0,
			tem:0,
			humidity: 0,
			rain: 0,
			wind: 12
		},
		step: {
			air: 0,
			tem:1,
			humidity: 1,
			rain: 1,
			wind: 2
		},
		invalid: {
			air: [],
			tem: [],
			humidity: [],
			rain: [],
			wind: []
		},
		init: function(data) {
			//数据初始化
			var arr = data.od.od2;
			this.length = 25;
			for (var i = this.length-1; i >= 0; i--) {
				var d = arr[i];
				//时间
				this.date.push(d.od21); 
				//空气质量
				if (isInvalid(d.od28)){//空气质量无效数据
					this.invalid.air.push(i); //od28->0d27
				}
				this.air.push(d.od28);
				//温度
				if (isInvalid(d.od22)){
					this.invalid.tem.push(i); //温度无效数据
				}
				this.tem.push(d.od22); 
				//湿度
				if (isInvalid(d.od27)){
					this.invalid.humidity.push(i); //湿度无效数据
				}
				this.humidity.push(d.od27); 
				//降雨
				if (isInvalid(d.od26)){
					this.invalid.rain.push(i); //降雨无效数据
				}	
				this.rain.push(d.od26); 
				//风力
				if (isInvalid(d.od25,true)){
					this.invalid.wind.push(i); //风力无效数据
				}
				this.windLevel.push(d.od25); 
				this.windAngle.push(d.od23); //风向（角度）
				this.windDirection.push(d.od24); //风向（描述）
				this.rainSum += parseFloat(d.od26) || 0; //处理不合法数据NaN
			}
			//过滤不合法数据
			//zk modify,加默认值，防止"null"等不合法数据影响
			var formateNumArr = function(arr,defaultVal){
				var a = [];
				$.each(arr,function(i,v){
					if(!isNaN(v)){
						a.push(v);
					}else{
						a.push(defaultVal);
						arr[i] = '';//对不合法数据进行清空处理
					}
				});
				return a;
			}
			var MAX = adjustData.max,
				MIN = adjustData.min;
			var _getMin = function(arr){
				var n = 99;
				for (var i = 0; i < arr.length; i++) {
					if(arr[i] && Number(arr[i]) < n){
						n = arr[i];
					}
				};
				return n;
				// return Math.min.apply(Math,arr);
			}	
			// var _getMax = function(arr){
			// 	return Math.max.apply(Math,arr);
			// }
			function _getMax(arr){
				var n = -99;
				for (var i = 0; i < arr.length; i++) {
					if(arr[i] && Number(arr[i]) > n){
						n = arr[i];
					}
				};
				return n;
			}
			var _getFloor = function(val){
				return Math.floor(val);
			}
			var _getCeil = function(val){
				return Math.ceil(val);
			}
			var _flagData = adjustData.flagData;
			
			_flagData.air.min = _getMin( formateNumArr(adjustData.air,MIN.air)); //空气质量最小值
			_flagData.air.max = _getMax( formateNumArr(adjustData.air,MAX.air)); //空气质量最大值

			_flagData.tem.min = _getMin( formateNumArr(adjustData.tem,MIN.tem)); //温度最小值
			_flagData.tem.max = _getMax( formateNumArr(adjustData.tem,MAX.tem)); //温度最大值

			
			_flagData.rain.min = _getMin( formateNumArr(adjustData.rain,MIN.rain)); //降水量最小值
			_flagData.rain.max = _getMax( formateNumArr(adjustData.rain,MAX.rain)); //降水量最大值
			_flagData.humidity.min = _getMin( formateNumArr(adjustData.humidity,MIN.humidity)); //湿度最小值
			_flagData.humidity.max = _getMax( formateNumArr(adjustData.humidity,MAX.humidity)); //湿度量最大值
			_flagData.wind.min = _getMin( formateNumArr(adjustData.windLevel,MIN.wind)); //风力最小值
			_flagData.wind.max = _getMax( formateNumArr(adjustData.windLevel,MAX.wind)); //风力最大值

			adjustData.min.air = _getFloor(adjustData.flagData.air.min); //空气质量最小值
			adjustData.min.tem = _getFloor(adjustData.flagData.tem.min); //温度最小值
			adjustData.min.rain = _getFloor(adjustData.flagData.rain.min); //降水量最小值
			adjustData.min.humidity = _getFloor(adjustData.flagData.humidity.min); //湿度最小值

			adjustData.max.air = _getFloor(adjustData.flagData.air.max); //空气质量最大值
			adjustData.max.tem = _getFloor(adjustData.flagData.tem.max); //温度最大值
			adjustData.max.rain = _getCeil(adjustData.flagData.rain.max); //降水量最大值
			adjustData.max.humidity = _getCeil(adjustData.flagData.humidity.max); //湿度最大值

			//设置step
			adjustData.min.air = adjustData.min.air - adjustData.step.air;
			if (adjustData.min.humidity - adjustData.step.humidity >= 0)
				adjustData.min.humidity -= adjustData.step.humidity;
			if (adjustData.min.rain - adjustData.step.rain >= 0)
				adjustData.min.rain -= adjustData.step.rain;
			if (adjustData.min.tem - adjustData.step.tem >= 0)
				adjustData.min.tem -= adjustData.step.tem;
			
			if ((adjustData.max.air - adjustData.min.air) / rowNum > adjustData.step.air) {
				adjustData.step.air = _getCeil((adjustData.max.air - adjustData.min.air) / rowNum);
			}
			if ((adjustData.max.humidity - adjustData.min.humidity) / rowNum > adjustData.step.humidity) {
				adjustData.step.humidity = _getCeil((adjustData.max.humidity - adjustData.min.humidity) / rowNum);
			}
			if ((adjustData.max.rain - adjustData.min.rain) / rowNum > adjustData.step.rain) {
				adjustData.step.rain = _getCeil((adjustData.max.rain - adjustData.min.rain) / rowNum);
			}
			if ((adjustData.max.tem - adjustData.min.tem) / rowNum > adjustData.step.tem) {
				adjustData.step.tem = _getCeil((adjustData.max.tem - adjustData.min.tem) / rowNum);
			}
			adjustData.max.air = adjustData.min.air + adjustData.step.air * rowNum;
			adjustData.max.humidity = adjustData.min.humidity + adjustData.step.humidity * rowNum;
			adjustData.max.tem = adjustData.min.tem + adjustData.step.tem * rowNum;

			//设置湿度极大值为100%
			if (adjustData.max.humidity > 100) {
				adjustData.max.humidity = 100;
				adjustData.min.humidity = adjustData.max.humidity - adjustData.step.humidity * rowNum;
			}
			adjustData.max.rain = adjustData.min.rain + adjustData.step.rain * rowNum;
		}
	};
	adjustData.init(observe24h_data);
	
	var $split = $weatherChart.find('.split').append('<p class="air on">过去24小时AQI最高值: '+adjustData.flagData.air.max+'</p><p class="tem">最高气温: '+adjustData.flagData.tem.max+'℃ , 最低气温: '+adjustData.flagData.tem.min+'℃</p><p class="humidity">过去24小时最大相对湿度: '+adjustData.flagData.humidity.max+'%</p><p class="wind">过去24小时最大风力: '+adjustData.flagData.wind.max+'级</p><p class="rain">过去24小时总降水量：'+sum(adjustData.rain)+'mm</p>');
	function sum(arr){
		var sum = 0;
		for (var i = arr.length - 1; i >= 0; i--) {
			sum += Number(arr[i]);
		};
		return Math.floor(sum*10)/10;
	}
	
	var observe24hGraph = {
		width: 0,
		height: 0,
		leftgutter: 0,
		bottomgutter: 0,
		topgutter: 0,
		rightgutter: 0,
		rowNum: 0,
		colNum: 0,
		cellHeight: 0,
		cellWidth: 0,
		grid: null,
		rects: null,
		shap: null,
		path: null,
		pathStyle: {
			stroke: "#94c05a",
			"stroke-width": 2,
			"stroke-linejoin": "round"
		},
		init: function(obj) {
			var temp_Label = [];
			this.width = obj.width;
			this.height = obj.height;
			this.leftgutter = obj.leftgutter;
			this.bottomgutter = obj.bottomgutter;
			this.topgutter = obj.topgutter;
			this.rightgutter = obj.rightgutter;
			this.rowNum = obj.rowNum;
			this.colNum = obj.colNum;
			this.cellHeight = (this.height - this.topgutter - this.bottomgutter) / this.rowNum;
			this.cellWidth = (this.width - this.leftgutter - this.rightgutter) / this.colNum;
			paper = Raphael(obj.container, observe24hGraph.width, observe24hGraph.height);
			this.grid = paper.drawGrid(observe24hGraph.leftgutter, observe24hGraph.topgutter, observe24hGraph.width - observe24hGraph.leftgutter - observe24hGraph.rightgutter, observe24hGraph.height - observe24hGraph.topgutter - observe24hGraph.bottomgutter, observe24hGraph.rowNum, "#eee");
			this.rects = paper.set();
			this.shap = paper.set();
			//绘制柱状区域和横坐标
			
			for (var i = 0, ii = this.colNum; i < ii; i++) {
				//绘制柱状区域
				observe24hGraph.rects.push(paper.rect(observe24hGraph.leftgutter + observe24hGraph.cellWidth * i, observe24hGraph.topgutter, observe24hGraph.cellWidth, observe24hGraph.height - observe24hGraph.bottomgutter - observe24hGraph.topgutter).attr({
					stroke: "none",
					fill: "#fff",
					opacity: 0
				}));
				//绘制横坐标
				temp_Label.push("<span>" + obj.date[i] + "</span>");
			}
			$(".xLabel").html(temp_Label.join(""));
		},
		drawGraph: function(obj) {
			//绘制y坐标
			var temp_labels = [],
				step = obj.step,
				unit = obj.unit,
				max = obj.max,
				min = obj.min,
				cellWidth = this.cellWidth,
				cellHeight = this.cellHeight,
				topgutter = this.topgutter,
				leftgutter = this.leftgutter,
				height = this.height - topgutter - this.bottomgutter;
			for (var i = 0; i <= this.rowNum; i++) {
				temp_labels.unshift("<span>" + (min + i * step) + "</span>");
			}
			$(obj.container).html(temp_labels.join(""));
			//zk modify,不处理不合法数据
			if(obj.data.length == obj.invalid.length){
				return;
			}
			var leftgutter = this.leftgutter,
				cellWidth = this.cellWidth,
				r = obj.r || 0,
				y0 = this.height - this.bottomgutter;

			var $container = $(obj.dataContainer);
			
			switch (obj.shap) {
				case 'rect':
					var rectStyle = [];
					for (var i = 0, ii = this.colNum; i < ii; i++) {
						var x = Math.round(leftgutter + cellWidth * (i + .5)) + 0.5,
							y = Math.round(cellHeight * ((max - obj.data[i]) / step) + topgutter);

						var _stroke = '#fff'
							,_fill;
						if (unit =='') {

							if (obj.data[i] <= 50) {
								_fill = '#9dca80';
							} else if (obj.data[i] <= 100) {
								_fill = '#f7da64';
							} else if (obj.data[i] <= 150) {
								_fill = '#f29e39';
							} else if (obj.data[i] <= 200) {
								_fill = '#da555d';
							} else if (obj.data[i] <= 300) {
								_fill = '#b9377a';
							} else{
								_fill = '#881326';
							}
						}else{
							if (obj.data[i] < 10) {
								_fill = '#6600CC';
							} else if (obj.data[i] >= 10 && obj.data[i] <= 25) {
								_fill = '#0000FF';
							} else if (obj.data[i] > 25 && obj.data[i] <= 50) {
								_fill = '#008000';
							} else if (obj.data[i] > 50 && obj.data[i] <= 100) {
								_fill = '#FFCC00';
							} else if (obj.data[i] > 100 && obj.data[i] <= 250) {
								_fill = '#FF6600';
							} else if (obj.data[i] > 250) {
								_fill = '#FF0000';
							}
						}
						
						if(_stroke && _fill){
							rectStyle.push({
								stroke: _stroke,
								"stroke-width": 1,
								fill: _fill
							});
						}
						
						this.shap.push(paper.rect((x - cellWidth * 0.5)+4, y0, 13, 0).attr(rectStyle[i]));
						this.shap[i].animate({
							height: (height - y + topgutter),
							transform: ["t0," + (-y0 + y)]
						}, 500);
						//鼠标事件
						(function(i, x, y, d) {
							if (d != "" && d != 0) {
								var _show = function(){
									observe24hGraph.shap[i].attr({
										fill: "#076ea8"
									});
									if (unit =='') {
										$container.html(d + unit);
									}else{
										$container.html(d + unit);
									};
									
									var _width = $container.width();
									var _left = x + 10;
									if(_width + x > 660){
										_left = x - _width - 20;
									}
									$container.css({
										"top": y,
										"left": _left-2
									}).show();
								}
								var _hide = function(){
									observe24hGraph.shap[i].attr(rectStyle[i]);
									$container.hide();
								}
								observe24hGraph.rects[i].hover(_show, _hide)
								observe24hGraph.shap[i].hover(_show, _hide)
							}
						})(i, x, y, obj.data[i]);
					}
					break;
				default:
					var Style = [],
						crossLine = paper.path().attr({
							stroke: "#076ea8",
							"stroke-width": 1
						}),
						pathCount = obj.invalid.length + 1,
						initPath = new Array(pathCount),
						path = new Array(pathCount),
						pathIndex = 0;
						this.path = new Array(pathCount);

					for (var i = 0, ii = this.colNum; i < ii; i++) {
						var x = Math.round(leftgutter + cellWidth * (i + .5)) + 0.5,
							y = Math.round(cellHeight * ((max - obj.data[i]) / step) + topgutter),
							initY = Math.round(cellHeight * ((max - min) / step) + topgutter);

						if (obj.data[i] == "")
							pathIndex++;
						else {
							if (i == 0 || obj.data[i - 1] == "") {
								path[pathIndex] = ["M", x, y, "L", x, y];
								initPath[pathIndex] = ["M", x, initY, "L", x, initY];
							}
							if (i != 0 && obj.data[i + 1] != "" && obj.data[i - 1] != "") {
								var Y0 = Math.round(cellHeight * (max - obj.data[i - 1]) / step + topgutter),
									X0 = Math.round(leftgutter + cellWidth * (i - .5)),
									Y2 = Math.round(cellHeight * (max - obj.data[i + 1]) / step + topgutter),
									X2 = Math.round(leftgutter + cellWidth * (i + 1.5));
								path[pathIndex] = path[pathIndex].concat(X0, Y0, x, y, X2, Y2);
								initPath[pathIndex] = initPath[pathIndex].concat(X0, initY, x, initY, X2, initY);
							}

						}
						if (obj.shap == 'dot') {
							var _color;
							if (unit == "μg/m³" || unit =='') {
								
								if (obj.data[i] <= 50) {
									_color = '#6ac6ce';
								} else if (obj.data[i] <= 100) {
									_color = '#78ba60';
								} else if (obj.data[i] <= 150) {
									_color = '#f4b212';
								} else if (obj.data[i] <= 200) {
									_color = '#e24e31';
								} else if (obj.data[i] <= 300) {
									_color = '#ce1c5b';
								} else{
									_color = '#880b20';
								}
							}else if (unit == "℃") {
								if (obj.data[i] < 0) {
									_color = '#6600CC';
								} else if (obj.data[i] >= 0 && obj.data[i] <= 5) {
									_color = '#0000FF';
								} else if (obj.data[i] > 5 && obj.data[i] <= 10) {
									_color = '#00CCFF';
								} else if (obj.data[i] > 10 && obj.data[i] <= 15) {
									_color = '#008000';
								} else if (obj.data[i] > 15 && obj.data[i] <= 24) {
									_color = '#FFCC00';
								} else if (obj.data[i] > 24 && obj.data[i] <= 32) {
									_color = '#FF6600';
								} else if (obj.data[i] > 32) {
									_color = '#FF0000';
								}
							}else {
								if (obj.data[i] < 26) {
									_color = '#FF0000';// _color = '#6600CC'
								} else if (obj.data[i] >= 26 && obj.data[i] <= 51) {
									_color = '#FF6600';// _color = '#008000'
								} else if (obj.data[i] > 51 && obj.data[i] <= 75) {
									_color = '#008000';// _color = '#FF6600'
								} else if (obj.data[i] > 75) {
									_color = '#6600CC';// _color = '#FF0000'
								}
							}
							if(_color){
								Style.push({
									fill: _color,
									stroke: _color,
									"stroke-width": 1
								});
							}
							this.shap.push(paper.circle(x, y0, r).attr(Style[i]));
						} else {
							if (i == 0){
								Style.push({
									fill: "red",
									stroke: "#6600CC",
									"stroke-width": 1
								});
							}
							this.shap.push(paper.polygon(x, y0, r).attr(Style[0]));
						}
						if (obj.data[i] == "")
							this.shap[i].hide();
						if (obj.shap == 'dot') {
							this.shap[i].animate({
								cy: y
							}, 500).attr({
								cy: y
							});
						} else {
							this.shap[i].animate({
								transform: ["t0," + (-y0 + y) + "r" + (obj.angle[i]-180)]//处理角度
							}, 500);
						}
						//鼠标事件
						(function(i, x, y, d,desc) {
							var _show = function(){
								crossLine.attr({
									path: ["M", x, 0, "V", observe24hGraph.height-25, "M", 10, y + 0.5, "H", observe24hGraph.width]
								}).show();
								$container.html(desc+d + unit);
								var _width = $container.width();
								var _left = x + 10;
								if(_width + x > 660){
									_left = x - _width - 20;
								}
								$container.css({
									"top": y,
									"left": _left
								}).show();
							}
							var _hide = function(){
								crossLine.hide();
								$(obj.dataContainer).hide();
							}
							if (d != "") {
								observe24hGraph.rects[i].hover(_show, _hide)
							}
							observe24hGraph.shap[i].hover(_show, _hide)
						})(i, x, y, obj.data[i],obj.desc && obj.desc[i]||'');
					}
					for (var p = 0; p < pathCount; p++) {
						if(!initPath[p]){
							continue;
						}
						this.path[p] = paper.path(initPath[p]);
						this.path[p].attr(this.pathStyle).hide();
						this.path[p].animate({
							path: path[p]
						}, 470).show();
					}
					for (var d = 0, dd = this.colNum; d < dd; d++) {
						if(!this.shap[d]){
							continue;
						}
						this.shap[d].toFront();
					}
					break;
			}

		}
	}
	var dataConf = {
		"width": 630,
		"height": 270,
		"leftgutter": 42,
		"bottomgutter": 40,
		"topgutter": 10,
		"rightgutter": 10,
		"rowNum": rowNum,
		"colNum": adjustData.length,
		"container": "hourHolder",
		"date": adjustData.date
	}
	var graphConf = {
		"shap": "rect",
		"container": ".yLabel",
		"dataContainer": ".showData",
		"min": adjustData.min.air,
		"max": adjustData.max.air,
		"data": adjustData.air,
		"unit": "",//μg/m³
		"invalid": adjustData.invalid.air,
		"step": adjustData.step.air,
		"r": 4
	}
	//初始化温度图表
	observe24hGraph.init(dataConf);
	observe24hGraph.drawGraph(graphConf);
	function getNewestData(dataArr){
		var arr = dataArr;
		var l = arr.length-1;
		while(arr[l]=='' && l>0){
			--l;
		}
		return arr[l];
	}
	var dataLen = adjustData.length;
	function isEmpty(invalidDataArr){
		return invalidDataArr.length == dataLen;
	}
	//观察台
	
	var $currHour = $("#currHour");
	var $detailHour = $("#detailHour");
	var $result = $("#hourHolder .result");
	var newTemperature = getNewestData(adjustData.air);
	$("#weatherChart .tabs ul li").hover(function(){
		var tc = $(this).attr('class');
		if (tc.length>3) return;
		$(this).attr('class',$(this).attr('data-role')+' '+tc);
	},function(){	
		$(this).removeClass($(this).attr('data-role'));
	}).click(function() {
		var $colExp = $('.aqiColorExp');
		if ($(this).hasClass("on")) return;
		var prev = $(this).siblings(".on");
		var data_role = $(this).attr("data-role");
		var prev_data_role = prev.attr("data-role");
		prev.attr("class", prev.attr("class").replace("_on", "")).removeClass("on");
		$(this).attr("class", $(this).attr("class") + "_on").addClass("on");
		$result.hide();
		$weatherChart.find('.split').children().filter('.'+data_role).addClass('on').siblings().removeClass('on');
		var invalidData = adjustData.invalid;
		var _graphConf;
		switch (data_role) {
			case 'humidity':
				$('#sd').show().siblings('b').hide();
				$colExp.hide()
				_graphConf = $.extend({},graphConf,{
					"shap": "dot",
					"min": adjustData.min.humidity,
					"max": adjustData.max.humidity,
					"data": adjustData.humidity,
					"unit": "%",//"%"
					"invalid": invalidData.humidity,
					"step": adjustData.step.humidity
				});
				break;
			case 'tem':
				$('#tem').show().siblings('b').hide();
				$colExp.hide()
				_graphConf = $.extend({},graphConf,{
					"shap": "dot",
					"min": adjustData.min.tem,
					"max": adjustData.max.tem,
					"data": adjustData.tem,
					"unit": "℃",//℃
					"invalid": invalidData.tem,
					"step": adjustData.step.tem
				});
				break;
			
			case 'air':
				$('#wd').show().siblings('b').hide();
				var newestVal = getNewestData(adjustData.air);
				$colExp.show()
				break;
			case 'rain':
				$('#js').show().siblings('b').hide();
				var newestVal = getNewestData(adjustData.rain);
				var rainSum = adjustData.rainSum;
				if (isNaN(rainSum) || rainSum == 0 || isEmpty(invalidData.rain) ) {
					//$detailHour.html("总降水量:暂无数据");
					$result.html("24小时内无降水数据").show();
				}
				$colExp.hide()
				
				_graphConf = $.extend({},graphConf,{
					
					"min": adjustData.min.rain,
					"max": adjustData.max.rain,
					"data": adjustData.rain,
					"unit": "mm",//"mm"
					"step": adjustData.step.rain,
					"invalid": invalidData.rain
				});
				break;
			case 'wind':
				$('#fl').show().siblings('b').hide();
				$colExp.hide()
				_graphConf = $.extend({},graphConf,{
					"shap": "polygon",
					"min": adjustData.min.wind,
					"max": adjustData.max.wind,
					"data": adjustData.windLevel,
					"angle": adjustData.windAngle,
					"direction": adjustData.windDirection,
					'desc': adjustData.windDirection, // .windDirection
					"unit": "级",//"级"
					"invalid": invalidData.wind,
					"step": adjustData.step.wind,
					"r": 8
				})
				break;
		}
		paper.remove();
		observe24hGraph.init(dataConf);
		observe24hGraph.drawGraph(_graphConf || graphConf);
		$("#weatherChart .chart .detail").removeClass("detail");
		$("#weatherChart .chart").find("." + data_role).addClass("detail");
	})
	
	var hasApiNum = false;
	$.each(observe24h_data.od.od2,function(i,v){
		if(v.od28){
			hasApiNum = true;
		}
	})
	if(!hasApiNum){
		$('#weatherChart [data-role=air]').hide().next().click();
	}
}	

 
 