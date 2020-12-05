function chaosGame() {

    var x = Math.random() * 400;
    var y = Math.random() * 346;
    for (var i=0; i<30000; i++) {
        var vertex = Math.floor(Math.random() * 3);
        switch(vertex) {
            case 0:
                x = x / 2;
                y = y / 2;
                break;
            case 1:
                x = 200 + (200 - x) / 2
                y = 346 - (346 - y) / 2

                break;
            case 2:
                x = 400 - (400 - x) / 2
                y = y / 2;

        }

    }
}

// EXPECT

[]