/**
 * Created by gxxsghsn on 2015/4/23.
 */

/**
 * �󶨺�����this
 *
 * @param {Object} func ����
 * @param {Object} oThis Ҫ�󶨵�this
 * @return {*} ���ذ󶨺�ĺ���
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
 * ��Obj��ÿ��ִ��fn����
 *
 * @param {String} obj Ҫ�����Ķ���
 * @param {String} fn ����ִ�еĺ���
 */
function each(obj,fn) {
    if(!fn) return;
    if(obj instanceof Array) {//����
        for(var i = 0; i < obj.length; i++) {
            if(fn.call(obj[i],i) == false)//�����е�thisָ��obj[i],iΪ����
                break;
        }
    }else if(typeof obj === 'object') {//����
        var j = null;
        for(j in obj) {
            if(fn.call(obj[j] , j) == false)//�����е�thisָ��obj[j],jΪ��������
                break;
        }
    }
}

/**
 * ��ʽ��Date�������ݵ����
 *
 * @param {String} fmt �����ʽ ��: 'yyyy-M-d t h:m:s'
 * @return {Object} ���ظ�ʽ�����Date���   ��: '2015/4/23 ����5:04:32'
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
        't': obj.getHours()>12 ? '����' : '����'
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
 * �����������Զ����ǲ��ǿ��Ժϲ�
 *
 * @param {Object} oldProperty �����Զ���
 * @param {Object} newProperty �����Զ���
 * @return {boolean} �����Ƿ���Ժϲ�
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
 * �ϲ��������Զ���
 *
 * @param {Object} oldProperty �����Զ���
 * @param {Object} newProperty �����Զ���
 * @return {boolean} �ϲ�������Զ���
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
 * ִ�����Զ���
 *
 * @param {Object} obj ��ǰ����
 * @param {Object} accessor ���Զ���
 * @param {Object} [value] ����ֵ
 * @return {*} ����ִ�н��
 */
function excuteProperty(obj, accessors, name, value) {
    accessor = accessors[name];
    if (arguments.length === 3) {
        // ��get������valueҲ������ʱ�����ص���undefined������Ҫ��
        return accessor.get && accessor.get() || accessor.value;
    }
    if (isAccessor(accessor)) {
        return accessor.set && accessor.set(value);
    }
    accessor.value = value;
}

/**
 * ��ʽ��һ�����Զ���
 *
 * @param {Object} obj ���Զ���
 * @return {Object} ���ظ�ʽ��������Զ���
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
 * �������Զ����Ƿ�Ϊaccessor
 *
 * @param {Object} obj ���Զ���
 * @return {boolean} ΪAccessorʱ����true
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
 * ����ָ�������ԭʼֵ
 *
 * @param {string} name �����������  ��ѡ
 * @return {string} �ַ���ʽ�Ķ���������������
 */
var valueOf = function (name) {
    var accessor = this;
    if(arguments.length > 0 && this.hasOwnProperty(name)) {
        accessor = this[name];
    }
    // Array �����Ԫ�ر�ת��Ϊ�ַ�������Щ�ַ����ɶ��ŷָ���������һ��������� Array.toString �� Array.join ������ͬ��
    if (accessor instanceof Array) {
        return accessor;
    }

    // Boolean Boolean ֵ
    if (accessor instanceof Boolean) {
        return !!accessor;
    }

    // Date �洢��ʱ���Ǵ� 1970 �� 1 �� 1 ����ҹ��ʼ�Ƶĺ����� UTC��
    if (accessor instanceof Date) {
        return accessor.getTime();
    }

    // Function ��������
    if (accessor instanceof Function) {
        return accessor;
    }

    // Number ����ֵ��
    if (typeof accessor === 'number') {
        return accessor;
    }

    // accessorect ����������Ĭ�������
    if (accessor instanceof Object) {
        return accessor;
    }

    // String �ַ���ֵ��
    if (typeof accessor === 'string') {
        return accessor;
    }

    // undefined �׳�����
    if (typeof accessor === 'undefined') {
        throw new TypeError('Cannot read property "valueOf" of undefined');
    }
    return accessor;
};

/**
 * ���ַ�������ʽ����������������
 *
 * @param {string} name ����������� ��ѡ
 * @param {number} radix ��radix�������number���͵�����  ��ѡ
 * @return {string} �ַ���ʽ�Ķ���������������
 */
