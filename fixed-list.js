/**
 * Created by Lee Sure on 2017/3/8.
 */
;(function() {
    /** Used as a safe reference for `undefined` in pre-ES5 environments. */
    var undefined;

    /** Used as the semantic version number. */
    var VERSION = '4.17.4';

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        symbolTag = '[object Symbol]',
        undefinedTag = '[object Undefined]';

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global == 'object' && global && global.Object === Object && global;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root = freeGlobal || freeSelf || Function('return this')();

    /** Detect free variable `exports`. */
    var freeExports = typeof exports == 'object' && exports && !exports.nodeType && exports;

    /** Detect free variable `module`. */
    var freeModule = freeExports && typeof module == 'object' && module && !module.nodeType && module;

    /*--------------------------------------------------------------------------*/

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var Symbol = root.Symbol,
        symToStringTag = Symbol ? Symbol.toStringTag : undefined;

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max,
        nativeMin = Math.min;

    /** Used to lookup unminified function names. */
    var realNames = {};

    function lodash() {
        // No operation performed.
    }

    function baseGetTag(value) {
        if (value == null) {
            return value === undefined ? undefinedTag : nullTag;
        }
        return (symToStringTag && symToStringTag in Object(value))
            ? getRawTag(value)
            : objectToString(value);
    }

    function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag),
            tag = value[symToStringTag];

        try {
            value[symToStringTag] = undefined;
            var unmasked = true;
        } catch (e) {}

        var result = nativeObjectToString.call(value);
        if (unmasked) {
            if (isOwn) {
                value[symToStringTag] = tag;
            } else {
                delete value[symToStringTag];
            }
        }
        return result;
    }

    function objectToString(value) {
        return nativeObjectToString.call(value);
    }

    var now = function() {
        return root.Date.now();
    };

    function debounce(func, wait, options) {
        var lastArgs,
            lastThis,
            maxWait,
            result,
            timerId,
            lastCallTime,
            lastInvokeTime = 0,
            leading = false,
            maxing = false,
            trailing = true;

        if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
        }
        wait = toNumber(wait) || 0;
        if (isObject(options)) {
            leading = !!options.leading;
            maxing = 'maxWait' in options;
            maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }

        function invokeFunc(time) {
            var args = lastArgs,
                thisArg = lastThis;

            lastArgs = lastThis = undefined;
            lastInvokeTime = time;
            result = func.apply(thisArg, args);
            return result;
        }

        function leadingEdge(time) {
            // Reset any `maxWait` timer.
            lastInvokeTime = time;
            // Start the timer for the trailing edge.
            timerId = setTimeout(timerExpired, wait);
            // Invoke the leading edge.
            return leading ? invokeFunc(time) : result;
        }

        function remainingWait(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime,
                result = wait - timeSinceLastCall;

            return maxing ? nativeMin(result, maxWait - timeSinceLastInvoke) : result;
        }

        function shouldInvoke(time) {
            var timeSinceLastCall = time - lastCallTime,
                timeSinceLastInvoke = time - lastInvokeTime;

            // Either this is the first call, activity has stopped and we're at the
            // trailing edge, the system time has gone backwards and we're treating
            // it as the trailing edge, or we've hit the `maxWait` limit.
            return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
            (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
        }

        function timerExpired() {
            var time = now();
            if (shouldInvoke(time)) {
                return trailingEdge(time);
            }
            // Restart the timer.
            timerId = setTimeout(timerExpired, remainingWait(time));
        }

        function trailingEdge(time) {
            timerId = undefined;

            // Only invoke if we have `lastArgs` which means `func` has been
            // debounced at least once.
            if (trailing && lastArgs) {
                return invokeFunc(time);
            }
            lastArgs = lastThis = undefined;
            return result;
        }

        function cancel() {
            if (timerId !== undefined) {
                clearTimeout(timerId);
            }
            lastInvokeTime = 0;
            lastArgs = lastCallTime = lastThis = timerId = undefined;
        }

        function flush() {
            return timerId === undefined ? result : trailingEdge(now());
        }

        function debounced() {
            var time = now(),
                isInvoking = shouldInvoke(time);

            lastArgs = arguments;
            lastThis = this;
            lastCallTime = time;

            if (isInvoking) {
                if (timerId === undefined) {
                    return leadingEdge(lastCallTime);
                }
                if (maxing) {
                    // Handle invocations in a tight loop.
                    timerId = setTimeout(timerExpired, wait);
                    return invokeFunc(lastCallTime);
                }
            }
            if (timerId === undefined) {
                timerId = setTimeout(timerExpired, wait);
            }
            return result;
        }
        debounced.cancel = cancel;
        debounced.flush = flush;
        return debounced;
    }

    function throttle(func, wait, options) {
        var leading = true,
            trailing = true;

        if (typeof func != 'function') {
            throw new TypeError(FUNC_ERROR_TEXT);
        }
        if (isObject(options)) {
            leading = 'leading' in options ? !!options.leading : leading;
            trailing = 'trailing' in options ? !!options.trailing : trailing;
        }
        return debounce(func, wait, {
            'leading': leading,
            'maxWait': wait,
            'trailing': trailing
        });
    }

    function eq(value, other) {
        return value === other || (value !== value && other !== other);
    }

    function isObject(value) {
        var type = typeof value;
        return value != null && (type == 'object' || type == 'function');
    }

    function isObjectLike(value) {
        return value != null && typeof value == 'object';
    }

    function isSymbol(value) {
        return typeof value == 'symbol' ||
            (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }

    function toNumber(value) {
        if (typeof value == 'number') {
            return value;
        }
        if (isSymbol(value)) {
            return NAN;
        }
        if (isObject(value)) {
            var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
            value = isObject(other) ? (other + '') : other;
        }
        if (typeof value != 'string') {
            return value === 0 ? value : +value;
        }
        value = value.replace(reTrim, '');
        var isBinary = reIsBinary.test(value);
        return (isBinary || reIsOctal.test(value))
            ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
            : (reIsBadHex.test(value) ? NAN : +value);
    }

    /*------------------------------------------------------------------------*/

    // Add methods that return wrapped values in chain sequences.
    lodash.debounce = debounce;
    lodash.throttle = throttle;

    /*------------------------------------------------------------------------*/

    // Add methods that return unwrapped values in chain sequences.
    lodash.eq = eq;
    lodash.isObject = isObject;
    lodash.isObjectLike = isObjectLike;
    lodash.isSymbol = isSymbol;
    lodash.now = now;
    lodash.toNumber = toNumber;

    lodash.VERSION = VERSION;

    /*--------------------------------------------------------------------------*/

    if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
        root._ = lodash;

        define(function() {
            return lodash;
        });
    }
    else if (freeModule) {
        (freeModule.exports = lodash)._ = lodash;
        freeExports._ = lodash;
    }
    else {
        root._ = lodash;
    }
}.call(this));

