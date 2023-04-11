function ipHashAlgorithm(servers, ipAddress) {
  // Hash the IP address to a number between 0 and 1
  let hash = hashIpAddress(ipAddress);

  // Find the server to which the request should be assigned
  let serverIndex = Math.floor(hash * servers.length);

  // Return the chosen server
  return servers[serverIndex];
}

function hashIpAddress(ipAddress) {
  // Convert the IP address to an integer
  let ipInteger = ipAddress.split('.').reduce(function (acc, octet) {
    return (acc << 8) + parseInt(octet, 10)
  }, 0);

  // Compute the hash
  let hash = (ipInteger * 2654435761) % Math.pow(2, 32);

  // Normalize the hash to a number between 0 and 1
  let normalizedHash = hash / Math.pow(2, 32);

  return normalizedHash;
}

module.exports = ipHashAlgorithm;
