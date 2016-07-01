
var data24= [];
var arrwea=['晴','阴','雨','大雨','小雨']
for(var i =0;i<=23;i++){
    var obj = {
        time:i,
        wea:arrwea[parseInt(Math.random()*4)],
        tem:parseInt(Math.random()*60)
    }
    data24.push(obj)
}
console.log(data24.length)



//分时段预报 曲线
var H = {
    _getArrMax:function(arr){
        return Math.max.apply(Math,arr) || null;
    },
    _getArrMin:function(arr){
        return Math.min.apply(Math,arr) || null;
    },
    len:0,
    topPadding:40,
    bottomPadding:40,
    arrTime:[],
    arrWeapic:[],
    arrWeaTxt:[],
    arrTem:[],
    arrWinf:[],
    arrWinl:[],
    arrWinS:[],
    _clearArr:function(){
        H.arrTime = [];
        H.arrWeapic=[];
        H.arrWeaTxt=[];
        H.arrTem=[];
        H.arrWinf=[];
        H.arrWinl=[];
        H.arrCircle = [];
        H.arrWinS = [];
    },
    _initWeaData:function(oneDayArr){//参数为  一天的数组
        H._clearArr();
        console.log(oneDayArr)
        $.each(oneDayArr,function(i,v){

            H.arrTime.push(v.time);
            //H.arrWeapic.push(d[1]);
            H.arrWeaTxt.push(v.wea);
            H.arrTem.push(parseInt(v.tem));
            //H.arrWinf.push(d[4]);
            //H.arrWinl.push(d[5]);
            //H.arrWinS.push(d[6].match(/\d+/)[0]);
        })
        this.len = oneDayArr.length;
        //生成 svg的circle数据  和 path的线数据
        var temMin = H._getArrMin(H.arrTem);//求出这一组温度的最大最小值
        var temMax = H._getArrMax(H.arrTem);
        //temD 一摄氏度 = X像素高
        if(temMin != temMax){
            var temD = (this.svgH-this.topPadding-this.bottomPadding)/(temMax - temMin);
        }else{
            var temD = (this.svgH-this.topPadding-this.bottomPadding)/1;
        }
        this.cel_w = this.svgW/this.len;
        var arrPath = [];
        $.each(H.arrTem,function(i,v){
            var circleX = H.cel_w*i+H.cel_w/2;
            var circleY = (temMax-H.arrTem[i])*temD+H.topPadding; 
            H.arrCircle.push({'x':circleX,'y':circleY});
            arrPath.push([circleX,circleY]);
        })
        this.svgPath = arrPath.join(',');
    },
    svgW:1000,
    svgH:200,
    cel_w:0,
    svgPath:'',
    linePath:null,
    arrCircle:[]
}
var $F = $('#curve');
var $time = $F.find('.time');
var $weapic = $F.find('.wpic');
var $tem = $F.find('.tem');
//初始化 天气数据

//温度线
H._initWeaData(data24);

var paper = Raphael('biggt',H.svgW,H.svgH); 
var line = paper.path('M10,20').attr({"stroke": "#fff","stroke-width":2});
var objCircle = [];  //存储点circle对象的 数组
var originX = H.arrCircle[0].x;
var originY = H.arrCircle[0].y;
// 画背景线 横线
var arrBgLineY = [29,99,162,198];
for(var i=0,len=arrBgLineY.length;i<len;i++){
    if(i==len-1){
        paper.path('M0,0,L1000,0','-').attr({"stroke": "#ddd","stroke-width":1}).translate(0,arrBgLineY[i]);
    }else{
        paper.path('M0,0,L1000,0','-').attr({"stroke": "#ddd","stroke-width":1,"stroke-dasharray":"-"}).translate(0,arrBgLineY[i]);
    }
}
//
for(var i = 0; i<= H.len-1; i++){
    //时间
    $time.append($('<em style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px">'+H.arrTime[i].match(/\d*/)[0]+':00</em>'));
    var circleX = H.arrCircle[i].x;
    var circleY = H.arrCircle[i].y;
    //画背景线 竖线
    paper.path('M0,5,L0,'+H.svgH).attr({"stroke": "#ddd","stroke-width":1}).translate(circleX,0);
    (function(){
        var cir = paper.circle(originX,originY,3).attr({'fill':'#fff','stroke':'#fff','stroke-width':1,'cx':circleX,'cy':circleY});
        objCircle.push(cir);
        cir.hover(function(){
            cir.animate({r:8},400);
        },function(){
            cir.animate({r:5},400)
        }) 
    })()
    //温度
    $tem.append($('<em style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px;top:'+(circleY+70)+'px">'+H.arrTem[i]+'℃</em>'));
    //天气图标
    $weapic.append($('<div style="width:'+H.cel_w+'px;left:'+H.cel_w*i+'px;top:'+(0+60)+'px"><big title="'+H.arrWeaTxt[i]+'" class="png40 '+H.arrWeapic[i]+'"></big></div>'));
}
line.attr({"path":"M"+H.svgPath});



