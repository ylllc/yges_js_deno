// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Iterator Test //

import test from '../../api/unittest.js';
import util from '../../api/util.js';

var scenaria=[
	{
		title:'Just NaN',
		proc:async ()=>{
			test.chk_strict(true,util.isJustNaN(NaN));
			test.chk_strict(false,util.isJustNaN(null));
			test.chk_strict(false,util.isJustNaN(undefined));
			test.chk_strict(false,util.isJustNaN([]));
			test.chk_strict(false,util.isJustNaN({}));
		},
		title:'Just Infinity',
		proc:async ()=>{
			test.chk_strict(true,util.isJustInfinity(Infinity));
			test.chk_strict(true,util.isJustInfinity(-Infinity));
			test.chk_strict(false,util.isJustInfinity("Infinity"));
			test.chk_strict(false,util.isJustInfinity("-Infinity"));
			test.chk_strict(false,util.isJustInfinity(NaN));
			test.chk_strict(false,util.isJustInfinity(null));
			test.chk_strict(false,util.isJustInfinity(undefined));
			test.chk_strict(false,util.isJustInfinity('A'));
			test.chk_strict(false,util.isJustInfinity([]));
			test.chk_strict(false,util.isJustInfinity([0]));
			test.chk_strict(false,util.isJustInfinity([false]));
			test.chk_strict(false,util.isJustInfinity({}));
		},
		title:'Detect Empty',
		proc:async ()=>{
			test.chk_strict(true,util.isEmpty(null));
			test.chk_strict(true,util.isEmpty(undefined));
			test.chk_strict(true,util.isEmpty(''));
			test.chk_strict(false,util.isEmpty([]));
			test.chk_strict(false,util.isEmpty({}));
			test.chk_strict(false,util.isEmpty(0));
			test.chk_strict(false,util.isEmpty(false));
			test.chk_strict(false,util.isEmpty(NaN));
		},
		title:'Validation',
		proc:async ()=>{
			test.chk_strict(false,util.isValid(null));
			test.chk_strict(false,util.isValid(undefined));
			test.chk_strict(false,util.isValid(NaN));
			test.chk_strict(true,util.isValid(0));
			test.chk_strict(true,util.isValid(1));
			test.chk_strict(true,util.isValid(''));
			test.chk_strict(true,util.isValid('0'));
			test.chk_strict(true,util.isValid(false));
			test.chk_strict(true,util.isValid(true));
			test.chk_strict(true,util.isValid([]));
			test.chk_strict(true,util.isValid({}));
			test.chk_strict(true,util.isValid('null'));
			test.chk_strict(true,util.isValid('undefined'));
			test.chk_strict(true,util.isValid('NaN'));
		},
		title:'Booleanize',
		proc:async ()=>{
			test.chk_strict(true,util.booleanize(1));
			test.chk_strict(true,util.booleanize('A'));
			test.chk_strict(true,util.booleanize('true'));
			test.chk_strict(true,util.booleanize([]));
			test.chk_strict(true,util.booleanize({}));
			test.chk_strict(true,util.booleanize(NaN));
			test.chk_strict(true,util.booleanize('NaN'));
			test.chk_strict(true,util.booleanize('.'));
			test.chk_strict(false,util.booleanize(0));
			test.chk_strict(false,util.booleanize('0'));
			test.chk_strict(false,util.booleanize('000.'));
			test.chk_strict(false,util.booleanize('0.00'));
			test.chk_strict(false,util.booleanize('.0000'));
			test.chk_strict(false,util.booleanize('00.000000'));
			test.chk_strict(false,util.booleanize(''));
			test.chk_strict(false,util.booleanize(false));
			test.chk_strict(false,util.booleanize('false'));
			test.chk_strict(false,util.booleanize('FALSE'));
			test.chk_strict(false,util.booleanize('FaLsE'));
			test.chk_strict(false,util.booleanize(null));
			test.chk_strict(false,util.booleanize('null'));
			test.chk_strict(false,util.booleanize('NULL'));
			test.chk_strict(false,util.booleanize('nULl'));
			test.chk_strict(false,util.booleanize(undefined));
			test.chk_strict(false,util.booleanize('undefined'));
			test.chk_strict(false,util.booleanize('UNDEFINED'));
			test.chk_strict(false,util.booleanize('UnDefined'));
		},
		title:'Trinarize',
		proc:async ()=>{
			test.chk_strict(true,util.trinarize(1));
			test.chk_strict(true,util.trinarize('A'));
			test.chk_strict(true,util.trinarize('true'));
			test.chk_strict(true,util.trinarize([]));
			test.chk_strict(true,util.trinarize({}));
			test.chk_strict(true,util.trinarize(NaN));
			test.chk_strict(true,util.trinarize('NaN'));
			test.chk_strict(true,util.trinarize('.'));
			test.chk_strict(false,util.trinarize(0));
			test.chk_strict(false,util.trinarize('0'));
			test.chk_strict(false,util.trinarize('000.'));
			test.chk_strict(false,util.trinarize('0.00'));
			test.chk_strict(false,util.trinarize('.0000'));
			test.chk_strict(false,util.trinarize('00.000000'));
			test.chk_strict(false,util.trinarize(''));
			test.chk_strict(false,util.trinarize(false));
			test.chk_strict(false,util.trinarize('false'));
			test.chk_strict(false,util.trinarize('FALSE'));
			test.chk_strict(false,util.trinarize('FaLsE'));
			test.chk_strict(null,util.trinarize(null));
			test.chk_strict(null,util.trinarize('null'));
			test.chk_strict(null,util.trinarize('NULL'));
			test.chk_strict(null,util.trinarize('nULl'));
			test.chk_strict(null,util.trinarize(undefined));
			test.chk_strict(null,util.trinarize('undefined'));
			test.chk_strict(null,util.trinarize('UNDEFINED'));
			test.chk_strict(null,util.trinarize('UnDefined'));
		},
		title:'Zero Filling',
		proc:async ()=>{
			test.chk_strict(util.zerofill(0,8),'00000000');
			test.chk_strict(util.zerofill(123.4,8),'000123.4');
			test.chk_strict(util.zerofill(-123.4,8),'-00123.4');
			test.chk_strict(util.zerofill(0,8,true),'+0000000');
			test.chk_strict(util.zerofill(123.4,8,true),'+00123.4');
			test.chk_strict(util.zerofill(-123.4,8,true),'-00123.4');
		},
		title:'Just String',
		proc:async ()=>{
			test.chk_strict(util.justString(0),'0');
			test.chk_strict(util.justString('0'),'0');
			test.chk_strict(util.justString(false),'false');
			test.chk_strict(util.justString(true),'true');
			test.chk_strict(util.justString(null),'null');
			test.chk_strict(util.justString(undefined),'undefined');
			test.chk_strict(util.justString([undefined]),'[undefined]');
			test.chk_strict(util.justString(Infinity),'Infinity');
			test.chk_strict(util.justString(-Infinity),'-Infinity');
			test.chk_strict(util.justString(NaN),'NaN');
			test.chk_strict(util.justString({a:-1,b:"xyz"}),'{"a":-1,"b":xyz}');
		},
		title:'Inspectable String',
		proc:async ()=>{
			test.chk_strict(util.inspect(0),'0');
			test.chk_strict(util.inspect('0'),'"0"');
			test.chk_strict(util.inspect(false),'false');
			test.chk_strict(util.inspect(true),'true');
			test.chk_strict(util.inspect(null),'null');
			test.chk_strict(util.inspect(undefined),'undefined');
			test.chk_strict(util.inspect([undefined]),'[undefined]');
			test.chk_strict(util.inspect(Infinity),'Infinity');
			test.chk_strict(util.inspect(-Infinity),'-Infinity');
			test.chk_strict(util.inspect(NaN),'NaN');
			test.chk_strict(util.inspect({a:-1,b:"xyz"}),'{"a":-1,"b":"xyz"}');
		},
	},
]

test.run(scenaria);
