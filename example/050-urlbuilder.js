// † Yggdrasil Essense for JavaScript † //
// ====================================== //
// © 2024-5 Yggdrasil Leaves, LLC.        //
//        All rights reserved.            //

// Example: URL Builder ----------------- //

import URLBuilder from '../api/urlbuilder.js';
import Log from '../api/logger.js';

Log.info('----- Parse nonURL -----');
let url='a/b%2Fc.txt?a=1&b=2#abc#xyz';
let a=URLBuilder.parse(url);
Log.info(JSON.stringify(a));

Log.info('----- Parse mailto URL -----');
url='mailto:user@example.com';
a=URLBuilder.parse(url);
Log.info(JSON.stringify(a));

Log.info('----- Parse file URL -----');
url='file:///c:/Program%20Files/Internet%20Explorer/iexplore.exe';
a=URLBuilder.parse(url);
Log.info(JSON.stringify(a));

Log.info('----- Parse FTP URL -----');
url='ftp://user:pwd@ftp.example.com/a/b/c.txt';
a=URLBuilder.parse(url);
Log.info(JSON.stringify(a));

Log.info('----- Parse minimum HTTP URL -----');
url='https://www.example.com';
a=URLBuilder.parse(url);
Log.info(JSON.stringify(a));

Log.info('----- Parse Heavy URL -----');
url='https://us%65r:pw%64@www.example.com:8080/%7Ea/b%2Fc.html?q=ijk+lmn&a=1&b[a][b][]=123&b[a][c]=789&b[a][b][]=de%2Bf#abc#xyz';
a=URLBuilder.parse(url);
Log.info(JSON.stringify(a));

// can extract host 
Log.info('----- Extract & Retouch Host -----');
let b=a.extractHost();
Log.info(JSON.stringify(b));

// can retouch host 
b[0]+=0;
b.unshift('test');
a.bakeHost(b);
Log.info(a.host);

// can extract path 
Log.info('----- Extract & Retouch Path -----');
b=a.extractPath();
Log.info(JSON.stringify(b));

// can retouch path 
b[b.length-1]='';
a.bakePath(b);
Log.info(a.path);

// can extract args or prop 
Log.info('----- Extract Args or Prop -----');
let b1=a.extractArgs();
Log.info(JSON.stringify(b1));
let b2=a.extractProp();
Log.info(JSON.stringify(b2));

// can retouch args or prop (are exclusive)
Log.info('----- Retouch Args or Prop -----');
b1.push('xyz');
a.bakeArgs(b1);
Log.info(a.query);

b2.b.a.d='xyz';
b2.b.a.b.push(-3.14);
a.bakeProp(b2);
Log.info(a.query);

Log.info('----- Bake All -----');
Log.info(a.bake());
