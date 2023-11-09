import {createServer} from 'http';
import {config} from 'dotenv';
import {env} from 'process';
import {conn} from './routing/conn';
import {router} from './routing/router';
import anyBody from 'body/any';

config();
const server = createServer((req, res) => {
  anyBody(req, res, async (err, body) => {
    const initialConn = conn(req, err || body);
    const resultConn = await router(initialConn);
    const {result} = resultConn;
    if (result) {
      res.writeHead(result.statusCode).write(JSON.stringify(result.body));
    } else {
      console.error(resultConn);
      res.writeHead(500).write('Internal Server Error');
    }

    res.end();
  });
});

server.on('listening', () => {
  console.log('server up at', server.address());
});

server.listen(env.PORT);
