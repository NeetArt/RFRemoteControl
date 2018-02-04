$(document).ready(function(){
    $('.switchButton').on('click', toggleSwitch);
});

function toggleSwitch() {
    var buttonObj = $(this);
    var origButtonText = buttonObj.val();
    $.ajax({
        type: 'POST',
        url: '/switches/' + buttonObj.data('op') + '/' + buttonObj.data('id'),
        beforeSend: function() {
            buttonObj.prop('disabled', true);
            buttonObj.val('Running...');
        },
        success: function(data) {
            var errorPara = buttonObj.parent().find('.errortext');
            errorPara.css('display', 'none');
        },
        error: function(xhr) {
            var errorPara = buttonObj.parent().find('.errortext');
            errorPara.css('display', 'block');
            errorPara.text('Error!! ' + xhr.statusText + xhr.responseText);
        },
        complete: function() {
            buttonObj.prop('disabled', false);
            buttonObj.val(origButtonText);
        }
    });
}
