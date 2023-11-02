import {createServer} from 'http';
import {config} from 'dotenv';
import {env} from 'process';
import {conn} from './routing';
import {router} from './router';
import anyBody from 'body/any';

config();
const server = createServer((req, res) => {
  anyBody(req, res, async (err, body) => {
    const {result} = await router(conn(req, err || body));
    if (result) {
      res.writeHead(result.statusCode).write(JSON.stringify(result.body));
    }
  });
});

server.listen(env.PORT);

console.log('server up at', server.address());