// ����ͨ��obj[prop].toString()����obj.toString.call(obj,prop)����obj.toString.call(obj[prop])�����һ����
var toString = function (name, radix) {
    var accessor = this;
    if(arguments.length >= 1 && this.hasOwnProperty(name)) {
        accessor = this[name];
    }

    // ���� �� Array ��Ԫ��ת��Ϊ�ַ����� ����ַ����������������ö��ŷָ���
    if (accessor instanceof Array) {
        return accessor.join(',');
    }

    // �������ֵΪ true���򷵻ء�true���� ���򷵻ء�false����
    if (typeof accessor === 'boolean') {
        return !!accessor+'';
    }

    // ���� �������ڵ��ı���ʾ��ʽ��
    if (accessor instanceof Date) {
        return accessor+'';
    }

    // ���� ����һ��������ش�����Ϣ���ַ�����
    if (accessor instanceof Error) {
        return 'Error' + (accessor.message ? ': ' + accessor.message : '');
    }

    // ����
    if (typeof accessor === 'function') {
        return accessor+'';
    }

    // Ĭ�� ���� "[accessorect accessorectname]"������ accessorectname Ϊ�������͵����ơ�
    if (accessor instanceof Object) {
        return '[Object Object]';
    }

    // �ַ��� ���� String �����ֵ��
    if (typeof accessor === 'string') {
        return accessor;
    }

    // Number �������ֵ����ֱ�ʾ��ʽ��
    if (typeof accessor === 'number') {
        // ����ת��
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
 * ���ַ�������ʽ����������������
 *
 * @param {string} name �����������
 * @return {string} �ַ���ʽ�Ķ���������������
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
 * �����Ƿ����ĳ������
 *
 * @param {string} prop �����������
 * @return {boolean} ��������true,��֮����false
 */
var hasOwnProperty = function (name) {
    var models = this.__data__;
    return name in models;
    return name in models && models[name].enumerable;
};


/**
 * �����ĳ��accessor�Ƿ�ɵ���
 *
 * @param {string} prop �����������
 * @return {string} �ɵ�������true,��֮����false
 */
var propertyIsEnumerable = function (prop) {
    var models = this.__data__;
    if(this.hasOwnProperty(prop)){
        return models[prop].enumerable;
    }
    return false;
};


/**
 * ���ض���Ĺ��캯��
 *
 * @return {*} ����Ĺ��캯��
 */
var constructor = function (name) {
    return 'Object {}';
};


/**
 * ��������һ�����ǰ׺���Է�ֹ�ظ�
 *
 * @inner
 * @type {string}
 */
var prefix = 'vb' + new Date().getTime();

/**
 * ȫ��Ψһ��ʶ��
 *
 * @inner
 * @type {number}
 */
var guid = 1;

try {
    // IE8ֻ�ܸ�DOMԪ�ض�������
    Object.defineProperty({}, '_', {
        value: 'x'
    });


}
catch (e) {

    window.execScript([

        // ִ��VB�ַ����ĺ���
        'Function parseVB(code)',
        '    ExecuteGlobal(code)',
        'End Function'

    ].join('\r\n'), 'VBScript');


    Object.defineProperties = function (properties, accessors) {


        // ���accessors����������һ������
        if (properties == null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        // ���пɼ������
        var models = {};

        // ���properties��һ��JS����
        if (properties instanceof Object) {

            // �����ͨ����,��ΪVBScript��������JS����������ɾ���ԣ�����������Ԥ�ȶ����
            each(properties, function (name, val) {
                // �����defineproperties֮ǰ�ʹ�����properties���������Ծ�Ϊtrue
                models[name] = {
                    value: val,
                    writable: true,
                    configurable: true,
                    enumerable: true
                };
            });
        }
        else {
            // �����VB������ֱ��ȡԭ�����ģ�;Ϳ�����
            models = properties.__data__;
        }

        // ��ԭ������VBʱ��������configurable���
        for (name in accessors) {
            if (properties.hasOwnProperty(name)) {
                models[name] = combine(properties[name], accessors[name]);
            }
            else {
                models[name] = accessors[name];
            }
        }

        // ����һ��Ψһ������
        var className = 'VBClass' + prefix + guid++;

        // ���������
        var buffer = [];

        // ������
        buffer.push('Class ' + className);

        buffer.push(
            // ���˽�б�����__data__���ڱ����������__proxy__���ڴ���ִ��JS������
            '    Public [__data__], [__proxy__]',

            // ���幹�캯��
            '    Public Default Function [__const__] (d, p)',
            '        Set [__data__] = d',
            '        Set [__proxy__] = p',
            '        Set [__const__] = Me',
            '    End Function',

            // ����valueOf����
            '    Public [valueOf]',

            // ����toString����
            '    Public [toString]',

            // ����toLocaleString����
            '    Public [toLocaleString]',

            // ����hasOwnProperty����
            '    Public [hasOwnProperty]',

            // ����propertyIsEnumerable����
            '    Public [propertyIsEnumerable]',

            // ����constructor����
            '    Public [constructor]'
        );

        // ��ӷ���������
        each(models, function (name) {

            buffer.push(
                // ���LET������IE67ʹ��LET������
                '    Public Property Let [' + name + '](val' + prefix + ')',
                '        Call [__proxy__](Me, [__data__], "' + name + '", val' + prefix + ')',
                '    End Property',

                // ���SET������IE8ʹ��SET������
                '    Public Property Set [' + name + '](val' + prefix + ')',
                '        Call [__proxy__](Me, [__data__], "' + name + '", val' + prefix + ')',
                '    End Property',

                // ��ӻ�ȡ����
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

        // ����ඨ�����
        buffer.push('End Class');

        // ��ӹ����ຯ��
        buffer.push(
            'Function ' + className + 'Factory(a, b)',
            '    Dim o',
            '    Set o = (New ' + className + ')(a, b)',
            '    Set ' + className + 'Factory = o',
            'End Function'
        );
        window.parseVB(buffer.join('\r\n'));

        // �õ����Ʒ
        var ret = window[className + 'Factory'](models, excuteProperty);

        // �󶨺���
        ret.hasOwnProperty = bind(hasOwnProperty, ret);
        ret.propertyIsEnumerable = bind(propertyIsEnumerable, ret);
        ret.toString = bind(toString, ret);
        ret.toLocaleString = bind(toLocaleString,ret);
        ret.valueOf = bind(valueOf, ret);
        ret.constructor = bind(constructor, ret);

        return ret;
    };
}
