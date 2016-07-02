var data24 = [];
var arrwea = ['晴', '阴', '雨', '大雨', '小雨']
for (var i = 0; i <= 23; i++) {
    var obj = {
        time: i,
        wea: parseInt(Math.random() * 4),
        tem: parseInt(Math.random() * 60)
    }
    data24.push(obj)
}

(function () {
    //曲线构建函数 原型
    var lineProto = {
        _getArrMax: function (arr) {
            return Math.max.apply(Math, arr) || null;
        },
        _getArrMin: function (arr) {
            return Math.min.apply(Math, arr) || null;
        },
        len: 0,
        topPadding: 40,
        bottomPadding: 40,
        arrTime: [],
        arrWeapic: [],
        arrWeaTxt: [],
        arrTem: [],
        arrWinf: [],
        arrWinl: [],
        arrWinS: [],
        _clearArr: function () {
            this.arrTime = [];
            this.arrWeapic = [];
            this.arrWeaTxt = [];
            this.arrTem = [];
            this.arrWinf = [];
            this.arrWinl = [];
            this.arrCircle = [];
            this.arrWinS = [];
        },
        _initWeaData: function (oneDayArr) {//参数为  一天的数组
            this._clearArr();
            var _this = this;
            //console.log(oneDayArr)
            $.each(oneDayArr, function (i, v) {

                _this.arrTime.push(v.time);
                //_this.arrWeapic.push(d[1]);
                _this.arrWeaTxt.push(v.wea);
                _this.arrTem.push(parseInt(v.tem));
                //H.arrWinf.push(d[4]);
                //H.arrWinl.push(d[5]);
                //H.arrWinS.push(d[6].match(/\d+/)[0]);
            })
            _this.len = oneDayArr.length;
            //生成 svg的circle数据  和 path的线数据
            var temMin = this._getArrMin(this.arrTem);//求出这一组温度的最大最小值
            var temMax = this._getArrMax(this.arrTem);
            //temD 一摄氏度 = X像素高
            if (temMin != temMax) {
                var temD = (this.svgH - this.topPadding - this.bottomPadding) / (temMax - temMin);
            } else {
                var temD = (this.svgH - this.topPadding - this.bottomPadding) / 1;
            }
            this.cel_w = this.svgW / this.len;
            var arrPath = [];
            var startPoint, circleX, circleY;
            $.each(this.arrTem, function (i, v) {
                circleX = _this.cel_w * i + _this.cel_w / 2;
                if (!i) {
                    startPoint = circleX + "," + _this.svgH;
                }
                circleY = (temMax - _this.arrTem[i]) * temD + _this.topPadding;
                _this.arrCircle.push({'x': circleX, 'y': circleY});
                arrPath.push([circleX, circleY]);
            })
            this.linePath = arrPath.join(',');
            this.fillPath = startPoint + ',' + this.linePath + ',' + circleX + "," + this.svgH;
        },
        svgW: 1000,
        svgH: 200,
        cel_w: 0,
        linePath: '',
        fillPath: '',
        arrCircle: []
    }

    function CreatLine() {};//曲线构建函数
    CreatLine.prototype = lineProto;

//============整点与24小时曲线 begin=================
    !function () {
        var $F = $('#curve');
        var $time = $F.find('.time');
        var $weapic = $F.find('.wpic');
        var $tem = $F.find('.tem');
        //初始化 天气数据

        //温度线
        var H = new CreatLine();
        H._initWeaData(data24);
        var paper = Raphael('biggt', H.svgW, H.svgH);
        var line = paper.path().attr({"stroke": "#fff", "stroke-width": 2});
        var fill = paper.path().attr({"stroke": "none", fill: "#75b8e2", opacity: 0.8});
        var objCircle = [];  //存储点circle对象的 数组
        var originX = H.arrCircle[0].x;
        var originY = H.arrCircle[0].y;
        // 画背景线 横线
        var arrBgLineY = [29, 99, 162, 198];
        for (var i = 0, len = arrBgLineY.length; i < len; i++) {
            if (i == len - 1) {
                paper.path('M0,0,L1000,0', '-').attr({"stroke": "#ddd", "stroke-width": 1}).translate(0, arrBgLineY[i]);
            } else {
                //paper.path('M0,0,L1000,0','-').attr({"stroke": "#ddd","stroke-width":1,"stroke-dasharray":"-"}).translate(0,arrBgLineY[i]);
            }
        }
        //
        for (var i = 0; i <= H.len - 1; i++) {
            //时间
            $time.append($('<em style="width:' + H.cel_w + 'px;left:' + H.cel_w * i + 'px">' + H.arrTime[i] + '时</em>'));
            var circleX = H.arrCircle[i].x;
            var circleY = H.arrCircle[i].y;
            //画背景线 竖线
            paper.path('M0,' + H.svgH + ',L0,' + circleY).attr({
                "stroke": "#ddd",
                "stroke-width": 1
            }).translate(circleX, 0);
            (function () {
                var cir = paper.circle(originX, originY, 3).attr({
                    'fill': '#fff',
                    'stroke': '#fff',
                    'stroke-width': 1,
                    'cx': circleX,
                    'cy': circleY
                });
                objCircle.push(cir);
                cir.hover(function () {
                    cir.animate({r: 5}, 400);
                }, function () {
                    cir.animate({r: 2}, 400)
                })
            })()
            //温度
            $tem.append($('<em style="width:' + H.cel_w + 'px;left:' + H.cel_w * i + 'px;top:' + (circleY - 25) + 'px">' + H.arrTem[i] + '℃</em>'));
            //天气图标
            $weapic.append($('<div class="weatxt w' + H.arrWeaTxt[i] + '" style="width:' + H.cel_w + 'px;left:' + H.cel_w * i + 'px;">' +
                arrwea[H.arrWeaTxt[i]] + '</div>'));
        }
        console.log(H.fillPath)
        line.attr({"path": "M" + H.linePath});
        fill.attr({"path": "M" + H.fillPath})
    }()


})()