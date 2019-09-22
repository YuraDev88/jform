/**
 * jform v1.7.1 - Form module
 * http://mapve.ru/makets/jform/
 * Copyright 2018, Yuri Kozlov
 * Released under the MIT license - http://opensource.org/licenses/MIT
 * Released on: Jul 04, 2019
 **/
var jform = {
    'config': {initAlert:"Заполните это поле",correctAlert:"Заполните поле корректно",rusAlert:"Введите русские буквы",emptyClass:'jform-empty-field',errorClass:'jform-red-input',sitekeyRecap:'',successMessage:'Спасибо! Сообщение отправлено.',errorMessage:'Что-то пошло не так'},
	'initForm': function(arrayConfigForm){
		this.config = $.extend(this.config, arrayConfigForm);
	},
	'closeWindowRefresh': function(){
		location.href = window.location.href;
	},
	'closeWindowToggle': function(){
		$('.jform-overlay').fadeOut("fast");
		$('body,html').removeClass("jform-noscroll");
		if(this.config.recaptcha)grecaptcha.reset();
	},
	'removeNotice': function(el){
		el.removeClass(this.config.emptyClass).removeClass(this.config.errorClass).next().remove();
	},
	'addNotice': function(el, notice){
		el.addClass(this.config.emptyClass).addClass(this.config.errorClass);
		el.next().remove();
		el.parent().append('<div class="jform-notice">'+ notice +'</div>');
	},
	'checkInput': function(forma, el){
		var inner = this;
		if(el){
			if(el.hasClass('js-rfield')){
				inner.checkSingleInput(el);
			}
		}else{
			$(forma).find('.js-rfield').each(function(){
				inner.checkSingleInput($(this));
			});
		}
	},
	'checkSingleInput': function(el){
		if(el.val() != ''){
			this.removeNotice(el);
			if(el.hasClass('js-tele')){
				this.checkInputPattern(el,/^((8|\+7)[\- ]?)?(\(?\d{3}\)?[\- ]?)?[\d\- ]{7,10}$/,this.config.correctAlert);
			}else if(el.hasClass('js-email')){
				this.checkInputPattern(el,/^(("[\w-\s]+")|([\w-]+(?:\.[\w-]+)*)|("[\w-\s]+")([\w-]+(?:\.[\w-]+)*))(@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$)|(@\[?((25[0-5]\.|2[0-4][0-9]\.|1[0-9]{2}\.|[0-9]{1,2}\.))((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\.){2}(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[0-9]{1,2})\]?$)/i,this.config.correctAlert);
			}else if(el.hasClass('js-rus')){
				this.checkInputPattern(el,/^[а-яА-ЯёЁ]/,this.config.rusAlert);
			}
		}else{
			this.addNotice(el,this.config.initAlert);
		}
	},
	'checkInputPattern': function(el, pattern, specNotice){
		if(el.val() != ''){
			if(pattern.test(el.val())){
				this.removeNotice(el);
			}else{
				this.addNotice(el,specNotice);
			}
		}else{
			this.addNotice(el,this.config.initAlert);
		}
	},
	'getTemplateWrap': function(inputWrap){
		var templateWrap = '<div id="jform">'+
								'<div class="jform-overlay">'+
									'<div class="jform-wrap jform-clwsh">'+
										'<span class="jform-title">' + this.config.titleForm + '</span>'+
										'<form class="jform-form" method="post">'+
											inputWrap + 
											'<div class="jform-error"></div>'+
											'<div id="jrecaptcha"></div>'+
											'<div class="jform-wrap-polity">'+
												'<label class="jform-check-wrap jform-option"><input name="polity_check" id="polity_check" class="jform-check jform-polity-check" value="1" type="checkbox" checked=""><span class="jform-check-box"></span>Согласие на обработку <a href="policy">персональных данных</a></label>'+
											'</div>'+
											'<button id="submit_form" class="jform-btn js-send-jform">' + this.config.textBtn + '</button>'+
											'<input type="hidden" name="action" id="action" value="' + this.config.actionForm + '">'+
											'<input type="hidden" name="fileHidden" id="fileHidden" value="">'+
											'<input type="text" name="address" id="address" class="js-requared" value="">'+
										'</form>'+
										'<div class="jform-result"></div>'+
										'<button class="jform-close">×</button>'+
									'</div>'+
								'</div>'+
							'</div>';
		return templateWrap;
	},
	'getTemplateInputWrap': function(arrayInput){
		var inputWrap = '', index;
		for (index = 0; index < arrayInput.length; ++index){
			if(arrayInput[index].name){
				if(arrayInput[index].type=='file'){
					inputWrap += '<div class="jform-wrap-input"><input type="'+arrayInput[index].type+'" name="'+arrayInput[index].name+'" id="'+arrayInput[index].name+'" class="jform-input '+arrayInput[index].listClass+'"><div class="file-val"></div><span class="file-button">'+arrayInput[index].placeholder+'</span></div>';
				}else if(arrayInput[index].type=='text'){
					var placeholder = arrayInput[index].placeholder!==undefined ? arrayInput[index].placeholder : '';
					var value = arrayInput[index].value!==undefined ? arrayInput[index].value : '';
					if(arrayInput[index].requared)placeholder = placeholder + ' *';
					inputWrap += '<div class="jform-wrap-input jform-icon-'+arrayInput[index].name+'"><input placeholder="'+placeholder+'" type="'+arrayInput[index].type+'" name="'+arrayInput[index].name+'" id="'+arrayInput[index].name+'" class="jform-input '+arrayInput[index].listClass+'" value="'+value+'"></div>';
					if(arrayInput[index].mask)inputWrap += '<script>$("#'+arrayInput[index].name+'").mask("'+arrayInput[index].mask+'");</script>';
					if(arrayInput[index].autocomplete)inputWrap += '<script>$("#'+arrayInput[index].name+'").autocomplete({source: "'+arrayInput[index].source+'"})</script>';
				}else{
					inputWrap += '<div class="jform-wrap-input"><textarea placeholder="'+arrayInput[index].placeholder+'" name="'+arrayInput[index].name+'" id="'+arrayInput[index].name+'" class="jform-textarea '+arrayInput[index].listClass+'"></textarea></div>';
				}
			}
		}
		return inputWrap;
	},
	'openWindow': function(arrayConfigForm,arrayInput){
		var jform = '', size = 'compact';
		this.initForm(arrayConfigForm);
		var inputWrap = this.getTemplateInputWrap(arrayInput);
		jform = this.getTemplateWrap(inputWrap);
		this.closeRemoveWindow();
		$("body,html").addClass("jform-noscroll");
		$("body").append(jform);
		if(this.config.recaptcha){
			if($(window).width() > 320){
				size = 'normal';
			}
			grecaptcha.render('jrecaptcha', { 
				'sitekey': this.config.sitekeyRecap,
				'theme': 'light',
				'size': size
			});
		}
	},
	'closeRemoveWindow': function(){
		$('#jform').remove();
		$("body,html").removeClass("jform-noscroll");
	},
	'sendJForm': function(forma, close, btn){
		var classBtn = 'js-send-jform';
		this.checkInput(forma, false);
		var sizeEmpty = $(forma).find('.'+this.config.emptyClass).size();
		var self = this;
		if (sizeEmpty == 0){
			btn.removeClass(classBtn);
			$('.jform-error').html();
			$.ajax({
				url: "lib/mail.php",
				type: "post", 
				data: $(forma).serialize(),
				success: function(msg){
					if(msg.send){						
						if((self.config.yaCounter_id!==undefined)&&!isNaN(parseInt(self.config.yaCounter_id))&&(typeof eval('yaCounter'+self.config.yaCounter_id)=='object')){
							eval('yaCounter'+self.config.yaCounter_id).reachGoal(self.config.yaCounter_target_name);
						}
						$(forma).html('<span class="jform-text-result"><div class="icon success animate"> <span class="line tip animateSuccessTip"></span> <span class="line long animateSuccessLong"></span> <div class="placeholder"></div> <div class="fix"></div> </div>'+self.config.successMessage+'</span>');
						//if(close){setTimeout(this.closeWindowToggle, 3000)};
					}else{
						if(self.config.recaptcha)$(forma).find('.jform-error').html(msg.recap);
						btn.addClass(classBtn);
					}
				},
				error: function(html){
					$('.jform-form').hide();
					$('.jform-result').show().html('<span class="jform-text-result"><div class="icon error animateErrorIcon" style="display: block;"><span class="x-mark animateXMark"><span class="line left"></span><span class="line right"></span></span></div>'+self.config.errorMessage+'</span>');
					setTimeout(this.hideError, 3000);
					btn.addClass(classBtn);
				}
			});
		}
	},
	'uploadFile': function(forma){
		if(forma['context'].files[0]){
			var file_data = forma['context'].files[0];
			var form_data = new FormData();
			$('#'+forma['context'].id).next().text(forma['context'].files[0].name);
			form_data.append('file', file_data);
			$.ajax({
				url: "lib/mail.php?action=upload_file",
				type: "post", 
				contentType: false,
				processData: false,
				data: form_data,
				success: function(res) {
					if(res.nameFile){
						var strNameFiles = $('#fileHidden').val() + '***' + res.nameFile.trim();
						$('#fileHidden').val(strNameFiles);
					}else{
						$('.jform-result').show().html(res.send);
					}
				}
			});
		}
	},		
	'hideError': function(forma){
		$('.jform-form').show();
		$('.jform-result').hide();
	},
	'disableBtn': function(checkbox, classBtn){
		var btnForm = checkbox.closest('form').find(classBtn);
		if(checkbox.prop("checked")) {
			btnForm.removeAttr('readonly').css('visibility','visible');	
		}else{
			btnForm.attr('readonly','true').css('visibility','hidden');
		}
	},
};	

$(document).ready(function(){
	$(document).on("click", ".jform-overlay,.jform-close", function(){
		jform.closeWindowToggle();
	});
	$(document).on("click", ".jform-wrap", function(e){
		e.stopPropagation();
	});
	$(document).on("click", ".jform-polity-check", function(){
		jform.disableBtn($(this),'.js-send-jform');
	});
	$(document).on("click", ".js-send-jform", function(e){
		e.preventDefault();
		jform.sendJForm($(this).closest('form'),true,$(this));
		return false;
	});
	$(document).on("input", ".jform-input", function(e){
		jform.checkInput(false,$(this));
	});
	$(document).on("click", ".js-open-jform", function(){
		jform.openWindow(
			{
				titleForm: 'Заказ обратного звонка',
				textBtn: 'Заказать',
				actionForm: 'callback',
				successMessage: 'Спасибо, Ваше сообщение отправлено. Скоро мы свяжемся с Вами.',
				recaptcha: false,
			},
			[
				{name: 'name', placeholder: 'Ваше имя', listClass: 'js-rfield', type: 'text', requared: true}, 
				{name: 'phone', placeholder: 'Ваш телефон', listClass: 'js-rfield js-tele', type: 'text', requared: true, mask: '+7(999)999-99-99'}, 
				{name: 'email', placeholder: 'Ваш email', listClass: 'js-rfield js-email', type: 'text', requared: true}, 
				{name: 'text', placeholder: 'Ваш текст', listClass: '', type: 'text', value: 'Привет!'}, 
				{name: 'file', placeholder: 'Ваше фото', listClass: '', type: 'file'}, 
				{name: 'country', placeholder: 'Ваша страна', listClass: '', type: 'text', autocomplete: true, source: 'country.php'}, 
				{placeholder: 'Ваша страна', listClass: '', type: 'text', autocomplete: true, source: 'country.php'}, 
			]
		);
		return false;
	});
	$(document).on("change", ".jform-wrap-input input[type='file']", function(e){
		jform.uploadFile($(this).closest('form'));
		return false;
	});
});
