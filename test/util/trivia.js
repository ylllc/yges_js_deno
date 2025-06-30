// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import YgEs from '../../api/common.js';
import Util from '../../api/util.js';

// Trivia ------------------------------- //

const scenaria=[
	{
		Title:'Just NaN',
		Proc:async (tool)=>{
			Test.ChkStrict(true,Util.IsJustNaN(NaN));
			Test.ChkStrict(false,Util.IsJustNaN(null));
			Test.ChkStrict(false,Util.IsJustNaN(undefined));
			Test.ChkStrict(false,Util.IsJustNaN([]));
			Test.ChkStrict(false,Util.IsJustNaN({}));
		},
	},
	{
		Title:'Just Infinity',
		Proc:async (tool)=>{
			Test.ChkStrict(true,Util.IsJustInfinity(Infinity));
			Test.ChkStrict(true,Util.IsJustInfinity(-Infinity));
			Test.ChkStrict(false,Util.IsJustInfinity("Infinity"));
			Test.ChkStrict(false,Util.IsJustInfinity("-Infinity"));
			Test.ChkStrict(false,Util.IsJustInfinity(NaN));
			Test.ChkStrict(false,Util.IsJustInfinity(null));
			Test.ChkStrict(false,Util.IsJustInfinity(undefined));
			Test.ChkStrict(false,Util.IsJustInfinity('A'));
			Test.ChkStrict(false,Util.IsJustInfinity([]));
			Test.ChkStrict(false,Util.IsJustInfinity([0]));
			Test.ChkStrict(false,Util.IsJustInfinity([false]));
			Test.ChkStrict(false,Util.IsJustInfinity({}));
		},
	},
	{
		Title:'Detect Empty',
		Proc:async (tool)=>{
			Test.ChkStrict(true,Util.IsEmpty(null));
			Test.ChkStrict(true,Util.IsEmpty(undefined));
			Test.ChkStrict(true,Util.IsEmpty(''));
			Test.ChkStrict(false,Util.IsEmpty([]));
			Test.ChkStrict(false,Util.IsEmpty({}));
			Test.ChkStrict(false,Util.IsEmpty(0));
			Test.ChkStrict(false,Util.IsEmpty(false));
			Test.ChkStrict(false,Util.IsEmpty(NaN));
		},
	},
	{
		Title:'Validation',
		Proc:async (tool)=>{
			Test.ChkStrict(false,Util.IsValid(null));
			Test.ChkStrict(false,Util.IsValid(undefined));
			Test.ChkStrict(false,Util.IsValid(NaN));
			Test.ChkStrict(true,Util.IsValid(0));
			Test.ChkStrict(true,Util.IsValid(1));
			Test.ChkStrict(true,Util.IsValid(''));
			Test.ChkStrict(true,Util.IsValid('0'));
			Test.ChkStrict(true,Util.IsValid(false));
			Test.ChkStrict(true,Util.IsValid(true));
			Test.ChkStrict(true,Util.IsValid([]));
			Test.ChkStrict(true,Util.IsValid({}));
			Test.ChkStrict(true,Util.IsValid('null'));
			Test.ChkStrict(true,Util.IsValid('undefined'));
			Test.ChkStrict(true,Util.IsValid('NaN'));
		},
	},
	{
		Title:'Booleanize',
		Proc:async (tool)=>{
			Test.ChkStrict(true,YgEs.Booleanize(1));
			Test.ChkStrict(true,YgEs.Booleanize('A'));
			Test.ChkStrict(true,YgEs.Booleanize('true'));
			Test.ChkStrict(true,YgEs.Booleanize([]));
			Test.ChkStrict(true,YgEs.Booleanize({}));
			Test.ChkStrict(true,YgEs.Booleanize(NaN));
			Test.ChkStrict(true,YgEs.Booleanize('NaN'));
			Test.ChkStrict(true,YgEs.Booleanize('.'));
			Test.ChkStrict(false,YgEs.Booleanize(0));
			Test.ChkStrict(false,YgEs.Booleanize(''));
			Test.ChkStrict(false,YgEs.Booleanize(false));
			Test.ChkStrict(false,YgEs.Booleanize(null));
			Test.ChkStrict(false,YgEs.Booleanize(undefined));
			Test.ChkStrict(true,YgEs.Booleanize('0'));
			Test.ChkStrict(true,YgEs.Booleanize('000.'));
			Test.ChkStrict(true,YgEs.Booleanize('0.00'));
			Test.ChkStrict(true,YgEs.Booleanize('.0000'));
			Test.ChkStrict(true,YgEs.Booleanize('00.000000'));
			Test.ChkStrict(true,YgEs.Booleanize('false'));
			Test.ChkStrict(true,YgEs.Booleanize('FALSE'));
			Test.ChkStrict(true,YgEs.Booleanize('FaLsE'));
			Test.ChkStrict(true,YgEs.Booleanize('null'));
			Test.ChkStrict(true,YgEs.Booleanize('NULL'));
			Test.ChkStrict(true,YgEs.Booleanize('nULl'));
			Test.ChkStrict(true,YgEs.Booleanize('undefined'));
			Test.ChkStrict(true,YgEs.Booleanize('UNDEFINED'));
			Test.ChkStrict(true,YgEs.Booleanize('UnDefined'));
		},
	},
	{
		Title:'Unstringed Booleanize',
		Proc:async (tool)=>{
			Test.ChkStrict(false,YgEs.Booleanize('0',true));
			Test.ChkStrict(false,YgEs.Booleanize('000.',true));
			Test.ChkStrict(false,YgEs.Booleanize('0.00',true));
			Test.ChkStrict(false,YgEs.Booleanize('.0000',true));
			Test.ChkStrict(false,YgEs.Booleanize('00.000000',true));
			Test.ChkStrict(false,YgEs.Booleanize('false',true));
			Test.ChkStrict(false,YgEs.Booleanize('FALSE',true));
			Test.ChkStrict(false,YgEs.Booleanize('FaLsE',true));
			Test.ChkStrict(false,YgEs.Booleanize('null',true));
			Test.ChkStrict(false,YgEs.Booleanize('NULL',true));
			Test.ChkStrict(false,YgEs.Booleanize('nULl',true));
			Test.ChkStrict(false,YgEs.Booleanize('undefined',true));
			Test.ChkStrict(false,YgEs.Booleanize('UNDEFINED',true));
			Test.ChkStrict(false,YgEs.Booleanize('UnDefined',true));
		},
	},
	{
		Title:'Trinarize',
		Proc:async (tool)=>{
			Test.ChkStrict(true,YgEs.Trinarize(1));
			Test.ChkStrict(true,YgEs.Trinarize('A'));
			Test.ChkStrict(true,YgEs.Trinarize('true'));
			Test.ChkStrict(true,YgEs.Trinarize([]));
			Test.ChkStrict(true,YgEs.Trinarize({}));
			Test.ChkStrict(true,YgEs.Trinarize(NaN));
			Test.ChkStrict(true,YgEs.Trinarize('NaN'));
			Test.ChkStrict(true,YgEs.Trinarize('.'));
			Test.ChkStrict(false,YgEs.Trinarize(0));
			Test.ChkStrict(false,YgEs.Trinarize(''));
			Test.ChkStrict(false,YgEs.Trinarize(false));
			Test.ChkStrict(null,YgEs.Trinarize(null));
			Test.ChkStrict(null,YgEs.Trinarize(undefined));
			Test.ChkStrict(true,YgEs.Trinarize('0'));
			Test.ChkStrict(true,YgEs.Trinarize('000.'));
			Test.ChkStrict(true,YgEs.Trinarize('0.00'));
			Test.ChkStrict(true,YgEs.Trinarize('.0000'));
			Test.ChkStrict(true,YgEs.Trinarize('00.000000'));
			Test.ChkStrict(true,YgEs.Trinarize('false'));
			Test.ChkStrict(true,YgEs.Trinarize('FALSE'));
			Test.ChkStrict(true,YgEs.Trinarize('FaLsE'));
			Test.ChkStrict(true,YgEs.Trinarize('null'));
			Test.ChkStrict(true,YgEs.Trinarize('NULL'));
			Test.ChkStrict(true,YgEs.Trinarize('nULl'));
			Test.ChkStrict(true,YgEs.Trinarize('undefined'));
			Test.ChkStrict(true,YgEs.Trinarize('UNDEFINED'));
			Test.ChkStrict(true,YgEs.Trinarize('UnDefined'));
		},
	},
	{
		Title:'Unstringed Trinarize',
		Proc:async (tool)=>{
			Test.ChkStrict(false,YgEs.Trinarize('0',true));
			Test.ChkStrict(false,YgEs.Trinarize('000.',true));
			Test.ChkStrict(false,YgEs.Trinarize('0.00',true));
			Test.ChkStrict(false,YgEs.Trinarize('.0000',true));
			Test.ChkStrict(false,YgEs.Trinarize('00.000000',true));
			Test.ChkStrict(false,YgEs.Trinarize('false',true));
			Test.ChkStrict(false,YgEs.Trinarize('FALSE',true));
			Test.ChkStrict(false,YgEs.Trinarize('FaLsE',true));
			Test.ChkStrict(null,YgEs.Trinarize('null',true));
			Test.ChkStrict(null,YgEs.Trinarize('NULL',true));
			Test.ChkStrict(null,YgEs.Trinarize('nULl',true));
			Test.ChkStrict(null,YgEs.Trinarize('undefined',true));
			Test.ChkStrict(null,YgEs.Trinarize('UNDEFINED',true));
			Test.ChkStrict(null,YgEs.Trinarize('UnDefined',true));
		},
	},
	{
		Title:'Zero Filling',
		Proc:async (tool)=>{
			Test.ChkStrict(Util.FillZero(0,8),'00000000');
			Test.ChkStrict(Util.FillZero(123.4,8),'000123.4');
			Test.ChkStrict(Util.FillZero(-123.4,8),'-00123.4');
			Test.ChkStrict(Util.FillZero(0,8,true),'+0000000');
			Test.ChkStrict(Util.FillZero(123.4,8,true),'+00123.4');
			Test.ChkStrict(Util.FillZero(-123.4,8,true),'-00123.4');
		},
	},
	{
		Title:'Just String',
		Proc:async (tool)=>{
			Test.ChkStrict(YgEs.JustString(0),'0');
			Test.ChkStrict(YgEs.JustString('0'),'0');
			Test.ChkStrict(YgEs.JustString(false),'false');
			Test.ChkStrict(YgEs.JustString(true),'true');
			Test.ChkStrict(YgEs.JustString(null),'null');
			Test.ChkStrict(YgEs.JustString(undefined),'undefined');
			Test.ChkStrict(YgEs.JustString([undefined]),'[undefined]');
			Test.ChkStrict(YgEs.JustString(Infinity),'Infinity');
			Test.ChkStrict(YgEs.JustString(-Infinity),'-Infinity');
			Test.ChkStrict(YgEs.JustString(NaN),'NaN');
			Test.ChkStrict(YgEs.JustString({a:-1,b:"xyz"}),'{"a":-1,"b":xyz}');
		},
	},
	{
		Title:'Inspectable String',
		Proc:async (tool)=>{
			Test.ChkStrict(YgEs.Inspect(0),'0');
			Test.ChkStrict(YgEs.Inspect('0'),'"0"');
			Test.ChkStrict(YgEs.Inspect(false),'false');
			Test.ChkStrict(YgEs.Inspect(true),'true');
			Test.ChkStrict(YgEs.Inspect(null),'null');
			Test.ChkStrict(YgEs.Inspect(undefined),'undefined');
			Test.ChkStrict(YgEs.Inspect([undefined]),'[undefined]');
			Test.ChkStrict(YgEs.Inspect(Infinity),'Infinity');
			Test.ChkStrict(YgEs.Inspect(-Infinity),'-Infinity');
			Test.ChkStrict(YgEs.Inspect(NaN),'NaN');
			Test.ChkStrict(YgEs.Inspect({a:-1,b:"xyz"}),'{"a":-1,"b":"xyz"}');
		},
	},
]

Test.Run(scenaria);
