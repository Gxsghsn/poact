
define(function () {
    console.log('in FormBase');
    var Form = function (form) {
        this.form = form;
        this.id = setTimeout('1');
        this.asyncPending = {};
        this.asyncPendingCount = 0;
        this.validateRecord = {};
    };

    Form.prototype = {
        /* 添加当前form中的所有field到当前form
         *
         */
        addAllField: function () {

        },

        /* 添加检测有效值
         *
         */
        addValidatedRecord: function (name, result) {
            this.validateRecord[name] = result;
        },

        /*
         * ?Form??????
         *
         * @param {Field} ????field
         */
        addField: function (field) {
            this[field.name] = field;
            field.form = this;
            this.validateRecord[field.name] = true;
        },

        /**
         * 返回当前Form中记录的field的结果
         *
         * 这里使用记录结果而不是对field进行check，
         * 有可能存在的情况是：field正在进行check，还未callback，所以getResult得到callback之前的值。
         * 所以在callback之后会触发一次fireDelays
         *
         * @param {String} name 需要的field的name
         * @return {Number} -1：不存在这样的记录， 0：记录为失败， 1：记录为成功
         */
        getResult: function (name) {
            if (this.hasOwnProperty(name)) {
                return !!this.validateRecord[name];
            }
            return -1;
        },

        // 当前版本中不再使用，为了以防万一留着
        initFormField: function (name) {
            this[name] = new FieldDeferred(this, name);
            this.validateRecord[name] = true;
        },

        some: function (any, target, relays, ok, ng) {
            var resullt = false,
                n = 0,
                that = this;
            //console.log('in form some');
            // 默认结果为false
            var continueCheck = true;
            for (var i = 0; i < relays.length; i++) {
                if (continueCheck) {
                    var val = that.getResult(relays[i]);
                    // 通过
                    //console.info(val, relays[i]);
                    //console.warn(this.validateRecord);
                    if (val) {
                        // 如果是any 或者 返回都返回结果， 则纪录成功并不再进行check
                        if (any || n >= relays.length - 1) {
                            continueCheck = false;
                            resullt = true;
                        }
                    }
                    // 不通过
                    else {
                        // 如果是all， 则纪录失败，并不再进行check
                        if (!any) {
                            continueCheck = false;
                            resullt = false;
                        }
                    }
                    n++;
                }
                this[relays[i]].addDelay(target.name, ok, ng);
                //console.log(target);
                if (target.delay.indexOf(relays[i]) === -1) {
                    target.delay.push(relays[i]);
                }
            }
            return resullt;
        },

        all: function (target, delays, ok, ng) {
            return this.some(false, target, delays, ok, ng);
        },

        any: function (target, delays, ok, ng) {
            console.log('in any');
            return this.some(true, target, delays, ok, ng);
        }
    };
    return Form;
});