function FixedList(parentNode, dat, function1) {
    var isDebug = false,
        divBlankUH,     //上方显示空白区域高度
        divBlankDH,     //下方显示空白区域高度
        lastScrollTop = 0,   //上次滑动的位置
        currentScrollTop = 0,//当前滑动的位置
        unit = 0,       //单元所充的元素个数
        cols = 0,       //列数
        childClassName, //子view的class名
        eventListener,  //事件监听
        page = 0,           //页数
        dataType,       //数据类型
        TYPE_JSON = 0,
        TYPE_STRING = 1,
        TYPE_OBJECT = 2,
        TYPE_SINGLE_STR = 3,
        TYPE_SINGLE_OBJ = 4,
        prtNode = parentNode,
        prtId = prtNode.id,
        cardHeight,
        unitHeight,
        divBlankUContent = '<div id=' + 'divBlankU-' + prtId + ' style="position: relative;"></div>',//上方显示空白区域
        divBlankDContent = '<div id=' + 'divBlankD-' + prtId + ' style="position: relative;"></div>',//下方显示空白区域
        divUId = 'divBlankU-' + prtId,
        divDId = 'divBlankD-' + prtId,
        func = function1,      //生产函数
        statesFunc = undefined, //状态函数（用来记录dom节点状态，在滑动的时候保持记忆）
        isScroll,
        olddata,
        data = handleData(dat),
        listType = 0,           //0代表纵向列表，1代表横向列表，默认为0
        scrollTimer = null;

    /**
     * 获取父节点
     * @returns {*}
     */
    this.getParentNode = function () {
        return prtNode;
    };

    /**
     * 获取父节点
     * @returns {*}
     */
    this.getDivU = function () {
        return divUId;
    };

    /**
     * 更新list数据流
     * @param dat
     */
    this.refreshData = function (dat) {
        if (dat.length == 0 || dat == null) {
            prtNode.innerHTML = '';
        } else {
            if (data == undefined) {
                data = handleData(dat);
                initData();
            } else {
                console.time(1);
                var bl = compareToOld(dat.slice(page > 0 ? (page) * unit : 0, dat.length - (page + 1) * unit > unit ? (page + 2) * unit : dat.length),
                    olddata.slice(page > 0 ? (page) * unit : 0, dat.length - (page + 1) * unit > unit ? (page + 2) * unit : dat.length));
                console.log('是否数据一样    ' + bl);
                if (bl) {
                } else {
                    data = handleData(dat);
                    replaceHtml();
                }
                console.timeEnd(1);
                olddata = data;
            }
        }
    };

    /**
     * 初始化list数据流
     * @param cls  列数
     * @param unt   每一个集群所包含的数目
     * @param func
     * @param type 0代表纵向列表，1代表横向列表
     */
    this.initList = function (cls, unt, func, type) {
        cols = cls;
        unit = unt;
        statesFunc = func;
        type != null ? listType = type : void 0;
        if (data === undefined) {
            return this;
        }
        initData();
        return this;
    };

    /**
     * 添加监听函数
     * @param listener
     */
    this.setEventListener = function (listener) {
        eventListener = listener;
        //添加后立即执行
        listen();
    };

    /**
     * 替换节点
     * @param data  单个子view的数据
     * @param childNode
     */
    this.replaceNode = function (data, childNode) {
        var dat = handleData(data);
        var div = document.createElement('div');
        var frag = document.createDocumentFragment();
        div.innerHTML = dat;
        var nodes = div.childNodes;
        for (var k = 0; k < nodes.length; k++) {
            var node = nodes[k];
            frag.appendChild(node.cloneNode(true));
        }
        childNode.parentNode.replaceChild(frag, childNode);
    };

    /**
     * 获取列表数据
     * @returns {*}
     */
    this.getDatas = function () {
        return data;
    };

    /**
     * @param dat
     * 改变数据
     */
    this.setDatas = function (dat) {
        data = handleData(dat);
    };

    this.isScrolling = function () {
        return isScroll;
    };

    function initData() {
        olddata = data;
        childClassName = getChildClassName(data);
        prtNode.innerHTML = '';     //初始化置空
        var array = [];
        var length = data.length;
        array.push(divBlankUContent);
        if (length > unit) {
            for (var k = 0; k < unit; k++) {
                array.push(data[k]);
            }
        } else {
            for (var i = 0; i < length; i++) {
                array.push(data[i]);
            }
        }
        array.push(divBlankDContent);
        prtNode.innerHTML = array.join('');
        var restData = data.slice(unit, length);            //剩余的内容
        cardHeight = calChildHeight();
        console.log('item的高度     ' + cardHeight);
        unitHeight = parseInt(cardHeight) * unit / cols;
        divBlankDH = Math.ceil(restData.length / cols) * parseInt(cardHeight);//初始化时下方空白区域的高度
        listType == 0 ? document.getElementById(divUId).style.height = '0px'
            : document.getElementById(divUId).style.width = '0px';
        listType == 0 ? document.getElementById(divUId).style.width = '100%'
            : document.getElementById(divUId).style.display = 'inline-block';
        listType == 0 ? document.getElementById(divDId).style.height = divBlankDH + 'px'
            : document.getElementById(divDId).style.width = divBlankDH + 'px';
        listType == 0 ? document.getElementById(divDId).style.width = '100%'
            : document.getElementById(divDId).style.display = 'inline-block';
        scroll();
    }

    function compareToOld(newDataArray, oldDataArray) {
        var bl = true;
        for (var i = 0, j = oldDataArray.length; i < j; i++) {
            if (!_.eq(newDataArray[i], oldDataArray[i])) {
                bl = false;
            }
        }
        return bl;
    }

    function replaceAllNode(uh) {
        console.log('currentPage    ' + page);
        var length = data.length;
        var divDoc = document.createDocumentFragment();
        if (page == 0) {
            var array = [];
            array.push(divBlankUContent);
            if (length > unit) {
                for (var k = 0; k < unit; k++) {
                    array.push(data[k]);
                }
            } else {
                for (var i = 0; i < length; i++) {
                    array.push(data[i]);
                }
            }
            array.push(divBlankDContent);
            divDoc.innerHTML = array.join('');
        }
    }

    /**
     * 替换html
     */
    function replaceHtml() {
        var length = data.length;
        if (page == 0) {
            var restData = data.slice(unit, length);            //剩余的内容
            divBlankDH = Math.ceil(restData.length / cols) * parseInt(cardHeight);//初始化时下方空白区域的高度
            replaceContent(page - 1);
        } else {
            //如果当前所在页已经超出了新数据的长度
            if (length < (page) * unit) {
                document.getElementById(divDId).style.height = '0px';
                page = Math.ceil(length / unit);
                divBlankUH = Math.ceil((page - 2) * unit / cols) * parseInt(cardHeight);//初始化时下方空白区域的高度
                replaceContent(page - 1);
            } else {
                divBlankDH = Math.ceil(data.slice(unit, length).length / cols) * parseInt(cardHeight);//初始化时下方空白区域的高度
                replaceContent(page - 1);
            }
        }
    }

    /**
     * 计算子view的高度,data中包含的子view的高度要固定，否则计算错误
     * @returns {number}
     */
    function calChildHeight() {
        var childNode = prtNode.childNodes[1];
        return listType == 0 ? parseInt($(childNode).css('height')) : parseInt($(childNode).css('width'));
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
        return data.length === 0 ? void 0 : produceData(dat, dataType);
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

    var ticking = false; // rAF 触发锁

    function onScroll() {
        if (!ticking) {
            requestAnimationFrame(realFunc);
            ticking = true;
        }
    }

    function removeAll() {
        if (typeof(jQuery) == "undefined") {
            prtNode.empty();
        } else {
            while (prtNode.hasChildNodes()) {
                prtNode.innerHTML = '';
            }
        }
    }

    function replaceContent(page) {
        if (page >= -1) {
            removeAll();
            var content = [];
            var frag = document.createDocumentFragment();
            var div = document.createElement('div');
            var dat;
            if (data.length - (page + 1) * unit > unit) {
                dat = data.slice(page > 0 ? (page) * unit : 0, (page + 2) * unit);
            } else {
                dat = data.slice(page > 0 ? (page) * unit : 0, data.length);
            }
            content.push(divBlankUContent);
            for (var i = 0; i < dat.length; i++) {
                content.push(dat[i]);
            }
            content.push(divBlankDContent);
            div.innerHTML = content.join('');
            var nodes = div.childNodes;
            for (var k = 0; k < nodes.length; k++) {
                var node = nodes[k];
                frag.appendChild(node.cloneNode(true));
            }
            prtNode.appendChild(frag);
            var divU = document.getElementById(divUId);
            var divD = document.getElementById(divDId);
            listType == 0 ? divD.style.height = (divBlankDH - (page + 1) * unitHeight) + 'px'
                : divD.style.width = (divBlankDH - (page + 1) * unitHeight) + 'px';
            listType == 0 ? document.getElementById(divDId).style.width = '100%'
                : document.getElementById(divDId).style.display = 'inline-block';
            listType == 0 ? divU.style.height = (unitHeight * (page)) + 'px'
                : divU.style.width = (unitHeight * (page)) + 'px';
            listType == 0 ? document.getElementById(divUId).style.width = '100%'
                : document.getElementById(divUId).style.display = 'inline-block';
            console.log('渲染页面');
        }
    }

    /**
     * 获取滚动条滑动方向
     * @param parentNode
     * @returns {boolean}
     */
    function isScrollUp(parentNode) {
        currentScrollTop = listType == 0 ? parentNode.scrollTop : parentNode.scrollLeft;
        var direction = currentScrollTop < lastScrollTop;
        lastScrollTop = currentScrollTop;
        return direction;
    }

    var oldTop = prtNode.scrollTop;

    function isScrolling() {
        if (scrollTimer) clearTimeout(scrollTimer);
        var newTop = listType == 0 ? prtNode.scrollTop : prtNode.scrollLeft;
        if (newTop === oldTop) {
            clearTimeout(scrollTimer);
            // console.log('停止滑动');
            isScroll = false;
        } else {
            oldTop = newTop;
            scrollTimer = setTimeout(isScrolling, 1500);
            isScroll = true;
        }
    }

    var hasChangePage;

    function realFunc() {
        // do something...
        ticking = false;
        var nDivHeight = listType == 0 ? prtNode.clientHeight : prtNode.clientWidth;
        var nScrollTop = listType == 0 ? prtNode.scrollTop : prtNode.scrollLeft; //滚动到的当前位置
        var dHeight = nDivHeight + nScrollTop;
        var bl = isScrollUp(prtNode);
        if (!bl) {
            if (dHeight > (page + 1) * unitHeight - unitHeight * 0.2) {
                // console.log('当前页   ' + page);
                // console.log(prtNode.id + '  clientHeight: ' + nDivHeight + '  scollHeight: ' + prtNode.scrollHeight
                //     + '  nScrollTop: ' + nScrollTop + '  unitHeight: ' + unitHeight + '    cardHeight    ' + cardHeight);
                //如果此时剩余数据长度大于单元数据长度
                // if (data.length - (page + 1) * unit > unit) {
                // } else {
                // }
                page += 1;
                hasChangePage = true;
            }
        } else {
            if (dHeight < (page) * unitHeight - unitHeight * 0.4) {
                // console.log('当前页   ' + page);
                // if (data.length - page * unit < unit) {
                // } else {
                // }
                page -= 1;
                hasChangePage = true;
            }
        }
    }

    /**
     * 滚动函数
     */
    function scroll() {
        page = 0;       //初始化时为第0页
        prtNode.addEventListener('scroll', realFunc, false);
        prtNode.addEventListener('scroll', isScrolling, false);
        prtNode.addEventListener('scroll', _.throttle(function () {
            if (hasChangePage) {
                if (!isScrollUp(prtNode)) {
                    replaceContent(page - 1);
                } else {
                    replaceContent(page - 1);
                }
                statesFunction();
                hasChangePage = false;
            }
        }, 200), false);
    }

    function statesFunction() {
        isFunction(statesFunc) ? statesFunc() : void 0;
    }
}