/**
 * 七夕
 */
var Qixi = function(){
    var config = {
        // 保持缩放比
        keepZoomRatio: false,
        // 设置画布尺寸，默认全屏
        layer: {
            "width": '100%',
            "height": '100%',
            "top": 0,
            "left": 0,
        },
        // 音乐设置
        audio: {
            enable: true, // 是否开启音乐
            playURL: 'media/happy.wav', // 播放地址
            cycleURL: 'media/circulation.wav' // 循环播放地址
        },
        // 时间设置(毫秒)
        setTime: {
            walkToThird: 6000,      // 开始行走，1/3画布宽度
            walkToMiddle: 6500,     // 走到场景2商店
            walkToEnd: 6500,        // 走到场景3桥底
            walkTobridge: 2000,     // 上桥
            bridgeWalk: 2000,       // 桥上走到女孩旁边
            walkToShop: 1500,       // 走进商店
            walkOutShop: 1500,      // 走出商店
            openDoorTime: 800,      // 开门
            shutDoorTime: 500,      // 关门
            waitRotate: 850,        // 转身等待
            waitFlower: 800         // 商店拿花等待
        },
        // 花瓣图片地址
        petals: [
            'images/petals/petal1.png',
            'images/petals/petal2.png',
            'images/petals/petal3.png',
            'images/petals/petal4.png',
            'images/petals/petal5.png',
            'images/petals/petal6.png'
        ]
    };

    var debug = 0;  //调试模式，快进
    if(debug){
        $.each(config.setTime, function(k,v){
            config.setTime[k] = 500;
        });
    }
    if(config.keepZoomRatio){
        var proportionY = 900 / 1440;
        var screenHeight = $(document).height();
        var zoomHeight = screenHeight * proportionY;
        var zoomTop = (screenHeight - zoomHeight) / 2;
        config.layer.height = zoomHeight;
        config.layer.top = zoomTop;
    }

    var instanceX;  // 当前需要移动的坐标
    var container = $("#content");  // 总场景容器

    // 设置场景大小
    container.css(config.layer);

    // 页面可视区域
    var visualWidth = container.width();
    var visualHeight = container.height();
    
    // 获取元素数据
    var getValue = function(className){
        var $elem = $('' + className + '');
        return{
            height: Math.floor($elem.height()),
            top: Math.floor($elem.position().top)
        };
    };

    // 路的Y轴
    var pathY = function(){
        var data = getValue('.a_background_middle');
        return data.top + data.height/2;
    }();

    // 桥的Y轴
    var bridgeY = function() {
        var data = getValue('.c_background_middle');
        return data.top;
    }();

    // animationend 兼容
    var animationEnd = (function(){
        var explorer = navigator.userAgent;
        if(~explorer.indexOf('Webkit')){
            return "webkitAnimationEnd";
        }
        return "animationend";
    })();

    var swipe = Swipe(container);
    // 场景滚动到指定位置
    function scrollTo(time, proportionX) {
        var distX = visualWidth * proportionX;
        swipe.scrollTo(distX, time);
    }

    // 小女孩
    var girl = {
        elem: $('.girl'),
        getHeight: function() {
            return this.elem.height();
        },
        //转身动作
        rotate: function(){
            this.elem.addClass('girl-rotate');
        },
        //位置设置
        setOffset: function() {
            this.elem.css({
                "left": visualWidth / 2,
                "top": bridgeY - this.getHeight()
            });
        },
        getOffset: function(){
            return this.elem.offset();
        },
        getWidth: function(){
            return this.elem.width();
        }
    };

    // 右边飞鸟
    var bird = {
        elem: $(".bird"),
        fly: function() {
            this.elem.addClass('birdFly');
            this.elem.transition({
                right: container.width()
            }, 15000, 'linear');
        }
    };

    // logo
    var logo = {
        elem: $('.logo'),
        run: function() {
            this.elem.addClass('logolightSpeedIn').on('animationend', function() {
                $(this).addClass('logoshake').off();
            });
        }
    };

    // 行走小男孩
    var boy = BoyWalk();

    $('.btn-play').on('click tap',function(){
        $(this).hide();
        run();
    });

    // 场景动画
    function run(){
        // 播放音乐
        if(config.audio.enable){
            var audio1 = Hmlt5Audio(config.audio.playURL);
            audio1.end(function() {
                Hmlt5Audio(config.audio.cycleURL, true);
            });
        }

        $("#sun").addClass('rotation'); // 太阳公转
        // 飘云
        $(".cloud:first").addClass('cloud1Anim');
        $(".cloud:last").addClass('cloud2Anim');
        boy.walkTo(config.setTime.walkToThird, 0.6)
        .then(function(){
            scrollTo(config.setTime.walkToMiddle, 1);  // 进入场景2
            return boy.walkTo(config.setTime.walkToMiddle, 0.5); // 男孩走入
        }).then(function(){
            bird.fly(); //飞鸟
        }).then(function(){
            boy.stopWalk(); // 暂停走路
            return BoyToShop(boy); // 进行商店动画
        }).then(function(){
            girl.setOffset(); // 设置小女孩位置
            scrollTo(config.setTime.walkToEnd, 2);  // 进入场景3
            return boy.walkTo(config.setTime.walkToEnd, 0.15); // 男孩走入桥底边
        }).then(function(){
            return boy.walkTo(config.setTime.walkTobridge, 0.25, (bridgeY - girl.getHeight()) / visualHeight); // 男孩走入桥上
        }).then(function(){
            var proportionX = (girl.getOffset().left - boy.getWidth() - instanceX + girl.getWidth() / 5) / visualWidth; // 实际走路的比例
            return boy.walkTo(config.setTime.bridgeWalk, proportionX); // 男孩直走到小女孩面前
        }).then(function() {
            boy.resetOriginal(); // 图片还原原地停止状态
             // 增加转身动作
            setTimeout(function(){
                girl.rotate();
                boy.rotate(function(){
                    logo.run(); //Logo呈现
                    floating(); //花瓣飘落
                });
            }, config.setTime.waitRotate);
        });
    }

    // 小男孩
    function BoyWalk(){
        var $boy = $('#boy');
        var boyWidth = $boy.width();
        var boyHeight = $boy.height();

        $boy.css({"top": pathY - boyHeight + 25}); // 设置男孩位置

        // 暂停行走
        function pauseWalk() {
            $boy.addClass('pauseWalk');
        }
        // 恢复行走
        function restoreWalk() {
            $boy.removeClass('pauseWalk');
        }
        // 行走动作
        function slowWalk() {
            $boy.addClass('slowWalk');
        }
        // 行走动画
        function stratRun(options, runTime) {
            var dfdPlay = $.Deferred();
            restoreWalk(); // 恢复行走
            $boy.transition(options, runTime, 'linear', function(){
                dfdPlay.resolve();      // 动画完成
            });
            return dfdPlay;
        }
        // 开始行走
        function walkRun(time, dist, disY) {
            time = time || 3000;
            slowWalk(); // 行走
            // 开始走路
            var d1 = stratRun({
                'left': dist + 'px',
                'top': disY ? disY : undefined
            }, time);
            return d1;
        }

        // 走进商店
        function walkToShop(obj, runTime){
            var defer = $.Deferred();
            var doorObj = $('.door');

            // 门的坐标
            var offsetDoor = doorObj.offset();
            var doorOffsetLeft = offsetDoor.left;
            // 小孩当前的坐标
            var offsetBoy = $boy.offset();
            var boyOffsetLeft = offsetBoy.left;

            // 当前需要移动的坐标
            instanceX = (doorOffsetLeft + doorObj.width()/2) - (boyOffsetLeft + $boy.width() / 2);

            // 开始走路
            var walkPlay = stratRun({
                transform: "translateX("+ instanceX +"px), scale(.3,.3)",
                opacity: 0.1
            }, runTime);

            //走路结束
            walkPlay.done(function(){
                $boy.css({'opacity':0});
                defer.resolve();
            });
            return defer;
        }

        // 走出商店
        function walkOutShop(runTime){
            var defer = $.Deferred();
            restoreWalk();
            // 开始走路
            var walkPlay = stratRun({
                transform: 'translateX('+ instanceX +'px), scale(1,1)',
                opacity: 1
            }, runTime);

            //走路结束
            walkPlay.done(function(){
                defer.resolve();
            });
            return defer;
        }

        // 计算移动距离
        function calculateDist(direction, proportion) {
            return (direction == "x" ? visualWidth : visualHeight) * proportion;
        }

        return{
            // 开始走路
            walkTo: function(time, proportionX, proportionY){
                var distX = calculateDist('x', proportionX);
                var distY = calculateDist('y', proportionY);
                return walkRun(time, distX, distY);
            },
            // 停止走路
            stopWalk: function(){
                pauseWalk();
            },
            //复位初始状态
            resetOriginal: function(){
                this.stopWalk();
                $boy.removeClass('slowWalk slowFlowerWalk').addClass('boyOriginal');
            },
            // 走进商店
            toShop: function(){
                return walkToShop.apply(null, arguments);
            },
            // 走出商店
            outShop: function(){
                return walkOutShop.apply(null, arguments);
            },
            //取花
            takeFlower: function(){
                $boy.addClass('slowFlowerWalk');
            },
            //男孩转身
            rotate: function(callback){
                restoreWalk();
                $boy.addClass('boy-rotate');
                //监听转身结束
                if(callback){
                    $boy.on("animationend", function(){
                        callback();
                        $(this).off();
                    });
                }
            },
            //获取男孩宽度
            getWidth: function(){
                return $boy.width();
            },
            //获取男孩位置
            getDistance: function(){
                $boy.addClass('slowFlowerWalk');
            }
        };
    }

    // 商店动画
    var BoyToShop = function(boyObj){
        var defer = $.Deferred();
        var $door = $('.door');
        var doorLeft = $('.door-left');
        var doorRight = $('.door-right');

        // 开关门动画
        function doorAction(left, right, time){
            var defer = $.Deferred();
            var count = 2;
            //等待开门完成
            var complete = function(){
                if(count == 1){
                    defer.resolve();
                    return;
                }
                count--;
            };
            doorLeft.transition({
                'left': left
            }, time, complete);
            doorRight.transition({
                'left': right
            }, time, complete);
            return defer;
        }

        // 开门
        function openDoor(time) {
            return doorAction('-50%', '100%', time);
        }
        // 关门
        function shutDoor(time) {
            return doorAction('0%', '50%', time);
        }
        // 取花
        function takeFlower(){
            //增加延时等待效果
            var defer = $.Deferred();
            boyObj.takeFlower();
            setTimeout(function(){
                defer.resolve();
            }, config.setTime.waitFlower);
            return defer;
        }
        // 灯动画
        var lamp = {
            elem: $('.b_background'),
            bright: function() {
                this.elem.addClass('lamp-bright');
            },
            dark: function() {
                this.elem.removeClass('lamp-bright');
            }
        };
        var waitOpen = openDoor(config.setTime.openDoorTime);
        waitOpen.then(function(){
            lamp.bright(); // 灯亮
            return boyObj.toShop($door, config.setTime.walkToShop); // 进商店
        }).then(function(){
            return boyObj.takeFlower(); //取花
        }).then(function(){
            return boyObj.outShop(config.setTime.walkOutShop); //出商店
        }).then(function(){
            shutDoor(config.setTime.shutDoorTime); // 关门
            lamp.dark(); // 灯暗
            defer.resolve(); // 商店流程结束
        });

        return defer;
    };

    // 花瓣动画
    function floating(){
        var petalsContainer = $('#floatPetals'); //鲜花容器
        //随机图
        function getImagesName(){
            return config.petals[Math.floor((Math.random() * 6))];
        }
        //创建花瓣元素
        function createPetal(){
            var src = getImagesName();
            return $('<div class="petalbox"></div>').css({
                'width': 41,
                'height': 41,
                'position': 'absolute',
                'backgroundSize': 'cover',
                'zIndex': 99999,
                'top': '-41px',
                'backgroundImage': 'url('+ src +')'
            }).addClass('petalsRoll');
        }
        // 开始飘花
        setInterval(function(){
            //运动轨迹
            var startPositionLeft = Math.random() * visualWidth - 100,
                startOpacity = 1,
                endPositionTop = visualHeight - 40,
                endPositionLeft = startPositionLeft - 100 + Math.random() * 500,
                duration        = visualHeight * 10 + Math.random() * 5000;

            // 随机透明度，不小于0.5
            var randomStart = Math.random();
            randomStart = randomStart < 0.5 ? startOpacity : randomStart;

            // 创建一个花瓣
            var $petal = createPetal();

            // 设计起点位置
            $petal.css({
                left: startPositionLeft,
                opacity : randomStart
            });

            // 加入到容器
            petalsContainer.append($petal);

            // 开始执行动画
            $petal.transition({
                top: endPositionTop,
                left: endPositionLeft,
                opacity: 0.7
            }, duration, 'ease-out', function() {
                $(this).remove(); //结束后删除
            });
        }, 200);
    }
    // 音频播放
    function Hmlt5Audio(url, isloop) {
        var audio = new Audio(url);
        audio.autoPlay = true;
        audio.loop = isloop || false;
        audio.play();
        return {
            end: function(callback) {
                audio.addEventListener('ended', function() {
                    callback();
                }, false);
            }
        };
    }
};
$(function(){
    Qixi();
});