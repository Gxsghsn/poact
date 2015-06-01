/**
 * Created by gxxsghsn on 2015/4/23.
 */

/**
 * 绑定函数的this
 *
 * @param {Object} func 函数
 * @param {Object} oThis 要绑定的this
 * @return {*} 返回绑定后的函数
 */
var bind = function (func, oThis) {
    if (typeof func !== "function") {
        throw new TypeError("function is not callable");
    }

    return function(){
        return func.apply(oThis, arguments);
    };
};

/**
 * 对Obj中每个执行fn函数
 *
 * @param {String} obj 要迭代的对象
 * @param {String} fn 迭代执行的函数
 */
function each(obj,fn) {
    if(!fn) return;
    if(obj instanceof Array) {//数组
        for(var i = 0; i < obj.length; i++) {
            if(fn.call(obj[i],i) == false)//函数中的this指向obj[i],i为索引
                break;
        }
    }else if(typeof obj === 'object') {//对象
        var j = null;
        for(j in obj) {
            if(fn.call(obj[j] , j) == false)//函数中的this指向obj[j],j为属性名称
                break;
        }
    }
}

/**
 * 格式化Date类型数据的输出
 *
 * @param {String} fmt 输出格式 例: 'yyyy-M-d t h:m:s'
 * @return {Object} 返回格式化后的Date输出   例: '2015/4/23 下午5:04:32'
 */
var dateFormat = function(obj ,fmt) {
    var o = {
        'M+': obj.getMonth()+1,
        'd+': obj.getDate(),
        'h+': obj.getHours()%12,
        'm+': obj.getMinutes(),
        's+': obj.getSeconds(),
        'q+': Math.floor((obj.getMonth()+3)/3),
        'S': obj.getMilliseconds(),
        't': obj.getHours()>12 ? '上午' : '下午'
    };
    if(/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (obj.getFullYear()+'').substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp('(' + k + ')').test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (('00' + o[k]).substr(('' + o[k].length))));
        }
    }
    return fmt;
};

/**
 * 测试两个属性定义是不是可以合并
 *
 * @param {Object} oldProperty 旧属性定义
 * @param {Object} newProperty 新属性定义
 * @return {boolean} 返回是否可以合并
 */
function combinable(oldProperty, newProperty) {

    return !oldProperty || oldProperty.configurable
        || !newProperty.configurable
        && (!('enumerable' in newProperty) || oldProperty.enumerable === newProperty.enumerable)
        && oldProperty.set === newProperty.set
        && oldProperty.get === newProperty.get
        && ((oldProperty.writable === false
        && !('value' in newProperty && oldProperty.value !== newProperty.value)
        && !('writable' in newProperty && newProperty.writable !== oldProperty.writable))
        || oldProperty.writable === true);
}

/**
 * 合并两个属性定义
 *
 * @param {Object} oldProperty 旧属性定义
 * @param {Object} newProperty 新属性定义
 * @return {boolean} 合并后的属性定义
 */
function combine(oldProperty, newProperty) {
    if(!combinable(oldProperty,newProperty)) {
        throw new TypeError(' Cannot redefine property');
    }

    var newProperty2 = formatProperty(newProperty);

    for(var i in oldProperty) {
        if (i in newProperty2 && !(i in newProperty)) {
            newProperty2[i] = oldProperty[i];
        }
    }

    return newProperty2;

}

/**
 * 执行属性定义
 *
 * @param {Object} obj 当前对象
 * @param {Object} accessor 属性定义
 * @param {Object} [value] 属性值
 * @return {*} 返回执行结果
 */
function excuteProperty(obj, accessors, name, value) {
    accessor = accessors[name];
    if (arguments.length === 3) {
        // 当get不存在value也不存在时，返回的是undefined，满足要求
        return accessor.get && accessor.get() || accessor.value;
    }
    if (isAccessor(accessor)) {
        return accessor.set && accessor.set(value);
    }
    accessor.value = value;
}

/**
 * 格式化一个属性定义
 *
 * @param {Object} obj 属性定义
 * @return {Object} 返回格式化后的属性定义
 */
function formatProperty(obj) {

    if (typeof obj !== 'object' || obj === null) {
        throw new TypeError('called on non-object');
    }

    var newObj = {
        enumerable: !!obj.enumerable,
        configurable: !!obj.configurable
    };

    if (isAccessor(obj)) {
        newObj.get = obj.get;
        newObj.set = obj.set;
    }
    else {
        newObj.value = obj.value;
        newObj.writable = !!obj.writable;
    }

    return newObj;
}

/**
 * 测试属性定义是否为accessor
 *
 * @param {Object} obj 属性定义
 * @return {boolean} 为Accessor时返回true
 */
