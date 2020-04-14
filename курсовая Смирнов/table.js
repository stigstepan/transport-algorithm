$(function () {
    $('#table').click(function (event) {
        var $cell = $(event.target).parents('td').andSelf().filter('td');
        if ($cell.length > 0) {
            $('#table td').removeClass('active');
            $cell.addClass('active');
        }
    });
    $('#delrow').click(function (event) {
        var $cell = $('#table td.active');
        if ($cell.length == 1) {
            $cell.parents('tr:eq(0)').remove();
        }
    });
    $('#delcell').click(function (event) {
        var $cell = $('#table td.active');
        if ($cell.length == 1) {
            var cnt = $cell.index() + 1;
            $('#table tr td:nth-child(' + cnt + ')').remove();
            /*$('#table tr').each(function(){
                $('td',this).eq(cnt).remove();
            });*/
        }
    });
    $('#addcell').click(function (event) {
        var $cell = $('#table td.active');
        if ($cell.length == 1) {
            var cnt = $cell.prevAll('td').length;
            $('#table tr').each(function () {
                $('td', this).eq(cnt).after('<td>');
            });
        }
    });
    $('#addrow').click(function (event) {
        var $cell = $('#table td.active');
        if ($cell.length == 1) {
            var cnt = $cell.parent().prevAll('tr').length;
            var $myTr = $('#table tr').eq(cnt);
            $myTr.before($myTr.clone());
        }
    });
    $('#editTd').click(function () {
        var
            $cell = $('td.active'),
            text = $cell.text();
        $cell.empty().append('<textarea>' + text + '</textarea>');
    });
    $('#saveTd').click(function () {
        var
            $cell = $('td.active'),
            text = $cell.children().val();
        $cell.empty().append(text);
    });
    $('#calculate').click(function () {
        cheapestCost();
    });

});