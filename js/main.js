// Individual employee card
var card = $$({
    model: {
        name: '',
        avatar: '',
        id: 0,
        occupation: ''
    },
    view: {},
    controller: {}
});

// Employee chart
var chart = $$({
    model: {
        users: []
    },
    view: {
        format: $('#employee-card-template').html()
    },
    controller: {
        'create': function () {
            var usersData = {},
                req1,
                req2;
            // Get users.json data
            req1 = $.getJSON('data/users.json', function (data) {
                $.each(data, function (i, val) {
                    if (usersData[val.id]) {
                        $.extend(usersData[val.id], val);
                    } else {
                        usersData[val.id] = val;
                    }
                });
            });
            req2 = $.getJSON('data/logs.json', function (data) {
                $.each(data, function (i, val) {
                    if (usersData[val['user_id']]) {
                        $.extend(usersData[val['user_id']], val);
                    } else {
                        usersData[val['user_id']] = val;
                    }
                })
            });
            $.when(req1, req2).done(function () {
                console.log(usersData);
            });
        }
    }
});
$$.document.append(chart);

//
// Item prototype
//
/*var item = $$({}, '<li><span data-bind="content"/> <button>x</button></li>', '& span { cursor:pointer; }', {
  'click span': function(){
    var input = prompt('Edit to-do item:', this.model.get('content'));
    if (!input) return;
    this.model.set({content:input});
  },
  'click button': function(){
    this.destroy();
  }
});

//
// List of items
//
var list = $$({}, '<div> <button id="new">New item</button> <ul></ul> </div>', {
  'click #new': function(){
    var newItem = $$(item, {content:'Click to edit'});
    this.append(newItem, 'ul'); // add to container, appending at <ul>
  }
});

$$.document.append(list);*/