function isAccessor(obj) {

    if(obj && obj.hasOwnProperty('get')) {
        var hasGet = typeof obj.get === 'function';
    }
    if(obj && obj.hasOwnProperty('set')) {
        var hasSet = typeof obj.set === 'function';
    }
    if ((hasGet || hasSet) && ('writable' in obj || 'value' in obj)) {
        throw new TypeError('A property cannot both have accessors and be writable or have a value');
    }

    return hasGet || hasSet;
}

/**
 * 返回指定对象的原始值
 *
 * @param {string} name 对象的属性名  可选
 * @return {string} 字符形式的对象或对象属性描述
 */
var valueOf = function (name) {
    var accessor = this;
    if(arguments.length > 0 && this.hasOwnProperty(name)) {
        accessor = this[name];
    }
    // Array 数组的元素被转换为字符串，这些字符串由逗号分隔，连接在一起。其操作与 Array.toString 和 Array.join 方法相同。
    if (accessor instanceof Array) {
        return accessor;
    }

    // Boolean Boolean 值
    if (accessor instanceof Boolean) {
        return !!accessor;
    }

    // Date 存储的时间是从 1970 年 1 月 1 日午夜开始计的毫秒数 UTC。
    if (accessor instanceof Date) {
        return accessor.getTime();
    }

    // Function 函数本身。
    if (accessor instanceof Function) {
        return accessor;
    }

    // Number 数字值。
    if (typeof accessor === 'number') {
        return accessor;
    }

    // accessorect 对象本身。这是默认情况。
    if (accessor instanceof Object) {
        return accessor;
    }

    // String 字符串值。
    if (typeof accessor === 'string') {
        return accessor;
    }

    // undefined 抛出错误
    if (typeof accessor === 'undefined') {
        throw new TypeError('Cannot read property "valueOf" of undefined');
    }
    return accessor;
};

/**
 * 以字符串的形式输出对象或对象的属性
 *
 * @param {string} name 对象的属性名 可选
 * @param {number} radix 以radix进制输出number类型的属性  可选
 * @return {string} 字符形式的对象或对象属性描述
 */
// 这里通过obj[prop].toString()或是obj.toString.call(obj,prop)或是obj.toString.call(obj[prop])结果是一样的
var toString = function (name, radix) {
    var accessor = this;
    if(arguments.length >= 1 && this.hasOwnProperty(name)) {
        accessor = this[name];
    }

    // 数组 将 Array 的元素转换为字符串。 结果字符串被连接起来，用逗号分隔。
    if (accessor instanceof Array) {
        return accessor.join(',');
    }

    // 如果布尔值为 true，则返回“true”。 否则返回“false”。
    if (typeof accessor === 'boolean') {
        return !!accessor+'';
    }

    // 日期 返回日期的文本表示形式。
    if (accessor instanceof Date) {
        return accessor+'';
    }

    // 错误 返回一个包含相关错误信息的字符串。
    if (accessor instanceof Error) {
        return 'Error' + (accessor.message ? ': ' + accessor.message : '');
    }

    // 函数
    if (typeof accessor === 'function') {
        return accessor+'';
    }

    // 默认 返回 "[accessorect accessorectname]"，其中 accessorectname 为对象类型的名称。
    if (accessor instanceof Object) {
        return '[Object Object]';
    }

    // 字符串 返回 String 对象的值。
    if (typeof accessor === 'string') {
        return accessor;
    }

    // Number 返回数字的文字表示形式。
    if (typeof accessor === 'number') {
        // 进制转换
        if (typeof radix !== 'undefined') {
            var value = accessor;
            if (radix < 2 || radix > 36) {
                throw new RangeError('toString() radix argument must be between 2 and 36 ');
            }
            var ret = [];
            while (value !== 0) {
                var a = value % radix;
                if (a > 10) {
                    a = String.fromCharCode(97 + a - 10);
                }
                ret.splice(0, 0, a);
                value = parseInt(value / radix);
            }
            return ret.join('');
        }
        return accessor+'';
    }

    return '[object object]';
};


/**
 * 以字符串的形式输出对象或对象的属性
 *
 * @param {string} name 对象的属性名
 * @return {string} 字符形式的对象或对象属性描述
 */
var toLocaleString = function (name) {
    if (this.hasOwnProperty(name)){
        var dateProp = this[name];
        if(dateProp instanceof Date){
            return dateFormat(dateProp, 'yyyy-M-d t h:m:s');
        }
    }
    return this.toString(name);
};

/**
 * 对象是否包含某个属性
 *
 * @param {string} prop 对象的属性名
 * @return {boolean} 包含返回true,反之返回false
 */
var hasOwnProperty = function (name) {
    var models = this.__data__;
    return name in models;
    return name in models && models[name].enumerable;
};


/**
 * 对象的某个accessor是否可迭代
 *
 * @param {string} prop 对象的属性名
 * @return {string} 可迭代返回true,反之返回false
 */
