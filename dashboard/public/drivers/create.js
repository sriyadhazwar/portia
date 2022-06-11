$(document).ready(function () {
    setProducts();
});

$(function () {
    $("input[name='type']").on('change', function () {
        setProducts();
    });
});

$(function () {
    $(':checkbox').on('change', function () {
        if (this.checked === true) {
            $(this).val(true);
        } else {
            $(this).val(false);
        }
    });
});

function setProducts() {
  let radioValue = $("input[name='type']:checked").val();
  if (radioValue === 'js' || radioValue === 'server') {
      $('#products').show();
  } else {
      $('#products').hide();
  }

  if (radioValue === 'js') {
    $('#use_lazy_class').show();
  } else {
    $('#use_lazy_class').hide();
  }

  if ( radioValue === 'sitemap'){
    $('#sitemapObject').show();
  } else {
    $('#sitemapObject').hide();
  }

  if ( radioValue === 'api'){
    $('#apiObject').show();
  } else {
    $('#apiObject').hide();
  }
}

async function jsonCheck() {

    var definition = $('#definitionProductDefinition').serializeObject();

    var response = await $.ajax({
        url: `/api/driver/check-json`,
        type: "POST",
        data: JSON.stringify(definition),
        contentType: "application/json; charset=utf-8",
        success: function (resp) {
        }
    })

    var res = response;
    if (res == true){
        $('#definitionProductDefinitionAlert').html("<div class='alert alert-success'>"+"Format JSON Benar"+"</div>");
    }
    else {
        $('#definitionProductDefinitionAlert').html("<div class='alert alert-danger'>"+"Format JSON Salah"+"</div>");
    }
}

$('.formcreate').on('submit', function () {

    var data = $('.formcreate').serializeObject();
    $.ajax({
        url: "/api/driver",
        type: "POST",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            alert("Sukses Menambah Data !!!")
            window.location.replace('/driver');
        }
    })
    return false;
});
