// script.js

(function () {
    var canvas = $('#canvas');

    if (!canvas[0].getContext) {
        $("#error").show();
        return false;
    }

    var width = canvas.width();
    var height = canvas.height();

    canvas.attr("width", width);
    canvas.attr("height", height);

    // Canvas overlay para efectos de pétalos que caen sin borrar el árbol
    var overlay = $("<canvas id='overlay'></canvas>");
    overlay.attr("width", width);
    overlay.attr("height", height);
    overlay.css({
        position: "absolute",
        left: 0,
        top: 0,
        width: width + "px",
        height: height + "px",
        pointerEvents: "none"
    });
    $("#wrap").append(overlay);
    var overlayCtx = overlay[0].getContext('2d');

    var opts = {
        seed: {
            x: width / 2 - 20,
            color: "rgb(139, 69, 19)",
            scale: 4
        },
        branch: [
            [535, 680, 570, 250, 500, 200, 30, 100, [
                [540, 500, 455, 417, 340, 400, 13, 100, [
                    [450, 435, 434, 430, 394, 395, 2, 40]
                ]],
                [550, 445, 600, 356, 680, 345, 12, 100, [
                    [578, 400, 648, 409, 661, 426, 3, 80]
                ]],
                [539, 281, 537, 248, 534, 217, 3, 40],
                [546, 397, 413, 247, 328, 244, 9, 80, [
                    [427, 286, 383, 253, 371, 205, 2, 40],
                    [498, 345, 435, 315, 395, 330, 4, 60]
                ]],
                [546, 357, 608, 252, 678, 221, 6, 100, [
                    [590, 293, 646, 277, 648, 271, 2, 80]
                ]]
            ]]
        ],
        bloom: {
            num: 700,
            width: 1080,
            height: 650,
        },
        footer: {
            width: 1200,
            height: 5,
            speed: 10,
        }
    }

    var tree = new Tree(canvas[0], width, height, opts);
    var seed = tree.seed;
    var foot = tree.footer;
    var hold = 1;
    var treeSnapshotImage = new Image();

    // Se puede tocar cualquier parte del canvas para iniciar la animación.
    canvas.click(function (e) {
        hold = 0;
        canvas.unbind("click");
        canvas.unbind("mousemove");
        canvas.removeClass('hand');
    }).mousemove(function (e) {
        var offset = canvas.offset(), x, y;
        x = e.pageX - offset.left;
        y = e.pageY - offset.top;
        canvas.toggleClass('hand', seed.hover(x, y));
    });

    $(document).keydown(function(e) {
        if (e.keyCode == 13) {
            if (hold) {
                hold = 0;
                canvas.unbind("click");
                canvas.unbind("mousemove");
                canvas.removeClass('hand');
            }
        }
    });


    var seedAnimate = eval(Jscex.compile("async", function () {
        seed.draw();
        while (hold) {
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canScale()) {
            seed.scale(0.95);
            $await(Jscex.Async.sleep(10));
        }
        while (seed.canMove()) {
            seed.move(0, 2);
            foot.draw();
            $await(Jscex.Async.sleep(10));
        }
    }));

    var growAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.grow();
            $await(Jscex.Async.sleep(10));
        } while (tree.canGrow());
    }));

    var flowAnimate = eval(Jscex.compile("async", function () {
        do {
            tree.flower(2);
            $await(Jscex.Async.sleep(10));
        } while (tree.canFlower());
    }));

    var moveAnimate = eval(Jscex.compile("async", function () {
        var distance = 220;
        var steps = 55;
        for (var i = 0; i <= steps; i++) {
            var x = distance * (i / steps);
            canvas.css("transform", "translateX(" + x + "px)");
            $await(Jscex.Async.sleep(20));
        }
        canvas.css("transform", "translateX(" + distance + "px)");
    }));
    

  var petals = [];
    function addPetal() {
        petals.push({
            x: random(0, width),
            y: -10,
            speed: random(1, 4),
            radius: random(2, 5),
            alpha: Math.random() * 0.6 + 0.4
        });
    }

    var jumpAnimate = eval(Jscex.compile("async", function () {
        while (true) {
            overlayCtx.clearRect(0, 0, width, height);

            if (Math.random() < 0.3 && petals.length < 120) {
                addPetal();
            }

            for (var i = petals.length - 1; i >= 0; i--) {
                var p = petals[i];
                overlayCtx.beginPath();
                overlayCtx.fillStyle = 'rgba(255, 215, 0,' + p.alpha + ')';
                overlayCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
                overlayCtx.fill();

                p.y += p.speed;
                p.x += Math.sin(p.y / 20) * 1.5;
                p.alpha *= 0.995;

                if (p.y > height + 20 || p.alpha < 0.05) {
                    petals.splice(i, 1);
                }
            }

            $await(Jscex.Async.sleep(25));
        }
    }));

    var textAnimate = eval(Jscex.compile("async", function () {
        var together = new Date();
        together.setFullYear(2025, 8, 13);
        together.setHours(0);
        together.setMinutes(0);
        together.setSeconds(0);
        together.setMilliseconds(0);

        $("#code").show().typewriter();
        $("#clock-box").fadeIn(500);
        while (true) {
            timeElapse(together);
            $await(Jscex.Async.sleep(1000));
        }
    }));

    var runAsync = eval(Jscex.compile("async", function () {
        $await(seedAnimate());
        $await(growAnimate());
        $await(flowAnimate());
        $await(moveAnimate());

        textAnimate().start();
        jumpAnimate().start();
    }));

    runAsync().start();
})();
