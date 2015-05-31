
define(function () {
    var FieldDeferred = function (field, validateFunc) {
        this.chain = [];
        // 暂时没用
        this.chaind = false;
        //
        this.fired = -1;
        this.results = [];
        this.paused = 0;
        this.canceller = undefined;
        // 存放依赖当前field的其他field的name
        this.bedelay = {};
        //
        // 纪录当前表单是否已经检查, 不再使用
        this.checkd = false;
        this.form = null;
        // 不再使用，结果存放在form中
        this.checkResult = true;

        this.field = field;
        this.name = field.name;
        this.required = field.required;
        if (arguments.length > 1) {
            this.validate = validateFunc;
        }

        this.delay = [];
    };


    FieldDeferred.prototype = {
        /* 打开当前field检测开关
         *
         */
        start: function (method) {
            valid[4].check(this.field);
        },

        /* 对当前field添加检测函数
         *
         */
        addValidateFunc: function (validateFunc) {
            this.validate = validateFunc;
        },

        // 默认的检验函数，返回正确
        validate: function () {
            return {
                isPass: true
            }
        },


        /* 返回当前field的检测结果
         * 0:未检测， 1：检测成功， 2：检测失败
         */
        state: function () {
            if (this.fired === 0) {
                return 'unfired';
            }
            else if (this.fired === 1) {
                return 'success';
            }
            else {
                return 'error';
            }
        },

        cancel: function (e) {
            if (this.fired === -1) {
                if (this.canceller) {
                    this.canceller(this);
                }
                else {
                    this.silentlyCancelled = true;
                }
                if (!(e instanceof Error)) {
                    e = new Error(e + '');
                }
                this.errback(e);
            }
            else if ((this.fired === 0) && (this.results[0] instanceof FieldDeferred)) {
                this.results[0].cancel(e);
            }
        },

        _resback: function (val) {
            this.fired = (val instanceof Error) ? 1 : 0;
            this.results[this.fired] = val;
            if (this.paused === 0) {
                this._fire();
            }
        },

        _check: function () {
            if (this.fired !== -1) {
                //if (!this.silentlyCancelled) {
                //    throw new Error();
                //}
                //this.silentlyCancelled = false;
            }
        },

        fire: function (method, field, msg) {
            if (method === 'itemsuccess') {
                //console.warn(this);
                this.callback(field.field.value);
            }
            else {
                //console.warn(this);
                this.errback(msg);
            }
        },


        /* 对当前field增加另一个field对其的依赖。当前field check之后会对delays中所有依赖执行其相应的方法
         * filedName 依赖当前field的field名称
         * ok,ng 成功或失败的方法
         */
        addDelay: function (fieldName, ok, ng) {
            //console.warn(fieldName,ok,ng);
            ng = ng || null;
            //console.log(this.bedelay);
            this.bedelay[fieldName] = [ok, ng];
        },


        some: function (any, newdelays, ok, ng) {
            //console.log('old');
            //console.log(this.delay);
            //console.log('new');
            //console.log(newdelays);
            // 删除this.delay中的newdelays-this.delay，这里并不对newdelays中出现且没有出现在this.delay的field做处理
            var delayLength = this.delay.length;
            // es5方法，先不考虑兼容
            var that = this;
            this.delay.forEach(function (value, index, olddelay) {

                var j = newdelays.indexOf(value);
                if (j === -1) {
                    delete that.form[value].bedelay[that.name];
                    olddelay.splice(index, 1);
                }
                //var i = newdelays.indexOf(this.delay[i] !== -1) && this.delay.remove(i) && this.form[this.delay[i]].bedelay.remove(this.name);
            });

            var result = this.form.some.call(this.form, any, this, newdelays, ok, ng);
            if (result) {
                ok.call(that);
            }
            else {
                ng.call(that);
            }
            //console.log(this.delay);
        },
        // 有bug
        all: function (delays, ok, ng) {
            console.log('all');
            console.log(this);
            this.some(false, delays, ok, ng);
        },
        // 有bug
        any: function (delays, ok, ng) {
            this.some(false, delays, ok, ng);
        },

        firebedelay: function () {
            var pair;
            var fired = this.fired;
            var res = this.results[fired];
            var fn;

            //console.log(this.bedelay);
            for (pair in this.bedelay) {
                //console.warn(this.bedelay[pair]);
                fn = this.bedelay[pair][fired];
                //console.log(this);
                fn(res);
            }
        },

        callback: function (value) {
            this._check();
            if (value instanceof FieldDeferred) {
                throw new Error('FieldDeferred instances can only be chained if they are result of a callback');
            }
            this._resback(value);
        },

        errback: function (value) {
            this._check();
            if (value instanceof FieldDeferred) {
                throw new Error('FieldDeferred instances can only be chained if they are result of a callback');
            }
            if (!(value instanceof Error)) {
                value = new Error(value + '');
            }
            this._resback(value);
        },

        addCallback: function (fn) {
            if (typeof fn === 'function') {
                return this.addCallbacks(fn, null);
            }
        },

        addErrback: function () {
            if (typeof fn === 'function') {
                return this.addCallbacks(null, fn);
            }
        },

        addCallbacks: function (a, b) {
            //b = b || a;
            this.checkd = false;
            if (this.chained) {
                throw new Error('');
            }
            this.chain.push([a, b]);
            if (this.fired !== -1) {
                this._fire();
            }
            return this;
        },

        _fire: function () {
            var pair;
            var fired = this.fired;
            var res = this.results[fired];
            var fn;
            var self = this;
            // this.chain.length === 0
            //console.log(this.chain.length);
            while (this.chain.length > 0) {
                pair = this.chain.shift();
                fn = pair[fired];
                try {
                    //console.log(fn)
                    res = fn(res);
                    fired = (res instanceof Error) ? 1 : 0;
                    if (res instanceof FieldDeferred) {
                        this.paused++;
                        var cb = function (res) {
                            self.paused--;
                            self._resback(res);
                        }
                    }
                }
                catch (e) {
                    if (!(e instanceof Error)) {
                        e = new Error(e + '');
                    }
                    res = e;
                }

                this.results[fired] = res;
                this.fired = fired;
                if (this.paused && cb) {
                    res.addCallback(cb);
                    res.chained = true;
                }
            }
            this.checkd = true;
            // 当前field检查后主动根据检查结果对依赖的field进行检查
            this.firebedelay();
        }
    };
    return FieldDeferred;
});