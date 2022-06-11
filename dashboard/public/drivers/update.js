const link = new URL(window.location.href);
const params = link.searchParams.get('_id');

var data = {};
$(document).ready(async function() {

    var response = await $.ajax({
        url: `/api/driver/${params}`,
        type: "GET",
        dataType: "json",
        success: function (resp) {
        }
    })

    data = response;

    document.getElementById('name').value = data.name;
    document.getElementById('url').value = data.url;
    document.getElementById('use_proxy').checked = data.use_proxy;
    document.getElementById('use_proxy').value = data.use_proxy;
    document.getElementById('proxy_credential').value = data.proxy_credential;
    document.getElementById('user_agent').value = data.user_agent;
    document.getElementById('headers').value = JSON.stringify(data.headers);

    let driverType = document.getElementsByName('type');

    for (let i = 0; i < driverType.length; i++) {
        if (driverType[i].value === data.type) {
            driverType[i].checked = true;
        }
    }

    // sitemap
    document.getElementById('sitemapUrl').value = data.definition.sitemap.url;
    document.getElementById('sitemapPattern').value = data.definition.sitemap.pattern;
    document.getElementById('sitemapThrottle').value = data.definition.sitemap.throttle;

    // api
    document.getElementById('apiArgument').value = data.definition.api.argument;
    document.getElementById('apiCurrentPage').value = data.definition.api.current_page;
    document.getElementById('apiTotalPage').value = data.definition.api.total_page;
    document.getElementById('apiTotalPageSize').value = data.definition.api.total_page_size;
    document.getElementById('apiUrl').value = data.definition.api.url;

    // const productDefinitionLength = data.definition.product.definition.length;
    // for (let i = 1; i < productDefinitionLength; i++) {
    //     addProductForm();
    // }

    // let productDefinitions = document.getElementsByName('definition[product][definition][]');
    // let dataProductName = data.definition.product.definition.map(val => {
    //     return val;
    // });

    // for (let i = 0; i < productDefinitions.length; i++) {
    //     productDefinitions[i].value = dataProductName[i];
    // }

    let renderingType = document.getElementsByName('definition[product][rendering]');

    for (let i = 0; i < renderingType.length; i++) {
        if (renderingType[i].value === data.definition.product.rendering) {
            renderingType[i].checked = true;
        }
    }
    document.getElementById('thortlePerMinute').value = data.definition.product.throttle ? data.definition.product.throttle : 0 ;
    document.getElementById('definitionProductDefinition').value = data.definition.product.definition;
    console.log(data.definition.product.definition)

    if (data.use_lazy === true || data.use_lazy === false) {
        document.getElementById('use_lazy_label').checked = data.use_lazy;
    }

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

        if (data.definition.products.navigation.event) {
            document.getElementById('navigationEvent').value = data.definition.products.navigation.event
        }
        if (data.definition.products.navigation.selector) {
            document.getElementById('navigationSelector').value = data.definition.products.navigation.selector
        }
        if (data.definition.products.navigation.type) {
            document.getElementById('navigationType').value = data.definition.products.navigation.type
        }
        if (data.definition.products.product.selector) {
            document.getElementById('productSelector').value = data.definition.products.product.selector
        }
    } else {
        $('#products').hide();
    }

    if (radioValue === 'js') {
        $('#use_lazy_class').show();
    }
    else {
        $('#use_lazy_class').hide();
    }

    if( radioValue === 'sitemap'){
        $('#sitemapObject').show();
    }
    else {
        $('#sitemapObject').hide();
    }

    if( radioValue === 'api'){
      $('#apiObject').show();
  }
  else {
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

$('.formupdate').on('submit', function () {

    var data = $('.formupdate').serializeObject();
    $.ajax({
        url: `/api/driver/${params}`,
        type: "PUT",
        data: JSON.stringify(data),
        contentType: "application/json; charset=utf-8",
        dataType: "json",
        success: function () {
            alert("Sukses Mengubah Data !!!")
            window.location.replace('/driver');
        }
    })
    return false;
});
