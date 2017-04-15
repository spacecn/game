// 进入游戏
$('#index-btn').on('tap', function(e){
	$(this).parent().addClass('hide');
	$('#game,#guide').removeClass('hide');
	e.stopPropagation();
});

// 去掉游戏指引
$('#guide').on('tap', function(){
	$(this).addClass('hide');
	prize_time();
});

var time,		//游戏时间
	interval,	//游戏运行频率
	time_minus,
	time_out;

// 时间
function prize_time(){
	time_minus = setInterval(_countdown, 1000);	// 倒计时
	time_out = setTimeout(_updateInterval, interval);	// 更新频率
}

// 时间减少
function _countdown(){
	_updateTime(1);

	if(time >= 0){
		_updateCount();
		interval = time * 15;
		interval = Math.max(interval, 550); // 最小频率基数 550，
	} else if(time < 0) {
		$('#game_time').text(0);
		_showEnd();
		clearInterval(time_minus);
		clearTimeout(time_out);
	}
}

// 减时间
function _updateTime(minus){
	time -= minus;
}

// 时间更新
function _updateCount(){
	$('#game_time').text(time);
}

// 显示卡牌
function _updateInterval(){
	if(interval >= 800){
		_showCard(1, 3);
	} else if(interval >= 750 && interval < 800) {
		_showCard(2, 3);
	} else if(interval >= 650 && interval < 750) {
		_showCard(3, 6);
	} else if(interval >= 600 && interval < 650) {
		_showCard(4, 9);
	} else if(interval >= 550 && interval < 600) {
		_showCard(6, 9);
	} else {
		_showCard(8, 9);
	}
	// 循环调用自己
	time_out = setTimeout(arguments.callee, interval);
}

// 显示随机卡牌【频率越小，卡牌切换速度和数量递增】
var $li = $('.game-main>li');
var class_arr = [];	//随机样式
var li_arr = []; //随机li容器
var random_class,random_li;
var prize_type = ['bird','code','code','bird','code','code','bird','code','card'];
function _showCard(count, area){
	$li.removeClass();	//清除所有样式
	class_arr = getRandom(count, area);
	li_arr = getRandom(count, 9);

	for(var i=0; i<count; i++){
		random_class = prize_type[class_arr[i] - 1];
		random_li = $li.eq([li_arr[i]] - 1);
		random_li.addClass('ico-'+random_class);
	}
}

// 点击卡牌【鸟和卡 -5s，二维码单 +1】
var win;
$li.on('tap', function(){
	var $curLi = $(this);
	$curLi.addClass('on');
	if($curLi.hasClass('ico-bird') || $curLi.hasClass('ico-card')){
		_updateTime(5);
	}
	if($curLi.hasClass('ico-code')){
		win += 1;
		$('#game_order').text(win);
	}
});

// 游戏结束
var per = 0;
var share_title = "我是超级收银员，你敢挑战么"; // 分享标题
var share_desc = "超级收银员就是我，不服来挑战"; // 分享描述
var share_img = "ico_share_suc.jpg";	// 分享图片
function _showEnd(){
	$li.removeClass();
	$('#state').removeClass('hide');
	$('.state-order>strong').text(win);

	// 分享
	per = Math.min((((win / 80) * 100) + (Math.random() * 99 / 100)).toFixed(2), 100);
	if(win >= 40){
		$('#state').addClass('show-success');
		share_title = "我是超级收银员，你敢挑战么";
		share_img = "ico_share_suc.jpg";
		share_desc = "我用微信扫码刷卡，60秒收银" + win + "单，打败全球" + per + "%的收银员，你敢挑战么？";
	} else {
		$('#state').addClass('show-fail');
		share_title = "我是水货收银员，谁来替我报仇";
		share_img = "ico_share_fail.jpg";
		share_desc = "我用微信扫码刷卡，60秒收银" + win + "单，被全球" + (100.00 - per) + "%的收银员打败/(ㄒoㄒ)/~~，谁来替我报仇";
	}
}

// 再玩一次
$('#again').on('tap', function(){
	reset();
});

/**
 * 随机数【不重复】
 * @param  number count 数字个数
 * @param  number area 范围
 * @return array
 */
function getRandom(count, area){
	var arr = [];
	var num;
	while(arr.length < count){
		num = Math.floor(Math.random() * area) + 1;
		if(arr.indexOf(num) == -1){
			arr.push(num);
		}
	}
	return arr;
}

// 页面初始化
function reset(){
	win = 0;
	time = 60;
	interval = 900;
	time_minus = 0;
	time_out = 0;
	// 重置内容
	$('#game_order').text(win);
	$('#game_time').text(time);
	$('.state-order>strong').text(win);
	$('#index').attr('class', 'index page');
	$('#game').attr('class', 'game page hide');
	$('#guide').attr('class', 'guide page hide');
	$('#state').attr('class', 'state page hide');
}
reset();

// 禁止页面滑动
$(document).on('touchmove', function(e){
	e.preventDefault();
});

// 资源加载结束，去掉Loading
setTimeout(function(){
	$('#popload').addClass('hide');
},2000);