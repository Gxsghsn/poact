
require(['1', 'mdeferred1', 'FormBase', 'poact'], function (valid, FieldDeferred, Form, poact) {

    console.log(Form);
    var form = poact.getElementById('3');

    var field1 = poact.getElementById('i1');
    field1.addValidateFunc(function (value, async) {
        var callback = async();

        // 正常check

        //this.some(true, [field2.name], function () {
        //    alert('field2 check');
        //}, function () {
        //    alert('field2 check ng');
        //});

        setTimeout(function () {


            result = {
                isPass: false
            };
            if (value === 'field1') {
                result.isPass = true;
            }
            //console.log('in field1 check');
            callback(result);

        }, 3000);

        // 假如check需要另一个check结果
        //if (form.getResult(field2.name) > 0) {
        // xxx
        //}

        // 假如check需要等待另一个check结束才进行
        // form[field.name].all(field2, field3);
        // field.all(field2, field3)
        //form[field2.name].addDelay(field1.name, function () {
        // xx
        //});


        // bug 如果有两个check同事等待另一个check结束
        /*
         * form[field2].addCallback()
         * form[field3].addCallback()
         *
         * 此时field3的结果变成了基于上一条语句的执行结果, 而不是基于field2的执行结果
         */

    });
    form.addField(field1);

    var field2 = poact.getElementById('i2');
    field2.addValidateFunc(function (value, async) {
        var callback = async();

        // 对与单一check可行
        /*form['i1name'].addDelay(field2.name, function () {
         alert('field2 check');
         }, function () {
         alert('field2 check ng');
         });*/

        // 多个check全部通过时执行func1, 存在一个check不通过执行func2
        //console.log(this.some);
        //this.some(true, [field1.name, field3.name], function () {
        //    alert('field2 check');
        //}, function () {
        //    alert('field2 check ng');
        //});

        // 理想的API：
        // this.any([1,2,3,4], ok(), ng());
        // 替换依赖
        // this.any([4,5], ok(), ng());
        // 替换回调函数
        // this.callback()
        // 在当前依赖集的基础上增加依赖(貌似不是很实用)
        // this.any.append([1,2,3,4])

        result = {isPass: false};
        if (value === 'field2') {
            result.isPass = true;
        }
        else {
            result.msg = '*****';
        }
        callback(result);
    });
    form.addField(field2);


    var field3 = poact.getElementById('i3');
    field3.addValidateFunc(function (value, async) {
        var callback = async();

        this.all([field1.name], function () {
            alert('field3 check ok')
        }, function () {
            alert('field3 check ng')
        });
        //console.info('field2.bedelay', field2.bedelay);
        //console.info('field1.bedelay', field1.bedelay);
        setTimeout(function () {

            result = {
                isPass: false
            };
            callback(result);

        }, 100);
    });

    form.addField(field3);
    //field3.addCallbacks(function () {
    //    alert('success');
    //}, function () {
    //    alert('wrong');
    //});

    //field3.some(true, [field2.name], function () {
    //    alert('field3 check ok')
    //}, function () {
    //    alert('field3 check ng')
    //});

    EventUtil.addHandler(field1.field, 'blur', function () {
        console.log(valid[8].check(field1.field));
    });
    EventUtil.addHandler(field2.field, 'blur', function () {
        valid[4].check.call(form, field2);
    });
    EventUtil.addHandler(field3.field, 'blur', function () {
        valid[4].check.call(form, field3);
    });

    //field.start('blur');
});

