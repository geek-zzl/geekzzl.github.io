function loadData() {
    return new Promise(function (resolve, reject) {
        d3.json("graph.json", function (error, graph) {
            if (error) {
                reject(error);
            } else {
                resolve(graph);
            }
        });
    });
}

loadData().then(function (graph) {
    var nodesData = [];
    var linksData = graph.links;

    graph.nodes.forEach(function (node) {
        nodesData.length++;
        nodesData[node.id] = {id: node.id};
    })

    linksData.forEach(function (link) {
        link.source = nodesData[link.source] || (nodesData[link.source] = {id: link.source});
        link.target = nodesData[link.target] || (nodesData[link.target] = {id: link.target});
    });

    var width = 1300,
        height = 700;
        linkDis = 130;
        rad = 20;

    //画出图像来
    var force = d3.layout.force()
        .nodes(d3.values(nodesData))
        .links(linksData)
        .size([width, height])
        .linkDistance(linkDis)
        .charge(-300)
        .on("tick", tick)
        .start();
    console.log("nodesData", nodesData);
    console.log("linksData", linksData);
    console.log("========画完了========")
    // 创建一个svg实例
    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height);


// Per-type markers, as they don't inherit styles.
    svg.append("defs").selectAll("marker")
        .data(["suit", "licensing", "resolved",[""]])
        .enter().append("marker")
        .attr("id", function (d) {
            return d;
        })
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", 15)
        .attr("refY", -1.5)
        .attr("markerWidth", 7)
        .attr("markerHeight", 25)
        .attr("orient", "auto")
        .append("path")
        .attr("d", "M0,-5L10,0L0,5");
        //.attr("d", "M0,0 L10,0")

    var path = svg.append("g").selectAll("path")
        .data(force.links())
        .enter().append("path")
        .attr("class", function (d) {
            return "link " + d.type;
        })
        .attr("marker-end", function (d) {
            return "url(#" + d.type + ")";
        });

    var circle = svg.append("g").selectAll("circle")
        .data(force.nodes())
        .enter().append("circle")
        .attr("r", rad)
        .call(force.drag);


    var text = svg.append("g").selectAll("text")
        .data(force.nodes())
        .enter().append("text")
        .attr("x", 0)
        .attr("y", ".31em")
        .text(function (d) {
            return d.id;
        });
        // .on("dblclick", function (d) {
        //     var newText = prompt("Enter new text:", d.id);
        //     if (newText !== null) {
        //         d.id = newText;
        //         d3.select(this).text(newText);
        //         force.start();
        //     }
        // });//名字
    // 选择文本元素

// 为文本元素绑定双击事件处理函数
    text.on("click", function() {
        // 获取文本元素的当前文本
        const currentText = this.textContent;

        // 创建一个输入框
        const input = document.createElement("input");
        input.type = "text";
        input.value = currentText;
        input.style.position = "absolute";
        input.style.left = this.getBoundingClientRect().left + "px";
        input.style.top = this.getBoundingClientRect().top + "px";

        // 将输入框添加到文档中
        document.body.appendChild(input);

        // 让输入框获取焦点并选中其中的文本
        input.select();
        input.focus();
        input.setSelectionRange(0, currentText.length);

        // 当输入框失去焦点时，更新文本元素的文本
        input.addEventListener("blur", function() {
            text.text(this.value);
            this.remove();
        });
    });


// Use elliptical arc path segments to doubly-encode directionality.
    function tick() {
        path.attr("d", linkArc);
        circle.attr("transform", transform);
        text.attr("transform", transform);
    }

    function linkArc(d) {
        var dx = d.target.x - d.source.x,
            dy = d.target.y - d.source.y,
            dr = Math.sqrt(dx * dx + dy * dy);
        return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0,1 " + d.target.x + "," + d.target.y;
    }

    function transform(d) {
        return "translate(" + d.x + "," + d.y + ")";
    }

    // 双击删除节点
    circle.on("dblclick", function (d) {
        // 找到该节点对应的所有连线并删除
        console.log("触发节点 = ", d);
        var linksToRemove = linksData.filter(function (l) {
            return (l.source === d || l.target === d);
        });
        // console.log("linksToRemove", linksToRemove)
        linksToRemove.forEach(function (l) {
            linksData.splice(linksData.indexOf(l), 1);
        });
        // console.log('d',nodesData.splice(d.id))
        // nodesData.splice(nodesData.slice())
        delete nodesData[d.id];
        // nodesData.remove("d.id")
        // nodesData.remove({id: d.id})
        nodesData.length --;
        console.log("nodesData",nodesData)
        console.log("linksData",linksData)
        update();
        // 立即停止force图形的处理
        // force.stop();
        //
        // // 重新绑定数据
        // force.links(d3.values(linksData));
        // force.nodes(nodesData);
        // path = path.data(force.links());
        // path.exit().remove();
        // path.enter().append("path")
        //     .attr("class", function (d) {
        //         return "link " + d.type;
        //     })
        //     .attr("marker-end", function (d) {
        //         console.log("url(#" + d.type + ")")
        //         return "url(#" + d.type + ")";
        //     });
        //
        // circle = circle.data(force.nodes());
        // circle.exit().remove();
        // circle.enter().append("circle")
        //     .attr("r", rad)
        //     .call(force.drag);
        // console.log("no force.nodes()=", force.nodes());
        // console.log("no force.links()=", force.links());
        // text = text.data(force.nodes());
        // text.exit().remove();
        // text.enter().append("text")
        //     .attr("x", 8)
        //     .attr("y", ".31em")
        //     .text(function (d) {
        //         return d.id;
        //     });
        //
        // force.nodes(d3.values(nodesData))
        //     .links(linksData)
        //     .start();
    });


    // 选择输入框和添加按钮元素
    var inputField = d3.select("#input-field");
    var addButton = d3.select("#add-button");
    // 绑定添加按钮的点击事件--添加节点
    addButton.on("click", function () {
        // 获取输入框中的值
        var nodeName = inputField.property("value");
        if(nodeName==="")
            return
        nodesData[nodeName] = {id: nodeName};
        nodesData.length++;
        console.log("NewNodes", nodesData)
        update(); // 更新力导向图
        // 清空输入框
        inputField.property("value", "");
    });

    // 选中文本框和按钮元素
    var sourceField = d3.select("#source-field");
    var targetField = d3.select("#target-field");
    var addLinkButton = d3.select("#add-link-button");
    // 绑定按钮的点击事件 加边
    addLinkButton.on("click", function () {
        // 从文本框中获取源节点和目标节点的ID
        var sourceId = sourceField.property("value");
        var targetId = targetField.property("value");

        // 创建一个新链接对象
        // /////////// 存在问题需要判断一下两个节点是否存在
        var newLink = {source: nodesData[sourceId], target: nodesData[targetId], type:"suit"};

        // 将新链接添加到链接数据数组中
        linksData.push(newLink);
        // 更新力导向图
        update();
    });

    // 选中文本框和按钮元素 删除边
    var sourceDel = d3.select("#source-field-del");
    var targetDel = d3.select("#target-field-del");
    var delLinkButton = d3.select("#del-link-button");

    // 绑定按钮的点击事件 删除边
    delLinkButton.on("click", function () {
        // 从文本框中获取源节点和目标节点的ID
        var sourceId = sourceDel.property("value");
        var targetId = targetDel.property("value");
        if(nodesData[sourceId] && nodesData[targetId]) {
            var linksToRemove = linksData.filter(function (l) {
                if(l.source.id === sourceId && l.target.id === targetId) {
                    return
                }
                return l
            });
            linksData = linksToRemove;
            update();
            return ;
        }
    });

    // text.on("dblclick", function (d) {
    //     var newText = prompt("Enter new text:", d.id);
    //     if (newText !== null) {
    //         d.id = newText;
    //         d3.select(this).text(newText);
    //         force.start();
    //     }
    // });

    // 更新力导向图
    function update() {
        // 立即停止force图形的处理
        force.stop();

        // 重新绑定数据
        force.nodes(d3.values(nodesData));
        force.links(linksData);
        path = path.data(force.links());
        path.exit().remove();
        path.enter().append("path")
            .attr("class", function (d) {
                return "link " + d.type;
            })
            .attr("marker-end", function (d) {
                return "url(#" + d.type + ")";
            });
// 使用 there 函数作为数据更新的 key 函数
        function there(d) {
            return d.id;
        }
        //text = text.data(force.nodes());
        text = text.data(force.nodes(),there);

        const textElements = d3.selectAll("text"); // 选取所有文本元素
        textElements.each(function(d, i) {
            console.log(d3.select(this).text()); // 输出每个文本元素的文本内容
        });

        //console.log("text111111",text)//ac
        //console.log("text.exit()",text.exit())
        text.exit().remove(); //ab

        const textElements2 = d3.selectAll("text"); // 选取所有文本元素
        // textElements2.filter(function(d, i) {
        //     // 筛选出在节点数据中不存在的元素
        //     console.log("this",this)
        //     return !force.nodes().includes(d);
        // }).remove(); // 删除多余的元素


        // circle = circle.data(force.nodes());
        // console.log(circle.exit())
        // console.log(circle.exit().attr("id"))
        //
        // d3.selectAll("text").each(function (d, i) {
        //     var temp = d.id;
        //     if (temp == circle.exit().attr("id")) {
        //
        //         d3.select(this).remove();
        //     }
        // });
        //
        // circle.exit().remove();

        //console.log("text2",text)

        const textElements1 = d3.selectAll("text"); // 选取所有文本元素
        textElements1.each(function(d, i) {
            console.log(d3.select(this).text()); // 输出每个文本元素的文本内容
        });

        text.enter().append("text")
            .attr("x", 0)
            .attr("y", ".31em")
            .text(function (d) {
                console.log("d",d);
                return d.id;
            })
            .on("dblclick", function (d) {
                var newText = prompt("Enter new text:", d.id);
                if (newText !== null) {
                    d.id = newText;
                    d3.select(this).text(newText);
                    force.start();
                }
            });//名字





        circle = circle.data(force.nodes());
        console.log("节点！！")
        console.log("circle",circle)
        console.log("circle.exit()",circle.exit())
        circle.exit().remove();

        circle.enter().append("circle")
            .attr("r", rad)
            .call(force.drag);
        circle.on("dblclick", function (d) {
            // 找到该节点对应的所有连线并删除
            console.log("触发节点 = ", d);
            var linksToRemove = linksData.filter(function (l) {
                return (l.source === d || l.target === d);
            });
            // console.log("linksToRemove", linksToRemove)
            linksToRemove.forEach(function (l) {
                linksData.splice(linksData.indexOf(l), 1);
            });
            // console.log('d',nodesData.splice(d.id))
            // nodesData.splice(nodesData.slice())
            delete nodesData[d.id];
            // nodesData.remove("d.id")
            // nodesData.remove({id: d.id})
            nodesData.length --;
            console.log("nodesData",nodesData)
            console.log("linksData",linksData)
            update();
        });
        // console.log("in update");
        // console.log("force.links()=", force.links());
        // console.log("in update");


        force.nodes(d3.values(nodesData))
            .links(linksData)
            .start();
        // console.log("in dblclick lines= ", d3.selectAll(".lines").data())
        // console.log("in dblclick circle= ", d3.selectAll(".nodes").data())
    }


        // console.log("in dblclick text= ", d3.selectAll(".nodetext").text())
        // console.log("in dblclick nodes= ", )
        // console.log("in dblclick circle= ", d3.selectAll(".nodes"))
});
