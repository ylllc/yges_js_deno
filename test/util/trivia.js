// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import Test from '../../api/unittest.js';
import Util from '../../api/util.js';

// Trivia ------------------------------- //

const scenaria=[
	{
		title:'Just NaN',
		proc:async (tool)=>{
			Test.chk_strict(true,Util.isJustNaN(NaN));
			Test.chk_strict(false,Util.isJustNaN(null));
			Test.chk_strict(false,Util.isJustNaN(undefined));
			Test.chk_strict(false,Util.isJustNaN([]));
			Test.chk_strict(false,Util.isJustNaN({}));
		},
	},
	{
		title:'Just Infinity',
		proc:async (tool)=>{
			Test.chk_strict(true,Util.isJustInfinity(Infinity));
			Test.chk_strict(true,Util.isJustInfinity(-Infinity));
			Test.chk_strict(false,Util.isJustInfinity("Infinity"));
			Test.chk_strict(false,Util.isJustInfinity("-Infinity"));
			Test.chk_strict(false,Util.isJustInfinity(NaN));
			Test.chk_strict(false,Util.isJustInfinity(null));
			Test.chk_strict(false,Util.isJustInfinity(undefined));
			Test.chk_strict(false,Util.isJustInfinity('A'));
			Test.chk_strict(false,Util.isJustInfinity([]));
			Test.chk_strict(false,Util.isJustInfinity([0]));
			Test.chk_strict(false,Util.isJustInfinity([false]));
			Test.chk_strict(false,Util.isJustInfinity({}));
		},
	},
	{
		title:'Detect Empty',
		proc:async (tool)=>{
			Test.chk_strict(true,Util.isEmpty(null));
			Test.chk_strict(true,Util.isEmpty(undefined));
			Test.chk_strict(true,Util.isEmpty(''));
			Test.chk_strict(false,Util.isEmpty([]));
			Test.chk_strict(false,Util.isEmpty({}));
			Test.chk_strict(false,Util.isEmpty(0));
			Test.chk_strict(false,Util.isEmpty(false));
			Test.chk_strict(false,Util.isEmpty(NaN));
		},
	},
	{
		title:'Validation',
		proc:async (tool)=>{
			Test.chk_strict(false,Util.isValid(null));
			Test.chk_strict(false,Util.isValid(undefined));
			Test.chk_strict(false,Util.isValid(NaN));
			Test.chk_strict(true,Util.isValid(0));
			Test.chk_strict(true,Util.isValid(1));
			Test.chk_strict(true,Util.isValid(''));
			Test.chk_strict(true,Util.isValid('0'));
			Test.chk_strict(true,Util.isValid(false));
			Test.chk_strict(true,Util.isValid(true));
			Test.chk_strict(true,Util.isValid([]));
			Test.chk_strict(true,Util.isValid({}));
			Test.chk_strict(true,Util.isValid('null'));
			Test.chk_strict(true,Util.isValid('undefined'));
			Test.chk_strict(true,Util.isValid('NaN'));
		},
	},
	{
		title:'Booleanize',
		proc:async (tool)=>{
			Test.chk_strict(true,Util.booleanize(1));
			Test.chk_strict(true,Util.booleanize('A'));
			Test.chk_strict(true,Util.booleanize('true'));
			Test.chk_strict(true,Util.booleanize([]));
			Test.chk_strict(true,Util.booleanize({}));
			Test.chk_strict(true,Util.booleanize(NaN));
			Test.chk_strict(true,Util.booleanize('NaN'));
			Test.chk_strict(true,Util.booleanize('.'));
			Test.chk_strict(false,Util.booleanize(0));
			Test.chk_strict(false,Util.booleanize(''));
			Test.chk_strict(false,Util.booleanize(false));
			Test.chk_strict(false,Util.booleanize(null));
			Test.chk_strict(false,Util.booleanize(undefined));
			Test.chk_strict(true,Util.booleanize('0'));
			Test.chk_strict(true,Util.booleanize('000.'));
			Test.chk_strict(true,Util.booleanize('0.00'));
			Test.chk_strict(true,Util.booleanize('.0000'));
			Test.chk_strict(true,Util.booleanize('00.000000'));
			Test.chk_strict(true,Util.booleanize('false'));
			Test.chk_strict(true,Util.booleanize('FALSE'));
			Test.chk_strict(true,Util.booleanize('FaLsE'));
			Test.chk_strict(true,Util.booleanize('null'));
			Test.chk_strict(true,Util.booleanize('NULL'));
			Test.chk_strict(true,Util.booleanize('nULl'));
			Test.chk_strict(true,Util.booleanize('undefined'));
			Test.chk_strict(true,Util.booleanize('UNDEFINED'));
			Test.chk_strict(true,Util.booleanize('UnDefined'));
		},
	},
	{
		title:'Unstringed Booleanize',
		proc:async (tool)=>{
			Test.chk_strict(false,Util.booleanize('0',true));
			Test.chk_strict(false,Util.booleanize('000.',true));
			Test.chk_strict(false,Util.booleanize('0.00',true));
			Test.chk_strict(false,Util.booleanize('.0000',true));
			Test.chk_strict(false,Util.booleanize('00.000000',true));
			Test.chk_strict(false,Util.booleanize('false',true));
			Test.chk_strict(false,Util.booleanize('FALSE',true));
			Test.chk_strict(false,Util.booleanize('FaLsE',true));
			Test.chk_strict(false,Util.booleanize('null',true));
			Test.chk_strict(false,Util.booleanize('NULL',true));
			Test.chk_strict(false,Util.booleanize('nULl',true));
			Test.chk_strict(false,Util.booleanize('undefined',true));
			Test.chk_strict(false,Util.booleanize('UNDEFINED',true));
			Test.chk_strict(false,Util.booleanize('UnDefined',true));
		},
	},
	{
		title:'Trinarize',
		proc:async (tool)=>{
			Test.chk_strict(true,Util.trinarize(1));
			Test.chk_strict(true,Util.trinarize('A'));
			Test.chk_strict(true,Util.trinarize('true'));
			Test.chk_strict(true,Util.trinarize([]));
			Test.chk_strict(true,Util.trinarize({}));
			Test.chk_strict(true,Util.trinarize(NaN));
			Test.chk_strict(true,Util.trinarize('NaN'));
			Test.chk_strict(true,Util.trinarize('.'));
			Test.chk_strict(false,Util.trinarize(0));
			Test.chk_strict(false,Util.trinarize(''));
			Test.chk_strict(false,Util.trinarize(false));
			Test.chk_strict(null,Util.trinarize(null));
			Test.chk_strict(null,Util.trinarize(undefined));
			Test.chk_strict(true,Util.trinarize('0'));
			Test.chk_strict(true,Util.trinarize('000.'));
			Test.chk_strict(true,Util.trinarize('0.00'));
			Test.chk_strict(true,Util.trinarize('.0000'));
			Test.chk_strict(true,Util.trinarize('00.000000'));
			Test.chk_strict(true,Util.trinarize('false'));
			Test.chk_strict(true,Util.trinarize('FALSE'));
			Test.chk_strict(true,Util.trinarize('FaLsE'));
			Test.chk_strict(true,Util.trinarize('null'));
			Test.chk_strict(true,Util.trinarize('NULL'));
			Test.chk_strict(true,Util.trinarize('nULl'));
			Test.chk_strict(true,Util.trinarize('undefined'));
			Test.chk_strict(true,Util.trinarize('UNDEFINED'));
			Test.chk_strict(true,Util.trinarize('UnDefined'));
		},
	},
	{
		title:'Unstringed Trinarize',
		proc:async (tool)=>{
			Test.chk_strict(false,Util.trinarize('0',true));
			Test.chk_strict(false,Util.trinarize('000.',true));
			Test.chk_strict(false,Util.trinarize('0.00',true));
			Test.chk_strict(false,Util.trinarize('.0000',true));
			Test.chk_strict(false,Util.trinarize('00.000000',true));
			Test.chk_strict(false,Util.trinarize('false',true));
			Test.chk_strict(false,Util.trinarize('FALSE',true));
			Test.chk_strict(false,Util.trinarize('FaLsE',true));
			Test.chk_strict(null,Util.trinarize('null',true));
			Test.chk_strict(null,Util.trinarize('NULL',true));
			Test.chk_strict(null,Util.trinarize('nULl',true));
			Test.chk_strict(null,Util.trinarize('undefined',true));
			Test.chk_strict(null,Util.trinarize('UNDEFINED',true));
			Test.chk_strict(null,Util.trinarize('UnDefined',true));
		},
	},
	{
		title:'Zero Filling',
		proc:async (tool)=>{
			Test.chk_strict(Util.zerofill(0,8),'00000000');
			Test.chk_strict(Util.zerofill(123.4,8),'000123.4');
			Test.chk_strict(Util.zerofill(-123.4,8),'-00123.4');
			Test.chk_strict(Util.zerofill(0,8,true),'+0000000');
			Test.chk_strict(Util.zerofill(123.4,8,true),'+00123.4');
			Test.chk_strict(Util.zerofill(-123.4,8,true),'-00123.4');
		},
	},
	{
		title:'Just String',
		proc:async (tool)=>{
			Test.chk_strict(Util.justString(0),'0');
			Test.chk_strict(Util.justString('0'),'0');
			Test.chk_strict(Util.justString(false),'false');
			Test.chk_strict(Util.justString(true),'true');
			Test.chk_strict(Util.justString(null),'null');
			Test.chk_strict(Util.justString(undefined),'undefined');
			Test.chk_strict(Util.justString([undefined]),'[undefined]');
			Test.chk_strict(Util.justString(Infinity),'Infinity');
			Test.chk_strict(Util.justString(-Infinity),'-Infinity');
			Test.chk_strict(Util.justString(NaN),'NaN');
			Test.chk_strict(Util.justString({a:-1,b:"xyz"}),'{"a":-1,"b":xyz}');
		},
	},
	{
		title:'Inspectable String',
		proc:async (tool)=>{
			Test.chk_strict(Util.inspect(0),'0');
			Test.chk_strict(Util.inspect('0'),'"0"');
			Test.chk_strict(Util.inspect(false),'false');
			Test.chk_strict(Util.inspect(true),'true');
			Test.chk_strict(Util.inspect(null),'null');
			Test.chk_strict(Util.inspect(undefined),'undefined');
			Test.chk_strict(Util.inspect([undefined]),'[undefined]');
			Test.chk_strict(Util.inspect(Infinity),'Infinity');
			Test.chk_strict(Util.inspect(-Infinity),'-Infinity');
			Test.chk_strict(Util.inspect(NaN),'NaN');
			Test.chk_strict(Util.inspect({a:-1,b:"xyz"}),'{"a":-1,"b":"xyz"}');
		},
	},
]

Test.run(scenaria);
