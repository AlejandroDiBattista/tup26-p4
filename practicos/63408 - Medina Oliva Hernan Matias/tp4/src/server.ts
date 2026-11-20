import {app} from './app.js';
import {prepararBase} from './db/index.js';
await prepararBase(); const port=Number(process.env.PORT??3000);
app.listen(port,()=>console.log('MiniCRM: http://localhost:'+port));
