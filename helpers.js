String.prototype.shuffle = function () {
    var a = this.split(""),
        n = a.length;

    for(var i = n - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var tmp = a[i];
        a[i] = a[j];
        a[j] = tmp;
    }
    return a.join("");
}

Number.prototype.get_submitted_status=()=>{
        let status = ''
        console.log(this)
        switch(this){
            case 0:
            status = '<span class="btn btn-danger btn-xs">false</span>';
            break;
            case 1:
            status = '<span class="btn btn-primary btn-xs">true</span>';
            break;
        }
    return status;
}