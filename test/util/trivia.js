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
			Test.ChkStrict(true,Util.Booleanize(1));
			Test.ChkStrict(true,Util.Booleanize('A'));
			Test.ChkStrict(true,Util.Booleanize('true'));
			Test.ChkStrict(true,Util.Booleanize([]));
			Test.ChkStrict(true,Util.Booleanize({}));
			Test.ChkStrict(true,Util.Booleanize(NaN));
			Test.ChkStrict(true,Util.Booleanize('NaN'));
			Test.ChkStrict(true,Util.Booleanize('.'));
			Test.ChkStrict(false,Util.Booleanize(0));
			Test.ChkStrict(false,Util.Booleanize(''));
			Test.ChkStrict(false,Util.Booleanize(false));
			Test.ChkStrict(false,Util.Booleanize(null));
			Test.ChkStrict(false,Util.Booleanize(undefined));
			Test.ChkStrict(true,Util.Booleanize('0'));
			Test.ChkStrict(true,Util.Booleanize('000.'));
			Test.ChkStrict(true,Util.Booleanize('0.00'));
			Test.ChkStrict(true,Util.Booleanize('.0000'));
			Test.ChkStrict(true,Util.Booleanize('00.000000'));
			Test.ChkStrict(true,Util.Booleanize('false'));
			Test.ChkStrict(true,Util.Booleanize('FALSE'));
			Test.ChkStrict(true,Util.Booleanize('FaLsE'));
			Test.ChkStrict(true,Util.Booleanize('null'));
			Test.ChkStrict(true,Util.Booleanize('NULL'));
			Test.ChkStrict(true,Util.Booleanize('nULl'));
			Test.ChkStrict(true,Util.Booleanize('undefined'));
			Test.ChkStrict(true,Util.Booleanize('UNDEFINED'));
			Test.ChkStrict(true,Util.Booleanize('UnDefined'));
		},
	},
	{
		Title:'Unstringed Booleanize',
		Proc:async (tool)=>{
			Test.ChkStrict(false,Util.Booleanize('0',true));
			Test.ChkStrict(false,Util.Booleanize('000.',true));
			Test.ChkStrict(false,Util.Booleanize('0.00',true));
			Test.ChkStrict(false,Util.Booleanize('.0000',true));
			Test.ChkStrict(false,Util.Booleanize('00.000000',true));
			Test.ChkStrict(false,Util.Booleanize('false',true));
			Test.ChkStrict(false,Util.Booleanize('FALSE',true));
			Test.ChkStrict(false,Util.Booleanize('FaLsE',true));
			Test.ChkStrict(false,Util.Booleanize('null',true));
			Test.ChkStrict(false,Util.Booleanize('NULL',true));
			Test.ChkStrict(false,Util.Booleanize('nULl',true));
			Test.ChkStrict(false,Util.Booleanize('undefined',true));
			Test.ChkStrict(false,Util.Booleanize('UNDEFINED',true));
			Test.ChkStrict(false,Util.Booleanize('UnDefined',true));
		},
	},
	{
		Title:'Trinarize',
		Proc:async (tool)=>{
			Test.ChkStrict(true,Util.Trinarize(1));
			Test.ChkStrict(true,Util.Trinarize('A'));
			Test.ChkStrict(true,Util.Trinarize('true'));
			Test.ChkStrict(true,Util.Trinarize([]));
			Test.ChkStrict(true,Util.Trinarize({}));
			Test.ChkStrict(true,Util.Trinarize(NaN));
			Test.ChkStrict(true,Util.Trinarize('NaN'));
			Test.ChkStrict(true,Util.Trinarize('.'));
			Test.ChkStrict(false,Util.Trinarize(0));
			Test.ChkStrict(false,Util.Trinarize(''));
			Test.ChkStrict(false,Util.Trinarize(false));
			Test.ChkStrict(null,Util.Trinarize(null));
			Test.ChkStrict(null,Util.Trinarize(undefined));
			Test.ChkStrict(true,Util.Trinarize('0'));
			Test.ChkStrict(true,Util.Trinarize('000.'));
			Test.ChkStrict(true,Util.Trinarize('0.00'));
			Test.ChkStrict(true,Util.Trinarize('.0000'));
			Test.ChkStrict(true,Util.Trinarize('00.000000'));
			Test.ChkStrict(true,Util.Trinarize('false'));
			Test.ChkStrict(true,Util.Trinarize('FALSE'));
			Test.ChkStrict(true,Util.Trinarize('FaLsE'));
			Test.ChkStrict(true,Util.Trinarize('null'));
			Test.ChkStrict(true,Util.Trinarize('NULL'));
			Test.ChkStrict(true,Util.Trinarize('nULl'));
			Test.ChkStrict(true,Util.Trinarize('undefined'));
			Test.ChkStrict(true,Util.Trinarize('UNDEFINED'));
			Test.ChkStrict(true,Util.Trinarize('UnDefined'));
		},
	},
	{
		Title:'Unstringed Trinarize',
		Proc:async (tool)=>{
			Test.ChkStrict(false,Util.Trinarize('0',true));
			Test.ChkStrict(false,Util.Trinarize('000.',true));
			Test.ChkStrict(false,Util.Trinarize('0.00',true));
			Test.ChkStrict(false,Util.Trinarize('.0000',true));
			Test.ChkStrict(false,Util.Trinarize('00.000000',true));
			Test.ChkStrict(false,Util.Trinarize('false',true));
			Test.ChkStrict(false,Util.Trinarize('FALSE',true));
			Test.ChkStrict(false,Util.Trinarize('FaLsE',true));
			Test.ChkStrict(null,Util.Trinarize('null',true));
			Test.ChkStrict(null,Util.Trinarize('NULL',true));
			Test.ChkStrict(null,Util.Trinarize('nULl',true));
			Test.ChkStrict(null,Util.Trinarize('undefined',true));
			Test.ChkStrict(null,Util.Trinarize('UNDEFINED',true));
			Test.ChkStrict(null,Util.Trinarize('UnDefined',true));
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
