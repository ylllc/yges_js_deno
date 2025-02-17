// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2025 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

import YgEs from './common.js';

import {WebSocketServer} from 'npm:ws';

// WebSocket Low Level for Deno --------- //
(()=>{ // local namespace 

function _server_new(port,opt={}){

	const limit=opt.ConnectionLimit??-1;
	let clicnt=0;

	const _onConnect=opt.OnConnect??((cnx)=>{})
	const _onDisconnect=opt.OnDisconnect??((cnx)=>{})
	const _onReceived=opt.OnReceived??((cnx,data,isbin)=>{})
	const _onError=opt.OnError??((cnx,err)=>{})

	let prm={
		port:port,
	}
	let ll=new WebSocketServer(prm);
	ll.on('connection',(sock,req)=>{

		if(limit>=0 && limit<=clicnt){
			sock.terminate();
			return;
		}

		let cnx={
			Name:'YgEs.WebSockServer.Connection',
			User:{},
			_private_:{
				ready:false,
			},

			IsReady:()=>cnx._private_.ready,
			Close:(code=1000,msg='Shut from the server')=>{
				if(!v._private_.ready)return;
				cnx._private_.ready=false;
				sock.close(code,msg);
				sock=null;
			},
			Send:(data)=>{
				if(!cnx.IsReady())return;
				sock.send(data);
			},
		}
		sock.on('error',(err)=>{
			_onError(cnx,err);
		});

		sock.on('close',()=>{
			_onDisconnect(cnx);
			--clicnt;
		});
		sock.on('message',(data,isbin)=>{
			_onReceived(cnx,data,isbin);
		});

		cnx._private_.ready=_onConnect(cnx,req);
		if(!cnx._private_.ready){
			sock.terminate();
			sock=null;
		}
		else{
			// allowed client 
			++clicnt;
		}
	});

	let server={
		Name:'YgEs.WebSockLowLevel.Server',
		_private_:{
			ll:ll,
		},

		Close:(cb_done)=>{
			ll.clients.forEach((sock)=>{sock.close();});
			ll.close(()=>{
				ll.clients.forEach((sock)=>{
					if(![sock.OPEN,sock.CLOSING].includes(sock.readyState))return;
					sock.terminate();
				});

				server._private_.ll=null;
				if(cb_done)cb_done();
			});
		},
	}

	return server;
}

let WebSockLowLevel=YgEs.WebSockLowLevel={
	Name:'YgEs.WebSockLowLevel',
	User:{},
	_private_:{},

	CreateServer:_server_new,
}

})();
export default YgEs.WebSockLowLevel;
