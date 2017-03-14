/**
 * Created by Lee Sure on 2017/3/8.
 */

var fixList;

function start() {
    var data = [];
    var random = Math.random() * 50 + 100;
    console.log(random);
    for (var i = 0; i < random; i++) {
        var div = '<div class="hehe" id=' + i + ' style="color: red; height: 250px;width: 45%;float: left">' + i + '</div>';
        data.push(div);
    }
    var parentNode = document.getElementById('parent');
    fixList = new FixedList(parentNode, data);
    fixList.initList(2, 20);
    fixList.setEventListener(function () {
        var prt = document.getElementById('parent');
        prt.addEventListener('click', function (e) {
            console.log(e.target.id);
        });
    });

}

function setIntervala() {
    start();
    // setInterval(ref, 5000);
}

function ref() {
    var data = [];
    var random = Math.random() * 50 + 100;
    console.log(random);
    for (var i = 0; i < random; i++) {
        var div = '<div class="hehe" id=' + i + ' style="color: red; height: 250px;width: 45%;float: left">' + i + '</div>';
        data.push(div);
    }
    fixList.refreshData(data);
}
setIntervala();