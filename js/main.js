$(document).ready(function () {
    console.log("!!!!!!!")
});

/* === Individual employee card === */

var chart = $$({
    model: {},
    view: {
        format: '<canvas class="conversions-chart" width="150px" height="70px"></canvas>'
    },
    controller: {
        'create': function () {
            if (!this.model.get('id')) return false;

            var me = this,
                id = 'chart-' + this.model.get('id');

            this.view.$().attr('id', id);

            setTimeout(function () {
                renderChart(me.view.$(), me.model.get('conversions'));
            }, 5000);

        }
    }
});

var card = $$({
    model: {},
    view: {
        format: $('#employee-card-template').html()
    },
    controller: {
        'create': function () {
            if (!this.model.get('conversions')) return false;
            var me = this;
            // Set avatar url
            if (this.model.get('avatar') !== '') {
                this.view.$('.avatar span').css('display', 'none');
            }
            this.view.$('.avatar').css('background-image', 'url(' + this.model.get('avatar') + ')');

            this.model.set({'revenue': '$' + Math.round(this.model.get('revenue'))});

            setTimeout(function () {
                renderChart(me.view.$('canvas'), me.model.get('conversions'));
            }, 1000);
        }
    }
});

/* === Employee Chart === */

var employeeChart = $$({
    model: {
        users: []
    },
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
                    if (!usersData[val['user_id']]) {
                        usersData[val['user_id']] = {
                            impressions: 0,
                            conversions: [],
                            revenue: 0
                        };
                    }
                    if (val.type === 'impression') {
                        usersData[val['user_id']].impressions += 1;
                    } else {
                        usersData[val['user_id']].revenue += val.revenue;
                        usersData[val['user_id']].conversions.push({
                            'time': val.time,
                            'revenue': val.revenue
                        });
                    }
                })
            });
            $.when(req1, req2).done(function () {
                $.each(usersData, function(i, val) {
                    var newCard = $$(card, val);
                    me.append(newCard);
                })
            });
        }
    }
});
$$.document.append(employeeChart);

/* === Chart functions === */
var renderChart = function (chartView, conversions) {
    var ctx = chartView.get(0).getContext("2d"),
        options = {
            animation: false,
            bezierCurve: false,
            pointDot: false,
            scaleGridLineColor: 'rgba(0,0,0,0)',
            scaleLineColor: 'rgba(0,0,0,0)',
            scaleShowGridLines: false,
            scaleShowLabels: false
        },
        data = [],
        labels = [],
        sortedData,
        chartData;

    sortedData = conversions.sort(function (a, b) {
        var date1 = new Date(a.time),
            date2 = new Date(b.time);
        if (date1 < date2) {
            return -1;
        } else if (date1 > date2) {
            return 1;
        }
        return 0;
    });

    sortedData.forEach(function(val, i) {
        data.push(val.revenue);
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

    chart = new Chart(ctx).Line(chartData, options);
};
