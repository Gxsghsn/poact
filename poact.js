define(['mdeferred1', 'FormBase'], function (FieldDeferred, Form) {

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


    return {
        'getElementById': getElementById
    }
});