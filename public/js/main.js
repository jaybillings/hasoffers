/* === Individual employee card === */

var card = $$({
    model: {},
    view: {
        format: $('#employee-card-template').html()
    },
    controller: {
        'create': function () {
            // Need to check this because the function runs once
            // before object instantiation
            if (!this.model.get('conversions')) return false;

            var me = this,
                sortedConversions,
                startDate,
                endDate,
                revenue;

            // Set model data
            sortedConversions = me.model.get('conversions').sort(function (a, b) {
                var date1 = new Date(a.time),
                    date2 = new Date(b.time);
                if (date1 < date2) {
                    return -1;
                } else if (date1 > date2) {
                    return 1;
                }
                return 0;
            });

            startDate = new Date(sortedConversions[0].time);
            endDate = new Date(sortedConversions[sortedConversions.length - 1].time);
            revenue = (Math.round(this.model.get('revenue'))).toString();

            this.model.set({
                revenue: '$' + revenue.slice(0, -3) + ',' + revenue.slice(-3),
                conversions: sortedConversions,
                totalConversions: me.model.get('conversions').length,
                start: startDate.getMonth() + '/' + startDate.getDay(),
                end: endDate.getMonth() + '/' + endDate.getDay()
            });

            // Set avatar
            if (this.model.get('avatar') !== '') {
                this.view.$('.avatar span').css('display', 'none');
            }
            this.view.$('.avatar').css('background-image', 'url(' + this.model.get('avatar') + ')');

            // Create chart once DOM is loaded
            setTimeout(function () {
                renderChart(me.view.$('canvas'), me.model.get('conversions'));
            }, 1000);
        }
    }
});

/* === Employee Chart === */

var employeeChart = $$({
    model: {},
    view: {
        format: '<div class="employee-chart"></div>'
    },
    controller: {
        'create': function () {
            var usersData = {},
                me = this,
                req1,
                req2;
            // Get users.json data
            req1 = $.getJSON('data/users.json', function (data) {
                $.each(data, function (i, val) {
                    val.initial = val.name[0];
                    if (usersData[val.id]) {
                        $.extend(usersData[val.id], val);
                    } else {
                        usersData[val.id] = val;
                        usersData[val.id].impressions = 0;
                        usersData[val.id].conversions = [];
                        usersData[val.id].revenue = 0;
                    }
                });
            });
            // Get logs.json data
            req2 = $.getJSON('data/logs.json', function (data) {
                $.each(data, function (i, val) {
                    var id = val['user_id'];
                    if (!usersData[id]) {
                        usersData[id] = {
                            impressions: 0,
                            conversions: [],
                            revenue: 0
                        };
                    }
                    if (val.type === 'impression') {
                        usersData[id].impressions += 1;
                    } else {
                        usersData[id].revenue += val.revenue;
                        usersData[id].conversions.push({
                            'time': val.time,
                            'revenue': val.revenue
                        });
                    }
                })
            });
            $.when(req1, req2).done(function () {
                $.each(usersData, function(i, val) {;
                    me.append($$(card, val));
                })
            });
        }
    }
});
$$.document.append(employeeChart);

/* === Chart rendering === */

var renderChart = function (chartView, conversions) {
    var ctx = chartView.get(0).getContext("2d"),
        options = {
            animation: false,
            bezierCurve: false,
            pointDot: false,
            showTooltips: false,
            scaleGridLineColor: 'rgba(0,0,0,0)',
            scaleLineColor: 'rgba(0,0,0,0)',
            scaleShowGridLines: false,
            scaleShowLabels: false
        },
        data = [],
        labels = [],
        condensedData = {},
        chartData;

    // Only want daily totals or the chart is unreadable
    conversions.forEach(function(val) {
        var date = val.time.split(' ')[0];
        if (condensedData[date]) {
            condensedData[date] += val.revenue;
        } else {
            condensedData[date] = val.revenue;
        }
    });

    $.each(condensedData, function (i, val) {
        data.push(val);
        labels.push('');
    });

    chartData = {
        labels: labels,
        datasets: [{
            data: data,
            fillColor: 'rgba(0,0,0,0)',
            strokeColor: 'rgba(0,0,0,1)'
        }]
    };

    new Chart(ctx).Line(chartData, options);
};
