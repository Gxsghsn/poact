/**
 * @file �?��֤����
 * @author lizhaoxia(lizhaoxia@baidu.com)
 */

define(function (require) {
    return [
        {
            name: 'required',
            /**
             * ��������֤����
             *
             * @param {Object} field ����֤�?������
             * @return {Object} ��֤���
             */
            check: function (field) {
                var required = field.required;
                var value = field.value;
                var isPass = true;
                console.log(value);
                // �Ǳ���?�ֱ��ͨ��
                // ֱ�Ӵ�input��ǩ�ϻ�ȡ��'required'���Ե�ֵ�����������ͬ��ͬ���п���Ϊ'required'��''
                if (required === null || required === 'false' || required === false) {
                    isPass = true;
                }

                // ����valueΪstring or array�����ж�length�Ƿ�Ϊ0����
                else if (value.length === 0) {
                    isPass = false;
                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '����Ϊ��' : ''
                };
            }
        },
        {
            name: 'maxLength',
            /**
             * ����ַ����֤����
             *
             * @param {Object} field ����֤�?������
             * @return {Object} ��֤���
             */
            check: function (field) {
                var length = field.maxLength;
                var value = field.value;
                var isPass = true;

                // value�Ƿ����Ϊ����required���ж�
                // ��valueΪ�ַ�ֱ���ж��ַ���
                // ��valueΪ���飬��Ϊcheckbox���ѡ�����ݣ�lengthΪҪ�����ݸ���
                if (value.length > 0 && value.length > length) {
                    isPass = false;
                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '���ܳ���' + length + '���ַ�' : ''
                };
            }
        },
        {
            name: 'minLength',
            /**
             * ��С�ַ����֤����
             *
             * @param {Object} field ����֤�?������
             * @return {Object} ��֤���
             */
            check: function (field) {
                var length = field.minLength;
                var value = field.value;
                var isPass = true;

                // value�Ƿ����Ϊ����required���ж�
                // ��valueΪ�ַ�ֱ���ж��ַ���
                // ��valueΪ���飬��Ϊcheckbox���ѡ�����ݣ�lengthΪҪ�����ݸ���
                if (value.length > 0 && value.length < length) {
                    isPass = false;
                }

                return {
                    isPass: isPass,
                    msg: !isPass ? field.title + '��������' + length + '���ַ�' : ''
                };
            }
        },
        {
            name: 'pattern',
            /**
             * ������ʽ��֤����
             *
             * @param {Object} field ����֤�?������
             * @return {Object} ��֤���
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
                    msg: !isPass ? field.title + '�ĸ�ʽ�����Ҫ��' : ''
                };
            }
        },
        {
            name: 'validate',
            /**
             * ������֤����ͬ��������֤���첽������֤(ajax, jsonp)
             *
             * @param {Object} field ����֤�?������
             * @return {Object} ��֤���
             */

            /*
             * form(id, asyncPending, asyncPendingCount, validateRecord,)
             * form.prototype(addValidatedRecord, addField, initFormField)
             *
             * field(field, name, required, validate)
             * field.prototype(start)
             */
            check: function (field) {
                var validateFunc = field.validate; // �û����õ���֤����
                var name = field.name;
                var value = field.value;
                var form = this;

                var async = function () {
                    form.asyncPending[name] = true; // �ݴ������첽��֤����Ϣ
                    form.asyncPendingCount++; // �����첽��֤�е��ֶθ���

                    /**
                     * �첽��֤��ɺ�Ļص�����
                     *
                     * @param {Object} result �첽��֤���
                     * @param {boolean} result.isPass �Ƿ�ͨ����֤
                     * @param {string} result.msg ��ʾ��Ϣ
                     */
                    var callback = function (result) {
                        form.asyncPending[name] = null;
                        // �˴�ԭΪdelete form.asyncPending[name];
                        // ��delete��ʹ�û��ƻ�����JavaScript����������Ż�
                        form.asyncPendingCount--;
                        if (!result.isPass) {
                            //console.log('not pass');
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
        }
    ];
});

