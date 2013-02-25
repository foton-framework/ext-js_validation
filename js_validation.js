if (typeof ff == 'undefined') ff = {};

$(window).ready(function(){ff.validation.init()});

ff.validation = {
	messages: {
		'required'      : 'Поле обязательно для заполнения.',
		'matches'       : 'Значение полей не совпадают.',
		'valid_email'   : 'В поле должен быть введен корректный адрес электронной почты.',
		'valid_url'     : 'ERROR:valid_url',
		'length'        : 'Длина значения поля должна быть от $2 да $3 символов.',
		'min_length'    : 'Длина значения поля должна быть не меньше $2 символов.',
		'max_length'    : 'Длина значения поля не может превышать $1 символов.',
		'alpha'         : 'Поле может содержать только символы алфавита.',
		'alpha_numeric' : 'Поле может содержать только символы алфавита и цифры.',
		'alpha_dash'    : 'Поле может содержать только символы алфавита и цифры, подчеркивания и тире.',
		'integer'       : 'Поле должно содержать целое число.',
		'numeric'       : 'Поле должно содержать только цифры.',
		'callback'      : 'Callback error'
	},
	rules: {},

	init:function()
	{
		$('form').find('input,textarea,select').each(function(i, ob){
			var name = this.getAttribute('name');
			if (name && ff.validation.rules.hasOwnProperty(name))
			{
				$(ob).blur(function(){
					ff.validation.run(this);
				})
			}
		});
		
		$('form').submit(function(){
			$elems = $(this).find('input,textarea,select');
			
			var valid = true;
			
			for (var i=0,elem; elem=$elems[i]; i++)
			{
				var name = elem.getAttribute('name');
				if (name && ff.validation.rules.hasOwnProperty(name))
				{
					if ( ! ff.validation.run(elem)) valid = false;
				}
			}
			
			return valid;
		});
	},
	
	add_rules: function(rules)
	{
		for (var k in rules)
		{
			var rule_list = rules[k].split('|');
			var result = {};
			for (var i=0,rule; rule=rule_list[i]; i++)
			{
				var opt = rule.replace(/\]$/i, '').split('[');
				result[opt[0]] = opt[1] ? opt[1] : false;
			}
			this.rules[k] = result;
		}
	},
	
	run: function(ob)
	{
		var rules  = this.rules[ob.name];
		var $ob = $(ob);
		for (var rule in rules)
		{
			if (this.hasOwnProperty(rule))
			{
				if ( ! this[rule]($ob, rules[rule])) return this.error($ob, rule, rules[rule]);
			}
		}
		
		return this.ok($ob);
	},
	
	ok: function($ob, rule)
	{
		var id = 'ff_validation_msg_' + $ob.attr('name');
		$('#' + id).remove();
		$ob.removeClass('field_error');//.addClass('field_ok').after('<span id="'+id+'" class="field_ok_msg"></span>');;
		return true;
	},
	
	error: function($ob, rule, opt, msg)
	{
		
		var id = 'ff_validation_msg_' + $ob.attr('name');
		$('#' + id).remove();
		
		if ( ! msg)
		{
			msg = this.messages[rule];
			if (opt)
			{
				opt = opt.split(',');
				msg = msg.replace('$2', opt[0]);
				if (opt[1]) msg = msg.replace('$3', opt[1]);
			}
		}
		$ob.removeClass('field_ok').addClass('field_error').after('<span id="'+id+'" class="field_error_msg">'+(msg)+'</span>');
		return false;
	},
	
	required: function($ob)
	{
		return $ob.val().replace(/\s*(.*[^ ])\s*/i, '$1');
	},
	
	trim: function($ob)
	{
		var val = $ob.val();
		val = val.replace(/\s*(.*[^ ])\s*/i, '$1');
		$ob.val(val);
		return 1;
	},
	
	min_length: function($ob, opt)
	{
		if ( ! $ob.val()) return true;
		return $ob.val().length >= parseInt(opt);
	},
	
	max_length: function($ob, opt)
	{
		if ( ! $ob.val()) return true;
		return $ob.val().length <= parseInt(opt);
	},
	length: function($ob, opt)
	{
		if ( ! $ob.val()) return true;
		opt = opt.split(',');
		return this.min_length($ob, opt[0]) && this.max_length($ob, opt[1]);
	},
	valid_email: function($ob, opt)
	{
		return ! $ob.val().replace(/^([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4})$/i, '');
	},
	callback: function($ob, opt)
	{
		$.post('/ajax/js_validation/callback/', {opt:opt, val:$ob.val()}, function(data){
			if (data.error)
			{
				ff.validation.error($ob, 'callback', opt, data.error);
			}
		},
		'json'
		);
		return 1;
	}
	
}