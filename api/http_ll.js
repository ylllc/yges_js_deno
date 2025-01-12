// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

import YgEs from './common.js';

import http from 'node:http';
import path from 'node:path';
import mime from 'npm:mime-lite';

// HTTP Server Low Level for Deno-------- //
(()=>{ // local namespace 

function _setup(cb_req){

	return http.createServer(cb_req);
}

function _getMIMEType(stat){

	var ext=path.extname(stat.GetPath());
	if(!ext)return null;
	return mime.getType(ext.substring(1));
}

let HTTPLowLevel=YgEs.HTTPLowLevel={
	name:'YgEs.HTTPLowLevel',
	User:{},

	SetUp:_setup,
	GetMIMEType:_getMIMEType,
}

})();
export default YgEs.HTTPLowLevel;
