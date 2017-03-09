/**
 * Created by Lee Sure on 2017/3/8.
 */
;
var FixedList = (function invocation() {
    var divBlankUH,     //上方显示空白区域高度
        divBlankDH,     //下方显示空白区域高度
        prtNode,        //父节点
        divBlankUContent = '<div id="divBlankU"></div>',//上方显示空白区域
        divBlankDContent = '<div id="divBlankD"></div>',//下方显示空白区域
        lastScrollTop = 0,   //上次滑动的位置
        currentScrollTop = 0,//当前滑动的位置
        unit = 0,
        cols = 0,
        childClassName, //子view的class名
        data,           //数据源
        eventListener,  //事件监听
        isDebug = false;

    /**
     * 构造函数
     * @param parentNode    父节点
     * @param dat          数据
     * @constructor
     */
    function FixedList(parentNode, dat) {
        prtNode = parentNode;
        logger(prtNode);
        data = dat;
        childClassName = getChildClassName(data);
    }

    /**
     * 获取父节点
     * @returns {*}
     */
    FixedList.prototype.getParentNode = function () {
        return prtNode;
    };

    /**
     * 更新list数据流
     * @param dat
     */
    FixedList.prototype.refreshData = function (dat) {
        data = dat;
    };

    /**
     * 初始化list数据流
     * @param cls  列数
     * @param unt   每一个集群所包含的数目
     */
    FixedList.prototype.init = function (cls, unt) {
        cols = cls;
        unit = unt;
        var array = [];
        var length = data.length;
        array.push(divBlankUContent);
        if (length > unit) {
            for (var k = 0; k < unit; k++) {
                array.push(data[k]);
            }
            array.push(divBlankDContent);
        } else {
            for (var i = 0; i < length; i++) {
                array.push(data[i]);
            }
        }
        logger(array.join(''));
        prtNode.innerHTML = array.join('');
        var restData = data.slice(unit, length);            //剩余的内容
        divBlankDH = Math.ceil(restData.length / cols) * parseInt(calChildHeight());//初始化时下方空白区域的高度
        logger(divBlankDH);
        document.getElementById('divBlankD').style.height = divBlankDH + 'px';
        scroll(restData, divBlankDH);
        return this;
    };

    /**
     * 添加监听函数
     * @param listener
     */
    FixedList.prototype.setEventListener = function (listener) {
        eventListener = listener;
        //添加后立即执行
        listen();
    };

    /**
     * 计算子view的高度,data中包含的子view的高度要固定，否则计算错误
     * @returns {number}
     */
    function calChildHeight() {
        var childNode = prtNode.childNodes[1];
        //logger(childNode);
        //logger(childNode.clientHeight);
        return childNode.clientHeight;
    }

    /**
     * 获取滚动条滑动方向
     * @param parentNode
     * @returns {boolean}
     */
    function isScrollUp(parentNode) {
        currentScrollTop = parentNode.scrollTop;
        var direction = currentScrollTop < lastScrollTop;
        lastScrollTop = currentScrollTop;
        return direction;
    }

    /**
     * 获取子节点的类名
     * @param data
     * @returns {string}
     */
    function getChildClassName(data) {
        var content = [];
        var frag = document.createDocumentFragment();
        var div = document.createElement('div');
        var _div = document.createElement('div');
        if (data.length > 0) {
            for (var i = 0; i < 1; i++) {
                content.push(data[i]);
            }
        } else {
            return;
        }
        div.innerHTML = content.join('');
        var nodes = div.childNodes;
        for (var k = 0; k < nodes.length; k++) {
            var node = nodes[k];
            frag.appendChild(node.cloneNode(true));
        }
        _div.appendChild(frag);
        return _div.firstChild.getAttribute('class');
    }

    /**
     * 插入节点
     * @param data  数据
     * @param parentNode    父节点
     * @param childNode     子节点
     * @param isPre         是否往前插入
     */
    function domInsertBy(data, parentNode, childNode, isPre) {
        var content = [];
        var frag = document.createDocumentFragment();
        var div = document.createElement('div');
        for (var i = 0; i < data.length; i++) {
            content.push(data[i]);
        }
        div.innerHTML = content.join('');
        var nodes = div.childNodes;
        for (var k = 0; k < nodes.length; k++) {
            var node = nodes[k];
            frag.appendChild(node.cloneNode(true));
        }
        if (isPre) {
            parentNode.insertBefore(frag, childNode);
        } else {
            parentNode.appendChild(frag);
        }
    }

    /**
     * 批量删除节点
     * @param isPre 向上删除或向下删除
     * @param isLast 是否最后一页
     */
    function domDelete(isPre, isLast) {
        logger(unit);
        var childNodes = document.getElementsByClassName(childClassName);
        var length = childNodes.length;
        //循环删除数组，倒序删除
        if (isPre) {
            for (var i = unit - 1; i >= 0; i--) {
                childNodes[i].parentNode.removeChild(childNodes[i]);
            }
        } else {
            if (isLast) {
                logger(parseInt(length / unit) * unit);
                for (var k = length - 1; k >= parseInt(length / unit) * unit; k--) {
                    childNodes[k].parentNode.removeChild(childNodes[k]);
                }
            } else {
                for (var j = length - 1; j >= length - unit; j--) {
                    childNodes[j].parentNode.removeChild(childNodes[j]);
                }
            }
        }
    }

    /**
     * 判断是否为一个函数
     * @param fn
     * @returns {boolean}
     */
    function isFunction(fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    }

    function listen() {
        if (isFunction(eventListener)) {
            eventListener();
        }
    }

    /**
     * 滚动函数
     * @param restData  剩余数据
     * @param divBlankDH    初始化时的下方空白区域高度
     */
    function scroll(restData, divBlankDH) {
        var page = 0;       //初始化时为第0页
        prtNode.addEventListener('scroll', function () {
            var nDivHeight = prtNode.clientHeight;
            var nScrollTop = prtNode.scrollTop; //滚动到的当前位置
            var dHeight = nDivHeight + nScrollTop;
            var unitHeight = parseInt(calChildHeight()) * unit / cols;
            var bl = isScrollUp(prtNode);
            var divU = document.getElementById('divBlankU');
            var divD = document.getElementById('divBlankD');
            if (!bl) {
                if (dHeight > (page + 1) * unitHeight - unitHeight * 0.2) {
                    logger(dHeight);
                    logger(unitHeight);
                    logger(page);
                    //如果此时剩余数据长度大于单元数据长度
                    if (restData.length - (page) * unit > unit) {
                        domInsertBy(restData.slice(page * unit, (page + 1) * unit), prtNode, divD, true);
                        divD.style.height = (divBlankDH - (page + 1) * unitHeight) + 'px';
                        //加载到第2页的时候才开始删除前面的
                        if (page >= 1) {
                            domDelete(true);
                            divU.style.height = (unitHeight * (page)) + 'px';
                            logger(divU.style.height);
                        }
                    } else {
                        domInsertBy(restData.slice(page * unit, restData.length), prtNode, divD, true);
                        divD.style.height = '0px';
                        logger("最后一页");
                        if (page >= 1) {
                            domDelete(true);
                            divU.style.height = (unitHeight * (page)) + 'px';
                            logger(divU.style.height);
                        }
                    }
                    //调用监听
                    listen();
                    page += 1;
                }
            } else {
                if (dHeight < (page) * unitHeight - unitHeight * 0.3) {
                    logger(dHeight);
                    logger(unitHeight);
                    logger(page);
                    if (data.length - page * unit < unit) {
                        logger("末尾添加");
                        domDelete(false, true);
                        domInsertBy(data.slice((page - 2) * unit, (page - 1) * unit), prtNode, prtNode.childNodes[1], true);
                        divU.style.height = (unitHeight * (page - 2)) + 'px';
                        divD.style.height = (divBlankDH - (page - 1) * unitHeight) + 'px';
                    } else {
                        domDelete(false, false);
                        domInsertBy(data.slice((page - 2) * unit, (page - 1) * unit), prtNode, prtNode.childNodes[1], true);
                        divU.style.height = (unitHeight * (page - 2)) + 'px';
                        divD.style.height = (divBlankDH - (page - 1) * unitHeight) + 'px';
                    }
                    //调用监听
                    listen();
                    page -= 1;
                }
            }
        });
    }

    /**
     * 是否打印到控制台
     * @param obj
     */
    function logger(obj) {
        if (isDebug) {
            console.log(obj);
        }
    }

    return FixedList;
}());