var propertyIsEnumerable = function (prop) {
    var models = this.__data__;
    if(this.hasOwnProperty(prop)){
        return models[prop].enumerable;
    }
    return false;
};


/**
 * 返回对象的构造函数
 *
 * @return {*} 对象的构造函数
 */
var constructor = function (name) {
    return 'Object {}';
};


/**
 * 用于生成一个随机前缀，以防止重复
 *
 * @inner
 * @type {string}
 */
var prefix = 'vb' + new Date().getTime();

/**
 * 全局唯一标识符
 *
 * @inner
 * @type {number}
 */
var guid = 1;

try {
    // IE8只能给DOM元素定义属性
    Object.defineProperty({}, '_', {
        value: 'x'
    });


}
catch (e) {

    window.execScript([

        // 执行VB字符串的函数
        'Function parseVB(code)',
        '    ExecuteGlobal(code)',
        'End Function'

    ].join('\r\n'), 'VBScript');


    Object.defineProperties = function (properties, accessors) {


        // 如果accessors不传，丢出一个错误
        if (properties == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        // 所有可监控属性
        var models = {};

        // 如果properties是一个JS对象
        if (properties instanceof Object) {

            // 添加普通属性,因为VBScript对象不能像JS那样随意增删属性，必须在这里预先定义好
            each(properties, function (name, val) {
                // 如果在defineproperties之前就存在与properties的其他属性均为true
                models[name] = {
                    value: val,
                    writable: true,
                    configurable: true,
                    enumerable: true
                };
            });
        }
        else {
            // 如果是VB对象，则直接取原对象的模型就可以了
            models = properties.__data__;
        }

        // 当原对象不是VB时，不进行configurable检查
        for (name in accessors) {
            if (properties.hasOwnProperty(name)) {
                models[name] = combine(properties[name], accessors[name]);
            }
            else {
                models[name] = accessors[name];
            }
        }

        // 生成一个唯一的类名
        var className = 'VBClass' + prefix + guid++;

        // 生成类代码
        var buffer = [];

        // 定义类
        buffer.push('Class ' + className);

        buffer.push(
            // 添加私有变量（__data__用于保存访问器，__proxy__用于代理执行JS函数）
            '    Public [__data__], [__proxy__]',

            // 定义构造函数
            '    Public Default Function [__const__] (d, p)',
            '        Set [__data__] = d',
            '        Set [__proxy__] = p',
            '        Set [__const__] = Me',
            '    End Function',

            // 定义valueOf方法
            '    Public [valueOf]',

            // 定义toString方法
            '    Public [toString]',

            // 定义toLocaleString方法
            '    Public [toLocaleString]',

            // 定义hasOwnProperty方法
            '    Public [hasOwnProperty]',

            // 定义propertyIsEnumerable方法
            '    Public [propertyIsEnumerable]',

            // 定义constructor方法
            '    Public [constructor]'
        );

        // 添加访问器属性
        each(models, function (name) {

            buffer.push(
                // 添加LET方法（IE67使用LET方法）
                '    Public Property Let [' + name + '](val' + prefix + ')',
                '        Call [__proxy__](Me, [__data__], "' + name + '", val' + prefix + ')',
                '    End Property',

                // 添加SET方法（IE8使用SET方法）
                '    Public Property Set [' + name + '](val' + prefix + ')',
                '        Call [__proxy__](Me, [__data__], "' + name + '", val' + prefix + ')',
                '    End Property',

                // 添加获取方法
                '    Public Property Get [' + name + ']',
                '    On Error Resume Next',
                '        Set [' + name + '] = [__proxy__](Me, [__data__],"' + name + '")',
                '    If Err.Number <> 0 Then',
                '        [' + name + '] = [__proxy__](Me, [__data__],"' + name + '")',
                '    End If',
                '    On Error Goto 0',
                '    End Property'
            );
        });

        // 添加类定义结束
        buffer.push('End Class');

        // 添加工厂类函数
        buffer.push(
            'Function ' + className + 'Factory(a, b)',
            '    Dim o',
            '    Set o = (New ' + className + ')(a, b)',
            '    Set ' + className + 'Factory = o',
            'End Function'
        );
        window.parseVB(buffer.join('\r\n'));

        // 得到其产品
        var ret = window[className + 'Factory'](models, excuteProperty);

        // 绑定函数
        ret.hasOwnProperty = bind(hasOwnProperty, ret);
        ret.propertyIsEnumerable = bind(propertyIsEnumerable, ret);
        ret.toString = bind(toString, ret);
        ret.toLocaleString = bind(toLocaleString,ret);
        ret.valueOf = bind(valueOf, ret);
        ret.constructor = bind(constructor, ret);

        return ret;
    };
}
