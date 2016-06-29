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