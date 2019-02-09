// JavaScript Document
jQuery.fn.ajax_form = function() {
	$(this).each(function() {
		$(this).on('submit',ajax_forms.process_form)
			   .on('change keyup paste','input,textarea,select',function() {
				   ajax_forms.hideError($(this));
   			   });
	});
	return this;
};

$(function() {
	$('form[data-submit="ajax"]').ajax_form();
});

var ajax_forms = {
	
	process_form: function(event) {
	
		event.preventDefault();
		
		var form = $(this); 
		var data = form.serialize();
		var url = form.attr('action');
		data.responseType = 'json';
		
		console.log("submitting form");
		$.ajax({
			url: url,
			type: 'POST',
			dataType: 'json', 
			data: data, 
			success: function(data) {
				console.log("got response");
				if ( data.ok ) {
					if ( ! data.redirect ) {
						data.redirect = window.location.href;
					}
					window.location.href = data.redirect;
				} else {
				
					var messages = [];
					if ( data.message ) {
						messages.push(data.message);
					}
					
					var errors = [];
					if ( typeof data.errors === 'object' ) {
						Object.keys(data.errors).forEach(function(key,index) {
							errors.push({field:key,msg:data.errors[key]});
   					    });
					} else {
						errors = data.errors;
					}

					if ( errors.length ) {
						// display errors
						$.each(errors,function(index,error) {
							// get the input element
							var element = $('[name='+error.field+']').first();
							if ( element.length ) {
								ajax_forms.showError(element,error.msg);
							} else {
								messages.push(error.field+": "+error.msg);
							}
						});
						
						// set focus on first error
						$('#'+errors[0].field).focus();
					}
					
					// Display popup if necessay
					if ( messages.length ) {
						if ( typeof bootbox !== 'undefined' ) {
							bootbox.alert({title: '<i class="fa fa-exclamation-circle text-danger"></i> Error',
										   message: messages.join('<br />')
										  });
						} else if ( typeof swal !== 'undefined' ) {
							swal(messages.join("\n"), {
								icon: "error"
							});
						} else {
							alert(messages.join("\n"));
						}
					}
					
				}
			},
			error: function(xhr,status) {
				alert(xhr.responseText);
			}
		}); /* $.ajax */

	}, /* process_form */
	
	hideError: function(element) {
		element.removeClass('is-invalid');
		name = element.attr('name');
		errorElement = ajax_forms.errorElements[name];
		if ( errorElement !== undefined ) {
			errorElement.hide();
		}
	},
	
	showError: function(element,error) {
		// set error class on element
		element.addClass('is-invalid');

		// get the error element
		name = element.attr('name');
		errorElement = ajax_forms.errorElements[name];
		if ( errorElement === undefined ) {
			// create new error element
			errorElement = $('<span></span>')
							.addClass("invalid-feedback")
							.text(error);
			// insert error element 
			if (element.prop('type') === 'radio') {
				errorElement.prependTo(formGroup);
			} else if (element.parent('.input-group').length || element.prop('type') === 'checkbox' ) {
				errorElement.insertAfter(element.parent());
			} else {
				errorElement.insertAfter(element);
			}
			// save error element for later
			ajax_forms.errorElements[name] = errorElement;
		} else {
			// use existing error element
			errorElement.text(error).show();
		}
	},
	
	errorElements: {}
	
} /* ajax_forms */

