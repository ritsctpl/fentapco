import type { Request, Response } from 'express';

export default function handler(req: Request, res: Response) {
  const networkInterfaces = require('os').networkInterfaces();
  let wifiIp = "Not Found";

  for (const interfaceName in networkInterfaces) {
    const interfaces = networkInterfaces[interfaceName];

    if (interfaces) {
      for (const net of interfaces) {
        if (net.family === "IPv4" && !net.internal) {
          wifiIp = net.address;
          break;
        }
      }
    }
  }

  res.status(200).json({ ip: wifiIp });
}
