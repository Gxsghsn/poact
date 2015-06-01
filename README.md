# poact
使用方式:
    email:
    EventUtil.addHandler(field1.field, 'blur', function () {
            console.log(valid[8].check(field1.field));
        });


    1: 用户自定义函数：
        // 例1: 常规自定义函数
        var field2 = poace.getElementById('i2');
        field2.addValidateFunc(function (value, async) {
            var callback = async();
            result = {isPass: false};
            if (value === 'field2') {
                result.isPass = true;
            }
            else {
                result.isPass = false;
                result.msg = '*****';
            }
            callback(result);
        });
        form.addField(field2);

        // all依赖
        var field3 = poact.getElementById('i3');
        field3.addValidateFunc(function (value, async) {
            var callback = async();

            // all依赖
            this.all([field1.name, field2.name], function () {
                alert('field3 check ok')
            }, function () {
                alert('field3 check ng')
            });
            setTimeout(function () {

                result = {
                    isPass: false
                };
                callback(result);

            }, 100);
        });
        form.addField(field3);

        // any依赖
        var field3 = poact.getElementById('i3');
        field3.addValidateFunc(function (value, async) {
            var callback = async();

            // all依赖
            this.any([field1.name, field2.name], function () {
                alert('field3 check ok')
            }, function () {
                alert('field3 check ng')
            });
            setTimeout(function () {

                result = {
                    isPass: false
                };
                callback(result);

            }, 100);
        });
        form.addField(field3);

        //all依赖或者any依赖的callback仍然是异步
