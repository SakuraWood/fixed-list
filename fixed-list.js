/**
 * Copyright {Sakura Wood}

 Licensed under the Apache License, Version 2.0 (the "License");
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

 http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.
 * Created by Lee Sure on 2017/3/8.
 */
;(function (name, factory) {
    //导出为CMD规范的模块
    if (typeof module === "object" && typeof module.exports === "object") {
        module.exports = factory();
    } else {
        this[name] = factory();
    }
}('FixedList', function () {
    'use strict';

    var
        version = '0.0.1',  //版本号
        TYPE_JSON = 0,      //JSON数据
        TYPE_STRING = 1,    //string 类数据
        TYPE_OBJECT = 2,    //object 类数据
        TYPE_SINGLE_STR = 3, //单个string
        TYPE_SINGLE_OBJ = 4, //单个object

        /**
         * 生成FixedList，并初始化部分数据
         * @param parentNode 父节点
         * @param dat   原始数据
         * @param produceFunc   生产函数
         * @constructor
         */
        FixedList = function (parentNode, dat, produceFunc) {
            var self = this;
            self.prtNode = parentNode;
            self.data = self._handleData(dat);
            self.produceFunc = produceFunc;
            self.prtId = self.prtNode.id;
            self.divBlankUContent
                = '<div id=' + 'divBlankU-' + self.prtId + ' style="position: relative;"></div>';//上方空白区域
            self.divBlankDContent
                = '<div id=' + 'divBlankD-' + self.prtId + ' style="position: relative;"></div>';//下方空白区域
            self.listType = 0;           //0代表纵向列表，1代表横向列表，默认为0
            self.divUId = 'divBlankU-' + self.prtId;
            self.divDId = 'divBlankD-' + self.prtId;
            self.oldTop = self.prtNode.scrollTop;
        };

    FixedList.prototype = {
        /**
         * 初始化列表显示
         * @param cls 表示列表有几列
         * @param unt 表示一个单位内显示的数量
         * @param statesFunc 状态函数
         * @param type 类型
         * @returns {FixedList}
         */
        initList: function (cls, unt, statesFunc, type) {
            this.cols = cls;
            this.unit = unt;
            this.statesFunc = statesFunc;
            this.type = type;

            type != null ? this.listType = type : void 0;
            if (data === undefined) {
                return this;
            }
            this._initData();
        },

        /**
         * 设置监听函数并立即启用监听
         * @param listener 监听函数
         */
        setEventListener: function (listener) {
            this.eventListener = listener;
            this._listen();
        },

        /**
         * 设置数据
         * @param data 需要设置的数据源
         */
        setDatas: function (data) {
            this.data = this._handleData(data);
        },

        /**
         * 获取父节点
         * @returns {*}
         */
        getParentNode: function () {
            return this.prtNode;
        },

        /**
         * 获取是否正在滑动
         * @returns {boolean}
         */
        isScrolling: function () {
            return this.isScroll;
        },

        /**
         * 刷新数据
         * @param dat 需要刷新的数据源
         */
        refreshData: function (dat) {
            if (dat.length == 0 || dat == null) {
                this.prtNode.innerHTML = '';
            } else {
                if (this.data == undefined) {
                    this.data = this._handleData(dat);
                    this._initData();
                } else {
                    console.time(1);
                    var bl = this._compareToOld(dat.slice(this.page > 0 ? (this.page) * this.unit : 0, dat.length - (this.page + 1) * this.unit > this.unit ? (this.page + 2) * this.unit : dat.length),
                        this.olddata.slice(this.page > 0 ? (this.page) * this.unit : 0, dat.length - (this.page + 1) * this.unit > this.unit ? (this.page + 2) * this.unit : dat.length));
                    console.log('是否数据一样    ' + bl);
                    if (bl) {
                    } else {
                        this.data = this._handleData(dat);
                        this._replaceHtml();
                    }
                    console.timeEnd(1);
                    this.olddata = data;
                }
            }
        },

        /**
         * 是否向上滑
         * @param parentNode 父节点
         * @returns {boolean}
         */
        _isScrollUp: function (parentNode) {
            this.currentScrollTop = this.listType == 0 ? parentNode.scrollTop : parentNode.scrollLeft;
            var direction = this.currentScrollTop < this.lastScrollTop;
            this.lastScrollTop = this.currentScrollTop;
            return direction;
        },

        /**
         * 滑动函数，包括三种滑动监听: 1.记录页数 2.记录是否正在滑动 3.节流函数，防止页面频繁刷新
         * @param self 列表本身
         * @private
         */
        _scroll: function (self) {
            self.page = 0;       //初始化时为第0页
            self.prtNode.addEventListener('scroll', function () {
                self._realFunc(self);
                self._isScrolling(self);
                throttle(function () {
                    if (self.hasChangePage) {
                        if (!self._isScrollUp(self.prtNode)) {
                            self._replaceContent(self.page - 1);
                        } else {
                            self._replaceContent(self.page - 1);
                        }
                        self._statesFunction();
                        self.hasChangePage = false;
                    }
                }, 200);
            }, false);
            self.prtNode.addEventListener('scroll', throttle(function () {
                if (self.hasChangePage) {
                    if (!self._isScrollUp(self.prtNode)) {
                        self._replaceContent(self.page - 1);
                    } else {
                        self._replaceContent(self.page - 1);
                    }
                    self._statesFunction();
                    self.hasChangePage = false;
                }
            }, 200), false);
        },

        /**
         * 记录页数，每一次滑动所改变的当前页，在页面页码号改变时，置hasChangePage标志为true
         * @param self 列表本身
         * @private
         */
        _realFunc: function (self) {
            // do something...
            var nDivHeight = self.listType == 0 ? self.prtNode.clientHeight : self.prtNode.clientWidth;
            var nScrollTop = self.listType == 0 ? self.prtNode.scrollTop : self.prtNode.scrollLeft; //滚动到的当前位置
            var dHeight = nDivHeight + nScrollTop;
            var bl = self._isScrollUp(self.prtNode);
            if (!bl) {
                if (dHeight > (self.page + 1) * self.unitHeight - self.unitHeight * 0.2) {
                    self.page += 1;
                    self.hasChangePage = true;
                }
            } else {
                if (dHeight < (self.page) * self.unitHeight - self.unitHeight * 0.4) {
                    self.page -= 1;
                    self.hasChangePage = true;
                }
            }
        },

        /**
         * 记录是否正在滑动
         * @param self 列表本身
         * @private
         */
        _isScrolling: function (self) {
            self.scrollTimer ? clearTimeout(self.scrollTimer) : void 0;
            var newTop = self.listType == 0 ? self.prtNode.scrollTop : self.prtNode.scrollLeft;
            if (newTop === self.oldTop) {
                clearTimeout(self.scrollTimer);
                // console.log('停止滑动');
                self.isScroll = false;
            } else {
                self.oldTop = newTop;
                self.scrollTimer = setTimeout(function () {
                    self._isScrolling(self);
                }, 1500);
                self.isScroll = true;
            }
        },

        /**
         * 监听函数
         * @private
         */
        _listen: function () {
            if (isFunction(this.eventListener)) {
                this.eventListener();
            }
        },

        /**
         * 处理原始数据源
         * @param data 原始数据源
         * @returns {*}
         * @private
         */
        _handleData: function (data) {
            var dat;
            try {
                dat = JSON.parse(data);
                this.dataType = TYPE_JSON;
            } catch (err) {
                try {
                    if (typeof(data[0]) == 'string' && !(typeof (data) == 'string')) {
                        this.dataType = TYPE_STRING;
                        dat = data;
                    } else if (typeof(data[0]) == 'object') {
                        this.dataType = TYPE_OBJECT;
                        dat = data;
                    } else if (typeof (data) == 'string') {
                        this.dataType = TYPE_SINGLE_STR;
                        dat = data;
                    } else if (typeof(data) == 'object' && !(typeof(data[0]) == 'object')) {
                        this.dataType = TYPE_SINGLE_OBJ;
                        dat = data;
                    }
                } catch (e) {

                }
            }
            return data.length === 0 ? void 0 : this._produceData(dat, this.dataType);
        },

        /**
         * 根据生产函数将数据转化为html字符串，以供之后innerHtml使用
         * @param dat 原始数据源
         * @param type 数据类型
         * @returns {*}
         * @private
         */
        _produceData: function (dat, type) {
            var dt;
            var content = [];
            switch (type) {
                case TYPE_JSON:
                case TYPE_OBJECT:
                    for (var k = 0; k < dat.length; k++) {
                        content.push(this.produceFunc(dat[k]));
                    }
                    dt = content;
                    break;
                case TYPE_STRING:
                    dt = dat;
                    break;
                case TYPE_SINGLE_OBJ:
                    content.push(this.produceFunc(dat));
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
        },

        /**
         * 替换html
         * @private
         */
        _replaceHtml: function () {
            var length = this.data.length;
            if (this.page == 0) {
                var restData = this.data.slice(this.unit, length);            //剩余的内容
                this.divBlankDH = Math.ceil(restData.length / this.cols) * parseInt(this.cardHeight);//初始化时下方空白区域的高度
                this._replaceContent(this.page - 1);
            } else {
                //如果当前所在页已经超出了新数据的长度
                if (length < (this.page) * this.unit) {
                    document.getElementById(divDId).style.height = '0px';
                    this.page = Math.ceil(length / this.unit);
                    this.divBlankUH = Math.ceil((this.page - 2) * this.unit / this.cols) * parseInt(this.cardHeight);//初始化时下方空白区域的高度
                    this._replaceContent(this.page - 1);
                } else {
                    this.divBlankDH = Math.ceil(data.slice(this.unit, length).length / this.cols) * parseInt(this.cardHeight);//初始化时下方空白区域的高度
                    this._replaceContent(this.page - 1);
                }
            }
        },

        /**
         * 移除所有子节点
         * @private
         */
        _removeAll: function () {
            if (typeof(jQuery) == "undefined") {
                this.prtNode.empty();
            } else {
                while (this.prtNode.hasChildNodes()) {
                    this.prtNode.innerHTML = '';
                }
            }
        },

        /**
         * 根据页码号替换html内容
         * @param page 页码号
         * @private
         */
        _replaceContent: function (page) {
            if (page >= -1) {
                this._removeAll();
                var content = [];
                var frag = document.createDocumentFragment();
                var div = document.createElement('div');
                var dat;
                if (this.data.length - (page + 1) * this.unit > this.unit) {
                    dat = this.data.slice(page > 0 ? (page) * this.unit : 0, (page + 2) * this.unit);
                } else {
                    dat = this.data.slice(page > 0 ? (page) * this.unit : 0, this.data.length);
                }
                content.push(this.divBlankUContent);
                for (var i = 0; i < dat.length; i++) {
                    content.push(dat[i]);
                }
                content.push(this.divBlankDContent);
                div.innerHTML = content.join('');
                var nodes = div.childNodes;
                for (var k = 0; k < nodes.length; k++) {
                    var node = nodes[k];
                    frag.appendChild(node.cloneNode(true));
                }
                this.prtNode.appendChild(frag);
                var divU = document.getElementById(this.divUId);
                var divD = document.getElementById(this.divDId);
                this.listType == 0 ? divD.style.height = (this.divBlankDH - (page + 1) * this.unitHeight) + 'px'
                    : divD.style.width = (this.divBlankDH - (page + 1) * this.unitHeight) + 'px';
                this.listType == 0 ? document.getElementById(this.divDId).style.width = '100%'
                    : document.getElementById(this.divDId).style.display = 'inline-block';
                this.listType == 0 ? divU.style.height = (this.unitHeight * (page)) + 'px'
                    : divU.style.width = (this.unitHeight * (page)) + 'px';
                this.listType == 0 ? document.getElementById(this.divUId).style.width = '100%'
                    : document.getElementById(this.divUId).style.display = 'inline-block';
                console.log('渲染页面');
            }
        },

        /**
         * 插入节点
         * @param data
         * @param parentNode
         * @param childNode
         * @param isPre
         * @private
         */
        _domInsertBy: function (data, parentNode, childNode, isPre) {
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
        },

        /**
         * 删除一页
         * @param isPre
         * @param isLast
         * @private
         */
        _deletePage: function (isPre, isLast) {
            var childNodes = document.getElementsByClassName(this.childClassName);
            var length = childNodes.length;
            //循环删除数组，倒序删除
            if (isPre) {
                for (var i = this.unit - 1; i >= 0; i--) {
                    this._domDelete(childNodes[i]);
                }
            } else {
                if (isLast) {
                    for (var k = length - 1; k >= parseInt(length / this.unit) * this.unit; k--) {
                        this._domDelete(childNodes[k]);
                    }
                } else {
                    for (var j = length - 1; j >= length - this.unit; j--) {
                        this._domDelete(childNodes[j]);
                    }
                }
            }
        },

        /**
         * 删除节点
         * @param node
         * @private
         */
        _domDelete: function (node) {
            if (typeof(jQuery) == "undefined") {
                node.parentNode.removeChild(node);
                node = null;
            } else {
                $(node).remove();
            }
        },

        /**
         * 根据数据初始化显示，启用scroll监听函数
         * @private
         */
        _initData: function () {
            this.olddata = this.data;
            this.childClassName = this._getChildClassName(this.data);
            this.prtNode.innerHTML = '';     //初始化置空
            var array = [];
            var length = this.data.length;
            array.push(this.divBlankUContent);
            if (length > this.unit) {
                for (var k = 0; k < this.unit; k++) {
                    array.push(this.data[k]);
                }
            } else {
                for (var i = 0; i < length; i++) {
                    array.push(this.data[i]);
                }
            }
            array.push(this.divBlankDContent);
            this.prtNode.innerHTML = array.join('');
            var restData = this.data.slice(this.unit, length);            //剩余的内容
            this.cardHeight = this._calChildHeight();
            console.log('item的高度     ' + this.cardHeight);
            this.unitHeight = parseInt(this.cardHeight) * this.unit / this.cols;
            this.divBlankDH = Math.ceil(restData.length / this.cols) * parseInt(this.cardHeight);//初始化时下方空白区域的高度
            this.listType == 0 ? document.getElementById(this.divUId).style.height = '0px'
                : document.getElementById(this.divUId).style.width = '0px';
            this.listType == 0 ? document.getElementById(this.divUId).style.width = '100%'
                : document.getElementById(this.divUId).style.display = 'inline-block';
            this.listType == 0 ? document.getElementById(this.divDId).style.height = this.divBlankDH + 'px'
                : document.getElementById(this.divDId).style.width = this.divBlankDH + 'px';
            this.listType == 0 ? document.getElementById(this.divDId).style.width = '100%'
                : document.getElementById(this.divDId).style.display = 'inline-block';
            this._scroll(this);
        },

        /**
         * 新旧数据比对，如果新数据和旧数据无区别，则不刷新
         * @param newDataArray  新数据
         * @param oldDataArray  旧数据
         * @returns {boolean}
         * @private
         */
        _compareToOld: function (newDataArray, oldDataArray) {
            var bl = true;
            for (var i = 0, j = oldDataArray.length; i < j; i++) {
                if (!eq(newDataArray[i], oldDataArray[i])) {
                    bl = false;
                }
            }
            return bl;
        },

        /**
         * 计算子节点高度，重要！这个函数意味着子节点高度必须固定！
         * @returns {Number}
         * @private
         */
        _calChildHeight: function () {
            var childNode = this.prtNode.childNodes[1];
            return this.listType == 0 ? parseInt($(childNode).css('height')) : parseInt($(childNode).css('width'));
        },

        /**
         * 获取子节点的className
         * @param data
         * @returns {string}
         * @private
         */
        _getChildClassName: function (data) {
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
        },

        /**
         * 状态函数，有可能会用到，因为在动态生成的机制下，一些列表状态需要额外记住
         * @private
         */
        _statesFunction: function () {
            isFunction(this.statesFunc) ? this.statesFunc() : void 0;
        }
    };

    /**
     * 判断是否为一个函数
     * @param fn
     * @returns {boolean}
     */
    function isFunction(fn) {
        return Object.prototype.toString.call(fn) === '[object Function]';
    }

    /*----------------underscore methods--------------*/
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

    function baseGetTag(value) {
        if (value == null) {
            return value === undefined ? undefinedTag : nullTag;
        }
        return (symToStringTag && symToStringTag in Object(value))
            ? getRawTag(value)
            : objectToString(value);
    }

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
        var isOwn = hasOwnProperty.call(value, symToStringTag),
            tag = value[symToStringTag];

        try {
            value[symToStringTag] = undefined;
            var unmasked = true;
        } catch (e) {
        }

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

    var now = function () {
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

    //导出为AMD规范的模块
    if (typeof define === "function" && define.amd) {
        define("fixed-list", [], function () {
            return FixedList;
        });
    }
    return FixedList;
}));