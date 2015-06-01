/**
 * @file 表单验证规则
 * @author lizhaoxia(lizhaoxia@baidu.com)
 */

define(function (require) {
    return [
        {
            name: 'required',
            /**
             * 必填项验证函数
             *
             * @param {Object} field 待验证表单项配置
             * @return {Object} 验证结果
             */
            check: function (field) {
                var required = field.required;
                var value = field.value;
                var isPass = true;
                console.log(value);
                // 非必须表单项, 直接通过
                // 直接从input标签上获取'required'属性的值有可能会因为浏览器的不同而不同, 有可能为'required'或''
                if (required === null || required === 'false' || required === false) {
                    isPass = true;
                }

                // 不论value为string or array, 均判断length是否为0即可
                else if (value.length === 0) {
                    isPass = false;
                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '不能为空' : ''
                };
            }
        },
        {
            name: 'maxLength',
            /**
             * 最大字符长度验证函数
             *
             * @param {Object} field 待验证表单项配置
             * @return {Object} 验证结果
             */
            check: function (field) {
                var length = field.maxLength;
                var value = field.value;
                var isPass = true;

                // value是否可以为空由required来判断
                // 若value为字符串, 直接判断字符串长度
                // 若value为数组, 则为checkbox组合选择的数据, length为要求的数据个数
                if (value.length > 0 && value.length > length) {
                    isPass = false;
                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '不能超过' + length + '个字符' : ''
                };
            }
        },
        {
            name: 'minLength',
            /**
             * 最小字符长度验证函数
             *
             * @param {Object} field 待验证表单项配置
             * @return {Object} 验证结果
             */
            check: function (field) {
                var length = field.minLength;
                var value = field.value;
                var isPass = true;

                // value是否可以为空由required来判断
                // 若value为字符串, 直接判断字符串长度
                // 若value为数组, 则为checkbox组合选择的数据, length为要求的数据个数
                if (value.length > 0 && value.length < length) {
                    isPass = false;
                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '不能少于' + length + '个字符' : ''
                };
            }
        },
        {
            name: 'pattern',
            /**
             * 正则表达式验证函数
             *
             * @param {Object} field 待验证表单项配置
             * @return {Object} 验证结果
             */
            check: function (field) {
                var pattern = field.pattern;
                var value = field.value;
                var isPass = true;

                if (value.length > 0 && !new RegExp(pattern).test(value)) {
                    isPass = false;
                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合pattern要求' : ''
                };
            }
        },
        {
            name: 'validate',
            /**
             * 函数验证, 包含同步函数验证和异步函数验证(ajax, jsonp)
             *
             * @param {Object} field 待验证表单项配置
             * @return {Object} 验证结果
             */

            /*
             * form(id, asyncPending, asyncPendingCount, validateRecord,)
             * form.prototype(addValidatedRecord, addField, initFormField)
             *
             * field(field, name, required, validate)
             * field.prototype(start)
             */
            check: function (field) {
                var validateFunc = field.validate; // 用户配置的验证函数
                var name = field.name;
                var value = field.value;
                var form = this;

                var async = function () {
                    form.asyncPending[name] = true; // 暂存正在异步验证中的信息
                    form.asyncPendingCount++; // 正在异步验证中的字段个数

                    /**
                     * 异步验证完成后的回调函数
                     *
                     * @param {Object} result 异步验证结果
                     * @param {boolean} result.isPass 是否通过验证
                     * @param {string} result.msg 提示信息
                     */
                    var callback = function (result) {
                        form.asyncPending[name] = null;
                        // 此处原为delete form.asyncPending[name]
                        // 但delete得使用会破坏JavaScript引擎的性能优化
                        form.asyncPendingCount--;
                        if (!result.isPass) {

                            form[name].fire('itemerror', field, result.msg);
                            form.addValidatedRecord(name, false);
                        }
                        else {
                            console.log('pass');
                            //console.log(form);
                            form[name].fire('itemsuccess', field);
                            form.addValidatedRecord(name, true);
                        }
                    };

                    return callback;
                };
                console.log(this);
                return validateFunc.call(field, value, async);
            }
        },

        {
            name: 'time',
            check: function (field) {
                var value = field.value;
                var isPass = true;
                var pattern = new RegExp('(\\d{2}):(\\d{2})');
                var result;

                result = pattern.exec(value);
                if ((!result || result[1] < 0 || result[1] > 23 || result[2] < 0 || result[2] > 59) && value !== '') {
                    isPass = false;
                }
                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合time要求' : ''
                }
            }
        },
        {
            name: 'month',
            check: function (field) {
                var value = field.value;
                var isPass = true;
                var pattern = new RegExp('(\\d{4})-(\\d{2})');
                var result;

                result = pattern.exec(value);
                if ((!result || result[1] < 0 || result[2] < 0 || result[2] > 12) && value !== '') {
                    isPass = false;
                }
                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合month要求' : ''
                }
            }
        },

        {
            name: 'url',
            check: function (field) {
                var value = field.value;
                var isPass = true;
                var pattern = new RegExp('(\\d{4})-(\\d{2})');
                var result;

                if (!pattern.test(value) && value !== '') {
                    isPass = false;
                }
                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合url要求' : ''
                }
            }
        },
        {
            name: 'email',
            check: function (field) {
                var value = field.value;
                var isPass = true;
                var pattern = new RegExp('^[A-Za-z0-9]+@\\w+\\.[com|com\\.cn|net|cn|net\\.cn|org|biz|info|gov|gov\\.cn|edu|edu\\.cn]');
                var result;

                console.log(value);
                if (!pattern.test(value) && value !== '') {
                    alert('he');
                    isPass = false;
                }
                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合email要求' : ''
                }
            }
        },
        {
            name: 'date',
            check: function (field) {
                var value = field.value;
                var isPass = true;
                var pattern = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})');
                var result;

                result = pattern.exec(value);
                if ((result === null || result[1] < 0 || result[2] < 0 || result[2] > 12) && value !== '') {
                    isPass = false;
                }
                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合date要求' : ''
                }
            }
        },
        {
            name: 'number',
            check: function (field) {
                var value = field.value;
                var isPass = true;
                var pattern = new RegExp('(\\d{4})-(\\d{2})');
                var result;

                value = parseInt(value);
                var min = field.getAttribute('min'),
                    max = field.getAttribute('max');

                if (min || max) {
                    if (!min) {
                        min = 0;
                    }
                    if (!max) {
                        max = 9007199254740992;
                    }
                    if (value > max || value < min) {
                        isPass = false;
                    }

                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合number要求' : ''
                }
            }
        },
        {
            name: 'datetime-local',
            check: function (field) {
                var value = field.value;
                var isPass = true;
                var pattern = new RegExp('^(\\d{4})-(\\d{2})-(\\d{2})');
                var result;

                if ((!pattern.test(value) || result[1] < 0 || result[2] < 0 || result[2] > 12) && value !== '') {
                    isPass = false;
                }
                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '的格式不符合要求' : ''
                }
            }
        }
    ];
});

