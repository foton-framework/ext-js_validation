<?php


class EXT_JS_Validation
{
	//--------------------------------------------------------------------------

	public $valid_callbacks = array();

	//--------------------------------------------------------------------------

	public function __construct()
	{
		if ( ! empty(sys::$lib->template))
		{
			sys::$lib->template->add_head_content('<script type="text/javascript" src="/extensions/js_validation/js_validation.js"></script>');
		}

		sys::set_config_items(&$this, 'js_validation');
	}

	//--------------------------------------------------------------------------

	public function init_form(&$form)
	{
		$form_config = array();
		foreach ($form->fields as $fields)
		{
			foreach ($fields as $field => $opt)
			{
				if ( ! empty($opt['rules']) || ! empty($opt['required']))
				{
					$form_config[$field] = (!empty($opt['required']) ? 'required|' : '') . @$opt['rules'];
				}

			}
		}

		sys::$lib->template->add_head_content('<script type="text/javascript">ff.validation.add_rules(' . json_encode($form_config) . ')</script>');
	}

	//--------------------------------------------------------------------------

	public function ajax($rule)
	{
		$result = array('error'=>false);

		switch ($rule)
		{
			case 'callback':

				if (empty($_POST['opt']) || empty($_POST['val'])) break;

				$opt = $_POST['opt'];
				$val = $_POST['val'];

				if (! isset($this->valid_callbacks[$opt])) break;

				$fn   = $this->valid_callbacks[$opt][0];
				$name = $this->valid_callbacks[$opt][1];

				sys::$lib->load->$fn($name);
				sys::$lib->load->library('form');

				if ( ! sys::$lib->form->r_callback($val, (array)$opt))
				{
					$result['error'] = sys::$lib->form->error_messages["callback[{$opt}]"];
				}

				break;
		}

		return json_encode($result);
	}

}