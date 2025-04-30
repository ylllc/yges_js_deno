// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from '../api/common.js';
import Log from '../api/logger.js';
import Util from '../api/util.js';

// Example: Value Trivia ---------------- //

function test(func,data){

	for(let f in func){
		Log.Info('-=-=-=-=-=-=-=-=- '+f+' -=-=-=-=-=-=-=-=-');
		for(let d in data){
			try{Log.Info(d+' => '+func[f](data[d]));}
			catch(e){Log.Fatal(e.message);}
		}
	}
}

test({
	'==NaN':(val)=>(val==NaN)?'true':'false',
	'===NaN':(val)=>(val===NaN)?'true':'false',
	'isNaN':(val)=>isNaN(val)?'true':'false',
	'IsJustNaN':(val)=>Util.IsJustNaN(val)?'true':'false',
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
	'IsJustInfinity':(val)=>Util.IsJustInfinity(val)?'true':'false',
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
	'IsEmpty':(val)=>Util.IsEmpty(val)?'true':'false',
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
	'IsValid':(val)=>Util.IsValid(val)?'true':'false',
	'Booleanize':(val)=>Util.Booleanize(val),
	'stringable Booleanize':(val)=>Util.Booleanize(val,true),
	'Trinarize':(val)=>Util.Trinarize(val),
	'stringable Trinarize':(val)=>Util.Trinarize(val,true),
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
	'FillZero':(val)=>Util.FillZero(val,8),
	'FillZero+':(val)=>Util.FillZero(val,8,true),
},{
	'0':0,
	'123.4':123.4,
	'-12.3':-12.3,
	'1234.5678':1234.5678,
});

test({
	'toString':(val)=>val.toString(),
	'JustString':(val)=>YgEs.JustString(val),
	'JSON':(val)=>JSON.stringify(val),
	'Inspect':(val)=>YgEs.Inspect(val),
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

