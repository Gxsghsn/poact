define(['Field', 'Form', '1'], function (FieldDeferred, Form, valid) {

    function getElementById (id) {
        var target = document.getElementById(id);
        if (target.tagName !== 'FORM') {
            target = new FieldDeferred(target);
        }
        else {
            target = new Form(target);
        }
        return target;
    }


    var ret = {};
    ret.getElementById = getElementById;
    var item = ['required', 'maxLength', 'minLength', 'pattern', 'validate', 'time', 'month', 'url', 'email', 'date', 'number', 'datetime-local'];

    item.forEach(function (value, index) {
        ret[value] = function (field) {
            return valid[index].check.call(this, field);
        };
    });
    return ret;
});