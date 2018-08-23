// define(['domReady!', "jquery", "echarts"], function (doc, $, echarts) {

    var START_REFRESH = true;
    var REFRESH_INTERVAL_TIME = 60000;
    var ASYNC_TIMEOUT = 8000;

    var chart1 = echarts.init(document.getElementById('mychart1'));
    var chart2 = echarts.init(document.getElementById('mychart2'));
    var productcode = $("#productcode").val();

    var chartConfig = {
        allcount: 660,
        newallcount: 1441,
        dataurl: {
            "line": "/market/getmarketdata",
            "line5": "/market/getmarketdata",
            "k": "/market/getmarketkdata"
        },
        args: {
            "line": { "qtype": "1d" },
            "line5": { "qtype": "5d" },
            "kd": { "qtype": "d" },
            "kw": { "qtype": "w" },
            "km": { "qtype": "mo" },
            "k1m": { "qtype": "1m" },
            "k5m": { "qtype": "5m" },
            "k30m": { "qtype": "30m" },
            "k1h": { "qtype": "1h" }
        },
        getRand: function () {
            return new Date().getTime() + Math.round(Math.random() * 1000);
        },
        computeNodeNumber: function (sumNum, intervalNum) {
            var nodes = [];
            var step = Math.floor(sumNum / intervalNum);
            var average = Math.floor(step / 2);
            for (var i = 1; i <= intervalNum; i++) {
                nodes.push(step * i - average);
            }
            return nodes;
        },
        unique: function (arr) {
            var n = {}, r = [];
            for (var i = 0; i < arr.length; i++) {
                if (!n[arr[i]]) {
                    n[arr[i]] = true;
                    if (arr[i]) {
                        r.push(arr[i]);
                    }
                }
            }
            return r;
        },
        fiveDateNode: function () {
            var num = this.isNewProduct ? this.newallcount : this.allcount;
            return this.computeNodeNumber(num, 5);
        },
        isNewProduct: $.inArray(productcode, ["XAU", "XAG", "USD"]) !== -1,
        chartShowTime: { "0": "06:00", "360": "12:00", "720": "18:00", "1080": "0:00", "1440": "06:00" },
        timeInterval: 360,
        refreshType: ["line", "line5", "k1m", "k5m", "k30m", "k1h"]
    };

    var resultMap = {
        dateMap: [],
        timeMap: [],
        avePriceMap: [],
        priceMap: [],
        amountMap: [],
        amountMap2: [],
        minPrice: "",
        maxPrice: "",
        minUprate: "",
        maxUprate: "",
        maxVolume: "",
        minVolume: "",
        seqid: "",
        seqidList: [],
        lastclose: "",
        prePrice: "",
        aTimes: []
    };

    var getOption = function (resultMap, optionName) {
        var chartOptions = {
            optionK: {
                tooltip: {
                    trigger: 'axis',
                    showDelay: 0,
                    hideDelay: 0,
                    transitionDuration: 0,
                    formatter: function (e) {
                        if (!(e instanceof Array)) {
                            e = [e];
                        }

                        var t = e[0].name, a, r, i, n, o;
                        for (var l = e.length - 1; l >= 0; l--) {
                            r = e[l].seriesName;
                            i = e[l].value;
                            if (i instanceof Array) {
                                t += r;
                                t += "<br/>  开盘 : " + i[0] + "  最高 : " + i[2];
                                t += "<br/>  收盘 : " + i[1] + "  最低 : " + i[3];
                                if (!chartConfig.isNewProduct) {
                                    t += "<br/>  成交量 : " + i[4];
                                }
                            }
                        }
                        return t;
                    },
                    axisPointer: {
                        type: "line",
                        lineStyle: { width: 1, type: "solid", color: "#001840" }
                    }
                },

                xAxis: [
                    {
                        show: true,
                        type: "category",
                        boundaryGap: true,
                        axisLine: {
                            lineStyle: {
                                color: "#E9E9E9",
                                width: 1
                            }
                        },
                        axisLabel: {
                            show: true,
                            textStyle: {
                                color: "#000"
                            }
                        },
                        axisTick: { show: false },
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: "solid",
                                color: "#F9F9F9"
                            }
                        },
                        data: resultMap.dateMap
                    }
                ],

                yAxis: [
                    {
                        type: "value",
                        splitLine: {
                            lineStyle: {
                                type: "solid",
                                color: "#F9F9F9"
                            }
                        },
                        axisTick: { show: false },
                        axisLine: { lineStyle: { color: "#E9E9E9", width: 1 } },
                        axisLabel: {
                            formatter: function (e) {
                                return (+e).toFixed(2);
                            },
                            textStyle: {
                                color: "#000"
                            }
                        }
                    }
                ],

                dataZoom: {
                    show: false,
                    realtime: true,
                    start: 80,
                    end: 100,
                    showDetail: true,
                    zoomLock: false
                },

                grid: {
                    show: true,
                    left: 80,
                    right: 60,
                    top: 30,
                    bottom: 40,
                    borderColor: "#E9E9E9"
                },

                series: [
                    {
                        name: "",
                        type: "candlestick",
                        itemStyle: {
                            normal: {
                                borderColor: "#ff3434",
                                borderColor0: "#54c52d",
                                color: "#ff3434",
                                color0: "#54c52d"
                            }
                        },
                        lineStyle: {
                            normal: {
                                color: "#f75487",
                                color0: "#8bd429"
                            }
                        },
                        data: resultMap.priceMap
                    }
                ]
            },

            optionBar: {
                xAxis: [
                    {
                        show: true,
                        type: "category",
                        boundaryGap: true,
                        axisLabel: {
                            show: false
                        },
                        axisLine: {
                            lineStyle: {
                                color: "#E0E0E0",
                                width: 1
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        splitLine: {
                            show: false
                        },
                        data: resultMap.dateMap
                    }
                ],

                yAxis: [
                    {
                        type: "value",
                        interval: Math.floor((resultMap.maxVolume-resultMap.minVolume) / 3),
                        axisTick: { show: false },
                        splitLine: {
                            lineStyle: {
                                type: "solid",
                                color: "#F9F9F9"
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                color: "#E0E0E0",
                                width: 1
                            }
                        },
                        axisLabel: {
                            formatter: function (e) {
                                var t = e > 1e4 ? (e / 1e4).toFixed(2) + " 万" : e;
                                return t;
                            },
                            textStyle: {
                                color: "#000"
                            }
                        }
                    }
                ],

                grid: {
                    show: true,
                    left: 80,
                    right: 60,
                    top: 10,
                    borderColor: "#E0E0E0"
                },

                series: [
                    {
                        name: "成交量",
                        type: "bar",
                        stack: "总量",
                        itemStyle: {
                            normal: {
                                borderColor: "#ff3434",
                                borderWidth: 1,
                                color: "#ff3434"
                            }
                        },
                        data: resultMap.amountMap
                    },
                    {
                        name: "成交量",
                        type: "bar",
                        stack: "总量",
                        itemStyle: {
                            normal: {
                                borderColor: "#16be5b",
                                borderWidth: 1,
                                color: "#16be5b"
                            }
                        },
                        data: resultMap.amountMap2
                    }
                ],

                dataZoom: {
                    show: true,
                    realtime: true,
                    start: 80,
                    end: 100,
                    showDetail: true,
                    zoomLock: false
                }
            },

            optionLine: {
                tooltip: {
                    trigger: "axis",
                    showDelay: 0,
                    hideDelay: 0,
                    transitionDuration: 0,
                    formatter: function (e) {
                        if (e[1]) {
                            if (e[1].value !== "") {
                                return e[1].name + "<br>" + '价格: ' + e[1].value;
                            } else {
                                return false;
                            }
                        }
                    },
                    axisPointer: {
                        type: "line",
                        lineStyle: {
                            width: 1,
                            type: "solid",
                            color: "#001840"
                        }
                    }
                },

                grid: {
                    show: true,
                    left: 80,
                    right: 60,
                    top: 30,
                    bottom: 40,
                    borderColor: "#E9E9E9"
                },

                yAxis: [
                    {
                        type: "value",
                        splitLine: {
                            lineStyle: {
                                type: "solid",
                                color: "#F9F9F9"
                            }
                        },
                        interval: (resultMap.maxPrice-0.000001 - resultMap.minPrice) / 6,
                        axisLine: { lineStyle: { color: "#E9E9E9", width: 1 } },
                        axisLabel: {
                            formatter: function (e) {
                                return (+e).toFixed(2);
                            },
                            textStyle: {
                                color: "#000"
                            }
                        },
                        axisTick: {
                            show: false
                        }
                    },
                    {
                        type: "value",
                        splitLine: { show: false },
                        minInterval: 0.0001,
                        interval: (resultMap.maxUprate-0.000001 - resultMap.minUprate) / 6,
                        axisLine: { show: false },
                        axisTick: { show: false },
                        axisLabel: {
                            formatter: function (e) {
                                var t = 100 * +e;
                                if (Math.abs(t.toFixed(2)) === 0) return "0.00%";
                                return t.toFixed(2) + "%";
                            },
                            textStyle: {
                                color: function (e) {
                                    return "#000";
                                }
                            }
                        }
                    }
                ],

                xAxis: [
                    {
                        show: true,
                        type: "category",
                        boundaryGap: true,
                        axisLine: {
                            lineStyle: {
                                color: "#E9E9E9",
                                width: 1
                            }
                        },
                        axisLabel: {
                            show: true,
                            formatter: function (value, index) {
                                return value;
                            },
                            textStyle: {
                                color: "#000"
                            }
                        },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        data: resultMap.dateMap
                    }
                ],

                dataZoom: {
                    show: false,
                    realtime: true,
                    start: 0,
                    end: 100,
                    showDetail: true,
                    zoomLock: false,
                    lowerLimit: true
                },

                series: [
                    {
                        name: "均价",
                        type: "line",
                        symbol: "none",
                        showSymbol: false,
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                color: "#fdcb6b"
                            }
                        },
                        lineStyle: {
                            normal: {
                                color: "#fdcb6b",
                                width: 1
                            }
                        },
                        data: resultMap.avePriceMap
                    },
                    {
                        name: "价格",
                        type: "line",
                        symbol: "emptyCircle",
                        showSymbol: false,
                        itemStyle: {
                            normal: {
                                borderWidth: 1,
                                color: "#50c1ff"
                            }
                        },
                        lineStyle: {
                            normal: {
                                color: "#50c1ff",
                                width: 1
                            }
                        },
                        areaStyle: {
                            normal: {
                                color: "#eef8ff"
                            }
                        },
                        data: resultMap.priceMap,
                        markLine: {
                            symbol: ['none', 'none'],
                            label: {
                                normal: {
                                    show: false
                                }
                            },
                            data: [
                                { name: 'lastclose', yAxis: resultMap.lastclose }
                            ],
                            lineStyle: {
                                normal: { type: "solid", color: "#E9E9E9" }
                            }
                        }
                    }
                ]
            },

            optionLineBar: {
                tooltip: {
                    trigger: "axis",
                    showDelay: 0,
                    hideDelay: 0,
                    transitionDuration: 0,
                    formatter: function (e) {
                        if (e[1]) {
                            var t = "-" !== e[1].value ? e[1] : e[0];
                            return t.value !== "" ? t.name + "<br/>" + t.seriesName + " : " + t.value : false;
                        }
                    },
                    axisPointer: {
                        type: "line",
                        lineStyle: {
                            width: 1,
                            type: "solid",
                            color: "#001840"
                        }
                    }
                },

                grid: {
                    show: true,
                    left: 80,
                    right: 60,
                    top: 30,
                    bottom: 10,
                    borderColor: "#E0E0E0"
                },

                xAxis: [
                    {
                        type: "category",
                        boundaryGap: true,
                        axisLabel: {
                            show: true,
                            interval: "auto"
                        },
                        axisLine: {
                            lineStyle: {
                                color: "#E0E0E0",
                                width: 1
                            }
                        },
                        axisTick: { show: false },
                        splitLine: { show: false },
                        data: resultMap.dateMap
                    }
                ],

                yAxis: [
                    {
                        type: "value",
                        minInterval: 1,
                        interval: Math.floor((resultMap.maxVolume-resultMap.minVolume) / 3),
                        splitLine: {
                            show: true,
                            lineStyle: {
                                type: "solid",
                                color: "#F9F9F9",
                                width: 1
                            }
                        },
                        axisLine: {
                            lineStyle: {
                                type: "solid",
                                color: "#E0E0E0",
                                width: 1
                            }
                        },
                        axisTick: {
                            show: false
                        },
                        axisLabel: {
                            formatter: function (e) {
                                var t = e > 1e4 ? (e / 1e4).toFixed(2) + " 万" : e;
                                return t;
                            },
                            textStyle: {
                                color: "#000"
                            }
                        }
                    }
                ],

                series: [
                    {
                        name: "成交量",
                        type: "bar",
                        stack: "总量",
                        itemStyle: {
                            normal: {
                                borderColor: "#ff3434",
                                borderWidth: 1,
                                color: "#ff3434"
                            }
                        },
                        data: resultMap.amountMap
                    }, {
                        name: "成交量",
                        type: "bar",
                        stack: "总量",
                        itemStyle: {
                            normal: {
                                borderColor: "#16be5b",
                                borderWidth: 1,
                                color: "#16be5b"
                            }
                        },
                        data: resultMap.amountMap2
                    }
                ],

                dataZoom: {
                    show: false,
                    realtime: true,
                    start: 0,
                    end: 100,
                    showDetail: true,
                    zoomLock: false,
                    lowerLimit: true
                }
            }
        };

        return chartOptions[optionName];
    };

    var goldChart = {
        chart: "line",

        realTimeLine: $("#real-time-line"),

        getLargerItem: function (e, t) {
            return "" === e ? t : +e < +t ? t : e;
        },

        getSmallerItem: function (e, t) {
            return "" === e ? t : +e > +t ? t : e;
        },

        intercept: function (vNum) {
            var vONum = vNum;
            if (typeof (vONum) === "number") {
                vONum = String(vONum);
            }
            var pointIndex = vONum.indexOf('.');
            if (pointIndex!==-1) {
                return parseFloat(vONum.substr(0, pointIndex + 3));
            }
            return vNum;
        },

        getAxisLimit: function (e, t, r) {
            if (e > 0 && t > 0) {
                var s = e - r;
                var i = r - t;
                var p = s > i ? s : i;
                if (0 === p) p = 0.01;

                var maxrate = +((Math.ceil((p / r)*10000)/10000).toFixed(4));
                var minrate = -maxrate;
                var maxprice = r + r * maxrate;
                var minprice = r + r * minrate;
                resultMap.maxPrice = Math.round(100 * (maxprice)) / 100;
                resultMap.minPrice = Math.round(100 * (minprice)) / 100;
                resultMap.maxUprate = maxrate;
                resultMap.minUprate = minrate;
                resultMap.lastclose = r;
            }
        },

        clearData: function () {
            resultMap = {
                dateMap: [],
                timeMap: [],
                avePriceMap: [],
                priceMap: [],
                amountMap: [],
                amountMap2: [],
                minPrice: "",
                maxPrice: "",
                minUprate: "",
                maxUprate: "",
                maxVolume: "",
                minVolume: "",
                seqid: "",
                seqidList: [],
                lastclose: "",
                prePrice: "",
                aTimes: []
            };
        },

        filterArrayEmpty: function (arr) {
            var array = [];
            for (var i = 0; i < arr.length; i++) {
                if (arr[i] !== "") {
                    array.push(arr[i]);
                }
            }
            return array;
        },

        lineChartHandle: function (dataList, chartType, isRefresh, lastSettle) {
            var _that = this;
            var maxPrice = "", minPrice = "", maxVolume="", minVolume="";
            var prePrice = lastSettle;
            var seqid = "";
            if (chartType == "line" && !chartConfig.isNewProduct) {
                _that.realTimeLine.show();
            }

            for (var i = 0; i < dataList.length; i++) {
                var volume = dataList[i].volume;
                var lastprice = dataList[i].lastprice;
                var average = dataList[i].average;
                var date = dataList[i].date;
                var time = dataList[i].time;
                seqid = dataList[i].seqid;

                if (date === "") continue;
                if (lastprice === 0) lastprice = lastSettle;
                if (average === 0) average = lastSettle;
                if (isRefresh == 1) {
                    resultMap.priceMap = _that.filterArrayEmpty(resultMap.priceMap);
                    resultMap.avePriceMap = _that.filterArrayEmpty(resultMap.avePriceMap);
                    resultMap.dateMap = _that.filterArrayEmpty(resultMap.dateMap);
                    resultMap.amountMap = _that.filterArrayEmpty(resultMap.amountMap);
                    resultMap.amountMap2 = _that.filterArrayEmpty(resultMap.amountMap2);
                    resultMap.aTimes = _that.filterArrayEmpty(resultMap.aTimes);
                    lastSettle = resultMap.lastclose;
                    maxPrice = resultMap.maxPrice;
                    minPrice = resultMap.minPrice;
                    prePrice = resultMap.prePrice;
                    maxVolume = resultMap.maxVolume;
                    minVolume = resultMap.minVolume;
                    if ($.inArray(time, resultMap.timeMap) >= 0) continue;
                }

                resultMap.timeMap.push(time);
                resultMap.priceMap.push(lastprice);
                resultMap.avePriceMap.push(average);
                if (chartType == "line") {
                    resultMap.dateMap.push(time.substr(4, 10));
                } else {
                    resultMap.dateMap.push(time.substr(4, 10));
                    resultMap.aTimes.push(date);
                }

                var fLastPrice = parseFloat(lastprice);
                var fPrePrice = parseFloat(prePrice);
                if (fLastPrice >= fPrePrice) {
                    resultMap.amountMap.push(volume);
                    resultMap.amountMap2.push("-");
                } else {
                    resultMap.amountMap.push("-");
                    resultMap.amountMap2.push(volume);
                }

                prePrice = lastprice;
                resultMap.prePrice = prePrice;
                maxPrice = _that.getLargerItem(maxPrice, lastprice);
                minPrice = _that.getSmallerItem(minPrice, lastprice);
                maxVolume = _that.getLargerItem(maxVolume, volume);
                minVolume = _that.getSmallerItem(minVolume, volume);
            }
            resultMap.maxVolume = maxVolume;
            resultMap.minVolume = minVolume;

            _that.getAxisLimit(maxPrice, minPrice, lastSettle);
            while (resultMap.priceMap.length < (chartConfig.isNewProduct ? chartConfig.newallcount : chartConfig.allcount)) {
                resultMap.priceMap.push("");
                resultMap.dateMap.push("");
                resultMap.avePriceMap.push("");
                resultMap.amountMap.push("");
                resultMap.amountMap2.push("");
            }

            var opsLine = getOption(resultMap, "optionLine");

            if (chartType == "line") {
                if (chartConfig.isNewProduct) {
                    opsLine.xAxis[0].axisLabel.show = true;
                    opsLine.xAxis[0].axisLabel.formatter = function (value, index) {
                        if (index % chartConfig.timeInterval === 0) {
                            return chartConfig.chartShowTime[index];
                        }
                    };
                    opsLine.xAxis[0].axisLabel.interval = chartConfig.timeInterval-1;
                } else {
                    opsLine.xAxis[0].axisLabel.show = false;
                }
            } else {
                var fiveDate = chartConfig.unique(resultMap.aTimes);
                var dateNodes = chartConfig.fiveDateNode();
                opsLine.xAxis[0].axisLabel.show = true;
                opsLine.xAxis[0].axisLabel.interval = function (index, value) {
                    if ($.inArray(index, dateNodes) >= 0) {
                        return true;
                    }
                };
                var dateIndex = 0;
                opsLine.xAxis[0].axisLabel.formatter = function (value, index) {
                    if ($.inArray(index, dateNodes) >= 0) {
                        var val = fiveDate[dateIndex];
                        dateIndex++;
                        return val;
                    }
                };
            }
            if (productcode === "Ag(T+D)") {
                opsLine.yAxis[0].axisLabel.formatter = function (value, index) {
                    if (value) {
                        return Math.floor(value);
                    }
                };
            }

            opsLine.yAxis[0].min = resultMap.minPrice;
            opsLine.yAxis[0].max = resultMap.maxPrice;
            opsLine.yAxis[1].min = resultMap.minUprate;
            opsLine.yAxis[1].max = resultMap.maxUprate;
            chart1.setOption(opsLine);

            if (!chartConfig.isNewProduct) {
                var opsBar = getOption(resultMap, "optionLineBar");
                opsBar.yAxis[0].max = resultMap.maxVolume;
                opsBar.yAxis[0].min = resultMap.minVolume;
                chart2.setOption(opsBar);
            }

            resultMap.seqid = seqid;
        },

        kChartHandle: function (dataList, chartType, isRefresh) {
            var _that = this;
            var seqid = "";
            var maxPrice = "", minPrice = "", maxVolume = "", minVolume = "";
            for (var i = 0; i < dataList.length; i++) {
                var openPrice = dataList[i].open;
                var closePrice = dataList[i].close;
                var highPrice = dataList[i].high;
                var lowPrice = dataList[i].low;
                var volume = dataList[i].volume;
                var date = dataList[i].date;
                var time = dataList[i].time;
                seqid = dataList[i].seqid;
                if (isRefresh == 1) {
                    maxPrice = resultMap.maxPrice;
                    minPrice = resultMap.minPrice;
                    maxVolume = resultMap.maxVolume;
                    minVolume = resultMap.minVolume;
                    if ($.inArray(time, resultMap.timeMap) >= 0) continue;
                }

                resultMap.timeMap.push(time);

                if (openPrice < 1 || closePrice < 1 || highPrice < 1 || lowPrice < 1 || date === "" || time === "") continue;

                if (chartType == "kd" || chartType == "kw" || chartType == "km") {
                    resultMap.dateMap.push(date);
                } else {
                    resultMap.dateMap.push(time.substr(9, 5));
                }

                var fClosePrice = parseFloat(closePrice);
                var fOpenPrice = parseFloat(openPrice);
                if (closePrice > openPrice) {
                    resultMap.amountMap.push(volume);
                    resultMap.amountMap2.push("-");
                } else {
                    resultMap.amountMap.push("-");
                    resultMap.amountMap2.push(Math.abs(volume));
                }

                var pointData = [openPrice, closePrice, highPrice, lowPrice];
                maxPrice = _that.getLargerItem(maxPrice, Math.max.apply(null, pointData));
                minPrice = _that.getSmallerItem(minPrice, Math.min.apply(null, pointData));
                maxVolume = _that.getLargerItem(maxVolume, volume);
                minVolume = 0;
                pointData.push(volume);
                resultMap.priceMap.push(pointData);

                resultMap.maxPrice = maxPrice;
                resultMap.minPrice = minPrice;
                resultMap.maxVolume = maxVolume;
                resultMap.minVolume = minVolume;
            }

            var opsK = getOption(resultMap, "optionK");
            var showRate = 100 - Math.floor(90 / resultMap.priceMap.length * 100);
            opsK.dataZoom.start = showRate;
            if (productcode === "Ag(T+D)") {
                opsK.yAxis[0].axisLabel.formatter = function (value, index) {
                    if (value) {
                        return Math.floor(value);
                    }
                };
            }
            opsK.yAxis[0].max = maxPrice;
            opsK.yAxis[0].min = minPrice;
            opsK.yAxis[0].minInterval = 0.01;
            opsK.yAxis[0].interval = (maxPrice-0.00001 - minPrice) / 6;


            if (chartConfig.isNewProduct) {
                opsK.dataZoom.show = true;
                opsK.grid.bottom = 70;
            }

            chart1.setOption(opsK);

            if (!chartConfig.isNewProduct) {
                var opsBar = getOption(resultMap, "optionBar");
                opsBar.dataZoom.start = showRate;
                opsBar.yAxis[0].max = resultMap.maxVolume;
                opsBar.yAxis[0].min = resultMap.minVolume;
                chart2.setOption(opsBar);
            }
            resultMap.seqid = seqid;

        },

        errHandle: function () {
            chart1.hideLoading();
            var errInfo = $("#errDialog");
            var realtime = $("#real-time-line");
            errInfo.show();
            realtime.hide();
            errInfo.on("click", "a", function () {
                window.location.reload();
            });
        },

        ajaxHandle: function (url, args, chartType) {
            var isRefresh = arguments[3] ? arguments[3] : 0;
            var _that = this;

            if (isRefresh === 0) {
                _that.clearData();
                chart1.clear();
                chart2.clear();
                delete (args.seqid);
            } else if (isRefresh === 1) {
                if ($.inArray(resultMap.seqid, resultMap.seqidList) >= 0) return;
                args.seqid = resultMap.seqid;
            }

            args.v = chartConfig.getRand();

            $.ajax({
                url: url,
                data: args,
                type: "GET",
                dataType: 'json',
                timeout: ASYNC_TIMEOUT,
                success: function (ajaxRet) {
                    if (ajaxRet && ajaxRet.code === 0 && ajaxRet.data.list) {
                        var dataList = ajaxRet.data.list;
                        dataList.reverse();

                        if (chartType == "line" || chartType == "line5") {
                            _that.lineChartHandle(dataList, chartType, isRefresh, +ajaxRet.data.lastsettle);
                        } else {
                            _that.kChartHandle(dataList, chartType, isRefresh);
                        }
                    }
                    chart1.hideLoading();
                },
                error: function (e) {
                    _that.errHandle();
                }
            });
        },

        bind: function () {
            var _that = this;
            var chart_tab = $(".market-chart-tab").find("a");
            var errDialog = $("#errDialog");

            $(this).on("render", function (e, chartType) {
                if (chartConfig.isNewProduct) {
                    $("#mychart1").css({ "height": "470px" });
                    chart1.resize();
                    $("#mychart2").hide();
                    $("#real-time-line").hide();
                } else {
                    $("#mychart2").show();
                }
                errDialog.hide();
                chart1.showLoading({ text: '正在加载...' });

                var url = null, args = null;
                chartType = chartType || "line";

                _that.chart = chartType;

                args = chartConfig.args[chartType];
                args.productcode = productcode;

                if (chartType.indexOf("k") >= 0) {
                    url = chartConfig.dataurl.k;
                } else {
                    url = chartConfig.dataurl[chartType];
                }

                if (chartType != "line") {
                    _that.realTimeLine.hide();
                }

                _that.ajaxHandle(url, args, chartType);
                echarts.connect([chart1, chart2]);
                echarts.connect([chart2, chart1]);

                clearInterval(chartConfig.timeTicket);
                if ($.inArray(_that.chart, chartConfig.refreshType) >= 0) {
                    if (START_REFRESH) {
                        chartConfig.timeTicket = setInterval(function () {
                            _that.ajaxHandle(url, args, chartType, 1);
                        }, REFRESH_INTERVAL_TIME);
                    }
                }
            });

            chart_tab.on("click", function () {
                chart_tab.removeClass("active");
                $(this).addClass("active");
                var chartType = $(this).data("chart") || "line";
                $(_that).trigger("render", [chartType]);
            });

            $(this).trigger("render");
        },

        init: function () {
            this.bind();
        }
    };

    var marketDetail = {

        getData: function () {
            var _that = this;
            $.ajax({
                url: "/market/getmarketdetaildata",
                data: { "productcode": productcode, "v": chartConfig.getRand() },
                type: "GET",
                dataType: 'json',
                timeout: ASYNC_TIMEOUT,
                success: function (ajaxRet) {
                    if (ajaxRet && ajaxRet.code === 0 && ajaxRet.data) {
                        _that.setData(ajaxRet.data);
                    }
                }
            });
        },

        convertNum: function (num) {
            if (num >= 1e4 && num < 1e8) {
                return Math.floor(parseFloat(num) / 1e4) + "万";
            } else if (num >= 1e8) {
                return Math.floor(parseFloat(num) / 1e8) + "亿";
            } else {
                return num;
            }
        },

        setData: function (data) {
            var productinfo = $("#productinfo");
            var chart_title = $(".chart-pd-title-wrap");
            var chart_body = $(".chart-pd-body-l");
            var title_html = "";
            var body_html = "";

            var classname = "";
            var updown = data.updown;
            var updownrate = (Math.abs(data.updownrate) * 100).toFixed(2) + "%";
            if (updown > 0) {
				classname = "uprate";
                updown = "+" + updown;
                updownrate = " +" + updownrate;
            } else {
                classname = "downrate";
                updownrate = " -" + updownrate;
            }

            var amount = this.convertNum(data.amount);
            var volume = this.convertNum(data.volume);

            title_html += "<a href=\"javascript:;\" class=\"btn-pre-chart\" title=\"\"><i></i></a>";
            title_html += "<h2 class=\"chart-pd-title\">" + data.productname + "<span class=\"eng-title\">" + productcode + "</span></h2>";
            title_html += "<a href=\"javascript:;\" class=\"btn-next-chart\" title=\"\"><i></i></a>";
            chart_title.html(title_html);

            var datatime = data.time;
            body_html = "<strong class=\"chart-pd-value " + classname + "\">" + data.newprice + "</strong>" +
                "<div class=\"chart-pd-value-rate " + classname + "\">" +
                "<div class=\"chart-pd-value-per\">" +
                "<span style=\"margin-right:10px;\">" + updown + "</span>" +
                "<span>" + updownrate + "</span>" +
                "</div>" +
                "<div class=\"chart-update-time\">最后更新 " + datatime + "</div>" +
                "</div>" +
                "<ul class=\"chart-pd-statelist\">" +

                "<li><p>今开<span>" + data.open + "</span></p>" +
                "<p>昨收<span>" + data.lastclose + "</span></p></li>" +
                "<li><p>最高<span>" + data.high + "</span></p>" +
                "<p>最低<span>" + data.low + "</span></p></li>";

                if(!chartConfig.isNewProduct) {
                    body_html += "<li><p>成交额<span>" + amount + "</span></p>";
                    body_html += "<p>成交量<span>" + volume + "</span></p></li>";
                }

                body_html += "</ul>";
            chart_body.html(body_html);
        },

        productToggle: function () {
            var productList = ["Au(T+D)", "mAu(T+D)", "Ag(T+D)", "XAU", "XAG", "USD"];
            var chartToggle = $(".chart-pd-title-wrap");
            chartToggle.on("click", "a", function () {
                var currIndex = null;
                $.map(productList, function (v, i) {
                    if (productcode === v) {
                        currIndex = i;
                    }
                });

                var nextProduct = null;
                var thisIndex = $(this).index();
                switch (thisIndex) {
                    case 0:
                        if (currIndex === 0) {
                            nextProduct = productList[5];
                        } else {
                            nextProduct = productList[currIndex - 1];
                        }
                        break;
                    case 2:
                        if (currIndex === 5) {
                            nextProduct = productList[0];
                        } else {
                            nextProduct = productList[currIndex + 1];
                        }
                        break;
                }
                window.location.href = "/market/main/productcode/" + nextProduct;
            });
        },

        init: function () {
            var _that = this;
            _that.getData();
            _that.productToggle();

            clearInterval(chartConfig.detailTimeTicket);
            if (START_REFRESH) {
                chartConfig.detailTimeTicket = setInterval(function () {
                    _that.getData();
                }, REFRESH_INTERVAL_TIME);
            }
        }
    };

    var pricelist = [];
    var product = {
        setData: function (data) {
            var productlist = $(".market-panel");
            var product_html = "";
            $.each(data, function (index, value) {
                var classname = "";
                var newprice = value.newprice;
                var productname = value.productname;

                var updown = value.updown;
                var updownrate = (Math.abs(value.updownrate) * 100).toFixed(2) + "%";
                if (updown > 0) {
                    classname = "market-panel-item-uprate";
                    updown = "+" + updown;
                    updownrate = " +" + updownrate;
                } else {
                    classname = "market-panel-item-downrate";
                    updownrate = " -" + updownrate;
                }

                if (pricelist[index]!=="" &&  pricelist[index] === newprice) {
                    classname += " active";
                    setTimeout(function(){
                        productlist.find("div").removeClass('active');
                    },500);
                }
                pricelist[index] = newprice;


                if (productcode != value.productcode) {
                    product_html += "<div productcode=\"" + value.productcode + "\" class=\"market-panel-item " + classname + "\">" +
                        "<div class=\"panel-pd-title\">" + productname + "</div>" +
                        "<div class=\"panel-pd-value\">" + newprice + "</div>" +
                        "<div class=\"panel-pd-per\"><span class=\"pd-rate\">" + updown + "</span><span class=\"pd-rate\">" + updownrate + "</span></div>" +
                        "</div>";
                }
            });
            productlist.html(product_html);
            productlist.children().on("click", function () {
                var _productcode = $(this).attr("productcode");
                window.location.href = "/market/main/productcode/" + _productcode;
            });
        },
        getData: function () {
            var _that = this;
            $.ajax({
                url: "/market/getmarketlistdata",
                data: { "v": chartConfig.getRand() },
                type: "GET",
                dataType: 'json',
                timeout: ASYNC_TIMEOUT,
                success: function (ajaxRet) {
                    if (ajaxRet && ajaxRet.code === 0 && ajaxRet.data.list) {
                        _that.setData(ajaxRet.data.list);
                    }
                }
            });
        },
        init: function () {
            var _that = this;
            _that.getData();
            if (START_REFRESH) {
                var marketTimeTicket = setInterval(function () {
                    _that.getData();
                }, REFRESH_INTERVAL_TIME);
            }
        }
    };

    return {
        init: function () {
            goldChart.init();
            marketDetail.init();
            product.init();
        }
    };
// });
