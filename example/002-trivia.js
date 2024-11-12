// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Examples: Value Trivia //

import log from '../api/logger.js';
import util from '../api/util.js';

function test(func,data){

	for(var f in func){
		log.info('-=-=-=-=-=-=-=-=- '+f+' -=-=-=-=-=-=-=-=-');
		for(var d in data){
			try{log.info(d+' => '+func[f](data[d]));}
			catch(e){log.fatal(e.message);}
		}
	}
}

test({
	'==NaN':(val)=>(val==NaN)?'true':'false',
	'===NaN':(val)=>(val===NaN)?'true':'false',
	'isNaN':(val)=>isNaN(val)?'true':'false',
	'isJustNaN':(val)=>util.isJustNaN(val)?'true':'false',
},{
	'NaN':NaN,
	'undefined':undefined,
	'"A"':"A",
	'{}':{},
	'[]':[],
	'[0]':[0],
	'false':false,
	'[false]':[false],
});

test({
	'==Infinity':(val)=>(val==Infinity)?'true':'false',
	'===Infinity':(val)=>(val===Infinity)?'true':'false',
	'!isFinite':(val)=>!isFinite(val)?'true':'false',
	'isJustInfinity':(val)=>util.isJustInfinity(val)?'true':'false',
},{
	'Infinity':Infinity,
	'-Infinity':-Infinity,
	'"Infinity"':"Infinity",
	'NaN':NaN,
	'undefined':undefined,
	'false':false,
	'[false]':[false],
});

test({
	'!':(val)=>!val?'true':'false',
	'==null':(val)=>(val==null)?'true':'false',
	'===null':(val)=>(val===null)?'true':'false',
	'==undefined':(val)=>(val==undefined)?'true':'false',
	'===undefined':(val)=>(val===undefined)?'true':'false',
	'isEmpty':(val)=>util.isEmpty(val)?'true':'false',
},{
	'""':"",
	'0':0,
	'false':false,
	'null':null,
	'undefined':undefined,
	'[]':[],
	'{}':{},
	'NaN':NaN,
});

test({
	'!!':(val)=>!!val?'true':'false',
	'isValid':(val)=>util.isValid(val)?'true':'false',
	'booleanize':(val)=>util.booleanize(val),
	'stringable booleanize':(val)=>util.booleanize(val,true),
	'trinarize':(val)=>util.trinarize(val),
	'stringable trinarize':(val)=>util.trinarize(val,true),
},{
	'""':"",
	'0':0,
	'1':1,
	'".00"':".00",
	'false':false,
	'"false"':"false",
	'"FaLsE"':"FaLsE",
	'null':null,
	'"null"':"null",
	'undefined':undefined,
	'"undefined"':"undefined",
	'[]':[],
	'{}':{},
	'NaN':NaN,
	'"NaN"':"NaN",
});

test({
	'padStart':(val)=>(''+val).padStart(8,'0'),
	'zerofill':(val)=>util.zerofill(val,8),
	'zerofill+':(val)=>util.zerofill(val,8,true),
},{
	'0':0,
	'123.4':123.4,
	'-12.3':-12.3,
	'1234.5678':1234.5678,
});

test({
	'toString':(val)=>val.toString(),
	'justString':(val)=>util.justString(val),
	'JSON':(val)=>JSON.stringify(val),
	'inspect':(val)=>util.inspect(val),
},
{
	'false':false,
	'true':true,
	'null':null,
	'undefined':undefined,
	'-Infinity':-Infinity,
	'NaN':NaN,
	'0':0,
	'"0"':"0",
	'[]':[],
	'[null]':[null],
	'[undefined]':[undefined],
	'{}':{},
	'{a:-1,b:"xyz"}':{a:-1,b:"xyz"},
});

