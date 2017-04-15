/**
 * 目标滚动
 * @param string container
 */
function Swipe(container, options){
	var element = container.children(':first');	// 获取第一个子节点
	var swipe ={};	// 滑动对象
	var slides = element.children('li'); // 场景数量
	var width = container.outerWidth();	// 画布宽
	var height = container.outerHeight();	// 画布高

	// 设置总场景尺寸
	element.css({
		width: (slides.length * width) + 'px',
		height: height + 'px'
	});

	// 设置单个场景宽度
	$.each(slides, function(index){
		var slide = slides.eq(index);
		slide.css({'width':width+'px', 'height':height+'px'});
	});

	var isComplete = false;
	var timer;
	var callbacks = {};
	container[0].addEventListener("transitionend", function(){
		isComplete = true;
	}, false);
	function monitorOffset(element){
		timer = setTimeout(function(){
			if(isComplete){
				clearInterval(timer);
				return;
			}
			callbacks.move(element.offset().left);
			monitorOffset(element);
		}, 500);
	}
	swipe.watch = function(eventName, callback){
		callbacks[eventName] = callback;
	};

	// 监控完成与移动
	swipe.scrollTo = function(x, speed){
		//执行动画移动
		element.css({
			'transition-timing-function': 'linear',
			'transition-duration': speed + 'ms',
			'transform': 'translate3d(-'+ x +'px,0,0)'
		});
		return this;
	};

	return swipe;
}