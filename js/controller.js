$(document).delegate("#page1", "pageinit", function() {
	$("#footer").bind("vclick.page1", footer_vclick);
	if (typeof page1_create == "function")
		page1_create();
});
