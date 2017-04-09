/*Global javascript - scripts that are used on most pages*/
$(".chips").material_chip({placeholder:"+language",secondaryPlaceholder:'Language'});
$(".charcount").characterCounter();

function projectCreateBeforeSubmit()
{
	var langs = [];
	$("#langs-ui").material_chip('data').forEach(function(i)
	{
		langs.push(i['tag']);
	});
	$("input[name=langs]").val(langs.join(','));
	return true;
}
$("#project-create").submit(projectCreateBeforeSubmit);