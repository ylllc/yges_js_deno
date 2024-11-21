// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024 Yggdrasil Leaves, LLC.          //
//        All rights reserved.            //

// Example: URL Builder //

import urlb from '../api/urlbuild.js';
import log from '../api/logger.js';

log.info('----- Parse nonURL -----');
var url='a/b%2Fc.txt?a=1&b=2#abc#xyz';
var a=urlb.parse(url);
log.info(JSON.stringify(a));

log.info('----- Parse mailto URL -----');
url='mailto:user@example.com';
var a=urlb.parse(url);
log.info(JSON.stringify(a));

log.info('----- Parse file URL -----');
url='file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe';
var a=urlb.parse(url);
log.info(JSON.stringify(a));

log.info('----- Parse FTP URL -----');
url='ftp://user:pwd@ftp.example.com/a/b/c.txt';
var a=urlb.parse(url);
log.info(JSON.stringify(a));

log.info('----- Parse minimum HTTP URL -----');
url='https://www.example.com';
var a=urlb.parse(url);
log.info(JSON.stringify(a));

log.info('----- Parse Heavy URL -----');
url='https://us%65r:pw%64@www.example.com:8080/%7Ea/b%2Fc.html?q=ijk+lmn&a=1&b[a][b][]=123&b[a][c]=789&b[a][b][]=de%2Bf#abc#xyz';
var a=urlb.parse(url);
log.info(JSON.stringify(a));

// can extract host 
log.info('----- Extract & Retouch Host -----');
var b=a.extractHost();
log.info(JSON.stringify(b));

// can retouch host 
b[0]+=0;
b.unshift('test');
a.bakeHost(b);
log.info(a.host);

// can extract path 
log.info('----- Extract & Retouch Path -----');
b=a.extractPath();
log.info(JSON.stringify(b));

// can retouch path 
b[b.length-1]='';
a.bakePath(b);
log.info(a.path);

// can extract args or prop 
log.info('----- Extract Args or Prop -----');
var b1=a.extractArgs();
log.info(JSON.stringify(b1));
var b2=a.extractProp();
log.info(JSON.stringify(b2));

// can retouch args or prop (are exclusive)
log.info('----- Retouch Args or Prop -----');
b1.push('xyz');
a.bakeArgs(b1);
log.info(a.query);

b2.b.a.d='xyz';
b2.b.a.b.push(-3.14);
a.bakeProp(b2);
log.info(a.query);

log.info('----- Bake All -----');
log.info(a.bake());
