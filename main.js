/**
 * Created by Lee Sure on 2017/3/8.
 */

function start() {
    var data = [];
    for (var i = 0; i < 373; i++) {
        var div = '<div class="hehe" style="color: red; height: 60px;width: 45%;float: left">' + i + '</div>';
        data.push(div);
    }
    var parentNode = document.getElementById('parent');
    var fixList = new FixedList(parentNode, data);
    fixList.init(2, 90);
}

start();