const deleteDriver = (id) => {
    const question = confirm('Apa kamu yakin akan menghapus ini?');
    if (question) {
        $.ajax({
            url: `/api/driver/${id}`,
            type: "DELETE",
            success: function (resp) {
                alert("Sukses menghapus")
                location.reload();
            }
        })
    } else {
        return;
    }
};