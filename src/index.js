const express = require('express');
const app = express();
const axios = require('axios');
const port = 8000;

const servers = [
  "http://localhost:1010", // edge server
  "http://localhost:2020", // fog server
  "http://localhost:3030", // cloud server
]

// load balancing algorithm
// let current = 0, server
// const handler = async (req, res) => {
//   const { method, url, headers, body: data } = req
//   server = servers[current]
//   current === (servers.length - 1) ? current = 0 : current++
//   try {
//     const response = await axios({
//       url: `${server}${url}`,
//       method,
//       headers,
//       data
//     })
//     console.log(`proxy to  ${server} succeded`)
//     res.send(response.data)
//   }
//   catch (err) {
//     console.log(`proxy to ${server} failed`)
//     handler(req, res)
//   }
// }

// app.use((req, res) => { handler(req, res) })

app.listen(port, () => {
    console.log(`Default server on ${port}!!! 🔥🔥🔥\n`);
})
