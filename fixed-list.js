/**
 * Created by Lee Sure on 2017/3/8.
 */
;
var FixedList = (function invocation() {
    var divBlankUH,     //上方显示空白区域高度
        divBlankDH,     //下方显示空白区域高度
        prtNode,        //父节点
        divBlankUContent = '<div id="divBlankU" style="position: relative"></div>',//上方显示空白区域
        divBlankDContent = '<div id="divBlankD" style="position: relative"></div>',//下方显示空白区域
        lastScrollTop = 0,   //上次滑动的位置
        currentScrollTop = 0,//当前滑动的位置
        unit = 0,       //单元所充的元素个数
        cols = 0,       //列数
        childClassName, //子view的class名
        data,           //数据源
        eventListener,  //事件监听
        page = 0,           //页数
        func,           //生产函数
        dataType,       //数据类型
        TYPE_JSON = 0,
        TYPE_STRING = 1,
        TYPE_OBJECT = 2,
        TYPE_SINGLE_STR = 3,
        TYPE_SINGLE_OBJ = 4,
        isDebug = false;


    /**
     * 构造函数
     * @param parentNode    父节点
     * @param dat          数据       可选参数
     * @param function1     生产函数    可选参数
     * @constructor
     */
    function FixedList(parentNode, dat, function1) {
        prtNode = parentNode;
        func = function1;
        data = handleData(dat);
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
        if (data == undefined) {
            data = handleData(dat);
            initData();
        } else {
            data = handleData(dat);
            var divU = document.getElementById('divBlankU');
            var uh = parseInt(divU.style.height);
            replaceHtml(uh);
        }
    };

    /**
     * 初始化list数据流
     * @param cls  列数
     * @param unt   每一个集群所包含的数目
     */
    FixedList.prototype.initList = function (cls, unt) {
        cols = cls;
        unit = unt;
        if (data === undefined) {
            return this;
        }
        initData();
        return this;
    };

    function initData() {
        childClassName = getChildClassName(data);
        prtNode.innerHTML = '';     //初始化置空
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
        prtNode.innerHTML = array.join('');
        var restData = data.slice(unit, length);            //剩余的内容
        divBlankDH = Math.ceil(restData.length / cols) * parseInt(calChildHeight());//初始化时下方空白区域的高度
        document.getElementById('divBlankD').style.height = divBlankDH + 'px';
        scroll();
    }

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
     * 获取列表数据
     * @returns {*}
     */
    FixedList.prototype.getDatas = function () {
        return data;
    };


    /**
     * 替换html
     * @param uh    上方空白区域高度，用来继承
     */
    function replaceHtml(uh) {
        var length = data.length;
        if (page == 0) {
            prtNode.innerHTML = '';     //刷新置空
            var array = [];
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
            prtNode.innerHTML = array.join('');
            var divU = document.getElementById('divBlankU');
            var divD = document.getElementById('divBlankD');
            divU.style.height = uh + 'px';
            var restData = data.slice(unit, length);            //剩余的内容
            divBlankDH = Math.ceil(restData.length / cols) * parseInt(calChildHeight());//初始化时下方空白区域的高度
            divD.style.height = divBlankDH + 'px';
        } else {
            //如果当前所在页已经超出了新数据的长度
            if (length < (page) * unit) {
                prtNode.innerHTML = '';     //刷新置空
                var totalPage = Math.ceil(length / unit);
                var ar = [];
                ar.push(divBlankUContent);
                for (var n = (totalPage - 2) * unit; n < length; n++) {
                    ar.push(data[n]);
                }
                ar.push(divBlankDContent);
                prtNode.innerHTML = ar.join('');
                divBlankUH = Math.ceil((totalPage - 2) * unit / cols) * parseInt(calChildHeight());//初始化时下方空白区域的高度
                document.getElementById('divBlankU').style.height = divBlankUH + 'px';
                document.getElementById('divBlankD').style.height = '0px';
                page = totalPage - 1;
            } else {
                prtNode.innerHTML = '';     //刷新置空
                var arr = [];
                arr.push(divBlankUContent);
                for (var m = (page - 1) * unit, _m = (page + 1) * unit; m < _m; m++) {
                    arr.push(data[m]);
                }
                arr.push(divBlankDContent);
                prtNode.innerHTML = arr.join('');
                document.getElementById('divBlankU').style.height = uh + 'px';
                var rest = data.slice(unit * (page + 1), length);            //剩余的内容
                divBlankDH = Math.ceil(rest.length / cols) * parseInt(calChildHeight());//初始化时下方空白区域的高度
                document.getElementById('divBlankD').style.height = divBlankDH + 'px';
            }
        }
    }

    /**
     * 计算子view的高度,data中包含的子view的高度要固定，否则计算错误
     * @returns {number}
     */
    function calChildHeight() {
        var childNode = prtNode.childNodes[1];
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
     * 替换节点
     * @param data
     * @param parentNode
     * @param childNode
     */
    function replaceNode(data, parentNode, childNode) {
        var dat = handleData(data);
        var div = document.createElement('div');
        var frag = document.createDocumentFragment();
        div.innerHTML = dat;
        var nodes = div.childNodes;
        for (var k = 0; k < nodes.length; k++) {
            var node = nodes[k];
            frag.appendChild(node.cloneNode(true));
        }
        parentNode.replaceChild(frag, childNode);
    }

    /**
     * 批量删除节点
     * @param isPre 向上删除或向下删除
     * @param isLast 是否最后一页
     */
    function deletePage(isPre, isLast) {
        var childNodes = document.getElementsByClassName(childClassName);
        var length = childNodes.length;
        //循环删除数组，倒序删除
        if (isPre) {
            for (var i = unit - 1; i >= 0; i--) {
                domDelete(childNodes[i]);
            }
        } else {
            if (isLast) {
                for (var k = length - 1; k >= parseInt(length / unit) * unit; k--) {
                    domDelete(childNodes[k]);
                }
            } else {
                for (var j = length - 1; j >= length - unit; j--) {
                    domDelete(childNodes[j]);
                }
            }
        }
    }

    /**
     * 删除节点
     * @param node
     */
    function domDelete(node) {
        if (typeof(jQuery) == "undefined") {
            node.parentNode.removeChild(node);
            node = null;
        } else {
            $(node).remove();
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

    /**
     * 判断数据类型
     * @param obj
     */
    function isObj(obj) {
        return typeof(obj);
    }

    /**
     * 处理data，使得此函数能够接收多个类型
     * @param data
     * @returns {*}
     */
    function handleData(data) {
        var dat;
        try {
            dat = JSON.parse(data);
            dataType = TYPE_JSON;
        } catch (err) {
            try {
                if (typeof(data[0]) == 'string' && !(typeof (data) == 'string')) {
                    dataType = TYPE_STRING;
                    dat = data;
                } else if (typeof(data[0]) == 'object') {
                    dataType = TYPE_OBJECT;
                    dat = data;
                } else if (typeof (data) == 'string') {
                    dataType = TYPE_SINGLE_STR;
                    dat = data;
                } else if (typeof(data) == 'object' && !(typeof(data[0]) == 'object')) {
                    dataType = TYPE_SINGLE_OBJ;
                    dat = data;
                }
            } catch (e) {

            }
        }
        return produceData(dat, dataType);
    }

    /**
     * 生产数据
     * @param dat
     * @param type
     */
    function produceData(dat, type) {
        var dt;
        var content = [];
        switch (type) {
            case TYPE_JSON:
            case TYPE_OBJECT:
                for (var k = 0; k < dat.length; k++) {
                    content.push(func(dat[k]));
                }
                dt = content;
                break;
            case TYPE_STRING:
                dt = dat;
                break;
            case TYPE_SINGLE_OBJ:
                content.push(func(dat));
                dt = content;
                break;
            case TYPE_SINGLE_STR:
                content.push(dat);
                dt = content;
                break;
            default:
                break;
        }
        return dt;
    }

    /**
     * 监听函数，要求为事件委托方式，因为节点是动态生成的
     */
    function listen() {
        if (isFunction(eventListener)) {
            eventListener();
        }
    }

    /**
     * 滚动函数
     */
    function scroll() {
        page = 0;       //初始化时为第0页
        prtNode.addEventListener('scroll', function () {
            var nDivHeight = prtNode.clientHeight;
            var nScrollTop = prtNode.scrollTop; //滚动到的当前位置
            var dHeight = nDivHeight + nScrollTop;
            var unitHeight = parseInt(calChildHeight()) * unit / cols;
            var bl = isScrollUp(prtNode);
            var divU = document.getElementById('divBlankU');
            var divD = document.getElementById('divBlankD');
            if (!bl) {
                if (dHeight > (page + 1) * unitHeight - unitHeight * 0.25) {
                    //如果此时剩余数据长度大于单元数据长度
                    if (data.length - (page + 1) * unit > unit) {
                        domInsertBy(data.slice((page + 1) * unit, (page + 2) * unit), prtNode, divD, true);
                        divD.style.height = (divBlankDH - (page + 1) * unitHeight) + 'px';
                        //加载到第2页的时候才开始删除前面的
                        if (page >= 1) {
                            deletePage(true);
                            divU.style.height = (unitHeight * (page)) + 'px';
                        }
                    } else {
                        domInsertBy(data.slice((page + 1) * unit, data.length), prtNode, divD, true);
                        divD.style.height = '0px';
                        if (page >= 1) {
                            deletePage(true);
                            divU.style.height = (unitHeight * (page)) + 'px';
                        }
                    }
                    page += 1;
                }
            } else {
                if (dHeight < (page) * unitHeight - unitHeight * 0.45) {
                    if (data.length - page * unit < unit) {
                        deletePage(false, true);
                        domInsertBy(data.slice((page - 2) * unit, (page - 1) * unit), prtNode, prtNode.childNodes[1], true);
                        divU.style.height = (unitHeight * (page - 2)) + 'px';
                        divD.style.height = (divBlankDH - (page - 1) * unitHeight) + 'px';
                    } else {
                        deletePage(false, false);
                        domInsertBy(data.slice((page - 2) * unit, (page - 1) * unit), prtNode, prtNode.childNodes[1], true);
                        divU.style.height = (unitHeight * (page - 2)) + 'px';
                        divD.style.height = (divBlankDH - (page - 1) * unitHeight) + 'px';
                    }
                    page -= 1;
                }
            }
        });
    }

    /**
     * 是否打印到控制台
     * @param obj
     */
    // //console.log = function (obj) {
    //     if (isDebug) {
    //         //console.log(obj);
    //     }
    // };

    return FixedList;
}());